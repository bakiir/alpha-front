export type GiftCardDeadlineSource = {
  can_activate?: boolean | null
  activation_deadline?: {
    local?: string | null
    local_label?: string | null
    timezone?: string | null
  } | null
  expires_at?: string | null
}

export type GiftCardDeadline = {
  kind: 'activation' | 'balance'
  /** Already localized date ("16 ноября 2026, 20:45"). */
  date: string
  timezone: string | null
}

const LOCAL_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/

// Browser ICU builds often lack Kazakh month names and print "2026 M11 16".
const KK_MONTHS = ['қаңтар', 'ақпан', 'наурыз', 'сәуір', 'мамыр', 'маусым', 'шілде', 'тамыз', 'қыркүйек', 'қазан', 'қараша', 'желтоқсан']

/**
 * Formats API wall-clock values ("2026-11-16 20:45:02" or "2027-10-17") without
 * shifting them into the browser timezone.
 */
export function formatGiftDate(value: string | null | undefined, locale: string): string | null {
  const match = value ? LOCAL_DATE_RE.exec(value.trim()) : null
  if (!match) return null

  const [, y, mo, d, hh, mm] = match
  const dayText = locale.toLowerCase().startsWith('kk')
    ? `${Number(d)} ${KK_MONTHS[Number(mo) - 1]} ${y}`
    : new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)))).replace(/\s?г\.$/u, '')

  return hh ? `${dayText}, ${hh}:${mm}` : dayText
}

/**
 * Activation window applies only until the first use; after that the card lives
 * until its balance expiry (`expires_at`).
 */
export function resolveGiftCardDeadline(card: GiftCardDeadlineSource | null | undefined, locale: string): GiftCardDeadline | null {
  if (!card) return null

  const activation = card.activation_deadline
  if (card.can_activate !== false && activation) {
    const date = formatGiftDate(activation.local, locale) || activation.local_label || null
    if (date) {
      return {
        kind: 'activation',
        date,
        timezone: activation.local ? (activation.timezone || null) : null,
      }
    }
  }

  const balanceDate = formatGiftDate(card.expires_at, locale)
  return balanceDate ? { kind: 'balance', date: balanceDate, timezone: null } : null
}
