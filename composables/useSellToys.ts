export interface SellRequestPayload {
  category: string
  title: string
  original_price?: number | null
  bought_at_alpha?: boolean
  photos?: string[]
  condition: string
  has_all_parts?: boolean
  has_original_box?: boolean
  has_manual?: boolean
  comment?: string
  name: string
  phone: string
  city: string
  payout_type?: 'kaspi' | 'bonus'
}

export interface ToySellRequestItem {
  id: number
  request_number: string
  user_id?: number
  category: string
  title: string
  original_price?: number
  bought_at_alpha: boolean
  photos?: string[]
  condition: string
  has_all_parts: boolean
  has_original_box: boolean
  has_manual: boolean
  comment?: string
  name: string
  phone: string
  city: string
  payout_type: string
  estimated_price: number
  status: string
  transfer_method?: string
  courier_address?: string
  courier_time?: string
  kaspi_phone?: string
  confirmed_at?: string
  created_at: string
}

export const useSellToys = () => {
  const { request } = useApi()

  const createSellRequest = async (payload: SellRequestPayload) => {
    return await request<{ status: string; message: string; data: ToySellRequestItem }>('/toy-sell-requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  const fetchSellRequest = async (id: number | string) => {
    return await request<{ status: string; data: ToySellRequestItem }>(`/toy-sell-requests/${id}`)
  }

  const submitDecision = async (id: number | string, decision: 'accepted' | 'declined') => {
    return await request<{ status: string; message: string; data: ToySellRequestItem }>(`/toy-sell-requests/${id}/decision`, {
      method: 'POST',
      body: JSON.stringify({ decision }),
    })
  }

  const confirmTransferDetails = async (id: number | string, data: {
    transfer_method: 'courier' | 'showroom'
    courier_address?: string
    courier_time?: string
    kaspi_phone: string
  }) => {
    return await request<{ status: string; message: string; data: ToySellRequestItem }>(`/toy-sell-requests/${id}/confirm-transfer`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  const fetchMySellRequests = async () => {
    return await request<{ status: string; data: ToySellRequestItem[] }>('/toy-sell-requests')
  }

  return {
    createSellRequest,
    fetchSellRequest,
    submitDecision,
    confirmTransferDetails,
    fetchMySellRequests,
  }
}
