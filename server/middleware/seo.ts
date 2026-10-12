import { isStagingEnvironment, resolveRobotsContent, resolveSitemapContent } from '../utils/seo'

// Private, transaction, customer account, and utility routes that must not be indexed
const NOINDEX_PREFIXES = [
  '/cart',
  '/checkout',
  '/payment',
  '/cabinet',
  '/profile',
  '/child',
  '/my-kit',
  '/history',
  '/toy-history',
  '/gift/claim',
  '/gifts/claim',
  // Localized variants:
  '/kk/cart',
  '/kk/checkout',
  '/kk/payment',
  '/kk/cabinet',
  '/kk/profile',
  '/kk/child',
  '/kk/my-kit',
  '/kk/history',
  '/kk/toy-history',
  '/kk/gift/claim',
  '/kk/gifts/claim',
  '/en/cart',
  '/en/checkout',
  '/en/payment',
  '/en/cabinet',
  '/en/profile',
  '/en/child',
  '/en/my-kit',
  '/en/history',
  '/en/toy-history',
  '/en/gift/claim',
  '/en/gifts/claim',
]

function isNoindexRoute(path: string): boolean {
  const normalized = (path || '/').toLowerCase().split('?')[0].replace(/\/+$/, '')
  return NOINDEX_PREFIXES.some(prefix => normalized === prefix || normalized.startsWith(`${prefix}/`))
}

export default defineEventHandler(async (event) => {
  const isStaging = isStagingEnvironment(event)

  // On staging/test environments: unconditionally attach X-Robots-Tag to EVERY response
  // so search crawlers (which are allowed by robots.txt) read noindex and drop all staging URLs.
  if (isStaging) {
    setResponseHeader(event, 'X-Robots-Tag', 'noindex, nofollow, noarchive')
  }

  const path = (getRequestPath(event) || '/').split('?')[0]

  // 1. Dynamic robots.txt interception (runs BEFORE Nitro serveStatic)
  if (path === '/robots.txt') {
    const content = await resolveRobotsContent(event)
    setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
    setResponseHeader(event, 'Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
    return send(event, content, 'text/plain; charset=utf-8')
  }

  // 2. Dynamic sitemap.xml interception
  if (path === '/sitemap.xml') {
    const result = await resolveSitemapContent(event)
    if (result.errorStatus) {
      setResponseStatus(event, result.errorStatus)
      if (result.errorStatus === 503) {
        setResponseHeader(event, 'Retry-After', '300')
      }
      setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
      return send(event, result.errorMessage || 'Sitemap unavailable', 'text/plain; charset=utf-8')
    }

    setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
    if (result.isStale) {
      setResponseHeader(event, 'X-Sitemap-Cache', 'stale')
      setResponseHeader(event, 'Cache-Control', 'public, max-age=300, stale-while-revalidate=86400')
    } else {
      setResponseHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=3600')
    }
    return send(event, result.xml || '', 'application/xml; charset=utf-8')
  }

  // 3. On production, attach X-Robots-Tag: noindex, nofollow to private & transactional routes
  if (!isStaging && isNoindexRoute(path)) {
    setResponseHeader(event, 'X-Robots-Tag', 'noindex, nofollow')
  }
})
