export interface GiftCardItem {
  id: number
  code: string
  initial_amount: number
  balance: number
  expires_at: string
  status: string
}

export interface GiftSubscriptionItem {
  id: number
  code: string
  duration_months: number
  expires_at: string
  status: string
}

export const useGifts = () => {
  const { request } = useApi()

  // Gift Certificates / Cards
  const fetchMyGiftCards = async () => {
    return await request<{ status: string; data: GiftCardItem[] }>('/gift-cards/my')
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

  const applyGiftCard = async (code: string, amount: number) => {
    return await request<{ status: string; message: string; remaining_balance: number; deducted: number }>('/gift-cards/apply', {
      method: 'POST',
      body: JSON.stringify({ code, amount }),
    })
  }

  // Gift Subscriptions
  const fetchMyGiftSubscriptions = async () => {
    return await request<{ status: string; data: GiftSubscriptionItem[] }>('/gift-subscriptions/my')
  }

  const purchaseGiftSubscription = async (durationMonths: number, recipientEmail?: string) => {
    return await request<{ status: string; message: string; gift_subscription: GiftSubscriptionItem }>('/gift-subscriptions/purchase', {
      method: 'POST',
      body: JSON.stringify({ duration_months: durationMonths, recipient_email: recipientEmail }),
    })
  }

  const activateGiftSubscription = async (code: string, childId: number) => {
    return await request<{ status: string; message: string; subscription: any }>('/gift-subscriptions/activate', {
      method: 'POST',
      body: JSON.stringify({ code, child_id: childId }),
    })
  }

  return {
    fetchMyGiftCards,
    purchaseGiftCard,
    applyGiftCard,
    fetchMyGiftSubscriptions,
    purchaseGiftSubscription,
    activateGiftSubscription,
  }
}
