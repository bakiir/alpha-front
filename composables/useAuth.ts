export interface User {
  id: number
  name: string
  email: string | null
  phone: string | null
  role: string
  address: string | null
  last_name?: string | null
  has_password?: boolean
}

/** Служебный email при регистрации только по телефону (БД требует unique email). */
export function isPlaceholderEmail(email: string | null | undefined): boolean {
  return !!email && email.endsWith('@phone.alpha.local')
}

export function displayEmail(email: string | null | undefined): string {
  if (!email || isPlaceholderEmail(email)) return 'Не указан'
  return email
}

export const useAuth = () => {
  const user = useState<User | null>('auth_user', () => null)
  const isAuthModalOpen = useState<boolean>('auth_modal_open', () => false)
  const authModalMode = useState<'login' | 'register'>('auth_modal_mode', () => 'login')
  const isLoading = useState<boolean>('auth_loading', () => false)
  const isInitialized = useState<boolean>('auth_initialized', () => false)

  const { request, hasAuthSession, clearClientAuthArtifacts } = useApi()

  const authSession = useCookie<string | null>('alpha_auth_session', {
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 180,
  })
  const legacyTokenCookie = useCookie<string | null>('alpha_auth_token')

  const markSession = () => {
    authSession.value = '1'
  }

  const clearLegacyClientTokens = () => {
    legacyTokenCookie.value = null
    if (import.meta.client) {
      localStorage.removeItem('alpha_auth_token')
    }
  }

  const removeSession = () => {
    clearClientAuthArtifacts()
    if (import.meta.client) {
      localStorage.removeItem('alpha_children_list')
      localStorage.removeItem('alpha_active_child_index')
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
    clearLegacyClientTokens()

    // Non-secret session flag gates the /user probe. The real credential is HttpOnly.
    if (!hasAuthSession()) {
      user.value = null
      isInitialized.value = true
      return null
    }

    try {
      isLoading.value = true
      const res = await request<{ data?: User, id?: number }>('/user')
      const userData = 'data' in res && res.data ? res.data : res as User
      user.value = userData
      markSession()
      return user.value
    } catch (err) {
      user.value = null
      removeSession()
      return null
    } finally {
      isLoading.value = false
      isInitialized.value = true
    }
  }

  const applyAuthResponse = (res: { user: any }) => {
    const userData = res.user && typeof res.user === 'object' && 'data' in res.user ? res.user.data : res.user
    user.value = userData as User
    markSession()
    clearLegacyClientTokens()
    closeAuthModal()
  }

  const login = async (credentials: { login: string; password: string }) => {
    isLoading.value = true
    try {
      const res = await request<{ user: any }>('/auth/login', {
        method: 'POST',
        body: credentials
      })

      applyAuthResponse(res)
      return res
    } finally {
      isLoading.value = false
    }
  }

  const register = async (data: {
    name: string
    last_name: string
    email: string
    phone: string
    password: string
    password_confirmation: string
  }) => {
    isLoading.value = true
    try {
      const res = await request<{ user: any }>('/auth/register', {
        method: 'POST',
        body: data
      })

      applyAuthResponse(res)
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
    removeSession()
    user.value = null
    navigateTo('/profile')
  }

  const updateUser = async (data: {
    name?: string
    email?: string | null
    phone?: string | null
    last_name?: string | null
  }) => {
    isLoading.value = true
    try {
      const res = await request<{ data?: User } | User>('/user', {
        method: 'PUT',
        body: data,
      })
      const userData = res && typeof res === 'object' && 'data' in res && res.data ? res.data : res as User
      user.value = userData
      return userData
    } finally {
      isLoading.value = false
    }
  }

  const loginWithPhone = async (phone: string, code: string) => {
    isLoading.value = true
    try {
      const { loginWithPhone: phoneLogin } = usePhoneAuth()
      const res = await phoneLogin(phone, code)
      applyAuthResponse(res)
      return res
    } finally {
      isLoading.value = false
    }
  }

  const registerWithPhone = async (data: {
    phone: string
    code: string
    name: string
    last_name: string
    email?: string
  }) => {
    isLoading.value = true
    try {
      const { registerWithPhone: phoneRegister } = usePhoneAuth()
      const res = await phoneRegister(data)
      applyAuthResponse(res)
      return res
    } finally {
      isLoading.value = false
    }
  }

  const updatePassword = async (data: {
    current_password?: string
    password: string
    password_confirmation: string
  }) => {
    isLoading.value = true
    try {
      const res = await request<{ message: string; user?: User | { data?: User } }>('/user/password', {
        method: 'PUT',
        body: data,
      })
      const userData = res.user && typeof res.user === 'object' && 'data' in res.user ? res.user.data : res.user
      if (userData) {
        user.value = userData as User
      }
      return res
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    isAuthModalOpen,
    authModalMode,
    isLoading,
    isInitialized,
    hasAuthSession,
    setUser,
    openAuthModal,
    closeAuthModal,
    fetchUser,
    login,
    register,
    loginWithPhone,
    registerWithPhone,
    updateUser,
    updatePassword,
    logout,
  }
}
