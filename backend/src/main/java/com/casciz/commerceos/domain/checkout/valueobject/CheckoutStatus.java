package com.casciz.commerceos.domain.checkout.valueobject;

/**
 * Lifecycle of a checkout session.
 *
 * <pre>
 * OPEN ──► PROCESSING ──► COMPLETED
 *   └──────────────────► ABANDONED
 *             └─────────► FAILED
 * </pre>
 */
public enum CheckoutStatus {

    /** Customer is actively filling in details. */
    OPEN,

    /** Payment has been initiated; awaiting confirmation. */
    PROCESSING,

    /** Payment confirmed; checkout converts to an order. */
    COMPLETED,

    /** Customer left without completing (cart timeout). */
    ABANDONED,

    /** Payment failed or was declined. */
    FAILED;

    public boolean isTerminal() {
        return this == COMPLETED || this == ABANDONED || this == FAILED;
    }

    public boolean canTransitionTo(CheckoutStatus next) {
        return switch (this) {
            case OPEN        -> next == PROCESSING || next == ABANDONED;
            case PROCESSING  -> next == COMPLETED  || next == FAILED || next == OPEN;
            case COMPLETED, ABANDONED, FAILED -> false;
        };
    }
}
