package com.casciz.commerceos.domain.payment.valueobject;

/**
 * Status of a payment transaction.
 */
public enum PaymentStatus {
    /** Payment intent created; customer hasn't acted yet. */
    PENDING,

    /** Provider is processing the payment. */
    PROCESSING,

    /** Payment captured successfully. */
    SUCCEEDED,

    /** Payment was declined or errored. */
    FAILED,

    /** Full payment has been refunded. */
    REFUNDED,

    /** Partial amount has been refunded. */
    PARTIALLY_REFUNDED,

    /** Payment was cancelled before capture. */
    CANCELLED;

    public boolean isFinal() {
        return this == SUCCEEDED || this == FAILED || this == REFUNDED || this == CANCELLED;
    }

    public boolean isSuccessful() {
        return this == SUCCEEDED;
    }
}
