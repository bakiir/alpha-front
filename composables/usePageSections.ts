export interface PageSectionItem {
  id: number
  page_key: string
  section_key: string
  title: string | null
  subtitle: string | null
  badge_text: string | null
  content: Record<string, unknown> | null
  sort_order: number
}

export interface PageSectionsResponse {
  success: boolean
  data: PageSectionItem[]
  meta?: { locale?: string; fallback_fields?: string[] }
}

export type PageSectionResolveState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'bootstrap' }
  | { status: 'hidden' }
  | { status: 'ready'; section: PageSectionItem }

function freshAsyncDataOptions() {
  const nuxtApp = useNuxtApp()
  return {
    server: true as const,
    getCachedData: (key: string) => {
      if (nuxtApp.isHydrating) {
        return nuxtApp.payload.data[key] as PageSectionsResponse | undefined
      }
      return undefined
    },
  }
}

export const usePageSections = (pageKey: string = 'home') => {
  const config = useRuntimeConfig()
  const apiBase = resolveApiBase(config.public.apiBase as string)
  const { cmsLocale } = useCmsLocale()

  const { data, pending, error, refresh } = useAsyncData<PageSectionsResponse>(
    () => `page-sections-${pageKey}-${cmsLocale.value}`,
    () => $fetch(`${apiBase}/page-sections`, {
      params: { page: pageKey, locale: cmsLocale.value },
    }),
    { ...freshAsyncDataOptions(), watch: [cmsLocale] },
  )

  const sections = computed(() => data.value?.data || [])

  const sectionByKey = (key: string) =>
    computed(() => sections.value.find(s => s.section_key === key) || null)

  const resolveSection = (key: string) =>
    computed<PageSectionResolveState>(() => {
      if (pending.value && !data.value) {
        return { status: 'loading' }
      }
      if (error.value) {
        return { status: 'error' }
      }
      const list = data.value?.data
      if (!Array.isArray(list)) {
        return { status: 'loading' }
      }
      const found = list.find(s => s.section_key === key)
      if (found) {
        return { status: 'ready', section: found }
      }
      if (list.length === 0) {
        return { status: 'bootstrap' }
      }
      return { status: 'hidden' }
    })

  return {
    sections,
    sectionByKey,
    resolveSection,
    isLoading: pending,
    hasError: computed(() => !!error.value),
    error,
    refresh,
  }
}
