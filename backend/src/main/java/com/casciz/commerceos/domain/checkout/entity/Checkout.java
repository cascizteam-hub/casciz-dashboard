package com.casciz.commerceos.domain.checkout.entity;

import com.casciz.commerceos.domain.checkout.valueobject.Address;
import com.casciz.commerceos.domain.checkout.valueobject.CheckoutStatus;
import com.casciz.commerceos.domain.store.entity.Store;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Checkout aggregate root.
 *
 * <p>Represents a customer's in-progress purchase session for a specific store.
 * When payment succeeds, the checkout transitions to COMPLETED and an Order is created.
 *
 * <p>Checkouts expire after 24 hours of inactivity (enforced by a scheduled job).
 */
@Entity
@Table(
    name = "checkouts",
    indexes = {
        @Index(name = "idx_checkouts_store_id",      columnList = "store_id"),
        @Index(name = "idx_checkouts_status",         columnList = "status"),
        @Index(name = "idx_checkouts_customer_email", columnList = "customer_email"),
        @Index(name = "idx_checkouts_created_at",     columnList = "created_at"),
        @Index(name = "idx_checkouts_session_token",  columnList = "session_token", unique = true)
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Checkout {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    /**
     * Opaque token issued to the customer's browser session.
     * Used as a stateless identifier so unsigned customers can resume their checkout.
     */
    @Column(name = "session_token", nullable = false, unique = true, length = 64)
    private String sessionToken;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private CheckoutStatus status = CheckoutStatus.OPEN;

    // ── Customer info ─────────────────────────────────────────────────────
    @Column(name = "customer_email", length = 255)
    private String customerEmail;

    @Column(name = "customer_first_name", length = 100)
    private String customerFirstName;

    @Column(name = "customer_last_name", length = 100)
    private String customerLastName;

    @Column(name = "customer_phone", length = 30)
    private String customerPhone;

    // ── Addresses ─────────────────────────────────────────────────────────
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "fullName",    column = @Column(name = "shipping_full_name",    length = 120)),
        @AttributeOverride(name = "line1",       column = @Column(name = "shipping_line1",        length = 255)),
        @AttributeOverride(name = "line2",       column = @Column(name = "shipping_line2",        length = 255)),
        @AttributeOverride(name = "city",        column = @Column(name = "shipping_city",         length = 100)),
        @AttributeOverride(name = "state",       column = @Column(name = "shipping_state",        length = 100)),
        @AttributeOverride(name = "postalCode",  column = @Column(name = "shipping_postal_code",  length = 20)),
        @AttributeOverride(name = "countryCode", column = @Column(name = "shipping_country_code", length = 2)),
        @AttributeOverride(name = "phone",       column = @Column(name = "shipping_phone",        length = 30))
    })
    private Address shippingAddress;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "fullName",    column = @Column(name = "billing_full_name",    length = 120)),
        @AttributeOverride(name = "line1",       column = @Column(name = "billing_line1",        length = 255)),
        @AttributeOverride(name = "line2",       column = @Column(name = "billing_line2",        length = 255)),
        @AttributeOverride(name = "city",        column = @Column(name = "billing_city",         length = 100)),
        @AttributeOverride(name = "state",       column = @Column(name = "billing_state",        length = 100)),
        @AttributeOverride(name = "postalCode",  column = @Column(name = "billing_postal_code",  length = 20)),
        @AttributeOverride(name = "countryCode", column = @Column(name = "billing_country_code", length = 2)),
        @AttributeOverride(name = "phone",       column = @Column(name = "billing_phone",        length = 30))
    })
    private Address billingAddress;

    // ── Pricing ───────────────────────────────────────────────────────────
    @Column(name = "subtotal", nullable = false, precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "shipping_amount", precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal shippingAmount = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    /** ISO 4217 currency code inherited from the store at checkout time. */
    @Column(nullable = false, length = 10)
    @Builder.Default
    private String currency = "USD";

    // ── Coupon / Discount ─────────────────────────────────────────────────
    @Column(name = "coupon_code", length = 50)
    private String couponCode;

    // ── Notes ─────────────────────────────────────────────────────────────
    @Column(name = "customer_notes", columnDefinition = "TEXT")
    private String customerNotes;

    // ── Payment reference ─────────────────────────────────────────────────
    /** External payment intent ID from the gateway (Stripe PaymentIntent ID, etc.). */
    @Column(name = "payment_intent_id", length = 255)
    private String paymentIntentId;

    @Column(name = "payment_provider", length = 30)
    private String paymentProvider;

    // ── Timestamps ────────────────────────────────────────────────────────
    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "expires_at", nullable = false)
    @Builder.Default
    private Instant expiresAt = Instant.now().plusSeconds(86_400); // 24h

    // ── Line items ────────────────────────────────────────────────────────
    @OneToMany(mappedBy = "checkout", cascade = CascadeType.ALL, orphanRemoval = true,
               fetch = FetchType.LAZY)
    @Builder.Default
    private List<CheckoutItem> items = new ArrayList<>();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // ── Domain behaviour ──────────────────────────────────────────────────

    /** Recalculates subtotal and total from current line items. */
    public void recalculate() {
        this.subtotal = items.stream()
                .map(CheckoutItem::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        this.totalAmount = subtotal
                .add(shippingAmount)
                .add(taxAmount)
                .subtract(discountAmount)
                .max(BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP);
    }

    public void transitionTo(CheckoutStatus next) {
        if (!this.status.canTransitionTo(next)) {
            throw new IllegalStateException(
                    "Cannot transition checkout from " + this.status + " to " + next);
        }
        this.status = next;
        if (next == CheckoutStatus.COMPLETED) {
            this.completedAt = Instant.now();
        }
    }

    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt) && this.status == CheckoutStatus.OPEN;
    }

    public boolean isOwnedByStore(UUID storeId) {
        return this.store != null && this.store.getId().equals(storeId);
    }

    public int getTotalItemCount() {
        return items.stream().mapToInt(CheckoutItem::getQuantity).sum();
    }
}
