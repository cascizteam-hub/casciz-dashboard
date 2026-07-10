package com.casciz.commerceos.infrastructure.payment;

import com.casciz.commerceos.domain.payment.entity.StorePaymentSettings;
import com.casciz.commerceos.infrastructure.security.provider.EncryptionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

/**
 * Stripe payment gateway adapter.
 *
 * <p>Uses the Stripe REST API v1 directly (no Stripe SDK dependency) to keep
 * the dependency surface small. All amounts are converted to the smallest
 * currency unit (cents for USD/EUR/GBP etc.).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class StripePaymentGateway implements PaymentGateway {

    private static final String STRIPE_API_BASE = "https://api.stripe.com/v1";

    private final EncryptionService                          encryptionService;
    private final ObjectMapper                               objectMapper;
    private final org.springframework.web.client.RestTemplate restTemplate;

    @Override
    public PaymentIntentResult createPaymentIntent(BigDecimal amount, String currency,
            String customerEmail, String description, StorePaymentSettings settings) {

        String secretKey = encryptionService.decrypt(settings.getSecretKeyEncrypted());

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("amount",   toCents(amount));
        params.add("currency", currency.toLowerCase());
        params.add("description", description);
        params.add("receipt_email", customerEmail);
        params.add("automatic_payment_methods[enabled]", "true");

        Map<String, Object> response = stripePost("/payment_intents", params, secretKey);

        return new PaymentIntentResult(
                (String) response.get("id"),
                (String) response.get("client_secret"),
                (String) response.get("status")
        );
    }

    @Override
    public PaymentConfirmResult confirmPayment(String paymentIntentId, StorePaymentSettings settings) {
        String secretKey = encryptionService.decrypt(settings.getSecretKeyEncrypted());

        try {
            Map<String, Object> intent = stripeGet(
                    "/payment_intents/" + paymentIntentId, secretKey);

            String status = (String) intent.get("status");
            boolean succeeded = "succeeded".equals(status);

            String brand = null;
            String last4 = null;
            String failureReason = null;

            if (intent.containsKey("last_payment_error") && intent.get("last_payment_error") != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> err = (Map<String, Object>) intent.get("last_payment_error");
                failureReason = (String) err.get("message");
            }

            if (intent.containsKey("payment_method") && intent.get("payment_method") instanceof Map<?,?>) {
                @SuppressWarnings("unchecked")
                Map<String, Object> pm = (Map<String, Object>) intent.get("payment_method");
                if (pm.containsKey("card")) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> card = (Map<String, Object>) pm.get("card");
                    brand = (String) card.get("brand");
                    last4 = (String) card.get("last4");
                }
            }

            return new PaymentConfirmResult(
                    succeeded,
                    paymentIntentId,
                    brand,
                    last4,
                    failureReason,
                    toJson(intent)
            );
        } catch (Exception e) {
            log.error("Stripe confirmPayment failed for {}: {}", paymentIntentId, e.getMessage());
            return new PaymentConfirmResult(false, null, null, null, e.getMessage(), null);
        }
    }

    @Override
    public RefundResult refund(String providerReference, BigDecimal amount,
                                StorePaymentSettings settings) {
        String secretKey = encryptionService.decrypt(settings.getSecretKeyEncrypted());

        try {
            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("payment_intent", providerReference);
            if (amount != null) {
                params.add("amount", toCents(amount));
            }

            Map<String, Object> response = stripePost("/refunds", params, secretKey);
            String status = (String) response.get("status");

            return new RefundResult("succeeded".equals(status), (String) response.get("id"), null);
        } catch (Exception e) {
            log.error("Stripe refund failed for {}: {}", providerReference, e.getMessage());
            return new RefundResult(false, null, e.getMessage());
        }
    }

    // ── Private helpers ───────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private Map<String, Object> stripePost(String path,
                                            MultiValueMap<String, String> params,
                                            String secretKey) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.setBasicAuth(secretKey, "");

        ResponseEntity<Map> response = restTemplate.exchange(
                STRIPE_API_BASE + path,
                HttpMethod.POST,
                new HttpEntity<>(params, headers),
                Map.class);

        return response.getBody();
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> stripeGet(String path, String secretKey) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBasicAuth(secretKey, "");

        ResponseEntity<Map> response = restTemplate.exchange(
                STRIPE_API_BASE + path,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                Map.class);

        return response.getBody();
    }

    private String toCents(BigDecimal amount) {
        return amount.multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .toPlainString();
    }

    private String toJson(Object obj) {
        try { return objectMapper.writeValueAsString(obj); }
        catch (Exception e) { return "{}"; }
    }
}
