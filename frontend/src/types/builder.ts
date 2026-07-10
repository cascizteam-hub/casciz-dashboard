// ─────────────────────────────────────────────────────────────────────────────
// Casciz Builder – Type System
// Defines the complete schema for drag-and-drop page documents.
// ─────────────────────────────────────────────────────────────────────────────

// ── Block types ───────────────────────────────────────────────────────────

export type BlockType =
  | 'HERO'
  | 'TEXT'
  | 'IMAGE'
  | 'COLUMNS'
  | 'BANNER'
  | 'FEATURES'
  | 'TESTIMONIAL'
  | 'CTA'
  | 'DIVIDER'
  | 'SPACER'
  | 'VIDEO'
  | 'SOCIAL_LINKS'
  | 'CONTACT_FORM'

// ── Per-block prop shapes ─────────────────────────────────────────────────

export interface HeroProps {
  heading:        string
  subheading:     string
  ctaText:        string
  ctaUrl:         string
  backgroundUrl:  string
  overlayOpacity: number  // 0–100
  textAlign:      'left' | 'center' | 'right'
  height:         'small' | 'medium' | 'large' | 'full'
}

export interface TextProps {
  body:      string
  textAlign: 'left' | 'center' | 'right'
  maxWidth:  'narrow' | 'normal' | 'wide'
}

export interface ImageProps {
  src:       string
  alt:       string
  caption:   string
  width:     'quarter' | 'half' | 'three-quarters' | 'full'
  align:     'left' | 'center' | 'right'
  rounded:   boolean
  linkUrl:   string
}

export interface ColumnItem {
  icon?:        string
  heading:      string
  body:         string
}

export interface ColumnsProps {
  columns:  ColumnItem[]
  count:    2 | 3 | 4
}

export interface BannerProps {
  text:       string
  bgColor:    string
  textColor:  string
  linkUrl:    string
  linkText:   string
  dismissible: boolean
}

export interface FeatureItem {
  icon:     string
  title:    string
  body:     string
}

export interface FeaturesProps {
  heading:  string
  features: FeatureItem[]
  layout:   'grid' | 'list'
}

export interface TestimonialProps {
  quote:      string
  author:     string
  role:       string
  avatarUrl:  string
  rating:     1 | 2 | 3 | 4 | 5
}

export interface CtaProps {
  heading:    string
  body:       string
  primaryText:  string
  primaryUrl:   string
  secondaryText: string
  secondaryUrl:  string
  bgColor:    string
}

export interface DividerProps {
  style: 'solid' | 'dashed' | 'dotted'
  color: string
}

export interface SpacerProps {
  height: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

export interface VideoProps {
  url:          string  // YouTube/Vimeo embed URL
  caption:      string
  autoplay:     boolean
  loop:         boolean
}

export interface SocialLink {
  platform: 'facebook' | 'instagram' | 'twitter' | 'tiktok' | 'youtube' | 'pinterest' | 'linkedin'
  url:      string
}

export interface SocialLinksProps {
  links:  SocialLink[]
  layout: 'row' | 'column'
  size:   'sm' | 'md' | 'lg'
}

export interface ContactFormProps {
  heading:        string
  successMessage: string
  fields:         Array<{ name: string; label: string; type: 'text' | 'email' | 'tel' | 'textarea'; required: boolean }>
}

// ── Union of all block props ──────────────────────────────────────────────

export type BlockProps =
  | HeroProps
  | TextProps
  | ImageProps
  | ColumnsProps
  | BannerProps
  | FeaturesProps
  | TestimonialProps
  | CtaProps
  | DividerProps
  | SpacerProps
  | VideoProps
  | SocialLinksProps
  | ContactFormProps

// ── Block (one element on the canvas) ────────────────────────────────────

export interface BuilderBlock {
  id:    string
  type:  BlockType
  order: number
  props: BlockProps
}

// ── Theme ─────────────────────────────────────────────────────────────────

export interface PageTheme {
  primaryColor:   string
  secondaryColor: string
  fontFamily:     string
  fontSize:       'sm' | 'md' | 'lg'
  borderRadius:   'none' | 'sm' | 'md' | 'lg'
}

// ── Page document (serialised as JSONB in DB) ─────────────────────────────

export interface PageDocument {
  blocks: BuilderBlock[]
  theme:  Partial<PageTheme>
}

// ── API shapes ────────────────────────────────────────────────────────────

export type PageStatus = 'DRAFT' | 'PUBLISHED'
export type PageType   = 'HOME' | 'ABOUT' | 'CONTACT' | 'CATALOG' | 'CUSTOM'

export interface PageSummary {
  id:           string
  title:        string
  slug:         string
  type:         PageType
  status:       PageStatus
  sortOrder:    number
  updatedAt:    string
  publishedAt?: string
}

export interface PageResponse extends PageSummary {
  storeId:         string
  metaTitle?:      string
  metaDescription?: string
  content:         PageDocument
  createdAt:       string
}

export interface CreatePageRequest {
  title:            string
  slug?:            string
  type:             PageType
  metaTitle?:       string
  metaDescription?: string
}

export interface UpdatePageMetaRequest {
  title:            string
  metaTitle?:       string
  metaDescription?: string
}

export interface SavePageContentRequest {
  content: PageDocument
}

export interface ReorderPagesRequest {
  orderedPageIds: string[]
}

// ── Block registry entry (used by the block picker panel) ─────────────────

export interface BlockRegistryEntry {
  type:        BlockType
  label:       string
  description: string
  icon:        string   // lucide icon name
  category:    'layout' | 'content' | 'media' | 'interactive'
  defaultProps: BlockProps
}
