import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  resolveSelectedSubscriptionId,
  shouldApplyResponse,
  filterSwitchableSubscriptions,
  parseSubscriptionIdParam,
  buildFamilySwitcherEntries,
} from './subscriptionSelection.ts'

describe('parseSubscriptionIdParam', () => {
  it('parses positive integers from string/number/array', () => {
    assert.equal(parseSubscriptionIdParam('12'), 12)
    assert.equal(parseSubscriptionIdParam(7), 7)
    assert.equal(parseSubscriptionIdParam(['9']), 9)
  })

  it('rejects invalid values', () => {
    assert.equal(parseSubscriptionIdParam(null), null)
    assert.equal(parseSubscriptionIdParam(''), null)
    assert.equal(parseSubscriptionIdParam('abc'), null)
    assert.equal(parseSubscriptionIdParam(0), null)
    assert.equal(parseSubscriptionIdParam(-3), null)
  })
})

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

  it('selects preferred child subscription among many active ones', () => {
    const many = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      status: 'active',
    }))
    assert.equal(resolveSelectedSubscriptionId(many, 5), 5)
    assert.equal(resolveSelectedSubscriptionId(many, null), 1)
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

describe('buildFamilySwitcherEntries', () => {
  it('lists subscriptions, children without sub, and add-child action', () => {
    const entries = buildFamilySwitcherEntries(
      [
        { id: 10, status: 'active', child: { id: 1, name: 'Алиса' } },
        { id: 11, status: 'pending_payment', child: { id: 2, name: 'Борис' } },
      ],
      [
        { id: 1, name: 'Алиса' },
        { id: 3, name: 'Вика' },
      ],
    )
    assert.equal(entries.length, 4)
    assert.equal(entries[0].kind, 'subscription')
    assert.equal(entries[0].subscriptionId, 10)
    assert.equal(entries[2].kind, 'child_no_sub')
    assert.equal(entries[2].childId, 3)
    assert.equal(entries[3].kind, 'add_child')
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
