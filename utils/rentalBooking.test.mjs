import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  collapseRepeatedLocality,
  presentRentalAddress,
  rentalStayLabel,
  slotsClosedByCalendar,
} from './rentalBooking.ts'

describe('rental address', () => {
  it('drops a city that was prepended again and again', () => {
    assert.equal(
      collapseRepeatedLocality('Алматы, Алматы, Алматы, Алматы, пр. Абая, 150'),
      'Алматы, пр. Абая, 150',
    )
  })

  it('keeps the street line and lifts apartment details', () => {
    assert.deepEqual(
      presentRentalAddress('Алматы, Алматы, пр. Абая, 150, кв. 12, этаж 4'),
      { line: 'Алматы, пр. Абая, 150', details: 'кв. 12 · этаж 4' },
    )
  })
})

describe('rental stay label', () => {
  it('counts both endpoint days inside one month', () => {
    assert.equal(rentalStayLabel('2026-11-04', '2026-11-06', 3, 'ru'), '4–6 ноября · 3 оплачиваемых дня')
    assert.equal(rentalStayLabel('2026-11-04', '2026-11-04', 1, 'ru'), '4 ноября · 1 оплачиваемый день')
  })
})

describe('slotsClosedByCalendar', () => {
  it('is true only when every slot is already past or the day is closed', () => {
    assert.equal(slotsClosedByCalendar([{ available: false, reason: 'past_or_lead' }]), true)
    assert.equal(slotsClosedByCalendar([{ available: false, reason: 'slot_full' }]), false)
    assert.equal(slotsClosedByCalendar([{ available: true, reason: null }]), false)
  })
})
