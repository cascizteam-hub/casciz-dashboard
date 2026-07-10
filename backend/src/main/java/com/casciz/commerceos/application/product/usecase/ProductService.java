package com.casciz.commerceos.application.product.usecase;

import com.casciz.commerceos.application.product.dto.ProductDtos.*;
import com.casciz.commerceos.application.store.usecase.SlugGenerator;
import com.casciz.commerceos.domain.product.entity.Product;
import com.casciz.commerceos.domain.product.entity.ProductCategory;
import com.casciz.commerceos.domain.product.entity.ProductImage;
import com.casciz.commerceos.domain.product.entity.ProductVariant;
import com.casciz.commerceos.domain.product.repository.ProductCategoryRepository;
import com.casciz.commerceos.domain.product.repository.ProductRepository;
import com.casciz.commerceos.domain.product.repository.ProductVariantRepository;
import com.casciz.commerceos.domain.product.valueobject.ProductStatus;
import com.casciz.commerceos.domain.store.entity.Store;
import com.casciz.commerceos.domain.store.repository.StoreRepository;
import com.casciz.commerceos.shared.exception.CascizException;
import com.casciz.commerceos.shared.exception.DomainExceptions.*;
import com.casciz.commerceos.shared.response.PagedResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Full product catalogue and inventory use-cases.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {

    private final ProductRepository         productRepository;
    private final ProductCategoryRepository categoryRepository;
    private final ProductVariantRepository  variantRepository;
    private final StoreRepository           storeRepository;
    private final ProductMapper             mapper;

    // ── Create ────────────────────────────────────────────────────────────

    public ProductResponse create(UUID storeId, UUID ownerId, CreateProductRequest req) {
        Store store = loadOwnedStore(storeId, ownerId);

        String slug = resolveSlug(req.slug(), req.name(), storeId);

        ProductCategory category = req.categoryId() != null
                ? categoryRepository.findByIdAndStoreId(req.categoryId(), storeId)
                        .orElseThrow(() -> new ResourceNotFoundException("Category", req.categoryId()))
                : null;

        Product product = Product.builder()
                .store(store)
                .name(req.name())
                .slug(slug)
                .description(req.description())
                .shortDescription(req.shortDescription())
                .status(ProductStatus.DRAFT)
                .category(category)
                .tags(req.tags())
                .metaTitle(req.metaTitle())
                .metaDescription(req.metaDescription())
                .digital(req.digital())
                .build();

        // Attach variants
        AtomicInteger order = new AtomicInteger(0);
        List<ProductVariant> variants = req.variants().stream().map(vr -> {
            validateSkuUniqueness(vr.sku(), null);
            return ProductVariant.builder()
                    .product(product)
                    .title(vr.title())
                    .sku(vr.sku())
                    .price(vr.price())
                    .compareAtPrice(vr.compareAtPrice())
                    .costPrice(vr.costPrice())
                    .inventoryQuantity(vr.inventoryQuantity())
                    .allowBackorder(vr.allowBackorder())
                    .weightGrams(vr.weightGrams())
                    .sortOrder(order.getAndIncrement())
                    .build();
        }).toList();
        product.getVariants().addAll(variants);

        // Attach images
        if (req.images() != null) {
            AtomicInteger imgOrder = new AtomicInteger(0);
            req.images().forEach(ir -> product.getImages().add(ProductImage.builder()
                    .product(product)
                    .url(ir.url())
                    .altText(ir.altText())
                    .sortOrder(imgOrder.getAndIncrement())
                    .build()));
        }

        Product saved = productRepository.save(product);
        log.info("Product created: id={}, store={}", saved.getId(), storeId);
        return mapper.toResponse(saved);
    }

    // ── List ──────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PagedResponse<ProductSummary> list(UUID storeId, UUID ownerId,
                                              String query, ProductStatus status,
                                              UUID categoryId, Pageable pageable) {
        loadOwnedStore(storeId, ownerId);

        Page<Product> page;
        if (StringUtils.hasText(query)) {
            page = productRepository.searchByStore(storeId, query, pageable);
        } else if (categoryId != null) {
            page = productRepository.findByStoreIdAndCategoryIdOrderByCreatedAtDesc(
                    storeId, categoryId, pageable);
        } else if (status != null) {
            page = productRepository.findByStoreIdAndStatusOrderByCreatedAtDesc(
                    storeId, status, pageable);
        } else {
            page = productRepository.findByStoreIdOrderByCreatedAtDesc(storeId, pageable);
        }

        return PagedResponse.from(page.map(mapper::toSummary));
    }

    // ── Get one ───────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public ProductResponse getById(UUID productId, UUID storeId, UUID ownerId) {
        loadOwnedStore(storeId, ownerId);
        return mapper.toResponse(loadProduct(productId, storeId));
    }

    // ── Update ────────────────────────────────────────────────────────────

    public ProductResponse update(UUID productId, UUID storeId, UUID ownerId,
                                  UpdateProductRequest req) {
        loadOwnedStore(storeId, ownerId);
        Product product = loadProduct(productId, storeId);

        ProductCategory category = req.categoryId() != null
                ? categoryRepository.findByIdAndStoreId(req.categoryId(), storeId)
                        .orElseThrow(() -> new ResourceNotFoundException("Category", req.categoryId()))
                : null;

        product.setName(req.name());
        product.setDescription(req.description());
        product.setShortDescription(req.shortDescription());
        product.setCategory(category);
        product.setTags(req.tags());
        product.setMetaTitle(req.metaTitle());
        product.setMetaDescription(req.metaDescription());
        product.setDigital(req.digital());

        // Replace images
        if (req.images() != null) {
            product.getImages().clear();
            AtomicInteger imgOrder = new AtomicInteger(0);
            req.images().forEach(ir -> product.getImages().add(ProductImage.builder()
                    .product(product)
                    .url(ir.url())
                    .altText(ir.altText())
                    .sortOrder(imgOrder.getAndIncrement())
                    .build()));
        }

        Product saved = productRepository.save(product);
        log.info("Product updated: id={}, store={}", productId, storeId);
        return mapper.toResponse(saved);
    }

    // ── Status ────────────────────────────────────────────────────────────

    public ProductResponse updateStatus(UUID productId, UUID storeId, UUID ownerId,
                                        ProductStatus newStatus) {
        loadOwnedStore(storeId, ownerId);
        Product product = loadProduct(productId, storeId);

        switch (newStatus) {
            case ACTIVE   -> product.publish();
            case ARCHIVED -> product.archive();
            case DRAFT    -> product.setStatus(ProductStatus.DRAFT);
        }

        Product saved = productRepository.save(product);
        log.info("Product status updated: id={}, status={}, store={}", productId, newStatus, storeId);
        return mapper.toResponse(saved);
    }

    // ── Variants ──────────────────────────────────────────────────────────

    public ProductResponse addVariant(UUID productId, UUID storeId, UUID ownerId,
                                      VariantRequest req) {
        loadOwnedStore(storeId, ownerId);
        Product product = loadProduct(productId, storeId);
        validateSkuUniqueness(req.sku(), null);

        ProductVariant variant = ProductVariant.builder()
                .product(product)
                .title(req.title())
                .sku(req.sku())
                .price(req.price())
                .compareAtPrice(req.compareAtPrice())
                .costPrice(req.costPrice())
                .inventoryQuantity(req.inventoryQuantity())
                .allowBackorder(req.allowBackorder())
                .weightGrams(req.weightGrams())
                .sortOrder(product.getVariants().size())
                .build();

        product.getVariants().add(variant);
        return mapper.toResponse(productRepository.save(product));
    }

    public ProductResponse updateVariant(UUID productId, UUID variantId, UUID storeId,
                                         UUID ownerId, VariantRequest req) {
        loadOwnedStore(storeId, ownerId);
        Product product = loadProduct(productId, storeId);

        ProductVariant variant = variantRepository.findByIdAndProductId(variantId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Variant", variantId));

        // SKU uniqueness: only check if SKU changed
        if (!variant.getSku().equals(req.sku())) {
            validateSkuUniqueness(req.sku(), variantId);
        }

        variant.setTitle(req.title());
        variant.setSku(req.sku());
        variant.setPrice(req.price());
        variant.setCompareAtPrice(req.compareAtPrice());
        variant.setCostPrice(req.costPrice());
        variant.setInventoryQuantity(req.inventoryQuantity());
        variant.setAllowBackorder(req.allowBackorder());
        variant.setWeightGrams(req.weightGrams());

        return mapper.toResponse(productRepository.save(product));
    }

    public ProductResponse deleteVariant(UUID productId, UUID variantId, UUID storeId,
                                         UUID ownerId) {
        loadOwnedStore(storeId, ownerId);
        Product product = loadProduct(productId, storeId);

        if (product.getVariants().size() <= 1) {
            throw new CascizException("A product must have at least one variant.",
                    HttpStatus.CONFLICT);
        }

        product.getVariants().removeIf(v -> v.getId().equals(variantId));
        return mapper.toResponse(productRepository.save(product));
    }

    // ── Inventory adjustment ──────────────────────────────────────────────

    public void adjustStock(UUID productId, UUID storeId, UUID ownerId,
                            AdjustStockRequest req) {
        loadOwnedStore(storeId, ownerId);
        loadProduct(productId, storeId); // ownership check

        int updated = variantRepository.adjustStock(req.variantId(), req.delta());
        if (updated == 0) {
            throw new ResourceNotFoundException("Variant", req.variantId());
        }
        log.info("Stock adjusted: variantId={}, delta={}, store={}", req.variantId(), req.delta(), storeId);
    }

    // ── Delete ────────────────────────────────────────────────────────────

    public void delete(UUID productId, UUID storeId, UUID ownerId) {
        loadOwnedStore(storeId, ownerId);
        Product product = loadProduct(productId, storeId);

        if (product.getStatus() == ProductStatus.ACTIVE) {
            throw new CascizException(
                    "Active products cannot be deleted. Archive the product first.",
                    HttpStatus.CONFLICT);
        }

        productRepository.delete(product);
        log.info("Product deleted: id={}, store={}", productId, storeId);
    }

    // ── Stats ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public ProductStatsResponse getStats(UUID storeId, UUID ownerId) {
        loadOwnedStore(storeId, ownerId);

        long active   = productRepository.countByStoreIdAndStatus(storeId, ProductStatus.ACTIVE);
        long draft    = productRepository.countByStoreIdAndStatus(storeId, ProductStatus.DRAFT);
        long archived = productRepository.countByStoreIdAndStatus(storeId, ProductStatus.ARCHIVED);
        long categories = categoryRepository.countByStoreId(storeId);

        // Count products with all variants out of stock
        long outOfStock = productRepository.findByStoreIdAndStatusOrderByCreatedAtDesc(
                        storeId, ProductStatus.ACTIVE, Pageable.unpaged())
                .stream()
                .filter(p -> !p.isInStock())
                .count();

        return new ProductStatsResponse(active + draft + archived, active, draft, archived,
                outOfStock, categories);
    }

    // ── Private helpers ───────────────────────────────────────────────────

    private Store loadOwnedStore(UUID storeId, UUID ownerId) {
        return storeRepository.findByIdAndOwnerId(storeId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeId));
    }

    private Product loadProduct(UUID productId, UUID storeId) {
        return productRepository.findByIdAndStoreId(productId, storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));
    }

    private String resolveSlug(String requested, String name, UUID storeId) {
        String base = StringUtils.hasText(requested)
                ? requested
                : SlugGenerator.toSlug(name);

        if (!productRepository.existsBySlugAndStoreId(base, storeId)) return base;

        for (int i = 2; i <= 100; i++) {
            String candidate = base + "-" + i;
            if (!productRepository.existsBySlugAndStoreId(candidate, storeId)) return candidate;
        }
        throw new CascizException("Could not generate a unique slug.", HttpStatus.CONFLICT);
    }

    private void validateSkuUniqueness(String sku, UUID excludeVariantId) {
        if (!StringUtils.hasText(sku)) return;
        if (variantRepository.existsBySku(sku)) {
            throw new CascizException("SKU '" + sku + "' is already in use.", HttpStatus.CONFLICT);
        }
    }
}
