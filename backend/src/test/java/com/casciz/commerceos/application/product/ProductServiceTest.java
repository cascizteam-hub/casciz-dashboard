package com.casciz.commerceos.application.product;

import com.casciz.commerceos.application.product.dto.ProductDtos.*;
import com.casciz.commerceos.application.product.usecase.ProductMapper;
import com.casciz.commerceos.application.product.usecase.ProductService;
import com.casciz.commerceos.domain.product.entity.Product;
import com.casciz.commerceos.domain.product.entity.ProductVariant;
import com.casciz.commerceos.domain.product.repository.ProductCategoryRepository;
import com.casciz.commerceos.domain.product.repository.ProductRepository;
import com.casciz.commerceos.domain.product.repository.ProductVariantRepository;
import com.casciz.commerceos.domain.product.valueobject.ProductStatus;
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

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProductService")
class ProductServiceTest {

    @Mock ProductRepository         productRepository;
    @Mock ProductCategoryRepository categoryRepository;
    @Mock ProductVariantRepository  variantRepository;
    @Mock StoreRepository           storeRepository;

    ProductMapper  mapper  = new ProductMapper();
    ProductService service;

    UUID storeId   = UUID.randomUUID();
    UUID ownerId   = UUID.randomUUID();
    UUID productId = UUID.randomUUID();

    User  mockOwner;
    Store mockStore;

    @BeforeEach
    void setUp() {
        service = new ProductService(productRepository, categoryRepository,
                variantRepository, storeRepository, mapper);
        mockOwner = User.builder().id(ownerId).email("owner@test.com")
                .firstName("Jane").lastName("Doe").build();
        mockStore = Store.builder().id(storeId).name("Test Store")
                .slug("test-store").owner(mockOwner).build();
    }

    // ── create ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("create: saves product with DRAFT status and default variant")
    void create_validRequest_savesProductAsDraft() {
        VariantRequest vr = new VariantRequest("Default", "SKU-001",
                new BigDecimal("29.99"), null, null, 100, false, null);
        CreateProductRequest req = new CreateProductRequest(
                "Cool T-Shirt", null, "A great shirt", null,
                null, "summer", null, null, false, List.of(vr), null);

        when(storeRepository.findByIdAndOwnerId(storeId, ownerId))
                .thenReturn(Optional.of(mockStore));
        when(productRepository.existsBySlugAndStoreId(anyString(), eq(storeId))).thenReturn(false);
        when(variantRepository.existsBySku("SKU-001")).thenReturn(false);
        when(productRepository.save(any())).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            p.getVariants().forEach(v -> {});
            return buildProduct(p.getName(), p.getSlug(), p.getStatus());
        });

        ProductResponse result = service.create(storeId, ownerId, req);

        assertThat(result.status()).isEqualTo(ProductStatus.DRAFT);
        assertThat(result.name()).isEqualTo("Cool T-Shirt");
        verify(productRepository).save(any(Product.class));
    }

    @Test
    @DisplayName("create: throws CONFLICT on duplicate SKU")
    void create_duplicateSku_throwsConflict() {
        VariantRequest vr = new VariantRequest("Default", "EXISTING-SKU",
                BigDecimal.TEN, null, null, null, false, null);
        CreateProductRequest req = new CreateProductRequest(
                "Hat", null, null, null, null, null, null, null,
                false, List.of(vr), null);

        when(storeRepository.findByIdAndOwnerId(storeId, ownerId))
                .thenReturn(Optional.of(mockStore));
        when(productRepository.existsBySlugAndStoreId(anyString(), eq(storeId))).thenReturn(false);
        when(variantRepository.existsBySku("EXISTING-SKU")).thenReturn(true);

        assertThatThrownBy(() -> service.create(storeId, ownerId, req))
                .isInstanceOf(CascizException.class)
                .hasMessageContaining("SKU");
    }

    // ── delete ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("delete: throws CONFLICT for ACTIVE product")
    void delete_activeProduct_throws() {
        Product active = buildProduct("Shirt", "shirt", ProductStatus.ACTIVE);
        when(storeRepository.findByIdAndOwnerId(storeId, ownerId))
                .thenReturn(Optional.of(mockStore));
        when(productRepository.findByIdAndStoreId(productId, storeId))
                .thenReturn(Optional.of(active));

        assertThatThrownBy(() -> service.delete(productId, storeId, ownerId))
                .isInstanceOf(CascizException.class)
                .hasMessageContaining("Archive");
        verify(productRepository, never()).delete(any());
    }

    @Test
    @DisplayName("delete: succeeds for DRAFT product")
    void delete_draftProduct_succeeds() {
        Product draft = buildProduct("Shirt", "shirt", ProductStatus.DRAFT);
        when(storeRepository.findByIdAndOwnerId(storeId, ownerId))
                .thenReturn(Optional.of(mockStore));
        when(productRepository.findByIdAndStoreId(productId, storeId))
                .thenReturn(Optional.of(draft));

        assertThatCode(() -> service.delete(productId, storeId, ownerId)).doesNotThrowAnyException();
        verify(productRepository).delete(draft);
    }

    // ── getById ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("getById: throws 404 when product not found")
    void getById_notFound_throws() {
        when(storeRepository.findByIdAndOwnerId(storeId, ownerId))
                .thenReturn(Optional.of(mockStore));
        when(productRepository.findByIdAndStoreId(productId, storeId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getById(productId, storeId, ownerId))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private Product buildProduct(String name, String slug, ProductStatus status) {
        ProductVariant v = ProductVariant.builder()
                .id(UUID.randomUUID()).title("Default").price(BigDecimal.TEN)
                .inventoryQuantity(10).build();
        Product p = Product.builder()
                .id(productId).store(mockStore)
                .name(name).slug(slug).status(status).build();
        p.getVariants().add(v);
        v.setProduct(p);
        return p;
    }
}
