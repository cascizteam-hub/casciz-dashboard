import type { Metadata, Viewport } from 'next'
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import { appConfig } from '@/config'
import './globals.css'

// ── Fonts ─────────────────────────────────────────────────────────────────

const inter = Inter({
  subsets:  ['latin'],
  variable: '--font-inter',
  display:  'swap',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets:  ['latin'],
  variable: '--font-plus-jakarta',
  display:  'swap',
})

const jetBrainsMono = JetBrains_Mono({
  subsets:  ['latin'],
  variable: '--font-jetbrains-mono',
  display:  'swap',
})

// ── Metadata ──────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default:  appConfig.name,
    template: `%s | ${appConfig.name}`,
  },
  description:
    'Casciz Commerce OS — Build and launch your online store without writing a single line of code.',
  metadataBase: new URL(appConfig.url),
  openGraph: {
    type:  'website',
    title: appConfig.name,
    description:
      'Casciz Commerce OS — Build and launch your online store without writing a single line of code.',
    url: appConfig.url,
  },
  robots: {
    index:  false, // SaaS dashboard should not be indexed
    follow: false,
  },
}

export const viewport: Viewport = {
  width:        'device-width',
  initialScale: 1,
  themeColor:   '#4f46e5',
}

// ── Root Layout ───────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakarta.variable} ${jetBrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-surface-50 text-surface-900 antialiased">
        {children}
      </body>
    </html>
  )
}
