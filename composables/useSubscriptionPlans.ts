import { defaultSubscriptionPlans, type SubscriptionPlanItem } from '~/data/defaultSubscriptionPlans'

export type { SubscriptionPlanItem }

const PLANS_CACHE_MS = 5 * 60 * 1000

export const useSubscriptionPlans = () => {
  const { request } = useApi()
  const plans = useState<SubscriptionPlanItem[]>('subscription_plans_list', () =>
    defaultSubscriptionPlans.map(plan => ({ ...plan }))
  )
  const plansFetchedAt = useState<number | null>('subscription_plans_fetched_at', () => null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const usingFallback = ref(false)

  const hydratePlans = (apiPlans: SubscriptionPlanItem[]) => {
    if (!Array.isArray(apiPlans) || apiPlans.length === 0) return
    plans.value = apiPlans
    plansFetchedAt.value = Date.now()
    usingFallback.value = false
  }

  const hasFreshPlans = () =>
    plansFetchedAt.value !== null
    && Date.now() - plansFetchedAt.value < PLANS_CACHE_MS
    && plans.value.length > 0

  const fetchPlans = async (options?: { force?: boolean }) => {
    if (!options?.force && hasFreshPlans()) {
      return plans.value
    }

    isLoading.value = true
    error.value = null
    usingFallback.value = false
    try {
      const res = await request<{ data: SubscriptionPlanItem[] }>('/subscription-plans')
      const apiPlans = Array.isArray(res?.data) ? res.data : []
      if (apiPlans.length > 0) {
        hydratePlans(apiPlans)
      } else {
        plans.value = defaultSubscriptionPlans.map(plan => ({ ...plan }))
        usingFallback.value = true
      }
      return plans.value
    } catch (e: any) {
      console.warn('Failed to fetch subscription plans from API, using defaults:', e)
      error.value = e.message || 'Ошибка загрузки тарифов'
      if (!hasFreshPlans()) {
        plans.value = defaultSubscriptionPlans.map(plan => ({ ...plan }))
        usingFallback.value = true
      }
      return plans.value
    } finally {
      isLoading.value = false
    }
  }

  return {
    plans,
    isLoading,
    error,
    usingFallback,
    hydratePlans,
    hasFreshPlans,
    fetchPlans,
  }
}
