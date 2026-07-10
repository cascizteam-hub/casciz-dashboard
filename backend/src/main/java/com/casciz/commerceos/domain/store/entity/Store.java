package com.casciz.commerceos.domain.store.entity;

import com.casciz.commerceos.domain.store.valueobject.StoreCurrency;
import com.casciz.commerceos.domain.store.valueobject.StoreStatus;
import com.casciz.commerceos.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Core store aggregate root.
 *
 * <p>Each store belongs to one owner ({@link User}). A user can own many stores.
 * The {@code slug} is the unique URL-friendly identifier used in customer-facing URLs.
 */
@Entity
@Table(
    name = "stores",
    indexes = {
        @Index(name = "idx_stores_owner_id",   columnList = "owner_id"),
        @Index(name = "idx_stores_slug",        columnList = "slug",    unique = true),
        @Index(name = "idx_stores_status",      columnList = "status"),
        @Index(name = "idx_stores_created_at",  columnList = "created_at")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Store {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false, length = 150)
    private String name;

    /**
     * URL-friendly identifier, e.g. "my-awesome-shop".
     * Used as the subdomain or URL path for the storefront.
     */
    @Column(nullable = false, unique = true, length = 80)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "logo_url", length = 512)
    private String logoUrl;

    @Column(name = "favicon_url", length = 512)
    private String faviconUrl;

    @Column(name = "custom_domain", length = 255)
    private String customDomain;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private StoreStatus status = StoreStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private StoreCurrency currency = StoreCurrency.USD;

    /**
     * IANA timezone identifier, e.g. "America/New_York".
     */
    @Column(nullable = false, length = 60)
    @Builder.Default
    private String timezone = "UTC";

    /**
     * Primary contact email for the store (may differ from the owner's account email).
     */
    @Column(name = "contact_email", length = 255)
    private String contactEmail;

    @Column(name = "contact_phone", length = 30)
    private String contactPhone;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "archived_at")
    private Instant archivedAt;

    // ── Lifecycle ──────────────────────────────────────────────────────────

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // ── Domain behaviour ──────────────────────────────────────────────────

    /**
     * Transitions the store to a new status.
     *
     * @throws IllegalStateException if the transition is not allowed
     */
    public void transitionTo(StoreStatus next) {
        if (!this.status.canTransitionTo(next)) {
            throw new IllegalStateException(
                    "Cannot transition store from " + this.status + " to " + next);
        }
        this.status = next;
        if (next == StoreStatus.PUBLISHED && this.publishedAt == null) {
            this.publishedAt = Instant.now();
        }
        if (next == StoreStatus.ARCHIVED) {
            this.archivedAt = Instant.now();
        }
    }

    public boolean isOwnedBy(UUID userId) {
        return this.owner != null && this.owner.getId().equals(userId);
    }

    public boolean isPublished() {
        return this.status == StoreStatus.PUBLISHED;
    }
}
