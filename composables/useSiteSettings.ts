export interface SiteSettingsDict {
  site_phone?: string
  site_phone_raw?: string
  site_email?: string
  showroom_address?: string
  work_hours?: string
  whatsapp_url?: string
  instagram_url?: string
  facebook_url?: string
  tiktok_url?: string
  telegram_url?: string
  [key: string]: string | undefined
}

export const useSiteSettings = () => {
  const { request } = useApi()
  const settings = useState<SiteSettingsDict>('alpha_site_settings', () => ({}))
  const isLoaded = useState<boolean>('alpha_site_settings_loaded', () => false)

  const fetchSettings = async () => {
    try {
      const { cmsLocale } = useCmsLocale()
      const res = await request<{ success: boolean; data: SiteSettingsDict }>(`/settings?locale=${cmsLocale.value}`)
      if (res && res.data) {
        settings.value = res.data
        isLoaded.value = true
      }
    } catch (e) {
      console.warn('[useSiteSettings] Failed to load site settings:', e)
    }
  }

  // Storefront mirrors CMS only — no hardcoded brand URLs as silent fallbacks.
  const phone = computed(() => settings.value.site_phone || '')
  const phoneRaw = computed(() => settings.value.site_phone_raw || '')
  const email = computed(() => settings.value.site_email || '')
  const address = computed(() => settings.value.showroom_address || '')
  const workHours = computed(() => settings.value.work_hours || '')
  const whatsappUrl = computed(() => settings.value.whatsapp_url || '')
  const instagramUrl = computed(() => settings.value.instagram_url || '')
  const facebookUrl = computed(() => settings.value.facebook_url || '')
  const tiktokUrl = computed(() => settings.value.tiktok_url || '')
  const telegramUrl = computed(() => settings.value.telegram_url || '')
  // Analytics keys are not in the public /settings payload; keep stubs so app.vue stays safe.
  const yandexMetrikaId = computed(() => '')
  const googleTagManagerId = computed(() => '')
  const headCustomScripts = computed(() => '')
  const bodyCustomScripts = computed(() => '')

  return {
    settings,
    isLoaded,
    fetchSettings,
    phone,
    phoneRaw,
    email,
    address,
    workHours,
    whatsappUrl,
    instagramUrl,
    facebookUrl,
    tiktokUrl,
    telegramUrl,
    yandexMetrikaId,
    googleTagManagerId,
    headCustomScripts,
    bodyCustomScripts,
  }
}
