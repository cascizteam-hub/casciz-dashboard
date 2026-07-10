package com.casciz.commerceos.presentation.product;

import com.casciz.commerceos.application.product.dto.ProductDtos.*;
import com.casciz.commerceos.application.product.usecase.CategoryService;
import com.casciz.commerceos.application.product.usecase.ProductService;
import com.casciz.commerceos.domain.product.valueobject.ProductStatus;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for product catalogue and inventory.
 * Routes nested under /api/v1/stores/{storeId}/products and /categories.
 */
@RestController
@RequestMapping("/api/v1/stores/{storeId}")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Product catalogue and inventory management")
@SecurityRequirement(name = "bearerAuth")
public class ProductController {

    private final ProductService  productService;
    private final CategoryService categoryService;

    // ── Categories ────────────────────────────────────────────────────────

    @GetMapping("/categories")
    @Operation(summary = "List all categories for a store")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> listCategories(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId) {
        return ResponseEntity.ok(ApiResponse.ok(
                categoryService.listByStore(storeId, currentUser.getId())));
    }

    @PostMapping("/categories")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a category")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId,
            @Valid @RequestBody CreateCategoryRequest request) {
        CategoryResponse cat = categoryService.create(storeId, currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Category created.", cat));
    }

    @PutMapping("/categories/{categoryId}")
    @Operation(summary = "Update a category")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId,
            @PathVariable UUID categoryId,
            @Valid @RequestBody UpdateCategoryRequest request) {
        CategoryResponse cat = categoryService.update(categoryId, storeId, currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Category updated.", cat));
    }

    @DeleteMapping("/categories/{categoryId}")
    @Operation(summary = "Delete a category (products are unlinked, not deleted)")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId,
            @PathVariable UUID categoryId) {
        categoryService.delete(categoryId, storeId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("Category deleted."));
    }

    // ── Products – CRUD ───────────────────────────────────────────────────

    @PostMapping("/products")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new product with variants and images")
    public ResponseEntity<ApiResponse<ProductResponse>> create(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId,
            @Valid @RequestBody CreateProductRequest request) {
        ProductResponse product = productService.create(storeId, currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Product created.", product));
    }

    @GetMapping("/products")
    @Operation(summary = "List products (paginated, searchable, filterable)")
    public ResponseEntity<ApiResponse<PagedResponse<ProductSummary>>> list(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) ProductStatus status,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "24") int size) {

        Pageable pageable = PageRequest.of(page, Math.min(size, 100),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        PagedResponse<ProductSummary> result =
                productService.list(storeId, currentUser.getId(), q, status, categoryId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/products/stats")
    @Operation(summary = "Aggregate product counts for the dashboard")
    public ResponseEntity<ApiResponse<ProductStatsResponse>> getStats(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId) {
        return ResponseEntity.ok(ApiResponse.ok(
                productService.getStats(storeId, currentUser.getId())));
    }

    @GetMapping("/products/{productId}")
    @Operation(summary = "Get a single product with full details")
    public ResponseEntity<ApiResponse<ProductResponse>> getById(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId,
            @PathVariable UUID productId) {
        return ResponseEntity.ok(ApiResponse.ok(
                productService.getById(productId, storeId, currentUser.getId())));
    }

    @PutMapping("/products/{productId}")
    @Operation(summary = "Update product details and images")
    public ResponseEntity<ApiResponse<ProductResponse>> update(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId,
            @PathVariable UUID productId,
            @Valid @RequestBody UpdateProductRequest request) {
        ProductResponse product = productService.update(productId, storeId, currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Product updated.", product));
    }

    @PatchMapping("/products/{productId}/status")
    @Operation(summary = "Change product status (DRAFT → ACTIVE → ARCHIVED)")
    public ResponseEntity<ApiResponse<ProductResponse>> updateStatus(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId,
            @PathVariable UUID productId,
            @Valid @RequestBody UpdateProductStatusRequest request) {
        ProductResponse product =
                productService.updateStatus(productId, storeId, currentUser.getId(), request.status());
        return ResponseEntity.ok(ApiResponse.ok(
                "Product is now " + request.status().name().toLowerCase() + ".", product));
    }

    @DeleteMapping("/products/{productId}")
    @Operation(summary = "Delete a draft or archived product")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId,
            @PathVariable UUID productId) {
        productService.delete(productId, storeId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("Product deleted."));
    }

    // ── Variants ──────────────────────────────────────────────────────────

    @PostMapping("/products/{productId}/variants")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Add a variant to an existing product")
    public ResponseEntity<ApiResponse<ProductResponse>> addVariant(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId,
            @PathVariable UUID productId,
            @Valid @RequestBody VariantRequest request) {
        ProductResponse product = productService.addVariant(productId, storeId, currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Variant added.", product));
    }

    @PutMapping("/products/{productId}/variants/{variantId}")
    @Operation(summary = "Update a specific variant")
    public ResponseEntity<ApiResponse<ProductResponse>> updateVariant(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId,
            @PathVariable UUID productId,
            @PathVariable UUID variantId,
            @Valid @RequestBody VariantRequest request) {
        ProductResponse product = productService.updateVariant(
                productId, variantId, storeId, currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Variant updated.", product));
    }

    @DeleteMapping("/products/{productId}/variants/{variantId}")
    @Operation(summary = "Remove a variant (product must keep at least one)")
    public ResponseEntity<ApiResponse<ProductResponse>> deleteVariant(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId,
            @PathVariable UUID productId,
            @PathVariable UUID variantId) {
        ProductResponse product = productService.deleteVariant(
                productId, variantId, storeId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("Variant removed.", product));
    }

    // ── Inventory ─────────────────────────────────────────────────────────

    @PostMapping("/products/{productId}/inventory/adjust")
    @Operation(summary = "Adjust stock for a variant (positive = add, negative = subtract)")
    public ResponseEntity<ApiResponse<Void>> adjustStock(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId,
            @PathVariable UUID productId,
            @Valid @RequestBody AdjustStockRequest request) {
        productService.adjustStock(productId, storeId, currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Stock adjusted."));
    }
}
