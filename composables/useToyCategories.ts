export interface ToyCategory {
  id: number
  slug: string
  name: string
  icon: string | null
}

/** In-flight load shared across callers (header + shop) so first click never races to empty. */
let categoriesInflight: Promise<ToyCategory[]> | null = null

export const useToyCategories = () => {
  const { request } = useApi()
  const categories = useState<ToyCategory[]>('toy-categories', () => [])
  const isLoading = useState('toy-categories-loading', () => false)
  const loadError = useState('toy-categories-error', () => false)

  const loadCategories = async (force = false) => {
    if (!force && categories.value.length > 0) {
      return categories.value
    }

    if (!force && categoriesInflight) {
      return categoriesInflight
    }

    isLoading.value = true
    loadError.value = false

    categoriesInflight = (async () => {
      try {
        const res = await request<ToyCategory[]>('/toy-categories')
        categories.value = Array.isArray(res) ? res : []
        return categories.value
      } catch (error) {
        console.error('Failed to load toy categories', error)
        categories.value = []
        loadError.value = true
        return categories.value
      } finally {
        isLoading.value = false
        categoriesInflight = null
      }
    })()

    return categoriesInflight
  }

  const prefetchCategories = () => {
    if (!import.meta.client) return
    if (categories.value.length > 0 || categoriesInflight) return

    const run = () => {
      void loadCategories()
    }

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(run, { timeout: 1500 })
    } else {
      setTimeout(run, 300)
    }
  }

  const labelBySlug = computed<Record<string, string>>(() => (
    Object.fromEntries(categories.value.map(category => [category.slug, category.name]))
  ))

  return {
    categories,
    isLoading,
    loadError,
    labelBySlug,
    loadCategories,
    prefetchCategories,
  }
}
