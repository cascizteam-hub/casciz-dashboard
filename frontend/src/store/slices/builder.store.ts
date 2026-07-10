import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import type { BuilderBlock, PageDocument, PageTheme } from '@/types/builder'
import { DEFAULT_PAGE_DOCUMENT } from '@/lib/builder/block-registry'

// ── State ─────────────────────────────────────────────────────────────────

export type SaveState = 'saved' | 'unsaved' | 'saving' | 'error'

interface BuilderState {
  // Identity
  pageId:          string | null
  storeId:         string | null

  // Document
  blocks:          BuilderBlock[]
  theme:           Partial<PageTheme>

  // UI state
  selectedBlockId: string | null
  isDragging:      boolean
  saveState:       SaveState
  isPreviewMode:   boolean

  // Actions – document
  loadDocument:    (doc: PageDocument, pageId: string, storeId: string) => void
  addBlock:        (block: BuilderBlock) => void
  insertBlockAt:   (block: BuilderBlock, index: number) => void
  updateBlock:     (blockId: string, props: Partial<BuilderBlock['props']>) => void
  moveBlock:       (fromIndex: number, toIndex: number) => void
  duplicateBlock:  (blockId: string) => void
  removeBlock:     (blockId: string) => void
  updateTheme:     (theme: Partial<PageTheme>) => void

  // Actions – selection
  selectBlock:     (blockId: string | null) => void

  // Actions – drag
  setDragging:     (dragging: boolean) => void

  // Actions – save
  setSaveState:    (state: SaveState) => void

  // Actions – preview
  togglePreview:   () => void

  // Computed
  getDocument:     () => PageDocument
  getSelectedBlock: () => BuilderBlock | null
}

// ── Store ─────────────────────────────────────────────────────────────────

export const useBuilderStore = create<BuilderState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      pageId:          null,
      storeId:         null,
      blocks:          DEFAULT_PAGE_DOCUMENT.blocks,
      theme:           DEFAULT_PAGE_DOCUMENT.theme,
      selectedBlockId: null,
      isDragging:      false,
      saveState:       'saved',
      isPreviewMode:   false,

      loadDocument: (doc, pageId, storeId) =>
        set({
          blocks:          doc.blocks ?? [],
          theme:           doc.theme  ?? {},
          pageId,
          storeId,
          selectedBlockId: null,
          saveState:       'saved',
        }, false, 'loadDocument'),

      addBlock: (block) =>
        set((state) => ({
          blocks:    [...state.blocks, { ...block, order: state.blocks.length }],
          saveState: 'unsaved',
        }), false, 'addBlock'),

      insertBlockAt: (block, index) =>
        set((state) => {
          const newBlocks = [...state.blocks]
          newBlocks.splice(index, 0, block)
          return {
            blocks:    newBlocks.map((b, i) => ({ ...b, order: i })),
            saveState: 'unsaved',
          }
        }, false, 'insertBlockAt'),

      updateBlock: (blockId, props) =>
        set((state) => ({
          blocks: state.blocks.map((b) =>
            b.id === blockId
              ? { ...b, props: { ...b.props, ...props } }
              : b,
          ),
          saveState: 'unsaved',
        }), false, 'updateBlock'),

      moveBlock: (fromIndex, toIndex) =>
        set((state) => {
          const newBlocks = [...state.blocks]
          const [moved]   = newBlocks.splice(fromIndex, 1)
          newBlocks.splice(toIndex, 0, moved)
          return {
            blocks:    newBlocks.map((b, i) => ({ ...b, order: i })),
            saveState: 'unsaved',
          }
        }, false, 'moveBlock'),

      duplicateBlock: (blockId) =>
        set((state) => {
          const idx = state.blocks.findIndex((b) => b.id === blockId)
          if (idx === -1) return state
          const original = state.blocks[idx]
          const copy = { ...original, id: crypto.randomUUID() }
          const newBlocks = [...state.blocks]
          newBlocks.splice(idx + 1, 0, copy)
          return {
            blocks:          newBlocks.map((b, i) => ({ ...b, order: i })),
            selectedBlockId: copy.id,
            saveState:       'unsaved',
          }
        }, false, 'duplicateBlock'),

      removeBlock: (blockId) =>
        set((state) => ({
          blocks:          state.blocks
                             .filter((b) => b.id !== blockId)
                             .map((b, i) => ({ ...b, order: i })),
          selectedBlockId: state.selectedBlockId === blockId ? null : state.selectedBlockId,
          saveState:       'unsaved',
        }), false, 'removeBlock'),

      updateTheme: (theme) =>
        set((state) => ({
          theme:     { ...state.theme, ...theme },
          saveState: 'unsaved',
        }), false, 'updateTheme'),

      selectBlock: (blockId) =>
        set({ selectedBlockId: blockId }, false, 'selectBlock'),

      setDragging: (isDragging) =>
        set({ isDragging }, false, 'setDragging'),

      setSaveState: (saveState) =>
        set({ saveState }, false, 'setSaveState'),

      togglePreview: () =>
        set((state) => ({ isPreviewMode: !state.isPreviewMode }), false, 'togglePreview'),

      getDocument: () => {
        const { blocks, theme } = get()
        return { blocks, theme }
      },

      getSelectedBlock: () => {
        const { blocks, selectedBlockId } = get()
        return blocks.find((b) => b.id === selectedBlockId) ?? null
      },
    })),
    { name: 'BuilderStore' },
  ),
)
