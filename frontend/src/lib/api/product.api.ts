import apiClient from './client'
import type {
  ApiResponse,
  AdjustStockRequest,
  CategoryResponse,
  CreateProductRequest,
  PagedResponse,
  ProductResponse,
  ProductStatsResponse,
  ProductSummary,
  UpdateProductRequest,
  VariantRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '@/types'

// Re-export request types for categories
export type { CreateCategoryRequest, UpdateCategoryRequest }

// ── Category API ──────────────────────────────────────────────────────────

export const categoryApi = {
  list(storeId: string) {
    return apiClient.get<ApiResponse<CategoryResponse[]>>(
      `/stores/${storeId}/categories`)
  },
  create(storeId: string, data: CreateCategoryRequest) {
    return apiClient.post<ApiResponse<CategoryResponse>>(
      `/stores/${storeId}/categories`, data)
  },
  update(storeId: string, categoryId: string, data: UpdateCategoryRequest) {
    return apiClient.put<ApiResponse<CategoryResponse>>(
      `/stores/${storeId}/categories/${categoryId}`, data)
  },
  delete(storeId: string, categoryId: string) {
    return apiClient.delete<ApiResponse<void>>(
      `/stores/${storeId}/categories/${categoryId}`)
  },
}

// ── Product API ───────────────────────────────────────────────────────────

export const productApi = {
  create(storeId: string, data: CreateProductRequest) {
    return apiClient.post<ApiResponse<ProductResponse>>(
      `/stores/${storeId}/products`, data)
  },

  list(storeId: string, params?: {
    q?: string
    status?: string
    categoryId?: string
    page?: number
    size?: number
  }) {
    return apiClient.get<ApiResponse<PagedResponse<ProductSummary>>>(
      `/stores/${storeId}/products`, { params })
  },

  getStats(storeId: string) {
    return apiClient.get<ApiResponse<ProductStatsResponse>>(
      `/stores/${storeId}/products/stats`)
  },

  getById(storeId: string, productId: string) {
    return apiClient.get<ApiResponse<ProductResponse>>(
      `/stores/${storeId}/products/${productId}`)
  },

  update(storeId: string, productId: string, data: UpdateProductRequest) {
    return apiClient.put<ApiResponse<ProductResponse>>(
      `/stores/${storeId}/products/${productId}`, data)
  },

  updateStatus(storeId: string, productId: string, status: string) {
    return apiClient.patch<ApiResponse<ProductResponse>>(
      `/stores/${storeId}/products/${productId}/status`, { status })
  },

  delete(storeId: string, productId: string) {
    return apiClient.delete<ApiResponse<void>>(
      `/stores/${storeId}/products/${productId}`)
  },

  // Variants
  addVariant(storeId: string, productId: string, data: VariantRequest) {
    return apiClient.post<ApiResponse<ProductResponse>>(
      `/stores/${storeId}/products/${productId}/variants`, data)
  },

  updateVariant(storeId: string, productId: string, variantId: string, data: VariantRequest) {
    return apiClient.put<ApiResponse<ProductResponse>>(
      `/stores/${storeId}/products/${productId}/variants/${variantId}`, data)
  },

  deleteVariant(storeId: string, productId: string, variantId: string) {
    return apiClient.delete<ApiResponse<ProductResponse>>(
      `/stores/${storeId}/products/${productId}/variants/${variantId}`)
  },

  // Inventory
  adjustStock(storeId: string, productId: string, data: AdjustStockRequest) {
    return apiClient.post<ApiResponse<void>>(
      `/stores/${storeId}/products/${productId}/inventory/adjust`, data)
  },
}
