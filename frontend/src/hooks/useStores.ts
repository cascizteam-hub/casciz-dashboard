'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { storeApi } from '@/lib/api/store.api'
import { useStoreListStore } from '@/store/slices/store.store'
import { getErrorMessage } from '@/lib/utils'
import type {
  CreateStoreRequest,
  UpdateStoreRequest,
  StoreStatus,
} from '@/types'

/**
 * Primary hook for all store operations.
 * Keeps Zustand state in sync with API responses.
 */
export function useStores() {
  const router = useRouter()
  const {
    stores, selectedStore, totalElements, currentPage,
    isLoading, isSubmitting,
    setStores, setSelectedStore, setLoading, setSubmitting,
    addStore, updateStore, removeStore, setCurrentPage,
  } = useStoreListStore()

  // ── Fetch list ────────────────────────────────────────────────────────

  const fetchStores = useCallback(
    async (params?: { q?: string; page?: number; size?: number }) => {
      setLoading(true)
      try {
        const { data } = await storeApi.list(params)
        if (data.data) {
          setStores(data.data.content, data.data.totalElements)
          setCurrentPage(data.data.page)
        }
      } finally {
        setLoading(false)
      }
    },
    [setLoading, setStores, setCurrentPage],
  )

  // ── Fetch one ─────────────────────────────────────────────────────────

  const fetchStore = useCallback(
    async (storeId: string) => {
      setLoading(true)
      try {
        const { data } = await storeApi.getById(storeId)
        if (data.data) setSelectedStore(data.data)
        return data.data ?? null
      } finally {
        setLoading(false)
      }
    },
    [setLoading, setSelectedStore],
  )

  // ── Create ────────────────────────────────────────────────────────────

  const createStore = useCallback(
    async (request: CreateStoreRequest): Promise<string | null> => {
      setSubmitting(true)
      try {
        const { data } = await storeApi.create(request)
        if (data.data) {
          addStore({
            id:          data.data.id,
            name:        data.data.name,
            slug:        data.data.slug,
            logoUrl:     data.data.logoUrl,
            status:      data.data.status,
            currency:    data.data.currency,
            createdAt:   data.data.createdAt,
            publishedAt: data.data.publishedAt,
          })
          return data.data.id
        }
        return null
      } finally {
        setSubmitting(false)
      }
    },
    [setSubmitting, addStore],
  )

  // ── Update ────────────────────────────────────────────────────────────

  const updateStoreDetails = useCallback(
    async (storeId: string, request: UpdateStoreRequest) => {
      setSubmitting(true)
      try {
        const { data } = await storeApi.update(storeId, request)
        if (data.data) updateStore(data.data)
        return data.data ?? null
      } finally {
        setSubmitting(false)
      }
    },
    [setSubmitting, updateStore],
  )

  // ── Status ────────────────────────────────────────────────────────────

  const changeStatus = useCallback(
    async (storeId: string, status: StoreStatus) => {
      setSubmitting(true)
      try {
        const { data } = await storeApi.updateStatus(storeId, { status })
        if (data.data) updateStore(data.data)
        return data.data ?? null
      } finally {
        setSubmitting(false)
      }
    },
    [setSubmitting, updateStore],
  )

  // ── Delete ────────────────────────────────────────────────────────────

  const deleteStore = useCallback(
    async (storeId: string) => {
      setSubmitting(true)
      try {
        await storeApi.delete(storeId)
        removeStore(storeId)
        router.push('/stores')
      } finally {
        setSubmitting(false)
      }
    },
    [setSubmitting, removeStore, router],
  )

  // ── Slug check ────────────────────────────────────────────────────────

  const checkSlugAvailability = useCallback(async (slug: string): Promise<boolean> => {
    try {
      const { data } = await storeApi.checkSlug(slug)
      return data.data ?? false
    } catch {
      return false
    }
  }, [])

  return {
    stores,
    selectedStore,
    totalElements,
    currentPage,
    isLoading,
    isSubmitting,
    fetchStores,
    fetchStore,
    createStore,
    updateStoreDetails,
    changeStatus,
    deleteStore,
    checkSlugAvailability,
    getErrorMessage,
  }
}
