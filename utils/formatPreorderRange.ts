/** Parse promised preorder value into a local calendar Date (no timezone day-shift). */
export function parsePreorderCalendarDate(value?: string | null): Date | null {
  if (!value) return null
  const raw = String(value).trim()
  if (!raw) return null

  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) {
    const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    return Number.isNaN(date.getTime()) ? null : date
  }

  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? null : date
}

/** Format a promised preorder calendar date for display. */
export function formatPreorderDate(value?: string | null, locale = 'ru-RU'): string {
  const date = parsePreorderCalendarDate(value)
  if (!date) {
    const raw = value == null ? '' : String(value).trim()
    return raw
  }

  return date.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/** Format promised arrival/delivery range for UI (always earlier → later). */
export function formatPreorderRange(
  from?: string | null,
  to?: string | null,
  locale = 'ru-RU',
): string {
  const startDate = parsePreorderCalendarDate(from)
  const endDate = parsePreorderCalendarDate(to)

  let first = from
  let second = to
  if (startDate && endDate && startDate.getTime() > endDate.getTime()) {
    first = to
    second = from
  }

  const start = formatPreorderDate(first, locale)
  const end = formatPreorderDate(second, locale)
  if (start && end && start !== end) return `${start} – ${end}`
  return end || start || ''
}
