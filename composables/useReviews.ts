export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export interface Review {
  id: number
  toy_id?: number
  rating: number
  body: string | null
  status?: ReviewStatus
  created_at: string
  user?: { id?: number; name?: string }
  toy?: { id: number; name: string; image_url?: string }
}

export type CreateReviewPayload = {
  toy_id: number
  rating: number
  body?: string
  order_id?: number
}

export type UpdateReviewPayload = {
  rating: number
  body?: string
}

export interface ToyReviewsMeta {
  rating_avg: number | null
  reviews_count: number
  can_review: boolean
  my_review: Review | null
}

export interface ToyReviewsResponse {
  data: Review[]
  meta: ToyReviewsMeta
}

const emptyMeta = (): ToyReviewsMeta => ({
  rating_avg: null,
  reviews_count: 0,
  can_review: false,
  my_review: null,
})

export const useReviews = () => {
  const { request } = useApi()

  const fetchMyReviews = async () => {
    const res = await request<{ data?: Review[] } | Review[]>('/reviews/my')
    if (Array.isArray(res)) return res
    return res?.data ?? []
  }

  const fetchToyReviews = async (toyId: number | string): Promise<ToyReviewsResponse> => {
    const res = await request<ToyReviewsResponse | Review[]>(`/toys/${toyId}/reviews`)
    if (Array.isArray(res)) {
      return { data: res, meta: emptyMeta() }
    }
    return {
      data: res?.data ?? [],
      meta: {
        rating_avg: res?.meta?.rating_avg ?? null,
        reviews_count: res?.meta?.reviews_count ?? 0,
        can_review: !!res?.meta?.can_review,
        my_review: res?.meta?.my_review ?? null,
      },
    }
  }

  const createReview = async (payload: CreateReviewPayload) => {
    return await request<{ data: Review }>('/reviews', {
      method: 'POST',
      body: payload,
    })
  }

  const updateReview = async (id: number, payload: UpdateReviewPayload) => {
    return await request<{ data: Review }>(`/reviews/${id}`, {
      method: 'PATCH',
      body: payload,
    })
  }

  const deleteReview = async (id: number) => {
    return await request<{ status?: string }>(`/reviews/${id}`, {
      method: 'DELETE',
    })
  }

  return {
    fetchMyReviews,
    fetchToyReviews,
    createReview,
    updateReview,
    deleteReview,
  }
}
