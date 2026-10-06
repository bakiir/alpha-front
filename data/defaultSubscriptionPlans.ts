export interface SubscriptionPlanItem {
  id: number
  name: string
  slug: string
  badge?: string | null
  description?: string | null
  price_monthly: number
  compare_at_price_monthly?: number | null
  price_quarterly?: number | null
  compare_at_price_quarterly?: number | null
  price_semiannual?: number | null
  compare_at_price_semiannual?: number | null
  price_annual?: number | null
  compare_at_price_annual?: number | null
  /** Concurrent toys at home (DB toys_count). */
  toys_count: number
  toys_at_home?: number
  eligible_toy_ids?: number[]
  eligible_toys?: any[] | null
  showcase_toys?: any[] | null
  exchanges_count: number
  max_freeze_days?: number
  extra_toy_price: number
  features?: string[] | null
  denied_category_slugs?: string[] | null
  category_access?: Array<{ slug: string; name: string; allowed: boolean }> | null
  unavailable_features?: string[] | null
  toys?: any[] | null
  box_templates?: Array<{
    id: number
    name: string
    slug?: string | null
    description?: string | null
    image?: string | null
    min_age_months?: number | null
    max_age_months?: number | null
    toys_count?: number
    toys?: any[] | null
  }> | null
  sample_box_template?: {
    id: number
    name: string
    slug?: string | null
  } | null
  is_active: boolean
  sort_order: number
}

/** Standard Alpha subscription tiers — mirrors SubscriptionPlanSeeder */
export const defaultSubscriptionPlans: SubscriptionPlanItem[] = [
  {
    id: 1,
    name: 'Alpha Start',
    slug: 'starter',
    badge: 'Базовый',
    description: 'Базовый формат • обновление раз в месяц',
    price_monthly: 29990,
    price_quarterly: 27990,
    compare_at_price_quarterly: 29990,
    price_semiannual: 25990,
    compare_at_price_semiannual: 29990,
    price_annual: 23990,
    compare_at_price_annual: 29990,
    toys_count: 3,
    exchanges_count: 1,
    max_freeze_days: 30,
    extra_toy_price: 2500,
    features: [
      'Развивающий бокс по возрасту и развитию ребёнка',
      '1 обмен набора в месяц',
      'Доставка и обратный забор по Алматы',
      'Четырёхэтапная обработка игрушек',
    ],
    unavailable_features: [
      'Крупноформатные игрушки',
      'Сюжетно-ролевые игрушки',
    ],
    denied_category_slugs: ['large-format', 'role-play'],
    category_access: [
      { slug: 'large-format', name: 'Крупноформатные игрушки', allowed: false },
      { slug: 'role-play', name: 'Ролевые игрушки', allowed: false },
    ],
    is_active: true,
    sort_order: 1,
  },
  {
    id: 2,
    name: 'Alpha Plus',
    slug: 'explorer',
    badge: 'Популярный',
    description: 'Большие возможности • обновление каждые 15 дней',
    price_monthly: 59990,
    price_quarterly: 55990,
    compare_at_price_quarterly: 59990,
    price_semiannual: 51990,
    compare_at_price_semiannual: 59990,
    price_annual: 47990,
    compare_at_price_annual: 59990,
    toys_count: 5,
    exchanges_count: 2,
    max_freeze_days: 30,
    extra_toy_price: 2500,
    features: [
      'Расширенный бокс с крупноформатными игрушками',
      '2 обмена в месяц — каждые 15 дней',
      'Крупноформатные игрушки',
      'Подарок от Alpha',
      'Доставка и обратный забор по Алматы',
      'Четырёхэтапная обработка игрушек',
    ],
    unavailable_features: [
      'Сюжетно-ролевые игрушки',
    ],
    denied_category_slugs: ['role-play'],
    category_access: [
      { slug: 'large-format', name: 'Крупноформатные игрушки', allowed: true },
      { slug: 'role-play', name: 'Ролевые игрушки', allowed: false },
    ],
    is_active: true,
    sort_order: 2,
  },
  {
    id: 3,
    name: 'Alpha Max',
    slug: 'max',
    badge: 'Максимум Alpha',
    description: 'Максимум Alpha • обновление каждую неделю',
    price_monthly: 89990,
    price_quarterly: 83990,
    compare_at_price_quarterly: 89990,
    price_semiannual: 77990,
    compare_at_price_semiannual: 89990,
    price_annual: 69990,
    compare_at_price_annual: 89990,
    toys_count: 8,
    exchanges_count: 4,
    max_freeze_days: 30,
    extra_toy_price: 2500,
    features: [
      'Премиальный бокс с крупноформатными и сюжетно-ролевыми наборами',
      '4 обмена в месяц — каждую неделю',
      'Крупноформатные игрушки',
      'Сюжетно-ролевые наборы',
      'Подарок от Alpha',
      'Приоритетная доставка и поддержка',
      'Четырёхэтапная обработка игрушек',
    ],
    unavailable_features: [],
    denied_category_slugs: [],
    category_access: [
      { slug: 'large-format', name: 'Крупноформатные игрушки', allowed: true },
      { slug: 'role-play', name: 'Ролевые игрушки', allowed: true },
    ],
    is_active: true,
    sort_order: 3,
  },
]
