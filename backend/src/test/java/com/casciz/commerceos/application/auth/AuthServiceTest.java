package com.casciz.commerceos.application.auth;

import com.casciz.commerceos.application.auth.dto.AuthDtos.*;
import com.casciz.commerceos.application.auth.usecase.AuthService;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService")
class AuthServiceTest {

    @Mock UserRepository                   userRepository;
    @Mock RoleRepository                   roleRepository;
    @Mock RefreshTokenRepository           refreshTokenRepository;
    @Mock EmailVerificationTokenRepository emailVerificationTokenRepository;
    @Mock PasswordResetTokenRepository     passwordResetTokenRepository;
    @Mock JwtService                       jwtService;
    @Mock JwtProperties                    jwtProperties;
    @Mock PasswordEncoder                  passwordEncoder;
    @Mock AuthenticationManager            authenticationManager;

    AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository,
                roleRepository,
                refreshTokenRepository,
                emailVerificationTokenRepository,
                passwordResetTokenRepository,
                jwtService,
                jwtProperties,
                passwordEncoder,
                authenticationManager
        );
    }

    // ── register ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("register: creates user and returns verification token when email is new")
    void register_newEmail_createsUserAndReturnsToken() {
        RegisterRequest request = new RegisterRequest(
                "Jane", "Doe", "jane@example.com", "Password1");

        Role memberRole = Role.builder().id(5L).name(RoleConstants.ROLE_MEMBER).build();

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(roleRepository.findByName(RoleConstants.ROLE_MEMBER)).thenReturn(Optional.of(memberRole));
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");
        when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(emailVerificationTokenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        String rawToken = authService.register(request);

        assertThat(rawToken).isNotBlank();
        verify(userRepository).save(any(User.class));
        verify(emailVerificationTokenRepository).save(any());
    }

    @Test
    @DisplayName("register: throws EmailAlreadyRegisteredException for duplicate email")
    void register_duplicateEmail_throwsException() {
        RegisterRequest request = new RegisterRequest(
                "Jane", "Doe", "existing@example.com", "Password1");

        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(EmailAlreadyRegisteredException.class);

        verify(userRepository, never()).save(any());
    }

    // ── forgotPassword ────────────────────────────────────────────────────

    @Test
    @DisplayName("requestPasswordReset: returns empty string when email not found (anti-enumeration)")
    void requestPasswordReset_unknownEmail_returnsEmpty() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        String result = authService.requestPasswordReset("ghost@example.com");

        assertThat(result).isEmpty();
        verify(passwordResetTokenRepository, never()).save(any());
    }
}
