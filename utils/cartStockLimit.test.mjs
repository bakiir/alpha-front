import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  canIncreaseCartQuantity,
  cartLineMaxQuantity,
  clampCartQuantity,
  remainingCartCapacity,
} from './cartStockLimit.ts'

describe('cartStockLimit', () => {
  it('resolves max from available quantity', () => {
    assert.equal(cartLineMaxQuantity({ availableQuantity: 3 }), 3)
    assert.equal(cartLineMaxQuantity({ availableQuantity: 3.9 }), 3)
    assert.equal(cartLineMaxQuantity({ availableQuantity: 0 }), 0)
    assert.equal(cartLineMaxQuantity({ availableQuantity: null }), null)
    assert.equal(cartLineMaxQuantity({}), null)
  })

  it('clamps quantity to stock and removes when max is 0', () => {
    assert.equal(clampCartQuantity(5, 3), 3)
    assert.equal(clampCartQuantity(2, 5), 2)
    assert.equal(clampCartQuantity(4, null), 4)
    assert.equal(clampCartQuantity(0, 5), 0)
    assert.equal(clampCartQuantity(2, 0), 0)
  })

  it('blocks increase at stock ceiling', () => {
    assert.equal(canIncreaseCartQuantity(2, 3), true)
    assert.equal(canIncreaseCartQuantity(3, 3), false)
    assert.equal(canIncreaseCartQuantity(10, null), true)
  })

  it('computes remaining capacity', () => {
    assert.equal(remainingCartCapacity({ inCart: 2, availableQuantity: 5 }), 3)
    assert.equal(remainingCartCapacity({ inCart: 5, availableQuantity: 5 }), 0)
    assert.equal(remainingCartCapacity({ inCart: 1, availableQuantity: null }), null)
  })
})
