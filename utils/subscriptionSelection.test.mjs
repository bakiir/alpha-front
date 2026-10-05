import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  resolveSelectedSubscriptionId,
  shouldApplyResponse,
  filterSwitchableSubscriptions,
} from './subscriptionSelection.ts'

describe('resolveSelectedSubscriptionId', () => {
  const list = [
    { id: 1, status: 'active' },
    { id: 2, status: 'paused' },
    { id: 3, status: 'pending_payment' },
    { id: 4, status: 'cancelled' },
  ]

  it('keeps previous id when still switchable', () => {
    assert.equal(resolveSelectedSubscriptionId(list, 3), 3)
    assert.equal(resolveSelectedSubscriptionId(list, 2), 2)
  })

  it('falls back to first manageable when previous missing', () => {
    assert.equal(resolveSelectedSubscriptionId(list, 99), 1)
    assert.equal(resolveSelectedSubscriptionId(list, null), 1)
  })

  it('falls back to first pending when no manageable', () => {
    const pendingOnly = [
      { id: 10, status: 'cancelled' },
      { id: 11, status: 'pending_payment' },
    ]
    assert.equal(resolveSelectedSubscriptionId(pendingOnly, null), 11)
  })

  it('returns null when nothing switchable', () => {
    assert.equal(resolveSelectedSubscriptionId([{ id: 1, status: 'cancelled' }], 1), null)
  })
})

describe('shouldApplyResponse', () => {
  it('applies only when ids match', () => {
    assert.equal(shouldApplyResponse(5, 5), true)
    assert.equal(shouldApplyResponse(5, 6), false)
    assert.equal(shouldApplyResponse(null, 5), false)
    assert.equal(shouldApplyResponse(5, null), false)
  })
})

describe('filterSwitchableSubscriptions', () => {
  it('includes active, paused, overdue, suspended, pending_payment', () => {
    const ids = filterSwitchableSubscriptions([
      { id: 1, status: 'active' },
      { id: 2, status: 'paused' },
      { id: 3, status: 'pending_payment' },
      { id: 5, status: 'overdue' },
      { id: 6, status: 'suspended' },
      { id: 4, status: 'cancelled' },
    ]).map(item => item.id)
    assert.deepEqual(ids, [1, 2, 3, 5, 6])
  })
})
