package com.casciz.commerceos.application.checkout.usecase;

import com.casciz.commerceos.application.checkout.dto.CheckoutDtos.*;
import com.casciz.commerceos.domain.checkout.entity.Checkout;
import com.casciz.commerceos.domain.checkout.entity.CheckoutItem;
import com.casciz.commerceos.domain.checkout.valueobject.Address;
import com.casciz.commerceos.domain.payment.entity.PaymentTransaction;
import com.casciz.commerceos.domain.payment.entity.StorePaymentSettings;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CheckoutMapper {

    public CheckoutResponse toResponse(Checkout c) {
        return new CheckoutResponse(
                c.getId(),
                c.getSessionToken(),
                c.getStore().getId(),
                c.getStatus(),
                c.getCustomerEmail(),
                c.getCustomerFirstName(),
                c.getCustomerLastName(),
                toAddressDto(c.getShippingAddress()),
                toAddressDto(c.getBillingAddress()),
                c.getItems().stream().map(this::toItemResponse).toList(),
                c.getTotalItemCount(),
                c.getSubtotal(),
                c.getShippingAmount(),
                c.getTaxAmount(),
                c.getDiscountAmount(),
                c.getTotalAmount(),
                c.getCurrency(),
                c.getCouponCode(),
                c.getPaymentIntentId(),
                c.getPaymentProvider(),
                c.getCreatedAt(),
                c.getExpiresAt()
        );
    }

    public CheckoutItemResponse toItemResponse(CheckoutItem item) {
        return new CheckoutItemResponse(
                item.getId(),
                item.getProductId(),
                item.getVariantId(),
                item.getProductName(),
                item.getVariantTitle(),
                item.getSku(),
                item.getUnitPrice(),
                item.getQuantity(),
                item.getLineTotal(),
                item.getImageUrl()
        );
    }

    public PaymentTransactionResponse toTransactionResponse(PaymentTransaction t) {
        return new PaymentTransactionResponse(
                t.getId(),
                t.getProvider().name(),
                t.getStatus(),
                t.getAmount(),
                t.getCurrency(),
                t.getPaymentMethodBrand(),
                t.getPaymentMethodLast4(),
                t.getFailureReason(),
                t.getCreatedAt()
        );
    }

    public PaymentSettingsResponse toSettingsResponse(StorePaymentSettings s) {
        return new PaymentSettingsResponse(
                s.getId(),
                s.getProvider(),
                s.isEnabled(),
                s.getPublicKey(),
                s.isLiveMode(),
                s.getDisplayName()
        );
    }

    private AddressDto toAddressDto(Address a) {
        if (a == null) return null;
        return new AddressDto(
                a.getFullName(), a.getLine1(), a.getLine2(), a.getCity(),
                a.getState(), a.getPostalCode(), a.getCountryCode(), a.getPhone()
        );
    }

    public Address fromAddressDto(AddressDto dto) {
        if (dto == null) return null;
        return Address.builder()
                .fullName(dto.fullName()).line1(dto.line1()).line2(dto.line2())
                .city(dto.city()).state(dto.state()).postalCode(dto.postalCode())
                .countryCode(dto.countryCode()).phone(dto.phone())
                .build();
    }
}
