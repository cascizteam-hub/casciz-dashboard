package com.casciz.commerceos.domain.product.entity;

import com.casciz.commerceos.domain.product.valueobject.ProductStatus;
import com.casciz.commerceos.domain.store.entity.Store;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Product aggregate root.
 *
 * <p>A product belongs to a store and has:
 * <ul>
 *   <li>One or more {@link ProductVariant}s (price/SKU/stock live here)</li>
 *   <li>Zero or more {@link ProductImage}s (first image is the thumbnail)</li>
 *   <li>An optional {@link ProductCategory}</li>
 * </ul>
 */
@Entity
@Table(
    name = "products",
    indexes = {
        @Index(name = "idx_products_store_id",   columnList = "store_id"),
        @Index(name = "idx_products_slug",        columnList = "store_id,slug", unique = true),
        @Index(name = "idx_products_status",      columnList = "status"),
        @Index(name = "idx_products_category_id", columnList = "category_id"),
        @Index(name = "idx_products_created_at",  columnList = "created_at")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 120, unique = true)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "short_description", length = 500)
    private String shortDescription;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ProductStatus status = ProductStatus.DRAFT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private ProductCategory category;

    /** Comma-separated tags for filtering, e.g. "summer,sale,featured". */
    @Column(length = 500)
    private String tags;

    @Column(name = "meta_title", length = 150)
    private String metaTitle;

    @Column(name = "meta_description", length = 300)
    private String metaDescription;

    @Column(name = "is_digital", nullable = false)
    @Builder.Default
    private boolean digital = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true,
               fetch = FetchType.LAZY)
    @OrderBy("sortOrder ASC")
    @Builder.Default
    private List<ProductVariant> variants = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true,
               fetch = FetchType.LAZY)
    @OrderBy("sortOrder ASC")
    @Builder.Default
    private List<ProductImage> images = new ArrayList<>();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // ── Domain behaviour ──────────────────────────────────────────────────

    /** Returns the lowest price across all variants. */
    public BigDecimal getMinPrice() {
        return variants.stream()
                .map(ProductVariant::getPrice)
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);
    }

    /** Returns the primary (first) image URL, or null if no images exist. */
    public String getThumbnailUrl() {
        return images.isEmpty() ? null : images.get(0).getUrl();
    }

    /** Returns true if any variant has stock available. */
    public boolean isInStock() {
        return variants.stream().anyMatch(ProductVariant::isInStock);
    }

    /** Returns total inventory across all tracked variants. */
    public int getTotalInventory() {
        return variants.stream()
                .filter(v -> v.getInventoryQuantity() != null)
                .mapToInt(ProductVariant::getInventoryQuantity)
                .sum();
    }

    public boolean isOwnedByStore(UUID storeId) {
        return this.store != null && this.store.getId().equals(storeId);
    }

    public void publish() {
        this.status = ProductStatus.ACTIVE;
    }

    public void archive() {
        this.status = ProductStatus.ARCHIVED;
    }
}
