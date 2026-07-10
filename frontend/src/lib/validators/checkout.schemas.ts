import { z } from 'zod'

// ── Address schema ────────────────────────────────────────────────────────

export const addressSchema = z.object({
  fullName:    z.string().min(1, 'Full name is required').max(120),
  line1:       z.string().min(1, 'Address line 1 is required').max(255),
  line2:       z.string().max(255).optional().or(z.literal('')),
  city:        z.string().min(1, 'City is required').max(100),
  state:       z.string().max(100).optional().or(z.literal('')),
  postalCode:  z.string().min(1, 'Postal / ZIP code is required').max(20),
  countryCode: z.string().length(2, 'Must be a 2-letter country code'),
  phone:       z.string().max(30).optional().or(z.literal('')),
})

export type AddressFormValues = z.infer<typeof addressSchema>

// ── Customer info schema ──────────────────────────────────────────────────

export const customerSchema = z.object({
  email:     z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName:  z.string().min(1, 'Last name is required').max(100),
  phone:     z.string().max(30).optional().or(z.literal('')),
})

export type CustomerFormValues = z.infer<typeof customerSchema>

// ── Addresses form (shipping + optional billing) ──────────────────────────

export const addressesSchema = z.object({
  shippingAddress:      addressSchema,
  billingSameAsShipping: z.boolean().default(true),
  billingAddress:       addressSchema.optional(),
})

export type AddressesFormValues = z.infer<typeof addressesSchema>

// ── Payment settings schema ───────────────────────────────────────────────

export const paymentSettingsSchema = z.object({
  provider:       z.enum(['STRIPE', 'PAYPAL', 'MANUAL']),
  enabled:        z.boolean(),
  publicKey:      z.string().max(512).optional().or(z.literal('')),
  secretKey:      z.string().max(512).optional().or(z.literal('')),
  webhookSecret:  z.string().max(512).optional().or(z.literal('')),
  liveMode:       z.boolean().default(false),
  displayName:    z.string().max(100).optional().or(z.literal('')),
})

export type PaymentSettingsFormValues = z.infer<typeof paymentSettingsSchema>
