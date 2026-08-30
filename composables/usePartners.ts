export interface Partner {
  id: number
  name: string
  description?: string | null
  logo_url?: string | null
  website_url?: string | null
  sort_order?: number
}

export const usePartners = () => {
  const { request } = useApi()

  const fetchPartners = async () => {
    const res = await request<{ data?: Partner[] } | Partner[]>('/partners')
    if (Array.isArray(res)) return res
    return res?.data ?? []
  }

  return {
    fetchPartners,
  }
}
