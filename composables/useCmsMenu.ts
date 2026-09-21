export interface CmsMenuItemDto {
  id: number
  label: string
  url: string
  target: string
  children?: Array<{ id: number; label: string; url: string; target: string }>
}

export interface CmsMenuDto {
  location: string
  title: string | null
  items: CmsMenuItemDto[]
}

export const useCmsMenu = (location: string) => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase || 'http://127.0.0.1:8000/api'

  const { data, pending, refresh } = useAsyncData<{ success: boolean; data: CmsMenuDto }>(
    `cms-menu-${location}`,
    () => $fetch(`${apiBase}/menus/${location}`),
    { server: true },
  )

  const menu = computed(() => data.value?.data || null)
  const items = computed(() => menu.value?.items || [])

  return { menu, items, isLoading: pending, refresh }
}
