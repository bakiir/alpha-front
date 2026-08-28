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

  const executeBuyout = async (setId: number, toyId: number) => {
    return await request<{
      status: string
      message: string
      data: {
        order_number: string
        toy_name: string
        buyout_price: number
        bought_out_at: string
      }
    }>(`/subscriptions/sets/${setId}/toys/${toyId}/buyout`, {
      method: 'POST',
    })
  }

  return {
    calculateBuyout,
    executeBuyout,
  }
}
