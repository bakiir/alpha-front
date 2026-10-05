export type SubscriptionStatus = string

export interface SelectableSubscription {
  id: number
  status: SubscriptionStatus
  [key: string]: unknown
}

/** Parse ?subscription_id= from route query, cookie, or raw string. */
export const parseSubscriptionIdParam = (raw: unknown): number | null => {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (value == null || value === '') return null
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return null
  return Math.trunc(n)
}

export const isManageableSubscriptionStatus = (status: SubscriptionStatus | undefined | null): boolean =>
  status === 'active'
  || status === 'paused'
  || status === 'overdue'
  || status === 'suspended'

export const isPendingSubscriptionStatus = (status: SubscriptionStatus | undefined | null): boolean =>
  status === 'pending_payment'

export const filterManageableSubscriptions = <T extends SelectableSubscription>(list: T[]): T[] =>
  list.filter(item => isManageableSubscriptionStatus(item.status))

export const filterPendingSubscriptions = <T extends SelectableSubscription>(list: T[]): T[] =>
  list.filter(item => isPendingSubscriptionStatus(item.status))

export const filterSwitchableSubscriptions = <T extends SelectableSubscription>(list: T[]): T[] =>
  list.filter(
    item => isManageableSubscriptionStatus(item.status) || isPendingSubscriptionStatus(item.status),
  )

/**
 * Keep previous selection when still switchable; else first manageable, else first pending.
 */
export const resolveSelectedSubscriptionId = (
  list: SelectableSubscription[],
  previousId: number | null | undefined,
): number | null => {
  const switchable = filterSwitchableSubscriptions(list)
  if (switchable.length === 0) return null

  if (previousId != null && switchable.some(item => item.id === previousId)) {
    return previousId
  }

  const manageable = filterManageableSubscriptions(switchable)
  if (manageable.length > 0) return manageable[0].id

  return switchable[0].id
}

export const shouldApplyResponse = (
  requestSubscriptionId: number | null | undefined,
  currentSubscriptionId: number | null | undefined,
): boolean => {
  if (requestSubscriptionId == null || currentSubscriptionId == null) return false
  return requestSubscriptionId === currentSubscriptionId
}

export const subscriptionSwitcherStatusLabel = (status: SubscriptionStatus | undefined | null): string => {
  if (status === 'paused') return 'Заморожена'
  if (status === 'pending_payment') return 'Ожидает оплаты'
  if (status === 'overdue') return 'Просрочена'
  if (status === 'suspended') return 'Приостановлена'
  if (status === 'active') return 'Активна'
  return status || ''
}
