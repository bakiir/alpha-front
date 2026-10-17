export type GiftDeliveryField = 'name' | 'phone' | 'address' | 'comment'

export type GiftDeliveryForm = Record<GiftDeliveryField, string>

export type GiftDeliveryErrorCode = 'required' | 'phone' | 'tooLong'

export interface GiftDeliveryItem {
  key: string
  name: string
  image: string | null
  quantity: number
}

export const GIFT_DELIVERY_LIMITS: Record<GiftDeliveryField, number> = {
  name: 255,
  phone: 20,
  address: 255,
  comment: 500,
}

export const GIFT_DELIVERY_FIELDS: GiftDeliveryField[] = ['name', 'phone', 'address', 'comment']

export const isCompleteKazakhstanPhone = (value: string): boolean => {
  const digits = String(value || '').replace(/\D/g, '')
  return digits.length === 11 && digits.startsWith('7')
}

export const validateGiftDeliveryForm = (
  form: GiftDeliveryForm,
): Partial<Record<GiftDeliveryField, GiftDeliveryErrorCode>> => {
  const errors: Partial<Record<GiftDeliveryField, GiftDeliveryErrorCode>> = {}
  const name = form.name.trim()
  const address = form.address.trim()

  if (!name) errors.name = 'required'
  else if (name.length > GIFT_DELIVERY_LIMITS.name) errors.name = 'tooLong'

  if (!form.phone.trim()) errors.phone = 'required'
  else if (!isCompleteKazakhstanPhone(form.phone)) errors.phone = 'phone'

  if (!address) errors.address = 'required'
  else if (address.length > GIFT_DELIVERY_LIMITS.address) errors.address = 'tooLong'

  if (form.comment.trim().length > GIFT_DELIVERY_LIMITS.comment) errors.comment = 'tooLong'

  return errors
}

/**
 * Splits a Laravel 422 `errors` bag into messages shown under form fields and the rest
 * (token, city_id, …) shown in the banner. City mismatch belongs to the address field.
 */
export const splitGiftClaimServerErrors = (
  errors: unknown,
): { fields: Partial<Record<GiftDeliveryField, string>>; other: string[] } => {
  const fields: Partial<Record<GiftDeliveryField, string>> = {}
  const other: string[] = []
  if (!errors || typeof errors !== 'object') return { fields, other }

  for (const [key, value] of Object.entries(errors as Record<string, unknown>)) {
    const message = (Array.isArray(value) ? value : [value]).find((m) => typeof m === 'string' && m) as string | undefined
    if (!message) continue
    const field: GiftDeliveryField | null = key === 'city'
      ? 'address'
      : (GIFT_DELIVERY_FIELDS as string[]).includes(key) ? key as GiftDeliveryField : null
    if (field) {
      if (!fields[field]) fields[field] = message
    } else {
      other.push(message)
    }
  }

  return { fields, other }
}

export const normalizeGiftItems = (items: unknown): GiftDeliveryItem[] => {
  if (!Array.isArray(items)) return []
  return items.map((raw, index) => {
    const item = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
    const quantity = Math.floor(Number(item.quantity))
    return {
      key: `${index}-${String(item.name ?? '')}`,
      name: String(item.name ?? '').trim(),
      image: typeof item.image === 'string' && item.image ? item.image : null,
      quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
    }
  })
}
