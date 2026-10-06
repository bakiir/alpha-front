import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  canTrackOrderDelivery,
  lifecycleFromDeliveryTask,
  resolveOrderLifecycleLabel,
  resolveOrderLifecycleStatus,
  trackerStepFromLifecycle,
  trackerStep2Label,
  trackerTitleFromLifecycle,
} from './orderLifecycle.ts'

describe('orderLifecycle', () => {
  it('prefers API lifecycle_status and lifecycle_label', () => {
    const order = {
      status: 'paid',
      lifecycle_status: 'assembling',
      lifecycle_label: 'Собираем заказ',
    }
    assert.equal(resolveOrderLifecycleStatus(order), 'assembling')
    assert.equal(resolveOrderLifecycleLabel(order), 'Собираем заказ')
  })

  it('does not treat assigned courier as in transit', () => {
    assert.equal(
      lifecycleFromDeliveryTask({ status: 'assigned', warehouse_picked_up_at: null }),
      'ready_for_handoff',
    )
    assert.equal(trackerStepFromLifecycle('ready_for_handoff'), 2)
    assert.equal(trackerStep2Label('ready_for_handoff'), 'Готов к передаче')
    assert.equal(trackerTitleFromLifecycle('ready_for_handoff'), 'Готов к передаче курьеру')
  })

  it('maps warehouse pickup and in_progress correctly', () => {
    assert.equal(
      lifecycleFromDeliveryTask({ status: 'assigned', warehouse_picked_up_at: '2026-10-06T12:00:00Z' }),
      'handed_to_courier',
    )
    assert.equal(lifecycleFromDeliveryTask({ status: 'picked_up' }), 'handed_to_courier')
    assert.equal(lifecycleFromDeliveryTask({ status: 'in_progress' }), 'in_transit')
    assert.equal(trackerStepFromLifecycle('in_transit'), 3)
  })

  it('falls back for stock paid without lifecycle field', () => {
    assert.equal(
      resolveOrderLifecycleStatus({ status: 'paid', payment_status: 'paid', fulfillment_mode: 'stock' }),
      'awaiting_assembly',
    )
    assert.equal(
      resolveOrderLifecycleLabel({ status: 'shipped', payment_status: 'paid' }),
      'Передан курьеру',
    )
  })

  it('tracks only when process is in assembly/delivery pipeline', () => {
    assert.equal(
      canTrackOrderDelivery({
        status: 'paid',
        lifecycle_status: 'awaiting_gift_claim',
        delivery_task: { id: 1 },
      }),
      false,
    )
    assert.equal(
      canTrackOrderDelivery({
        status: 'paid',
        lifecycle_status: 'assembling',
        delivery_task: { id: 1 },
      }),
      true,
    )
    assert.equal(
      canTrackOrderDelivery({
        status: 'delivered',
        lifecycle_status: 'delivered',
        delivery_task: { id: 1 },
      }),
      false,
    )
  })
})
