/** Defaults must match alpha_back config/alpha.php shop.* until admin overrides them. */
export const SHOP_DELIVERY_FEE_DEFAULT = 1200
export const SHOP_FREE_DELIVERY_THRESHOLD_DEFAULT = 15000

export type ShopDeliverySlot = {
  key: string
  day: 'today' | 'tomorrow'
  from: string
  to: string
}

export const SHOP_DELIVERY_SLOTS_DEFAULT: ShopDeliverySlot[] = [
  { key: 'today-evening', day: 'today', from: '18:00', to: '21:00' },
  { key: 'tomorrow-morning', day: 'tomorrow', from: '10:00', to: '14:00' },
  { key: 'tomorrow-afternoon', day: 'tomorrow', from: '14:00', to: '18:00' },
]

export type ShopPricing = {
  delivery_fee: number
  free_delivery_threshold: number
  slots: ShopDeliverySlot[]
}

const SLOT_KEY_RE = /^[a-z0-9][a-z0-9-]{0,39}$/
const SLOT_TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

function normalizeSlots(raw: unknown): ShopDeliverySlot[] {
  if (!Array.isArray(raw)) return SHOP_DELIVERY_SLOTS_DEFAULT

  const slots: ShopDeliverySlot[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const source = item as Partial<ShopDeliverySlot>
    const key = String(source.key || '')
    const from = String(source.from || '')
    const to = String(source.to || '')
    if (!SLOT_KEY_RE.test(key)) continue
    if (source.day !== 'today' && source.day !== 'tomorrow') continue
    if (!SLOT_TIME_RE.test(from) || !SLOT_TIME_RE.test(to) || from >= to) continue
    slots.push({ key, day: source.day, from, to })
    if (slots.length === 6) break
  }

  return slots.length ? slots : SHOP_DELIVERY_SLOTS_DEFAULT
}

export function normalizeShopPricing(raw?: Partial<ShopPricing> | null): ShopPricing {
  const fee = Number(raw?.delivery_fee)
  const threshold = Number(raw?.free_delivery_threshold)

  return {
    delivery_fee: Number.isFinite(fee) && fee >= 0 ? Math.floor(fee) : SHOP_DELIVERY_FEE_DEFAULT,
    free_delivery_threshold: Number.isFinite(threshold) && threshold >= 0
      ? Math.floor(threshold)
      : SHOP_FREE_DELIVERY_THRESHOLD_DEFAULT,
    slots: normalizeSlots(raw?.slots),
  }
}

/**
 * Courier fee for a shop cart/checkout subtotal.
 * Keep in sync with App\Support\ShopDelivery::feeForSubtotal.
 */
export function shopDeliveryFee(
  subtotal: number,
  pricing: ShopPricing,
  options?: { requiresDelivery?: boolean; hasItems?: boolean },
): number {
  const requiresDelivery = options?.requiresDelivery !== false
  const hasItems = options?.hasItems !== false

  if (!requiresDelivery || !hasItems) return 0

  const fee = pricing.delivery_fee
  if (fee <= 0) return 0

  const threshold = pricing.free_delivery_threshold
  if (threshold > 0 && subtotal >= threshold) return 0

  return fee
}
