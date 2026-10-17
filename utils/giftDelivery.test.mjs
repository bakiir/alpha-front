import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  isCompleteKazakhstanPhone,
  normalizeGiftItems,
  splitGiftClaimServerErrors,
  validateGiftDeliveryForm,
} from './giftDelivery.ts'

const validForm = {
  name: 'Народный',
  phone: '+7 (775) 919-50-32',
  address: 'Алматы, пр. Абая, 150, кв. 42',
  comment: '',
}

describe('giftDelivery', () => {
  it('accepts only complete Kazakhstan numbers', () => {
    assert.equal(isCompleteKazakhstanPhone('+7 (775) 919-50-32'), true)
    assert.equal(isCompleteKazakhstanPhone('+7 (775) 919-50'), false)
    assert.equal(isCompleteKazakhstanPhone(''), false)
  })

  it('validates required fields, phone and length limits', () => {
    assert.deepEqual(validateGiftDeliveryForm(validForm), {})
    assert.deepEqual(
      validateGiftDeliveryForm({ name: '  ', phone: '', address: ' ', comment: '' }),
      { name: 'required', phone: 'required', address: 'required' },
    )
    assert.deepEqual(
      validateGiftDeliveryForm({ ...validForm, phone: '+7 (775) 9', address: 'a'.repeat(256), comment: 'c'.repeat(501) }),
      { phone: 'phone', address: 'tooLong', comment: 'tooLong' },
    )
  })

  it('routes server errors to fields and keeps the rest for the banner', () => {
    const { fields, other } = splitGiftClaimServerErrors({
      city: ['Город адреса доставки должен совпадать с городом заказа.'],
      phone: ['Неверный телефон'],
      token: ['Срок активации подарка истёк.'],
    })
    assert.deepEqual(fields, {
      address: 'Город адреса доставки должен совпадать с городом заказа.',
      phone: 'Неверный телефон',
    })
    assert.deepEqual(other, ['Срок активации подарка истёк.'])
    assert.deepEqual(splitGiftClaimServerErrors(null), { fields: {}, other: [] })
  })

  it('normalizes gift items with quantity fallback', () => {
    const items = normalizeGiftItems([
      { name: ' Автокресло ', image: 'https://cdn/a.jpg', quantity: 2 },
      { name: 'Набор', image: null },
      { name: 'Пазл', image: '', quantity: '0' },
    ])
    assert.deepEqual(items.map((i) => [i.name, i.image, i.quantity]), [
      ['Автокресло', 'https://cdn/a.jpg', 2],
      ['Набор', null, 1],
      ['Пазл', null, 1],
    ])
    assert.deepEqual(normalizeGiftItems(undefined), [])
  })
})
