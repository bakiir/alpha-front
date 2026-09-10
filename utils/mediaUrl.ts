/**
 * Resolve public API origin for media and fetches.
 * Prevents remote pages from calling the developer's 127.0.0.1.
 */
export function resolveApiBase(configured?: string | null): string {
  const fallback = 'http://127.0.0.1:8000/api'
  const value = (configured || fallback).trim()

  if (typeof window === 'undefined') {
    return value
  }

  const pageHost = window.location.hostname
  const pageIsLocal = pageHost === 'localhost' || pageHost === '127.0.0.1'
  const apiIsLocal = /^(https?:\/\/)?(127\.0\.0\.1|localhost)(:\d+)?/i.test(value)

  if (!pageIsLocal && apiIsLocal) {
    const fixed = `${window.location.protocol}//back-${pageHost}/api`
    console.error(
      `[Alpha] apiBase is localhost (${value}) on remote host ${pageHost}. Using ${fixed} instead.`,
    )
    return fixed
  }

  return value
}

/**
 * Resolve media URLs so /storage/... loads from the API host, not the SPA host.
 * Also rewrites absolute storage URLs when APP_URL on the backend is wrong.
 */
export function resolveMediaUrl(src?: string | null, apiBase?: string): string {
  if (!src) {
    return ''
  }

  const origin = resolveApiBase(apiBase).replace(/\/api\/?$/, '')

  if (src.startsWith('/storage/')) {
    return `${origin}${src}`
  }

  try {
    const url = new URL(src)
    if (url.pathname.startsWith('/storage/')) {
      return `${origin}${url.pathname}${url.search}`
    }
  } catch {
    // not an absolute URL
  }

  return src
}
