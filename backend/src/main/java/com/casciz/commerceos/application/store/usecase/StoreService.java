package com.casciz.commerceos.application.store.usecase;

import com.casciz.commerceos.application.store.dto.StoreDtos.*;
import com.casciz.commerceos.domain.store.entity.Store;
import com.casciz.commerceos.domain.store.repository.StoreRepository;
import com.casciz.commerceos.domain.store.valueobject.StoreStatus;
import com.casciz.commerceos.domain.user.entity.User;
import com.casciz.commerceos.domain.user.repository.UserRepository;
import com.casciz.commerceos.shared.exception.DomainExceptions.*;
import com.casciz.commerceos.shared.response.PagedResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.UUID;

/**
 * All store management use-cases.
 * Enforces ownership — every operation verifies the requesting user owns the store.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class StoreService {

    private final StoreRepository storeRepository;
    private final UserRepository  userRepository;
    private final SlugGenerator   slugGenerator;
    private final StoreMapper     storeMapper;

    // ── Create ────────────────────────────────────────────────────────────

    public StoreResponse create(UUID ownerId, CreateStoreRequest request) {
        User owner = loadUser(ownerId);

        // Resolve slug
        String slug = StringUtils.hasText(request.slug())
                ? request.slug().toLowerCase()
                : slugGenerator.generate(request.name());

        if (storeRepository.existsBySlug(slug)) {
            throw new com.casciz.commerceos.shared.exception.CascizException(
                    "The slug '" + slug + "' is already taken. Please choose a different one.",
                    org.springframework.http.HttpStatus.CONFLICT
            );
        }

        Store store = Store.builder()
                .name(request.name())
                .slug(slug)
                .description(request.description())
                .currency(request.currency())
                .timezone(StringUtils.hasText(request.timezone()) ? request.timezone() : "UTC")
                .contactEmail(request.contactEmail())
                .contactPhone(request.contactPhone())
                .status(StoreStatus.DRAFT)
                .owner(owner)
                .build();

        Store saved = storeRepository.save(store);
        log.info("Store created: id={}, slug={}, owner={}", saved.getId(), saved.getSlug(), ownerId);
        return storeMapper.toResponse(saved);
    }

    // ── List ──────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PagedResponse<StoreSummary> listByOwner(UUID ownerId, String query, Pageable pageable) {
        Page<Store> page;
        if (StringUtils.hasText(query)) {
            page = storeRepository.searchByOwner(ownerId, query, pageable);
        } else {
            page = storeRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId, pageable);
        }
        return PagedResponse.from(page.map(storeMapper::toSummary));
    }

    // ── Get one ───────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public StoreResponse getByIdForOwner(UUID storeId, UUID ownerId) {
        return storeMapper.toResponse(loadOwnedStore(storeId, ownerId));
    }

    // ── Update ────────────────────────────────────────────────────────────

    public StoreResponse update(UUID storeId, UUID ownerId, UpdateStoreRequest request) {
        Store store = loadOwnedStore(storeId, ownerId);

        // Custom domain uniqueness check (excluding self)
        if (StringUtils.hasText(request.customDomain())) {
            boolean taken = storeRepository.existsByCustomDomain(request.customDomain());
            boolean isSelf = request.customDomain().equals(store.getCustomDomain());
            if (taken && !isSelf) {
                throw new com.casciz.commerceos.shared.exception.CascizException(
                        "The domain '" + request.customDomain() + "' is already in use.",
                        org.springframework.http.HttpStatus.CONFLICT
                );
            }
        }

        store.setName(request.name());
        store.setDescription(request.description());
        store.setLogoUrl(request.logoUrl());
        store.setFaviconUrl(request.faviconUrl());
        store.setCustomDomain(
                StringUtils.hasText(request.customDomain()) ? request.customDomain() : null);
        store.setCurrency(request.currency());
        store.setTimezone(request.timezone());
        store.setContactEmail(request.contactEmail());
        store.setContactPhone(request.contactPhone());

        Store saved = storeRepository.save(store);
        log.info("Store updated: id={}, owner={}", storeId, ownerId);
        return storeMapper.toResponse(saved);
    }

    // ── Status transition ─────────────────────────────────────────────────

    public StoreResponse updateStatus(UUID storeId, UUID ownerId, StoreStatus newStatus) {
        Store store = loadOwnedStore(storeId, ownerId);
        store.transitionTo(newStatus);
        Store saved = storeRepository.save(store);
        log.info("Store status changed: id={}, status={}, owner={}", storeId, newStatus, ownerId);
        return storeMapper.toResponse(saved);
    }

    // ── Delete ────────────────────────────────────────────────────────────

    public void delete(UUID storeId, UUID ownerId) {
        Store store = loadOwnedStore(storeId, ownerId);
        if (store.getStatus() == StoreStatus.PUBLISHED) {
            throw new com.casciz.commerceos.shared.exception.CascizException(
                    "A published store cannot be deleted. Archive it first.",
                    org.springframework.http.HttpStatus.CONFLICT
            );
        }
        storeRepository.delete(store);
        log.info("Store deleted: id={}, owner={}", storeId, ownerId);
    }

    // ── Stats ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public StoreStatsResponse getStats(UUID ownerId) {
        long total     = storeRepository.countByOwnerIdAndStatus(ownerId, StoreStatus.DRAFT)
                       + storeRepository.countByOwnerIdAndStatus(ownerId, StoreStatus.PUBLISHED)
                       + storeRepository.countByOwnerIdAndStatus(ownerId, StoreStatus.ARCHIVED);
        long published = storeRepository.countByOwnerIdAndStatus(ownerId, StoreStatus.PUBLISHED);
        long draft     = storeRepository.countByOwnerIdAndStatus(ownerId, StoreStatus.DRAFT);
        long archived  = storeRepository.countByOwnerIdAndStatus(ownerId, StoreStatus.ARCHIVED);
        return new StoreStatsResponse(total, published, draft, archived);
    }

    // ── Slug availability ─────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public boolean isSlugAvailable(String slug) {
        return !storeRepository.existsBySlug(slug.toLowerCase());
    }

    // ── Private helpers ───────────────────────────────────────────────────

    private Store loadOwnedStore(UUID storeId, UUID ownerId) {
        return storeRepository.findByIdAndOwnerId(storeId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeId));
    }

    private User loadUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId.toString()));
    }
}
