import { truncateMetaDescription } from '~/utils/seo'

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

/** CMS path → `seo.description.*` i18n key used when the CMS has no meta_description. */
const FALLBACK_DESCRIPTION_KEYS: Record<string, string> = {
  '/': 'home',
  '/shop': 'shop',
  '/subscription': 'subscription',
  '/short-rent': 'shortRent',
  '/gifts': 'gifts',
  '/gift-boxes': 'giftBoxes',
  '/about': 'about',
  '/faq': 'faq',
  '/contacts': 'contacts',
  '/partners': 'partners',
  '/freshness-promise': 'freshnessPromise',
  '/sell': 'sell',
  '/support': 'support',
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

  const { t, te } = useI18n()
  const fallbackDescription = computed<string | undefined>(() => {
    const key = FALLBACK_DESCRIPTION_KEYS[path.value]
    if (!key) return undefined
    const fullKey = `seo.description.${key}`
    return te(fullKey) ? t(fullKey) : undefined
  })

  // CMS rules:
  // - empty string "": intentionally cleared by admin -> null (suppress tag, do NOT fallback or show app default)
  // - custom translation in CMS for this locale: use it
  // - missing translation in this locale (fallback_fields includes 'meta_description' or null):
  //   allow fallback to localized static copy if available, else CMS fallback, else app default
  const description = computed<string | null | undefined>(() => {
    if (seo.value) {
      const cmsDesc = seo.value.meta_description
      if (cmsDesc === '') {
        return null
      }
      const isFallbackField = fallbackFields.value.includes('meta_description')
      if (!isFallbackField && typeof cmsDesc === 'string' && cmsDesc.trim().length > 0) {
        return truncateMetaDescription(cmsDesc)
      }
    }

    if (fallbackDescription.value) {
      return truncateMetaDescription(fallbackDescription.value)
    }

    if (seo.value?.meta_description) {
      return truncateMetaDescription(seo.value.meta_description)
    }

    return undefined
  })

  const ogDescription = computed<string | null | undefined>(() => {
    if (seo.value) {
      const cmsOg = seo.value.og_description
      if (cmsOg === '') {
        return null
      }
      const isFallbackOg = fallbackFields.value.includes('og_description')
      if (!isFallbackOg && typeof cmsOg === 'string' && cmsOg.trim().length > 0) {
        return truncateMetaDescription(cmsOg)
      }
    }
    return description.value
  })

  // Meta from CMS; canonical + hreflang owned by @nuxtjs/i18n (do not set CMS canonical here).
  // Description falls back to localized static copy when the CMS field is empty.
  useSeoMeta({
    title: () => seo.value?.meta_title || undefined,
    description: () => description.value,
    ogTitle: () => seo.value?.og_title || seo.value?.meta_title || undefined,
    ogDescription: () => ogDescription.value,
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
