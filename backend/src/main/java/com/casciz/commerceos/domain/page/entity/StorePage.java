package com.casciz.commerceos.domain.page.entity;

import com.casciz.commerceos.domain.page.valueobject.PageStatus;
import com.casciz.commerceos.domain.page.valueobject.PageType;
import com.casciz.commerceos.domain.store.entity.Store;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * A page belonging to a store.
 *
 * <p>The entire drag-and-drop canvas is serialised as a JSON document in {@code content}.
 * This gives maximum flexibility for the builder schema to evolve without DB migrations.
 * The content follows the {@code PageDocument} schema defined in the frontend builder.
 *
 * <p>Schema example:
 * <pre>
 * {
 *   "blocks": [
 *     { "id": "uuid", "type": "HERO", "order": 0,
 *       "props": { "heading": "Welcome", "subheading": "…", "ctaText": "Shop Now" } },
 *     { "id": "uuid", "type": "TEXT", "order": 1,
 *       "props": { "body": "About us…" } }
 *   ],
 *   "theme": { "primaryColor": "#4f46e5", "fontFamily": "Inter" }
 * }
 * </pre>
 */
@Entity
@Table(
    name = "store_pages",
    indexes = {
        @Index(name = "idx_store_pages_store_id", columnList = "store_id"),
        @Index(name = "idx_store_pages_slug",     columnList = "store_id,slug", unique = true)
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StorePage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(nullable = false, length = 150)
    private String title;

    /** URL-friendly path segment, e.g. "about-us". Home page slug is always "". */
    @Column(nullable = false, length = 80)
    @Builder.Default
    private String slug = "";

    @Column(length = 300)
    private String metaDescription;

    @Column(name = "meta_title", length = 150)
    private String metaTitle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PageType type = PageType.CUSTOM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PageStatus status = PageStatus.DRAFT;

    /**
     * The full page document as JSONB. Stored as a generic {@code Map} here;
     * the application layer serialises/deserialises using Jackson.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> content = Map.of("blocks", java.util.List.of(), "theme", Map.of());

    /** Display order within the store's navigation. */
    @Column(nullable = false)
    @Builder.Default
    private int sortOrder = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();

    @Column(name = "published_at")
    private Instant publishedAt;

    // ── Lifecycle ──────────────────────────────────────────────────────────

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // ── Domain behaviour ──────────────────────────────────────────────────

    public void publish() {
        this.status      = PageStatus.PUBLISHED;
        this.publishedAt = Instant.now();
    }

    public void unpublish() {
        this.status = PageStatus.DRAFT;
    }

    public boolean isOwnedByStore(UUID storeId) {
        return this.store != null && this.store.getId().equals(storeId);
    }
}
