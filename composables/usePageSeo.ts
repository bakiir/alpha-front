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
  meta?: {
    source?: PageSeoSource
    locale?: string
    fallback_fields?: string[]
  }
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

/** Strip /kk|/en locale prefix for CMS path lookup. */
export function cmsPathFromRoute(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  const stripped = normalized.replace(/^\/(kk|en)(?=\/|$)/, '') || '/'
  if (stripped !== '/' && stripped.endsWith('/')) {
    return stripped.replace(/\/+$/, '') || '/'
  }
  return stripped
}

export const usePageSeo = (customPath?: string) => {
  const route = useRoute()
  const config = useRuntimeConfig()
  const { cmsLocale } = useCmsLocale()
  const path = computed(() => customPath || cmsPathFromRoute(route.path))

  const asyncKey = computed(() => `page-seo-${path.value}-${cmsLocale.value}`)
  const apiBase = resolveApiBase(config.public.apiBase as string)

  const {
    data: seoResponse,
    pending,
    error,
    refresh,
  } = useAsyncData<PageSeoResponse>(
    () => asyncKey.value,
    () => $fetch(`${apiBase}/seo`, {
      params: { path: path.value, locale: cmsLocale.value },
    }),
    {
      ...freshAsyncDataOptions(),
      watch: [path, cmsLocale],
    },
  )

  const seo = computed<PageSeoData | null>(() => seoResponse.value?.data ?? null)
  const source = computed<PageSeoSource>(() => seoResponse.value?.meta?.source || (seo.value ? 'seo_page' : 'fallback'))
  const isPublishedCms = computed(() => source.value === 'seo_page' && !!seo.value)
  const isUnpublished = computed(() => source.value === 'unpublished')
  const hasError = computed(() => !!error.value)
  const fallbackFields = computed(() => seoResponse.value?.meta?.fallback_fields || [])

  const h1 = computed<string | null>(() => {
    if (!seo.value) return null
    if (seo.value.h1 !== null && seo.value.h1 !== undefined) return seo.value.h1
    return seo.value.page_name || null
  })

  const seoText = computed<string | null>(() => {
    if (!seo.value) return null
    return seo.value.seo_text
  })

  // Meta from CMS; canonical + hreflang owned by @nuxtjs/i18n (do not set CMS canonical here).
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
      // Intentionally no CMS canonical — Nuxt I18n SEO owns canonical/hreflang.
      link: [],
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
    fallbackFields,
    isLoading: pending,
    hasError,
    error,
    refresh,
  }
}
