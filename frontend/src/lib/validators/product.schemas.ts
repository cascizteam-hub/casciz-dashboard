import { z } from 'zod'

// ── Variant schema ────────────────────────────────────────────────────────

export const variantSchema = z.object({
  title: z
    .string()
    .min(1, 'Variant title is required')
    .max(255),
  sku: z
    .string()
    .max(100, 'SKU must be 100 characters or fewer')
    .optional()
    .or(z.literal('')),
  price: z
    .number({ invalid_type_error: 'Price must be a number' })
    .min(0, 'Price must be 0 or greater'),
  compareAtPrice: z
    .number()
    .min(0)
    .optional()
    .nullable(),
  costPrice: z
    .number()
    .min(0)
    .optional()
    .nullable(),
  inventoryQuantity: z
    .number()
    .int()
    .min(0)
    .optional()
    .nullable(),
  allowBackorder: z.boolean().default(false),
  weightGrams: z
    .number()
    .int()
    .min(0)
    .optional()
    .nullable(),
})

export type VariantFormValues = z.infer<typeof variantSchema>

// ── Create product schema ─────────────────────────────────────────────────

export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(255, 'Name must be 255 characters or fewer'),
  slug: z
    .string()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$|^$/,
      'Slug must be lowercase letters, numbers, and hyphens only',
    )
    .max(120)
    .optional()
    .or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  shortDescription: z.string().max(500).optional().or(z.literal('')),
  categoryId: z.string().uuid('Must be a valid category').optional().or(z.literal('')),
  tags: z.string().max(500).optional().or(z.literal('')),
  metaTitle: z.string().max(150).optional().or(z.literal('')),
  metaDescription: z.string().max(300).optional().or(z.literal('')),
  digital: z.boolean().default(false),
  variants: z
    .array(variantSchema)
    .min(1, 'At least one variant is required'),
})

export type CreateProductFormValues = z.infer<typeof createProductSchema>

// ── Update product schema (no variants — managed separately) ──────────────

export const updateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255),
  description: z.string().optional().or(z.literal('')),
  shortDescription: z.string().max(500).optional().or(z.literal('')),
  categoryId: z.string().uuid().optional().or(z.literal('')),
  tags: z.string().max(500).optional().or(z.literal('')),
  metaTitle: z.string().max(150).optional().or(z.literal('')),
  metaDescription: z.string().max(300).optional().or(z.literal('')),
  digital: z.boolean().default(false),
})

export type UpdateProductFormValues = z.infer<typeof updateProductSchema>

// ── Category schema ───────────────────────────────────────────────────────

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(120, 'Name must be 120 characters or fewer'),
  slug: z
    .string()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$|^$/,
      'Slug must be lowercase letters, numbers, and hyphens',
    )
    .max(80)
    .optional()
    .or(z.literal('')),
  description: z.string().max(500).optional().or(z.literal('')),
  imageUrl: z
    .string()
    .url('Must be a valid URL')
    .max(512)
    .optional()
    .or(z.literal('')),
})

export type CategoryFormValues = z.infer<typeof categorySchema>
