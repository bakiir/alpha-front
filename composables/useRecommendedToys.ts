import type { ToyItem } from '~/composables/useToys'

export interface RecommendedToy {
  id: number
  title: string
  price: number
  image: string
  age: string
  skill: string
  availableQuantity?: number
  isPreorder?: boolean
  promisedArrivalFrom?: string | null
  promisedArrivalTo?: string | null
  promisedDeliveryFrom?: string | null
  promisedDeliveryTo?: string | null
  batchId?: number | null
}

interface ChildRecRow {
  id: number
  age_in_months: number
  gender?: 'male' | 'female' | null
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
  availableQuantity: Number(toy.available_quantity ?? 0),
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

const normalizeChildGender = (value: unknown): 'male' | 'female' | null => {
  if (value === 'male' || value === 'female') return value
  return null
}

export const useRecommendedToys = () => {
  const sourceToys = useState<RecommendedToy[]>('recommended_toys_source', () => [])
  const hasChildren = useState<boolean>('recommended_toys_has_children', () => false)
  const usedGender = useState<boolean>('recommended_toys_used_gender', () => false)
  const loaded = useState<boolean>('recommended_toys_loaded', () => false)
  const loading = useState<boolean>('recommended_toys_loading', () => false)

  const { fetchToys } = useToys()
  const { hasAuthSession, request } = useApi()
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

  const defaultTitle = computed(() => {
    if (!hasChildren.value) return 'Вам может подойти'
    return usedGender.value ? 'Подобрали по возрасту и полу' : 'Подобрали по возрасту'
  })

  const fetchGeneral = async () => {
    const res = await fetchToys({
      catalog: 'shop',
      sort: 'popular',
      per_page: CACHE_LIMIT,
      include_preorder: 1,
    })
    return keepPurchasable(unwrapToys(res))
  }

  const fetchChildren = async (): Promise<ChildRecRow[]> => {
    if (!hasAuthSession()) return []
    try {
      const res = await request<{ data?: ChildRecRow[] }>('/children')
      const list = Array.isArray(res?.data) ? res.data : []
      return list
        .filter(child => Number.isFinite(Number(child.age_in_months)))
        .map(child => ({
          id: Number(child.id),
          age_in_months: Number(child.age_in_months),
          gender: normalizeChildGender(child.gender),
        }))
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
      usedGender.value = children.some(child => Boolean(child.gender))

      let picked: ToyItem[] = []

      if (children.length) {
        const profileKeys = new Map<string, { age: number, gender: 'male' | 'female' | null }>()
        for (const child of children) {
          const age = Number(child.age_in_months)
          const gender = child.gender
          const key = `${age}|${gender || ''}`
          if (!profileKeys.has(key)) {
            profileKeys.set(key, { age, gender })
          }
        }

        const lists = await Promise.all(
          [...profileKeys.values()].map(async ({ age, gender }) => {
            try {
              const res = await fetchToys({
                catalog: 'shop',
                sort: 'popular',
                per_page: PER_CHILD_FETCH,
                age_months: age,
                ...(gender ? { gender } : {}),
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
        usedGender.value = false
      }

      sourceToys.value = picked.map(mapToy)
      loaded.value = true
    } catch {
      if (!sourceToys.value.length) {
        hasChildren.value = false
        usedGender.value = false
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
