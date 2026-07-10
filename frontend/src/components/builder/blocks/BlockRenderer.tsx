'use client'

import type {
  BuilderBlock, HeroProps, TextProps, ImageProps,
  ColumnsProps, BannerProps, FeaturesProps, TestimonialProps,
  CtaProps, DividerProps, SpacerProps, VideoProps, SocialLinksProps,
} from '@/types/builder'
import { SPACER_HEIGHTS } from '@/lib/builder/block-registry'
import { cn } from '@/lib/utils'

// ── Individual block renderers ────────────────────────────────────────────

function HeroBlock({ props }: { props: HeroProps }) {
  const heightMap = { small: 'min-h-[280px]', medium: 'min-h-[400px]', large: 'min-h-[520px]', full: 'min-h-screen' }
  const alignMap  = { left: 'items-start text-left', center: 'items-center text-center', right: 'items-end text-right' }
  return (
    <div
      className={cn('relative flex flex-col justify-center px-8 py-16', heightMap[props.height] ?? heightMap.large)}
      style={{
        backgroundImage:    props.backgroundUrl ? `url(${props.backgroundUrl})` : undefined,
        backgroundSize:     'cover',
        backgroundPosition: 'center',
        backgroundColor:    props.backgroundUrl ? undefined : '#f1f3f9',
      }}
    >
      {props.backgroundUrl && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: (props.overlayOpacity ?? 30) / 100 }}
        />
      )}
      <div className={cn('relative z-10 max-w-3xl mx-auto w-full flex flex-col gap-5', alignMap[props.textAlign] ?? alignMap.center)}>
        <h1 className={cn('text-4xl font-bold font-display leading-tight', props.backgroundUrl ? 'text-white' : 'text-surface-900')}>
          {props.heading || 'Your Heading Here'}
        </h1>
        {props.subheading && (
          <p className={cn('text-lg leading-relaxed', props.backgroundUrl ? 'text-white/80' : 'text-surface-600')}>
            {props.subheading}
          </p>
        )}
        {props.ctaText && (
          <a
            href={props.ctaUrl || '#'}
            className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors self-auto"
          >
            {props.ctaText}
          </a>
        )}
      </div>
    </div>
  )
}

function TextBlock({ props }: { props: TextProps }) {
  const maxWidthMap = { narrow: 'max-w-lg', normal: 'max-w-2xl', wide: 'max-w-4xl' }
  return (
    <div className={cn('px-8 py-10 mx-auto', maxWidthMap[props.maxWidth] ?? maxWidthMap.normal, `text-${props.textAlign ?? 'left'}`)}>
      <p className="text-surface-700 leading-relaxed whitespace-pre-wrap text-base">
        {props.body || 'Enter your text…'}
      </p>
    </div>
  )
}

function ImageBlock({ props }: { props: ImageProps }) {
  const widthMap = { quarter: 'w-1/4', half: 'w-1/2', 'three-quarters': 'w-3/4', full: 'w-full' }
  const alignMap = { left: 'mr-auto', center: 'mx-auto', right: 'ml-auto' }
  return (
    <div className="px-8 py-6">
      {props.src ? (
        <figure className={cn(widthMap[props.width] ?? 'w-full', alignMap[props.align] ?? 'mx-auto')}>
          <img
            src={props.src}
            alt={props.alt}
            className={cn('w-full object-cover', props.rounded && 'rounded-xl')}
          />
          {props.caption && (
            <figcaption className="text-xs text-surface-500 text-center mt-2">{props.caption}</figcaption>
          )}
        </figure>
      ) : (
        <div className={cn('flex items-center justify-center bg-surface-100 rounded-xl h-40', widthMap[props.width] ?? 'w-full', alignMap[props.align] ?? 'mx-auto')}>
          <p className="text-xs text-surface-400">No image URL set</p>
        </div>
      )}
    </div>
  )
}

function ColumnsBlock({ props }: { props: ColumnsProps }) {
  const cols = props.columns ?? []
  return (
    <div className="px-8 py-10">
      <div className={cn('grid gap-8', props.count === 2 ? 'grid-cols-2' : props.count === 3 ? 'grid-cols-3' : 'grid-cols-4')}>
        {cols.map((col, i) => (
          <div key={i} className="flex flex-col items-center text-center gap-3">
            {col.icon && (
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 text-xl">
                {col.icon.charAt(0)}
              </span>
            )}
            <h3 className="font-semibold text-surface-900">{col.heading}</h3>
            <p className="text-sm text-surface-600 leading-relaxed">{col.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function BannerBlock({ props }: { props: BannerProps }) {
  return (
    <div
      className="flex items-center justify-center gap-4 px-6 py-3 text-sm font-medium"
      style={{ backgroundColor: props.bgColor ?? '#4f46e5', color: props.textColor ?? '#fff' }}
    >
      <span>{props.text}</span>
      {props.linkText && props.linkUrl && (
        <a href={props.linkUrl} className="underline font-semibold hover:opacity-80">{props.linkText}</a>
      )}
    </div>
  )
}

function FeaturesBlock({ props }: { props: FeaturesProps }) {
  return (
    <div className="px-8 py-12">
      {props.heading && (
        <h2 className="text-2xl font-bold text-surface-900 text-center mb-8 font-display">{props.heading}</h2>
      )}
      <div className={cn('gap-6', props.layout === 'grid' ? 'grid grid-cols-3' : 'flex flex-col max-w-2xl mx-auto')}>
        {(props.features ?? []).map((f, i) => (
          <div key={i} className={cn('flex gap-4', props.layout === 'list' && 'items-start')}>
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 font-bold">
              {f.icon?.charAt(0) ?? '✓'}
            </span>
            <div>
              <h3 className="font-semibold text-surface-900 mb-1">{f.title}</h3>
              <p className="text-sm text-surface-600 leading-relaxed">{f.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TestimonialBlock({ props }: { props: TestimonialProps }) {
  return (
    <div className="px-8 py-12 max-w-2xl mx-auto text-center">
      <div className="flex justify-center gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={i < (props.rating ?? 5) ? 'text-yellow-400' : 'text-surface-200'}>★</span>
        ))}
      </div>
      <blockquote className="text-lg text-surface-700 leading-relaxed mb-6 italic">
        {props.quote || '"Add your testimonial here."'}
      </blockquote>
      <div className="flex items-center justify-center gap-3">
        {props.avatarUrl && (
          <img src={props.avatarUrl} alt={props.author} className="h-10 w-10 rounded-full object-cover" />
        )}
        <div className="text-left">
          <p className="font-semibold text-surface-900 text-sm">{props.author || 'Customer name'}</p>
          <p className="text-xs text-surface-500">{props.role}</p>
        </div>
      </div>
    </div>
  )
}

function CtaBlock({ props }: { props: CtaProps }) {
  return (
    <div
      className="px-8 py-14 text-center"
      style={{ backgroundColor: props.bgColor ?? '#f1f3f9' }}
    >
      <div className="max-w-xl mx-auto space-y-4">
        <h2 className="text-2xl font-bold font-display text-surface-900">{props.heading}</h2>
        {props.body && <p className="text-surface-600">{props.body}</p>}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {props.primaryText && (
            <a href={props.primaryUrl || '#'} className="btn-primary">{props.primaryText}</a>
          )}
          {props.secondaryText && (
            <a href={props.secondaryUrl || '#'} className="btn-secondary">{props.secondaryText}</a>
          )}
        </div>
      </div>
    </div>
  )
}

function DividerBlock({ props }: { props: DividerProps }) {
  return (
    <div className="px-8 py-4">
      <hr style={{ borderColor: props.color ?? '#e2e6f0', borderStyle: props.style ?? 'solid', borderTopWidth: 1 }} />
    </div>
  )
}

function SpacerBlock({ props }: { props: SpacerProps }) {
  return <div style={{ height: SPACER_HEIGHTS[props.height] ?? '48px' }} aria-hidden="true" />
}

function VideoBlock({ props }: { props: VideoProps }) {
  if (!props.url) {
    return (
      <div className="px-8 py-6">
        <div className="flex items-center justify-center bg-surface-100 rounded-xl h-48">
          <p className="text-xs text-surface-400">Add a YouTube or Vimeo embed URL</p>
        </div>
      </div>
    )
  }
  return (
    <div className="px-8 py-6">
      <div className="aspect-video rounded-xl overflow-hidden">
        <iframe
          src={props.url}
          className="w-full h-full"
          allow="autoplay; fullscreen"
          allowFullScreen
          title={props.caption || 'Video'}
        />
      </div>
      {props.caption && <p className="text-xs text-surface-500 text-center mt-2">{props.caption}</p>}
    </div>
  )
}

function SocialLinksBlock({ props }: { props: SocialLinksProps }) {
  const platformLabels: Record<string, string> = {
    facebook: 'Facebook', instagram: 'Instagram', twitter: 'Twitter/X',
    tiktok: 'TikTok', youtube: 'YouTube', pinterest: 'Pinterest', linkedin: 'LinkedIn',
  }
  return (
    <div className={cn('flex gap-3 px-8 py-8', props.layout === 'column' ? 'flex-col max-w-xs' : 'flex-row flex-wrap justify-center')}>
      {(props.links ?? []).filter((l) => l.url).map((link, i) => (
        <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
          className={cn('flex items-center gap-2 rounded-lg bg-surface-100 text-surface-700 font-medium hover:bg-primary-50 hover:text-primary-700 transition-colors',
            props.size === 'sm' ? 'px-2.5 py-1.5 text-xs' : props.size === 'lg' ? 'px-4 py-3 text-base' : 'px-3 py-2 text-sm')}>
          {platformLabels[link.platform] ?? link.platform}
        </a>
      ))}
      {(!props.links || props.links.length === 0) && (
        <p className="text-xs text-surface-400">Add social links in the inspector panel.</p>
      )}
    </div>
  )
}

// ── Main renderer ─────────────────────────────────────────────────────────

interface Props {
  block: BuilderBlock
}

export default function BlockRenderer({ block }: Props) {
  switch (block.type) {
    case 'HERO':         return <HeroBlock         props={block.props as HeroProps}         />
    case 'TEXT':         return <TextBlock          props={block.props as TextProps}          />
    case 'IMAGE':        return <ImageBlock         props={block.props as ImageProps}         />
    case 'COLUMNS':      return <ColumnsBlock       props={block.props as ColumnsProps}       />
    case 'BANNER':       return <BannerBlock        props={block.props as BannerProps}        />
    case 'FEATURES':     return <FeaturesBlock      props={block.props as FeaturesProps}      />
    case 'TESTIMONIAL':  return <TestimonialBlock   props={block.props as TestimonialProps}   />
    case 'CTA':          return <CtaBlock           props={block.props as CtaProps}           />
    case 'DIVIDER':      return <DividerBlock       props={block.props as DividerProps}       />
    case 'SPACER':       return <SpacerBlock        props={block.props as SpacerProps}        />
    case 'VIDEO':        return <VideoBlock         props={block.props as VideoProps}         />
    case 'SOCIAL_LINKS': return <SocialLinksBlock   props={block.props as SocialLinksProps}   />
    default:
      return (
        <div className="px-8 py-6 text-center">
          <p className="text-xs text-surface-400">Block type &ldquo;{block.type}&rdquo; has no renderer yet.</p>
        </div>
      )
  }
}
