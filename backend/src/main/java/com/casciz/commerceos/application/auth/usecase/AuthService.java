package com.casciz.commerceos.application.auth.usecase;

import com.casciz.commerceos.application.auth.dto.AuthDtos.*;
import com.casciz.commerceos.domain.auth.entity.EmailVerificationToken;
import com.casciz.commerceos.domain.auth.entity.PasswordResetToken;
import com.casciz.commerceos.domain.auth.entity.RefreshToken;
import com.casciz.commerceos.domain.auth.repository.EmailVerificationTokenRepository;
import com.casciz.commerceos.domain.auth.repository.PasswordResetTokenRepository;
import com.casciz.commerceos.domain.auth.repository.RefreshTokenRepository;
import com.casciz.commerceos.domain.user.entity.Role;
import com.casciz.commerceos.domain.user.entity.User;
import com.casciz.commerceos.domain.user.repository.RoleRepository;
import com.casciz.commerceos.domain.user.repository.UserRepository;
import com.casciz.commerceos.infrastructure.config.JwtProperties;
import com.casciz.commerceos.infrastructure.security.jwt.JwtService;
import com.casciz.commerceos.shared.constants.RoleConstants;
import com.casciz.commerceos.shared.exception.DomainExceptions.*;
import com.casciz.commerceos.shared.util.TokenHashUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Set;

/**
 * Orchestrates all authentication use-cases.
 * This layer depends only on domain interfaces – it has no direct Spring Security
 * calls except delegating credential validation to {@link AuthenticationManager}.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository                   userRepository;
    private final RoleRepository                   roleRepository;
    private final RefreshTokenRepository           refreshTokenRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordResetTokenRepository     passwordResetTokenRepository;
    private final JwtService                       jwtService;
    private final JwtProperties                    jwtProperties;
    private final PasswordEncoder                  passwordEncoder;
    private final AuthenticationManager            authenticationManager;

    // ── Register ──────────────────────────────────────────────────────────

    /**
     * Creates a new user account and issues an email verification token.
     *
     * @return the raw (unhashed) verification token to include in the email
     */
    public String register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyRegisteredException(request.email());
        }

        Role memberRole = roleRepository.findByName(RoleConstants.ROLE_MEMBER)
                .orElseThrow(() -> new IllegalStateException("Default ROLE_MEMBER not seeded in database"));

        User user = User.builder()
                .email(request.email().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.password()))
                .firstName(request.firstName())
                .lastName(request.lastName())
                .emailVerified(false)
                .enabled(true)
                .roles(Set.of(memberRole))
                .build();

        userRepository.save(user);

        String rawToken  = TokenHashUtil.generateSecureToken();
        String tokenHash = TokenHashUtil.hashToken(rawToken);

        emailVerificationTokenRepository.save(
                EmailVerificationToken.builder()
                        .tokenHash(tokenHash)
                        .user(user)
                        .expiresAt(Instant.now().plusSeconds(86_400)) // 24 hours
                        .build()
        );

        log.info("New user registered: {}", user.getEmail());
        return rawToken;
    }

    // ── Verify Email ──────────────────────────────────────────────────────

    public void verifyEmail(String rawToken) {
        String hash  = TokenHashUtil.hashToken(rawToken);
        EmailVerificationToken token = emailVerificationTokenRepository
                .findByTokenHash(hash)
                .orElseThrow(() -> new InvalidTokenException("not found"));

        if (token.isExpired()) {
            throw new InvalidTokenException("expired");
        }

        userRepository.verifyEmail(token.getUser().getId());
        emailVerificationTokenRepository.deleteByUserId(token.getUser().getId());

        log.info("Email verified for user: {}", token.getUser().getEmail());
    }

    // ── Login ─────────────────────────────────────────────────────────────

    public AuthResponse login(LoginRequest request, String userAgent, String ipAddress) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new InvalidCredentialsException());

        if (!user.isEmailVerified()) {
            throw new EmailNotVerifiedException();
        }

        user.recordLogin();
        userRepository.save(user);

        return issueTokenPair(user, userAgent, ipAddress);
    }

    // ── Refresh ───────────────────────────────────────────────────────────

    public AuthResponse refresh(String rawRefreshToken, String userAgent, String ipAddress) {
        String hash = TokenHashUtil.hashToken(rawRefreshToken);
        RefreshToken stored = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new InvalidTokenException("not found"));

        if (!stored.isValid()) {
            // Possible token reuse – revoke all tokens for this user
            refreshTokenRepository.revokeAllForUser(stored.getUser().getId(), Instant.now());
            throw new InvalidTokenException("expired or revoked – all sessions have been terminated");
        }

        stored.revoke();
        refreshTokenRepository.save(stored);

        return issueTokenPair(stored.getUser(), userAgent, ipAddress);
    }

    // ── Logout ────────────────────────────────────────────────────────────

    public void logout(String rawRefreshToken) {
        String hash = TokenHashUtil.hashToken(rawRefreshToken);
        refreshTokenRepository.findByTokenHash(hash).ifPresent(token -> {
            token.revoke();
            refreshTokenRepository.save(token);
        });
    }

    public void logoutAll(java.util.UUID userId) {
        refreshTokenRepository.revokeAllForUser(userId, Instant.now());
    }

    // ── Forgot Password ───────────────────────────────────────────────────

    /**
     * Issues a password reset token.
     * Always returns the same success message regardless of whether the email
     * exists to prevent user enumeration.
     *
     * @return the raw reset token, or empty string if user not found
     */
    public String requestPasswordReset(String email) {
        return userRepository.findByEmail(email.toLowerCase())
                .map(user -> {
                    passwordResetTokenRepository.deleteByUserId(user.getId());

                    String rawToken  = TokenHashUtil.generateSecureToken();
                    String tokenHash = TokenHashUtil.hashToken(rawToken);

                    passwordResetTokenRepository.save(
                            PasswordResetToken.builder()
                                    .tokenHash(tokenHash)
                                    .user(user)
                                    .expiresAt(Instant.now().plusSeconds(3_600)) // 1 hour
                                    .build()
                    );

                    log.info("Password reset requested for: {}", email);
                    return rawToken;
                })
                .orElse("");
    }

    // ── Reset Password ────────────────────────────────────────────────────

    public void resetPassword(String rawToken, String newPassword) {
        String hash = TokenHashUtil.hashToken(rawToken);
        PasswordResetToken token = passwordResetTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new InvalidTokenException("not found"));

        if (!token.isValid()) {
            throw new InvalidTokenException("expired or already used");
        }

        String newHash = passwordEncoder.encode(newPassword);
        userRepository.updatePasswordHash(token.getUser().getId(), newHash);

        token.markUsed();
        passwordResetTokenRepository.save(token);

        // Revoke all refresh tokens for security after password change
        refreshTokenRepository.revokeAllForUser(token.getUser().getId(), Instant.now());

        log.info("Password reset completed for user: {}", token.getUser().getId());
    }

    // ── Private helpers ───────────────────────────────────────────────────

    private AuthResponse issueTokenPair(User user, String userAgent, String ipAddress) {
        String accessToken = jwtService.generateAccessToken(user);

        String rawRefreshToken  = TokenHashUtil.generateSecureToken();
        String refreshTokenHash = TokenHashUtil.hashToken(rawRefreshToken);

        refreshTokenRepository.save(
                RefreshToken.builder()
                        .tokenHash(refreshTokenHash)
                        .user(user)
                        .expiresAt(Instant.now().plusMillis(jwtProperties.refreshTokenExpiryMs()))
                        .userAgent(userAgent)
                        .ipAddress(ipAddress)
                        .build()
        );

        UserSummary summary = new UserSummary(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getAvatarUrl(),
                user.isEmailVerified()
        );

        return AuthResponse.of(
                accessToken,
                rawRefreshToken,
                jwtProperties.accessTokenExpiryMs(),
                summary
        );
    }
}
