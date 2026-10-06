export const BUY_NOW_STORAGE_KEY = 'alpha_buy_now_items'

export type BuyNowStoredItem = {
  id: number | string
  title: string
  price: number
  quantity: number
  image: string
  subtitle?: string | null
  isGiftPackaging?: boolean
  giftBoxId?: number | null
  isPreorder?: boolean
  promisedArrivalFrom?: string | null
  promisedArrivalTo?: string | null
  promisedDeliveryFrom?: string | null
  promisedDeliveryTo?: string | null
  preorderNote?: string | null
  batchId?: number | null
}

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

const isValidBuyNowItem = (item: unknown): item is BuyNowStoredItem => {
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

const normalizeBuyNowItem = (item: BuyNowStoredItem): BuyNowStoredItem => ({
  ...item,
  subtitle: typeof item.subtitle === 'string' && item.subtitle.trim()
    ? item.subtitle.trim()
    : null,
  isGiftPackaging: Boolean(item.isGiftPackaging),
  giftBoxId: item.giftBoxId != null
    ? Number(item.giftBoxId)
    : (isGiftBoxCartId(item.id) ? Number(String(item.id).slice(3)) : null),
  isPreorder: Boolean(item.isPreorder),
  promisedArrivalFrom: item.promisedArrivalFrom ?? null,
  promisedArrivalTo: item.promisedArrivalTo ?? null,
  promisedDeliveryFrom: item.promisedDeliveryFrom ?? null,
  promisedDeliveryTo: item.promisedDeliveryTo ?? null,
  preorderNote: item.preorderNote ?? null,
  batchId: item.batchId ?? null,
})

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

/** sessionStorage: survives reload, clears when the tab closes. */
export const readBuyNowItems = (
  storage: StorageLike | null | undefined,
): BuyNowStoredItem[] | null => {
  if (!storage) return null
  try {
    const raw = storage.getItem(BUY_NOW_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null
    const items = parsed.filter(isValidBuyNowItem).map(normalizeBuyNowItem)
    return items.length > 0 ? items : null
  } catch {
    return null
  }
}

export const writeBuyNowItems = (
  storage: StorageLike | null | undefined,
  items: BuyNowStoredItem[] | null,
): void => {
  if (!storage) return
  if (!items?.length) {
    storage.removeItem(BUY_NOW_STORAGE_KEY)
    return
  }
  storage.setItem(BUY_NOW_STORAGE_KEY, JSON.stringify(items))
}
