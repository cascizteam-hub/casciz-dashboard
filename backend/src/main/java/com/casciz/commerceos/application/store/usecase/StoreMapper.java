package com.casciz.commerceos.application.store.usecase;

import com.casciz.commerceos.application.store.dto.StoreDtos.*;
import com.casciz.commerceos.domain.store.entity.Store;
import org.springframework.stereotype.Component;

/**
 * Maps between {@link Store} domain entity and response DTOs.
 * Hand-rolled to keep MapStruct off the domain layer (clean arch).
 */
@Component
public class StoreMapper {

    public StoreResponse toResponse(Store store) {
        return new StoreResponse(
                store.getId(),
                store.getName(),
                store.getSlug(),
                store.getDescription(),
                store.getLogoUrl(),
                store.getFaviconUrl(),
                store.getCustomDomain(),
                store.getStatus(),
                store.getCurrency(),
                store.getTimezone(),
                store.getContactEmail(),
                store.getContactPhone(),
                store.getOwner().getId(),
                store.getCreatedAt(),
                store.getUpdatedAt(),
                store.getPublishedAt(),
                store.getArchivedAt()
        );
    }

    public StoreSummary toSummary(Store store) {
        return new StoreSummary(
                store.getId(),
                store.getName(),
                store.getSlug(),
                store.getLogoUrl(),
                store.getStatus(),
                store.getCurrency(),
                store.getCreatedAt(),
                store.getPublishedAt()
        );
    }
}
