package com.casciz.commerceos.application.order.usecase;

import com.casciz.commerceos.application.order.dto.OrderDtos.*;
import com.casciz.commerceos.domain.checkout.entity.Checkout;
import com.casciz.commerceos.domain.checkout.entity.CheckoutItem;
import com.casciz.commerceos.domain.checkout.repository.CheckoutRepository;
import com.casciz.commerceos.domain.checkout.valueobject.CheckoutStatus;
import com.casciz.commerceos.domain.order.entity.Order;
import com.casciz.commerceos.domain.order.entity.OrderItem;
import com.casciz.commerceos.domain.order.entity.OrderNote;
import com.casciz.commerceos.domain.order.repository.OrderRepository;
import com.casciz.commerceos.domain.order.valueobject.FulfilmentStatus;
import com.casciz.commerceos.domain.order.valueobject.OrderStatus;
import com.casciz.commerceos.domain.product.repository.ProductVariantRepository;
import com.casciz.commerceos.domain.store.repository.StoreRepository;
import com.casciz.commerceos.shared.exception.CascizException;
import com.casciz.commerceos.shared.exception.DomainExceptions.*;
import com.casciz.commerceos.shared.response.PagedResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.UUID;

/**
 * All order management and fulfilment use-cases.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final OrderRepository          orderRepository;
    private final CheckoutRepository       checkoutRepository;
    private final StoreRepository          storeRepository;
    private final ProductVariantRepository variantRepository;
    private final OrderMapper              mapper;

    // ── Create order from completed checkout ──────────────────────────────

    /**
     * Called by {@link com.casciz.commerceos.application.checkout.usecase.CheckoutService}
     * after successful payment confirmation.
     */
    public OrderResponse createFromCheckout(UUID checkoutId) {
        if (orderRepository.existsByCheckoutId(checkoutId)) {
            // Idempotent: return the existing order if already created
            return mapper.toResponse(orderRepository.findByCheckoutId(checkoutId)
                    .orElseThrow(() -> new ResourceNotFoundException("Order (checkout)", checkoutId)));
        }

        Checkout checkout = checkoutRepository.findById(checkoutId)
                .orElseThrow(() -> new ResourceNotFoundException("Checkout", checkoutId));

        if (checkout.getStatus() != CheckoutStatus.COMPLETED) {
            throw new CascizException("Cannot create order: checkout is not completed.",
                    HttpStatus.CONFLICT);
        }

        String orderNumber = "#" + (1000 + (orderRepository.count() + 1));

        Order order = Order.builder()
                .store(checkout.getStore())
                .checkoutId(checkoutId)
                .orderNumber(orderNumber)
                .status(OrderStatus.PAID)
                .fulfilmentStatus(FulfilmentStatus.UNFULFILLED)
                .customerEmail(checkout.getCustomerEmail())
                .customerFirstName(checkout.getCustomerFirstName())
                .customerLastName(checkout.getCustomerLastName())
                .customerPhone(checkout.getCustomerPhone())
                .customerNotes(checkout.getCustomerNotes())
                .shippingAddress(checkout.getShippingAddress())
                .billingAddress(checkout.getBillingAddress())
                .subtotal(checkout.getSubtotal())
                .shippingAmount(checkout.getShippingAmount())
                .taxAmount(checkout.getTaxAmount())
                .discountAmount(checkout.getDiscountAmount())
                .totalAmount(checkout.getTotalAmount())
                .currency(checkout.getCurrency())
                .couponCode(checkout.getCouponCode())
                .paymentProvider(checkout.getPaymentProvider())
                .paymentReference(checkout.getPaymentIntentId())
                .build();

        // Copy line items from checkout
        for (CheckoutItem ci : checkout.getItems()) {
            OrderItem item = OrderItem.builder()
                    .order(order)
                    .productId(ci.getProductId())
                    .variantId(ci.getVariantId())
                    .productName(ci.getProductName())
                    .variantTitle(ci.getVariantTitle())
                    .sku(ci.getSku())
                    .unitPrice(ci.getUnitPrice())
                    .quantity(ci.getQuantity())
                    .imageUrl(ci.getImageUrl())
                    .build();
            order.getItems().add(item);

            // Decrement stock for each variant
            variantRepository.adjustStock(ci.getVariantId(), -ci.getQuantity());
        }

        order.addSystemNote("Order created from checkout #" + checkoutId.toString().substring(0, 8));

        Order saved = orderRepository.save(order);
        log.info("Order created: orderNumber={}, store={}", saved.getOrderNumber(),
                checkout.getStore().getId());
        return mapper.toResponse(saved);
    }

    // ── List ──────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PagedResponse<OrderSummary> list(UUID storeId, UUID ownerId,
                                            String query, OrderStatus status,
                                            FulfilmentStatus fulfilmentStatus,
                                            Pageable pageable) {
        loadOwnedStore(storeId, ownerId);

        Page<Order> page;
        if (StringUtils.hasText(query)) {
            page = orderRepository.searchByStore(storeId, query, pageable);
        } else if (status != null) {
            page = orderRepository.findByStoreIdAndStatusOrderByCreatedAtDesc(
                    storeId, status, pageable);
        } else if (fulfilmentStatus != null) {
            page = orderRepository.findByStoreIdAndFulfilmentStatusOrderByCreatedAtDesc(
                    storeId, fulfilmentStatus, pageable);
        } else {
            page = orderRepository.findByStoreIdOrderByCreatedAtDesc(storeId, pageable);
        }

        return PagedResponse.from(page.map(mapper::toSummary));
    }

    // ── Get one ───────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public OrderResponse getById(UUID orderId, UUID storeId, UUID ownerId) {
        loadOwnedStore(storeId, ownerId);
        return mapper.toResponse(loadOrder(orderId, storeId));
    }

    // ── Status update ─────────────────────────────────────────────────────

    public OrderResponse updateStatus(UUID orderId, UUID storeId, UUID ownerId,
                                       UpdateOrderStatusRequest request) {
        loadOwnedStore(storeId, ownerId);
        Order order = loadOrder(orderId, storeId);

        order.transitionTo(request.status());
        order.addSystemNote("Status changed to " + request.status().name()
                + (StringUtils.hasText(request.reason()) ? ": " + request.reason() : ""));

        if (request.status() == OrderStatus.CANCELLED && StringUtils.hasText(request.reason())) {
            order.setCancellationReason(request.reason());
            order.setCancelledAt(Instant.now());
        }

        Order saved = orderRepository.save(order);
        log.info("Order status updated: order={}, status={}", orderId, request.status());
        return mapper.toResponse(saved);
    }

    // ── Fulfilment: ship ──────────────────────────────────────────────────

    public OrderResponse shipOrder(UUID orderId, UUID storeId, UUID ownerId,
                                    ShipOrderRequest request) {
        loadOwnedStore(storeId, ownerId);
        Order order = loadOrder(orderId, storeId);

        if (!order.getStatus().isFulfillable()) {
            throw new CascizException(
                    "Order must be in PAID or PROCESSING status to ship. Current: "
                            + order.getStatus(), HttpStatus.CONFLICT);
        }

        if (order.getStatus() == OrderStatus.PAID) {
            order.transitionTo(OrderStatus.PROCESSING);
        }

        order.markShipped(
                request.trackingNumber(),
                request.carrierName(),
                request.trackingUrl(),
                request.estimatedDeliveryAt()
        );

        order.addSystemNote(
                "Shipped via " + (StringUtils.hasText(request.carrierName())
                        ? request.carrierName() : "carrier")
                + ". Tracking: " + request.trackingNumber());

        Order saved = orderRepository.save(order);
        log.info("Order shipped: order={}, tracking={}", orderId, request.trackingNumber());
        return mapper.toResponse(saved);
    }

    // ── Fulfilment: deliver ───────────────────────────────────────────────

    public OrderResponse markDelivered(UUID orderId, UUID storeId, UUID ownerId) {
        loadOwnedStore(storeId, ownerId);
        Order order = loadOrder(orderId, storeId);

        if (order.getStatus() != OrderStatus.SHIPPED) {
            throw new CascizException(
                    "Order must be SHIPPED before marking as delivered.",
                    HttpStatus.CONFLICT);
        }

        order.markDelivered();
        order.addSystemNote("Order marked as delivered.");

        return mapper.toResponse(orderRepository.save(order));
    }

    // ── Cancel ────────────────────────────────────────────────────────────

    public OrderResponse cancelOrder(UUID orderId, UUID storeId, UUID ownerId, String reason) {
        loadOwnedStore(storeId, ownerId);
        Order order = loadOrder(orderId, storeId);

        order.cancel(reason);

        // Restore stock for each item
        order.getItems().forEach(item ->
                variantRepository.adjustStock(item.getVariantId(), item.getQuantity()));

        order.addSystemNote("Order cancelled" +
                (StringUtils.hasText(reason) ? ": " + reason : "."));

        log.info("Order cancelled: order={}, reason={}", orderId, reason);
        return mapper.toResponse(orderRepository.save(order));
    }

    // ── Refund ────────────────────────────────────────────────────────────

    public OrderResponse refundOrder(UUID orderId, UUID storeId, UUID ownerId,
                                      RefundRequest request) {
        loadOwnedStore(storeId, ownerId);
        Order order = loadOrder(orderId, storeId);

        if (order.getStatus() != OrderStatus.DELIVERED
                && order.getStatus() != OrderStatus.PAID
                && order.getStatus() != OrderStatus.PROCESSING) {
            throw new CascizException(
                    "Refunds can only be issued for PAID, PROCESSING or DELIVERED orders.",
                    HttpStatus.CONFLICT);
        }

        BigDecimal refundable = order.getRefundableAmount();
        if (request.amount().compareTo(refundable) > 0) {
            throw new CascizException(
                    "Refund amount exceeds refundable amount of " + refundable + " " + order.getCurrency(),
                    HttpStatus.UNPROCESSABLE_ENTITY);
        }

        order.setRefundedAmount(order.getRefundedAmount().add(request.amount()));

        boolean fullRefund = order.getRefundedAmount().compareTo(order.getTotalAmount()) >= 0;
        order.transitionTo(fullRefund ? OrderStatus.REFUNDED : OrderStatus.PARTIALLY_REFUNDED);

        order.addSystemNote(
                "Refund of " + request.amount() + " " + order.getCurrency()
                + " issued. Reason: " + request.reason());

        log.info("Order refunded: order={}, amount={}", orderId, request.amount());
        return mapper.toResponse(orderRepository.save(order));
    }

    // ── Notes ─────────────────────────────────────────────────────────────

    public OrderResponse addNote(UUID orderId, UUID storeId, UUID ownerId,
                                  AddOrderNoteRequest request, String authorName) {
        loadOwnedStore(storeId, ownerId);
        Order order = loadOrder(orderId, storeId);

        OrderNote note = OrderNote.builder()
                .order(order)
                .body(request.body())
                .system(false)
                .visibleToCustomer(request.visibleToCustomer())
                .author(authorName)
                .build();
        order.getNotes().add(note);

        return mapper.toResponse(orderRepository.save(order));
    }

    // ── Stats ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public OrderStatsResponse getStats(UUID storeId, UUID ownerId) {
        loadOwnedStore(storeId, ownerId);

        Instant monthStart = YearMonth.now(ZoneOffset.UTC)
                .atDay(1).atStartOfDay().toInstant(ZoneOffset.UTC);

        BigDecimal revenue = orderRepository.sumRevenueSince(storeId, monthStart);

        return new OrderStatsResponse(
                orderRepository.countByStoreIdAndStatus(storeId, OrderStatus.PAID)
                + orderRepository.countByStoreIdAndStatus(storeId, OrderStatus.PROCESSING)
                + orderRepository.countByStoreIdAndStatus(storeId, OrderStatus.SHIPPED)
                + orderRepository.countByStoreIdAndStatus(storeId, OrderStatus.DELIVERED),
                orderRepository.countByStoreIdAndStatus(storeId, OrderStatus.PENDING_PAYMENT),
                orderRepository.countByStoreIdAndStatus(storeId, OrderStatus.PAID),
                orderRepository.countByStoreIdAndStatus(storeId, OrderStatus.PROCESSING),
                orderRepository.countByStoreIdAndStatus(storeId, OrderStatus.SHIPPED),
                orderRepository.countByStoreIdAndStatus(storeId, OrderStatus.DELIVERED),
                orderRepository.countByStoreIdAndStatus(storeId, OrderStatus.CANCELLED),
                orderRepository.countByStoreIdAndFulfilmentStatus(storeId, FulfilmentStatus.UNFULFILLED),
                revenue != null ? revenue : BigDecimal.ZERO
        );
    }

    // ── Private helpers ───────────────────────────────────────────────────

    private void loadOwnedStore(UUID storeId, UUID ownerId) {
        storeRepository.findByIdAndOwnerId(storeId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeId));
    }

    private Order loadOrder(UUID orderId, UUID storeId) {
        return orderRepository.findByIdAndStoreId(orderId, storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
    }
}
