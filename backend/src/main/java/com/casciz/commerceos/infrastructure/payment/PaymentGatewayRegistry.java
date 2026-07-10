package com.casciz.commerceos.infrastructure.payment;

import com.casciz.commerceos.domain.payment.valueobject.PaymentProvider;
import com.casciz.commerceos.shared.exception.CascizException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

/**
 * Routes a {@link PaymentProvider} to the correct {@link PaymentGateway} adapter.
 */
@Component
@RequiredArgsConstructor
public class PaymentGatewayRegistry {

    private final StripePaymentGateway stripeGateway;
    private final ManualPaymentGateway manualGateway;

    public PaymentGateway resolve(PaymentProvider provider) {
        return switch (provider) {
            case STRIPE -> stripeGateway;
            case MANUAL -> manualGateway;
            case PAYPAL -> throw new CascizException(
                    "PayPal integration is not yet available.", HttpStatus.NOT_IMPLEMENTED);
        };
    }
}
