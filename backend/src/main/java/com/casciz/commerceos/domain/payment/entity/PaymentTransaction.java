package com.casciz.commerceos.domain.payment.entity;

import com.casciz.commerceos.domain.payment.valueobject.PaymentProvider;
import com.casciz.commerceos.domain.payment.valueobject.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Records every attempt to collect payment for a checkout.
 * Multiple attempts may exist per checkout (retries, refunds).
 * This is an append-only audit log — records are never updated, only added.
 */
@Entity
@Table(
    name = "payment_transactions",
    indexes = {
        @Index(name = "idx_payment_txn_checkout_id",  columnList = "checkout_id"),
        @Index(name = "idx_payment_txn_provider_ref", columnList = "provider_reference"),
        @Index(name = "idx_payment_txn_status",       columnList = "status")
    }
)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "checkout_id", nullable = false)
    private UUID checkoutId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PaymentProvider provider;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    /** The gateway's own ID for this transaction (Stripe charge ID, PayPal capture ID, etc.). */
    @Column(name = "provider_reference", length = 255)
    private String providerReference;

    /** The gateway's payment intent / session ID (used for correlation). */
    @Column(name = "payment_intent_id", length = 255)
    private String paymentIntentId;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 10)
    private String currency;

    /** The card / wallet brand shown to the customer, e.g. "Visa", "PayPal". */
    @Column(name = "payment_method_brand", length = 50)
    private String paymentMethodBrand;

    /** Last 4 digits of the card number, if applicable. */
    @Column(name = "payment_method_last4", length = 4)
    private String paymentMethodLast4;

    /** Raw gateway response payload for debugging (truncated to 4 KB). */
    @Column(name = "gateway_response", columnDefinition = "TEXT")
    private String gatewayResponse;

    /** Human-readable failure reason returned by the gateway. */
    @Column(name = "failure_reason", length = 500)
    private String failureReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
