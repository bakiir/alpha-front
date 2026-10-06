import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildCartItemSubtitle, materialFromSpecifications } from './cartItemMeta.ts'

describe('cartItemMeta', () => {
  it('builds subtitle only from provided age/material', () => {
    assert.equal(
      buildCartItemSubtitle({ age: '1–3 года', material: 'Бук' }),
      'Возраст: 1–3 года • Бук',
    )
    assert.equal(
      buildCartItemSubtitle({ age: 'Возраст: 2–4 года' }),
      'Возраст: 2–4 года',
    )
    assert.equal(buildCartItemSubtitle({}), undefined)
    assert.equal(buildCartItemSubtitle({ age: '   ', material: '' }), undefined)
  })

  it('reads material from toy specifications', () => {
    assert.equal(
      materialFromSpecifications([
        { key: 'finish', label: 'Покрытие', value: 'Масло' },
        { key: 'material', label: 'Материал', value: 'Бук' },
      ]),
      'Бук',
    )
    assert.equal(materialFromSpecifications([]), undefined)
    assert.equal(materialFromSpecifications(null), undefined)
  })

  it('never invents the old cart placeholder', () => {
    const fakeFallback = 'Возраст: 1–2 года • Эко-дерево'
    assert.notEqual(buildCartItemSubtitle({}), fakeFallback)
    assert.notEqual(buildCartItemSubtitle({ age: null, material: null }), fakeFallback)
  })
})
