import apiClient from './client'
import type {
  ApiResponse,
  CreateStoreRequest,
  PagedResponse,
  StoreSummary,
  StoreResponse,
  StoreStatsResponse,
  UpdateStoreRequest,
  UpdateStoreStatusRequest,
} from '@/types'

export const storeApi = {
  // ── CRUD ─────────────────────────────────────────────────────────────

  create(data: CreateStoreRequest) {
    return apiClient.post<ApiResponse<StoreResponse>>('/stores', data)
  },

  list(params?: { q?: string; page?: number; size?: number }) {
    return apiClient.get<ApiResponse<PagedResponse<StoreSummary>>>('/stores', { params })
  },

  getById(storeId: string) {
    return apiClient.get<ApiResponse<StoreResponse>>(`/stores/${storeId}`)
  },

  update(storeId: string, data: UpdateStoreRequest) {
    return apiClient.put<ApiResponse<StoreResponse>>(`/stores/${storeId}`, data)
  },

  updateStatus(storeId: string, data: UpdateStoreStatusRequest) {
    return apiClient.patch<ApiResponse<StoreResponse>>(`/stores/${storeId}/status`, data)
  },

  delete(storeId: string) {
    return apiClient.delete<ApiResponse<void>>(`/stores/${storeId}`)
  },

  // ── Utility ───────────────────────────────────────────────────────────

  getStats() {
    return apiClient.get<ApiResponse<StoreStatsResponse>>('/stores/stats')
  },

  checkSlug(slug: string) {
    return apiClient.get<ApiResponse<boolean>>('/stores/slug/check', { params: { slug } })
  },
}
