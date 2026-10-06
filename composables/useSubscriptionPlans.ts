import { defaultSubscriptionPlans, type SubscriptionPlanItem } from '~/data/defaultSubscriptionPlans'

export type { SubscriptionPlanItem }

export interface PlanPreviewToy {
  id: number
  name: string
  description?: string | null
  image_url?: string | null
  min_age_months?: number | null
  max_age_months?: number | null
  category?: { id?: number; slug?: string; name?: string; icon?: string } | null
}

export interface PlanToysPreviewPage {
  data: PlanPreviewToy[]
  meta: {
    plan_id: number
    source: 'eligible' | 'showcase' | 'box_template' | string
    box_template_id: number | null
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}

const PLANS_CACHE_MS = 5 * 60 * 1000

const cloneDefaultPlans = () => defaultSubscriptionPlans.map(plan => ({ ...plan }))

export const useSubscriptionPlans = () => {
  const { request } = useApi()
  const config = useRuntimeConfig()
  const demoFallbackEnabled = computed(
    () => Boolean(config.public.demoSubscriptionPlans),
  )

  const plans = useState<SubscriptionPlanItem[]>('subscription_plans_list', () => [])
  const plansFetchedAt = useState<number | null>('subscription_plans_fetched_at', () => null)
  const usingFallback = useState('subscription_plans_using_fallback', () => false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const applyDemoFallback = (reason: string) => {
    if (!demoFallbackEnabled.value) return false
    plans.value = cloneDefaultPlans()
    usingFallback.value = true
    error.value = reason
    return true
  }

  const hydratePlans = (apiPlans: SubscriptionPlanItem[]) => {
    if (!Array.isArray(apiPlans) || apiPlans.length === 0) return
    plans.value = apiPlans
    plansFetchedAt.value = Date.now()
    usingFallback.value = false
    error.value = null
  }

  const hasFreshPlans = () =>
    plansFetchedAt.value !== null
    && Date.now() - plansFetchedAt.value < PLANS_CACHE_MS
    && plans.value.length > 0
    && !usingFallback.value

  const fetchPlans = async (options?: { force?: boolean }) => {
    if (!options?.force && hasFreshPlans()) {
      return plans.value
    }

    isLoading.value = true
    error.value = null
    try {
      const res = await request<{ data: SubscriptionPlanItem[] }>('/subscription-plans')
      const apiPlans = Array.isArray(res?.data) ? res.data : []
      if (apiPlans.length > 0) {
        hydratePlans(apiPlans)
        return plans.value
      }

      // Empty API response means no active plans — do not invent local tariffs.
      plansFetchedAt.value = Date.now()
      usingFallback.value = false
      if (!applyDemoFallback('Тарифы временно недоступны (demo fallback)')) {
        plans.value = []
        error.value = null
      }
      return plans.value
    } catch (e: any) {
      console.warn('Failed to fetch subscription plans from API:', e)
      const message = e?.message || 'Ошибка загрузки тарифов'

      // Keep a fresh successful API cache on transient network errors.
      if (hasFreshPlans()) {
        error.value = message
        return plans.value
      }

      if (!applyDemoFallback(message)) {
        plans.value = []
        usingFallback.value = false
        error.value = message
      }
      return plans.value
    } finally {
      isLoading.value = false
    }
  }

  const fetchPlanToys = async (
    planId: number,
    options?: { boxTemplateId?: number | null; page?: number; perPage?: number },
  ): Promise<PlanToysPreviewPage> => {
    const params = new URLSearchParams()
    params.set('page', String(options?.page ?? 1))
    params.set('per_page', String(options?.perPage ?? 48))
    if (options?.boxTemplateId != null) {
      params.set('box_template_id', String(options.boxTemplateId))
    }
    return request<PlanToysPreviewPage>(`/subscription-plans/${planId}/toys?${params.toString()}`)
  }

  /**
   * Load all preview pages for a plan (optionally scoped to one box template).
   */
  const fetchAllPlanToys = async (
    planId: number,
    options?: { boxTemplateId?: number | null; perPage?: number },
  ): Promise<PlanPreviewToy[]> => {
    const perPage = options?.perPage ?? 48
    const first = await fetchPlanToys(planId, {
      boxTemplateId: options?.boxTemplateId,
      page: 1,
      perPage,
    })
    const items = [...(first.data || [])]
    const lastPage = Number(first.meta?.last_page) || 1
    for (let page = 2; page <= lastPage; page += 1) {
      const next = await fetchPlanToys(planId, {
        boxTemplateId: options?.boxTemplateId,
        page,
        perPage,
      })
      items.push(...(next.data || []))
    }
    return items
  }

  return {
    plans,
    isLoading,
    error,
    usingFallback,
    demoFallbackEnabled,
    hydratePlans,
    hasFreshPlans,
    fetchPlans,
    fetchPlanToys,
    fetchAllPlanToys,
  }
}
