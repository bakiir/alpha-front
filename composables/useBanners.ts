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

export const useBanners = (position: string = 'home_hero') => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase || 'http://127.0.0.1:8000/api'

  const { data: bannerResponse, pending: isLoading, refresh: fetchBanners } = useAsyncData<{ success: boolean; data: BannerItem[] }>(
    `banners-${position}`,
    () => $fetch(`${apiBase}/banners`, { params: { position } }),
    { server: true }
  )

  const banners = computed<BannerItem[]>(() => bannerResponse.value?.data || [])

  return {
    banners,
    isLoading,
    fetchBanners,
  }
}
