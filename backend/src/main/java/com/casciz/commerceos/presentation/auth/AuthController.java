package com.casciz.commerceos.presentation.auth;

import com.casciz.commerceos.application.auth.dto.AuthDtos.*;
import com.casciz.commerceos.application.auth.usecase.AuthService;
import com.casciz.commerceos.shared.constants.ApiPaths;
import com.casciz.commerceos.shared.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for all authentication endpoints.
 * Thin layer: validates input, delegates to {@link AuthService}, formats response.
 */
@RestController
@RequestMapping(ApiPaths.AUTH_BASE)
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Register, login, token refresh, and password management")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new account")
    public ResponseEntity<ApiResponse<Void>> register(
            @Valid @RequestBody RegisterRequest request) {

        // The verification token is sent via email; not returned in the response
        authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Account created. Please check your email to verify your address."));
    }

    @PostMapping("/verify-email")
    @Operation(summary = "Verify email address with token from email link")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(
            @Valid @RequestBody VerifyEmailRequest request) {

        authService.verifyEmail(request.token());
        return ResponseEntity.ok(ApiResponse.ok("Email verified. You can now sign in."));
    }

    @PostMapping("/login")
    @Operation(summary = "Sign in and receive access + refresh tokens")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {

        AuthResponse response = authService.login(
                request,
                httpRequest.getHeader("User-Agent"),
                httpRequest.getRemoteAddr()
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Exchange a valid refresh token for a new token pair")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @Valid @RequestBody RefreshTokenRequest request,
            HttpServletRequest httpRequest) {

        AuthResponse response = authService.refresh(
                request.refreshToken(),
                httpRequest.getHeader("User-Agent"),
                httpRequest.getRemoteAddr()
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/logout")
    @Operation(summary = "Revoke the current refresh token")
    public ResponseEntity<ApiResponse<Void>> logout(
            @Valid @RequestBody RefreshTokenRequest request) {

        authService.logout(request.refreshToken());
        return ResponseEntity.ok(ApiResponse.ok("Signed out successfully."));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request a password reset email")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        // Anti-enumeration: always returns 200
        authService.requestPasswordReset(request.email());
        return ResponseEntity.ok(
                ApiResponse.ok("If an account with that email exists, a reset link has been sent."));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Set a new password using the reset token")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        authService.resetPassword(request.token(), request.newPassword());
        return ResponseEntity.ok(ApiResponse.ok("Password updated. Please sign in with your new password."));
    }
}
