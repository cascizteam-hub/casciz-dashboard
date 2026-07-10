package com.casciz.commerceos.domain.product.repository;

import com.casciz.commerceos.domain.product.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, UUID> {

    List<ProductVariant> findByProductIdOrderBySortOrderAsc(UUID productId);

    Optional<ProductVariant> findByIdAndProductId(UUID variantId, UUID productId);

    boolean existsBySku(String sku);

    /** Adjust stock for a variant by a delta (positive = add, negative = subtract). */
    @Modifying
    @Query("""
        UPDATE ProductVariant v
        SET v.inventoryQuantity = v.inventoryQuantity + :delta
        WHERE v.id = :variantId AND v.inventoryQuantity IS NOT NULL
        """)
    int adjustStock(@Param("variantId") UUID variantId, @Param("delta") int delta);
}
