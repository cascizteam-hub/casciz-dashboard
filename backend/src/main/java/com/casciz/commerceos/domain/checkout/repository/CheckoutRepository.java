package com.casciz.commerceos.domain.checkout.repository;

import com.casciz.commerceos.domain.checkout.entity.Checkout;
import com.casciz.commerceos.domain.checkout.valueobject.CheckoutStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface CheckoutRepository extends JpaRepository<Checkout, UUID> {

    Optional<Checkout> findBySessionToken(String sessionToken);

    Optional<Checkout> findByIdAndStoreId(UUID id, UUID storeId);

    Page<Checkout> findByStoreIdOrderByCreatedAtDesc(UUID storeId, Pageable pageable);

    Page<Checkout> findByStoreIdAndStatusOrderByCreatedAtDesc(
            UUID storeId, CheckoutStatus status, Pageable pageable);

    Optional<Checkout> findByPaymentIntentId(String paymentIntentId);

    long countByStoreIdAndStatus(UUID storeId, CheckoutStatus status);

    /** Expire open checkouts that have passed their expiry time. */
    @Modifying
    @Query("""
        UPDATE Checkout c SET c.status = 'ABANDONED'
        WHERE c.status = 'OPEN' AND c.expiresAt < :now
        """)
    int expireOpenCheckouts(@Param("now") Instant now);
}
