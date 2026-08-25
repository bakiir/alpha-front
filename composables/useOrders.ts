export interface OrderPayload {
  items: Array<{
    toy_id?: number
    title: string
    quantity: number
    price: number
  }>
  address?: string
  phone?: string
  delivery_time?: string
  payment_method?: string
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
