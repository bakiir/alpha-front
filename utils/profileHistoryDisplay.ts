import type { RentalItem } from '../composables/useRentals'
import { resolveOrderLifecycleLabel, type ShopOrderLike } from './orderLifecycle.ts'

export type HistoryEventTone = 'delivery' | 'return' | 'return-today' | 'muted' | 'attention' | 'none'

export type HistoryNearestEvent = {
  text: string
  tone: HistoryEventTone
  urgent?: boolean
}

function parseDateOnly(value?: string | null): Date | null {
  if (!value) return null
  const d = new Date(value.includes('T') ? value : `${value}T12:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
  )
}

export function formatHistoryDayLabel(dateStr?: string | null, now = new Date()): string {
  const d = parseDateOnly(dateStr)
  if (!d) return ''
  if (isSameCalendarDay(d, now)) return 'сегодня'
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }).replace('.', '')
}

export function historyDisplayNumber(raw?: string | null, fallbackId?: number): string {
  if (raw) {
    const tail = raw.match(/(\d{3,})$/)?.[1]
    if (tail) return tail.slice(-5).padStart(5, '0')
  }
  if (fallbackId != null) return String(fallbackId).padStart(5, '0')
  return '—'
}

export function rentalCompactStatus(rental: RentalItem): string {
  const label = rental.status_label?.trim()
  if (label && label.length <= 24) {
    if (/аренде у клиента/i.test(label)) return 'У вас'
    return label
  }
  switch (rental.status) {
    case 'active':
      return 'У вас'
    case 'reserved':
      return 'Забронировано'
    case 'pending_payment':
      return 'Ожидает оплаты'
    case 'return_in_progress':
      return 'Забор'
    case 'returned':
      return 'Завершена'
    case 'expired':
      return 'Просрочена'
    case 'cancelled':
      return 'Отменена'
    default:
      return label || rental.status
  }
}

export function rentalStatusPillClass(rental: RentalItem): string {
  switch (rental.status) {
    case 'active':
      return 'hist-pill--with-you'
    case 'reserved':
    case 'pending_payment':
      return 'hist-pill--booked'
    case 'return_in_progress':
      return 'hist-pill--transit'
    case 'returned':
      return 'hist-pill--done'
    case 'expired':
    case 'cancelled':
      return 'hist-pill--bad'
    default:
      return 'hist-pill--neutral'
  }
}

function slotDayAndLabel(dateStr?: string | null, slot?: string | null): string {
  const day = dateStr ? formatHistoryDayLabel(dateStr) : ''
  if (day && slot) return `${day} · ${slot}`
  return day || slot || ''
}

/** Раскрытая карточка: только дата и слот, без адреса */
export function rentalDeliverySlotLabel(rental: RentalItem): string {
  if (rental.delivered_at) {
    return `Доставлено · ${formatHistoryDayLabel(rental.delivered_at)}`
  }
  return slotDayAndLabel(rental.start_date, rental.schedule?.delivery_label)
}

export function rentalReturnSlotLabel(rental: RentalItem): string {
  return slotDayAndLabel(rental.end_date, rental.schedule?.pickup_label || rental.pickup?.slot_label)
}

export function rentalPeriodShort(rental: RentalItem): string {
  if (!rental.start_date || !rental.end_date) return ''
  const days = rental.days_count || 1
  const dayWord = days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'
  return `${formatHistoryDayLabel(rental.start_date)} — ${formatHistoryDayLabel(rental.end_date)} · ${days} ${dayWord}`
}

export function rentalNearestEvent(rental: RentalItem, now = new Date()): HistoryNearestEvent {
  const schedule = rental.schedule
  const pickupLabel = rental.pickup?.slot_label || schedule?.pickup_label
  const deliveryLabel = schedule?.delivery_label

  if (['returned', 'cancelled'].includes(rental.status)) {
    return { text: rental.status === 'cancelled' ? 'Отменена' : 'На складе', tone: 'muted' }
  }

  if (rental.status === 'return_in_progress') {
    return { text: 'Курьер забирает игрушку', tone: 'return' }
  }

  if (rental.status === 'expired') {
    const days = rental.overdue_days || 0
    return { text: days > 0 ? `Просрочка ${days} дн.` : 'Просрочен возврат', tone: 'attention', urgent: true }
  }

  if (rental.status === 'active' || rental.status === 'partially_returned') {
    const day = formatHistoryDayLabel(rental.end_date, now)
    const slot = pickupLabel ? ` · ${pickupLabel}` : ''
    const today = day === 'сегодня'
    return {
      text: `Возврат ${day}${slot}`,
      tone: today ? 'return-today' : 'return',
      urgent: today,
    }
  }

  if (rental.status === 'reserved' || rental.status === 'pending_payment') {
    const day = formatHistoryDayLabel(rental.start_date, now)
    const slot = deliveryLabel ? ` · ${deliveryLabel}` : ''
    return {
      text: `Доставка ${day}${slot}`,
      tone: 'delivery',
    }
  }

  if (schedule?.time_status_label) {
    return { text: schedule.time_status_label, tone: 'muted' }
  }

  return { text: '—', tone: 'none' }
}

type OrderItemLike = { toy?: { name?: string | null } | null; title?: string | null; quantity?: number }

export function orderHistoryTitle(order: { items?: OrderItemLike[] | null; fulfillment_mode?: string | null }): string {
  const items = order.items || []
  if (items.length === 0) {
    return order.fulfillment_mode === 'preorder' ? 'Предзаказ' : 'Заказ'
  }
  if (items.length === 1) {
    return items[0].toy?.name || items[0].title || 'Товар'
  }
  const qty = items.reduce((s, i) => s + (Number(i.quantity) || 1), 0)
  return qty > items.length ? `Заказ · ${qty} поз.` : `Заказ · ${items.length} товаров`
}

export function orderHistoryThumb(order: { items?: OrderItemLike[] | null }): OrderItemLike | null {
  return order.items?.[0] ?? null
}

export function orderCompactStatus(order: ShopOrderLike): string {
  const full = resolveOrderLifecycleLabel(order)
  if (full.length <= 22) return full
  const code = order.lifecycle_status
  if (code === 'delivered') return 'Доставлен'
  if (code === 'in_transit') return 'В пути'
  if (code === 'awaiting_assembly' || code === 'assembling') return 'Собираем'
  if (code === 'pending_payment') return 'Ожидает оплаты'
  return full
}

export function orderStatusPillClass(order: ShopOrderLike): string {
  const code = order.lifecycle_status || ''
  if (['delivered', 'attention_cleared'].includes(code)) return 'hist-pill--done'
  if (['cancelled', 'payment_expired', 'delivery_failed', 'needs_attention'].includes(code)) {
    return code === 'needs_attention' ? 'hist-pill--attention' : 'hist-pill--bad'
  }
  if (['in_transit', 'handed_to_courier', 'ready_for_handoff'].includes(code)) return 'hist-pill--transit'
  if (code === 'pending_payment') return 'hist-pill--booked'
  return 'hist-pill--neutral'
}

export function orderNearestEvent(
  order: ShopOrderLike & {
    promised_delivery_from?: string | null
    promised_delivery_to?: string | null
    delivery_time?: string | null
    created_at?: string | null
  },
  formatRange?: (from?: string | null, to?: string | null) => string | null,
): HistoryNearestEvent {
  const code = order.lifecycle_status || ''
  if (code === 'delivered') {
    return { text: 'Доставлен', tone: 'muted' }
  }
  if (code === 'cancelled' || code === 'payment_expired') {
    return { text: resolveOrderLifecycleLabel(order), tone: 'muted' }
  }
  if (code === 'pending_payment') {
    return { text: 'Оплатите заказ', tone: 'attention', urgent: true }
  }
  if (order.fulfillment_mode === 'preorder' && formatRange) {
    const range = formatRange(order.promised_delivery_from, order.promised_delivery_to)
    if (range) return { text: `Доставка ${range}`, tone: 'delivery' }
  }
  if (order.delivery_time) {
    return { text: `Доставка · ${order.delivery_time}`, tone: 'delivery' }
  }
  const label = resolveOrderLifecycleLabel(order)
  if (['in_transit', 'handed_to_courier'].includes(code)) {
    return { text: label, tone: 'delivery' }
  }
  return { text: label, tone: 'muted' }
}

export function eventToneClass(tone: HistoryEventTone): string {
  switch (tone) {
    case 'delivery':
      return 'hist-pill--event-delivery'
    case 'return':
      return 'hist-pill--event-return'
    case 'return-today':
      return 'hist-pill--event-return-today'
    case 'attention':
      return 'hist-pill--event-attention'
    default:
      return 'hist-pill--event-muted'
  }
}
