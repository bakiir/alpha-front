/**
 * Localize internal CMS hrefs; leave external / tel / mailto / anchors alone.
 */
export function cmsToLocalePath(
  url: string | null | undefined,
  localePath: (path: string) => string,
): string {
  if (!url) return localePath('/')
  const trimmed = url.trim()
  if (!trimmed) return localePath('/')

  if (
    trimmed.startsWith('http://')
    || trimmed.startsWith('https://')
    || trimmed.startsWith('tel:')
    || trimmed.startsWith('mailto:')
    || trimmed.startsWith('#')
    || trimmed.startsWith('//')
  ) {
    return trimmed
  }

  if (trimmed.startsWith('/')) {
    return localePath(trimmed)
  }

  return trimmed
}
