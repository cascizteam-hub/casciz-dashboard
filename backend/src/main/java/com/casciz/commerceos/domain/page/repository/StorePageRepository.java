package com.casciz.commerceos.domain.page.repository;

import com.casciz.commerceos.domain.page.entity.StorePage;
import com.casciz.commerceos.domain.page.valueobject.PageStatus;
import com.casciz.commerceos.domain.page.valueobject.PageType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Data access port for the StorePage aggregate.
 */
public interface StorePageRepository extends JpaRepository<StorePage, UUID> {

    List<StorePage> findByStoreIdOrderBySortOrderAsc(UUID storeId);

    Optional<StorePage> findByIdAndStoreId(UUID pageId, UUID storeId);

    Optional<StorePage> findByStoreIdAndSlug(UUID storeId, String slug);

    Optional<StorePage> findByStoreIdAndType(UUID storeId, PageType type);

    boolean existsByStoreIdAndSlug(UUID storeId, String slug);

    boolean existsByStoreIdAndType(UUID storeId, PageType type);

    long countByStoreId(UUID storeId);

    List<StorePage> findByStoreIdAndStatusOrderBySortOrderAsc(UUID storeId, PageStatus status);

    /** Shift sortOrder of all pages in a store down by 1 from a given position. */
    @Modifying
    @Query("""
            UPDATE StorePage p SET p.sortOrder = p.sortOrder + 1
            WHERE p.store.id = :storeId AND p.sortOrder >= :fromOrder
            """)
    void shiftSortOrderUp(@Param("storeId") UUID storeId, @Param("fromOrder") int fromOrder);
}
