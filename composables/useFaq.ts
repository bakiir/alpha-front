export interface FaqItem {
  id: number
  question: string
  answer: string
  category: string
  sort_order: number
  show_on_home?: boolean
}

export const FAQ_CATEGORIES = [
  'subscription',
  'rental',
  'purchase',
  'delivery',
  'gifts',
  'payment',
  'general',
] as const

export type FaqCategory = (typeof FAQ_CATEGORIES)[number]

export interface FetchFaqsOptions {
  category?: string
  showOnHome?: boolean
}

const categoryIcons: Record<string, string> = {
  subscription: '📦',
  rental: '🧩',
  purchase: '🛒',
  delivery: '🚚',
  gifts: '🎁',
  payment: '💳',
  general: '✨',
}

const categoryLabels: Record<string, string> = {
  subscription: 'Подписка',
  rental: 'Аренда',
  purchase: 'Покупка',
  delivery: 'Доставка',
  gifts: 'Подарки',
  payment: 'Оплата',
  general: 'Общее',
}

const categoryAppIcons: Record<string, string> = {
  subscription: 'subscription',
  rental: 'blocks',
  purchase: 'cart',
  delivery: 'truck',
  gifts: 'gift',
  payment: 'credit-card',
  general: 'sparkles',
}

export const useFaq = () => {
  const { request } = useApi()

  const fetchFaqs = async (
    categoryOrOptions?: string | FetchFaqsOptions,
  ): Promise<FaqItem[]> => {
    const options: FetchFaqsOptions =
      typeof categoryOrOptions === 'string'
        ? { category: categoryOrOptions }
        : (categoryOrOptions ?? {})

    const params = new URLSearchParams()
    if (options.category) {
      params.set('category', options.category)
    }
    if (typeof options.showOnHome === 'boolean') {
      params.set('show_on_home', options.showOnHome ? '1' : '0')
    }

    const query = params.toString() ? `?${params.toString()}` : ''
    const res = await request<{ data?: FaqItem[] } | FaqItem[]>(`/faqs${query}`)
    if (Array.isArray(res)) return res
    return res?.data ?? []
  }

  const getCategoryIcon = (category: string) => categoryIcons[category] || '📌'
  const getCategoryLabel = (category: string) => categoryLabels[category] || category
  const getCategoryAppIcon = (category: string) => categoryAppIcons[category] || 'pin'

  return {
    fetchFaqs,
    getCategoryIcon,
    getCategoryLabel,
    getCategoryAppIcon,
    categoryLabels,
    categoryAppIcons,
  }
}
