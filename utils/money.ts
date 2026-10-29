/** Round to 2 decimal places (avoids float noise in UI). */
export function roundMoney(amount: number): number {
  if (!Number.isFinite(amount)) return 0
  return Math.round(amount * 100) / 100
}

/** Format tenge for display: thousands separated by spaces, up to 2 decimals when needed. */
export function formatMoneyAmount(val: number | string | null | undefined): string {
  let num: number
  if (typeof val === 'number') {
    num = roundMoney(val)
  } else {
    num = parseInt(String(val ?? '0').replace(/\D/g, ''), 10) || 0
  }

  const fixed = num.toFixed(2).replace(/\.?0+$/, '')
  const [intPart, decPart] = fixed.split('.')
  const spaced = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return decPart !== undefined ? `${spaced}.${decPart}` : spaced
}
