import apiClient from './client'
import type { ApiResponse } from '@/types'
import type {
  CreatePageRequest,
  PageResponse,
  PageSummary,
  ReorderPagesRequest,
  SavePageContentRequest,
  UpdatePageMetaRequest,
} from '@/types/builder'

export const pageApi = {
  create(storeId: string, data: CreatePageRequest) {
    return apiClient.post<ApiResponse<PageResponse>>(`/stores/${storeId}/pages`, data)
  },

  list(storeId: string) {
    return apiClient.get<ApiResponse<PageSummary[]>>(`/stores/${storeId}/pages`)
  },

  getById(storeId: string, pageId: string) {
    return apiClient.get<ApiResponse<PageResponse>>(`/stores/${storeId}/pages/${pageId}`)
  },

  updateMeta(storeId: string, pageId: string, data: UpdatePageMetaRequest) {
    return apiClient.patch<ApiResponse<PageResponse>>(
      `/stores/${storeId}/pages/${pageId}/meta`, data)
  },

  saveContent(storeId: string, pageId: string, data: SavePageContentRequest) {
    return apiClient.put<ApiResponse<PageResponse>>(
      `/stores/${storeId}/pages/${pageId}/content`, data)
  },

  publish(storeId: string, pageId: string) {
    return apiClient.post<ApiResponse<PageResponse>>(
      `/stores/${storeId}/pages/${pageId}/publish`)
  },

  unpublish(storeId: string, pageId: string) {
    return apiClient.post<ApiResponse<PageResponse>>(
      `/stores/${storeId}/pages/${pageId}/unpublish`)
  },

  reorder(storeId: string, data: ReorderPagesRequest) {
    return apiClient.put<ApiResponse<PageSummary[]>>(
      `/stores/${storeId}/pages/reorder`, data)
  },

  delete(storeId: string, pageId: string) {
    return apiClient.delete<ApiResponse<void>>(`/stores/${storeId}/pages/${pageId}`)
  },
}
