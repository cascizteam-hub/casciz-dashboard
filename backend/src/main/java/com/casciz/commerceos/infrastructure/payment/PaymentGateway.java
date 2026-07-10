package com.casciz.commerceos.infrastructure.payment;

import com.casciz.commerceos.domain.payment.entity.StorePaymentSettings;

import java.math.BigDecimal;

/**
 * Payment gateway port. The application layer depends on this interface;
 * concrete adapters (Stripe, PayPal, Manual) implement it.
 */
public interface PaymentGateway {

    /**
     * Creates a payment intent / session on the gateway.
     *
     * @return {@link PaymentIntentResult} containing the provider's intent ID and client secret
     */
    PaymentIntentResult createPaymentIntent(
            BigDecimal amount,
            String currency,
            String customerEmail,
            String description,
            StorePaymentSettings settings);

    /**
     * Confirms a payment that was initiated by the client.
     * For Stripe this verifies the PaymentIntent state; for Manual it auto-approves.
     */
    PaymentConfirmResult confirmPayment(String paymentIntentId, StorePaymentSettings settings);

    /**
     * Issues a full refund for the given provider reference (charge ID, capture ID, etc.).
     */
    RefundResult refund(String providerReference, BigDecimal amount, StorePaymentSettings settings);

    // ── Result types ──────────────────────────────────────────────────────

    record PaymentIntentResult(
            String intentId,
            String clientSecret,     // returned to the browser for Stripe.js
            String status
    ) {}

    record PaymentConfirmResult(
            boolean succeeded,
            String  providerReference,
            String  paymentMethodBrand,
            String  paymentMethodLast4,
            String  failureReason,
            String  rawResponse
    ) {}

    record RefundResult(
            boolean succeeded,
            String  refundReference,
            String  failureReason
    ) {}
}
