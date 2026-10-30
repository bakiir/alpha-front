import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { formatPreorderDate, formatPreorderRange } from './formatPreorderRange.ts'

describe('formatPreorderDate', () => {
  it('formats ISO datetime as calendar date without UTC shift', () => {
    assert.equal(formatPreorderDate('2026-10-31T00:00:00.000000Z', 'ru-RU'), '31.10.2026')
  })

  it('formats plain YYYY-MM-DD', () => {
    assert.equal(formatPreorderDate('2026-11-05', 'ru-RU'), '05.11.2026')
  })

  it('returns empty for blank', () => {
    assert.equal(formatPreorderDate(null), '')
    assert.equal(formatPreorderDate(''), '')
  })
})

describe('formatPreorderRange', () => {
  it('joins different bounds', () => {
    assert.equal(
      formatPreorderRange('2026-11-03T00:00:00.000000Z', '2026-11-05T00:00:00.000000Z', 'ru-RU'),
      '03.11.2026 – 05.11.2026',
    )
  })

  it('normalizes inverted bounds', () => {
    assert.equal(
      formatPreorderRange('2026-11-05T00:00:00.000000Z', '2026-11-03T00:00:00.000000Z', 'ru-RU'),
      '03.11.2026 – 05.11.2026',
    )
  })

  it('collapses identical bounds', () => {
    assert.equal(
      formatPreorderRange('2026-10-31T00:00:00.000000Z', '2026-10-31T00:00:00.000000Z', 'ru-RU'),
      '31.10.2026',
    )
  })

  it('uses single bound when other missing', () => {
    assert.equal(formatPreorderRange('2026-10-31', null, 'ru-RU'), '31.10.2026')
    assert.equal(formatPreorderRange(null, '2026-11-05', 'ru-RU'), '05.11.2026')
  })
})
