package com.casciz.commerceos.application.user.dto;

import jakarta.validation.constraints.*;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

/**
 * User-profile request and response DTOs.
 */
public final class UserDtos {

    private UserDtos() {}

    // ── Responses ─────────────────────────────────────────────────────────

    public record UserProfileResponse(
            UUID        id,
            String      email,
            String      firstName,
            String      lastName,
            String      avatarUrl,
            boolean     emailVerified,
            Set<String> roles,
            Instant     createdAt,
            Instant     lastLoginAt
    ) {}

    // ── Requests ──────────────────────────────────────────────────────────

    public record UpdateProfileRequest(

            @NotBlank(message = "First name is required")
            @Size(min = 1, max = 100)
            String firstName,

            @NotBlank(message = "Last name is required")
            @Size(min = 1, max = 100)
            String lastName,

            @Size(max = 512, message = "Avatar URL must not exceed 512 characters")
            String avatarUrl
    ) {}

    public record ChangePasswordRequest(

            @NotBlank(message = "Current password is required")
            String currentPassword,

            @NotBlank(message = "New password is required")
            @Size(min = 8, max = 128)
            @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
                message = "Password must contain at least one uppercase letter, one lowercase letter, and one number"
            )
            String newPassword
    ) {}
}
