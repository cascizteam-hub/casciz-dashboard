package com.casciz.commerceos.domain.product.repository;

import com.casciz.commerceos.domain.product.entity.Product;
import com.casciz.commerceos.domain.product.valueobject.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {

    Page<Product> findByStoreIdOrderByCreatedAtDesc(UUID storeId, Pageable pageable);

    Page<Product> findByStoreIdAndStatusOrderByCreatedAtDesc(
            UUID storeId, ProductStatus status, Pageable pageable);

    Page<Product> findByStoreIdAndCategoryIdOrderByCreatedAtDesc(
            UUID storeId, UUID categoryId, Pageable pageable);

    Optional<Product> findByIdAndStoreId(UUID id, UUID storeId);

    Optional<Product> findBySlugAndStoreId(String slug, UUID storeId);

    boolean existsBySlugAndStoreId(String slug, UUID storeId);

    long countByStoreIdAndStatus(UUID storeId, ProductStatus status);

    @Query("""
        SELECT p FROM Product p
        WHERE p.store.id = :storeId
          AND (LOWER(p.name) LIKE LOWER(CONCAT('%',:q,'%'))
            OR LOWER(p.description) LIKE LOWER(CONCAT('%',:q,'%'))
            OR LOWER(p.tags) LIKE LOWER(CONCAT('%',:q,'%')))
        ORDER BY p.createdAt DESC
        """)
    Page<Product> searchByStore(
            @Param("storeId") UUID storeId,
            @Param("q") String query,
            Pageable pageable);
}
