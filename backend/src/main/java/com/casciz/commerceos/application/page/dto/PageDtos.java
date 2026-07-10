package com.casciz.commerceos.application.page.dto;

import com.casciz.commerceos.domain.page.valueobject.PageStatus;
import com.casciz.commerceos.domain.page.valueobject.PageType;
import jakarta.validation.constraints.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * All page-builder request and response DTOs.
 */
public final class PageDtos {

    private PageDtos() {}

    // ── Requests ──────────────────────────────────────────────────────────

    public record CreatePageRequest(

            @NotBlank(message = "Page title is required")
            @Size(min = 1, max = 150, message = "Title must be 150 characters or fewer")
            String title,

            @Pattern(
                regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$|^$",
                message = "Slug must be lowercase letters, numbers, and hyphens only"
            )
            @Size(max = 80)
            String slug,

            @NotNull(message = "Page type is required")
            PageType type,

            @Size(max = 150)
            String metaTitle,

            @Size(max = 300)
            String metaDescription
    ) {}

    public record UpdatePageMetaRequest(

            @NotBlank(message = "Page title is required")
            @Size(min = 1, max = 150)
            String title,

            @Size(max = 150)
            String metaTitle,

            @Size(max = 300)
            String metaDescription
    ) {}

    /**
     * Saves the full page document (blocks + theme) from the drag-and-drop builder.
     * Content is treated as an opaque JSON blob — validation beyond null check
     * is handled by the frontend.
     */
    public record SavePageContentRequest(

            @NotNull(message = "Page content is required")
            Map<String, Object> content
    ) {}

    public record ReorderPagesRequest(

            @NotNull
            @Size(min = 1, message = "At least one page ID is required")
            List<UUID> orderedPageIds
    ) {}

    // ── Responses ─────────────────────────────────────────────────────────

    public record PageResponse(
            UUID                id,
            UUID                storeId,
            String              title,
            String              slug,
            String              metaTitle,
            String              metaDescription,
            PageType            type,
            PageStatus          status,
            int                 sortOrder,
            Map<String, Object> content,
            Instant             createdAt,
            Instant             updatedAt,
            Instant             publishedAt
    ) {}

    /** Lightweight summary for the page list panel (no content blob). */
    public record PageSummary(
            UUID       id,
            String     title,
            String     slug,
            PageType   type,
            PageStatus status,
            int        sortOrder,
            Instant    updatedAt,
            Instant    publishedAt
    ) {}
}
