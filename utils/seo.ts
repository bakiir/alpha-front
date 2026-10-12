/**
 * Utility functions for cleaning and formatting SEO meta text.
 */

/**
 * Strips HTML tags, replaces block closures with spaces,
 * decodes common HTML entities, and normalizes whitespace.
 */
export function cleanMetaDescription(text: string | null | undefined): string {
  if (!text) return ''
  return text
    // Replace breaks and block boundaries with space so words don't concatenate
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|tr|td|blockquote)>/gi, ' ')
    // Strip all HTML tags
    .replace(/<[^>]*>/g, '')
    // Decode common HTML entities
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, '&')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&laquo;/gi, '«')
    .replace(/&raquo;/gi, '»')
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    // Replace non-breaking and zero-width spaces
    .replace(/[\u00A0\u200B\uFEFF]/g, ' ')
    // Collapse multiple whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Truncates text cleanly at a word boundary around max chars (~160 chars).
 */
export function truncateMetaDescription(text: string | null | undefined, max: number = 160): string {
  const clean = cleanMetaDescription(text)
  if (!clean || clean.length <= max) return clean

  const sliced = clean.slice(0, max - 1)
  const lastSpace = sliced.lastIndexOf(' ')
  return (lastSpace > max * 0.6 ? sliced.slice(0, lastSpace) : sliced) + '…'
}
