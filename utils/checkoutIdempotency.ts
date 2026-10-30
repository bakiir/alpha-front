const CHECKOUT_IDEM_PREFIX = 'alpha_checkout_idem:'

const newIdempotencyKey = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `ord-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`
}

/**
 * Stable Idempotency-Key for one unpaid checkout attempt (same cart + address payload).
 * Cleared after pay success / abandon so a deliberate second identical order can proceed.
 */
export const getOrCreateCheckoutIdempotencyKey = (payloadKey: string): string => {
  if (!import.meta.client) {
    return newIdempotencyKey()
  }
  const storageKey = CHECKOUT_IDEM_PREFIX + payloadKey
  let key = localStorage.getItem(storageKey)
  if (!key) {
    key = newIdempotencyKey()
    localStorage.setItem(storageKey, key)
  }
  return key
}

export const clearCheckoutIdempotencyKey = (payloadKey: string | null | undefined) => {
  if (!import.meta.client || !payloadKey) return
  localStorage.removeItem(CHECKOUT_IDEM_PREFIX + payloadKey)
}

/** Drop every shop checkout Idempotency-Key after a confirmed payment (ePay return). */
export const clearAllCheckoutIdempotencyKeys = () => {
  if (!import.meta.client) return
  const toRemove: string[] = []
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i)
    if (key && key.startsWith(CHECKOUT_IDEM_PREFIX)) {
      toRemove.push(key)
    }
  }
  for (const key of toRemove) {
    localStorage.removeItem(key)
  }
}
