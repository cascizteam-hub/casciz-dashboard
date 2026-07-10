package com.casciz.commerceos.application.order.dto;

import com.casciz.commerceos.application.checkout.dto.CheckoutDtos.AddressDto;
import com.casciz.commerceos.domain.order.valueobject.FulfilmentStatus;
import com.casciz.commerceos.domain.order.valueobject.OrderStatus;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * All order and fulfilment DTOs.
 */
public final class OrderDtos {

    private OrderDtos() {}

    // ── Requests ──────────────────────────────────────────────────────────

    public record UpdateOrderStatusRequest(
            @NotNull OrderStatus status,
            @Size(max = 255) String reason
    ) {}

    public record ShipOrderRequest(
            @NotBlank(message = "Tracking number is required")
            @Size(max = 120) String trackingNumber,

            @Size(max = 80) String carrierName,

            @Size(max = 512) String trackingUrl,

            Instant estimatedDeliveryAt
    ) {}

    public record AddOrderNoteRequest(
            @NotBlank(message = "Note body is required")
            @Size(max = 2000) String body,

            boolean visibleToCustomer
    ) {}

    public record RefundRequest(
            @NotNull @DecimalMin("0.01") @Digits(integer = 17, fraction = 2)
            BigDecimal amount,

            @NotBlank @Size(max = 255) String reason
    ) {}

    // ── Responses ─────────────────────────────────────────────────────────

    public record OrderItemResponse(
            UUID       id,
            UUID       productId,
            UUID       variantId,
            String     productName,
            String     variantTitle,
            String     sku,
            BigDecimal unitPrice,
            int        quantity,
            int        refundedQuantity,
            BigDecimal lineTotal,
            BigDecimal refundableAmount,
            String     imageUrl
    ) {}

    public record OrderNoteResponse(
            UUID    id,
            String  body,
            boolean system,
            boolean visibleToCustomer,
            String  author,
            Instant createdAt
    ) {}

    public record OrderResponse(
            UUID                   id,
            UUID                   storeId,
            UUID                   checkoutId,
            String                 orderNumber,
            OrderStatus            status,
            FulfilmentStatus       fulfilmentStatus,
            String                 customerEmail,
            String                 customerFirstName,
            String                 customerLastName,
            String                 customerPhone,
            String                 customerNotes,
            AddressDto             shippingAddress,
            AddressDto             billingAddress,
            List<OrderItemResponse> items,
            int                    totalItemCount,
            BigDecimal             subtotal,
            BigDecimal             shippingAmount,
            BigDecimal             taxAmount,
            BigDecimal             discountAmount,
            BigDecimal             totalAmount,
            BigDecimal             refundedAmount,
            BigDecimal             refundableAmount,
            String                 currency,
            String                 couponCode,
            String                 paymentProvider,
            String                 paymentReference,
            String                 trackingNumber,
            String                 carrierName,
            String                 trackingUrl,
            Instant                shippedAt,
            Instant                deliveredAt,
            Instant                estimatedDeliveryAt,
            Instant                createdAt,
            Instant                updatedAt,
            Instant                cancelledAt,
            String                 cancellationReason,
            List<OrderNoteResponse> notes
    ) {}

    /** Lightweight summary for list views. */
    public record OrderSummary(
            UUID             id,
            String           orderNumber,
            OrderStatus      status,
            FulfilmentStatus fulfilmentStatus,
            String           customerEmail,
            String           customerFirstName,
            String           customerLastName,
            int              totalItemCount,
            BigDecimal       totalAmount,
            String           currency,
            String           paymentProvider,
            String           trackingNumber,
            Instant          createdAt
    ) {}

    /** Aggregate stats for the dashboard. */
    public record OrderStatsResponse(
            long       totalOrders,
            long       pendingPayment,
            long       paid,
            long       processing,
            long       shipped,
            long       delivered,
            long       cancelled,
            long       unfulfilledOrders,
            BigDecimal revenueThisMonth
    ) {}
}
