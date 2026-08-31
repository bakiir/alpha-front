export interface CreateOrderPayload {
  items: Array<{
    toy_id: number
    quantity: number
  }>
  address?: string
  phone?: string
  delivery_time?: string
  payment_method?: string
  is_gift?: boolean
  gift_recipient_name?: string
  gift_sender_name?: string
  gift_message?: string
}

export interface PayOrderPayload {
  gift_card_code?: string
  payment_method?: string
}

export const useOrders = () => {
  const { request } = useApi()

  const fetchMyOrders = async () => {
    return await request<{ status: string; data: any[] }>('/orders')
  }

  const createOrder = async (payload: CreateOrderPayload) => {
    return await request<{ status: string; message: string; data: any }>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  const payOrder = async (orderId: number, payload: PayOrderPayload = {}) => {
    return await request<{ status: string; message: string; data: any }>(`/orders/${orderId}/pay`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  const cancelOrder = async (
    orderId: number,
    items?: Array<{ toy_id: number; quantity: number }>
  ) => {
    return await request<{ status: string; message: string; data: any }>(`/orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify(items?.length ? { items } : {}),
    })
  }

  return {
    fetchMyOrders,
    createOrder,
    payOrder,
    cancelOrder,
  }
}
