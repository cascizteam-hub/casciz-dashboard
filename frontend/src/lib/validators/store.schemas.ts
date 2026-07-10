import { z } from 'zod'

// ── Supported values ──────────────────────────────────────────────────────

export const SUPPORTED_CURRENCIES = [
  'USD','EUR','GBP','CAD','AUD','JPY','INR','BRL','MXN','SGD','AED','SAR',
] as const

export const CURRENCY_LABELS: Record<string, string> = {
  USD: 'US Dollar (USD)',
  EUR: 'Euro (EUR)',
  GBP: 'British Pound (GBP)',
  CAD: 'Canadian Dollar (CAD)',
  AUD: 'Australian Dollar (AUD)',
  JPY: 'Japanese Yen (JPY)',
  INR: 'Indian Rupee (INR)',
  BRL: 'Brazilian Real (BRL)',
  MXN: 'Mexican Peso (MXN)',
  SGD: 'Singapore Dollar (SGD)',
  AED: 'UAE Dirham (AED)',
  SAR: 'Saudi Riyal (SAR)',
}

export const COMMON_TIMEZONES = [
  { value: 'UTC',                   label: 'UTC' },
  { value: 'America/New_York',      label: 'Eastern Time (US)' },
  { value: 'America/Chicago',       label: 'Central Time (US)' },
  { value: 'America/Denver',        label: 'Mountain Time (US)' },
  { value: 'America/Los_Angeles',   label: 'Pacific Time (US)' },
  { value: 'America/Sao_Paulo',     label: 'Brasília Time' },
  { value: 'America/Mexico_City',   label: 'Mexico City' },
  { value: 'Europe/London',         label: 'London' },
  { value: 'Europe/Paris',          label: 'Paris / Berlin' },
  { value: 'Europe/Moscow',         label: 'Moscow' },
  { value: 'Asia/Dubai',            label: 'Dubai' },
  { value: 'Asia/Kolkata',          label: 'India Standard Time' },
  { value: 'Asia/Singapore',        label: 'Singapore' },
  { value: 'Asia/Tokyo',            label: 'Tokyo' },
  { value: 'Asia/Shanghai',         label: 'Shanghai / Beijing' },
  { value: 'Australia/Sydney',      label: 'Sydney' },
]

// ── Schemas ───────────────────────────────────────────────────────────────

export const createStoreSchema = z.object({
  name: z
    .string()
    .min(2, 'Store name must be at least 2 characters')
    .max(150, 'Store name must be 150 characters or fewer'),

  slug: z
    .string()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be lowercase letters, numbers, and hyphens only',
    )
    .min(3, 'Slug must be at least 3 characters')
    .max(80, 'Slug must be 80 characters or fewer')
    .optional()
    .or(z.literal('')),

  description: z.string().max(1000).optional().or(z.literal('')),

  currency: z.enum(SUPPORTED_CURRENCIES, {
    errorMap: () => ({ message: 'Please select a currency' }),
  }),

  timezone: z.string().min(1, 'Please select a timezone'),

  contactEmail: z
    .string()
    .email('Please enter a valid email address')
    .max(255)
    .optional()
    .or(z.literal('')),

  contactPhone: z.string().max(30).optional().or(z.literal('')),
})

export type CreateStoreFormValues = z.infer<typeof createStoreSchema>

export const updateStoreSchema = z.object({
  name: z
    .string()
    .min(2, 'Store name must be at least 2 characters')
    .max(150),

  description: z.string().max(1000).optional().or(z.literal('')),

  logoUrl: z
    .string()
    .url('Please enter a valid URL')
    .max(512)
    .optional()
    .or(z.literal('')),

  faviconUrl: z
    .string()
    .url('Please enter a valid URL')
    .max(512)
    .optional()
    .or(z.literal('')),

  customDomain: z
    .string()
    .regex(
      /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$|^$/,
      'Please enter a valid domain name (e.g. shop.example.com)',
    )
    .max(255)
    .optional()
    .or(z.literal('')),

  currency: z.enum(SUPPORTED_CURRENCIES, {
    errorMap: () => ({ message: 'Please select a currency' }),
  }),

  timezone: z.string().min(1, 'Please select a timezone'),

  contactEmail: z
    .string()
    .email('Please enter a valid email address')
    .max(255)
    .optional()
    .or(z.literal('')),

  contactPhone: z.string().max(30).optional().or(z.literal('')),
})

export type UpdateStoreFormValues = z.infer<typeof updateStoreSchema>
