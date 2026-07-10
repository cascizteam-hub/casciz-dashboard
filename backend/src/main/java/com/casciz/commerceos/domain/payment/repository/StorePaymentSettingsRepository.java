package com.casciz.commerceos.domain.payment.repository;

import com.casciz.commerceos.domain.payment.entity.StorePaymentSettings;
import com.casciz.commerceos.domain.payment.valueobject.PaymentProvider;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StorePaymentSettingsRepository extends JpaRepository<StorePaymentSettings, UUID> {

    List<StorePaymentSettings> findByStoreIdAndEnabledTrue(UUID storeId);

    Optional<StorePaymentSettings> findByStoreIdAndProvider(UUID storeId, PaymentProvider provider);

    boolean existsByStoreIdAndProvider(UUID storeId, PaymentProvider provider);
}
