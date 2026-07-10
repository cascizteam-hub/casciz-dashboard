package com.casciz.commerceos.application.product.usecase;

import com.casciz.commerceos.application.product.dto.ProductDtos.*;
import com.casciz.commerceos.domain.product.entity.Product;
import com.casciz.commerceos.domain.product.entity.ProductCategory;
import com.casciz.commerceos.domain.product.entity.ProductImage;
import com.casciz.commerceos.domain.product.entity.ProductVariant;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Maps product domain entities to response DTOs.
 */
@Component
public class ProductMapper {

    public ProductResponse toResponse(Product p) {
        return new ProductResponse(
                p.getId(),
                p.getStore().getId(),
                p.getName(),
                p.getSlug(),
                p.getDescription(),
                p.getShortDescription(),
                p.getStatus(),
                p.getCategory() != null ? p.getCategory().getId()   : null,
                p.getCategory() != null ? p.getCategory().getName() : null,
                p.getTags(),
                p.getMetaTitle(),
                p.getMetaDescription(),
                p.isDigital(),
                p.getVariants().stream().map(this::toVariantResponse).toList(),
                p.getImages().stream().map(this::toImageResponse).toList(),
                p.getMinPrice(),
                p.getThumbnailUrl(),
                p.isInStock(),
                p.getTotalInventory(),
                p.getCreatedAt(),
                p.getUpdatedAt()
        );
    }

    public ProductSummary toSummary(Product p) {
        return new ProductSummary(
                p.getId(),
                p.getName(),
                p.getSlug(),
                p.getStatus(),
                p.getThumbnailUrl(),
                p.getMinPrice(),
                p.isInStock(),
                p.getTotalInventory(),
                p.getCategory() != null ? p.getCategory().getName() : null,
                p.getVariants().size(),
                p.getCreatedAt()
        );
    }

    public VariantResponse toVariantResponse(ProductVariant v) {
        return new VariantResponse(
                v.getId(),
                v.getTitle(),
                v.getSku(),
                v.getPrice(),
                v.getCompareAtPrice(),
                v.getCostPrice(),
                v.getInventoryQuantity(),
                v.isAllowBackorder(),
                v.getWeightGrams(),
                v.isInStock(),
                v.hasDiscount(),
                v.getSortOrder()
        );
    }

    public ProductImageResponse toImageResponse(ProductImage img) {
        return new ProductImageResponse(
                img.getId(),
                img.getUrl(),
                img.getAltText(),
                img.getSortOrder()
        );
    }

    public CategoryResponse toCategoryResponse(ProductCategory cat, long productCount) {
        return new CategoryResponse(
                cat.getId(),
                cat.getStore().getId(),
                cat.getName(),
                cat.getSlug(),
                cat.getDescription(),
                cat.getImageUrl(),
                cat.getSortOrder(),
                productCount,
                cat.getCreatedAt()
        );
    }
}
