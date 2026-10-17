import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { formatGiftDate, resolveGiftCardDeadline } from './giftDeadline.ts'

describe('giftDeadline', () => {
  it('formats API wall-clock time without timezone shift', () => {
    assert.equal(formatGiftDate('2026-11-16 20:45:02', 'ru'), '16 ноября 2026, 20:45')
    assert.equal(formatGiftDate('2026-11-16 00:05:00', 'en'), 'November 16, 2026, 00:05')
    assert.equal(formatGiftDate('2027-10-17', 'ru'), '17 октября 2027')
    assert.equal(formatGiftDate('2026-11-16 20:45:02', 'kk'), '16 қараша 2026, 20:45')
    assert.equal(formatGiftDate('', 'ru'), null)
    assert.equal(formatGiftDate('not a date', 'ru'), null)
  })

  it('shows activation deadline while the card is not activated yet', () => {
    const deadline = resolveGiftCardDeadline({
      can_activate: true,
      activation_deadline: { local: '2026-11-16 20:45:02', timezone: 'Asia/Almaty' },
      expires_at: '2027-10-17',
    }, 'ru')
    assert.deepEqual(deadline, { kind: 'activation', date: '16 ноября 2026, 20:45', timezone: 'Asia/Almaty' })
  })

  it('switches to balance expiry after first use', () => {
    const deadline = resolveGiftCardDeadline({
      can_activate: false,
      activation_deadline: { local: '2026-11-16 20:45:02', timezone: 'Asia/Almaty' },
      expires_at: '2027-10-17',
    }, 'ru')
    assert.deepEqual(deadline, { kind: 'balance', date: '17 октября 2027', timezone: null })
  })

  it('falls back to server label and to nothing', () => {
    assert.deepEqual(
      resolveGiftCardDeadline({ activation_deadline: { local_label: '16.11.2026, 20:45 по времени Алматы' } }, 'ru'),
      { kind: 'activation', date: '16.11.2026, 20:45 по времени Алматы', timezone: null },
    )
    assert.equal(resolveGiftCardDeadline({}, 'ru'), null)
    assert.equal(resolveGiftCardDeadline(null, 'ru'), null)
  })
})
