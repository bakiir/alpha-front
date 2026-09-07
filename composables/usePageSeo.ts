export interface PageSeoData {
  id: number | null
  route_path: string
  page_name: string
  h1: string | null
  meta_title: string
  meta_description: string | null
  meta_keywords: string | null
  og_title: string | null
  og_description: string | null
  og_image: string | null
  canonical_url: string | null
  robots: string
  schema_type: string | null
  schema_json: Record<string, any> | null
  seo_text: string | null
}

export const usePageSeo = (customPath?: string) => {
  const route = useRoute()
  const config = useRuntimeConfig()
  const path = customPath || route.path

  // Normalized path key for SSR caching
  const asyncKey = `page-seo-${path}`
  const apiBase = config.public.apiBase || 'http://127.0.0.1:8000/api'

  const { data: seoResponse } = useAsyncData<{ success: boolean; data: PageSeoData }>(
    asyncKey,
    () => $fetch(`${apiBase}/seo`, { params: { path } }),
    { server: true, lazy: false }
  )

  const seo = computed<PageSeoData | null>(() => seoResponse.value?.data || null)

  const h1 = computed(() => seo.value?.h1 || seo.value?.page_name || '')
  const seoText = computed(() => seo.value?.seo_text || null)

  // Watcher and immediate application of metadata in head
  watchEffect(() => {
    if (seo.value) {
      const data = seo.value

      useSeoMeta({
        title: data.meta_title,
        description: data.meta_description || undefined,
        ogTitle: data.og_title || data.meta_title,
        ogDescription: data.og_description || data.meta_description || undefined,
        ogImage: data.og_image || undefined,
        robots: data.robots || 'index, follow',
      })

      const headScripts: Array<{ type: string; children: string }> = []
      if (data.schema_json) {
        headScripts.push({
          type: 'application/ld+json',
          children: JSON.stringify(data.schema_json),
        })
      }

      const headLinks: Array<{ rel: string; href: string }> = []
      if (data.canonical_url) {
        headLinks.push({
          rel: 'canonical',
          href: data.canonical_url,
        })
      }

      useHead({
        meta: data.meta_keywords ? [{ name: 'keywords', content: data.meta_keywords }] : [],
        link: headLinks,
        script: headScripts,
      })
    }
  })

  return {
    seo,
    h1,
    seoText,
  }
}
