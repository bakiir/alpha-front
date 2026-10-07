/**
 * Convert CMS plain text or sanitized HTML into display HTML.
 * Empty string is preserved (intentional clear); null/undefined stay null.
 */
export function cmsTextToHtml(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null
  if (value === '') return ''

  // Already HTML (sanitized on the API) — keep as-is.
  if (/<[a-z][\s\S]*>/i.test(value)) {
    return value
  }

  const escaped = value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return escaped
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
    .join('')
}

export function hasCmsText(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0
}
