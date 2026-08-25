export const useApi = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase || 'http://127.0.0.1:8000/api'
  const tokenCookie = useCookie<string | null>('alpha_auth_token')

  const getToken = (): string => {
    if (tokenCookie.value) {
      return tokenCookie.value
    }
    if (import.meta.client) {
      return localStorage.getItem('alpha_auth_token') || ''
    }
    return ''
  }

  const request = async <T = any>(endpoint: string, options: any = {}): Promise<T> => {
    const token = getToken()

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const url = endpoint.startsWith('http')
      ? endpoint
      : `${baseURL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`

    try {
      const response = await $fetch<T>(url, {
        ...options,
        headers,
      })
      return response
    } catch (error: any) {
      // Handle unauthorized error globally
      if (error?.response?.status === 401 && import.meta.client) {
        tokenCookie.value = null
        localStorage.removeItem('alpha_auth_token')
        const auth = useAuth()
        auth.setUser(null)
      }
      throw error
    }
  }

  return {
    request,
    baseURL,
    getToken,
  }
}
