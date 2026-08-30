import type { SubscriptionPlanItem } from '~/composables/useSubscriptionPlans'

export interface PlanViewItem {
  id?: number
  name: string
  slug: string
  badge?: string | null
  description: string
  price_monthly: number
  price_quarterly: number
  price_semiannual: number
  price_annual: number
  toys_count: number
  exchanges_count: number
  extra_toy_price: number
  features: string[]
  toys?: any[]
  isFeatured?: boolean
}

export const useSubscriptionPricing = () => {
  const { formatPrice } = useFormatPrice()

  const mapPlanToView = (p: SubscriptionPlanItem, index: number): PlanViewItem => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    badge: p.badge,
    description: p.description || '',
    price_monthly: p.price_monthly,
    price_quarterly: p.price_quarterly || p.price_monthly,
    price_semiannual: p.price_semiannual || p.price_monthly,
    price_annual: p.price_annual || p.price_monthly,
    toys_count: p.toys_count,
    exchanges_count: p.exchanges_count,
    extra_toy_price: p.extra_toy_price || 2500,
    toys: p.toys || [],
    isFeatured: index === 1 || Boolean(p.badge && /хит|популяр/i.test(p.badge)),
    features: Array.isArray(p.features) && p.features.length > 0 ? p.features : [
      `${p.toys_count} развивающих игрушек дома`,
      `${p.exchanges_count} бесплатный обмен(а) в месяц`,
      'Бесплатная курьерская доставка',
      'Медицинская дезинфекция паром и озоном',
    ],
  })

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
    return calcPlanPrice(plan, billingCycle, extraToysCount) * months
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
