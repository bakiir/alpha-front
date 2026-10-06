import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  BUY_NOW_STORAGE_KEY,
  readBuyNowItems,
  writeBuyNowItems,
} from './buyNowStorage.ts'

const createMemoryStorage = () => {
  const map = new Map()
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => { map.set(key, String(value)) },
    removeItem: (key) => { map.delete(key) },
    _map: map,
  }
}

describe('buyNowStorage', () => {
  it('round-trips a buy-now item across reload-like read', () => {
    const storage = createMemoryStorage()
    const item = {
      id: 42,
      title: 'Конструктор',
      price: 12900,
      quantity: 2,
      image: '/toys/42.jpg',
      isGiftPackaging: true,
    }

    writeBuyNowItems(storage, [item])
    assert.ok(storage.getItem(BUY_NOW_STORAGE_KEY))

    const restored = readBuyNowItems(storage)
    assert.deepEqual(restored, [{
      id: 42,
      title: 'Конструктор',
      price: 12900,
      quantity: 2,
      image: '/toys/42.jpg',
      subtitle: null,
      isGiftPackaging: true,
      giftBoxId: null,
      isPreorder: false,
      promisedArrivalFrom: null,
      promisedArrivalTo: null,
      promisedDeliveryFrom: null,
      promisedDeliveryTo: null,
      preorderNote: null,
      batchId: null,
    }])
  })

  it('preserves cart subtitle across reload-like read', () => {
    const storage = createMemoryStorage()
    writeBuyNowItems(storage, [{
      id: 7,
      title: 'Пирамидка',
      price: 5900,
      quantity: 1,
      image: '/toys/7.jpg',
      subtitle: 'Возраст: 1–3 года • Бук',
    }])

    const restored = readBuyNowItems(storage)
    assert.equal(restored?.[0]?.subtitle, 'Возраст: 1–3 года • Бук')
  })

  it('clear removes the key so checkout falls back to cart', () => {
    const storage = createMemoryStorage()
    writeBuyNowItems(storage, [{
      id: 1,
      title: 'A',
      price: 100,
      quantity: 1,
      image: '/a.jpg',
    }])
    writeBuyNowItems(storage, null)
    assert.equal(storage.getItem(BUY_NOW_STORAGE_KEY), null)
    assert.equal(readBuyNowItems(storage), null)
  })

  it('rejects empty array and invalid payloads', () => {
    const storage = createMemoryStorage()
    writeBuyNowItems(storage, [])
    assert.equal(readBuyNowItems(storage), null)

    storage.setItem(BUY_NOW_STORAGE_KEY, JSON.stringify([{ id: 'gift-1', title: 'x', price: 1, quantity: 1, image: '/x' }]))
    assert.equal(readBuyNowItems(storage), null)

    storage.setItem(BUY_NOW_STORAGE_KEY, '{not-json')
    assert.equal(readBuyNowItems(storage), null)

    assert.equal(readBuyNowItems(null), null)
  })

  it('keeps gift box ids', () => {
    const storage = createMemoryStorage()
    writeBuyNowItems(storage, [{
      id: 'gb-7',
      title: 'Набор',
      price: 5000,
      quantity: 1,
      image: '/gb.jpg',
      giftBoxId: 7,
    }])
    const restored = readBuyNowItems(storage)
    assert.equal(restored?.[0]?.id, 'gb-7')
    assert.equal(restored?.[0]?.giftBoxId, 7)
  })
})
