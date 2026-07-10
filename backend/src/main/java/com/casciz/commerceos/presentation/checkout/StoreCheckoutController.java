package com.casciz.commerceos.presentation.checkout;

import com.casciz.commerceos.application.checkout.dto.CheckoutDtos.*;
import com.casciz.commerceos.application.checkout.usecase.CheckoutService;
import com.casciz.commerceos.application.payment.usecase.PaymentSettingsService;
import com.casciz.commerceos.domain.checkout.valueobject.CheckoutStatus;
import com.casciz.commerceos.domain.payment.valueobject.PaymentProvider;
import com.casciz.commerceos.domain.user.entity.User;
import com.casciz.commerceos.shared.response.ApiResponse;
import com.casciz.commerceos.shared.response.PagedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Store-owner dashboard views for checkout monitoring and payment settings.
 * Nested under /api/v1/stores/{storeId}.
 */
@RestController
@RequestMapping("/api/v1/stores/{storeId}")
@RequiredArgsConstructor
@Tag(name = "Checkout (Dashboard)", description = "Owner views for checkout monitoring and payment configuration")
@SecurityRequirement(name = "bearerAuth")
public class StoreCheckoutController {

    private final CheckoutService       checkoutService;
    private final PaymentSettingsService paymentSettingsService;

    // ── Checkout monitoring ───────────────────────────────────────────────

    @GetMapping("/checkouts")
    @Operation(summary = "List checkouts for a store (paginated, filterable by status)")
    public ResponseEntity<ApiResponse<PagedResponse<CheckoutResponse>>> listCheckouts(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId,
            @RequestParam(required = false) CheckoutStatus status,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, Math.min(size, 100),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<CheckoutResponse> result =
                checkoutService.listByStore(storeId, currentUser.getId(), status, pageable);
        return ResponseEntity.ok(ApiResponse.ok(PagedResponse.from(result)));
    }

    @GetMapping("/checkouts/{checkoutId}/transactions")
    @Operation(summary = "Get all payment transaction attempts for a checkout")
    public ResponseEntity<ApiResponse<List<PaymentTransactionResponse>>> getTransactions(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId,
            @PathVariable UUID checkoutId) {

        List<PaymentTransactionResponse> transactions =
                checkoutService.getTransactions(checkoutId, storeId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok(transactions));
    }

    // ── Payment settings ──────────────────────────────────────────────────

    @GetMapping("/payment-settings")
    @Operation(summary = "List enabled payment gateways for a store")
    public ResponseEntity<ApiResponse<List<PaymentSettingsResponse>>> listPaymentSettings(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId) {

        return ResponseEntity.ok(ApiResponse.ok(
                paymentSettingsService.listByStore(storeId, currentUser.getId())));
    }

    @PutMapping("/payment-settings")
    @Operation(summary = "Create or update payment gateway configuration")
    public ResponseEntity<ApiResponse<PaymentSettingsResponse>> savePaymentSettings(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId,
            @Valid @RequestBody SavePaymentSettingsRequest request) {

        PaymentSettingsResponse result =
                paymentSettingsService.save(storeId, currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Payment settings saved.", result));
    }

    @DeleteMapping("/payment-settings/{provider}")
    @Operation(summary = "Disable a payment gateway")
    public ResponseEntity<ApiResponse<Void>> disablePaymentSettings(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId,
            @PathVariable PaymentProvider provider) {

        paymentSettingsService.disable(storeId, currentUser.getId(), provider);
        return ResponseEntity.ok(ApiResponse.ok(provider.name() + " payments disabled."));
    }
}
