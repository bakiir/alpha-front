import type { CookieOptions } from '#app'

/**
 * Client preference cookie — persisted only after cookie consent (see useCookieConsent).
 * Until then values live in memory (useState) only.
 */
export function useAlphaCookie<T>(
  name: string,
  opts?: CookieOptions<T> & { default?: () => T | null },
) {
  const { hasConsent } = useCookieConsent()
  const memoryKey = `alpha-cookie-mem:${name}`
  const memory = useState<T | null>(memoryKey, () => null)

  const cookie = useCookie<T | null>(name, {
    sameSite: 'lax',
    path: '/',
    ...opts,
    default: () => (opts?.default?.() ?? null) as T | null,
  })

  watch(
    hasConsent,
    (ok) => {
      if (!ok) return
      if (memory.value !== null && memory.value !== undefined) {
        cookie.value = memory.value as T | null
      }
    },
    { immediate: true },
  )

  return computed<T | null>({
    get() {
      if (!hasConsent.value) return memory.value
      return cookie.value as T | null
    },
    set(v: T | null) {
      memory.value = v
      if (hasConsent.value) {
        cookie.value = v as T | null
      }
    },
  })
}
