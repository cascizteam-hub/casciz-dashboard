package com.casciz.commerceos.application.store.dto;

import com.casciz.commerceos.domain.store.valueobject.StoreCurrency;
import com.casciz.commerceos.domain.store.valueobject.StoreStatus;
import jakarta.validation.constraints.*;

import java.time.Instant;
import java.util.UUID;

/**
 * All store-related request and response DTOs.
 */
public final class StoreDtos {

    private StoreDtos() {}

    // ── Requests ──────────────────────────────────────────────────────────

    public record CreateStoreRequest(

            @NotBlank(message = "Store name is required")
            @Size(min = 2, max = 150, message = "Store name must be between 2 and 150 characters")
            String name,

            /**
             * Optional; if omitted the backend generates a slug from the name.
             * If supplied, must be lowercase alphanumeric with hyphens only.
             */
            @Pattern(
                regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                message = "Slug must be lowercase letters, numbers, and hyphens only"
            )
            @Size(min = 3, max = 80, message = "Slug must be between 3 and 80 characters")
            String slug,

            @Size(max = 1000, message = "Description must not exceed 1000 characters")
            String description,

            @NotNull(message = "Currency is required")
            StoreCurrency currency,

            @NotBlank(message = "Timezone is required")
            @Size(max = 60)
            String timezone,

            @Email(message = "Please enter a valid contact email")
            @Size(max = 255)
            String contactEmail,

            @Size(max = 30)
            String contactPhone
    ) {}

    public record UpdateStoreRequest(

            @NotBlank(message = "Store name is required")
            @Size(min = 2, max = 150)
            String name,

            @Size(max = 1000)
            String description,

            @Size(max = 512)
            String logoUrl,

            @Size(max = 512)
            String faviconUrl,

            @Size(max = 255)
            @Pattern(
                regexp = "^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,}$|^$",
                message = "Custom domain must be a valid domain name"
            )
            String customDomain,

            @NotNull(message = "Currency is required")
            StoreCurrency currency,

            @NotBlank(message = "Timezone is required")
            @Size(max = 60)
            String timezone,

            @Email(message = "Please enter a valid contact email")
            @Size(max = 255)
            String contactEmail,

            @Size(max = 30)
            String contactPhone
    ) {}

    public record UpdateStoreStatusRequest(

            @NotNull(message = "Status is required")
            StoreStatus status
    ) {}

    // ── Responses ─────────────────────────────────────────────────────────

    public record StoreResponse(
            UUID          id,
            String        name,
            String        slug,
            String        description,
            String        logoUrl,
            String        faviconUrl,
            String        customDomain,
            StoreStatus   status,
            StoreCurrency currency,
            String        timezone,
            String        contactEmail,
            String        contactPhone,
            UUID          ownerId,
            Instant       createdAt,
            Instant       updatedAt,
            Instant       publishedAt,
            Instant       archivedAt
    ) {}

    /** Lightweight summary used in list responses. */
    public record StoreSummary(
            UUID          id,
            String        name,
            String        slug,
            String        logoUrl,
            StoreStatus   status,
            StoreCurrency currency,
            Instant       createdAt,
            Instant       publishedAt
    ) {}

    /** Aggregate stats shown on the dashboard overview. */
    public record StoreStatsResponse(
            long totalStores,
            long publishedStores,
            long draftStores,
            long archivedStores
    ) {}
}
