import { formatMoneyAmount } from '~/utils/money'

export const useFormatPrice = () => {
  const formatPrice = formatMoneyAmount

  return { formatPrice }
}
