package com.casciz.commerceos.domain.product.repository;

import com.casciz.commerceos.domain.product.entity.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductCategoryRepository extends JpaRepository<ProductCategory, UUID> {

    List<ProductCategory> findByStoreIdOrderBySortOrderAsc(UUID storeId);

    Optional<ProductCategory> findByIdAndStoreId(UUID id, UUID storeId);

    boolean existsBySlugAndStoreId(String slug, UUID storeId);

    long countByStoreId(UUID storeId);
}
