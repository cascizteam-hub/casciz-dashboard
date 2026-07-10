package com.casciz.commerceos.application.product.usecase;

import com.casciz.commerceos.application.product.dto.ProductDtos.*;
import com.casciz.commerceos.application.store.usecase.SlugGenerator;
import com.casciz.commerceos.domain.product.entity.ProductCategory;
import com.casciz.commerceos.domain.product.repository.ProductCategoryRepository;
import com.casciz.commerceos.domain.product.repository.ProductRepository;
import com.casciz.commerceos.domain.store.entity.Store;
import com.casciz.commerceos.domain.store.repository.StoreRepository;
import com.casciz.commerceos.shared.exception.CascizException;
import com.casciz.commerceos.shared.exception.DomainExceptions.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;

/**
 * Category management use-cases.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {

    private final ProductCategoryRepository categoryRepository;
    private final ProductRepository         productRepository;
    private final StoreRepository           storeRepository;
    private final ProductMapper             mapper;

    @Transactional(readOnly = true)
    public List<CategoryResponse> listByStore(UUID storeId, UUID ownerId) {
        loadOwnedStore(storeId, ownerId);
        return categoryRepository.findByStoreIdOrderBySortOrderAsc(storeId).stream()
                .map(cat -> mapper.toCategoryResponse(cat,
                        productRepository.countByStoreIdAndStatus(storeId,
                                com.casciz.commerceos.domain.product.valueobject.ProductStatus.ACTIVE)))
                .toList();
    }

    public CategoryResponse create(UUID storeId, UUID ownerId, CreateCategoryRequest req) {
        Store store = loadOwnedStore(storeId, ownerId);

        String slug = StringUtils.hasText(req.slug())
                ? req.slug()
                : SlugGenerator.toSlug(req.name());

        if (categoryRepository.existsBySlugAndStoreId(slug, storeId)) {
            throw new CascizException("Category slug '" + slug + "' is already used in this store.",
                    HttpStatus.CONFLICT);
        }

        int order = (int) categoryRepository.countByStoreId(storeId);
        ProductCategory cat = ProductCategory.builder()
                .store(store)
                .name(req.name())
                .slug(slug)
                .description(req.description())
                .imageUrl(req.imageUrl())
                .sortOrder(order)
                .build();

        ProductCategory saved = categoryRepository.save(cat);
        log.info("Category created: id={}, store={}", saved.getId(), storeId);
        return mapper.toCategoryResponse(saved, 0);
    }

    public CategoryResponse update(UUID categoryId, UUID storeId, UUID ownerId,
                                    UpdateCategoryRequest req) {
        loadOwnedStore(storeId, ownerId);
        ProductCategory cat = loadCategory(categoryId, storeId);
        cat.setName(req.name());
        cat.setDescription(req.description());
        cat.setImageUrl(req.imageUrl());
        ProductCategory saved = categoryRepository.save(cat);
        long count = productRepository.countByStoreIdAndStatus(storeId,
                com.casciz.commerceos.domain.product.valueobject.ProductStatus.ACTIVE);
        return mapper.toCategoryResponse(saved, count);
    }

    public void delete(UUID categoryId, UUID storeId, UUID ownerId) {
        loadOwnedStore(storeId, ownerId);
        ProductCategory cat = loadCategory(categoryId, storeId);
        // Unlink products from this category before deleting
        cat.getProducts().forEach(p -> p.setCategory(null));
        categoryRepository.delete(cat);
        log.info("Category deleted: id={}, store={}", categoryId, storeId);
    }

    private Store loadOwnedStore(UUID storeId, UUID ownerId) {
        return storeRepository.findByIdAndOwnerId(storeId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeId));
    }

    private ProductCategory loadCategory(UUID categoryId, UUID storeId) {
        return categoryRepository.findByIdAndStoreId(categoryId, storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", categoryId));
    }
}
