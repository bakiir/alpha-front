export type CompositionToyLike = {
  id?: number | string | null
  name?: string | null
  title?: string | null
  image?: string | null
  image_url?: string | null
  quantity?: number | null
  qty?: number | null
  composition_qty?: number | null
  line_quantity?: number | null
  pivot?: { quantity?: number | null } | null
}

export type ToyThumbSlots<T> = {
  visible: T[]
  overflow: number
}

/** Up to `maxVisible` cells; if more toys exist, last cell is reserved for +N. */
export function buildToyThumbSlots<T>(toys: T[], maxVisible = 5): ToyThumbSlots<T> {
  const list = Array.isArray(toys) ? toys : []
  const cap = Math.max(1, Math.floor(maxVisible))
  if (list.length <= cap) {
    return { visible: list.slice(), overflow: 0 }
  }
  const visibleCount = Math.max(1, cap - 1)
  return {
    visible: list.slice(0, visibleCount),
    overflow: list.length - visibleCount,
  }
}

export function toyDisplayName(toy: CompositionToyLike | null | undefined, fallback = 'Игрушка'): string {
  const name = (toy?.name || toy?.title || '').trim()
  return name || fallback
}

export function toyImageSrc(toy: CompositionToyLike | null | undefined): string {
  return (toy?.image || toy?.image_url || '').trim()
}

/** Composition/line quantity only — ignore inventory stock on the toy itself. */
export function toyCompositionQuantity(toy: CompositionToyLike | null | undefined): number | null {
  if (!toy) return null
  const raw =
    toy.composition_qty ??
    toy.line_quantity ??
    toy.qty ??
    toy.pivot?.quantity ??
    null
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) return null
  return Math.round(n)
}

/** Russian plural for «игрушка» after a count. */
export function formatToysCountLabel(count: number): string {
  const n = Math.max(0, Math.floor(Number(count) || 0))
  const mod100 = n % 100
  const mod10 = n % 10
  if (mod100 >= 11 && mod100 <= 14) return `${n} игрушек`
  if (mod10 === 1) return `${n} игрушка`
  if (mod10 >= 2 && mod10 <= 4) return `${n} игрушки`
  return `${n} игрушек`
}
