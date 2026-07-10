package com.casciz.commerceos.domain.checkout.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * A single line item inside a {@link Checkout}.
 * Prices are snapshotted at the time the item is added so price changes
 * to products don't retroactively affect open checkouts.
 */
@Entity
@Table(name = "checkout_items",
    indexes = @Index(name = "idx_checkout_items_checkout_id", columnList = "checkout_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "checkout_id", nullable = false)
    private Checkout checkout;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(name = "variant_id", nullable = false)
    private UUID variantId;

    /** Snapshot of product name at checkout time. */
    @Column(name = "product_name", nullable = false, length = 255)
    private String productName;

    /** Snapshot of variant title at checkout time. */
    @Column(name = "variant_title", nullable = false, length = 255)
    private String variantTitle;

    /** Snapshot of variant SKU at checkout time. */
    @Column(name = "sku", length = 100)
    private String sku;

    /** Snapshot of the unit price at checkout time. */
    @Column(name = "unit_price", nullable = false, precision = 19, scale = 2)
    private BigDecimal unitPrice;

    @Column(nullable = false)
    @Builder.Default
    private int quantity = 1;

    /** Thumbnail URL snapshotted from the product at checkout time. */
    @Column(name = "image_url", length = 512)
    private String imageUrl;

    // ── Computed ──────────────────────────────────────────────────────────

    public BigDecimal getLineTotal() {
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }
}
