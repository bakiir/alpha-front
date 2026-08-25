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
    fetchMyRentals,
    createRental,
    cancelRental,
  }
}
