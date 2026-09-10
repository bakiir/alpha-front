import type { PaymentLaunchResponse } from './usePaymentLaunch'

export interface BuyoutCalculation {
  toy_id: number
  toy_name: string
  is_bought_out: boolean
  bought_out_at?: string | null
  original_price: number
  discount_percent: number
  discount_amount: number
  buyout_price: number
}

export const useBuyout = () => {
  const { request } = useApi()

  const calculateBuyout = async (setId: number, toyId: number) => {
    const res = await request<{ status: string; data: BuyoutCalculation }>(
      `/subscriptions/sets/${setId}/toys/${toyId}/buyout-preview`
    )
    return res.data
  }

  const executeBuyout = async (setId: number, toyId: number, paymentMethod: string = 'card') => {
    return await request<PaymentLaunchResponse & {
      data: {
        order_number: string | null
        toy_name: string
        buyout_price: number
        bought_out_at: string | null
      }
    }>(`/subscriptions/sets/${setId}/toys/${toyId}/buyout`, {
      method: 'POST',
      body: JSON.stringify({ payment_method: paymentMethod }),
    })
  }

  return {
    calculateBuyout,
    executeBuyout,
  }
}
