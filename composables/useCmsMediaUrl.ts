/**
 * CMS uploads live on the API `/storage/...` disk; map paths for the current apiBase.
 */
export function useCmsMediaUrl() {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string

  const cmsMediaUrl = (src?: string | null) => resolveMediaUrl(src, apiBase)

  return { cmsMediaUrl }
}
