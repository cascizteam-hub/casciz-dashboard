package com.casciz.commerceos.application.checkout.dto;

import com.casciz.commerceos.domain.checkout.valueobject.CheckoutStatus;
import com.casciz.commerceos.domain.payment.valueobject.PaymentProvider;
import com.casciz.commerceos.domain.payment.valueobject.PaymentStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * All checkout and payment DTOs.
 */
public final class CheckoutDtos {

    private CheckoutDtos() {}

    // ── Address ───────────────────────────────────────────────────────────

    public record AddressDto(
            @NotBlank @Size(max = 120) String fullName,
            @NotBlank @Size(max = 255) String line1,
            @Size(max = 255) String line2,
            @NotBlank @Size(max = 100) String city,
            @Size(max = 100) String state,
            @NotBlank @Size(max = 20) String postalCode,
            @NotBlank @Size(min = 2, max = 2, message = "Must be a 2-letter ISO country code")
            String countryCode,
            @Size(max = 30) String phone
    ) {}

    // ── Checkout requests ─────────────────────────────────────────────────

    public record CreateCheckoutRequest(
            @NotNull(message = "Store ID is required")
            UUID storeId
    ) {}

    public record AddItemRequest(
            @NotNull UUID variantId,
            @Min(1) int quantity
    ) {}

    public record UpdateItemRequest(
            @NotNull UUID itemId,
            @Min(0) int quantity    // 0 = remove
    ) {}

    public record UpdateCustomerRequest(
            @NotBlank @Email @Size(max = 255) String email,
            @NotBlank @Size(max = 100) String firstName,
            @NotBlank @Size(max = 100) String lastName,
            @Size(max = 30) String phone
    ) {}

    public record UpdateAddressesRequest(
            @NotNull @Valid AddressDto shippingAddress,
            @Valid AddressDto billingAddress,
            boolean billingSameAsShipping
    ) {}

    public record ApplyCouponRequest(
            @NotBlank @Size(max = 50) String couponCode
    ) {}

    public record InitiatePaymentRequest(
            @NotNull PaymentProvider provider
    ) {}

    public record ConfirmPaymentRequest(
            @NotBlank String paymentIntentId
    ) {}

    // ── Payment settings requests ─────────────────────────────────────────

    public record SavePaymentSettingsRequest(
            @NotNull PaymentProvider provider,
            boolean enabled,
            @Size(max = 512) String publicKey,
            @Size(max = 512) String secretKey,   // plain — will be encrypted before storage
            @Size(max = 512) String webhookSecret,
            boolean liveMode,
            @Size(max = 100) String displayName
    ) {}

    // ── Responses ─────────────────────────────────────────────────────────

    public record CheckoutItemResponse(
            UUID       id,
            UUID       productId,
            UUID       variantId,
            String     productName,
            String     variantTitle,
            String     sku,
            BigDecimal unitPrice,
            int        quantity,
            BigDecimal lineTotal,
            String     imageUrl
    ) {}

    public record CheckoutResponse(
            UUID                        id,
            String                      sessionToken,
            UUID                        storeId,
            CheckoutStatus              status,
            String                      customerEmail,
            String                      customerFirstName,
            String                      customerLastName,
            AddressDto                  shippingAddress,
            AddressDto                  billingAddress,
            List<CheckoutItemResponse>  items,
            int                         totalItemCount,
            BigDecimal                  subtotal,
            BigDecimal                  shippingAmount,
            BigDecimal                  taxAmount,
            BigDecimal                  discountAmount,
            BigDecimal                  totalAmount,
            String                      currency,
            String                      couponCode,
            String                      paymentIntentId,
            String                      paymentProvider,
            Instant                     createdAt,
            Instant                     expiresAt
    ) {}

    public record PaymentIntentResponse(
            String intentId,
            String clientSecret,      // for Stripe.js — null for manual
            String provider,
            BigDecimal amount,
            String currency
    ) {}

    public record PaymentResultResponse(
            boolean        succeeded,
            String         message,
            PaymentStatus  paymentStatus,
            String         providerReference
    ) {}

    public record PaymentTransactionResponse(
            UUID          id,
            String        provider,
            PaymentStatus status,
            BigDecimal    amount,
            String        currency,
            String        paymentMethodBrand,
            String        paymentMethodLast4,
            String        failureReason,
            Instant       createdAt
    ) {}

    public record PaymentSettingsResponse(
            UUID            id,
            PaymentProvider provider,
            boolean         enabled,
            String          publicKey,
            boolean         liveMode,
            String          displayName
            // secretKey and webhookSecret are never returned
    ) {}

    public record CheckoutStatsResponse(
            long   openCheckouts,
            long   completedToday,
            long   abandonedToday,
            BigDecimal revenueToday
    ) {}
}
