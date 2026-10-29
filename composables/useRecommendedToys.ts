import type { ToyCatalogQuery, ToyItem } from '~/composables/useToys'
import { resolveMediaUrl } from '~/utils/mediaUrl'

export interface RecommendedToy {
  id: number
  title: string
  price: number
  compareAtPrice?: number | null
  discountBadge?: string | null
  discountNote?: string | null
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
  compareAtPrice: toy.compare_at_price ?? null,
  discountBadge: toy.discount_badge ?? null,
  discountNote: toy.discount_note ?? null,
  image: resolveMediaUrl(toy.image_url),
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

const seededRandom = (seed: string) => {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return () => {
    h += 0x6D2B79F5
    let t = Math.imul(h ^ (h >>> 15), 1 | h)
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const shuffleWithSeed = <T>(items: T[], seed: string): T[] => {
  const rand = seededRandom(seed)
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    const tmp = copy[i]
    copy[i] = copy[j]!
    copy[j] = tmp!
  }
  return copy
}

export type ChildProfileToyQuery = {
  id?: number
  ageMonths: number
  gender?: 'male' | 'female' | null
}

type FetchToysFn = (params?: ToyCatalogQuery) => Promise<{ data?: ToyItem[] } | ToyItem[] | null | undefined>

const loadPurchasablePool = async (
  fetchToys: FetchToysFn,
  params: ToyCatalogQuery,
): Promise<ToyItem[]> => keepPurchasable(unwrapToys(await fetchToys(params)))

/** Shop toys for one child profile — age/gender filter + seeded shuffle (feels random, stable per day). */
export const fetchChildProfileShopToys = async (
  child: ChildProfileToyQuery,
  options?: { limit?: number; shuffleSeed?: string; fetchToys?: FetchToysFn },
): Promise<RecommendedToy[]> => {
  const limit = Math.max(1, Math.min(8, options?.limit ?? 3))
  const day = new Date().toISOString().slice(0, 10)
  const seed = options?.shuffleSeed
    ?? `${child.id ?? 'local'}|${child.ageMonths}|${child.gender || ''}|${day}`

  const fetchToys = options?.fetchToys ?? useToys().fetchToys
  const baseQuery: ToyCatalogQuery = {
    catalog: 'shop',
    per_page: 32,
    include_preorder: 1,
  }

  let pool = await loadPurchasablePool(fetchToys, {
    ...baseQuery,
    age_months: child.ageMonths,
    ...(child.gender ? { gender: child.gender } : {}),
  })

  if (!pool.length && child.gender) {
    pool = await loadPurchasablePool(fetchToys, {
      ...baseQuery,
      age_months: child.ageMonths,
    })
  }

  if (!pool.length) {
    pool = await loadPurchasablePool(fetchToys, {
      ...baseQuery,
      sort: 'popular',
    })
  }

  if (!pool.length) return []

  return shuffleWithSeed(pool, seed).slice(0, limit).map(mapToy)
}

export const useRecommendedToys = () => {
  const sourceToys = useState<RecommendedToy[]>('recommended_toys_source', () => [])
  const hasChildren = useState<boolean>('recommended_toys_has_children', () => false)
  const usedGender = useState<boolean>('recommended_toys_used_gender', () => false)
  const loaded = useState<boolean>('recommended_toys_loaded', () => false)
  const loading = useState<boolean>('recommended_toys_loading', () => false)
  const loadedCityId = useState<number | null>('recommended_toys_city_id', () => null)

  const { fetchToys } = useToys()
  const { cityId } = useCity()
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
    if (loaded.value && !force && loadedCityId.value === cityId.value) return

    const requestedCityId = cityId.value
    loading.value = true
    sourceToys.value = []
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

      if (requestedCityId !== cityId.value) return
      sourceToys.value = picked.map(mapToy)
      loaded.value = true
      loadedCityId.value = requestedCityId
    } catch {
      if (requestedCityId !== cityId.value) return
      if (!sourceToys.value.length) {
        hasChildren.value = false
        usedGender.value = false
        sourceToys.value = []
      }
      loaded.value = true
      loadedCityId.value = requestedCityId
    } finally {
      loading.value = false
      if (requestedCityId !== cityId.value) void load(true)
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
