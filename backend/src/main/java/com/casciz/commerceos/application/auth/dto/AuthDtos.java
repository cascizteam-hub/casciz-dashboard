package com.casciz.commerceos.application.auth.dto;

import jakarta.validation.constraints.*;

import java.util.UUID;

/**
 * All authentication-related request and response DTOs in one file.
 * Grouped here to keep the small auth domain tidy without a file-per-class sprawl.
 */
public final class AuthDtos {

    private AuthDtos() {}

    // ── Requests ──────────────────────────────────────────────────────────

    public record RegisterRequest(

            @NotBlank(message = "First name is required")
            @Size(min = 1, max = 100, message = "First name must be between 1 and 100 characters")
            String firstName,

            @NotBlank(message = "Last name is required")
            @Size(min = 1, max = 100, message = "Last name must be between 1 and 100 characters")
            String lastName,

            @NotBlank(message = "Email is required")
            @Email(message = "Please enter a valid email address")
            @Size(max = 255)
            String email,

            @NotBlank(message = "Password is required")
            @Size(min = 8, max = 128, message = "Password must be between 8 and 128 characters")
            @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
                message = "Password must contain at least one uppercase letter, one lowercase letter, and one number"
            )
            String password
    ) {}

    public record LoginRequest(

            @NotBlank(message = "Email is required")
            @Email(message = "Please enter a valid email address")
            String email,

            @NotBlank(message = "Password is required")
            String password
    ) {}

    public record RefreshTokenRequest(

            @NotBlank(message = "Refresh token is required")
            String refreshToken
    ) {}

    public record ForgotPasswordRequest(

            @NotBlank(message = "Email is required")
            @Email(message = "Please enter a valid email address")
            String email
    ) {}

    public record ResetPasswordRequest(

            @NotBlank(message = "Token is required")
            String token,

            @NotBlank(message = "New password is required")
            @Size(min = 8, max = 128, message = "Password must be between 8 and 128 characters")
            @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
                message = "Password must contain at least one uppercase letter, one lowercase letter, and one number"
            )
            String newPassword
    ) {}

    public record VerifyEmailRequest(

            @NotBlank(message = "Token is required")
            String token
    ) {}

    // ── Responses ─────────────────────────────────────────────────────────

    public record AuthResponse(
            String      accessToken,
            String      refreshToken,
            String      tokenType,
            long        expiresIn,
            UserSummary user
    ) {
        public static AuthResponse of(String accessToken, String refreshToken,
                                       long expiresIn, UserSummary user) {
            return new AuthResponse(accessToken, refreshToken, "Bearer", expiresIn, user);
        }
    }

    public record UserSummary(
            UUID    id,
            String  email,
            String  firstName,
            String  lastName,
            String  avatarUrl,
            boolean emailVerified
    ) {}
}
