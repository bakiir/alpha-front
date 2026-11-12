const HTML_TAG = /<\s*\/?\s*[a-zA-Z][^>]*>/
const DANGEROUS_SCHEME = /(?:^|[\s'"([[])\s*(?:javascript|data\s*:\s*text\/html)\s*:/i
const JS_SCHEME = /\bjavascript\s*:/i
const EVENT_HANDLER = /\bon[a-z]+\s*=/i

/** Mirrors alpha_back App\Support\PlainText for client-side UX checks. */
export function containsMarkup(value: string): boolean {
  const text = value?.trim() ?? ''
  if (!text) return false
  if (HTML_TAG.test(text)) return true
  if (DANGEROUS_SCHEME.test(text) || JS_SCHEME.test(text)) return true
  if (EVENT_HANDLER.test(text)) return true
  return false
}

export function assertPlainText(value: string): void {
  if (containsMarkup(value)) {
    throw new Error('PLAIN_TEXT_MARKUP')
  }
}
