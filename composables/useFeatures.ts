export interface SiteFeatures {
  sell_to_us: boolean
  short_rent: boolean
  preorders: boolean
  gifts: boolean
  subscription: boolean
  shop: boolean
}

const defaultFeatures: SiteFeatures = {
  sell_to_us: true,
  short_rent: true,
  preorders: true,
  gifts: true,
  subscription: true,
  shop: true,
}

export const useFeatures = () => {
  const { request } = useApi()
  const features = useState<SiteFeatures>('site_features', () => ({ ...defaultFeatures }))
  const isLoaded = useState<boolean>('site_features_loaded', () => false)

  const fetchFeatures = async () => {
    try {
      const res = await request<{ data?: Partial<SiteFeatures> } | Partial<SiteFeatures>>('/features')
      const payload = res && typeof res === 'object' && 'data' in res ? res.data : res
      features.value = { ...defaultFeatures, ...(payload || {}) }
    } catch {
      features.value = { ...defaultFeatures }
    } finally {
      isLoaded.value = true
    }
    return features.value
  }

  const isVisible = (key: keyof SiteFeatures) => features.value[key] !== false

  return {
    features,
    isLoaded,
    fetchFeatures,
    isVisible,
  }
}
