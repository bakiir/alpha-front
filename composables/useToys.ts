export interface ToyCategoryRef {
  id: number
  slug: string
  name: string
  icon: string | null
}

export interface ToyWarehouseRef {
  id: number
  slug: string
  name: string
  type: 'subscription' | 'retail' | 'rental' | 'gifts'
}

export interface ToyChannels {
  is_published: boolean
  is_subscription_available: boolean
  is_purchase_available: boolean
  is_rental_available: boolean
  is_gift_available: boolean
  is_preorder_available: boolean
}

export interface ToyCatalogQuery {
  catalog?: 'shop' | 'purchase' | 'rental' | 'gift' | 'subscription' | 'preorder'
  channel?: string
  page?: number
  per_page?: number
  search?: string
  category?: string | number
  stock_status?: string
  age_months?: number
  start_date?: string
  end_date?: string
}

export interface ToyItem {
  id: number
  name: string
  slug?: string
  sku: string
  barcode: string
  min_age_months: number
  max_age_months: number
  category: ToyCategoryRef | null
  warehouse?: ToyWarehouseRef | null
  developmental_focus?: string
  description?: string
  price?: number
  rental_price_per_day?: number | null
  image_url: string
  stock_status: string
  warehouse_stage?: string
  quantity?: number
  channels?: ToyChannels
  is_available_for_subscription?: boolean
  is_available_for_sale?: boolean
  is_available_for_rent?: boolean
  buyout_price?: number
}

export const useToys = () => {
  const { request } = useApi()

  const fetchToys = async (params: ToyCatalogQuery = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).reduce<Record<string, string>>((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = String(value)
        }
        return acc
      }, {})
    ).toString()

    return await request<{ data: ToyItem[]; meta?: any }>(`/toys${query ? `?${query}` : ''}`)
  }

  const fetchToyByBarcode = async (code: string) => {
    return await request<{ status: string; data: ToyItem }>(`/barcode/${encodeURIComponent(code)}`)
  }

  const fetchToyById = async (id: number | string) => {
    return await request<{ data: ToyItem }>(`/toys/${id}`)
  }

  return {
    fetchToys,
    fetchToyById,
    fetchToyByBarcode,
  }
}
