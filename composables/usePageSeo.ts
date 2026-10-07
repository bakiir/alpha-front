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

export type PageSeoSource = 'seo_page' | 'unpublished' | 'toy' | 'fallback'

export interface PageSeoResponse {
  success: boolean
  data: PageSeoData | null
  meta?: { source?: PageSeoSource }
}

/**
 * Reuse SSR payload during hydration; refetch on client navigations so admin
 * edits appear without a frontend rebuild.
 */
function freshAsyncDataOptions() {
  const nuxtApp = useNuxtApp()
  return {
    server: true as const,
    lazy: false as const,
    getCachedData: (key: string) => {
      if (nuxtApp.isHydrating) {
        return nuxtApp.payload.data[key] as PageSeoResponse | undefined
      }
      return undefined
    },
  }
}

export const usePageSeo = (customPath?: string) => {
  const route = useRoute()
  const config = useRuntimeConfig()
  const path = customPath || route.path

  const asyncKey = `page-seo-${path}`
  const apiBase = resolveApiBase(config.public.apiBase as string)

  const {
    data: seoResponse,
    pending,
    error,
    refresh,
  } = useAsyncData<PageSeoResponse>(
    asyncKey,
    () => $fetch(`${apiBase}/seo`, { params: { path } }),
    freshAsyncDataOptions(),
  )

  const seo = computed<PageSeoData | null>(() => seoResponse.value?.data ?? null)
  const source = computed<PageSeoSource>(() => seoResponse.value?.meta?.source || (seo.value ? 'seo_page' : 'fallback'))
  const isPublishedCms = computed(() => source.value === 'seo_page' && !!seo.value)
  const isUnpublished = computed(() => source.value === 'unpublished')
  const hasError = computed(() => !!error.value)

  // Visible H1 from CMS: keep intentional empty string; do not invent hardcoded copy.
  const h1 = computed<string | null>(() => {
    if (!seo.value) return null
    if (seo.value.h1 !== null && seo.value.h1 !== undefined) return seo.value.h1
    // Missing H1 on a CMS row — page_name is an admin label, usable as soft fallback for functional pages.
    return seo.value.page_name || null
  })

  // Preserve '' (cleared) vs null (absent).
  const seoText = computed<string | null>(() => {
    if (!seo.value) return null
    return seo.value.seo_text
  })

  // Call head composables synchronously in setup — never inside watchEffect (NUXT_E1001).
  useSeoMeta({
    title: () => seo.value?.meta_title || undefined,
    description: () => seo.value?.meta_description || undefined,
    ogTitle: () => seo.value?.og_title || seo.value?.meta_title || undefined,
    ogDescription: () => seo.value?.og_description || seo.value?.meta_description || undefined,
    ogImage: () => seo.value?.og_image || undefined,
    robots: () => {
      if (isUnpublished.value) return 'noindex, nofollow'
      return seo.value?.robots || 'index, follow'
    },
  })

  useHead(() => {
    const data = seo.value
    if (!data) {
      return { meta: [], link: [], script: [] }
    }

    return {
      meta: data.meta_keywords ? [{ name: 'keywords' as const, content: data.meta_keywords }] : [],
      link: data.canonical_url
        ? [{ rel: 'canonical' as const, href: data.canonical_url }]
        : [],
      script: data.schema_json
        ? [{ type: 'application/ld+json', innerHTML: JSON.stringify(data.schema_json) }]
        : [],
    }
  })

  return {
    seo,
    h1,
    seoText,
    source,
    isPublishedCms,
    isUnpublished,
    isLoading: pending,
    hasError,
    error,
    refresh,
  }
}
