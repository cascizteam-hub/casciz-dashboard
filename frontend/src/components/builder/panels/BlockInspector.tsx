'use client'

import { X } from 'lucide-react'
import type { BuilderBlock } from '@/types/builder'

interface Props {
  block:        BuilderBlock
  onUpdate:     (blockId: string, props: Partial<BuilderBlock['props']>) => void
  onClose:      () => void
}

// Small field helpers
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-surface-600">{label}</label>
      {children}
    </div>
  )
}

function TextField({
  label, value, onChange, multiline = false, placeholder = '',
}: {
  label: string; value: string; onChange: (v: string) => void
  multiline?: boolean; placeholder?: string
}) {
  return (
    <Field label={label}>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="input text-xs resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="input text-xs"
        />
      )}
    </Field>
  )
}

function SelectField<T extends string>({
  label, value, options, onChange,
}: {
  label: string; value: T
  options: Array<{ value: T; label: string }>
  onChange: (v: T) => void
}) {
  return (
    <Field label={label}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="input text-xs"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </Field>
  )
}

function NumberField({
  label, value, min, max, onChange,
}: {
  label: string; value: number; min: number; max: number
  onChange: (v: number) => void
}) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-primary-600"
        />
        <span className="text-xs text-surface-600 w-8 text-right">{value}</span>
      </div>
    </Field>
  )
}

function ColorField({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 cursor-pointer rounded border border-surface-200"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="input text-xs flex-1 font-mono"
        />
      </div>
    </Field>
  )
}

// ── Block-specific inspector panels ──────────────────────────────────────

function HeroInspector({ block, onUpdate }: { block: BuilderBlock; onUpdate: (p: object) => void }) {
  const p = block.props as import('@/types/builder').HeroProps
  return (
    <div className="space-y-4">
      <TextField label="Heading"    value={p.heading}    onChange={(v) => onUpdate({ heading: v })} />
      <TextField label="Subheading" value={p.subheading} onChange={(v) => onUpdate({ subheading: v })} multiline />
      <TextField label="CTA Button Text" value={p.ctaText} onChange={(v) => onUpdate({ ctaText: v })} />
      <TextField label="CTA URL"    value={p.ctaUrl}     onChange={(v) => onUpdate({ ctaUrl: v })} />
      <TextField label="Background Image URL" value={p.backgroundUrl} onChange={(v) => onUpdate({ backgroundUrl: v })} />
      <NumberField label="Overlay Opacity %" value={p.overlayOpacity} min={0} max={90} onChange={(v) => onUpdate({ overlayOpacity: v })} />
      <SelectField label="Text Align" value={p.textAlign}
        options={[{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }]}
        onChange={(v) => onUpdate({ textAlign: v })} />
      <SelectField label="Height" value={p.height}
        options={[{ value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }, { value: 'full', label: 'Full screen' }]}
        onChange={(v) => onUpdate({ height: v })} />
    </div>
  )
}

function TextInspector({ block, onUpdate }: { block: BuilderBlock; onUpdate: (p: object) => void }) {
  const p = block.props as import('@/types/builder').TextProps
  return (
    <div className="space-y-4">
      <TextField label="Body (markdown supported)" value={p.body} onChange={(v) => onUpdate({ body: v })} multiline placeholder="Enter text…" />
      <SelectField label="Alignment" value={p.textAlign}
        options={[{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }]}
        onChange={(v) => onUpdate({ textAlign: v })} />
      <SelectField label="Max Width" value={p.maxWidth}
        options={[{ value: 'narrow', label: 'Narrow' }, { value: 'normal', label: 'Normal' }, { value: 'wide', label: 'Wide' }]}
        onChange={(v) => onUpdate({ maxWidth: v })} />
    </div>
  )
}

function ImageInspector({ block, onUpdate }: { block: BuilderBlock; onUpdate: (p: object) => void }) {
  const p = block.props as import('@/types/builder').ImageProps
  return (
    <div className="space-y-4">
      <TextField label="Image URL" value={p.src}     onChange={(v) => onUpdate({ src: v })} />
      <TextField label="Alt text"  value={p.alt}     onChange={(v) => onUpdate({ alt: v })} />
      <TextField label="Caption"   value={p.caption} onChange={(v) => onUpdate({ caption: v })} />
      <TextField label="Link URL"  value={p.linkUrl} onChange={(v) => onUpdate({ linkUrl: v })} />
      <SelectField label="Width" value={p.width}
        options={[{ value: 'quarter', label: '25%' }, { value: 'half', label: '50%' }, { value: 'three-quarters', label: '75%' }, { value: 'full', label: 'Full' }]}
        onChange={(v) => onUpdate({ width: v })} />
      <SelectField label="Align" value={p.align}
        options={[{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }]}
        onChange={(v) => onUpdate({ align: v })} />
      <Field label="Rounded corners">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={p.rounded} onChange={(e) => onUpdate({ rounded: e.target.checked })} className="accent-primary-600" />
          <span className="text-xs text-surface-700">Enable</span>
        </label>
      </Field>
    </div>
  )
}

function BannerInspector({ block, onUpdate }: { block: BuilderBlock; onUpdate: (p: object) => void }) {
  const p = block.props as import('@/types/builder').BannerProps
  return (
    <div className="space-y-4">
      <TextField label="Text"      value={p.text}     onChange={(v) => onUpdate({ text: v })} />
      <TextField label="Link URL"  value={p.linkUrl}  onChange={(v) => onUpdate({ linkUrl: v })} />
      <TextField label="Link Text" value={p.linkText} onChange={(v) => onUpdate({ linkText: v })} />
      <ColorField label="Background Color" value={p.bgColor}   onChange={(v) => onUpdate({ bgColor: v })} />
      <ColorField label="Text Color"       value={p.textColor} onChange={(v) => onUpdate({ textColor: v })} />
      <Field label="Dismissible">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={p.dismissible} onChange={(e) => onUpdate({ dismissible: e.target.checked })} className="accent-primary-600" />
          <span className="text-xs text-surface-700">Allow users to dismiss</span>
        </label>
      </Field>
    </div>
  )
}

function TestimonialInspector({ block, onUpdate }: { block: BuilderBlock; onUpdate: (p: object) => void }) {
  const p = block.props as import('@/types/builder').TestimonialProps
  return (
    <div className="space-y-4">
      <TextField label="Quote"      value={p.quote}     onChange={(v) => onUpdate({ quote: v })} multiline />
      <TextField label="Author"     value={p.author}    onChange={(v) => onUpdate({ author: v })} />
      <TextField label="Role/Title" value={p.role}      onChange={(v) => onUpdate({ role: v })} />
      <TextField label="Avatar URL" value={p.avatarUrl} onChange={(v) => onUpdate({ avatarUrl: v })} />
      <SelectField label="Rating" value={String(p.rating) as '1' | '2' | '3' | '4' | '5'}
        options={[1,2,3,4,5].map((n) => ({ value: String(n) as '1'|'2'|'3'|'4'|'5', label: `${n} star${n !== 1 ? 's' : ''}` }))}
        onChange={(v) => onUpdate({ rating: Number(v) })} />
    </div>
  )
}

function CtaInspector({ block, onUpdate }: { block: BuilderBlock; onUpdate: (p: object) => void }) {
  const p = block.props as import('@/types/builder').CtaProps
  return (
    <div className="space-y-4">
      <TextField label="Heading"        value={p.heading}       onChange={(v) => onUpdate({ heading: v })} />
      <TextField label="Body"           value={p.body}          onChange={(v) => onUpdate({ body: v })} multiline />
      <TextField label="Primary Button" value={p.primaryText}   onChange={(v) => onUpdate({ primaryText: v })} />
      <TextField label="Primary URL"    value={p.primaryUrl}    onChange={(v) => onUpdate({ primaryUrl: v })} />
      <TextField label="Secondary Button" value={p.secondaryText} onChange={(v) => onUpdate({ secondaryText: v })} />
      <TextField label="Secondary URL"  value={p.secondaryUrl}  onChange={(v) => onUpdate({ secondaryUrl: v })} />
      <ColorField label="Background"    value={p.bgColor}       onChange={(v) => onUpdate({ bgColor: v })} />
    </div>
  )
}

function DividerInspector({ block, onUpdate }: { block: BuilderBlock; onUpdate: (p: object) => void }) {
  const p = block.props as import('@/types/builder').DividerProps
  return (
    <div className="space-y-4">
      <SelectField label="Style" value={p.style}
        options={[{ value: 'solid', label: 'Solid' }, { value: 'dashed', label: 'Dashed' }, { value: 'dotted', label: 'Dotted' }]}
        onChange={(v) => onUpdate({ style: v })} />
      <ColorField label="Color" value={p.color} onChange={(v) => onUpdate({ color: v })} />
    </div>
  )
}

function SpacerInspector({ block, onUpdate }: { block: BuilderBlock; onUpdate: (p: object) => void }) {
  const p = block.props as import('@/types/builder').SpacerProps
  return (
    <SelectField label="Height" value={p.height}
      options={[
        { value: 'xs', label: 'Extra small (16px)' },
        { value: 'sm', label: 'Small (32px)' },
        { value: 'md', label: 'Medium (48px)' },
        { value: 'lg', label: 'Large (64px)' },
        { value: 'xl', label: 'Extra large (96px)' },
      ]}
      onChange={(v) => onUpdate({ height: v })} />
  )
}

function VideoInspector({ block, onUpdate }: { block: BuilderBlock; onUpdate: (p: object) => void }) {
  const p = block.props as import('@/types/builder').VideoProps
  return (
    <div className="space-y-4">
      <TextField label="Embed URL (YouTube/Vimeo)" value={p.url}     onChange={(v) => onUpdate({ url: v })} />
      <TextField label="Caption"                   value={p.caption} onChange={(v) => onUpdate({ caption: v })} />
      <Field label="Options">
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={p.autoplay} onChange={(e) => onUpdate({ autoplay: e.target.checked })} className="accent-primary-600" />
            <span className="text-xs text-surface-700">Autoplay (muted)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={p.loop} onChange={(e) => onUpdate({ loop: e.target.checked })} className="accent-primary-600" />
            <span className="text-xs text-surface-700">Loop</span>
          </label>
        </div>
      </Field>
    </div>
  )
}

// ── Main inspector ────────────────────────────────────────────────────────

const BLOCK_LABELS: Record<string, string> = {
  HERO: 'Hero', TEXT: 'Text', IMAGE: 'Image', COLUMNS: 'Columns',
  BANNER: 'Banner', FEATURES: 'Features', TESTIMONIAL: 'Testimonial',
  CTA: 'Call to Action', DIVIDER: 'Divider', SPACER: 'Spacer',
  VIDEO: 'Video', SOCIAL_LINKS: 'Social Links', CONTACT_FORM: 'Contact Form',
}

export default function BlockInspector({ block, onUpdate, onClose }: Props) {
  const update = (props: object) => onUpdate(block.id, props as Partial<BuilderBlock['props']>)

  const renderEditor = () => {
    switch (block.type) {
      case 'HERO':        return <HeroInspector         block={block} onUpdate={update} />
      case 'TEXT':        return <TextInspector          block={block} onUpdate={update} />
      case 'IMAGE':       return <ImageInspector         block={block} onUpdate={update} />
      case 'BANNER':      return <BannerInspector        block={block} onUpdate={update} />
      case 'TESTIMONIAL': return <TestimonialInspector   block={block} onUpdate={update} />
      case 'CTA':         return <CtaInspector           block={block} onUpdate={update} />
      case 'DIVIDER':     return <DividerInspector       block={block} onUpdate={update} />
      case 'SPACER':      return <SpacerInspector        block={block} onUpdate={update} />
      case 'VIDEO':       return <VideoInspector         block={block} onUpdate={update} />
      default:
        return <p className="text-xs text-surface-400 text-center py-4">No properties available.</p>
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-200">
        <div>
          <h2 className="text-xs font-semibold text-surface-700 uppercase tracking-wider">
            {BLOCK_LABELS[block.type] ?? block.type}
          </h2>
          <p className="text-xs text-surface-400 mt-0.5">Edit block properties</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors"
          aria-label="Close inspector"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Properties */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {renderEditor()}
      </div>
    </div>
  )
}
