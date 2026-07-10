package com.casciz.commerceos.presentation.store;

import com.casciz.commerceos.application.store.dto.StoreDtos.*;
import com.casciz.commerceos.application.store.usecase.StoreService;
import com.casciz.commerceos.domain.store.valueobject.StoreCurrency;
import com.casciz.commerceos.domain.store.valueobject.StoreStatus;
import com.casciz.commerceos.domain.user.entity.User;
import com.casciz.commerceos.shared.response.PagedResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.Collections;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(StoreController.class)
@DisplayName("StoreController – HTTP layer")
class StoreControllerTest {

    @Autowired MockMvc     mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockBean StoreService storeService;

    private static final UUID STORE_ID = UUID.randomUUID();
    private static final UUID OWNER_ID = UUID.randomUUID();

    private StoreResponse sampleResponse() {
        return new StoreResponse(
                STORE_ID, "Test Store", "test-store", null, null, null, null,
                StoreStatus.DRAFT, StoreCurrency.USD, "UTC", null, null,
                OWNER_ID, Instant.now(), Instant.now(), null, null);
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/v1/stores returns 200 with paged list")
    void list_returnsPagedResponse() throws Exception {
        PagedResponse<StoreSummary> paged = new PagedResponse<>(
                Collections.emptyList(), 0, 20, 0, 0, true);

        when(storeService.listByOwner(any(), any(), any(Pageable.class)))
                .thenReturn(paged);

        mockMvc.perform(get("/api/v1/stores"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser
    @DisplayName("POST /api/v1/stores returns 201 with created store")
    void create_validRequest_returns201() throws Exception {
        CreateStoreRequest req = new CreateStoreRequest(
                "Test Store", null, null, StoreCurrency.USD, "UTC", null, null);

        when(storeService.create(any(), any())).thenReturn(sampleResponse());

        mockMvc.perform(post("/api/v1/stores")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.slug").value("test-store"));
    }

    @Test
    @WithMockUser
    @DisplayName("POST /api/v1/stores with blank name returns 422")
    void create_blankName_returns422() throws Exception {
        mockMvc.perform(post("/api/v1/stores")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\",\"currency\":\"USD\",\"timezone\":\"UTC\"}"))
                .andExpect(status().isUnprocessableEntity());
    }
}
