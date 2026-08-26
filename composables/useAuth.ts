export interface User {
  id: number
  name: string
  email: string
  phone: string | null
  role: string
  address: string | null
}

export const useAuth = () => {
  const user = useState<User | null>('auth_user', () => null)
  const isAuthModalOpen = useState<boolean>('auth_modal_open', () => false)
  const authModalMode = useState<'login' | 'register'>('auth_modal_mode', () => 'login')
  const isLoading = useState<boolean>('auth_loading', () => false)
  const isInitialized = useState<boolean>('auth_initialized', () => false)

  const { request } = useApi()

  const setToken = (token: string) => {
    const tokenCookie = useCookie<string | null>('alpha_auth_token')
    tokenCookie.value = token
    if (import.meta.client) {
      localStorage.setItem('alpha_auth_token', token)
    }
  }

  const removeToken = () => {
    const tokenCookie = useCookie<string | null>('alpha_auth_token')
    tokenCookie.value = null
    if (import.meta.client) {
      localStorage.removeItem('alpha_auth_token')
    }
  }

  const setUser = (newUser: User | null) => {
    user.value = newUser
  }

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    authModalMode.value = mode
    isAuthModalOpen.value = true
  }

  const closeAuthModal = () => {
    isAuthModalOpen.value = false
  }

  const fetchUser = async () => {
    const tokenCookie = useCookie<string | null>('alpha_auth_token')
    const token = tokenCookie.value || (import.meta.client ? localStorage.getItem('alpha_auth_token') : null)
    
    if (!token) {
      user.value = null
      isInitialized.value = true
      return null
    }

    try {
      isLoading.value = true
      const res = await request<{ data?: User, id?: number }>('/user')
      const userData = 'data' in res && res.data ? res.data : res as User
      user.value = userData
      return user.value
    } catch (err) {
      user.value = null
      removeToken()
      return null
    } finally {
      isLoading.value = false
      isInitialized.value = true
    }
  }

  const login = async (credentials: { email: string; password: string }) => {
    isLoading.value = true
    try {
      const res = await request<{ access_token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: credentials
      })

      setToken(res.access_token)
      const userData = res.user && typeof res.user === 'object' && 'data' in res.user ? res.user.data : res.user
      user.value = userData as User
      closeAuthModal()
      return res
    } finally {
      isLoading.value = false
    }
  }

  const register = async (data: {
    name: string
    email: string
    phone: string
    password: string
    password_confirmation: string
  }) => {
    isLoading.value = true
    try {
      const res = await request<{ access_token: string; user: any }>('/auth/register', {
        method: 'POST',
        body: data
      })

      setToken(res.access_token)
      const userData = res.user && typeof res.user === 'object' && 'data' in res.user ? res.user.data : res.user
      user.value = userData as User
      closeAuthModal()
      return res
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      await request('/auth/logout', { method: 'POST' })
    } catch (e) {
      // ignore
    }
    removeToken()
    user.value = null
    navigateTo('/profile')
  }

  return {
    user,
    isAuthModalOpen,
    authModalMode,
    isLoading,
    isInitialized,
    setUser,
    openAuthModal,
    closeAuthModal,
    fetchUser,
    login,
    register,
    logout,
  }
}
