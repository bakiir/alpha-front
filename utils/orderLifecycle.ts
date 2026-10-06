/** Client helpers for derived shop-order lifecycle_status (backend OrderLifecycleStatus). */

export type OrderLifecycleCode =
  | 'pending_payment'
  | 'awaiting_gift_claim'
  | 'awaiting_stock'
  | 'partially_allocated'
  | 'ready_for_delivery_confirm'
  | 'awaiting_assembly'
  | 'assembling'
  | 'ready_for_handoff'
  | 'handed_to_courier'
  | 'in_transit'
  | 'delivered'
  | 'delivery_failed'
  | 'returning_to_warehouse'
  | 'returned_to_warehouse'
  | 'needs_attention'
  | 'cancelled'
  | 'payment_expired'

export type ShopOrderLike = {
  status?: string | null
  payment_status?: string | null
  fulfillment_mode?: string | null
  fulfillment_state?: string | null
  lifecycle_status?: string | null
  lifecycle_label?: string | null
  preorder_status_label?: string | null
  is_gift?: boolean | null
  gift_claimed_at?: string | null
  delivery_task?: { id?: number; status?: string | null } | null
  deliveryTask?: { id?: number; status?: string | null } | null
}

const LABELS: Record<string, string> = {
  pending_payment: 'Ожидает оплаты',
  awaiting_gift_claim: 'Ожидает адрес получателя',
  awaiting_stock: 'Ожидается поступление',
  partially_allocated: 'Частично поступил',
  ready_for_delivery_confirm: 'Подтвердите доставку',
  awaiting_assembly: 'Ожидает сборки',
  assembling: 'Собираем заказ',
  ready_for_handoff: 'Готов к передаче курьеру',
  handed_to_courier: 'Передан курьеру',
  in_transit: 'В пути',
  delivered: 'Доставлен',
  delivery_failed: 'Доставка не удалась',
  returning_to_warehouse: 'Возврат на склад',
  returned_to_warehouse: 'Возвращён на склад',
  needs_attention: 'Требует внимания',
  cancelled: 'Отменён',
  payment_expired: 'Время оплаты истекло',
}

const NOT_TRACKABLE = new Set([
  'pending_payment',
  'awaiting_gift_claim',
  'awaiting_stock',
  'partially_allocated',
  'ready_for_delivery_confirm',
  'cancelled',
  'delivered',
  'payment_expired',
  'returned_to_warehouse',
])

/** Map raw delivery-task fields to a lifecycle code when order projection is absent. */
export function lifecycleFromDeliveryTask(task: {
  status?: string | null
  warehouse_picked_up_at?: string | null
  type?: string | null
} | null | undefined): OrderLifecycleCode | null {
  if (!task?.status) return null
  const s = String(task.status).toLowerCase()
  const type = String(task.type || 'delivery').toLowerCase()

  if (type === 'pickup' || type === 'return' || type === 'exchange_pickup') {
    if (s === 'completed' || s === 'returned') return 'delivered'
    if (s === 'in_progress' || s === 'rescheduled') return 'in_transit'
    if (s === 'assigned' || s === 'picked_up') return 'ready_for_handoff'
    if (s === 'failed' || s === 'problem_pending') return 'delivery_failed'
    if (s === 'return_to_warehouse') return 'returning_to_warehouse'
    if (s === 'returned_to_warehouse') return 'returned_to_warehouse'
    return 'awaiting_assembly'
  }

  if (s === 'completed' || s === 'delivered') return 'delivered'
  if (s === 'failed' || s === 'problem_pending') return 'delivery_failed'
  if (s === 'return_to_warehouse') return 'returning_to_warehouse'
  if (s === 'returned_to_warehouse') return 'returned_to_warehouse'
  if (s === 'in_progress' || s === 'rescheduled') return 'in_transit'
  if (s === 'picked_up' || task.warehouse_picked_up_at) return 'handed_to_courier'
  if (s === 'assigned') return 'ready_for_handoff'
  if (s === 'pending') return 'awaiting_assembly'
  return null
}

/** Prefer API lifecycle_status; fall back to coarse order fields for older payloads. */
export function resolveOrderLifecycleStatus(order: ShopOrderLike | null | undefined): string {
  if (!order) return 'pending_payment'
  if (order.lifecycle_status) return String(order.lifecycle_status)

  if (order.status === 'cancelled') return 'cancelled'
  if (order.status === 'delivered' || order.fulfillment_state === 'completed') return 'delivered'

  if (order.fulfillment_mode === 'preorder') {
    switch (order.fulfillment_state) {
      case 'payment_expired': return 'payment_expired'
      case 'awaiting_payment_hold': return 'pending_payment'
      case 'awaiting_stock': return 'awaiting_stock'
      case 'partially_allocated': return 'partially_allocated'
      case 'ready_for_delivery':
      case 'delivery_pending_confirm': return 'ready_for_delivery_confirm'
      case 'needs_attention': return 'needs_attention'
      case 'in_delivery': break
      default: break
    }
  }

  if (order.is_gift && !order.gift_claimed_at && order.payment_status === 'paid') {
    return 'awaiting_gift_claim'
  }

  if (order.status === 'pending' && order.payment_status === 'pending') return 'pending_payment'
  if (order.status === 'shipped') return 'handed_to_courier'
  if (order.status === 'paid') return 'awaiting_assembly'
  return order.status || 'pending_payment'
}

export function resolveOrderLifecycleLabel(order: ShopOrderLike | null | undefined): string {
  if (!order) return LABELS.pending_payment
  if (order.lifecycle_label) return String(order.lifecycle_label)

  const code = resolveOrderLifecycleStatus(order)
  if (LABELS[code]) return LABELS[code]

  // Legacy preorder label field
  if (order.fulfillment_mode === 'preorder' && order.preorder_status_label) {
    return String(order.preorder_status_label)
  }

  return LABELS[code] || code
}

export function orderLifecycleStatusClass(statusOrOrder: string | ShopOrderLike | null | undefined): string {
  const code = typeof statusOrOrder === 'string' || !statusOrOrder
    ? String(statusOrOrder || '')
    : resolveOrderLifecycleStatus(statusOrOrder)

  switch (code) {
    case 'delivered':
    case 'returned_to_warehouse':
      return 'status-delivered'
    case 'handed_to_courier':
    case 'in_transit':
    case 'ready_for_handoff':
      return 'status-shipped'
    case 'cancelled':
    case 'delivery_failed':
    case 'payment_expired':
      return 'status-cancelled'
    case 'assembling':
    case 'awaiting_assembly':
    case 'awaiting_stock':
    case 'partially_allocated':
    case 'ready_for_delivery_confirm':
    case 'awaiting_gift_claim':
    case 'needs_attention':
    case 'returning_to_warehouse':
      return 'status-paid'
    case 'pending_payment':
      return 'status-pending'
    default:
      return 'status-pending'
  }
}

export function canTrackOrderDelivery(order: ShopOrderLike | null | undefined): boolean {
  if (!order) return false
  const code = resolveOrderLifecycleStatus(order)
  if (NOT_TRACKABLE.has(code)) return false

  const task = order.delivery_task || order.deliveryTask
  if (task?.id) return true

  // Preorder / stock already in courier pipeline without nested task on stale payload
  return ['handed_to_courier', 'in_transit', 'ready_for_handoff', 'assembling', 'awaiting_assembly'].includes(code)
    && ['paid', 'shipped'].includes(String(order.status || ''))
}

/** Tracker step 1..4 from lifecycle code (shop delivery happy-path). */
export function trackerStepFromLifecycle(code: string | null | undefined, isReturn = false): number {
  const c = String(code || '').toLowerCase()

  if (isReturn) {
    if (c === 'delivered' || c === 'returned_to_warehouse') return 4
    if (c === 'in_transit') return 3
    if (c === 'ready_for_handoff' || c === 'handed_to_courier') return 2
    return 1
  }

  if (c === 'delivered') return 4
  if (c === 'in_transit') return 3
  if (c === 'handed_to_courier' || c === 'ready_for_handoff') return 2
  if (c === 'delivery_failed' || c === 'returning_to_warehouse' || c === 'returned_to_warehouse' || c === 'needs_attention') {
    return 1
  }
  // awaiting_assembly | assembling | unknown
  return 1
}

export function trackerTitleFromLifecycle(code: string | null | undefined, isReturn = false): string {
  const c = String(code || '').toLowerCase()

  if (isReturn) {
    if (c === 'delivered' || c === 'returned_to_warehouse') return 'Курьер забрал игрушки от вас'
    if (c === 'in_transit') return 'Курьер едет к вам за игрушками'
    if (c === 'ready_for_handoff' || c === 'handed_to_courier') return 'Курьер назначен на забор игрушек'
    if (c === 'delivery_failed') return 'Выезд не удался — мы уже связываемся с вами'
    return 'Заявка на забор игрушек принята'
  }

  if (LABELS[c]) {
    if (c === 'awaiting_assembly' || c === 'assembling') return 'Собираем ваш заказ на складе'
    if (c === 'ready_for_handoff') return 'Готов к передаче курьеру'
    if (c === 'handed_to_courier') return 'Заказ передан курьеру'
    if (c === 'in_transit') return 'Курьер в пути к вам'
    if (c === 'delivered') return 'Доставлено клиенту'
    return LABELS[c]
  }

  return 'Собираем ваш заказ на складе'
}

export function trackerStep2Label(code: string | null | undefined, isReturn = false): string {
  if (isReturn) return 'Курьер назначен'
  const c = String(code || '').toLowerCase()
  if (c === 'ready_for_handoff') return 'Готов к передаче'
  if (c === 'handed_to_courier' || c === 'in_transit' || c === 'delivered') return 'Передан курьеру'
  return 'Готов к передаче'
}
