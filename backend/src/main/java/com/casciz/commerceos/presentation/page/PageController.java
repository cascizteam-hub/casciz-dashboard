package com.casciz.commerceos.presentation.page;

import com.casciz.commerceos.application.page.dto.PageDtos.*;
import com.casciz.commerceos.application.page.usecase.PageService;
import com.casciz.commerceos.domain.user.entity.User;
import com.casciz.commerceos.shared.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for page builder operations.
 * All routes are nested under /api/v1/stores/{storeId}/pages.
 */
@RestController
@RequestMapping("/api/v1/stores/{storeId}/pages")
@RequiredArgsConstructor
@Tag(name = "Page Builder", description = "Create and manage pages for a store")
@SecurityRequirement(name = "bearerAuth")
public class PageController {

    private final PageService pageService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new page for the store")
    public ResponseEntity<ApiResponse<PageResponse>> create(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId,
            @Valid @RequestBody CreatePageRequest request) {

        PageResponse page = pageService.create(storeId, currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Page created.", page));
    }

    @GetMapping
    @Operation(summary = "List all pages for a store (ordered by sortOrder)")
    public ResponseEntity<ApiResponse<List<PageSummary>>> list(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId) {

        List<PageSummary> pages = pageService.listByStore(storeId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok(pages));
    }

    @GetMapping("/{pageId}")
    @Operation(summary = "Get a single page with full content (for builder)")
    public ResponseEntity<ApiResponse<PageResponse>> getById(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId,
            @PathVariable UUID pageId) {

        PageResponse page = pageService.getByIdForOwner(pageId, storeId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok(page));
    }

    @PatchMapping("/{pageId}/meta")
    @Operation(summary = "Update page title and SEO meta")
    public ResponseEntity<ApiResponse<PageResponse>> updateMeta(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId,
            @PathVariable UUID pageId,
            @Valid @RequestBody UpdatePageMetaRequest request) {

        PageResponse page = pageService.updateMeta(pageId, storeId, currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Page updated.", page));
    }

    @PutMapping("/{pageId}/content")
    @Operation(summary = "Save the full page document from the drag-and-drop builder")
    public ResponseEntity<ApiResponse<PageResponse>> saveContent(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId,
            @PathVariable UUID pageId,
            @Valid @RequestBody SavePageContentRequest request) {

        PageResponse page = pageService.saveContent(pageId, storeId, currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Content saved.", page));
    }

    @PostMapping("/{pageId}/publish")
    @Operation(summary = "Publish a page")
    public ResponseEntity<ApiResponse<PageResponse>> publish(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId,
            @PathVariable UUID pageId) {

        PageResponse page = pageService.publish(pageId, storeId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("Page published.", page));
    }

    @PostMapping("/{pageId}/unpublish")
    @Operation(summary = "Unpublish a page (revert to draft)")
    public ResponseEntity<ApiResponse<PageResponse>> unpublish(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId,
            @PathVariable UUID pageId) {

        PageResponse page = pageService.unpublish(pageId, storeId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("Page reverted to draft.", page));
    }

    @PutMapping("/reorder")
    @Operation(summary = "Reorder pages by supplying a new ordered list of IDs")
    public ResponseEntity<ApiResponse<List<PageSummary>>> reorder(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId,
            @Valid @RequestBody ReorderPagesRequest request) {

        List<PageSummary> pages = pageService.reorder(storeId, currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Pages reordered.", pages));
    }

    @DeleteMapping("/{pageId}")
    @Operation(summary = "Delete a page (Home page cannot be deleted)")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal User currentUser,
            @PathVariable UUID storeId,
            @PathVariable UUID pageId) {

        pageService.delete(pageId, storeId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("Page deleted."));
    }
}
