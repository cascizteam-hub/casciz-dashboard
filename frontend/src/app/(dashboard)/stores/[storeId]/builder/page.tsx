'use client'

import { use, useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus } from 'lucide-react'
import { useBuilder } from '@/hooks/useBuilder'
import { pageApi } from '@/lib/api/page.api'
import BuilderTopBar from '@/components/builder/panels/BuilderTopBar'
import BlockPicker from '@/components/builder/panels/BlockPicker'
import BlockInspector from '@/components/builder/panels/BlockInspector'
import PagesList from '@/components/builder/panels/PagesList'
import BuilderCanvas from '@/components/builder/canvas/BuilderCanvas'
import BlockRenderer from '@/components/builder/blocks/BlockRenderer'
import type { BlockType, PageSummary } from '@/types/builder'
import { cn } from '@/lib/utils'

interface Props {
  params: Promise<{ storeId: string }>
}

type LeftPanel = 'blocks' | 'pages'

function BuilderPageInner({ params }: Props) {
  const { storeId }  = use(params)
  const searchParams = useSearchParams()
  const pageId       = searchParams.get('pageId') ?? ''

  const [pages,      setPages]      = useState<PageSummary[]>([])
  const [pageTitle,  setPageTitle]  = useState('Page')
  const [pageStatus, setPageStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT')
  const [leftPanel,  setLeftPanel]  = useState<LeftPanel>('blocks')
  const [inspecting, setInspecting] = useState(false)

  const {
    blocks, selectedBlockId, saveState, isPreviewMode,
    addBlock, updateBlock, moveBlock, duplicateBlock, removeBlock,
    selectBlock, setDragging, togglePreview,
    getSelectedBlock,
    saveNow, publishPage, unpublishPage,
  } = useBuilder(storeId, pageId)

  // Load page list and current page meta
  useEffect(() => {
    if (!storeId || !pageId) return
    pageApi.list(storeId).then(({ data }) => {
      if (data.data) {
        setPages(data.data)
        const current = data.data.find((p) => p.id === pageId)
        if (current) {
          setPageTitle(current.title)
          setPageStatus(current.status)
        }
      }
    })
  }, [storeId, pageId])

  const handleAddBlock = useCallback((type: BlockType) => {
    addBlock(type)
  }, [addBlock])

  const handleDropNewBlock = useCallback((type: BlockType) => {
    addBlock(type)
  }, [addBlock])

  const handleOpenInspector = useCallback((id: string) => {
    selectBlock(id)
    setInspecting(true)
  }, [selectBlock])

  const handlePublish = useCallback(async () => {
    await publishPage()
    setPageStatus('PUBLISHED')
  }, [publishPage])

  const handleUnpublish = useCallback(async () => {
    await unpublishPage()
    setPageStatus('DRAFT')
  }, [unpublishPage])

  const selectedBlock = getSelectedBlock()

  // Redirect if no pageId
  if (!pageId) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-50">
        <div className="text-center">
          <p className="text-surface-500 text-sm mb-4">No page selected.</p>
          <a href={`/stores/${storeId}`} className="btn-primary">Back to store</a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-surface-50 overflow-hidden">
      {/* Top bar */}
      <BuilderTopBar
        storeId={storeId}
        pageTitle={pageTitle}
        pageStatus={pageStatus}
        saveState={saveState}
        isPreviewMode={isPreviewMode}
        onSaveNow={saveNow}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
        onTogglePreview={togglePreview}
      />

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left sidebar ──────────────────────────────────────────────── */}
        {!isPreviewMode && (
          <aside className="w-64 flex-shrink-0 bg-surface-0 border-r border-surface-200 flex flex-col overflow-hidden">
            {/* Tab switcher */}
            <div className="flex border-b border-surface-200">
              {(['blocks', 'pages'] as const).map((panel) => (
                <button
                  key={panel}
                  onClick={() => setLeftPanel(panel)}
                  className={cn(
                    'flex-1 py-2.5 text-xs font-medium capitalize transition-colors',
                    leftPanel === panel
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-surface-500 hover:text-surface-700',
                  )}
                >
                  {panel}
                </button>
              ))}
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-hidden">
              {leftPanel === 'blocks' ? (
                <BlockPicker onAddBlock={handleAddBlock} />
              ) : (
                <PagesList
                  storeId={storeId}
                  pages={pages}
                  activePageId={pageId}
                />
              )}
            </div>
          </aside>
        )}

        {/* ── Canvas ─────────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-surface-100">
          <div className={cn(
            'min-h-full',
            isPreviewMode ? 'max-w-none' : 'max-w-4xl mx-auto shadow-lg my-4 rounded-xl overflow-hidden',
          )}>
            {isPreviewMode ? (
              /* Preview mode: pure output, no toolbars */
              <div className="bg-white min-h-screen">
                {blocks.map((block) => (
                  <BlockRenderer key={block.id} block={block} />
                ))}
                {blocks.length === 0 && (
                  <div className="flex items-center justify-center min-h-screen">
                    <p className="text-surface-400 text-sm">This page has no content yet.</p>
                  </div>
                )}
              </div>
            ) : (
              <BuilderCanvas
                blocks={blocks}
                selectedBlockId={selectedBlockId}
                isDragging={false}
                onSelectBlock={selectBlock}
                onMoveBlock={moveBlock}
                onDuplicateBlock={duplicateBlock}
                onRemoveBlock={removeBlock}
                onSetDragging={setDragging}
                onOpenInspector={handleOpenInspector}
                onDropNewBlock={handleDropNewBlock}
              />
            )}
          </div>
        </main>

        {/* ── Right inspector sidebar ─────────────────────────────────── */}
        {!isPreviewMode && (
          <aside
            className={cn(
              'w-72 flex-shrink-0 bg-surface-0 border-l border-surface-200 flex flex-col overflow-hidden',
              'transition-all duration-200',
              inspecting && selectedBlock ? 'translate-x-0' : 'translate-x-full lg:translate-x-0',
            )}
          >
            {inspecting && selectedBlock ? (
              <BlockInspector
                block={selectedBlock}
                onUpdate={updateBlock}
                onClose={() => { setInspecting(false); selectBlock(null) }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-6 py-8">
                <div className="h-12 w-12 rounded-2xl bg-surface-100 flex items-center justify-center mb-3">
                  <Plus className="h-5 w-5 text-surface-400" />
                </div>
                <p className="text-xs font-medium text-surface-700 mb-1">No block selected</p>
                <p className="text-xs text-surface-400">
                  Click any block on the canvas to edit its properties here.
                </p>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  )
}

export default function BuilderPage({ params }: Props) {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-surface-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    }>
      <BuilderPageInner params={params} />
    </Suspense>
  )
}
