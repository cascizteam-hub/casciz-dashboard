'use client'

import Link from 'next/link'
import {
  ChevronLeft, Eye, EyeOff, Save, Rocket, Globe,
  CheckCircle2, AlertCircle, Loader2, Clock,
} from 'lucide-react'
import type { SaveState } from '@/store/slices/builder.store'
import { cn } from '@/lib/utils'

interface Props {
  storeId:       string
  pageTitle:     string
  pageStatus:    'DRAFT' | 'PUBLISHED'
  saveState:     SaveState
  isPreviewMode: boolean
  onSaveNow:     () => Promise<void>
  onPublish:     () => Promise<void>
  onUnpublish:   () => Promise<void>
  onTogglePreview: () => void
}

const SAVE_STATE_CONFIG: Record<SaveState, { icon: React.ReactNode; label: string; color: string }> = {
  saved:   { icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: 'Saved',     color: 'text-green-600' },
  unsaved: { icon: <Clock        className="h-3.5 w-3.5" />, label: 'Unsaved',   color: 'text-surface-400' },
  saving:  { icon: <Loader2      className="h-3.5 w-3.5 animate-spin" />, label: 'Saving…', color: 'text-primary-500' },
  error:   { icon: <AlertCircle  className="h-3.5 w-3.5" />, label: 'Save failed', color: 'text-red-500' },
}

export default function BuilderTopBar({
  storeId, pageTitle, pageStatus, saveState,
  isPreviewMode, onSaveNow, onPublish, onUnpublish, onTogglePreview,
}: Props) {
  const { icon, label, color } = SAVE_STATE_CONFIG[saveState]

  return (
    <header className="flex items-center justify-between h-14 px-4 bg-surface-0 border-b border-surface-200 flex-shrink-0 z-20">
      {/* Left: Back + page title */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href={`/stores/${storeId}`}
          className="flex items-center gap-1 text-sm text-surface-500 hover:text-surface-700 transition-colors flex-shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:block">Back</span>
        </Link>
        <span className="text-surface-200 hidden sm:block">/</span>
        <h1 className="text-sm font-semibold text-surface-900 truncate">{pageTitle}</h1>
      </div>

      {/* Centre: save state */}
      <div className={cn('flex items-center gap-1.5 text-xs font-medium', color)}>
        {icon}
        <span className="hidden sm:block">{label}</span>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Manual save */}
        <button
          onClick={onSaveNow}
          disabled={saveState === 'saved' || saveState === 'saving'}
          className="btn-ghost text-xs h-8 px-3 gap-1.5 disabled:opacity-40"
          aria-label="Save now"
        >
          <Save className="h-3.5 w-3.5" />
          <span className="hidden sm:block">Save</span>
        </button>

        {/* Preview toggle */}
        <button
          onClick={onTogglePreview}
          className={cn(
            'btn h-8 px-3 text-xs gap-1.5 rounded-lg',
            isPreviewMode
              ? 'bg-surface-100 text-surface-700 hover:bg-surface-200'
              : 'btn-ghost',
          )}
          aria-label={isPreviewMode ? 'Exit preview' : 'Preview page'}
        >
          {isPreviewMode
            ? <><EyeOff className="h-3.5 w-3.5" /> <span className="hidden sm:block">Edit</span></>
            : <><Eye    className="h-3.5 w-3.5" /> <span className="hidden sm:block">Preview</span></>
          }
        </button>

        {/* Publish / Unpublish */}
        {pageStatus === 'DRAFT' ? (
          <button
            onClick={onPublish}
            className="btn-primary h-8 px-3 text-xs gap-1.5"
          >
            <Rocket className="h-3.5 w-3.5" />
            <span className="hidden sm:block">Publish</span>
          </button>
        ) : (
          <button
            onClick={onUnpublish}
            className="btn-secondary h-8 px-3 text-xs gap-1.5"
          >
            <Globe className="h-3.5 w-3.5" />
            <span className="hidden sm:block">Unpublish</span>
          </button>
        )}
      </div>
    </header>
  )
}
