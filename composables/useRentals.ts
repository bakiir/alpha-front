import type { PaymentLaunchResponse } from './usePaymentLaunch'

export interface RentalPickup {
  id: number
  status: string
  scheduled_time: string | null
  scheduled_date?: string | null
  address: string | null
  slot_key: string | null
  slot_label: string | null
}

export interface RentalReturnSlot {
  key: string
  label: string
  start_hour: number
  end_hour: number
  available?: boolean
  reason?: string | null
}

export interface RentalReturnOptions {
  can_request: boolean
  can_reschedule: boolean
  earliest_date: string
  latest_date: string
  planned_end_date: string
  early_return_allowed: boolean
  slots: RentalReturnSlot[]
  dates: string[]
  current_pickup: RentalPickup | null
}

export interface RentalScheduleApi {
  has_time_windows: boolean
  time_status: string
  time_status_label: string | null
  delivery_slot_key: string | null
  pickup_slot_key: string | null
  delivery_label: string | null
  pickup_label: string | null
  delivery_window_start: string | null
  delivery_window_end: string | null
  pickup_window_start: string | null
  pickup_window_end: string | null
  guaranteed_from: string | null
  guaranteed_until: string | null
  confirmation_copy: string | null
  timezone: string
}

export interface RentalItem {
  id: number
  rental_number: string
  status: string
  status_label?: string
  start_date: string
  end_date: string
  actual_returned_at?: string | null
  days_count?: number
  overdue_days?: number
  daily_rate?: number
  total_price: number
  deposit_amount?: number
  delivery_address: string
  contact_phone: string
  notes?: string
  can_request_return?: boolean
  can_reschedule_return?: boolean
  can_extend?: boolean
  can_cancel?: boolean
  pickup?: RentalPickup | null
  schedule?: RentalScheduleApi
  delivery_slot_key?: string | null
  pickup_slot_key?: string | null
  guaranteed_from?: string | null
  guaranteed_until?: string | null
  confirmation_copy?: string | null
  time_status_label?: string | null
  toy: any
  created_at?: string
}

export interface ScheduleOptionsData {
  enabled: boolean
  timezone: string
  slots: RentalReturnSlot[]
  delivery_slots: RentalReturnSlot[]
  pickup_slots: RentalReturnSlot[]
  guarantee: {
    from: string
    until: string
    copy: string
    delivery_label: string
    pickup_label: string
  } | null
  unavailable_reason: string | null
  pricing: {
    days_count: number
    daily_rate: number
    total_price: number
    deposit_amount: number
  } | null
}

export const useRentals = () => {
  const { request } = useApi()

  const fetchMyRentals = async () => {
    return await request<any>('/rentals')
  }

  const fetchRental = async (rentalId: number) => {
    return await request<RentalItem>(`/rentals/${rentalId}`)
  }

  const fetchScheduleOptions = async (params: {
    toy_id?: number
    start_date: string
    end_date: string
    delivery_slot?: string
    pickup_slot?: string
  }) => {
    const q = new URLSearchParams()
    if (params.toy_id) q.set('toy_id', String(params.toy_id))
    q.set('start_date', params.start_date)
    q.set('end_date', params.end_date)
    if (params.delivery_slot) q.set('delivery_slot', params.delivery_slot)
    if (params.pickup_slot) q.set('pickup_slot', params.pickup_slot)
    return await request<{ status: string; data: ScheduleOptionsData }>(
      `/rentals/schedule-options?${q.toString()}`,
    )
  }

  const checkAvailability = async (params: {
    toy_id: number
    start_date: string
    end_date: string
    delivery_slot?: string
    pickup_slot?: string
  }) => {
    const q = new URLSearchParams({
      toy_id: String(params.toy_id),
      start_date: params.start_date,
      end_date: params.end_date,
    })
    if (params.delivery_slot) q.set('delivery_slot', params.delivery_slot)
    if (params.pickup_slot) q.set('pickup_slot', params.pickup_slot)
    return await request<any>(`/rentals/check-availability?${q.toString()}`)
  }

  const createRental = async (payload: {
    toy_id: number
    start_date: string
    end_date: string
    delivery_address: string
    contact_phone: string
    notes?: string
    delivery_slot?: string
    pickup_slot?: string
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

  const extendRental = async (
    rentalId: number,
    days: number,
    paymentMethod: string = 'card',
    pickupSlot?: string,
  ) => {
    return await request<PaymentLaunchResponse>(`/rentals/${rentalId}/extend`, {
      method: 'POST',
      body: JSON.stringify({
        days,
        payment_method: paymentMethod,
        ...(pickupSlot ? { pickup_slot: pickupSlot } : {}),
      }),
    })
  }

  const cancelRental = async (rentalId: number) => {
    return await request<{ status: string; message: string; data?: RentalItem }>(`/rentals/${rentalId}/cancel`, {
      method: 'POST',
    })
  }

  const fetchReturnOptions = async (rentalId: number) => {
    return await request<{ status: string; data: RentalReturnOptions }>(
      `/rentals/${rentalId}/return-options`,
    )
  }

  const requestReturn = async (
    rentalId: number,
    payload: { date: string; slot: string; address?: string },
  ) => {
    return await request<{
      status: string
      message: string
      data: RentalItem
      pickup: RentalPickup
    }>(`/rentals/${rentalId}/request-return`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  const rescheduleReturn = async (
    rentalId: number,
    payload: { date: string; slot: string },
  ) => {
    return await request<{
      status: string
      message: string
      data: RentalItem
      pickup: RentalPickup
    }>(`/rentals/${rentalId}/reschedule-return`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  return {
    fetchMyRentals,
    fetchRental,
    fetchScheduleOptions,
    checkAvailability,
    createRental,
    payRental,
    extendRental,
    cancelRental,
    fetchReturnOptions,
    requestReturn,
    rescheduleReturn,
  }
}
