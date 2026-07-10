package com.casciz.commerceos.presentation.store;

import com.casciz.commerceos.application.store.dto.StoreDtos.*;
import com.casciz.commerceos.application.store.usecase.StoreService;
import com.casciz.commerceos.domain.user.entity.User;
import com.casciz.commerceos.shared.constants.ApiPaths;
import com.casciz.commerceos.shared.response.ApiResponse;
import com.casciz.commerceos.shared.response.PagedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST controller for store CRUD and lifecycle operations.
 * All routes are scoped to the authenticated owner — a user can only
 * see and mutate their own stores.
 */
@RestController
@RequestMapping(ApiPaths.STORE_BASE)
@RequiredArgsConstructor
@Tag(name = "Stores", description = "Create and manage online stores")
@SecurityRequirement(name = "bearerAuth")
public class StoreController {

    private final StoreService storeService;

    // ── Create ────────────────────────────────────────────────────────────

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new store")
    public ResponseEntity<ApiResponse<StoreResponse>> create(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CreateStoreRequest request) {

        StoreResponse store = storeService.create(currentUser.getId(), request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Store created successfully.", store));
    }

    // ── List ──────────────────────────────────────────────────────────────

    @GetMapping
    @Operation(summary = "List all stores owned by the current user")
    public ResponseEntity<ApiResponse<PagedResponse<StoreSummary>>> list(
            @AuthenticationPrincipal User currentUser,

            @Parameter(description = "Search query (searches name and description)")
            @RequestParam(required = false) String q,

            @Parameter(description = "Page number (0-based)")
            @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(
                page, Math.min(size, 100),
                Sort.by(Sort.Direction.DESC, "createdAt"));

        PagedResponse<StoreSummary> result =
                storeService.listByOwner(currentUser.getId(), q, pageable);

        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    // ── Get one ───────────────────────────────────────────────────────────

    @GetMapping("/{storeId}")
    @Operation(summary = "Get a single store by ID")
    public ResponseEntity<ApiResponse<StoreResponse>> getById(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId) {

        StoreResponse store = storeService.getByIdForOwner(storeId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok(store));
    }

    // ── Update ────────────────────────────────────────────────────────────

    @PutMapping("/{storeId}")
    @Operation(summary = "Update store details")
    public ResponseEntity<ApiResponse<StoreResponse>> update(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId,
            @Valid @RequestBody UpdateStoreRequest request) {

        StoreResponse store = storeService.update(storeId, currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Store updated.", store));
    }

    // ── Status ────────────────────────────────────────────────────────────

    @PatchMapping("/{storeId}/status")
    @Operation(summary = "Publish, un-publish, or archive a store")
    public ResponseEntity<ApiResponse<StoreResponse>> updateStatus(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId,
            @Valid @RequestBody UpdateStoreStatusRequest request) {

        StoreResponse store =
                storeService.updateStatus(storeId, currentUser.getId(), request.status());
        return ResponseEntity.ok(ApiResponse.ok(
                "Store is now " + request.status().name().toLowerCase() + ".", store));
    }

    // ── Delete ────────────────────────────────────────────────────────────

    @DeleteMapping("/{storeId}")
    @Operation(summary = "Permanently delete a draft or archived store")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId) {

        storeService.delete(storeId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("Store deleted."));
    }

    // ── Stats ─────────────────────────────────────────────────────────────

    @GetMapping("/stats")
    @Operation(summary = "Aggregate store counts for the current user's dashboard")
    public ResponseEntity<ApiResponse<StoreStatsResponse>> getStats(
            @AuthenticationPrincipal User currentUser) {

        StoreStatsResponse stats = storeService.getStats(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    // ── Slug availability ─────────────────────────────────────────────────

    @GetMapping("/slug/check")
    @Operation(summary = "Check whether a slug is available")
    public ResponseEntity<ApiResponse<Boolean>> checkSlug(
            @RequestParam String slug) {

        boolean available = storeService.isSlugAvailable(slug);
        return ResponseEntity.ok(ApiResponse.ok(available));
    }
}
