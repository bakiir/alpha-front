/** Prefer in-app navigation so auth state is not wiped by a full reload. */
export const toSameOriginPath = (url: string): string => {
  if (!url) return '/'
  if (url.startsWith('/') && !url.startsWith('//')) {
    return url
  }
  if (typeof window === 'undefined') {
    try {
      const u = new URL(url)
      return u.pathname + u.search + u.hash
    } catch {
      return url
    }
  }
  try {
    const u = new URL(url, window.location.origin)
    if (u.origin === window.location.origin) {
      return u.pathname + u.search + u.hash
    }
  } catch {
    // keep original
  }
  return url
}

export const navigateSameOrigin = async (url: string) => {
  const path = toSameOriginPath(url)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    window.location.href = path
    return
  }
  await navigateTo(path)
}
