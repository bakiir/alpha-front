export interface StorefrontHomePayload {
  banners: unknown[]
  photo_stack: unknown[]
  sections: Array<{
    section_key: string
    title: string | null
    subtitle: string | null
    badge_text: string | null
    content: Record<string, unknown> | null
  }>
  faqs: unknown[]
  collections: Array<{
    slug: string
    title: string
    subtitle: string | null
    type: string
    items: unknown[]
  }>
  seo_text: string | null
  settings: Record<string, string>
}

export const useStorefrontHome = (city?: string) => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase || 'http://127.0.0.1:8000/api'
  const key = `storefront-home-${city || '-'}`

  const { data, pending, refresh } = useAsyncData<{ success: boolean; data: StorefrontHomePayload }>(
    key,
    () => $fetch(`${apiBase}/storefront/home`, { params: city ? { city } : undefined }),
    { server: true },
  )

  const home = computed(() => data.value?.data || null)

  return {
    home,
    isLoading: pending,
    refresh,
  }
}
