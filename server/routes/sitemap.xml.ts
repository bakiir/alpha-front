import { defineEventHandler, setResponseHeader, setResponseStatus } from 'h3'
import { resolveSitemapContent } from '../utils/seo'

export default defineEventHandler(async (event) => {
  const result = await resolveSitemapContent(event)

  if (result.errorStatus) {
    setResponseStatus(event, result.errorStatus)
    if (result.errorStatus === 503) {
      setResponseHeader(event, 'Retry-After', '300')
    }
    setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
    return result.errorMessage || 'Sitemap unavailable'
  }

  setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  if (result.isStale) {
    setResponseHeader(event, 'X-Sitemap-Cache', 'stale')
    setResponseHeader(event, 'Cache-Control', 'public, max-age=300, stale-while-revalidate=86400')
  } else {
    setResponseHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=3600')
  }

  return result.xml || ''
})
