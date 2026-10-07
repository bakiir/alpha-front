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
  const apiBase = resolveApiBase(config.public.apiBase as string)
  const { cmsLocale } = useCmsLocale()
  const { selectedCity, cityId } = useCity()
  const cityKey = computed(() => city || selectedCity.value?.slug || (cityId.value ? String(cityId.value) : '-'))

  const { data, pending, refresh } = useAsyncData<{ success: boolean; data: StorefrontHomePayload }>(
    () => `storefront-home-${cityKey.value}-${cmsLocale.value}`,
    () => $fetch(`${apiBase}/storefront/home`, {
      params: {
        locale: cmsLocale.value,
        ...(cityKey.value !== '-' ? { city: cityKey.value } : {}),
      },
    }),
    { server: true, watch: [cmsLocale, cityKey] },
  )

  const home = computed(() => data.value?.data || null)

  return {
    home,
    isLoading: pending,
    refresh,
  }
}
