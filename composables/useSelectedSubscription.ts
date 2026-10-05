import { parseSubscriptionIdParam } from '~/utils/subscriptionSelection'

/**
 * Shared selected subscription id across /subscription and /cabinet.
 * Priority when resolving: ?subscription_id → cookie → in-memory state.
 */
export const useSelectedSubscription = () => {
  const route = useRoute()
  const router = useRouter()
  const selectedSubscriptionId = useState<number | null>('selected_subscription_id', () => null)
  const selectedCookie = useCookie<string | null>('alpha_selected_subscription_id', {
    maxAge: 60 * 60 * 24 * 180,
    sameSite: 'lax',
    path: '/',
  })

  if (selectedSubscriptionId.value == null) {
    const fromCookie = parseSubscriptionIdParam(selectedCookie.value)
    if (fromCookie != null) {
      selectedSubscriptionId.value = fromCookie
    }
  }

  const persistCookie = (id: number | null) => {
    const next = id != null ? String(id) : null
    if (selectedCookie.value !== next) {
      selectedCookie.value = next
    }
  }

  if (import.meta.client) {
    // Register cookie sync once per app (composable may be called from multiple pages).
    const cookieWatchRegistered = useState('selected_subscription_cookie_watch', () => false)
    if (!cookieWatchRegistered.value) {
      cookieWatchRegistered.value = true
      watch(selectedSubscriptionId, (id) => {
        persistCookie(id)
      })
    }
  }

  const clearSelectedSubscriptionId = () => {
    selectedSubscriptionId.value = null
    persistCookie(null)
  }

  /** Prefer deep-link query, then cookie/state. */
  const preferredSelectedSubscriptionId = (): number | null => {
    return parseSubscriptionIdParam(route.query.subscription_id) ?? selectedSubscriptionId.value
  }

  const syncSelectedSubscriptionQuery = async (id: number | null) => {
    if (!import.meta.client) return
    const current = parseSubscriptionIdParam(route.query.subscription_id)
    if (current === id) return

    const nextQuery: Record<string, any> = { ...route.query }
    if (id == null) {
      delete nextQuery.subscription_id
    } else {
      nextQuery.subscription_id = String(id)
    }

    await router.replace({ query: nextQuery })
  }

  return {
    selectedSubscriptionId,
    clearSelectedSubscriptionId,
    preferredSelectedSubscriptionId,
    syncSelectedSubscriptionQuery,
  }
}
