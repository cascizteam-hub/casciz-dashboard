package com.casciz.commerceos.application.checkout;

import com.casciz.commerceos.application.checkout.dto.CheckoutDtos.*;
import com.casciz.commerceos.application.checkout.usecase.CheckoutMapper;
import com.casciz.commerceos.application.checkout.usecase.CheckoutService;
import com.casciz.commerceos.domain.checkout.entity.Checkout;
import com.casciz.commerceos.domain.checkout.entity.CheckoutItem;
import com.casciz.commerceos.domain.checkout.repository.CheckoutRepository;
import com.casciz.commerceos.domain.checkout.valueobject.CheckoutStatus;
import com.casciz.commerceos.domain.payment.repository.PaymentTransactionRepository;
import com.casciz.commerceos.domain.payment.repository.StorePaymentSettingsRepository;
import com.casciz.commerceos.domain.product.entity.Product;
import com.casciz.commerceos.domain.product.entity.ProductVariant;
import com.casciz.commerceos.domain.product.repository.ProductRepository;
import com.casciz.commerceos.domain.product.repository.ProductVariantRepository;
import com.casciz.commerceos.domain.store.entity.Store;
import com.casciz.commerceos.domain.store.repository.StoreRepository;
import com.casciz.commerceos.domain.store.valueobject.StoreCurrency;
import com.casciz.commerceos.domain.store.valueobject.StoreStatus;
import com.casciz.commerceos.infrastructure.payment.PaymentGatewayRegistry;
import com.casciz.commerceos.shared.exception.CascizException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CheckoutService")
class CheckoutServiceTest {

    @Mock CheckoutRepository            checkoutRepository;
    @Mock StoreRepository               storeRepository;
    @Mock ProductRepository             productRepository;
    @Mock ProductVariantRepository      variantRepository;
    @Mock PaymentTransactionRepository  transactionRepository;
    @Mock StorePaymentSettingsRepository paymentSettingsRepository;
    @Mock PaymentGatewayRegistry        gatewayRegistry;
    @Mock ApplicationEventPublisher     eventPublisher;

    CheckoutMapper  mapper  = new CheckoutMapper();
    CheckoutService service;

    UUID storeId   = UUID.randomUUID();
    UUID variantId = UUID.randomUUID();
    UUID productId = UUID.randomUUID();

    Store mockStore;
    String sessionToken = "test-session-token-abc123";

    @BeforeEach
    void setUp() {
        service = new CheckoutService(
                checkoutRepository, storeRepository, productRepository,
                variantRepository, transactionRepository, paymentSettingsRepository,
                gatewayRegistry, mapper, eventPublisher);

        mockStore = Store.builder()
                .id(storeId).name("Test Store").slug("test-store")
                .status(StoreStatus.PUBLISHED).currency(StoreCurrency.USD)
                .build();
    }

    @Test
    @DisplayName("createCheckout: creates OPEN checkout for published store")
    void createCheckout_publishedStore_succeeds() {
        when(storeRepository.findById(storeId)).thenReturn(Optional.of(mockStore));
        when(checkoutRepository.save(any())).thenAnswer(inv -> {
            Checkout c = inv.getArgument(0);
            return Checkout.builder()
                    .id(UUID.randomUUID()).store(mockStore)
                    .sessionToken(c.getSessionToken())
                    .status(CheckoutStatus.OPEN).currency("USD")
                    .build();
        });

        CheckoutResponse result = service.createCheckout(storeId);

        assertThat(result.status()).isEqualTo(CheckoutStatus.OPEN);
        assertThat(result.sessionToken()).isNotBlank();
        assertThat(result.currency()).isEqualTo("USD");
    }

    @Test
    @DisplayName("createCheckout: throws FORBIDDEN for unpublished store")
    void createCheckout_draftStore_throwsForbidden() {
        mockStore.setStatus(StoreStatus.DRAFT);
        when(storeRepository.findById(storeId)).thenReturn(Optional.of(mockStore));

        assertThatThrownBy(() -> service.createCheckout(storeId))
                .isInstanceOf(CascizException.class)
                .hasMessageContaining("not currently accepting");
    }

    @Test
    @DisplayName("addItem: throws CONFLICT for out-of-stock variant")
    void addItem_outOfStock_throwsConflict() {
        Checkout openCheckout = Checkout.builder()
                .id(UUID.randomUUID()).store(mockStore)
                .sessionToken(sessionToken)
                .status(CheckoutStatus.OPEN).currency("USD")
                .expiresAt(Instant.now().plusSeconds(3600))
                .build();

        ProductVariant outOfStock = ProductVariant.builder()
                .id(variantId).title("S / Red")
                .price(BigDecimal.TEN).inventoryQuantity(0)
                .allowBackorder(false).build();
        Product mockProduct = Product.builder().id(productId).name("T-Shirt").build();
        outOfStock.setProduct(mockProduct);

        when(checkoutRepository.findBySessionToken(sessionToken)).thenReturn(Optional.of(openCheckout));
        when(variantRepository.findById(variantId)).thenReturn(Optional.of(outOfStock));

        assertThatThrownBy(() -> service.addItem(sessionToken,
                new AddItemRequest(variantId, 1)))
                .isInstanceOf(CascizException.class)
                .hasMessageContaining("out of stock");
    }

    @Test
    @DisplayName("getByToken: returns checkout for valid session token")
    void getByToken_validToken_returnsCheckout() {
        Checkout checkout = Checkout.builder()
                .id(UUID.randomUUID()).store(mockStore)
                .sessionToken(sessionToken)
                .status(CheckoutStatus.OPEN).currency("USD")
                .build();

        when(checkoutRepository.findBySessionToken(sessionToken)).thenReturn(Optional.of(checkout));

        CheckoutResponse result = service.getByToken(sessionToken);

        assertThat(result.sessionToken()).isEqualTo(sessionToken);
        assertThat(result.status()).isEqualTo(CheckoutStatus.OPEN);
    }

    @Test
    @DisplayName("updateCustomer: persists customer details")
    void updateCustomer_validDetails_persists() {
        Checkout checkout = Checkout.builder()
                .id(UUID.randomUUID()).store(mockStore)
                .sessionToken(sessionToken)
                .status(CheckoutStatus.OPEN).currency("USD")
                .expiresAt(Instant.now().plusSeconds(3600))
                .build();

        when(checkoutRepository.findBySessionToken(sessionToken)).thenReturn(Optional.of(checkout));
        when(checkoutRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        UpdateCustomerRequest req = new UpdateCustomerRequest(
                "jane@example.com", "Jane", "Doe", "+1-555-0100");
        CheckoutResponse result = service.updateCustomer(sessionToken, req);

        assertThat(result.customerEmail()).isEqualTo("jane@example.com");
        assertThat(result.customerFirstName()).isEqualTo("Jane");
    }
}
