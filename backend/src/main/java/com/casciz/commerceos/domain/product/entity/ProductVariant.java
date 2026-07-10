package com.casciz.commerceos.domain.product.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * A purchasable variant of a product (e.g., Size=M / Color=Blue).
 *
 * <p>Every product has at least one variant — even a simple product with no
 * options has a single "default" variant that holds the price and stock.
 */
@Entity
@Table(
    name = "product_variants",
    indexes = {
        @Index(name = "idx_product_variants_product_id", columnList = "product_id"),
        @Index(name = "idx_product_variants_sku",       columnList = "sku", unique = true)
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /**
     * Human-readable variant title, e.g. "Medium / Blue".
     * For simple products this is "Default".
     */
    @Column(nullable = false, length = 255)
    @Builder.Default
    private String title = "Default";

    /** Stock Keeping Unit — globally unique within a store. */
    @Column(length = 100, unique = true)
    private String sku;

    /** Selling price. Must be ≥ 0. */
    @Column(nullable = false, precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal price = BigDecimal.ZERO;

    /** Optional compare-at price for showing a strikethrough "was" price. */
    @Column(name = "compare_at_price", precision = 19, scale = 2)
    private BigDecimal compareAtPrice;

    /** Cost price — not shown to customers, used for margin calculations. */
    @Column(name = "cost_price", precision = 19, scale = 2)
    private BigDecimal costPrice;

    /** Available stock quantity. NULL = unlimited / untracked. */
    @Column(name = "inventory_quantity")
    private Integer inventoryQuantity;

    /** Whether to allow orders when stock reaches 0. */
    @Column(name = "allow_backorder", nullable = false)
    @Builder.Default
    private boolean allowBackorder = false;

    @Column(name = "weight_grams")
    private Integer weightGrams;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private int sortOrder = 0;

    // ── Domain behaviour ──────────────────────────────────────────────────

    public boolean isInStock() {
        if (inventoryQuantity == null) return true;
        return inventoryQuantity > 0 || allowBackorder;
    }

    public boolean hasDiscount() {
        return compareAtPrice != null && compareAtPrice.compareTo(price) > 0;
    }

    /**
     * Decrements stock by the given quantity.
     *
     * @throws IllegalStateException if stock is insufficient and backorder is disabled
     */
    public void decrementStock(int quantity) {
        if (inventoryQuantity == null) return; // untracked
        if (inventoryQuantity < quantity && !allowBackorder) {
            throw new IllegalStateException(
                    "Insufficient stock for variant: " + id + ". Available: " + inventoryQuantity);
        }
        this.inventoryQuantity = Math.max(0, inventoryQuantity - quantity);
    }

    public void incrementStock(int quantity) {
        if (inventoryQuantity == null) {
            this.inventoryQuantity = quantity;
        } else {
            this.inventoryQuantity += quantity;
        }
    }
}
