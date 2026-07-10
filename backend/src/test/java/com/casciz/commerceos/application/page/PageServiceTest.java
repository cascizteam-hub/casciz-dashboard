package com.casciz.commerceos.application.page;

import com.casciz.commerceos.application.page.dto.PageDtos.*;
import com.casciz.commerceos.application.page.usecase.PageMapper;
import com.casciz.commerceos.application.page.usecase.PageService;
import com.casciz.commerceos.domain.page.entity.StorePage;
import com.casciz.commerceos.domain.page.repository.StorePageRepository;
import com.casciz.commerceos.domain.page.valueobject.PageStatus;
import com.casciz.commerceos.domain.page.valueobject.PageType;
import com.casciz.commerceos.domain.store.entity.Store;
import com.casciz.commerceos.domain.store.repository.StoreRepository;
import com.casciz.commerceos.domain.user.entity.User;
import com.casciz.commerceos.shared.exception.CascizException;
import com.casciz.commerceos.shared.exception.DomainExceptions.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PageService")
class PageServiceTest {

    @Mock StorePageRepository pageRepository;
    @Mock StoreRepository     storeRepository;

    PageMapper  pageMapper  = new PageMapper();
    PageService pageService;

    UUID storeId = UUID.randomUUID();
    UUID ownerId = UUID.randomUUID();
    UUID pageId  = UUID.randomUUID();

    User  mockOwner;
    Store mockStore;

    @BeforeEach
    void setUp() {
        pageService = new PageService(pageRepository, storeRepository, pageMapper);
        mockOwner = User.builder().id(ownerId).email("owner@test.com")
                .firstName("Jane").lastName("Doe").build();
        mockStore = Store.builder().id(storeId).name("Test Store")
                .slug("test-store").owner(mockOwner).build();
    }

    // ── create ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("create: successfully creates a custom page")
    void create_customPage_succeeds() {
        CreatePageRequest req = new CreatePageRequest(
                "About Us", "about-us", PageType.ABOUT, null, null);

        when(storeRepository.findByIdAndOwnerId(storeId, ownerId))
                .thenReturn(Optional.of(mockStore));
        when(pageRepository.existsByStoreIdAndSlug(storeId, "about-us")).thenReturn(false);
        when(pageRepository.countByStoreId(storeId)).thenReturn(1L);
        when(pageRepository.save(any())).thenAnswer(inv -> {
            StorePage p = inv.getArgument(0);
            return StorePage.builder()
                    .id(pageId).store(mockStore).title(p.getTitle())
                    .slug(p.getSlug()).type(p.getType()).status(PageStatus.DRAFT)
                    .sortOrder(1).content(Map.of("blocks", java.util.List.of()))
                    .build();
        });

        PageResponse result = pageService.create(storeId, ownerId, req);

        assertThat(result.title()).isEqualTo("About Us");
        assertThat(result.slug()).isEqualTo("about-us");
        assertThat(result.status()).isEqualTo(PageStatus.DRAFT);
    }

    @Test
    @DisplayName("create: HOME page sets empty slug")
    void create_homePage_emptySlug() {
        CreatePageRequest req = new CreatePageRequest(
                "Home", null, PageType.HOME, null, null);

        when(storeRepository.findByIdAndOwnerId(storeId, ownerId))
                .thenReturn(Optional.of(mockStore));
        when(pageRepository.existsByStoreIdAndType(storeId, PageType.HOME)).thenReturn(false);
        when(pageRepository.countByStoreId(storeId)).thenReturn(0L);
        when(pageRepository.save(any())).thenAnswer(inv -> {
            StorePage p = inv.getArgument(0);
            return StorePage.builder()
                    .id(pageId).store(mockStore).title(p.getTitle())
                    .slug("").type(PageType.HOME).status(PageStatus.DRAFT)
                    .sortOrder(0).content(Map.of()).build();
        });

        PageResponse result = pageService.create(storeId, ownerId, req);
        assertThat(result.slug()).isEmpty();
        assertThat(result.type()).isEqualTo(PageType.HOME);
    }

    @Test
    @DisplayName("create: throws CONFLICT when second HOME page requested")
    void create_duplicateHomePage_throws() {
        CreatePageRequest req = new CreatePageRequest(
                "Home 2", null, PageType.HOME, null, null);

        when(storeRepository.findByIdAndOwnerId(storeId, ownerId))
                .thenReturn(Optional.of(mockStore));
        when(pageRepository.existsByStoreIdAndType(storeId, PageType.HOME)).thenReturn(true);

        assertThatThrownBy(() -> pageService.create(storeId, ownerId, req))
                .isInstanceOf(CascizException.class)
                .hasMessageContaining("Home page");
    }

    // ── delete ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("delete: throws when attempting to delete HOME page")
    void delete_homePage_throws() {
        StorePage homePage = StorePage.builder()
                .id(pageId).store(mockStore).type(PageType.HOME).build();

        when(storeRepository.findByIdAndOwnerId(storeId, ownerId))
                .thenReturn(Optional.of(mockStore));
        when(pageRepository.findByIdAndStoreId(pageId, storeId))
                .thenReturn(Optional.of(homePage));

        assertThatThrownBy(() -> pageService.delete(pageId, storeId, ownerId))
                .isInstanceOf(CascizException.class)
                .hasMessageContaining("Home page cannot be deleted");
        verify(pageRepository, never()).delete(any());
    }
}
