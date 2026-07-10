'use client'

import { useState } from 'react'
import {
  LayoutTemplate, AlignLeft, Image, Columns, Megaphone,
  LayoutGrid, Quote, Zap, PlayCircle, Share2, Mail,
  Minus, GripHorizontal, Search,
} from 'lucide-react'
import { BLOCK_REGISTRY, CATEGORY_LABELS } from '@/lib/builder/block-registry'
import { cn } from '@/lib/utils'
import type { BlockType } from '@/types/builder'

// Map icon strings → Lucide components
const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutTemplate: <LayoutTemplate className="h-4 w-4" />,
  AlignLeft:      <AlignLeft      className="h-4 w-4" />,
  Image:          <Image          className="h-4 w-4" />,
  Columns:        <Columns        className="h-4 w-4" />,
  Megaphone:      <Megaphone      className="h-4 w-4" />,
  LayoutGrid:     <LayoutGrid     className="h-4 w-4" />,
  Quote:          <Quote          className="h-4 w-4" />,
  Zap:            <Zap            className="h-4 w-4" />,
  PlayCircle:     <PlayCircle     className="h-4 w-4" />,
  Share2:         <Share2         className="h-4 w-4" />,
  Mail:           <Mail           className="h-4 w-4" />,
  Minus:          <Minus          className="h-4 w-4" />,
  GripHorizontal: <GripHorizontal className="h-4 w-4" />,
}

interface Props {
  onAddBlock: (type: BlockType) => void
}

export default function BlockPicker({ onAddBlock }: Props) {
  const [search, setSearch] = useState('')

  const filtered = BLOCK_REGISTRY.filter(
    (b) =>
      b.label.toLowerCase().includes(search.toLowerCase()) ||
      b.description.toLowerCase().includes(search.toLowerCase()),
  )

  const categories = ['content', 'layout', 'media', 'interactive'] as const
  const grouped = categories.map((cat) => ({
    category: cat,
    label:    CATEGORY_LABELS[cat],
    blocks:   filtered.filter((b) => b.category === cat),
  })).filter((g) => g.blocks.length > 0)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-surface-200">
        <h2 className="text-xs font-semibold text-surface-700 uppercase tracking-wider mb-2">
          Blocks
        </h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-surface-400 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search blocks…"
            className="input text-xs py-1.5 pl-8 pr-3"
          />
        </div>
      </div>

      {/* Block list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {grouped.length === 0 && (
          <p className="text-xs text-surface-400 text-center py-4">No blocks match your search.</p>
        )}
        {grouped.map(({ category, label, blocks }) => (
          <div key={category}>
            <p className="text-xs font-medium text-surface-400 uppercase tracking-wider mb-2 px-1">
              {label}
            </p>
            <div className="space-y-1">
              {blocks.map((entry) => (
                <button
                  key={entry.type}
                  onClick={() => onAddBlock(entry.type)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left',
                    'border border-transparent',
                    'text-surface-700 hover:bg-primary-50 hover:border-primary-100 hover:text-primary-700',
                    'transition-colors duration-100 group',
                  )}
                  title={entry.description}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-surface-100 group-hover:bg-primary-100 transition-colors flex-shrink-0">
                    {ICON_MAP[entry.icon]}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium leading-tight truncate">{entry.label}</p>
                    <p className="text-xs text-surface-400 leading-tight truncate mt-0.5">
                      {entry.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
