'use client'

import { useCallback, useEffect, useRef } from 'react'
import { pageApi } from '@/lib/api/page.api'
import { useBuilderStore } from '@/store/slices/builder.store'
import { createBlock } from '@/lib/builder/block-registry'
import type { BlockType } from '@/types/builder'

const AUTO_SAVE_DELAY_MS = 2000

/**
 * Primary hook for the drag-and-drop builder.
 * Handles auto-save, API integration, and exposes all builder actions.
 */
export function useBuilder(storeId: string, pageId: string) {
  const store = useBuilderStore()
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Load page from API ────────────────────────────────────────────────

  const loadPage = useCallback(async () => {
    try {
      const { data } = await pageApi.getById(storeId, pageId)
      if (data.data) {
        store.loadDocument(data.data.content, pageId, storeId)
      }
    } catch (err) {
      console.error('Failed to load page:', err)
    }
  }, [storeId, pageId, store.loadDocument])

  useEffect(() => {
    loadPage()
  }, [loadPage])

  // ── Auto-save ─────────────────────────────────────────────────────────

  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(async () => {
      store.setSaveState('saving')
      try {
        await pageApi.saveContent(storeId, pageId, {
          content: store.getDocument(),
        })
        store.setSaveState('saved')
      } catch {
        store.setSaveState('error')
      }
    }, AUTO_SAVE_DELAY_MS)
  }, [storeId, pageId, store])

  // Subscribe to unsaved state → trigger auto-save
  useEffect(() => {
    const unsub = useBuilderStore.subscribe(
      (s) => s.saveState,
      (saveState) => {
        if (saveState === 'unsaved') triggerAutoSave()
      },
    )
    return () => {
      unsub()
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    }
  }, [triggerAutoSave])

  // ── Manual save ───────────────────────────────────────────────────────

  const saveNow = useCallback(async () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    store.setSaveState('saving')
    try {
      await pageApi.saveContent(storeId, pageId, { content: store.getDocument() })
      store.setSaveState('saved')
    } catch {
      store.setSaveState('error')
    }
  }, [storeId, pageId, store])

  // ── Add block from picker ─────────────────────────────────────────────

  const addBlock = useCallback(
    (type: BlockType) => {
      const block = createBlock(type, store.blocks.length)
      store.addBlock(block)
      store.selectBlock(block.id)
    },
    [store],
  )

  // ── Publish / Unpublish ───────────────────────────────────────────────

  const publishPage = useCallback(async () => {
    await saveNow()
    await pageApi.publish(storeId, pageId)
  }, [storeId, pageId, saveNow])

  const unpublishPage = useCallback(async () => {
    await pageApi.unpublish(storeId, pageId)
  }, [storeId, pageId])

  return {
    // State
    blocks:          store.blocks,
    theme:           store.theme,
    selectedBlockId: store.selectedBlockId,
    isDragging:      store.isDragging,
    saveState:       store.saveState,
    isPreviewMode:   store.isPreviewMode,

    // Actions
    addBlock,
    updateBlock:    store.updateBlock,
    moveBlock:      store.moveBlock,
    duplicateBlock: store.duplicateBlock,
    removeBlock:    store.removeBlock,
    selectBlock:    store.selectBlock,
    updateTheme:    store.updateTheme,
    setDragging:    store.setDragging,
    togglePreview:  store.togglePreview,
    getSelectedBlock: store.getSelectedBlock,

    // API
    saveNow,
    publishPage,
    unpublishPage,
  }
}
