const STORAGE_PREFIX = 'alpha:sub-pay-idem:'

const newIdempotencyKey = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `sub-pay-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`
}

/**
 * Stable Idempotency-Key for a subscription pay attempt.
 * Survives double-click / retries until the attempt is cleared after success
 * or an intentional failed-payment retry.
 */
export const getOrCreateSubscriptionPayIdempotencyKey = (subscriptionId: number): string => {
  if (!import.meta.client) {
    return newIdempotencyKey()
  }

  const storageKey = STORAGE_PREFIX + String(subscriptionId)
  let key = localStorage.getItem(storageKey)
  if (!key) {
    key = newIdempotencyKey()
    localStorage.setItem(storageKey, key)
  }
  return key
}

export const clearSubscriptionPayIdempotencyKey = (subscriptionId: number | null | undefined): void => {
  if (!import.meta.client || !subscriptionId) return
  localStorage.removeItem(STORAGE_PREFIX + String(subscriptionId))
}

/** Force a fresh key (e.g. after a failed bank attempt on the failure page). */
export const rotateSubscriptionPayIdempotencyKey = (subscriptionId: number): string => {
  clearSubscriptionPayIdempotencyKey(subscriptionId)
  return getOrCreateSubscriptionPayIdempotencyKey(subscriptionId)
}
