import type { PaymentLaunchResponse } from './usePaymentLaunch'

export interface RentalItem {
  id: number
  rental_number: string
  status: string
  status_label?: string
  start_date: string
  end_date: string
  days_count?: number
  daily_rate?: number
  total_price: number
  deposit_amount?: number
  delivery_address: string
  contact_phone: string
  notes?: string
  toy: any
  created_at?: string
}

export const useRentals = () => {
  const { request } = useApi()

  const fetchMyRentals = async () => {
    return await request<any>('/rentals')
  }

  const createRental = async (payload: {
    toy_id: number
    start_date: string
    end_date: string
    delivery_address: string
    contact_phone: string
    notes?: string
  }) => {
    return await request<{ status: string; message: string; data: RentalItem }>('/rentals', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  const payRental = async (rentalId: number, paymentMethod: string = 'card') => {
    return await request<PaymentLaunchResponse>(`/rentals/${rentalId}/pay`, {
      method: 'POST',
      body: JSON.stringify({ payment_method: paymentMethod }),
    })
  }

  const extendRental = async (rentalId: number, days: number, paymentMethod: string = 'card') => {
    return await request<PaymentLaunchResponse>(`/rentals/${rentalId}/extend`, {
      method: 'POST',
      body: JSON.stringify({ days, payment_method: paymentMethod }),
    })
  }

  const cancelRental = async (rentalId: number) => {
    return await request<{ status: string; message: string }>(`/rentals/${rentalId}/cancel`, {
      method: 'POST',
    })
  }

  return {
    fetchMyRentals,
    createRental,
    payRental,
    extendRental,
    cancelRental,
  }
}
