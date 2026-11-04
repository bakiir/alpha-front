import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { closedRentalSlots } from './rentalSlots.ts'

const open = { available: true, reason: null }
const passed = { available: false, reason: 'past_or_lead' }
const full = { available: false, reason: 'slot_full' }
const early = { available: false, reason: 'before_delivery_end' }

describe('closedRentalSlots', () => {
  it('stays quiet while slots are still loading or one side is open', () => {
    assert.equal(closedRentalSlots([], []), null)
    assert.equal(closedRentalSlots([open, passed], [open]), null)
    assert.equal(closedRentalSlots([open], [open]), null)
  })

  it('names a day whose delivery windows have already passed', () => {
    assert.deepEqual(closedRentalSlots([passed, passed], [open]), {
      title: 'rental.deliverySlotsPassedTitle',
      body: 'rental.deliverySlotsPassed',
    })
    assert.deepEqual(closedRentalSlots([open], [passed]), {
      title: 'rental.pickupSlotsPassedTitle',
      body: 'rental.pickupSlotsPassed',
    })
  })

  it('names a full day and a pickup that starts before delivery ends', () => {
    assert.equal(closedRentalSlots([full], [open])?.title, 'rental.slotsFullTitle')
    assert.equal(closedRentalSlots([open], [early])?.title, 'rental.pickupBeforeDeliveryTitle')
  })
})
