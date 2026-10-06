const STORAGE_PREFIX = 'alpha:sub-pay-idem:'

const newIdempotencyKey = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `sub-pay-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`
}

const storageKeyFor = (
  subscriptionId: number,
  billingCycle?: string | null,
): string => {
  const cycle = billingCycle ? String(billingCycle) : 'default'
  return `${STORAGE_PREFIX}${subscriptionId}:${cycle}`
}

/**
 * Stable Idempotency-Key for a subscription pay attempt.
 * Survives double-click / retries until the attempt is cleared after success
 * or an intentional failed-payment retry.
 * Cycle is part of the storage key so changing period does not reuse a key
 * that was already bound to another payload hash.
 */
export const getOrCreateSubscriptionPayIdempotencyKey = (
  subscriptionId: number,
  billingCycle?: string | null,
): string => {
  if (!import.meta.client) {
    return newIdempotencyKey()
  }

  const storageKey = storageKeyFor(subscriptionId, billingCycle)
  let key = localStorage.getItem(storageKey)
  if (!key) {
    key = newIdempotencyKey()
    localStorage.setItem(storageKey, key)
  }
  return key
}

export const clearSubscriptionPayIdempotencyKey = (
  subscriptionId: number | null | undefined,
  billingCycle?: string | null,
): void => {
  if (!import.meta.client || !subscriptionId) return
  localStorage.removeItem(storageKeyFor(subscriptionId, billingCycle))
  // Legacy key without cycle suffix (pre–period-picker).
  if (!billingCycle) {
    localStorage.removeItem(STORAGE_PREFIX + String(subscriptionId))
  }
}

/** Force a fresh key (e.g. after a failed bank attempt on the failure page). */
export const rotateSubscriptionPayIdempotencyKey = (
  subscriptionId: number,
  billingCycle?: string | null,
): string => {
  clearSubscriptionPayIdempotencyKey(subscriptionId, billingCycle)
  return getOrCreateSubscriptionPayIdempotencyKey(subscriptionId, billingCycle)
}
