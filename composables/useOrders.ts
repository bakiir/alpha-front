export interface OrderPayload {
  items: Array<{
    toy_id: number
    quantity: number
  }>
  address?: string
  phone?: string
  delivery_time?: string
  payment_method?: string
  gift_card_code?: string
  is_gift?: boolean
  gift_recipient_name?: string
  gift_sender_name?: string
  gift_message?: string
}

export const useOrders = () => {
  const { request } = useApi()

  const fetchMyOrders = async () => {
    return await request<{ status: string; data: any[] }>('/orders')
  }

  const createOrder = async (payload: OrderPayload) => {
    return await request<{ status: string; message: string; data: any }>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  return {
    fetchMyOrders,
    createOrder,
  }
}
