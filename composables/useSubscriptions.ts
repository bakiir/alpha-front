import type { PaymentLaunchResponse } from './usePaymentLaunch'

export interface RequestExchangePayload {
  purchase_extra?: boolean
  payment_method?: 'kaspi' | 'card'
}

export interface ExchangeQuota {
  limit: number
  used: number
  remaining: number
  can_request: boolean
  can_purchase_extra: boolean
  extra_exchange_price: number | null
  period_start?: string
  period_end?: string
  active_exchange_id?: number | null
  active_exchange_status?: string | null
}

export const useSubscriptions = () => {
  const { request } = useApi()

  const fetchMySubscriptions = async () => {
    return await request<{ data: any[] }>('/subscriptions')
  }

  const requestExchange = async (subscriptionId: number, payload: RequestExchangePayload = {}) => {
    return await request<PaymentLaunchResponse & { message: string; subscription?: any }>(
      `/subscriptions/${subscriptionId}/request-exchange`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    )
  }

  const rescheduleExchange = async (subscriptionId: number, scheduledDate: string) => {
    return await request<{ message: string; subscription: any }>(
      `/subscriptions/${subscriptionId}/reschedule-exchange`,
      {
        method: 'POST',
        body: JSON.stringify({ scheduled_date: scheduledDate }),
      },
    )
  }

  const fetchNextSet = async (subscriptionId: number) => {
    return await request<{ data?: any } | any>(`/subscriptions/${subscriptionId}/next-set`)
  }

  const modifySetToys = async (setId: number, toyIds: number[]) => {
    return await request<{ message?: string; data?: any } | any>(`/subscriptions/sets/${setId}/toys`, {
      method: 'POST',
      body: JSON.stringify({ toy_ids: toyIds }),
    })
  }

  const createSubscription = async (payload: any) => {
    return await request<any>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  const paySubscription = async (subscriptionId: number, paymentMethod: string) => {
    return await request<PaymentLaunchResponse>(`/subscriptions/${subscriptionId}/pay`, {
      method: 'POST',
      body: JSON.stringify({ payment_method: paymentMethod }),
    })
  }

  const changePlan = async (subscriptionId: number, planId: number) => {
    return await request<any>(`/subscriptions/${subscriptionId}/change-plan`, {
      method: 'POST',
      body: JSON.stringify({ subscription_plan_id: planId }),
    })
  }

  const cancelSubscription = async (subscriptionId: number) => {
    return await request<any>(`/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
    })
  }

  return {
    fetchMySubscriptions,
    requestExchange,
    rescheduleExchange,
    fetchNextSet,
    modifySetToys,
    createSubscription,
    paySubscription,
    changePlan,
    cancelSubscription,
  }
}