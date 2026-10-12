import { H3Event, getRequestHost, getRequestPath, setResponseHeader, setResponseStatus } from 'h3'

let cachedRobotsText: { text: string; fetchedAt: number } | null = null
let cachedSitemapXml: { xml: string; fetchedAt: number } | null = null

const ROBOTS_CACHE_TTL_MS = 60_000 // 60s memory cache to quickly reflect CMS changes

/**
 * Identify if current request is on a staging, development, or local contour.
 */
export function isStagingEnvironment(event: H3Event): boolean {
  if (process.env.APP_ENV === 'staging' || process.env.IS_STAGING === 'true') {
    return true
  }
  const host = (getRequestHost(event) || '').toLowerCase().split(':')[0]
  if (
    host.includes('test-nomad.kz') ||
    host.includes('stage') ||
    host.includes('dev') ||
    host === 'localhost' ||
    host === '127.0.0.1'
  ) {
    return true
  }
  return false
}

/**
 * Staging robots policy: allow crawlers to fetch pages so they can read X-Robots-Tag: noindex.
 * (Disallow: / would prevent crawlers from reading the noindex headers/meta tags).
 */
export const STAGING_ROBOTS_TXT = `User-agent: *\nAllow: /\n`

/**
 * Verified production fallback if backend CMS is temporarily unreachable.
 */
export function getProductionFallbackRobots(siteUrl: string): string {
  const cleanUrl = siteUrl.replace(/\/+$/, '')
  return [
    'User-agent: *',
    'Allow: /',
    'Allow: /_nuxt/',
    'Allow: /icons/',
    'Allow: /images/',
    'Allow: /brand/',
    'Disallow: /admin',
    'Disallow: /admin/',
    'Disallow: /api/',
    '',
    `Sitemap: ${cleanUrl}/sitemap.xml`,
  ].join('\n')
}

/**
 * Generate dynamic robots.txt from CMS with caching, staging separation, and fallback.
 */
export async function resolveRobotsContent(event: H3Event): Promise<string> {
  // 1. Staging isolation
  if (isStagingEnvironment(event)) {
    return STAGING_ROBOTS_TXT
  }

  const now = Date.now()
  if (cachedRobotsText && now - cachedRobotsText.fetchedAt < ROBOTS_CACHE_TTL_MS) {
    return cachedRobotsText.text
  }

  const config = useRuntimeConfig(event)
  const siteUrl = ((config.public.siteUrl as string) || 'https://alpha-toys.kz').replace(/\/+$/, '')
  const apiBase = (config.public.apiBase as string) || ''

  if (apiBase) {
    const robotsTarget = apiBase.startsWith('http')
      ? `${apiBase.replace(/\/api\/?$/, '')}/api/robots.txt`
      : 'http://127.0.0.1:8000/api/robots.txt'

    try {
      const response = await $fetch<string>(robotsTarget, {
        responseType: 'text',
        headers: { Accept: 'text/plain, */*' },
        timeout: 4000,
      })

      if (typeof response === 'string' && response.trim().length > 0) {
        // Normalize: remove Google-unsupported directives Host / Clean-param if present
        let cleaned = response
          .split('\n')
          .filter(line => {
            const trimmed = line.trim().toLowerCase()
            return !trimmed.startsWith('host:') && !trimmed.startsWith('clean-param:')
          })
          .join('\n')
          .trim()

        // Ensure Sitemap points to the canonical storefront siteUrl
        if (!cleaned.toLowerCase().includes('sitemap:')) {
          cleaned += `\n\nSitemap: ${siteUrl}/sitemap.xml`
        }

        cachedRobotsText = { text: cleaned, fetchedAt: now }
        return cleaned
      }
    } catch {
      // Backend temporarily offline — fall through to stale cache or production fallback
    }
  }

  if (cachedRobotsText) {
    return cachedRobotsText.text
  }

  const fallback = getProductionFallbackRobots(siteUrl)
  cachedRobotsText = { text: fallback, fetchedAt: now }
  return fallback
}

/**
 * Invalidate the in-memory robots cache (useful after CMS updates or hook calls).
 */
export function invalidateRobotsCache(): void {
  cachedRobotsText = null
}

/**
 * Resolve sitemap XML from backend with caching, staging disable, and 503 fallback.
 */
export async function resolveSitemapContent(event: H3Event): Promise<{ xml: string | null; isStale: boolean; errorStatus?: number; errorMessage?: string }> {
  // Staging: do not publish sitemap
  if (isStagingEnvironment(event)) {
    return {
      xml: null,
      isStale: false,
      errorStatus: 404,
      errorMessage: 'Sitemap is disabled on staging environments.',
    }
  }

  const config = useRuntimeConfig(event)
  const apiBase = (config.public.apiBase as string) || ''

  if (apiBase) {
    const sitemapTarget = apiBase.startsWith('http')
      ? `${apiBase.replace(/\/api\/?$/, '')}/api/sitemap.xml`
      : 'http://127.0.0.1:8000/api/sitemap.xml'

    try {
      const liveXml = await $fetch<string>(sitemapTarget, {
        responseType: 'text',
        headers: { Accept: 'application/xml, text/xml, */*' },
        timeout: 5000,
      })

      if (typeof liveXml === 'string' && liveXml.includes('<urlset')) {
        cachedSitemapXml = { xml: liveXml, fetchedAt: Date.now() }
        return { xml: liveXml, isStale: false }
      }
    } catch {
      // Backend unreachable
    }
  }

  // Backend unreachable: use last successfully cached sitemap if available
  if (cachedSitemapXml?.xml) {
    return { xml: cachedSitemapXml.xml, isStale: true }
  }

  // No previous sitemap available -> 503 Service Unavailable (do NOT synthesize fake pages)
  return {
    xml: null,
    isStale: false,
    errorStatus: 503,
    errorMessage: 'Sitemap is temporarily unavailable due to backend service outage. Please retry later.',
  }
}
