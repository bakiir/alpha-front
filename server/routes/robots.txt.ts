import { defineEventHandler, setResponseHeader, send } from 'h3'
import { resolveRobotsContent } from '../utils/seo'

export default defineEventHandler(async (event) => {
  const content = await resolveRobotsContent(event)
  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  return content
})
