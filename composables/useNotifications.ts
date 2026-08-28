// composables/useNotifications.ts
// Fetches and manages in-app notifications for the current user.

export interface AppNotification {
  id: number
  type: string
  icon: string
  title: string
  body: string
  action_url: string | null
  action_label: string | null
  data: Record<string, any> | null
  read_at: string | null
  created_at: string
}

export const useNotifications = () => {
  const { request } = useApi()
  const { user } = useAuth()

  const notifications = useState<AppNotification[]>('notifications', () => [])
  const unreadCount = useState<number>('notifications_unread', () => 0)
  const isLoading = ref(false)
  const hasFetched = ref(false)

  const fetchNotifications = async () => {
    if (!user.value) return
    isLoading.value = true
    try {
      const res = await request<any>('/notifications')
      const list = res?.data ?? []
      notifications.value = Array.isArray(list) ? list : []
      unreadCount.value = res?.unread_count ?? notifications.value.filter(n => !n.read_at).length
      hasFetched.value = true
    } catch (e) {
      console.warn('[Notifications] fetch error', e)
    } finally {
      isLoading.value = false
    }
  }

  const markRead = async (id: number) => {
    try {
      await request(`/notifications/${id}/read`, { method: 'POST' })
      const notif = notifications.value.find(n => n.id === id)
      if (notif) {
        notif.read_at = new Date().toISOString()
      }
      unreadCount.value = notifications.value.filter(n => !n.read_at).length
    } catch (e) {
      console.warn('[Notifications] markRead error', e)
    }
  }

  const markAllRead = async () => {
    try {
      await request('/notifications/read-all', { method: 'POST' })
      notifications.value.forEach(n => {
        if (!n.read_at) n.read_at = new Date().toISOString()
      })
      unreadCount.value = 0
    } catch (e) {
      console.warn('[Notifications] markAllRead error', e)
    }
  }

  const remove = async (id: number) => {
    try {
      await request(`/notifications/${id}`, { method: 'DELETE' })
      notifications.value = notifications.value.filter(n => n.id !== id)
      unreadCount.value = notifications.value.filter(n => !n.read_at).length
    } catch (e) {
      console.warn('[Notifications] remove error', e)
    }
  }

  // Format relative time (e.g. "2 минуты назад")
  const relativeTime = (dateStr: string): string => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 2) return 'только что'
    if (mins < 60) return `${mins} мин. назад`
    if (hours < 24) return `${hours} ч. назад`
    return `${days} дн. назад`
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    hasFetched,
    fetchNotifications,
    markRead,
    markAllRead,
    remove,
    relativeTime,
  }
}
