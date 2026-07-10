package com.casciz.commerceos.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

/**
 * Strongly-typed CORS configuration.
 */
@Validated
@ConfigurationProperties(prefix = "casciz.cors")
public record CorsProperties(

        @NotEmpty(message = "At least one allowed origin must be configured")
        List<String> allowedOrigins

) {}
