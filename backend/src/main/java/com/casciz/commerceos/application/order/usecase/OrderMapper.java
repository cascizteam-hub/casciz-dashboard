package com.casciz.commerceos.application.order.usecase;

import com.casciz.commerceos.application.checkout.dto.CheckoutDtos.AddressDto;
import com.casciz.commerceos.application.order.dto.OrderDtos.*;
import com.casciz.commerceos.domain.checkout.valueobject.Address;
import com.casciz.commerceos.domain.order.entity.Order;
import com.casciz.commerceos.domain.order.entity.OrderItem;
import com.casciz.commerceos.domain.order.entity.OrderNote;
import org.springframework.stereotype.Component;

@Component
public class OrderMapper {

    public OrderResponse toResponse(Order o) {
        return new OrderResponse(
                o.getId(), o.getStore().getId(), o.getCheckoutId(),
                o.getOrderNumber(), o.getStatus(), o.getFulfilmentStatus(),
                o.getCustomerEmail(), o.getCustomerFirstName(), o.getCustomerLastName(),
                o.getCustomerPhone(), o.getCustomerNotes(),
                toAddressDto(o.getShippingAddress()),
                toAddressDto(o.getBillingAddress()),
                o.getItems().stream().map(this::toItemResponse).toList(),
                o.getTotalItemCount(),
                o.getSubtotal(), o.getShippingAmount(), o.getTaxAmount(),
                o.getDiscountAmount(), o.getTotalAmount(), o.getRefundedAmount(),
                o.getRefundableAmount(),
                o.getCurrency(), o.getCouponCode(),
                o.getPaymentProvider(), o.getPaymentReference(),
                o.getTrackingNumber(), o.getCarrierName(), o.getTrackingUrl(),
                o.getShippedAt(), o.getDeliveredAt(), o.getEstimatedDeliveryAt(),
                o.getCreatedAt(), o.getUpdatedAt(), o.getCancelledAt(),
                o.getCancellationReason(),
                o.getNotes().stream().map(this::toNoteResponse).toList()
        );
    }

    public OrderSummary toSummary(Order o) {
        return new OrderSummary(
                o.getId(), o.getOrderNumber(), o.getStatus(), o.getFulfilmentStatus(),
                o.getCustomerEmail(), o.getCustomerFirstName(), o.getCustomerLastName(),
                o.getTotalItemCount(), o.getTotalAmount(), o.getCurrency(),
                o.getPaymentProvider(), o.getTrackingNumber(), o.getCreatedAt()
        );
    }

    public OrderItemResponse toItemResponse(OrderItem i) {
        return new OrderItemResponse(
                i.getId(), i.getProductId(), i.getVariantId(),
                i.getProductName(), i.getVariantTitle(), i.getSku(),
                i.getUnitPrice(), i.getQuantity(), i.getRefundedQuantity(),
                i.getLineTotal(), i.getRefundableAmount(), i.getImageUrl()
        );
    }

    public OrderNoteResponse toNoteResponse(OrderNote n) {
        return new OrderNoteResponse(
                n.getId(), n.getBody(), n.isSystem(),
                n.isVisibleToCustomer(), n.getAuthor(), n.getCreatedAt()
        );
    }

    private AddressDto toAddressDto(Address a) {
        if (a == null) return null;
        return new AddressDto(a.getFullName(), a.getLine1(), a.getLine2(),
                a.getCity(), a.getState(), a.getPostalCode(),
                a.getCountryCode(), a.getPhone());
    }
}
