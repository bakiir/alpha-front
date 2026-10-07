export interface CityOption {
  id: number
  slug: string
  name: string
  name_i18n?: Record<string, string>
}

const CITY_COOKIE = 'alpha_city_id'

const normalizeCityId = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : null
}

export const useCity = () => {
  const config = useRuntimeConfig()
  const apiBase = resolveApiBase(config.public.apiBase as string)
  const { locale } = useI18n()

  const cityIdCookie = useCookie<number | null>(CITY_COOKIE, {
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    default: () => null,
  })

  const cities = useState<CityOption[]>('alpha-cities', () => [])
  const requireCityId = useState<boolean>('alpha-require-city-id', () => false)
  const citiesLoaded = useState<boolean>('alpha-cities-loaded', () => false)
  const cityId = useState<number | null>('alpha-city-id', () => normalizeCityId(cityIdCookie.value))

  const selectedCity = computed(() =>
    cities.value.find((c) => c.id === cityId.value) || null,
  )

  const cityQuery = computed(() =>
    cityId.value ? { city_id: cityId.value } : {},
  )

  const loadCities = async (force = false) => {
    if (citiesLoaded.value && !force) {
      return cities.value
    }

    try {
      const res = await $fetch<{
        status: string
        data: CityOption[]
        meta?: { require_city_id?: boolean }
      }>(`${apiBase}/cities`, {
        params: { locale: locale.value },
      })

      cities.value = Array.isArray(res?.data)
        ? res.data.map((c) => ({ ...c, id: Number(c.id) }))
        : []
      requireCityId.value = Boolean(res?.meta?.require_city_id)
      citiesLoaded.value = true

      // Coerce cookie/string leftovers so === against numeric API ids works.
      const current = normalizeCityId(cityId.value ?? cityIdCookie.value)
      if (current !== cityId.value) {
        setCityId(current)
      }

      if (cityId.value && !cities.value.some((c) => c.id === cityId.value)) {
        setCityId(cities.value[0]?.id ?? null)
      } else if (!cityId.value && cities.value.length === 1) {
        setCityId(cities.value[0].id)
      }
    } catch {
      cities.value = []
      citiesLoaded.value = true
    }

    return cities.value
  }

  const setCityId = (id: number | null) => {
    const next = normalizeCityId(id)
    cityId.value = next
    cityIdCookie.value = next
  }

  return {
    cities,
    cityId,
    selectedCity,
    cityQuery,
    requireCityId,
    citiesLoaded,
    loadCities,
    setCityId,
  }
}
