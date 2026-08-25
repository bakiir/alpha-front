export interface BuyoutCalculation {
  toy_id: number
  toy_name: string
  regular_price: number
  is_vip: boolean
  discount_percentage: number
  final_price: number
}

export const useBuyout = () => {
  const { request } = useApi()

  const calculateBuyout = async (setId: number, toyId: number) => {
    return await request<{ status: string; calculation: BuyoutCalculation }>(
      `/subscriptions/sets/${setId}/toys/${toyId}/buyout-preview`
    )
  }

  const executeBuyout = async (setId: number, toyId: number) => {
    return await request<{
      status: string
      message: string
      order: any
      bought_toy: any
    }>(`/subscriptions/sets/${setId}/toys/${toyId}/buyout`, {
      method: 'POST',
    })
  }

  return {
    calculateBuyout,
    executeBuyout,
  }
}
