package com.casciz.commerceos.application.payment.usecase;

import com.casciz.commerceos.application.checkout.dto.CheckoutDtos.*;
import com.casciz.commerceos.application.checkout.usecase.CheckoutMapper;
import com.casciz.commerceos.domain.payment.entity.StorePaymentSettings;
import com.casciz.commerceos.domain.payment.repository.StorePaymentSettingsRepository;
import com.casciz.commerceos.domain.payment.valueobject.PaymentProvider;
import com.casciz.commerceos.domain.store.entity.Store;
import com.casciz.commerceos.domain.store.repository.StoreRepository;
import com.casciz.commerceos.infrastructure.security.provider.EncryptionService;
import com.casciz.commerceos.shared.exception.DomainExceptions.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;

/**
 * Manages per-store payment gateway configuration.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PaymentSettingsService {

    private final StorePaymentSettingsRepository settingsRepository;
    private final StoreRepository                storeRepository;
    private final EncryptionService              encryptionService;
    private final CheckoutMapper                 mapper;

    @Transactional(readOnly = true)
    public List<PaymentSettingsResponse> listByStore(UUID storeId, UUID ownerId) {
        loadOwnedStore(storeId, ownerId);
        return settingsRepository.findByStoreIdAndEnabledTrue(storeId)
                .stream()
                .map(mapper::toSettingsResponse)
                .toList();
    }

    public PaymentSettingsResponse save(UUID storeId, UUID ownerId,
                                        SavePaymentSettingsRequest request) {
        Store store = loadOwnedStore(storeId, ownerId);

        StorePaymentSettings settings = settingsRepository
                .findByStoreIdAndProvider(storeId, request.provider())
                .orElseGet(() -> StorePaymentSettings.builder()
                        .store(store)
                        .provider(request.provider())
                        .build());

        settings.setEnabled(request.enabled());
        settings.setPublicKey(request.publicKey());
        settings.setLiveMode(request.liveMode());
        settings.setDisplayName(request.displayName());

        if (StringUtils.hasText(request.secretKey())) {
            settings.setSecretKeyEncrypted(encryptionService.encrypt(request.secretKey()));
        }
        if (StringUtils.hasText(request.webhookSecret())) {
            settings.setWebhookSecretEncrypted(encryptionService.encrypt(request.webhookSecret()));
        }

        StorePaymentSettings saved = settingsRepository.save(settings);
        log.info("Payment settings saved: store={}, provider={}", storeId, request.provider());
        return mapper.toSettingsResponse(saved);
    }

    public void disable(UUID storeId, UUID ownerId, PaymentProvider provider) {
        loadOwnedStore(storeId, ownerId);
        settingsRepository.findByStoreIdAndProvider(storeId, provider).ifPresent(s -> {
            s.setEnabled(false);
            settingsRepository.save(s);
        });
    }

    private Store loadOwnedStore(UUID storeId, UUID ownerId) {
        return storeRepository.findByIdAndOwnerId(storeId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeId));
    }
}
