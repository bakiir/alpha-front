import { computed, watch } from 'vue'

export interface FavoriteItem {
  id: number | string
  title: string
  price?: number
  image?: string
  category?: string
}

const FAVORITES_STORAGE_KEY = 'alpha_favorites'

const readStoredFavorites = (): FavoriteItem[] => {
  if (!import.meta.client) return []
  try {
    const stored = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) || '[]')
    if (!Array.isArray(stored)) return []
    const seen = new Set<string>()
    return stored.filter((item): item is FavoriteItem => {
      if (!item || (typeof item.id !== 'number' && typeof item.id !== 'string') || typeof item.title !== 'string') return false
      const id = String(item.id)
      if (!id || seen.has(id)) return false
      seen.add(id)
      return true
    }).slice(0, 500)
  } catch {
    return []
  }
}

export const useFavorites = () => {
  const favorites = useState<FavoriteItem[]>('global_favorites', () => [])
  const persistReady = useState<boolean>('global_favorites_persist_ready', () => false)
  const { success: toastSuccess } = useToast()

  if (import.meta.client && !persistReady.value) {
    persistReady.value = true
    if (favorites.value.length === 0) favorites.value = readStoredFavorites()
    watch(favorites, (next) => {
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Favorites still work for the current visit when browser storage is unavailable.
      }
    }, { deep: true })
  }

  const count = computed(() => favorites.value.length)

  const isFavorite = (id: number | string) => {
    return favorites.value.some(item => String(item.id) === String(id))
  }

  const toggleFavorite = (item: FavoriteItem) => {
    const idx = favorites.value.findIndex(f => String(f.id) === String(item.id))
    if (idx > -1) {
      favorites.value.splice(idx, 1)
      toastSuccess('Убрано из избранного', `«${item.title}» удалена из списка.`)
    } else {
      favorites.value.push(item)
      toastSuccess('В избранном', `«${item.title}» добавлена в избранное.`)
    }
  }

  return {
    favorites,
    count,
    isFavorite,
    toggleFavorite
  }
}
