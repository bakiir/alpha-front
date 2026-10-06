import { resolveApiBase } from '~/utils/mediaUrl'

const AUTH_SESSION_COOKIE = 'alpha_auth_session'

export const useApi = () => {
  const config = useRuntimeConfig()
  const baseURL = resolveApiBase(config.public.apiBase as string)
  // Capture during setup so we never call useCookie/useState after await (NUXT_E1001).
  const authUser = useState<unknown>('auth_user', () => null)
  const authSession = useCookie<string | null>(AUTH_SESSION_COOKIE, {
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 180,
  })
  const legacyTokenCookie = useCookie<string | null>('alpha_auth_token')

  /** Non-secret UX flag only — the real token is HttpOnly on the API host. */
  const hasAuthSession = (): boolean => authSession.value === '1' || !!authUser.value

  const clearClientAuthArtifacts = () => {
    authSession.value = null
    authUser.value = null
    legacyTokenCookie.value = null
    if (import.meta.client) {
      localStorage.removeItem('alpha_auth_token')
    }
  }

  const request = async <T = any>(endpoint: string, options: any = {}): Promise<T> => {
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
    const isBlob = typeof Blob !== 'undefined' && options.body instanceof Blob

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      ...(isFormData || isBlob ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    }

    // Never attach Authorization from localStorage/cookie — token is HttpOnly.
    delete headers.Authorization
    delete headers.authorization

    const url = endpoint.startsWith('http')
      ? endpoint
      : `${baseURL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`

    try {
      const response = await $fetch<T>(url, {
        ...options,
        headers,
        credentials: 'include',
      })
      return response
    } catch (error: any) {
      if (error?.response?.status === 401 && import.meta.client) {
        clearClientAuthArtifacts()
      }
      throw error
    }
  }

  return {
    request,
    baseURL,
    hasAuthSession,
    clearClientAuthArtifacts,
  }
}
