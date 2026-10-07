export interface CatalogFilterOption {
  value: string
  label: string
  count?: number
  from?: number
  to?: number
  name?: Record<string, string>
}

export interface CatalogFilterDef {
  code: string
  type: string
  builtin_key?: string | null
  name: Record<string, string> | string
  unit?: string | null
  ui?: string
  options?: CatalogFilterOption[]
  bounds?: { min?: number | null; max?: number | null }
}

export interface CatalogFiltersResponse {
  brands: string[]
  max_price: number | null
  age_counts?: Record<string, number>
  category_counts?: Record<string, number>
  total_count?: number
  category?: { id: number; slug: string; name: string } | null
  filters: CatalogFilterDef[]
}

export const filterLabel = (filter: CatalogFilterDef, locale = 'ru'): string => {
  if (typeof filter.name === 'string') return filter.name
  return filter.name?.[locale] || filter.name?.ru || filter.name?.en || filter.code
}

export const useCatalogFilters = () => {
  const { request } = useApi()
  const { cmsLocale } = useCmsLocale()

  const fetchFilterSchema = async (params: Record<string, string | number | undefined | null> = {}) => {
    const withLocale = { locale: cmsLocale.value, ...params }
    const query = new URLSearchParams(
      Object.entries(withLocale).reduce<Record<string, string>>((acc, [key, value]) => {
        if (value === undefined || value === null || value === '') return acc
        acc[key] = String(value)
        return acc
      }, {}),
    ).toString()

    return await request<{ data: CatalogFiltersResponse }>(
      `/toys/filter-options${query ? `?${query}` : ''}`,
    )
  }

  return {
    fetchFilterSchema,
    filterLabel,
  }
}
