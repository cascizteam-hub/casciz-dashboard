package com.casciz.commerceos.application.store;

import com.casciz.commerceos.application.store.dto.StoreDtos.*;
import com.casciz.commerceos.application.store.usecase.SlugGenerator;
import com.casciz.commerceos.application.store.usecase.StoreMapper;
import com.casciz.commerceos.application.store.usecase.StoreService;
import com.casciz.commerceos.domain.store.entity.Store;
import com.casciz.commerceos.domain.store.repository.StoreRepository;
import com.casciz.commerceos.domain.store.valueobject.StoreCurrency;
import com.casciz.commerceos.domain.store.valueobject.StoreStatus;
import com.casciz.commerceos.domain.user.entity.User;
import com.casciz.commerceos.domain.user.repository.UserRepository;
import com.casciz.commerceos.shared.exception.DomainExceptions.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("StoreService")
class StoreServiceTest {

    @Mock StoreRepository storeRepository;
    @Mock UserRepository  userRepository;
    @Mock SlugGenerator   slugGenerator;

    StoreMapper  storeMapper = new StoreMapper();
    StoreService storeService;

    UUID ownerId  = UUID.randomUUID();
    UUID storeId  = UUID.randomUUID();
    User mockUser;

    @BeforeEach
    void setUp() {
        storeService = new StoreService(storeRepository, userRepository, slugGenerator, storeMapper);
        mockUser = User.builder().id(ownerId).email("owner@test.com")
                .firstName("Jane").lastName("Doe").build();
    }

    // ── create ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("create: generates slug when none supplied")
    void create_noSlug_generatesSLug() {
        CreateStoreRequest req = new CreateStoreRequest(
                "My Awesome Shop", null, null, StoreCurrency.USD, "UTC", null, null);

        when(userRepository.findById(ownerId)).thenReturn(Optional.of(mockUser));
        when(slugGenerator.generate("My Awesome Shop")).thenReturn("my-awesome-shop");
        when(storeRepository.existsBySlug("my-awesome-shop")).thenReturn(false);
        when(storeRepository.save(any())).thenAnswer(inv -> {
            Store s = inv.getArgument(0);
            // simulate DB assigning an ID
            return Store.builder()
                    .id(storeId).name(s.getName()).slug(s.getSlug())
                    .currency(s.getCurrency()).timezone(s.getTimezone())
                    .status(StoreStatus.DRAFT).owner(mockUser).build();
        });

        StoreResponse result = storeService.create(ownerId, req);

        assertThat(result.name()).isEqualTo("My Awesome Shop");
        assertThat(result.slug()).isEqualTo("my-awesome-shop");
        assertThat(result.status()).isEqualTo(StoreStatus.DRAFT);
        verify(storeRepository).save(any(Store.class));
    }

    @Test
    @DisplayName("create: uses provided slug when supplied")
    void create_withSlug_usesProvidedSlug() {
        CreateStoreRequest req = new CreateStoreRequest(
                "My Shop", "my-shop", null, StoreCurrency.USD, "UTC", null, null);

        when(userRepository.findById(ownerId)).thenReturn(Optional.of(mockUser));
        when(storeRepository.existsBySlug("my-shop")).thenReturn(false);
        when(storeRepository.save(any())).thenAnswer(inv -> {
            Store s = inv.getArgument(0);
            return Store.builder()
                    .id(storeId).name(s.getName()).slug(s.getSlug())
                    .currency(s.getCurrency()).timezone("UTC")
                    .status(StoreStatus.DRAFT).owner(mockUser).build();
        });

        StoreResponse result = storeService.create(ownerId, req);
        assertThat(result.slug()).isEqualTo("my-shop");
        verify(slugGenerator, never()).generate(anyString());
    }

    // ── delete ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("delete: throws when store is published")
    void delete_publishedStore_throws() {
        Store published = Store.builder()
                .id(storeId).status(StoreStatus.PUBLISHED).owner(mockUser).build();

        when(storeRepository.findByIdAndOwnerId(storeId, ownerId))
                .thenReturn(Optional.of(published));

        assertThatThrownBy(() -> storeService.delete(storeId, ownerId))
                .isInstanceOf(com.casciz.commerceos.shared.exception.CascizException.class)
                .hasMessageContaining("Archive it first");
        verify(storeRepository, never()).delete(any());
    }

    @Test
    @DisplayName("delete: succeeds for draft store")
    void delete_draftStore_succeeds() {
        Store draft = Store.builder()
                .id(storeId).status(StoreStatus.DRAFT).owner(mockUser).build();

        when(storeRepository.findByIdAndOwnerId(storeId, ownerId))
                .thenReturn(Optional.of(draft));

        assertThatCode(() -> storeService.delete(storeId, ownerId)).doesNotThrowAnyException();
        verify(storeRepository).delete(draft);
    }

    // ── getByIdForOwner ───────────────────────────────────────────────────

    @Test
    @DisplayName("getByIdForOwner: throws 404 when store not found or not owned")
    void getByIdForOwner_notFound_throws() {
        when(storeRepository.findByIdAndOwnerId(storeId, ownerId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> storeService.getByIdForOwner(storeId, ownerId))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
