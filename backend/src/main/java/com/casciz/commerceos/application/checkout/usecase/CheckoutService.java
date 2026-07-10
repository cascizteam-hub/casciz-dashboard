package com.casciz.commerceos.application.checkout.usecase;

import com.casciz.commerceos.application.checkout.dto.CheckoutDtos.*;
import com.casciz.commerceos.domain.checkout.entity.Checkout;
import com.casciz.commerceos.domain.checkout.entity.CheckoutItem;
import com.casciz.commerceos.domain.checkout.repository.CheckoutRepository;
import com.casciz.commerceos.domain.checkout.valueobject.CheckoutStatus;
import com.casciz.commerceos.domain.payment.entity.PaymentTransaction;
import com.casciz.commerceos.domain.payment.entity.StorePaymentSettings;
import com.casciz.commerceos.domain.payment.repository.PaymentTransactionRepository;
import com.casciz.commerceos.domain.payment.repository.StorePaymentSettingsRepository;
import com.casciz.commerceos.domain.payment.valueobject.PaymentProvider;
import com.casciz.commerceos.domain.payment.valueobject.PaymentStatus;
import com.casciz.commerceos.domain.product.entity.ProductVariant;
import com.casciz.commerceos.domain.product.repository.ProductRepository;
import com.casciz.commerceos.domain.product.repository.ProductVariantRepository;
import com.casciz.commerceos.domain.store.entity.Store;
import com.casciz.commerceos.domain.store.repository.StoreRepository;
import com.casciz.commerceos.infrastructure.payment.PaymentGateway;
import org.springframework.context.ApplicationEventPublisher;
import com.casciz.commerceos.infrastructure.payment.PaymentGatewayRegistry;
import com.casciz.commerceos.shared.exception.CascizException;
import com.casciz.commerceos.shared.exception.DomainExceptions.*;
import com.casciz.commerceos.shared.util.TokenHashUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Full checkout lifecycle and payment processing use-cases.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CheckoutService {

    private final CheckoutRepository            checkoutRepository;
    private final StoreRepository               storeRepository;
    private final ProductRepository             productRepository;
    private final ProductVariantRepository      variantRepository;
    private final PaymentTransactionRepository  transactionRepository;
    private final StorePaymentSettingsRepository paymentSettingsRepository;
    private final PaymentGatewayRegistry        gatewayRegistry;
    private final CheckoutMapper                mapper;
    private final ApplicationEventPublisher eventPublisher;

    // ── Create checkout ───────────────────────────────────────────────────

    public CheckoutResponse createCheckout(UUID storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeId));

        if (!store.isPublished()) {
            throw new CascizException("This store is not currently accepting orders.",
                    HttpStatus.FORBIDDEN);
        }

        String sessionToken = TokenHashUtil.generateSecureToken();

        Checkout checkout = Checkout.builder()
                .store(store)
                .sessionToken(sessionToken)
                .currency(store.getCurrency().name())
                .status(CheckoutStatus.OPEN)
                .build();

        return mapper.toResponse(checkoutRepository.save(checkout));
    }

    // ── Add item ──────────────────────────────────────────────────────────

    public CheckoutResponse addItem(String sessionToken, AddItemRequest request) {
        Checkout checkout = loadActiveCheckout(sessionToken);

        ProductVariant variant = variantRepository.findById(request.variantId())
                .orElseThrow(() -> new ResourceNotFoundException("Variant", request.variantId()));

        if (!variant.isInStock()) {
            throw new CascizException(
                    "'" + variant.getTitle() + "' is currently out of stock.",
                    HttpStatus.CONFLICT);
        }

        // If the same variant is already in the cart, increment quantity
        checkout.getItems().stream()
                .filter(i -> i.getVariantId().equals(request.variantId()))
                .findFirst()
                .ifPresentOrElse(
                        existing -> existing.setQuantity(existing.getQuantity() + request.quantity()),
                        () -> {
                            String productName = productRepository
                                    .findById(variant.getProduct().getId())
                                    .map(p -> p.getName()).orElse("Product");

                            CheckoutItem item = CheckoutItem.builder()
                                    .checkout(checkout)
                                    .productId(variant.getProduct().getId())
                                    .variantId(variant.getId())
                                    .productName(productName)
                                    .variantTitle(variant.getTitle())
                                    .sku(variant.getSku())
                                    .unitPrice(variant.getPrice())
                                    .quantity(request.quantity())
                                    .imageUrl(
                                        variant.getProduct().getThumbnailUrl()
                                    )
                                    .build();
                            checkout.getItems().add(item);
                        }
                );

        checkout.recalculate();
        return mapper.toResponse(checkoutRepository.save(checkout));
    }

    // ── Update item quantity ──────────────────────────────────────────────

    public CheckoutResponse updateItem(String sessionToken, UpdateItemRequest request) {
        Checkout checkout = loadActiveCheckout(sessionToken);

        if (request.quantity() == 0) {
            checkout.getItems().removeIf(i -> i.getId().equals(request.itemId()));
        } else {
            checkout.getItems().stream()
                    .filter(i -> i.getId().equals(request.itemId()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("CheckoutItem", request.itemId()))
                    .setQuantity(request.quantity());
        }

        checkout.recalculate();
        return mapper.toResponse(checkoutRepository.save(checkout));
    }

    // ── Update customer info ──────────────────────────────────────────────

    public CheckoutResponse updateCustomer(String sessionToken, UpdateCustomerRequest request) {
        Checkout checkout = loadActiveCheckout(sessionToken);
        checkout.setCustomerEmail(request.email());
        checkout.setCustomerFirstName(request.firstName());
        checkout.setCustomerLastName(request.lastName());
        checkout.setCustomerPhone(request.phone());
        return mapper.toResponse(checkoutRepository.save(checkout));
    }

    // ── Update addresses ──────────────────────────────────────────────────

    public CheckoutResponse updateAddresses(String sessionToken,
                                            UpdateAddressesRequest request) {
        Checkout checkout = loadActiveCheckout(sessionToken);
        checkout.setShippingAddress(mapper.fromAddressDto(request.shippingAddress()));
        checkout.setBillingAddress(
                request.billingSameAsShipping()
                        ? mapper.fromAddressDto(request.shippingAddress())
                        : mapper.fromAddressDto(request.billingAddress())
        );
        return mapper.toResponse(checkoutRepository.save(checkout));
    }

    // ── Get checkout by session token ─────────────────────────────────────

    @Transactional(readOnly = true)
    public CheckoutResponse getByToken(String sessionToken) {
        return mapper.toResponse(
                checkoutRepository.findBySessionToken(sessionToken)
                        .orElseThrow(() -> new ResourceNotFoundException("Checkout", sessionToken)));
    }

    // ── Initiate payment ──────────────────────────────────────────────────

    public PaymentIntentResponse initiatePayment(String sessionToken,
                                                  InitiatePaymentRequest request) {
        Checkout checkout = loadActiveCheckout(sessionToken);

        if (checkout.getItems().isEmpty()) {
            throw new CascizException("Cannot initiate payment on an empty checkout.",
                    HttpStatus.UNPROCESSABLE_ENTITY);
        }
        if (checkout.getCustomerEmail() == null) {
            throw new CascizException("Customer email is required before payment.",
                    HttpStatus.UNPROCESSABLE_ENTITY);
        }

        StorePaymentSettings settings = paymentSettingsRepository
                .findByStoreIdAndProvider(checkout.getStore().getId(), request.provider())
                .orElseThrow(() -> new CascizException(
                        request.provider().name() + " is not configured for this store.",
                        HttpStatus.UNPROCESSABLE_ENTITY));

        if (!settings.isEnabled()) {
            throw new CascizException(
                    request.provider().name() + " payments are currently disabled.",
                    HttpStatus.UNPROCESSABLE_ENTITY);
        }

        PaymentGateway gateway = gatewayRegistry.resolve(request.provider());
        PaymentGateway.PaymentIntentResult result = gateway.createPaymentIntent(
                checkout.getTotalAmount(),
                checkout.getCurrency(),
                checkout.getCustomerEmail(),
                "Order from " + checkout.getStore().getName(),
                settings
        );

        // Record pending transaction
        transactionRepository.save(PaymentTransaction.builder()
                .checkoutId(checkout.getId())
                .provider(request.provider())
                .status(PaymentStatus.PENDING)
                .paymentIntentId(result.intentId())
                .amount(checkout.getTotalAmount())
                .currency(checkout.getCurrency())
                .build());

        checkout.setPaymentIntentId(result.intentId());
        checkout.setPaymentProvider(request.provider().name());
        checkout.transitionTo(CheckoutStatus.PROCESSING);
        checkoutRepository.save(checkout);

        return new PaymentIntentResponse(
                result.intentId(),
                result.clientSecret(),
                request.provider().name(),
                checkout.getTotalAmount(),
                checkout.getCurrency()
        );
    }

    // ── Confirm payment ───────────────────────────────────────────────────

    public PaymentResultResponse confirmPayment(String sessionToken,
                                                 ConfirmPaymentRequest request) {
        Checkout checkout = checkoutRepository.findBySessionToken(sessionToken)
                .orElseThrow(() -> new ResourceNotFoundException("Checkout", sessionToken));

        if (checkout.getStatus() != CheckoutStatus.PROCESSING) {
            throw new CascizException(
                    "Checkout is not in a state where payment can be confirmed.",
                    HttpStatus.CONFLICT);
        }

        PaymentProvider provider = PaymentProvider.valueOf(checkout.getPaymentProvider());
        StorePaymentSettings settings = paymentSettingsRepository
                .findByStoreIdAndProvider(checkout.getStore().getId(), provider)
                .orElseThrow(() -> new CascizException("Payment settings not found.",
                        HttpStatus.INTERNAL_SERVER_ERROR));

        PaymentGateway gateway = gatewayRegistry.resolve(provider);
        PaymentGateway.PaymentConfirmResult result =
                gateway.confirmPayment(request.paymentIntentId(), settings);

        PaymentStatus paymentStatus = result.succeeded() ? PaymentStatus.SUCCEEDED : PaymentStatus.FAILED;

        transactionRepository.save(PaymentTransaction.builder()
                .checkoutId(checkout.getId())
                .provider(provider)
                .status(paymentStatus)
                .paymentIntentId(request.paymentIntentId())
                .providerReference(result.providerReference())
                .amount(checkout.getTotalAmount())
                .currency(checkout.getCurrency())
                .paymentMethodBrand(result.paymentMethodBrand())
                .paymentMethodLast4(result.paymentMethodLast4())
                .failureReason(result.failureReason())
                .gatewayResponse(truncate(result.rawResponse(), 4096))
                .build());

        if (result.succeeded()) {
            checkout.transitionTo(CheckoutStatus.COMPLETED);
            checkoutRepository.save(checkout);
            log.info("Payment succeeded for checkout={}", checkout.getId());
            // Create order asynchronously to keep the response fast
            try { eventPublisher.publishEvent(new CheckoutCompletedEvent(checkout.getId())); }
            catch (Exception ex) { log.error("Failed to publish checkout completed event for checkout={}: {}", checkout.getId(), ex.getMessage()); }
            return new PaymentResultResponse(true, "Payment successful.", paymentStatus,
                    result.providerReference());
        } else {
            checkout.transitionTo(CheckoutStatus.FAILED);
            checkoutRepository.save(checkout);
            log.warn("Payment failed for checkout={}: {}", checkout.getId(), result.failureReason());
            return new PaymentResultResponse(false,
                    result.failureReason() != null ? result.failureReason() : "Payment was declined.",
                    paymentStatus, null);
        }
    }

    // ── Owner views (dashboard) ───────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<CheckoutResponse> listByStore(UUID storeId, UUID ownerId,
                                               CheckoutStatus status, Pageable pageable) {
        storeRepository.findByIdAndOwnerId(storeId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeId));

        Page<Checkout> page = status != null
                ? checkoutRepository.findByStoreIdAndStatusOrderByCreatedAtDesc(storeId, status, pageable)
                : checkoutRepository.findByStoreIdOrderByCreatedAtDesc(storeId, pageable);

        return page.map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public List<PaymentTransactionResponse> getTransactions(UUID checkoutId,
                                                             UUID storeId, UUID ownerId) {
        storeRepository.findByIdAndOwnerId(storeId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeId));
        checkoutRepository.findByIdAndStoreId(checkoutId, storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Checkout", checkoutId));

        return transactionRepository.findByCheckoutIdOrderByCreatedAtDesc(checkoutId)
                .stream().map(mapper::toTransactionResponse).toList();
    }

    // ── Scheduled: expire abandoned checkouts ─────────────────────────────

    @Scheduled(fixedDelayString = "PT15M")
    public void expireAbandonedCheckouts() {
        int expired = checkoutRepository.expireOpenCheckouts(Instant.now());
        if (expired > 0) {
            log.info("Expired {} abandoned checkout(s)", expired);
        }
    }

    // ── Private helpers ───────────────────────────────────────────────────

    private Checkout loadActiveCheckout(String sessionToken) {
        Checkout checkout = checkoutRepository.findBySessionToken(sessionToken)
                .orElseThrow(() -> new ResourceNotFoundException("Checkout", sessionToken));

        if (checkout.isExpired()) {
            checkout.transitionTo(CheckoutStatus.ABANDONED);
            checkoutRepository.save(checkout);
            throw new CascizException("This checkout session has expired. Please start again.",
                    HttpStatus.GONE);
        }
        if (checkout.getStatus().isTerminal()) {
            throw new CascizException("This checkout has already been completed or cancelled.",
                    HttpStatus.CONFLICT);
        }
        return checkout;
    }

    private String truncate(String value, int maxLength) {
        if (value == null) return null;
        return value.length() <= maxLength ? value : value.substring(0, maxLength);
    }
}
