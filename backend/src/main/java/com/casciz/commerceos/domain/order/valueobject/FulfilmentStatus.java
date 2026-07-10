package com.casciz.commerceos.domain.order.valueobject;

/**
 * Physical shipping / fulfilment status of an order.
 * Tracks the shipping journey independently from the payment/order lifecycle.
 */
public enum FulfilmentStatus {
    /** No fulfilment action taken yet. */
    UNFULFILLED,

    /** Partially picked/packed (some items not yet ready). */
    PARTIAL,

    /** All items packed and ready for carrier pickup. */
    READY_TO_SHIP,

    /** Handed to carrier; tracking number issued. */
    SHIPPED,

    /** Carrier confirmed delivery. */
    DELIVERED,

    /** Returned by customer. */
    RETURNED;
}
