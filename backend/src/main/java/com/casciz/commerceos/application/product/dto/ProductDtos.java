package com.casciz.commerceos.application.product.dto;

import com.casciz.commerceos.domain.product.valueobject.ProductStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * All product catalogue request and response DTOs.
 */
public final class ProductDtos {

    private ProductDtos() {}

    // ── Category DTOs ─────────────────────────────────────────────────────

    public record CreateCategoryRequest(
            @NotBlank(message = "Category name is required")
            @Size(max = 120)
            String name,

            @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$|^$",
                     message = "Slug must be lowercase letters, numbers, and hyphens")
            @Size(max = 80)
            String slug,

            @Size(max = 500)
            String description,

            @Size(max = 512)
            String imageUrl
    ) {}

    public record UpdateCategoryRequest(
            @NotBlank(message = "Category name is required")
            @Size(max = 120)
            String name,

            @Size(max = 500)
            String description,

            @Size(max = 512)
            String imageUrl
    ) {}

    public record CategoryResponse(
            UUID    id,
            UUID    storeId,
            String  name,
            String  slug,
            String  description,
            String  imageUrl,
            int     sortOrder,
            long    productCount,
            Instant createdAt
    ) {}

    // ── Variant DTOs ──────────────────────────────────────────────────────

    public record VariantRequest(
            @NotBlank(message = "Variant title is required")
            @Size(max = 255)
            String title,

            @Size(max = 100)
            String sku,

            @NotNull(message = "Price is required")
            @DecimalMin(value = "0.00", message = "Price must be 0 or greater")
            @Digits(integer = 17, fraction = 2)
            BigDecimal price,

            @DecimalMin(value = "0.00")
            @Digits(integer = 17, fraction = 2)
            BigDecimal compareAtPrice,

            @DecimalMin(value = "0.00")
            @Digits(integer = 17, fraction = 2)
            BigDecimal costPrice,

            Integer inventoryQuantity,

            boolean allowBackorder,

            @Min(0)
            Integer weightGrams
    ) {}

    public record VariantResponse(
            UUID       id,
            String     title,
            String     sku,
            BigDecimal price,
            BigDecimal compareAtPrice,
            BigDecimal costPrice,
            Integer    inventoryQuantity,
            boolean    allowBackorder,
            Integer    weightGrams,
            boolean    inStock,
            boolean    hasDiscount,
            int        sortOrder
    ) {}

    public record AdjustStockRequest(
            @NotNull UUID variantId,
            @NotNull int delta  // positive = add, negative = remove
    ) {}

    // ── Image DTOs ────────────────────────────────────────────────────────

    public record ProductImageRequest(
            @NotBlank @Size(max = 512)
            String url,

            @Size(max = 255)
            String altText
    ) {}

    public record ProductImageResponse(
            UUID   id,
            String url,
            String altText,
            int    sortOrder
    ) {}

    // ── Product DTOs ──────────────────────────────────────────────────────

    public record CreateProductRequest(

            @NotBlank(message = "Product name is required")
            @Size(min = 1, max = 255, message = "Name must be 255 characters or fewer")
            String name,

            @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$|^$",
                     message = "Slug must be lowercase letters, numbers, and hyphens")
            @Size(max = 120)
            String slug,

            String description,

            @Size(max = 500)
            String shortDescription,

            UUID categoryId,

            @Size(max = 500)
            String tags,

            @Size(max = 150)
            String metaTitle,

            @Size(max = 300)
            String metaDescription,

            boolean digital,

            @NotNull(message = "At least one variant is required")
            @Size(min = 1, message = "At least one variant is required")
            @Valid
            List<VariantRequest> variants,

            List<ProductImageRequest> images
    ) {}

    public record UpdateProductRequest(

            @NotBlank(message = "Product name is required")
            @Size(max = 255)
            String name,

            String description,

            @Size(max = 500)
            String shortDescription,

            UUID categoryId,

            @Size(max = 500)
            String tags,

            @Size(max = 150)
            String metaTitle,

            @Size(max = 300)
            String metaDescription,

            boolean digital,

            List<ProductImageRequest> images
    ) {}

    public record UpdateProductStatusRequest(
            @NotNull(message = "Status is required")
            ProductStatus status
    ) {}

    /** Full product response including variants and images. */
    public record ProductResponse(
            UUID                     id,
            UUID                     storeId,
            String                   name,
            String                   slug,
            String                   description,
            String                   shortDescription,
            ProductStatus            status,
            UUID                     categoryId,
            String                   categoryName,
            String                   tags,
            String                   metaTitle,
            String                   metaDescription,
            boolean                  digital,
            List<VariantResponse>    variants,
            List<ProductImageResponse> images,
            BigDecimal               minPrice,
            String                   thumbnailUrl,
            boolean                  inStock,
            int                      totalInventory,
            Instant                  createdAt,
            Instant                  updatedAt
    ) {}

    /** Lightweight summary for list views. */
    public record ProductSummary(
            UUID          id,
            String        name,
            String        slug,
            ProductStatus status,
            String        thumbnailUrl,
            BigDecimal    minPrice,
            boolean       inStock,
            int           totalInventory,
            String        categoryName,
            int           variantCount,
            Instant       createdAt
    ) {}

    /** Aggregate stats for dashboard. */
    public record ProductStatsResponse(
            long totalProducts,
            long activeProducts,
            long draftProducts,
            long archivedProducts,
            long outOfStockProducts,
            long totalCategories
    ) {}
}
