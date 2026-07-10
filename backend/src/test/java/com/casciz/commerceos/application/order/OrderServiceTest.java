package com.casciz.commerceos.application.order;

import com.casciz.commerceos.application.order.dto.OrderDtos.*;
import com.casciz.commerceos.application.order.usecase.OrderMapper;
import com.casciz.commerceos.application.order.usecase.OrderService;
import com.casciz.commerceos.domain.checkout.entity.Checkout;
import com.casciz.commerceos.domain.checkout.repository.CheckoutRepository;
import com.casciz.commerceos.domain.checkout.valueobject.CheckoutStatus;
import com.casciz.commerceos.domain.order.entity.Order;
import com.casciz.commerceos.domain.order.entity.OrderItem;
import com.casciz.commerceos.domain.order.repository.OrderRepository;
import com.casciz.commerceos.domain.order.valueobject.FulfilmentStatus;
import com.casciz.commerceos.domain.order.valueobject.OrderStatus;
import com.casciz.commerceos.domain.product.repository.ProductVariantRepository;
import com.casciz.commerceos.domain.store.entity.Store;
import com.casciz.commerceos.domain.store.repository.StoreRepository;
import com.casciz.commerceos.domain.store.valueobject.StoreCurrency;
import com.casciz.commerceos.domain.store.valueobject.StoreStatus;
import com.casciz.commerceos.domain.user.entity.User;
import com.casciz.commerceos.shared.exception.CascizException;
import com.casciz.commerceos.shared.exception.DomainExceptions.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("OrderService")
class OrderServiceTest {

    @Mock OrderRepository          orderRepository;
    @Mock CheckoutRepository       checkoutRepository;
    @Mock StoreRepository          storeRepository;
    @Mock ProductVariantRepository variantRepository;

    OrderMapper  mapper  = new OrderMapper();
    OrderService service;

    UUID storeId  = UUID.randomUUID();
    UUID ownerId  = UUID.randomUUID();
    UUID orderId  = UUID.randomUUID();

    User  mockOwner;
    Store mockStore;

    @BeforeEach
    void setUp() {
        service = new OrderService(orderRepository, checkoutRepository,
                storeRepository, variantRepository, mapper);
        mockOwner = User.builder().id(ownerId).email("owner@test.com")
                .firstName("Jane").lastName("Doe").build();
        mockStore = Store.builder().id(storeId).name("Test Store")
                .slug("test-store").status(StoreStatus.PUBLISHED)
                .currency(StoreCurrency.USD).owner(mockOwner).build();
    }

    // ── createFromCheckout ────────────────────────────────────────────────

    @Test
    @DisplayName("createFromCheckout: creates order from COMPLETED checkout")
    void createFromCheckout_completedCheckout_createsOrder() {
        UUID checkoutId = UUID.randomUUID();
        Checkout checkout = Checkout.builder()
                .id(checkoutId).store(mockStore)
                .status(CheckoutStatus.COMPLETED)
                .sessionToken("tok").currency("USD")
                .customerEmail("buyer@test.com")
                .subtotal(BigDecimal.TEN).totalAmount(BigDecimal.TEN)
                .build();

        when(orderRepository.existsByCheckoutId(checkoutId)).thenReturn(false);
        when(checkoutRepository.findById(checkoutId)).thenReturn(Optional.of(checkout));
        when(orderRepository.count()).thenReturn(0L);
        when(orderRepository.save(any())).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(orderId);
            return o;
        });

        OrderResponse result = service.createFromCheckout(checkoutId);

        assertThat(result.customerEmail()).isEqualTo("buyer@test.com");
        assertThat(result.status()).isEqualTo(OrderStatus.PAID);
        assertThat(result.orderNumber()).isEqualTo("#1001");
    }

    @Test
    @DisplayName("createFromCheckout: idempotent – returns existing order if already created")
    void createFromCheckout_alreadyExists_returnsExisting() {
        UUID checkoutId = UUID.randomUUID();
        Order existing = buildOrder(OrderStatus.PAID);

        when(orderRepository.existsByCheckoutId(checkoutId)).thenReturn(true);
        when(orderRepository.findByCheckoutId(checkoutId)).thenReturn(Optional.of(existing));

        OrderResponse result = service.createFromCheckout(checkoutId);
        assertThat(result.status()).isEqualTo(OrderStatus.PAID);
        verify(checkoutRepository, never()).findById(any());
    }

    // ── shipOrder ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("shipOrder: transitions PAID order to SHIPPED and records tracking")
    void shipOrder_paidOrder_transitionsToShipped() {
        Order order = buildOrder(OrderStatus.PAID);
        when(storeRepository.findByIdAndOwnerId(storeId, ownerId)).thenReturn(Optional.of(mockStore));
        when(orderRepository.findByIdAndStoreId(orderId, storeId)).thenReturn(Optional.of(order));
        when(orderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ShipOrderRequest req = new ShipOrderRequest("TRK123", "UPS", null, null);
        OrderResponse result = service.shipOrder(orderId, storeId, ownerId, req);

        assertThat(result.status()).isEqualTo(OrderStatus.SHIPPED);
        assertThat(result.trackingNumber()).isEqualTo("TRK123");
        assertThat(result.fulfilmentStatus()).isEqualTo(FulfilmentStatus.SHIPPED);
    }

    @Test
    @DisplayName("shipOrder: throws CONFLICT for non-fulfillable order status")
    void shipOrder_cancelledOrder_throwsConflict() {
        Order order = buildOrder(OrderStatus.CANCELLED);
        when(storeRepository.findByIdAndOwnerId(storeId, ownerId)).thenReturn(Optional.of(mockStore));
        when(orderRepository.findByIdAndStoreId(orderId, storeId)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> service.shipOrder(orderId, storeId, ownerId,
                new ShipOrderRequest("TRK", null, null, null)))
                .isInstanceOf(CascizException.class)
                .hasMessageContaining("PAID or PROCESSING");
    }

    // ── refundOrder ───────────────────────────────────────────────────────

    @Test
    @DisplayName("refundOrder: throws when refund exceeds refundable amount")
    void refundOrder_excessiveAmount_throws() {
        Order order = buildOrder(OrderStatus.DELIVERED);
        order.setTotalAmount(new BigDecimal("50.00"));
        order.setRefundedAmount(BigDecimal.ZERO);

        when(storeRepository.findByIdAndOwnerId(storeId, ownerId)).thenReturn(Optional.of(mockStore));
        when(orderRepository.findByIdAndStoreId(orderId, storeId)).thenReturn(Optional.of(order));

        RefundRequest req = new RefundRequest(new BigDecimal("999.00"), "Over-refund");
        assertThatThrownBy(() -> service.refundOrder(orderId, storeId, ownerId, req))
                .isInstanceOf(CascizException.class)
                .hasMessageContaining("refundable amount");
    }

    // ── cancelOrder ───────────────────────────────────────────────────────

    @Test
    @DisplayName("cancelOrder: restores inventory on cancellation")
    void cancelOrder_paidOrder_restoresStock() {
        Order order = buildOrder(OrderStatus.PAID);
        OrderItem item = OrderItem.builder()
                .id(UUID.randomUUID()).order(order)
                .variantId(UUID.randomUUID()).quantity(3)
                .unitPrice(BigDecimal.TEN).productName("T-Shirt").variantTitle("M").build();
        order.getItems().add(item);

        when(storeRepository.findByIdAndOwnerId(storeId, ownerId)).thenReturn(Optional.of(mockStore));
        when(orderRepository.findByIdAndStoreId(orderId, storeId)).thenReturn(Optional.of(order));
        when(orderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.cancelOrder(orderId, storeId, ownerId, "Customer request");

        verify(variantRepository).adjustStock(item.getVariantId(), 3);
    }

    // ── helpers ───────────────────────────────────────────────────────────

    private Order buildOrder(OrderStatus status) {
        return Order.builder()
                .id(orderId).store(mockStore)
                .checkoutId(UUID.randomUUID())
                .orderNumber("#1001").status(status)
                .fulfilmentStatus(FulfilmentStatus.UNFULFILLED)
                .customerEmail("buyer@test.com")
                .totalAmount(BigDecimal.TEN).refundedAmount(BigDecimal.ZERO)
                .currency("USD").items(new ArrayList<>()).notes(new ArrayList<>())
                .build();
    }
}
