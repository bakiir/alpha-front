export interface DeliveryChatMessage {
  id: number
  sender_name: string
  sender_role: string
  is_my_message: boolean
  is_read: boolean
  message: string
  created_at: string
}

export interface DeliveryChatInfo {
  id: number
  is_closed: boolean
  closed_at?: string
  delivery_status: string
  courier_name: string
  client_name: string
}

export interface ActiveDeliveryInfo {
  id: number | null
  status: string
  type?: string
  scheduled_time: string
  address: string
  notes?: string
  courier: {
    id?: number
    name: string
    phone: string
    car?: string
  }
}

export const useDeliveryChat = () => {
  const { request } = useApi()

  const fetchActiveDelivery = async (params?: {
    task_id?: number | string
    rental_id?: number | string
    order_id?: number | string
    subscription_set_id?: number | string
  }) => {
    let url = '/deliveries/active'
    if (params) {
      const search = new URLSearchParams()
      if (params.task_id) search.set('task_id', String(params.task_id))
      if (params.rental_id) search.set('rental_id', String(params.rental_id))
      if (params.order_id) search.set('order_id', String(params.order_id))
      if (params.subscription_set_id) search.set('subscription_set_id', String(params.subscription_set_id))
      const qs = search.toString()
      if (qs) url += `?${qs}`
    }
    return await request<{
      status: string
      data: ActiveDeliveryInfo
    }>(url)
  }

  const fetchChatMessages = async (deliveryTaskId: number) => {
    return await request<{
      status: string
      chat: DeliveryChatInfo
      messages: DeliveryChatMessage[]
    }>(`/delivery-tasks/${deliveryTaskId}/chat`)
  }

  const sendMessage = async (deliveryTaskId: number, message: string) => {
    return await request<{
      status: string
      message: string
      data: DeliveryChatMessage
    }>(`/delivery-tasks/${deliveryTaskId}/chat/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    })
  }

  /**
   * Subscribe to real-time chat updates via WebSockets with adaptive visibility-aware fallback.
   */
  const subscribeToDeliveryChat = (
    deliveryTaskId: number,
    onNewMessage: (msg: DeliveryChatMessage) => void,
    intervalMs = 4000
  ) => {
    let timer: any = null
    let isSubscribed = true

    const poll = async () => {
      if (!isSubscribed) return
      // Skip polling when user has tab minimized/hidden to prevent server load
      if (typeof document !== 'undefined' && document.hidden) {
        timer = setTimeout(poll, intervalMs * 2)
        return
      }

      try {
        const res = await fetchChatMessages(deliveryTaskId)
        if (res.data?.messages) {
          const msgs = res.data.messages
          if (msgs.length > 0) {
            onNewMessage(msgs[msgs.length - 1])
          }
        }
      } catch {
        // Silently retry
      } finally {
        if (isSubscribed) {
          timer = setTimeout(poll, intervalMs)
        }
      }
    }

    // Try WebSocket connection if window.Echo / WebSocket is present
    if (typeof window !== 'undefined' && (window as any).Echo) {
      const channel = (window as any).Echo.private(`delivery.${deliveryTaskId}`)
      channel.listen('.delivery.message.sent', (data: any) => {
        onNewMessage({
          id: data.id,
          sender_name: data.sender_name,
          sender_role: data.sender_role,
          is_my_message: data.sender_role === 'client',
          is_read: data.is_read,
          message: data.message,
          created_at: data.created_at,
        })
      })

      return () => {
        isSubscribed = false
        channel.stopListening('.delivery.message.sent')
      }
    }

    // Start adaptive polling if WebSockets not connected
    timer = setTimeout(poll, intervalMs)

    return () => {
      isSubscribed = false
      if (timer) clearTimeout(timer)
    }
  }

  return {
    fetchActiveDelivery,
    fetchChatMessages,
    sendMessage,
    subscribeToDeliveryChat,
  }
}
