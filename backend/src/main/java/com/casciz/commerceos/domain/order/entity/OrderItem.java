package com.casciz.commerceos.domain.order.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * A line item within an order. All prices are snapshotted from the checkout.
 */
@Entity
@Table(name = "order_items",
    indexes = @Index(name = "idx_order_items_order_id", columnList = "order_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(name = "variant_id", nullable = false)
    private UUID variantId;

    @Column(name = "product_name", nullable = false, length = 255)
    private String productName;

    @Column(name = "variant_title", nullable = false, length = 255)
    private String variantTitle;

    @Column(name = "sku", length = 100)
    private String sku;

    @Column(name = "unit_price", nullable = false, precision = 19, scale = 2)
    private BigDecimal unitPrice;

    @Column(nullable = false)
    @Builder.Default
    private int quantity = 1;

    /** Quantity that has been refunded (≤ quantity). */
    @Column(name = "refunded_quantity", nullable = false)
    @Builder.Default
    private int refundedQuantity = 0;

    @Column(name = "image_url", length = 512)
    private String imageUrl;

    // ── Computed ──────────────────────────────────────────────────────────

    public BigDecimal getLineTotal() {
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }

    public BigDecimal getRefundableAmount() {
        int refundable = quantity - refundedQuantity;
        return unitPrice.multiply(BigDecimal.valueOf(Math.max(0, refundable)));
    }
}
