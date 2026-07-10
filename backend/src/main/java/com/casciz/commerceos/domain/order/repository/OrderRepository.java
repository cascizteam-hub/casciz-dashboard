package com.casciz.commerceos.domain.order.repository;

import com.casciz.commerceos.domain.order.entity.Order;
import com.casciz.commerceos.domain.order.valueobject.FulfilmentStatus;
import com.casciz.commerceos.domain.order.valueobject.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {

    Page<Order> findByStoreIdOrderByCreatedAtDesc(UUID storeId, Pageable pageable);

    Page<Order> findByStoreIdAndStatusOrderByCreatedAtDesc(
            UUID storeId, OrderStatus status, Pageable pageable);

    Page<Order> findByStoreIdAndFulfilmentStatusOrderByCreatedAtDesc(
            UUID storeId, FulfilmentStatus fulfilmentStatus, Pageable pageable);

    Optional<Order> findByIdAndStoreId(UUID id, UUID storeId);

    Optional<Order> findByOrderNumber(String orderNumber);

    Optional<Order> findByCheckoutId(UUID checkoutId);

    boolean existsByCheckoutId(UUID checkoutId);

    long countByStoreIdAndStatus(UUID storeId, OrderStatus status);

    long countByStoreIdAndFulfilmentStatus(UUID storeId, FulfilmentStatus status);

    @Query("""
        SELECT SUM(o.totalAmount) FROM Order o
        WHERE o.store.id = :storeId
          AND o.status = 'PAID' OR o.status = 'PROCESSING'
          OR o.status = 'SHIPPED' OR o.status = 'DELIVERED'
          AND o.createdAt >= :since
        """)
    BigDecimal sumRevenueSince(@Param("storeId") UUID storeId, @Param("since") Instant since);

    @Query("""
        SELECT o FROM Order o
        WHERE o.store.id = :storeId
          AND (LOWER(o.customerEmail) LIKE LOWER(CONCAT('%',:q,'%'))
            OR LOWER(o.customerFirstName) LIKE LOWER(CONCAT('%',:q,'%'))
            OR LOWER(o.customerLastName) LIKE LOWER(CONCAT('%',:q,'%'))
            OR LOWER(o.orderNumber) LIKE LOWER(CONCAT('%',:q,'%')))
        ORDER BY o.createdAt DESC
        """)
    Page<Order> searchByStore(
            @Param("storeId") UUID storeId,
            @Param("q") String query,
            Pageable pageable);

    /** Fetch the next value from the store's order number sequence. */
    @Query(value = """
        SELECT NEXTVAL('order_number_seq')
        """, nativeQuery = true)
    long nextOrderSequence();
}
