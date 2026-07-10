'use client'

import Link from 'next/link'
import { Plus, FileText, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PageSummary } from '@/types/builder'

interface Props {
  storeId:       string
  pages:         PageSummary[]
  activePageId:  string
  onCreatePage?: () => void
}

export default function PagesList({ storeId, pages, activePageId, onCreatePage }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-200">
        <h2 className="text-xs font-semibold text-surface-700 uppercase tracking-wider">Pages</h2>
        <button
          onClick={onCreatePage}
          className="p-1 rounded text-surface-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
          aria-label="Add new page"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {pages.length === 0 && (
          <p className="text-xs text-surface-400 text-center py-6">No pages yet.</p>
        )}
        {pages.map((page) => (
          <Link
            key={page.id}
            href={`/stores/${storeId}/builder?pageId=${page.id}`}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs',
              'transition-colors duration-100',
              page.id === activePageId
                ? 'bg-primary-50 text-primary-700 font-semibold'
                : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900',
            )}
          >
            {page.status === 'PUBLISHED'
              ? <Globe className="h-3.5 w-3.5 flex-shrink-0 text-green-500" />
              : <FileText className="h-3.5 w-3.5 flex-shrink-0 text-surface-400" />
            }
            <span className="truncate">{page.title}</span>
            {page.type === 'HOME' && (
              <span className="ml-auto text-xs bg-surface-100 text-surface-500 px-1.5 py-0.5 rounded">
                Home
              </span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  )
}
