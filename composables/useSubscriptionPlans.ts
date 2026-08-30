import { defaultSubscriptionPlans, type SubscriptionPlanItem } from '~/data/defaultSubscriptionPlans'

export type { SubscriptionPlanItem }

export const useSubscriptionPlans = () => {
  const { request } = useApi()
  const plans = useState<SubscriptionPlanItem[]>('subscription_plans_list', () =>
    defaultSubscriptionPlans.map(plan => ({ ...plan }))
  )
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const usingFallback = ref(false)

  const fetchPlans = async () => {
    isLoading.value = true
    error.value = null
    usingFallback.value = false
    try {
      const res = await request<{ data: SubscriptionPlanItem[] }>('/subscription-plans')
      const apiPlans = Array.isArray(res?.data) ? res.data : []
      if (apiPlans.length > 0) {
        plans.value = apiPlans
      } else {
        plans.value = defaultSubscriptionPlans.map(plan => ({ ...plan }))
        usingFallback.value = true
      }
      return plans.value
    } catch (e: any) {
      console.warn('Failed to fetch subscription plans from API, using defaults:', e)
      error.value = e.message || 'Ошибка загрузки тарифов'
      plans.value = defaultSubscriptionPlans.map(plan => ({ ...plan }))
      usingFallback.value = true
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
    fetchPlans,
  }
}
