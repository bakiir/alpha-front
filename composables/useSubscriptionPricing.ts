import type { SubscriptionPlanItem } from '~/composables/useSubscriptionPlans'

export interface PlanBoxToyView {
  id: number
  name: string
  description?: string | null
  image_url?: string | null
  min_age_months?: number | null
  max_age_months?: number | null
  category?: { id?: number; slug?: string; name?: string; icon?: string } | null
}

export interface PlanBoxTemplateView {
  id: number
  name: string
  slug?: string | null
  description?: string | null
  image?: string | null
  min_age_months?: number | null
  max_age_months?: number | null
  toys_count?: number
  toys?: PlanBoxToyView[]
}

export interface PlanCategoryAccessItem {
  slug: string
  name: string
  allowed: boolean
}

export interface PlanViewItem {
  id?: number
  name: string
  slug: string
  badge?: string | null
  discount_type?: string | null
  discount_value?: number | null
  discount_badge?: string | null
  discount_note?: string | null
  description: string
  price_monthly: number
  compare_at_price_monthly?: number | null
  price_quarterly: number
  compare_at_price_quarterly?: number | null
  price_semiannual: number
  compare_at_price_semiannual?: number | null
  price_annual: number
  compare_at_price_annual?: number | null
  discount_monthly?: number | null
  discount_quarterly?: number | null
  discount_semiannual?: number | null
  discount_annual?: number | null
  total_monthly?: number | null
  total_quarterly?: number | null
  total_semiannual?: number | null
  total_annual?: number | null
  base_total_monthly?: number | null
  base_total_quarterly?: number | null
  base_total_semiannual?: number | null
  base_total_annual?: number | null
  savings_quarterly?: number | null
  savings_semiannual?: number | null
  savings_annual?: number | null
  toys_count: number
  exchanges_count: number
  max_freeze_days: number
  extra_toy_price: number
  features: string[]
  denied_category_slugs?: string[]
  category_access?: PlanCategoryAccessItem[]
  unavailable_features?: string[]
  toys?: any[]
  box_templates?: PlanBoxTemplateView[]
  sample_box_template?: {
    id: number
    name: string
    slug?: string | null
  } | null
  eligible_toy_ids?: number[]
  eligible_toys_count?: number
  parent_self_selection_available?: boolean
  isFeatured?: boolean
}

export const useSubscriptionPricing = () => {
  const { formatPrice } = useFormatPrice()

  const mapPlanToView = (p: any, index: number): PlanViewItem => {
    // Concurrent toys at home — never sum box_templates / showcase catalog toys.
    const toysCount = Number(p.toys_at_home ?? p.toys_count) || 0
    const toysFeature = `${toysCount} развивающих игрушек дома одновременно`
    const defaultFeatures = [
      toysFeature,
      `${p.exchanges_count} бесплатный обмен(а) в месяц`,
      'Бесплатная курьерская доставка',
      'Медицинская дезинфекция паром и озоном',
    ]
    const rawFeatures = Array.isArray(p.features) && p.features.length > 0
      ? p.features
      : defaultFeatures
    // If a feature claims "N игрушек дома…", keep it aligned with plan.toys_count.
    const toysHomeClaimRe = /\d+\s+.*игруш.*дома/i
    const features = rawFeatures.map((feat: string) =>
      toysHomeClaimRe.test(feat) ? toysFeature : feat
    )

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      badge: p.badge,
      discount_type: p.discount_type,
      discount_value: p.discount_value,
      discount_badge: p.discount_badge,
      discount_note: p.discount_note,
      description: p.description || '',
      price_monthly: p.price_monthly,
      compare_at_price_monthly: p.compare_at_price_monthly,
      price_quarterly: p.price_quarterly || p.price_monthly,
      compare_at_price_quarterly: p.compare_at_price_quarterly,
      price_semiannual: p.price_semiannual || p.price_monthly,
      compare_at_price_semiannual: p.compare_at_price_semiannual,
      price_annual: p.price_annual || p.price_monthly,
      compare_at_price_annual: p.compare_at_price_annual,
      discount_monthly: p.discount_monthly ?? 0,
      discount_quarterly: p.discount_quarterly ?? 0,
      discount_semiannual: p.discount_semiannual ?? 0,
      discount_annual: p.discount_annual ?? 0,
      total_monthly: p.total_monthly ?? p.price_monthly,
      total_quarterly: p.total_quarterly ?? ((p.price_quarterly || p.price_monthly) * 3),
      total_semiannual: p.total_semiannual ?? ((p.price_semiannual || p.price_monthly) * 6),
      total_annual: p.total_annual ?? ((p.price_annual || p.price_monthly) * 12),
      base_total_monthly: p.base_total_monthly,
      base_total_quarterly: p.base_total_quarterly,
      base_total_semiannual: p.base_total_semiannual,
      base_total_annual: p.base_total_annual,
      savings_quarterly: p.savings_quarterly,
      savings_semiannual: p.savings_semiannual,
      savings_annual: p.savings_annual,
      toys_count: toysCount,
      exchanges_count: p.exchanges_count,
      max_freeze_days: Math.max(1, Number(p.max_freeze_days) || 7),
      extra_toy_price: p.extra_toy_price || 2500,
      toys: p.toys || [],
      box_templates: Array.isArray(p.box_templates) ? p.box_templates : [],
      sample_box_template: p.sample_box_template || null,
      isFeatured: index === 1 || Boolean(p.badge && /хит|популяр/i.test(p.badge)),
      features,
      denied_category_slugs: Array.isArray(p.denied_category_slugs)
        ? p.denied_category_slugs
        : [],
      category_access: Array.isArray(p.category_access)
        ? p.category_access
        : [],
      unavailable_features: Array.isArray(p.unavailable_features) ? p.unavailable_features : [],
      eligible_toy_ids: Array.isArray(p.eligible_toy_ids) ? p.eligible_toy_ids : undefined,
      eligible_toys_count: p.eligible_toys_count != null ? Number(p.eligible_toys_count) : undefined,
      parent_self_selection_available: p.parent_self_selection_available != null
        ? Boolean(p.parent_self_selection_available)
        : undefined,
    }
  }

  const calcPlanPrice = (
    plan: PlanViewItem | undefined,
    billingCycle: 'monthly' | 'quarterly' | 'semiannual' | 'annual',
    extraToysCount: number,
  ) => {
    if (!plan) return 0
    const extraCost = extraToysCount * (plan.extra_toy_price || 2500)
    const base = billingCycle === 'quarterly'
      ? plan.price_quarterly
      : billingCycle === 'semiannual'
        ? plan.price_semiannual
        : billingCycle === 'annual'
          ? plan.price_annual
          : plan.price_monthly
    return base + extraCost
  }

  const calcBilledTotal = (
    plan: PlanViewItem,
    billingCycle: 'monthly' | 'quarterly' | 'semiannual' | 'annual',
    extraToysCount: number,
  ) => {
    const months = billingCycle === 'quarterly'
      ? 3
      : billingCycle === 'semiannual'
        ? 6
        : billingCycle === 'annual'
          ? 12
          : 1
    const extraCost = extraToysCount * (plan.extra_toy_price || 2500) * months
    const periodBaseTotal = billingCycle === 'quarterly'
      ? (plan.total_quarterly ?? (plan.price_quarterly * 3))
      : billingCycle === 'semiannual'
        ? (plan.total_semiannual ?? (plan.price_semiannual * 6))
        : billingCycle === 'annual'
          ? (plan.total_annual ?? (plan.price_annual * 12))
          : (plan.total_monthly ?? plan.price_monthly)

    return periodBaseTotal + extraCost
  }

  const billingCycleMonths = (billingCycle: 'monthly' | 'quarterly' | 'semiannual' | 'annual') =>
    billingCycle === 'quarterly' ? 3 : billingCycle === 'semiannual' ? 6 : billingCycle === 'annual' ? 12 : 1

  return {
    formatPrice,
    mapPlanToView,
    calcPlanPrice,
    calcBilledTotal,
    billingCycleMonths,
  }
}
