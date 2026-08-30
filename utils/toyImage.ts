const TOY_FALLBACK_IMAGE = '/images/placeholders/toy.svg'

export const resolveToyImage = (url?: string | null): string => {
  if (url && !url.includes('placeholder')) return url
  return TOY_FALLBACK_IMAGE
}

export const buildToyGallery = (url?: string | null): string[] => {
  const primary = resolveToyImage(url)
  return primary ? [primary] : []
}
