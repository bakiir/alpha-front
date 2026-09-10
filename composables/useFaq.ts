export interface FaqItem {
  id: number
  question: string
  answer: string
  category: string
  sort_order: number
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

  const fetchFaqs = async (category?: string): Promise<FaqItem[]> => {
    const query = category ? `?category=${encodeURIComponent(category)}` : ''
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
