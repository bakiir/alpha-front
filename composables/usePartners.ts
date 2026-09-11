export interface Partner {
  id: number
  name: string
  type?: string | null
  description?: string | null
  logo_url?: string | null
  website_url?: string | null
  sort_order?: number
}

export type FetchPartnersOptions = {
  type?: string
}

export const usePartners = () => {
  const { request } = useApi()

  const fetchPartners = async (options: FetchPartnersOptions = {}) => {
    const params = new URLSearchParams()
    if (options.type) {
      params.set('type', options.type)
    }
    const query = params.toString()
    const endpoint = query ? `/partners?${query}` : '/partners'

    const res = await request<{ data?: Partner[] } | Partner[]>(endpoint)
    if (Array.isArray(res)) return res
    return res?.data ?? []
  }

  return {
    fetchPartners,
  }
}
