export interface BannerItem {
  id: number
  position: string
  title: string
  subtitle: string | null
  description: string | null
  badge_text: string | null
  desktop_image: string
  mobile_image: string
  image_alt: string
  button_text: string | null
  button_link: string | null
  sort_order: number
}

export type BannerLoadState = 'loading' | 'ready' | 'empty' | 'error'

export const useBanners = (position: string = 'home_hero') => {
  const config = useRuntimeConfig()
  const apiBase = resolveApiBase(config.public.apiBase as string)
  const { cmsLocale } = useCmsLocale()
  const localePath = useLocalePath()

  const {
    data: bannerResponse,
    pending: isLoading,
    error: fetchError,
    refresh: fetchBanners,
  } = useAsyncData<{ success: boolean; data: BannerItem[] }>(
    () => `banners-${position}-${cmsLocale.value}`,
    () => $fetch(`${apiBase}/banners`, { params: { position, locale: cmsLocale.value } }),
    { server: true, watch: [cmsLocale] },
  )

  const banners = computed<BannerItem[]>(() => {
    const rows = bannerResponse.value?.data || []
    return rows.map(b => ({
      ...b,
      button_link: b.button_link ? cmsToLocalePath(b.button_link, localePath) : b.button_link,
    }))
  })

  const loadState = computed<BannerLoadState>(() => {
    if (isLoading.value) {
      return 'loading'
    }
    if (fetchError.value) {
      return 'error'
    }
    if (bannerResponse.value && bannerResponse.value.success === false) {
      return 'error'
    }
    if (!banners.value.length) {
      return 'empty'
    }
    return 'ready'
  })

  return {
    banners,
    isLoading,
    loadState,
    fetchError,
    fetchBanners,
  }
}
