export interface ToyCategoryRef {
  id: number
  slug: string
  name: string
  icon: string | null
}

export interface ToyItem {
  id: number
  name: string
  slug: string
  sku: string
  barcode: string
  min_age_months: number
  max_age_months: number
  category: ToyCategoryRef | null
  developmental_focus: string
  image_url: string
  is_available_for_subscription: boolean
  is_available_for_sale: boolean
  is_available_for_rent: boolean
  stock_status: string
  warehouse_stage: string
  buyout_price: number
}

export const useToys = () => {
  const { request } = useApi()

  const fetchToys = async (params: Record<string, any> = {}) => {
    const query = new URLSearchParams(params).toString()
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
