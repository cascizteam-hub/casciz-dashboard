package com.casciz.commerceos.domain.store.repository;

import com.casciz.commerceos.domain.store.entity.Store;
import com.casciz.commerceos.domain.store.valueobject.StoreStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

/**
 * Data access port for the Store aggregate.
 */
public interface StoreRepository extends JpaRepository<Store, UUID> {

    /** Returns all stores owned by the given user, newest first. */
    Page<Store> findByOwnerIdOrderByCreatedAtDesc(UUID ownerId, Pageable pageable);

    /** Returns a single store only if it is owned by the given user. */
    Optional<Store> findByIdAndOwnerId(UUID id, UUID ownerId);

    Optional<Store> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsByCustomDomain(String customDomain);

    /** Returns the count of stores with the given status for a user. */
    long countByOwnerIdAndStatus(UUID ownerId, StoreStatus status);

    /** Lightweight check – does this user own the store? */
    boolean existsByIdAndOwnerId(UUID id, UUID ownerId);

    /** Full-text search on name and description for a given owner. */
    @Query("""
            SELECT s FROM Store s
            WHERE s.owner.id = :ownerId
              AND (LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%'))
                OR LOWER(s.description) LIKE LOWER(CONCAT('%', :query, '%')))
            ORDER BY s.createdAt DESC
            """)
    Page<Store> searchByOwner(
            @Param("ownerId") UUID ownerId,
            @Param("query") String query,
            Pageable pageable);
}
