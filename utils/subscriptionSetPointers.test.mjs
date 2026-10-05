import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  resolveHomeSet,
  resolveTrackSet,
  resolveToysInUse,
  canCountToysInUse,
} from './subscriptionSetPointers.ts'

describe('resolveHomeSet', () => {
  it('keeps in_use and returning', () => {
    assert.equal(resolveHomeSet({ id: 1, status: 'in_use' })?.id, 1)
    assert.equal(resolveHomeSet({ id: 2, status: 'returning' })?.id, 2)
  })

  it('rejects cancelled, returned, assembling, delivering', () => {
    assert.equal(resolveHomeSet({ id: 3, status: 'cancelled' }), null)
    assert.equal(resolveHomeSet({ id: 4, status: 'returned' }), null)
    assert.equal(resolveHomeSet({ id: 5, status: 'assembling' }), null)
    assert.equal(resolveHomeSet({ id: 6, status: 'delivering' }), null)
    assert.equal(resolveHomeSet(null), null)
  })
})

describe('resolveToysInUse', () => {
  it('trusts server toys_at_home for home sets', () => {
    assert.equal(resolveToysInUse(3, { id: 1, status: 'in_use', toys: [{}, {}] }), 3)
    assert.equal(resolveToysInUse(0, { id: 1, status: 'returning', toys: [{}, {}] }), 0)
  })

  it('never counts cancelled toys even if toys_at_home is stale', () => {
    const cancelled = { id: 9, status: 'cancelled', toys: [{}, {}, {}] }
    assert.equal(resolveToysInUse(3, cancelled), 0)
    assert.equal(resolveToysInUse(null, cancelled), 0)
  })

  it('counts in_use toys only as client fallback', () => {
    assert.equal(resolveToysInUse(null, { id: 1, status: 'in_use', toys: [{}, {}] }), 2)
    assert.equal(resolveToysInUse(null, { id: 1, status: 'delivering', toys: [{}, {}] }), 0)
  })
})

describe('resolveTrackSet', () => {
  it('prefers inbound next over home current', () => {
    const current = { id: 1, status: 'in_use' }
    const next = { id: 2, status: 'assembling' }
    assert.equal(resolveTrackSet(current, next)?.id, 2)
  })

  it('never tracks cancelled leftovers', () => {
    assert.equal(resolveTrackSet({ id: 1, status: 'cancelled' }, null), null)
    assert.equal(
      resolveTrackSet({ id: 1, status: 'cancelled' }, { id: 2, status: 'assembling' })?.id,
      2,
    )
  })
})

describe('canCountToysInUse', () => {
  it('allows only lifecycle statuses', () => {
    assert.equal(canCountToysInUse({ status: 'in_use' }), true)
    assert.equal(canCountToysInUse({ status: 'returning' }), true)
    assert.equal(canCountToysInUse({ status: 'delivering' }), true)
    assert.equal(canCountToysInUse({ status: 'cancelled' }), false)
    assert.equal(canCountToysInUse({ status: 'assembling' }), false)
  })
})
