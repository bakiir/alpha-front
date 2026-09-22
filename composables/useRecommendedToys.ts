import type { ToyItem } from '~/composables/useToys'

export interface RecommendedToy {
  id: number
  title: string
  price: number
  image: string
  age: string
  skill: string
  isPreorder?: boolean
  promisedArrivalFrom?: string | null
  promisedArrivalTo?: string | null
  promisedDeliveryFrom?: string | null
  promisedDeliveryTo?: string | null
  batchId?: number | null
}

interface ChildAgeRow {
  id: number
  age_in_months: number
}

const DISPLAY_LIMIT = 6
const CACHE_LIMIT = 12
const PER_CHILD_FETCH = 8

const formatToyAgeRange = (minMonths?: number, maxMonths?: number) => {
  const min = minMonths ?? 0
  const max = maxMonths ?? 72
  const minYears = Math.floor(min / 12)
  const maxYears = Math.ceil(max / 12)

  if (minYears === 0 && maxYears <= 1) return `${min}–${max} мес`
  if (minYears === maxYears) return `${minYears} ${minYears === 1 ? 'год' : minYears < 5 ? 'года' : 'лет'}`
  return `${minYears}–${maxYears} ${maxYears < 5 ? 'года' : 'лет'}`
}

const mapToy = (toy: ToyItem): RecommendedToy => ({
  id: toy.id,
  title: toy.name,
  price: Number(toy.price) || 0,
  image: toy.image_url || '',
  age: formatToyAgeRange(toy.min_age_months, toy.max_age_months),
  skill: toy.category?.name || toy.developmental_focus || '',
  isPreorder: Boolean(toy.preorder?.available),
  promisedArrivalFrom: toy.preorder?.expected_arrival_from ?? null,
  promisedArrivalTo: toy.preorder?.expected_arrival_to ?? null,
  promisedDeliveryFrom: toy.preorder?.expected_delivery_from ?? null,
  promisedDeliveryTo: toy.preorder?.expected_delivery_to ?? null,
  batchId: toy.preorder?.batch_id ?? null,
})

const unwrapToys = (res: { data?: ToyItem[] } | ToyItem[] | null | undefined): ToyItem[] => {
  if (!res) return []
  if (Array.isArray(res)) return res
  return Array.isArray(res.data) ? res.data : []
}

const keepPurchasable = (toys: ToyItem[]): ToyItem[] =>
  toys.filter((toy) => {
    if (Number(toy.price) <= 0) return false
    if (toy.preorder?.available) return true
    if (toy.channels && toy.channels.is_purchase_available === false) return false
    return true
  })

const interleaveUnique = (lists: ToyItem[][], limit: number): ToyItem[] => {
  const seen = new Set<number>()
  const result: ToyItem[] = []
  const maxLen = Math.max(0, ...lists.map(list => list.length))

  for (let i = 0; i < maxLen && result.length < limit; i++) {
    for (const list of lists) {
      const item = list[i]
      if (!item || seen.has(item.id)) continue
      seen.add(item.id)
      result.push(item)
      if (result.length >= limit) break
    }
  }

  return result
}

export const useRecommendedToys = () => {
  const sourceToys = useState<RecommendedToy[]>('recommended_toys_source', () => [])
  const hasChildren = useState<boolean>('recommended_toys_has_children', () => false)
  const loaded = useState<boolean>('recommended_toys_loaded', () => false)
  const loading = useState<boolean>('recommended_toys_loading', () => false)

  const { fetchToys } = useToys()
  const { getToken, request } = useApi()
  const { items: cartItems } = useCart()
  const { favorites } = useFavorites()

  const excludedIds = computed(() => {
    const ids = new Set<number>()
    for (const item of cartItems.value) {
      const n = Number(item.id)
      if (Number.isFinite(n) && n > 0) ids.add(n)
    }
    for (const item of favorites.value) {
      const n = Number(item.id)
      if (Number.isFinite(n) && n > 0) ids.add(n)
    }
    return ids
  })

  const toys = computed(() =>
    sourceToys.value
      .filter(toy => !excludedIds.value.has(toy.id))
      .slice(0, DISPLAY_LIMIT),
  )

  const defaultTitle = computed(() =>
    hasChildren.value ? 'Подобрали по возрасту' : 'Вам может подойти',
  )

  const fetchGeneral = async () => {
    const res = await fetchToys({
      catalog: 'shop',
      sort: 'popular',
      per_page: CACHE_LIMIT,
      include_preorder: 1,
    })
    return keepPurchasable(unwrapToys(res))
  }

  const fetchChildren = async (): Promise<ChildAgeRow[]> => {
    if (!getToken()) return []
    try {
      const res = await request<{ data?: ChildAgeRow[] }>('/children')
      const list = Array.isArray(res?.data) ? res.data : []
      return list.filter(child => Number.isFinite(Number(child.age_in_months)))
    } catch {
      return []
    }
  }

  const load = async (force = false) => {
    if (loading.value) return
    if (loaded.value && !force) return

    loading.value = true
    try {
      const children = await fetchChildren()
      hasChildren.value = children.length > 0

      let picked: ToyItem[] = []

      if (children.length) {
        const ages = [...new Set(children.map(child => Number(child.age_in_months)))]
        const lists = await Promise.all(
          ages.map(async (age) => {
            try {
              const res = await fetchToys({
                catalog: 'shop',
                sort: 'popular',
                per_page: PER_CHILD_FETCH,
                age_months: age,
                include_preorder: 1,
              })
              return keepPurchasable(unwrapToys(res))
            } catch {
              return [] as ToyItem[]
            }
          }),
        )
        picked = interleaveUnique(lists, CACHE_LIMIT)
      }

      if (!picked.length) {
        picked = await fetchGeneral()
        hasChildren.value = false
      }

      sourceToys.value = picked.map(mapToy)
      loaded.value = true
    } catch {
      if (!sourceToys.value.length) {
        hasChildren.value = false
        sourceToys.value = []
      }
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  return {
    toys,
    hasChildren,
    loading,
    loaded,
    defaultTitle,
    load,
  }
}
