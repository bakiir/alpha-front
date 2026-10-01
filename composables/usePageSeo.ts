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

  const asyncKey = `page-seo-${path}`
  const apiBase = config.public.apiBase || 'http://127.0.0.1:8000/api'

  const { data: seoResponse } = useAsyncData<{ success: boolean; data: PageSeoData }>(
    asyncKey,
    () => $fetch(`${apiBase}/seo`, { params: { path } }),
    { server: true, lazy: false },
  )

  const seo = computed<PageSeoData | null>(() => seoResponse.value?.data || null)

  const h1 = computed(() => seo.value?.h1 || seo.value?.page_name || '')
  const seoText = computed(() => seo.value?.seo_text || null)

  // Call head composables synchronously in setup — never inside watchEffect (NUXT_E1001).
  useSeoMeta({
    title: () => seo.value?.meta_title || undefined,
    description: () => seo.value?.meta_description || undefined,
    ogTitle: () => seo.value?.og_title || seo.value?.meta_title || undefined,
    ogDescription: () => seo.value?.og_description || seo.value?.meta_description || undefined,
    ogImage: () => seo.value?.og_image || undefined,
    robots: () => seo.value?.robots || 'index, follow',
  })

  useHead(() => {
    const data = seo.value
    if (!data) return {}

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

    return {
      meta: data.meta_keywords ? [{ name: 'keywords', content: data.meta_keywords }] : [],
      link: headLinks,
      script: headScripts,
    }
  })

  return {
    seo,
    h1,
    seoText,
  }
}
