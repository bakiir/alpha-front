import { computed, watch } from 'vue'

export interface CartItem {
  id: number | string
  title: string
  price: number
  quantity: number
  image: string
  isGiftPackaging?: boolean
}

const CART_STORAGE_KEY = 'alpha_cart_items'

const isValidCartItem = (item: unknown): item is CartItem => {
  if (!item || typeof item !== 'object') return false
  const row = item as Record<string, unknown>
  return (
    (typeof row.id === 'number' || typeof row.id === 'string')
    && typeof row.title === 'string'
    && typeof row.price === 'number'
    && typeof row.quantity === 'number'
    && row.quantity > 0
    && typeof row.image === 'string'
  )
}

const readStoredCart = (): CartItem[] => {
  if (!import.meta.client) return []
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isValidCartItem).map(item => ({
      ...item,
      isGiftPackaging: Boolean(item.isGiftPackaging),
    }))
  } catch {
    return []
  }
}

const persistCart = (items: CartItem[]) => {
  if (!import.meta.client) return
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
}

export const useCart = () => {
  const items = useState<CartItem[]>('global_cart_items', () => readStoredCart())
  const persistReady = useState<boolean>('global_cart_persist_ready', () => false)

  if (import.meta.client && !persistReady.value) {
    persistReady.value = true
    if (items.value.length === 0) {
      const stored = readStoredCart()
      if (stored.length > 0) {
        items.value = stored
      }
    }
    watch(items, (next) => {
      persistCart(next)
    }, { deep: true })
  }

  const totalCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  })

  const hasGiftPackagingItems = computed(() =>
    items.value.some(item => Boolean(item.isGiftPackaging))
  )

  const addItem = (product: {
    id: number | string
    title: string
    price: number | string
    image: string
    isGiftPackaging?: boolean
  }) => {
    const numPrice = typeof product.price === 'number'
      ? product.price
      : parseInt(String(product.price).replace(/\D/g, ''), 10) || 0

    const existing = items.value.find(i => String(i.id) === String(product.id))
    if (existing) {
      existing.quantity += 1
      if (product.isGiftPackaging) {
        existing.isGiftPackaging = true
      }
    } else {
      items.value.push({
        id: product.id,
        title: product.title,
        price: numPrice,
        quantity: 1,
        image: product.image,
        isGiftPackaging: Boolean(product.isGiftPackaging),
      })
    }
  }

  const removeItem = (id: number | string) => {
    const idx = items.value.findIndex(i => String(i.id) === String(id))
    if (idx > -1) {
      items.value.splice(idx, 1)
    }
  }

  const increaseQty = (id: number | string) => {
    const item = items.value.find(i => String(i.id) === String(id))
    if (item) {
      item.quantity += 1
    }
  }

  const decreaseQty = (id: number | string) => {
    const item = items.value.find(i => String(i.id) === String(id))
    if (item) {
      if (item.quantity > 1) {
        item.quantity -= 1
      } else {
        removeItem(id)
      }
    }
  }

  const setQuantity = (id: number | string, quantity: number) => {
    const item = items.value.find(i => String(i.id) === String(id))
    if (!item) return
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    item.quantity = quantity
  }

  const clearCart = () => {
    items.value = []
  }

  return {
    items,
    totalCount,
    totalPrice,
    hasGiftPackagingItems,
    addItem,
    removeItem,
    increaseQty,
    decreaseQty,
    setQuantity,
    clearCart,
  }
}
