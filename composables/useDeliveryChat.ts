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

  const fetchActiveDelivery = async (params?: { task_id?: number | string; rental_id?: number | string }) => {
    let url = '/deliveries/active'
    if (params?.task_id) url += `?task_id=${params.task_id}`
    else if (params?.rental_id) url += `?rental_id=${params.rental_id}`
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

  return {
    fetchActiveDelivery,
    fetchChatMessages,
    sendMessage,
  }
}
