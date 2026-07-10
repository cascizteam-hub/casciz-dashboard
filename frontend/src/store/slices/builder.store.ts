import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { BuilderBlock, PageDocument, PageTheme } from '@/types/builder'
import { DEFAULT_PAGE_DOCUMENT } from '@/lib/builder/block-registry'

export type SaveState = 'saved' | 'unsaved' | 'saving' | 'error'

interface BuilderState {
  pageId:          string | null
  storeId:         string | null
  blocks:          BuilderBlock[]
  theme:           Partial<PageTheme>
  selectedBlockId: string | null
  isDragging:      boolean
  saveState:       SaveState
  isPreviewMode:   boolean

  loadDocument:    (doc: PageDocument, pageId: string, storeId: string) => void
  addBlock:        (block: BuilderBlock) => void
  updateBlock:     (blockId: string, props: Partial<BuilderBlock['props']>) => void
  moveBlock:       (fromIndex: number, toIndex: number) => void
  duplicateBlock:  (blockId: string) => void
  removeBlock:     (blockId: string) => void
  updateTheme:     (theme: Partial<PageTheme>) => void
  selectBlock:     (blockId: string | null) => void
  setDragging:     (dragging: boolean) => void
  setSaveState:    (state: SaveState) => void
  togglePreview:   () => void
  getDocument:     () => PageDocument
  getSelectedBlock: () => BuilderBlock | null
}

export const useBuilderStore = create<BuilderState>()(
  devtools(
    (set, get) => ({
      pageId:          null,
      storeId:         null,
      blocks:          DEFAULT_PAGE_DOCUMENT.blocks,
      theme:           DEFAULT_PAGE_DOCUMENT.theme,
      selectedBlockId: null,
      isDragging:      false,
      saveState:       'saved',
      isPreviewMode:   false,

      loadDocument: (doc, pageId, storeId) =>
        set({ blocks: doc.blocks ?? [], theme: doc.theme ?? {}, pageId, storeId, selectedBlockId: null, saveState: 'saved' }),

      addBlock: (block) =>
        set((state) => ({
          blocks: [...state.blocks, { ...block, order: state.blocks.length }],
          saveState: 'unsaved',
        })),

      updateBlock: (blockId, props) =>
        set((state) => ({
          blocks: state.blocks.map((b) =>
            b.id === blockId ? { ...b, props: { ...b.props, ...props } as BuilderBlock['props'] } : b
          ),
          saveState: 'unsaved',
        })),

      moveBlock: (fromIndex, toIndex) =>
        set((state) => {
          const newBlocks = [...state.blocks]
          const [moved] = newBlocks.splice(fromIndex, 1)
          newBlocks.splice(toIndex, 0, moved)
          return { blocks: newBlocks.map((b, i) => ({ ...b, order: i })), saveState: 'unsaved' }
        }),

      duplicateBlock: (blockId) =>
        set((state) => {
          const idx = state.blocks.findIndex((b) => b.id === blockId)
          if (idx === -1) return state
          const copy = { ...state.blocks[idx], id: crypto.randomUUID() }
          const newBlocks = [...state.blocks]
          newBlocks.splice(idx + 1, 0, copy)
          return { blocks: newBlocks.map((b, i) => ({ ...b, order: i })), selectedBlockId: copy.id, saveState: 'unsaved' }
        }),

      removeBlock: (blockId) =>
        set((state) => ({
          blocks: state.blocks.filter((b) => b.id !== blockId).map((b, i) => ({ ...b, order: i })),
          selectedBlockId: state.selectedBlockId === blockId ? null : state.selectedBlockId,
          saveState: 'unsaved',
        })),

      updateTheme: (theme) =>
        set((state) => ({ theme: { ...state.theme, ...theme }, saveState: 'unsaved' })),

      selectBlock:   (selectedBlockId) => set({ selectedBlockId }),
      setDragging:   (isDragging)      => set({ isDragging }),
      setSaveState:  (saveState)       => set({ saveState }),
      togglePreview: ()                => set((state) => ({ isPreviewMode: !state.isPreviewMode })),

      getDocument: () => {
        const { blocks, theme } = get()
        return { blocks, theme }
      },

      getSelectedBlock: () => {
        const { blocks, selectedBlockId } = get()
        return blocks.find((b) => b.id === selectedBlockId) ?? null
      },
    }),
    { name: 'BuilderStore' },
  ),
)
