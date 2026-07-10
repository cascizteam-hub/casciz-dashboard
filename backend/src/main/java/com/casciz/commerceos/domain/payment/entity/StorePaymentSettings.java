package com.casciz.commerceos.domain.payment.entity;

import com.casciz.commerceos.domain.payment.valueobject.PaymentProvider;
import com.casciz.commerceos.domain.store.entity.Store;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Payment gateway configuration for a store.
 * Credentials are stored encrypted at the infrastructure layer.
 * Each store has at most one configuration per provider.
 */
@Entity
@Table(
    name = "store_payment_settings",
    indexes = {
        @Index(name = "idx_payment_settings_store_id", columnList = "store_id")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_payment_settings_store_provider",
                columnNames = {"store_id", "provider"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StorePaymentSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PaymentProvider provider;

    /** Whether this gateway is enabled for checkout. */
    @Column(nullable = false)
    @Builder.Default
    private boolean enabled = false;

    /**
     * Publishable/public API key (shown to the client for Stripe.js etc.).
     * This is safe to expose to the browser.
     */
    @Column(name = "public_key", length = 512)
    private String publicKey;

    /**
     * Secret API key. Stored AES-256 encrypted.
     * NEVER returned in API responses.
     */
    @Column(name = "secret_key_encrypted", length = 512)
    private String secretKeyEncrypted;

    /**
     * Webhook signing secret (Stripe) or webhook token (PayPal).
     * Stored AES-256 encrypted.
     */
    @Column(name = "webhook_secret_encrypted", length = 512)
    private String webhookSecretEncrypted;

    /** Live mode vs test/sandbox mode. */
    @Column(name = "live_mode", nullable = false)
    @Builder.Default
    private boolean liveMode = false;

    /** Display name shown at checkout, e.g. "Pay with Card" */
    @Column(name = "display_name", length = 100)
    private String displayName;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();

    @PreUpdate
    protected void onUpdate() { this.updatedAt = Instant.now(); }
}
