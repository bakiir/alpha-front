import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildToyThumbSlots,
  formatToysCountLabel,
  toyCompositionQuantity,
  toyDisplayName,
  toyImageSrc,
} from './toysCompositionUi.ts'

describe('toysCompositionUi', () => {
  it('shows up to five thumbs without overflow cell', () => {
    const toys = [1, 2, 3, 4, 5]
    assert.deepEqual(buildToyThumbSlots(toys, 5), { visible: [1, 2, 3, 4, 5], overflow: 0 })
  })

  it('reserves last cell for +N when more than five toys', () => {
    const toys = [1, 2, 3, 4, 5, 6, 7]
    assert.deepEqual(buildToyThumbSlots(toys, 5), { visible: [1, 2, 3, 4], overflow: 3 })
  })

  it('formats Russian toy count labels', () => {
    assert.equal(formatToysCountLabel(1), '1 игрушка')
    assert.equal(formatToysCountLabel(2), '2 игрушки')
    assert.equal(formatToysCountLabel(5), '5 игрушек')
    assert.equal(formatToysCountLabel(21), '21 игрушка')
    assert.equal(formatToysCountLabel(12), '12 игрушек')
  })

  it('reads display fields safely', () => {
    assert.equal(toyDisplayName({ name: 'Кубик' }), 'Кубик')
    assert.equal(toyDisplayName({ title: 'Пирамидка' }), 'Пирамидка')
    assert.equal(toyDisplayName({}), 'Игрушка')
    assert.equal(toyImageSrc({ image_url: '/a.jpg' }), '/a.jpg')
    assert.equal(toyImageSrc({ image: '' }), '')
  })

  it('uses composition quantity, not inventory stock', () => {
    assert.equal(toyCompositionQuantity({ quantity: 40, composition_qty: 2 }), 2)
    assert.equal(toyCompositionQuantity({ quantity: 40 }), null)
    assert.equal(toyCompositionQuantity({ pivot: { quantity: 3 } }), 3)
  })
})
