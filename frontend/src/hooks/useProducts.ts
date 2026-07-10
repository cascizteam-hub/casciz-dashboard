'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { productApi, categoryApi } from '@/lib/api/product.api'
import { useProductStore } from '@/store/slices/product.store'
import { getErrorMessage } from '@/lib/utils'
import type {
  CreateProductRequest,
  UpdateProductRequest,
  ProductStatus,
  VariantRequest,
  AdjustStockRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '@/types'

export function useProducts(storeId: string) {
  const router = useRouter()
  const {
    products, selectedProduct, categories, totalElements, currentPage,
    isLoading, isSubmitting,
    setProducts, setSelectedProduct, setCategories, setLoading, setSubmitting,
    setCurrentPage, addProduct, updateProduct, removeProduct,
    addCategory, updateCategory, removeCategory,
  } = useProductStore()

  // ── Categories ────────────────────────────────────────────────────────

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await categoryApi.list(storeId)
      if (data.data) setCategories(data.data)
    } catch { /* categories are non-critical */ }
  }, [storeId, setCategories])

  const createCategory = useCallback(async (req: CreateCategoryRequest) => {
    setSubmitting(true)
    try {
      const { data } = await categoryApi.create(storeId, req)
      if (data.data) addCategory(data.data)
      return data.data ?? null
    } finally { setSubmitting(false) }
  }, [storeId, setSubmitting, addCategory])

  const editCategory = useCallback(async (id: string, req: UpdateCategoryRequest) => {
    setSubmitting(true)
    try {
      const { data } = await categoryApi.update(storeId, id, req)
      if (data.data) updateCategory(data.data)
      return data.data ?? null
    } finally { setSubmitting(false) }
  }, [storeId, setSubmitting, updateCategory])

  const deleteCategory = useCallback(async (id: string) => {
    setSubmitting(true)
    try {
      await categoryApi.delete(storeId, id)
      removeCategory(id)
    } finally { setSubmitting(false) }
  }, [storeId, setSubmitting, removeCategory])

  // ── Products ──────────────────────────────────────────────────────────

  const fetchProducts = useCallback(async (params?: {
    q?: string; status?: string; categoryId?: string
    page?: number; size?: number
  }) => {
    setLoading(true)
    try {
      const { data } = await productApi.list(storeId, params)
      if (data.data) {
        setProducts(data.data.content, data.data.totalElements)
        setCurrentPage(data.data.page)
      }
    } finally { setLoading(false) }
  }, [storeId, setLoading, setProducts, setCurrentPage])

  const fetchProduct = useCallback(async (productId: string) => {
    setLoading(true)
    try {
      const { data } = await productApi.getById(storeId, productId)
      if (data.data) setSelectedProduct(data.data)
      return data.data ?? null
    } finally { setLoading(false) }
  }, [storeId, setLoading, setSelectedProduct])

  const createProduct = useCallback(async (req: CreateProductRequest) => {
    setSubmitting(true)
    try {
      const { data } = await productApi.create(storeId, req)
      if (data.data) {
        addProduct({
          id: data.data.id, name: data.data.name, slug: data.data.slug,
          status: data.data.status, thumbnailUrl: data.data.thumbnailUrl,
          minPrice: data.data.minPrice, inStock: data.data.inStock,
          totalInventory: data.data.totalInventory,
          categoryName: data.data.categoryName, variantCount: data.data.variants.length,
          createdAt: data.data.createdAt,
        })
        return data.data.id
      }
      return null
    } finally { setSubmitting(false) }
  }, [storeId, setSubmitting, addProduct])

  const editProduct = useCallback(async (productId: string, req: UpdateProductRequest) => {
    setSubmitting(true)
    try {
      const { data } = await productApi.update(storeId, productId, req)
      if (data.data) updateProduct(data.data)
      return data.data ?? null
    } finally { setSubmitting(false) }
  }, [storeId, setSubmitting, updateProduct])

  const changeStatus = useCallback(async (productId: string, status: ProductStatus) => {
    setSubmitting(true)
    try {
      const { data } = await productApi.updateStatus(storeId, productId, status)
      if (data.data) updateProduct(data.data)
      return data.data ?? null
    } finally { setSubmitting(false) }
  }, [storeId, setSubmitting, updateProduct])

  const deleteProduct = useCallback(async (productId: string) => {
    setSubmitting(true)
    try {
      await productApi.delete(storeId, productId)
      removeProduct(productId)
      router.push(`/stores/${storeId}/products`)
    } finally { setSubmitting(false) }
  }, [storeId, setSubmitting, removeProduct, router])

  // ── Variants ──────────────────────────────────────────────────────────

  const addVariant = useCallback(async (productId: string, req: VariantRequest) => {
    setSubmitting(true)
    try {
      const { data } = await productApi.addVariant(storeId, productId, req)
      if (data.data) { updateProduct(data.data); setSelectedProduct(data.data) }
    } finally { setSubmitting(false) }
  }, [storeId, setSubmitting, updateProduct, setSelectedProduct])

  const editVariant = useCallback(async (productId: string, variantId: string, req: VariantRequest) => {
    setSubmitting(true)
    try {
      const { data } = await productApi.updateVariant(storeId, productId, variantId, req)
      if (data.data) { updateProduct(data.data); setSelectedProduct(data.data) }
    } finally { setSubmitting(false) }
  }, [storeId, setSubmitting, updateProduct, setSelectedProduct])

  const removeVariant = useCallback(async (productId: string, variantId: string) => {
    setSubmitting(true)
    try {
      const { data } = await productApi.deleteVariant(storeId, productId, variantId)
      if (data.data) { updateProduct(data.data); setSelectedProduct(data.data) }
    } finally { setSubmitting(false) }
  }, [storeId, setSubmitting, updateProduct, setSelectedProduct])

  // ── Inventory ─────────────────────────────────────────────────────────

  const adjustStock = useCallback(async (productId: string, req: AdjustStockRequest) => {
    await productApi.adjustStock(storeId, productId, req)
    await fetchProduct(productId)
  }, [storeId, fetchProduct])

  return {
    products, selectedProduct, categories, totalElements, currentPage,
    isLoading, isSubmitting,
    fetchProducts, fetchProduct, createProduct, editProduct,
    changeStatus, deleteProduct,
    fetchCategories, createCategory, editCategory, deleteCategory,
    addVariant, editVariant, removeVariant,
    adjustStock,
    getErrorMessage,
  }
}
