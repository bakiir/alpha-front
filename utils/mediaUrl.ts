/**
 * Resolve public API origin for media and fetches.
 * Prevents remote pages from calling the developer's 127.0.0.1.
 */
export function resolveApiBase(configured?: string | null): string {
  const fallback = 'http://127.0.0.1:8000/api'
  const value = (configured || fallback).trim()

  // Same-origin proxy path (local Nuxt → Laravel).
  // Browser: keep relative `/api` so HttpOnly cookies stay first-party.
  // SSR: Nitro devProxy is not applied to server-side $fetch of relative paths
  // (Nuxt 4 routes them into the Vue router). Call Laravel directly instead.
  if (value.startsWith('/')) {
    if (import.meta.server) {
      // Local/dev only: production sets an absolute NUXT_PUBLIC_API_BASE.
      return fallback
    }
    return value
  }

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

const isLocalHostname = (hostname: string) =>
  hostname === 'localhost' || hostname === '127.0.0.1'

/**
 * Resolve media URLs so /storage/... loads via the Nuxt devProxy locally
 * (same-origin `/storage`) or from the API host in production.
 *
 * Absolute Laravel storage URLs (APP_URL=http://127.0.0.1:8000) must be rewritten
 * to relative `/storage/...` when the SPA uses the local `/api` proxy — otherwise
 * the browser may end up requesting storage on the wrong host/port and images break.
 */
export function resolveMediaUrl(src?: string | null, apiBase?: string): string {
  if (!src) {
    return ''
  }

  const trimmed = src.trim()
  if (!trimmed) {
    return ''
  }

  if (trimmed.startsWith('data:')) {
    return trimmed
  }

  const configured = (apiBase ?? '').trim()
  const preferSameOriginProxy = configured.startsWith('/')

  let storagePath: string | null = null

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed)
      if (!url.pathname.startsWith('/storage/')) {
        return trimmed
      }
      storagePath = `${url.pathname}${url.search}`

      // Local Nuxt → always use same-origin /storage proxy for local API media.
      if (preferSameOriginProxy || isLocalHostname(url.hostname)) {
        return storagePath
      }
    } catch {
      return trimmed
    }
  } else {
    const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
    if (path.startsWith('/storage/')) {
      storagePath = path
    } else {
      return path
    }
  }

  if (!storagePath) {
    return trimmed
  }

  if (preferSameOriginProxy) {
    return storagePath
  }

  const base = resolveApiBase(apiBase)
  const origin = base.startsWith('/')
    ? ''
    : base.replace(/\/api\/?$/, '')

  return `${origin}${storagePath}`
}
