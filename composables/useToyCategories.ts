export interface ToyCategory {
  id: number
  slug: string
  name: string
  icon: string | null
}

export const useToyCategories = () => {
  const { request } = useApi()
  const categories = useState<ToyCategory[]>('toy-categories', () => [])
  const isLoading = useState('toy-categories-loading', () => false)

  const loadCategories = async () => {
    if (categories.value.length > 0 || isLoading.value) {
      return categories.value
    }

    isLoading.value = true

    try {
      const res = await request<ToyCategory[]>('/toy-categories')
      categories.value = Array.isArray(res) ? res : []
    } catch (error) {
      console.error('Failed to load toy categories', error)
      categories.value = []
    } finally {
      isLoading.value = false
    }

    return categories.value
  }

  const labelBySlug = computed<Record<string, string>>(() => (
    Object.fromEntries(categories.value.map(category => [category.slug, category.name]))
  ))

  return {
    categories,
    isLoading,
    labelBySlug,
    loadCategories,
  }
}
