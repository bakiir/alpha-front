export const usePayments = () => {
  const { request } = useApi()

  const fetchPayment = async (paymentNumber: string) => {
    return await request<{
      status: string
      payment: {
        payment_number: string
        provider: string
        status: string
        amount: number | string
        paid_at?: string | null
        flow?: string | null
        meta?: Record<string, unknown>
      }
      data: any
    }>(`/payments/${encodeURIComponent(paymentNumber)}`)
  }

  const syncPayment = async (hints: {
    payment: string
    invoice_id?: string
    confirm?: string
  }) => {
    return await request<{
      status: string
      synced: boolean
      epay_result_code: string | null
      method?: string | null
      payment: {
        payment_number: string
        provider: string
        status: string
        amount: number | string
        paid_at?: string | null
        flow?: string | null
        meta?: Record<string, unknown>
      } | null
      data: any
    }>('/payments/sync', {
      method: 'POST',
      body: JSON.stringify(hints),
    })
  }

  return { fetchPayment, syncPayment }
}
