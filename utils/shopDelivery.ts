/** Defaults must match alpha_back config/alpha.php shop.* */
export const SHOP_DELIVERY_FEE_DEFAULT = 1200
export const SHOP_FREE_DELIVERY_THRESHOLD_DEFAULT = 15000

export type ShopPricing = {
  delivery_fee: number
  free_delivery_threshold: number
}

export function normalizeShopPricing(raw?: Partial<ShopPricing> | null): ShopPricing {
  const fee = Number(raw?.delivery_fee)
  const threshold = Number(raw?.free_delivery_threshold)

  return {
    delivery_fee: Number.isFinite(fee) && fee >= 0 ? Math.floor(fee) : SHOP_DELIVERY_FEE_DEFAULT,
    free_delivery_threshold: Number.isFinite(threshold) && threshold >= 0
      ? Math.floor(threshold)
      : SHOP_FREE_DELIVERY_THRESHOLD_DEFAULT,
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
