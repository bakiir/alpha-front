import { COOKIE_CONSENT_NAME, COOKIES_BLOCKED_UNTIL_CONSENT } from '~/utils/cookieNames'

const expireCookie = (name: string) => {
  document.cookie = `${encodeURIComponent(name)}=; Max-Age=0; path=/; SameSite=Lax`
}

export default defineNuxtPlugin({
  name: 'alpha-cookie-consent',
  enforce: 'pre',
  setup() {
    const consent = useCookie<'1' | null>(COOKIE_CONSENT_NAME)
    if (consent.value === '1') return

    for (const name of COOKIES_BLOCKED_UNTIL_CONSENT) {
      expireCookie(name)
    }
  },
})
