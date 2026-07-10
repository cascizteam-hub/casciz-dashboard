package com.casciz.commerceos.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Strongly-typed binding for JWT configuration from application.yml.
 * Fails fast at startup if any constraint is violated.
 */
@Validated
@ConfigurationProperties(prefix = "casciz.jwt")
public record JwtProperties(

        @NotBlank(message = "JWT secret must not be blank")
        @Size(min = 64, message = "JWT secret must be at least 64 characters for HS512 security")
        String secret,

        @Min(value = 60_000, message = "Access token expiry must be at least 60 seconds")
        long accessTokenExpiryMs,

        @Min(value = 3_600_000, message = "Refresh token expiry must be at least 1 hour")
        long refreshTokenExpiryMs

) {}
