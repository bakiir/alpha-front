export interface AppliedGiftCard {
  code: string
  balance: number
  discountAmount: number
}

const STORAGE_KEY = 'alpha_cart_gift_card'

const readStoredGiftCard = (): AppliedGiftCard | null => {
  if (!import.meta.client) return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.code || typeof parsed.balance !== 'number') return null
    return parsed as AppliedGiftCard
  } catch {
    return null
  }
}

const persistGiftCard = (card: AppliedGiftCard | null) => {
  if (!import.meta.client) return
  if (!card) {
    sessionStorage.removeItem(STORAGE_KEY)
    return
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(card))
}

export const useCartPromo = () => {
  const appliedGiftCard = useState<AppliedGiftCard | null>('cart_applied_gift_card', () => readStoredGiftCard())

  if (import.meta.client && appliedGiftCard.value === null) {
    const stored = readStoredGiftCard()
    if (stored) appliedGiftCard.value = stored
  }

  const computeGiftDiscount = (payableTotal: number) => {
    if (!appliedGiftCard.value) return 0
    return Math.min(Math.max(0, payableTotal), appliedGiftCard.value.balance)
  }

  const setAppliedGiftCard = (card: AppliedGiftCard | null) => {
    appliedGiftCard.value = card
    persistGiftCard(card)
  }

  const clearAppliedGiftCard = () => {
    setAppliedGiftCard(null)
  }

  const refreshDiscountForTotal = (payableTotal: number) => {
    if (!appliedGiftCard.value) return
    setAppliedGiftCard({
      ...appliedGiftCard.value,
      discountAmount: computeGiftDiscount(payableTotal),
    })
  }

  return {
    appliedGiftCard,
    setAppliedGiftCard,
    clearAppliedGiftCard,
    computeGiftDiscount,
    refreshDiscountForTotal,
  }
}
