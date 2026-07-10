'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Plus, Pencil, Trash2, Globe, FileText, ExternalLink } from 'lucide-react'
import { pageApi } from '@/lib/api/page.api'
import { getErrorMessage } from '@/lib/utils'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import EmptyState from '@/components/shared/EmptyState'
import { Skeleton } from '@/components/shared/Skeletons'
import type { PageSummary, PageType } from '@/types/builder'
import CreatePageModal from '@/components/builder/panels/CreatePageModal'

interface Props {
  params: Promise<{ storeId: string }>
}

const PAGE_TYPE_LABELS: Record<PageType, string> = {
  HOME: 'Home', ABOUT: 'About', CONTACT: 'Contact', CATALOG: 'Catalog', CUSTOM: 'Custom',
}

export default function StorePagesPage({ params }: Props) {
  const { storeId }   = use(params)
  const [pages,       setPages]       = useState<PageSummary[]>([])
  const [isLoading,   setIsLoading]   = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isDeleting,  setIsDeleting]  = useState(false)
  const [showCreate,  setShowCreate]  = useState(false)
  const [error,       setError]       = useState<string | null>(null)

  const loadPages = async () => {
    setIsLoading(true)
    try {
      const { data } = await pageApi.list(storeId)
      if (data.data) setPages(data.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadPages() }, [storeId])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await pageApi.delete(storeId, deleteTarget)
      setPages((prev) => prev.filter((p) => p.id !== deleteTarget))
      setDeleteTarget(null)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePageCreated = (newPage: PageSummary) => {
    setPages((prev) => [...prev, newPage])
    setShowCreate(false)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link href={`/stores/${storeId}`}
          className="flex items-center gap-1 text-sm text-surface-500 hover:text-surface-700 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Store
        </Link>
        <span className="text-surface-300">/</span>
        <span className="text-sm text-surface-900 font-medium">Pages</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-900">Pages</h1>
          <p className="text-sm text-surface-500 mt-0.5">
            {pages.length} page{pages.length !== 1 ? 's' : ''} · Build and publish with the drag-and-drop editor
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus className="h-4 w-4" /> New page
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Pages list */}
      <div className="card divide-y divide-surface-100">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          ))
        ) : pages.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-7 w-7" />}
            title="No pages yet"
            description="Create your first page and open it in the drag-and-drop builder."
            action={
              <button onClick={() => setShowCreate(true)} className="btn-primary">
                <Plus className="h-4 w-4" /> Create first page
              </button>
            }
          />
        ) : (
          pages.map((page) => (
            <div key={page.id} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-50 transition-colors">
              {/* Status icon */}
              <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                page.status === 'PUBLISHED' ? 'bg-green-100 text-green-600' : 'bg-surface-100 text-surface-400'
              }`}>
                {page.status === 'PUBLISHED' ? <Globe className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
              </span>

              {/* Meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-surface-900 text-sm truncate">{page.title}</p>
                  <span className="text-xs bg-surface-100 text-surface-500 px-1.5 py-0.5 rounded flex-shrink-0">
                    {PAGE_TYPE_LABELS[page.type] ?? page.type}
                  </span>
                  {page.status === 'PUBLISHED' && (
                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded flex-shrink-0">
                      Published
                    </span>
                  )}
                </div>
                <p className="text-xs text-surface-500 mt-0.5 truncate">
                  /{page.slug || ''} · Updated {new Date(page.updatedAt).toLocaleDateString()}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  href={`/stores/${storeId}/builder?pageId=${page.id}`}
                  className="btn-secondary text-xs h-8 px-3 gap-1.5"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Link>
                {page.type !== 'HOME' && (
                  <button
                    onClick={() => setDeleteTarget(page.id)}
                    className="p-2 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    aria-label="Delete page"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create page modal */}
      {showCreate && (
        <CreatePageModal
          storeId={storeId}
          existingTypes={pages.map((p) => p.type)}
          onCreated={handlePageCreated}
          onClose={() => setShowCreate(false)}
        />
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete page"
        description="This will permanently delete the page and all its content. This cannot be undone."
        confirmLabel="Delete page"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
