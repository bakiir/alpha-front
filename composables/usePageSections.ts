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

export const usePageSections = (pageKey: string = 'home') => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase || 'http://127.0.0.1:8000/api'

  const { data, pending, refresh } = useAsyncData<{ success: boolean; data: PageSectionItem[] }>(
    `page-sections-${pageKey}`,
    () => $fetch(`${apiBase}/page-sections`, { params: { page: pageKey } }),
    { server: true },
  )

  const sections = computed(() => data.value?.data || [])

  const sectionByKey = (key: string) =>
    computed(() => sections.value.find(s => s.section_key === key) || null)

  return {
    sections,
    sectionByKey,
    isLoading: pending,
    refresh,
  }
}
