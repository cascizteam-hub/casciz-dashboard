import apiClient from './client'
import type {
  AddOrderNoteRequest,
  ApiResponse,
  OrderResponse,
  OrderStatsResponse,
  OrderSummary,
  PagedResponse,
  RefundRequest,
  ShipOrderRequest,
  UpdateOrderStatusRequest,
} from '@/types'

export const orderApi = {
  list(storeId: string, params?: {
    q?: string
    status?: string
    fulfilmentStatus?: string
    page?: number
    size?: number
  }) {
    return apiClient.get<ApiResponse<PagedResponse<OrderSummary>>>(
      `/stores/${storeId}/orders`, { params })
  },

  getStats(storeId: string) {
    return apiClient.get<ApiResponse<OrderStatsResponse>>(
      `/stores/${storeId}/orders/stats`)
  },

  getById(storeId: string, orderId: string) {
    return apiClient.get<ApiResponse<OrderResponse>>(
      `/stores/${storeId}/orders/${orderId}`)
  },

  updateStatus(storeId: string, orderId: string, data: UpdateOrderStatusRequest) {
    return apiClient.patch<ApiResponse<OrderResponse>>(
      `/stores/${storeId}/orders/${orderId}/status`, data)
  },

  ship(storeId: string, orderId: string, data: ShipOrderRequest) {
    return apiClient.post<ApiResponse<OrderResponse>>(
      `/stores/${storeId}/orders/${orderId}/ship`, data)
  },

  markDelivered(storeId: string, orderId: string) {
    return apiClient.post<ApiResponse<OrderResponse>>(
      `/stores/${storeId}/orders/${orderId}/deliver`)
  },

  cancel(storeId: string, orderId: string, reason?: string) {
    return apiClient.post<ApiResponse<OrderResponse>>(
      `/stores/${storeId}/orders/${orderId}/cancel`,
      null,
      { params: { reason: reason ?? '' } })
  },

  refund(storeId: string, orderId: string, data: RefundRequest) {
    return apiClient.post<ApiResponse<OrderResponse>>(
      `/stores/${storeId}/orders/${orderId}/refund`, data)
  },

  addNote(storeId: string, orderId: string, data: AddOrderNoteRequest) {
    return apiClient.post<ApiResponse<OrderResponse>>(
      `/stores/${storeId}/orders/${orderId}/notes`, data)
  },
}
