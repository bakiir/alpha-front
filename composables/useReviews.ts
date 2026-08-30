export interface Review {
  id: number
  toy_id?: number
  rating: number
  comment: string
  created_at: string
  user?: { id?: number; name?: string }
  toy?: { id: number; name: string; image_url?: string }
}

export type CreateReviewPayload = {
  toy_id: number
  rating: number
  comment: string
  order_id?: number
}

export const useReviews = () => {
  const { request } = useApi()

  const fetchMyReviews = async () => {
    const res = await request<{ data?: Review[] } | Review[]>('/reviews/my')
    if (Array.isArray(res)) return res
    return res?.data ?? []
  }

  const fetchToyReviews = async (toyId: number | string) => {
    const res = await request<{ data?: Review[] } | Review[]>(`/toys/${toyId}/reviews`)
    if (Array.isArray(res)) return res
    return res?.data ?? []
  }

  const createReview = async (payload: CreateReviewPayload) => {
    return await request<{ data: Review }>('/reviews', {
      method: 'POST',
      body: payload,
    })
  }

  return {
    fetchMyReviews,
    fetchToyReviews,
    createReview,
  }
}
