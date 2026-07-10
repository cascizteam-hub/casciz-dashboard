package com.casciz.commerceos.application.order.usecase;

import com.casciz.commerceos.application.checkout.usecase.CheckoutCompletedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Listens for {@link CheckoutCompletedEvent} and creates an {@link com.casciz.commerceos.domain.order.entity.Order}.
 *
 * <p>Using Spring Events breaks the circular dependency between CheckoutService and OrderService.
 * The listener runs asynchronously so payment confirmation returns immediately to the client.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventListener {

    private final OrderService orderService;

    @Async
    @EventListener
    public void onCheckoutCompleted(CheckoutCompletedEvent event) {
        log.info("Handling CheckoutCompletedEvent for checkout={}", event.checkoutId());
        try {
            orderService.createFromCheckout(event.checkoutId());
        } catch (Exception ex) {
            log.error("Failed to create order from checkout={}: {}", event.checkoutId(), ex.getMessage(), ex);
        }
    }
}
