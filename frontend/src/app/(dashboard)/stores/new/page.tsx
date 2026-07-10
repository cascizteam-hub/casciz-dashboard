import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import CreateStoreForm from '@/components/stores/CreateStoreForm'

export const metadata: Metadata = { title: 'New store' }

export default function NewStorePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          href="/stores"
          className="flex items-center gap-1 text-sm text-surface-500 hover:text-surface-700 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Stores
        </Link>
        <span className="text-surface-300">/</span>
        <span className="text-sm text-surface-900 font-medium">New store</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-surface-900">Create a new store</h1>
        <p className="text-sm text-surface-500 mt-1">
          You can customise every detail after creation.
        </p>
      </div>

      {/* Form card */}
      <div className="card p-6">
        <CreateStoreForm />
      </div>
    </div>
  )
}
