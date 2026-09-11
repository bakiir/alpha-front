export interface SellGiftCardSummary {
  id: number
  code: string
  balance: number
  initial_amount: number
  status: string
  expires_at?: string | null
  source?: string
}

export interface SellRequestPayload {
  category: string
  title: string
  original_price?: number | null
  bought_at_alpha?: boolean
  photos?: File[]
  condition: string
  has_all_parts?: boolean
  has_original_box?: boolean
  has_manual?: boolean
  comment?: string
  name: string
  phone: string
  city: string
  payout_type?: 'certificate'
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
  payout_type: 'certificate' | string
  estimated_price: number
  status: string
  transfer_method?: string
  courier_address?: string
  courier_time?: string
  kaspi_phone?: string
  confirmed_at?: string
  received_at?: string
  paid_at?: string
  gift_card?: SellGiftCardSummary | null
  courier_pin?: string | null
  delivery_task_id?: number | null
  delivery_task_status?: string | null
  created_at: string
}

const appendBool = (formData: FormData, key: string, value?: boolean) => {
  if (typeof value === 'boolean') {
    formData.append(key, value ? '1' : '0')
  }
}

export const useSellToys = () => {
  const { request } = useApi()

  const createSellRequest = async (payload: SellRequestPayload) => {
    const formData = new FormData()
    formData.append('category', payload.category)
    formData.append('title', payload.title)
    formData.append('condition', payload.condition)
    formData.append('name', payload.name)
    formData.append('phone', payload.phone)
    formData.append('city', payload.city)
    formData.append('payout_type', payload.payout_type || 'certificate')

    if (payload.original_price != null && !Number.isNaN(payload.original_price)) {
      formData.append('original_price', String(payload.original_price))
    }
    if (payload.comment) {
      formData.append('comment', payload.comment)
    }

    appendBool(formData, 'bought_at_alpha', payload.bought_at_alpha)
    appendBool(formData, 'has_all_parts', payload.has_all_parts)
    appendBool(formData, 'has_original_box', payload.has_original_box)
    appendBool(formData, 'has_manual', payload.has_manual)

    ;(payload.photos || []).forEach((file, index) => {
      formData.append(`photos[${index}]`, file)
    })

    return await request<{ status: string; message: string; data: ToySellRequestItem }>('/toy-sell-requests', {
      method: 'POST',
      body: formData,
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
    kaspi_phone?: string
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
