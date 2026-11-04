/**
 * Locale and translator for code that runs outside a component `setup`
 * (Nuxt plugins, route middleware). `useI18n()` needs a component instance
 * and throws "Must be called at the top of a setup function" there.
 * `$i18n` is the global composer installed by @nuxtjs/i18n.
 */
export function useAppI18n() {
  const { $i18n } = useNuxtApp()

  const locale = computed(() => {
    const current = $i18n.locale as string | { value?: string }
    const code = typeof current === 'string' ? current : current?.value
    return code || 'ru'
  })

  const t = (key: string) => $i18n.t(key)
  const te = (key: string) => Boolean($i18n.te(key))

  return { locale, t, te }
}
