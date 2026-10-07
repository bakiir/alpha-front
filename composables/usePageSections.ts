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
}

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

  const { data, pending, error, refresh } = useAsyncData<PageSectionsResponse>(
    `page-sections-${pageKey}`,
    () => $fetch(`${apiBase}/page-sections`, { params: { page: pageKey } }),
    freshAsyncDataOptions(),
  )

  const sections = computed(() => data.value?.data || [])

  const sectionByKey = (key: string) =>
    computed(() => sections.value.find(s => s.section_key === key) || null)

  return {
    sections,
    sectionByKey,
    isLoading: pending,
    hasError: computed(() => !!error.value),
    error,
    refresh,
  }
}
