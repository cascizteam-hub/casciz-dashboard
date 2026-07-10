package com.casciz.commerceos.presentation.checkout;

import com.casciz.commerceos.application.checkout.dto.CheckoutDtos.*;
import com.casciz.commerceos.application.checkout.usecase.CheckoutService;
import com.casciz.commerceos.shared.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Storefront-facing checkout API.
 * No authentication required — identified by session token.
 * Nested under /api/v1/checkout.
 */
@RestController
@RequestMapping("/api/v1/checkout")
@RequiredArgsConstructor
@Tag(name = "Checkout (Storefront)", description = "Customer-facing checkout flow")
public class CheckoutController {

    private final CheckoutService checkoutService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new checkout session for a store")
    public ResponseEntity<ApiResponse<CheckoutResponse>> create(
            @Valid @RequestBody CreateCheckoutRequest request) {

        CheckoutResponse checkout = checkoutService.createCheckout(request.storeId());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(checkout));
    }

    @GetMapping("/{sessionToken}")
    @Operation(summary = "Get the current state of a checkout session")
    public ResponseEntity<ApiResponse<CheckoutResponse>> get(
            @PathVariable String sessionToken) {

        return ResponseEntity.ok(ApiResponse.ok(checkoutService.getByToken(sessionToken)));
    }

    @PostMapping("/{sessionToken}/items")
    @Operation(summary = "Add an item to the checkout")
    public ResponseEntity<ApiResponse<CheckoutResponse>> addItem(
            @PathVariable String sessionToken,
            @Valid @RequestBody AddItemRequest request) {

        return ResponseEntity.ok(ApiResponse.ok(
                checkoutService.addItem(sessionToken, request)));
    }

    @PatchMapping("/{sessionToken}/items")
    @Operation(summary = "Update quantity of a checkout item (0 = remove)")
    public ResponseEntity<ApiResponse<CheckoutResponse>> updateItem(
            @PathVariable String sessionToken,
            @Valid @RequestBody UpdateItemRequest request) {

        return ResponseEntity.ok(ApiResponse.ok(
                checkoutService.updateItem(sessionToken, request)));
    }

    @PutMapping("/{sessionToken}/customer")
    @Operation(summary = "Set customer contact details")
    public ResponseEntity<ApiResponse<CheckoutResponse>> updateCustomer(
            @PathVariable String sessionToken,
            @Valid @RequestBody UpdateCustomerRequest request) {

        return ResponseEntity.ok(ApiResponse.ok(
                checkoutService.updateCustomer(sessionToken, request)));
    }

    @PutMapping("/{sessionToken}/addresses")
    @Operation(summary = "Set shipping and billing addresses")
    public ResponseEntity<ApiResponse<CheckoutResponse>> updateAddresses(
            @PathVariable String sessionToken,
            @Valid @RequestBody UpdateAddressesRequest request) {

        return ResponseEntity.ok(ApiResponse.ok(
                checkoutService.updateAddresses(sessionToken, request)));
    }

    @PostMapping("/{sessionToken}/payment/initiate")
    @Operation(summary = "Create a payment intent and get the client secret for the gateway")
    public ResponseEntity<ApiResponse<PaymentIntentResponse>> initiatePayment(
            @PathVariable String sessionToken,
            @Valid @RequestBody InitiatePaymentRequest request) {

        return ResponseEntity.ok(ApiResponse.ok(
                checkoutService.initiatePayment(sessionToken, request)));
    }

    @PostMapping("/{sessionToken}/payment/confirm")
    @Operation(summary = "Confirm payment and complete the checkout")
    public ResponseEntity<ApiResponse<PaymentResultResponse>> confirmPayment(
            @PathVariable String sessionToken,
            @Valid @RequestBody ConfirmPaymentRequest request) {

        return ResponseEntity.ok(ApiResponse.ok(
                checkoutService.confirmPayment(sessionToken, request)));
    }
}
