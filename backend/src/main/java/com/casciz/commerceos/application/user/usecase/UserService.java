package com.casciz.commerceos.application.user.usecase;

import com.casciz.commerceos.application.user.dto.UserDtos.*;
import com.casciz.commerceos.domain.user.entity.User;
import com.casciz.commerceos.domain.user.repository.UserRepository;
import com.casciz.commerceos.shared.exception.DomainExceptions.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.stream.Collectors;

/**
 * User profile management use-cases.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(UUID userId) {
        User user = loadUser(userId);
        return toProfileResponse(user);
    }

    public UserProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = loadUser(userId);
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        if (request.avatarUrl() != null) {
            user.setAvatarUrl(request.avatarUrl());
        }
        return toProfileResponse(userRepository.save(user));
    }

    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = loadUser(userId);

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        userRepository.updatePasswordHash(userId, passwordEncoder.encode(request.newPassword()));
    }

    // ── Private helpers ───────────────────────────────────────────────────

    private User loadUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId.toString()));
    }

    private UserProfileResponse toProfileResponse(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getAvatarUrl(),
                user.isEmailVerified(),
                user.getRoles().stream().map(r -> r.getName()).collect(Collectors.toSet()),
                user.getCreatedAt(),
                user.getLastLoginAt()
        );
    }
}
