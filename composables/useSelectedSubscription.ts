/**
 * Shared selected subscription id across /subscription and /cabinet.
 */
export const useSelectedSubscription = () => {
  const selectedSubscriptionId = useState<number | null>('selected_subscription_id', () => null)

  const clearSelectedSubscriptionId = () => {
    selectedSubscriptionId.value = null
  }

  return {
    selectedSubscriptionId,
    clearSelectedSubscriptionId,
  }
}
