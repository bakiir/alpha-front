import type { EpayLaunchPayload } from './useEpay'

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

export interface PayOrderResponse {
  status: string
  message: string
  data: any
  payment?: {
    payment_number: string
    provider: string
    status: string
    amount: number | string
  }
  fulfilled?: boolean
  epay?: EpayLaunchPayload
  demo?: {
    mode: string
    payment_url: string
  }
}

export const useOrders = () => {
  const { request } = useApi()

  const fetchMyOrders = async () => {
    return await request<{ status: string; data: any[] }>('/orders')
  }

  const fetchOrder = async (orderId: number) => {
    return await request<{
      status: string
      data: any
      payment: {
        payment_number: string
        provider: string
        status: string
        amount: number | string
        paid_at?: string | null
      } | null
    }>(`/orders/${orderId}`)
  }

  const syncOrderPayment = async (
    orderId: number,
    hints: { invoice_id?: string; payment?: string; confirm?: string } = {},
  ) => {
    return await request<{
      status: string
      synced: boolean
      epay_result_code: string | null
      method?: string | null
      data: any
      payment: {
        payment_number: string
        provider: string
        status: string
        amount: number | string
        paid_at?: string | null
      } | null
    }>(`/orders/${orderId}/sync-payment`, {
      method: 'POST',
      body: JSON.stringify(hints),
    })
  }

  const createOrder = async (payload: CreateOrderPayload) => {
    return await request<{ status: string; message: string; data: any }>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  const payOrder = async (orderId: number, payload: PayOrderPayload = {}) => {
    return await request<PayOrderResponse>(`/orders/${orderId}/pay`, {
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
    fetchOrder,
    syncOrderPayment,
    createOrder,
    payOrder,
    cancelOrder,
  }
}
