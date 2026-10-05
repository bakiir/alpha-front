import {
  normalizeShopPricing,
  shopDeliveryFee,
  type ShopPricing,
  SHOP_DELIVERY_FEE_DEFAULT,
  SHOP_FREE_DELIVERY_THRESHOLD_DEFAULT,
} from '~/utils/shopDelivery'

export const useShopDelivery = () => {
  const { request } = useApi()

  const pricing = useState<ShopPricing>('alpha_shop_pricing', () => ({
    delivery_fee: SHOP_DELIVERY_FEE_DEFAULT,
    free_delivery_threshold: SHOP_FREE_DELIVERY_THRESHOLD_DEFAULT,
  }))
  const isLoaded = useState<boolean>('alpha_shop_pricing_loaded', () => false)

  const fetchPricing = async () => {
    try {
      const res = await request<{ status?: string; data?: Partial<ShopPricing> }>('/shop/pricing')
      if (res?.data) {
        pricing.value = normalizeShopPricing(res.data)
        isLoaded.value = true
      }
    } catch (e) {
      console.warn('[useShopDelivery] Failed to load shop pricing, using defaults:', e)
    }
  }

  const deliveryFeeFor = (
    subtotal: number,
    options?: { requiresDelivery?: boolean; hasItems?: boolean },
  ) => shopDeliveryFee(subtotal, pricing.value, options)

  const amountToFreeDelivery = (subtotal: number) => {
    const threshold = pricing.value.free_delivery_threshold
    if (threshold <= 0) return 0
    return Math.max(0, threshold - subtotal)
  }

  const qualifiesForFreeDelivery = (subtotal: number) => {
    const threshold = pricing.value.free_delivery_threshold
    return threshold > 0 && subtotal >= threshold
  }

  return {
    pricing,
    isLoaded,
    fetchPricing,
    deliveryFeeFor,
    amountToFreeDelivery,
    qualifiesForFreeDelivery,
    deliveryFeeDefault: SHOP_DELIVERY_FEE_DEFAULT,
    freeDeliveryThresholdDefault: SHOP_FREE_DELIVERY_THRESHOLD_DEFAULT,
  }
}
