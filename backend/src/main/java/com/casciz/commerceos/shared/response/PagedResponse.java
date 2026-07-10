package com.casciz.commerceos.shared.response;

import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Pagination metadata wrapper returned alongside list data.
 */
public record PagedResponse<T>(
        List<T>  content,
        int      page,
        int      size,
        long     totalElements,
        int      totalPages,
        boolean  last
) {

    public static <T> PagedResponse<T> from(Page<T> page) {
        return new PagedResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }
}
