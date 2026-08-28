export const useSubscriptions = () => {
  const { request } = useApi()

  const fetchMySubscriptions = async () => {
    return await request<any>('/subscriptions')
  }

  const createSubscription = async (payload: {
    child_id: number
    subscription_plan_id?: number
    billing_cycle?: 'monthly' | 'semiannual' | 'annual'
    extra_toys_count?: number
  }) => {
    return await request<any>('/subscriptions', {
      method: 'POST',
      body: payload,
    })
  }

  const paySubscription = async (
    subscriptionId: number,
    paymentMethod: 'kaspi' | 'card',
  ) => {
    return await request<any>(`/subscriptions/${subscriptionId}/pay`, {
      method: 'POST',
      body: { payment_method: paymentMethod },
    })
  }

  const changePlan = async (subscriptionId: number, subscriptionPlanId: number) => {
    return await request<any>(`/subscriptions/${subscriptionId}/change-plan`, {
      method: 'POST',
      body: { subscription_plan_id: subscriptionPlanId },
    })
  }

  const pauseSubscription = async (subscriptionId: number, freezeEnd?: string) => {
    return await request<any>(`/subscriptions/${subscriptionId}/pause`, {
      method: 'POST',
      body: freezeEnd ? { freeze_end: freezeEnd } : {},
    })
  }

  const resumeSubscription = async (subscriptionId: number) => {
    return await request<any>(`/subscriptions/${subscriptionId}/resume`, {
      method: 'POST',
    })
  }

  const cancelSubscription = async (subscriptionId: number) => {
    return await request<any>(`/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
    })
  }

  const requestExchange = async (subscriptionId: number) => {
    return await request<any>(`/subscriptions/${subscriptionId}/request-exchange`, {
      method: 'POST',
    })
  }

  return {
    fetchMySubscriptions,
    createSubscription,
    paySubscription,
    changePlan,
    pauseSubscription,
    resumeSubscription,
    cancelSubscription,
    requestExchange,
  }
}
