package com.casciz.commerceos.domain.payment.valueobject;

/**
 * Supported payment gateway providers.
 * Each provider requires its own set of API credentials configured per store.
 */
public enum PaymentProvider {
    /** Stripe – card payments, Apple Pay, Google Pay. */
    STRIPE,

    /** PayPal – PayPal wallet and card payments. */
    PAYPAL,

    /** Manual / cash on delivery – no gateway involved. */
    MANUAL;

    public boolean requiresWebhook() {
        return this == STRIPE || this == PAYPAL;
    }
}
