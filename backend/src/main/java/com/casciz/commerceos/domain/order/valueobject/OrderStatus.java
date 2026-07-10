package com.casciz.commerceos.domain.order.valueobject;

import java.util.Set;

/**
 * Order lifecycle state machine.
 *
 * <pre>
 * PENDING_PAYMENT ──► PAID ──► PROCESSING ──► SHIPPED ──► DELIVERED
 *       │              │            │               │
 *       └──────────────┴────────────┴───────────────┴──► CANCELLED
 *
 * DELIVERED ──► REFUNDED  (full refund)
 * DELIVERED ──► PARTIALLY_REFUNDED
 * </pre>
 */
public enum OrderStatus {

    /** Order placed but payment not yet confirmed. */
    PENDING_PAYMENT,

    /** Payment received; awaiting fulfilment start. */
    PAID,

    /** Store is preparing the order. */
    PROCESSING,

    /** Order has been dispatched to the carrier. */
    SHIPPED,

    /** Delivery confirmed by carrier or customer. */
    DELIVERED,

    /** Order cancelled before or after fulfilment (before delivery). */
    CANCELLED,

    /** Full refund issued. */
    REFUNDED,

    /** Partial refund issued. */
    PARTIALLY_REFUNDED;

    private static final java.util.Map<OrderStatus, Set<OrderStatus>> ALLOWED =
            java.util.Map.ofEntries(
                    java.util.Map.entry(PENDING_PAYMENT,    Set.of(PAID, CANCELLED)),
                    java.util.Map.entry(PAID,               Set.of(PROCESSING, CANCELLED, REFUNDED)),
                    java.util.Map.entry(PROCESSING,         Set.of(SHIPPED, CANCELLED)),
                    java.util.Map.entry(SHIPPED,            Set.of(DELIVERED, CANCELLED)),
                    java.util.Map.entry(DELIVERED,          Set.of(REFUNDED, PARTIALLY_REFUNDED)),
                    java.util.Map.entry(CANCELLED,          Set.of()),
                    java.util.Map.entry(REFUNDED,           Set.of()),
                    java.util.Map.entry(PARTIALLY_REFUNDED, Set.of(REFUNDED))
            );

    public boolean canTransitionTo(OrderStatus next) {
        Set<OrderStatus> allowed = ALLOWED.get(this);
        return allowed != null && allowed.contains(next);
    }

    public boolean isTerminal() {
        return this == CANCELLED || this == REFUNDED;
    }

    public boolean isFulfillable() {
        return this == PAID || this == PROCESSING;
    }
}
