export interface EpayAuth {
  access_token: string
  expires_in?: number
  token_type?: string
  scope?: string
  [key: string]: unknown
}

export interface EpayPaymentObject {
  invoiceId: string
  backLink: string
  failureBackLink?: string
  postLink: string
  failurePostLink?: string
  language?: string
  description: string
  accountId?: string
  terminal: string
  amount: number
  currency: string
  phone?: string | null
  email?: string | null
  name?: string | null
  auth: EpayAuth
  [key: string]: unknown
}

export interface EpayLaunchPayload {
  mode: string
  payform_js_url: string
  payment: EpayPaymentObject
}

declare global {
  interface Window {
    halyk?: {
      pay: (paymentObject: EpayPaymentObject) => void
    }
  }
}

const loadPayformScript = (src: string): Promise<void> => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('ePay доступен только в браузере'))
  }

  const existing = document.querySelector<HTMLScriptElement>(`script[data-epay-payform="1"]`)
  if (existing && window.halyk?.pay) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Не удалось загрузить виджет ePay')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.dataset.epayPayform = '1'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Не удалось загрузить виджет ePay'))
    document.head.appendChild(script)
  })
}

export const useEpay = () => {
  const launchEpay = async (payload: EpayLaunchPayload) => {
    await loadPayformScript(payload.payform_js_url)

    // Script may need a tick to expose window.halyk
    for (let i = 0; i < 20; i++) {
      if (window.halyk?.pay) break
      await new Promise(r => setTimeout(r, 50))
    }

    if (!window.halyk?.pay) {
      throw new Error('Виджет Halyk ePay не инициализирован')
    }

    window.halyk.pay(payload.payment)
  }

  return { launchEpay }
}
