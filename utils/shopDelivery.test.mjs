import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  normalizeShopPricing,
  shopDeliveryFee,
  SHOP_DELIVERY_FEE_DEFAULT,
  SHOP_FREE_DELIVERY_THRESHOLD_DEFAULT,
} from './shopDelivery.ts'

describe('shopDeliveryFee', () => {
  it('defaults match backend product knobs', () => {
    assert.equal(SHOP_DELIVERY_FEE_DEFAULT, 1200)
    assert.equal(SHOP_FREE_DELIVERY_THRESHOLD_DEFAULT, 15000)
  })

  it('charges fee below free threshold', () => {
    const pricing = normalizeShopPricing(null)
    assert.equal(shopDeliveryFee(7900, pricing), 1200)
    assert.equal(shopDeliveryFee(14999, pricing), 1200)
  })

  it('waives fee at and above free threshold', () => {
    const pricing = normalizeShopPricing(null)
    assert.equal(shopDeliveryFee(15000, pricing), 0)
    assert.equal(shopDeliveryFee(20000, pricing), 0)
  })

  it('skips fee for empty cart or digital gift', () => {
    const pricing = normalizeShopPricing(null)
    assert.equal(shopDeliveryFee(5000, pricing, { hasItems: false }), 0)
    assert.equal(shopDeliveryFee(5000, pricing, { requiresDelivery: false }), 0)
  })

  it('respects zero configured fee', () => {
    const pricing = normalizeShopPricing({ delivery_fee: 0, free_delivery_threshold: 15000 })
    assert.equal(shopDeliveryFee(5000, pricing), 0)
  })
})
