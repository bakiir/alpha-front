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
    if (import.meta.client) {
      localStorage.setItem('alpha_auth_token', token)
    }
  }

  const saveMockUser = (mockUser: User) => {
    if (import.meta.client) {
      localStorage.setItem('alpha_mock_user', JSON.stringify(mockUser))
    }
  }

  const removeToken = () => {
    if (import.meta.client) {
      localStorage.removeItem('alpha_auth_token')
      localStorage.removeItem('alpha_mock_user')
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
    if (!import.meta.client) return null
    const token = localStorage.getItem('alpha_auth_token')
    if (!token) {
      user.value = null
      isInitialized.value = true
      return null
    }


    if (token.startsWith('mock_token_')) {
      try {
        const savedUser = localStorage.getItem('alpha_mock_user')
        user.value = savedUser ? JSON.parse(savedUser) : null
        return user.value
      } catch {
        removeToken()
        user.value = null
        return null
      } finally {
        isInitialized.value = true
      }
    }

    try {
      isLoading.value = true
      const res = await request<{ data: User }>('/user')
      user.value = res.data
      return res.data
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
      const emailName = credentials.email.split('@')[0].replace(/[._-]+/g, ' ').trim()
      const displayName = emailName
        ? emailName.charAt(0).toUpperCase() + emailName.slice(1)
        : 'Асет'
      const mockUser: User = {
        id: 1,
        name: displayName,
        email: credentials.email,
        phone: '+7 (707) 123-45-67',
        role: 'customer',
        address: 'г. Алматы, пр. Абая 150'
      }

      const token = 'mock_token_' + Date.now()
      setToken(token)
      saveMockUser(mockUser)
      user.value = mockUser
      closeAuthModal()
      return { access_token: token, user: mockUser }
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
      const mockUser: User = {
        id: Date.now(),
        name: data.name.trim() || 'Асет',
        email: data.email,
        phone: data.phone || '+7 (707) 123-45-67',
        role: 'customer',
        address: 'г. Алматы, пр. Абая 150'
      }

      const token = 'mock_token_' + Date.now()
      setToken(token)
      saveMockUser(mockUser)
      user.value = mockUser
      closeAuthModal()
      return { access_token: token, user: mockUser }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
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
