import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { OrderSummary, OrderResponse } from '@/types'

interface OrderState {
  orders:        OrderSummary[]
  selectedOrder: OrderResponse | null
  totalElements: number
  currentPage:   number
  isLoading:     boolean
  isSubmitting:  boolean

  setOrders:        (orders: OrderSummary[], total: number) => void
  setSelectedOrder: (order: OrderResponse | null) => void
  setCurrentPage:   (page: number) => void
  setLoading:       (loading: boolean) => void
  setSubmitting:    (submitting: boolean) => void
  updateOrder:      (order: OrderResponse) => void
}

export const useOrderStore = create<OrderState>()(
  devtools(
    (set) => ({
      orders:        [],
      selectedOrder: null,
      totalElements: 0,
      currentPage:   0,
      isLoading:     false,
      isSubmitting:  false,

      setOrders: (orders, total) =>
        set({ orders, totalElements: total }),

      setSelectedOrder: (order) =>
        set({ selectedOrder: order }),

      setCurrentPage: (page) =>
        set({ currentPage: page }),

      setLoading: (isLoading) =>
        set({ isLoading }),

      setSubmitting: (isSubmitting) =>
        set({ isSubmitting }),

      updateOrder: (updated) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === updated.id
              ? {
                  id: updated.id, orderNumber: updated.orderNumber,
                  status: updated.status, fulfilmentStatus: updated.fulfilmentStatus,
                  customerEmail: updated.customerEmail,
                  customerFirstName: updated.customerFirstName,
                  customerLastName: updated.customerLastName,
                  totalItemCount: updated.totalItemCount,
                  totalAmount: updated.totalAmount, currency: updated.currency,
                  paymentProvider: updated.paymentProvider,
                  trackingNumber: updated.trackingNumber, createdAt: updated.createdAt,
                }
              : o
          ),
          selectedOrder:
            state.selectedOrder?.id === updated.id ? updated : state.selectedOrder,
        })),
    }),
    { name: 'OrderStore' },
  ),
)
