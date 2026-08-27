export interface RentalItem {
  id: number
  rental_number: string
  status: string
  start_date: string
  end_date: string
  daily_price: number
  total_price: number
  toy: any
  address: string
}

export const useRentals = () => {
  const { request } = useApi()

  const checkAvailability = async (toyId: number, startDate: string, endDate: string) => {
    return await request<{
      status: string
      available: boolean
      message?: string
      data?: {
        toy_id: number
        toy_name: string
        start_date: string
        end_date: string
        days_count: number
        daily_rate: number
        total_price: number
        deposit_amount: number
      }
    }>(`/rentals/check-availability?toy_id=${toyId}&start_date=${startDate}&end_date=${endDate}`)
  }

  const fetchMyRentals = async () => {
    return await request<{ status: string; data: RentalItem[] }>('/rentals')
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

  const cancelRental = async (rentalId: number) => {
    return await request<{ status: string; message: string }>(`/rentals/${rentalId}/cancel`, {
      method: 'POST',
    })
  }

  return {
    checkAvailability,
    fetchMyRentals,
    createRental,
    cancelRental,
  }
}
