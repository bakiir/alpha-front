export interface InterestItem {
  id: number
  slug: string
  name: string
  sort_order: number
  is_active?: boolean
}

let interestsInflight: Promise<InterestItem[]> | null = null
let interestsInflightLocale: string | null = null

function normalizeInterests(raw: unknown): InterestItem[] {
  if (!Array.isArray(raw)) return []

  return raw
    .map((item: any) => {
      // Legacy freeform strings are ignored (no auto-migration).
      if (typeof item === 'string' || typeof item !== 'object' || item === null) {
        return null
      }
      const id = Number(item.id)
      const slug = String(item.slug ?? '').trim()
      if (!Number.isFinite(id) || id <= 0 || !slug) return null
      return {
        id,
        slug,
        name: String(item.name ?? ''),
        sort_order: Number(item.sort_order ?? 0),
        is_active: item.is_active === undefined ? true : Boolean(item.is_active),
      }
    })
    .filter(Boolean) as InterestItem[]
}

export const useInterests = () => {
  const { request } = useApi()
  const { cmsLocale } = useCmsLocale()
  const interests = useState<InterestItem[]>('catalog-interests', () => [])
  const interestsLocale = useState<string | null>('catalog-interests-locale', () => null)

  const loadInterests = async (force = false): Promise<InterestItem[]> => {
    const locale = cmsLocale.value
    if (!force && interests.value.length && interestsLocale.value === locale) {
      return interests.value
    }

    if (!force && interestsInflight && interestsInflightLocale === locale) {
      return interestsInflight
    }

    interestsInflightLocale = locale
    interestsInflight = (async () => {
      try {
        const response = await request<{ data: InterestItem[] }>(
          `/interests?locale=${encodeURIComponent(locale)}`,
        )
        const list = normalizeInterests(response?.data ?? response)
        interests.value = list
        interestsLocale.value = locale
        return list
      } catch (e) {
        console.warn('Could not load interests', e)
        if (!interests.value.length) interests.value = []
        return interests.value
      } finally {
        interestsInflight = null
        interestsInflightLocale = null
      }
    })()

    return interestsInflight
  }

  const labelBySlug = computed(() => {
    const map: Record<string, string> = {}
    for (const interest of interests.value) {
      map[interest.slug] = interest.name
    }
    return map
  })

  return {
    interests,
    labelBySlug,
    loadInterests,
    normalizeInterests,
  }
}
