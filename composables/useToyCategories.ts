export interface ToyCategoryChild {
  id: number
  parent_id: number | null
  slug: string
  name: string
  icon: string | null
  sort_order?: number
}

export interface ToyCategory {
  id: number
  parent_id: number | null
  slug: string
  name: string
  icon: string | null
  sort_order?: number
  children?: ToyCategoryChild[]
}

/** Flat node used by UIs that iterate every selectable category. */
export interface FlatToyCategory {
  id: number
  slug: string
  name: string
  icon: string | null
  parent_id: number | null
  parentSlug: string | null
  parentName: string | null
  isRoot: boolean
}

/** In-flight load shared across callers (header + shop) so first click never races to empty. */
let categoriesInflight: Promise<ToyCategory[]> | null = null

function normalizeTree(raw: unknown): ToyCategory[] {
  if (!Array.isArray(raw)) return []

  return raw.map((item: any) => {
    const children = Array.isArray(item?.children)
      ? item.children.map((child: any) => ({
          id: Number(child.id),
          parent_id: child.parent_id == null ? null : Number(child.parent_id),
          slug: String(child.slug ?? ''),
          name: String(child.name ?? ''),
          icon: child.icon ?? null,
          sort_order: child.sort_order != null ? Number(child.sort_order) : undefined,
        }))
      : []

    return {
      id: Number(item.id),
      parent_id: item.parent_id == null ? null : Number(item.parent_id),
      slug: String(item.slug ?? ''),
      name: String(item.name ?? ''),
      icon: item.icon ?? null,
      sort_order: item.sort_order != null ? Number(item.sort_order) : undefined,
      children,
    } satisfies ToyCategory
  })
}

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
        categories.value = normalizeTree(res)
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

  const flatCategories = computed<FlatToyCategory[]>(() => {
    const rows: FlatToyCategory[] = []
    for (const root of categories.value) {
      rows.push({
        id: root.id,
        slug: root.slug,
        name: root.name,
        icon: root.icon,
        parent_id: null,
        parentSlug: null,
        parentName: null,
        isRoot: true,
      })
      for (const child of root.children ?? []) {
        rows.push({
          id: child.id,
          slug: child.slug,
          name: child.name,
          icon: child.icon,
          parent_id: child.parent_id,
          parentSlug: root.slug,
          parentName: root.name,
          isRoot: false,
        })
      }
    }
    return rows
  })

  const labelBySlug = computed<Record<string, string>>(() => (
    Object.fromEntries(flatCategories.value.map(category => [category.slug, category.name]))
  ))

  const findBySlug = (slug: string): FlatToyCategory | undefined =>
    flatCategories.value.find(category => category.slug === slug)

  return {
    categories,
    flatCategories,
    isLoading,
    loadError,
    labelBySlug,
    findBySlug,
    loadCategories,
    prefetchCategories,
  }
}
