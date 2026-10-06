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

export interface ToySpecification {
  key: string
  label: string
  value: string
}

export interface ToySkillRef {
  id: number
  slug: string
  name: string
  sort_order: number
}

export interface ToyInterestRef {
  id: number
  slug: string
  name: string
  sort_order: number
}

export interface ToyCatalogQuery {
  catalog?: 'shop' | 'purchase' | 'rental' | 'gift' | 'subscription' | 'preorder'
  channel?: string
  page?: number
  per_page?: number
  sort?: string
  search?: string
  category?: string | number
  stock_status?: string
  age_months?: number
  brand?: string
  age_from?: number
  age_to?: number
  price_from?: number
  price_to?: number
  start_date?: string
  end_date?: string
  include_preorder?: number | boolean
  skill?: string | string[]
  interest?: string | string[]
  /** Comma-separated or array of toy IDs (favorites / curated allow-list) */
  ids?: string | number | Array<string | number>
  /** Custom attribute filters: code -> value or comma list */
  f?: Record<string, string | number | string[]>
}

export interface ToyPreorderInfo {
  feature_enabled?: boolean
  available?: boolean
  paused?: boolean
  limit_remaining?: number
  expected_arrival_from?: string | null
  expected_arrival_to?: string | null
  expected_delivery_from?: string | null
  expected_delivery_to?: string | null
  note?: string | null
  batch_id?: number | null
}

export interface ToyItem {
  id: number
  name: string
  brand?: string | null
  slug?: string
  sku: string
  barcode: string
  min_age_months: number
  max_age_months: number
  category: ToyCategoryRef | null
  warehouse?: ToyWarehouseRef | null
  skills?: ToySkillRef[]
  interests?: ToyInterestRef[]
  developmental_focus?: string
  description?: string
  specifications?: ToySpecification[]
  price?: number
  rental_price_per_day?: number | null
  image_url: string
  images?: string[]
  stock_status: string
  warehouse_stage?: string
  quantity?: number
  available_quantity?: number
  channels?: ToyChannels
  preorder?: ToyPreorderInfo | null
  is_available_for_subscription?: boolean
  is_available_for_sale?: boolean
  is_available_for_rent?: boolean
  buyout_price?: number
  rating_avg?: number | null
  reviews_count?: number
}

export const useToys = () => {
  const { request } = useApi()

  const fetchToys = async (params: ToyCatalogQuery = {}) => {
    const query = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === '') continue
      if (key === 'f' && typeof value === 'object' && !Array.isArray(value)) {
        for (const [code, raw] of Object.entries(value as Record<string, unknown>)) {
          if (raw === undefined || raw === null || raw === '') continue
          const serialized = Array.isArray(raw) ? raw.map(String).filter(Boolean).join(',') : String(raw)
          if (serialized) query.set(`f[${code}]`, serialized)
        }
        continue
      }
      if (Array.isArray(value)) {
        const joined = value.map(String).filter(Boolean).join(',')
        if (joined) query.set(key, joined)
        continue
      }
      query.set(key, String(value))
    }
    const qs = query.toString()
    return await request<{ data: ToyItem[]; meta?: any }>(`/toys${qs ? `?${qs}` : ''}`)
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
