export interface GiftCardItem {
  id: number
  code: string
  initial_amount: number
  balance: number
  expires_at: string
  status: string
  recipient_name?: string
  sender_name?: string
  message?: string
}

export interface GiftSubscriptionItem {
  id: number
  code: string
  plan: string
  duration_months: number
  amount_paid: number
  expires_at: string
  status: string
  recipient_name?: string
  sender_name?: string
  message?: string
  is_activated?: boolean
}

export interface GiftSubscriptionQuote {
  plan: string
  plan_slug: string
  duration_months: number
  monthly_rate: number
  discount_factor: number
  total: number
}

const SUBSCRIPTION_SLUG_TO_GIFT_PLAN: Record<string, string> = {
  starter: 'economy',
  explorer: 'comfort',
  max: 'vip',
}

export const subscriptionSlugToGiftPlan = (slug: string): string => {
  return SUBSCRIPTION_SLUG_TO_GIFT_PLAN[slug] ?? slug
}

export const useGifts = () => {
  const { request } = useApi()

  const fetchMyGiftCards = async () => {
    return await request<{ status: string; data: { sent: GiftCardItem[]; received: GiftCardItem[] } }>('/gift-cards/my')
  }

  const purchaseGiftCard = async (data: {
    amount: number
    recipient_name: string
    sender_name?: string
    message?: string
    recipient_email?: string
    recipient_phone?: string
  }) => {
    return await request<{ status: string; message: string; data: GiftCardItem }>('/gift-cards/purchase', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  const applyGiftCard = async (code: string, amount: number, orderId?: number) => {
    return await request<{ status: string; message: string; data: { remaining_balance: number; amount_used: number } }>('/gift-cards/apply', {
      method: 'POST',
      body: JSON.stringify({ code, amount, order_id: orderId }),
    })
  }

  const fetchGiftSubscriptionQuote = async (plan: string, durationMonths: number) => {
    const params = new URLSearchParams({
      plan,
      duration_months: String(durationMonths),
    })
    return await request<{ status: string; data: GiftSubscriptionQuote }>(`/gift-subscriptions/quote?${params.toString()}`)
  }

  const fetchMyGiftSubscriptions = async () => {
    return await request<{ status: string; data: { sent: GiftSubscriptionItem[]; received: GiftSubscriptionItem[] } }>('/gift-subscriptions/my')
  }

  const purchaseGiftSubscription = async (data: {
    plan: string
    duration_months: number
    recipient_name: string
    sender_name?: string
    recipient_email?: string
    recipient_phone?: string
    message?: string
  }) => {
    return await request<{ status: string; message: string; data: GiftSubscriptionItem }>('/gift-subscriptions/purchase', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  const verifyGiftSubscription = async (code: string) => {
    return await request<{ status: string; is_valid: boolean; data?: GiftSubscriptionItem; message?: string }>('/gift-subscriptions/verify', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
  }

  const activateGiftSubscription = async (code: string, childId: number) => {
    return await request<{ status: string; message: string; data: { gift_subscription: GiftSubscriptionItem; subscription: any } }>('/gift-subscriptions/activate', {
      method: 'POST',
      body: JSON.stringify({ code, child_id: childId }),
    })
  }

  return {
    fetchMyGiftCards,
    purchaseGiftCard,
    applyGiftCard,
    fetchGiftSubscriptionQuote,
    fetchMyGiftSubscriptions,
    purchaseGiftSubscription,
    verifyGiftSubscription,
    activateGiftSubscription,
    subscriptionSlugToGiftPlan,
  }
}
