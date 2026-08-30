export const FREE_SHIPPING_THRESHOLD = 15000
export const STANDARD_DELIVERY_FEE = 1200

export const calcDeliveryFee = (subtotal: number, hasItems: boolean): number => {
  if (!hasItems || subtotal <= 0) return 0
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE
}

export const formatDeliveryLabel = (fee: number): string => {
  return fee > 0 ? `${fee.toLocaleString('ru-RU')} ₸` : 'Бесплатно'
}
