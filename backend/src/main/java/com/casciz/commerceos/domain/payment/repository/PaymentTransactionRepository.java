package com.casciz.commerceos.domain.payment.repository;

import com.casciz.commerceos.domain.payment.entity.PaymentTransaction;
import com.casciz.commerceos.domain.payment.valueobject.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, UUID> {

    List<PaymentTransaction> findByCheckoutIdOrderByCreatedAtDesc(UUID checkoutId);

    Optional<PaymentTransaction> findByProviderReference(String providerReference);

    Optional<PaymentTransaction> findByPaymentIntentId(String paymentIntentId);

    boolean existsByCheckoutIdAndStatus(UUID checkoutId, PaymentStatus status);
}
