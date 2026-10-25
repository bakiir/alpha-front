import { COOKIE_CONSENT_NAME } from '~/utils/cookieNames'

export const useCookieConsent = () => {
  const consentCookie = useCookie<'1' | null>(COOKIE_CONSENT_NAME, {
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    default: () => null,
  })

  const { locale } = useI18n()
  const i18nRedirectCookie = useCookie<string | null>('i18n_redirected', {
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    default: () => null,
  })

  const hasConsent = computed(() => consentCookie.value === '1')
  const showBanner = computed(() => !hasConsent.value)

  const accept = () => {
    consentCookie.value = '1'
    i18nRedirectCookie.value = locale.value
  }

  return {
    hasConsent,
    showBanner,
    accept,
  }
}
