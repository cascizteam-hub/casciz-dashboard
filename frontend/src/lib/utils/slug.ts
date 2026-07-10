/**
 * Client-side slug generation — mirrors the backend SlugGenerator.toSlug() logic.
 */
export const SlugGenerator = {
  toSlug(input: string): string {
    return input
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // strip diacritics
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 60)
      .replace(/^-+|-+$/g, '') || 'store'
  },
}
