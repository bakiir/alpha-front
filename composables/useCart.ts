import { computed, watch } from 'vue'
import { readBuyNowItems, writeBuyNowItems } from '~/utils/buyNowStorage'
import {
  canIncreaseCartQuantity,
  cartLineMaxQuantity,
  clampCartQuantity,
} from '~/utils/cartStockLimit'

export interface CartItem {
  id: number | string
  title: string
  price: number
  quantity: number
  image: string
  /** Real product meta for cart cards (age / material). Never invent placeholders. */
  subtitle?: string | null
  isGiftPackaging?: boolean
  /** ATO gift box catalog id (when set, checkout sends gift_box_id). */
  giftBoxId?: number | null
  isPreorder?: boolean
  /** Known stock (or preorder limit_remaining). Null/undefined = no client-side cap yet. */
  availableQuantity?: number | null
  promisedArrivalFrom?: string | null
  promisedArrivalTo?: string | null
  promisedDeliveryFrom?: string | null
  promisedDeliveryTo?: string | null
  preorderNote?: string | null
  batchId?: number | null
}

export type CartQtyResult = {
  quantity: number
  limited: boolean
  max: number | null
}

const CART_STORAGE_KEY = 'alpha_cart_items'

const buyNowStorage = () => (import.meta.client ? sessionStorage : null)

const isGiftBoxCartId = (id: unknown): boolean =>
  typeof id === 'string' && /^gb-\d+$/.test(id)

const isPurchasableCartId = (id: unknown): boolean => {
  if (isGiftBoxCartId(id)) return true
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

const normalizeAvailableQuantity = (value: unknown): number | null => {
  if (value == null || value === '') return null
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0) return null
  return Math.floor(n)
}

const normalizeStoredCartItem = (item: CartItem): CartItem => ({
  ...item,
  subtitle: typeof item.subtitle === 'string' && item.subtitle.trim()
    ? item.subtitle.trim()
    : null,
  isGiftPackaging: Boolean(item.isGiftPackaging),
  giftBoxId: item.giftBoxId != null ? Number(item.giftBoxId) : (isGiftBoxCartId(item.id) ? Number(String(item.id).slice(3)) : null),
  isPreorder: Boolean(item.isPreorder),
  availableQuantity: normalizeAvailableQuantity(item.availableQuantity),
  promisedArrivalFrom: item.promisedArrivalFrom ?? null,
  promisedArrivalTo: item.promisedArrivalTo ?? null,
  promisedDeliveryFrom: item.promisedDeliveryFrom ?? null,
  promisedDeliveryTo: item.promisedDeliveryTo ?? null,
  preorderNote: item.preorderNote ?? null,
  batchId: item.batchId ?? null,
})

const lineMax = (item: Pick<CartItem, 'isPreorder' | 'availableQuantity'>) =>
  cartLineMaxQuantity({
    isPreorder: item.isPreorder,
    availableQuantity: item.availableQuantity,
  })

const readStoredCart = (): CartItem[] => {
  if (!import.meta.client) return []
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isValidCartItem).map(normalizeStoredCartItem)
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
  const buyNowItems = useState<CartItem[] | null>('buy_now_checkout_items', () => readBuyNowItems(buyNowStorage()))
  const persistReady = useState<boolean>('global_cart_persist_ready', () => false)

  if (import.meta.client && !persistReady.value) {
    persistReady.value = true
    if (items.value.length === 0) {
      const stored = readStoredCart()
      if (stored.length > 0) {
        items.value = stored
      }
    }
    if (!buyNowItems.value?.length) {
      const storedBuyNow = readBuyNowItems(buyNowStorage())
      if (storedBuyNow?.length) {
        buyNowItems.value = storedBuyNow
      }
    }
    watch(items, (next) => {
      persistCart(next)
    }, { deep: true })
    watch(buyNowItems, (next) => {
      writeBuyNowItems(buyNowStorage(), next)
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
    subtitle?: string | null
    isGiftPackaging?: boolean
    giftBoxId?: number | null
    isPreorder?: boolean
    availableQuantity?: number | null
    promisedArrivalFrom?: string | null
    promisedArrivalTo?: string | null
    promisedDeliveryFrom?: string | null
    promisedDeliveryTo?: string | null
    preorderNote?: string | null
    batchId?: number | null
    quantity?: number
  }): CartQtyResult => {
    const numPrice = typeof product.price === 'number'
      ? product.price
      : parseInt(String(product.price).replace(/\D/g, ''), 10) || 0

    const requested = Math.max(1, product.quantity ?? 1)
    const subtitle = typeof product.subtitle === 'string' && product.subtitle.trim()
      ? product.subtitle.trim()
      : null
    const availableQuantity = normalizeAvailableQuantity(product.availableQuantity)
    const existing = items.value.find(i =>
      String(i.id) === String(product.id)
      && Boolean(i.isPreorder) === Boolean(product.isPreorder)
    )

    if (existing) {
      if (availableQuantity != null) {
        existing.availableQuantity = availableQuantity
      }
      const max = lineMax(existing)
      const nextQty = clampCartQuantity(existing.quantity + requested, max)
      const limited = max != null && existing.quantity + requested > max
      if (nextQty <= 0) {
        removeItem(product.id, product.isPreorder)
        return { quantity: 0, limited: true, max }
      }
      existing.quantity = nextQty
      if (product.isGiftPackaging) {
        existing.isGiftPackaging = true
      }
      if (product.giftBoxId) {
        existing.giftBoxId = product.giftBoxId
      }
      if (subtitle) {
        existing.subtitle = subtitle
      }
      return { quantity: existing.quantity, limited, max }
    }

    const draft: CartItem = {
      id: product.id,
      title: product.title,
      price: numPrice,
      quantity: requested,
      image: product.image,
      subtitle,
      isGiftPackaging: Boolean(product.isGiftPackaging),
      giftBoxId: product.giftBoxId ?? (isGiftBoxCartId(product.id) ? Number(String(product.id).slice(3)) : null),
      isPreorder: Boolean(product.isPreorder),
      availableQuantity,
      promisedArrivalFrom: product.promisedArrivalFrom ?? null,
      promisedArrivalTo: product.promisedArrivalTo ?? null,
      promisedDeliveryFrom: product.promisedDeliveryFrom ?? null,
      promisedDeliveryTo: product.promisedDeliveryTo ?? null,
      preorderNote: product.preorderNote ?? null,
      batchId: product.batchId ?? null,
    }
    const max = lineMax(draft)
    const qty = clampCartQuantity(requested, max)
    const limited = max != null && requested > max
    if (qty <= 0) {
      return { quantity: 0, limited: true, max }
    }
    draft.quantity = qty
    items.value.push(draft)
    return { quantity: qty, limited, max }
  }

  const hasPreorderItems = computed(() => items.value.some(i => Boolean(i.isPreorder)))
  const hasStockItems = computed(() => items.value.some(i => !i.isPreorder))
  const checkoutHasPreorderItems = computed(() =>
    checkoutItems.value.some(i => Boolean(i.isPreorder))
  )
  const checkoutHasStockItems = computed(() =>
    checkoutItems.value.some(i => !i.isPreorder)
  )
  const checkoutIsMixed = computed(() =>
    checkoutHasPreorderItems.value && checkoutHasStockItems.value
  )
  const checkoutHasMultiplePreorderBatches = computed(() => {
    const batches = new Set(
      checkoutItems.value
        .filter(i => i.isPreorder)
        .map(i => String(i.batchId ?? 'none')),
    )
    return batches.size > 1
  })

  const sameLine = (a: CartItem, id: number | string, isPreorder?: boolean) =>
    String(a.id) === String(id) && Boolean(a.isPreorder) === Boolean(isPreorder)

  const removeItem = (id: number | string, isPreorder?: boolean) => {
    const idx = items.value.findIndex(i => sameLine(i, id, isPreorder))
    if (idx > -1) {
      items.value.splice(idx, 1)
    }
  }

  const increaseQty = (id: number | string, isPreorder?: boolean): CartQtyResult => {
    const item = items.value.find(i => sameLine(i, id, isPreorder))
    if (!item) return { quantity: 0, limited: false, max: null }
    const max = lineMax(item)
    if (!canIncreaseCartQuantity(item.quantity, max)) {
      return { quantity: item.quantity, limited: true, max }
    }
    item.quantity += 1
    return { quantity: item.quantity, limited: false, max }
  }

  const decreaseQty = (id: number | string, isPreorder?: boolean) => {
    const item = items.value.find(i => sameLine(i, id, isPreorder))
    if (item) {
      if (item.quantity > 1) {
        item.quantity -= 1
      } else {
        removeItem(id, isPreorder)
      }
    }
  }

  const setQuantity = (id: number | string, quantity: number, isPreorder?: boolean): CartQtyResult => {
    const item = items.value.find(i => sameLine(i, id, isPreorder))
    if (!item) return { quantity: 0, limited: false, max: null }
    const max = lineMax(item)
    const next = clampCartQuantity(quantity, max)
    const limited = max != null && quantity > max
    if (next <= 0) {
      removeItem(id, isPreorder)
      return { quantity: 0, limited: true, max }
    }
    item.quantity = next
    return { quantity: next, limited, max }
  }

  const setAvailableQuantity = (
    id: number | string,
    availableQuantity: number | null,
    isPreorder?: boolean,
  ): CartQtyResult => {
    const item = items.value.find(i => sameLine(i, id, isPreorder))
    if (!item) return { quantity: 0, limited: false, max: null }
    item.availableQuantity = normalizeAvailableQuantity(availableQuantity)
    return setQuantity(id, item.quantity, isPreorder)
  }

  const clearCart = () => {
    items.value = []
  }

  const startBuyNow = (product: {
    id: number | string
    title: string
    price: number | string
    image: string
    subtitle?: string | null
    quantity?: number
    isGiftPackaging?: boolean
    availableQuantity?: number | null
  }): CartQtyResult => {
    const numPrice = typeof product.price === 'number'
      ? product.price
      : parseInt(String(product.price).replace(/\D/g, ''), 10) || 0
    const requested = Math.max(1, product.quantity ?? 1)
    const subtitle = typeof product.subtitle === 'string' && product.subtitle.trim()
      ? product.subtitle.trim()
      : null
    const availableQuantity = normalizeAvailableQuantity(product.availableQuantity)
    const max = cartLineMaxQuantity({ availableQuantity })
    const qty = clampCartQuantity(requested, max)
    const limited = max != null && requested > max

    if (qty <= 0) {
      buyNowItems.value = null
      writeBuyNowItems(buyNowStorage(), null)
      return { quantity: 0, limited: true, max }
    }

    buyNowItems.value = [{
      id: product.id,
      title: product.title,
      price: numPrice,
      quantity: qty,
      image: product.image,
      subtitle,
      isGiftPackaging: Boolean(product.isGiftPackaging),
      availableQuantity,
    }]
    writeBuyNowItems(buyNowStorage(), buyNowItems.value)
    return { quantity: qty, limited, max }
  }

  const clearBuyNow = () => {
    buyNowItems.value = null
    writeBuyNowItems(buyNowStorage(), null)
  }

  const setCheckoutQuantity = (id: number | string, quantity: number, isPreorder?: boolean): CartQtyResult => {
    if (isBuyNowCheckout.value && buyNowItems.value) {
      const item = buyNowItems.value.find(i => sameLine(i, id, isPreorder))
      if (!item) return { quantity: 0, limited: false, max: null }
      const max = lineMax(item)
      const next = clampCartQuantity(quantity, max)
      const limited = max != null && quantity > max
      if (next <= 0) {
        buyNowItems.value = buyNowItems.value.filter(i => !sameLine(i, id, isPreorder))
        if (buyNowItems.value.length === 0) buyNowItems.value = null
        return { quantity: 0, limited: true, max }
      }
      item.quantity = next
      return { quantity: next, limited, max }
    }
    return setQuantity(id, quantity, isPreorder)
  }

  const removeCheckoutItem = (id: number | string, isPreorder?: boolean) => {
    if (isBuyNowCheckout.value && buyNowItems.value) {
      buyNowItems.value = buyNowItems.value.filter(i => !sameLine(i, id, isPreorder))
      if (buyNowItems.value.length === 0) buyNowItems.value = null
      return
    }
    removeItem(id, isPreorder)
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
    hasPreorderItems,
    hasStockItems,
    checkoutHasPreorderItems,
    checkoutHasStockItems,
    checkoutIsMixed,
    checkoutHasMultiplePreorderBatches,
    addItem,
    removeItem,
    increaseQty,
    decreaseQty,
    setQuantity,
    setAvailableQuantity,
    setCheckoutQuantity,
    removeCheckoutItem,
    clearCart,
    startBuyNow,
    clearBuyNow,
    pruneInvalidItems,
  }
}
