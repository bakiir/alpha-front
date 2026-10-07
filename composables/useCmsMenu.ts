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
  const apiBase = resolveApiBase(config.public.apiBase as string)
  const { cmsLocale } = useCmsLocale()
  const localePath = useLocalePath()

  const { data, pending, refresh } = useAsyncData<{ success: boolean; data: CmsMenuDto }>(
    () => `cms-menu-${location}-${cmsLocale.value}`,
    () => $fetch(`${apiBase}/menus/${location}`, { params: { locale: cmsLocale.value } }),
    { server: true, watch: [cmsLocale] },
  )

  const menu = computed(() => data.value?.data || null)
  const items = computed(() => {
    const raw = menu.value?.items || []
    return raw.map(item => ({
      ...item,
      url: cmsToLocalePath(item.url, localePath),
      children: (item.children || []).map(child => ({
        ...child,
        url: cmsToLocalePath(child.url, localePath),
      })),
    }))
  })

  return { menu, items, isLoading: pending, refresh }
}
