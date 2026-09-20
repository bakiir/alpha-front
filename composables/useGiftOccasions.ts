export interface GiftOccasion {
  id: number
  slug: string
  name: string
  icon: string | null
  image_url?: string | null
  sort_order?: number
}

export const useGiftOccasions = () => {
  const { request } = useApi()
  const occasions = useState<GiftOccasion[]>('gift-occasions', () => [])
  const isLoading = useState('gift-occasions-loading', () => false)

  const loadOccasions = async (force = false) => {
    if (!force && occasions.value.length > 0) {
      return occasions.value
    }

    isLoading.value = true
    try {
      const res = await request<{ data?: GiftOccasion[] } | GiftOccasion[]>('/gift-occasions')
      const list = Array.isArray(res) ? res : (res?.data ?? [])
      occasions.value = Array.isArray(list)
        ? list
            .map((item: any) => ({
              id: Number(item.id),
              slug: String(item.slug ?? '').trim(),
              name: String(item.name ?? ''),
              icon: item.icon ?? null,
              image_url: item.image_url ?? null,
              sort_order: item.sort_order != null ? Number(item.sort_order) : undefined,
            }))
            .filter((item) => item.slug)
        : []
      return occasions.value
    } catch (error) {
      console.error('Failed to load gift occasions', error)
      occasions.value = []
      return occasions.value
    } finally {
      isLoading.value = false
    }
  }

  return {
    occasions,
    isLoading,
    loadOccasions,
  }
}
