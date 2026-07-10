package com.casciz.commerceos.presentation.order;

import com.casciz.commerceos.application.order.dto.OrderDtos.*;
import com.casciz.commerceos.application.order.usecase.OrderService;
import com.casciz.commerceos.domain.order.valueobject.FulfilmentStatus;
import com.casciz.commerceos.domain.order.valueobject.OrderStatus;
import com.casciz.commerceos.domain.user.entity.User;
import com.casciz.commerceos.shared.response.ApiResponse;
import com.casciz.commerceos.shared.response.PagedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST controller for order management and fulfilment.
 * All routes nested under /api/v1/stores/{storeId}/orders.
 */
@RestController
@RequestMapping("/api/v1/stores/{storeId}/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order management and fulfilment")
@SecurityRequirement(name = "bearerAuth")
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    @Operation(summary = "List orders for a store (paginated, searchable, filterable)")
    public ResponseEntity<ApiResponse<PagedResponse<OrderSummary>>> list(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) FulfilmentStatus fulfilmentStatus,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, Math.min(size, 100),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        PagedResponse<OrderSummary> result = orderService.list(
                storeId, currentUser.getId(), q, status, fulfilmentStatus, pageable);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/stats")
    @Operation(summary = "Aggregate order counts and revenue for the dashboard")
    public ResponseEntity<ApiResponse<OrderStatsResponse>> getStats(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId) {

        return ResponseEntity.ok(ApiResponse.ok(
                orderService.getStats(storeId, currentUser.getId())));
    }

    @GetMapping("/{orderId}")
    @Operation(summary = "Get a single order with full details and timeline")
    public ResponseEntity<ApiResponse<OrderResponse>> getById(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId,
            @PathVariable UUID orderId) {

        return ResponseEntity.ok(ApiResponse.ok(
                orderService.getById(orderId, storeId, currentUser.getId())));
    }

    @PatchMapping("/{orderId}/status")
    @Operation(summary = "Update order status (e.g. PAID → PROCESSING)")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId,
            @PathVariable UUID orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request) {

        OrderResponse order = orderService.updateStatus(
                orderId, storeId, currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok(
                "Order status updated to " + request.status().name().toLowerCase() + ".", order));
    }

    @PostMapping("/{orderId}/ship")
    @Operation(summary = "Mark an order as shipped and record tracking details")
    public ResponseEntity<ApiResponse<OrderResponse>> shipOrder(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId,
            @PathVariable UUID orderId,
            @Valid @RequestBody ShipOrderRequest request) {

        OrderResponse order = orderService.shipOrder(
                orderId, storeId, currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Order marked as shipped.", order));
    }

    @PostMapping("/{orderId}/deliver")
    @Operation(summary = "Mark an order as delivered")
    public ResponseEntity<ApiResponse<OrderResponse>> markDelivered(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId,
            @PathVariable UUID orderId) {

        OrderResponse order = orderService.markDelivered(
                orderId, storeId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("Order marked as delivered.", order));
    }

    @PostMapping("/{orderId}/cancel")
    @Operation(summary = "Cancel an order (restores inventory automatically)")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId,
            @PathVariable UUID orderId,
            @RequestParam(required = false, defaultValue = "") String reason) {

        OrderResponse order = orderService.cancelOrder(
                orderId, storeId, currentUser.getId(), reason);
        return ResponseEntity.ok(ApiResponse.ok("Order cancelled.", order));
    }

    @PostMapping("/{orderId}/refund")
    @Operation(summary = "Issue a full or partial refund")
    public ResponseEntity<ApiResponse<OrderResponse>> refundOrder(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId,
            @PathVariable UUID orderId,
            @Valid @RequestBody RefundRequest request) {

        OrderResponse order = orderService.refundOrder(
                orderId, storeId, currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Refund issued.", order));
    }

    @PostMapping("/{orderId}/notes")
    @Operation(summary = "Add a note to the order timeline")
    public ResponseEntity<ApiResponse<OrderResponse>> addNote(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId,
            @PathVariable UUID orderId,
            @Valid @RequestBody AddOrderNoteRequest request) {

        String authorName = currentUser.getFirstName() + " " + currentUser.getLastName();
        OrderResponse order = orderService.addNote(
                orderId, storeId, currentUser.getId(), request, authorName);
        return ResponseEntity.ok(ApiResponse.ok("Note added.", order));
    }
}
