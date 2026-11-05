import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  historyDisplayNumber,
  rentalCompactStatus,
  rentalDeliverySlotLabel,
  rentalNearestEvent,
  orderHistoryTitle,
} from './profileHistoryDisplay.ts'

describe('profileHistoryDisplay', () => {
  it('shortens rental number tail', () => {
    assert.equal(historyDisplayNumber('RNT-2026-00026', 1), '00026')
  })

  it('maps active rental to compact status', () => {
    assert.equal(rentalCompactStatus({ status: 'active', delivery_address: '', contact_phone: '' }), 'У вас')
  })

  it('builds return-today event', () => {
    const rental = {
      status: 'active',
      start_date: '2026-11-01',
      end_date: new Date().toISOString().slice(0, 10),
      delivery_address: '',
      contact_phone: '',
      total_price: 1000,
      rental_number: 'RNT-1',
      schedule: { has_time_windows: true, time_status: 'ok', pickup_label: '16:00–19:00', timezone: 'Asia/Almaty' },
    }
    const ev = rentalNearestEvent(rental, new Date())
    assert.match(ev.text, /Возврат сегодня/)
    assert.equal(ev.urgent, true)
  })

  it('formats delivery slot without address noise', () => {
    const label = rentalDeliverySlotLabel({
      status: 'reserved',
      start_date: '2026-11-06',
      end_date: '2026-11-08',
      delivery_address: 'Almaty long address',
      contact_phone: '',
      total_price: 1,
      rental_number: 'RNT-1',
      schedule: { has_time_windows: true, time_status: 'ok', delivery_label: '09:00–10:00', timezone: 'Asia/Almaty' },
    })
    assert.match(label, /6 нояб/)
    assert.match(label, /09:00/)
    assert.doesNotMatch(label, /Almaty/)
  })

  it('summarizes multi-item order title', () => {
    const title = orderHistoryTitle({
      items: [{ title: 'A', quantity: 1 }, { title: 'B', quantity: 1 }],
    })
    assert.equal(title, 'Заказ · 2 товаров')
  })
})
