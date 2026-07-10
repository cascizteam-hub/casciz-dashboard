import type { BlockRegistryEntry, BlockType, BuilderBlock, PageDocument } from '@/types/builder'

// ── Default props per block type ──────────────────────────────────────────

export const BLOCK_DEFAULTS: Record<BlockType, object> = {
  HERO: {
    heading: 'Welcome to our store',
    subheading: 'Find everything you need in one place.',
    ctaText: 'Shop Now',
    ctaUrl: '/catalog',
    backgroundUrl: '',
    overlayOpacity: 30,
    textAlign: 'center',
    height: 'large',
  },
  TEXT: {
    body: 'Add your text here. This block supports **markdown** formatting.',
    textAlign: 'left',
    maxWidth: 'normal',
  },
  IMAGE: {
    src: '',
    alt: '',
    caption: '',
    width: 'full',
    align: 'center',
    rounded: true,
    linkUrl: '',
  },
  COLUMNS: {
    count: 3,
    columns: [
      { icon: 'Truck', heading: 'Free Shipping',    body: 'On orders over $50.' },
      { icon: 'Shield', heading: 'Secure Payment',  body: '100% secure checkout.' },
      { icon: 'RefreshCcw', heading: 'Easy Returns', body: '30-day return policy.' },
    ],
  },
  BANNER: {
    text: '🎉 Sale! Get 20% off everything with code SAVE20',
    bgColor: '#4f46e5',
    textColor: '#ffffff',
    linkUrl: '/catalog',
    linkText: 'Shop now',
    dismissible: true,
  },
  FEATURES: {
    heading: 'Why choose us?',
    layout: 'grid',
    features: [
      { icon: 'Star',       title: 'Premium Quality',   body: 'Handpicked products.' },
      { icon: 'Clock',      title: 'Fast Delivery',     body: 'Delivered in 2–3 days.' },
      { icon: 'HeartHandshake', title: 'Great Support', body: '24/7 customer care.' },
    ],
  },
  TESTIMONIAL: {
    quote: '"Absolutely love the quality. Will definitely shop here again!"',
    author: 'Sarah M.',
    role: 'Verified Buyer',
    avatarUrl: '',
    rating: 5,
  },
  CTA: {
    heading: 'Ready to get started?',
    body: 'Join thousands of satisfied customers today.',
    primaryText: 'Shop Now',
    primaryUrl: '/catalog',
    secondaryText: 'Learn More',
    secondaryUrl: '/about',
    bgColor: '#f1f3f9',
  },
  DIVIDER: {
    style: 'solid',
    color: '#e2e6f0',
  },
  SPACER: {
    height: 'md',
  },
  VIDEO: {
    url: '',
    caption: '',
    autoplay: false,
    loop: false,
  },
  SOCIAL_LINKS: {
    links: [
      { platform: 'instagram', url: '' },
      { platform: 'facebook',  url: '' },
    ],
    layout: 'row',
    size: 'md',
  },
  CONTACT_FORM: {
    heading: 'Get in touch',
    successMessage: 'Thank you! We will be in touch shortly.',
    fields: [
      { name: 'name',    label: 'Your name',    type: 'text',     required: true },
      { name: 'email',   label: 'Email address', type: 'email',    required: true },
      { name: 'message', label: 'Message',       type: 'textarea', required: true },
    ],
  },
}

// ── Registry (drives the block picker UI) ────────────────────────────────

export const BLOCK_REGISTRY: BlockRegistryEntry[] = [
  {
    type: 'HERO',
    label: 'Hero',
    description: 'Full-width hero section with heading, subheading and call-to-action',
    icon: 'LayoutTemplate',
    category: 'content',
    defaultProps: BLOCK_DEFAULTS.HERO as never,
  },
  {
    type: 'TEXT',
    label: 'Text',
    description: 'Rich text block with markdown support',
    icon: 'AlignLeft',
    category: 'content',
    defaultProps: BLOCK_DEFAULTS.TEXT as never,
  },
  {
    type: 'IMAGE',
    label: 'Image',
    description: 'Single image with optional caption and link',
    icon: 'Image',
    category: 'media',
    defaultProps: BLOCK_DEFAULTS.IMAGE as never,
  },
  {
    type: 'COLUMNS',
    label: 'Columns',
    description: '2, 3 or 4 equal-width columns with icon, heading and text',
    icon: 'Columns',
    category: 'layout',
    defaultProps: BLOCK_DEFAULTS.COLUMNS as never,
  },
  {
    type: 'BANNER',
    label: 'Announcement Banner',
    description: 'Full-width notification or promotional bar',
    icon: 'Megaphone',
    category: 'content',
    defaultProps: BLOCK_DEFAULTS.BANNER as never,
  },
  {
    type: 'FEATURES',
    label: 'Features',
    description: 'Grid or list of feature highlights with icons',
    icon: 'LayoutGrid',
    category: 'content',
    defaultProps: BLOCK_DEFAULTS.FEATURES as never,
  },
  {
    type: 'TESTIMONIAL',
    label: 'Testimonial',
    description: 'Customer quote with star rating',
    icon: 'Quote',
    category: 'content',
    defaultProps: BLOCK_DEFAULTS.TESTIMONIAL as never,
  },
  {
    type: 'CTA',
    label: 'Call to Action',
    description: 'Prominent section driving a specific action',
    icon: 'Zap',
    category: 'content',
    defaultProps: BLOCK_DEFAULTS.CTA as never,
  },
  {
    type: 'VIDEO',
    label: 'Video',
    description: 'Embed a YouTube or Vimeo video',
    icon: 'PlayCircle',
    category: 'media',
    defaultProps: BLOCK_DEFAULTS.VIDEO as never,
  },
  {
    type: 'SOCIAL_LINKS',
    label: 'Social Links',
    description: 'Row or column of social media icon links',
    icon: 'Share2',
    category: 'interactive',
    defaultProps: BLOCK_DEFAULTS.SOCIAL_LINKS as never,
  },
  {
    type: 'CONTACT_FORM',
    label: 'Contact Form',
    description: 'Configurable contact form with custom fields',
    icon: 'Mail',
    category: 'interactive',
    defaultProps: BLOCK_DEFAULTS.CONTACT_FORM as never,
  },
  {
    type: 'DIVIDER',
    label: 'Divider',
    description: 'Horizontal rule to separate sections',
    icon: 'Minus',
    category: 'layout',
    defaultProps: BLOCK_DEFAULTS.DIVIDER as never,
  },
  {
    type: 'SPACER',
    label: 'Spacer',
    description: 'Invisible vertical space block',
    icon: 'GripHorizontal',
    category: 'layout',
    defaultProps: BLOCK_DEFAULTS.SPACER as never,
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────

export function createBlock(type: BlockType, order: number): BuilderBlock {
  return {
    id:    crypto.randomUUID(),
    type,
    order,
    props: { ...BLOCK_DEFAULTS[type] } as never,
  }
}

export const DEFAULT_PAGE_DOCUMENT: PageDocument = {
  blocks: [],
  theme: {
    primaryColor:   '#4f46e5',
    secondaryColor: '#14b8a6',
    fontFamily:     'Inter',
    fontSize:       'md',
    borderRadius:   'md',
  },
}

export const SPACER_HEIGHTS: Record<string, string> = {
  xs: '16px', sm: '32px', md: '48px', lg: '64px', xl: '96px',
}

export const CATEGORY_LABELS: Record<string, string> = {
  layout:      'Layout',
  content:     'Content',
  media:       'Media',
  interactive: 'Interactive',
}
