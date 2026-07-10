'use client'

import { useCallback } from 'react'
import { checkoutApi, storeCheckoutApi } from '@/lib/api/checkout.api'
import { useCheckoutStore } from '@/store/slices/checkout.store'
import { getErrorMessage } from '@/lib/utils'
import type {
  AddItemRequest,
  AddressDto,
  CheckoutStatus,
  ConfirmPaymentRequest,
  InitiatePaymentRequest,
  SavePaymentSettingsRequest,
  UpdateCustomerRequest,
  UpdateItemRequest,
} from '@/types'

/**
 * Storefront checkout operations (no auth required).
 */
export function useCheckout(storeId?: string) {
  const {
    sessionToken, checkout, isLoading, isSubmitting,
    setSessionToken, setCheckout, setLoading, setSubmitting, clearCheckout,
  } = useCheckoutStore()

  const startCheckout = useCallback(async (): Promise<string | null> => {
    if (!storeId) return null
    setLoading(true)
    try {
      const { data } = await checkoutApi.create({ storeId })
      if (data.data) {
        setSessionToken(data.data.sessionToken)
        setCheckout(data.data)
        return data.data.sessionToken
      }
      return null
    } finally {
      setLoading(false)
    }
  }, [storeId, setLoading, setSessionToken, setCheckout])

  const fetchCheckout = useCallback(async (token?: string) => {
    const tok = token ?? sessionToken
    if (!tok) return null
    setLoading(true)
    try {
      const { data } = await checkoutApi.get(tok)
      if (data.data) setCheckout(data.data)
      return data.data ?? null
    } finally {
      setLoading(false)
    }
  }, [sessionToken, setLoading, setCheckout])

  const addItem = useCallback(async (req: AddItemRequest) => {
    const tok = sessionToken ?? await startCheckout()
    if (!tok) throw new Error('No checkout session')
    setSubmitting(true)
    try {
      const { data } = await checkoutApi.addItem(tok, req)
      if (data.data) setCheckout(data.data)
      return data.data ?? null
    } finally { setSubmitting(false) }
  }, [sessionToken, startCheckout, setSubmitting, setCheckout])

  const updateItem = useCallback(async (req: UpdateItemRequest) => {
    if (!sessionToken) return null
    setSubmitting(true)
    try {
      const { data } = await checkoutApi.updateItem(sessionToken, req)
      if (data.data) setCheckout(data.data)
      return data.data ?? null
    } finally { setSubmitting(false) }
  }, [sessionToken, setSubmitting, setCheckout])

  const updateCustomer = useCallback(async (req: UpdateCustomerRequest) => {
    if (!sessionToken) return null
    setSubmitting(true)
    try {
      const { data } = await checkoutApi.updateCustomer(sessionToken, req)
      if (data.data) setCheckout(data.data)
      return data.data ?? null
    } finally { setSubmitting(false) }
  }, [sessionToken, setSubmitting, setCheckout])

  const updateAddresses = useCallback(async (
    shippingAddress: AddressDto,
    billingAddress?: AddressDto,
    billingSameAsShipping = true
  ) => {
    if (!sessionToken) return null
    setSubmitting(true)
    try {
      const { data } = await checkoutApi.updateAddresses(sessionToken, {
        shippingAddress,
        billingAddress,
        billingSameAsShipping,
      })
      if (data.data) setCheckout(data.data)
      return data.data ?? null
    } finally { setSubmitting(false) }
  }, [sessionToken, setSubmitting, setCheckout])

  const initiatePayment = useCallback(async (req: InitiatePaymentRequest) => {
    if (!sessionToken) throw new Error('No checkout session')
    setSubmitting(true)
    try {
      const { data } = await checkoutApi.initiatePayment(sessionToken, req)
      return data.data ?? null
    } finally { setSubmitting(false) }
  }, [sessionToken, setSubmitting])

  const confirmPayment = useCallback(async (req: ConfirmPaymentRequest) => {
    if (!sessionToken) throw new Error('No checkout session')
    setSubmitting(true)
    try {
      const { data } = await checkoutApi.confirmPayment(sessionToken, req)
      if (data.data?.succeeded) clearCheckout()
      return data.data ?? null
    } finally { setSubmitting(false) }
  }, [sessionToken, setSubmitting, clearCheckout])

  return {
    sessionToken, checkout, isLoading, isSubmitting,
    startCheckout, fetchCheckout, addItem, updateItem,
    updateCustomer, updateAddresses, initiatePayment, confirmPayment,
    clearCheckout, getErrorMessage,
  }
}

/**
 * Dashboard-side checkout management.
 */
export function useStoreCheckout(storeId: string) {
  const {
    checkouts, totalElements, paymentSettings, isLoading, isSubmitting,
    setCheckouts, setLoading, setSubmitting, setPaymentSettings, updatePaymentSetting,
  } = useCheckoutStore()

  const fetchCheckouts = useCallback(async (params?: {
    status?: CheckoutStatus; page?: number; size?: number
  }) => {
    setLoading(true)
    try {
      const { data } = await storeCheckoutApi.list(storeId, params)
      if (data.data) setCheckouts(data.data.content, data.data.totalElements)
    } finally { setLoading(false) }
  }, [storeId, setLoading, setCheckouts])

  const fetchPaymentSettings = useCallback(async () => {
    try {
      const { data } = await storeCheckoutApi.listPaymentSettings(storeId)
      if (data.data) setPaymentSettings(data.data)
    } catch { /* non-critical */ }
  }, [storeId, setPaymentSettings])

  const savePaymentSettings = useCallback(async (req: SavePaymentSettingsRequest) => {
    setSubmitting(true)
    try {
      const { data } = await storeCheckoutApi.savePaymentSettings(storeId, req)
      if (data.data) updatePaymentSetting(data.data)
      return data.data ?? null
    } finally { setSubmitting(false) }
  }, [storeId, setSubmitting, updatePaymentSetting])

  const disableProvider = useCallback(async (provider: string) => {
    setSubmitting(true)
    try {
      await storeCheckoutApi.disablePaymentSettings(storeId, provider)
      await fetchPaymentSettings()
    } finally { setSubmitting(false) }
  }, [storeId, setSubmitting, fetchPaymentSettings])

  return {
    checkouts, totalElements, paymentSettings, isLoading, isSubmitting,
    fetchCheckouts, fetchPaymentSettings, savePaymentSettings, disableProvider,
    getErrorMessage,
  }
}
