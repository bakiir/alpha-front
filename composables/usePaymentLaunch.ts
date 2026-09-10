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

export const usePaymentLaunch = () => {
  const { launchEpay } = useEpay()

  /**
   * Handle unified pay API response: mock fulfill / demo page / Halyk payform.
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

  return { launchFromResponse }
}
