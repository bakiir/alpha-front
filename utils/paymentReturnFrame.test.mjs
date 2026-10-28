import assert from 'node:assert/strict'
import test from 'node:test'
import { handlePaymentReturnMessage, PAYMENT_RETURN_MESSAGE } from './paymentReturnFrame.ts'

test('handlePaymentReturnMessage ignores foreign origins', () => {
  let navigated = false
  const original = globalThis.window
  globalThis.window = {
    location: {
      origin: 'http://localhost:3000',
      get href() {
        return 'http://localhost:3000/checkout'
      },
      set href(value) {
        navigated = value
      },
    },
  }

  handlePaymentReturnMessage({
    origin: 'https://evil.test',
    source: {},
    data: { type: PAYMENT_RETURN_MESSAGE, href: 'http://localhost:3000/payment/success' },
  })

  assert.equal(navigated, false)
  globalThis.window = original
})

test('handlePaymentReturnMessage navigates same-origin return href', () => {
  let navigated = false
  const original = globalThis.window
  globalThis.window = {
    location: {
      origin: 'http://localhost:3000',
      get href() {
        return 'http://localhost:3000/checkout'
      },
      set href(value) {
        navigated = value
      },
    },
  }

  handlePaymentReturnMessage({
    origin: 'http://localhost:3000',
    source: {},
    data: { type: PAYMENT_RETURN_MESSAGE, href: 'http://localhost:3000/payment/success?payment=PAY-1' },
  })

  assert.equal(navigated, 'http://localhost:3000/payment/success?payment=PAY-1')
  globalThis.window = original
})
