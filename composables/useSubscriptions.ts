export interface RequestExchangePayload {
  purchase_extra?: boolean
  payment_method?: 'kaspi' | 'card'
}

export const useSubscriptions = () => {
  const { request } = useApi()

  const fetchMySubscriptions = async () => {
    return await request<{ data: any[] }>('/subscriptions')
  }

  const requestExchange = async (subscriptionId: number, payload: RequestExchangePayload = {}) => {
    return await request<{ message: string; subscription: any }>(
      `/subscriptions/${subscriptionId}/request-exchange`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    )
  }

  const fetchNextSet = async (subscriptionId: number) => {
    return await request<{ data: any }>(`/subscriptions/${subscriptionId}/next-set`)
  }

  const modifySetToys = async (setId: number, toyIds: number[]) => {
    return await request<{ message: string; data: any }>(`/subscriptions/sets/${setId}/toys`, {
      method: 'POST',
      body: JSON.stringify({ toy_ids: toyIds }),
    })
  }

  return {
    fetchMySubscriptions,
    requestExchange,
    fetchNextSet,
    modifySetToys,
  }
}
