import { computed } from 'vue'

export interface FavoriteItem {
  id: number | string
  title: string
  price?: number
  image?: string
  category?: string
}

export const useFavorites = () => {
  const favorites = useState<FavoriteItem[]>('global_favorites', () => [])

  const count = computed(() => favorites.value.length)

  const isFavorite = (id: number | string) => {
    return favorites.value.some(item => String(item.id) === String(id))
  }

  const toggleFavorite = (item: FavoriteItem) => {
    const idx = favorites.value.findIndex(f => String(f.id) === String(item.id))
    if (idx > -1) {
      favorites.value.splice(idx, 1)
    } else {
      favorites.value.push(item)
    }
  }

  return {
    favorites,
    count,
    isFavorite,
    toggleFavorite
  }
}
