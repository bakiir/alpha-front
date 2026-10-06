/** Resolve max purchasable qty for a cart line. `null` = no known cap. */
export function cartLineMaxQuantity(opts: {
  isPreorder?: boolean | null
  availableQuantity?: number | null
}): number | null {
  const raw = opts.availableQuantity
  if (raw == null || !Number.isFinite(Number(raw))) return null
  const max = Math.floor(Number(raw))
  if (max < 0) return null
  // Preorder may pass limit_remaining via availableQuantity; stock uses warehouse qty.
  return max
}

export function clampCartQuantity(quantity: number, max: number | null): number {
  const qty = Math.floor(Number(quantity))
  if (!Number.isFinite(qty) || qty <= 0) return 0
  if (max == null) return qty
  return Math.min(qty, Math.max(0, max))
}

export function canIncreaseCartQuantity(current: number, max: number | null): boolean {
  if (max == null) return true
  return Math.floor(Number(current) || 0) < max
}

export function remainingCartCapacity(opts: {
  inCart: number
  isPreorder?: boolean | null
  availableQuantity?: number | null
}): number | null {
  const max = cartLineMaxQuantity(opts)
  if (max == null) return null
  return Math.max(0, max - Math.max(0, Math.floor(Number(opts.inCart) || 0)))
}
