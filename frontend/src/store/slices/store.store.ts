import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { StoreSummary, StoreResponse } from '@/types'

interface StoreState {
  stores:           StoreSummary[]
  selectedStore:    StoreResponse | null
  totalElements:    number
  currentPage:      number
  isLoading:        boolean
  isSubmitting:     boolean

  setStores:        (stores: StoreSummary[], total: number) => void
  setSelectedStore: (store: StoreResponse | null) => void
  setCurrentPage:   (page: number) => void
  setLoading:       (loading: boolean) => void
  setSubmitting:    (submitting: boolean) => void
  addStore:         (store: StoreSummary) => void
  updateStore:      (store: StoreResponse) => void
  removeStore:      (storeId: string) => void
  reset:            () => void
}

export const useStoreListStore = create<StoreState>()(
  devtools(
    (set) => ({
      stores:        [],
      selectedStore: null,
      totalElements: 0,
      currentPage:   0,
      isLoading:     false,
      isSubmitting:  false,

      setStores: (stores, total) =>
        set({ stores, totalElements: total }),

      setSelectedStore: (store) =>
        set({ selectedStore: store }),

      setCurrentPage: (page) =>
        set({ currentPage: page }),

      setLoading: (isLoading) =>
        set({ isLoading }),

      setSubmitting: (isSubmitting) =>
        set({ isSubmitting }),

      addStore: (store) =>
        set((state) => ({
          stores:        [store, ...state.stores],
          totalElements: state.totalElements + 1,
        })),

      updateStore: (updated) =>
        set((state) => ({
          stores: state.stores.map((s) =>
            s.id === updated.id
              ? {
                  id:          updated.id,
                  name:        updated.name,
                  slug:        updated.slug,
                  logoUrl:     updated.logoUrl,
                  status:      updated.status,
                  currency:    updated.currency,
                  createdAt:   updated.createdAt,
                  publishedAt: updated.publishedAt,
                }
              : s,
          ),
          selectedStore:
            state.selectedStore?.id === updated.id ? updated : state.selectedStore,
        })),

      removeStore: (storeId) =>
        set((state) => ({
          stores:        state.stores.filter((s) => s.id !== storeId),
          totalElements: Math.max(0, state.totalElements - 1),
          selectedStore:
            state.selectedStore?.id === storeId ? null : state.selectedStore,
        })),

      reset: () =>
        set({
          stores: [], selectedStore: null, totalElements: 0,
          currentPage: 0, isLoading: false, isSubmitting: false,
        }),
    }),
    { name: 'StoreListStore' },
  ),
)
