export interface SiteSettingsDict {
  site_phone?: string
  site_phone_raw?: string
  site_email?: string
  showroom_address?: string
  work_hours?: string
  whatsapp_url?: string
  instagram_url?: string
  telegram_url?: string
  yandex_metrika_id?: string
  google_tag_manager_id?: string
  head_custom_scripts?: string
  body_custom_scripts?: string
  robots_txt_content?: string
  [key: string]: string | undefined
}

export const useSiteSettings = () => {
  const { request } = useApi()
  const settings = useState<SiteSettingsDict>('alpha_site_settings', () => ({}))
  const isLoaded = useState<boolean>('alpha_site_settings_loaded', () => false)

  const fetchSettings = async () => {
    try {
      const res = await request<{ success: boolean; data: SiteSettingsDict }>('/settings')
      if (res && res.data) {
        settings.value = res.data
        isLoaded.value = true
      }
    } catch (e) {
      console.warn('[useSiteSettings] Failed to load site settings:', e)
    }
  }

  const phone = computed(() => settings.value.site_phone || '+7 (707) 123-45-67')
  const phoneRaw = computed(() => settings.value.site_phone_raw || '+77071234567')
  const email = computed(() => settings.value.site_email || 'hello@alpha-toys.kz')
  const address = computed(() => settings.value.showroom_address || 'г. Алматы, пр. Достык 180, БЦ Коктем, 1 этаж')
  const workHours = computed(() => settings.value.work_hours || 'Ежедневно: 09:00 – 21:00')
  const whatsappUrl = computed(() => settings.value.whatsapp_url || 'https://wa.me/77071234567')
  const instagramUrl = computed(() => settings.value.instagram_url || 'https://instagram.com/alpha_toys_kz')
  const telegramUrl = computed(() => settings.value.telegram_url || 'https://t.me/alphatoys_kz')
  const yandexMetrikaId = computed(() => settings.value.yandex_metrika_id || '')
  const googleTagManagerId = computed(() => settings.value.google_tag_manager_id || '')
  const headCustomScripts = computed(() => settings.value.head_custom_scripts || '')
  const bodyCustomScripts = computed(() => settings.value.body_custom_scripts || '')

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
    telegramUrl,
    yandexMetrikaId,
    googleTagManagerId,
    headCustomScripts,
    bodyCustomScripts,
  }
}
