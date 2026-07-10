package com.casciz.commerceos.application.page.usecase;

import com.casciz.commerceos.application.page.dto.PageDtos.*;
import com.casciz.commerceos.application.store.usecase.SlugGenerator;
import com.casciz.commerceos.domain.page.entity.StorePage;
import com.casciz.commerceos.domain.page.repository.StorePageRepository;
import com.casciz.commerceos.domain.page.valueobject.PageStatus;
import com.casciz.commerceos.domain.page.valueobject.PageType;
import com.casciz.commerceos.domain.store.entity.Store;
import com.casciz.commerceos.domain.store.repository.StoreRepository;
import com.casciz.commerceos.shared.exception.CascizException;
import com.casciz.commerceos.shared.exception.DomainExceptions.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/**
 * All page-builder use-cases.
 * Ownership is enforced by first verifying the store belongs to the requesting user.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PageService {

    private final StorePageRepository pageRepository;
    private final StoreRepository     storeRepository;
    private final PageMapper          pageMapper;

    // ── Create ────────────────────────────────────────────────────────────

    public PageResponse create(UUID storeId, UUID ownerId, CreatePageRequest request) {
        Store store = loadOwnedStore(storeId, ownerId);

        // Enforce uniqueness of HOME page
        if (request.type() == PageType.HOME && pageRepository.existsByStoreIdAndType(storeId, PageType.HOME)) {
            throw new CascizException(
                    "This store already has a Home page.", HttpStatus.CONFLICT);
        }

        String slug = resolveSlug(request, storeId);

        int nextOrder = (int) pageRepository.countByStoreId(storeId);

        StorePage page = StorePage.builder()
                .store(store)
                .title(request.title())
                .slug(request.type() == PageType.HOME ? "" : slug)
                .type(request.type())
                .metaTitle(request.metaTitle())
                .metaDescription(request.metaDescription())
                .status(PageStatus.DRAFT)
                .sortOrder(nextOrder)
                .content(Map.of("blocks", List.of(), "theme", Map.of()))
                .build();

        StorePage saved = pageRepository.save(page);
        log.info("Page created: id={}, store={}, type={}", saved.getId(), storeId, request.type());
        return pageMapper.toResponse(saved);
    }

    // ── List ──────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<PageSummary> listByStore(UUID storeId, UUID ownerId) {
        loadOwnedStore(storeId, ownerId); // ownership check
        return pageRepository.findByStoreIdOrderBySortOrderAsc(storeId)
                .stream()
                .map(pageMapper::toSummary)
                .toList();
    }

    // ── Get one ───────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PageResponse getByIdForOwner(UUID pageId, UUID storeId, UUID ownerId) {
        loadOwnedStore(storeId, ownerId);
        return pageMapper.toResponse(loadPage(pageId, storeId));
    }

    // ── Update meta ───────────────────────────────────────────────────────

    public PageResponse updateMeta(UUID pageId, UUID storeId, UUID ownerId,
                                   UpdatePageMetaRequest request) {
        loadOwnedStore(storeId, ownerId);
        StorePage page = loadPage(pageId, storeId);
        page.setTitle(request.title());
        page.setMetaTitle(request.metaTitle());
        page.setMetaDescription(request.metaDescription());
        return pageMapper.toResponse(pageRepository.save(page));
    }

    // ── Save content (builder auto-save) ──────────────────────────────────

    public PageResponse saveContent(UUID pageId, UUID storeId, UUID ownerId,
                                    SavePageContentRequest request) {
        loadOwnedStore(storeId, ownerId);
        StorePage page = loadPage(pageId, storeId);
        page.setContent(request.content());
        StorePage saved = pageRepository.save(page);
        log.debug("Page content saved: id={}, store={}", pageId, storeId);
        return pageMapper.toResponse(saved);
    }

    // ── Publish / Unpublish ───────────────────────────────────────────────

    public PageResponse publish(UUID pageId, UUID storeId, UUID ownerId) {
        loadOwnedStore(storeId, ownerId);
        StorePage page = loadPage(pageId, storeId);
        page.publish();
        StorePage saved = pageRepository.save(page);
        log.info("Page published: id={}, store={}", pageId, storeId);
        return pageMapper.toResponse(saved);
    }

    public PageResponse unpublish(UUID pageId, UUID storeId, UUID ownerId) {
        loadOwnedStore(storeId, ownerId);
        StorePage page = loadPage(pageId, storeId);
        page.unpublish();
        return pageMapper.toResponse(pageRepository.save(page));
    }

    // ── Reorder ───────────────────────────────────────────────────────────

    public List<PageSummary> reorder(UUID storeId, UUID ownerId,
                                     ReorderPagesRequest request) {
        loadOwnedStore(storeId, ownerId);

        List<StorePage> pages = pageRepository.findByStoreIdOrderBySortOrderAsc(storeId);
        Map<UUID, StorePage> pageMap = pages.stream()
                .collect(Collectors.toMap(StorePage::getId, p -> p));

        List<UUID> orderedIds = request.orderedPageIds();
        IntStream.range(0, orderedIds.size()).forEach(i -> {
            StorePage page = pageMap.get(orderedIds.get(i));
            if (page != null) page.setSortOrder(i);
        });

        pageRepository.saveAll(pages);
        return pages.stream().map(pageMapper::toSummary).toList();
    }

    // ── Delete ────────────────────────────────────────────────────────────

    public void delete(UUID pageId, UUID storeId, UUID ownerId) {
        loadOwnedStore(storeId, ownerId);
        StorePage page = loadPage(pageId, storeId);
        if (page.getType() == PageType.HOME) {
            throw new CascizException(
                    "The Home page cannot be deleted.", HttpStatus.CONFLICT);
        }
        pageRepository.delete(page);
        log.info("Page deleted: id={}, store={}", pageId, storeId);
    }

    // ── Private helpers ───────────────────────────────────────────────────

    private Store loadOwnedStore(UUID storeId, UUID ownerId) {
        return storeRepository.findByIdAndOwnerId(storeId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Store", storeId));
    }

    private StorePage loadPage(UUID pageId, UUID storeId) {
        return pageRepository.findByIdAndStoreId(pageId, storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Page", pageId));
    }

    private String resolveSlug(CreatePageRequest request, UUID storeId) {
        if (request.type() == PageType.HOME) return "";

        String baseSlug = StringUtils.hasText(request.slug())
                ? request.slug()
                : SlugGenerator.toSlug(request.title());

        if (!pageRepository.existsByStoreIdAndSlug(storeId, baseSlug)) {
            return baseSlug;
        }

        for (int i = 2; i <= 100; i++) {
            String candidate = baseSlug + "-" + i;
            if (!pageRepository.existsByStoreIdAndSlug(storeId, candidate)) {
                return candidate;
            }
        }
        throw new CascizException("Could not generate a unique slug.", HttpStatus.CONFLICT);
    }
}
