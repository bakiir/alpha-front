import type { EpayLaunchPayload } from './useEpay'

export interface PaymentLaunchResponse {
  status: string
  message: string
  data?: any
  payment?: {
    payment_number: string
    provider: string
    status: string
    amount: number | string
    flow?: string | null
  }
  fulfilled?: boolean
  epay?: EpayLaunchPayload
  demo?: {
    mode: string
    payment_url: string
  }
}

export type PaymentLaunchOutcome = 'fulfilled' | 'demo' | 'epay'

export interface HandlePayResponseOptions {
  /** Called only when money is already confirmed (mock / zero / gift cover). */
  onFulfilled?: (payRes: PaymentLaunchResponse) => void | Promise<void>
  /** Toast / hint before leaving to demo or Halyk. */
  onRedirect?: (outcome: 'demo' | 'epay', payRes: PaymentLaunchResponse) => void | Promise<void>
}

export const usePaymentLaunch = () => {
  const { launchEpay } = useEpay()

  /**
   * Low-level: open demo page or Halyk payform from API response.
   */
  const launchFromResponse = async (
    payRes: PaymentLaunchResponse,
  ): Promise<PaymentLaunchOutcome> => {
    if (payRes?.fulfilled) {
      return 'fulfilled'
    }

    if (payRes?.demo?.payment_url) {
      await navigateSameOrigin(payRes.demo.payment_url)
      return 'demo'
    }

    if (payRes?.epay) {
      await launchEpay(payRes.epay)
      return 'epay'
    }

    throw new Error(payRes?.message || 'Не удалось открыть оплату')
  }

  /**
   * Preferred entry: local success only via onFulfilled.
   * Never treat demo/epay redirect as paid.
   */
  const handlePayResponse = async (
    payRes: PaymentLaunchResponse,
    options: HandlePayResponseOptions = {},
  ): Promise<PaymentLaunchOutcome> => {
    if (!payRes?.fulfilled && (payRes?.demo || payRes?.epay)) {
      await options.onRedirect?.(payRes.demo ? 'demo' : 'epay', payRes)
    }

    const outcome = await launchFromResponse(payRes)

    if (outcome === 'fulfilled') {
      await options.onFulfilled?.(payRes)
    }

    return outcome
  }

  return { launchFromResponse, handlePayResponse }
}
