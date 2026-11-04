export interface RentalSlotOption {
  available?: boolean
  reason?: string | null
}

export interface ClosedRentalSlots {
  title: string
  body: string
}

const CLOSED_SLOT_COPY: Record<string, ClosedRentalSlots> = {
  'delivery:past_or_lead': {
    title: 'rental.deliverySlotsPassedTitle',
    body: 'rental.deliverySlotsPassed',
  },
  'delivery:non_working_day': {
    title: 'rental.nonWorkingDayTitle',
    body: 'rental.nonWorkingDay',
  },
  'delivery:slot_full': {
    title: 'rental.slotsFullTitle',
    body: 'rental.slotsFull',
  },
  'pickup:past_or_lead': {
    title: 'rental.pickupSlotsPassedTitle',
    body: 'rental.pickupSlotsPassed',
  },
  'pickup:non_working_day': {
    title: 'rental.nonWorkingDayTitle',
    body: 'rental.nonWorkingDay',
  },
  'pickup:slot_full': {
    title: 'rental.slotsFullTitle',
    body: 'rental.slotsFull',
  },
  'pickup:before_delivery_end': {
    title: 'rental.pickupBeforeDeliveryTitle',
    body: 'rental.pickupBeforeDelivery',
  },
}

const NO_OPEN_SLOTS: ClosedRentalSlots = {
  title: 'rental.noOpenSlotsTitle',
  body: 'rental.noOpenSlots',
}

function closedReason(slots: RentalSlotOption[] | null | undefined): string | null {
  if (!Array.isArray(slots) || slots.length === 0) return null
  if (slots.some((slot) => slot?.available !== false)) return null
  return slots.find((slot) => slot?.reason)?.reason || 'none'
}

/** Copy keys when every slot of a side is closed. Null while a side still has a choice or has not loaded. */
export function closedRentalSlots(
  deliverySlots: RentalSlotOption[] | null | undefined,
  pickupSlots: RentalSlotOption[] | null | undefined,
): ClosedRentalSlots | null {
  const delivery = closedReason(deliverySlots)
  if (delivery) return CLOSED_SLOT_COPY[`delivery:${delivery}`] || NO_OPEN_SLOTS
  const pickup = closedReason(pickupSlots)
  if (pickup) return CLOSED_SLOT_COPY[`pickup:${pickup}`] || NO_OPEN_SLOTS
  return null
}
