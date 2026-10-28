export const PAYMENT_RETURN_MESSAGE = 'alpha:payment:return' as const

/** ePay/Halyk payform often loads backLink inside an iframe — break out to the top window. */
export function ensurePaymentReturnTopWindow(): boolean {
  if (typeof window === 'undefined') return false

  try {
    if (window.self !== window.top) {
      window.top!.location.replace(window.location.href)
      return true
    }
  } catch {
    notifyPaymentReturnToParent()
  }

  return false
}

/** When top is cross-origin, ask our parent (checkout) to navigate the main window. */
export function notifyPaymentReturnToParent(): void {
  if (typeof window === 'undefined') return

  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        { type: PAYMENT_RETURN_MESSAGE, href: window.location.href },
        window.location.origin,
      )
    }
  } catch {
    // ignore
  }
}

export function handlePaymentReturnMessage(event: MessageEvent): void {
  if (typeof window === 'undefined') return
  if (event.origin !== window.location.origin) return
  if (event.source === window) return

  const data = event.data
  if (!data || typeof data !== 'object' || data.type !== PAYMENT_RETURN_MESSAGE) return

  const href = typeof data.href === 'string' ? data.href : ''
  if (!href || !href.startsWith(window.location.origin)) return

  window.location.href = href
}
