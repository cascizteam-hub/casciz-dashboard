'use client'

import { useCallback } from 'react'
import { orderApi } from '@/lib/api/order.api'
import { useOrderStore } from '@/store/slices/order.store'
import { getErrorMessage } from '@/lib/utils'
import type {
  AddOrderNoteRequest,
  FulfilmentStatus,
  OrderStatus,
  RefundRequest,
  ShipOrderRequest,
} from '@/types'

export function useOrders(storeId: string) {
  const {
    orders, selectedOrder, totalElements, currentPage,
    isLoading, isSubmitting,
    setOrders, setSelectedOrder, setLoading, setSubmitting,
    setCurrentPage, updateOrder,
  } = useOrderStore()

  const fetchOrders = useCallback(async (params?: {
    q?: string
    status?: OrderStatus | ''
    fulfilmentStatus?: FulfilmentStatus | ''
    page?: number
    size?: number
  }) => {
    setLoading(true)
    try {
      const { data } = await orderApi.list(storeId, {
        q:                params?.q || undefined,
        status:           params?.status || undefined,
        fulfilmentStatus: params?.fulfilmentStatus || undefined,
        page:             params?.page,
        size:             params?.size,
      })
      if (data.data) {
        setOrders(data.data.content, data.data.totalElements)
        setCurrentPage(data.data.page)
      }
    } finally { setLoading(false) }
  }, [storeId, setLoading, setOrders, setCurrentPage])

  const fetchOrder = useCallback(async (orderId: string) => {
    setLoading(true)
    try {
      const { data } = await orderApi.getById(storeId, orderId)
      if (data.data) setSelectedOrder(data.data)
      return data.data ?? null
    } finally { setLoading(false) }
  }, [storeId, setLoading, setSelectedOrder])

  const shipOrder = useCallback(async (orderId: string, req: ShipOrderRequest) => {
    setSubmitting(true)
    try {
      const { data } = await orderApi.ship(storeId, orderId, req)
      if (data.data) updateOrder(data.data)
      return data.data ?? null
    } finally { setSubmitting(false) }
  }, [storeId, setSubmitting, updateOrder])

  const markDelivered = useCallback(async (orderId: string) => {
    setSubmitting(true)
    try {
      const { data } = await orderApi.markDelivered(storeId, orderId)
      if (data.data) updateOrder(data.data)
      return data.data ?? null
    } finally { setSubmitting(false) }
  }, [storeId, setSubmitting, updateOrder])

  const cancelOrder = useCallback(async (orderId: string, reason?: string) => {
    setSubmitting(true)
    try {
      const { data } = await orderApi.cancel(storeId, orderId, reason)
      if (data.data) updateOrder(data.data)
      return data.data ?? null
    } finally { setSubmitting(false) }
  }, [storeId, setSubmitting, updateOrder])

  const refundOrder = useCallback(async (orderId: string, req: RefundRequest) => {
    setSubmitting(true)
    try {
      const { data } = await orderApi.refund(storeId, orderId, req)
      if (data.data) updateOrder(data.data)
      return data.data ?? null
    } finally { setSubmitting(false) }
  }, [storeId, setSubmitting, updateOrder])

  const addNote = useCallback(async (orderId: string, req: AddOrderNoteRequest) => {
    setSubmitting(true)
    try {
      const { data } = await orderApi.addNote(storeId, orderId, req)
      if (data.data) { updateOrder(data.data); setSelectedOrder(data.data) }
      return data.data ?? null
    } finally { setSubmitting(false) }
  }, [storeId, setSubmitting, updateOrder, setSelectedOrder])

  return {
    orders, selectedOrder, totalElements, currentPage,
    isLoading, isSubmitting,
    fetchOrders, fetchOrder, shipOrder, markDelivered,
    cancelOrder, refundOrder, addNote,
    getErrorMessage,
  }
}
