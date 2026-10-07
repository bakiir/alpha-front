/**
 * Current CMS/API locale from Nuxt i18n (ru|kk|en).
 */
export function useCmsLocale() {
  const { locale } = useI18n()
  const cmsLocale = computed(() => {
    const code = String(locale.value || 'ru')
    if (code === 'kk' || code === 'en' || code === 'ru') return code
    return 'ru'
  })
  return { cmsLocale }
}
