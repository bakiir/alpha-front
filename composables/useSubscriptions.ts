import type { PaymentLaunchResponse } from './usePaymentLaunch'

export interface BoxTemplateSummary {
  id: number
  name: string
  slug?: string | null
  description?: string | null
  image?: string | null
  min_age_months?: number | null
  max_age_months?: number | null
  toys_count?: number
}

export interface SubscriptionSetSummary {
  id: number
  set_number?: string | null
  barcode?: string | null
  title?: string | null
  status?: string
  delivered_at?: string | null
  return_due_date?: string | null
  exchange_date?: string | null
  box_template?: BoxTemplateSummary | null
  toys?: any[]
  delivery_task?: any
}

export interface RequestExchangePayload {
  purchase_extra?: boolean
  payment_method?: 'kaspi' | 'card'
}

export interface ExchangeQuota {
  limit: number
  used: number
  remaining: number
  /** Active (in-flight) exchange in the period — do NOT subtract from remaining on the client. */
  planned?: number
  can_request: boolean
  can_purchase_extra: boolean
  extra_exchange_price: number | null
  period_start?: string
  period_end?: string
  active_exchange_id?: number | null
  active_exchange_status?: string | null
}

export interface ExchangeSlotOption {
  key: string
  label: string
  start_hour: number
  end_hour: number
  available?: boolean
}

export interface ExchangeRescheduleOptions {
  can_self_reschedule: boolean
  blocked_reason?: string | null
  operator_url?: string
  current?: {
    date?: string | null
    slot_key?: string | null
    label?: string | null
    human?: string
  }
  period_start?: string
  period_end?: string
  dates: string[]
  slots: ExchangeSlotOption[]
  slots_by_date: Record<string, ExchangeSlotOption[]>
  earliest_date?: string | null
  latest_date?: string | null
}

export interface FetchMySubscriptionsOptions {
  include_sets?: boolean
  /** Page size; backend clamps (default 50 to reduce round-trips for multi-child parents). */
  per_page?: number
  /** Safety cap for paginated walks. */
  max_pages?: number
}

export const useSubscriptions = () => {
  const { request } = useApi()

  /**
   * Load ALL of the parent's subscriptions (walks Laravel pagination).
   * Default API per_page is too small for multi-child parents.
   */
  const fetchMySubscriptions = async (opts: FetchMySubscriptionsOptions = {}) => {
    const perPage = Math.min(100, Math.max(1, opts.per_page ?? 50))
    const maxPages = Math.min(50, Math.max(1, opts.max_pages ?? 20))
    const all: any[] = []
    let page = 1
    let lastPage = 1

    do {
      const params = new URLSearchParams()
      params.set('per_page', String(perPage))
      params.set('page', String(page))
      if (opts.include_sets) {
        params.set('include_sets', '1')
      }

      const res = await request<{ data?: any[]; meta?: { last_page?: number } } | any[]>(
        `/subscriptions?${params.toString()}`,
      )

      const chunk = Array.isArray((res as any)?.data)
        ? (res as any).data
        : (Array.isArray(res) ? res : [])
      all.push(...chunk)

      lastPage = Number((res as any)?.meta?.last_page) || 1
      page += 1
    } while (page <= lastPage && page <= maxPages)

    return { data: all }
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

  const rescheduleExchange = async (subscriptionId: number, payload: { date: string; slot: string }) => {
    return await request<{ message: string; subscription: any; recheck_warnings?: string[] }>(
      `/subscriptions/${subscriptionId}/reschedule-exchange`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    )
  }

  const fetchExchangeRescheduleOptions = async (subscriptionId: number) => {
    return await request<{ data: ExchangeRescheduleOptions }>(
      `/subscriptions/${subscriptionId}/exchange-reschedule-options`,
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

  const replaceSetPosition = async (setId: number, positionId: number, toyId: number) => {
    return await request<{ message?: string; data?: any; position?: any; errors?: any }>(
      `/subscriptions/sets/${setId}/positions/${positionId}/replace`,
      {
        method: 'POST',
        body: JSON.stringify({ toy_id: toyId }),
      },
    )
  }

  const createSubscription = async (payload: any) => {
    return await request<any>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  const paySubscription = async (
    subscriptionId: number,
    paymentMethod: string,
    idempotencyKey?: string,
  ) => {
    const headers: Record<string, string> = {}
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey
    }

    return await request<PaymentLaunchResponse>(`/subscriptions/${subscriptionId}/pay`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ payment_method: paymentMethod }),
    })
  }

  const changePlan = async (subscriptionId: number, planId: number) => {
    return await request<any>(`/subscriptions/${subscriptionId}/change-plan`, {
      method: 'POST',
      body: JSON.stringify({ subscription_plan_id: planId }),
    })
  }

  const cancelPlanChange = async (subscriptionId: number) => {
    return await request<any>(`/subscriptions/${subscriptionId}/cancel-plan-change`, {
      method: 'POST',
    })
  }

  const cancelSubscription = async (subscriptionId: number) => {
    return await request<any>(`/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
    })
  }

  const cancelPendingSubscription = async (subscriptionId: number) => {
    return await request<any>(`/subscriptions/${subscriptionId}/cancel-pending`, {
      method: 'POST',
    })
  }

  return {
    fetchMySubscriptions,
    requestExchange,
    rescheduleExchange,
    fetchExchangeRescheduleOptions,
    fetchNextSet,
    modifySetToys,
    replaceSetPosition,
    createSubscription,
    paySubscription,
    changePlan,
    cancelPlanChange,
    cancelSubscription,
    cancelPendingSubscription,
  }
}