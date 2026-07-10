'use client'

import { useCallback, useEffect, useRef } from 'react'
import { pageApi } from '@/lib/api/page.api'
import { useBuilderStore } from '@/store/slices/builder.store'
import { createBlock } from '@/lib/builder/block-registry'
import type { BlockType } from '@/types/builder'

const AUTO_SAVE_DELAY_MS = 2000

export function useBuilder(storeId: string, pageId: string) {
  const store = useBuilderStore()
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevSaveState = useRef(store.saveState)

  const loadPage = useCallback(async () => {
    try {
      const { data } = await pageApi.getById(storeId, pageId)
      if (data.data) {
        store.loadDocument(data.data.content, pageId, storeId)
      }
    } catch (err) {
      console.error('Failed to load page:', err)
    }
  }, [storeId, pageId])

  useEffect(() => {
    loadPage()
  }, [loadPage])

  const triggerAutoSave = useCallback(async () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(async () => {
      store.setSaveState('saving')
      try {
        await pageApi.saveContent(storeId, pageId, { content: store.getDocument() })
        store.setSaveState('saved')
      } catch {
        store.setSaveState('error')
      }
    }, AUTO_SAVE_DELAY_MS)
  }, [storeId, pageId, store])

  // Watch saveState changes
  useEffect(() => {
    if (store.saveState === 'unsaved' && prevSaveState.current !== 'unsaved') {
      triggerAutoSave()
    }
    prevSaveState.current = store.saveState
  }, [store.saveState, triggerAutoSave])

  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    }
  }, [])

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

  const addBlock = useCallback(
    (type: BlockType) => {
      const block = createBlock(type, store.blocks.length)
      store.addBlock(block)
      store.selectBlock(block.id)
    },
    [store],
  )

  const publishPage = useCallback(async () => {
    await saveNow()
    await pageApi.publish(storeId, pageId)
  }, [storeId, pageId, saveNow])

  const unpublishPage = useCallback(async () => {
    await pageApi.unpublish(storeId, pageId)
  }, [storeId, pageId])

  return {
    blocks:          store.blocks,
    theme:           store.theme,
    selectedBlockId: store.selectedBlockId,
    isDragging:      store.isDragging,
    saveState:       store.saveState,
    isPreviewMode:   store.isPreviewMode,
    addBlock,
    updateBlock:     store.updateBlock,
    moveBlock:       store.moveBlock,
    duplicateBlock:  store.duplicateBlock,
    removeBlock:     store.removeBlock,
    selectBlock:     store.selectBlock,
    updateTheme:     store.updateTheme,
    setDragging:     store.setDragging,
    togglePreview:   store.togglePreview,
    getSelectedBlock: store.getSelectedBlock,
    saveNow,
    publishPage,
    unpublishPage,
  }
}
