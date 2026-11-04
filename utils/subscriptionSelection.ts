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

/** i18n key under `subscription.status.*`, or empty if unknown. */
export const subscriptionSwitcherStatusKey = (status: SubscriptionStatus | undefined | null): string | null => {
  if (status === 'paused') return 'subscription.status.paused'
  if (status === 'pending_payment') return 'subscription.status.pending_payment'
  if (status === 'overdue') return 'subscription.status.overdue'
  if (status === 'suspended') return 'subscription.status.suspended'
  if (status === 'active') return 'subscription.status.active'
  return null
}

export type ProfileChildRef = {
  id: number
  name: string
}

export type FamilySwitcherSubscriptionEntry = {
  kind: 'subscription'
  childId: number
  subscriptionId: number
  name: string
  status: SubscriptionStatus
}

export type FamilySwitcherChildNoSubEntry = {
  kind: 'child_no_sub'
  childId: number
  name: string
}

export type FamilySwitcherAddChildEntry = {
  kind: 'add_child'
}

export type FamilySwitcherEntry =
  | FamilySwitcherSubscriptionEntry
  | FamilySwitcherChildNoSubEntry
  | FamilySwitcherAddChildEntry

/** Children with a switchable sub first, then profile children without sub, then «add child». */
export const buildFamilySwitcherEntries = (
  switchable: SelectableSubscription[],
  profileChildren: ProfileChildRef[],
): FamilySwitcherEntry[] => {
  const entries: FamilySwitcherEntry[] = []
  const childIdsWithSub = new Set<number>()

  for (const sub of switchable) {
    const child = sub.child as { id?: number; name?: string } | undefined
    const childId = Number(child?.id ?? (sub as { child_id?: number }).child_id)
    if (!Number.isFinite(childId) || childId <= 0) continue
    childIdsWithSub.add(childId)
    entries.push({
      kind: 'subscription',
      childId,
      subscriptionId: sub.id,
      name: String(child?.name || '').trim() || `#${childId}`,
      status: sub.status,
    })
  }

  for (const child of profileChildren) {
    if (childIdsWithSub.has(child.id)) continue
    entries.push({
      kind: 'child_no_sub',
      childId: child.id,
      name: String(child.name || '').trim() || `#${child.id}`,
    })
  }

  entries.push({ kind: 'add_child' })
  return entries
}
