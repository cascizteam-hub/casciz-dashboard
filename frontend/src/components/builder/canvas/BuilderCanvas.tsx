'use client'

import { useState, useRef } from 'react'
import { GripVertical, Trash2, Copy, ChevronUp, ChevronDown, Settings } from 'lucide-react'
import BlockRenderer from '@/components/builder/blocks/BlockRenderer'
import { cn } from '@/lib/utils'
import type { BuilderBlock, BlockType } from '@/types/builder'

interface Props {
  blocks:          BuilderBlock[]
  selectedBlockId: string | null
  isDragging:      boolean
  onSelectBlock:   (id: string | null) => void
  onMoveBlock:     (fromIndex: number, toIndex: number) => void
  onDuplicateBlock: (id: string) => void
  onRemoveBlock:   (id: string) => void
  onSetDragging:   (dragging: boolean) => void
  onOpenInspector: (id: string) => void
  onDropNewBlock:  (type: BlockType, atIndex: number) => void
}

interface DropZoneProps {
  index:        number
  isDraggingOver: boolean
  onDragOver:   (e: React.DragEvent, index: number) => void
  onDragLeave:  () => void
  onDrop:       (e: React.DragEvent, index: number) => void
}

function DropZone({ index, isDraggingOver, onDragOver, onDragLeave, onDrop }: DropZoneProps) {
  return (
    <div
      className={cn(
        'transition-all duration-150 flex items-center justify-center',
        isDraggingOver
          ? 'h-12 bg-primary-50 border-2 border-dashed border-primary-400 rounded-lg mx-4'
          : 'h-2 mx-4',
      )}
      onDragOver={(e) => { e.preventDefault(); onDragOver(e, index) }}
      onDragLeave={onDragLeave}
      onDrop={(e) => { e.preventDefault(); onDrop(e, index) }}
    >
      {isDraggingOver && (
        <span className="text-xs text-primary-600 font-medium">Drop here</span>
      )}
    </div>
  )
}

export default function BuilderCanvas({
  blocks, selectedBlockId,
  onSelectBlock, onMoveBlock, onDuplicateBlock, onRemoveBlock,
  onSetDragging, onOpenInspector, onDropNewBlock,
}: Props) {
  const [dragOverIndex,  setDragOverIndex]  = useState<number | null>(null)
  const [draggingIndex, setDraggingIndex]  = useState<number | null>(null)
  const dragBlockType = useRef<BlockType | null>(null)

  const handleBlockDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('application/casciz-block-index', String(index))
    setDraggingIndex(index)
    onSetDragging(true)
  }

  const handleBlockDragEnd = () => {
    setDraggingIndex(null)
    setDragOverIndex(null)
    dragBlockType.current = null
    onSetDragging(false)
  }

  const handleDropZoneDragOver = (_e: React.DragEvent, index: number) => {
    setDragOverIndex(index)
  }

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    const fromIndex = e.dataTransfer.getData('application/casciz-block-index')
    const newBlockType = e.dataTransfer.getData('application/casciz-new-block-type') as BlockType

    if (newBlockType) {
      onDropNewBlock(newBlockType, toIndex)
    } else if (fromIndex !== '') {
      const from = Number(fromIndex)
      if (from !== toIndex && from !== toIndex - 1) {
        onMoveBlock(from, toIndex > from ? toIndex - 1 : toIndex)
      }
    }
    setDragOverIndex(null)
    setDraggingIndex(null)
    onSetDragging(false)
  }

  return (
    <div
      className="min-h-full bg-white"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('[data-block-id]') === null) {
          onSelectBlock(null)
        }
      }}
    >
      {/* First drop zone */}
      <DropZone
        index={0}
        isDraggingOver={dragOverIndex === 0}
        onDragOver={handleDropZoneDragOver}
        onDragLeave={() => setDragOverIndex(null)}
        onDrop={handleDrop}
      />

      {blocks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center px-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 mb-4">
            <GripVertical className="h-7 w-7 text-primary-400" />
          </div>
          <h3 className="text-base font-semibold text-surface-900 mb-1">
            Start building your page
          </h3>
          <p className="text-sm text-surface-500 max-w-xs">
            Click a block in the left panel to add it, or drag blocks here to reorder them.
          </p>
        </div>
      )}

      {blocks.map((block, index) => {
        const isSelected = block.id === selectedBlockId
        const isDraggingThis = draggingIndex === index

        return (
          <div key={block.id}>
            {/* Block wrapper */}
            <div
              data-block-id={block.id}
              draggable
              onDragStart={(e) => handleBlockDragStart(e, index)}
              onDragEnd={handleBlockDragEnd}
              onClick={(e) => { e.stopPropagation(); onSelectBlock(block.id) }}
              className={cn(
                'relative group transition-all duration-100',
                isSelected      && 'ring-2 ring-primary-500 ring-inset',
                isDraggingThis  && 'opacity-40',
              )}
            >
              {/* Block toolbar (shown on hover/select) */}
              <div
                className={cn(
                  'absolute top-2 right-2 z-10 flex items-center gap-1',
                  'bg-surface-900/80 backdrop-blur-sm rounded-lg px-1 py-1',
                  'opacity-0 group-hover:opacity-100 transition-opacity duration-100',
                  isSelected && 'opacity-100',
                )}
              >
                {/* Drag handle */}
                <span className="cursor-grab active:cursor-grabbing p-1 text-white hover:text-primary-300">
                  <GripVertical className="h-3.5 w-3.5" />
                </span>

                {/* Move up */}
                <button
                  onClick={(e) => { e.stopPropagation(); if (index > 0) onMoveBlock(index, index - 1) }}
                  disabled={index === 0}
                  className="p-1 text-white hover:text-primary-300 disabled:opacity-30"
                  aria-label="Move block up"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>

                {/* Move down */}
                <button
                  onClick={(e) => { e.stopPropagation(); if (index < blocks.length - 1) onMoveBlock(index, index + 1) }}
                  disabled={index === blocks.length - 1}
                  className="p-1 text-white hover:text-primary-300 disabled:opacity-30"
                  aria-label="Move block down"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>

                {/* Inspect */}
                <button
                  onClick={(e) => { e.stopPropagation(); onOpenInspector(block.id) }}
                  className="p-1 text-white hover:text-primary-300"
                  aria-label="Edit block properties"
                >
                  <Settings className="h-3.5 w-3.5" />
                </button>

                {/* Duplicate */}
                <button
                  onClick={(e) => { e.stopPropagation(); onDuplicateBlock(block.id) }}
                  className="p-1 text-white hover:text-primary-300"
                  aria-label="Duplicate block"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>

                {/* Delete */}
                <button
                  onClick={(e) => { e.stopPropagation(); onRemoveBlock(block.id) }}
                  className="p-1 text-red-400 hover:text-red-300"
                  aria-label="Delete block"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Block type label */}
              {isSelected && (
                <span className="absolute top-2 left-2 z-10 text-xs bg-primary-600 text-white px-2 py-0.5 rounded font-medium">
                  {block.type}
                </span>
              )}

              {/* The actual block content */}
              <BlockRenderer block={block} />
            </div>

            {/* Drop zone after each block */}
            <DropZone
              index={index + 1}
              isDraggingOver={dragOverIndex === index + 1}
              onDragOver={handleDropZoneDragOver}
              onDragLeave={() => setDragOverIndex(null)}
              onDrop={handleDrop}
            />
          </div>
        )
      })}
    </div>
  )
}
