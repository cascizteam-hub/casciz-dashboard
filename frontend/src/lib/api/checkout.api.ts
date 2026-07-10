import apiClient from './client'
import type {
  AddItemRequest,
  ApiResponse,
  CheckoutResponse,
  ConfirmPaymentRequest,
  CreateCheckoutRequest,
  InitiatePaymentRequest,
  PagedResponse,
  PaymentIntentResponse,
  PaymentResultResponse,
  PaymentSettingsResponse,
  PaymentTransactionResponse,
  SavePaymentSettingsRequest,
  UpdateAddressesRequest,
  UpdateCustomerRequest,
  UpdateItemRequest,
} from '@/types'

// ── Storefront checkout API (no auth) ─────────────────────────────────────

export const checkoutApi = {
  create(data: CreateCheckoutRequest) {
    return apiClient.post<ApiResponse<CheckoutResponse>>('/checkout', data)
  },

  get(sessionToken: string) {
    return apiClient.get<ApiResponse<CheckoutResponse>>(`/checkout/${sessionToken}`)
  },

  addItem(sessionToken: string, data: AddItemRequest) {
    return apiClient.post<ApiResponse<CheckoutResponse>>(
      `/checkout/${sessionToken}/items`, data)
  },

  updateItem(sessionToken: string, data: UpdateItemRequest) {
    return apiClient.patch<ApiResponse<CheckoutResponse>>(
      `/checkout/${sessionToken}/items`, data)
  },

  updateCustomer(sessionToken: string, data: UpdateCustomerRequest) {
    return apiClient.put<ApiResponse<CheckoutResponse>>(
      `/checkout/${sessionToken}/customer`, data)
  },

  updateAddresses(sessionToken: string, data: UpdateAddressesRequest) {
    return apiClient.put<ApiResponse<CheckoutResponse>>(
      `/checkout/${sessionToken}/addresses`, data)
  },

  initiatePayment(sessionToken: string, data: InitiatePaymentRequest) {
    return apiClient.post<ApiResponse<PaymentIntentResponse>>(
      `/checkout/${sessionToken}/payment/initiate`, data)
  },

  confirmPayment(sessionToken: string, data: ConfirmPaymentRequest) {
    return apiClient.post<ApiResponse<PaymentResultResponse>>(
      `/checkout/${sessionToken}/payment/confirm`, data)
  },
}

// ── Dashboard checkout API (requires auth) ────────────────────────────────

export const storeCheckoutApi = {
  list(storeId: string, params?: { status?: string; page?: number; size?: number }) {
    return apiClient.get<ApiResponse<PagedResponse<CheckoutResponse>>>(
      `/stores/${storeId}/checkouts`, { params })
  },

  getTransactions(storeId: string, checkoutId: string) {
    return apiClient.get<ApiResponse<PaymentTransactionResponse[]>>(
      `/stores/${storeId}/checkouts/${checkoutId}/transactions`)
  },

  listPaymentSettings(storeId: string) {
    return apiClient.get<ApiResponse<PaymentSettingsResponse[]>>(
      `/stores/${storeId}/payment-settings`)
  },

  savePaymentSettings(storeId: string, data: SavePaymentSettingsRequest) {
    return apiClient.put<ApiResponse<PaymentSettingsResponse>>(
      `/stores/${storeId}/payment-settings`, data)
  },

  disablePaymentSettings(storeId: string, provider: string) {
    return apiClient.delete<ApiResponse<void>>(
      `/stores/${storeId}/payment-settings/${provider}`)
  },
}
