export interface PreorderItem {
  id: number
  preorder_number: string
  status: string
  notes?: string
  toy: any
  created_at: string
}

export const usePreorders = () => {
  const { request } = useApi()

  const fetchMyPreorders = async () => {
    return await request<{ status: string; data: PreorderItem[] }>('/preorders')
  }

  const createPreorder = async (toyId: number, notes?: string) => {
    return await request<{ status: string; message: string; data: PreorderItem }>('/preorders', {
      method: 'POST',
      body: JSON.stringify({ toy_id: toyId, notes }),
    })
  }

  const cancelPreorder = async (preorderId: number) => {
    return await request<{ status: string; message: string }>(`/preorders/${preorderId}/cancel`, {
      method: 'POST',
    })
  }

  return {
    fetchMyPreorders,
    createPreorder,
    cancelPreorder,
  }
}
