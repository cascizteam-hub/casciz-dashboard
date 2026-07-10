package com.casciz.commerceos.application.checkout.usecase;

import java.util.UUID;

/**
 * Published when a checkout payment is confirmed successfully.
 * Decouples CheckoutService from OrderService to avoid a circular Spring bean dependency.
 */
public record CheckoutCompletedEvent(UUID checkoutId) {}
