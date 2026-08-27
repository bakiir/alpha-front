export interface SubscriptionPlanItem {
  id: number
  name: string
  slug: string
  badge?: string | null
  description?: string | null
  price_monthly: number
  price_semiannual?: number | null
  price_annual?: number | null
  toys_count: number
  exchanges_count: number
  extra_toy_price: number
  features?: string[] | null
  is_active: boolean
  sort_order: number
}

export const useSubscriptionPlans = () => {
  const { request } = useApi()
  const plans = useState<SubscriptionPlanItem[]>('subscription_plans_list', () => [])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchPlans = async () => {
    isLoading.value = true
    error.value = null
    try {
      const res = await request<{ data: SubscriptionPlanItem[] }>('/subscription-plans')
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        plans.value = res.data
      }
      return plans.value
    } catch (e: any) {
      console.warn('Failed to fetch subscription plans from API, keeping fallbacks:', e)
      error.value = e.message || 'Ошибка загрузки тарифов'
      return plans.value
    } finally {
      isLoading.value = false
    }
  }

  return {
    plans,
    isLoading,
    error,
    fetchPlans,
  }
}
