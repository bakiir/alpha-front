export interface SiteFeatureRow {
  key: string
  label: string
  is_visible: boolean
  description?: string | null
  group?: string | null
  route_path?: string | null
}

export interface SiteFeatures {
  sell_to_us: boolean
  short_rent: boolean
  preorder_paid_v1: boolean
  preorders: boolean
  gift_shop: boolean
  gifts: boolean
  gift_certificates: boolean
  gift_subscriptions: boolean
  gift_boxes: boolean
  subscription: boolean
  shop: boolean
  faq: boolean
  partners: boolean
  [key: string]: boolean
}

const defaultFeatures: SiteFeatures = {
  sell_to_us: false,
  short_rent: true,
  preorder_paid_v1: true,
  preorders: true,
  gift_shop: true,
  gifts: true,
  gift_certificates: true,
  gift_subscriptions: true,
  gift_boxes: true,
  subscription: true,
  shop: true,
  faq: true,
  partners: true,
}

const ALIASES: Record<string, string> = {
  gifts: 'gift_shop',
  gift: 'gift_shop',
  preorders: 'preorder_paid_v1',
}

const parsePayload = (res: unknown): { map: SiteFeatures; list: SiteFeatureRow[] } => {
  const map: SiteFeatures = { ...defaultFeatures }
  let list: SiteFeatureRow[] = []

  if (!res || typeof res !== 'object') {
    return { map, list }
  }

  const payload = res as { data?: unknown; map?: Record<string, boolean> }

  if (payload.map && typeof payload.map === 'object') {
    Object.assign(map, payload.map)
  }

  if (Array.isArray(payload.data)) {
    list = payload.data.filter((row): row is SiteFeatureRow => {
      return !!row && typeof row === 'object' && typeof (row as SiteFeatureRow).key === 'string'
    })
    if (!payload.map) {
      for (const row of list) {
        map[row.key] = row.is_visible !== false
      }
    }
  } else if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
    Object.assign(map, payload.data as Record<string, boolean>)
  }

  for (const [alias, canonical] of Object.entries(ALIASES)) {
    if (map[canonical] !== undefined) {
      map[alias] = map[canonical]
    }
  }

  return { map, list }
}

export const useFeatures = () => {
  const { request } = useApi()
  const features = useState<SiteFeatures>('site_features', () => ({ ...defaultFeatures }))
  const featureList = useState<SiteFeatureRow[]>('site_features_list', () => [])
  const isLoaded = useState<boolean>('site_features_loaded', () => false)

  const apply = (res: unknown) => {
    const parsed = parsePayload(res)
    features.value = parsed.map
    featureList.value = parsed.list
    isLoaded.value = true
  }

  const fetchFeatures = async () => {
    try {
      const res = await request<{ data?: unknown; map?: Record<string, boolean> } | SiteFeatures>('/features')
      apply(res)
    } catch {
      features.value = { ...defaultFeatures }
      isLoaded.value = true
    }
    return features.value
  }

  const isVisible = (key: string) => {
    const canonical = ALIASES[key] || key
    return features.value[canonical] !== false
  }

  const hiddenRoutePaths = computed(() => {
    const paths = new Set<string>()
    for (const row of featureList.value) {
      if (row.is_visible === false && row.route_path) {
        paths.add(row.route_path)
      }
    }
    const fallback: Record<string, string> = {
      sell_to_us: '/sell',
      short_rent: '/short-rent',
      shop: '/shop',
      subscription: '/subscription',
      gift_shop: '/gifts',
      gift_boxes: '/gift-boxes',
      faq: '/faq',
      partners: '/partners',
    }
    for (const [key, path] of Object.entries(fallback)) {
      if (!isVisible(key)) paths.add(path)
    }
    return paths
  })

  const isPathVisible = (url: string) => {
    if (!url.startsWith('/')) return true
    const path = url.split('?')[0]
    if (hiddenRoutePaths.value.has(path)) return false
    for (const hidden of hiddenRoutePaths.value) {
      if (path === hidden || path.startsWith(`${hidden}/`)) return false
    }
    return true
  }

  return {
    features,
    featureList,
    isLoaded,
    fetchFeatures,
    isVisible,
    isPathVisible,
    hiddenRoutePaths,
  }
}
