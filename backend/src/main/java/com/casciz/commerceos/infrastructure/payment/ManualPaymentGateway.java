package com.casciz.commerceos.infrastructure.payment;

import com.casciz.commerceos.domain.payment.entity.StorePaymentSettings;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Manual payment gateway adapter for cash-on-delivery or bank transfers.
 * No external API call — payment is marked as pending and confirmed
 * when the store owner manually fulfils the order.
 */
@Component
public class ManualPaymentGateway implements PaymentGateway {

    @Override
    public PaymentIntentResult createPaymentIntent(BigDecimal amount, String currency,
            String customerEmail, String description, StorePaymentSettings settings) {
        // No external intent — generate a local reference
        String ref = "manual_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        return new PaymentIntentResult(ref, null, "requires_confirmation");
    }

    @Override
    public PaymentConfirmResult confirmPayment(String paymentIntentId, StorePaymentSettings settings) {
        // Manual payments succeed immediately — store owner is responsible for actual collection
        return new PaymentConfirmResult(true, paymentIntentId, "Manual", null, null, null);
    }

    @Override
    public RefundResult refund(String providerReference, BigDecimal amount,
                                StorePaymentSettings settings) {
        return new RefundResult(true, "manual_refund_" + UUID.randomUUID(), null);
    }
}
