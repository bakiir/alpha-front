/** Sets currently at the client (or being picked up). */
export const HOME_SET_STATUSES = ['in_use', 'returning'] as const

/** Inbound / warehouse pipeline sets. */
export const NEXT_SET_STATUSES = ['assembling', 'delivering'] as const

/**
 * Statuses that may contribute to toys-in-use counts.
 * Cancelled / returned / assembling must never count as "toys at home".
 */
export const TOYS_IN_USE_STATUSES = ['in_use', 'delivering', 'returning'] as const

export type SubscriptionSetLike = {
  id?: number | null
  status?: string | null
  toys?: unknown[] | null
  positions?: unknown[] | null
  delivery_task?: { id?: number | null; status?: string | null; address?: string | null } | null
  [key: string]: unknown
}

const asStatus = (set: SubscriptionSetLike | null | undefined): string =>
  String(set?.status || '').toLowerCase()

export const isHomeSet = (set: SubscriptionSetLike | null | undefined): boolean =>
  (HOME_SET_STATUSES as readonly string[]).includes(asStatus(set))

export const isNextSet = (set: SubscriptionSetLike | null | undefined): boolean =>
  (NEXT_SET_STATUSES as readonly string[]).includes(asStatus(set))

export const canCountToysInUse = (set: SubscriptionSetLike | null | undefined): boolean =>
  (TOYS_IN_USE_STATUSES as readonly string[]).includes(asStatus(set))

/** Never treat cancelled/returned as the home pointer, even if API leaked them. */
export const resolveHomeSet = (
  currentSet: SubscriptionSetLike | null | undefined,
): SubscriptionSetLike | null => (isHomeSet(currentSet) ? currentSet! : null)

/**
 * Prefer inbound (next) for delivery tracking; else home set for pickup.
 * Never track cancelled/returned leftovers.
 */
export const resolveTrackSet = (
  currentSet: SubscriptionSetLike | null | undefined,
  nextSet: SubscriptionSetLike | null | undefined,
): SubscriptionSetLike | null => {
  if (isNextSet(nextSet)) return nextSet!
  if (isHomeSet(currentSet)) return currentSet!
  return null
}

export const countSetToys = (set: SubscriptionSetLike | null | undefined): number => {
  if (!set) return 0
  if (Array.isArray(set.toys) && set.toys.length) return set.toys.length
  if (Array.isArray(set.positions) && set.positions.length) return set.positions.length
  return 0
}

/**
 * Prefer server toys_at_home when a real home set exists.
 * Without in_use|returning, always 0 — never count cancelled/returned/assembling.
 */
export const resolveToysInUse = (
  toysAtHome: unknown,
  homeSet: SubscriptionSetLike | null | undefined,
): number => {
  if (!isHomeSet(homeSet)) return 0

  if (toysAtHome != null && toysAtHome !== '') {
    const n = Number(toysAtHome)
    return Number.isFinite(n) && n > 0 ? Math.trunc(n) : 0
  }

  return countSetToys(homeSet)
}
