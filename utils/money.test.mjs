import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { formatMoneyAmount, roundMoney } from './money.ts'

describe('roundMoney', () => {
  it('removes float noise', () => {
    assert.equal(roundMoney(5000 - 1635.8), 3364.2)
    assert.equal(roundMoney(3364.2000000000007), 3364.2)
  })
})

describe('formatMoneyAmount', () => {
  it('formats integers with spacing', () => {
    assert.equal(formatMoneyAmount(15000), '15 000')
  })

  it('formats rounded decimals without float junk', () => {
    assert.equal(formatMoneyAmount(3364.2000000000007), '3 364.2')
  })
})
