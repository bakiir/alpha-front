export interface SubscriptionPlanItem {
  id: number
  name: string
  slug: string
  badge?: string | null
  description?: string | null
  price_monthly: number
  price_quarterly?: number | null
  price_semiannual?: number | null
  price_annual?: number | null
  toys_count: number
  exchanges_count: number
  extra_toy_price: number
  features?: string[] | null
  toys?: any[] | null
  is_active: boolean
  sort_order: number
}

/** Standard Alpha subscription tiers — mirrors SubscriptionPlanSeeder */
export const defaultSubscriptionPlans: SubscriptionPlanItem[] = [
  {
    id: 1,
    name: 'Стартер (Starter)',
    slug: 'starter',
    badge: 'Базовый',
    description: 'Оптимальный старт для бережного знакомства с развивающими эко-игрушками.',
    price_monthly: 14900,
    price_quarterly: 13900,
    price_semiannual: 12900,
    price_annual: 11900,
    toys_count: 3,
    exchanges_count: 1,
    extra_toy_price: 2500,
    features: [
      '3 развивающие эко-игрушки дома одновременно',
      '1 бесплатный обмен набора в месяц',
      'Бесплатная курьерская доставка по Алматы',
    ],
    is_active: true,
    sort_order: 1,
  },
  {
    id: 2,
    name: 'Исследователь (Explorer)',
    slug: 'explorer',
    badge: 'Хит продаж',
    description: 'Идеально сбалансированный набор для всестороннего раннего развития ребенка.',
    price_monthly: 22900,
    price_quarterly: 20900,
    price_semiannual: 19900,
    price_annual: 17900,
    toys_count: 5,
    exchanges_count: 1,
    extra_toy_price: 2500,
    features: [
      '5 развивающих игрушек дома одновременно',
      '1 бесплатный обмен набора в месяц',
      'Персональный план развития от методиста',
    ],
    is_active: true,
    sort_order: 2,
  },
  {
    id: 3,
    name: 'Максимум (Max VIP)',
    slug: 'max',
    badge: 'Премиум',
    description: 'Максимальная свобода: большой бокс и возможность разделить на двоих детей.',
    price_monthly: 34900,
    price_quarterly: 31900,
    price_semiannual: 29900,
    price_annual: 26900,
    toys_count: 8,
    exchanges_count: 2,
    extra_toy_price: 2500,
    features: [
      '8 развивающих эко-игрушек дома одновременно',
      '2 бесплатных обмена набора в месяц',
      'Приоритетная доставка в удобное временное окно',
    ],
    is_active: true,
    sort_order: 3,
  },
]
