export function addIsoDays(iso: string, days: number): string {
  const date = new Date(`${iso}T12:00:00`)
  date.setDate(date.getDate() + days)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function collapseRepeatedLocality(raw: string): string {
  const parts = raw.split(',').map((part) => part.trim()).filter(Boolean)
  const norm = (part: string) => part.replace(/^г\.?\s*/i, '').toLowerCase()
  const out: string[] = []
  for (const part of parts) {
    const key = norm(part)
    if (!key) continue
    if (out.length && key === norm(out[out.length - 1])) continue
    if (out.length && key === norm(out[0]) && !/\d/.test(part)) continue
    out.push(part)
  }
  return out.join(', ')
}

const DETAIL_PART = /^(?:кв\.?|квартира|подъезд|этаж|домофон)(?=\s|$)/i

export function presentRentalAddress(raw: string): { line: string; details: string } {
  const parts = collapseRepeatedLocality(raw).split(',').map((part) => part.trim()).filter(Boolean)
  const main: string[] = []
  const details: string[] = []
  for (const part of parts) {
    if (DETAIL_PART.test(part)) details.push(part)
    else main.push(part)
  }
  return { line: main.join(', '), details: details.join(' · ') }
}

export function rentalDateRange(start: string, end: string, locale: string): string {
  const loc = locale === 'kk' ? 'kk-KZ' : locale === 'en' ? 'en-GB' : 'ru-RU'
  const from = new Date(`${start}T12:00:00`)
  const to = new Date(`${end}T12:00:00`)
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return ''
  const withMonth = new Intl.DateTimeFormat(loc, { day: 'numeric', month: 'long' })
  if (from.getFullYear() === to.getFullYear() && from.getMonth() === to.getMonth() && from.getDate() === to.getDate()) {
    return withMonth.format(from)
  }
  if (from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear()) {
    const monthName = withMonth.format(to).replace(/^\d+\s*/, '')
    return `${from.getDate()}–${to.getDate()} ${monthName}`
  }
  const full = new Intl.DateTimeFormat(loc, { day: 'numeric', month: 'long' })
  return `${full.format(from)} – ${full.format(to)}`
}

function ruPlural(count: number, one: string, few: string, many: string): string {
  const mod100 = Math.abs(count) % 100
  const mod10 = mod100 % 10
  if (mod100 > 10 && mod100 < 20) return many
  if (mod10 === 1) return one
  if (mod10 >= 2 && mod10 <= 4) return few
  return many
}

export function rentalDaysPhrase(count: number, locale: string): string {
  if (locale === 'en') return count === 1 ? '1 day' : `${count} days`
  if (locale === 'kk') return `${count} күн`
  return `${count} ${ruPlural(count, 'день', 'дня', 'дней')}`
}

export function paidDaysPhrase(count: number, locale: string): string {
  if (locale === 'en') return count === 1 ? '1 paid day' : `${count} paid days`
  if (locale === 'kk') return `${count} ақылы күн`
  const adjective = ruPlural(count, 'оплачиваемый', 'оплачиваемых', 'оплачиваемых')
  const noun = ruPlural(count, 'день', 'дня', 'дней')
  return `${count} ${adjective} ${noun}`
}

export function rentalStayLabel(start: string, end: string, days: number, locale: string): string {
  const range = rentalDateRange(start, end, locale)
  if (!range) return ''
  return `${range} · ${paidDaysPhrase(days, locale)}`
}

export function slotsClosedByCalendar(slots: { available?: boolean; reason?: string | null }[] | null | undefined): boolean {
  if (!Array.isArray(slots) || slots.length === 0) return false
  return slots.every((slot) => slot?.available === false && (slot.reason === 'past_or_lead' || slot.reason === 'non_working_day'))
}
