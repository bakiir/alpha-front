/**
 * Resolve media URLs so /storage/... loads from the API host, not the SPA host.
 * Also rewrites absolute storage URLs when APP_URL on the backend is wrong.
 */
export function resolveMediaUrl(src?: string | null, apiBase?: string): string {
  if (!src) {
    return ''
  }

  const origin = (apiBase || 'http://127.0.0.1:8000/api').replace(/\/api\/?$/, '')

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
