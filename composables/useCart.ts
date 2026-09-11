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

const isPurchasableCartId = (id: unknown): boolean => {
  if (typeof id === 'number') return Number.isFinite(id) && id > 0
  if (typeof id !== 'string') return false
  if (id.startsWith('gift-')) return false
  const n = Number(id)
  return Number.isFinite(n) && n > 0 && String(n) === id.trim()
}

const isValidCartItem = (item: unknown): item is CartItem => {
  if (!item || typeof item !== 'object') return false
  const row = item as Record<string, unknown>
  return (
    isPurchasableCartId(row.id)
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
  const buyNowItems = useState<CartItem[] | null>('buy_now_checkout_items', () => null)
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

  const isBuyNowCheckout = computed(() => Boolean(buyNowItems.value?.length))

  const checkoutItems = computed(() =>
    isBuyNowCheckout.value && buyNowItems.value ? buyNowItems.value : items.value
  )

  const totalCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  })

  const checkoutTotalPrice = computed(() =>
    checkoutItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )

  const hasGiftPackagingItems = computed(() =>
    items.value.some(item => Boolean(item.isGiftPackaging))
  )

  const checkoutHasGiftPackaging = computed(() =>
    checkoutItems.value.some(item => Boolean(item.isGiftPackaging))
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

  const startBuyNow = (product: {
    id: number | string
    title: string
    price: number | string
    image: string
    quantity?: number
    isGiftPackaging?: boolean
  }) => {
    const numPrice = typeof product.price === 'number'
      ? product.price
      : parseInt(String(product.price).replace(/\D/g, ''), 10) || 0
    const qty = Math.max(1, product.quantity ?? 1)

    buyNowItems.value = [{
      id: product.id,
      title: product.title,
      price: numPrice,
      quantity: qty,
      image: product.image,
      isGiftPackaging: Boolean(product.isGiftPackaging),
    }]
  }

  const clearBuyNow = () => {
    buyNowItems.value = null
  }

  const setCheckoutQuantity = (id: number | string, quantity: number) => {
    if (isBuyNowCheckout.value && buyNowItems.value) {
      const item = buyNowItems.value.find(i => String(i.id) === String(id))
      if (!item) return
      if (quantity <= 0) {
        buyNowItems.value = buyNowItems.value.filter(i => String(i.id) !== String(id))
        if (buyNowItems.value.length === 0) buyNowItems.value = null
        return
      }
      item.quantity = quantity
      return
    }
    setQuantity(id, quantity)
  }

  const removeCheckoutItem = (id: number | string) => {
    if (isBuyNowCheckout.value && buyNowItems.value) {
      buyNowItems.value = buyNowItems.value.filter(i => String(i.id) !== String(id))
      if (buyNowItems.value.length === 0) buyNowItems.value = null
      return
    }
    removeItem(id)
  }

  /** Drop gift-box stubs and other non-toy ids that break checkout. */
  const pruneInvalidItems = () => {
    const next = items.value.filter(item => isPurchasableCartId(item.id))
    if (next.length !== items.value.length) {
      items.value = next.map(item => ({
        ...item,
        id: typeof item.id === 'number' ? item.id : Number(item.id),
      }))
    }
    if (buyNowItems.value) {
      const pruned = buyNowItems.value.filter(item => isPurchasableCartId(item.id))
      buyNowItems.value = pruned.length > 0
        ? pruned.map(item => ({
            ...item,
            id: typeof item.id === 'number' ? item.id : Number(item.id),
          }))
        : null
    }
  }

  if (import.meta.client) {
    pruneInvalidItems()
  }

  return {
    items,
    buyNowItems,
    checkoutItems,
    isBuyNowCheckout,
    totalCount,
    totalPrice,
    checkoutTotalPrice,
    hasGiftPackagingItems,
    checkoutHasGiftPackaging,
    addItem,
    removeItem,
    increaseQty,
    decreaseQty,
    setQuantity,
    setCheckoutQuantity,
    removeCheckoutItem,
    clearCart,
    startBuyNow,
    clearBuyNow,
    pruneInvalidItems,
  }
}
