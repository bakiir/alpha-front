const TOY_FALLBACK_IMAGE = '/images/placeholders/toy.svg'

export const resolveToyImage = (url?: string | null): string => {
  if (url && !url.includes('placeholder')) return url
  return TOY_FALLBACK_IMAGE
}

export const buildToyGallery = (
  urlOrUrls?: string | string[] | null,
  fallbackUrl?: string | null,
): string[] => {
  const raw = Array.isArray(urlOrUrls)
    ? urlOrUrls
    : urlOrUrls
      ? [urlOrUrls]
      : []

  const list = raw.length > 0
    ? raw
    : fallbackUrl
      ? [fallbackUrl]
      : []

  const resolved = list
    .map((url) => resolveToyImage(url))
    .filter(Boolean)

  return Array.from(new Set(resolved))
}
