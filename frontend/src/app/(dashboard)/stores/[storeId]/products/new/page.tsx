import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import CreateProductForm from '@/components/products/CreateProductForm'

export const metadata: Metadata = { title: 'New product' }

interface Props { params: Promise<{ storeId: string }> }

export default async function NewProductPage({ params }: Props) {
  const { storeId } = await params
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <Link href={`/stores/${storeId}/products`}
          className="flex items-center gap-1 text-sm text-surface-500 hover:text-surface-700 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Products
        </Link>
        <span className="text-surface-300">/</span>
        <span className="text-sm text-surface-900 font-medium">New product</span>
      </div>

      <div>
        <h1 className="font-display text-2xl font-bold text-surface-900">Add product</h1>
        <p className="text-sm text-surface-500 mt-1">
          Fill in the details below. You can update everything after creation.
        </p>
      </div>

      <CreateProductForm storeId={storeId} />
    </div>
  )
}
