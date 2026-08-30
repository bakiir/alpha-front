export interface FaqItem {
  id: number
  question: string
  answer: string
  category: string
  sort_order?: number
}

const categoryIcons: Record<string, string> = {
  how: '🧩',
  pricing: '💳',
  hygiene: '🧼',
  delivery: '🚚',
  manage: '⚙️',
  general: '✨',
}

const categoryLabels: Record<string, string> = {
  how: 'Как это работает',
  pricing: 'Тарифы и оплата',
  hygiene: 'Дезинфекция и безопасность',
  delivery: 'Доставка и обмен',
  manage: 'Управление подпиской',
  general: 'Общее',
}

export const useFaq = () => {
  const { request } = useApi()

  const fetchFaqs = async () => {
    const res = await request<{ data?: FaqItem[] } | FaqItem[]>('/faqs')
    if (Array.isArray(res)) return res
    return res?.data ?? []
  }

  const getCategoryIcon = (category: string) => categoryIcons[category] || '📌'
  const getCategoryLabel = (category: string) => categoryLabels[category] || category

  return {
    fetchFaqs,
    getCategoryIcon,
    getCategoryLabel,
    categoryLabels,
  }
}
