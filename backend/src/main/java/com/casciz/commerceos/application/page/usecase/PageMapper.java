package com.casciz.commerceos.application.page.usecase;

import com.casciz.commerceos.application.page.dto.PageDtos.*;
import com.casciz.commerceos.domain.page.entity.StorePage;
import org.springframework.stereotype.Component;

/**
 * Maps between {@link StorePage} entity and response DTOs.
 */
@Component
public class PageMapper {

    public PageResponse toResponse(StorePage page) {
        return new PageResponse(
                page.getId(),
                page.getStore().getId(),
                page.getTitle(),
                page.getSlug(),
                page.getMetaTitle(),
                page.getMetaDescription(),
                page.getType(),
                page.getStatus(),
                page.getSortOrder(),
                page.getContent(),
                page.getCreatedAt(),
                page.getUpdatedAt(),
                page.getPublishedAt()
        );
    }

    public PageSummary toSummary(StorePage page) {
        return new PageSummary(
                page.getId(),
                page.getTitle(),
                page.getSlug(),
                page.getType(),
                page.getStatus(),
                page.getSortOrder(),
                page.getUpdatedAt(),
                page.getPublishedAt()
        );
    }
}
