import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { ProductSummary, ProductResponse, CategoryResponse } from '@/types'

interface ProductState {
  products:        ProductSummary[]
  selectedProduct: ProductResponse | null
  categories:      CategoryResponse[]
  totalElements:   number
  currentPage:     number
  isLoading:       boolean
  isSubmitting:    boolean

  setProducts:        (products: ProductSummary[], total: number) => void
  setSelectedProduct: (product: ProductResponse | null) => void
  setCategories:      (categories: CategoryResponse[]) => void
  setCurrentPage:     (page: number) => void
  setLoading:         (loading: boolean) => void
  setSubmitting:      (submitting: boolean) => void
  addProduct:         (product: ProductSummary) => void
  updateProduct:      (product: ProductResponse) => void
  removeProduct:      (productId: string) => void
  addCategory:        (category: CategoryResponse) => void
  updateCategory:     (category: CategoryResponse) => void
  removeCategory:     (categoryId: string) => void
}

export const useProductStore = create<ProductState>()(
  devtools(
    (set) => ({
      products:        [],
      selectedProduct: null,
      categories:      [],
      totalElements:   0,
      currentPage:     0,
      isLoading:       false,
      isSubmitting:    false,

      setProducts: (products, total) =>
        set({ products, totalElements: total }, false, 'setProducts'),

      setSelectedProduct: (product) =>
        set({ selectedProduct: product }, false, 'setSelectedProduct'),

      setCategories: (categories) =>
        set({ categories }, false, 'setCategories'),

      setCurrentPage: (page) =>
        set({ currentPage: page }, false, 'setCurrentPage'),

      setLoading: (isLoading) =>
        set({ isLoading }, false, 'setLoading'),

      setSubmitting: (isSubmitting) =>
        set({ isSubmitting }, false, 'setSubmitting'),

      addProduct: (product) =>
        set((state) => ({
          products:      [product, ...state.products],
          totalElements: state.totalElements + 1,
        }), false, 'addProduct'),

      updateProduct: (updated) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === updated.id
              ? {
                  id:             updated.id,
                  name:           updated.name,
                  slug:           updated.slug,
                  status:         updated.status,
                  thumbnailUrl:   updated.thumbnailUrl,
                  minPrice:       updated.minPrice,
                  inStock:        updated.inStock,
                  totalInventory: updated.totalInventory,
                  categoryName:   updated.categoryName,
                  variantCount:   updated.variants.length,
                  createdAt:      updated.createdAt,
                }
              : p,
          ),
          selectedProduct:
            state.selectedProduct?.id === updated.id ? updated : state.selectedProduct,
        }), false, 'updateProduct'),

      removeProduct: (productId) =>
        set((state) => ({
          products:        state.products.filter((p) => p.id !== productId),
          totalElements:   Math.max(0, state.totalElements - 1),
          selectedProduct: state.selectedProduct?.id === productId
            ? null : state.selectedProduct,
        }), false, 'removeProduct'),

      addCategory: (category) =>
        set((state) => ({ categories: [...state.categories, category] }),
          false, 'addCategory'),

      updateCategory: (updated) =>
        set((state) => ({
          categories: state.categories.map((c) => c.id === updated.id ? updated : c),
        }), false, 'updateCategory'),

      removeCategory: (categoryId) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== categoryId),
        }), false, 'removeCategory'),
    }),
    { name: 'ProductStore' },
  ),
)
