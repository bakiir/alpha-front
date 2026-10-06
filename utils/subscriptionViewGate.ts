export type SubscriptionPricingVisibilityInput = {
  /** Must stay false through SSR + hydration first paint. */
  viewReady: boolean
  showAllPlans: boolean
  hasActiveSubscription: boolean
  hasAnyPendingSubscription: boolean
  hasUser: boolean
  hasAuthSession: boolean
  subscriptionResolved: boolean
}

/**
 * Decides whether the public pricing showcase may render.
 * Keep this pure so SSR/client branching can be unit-tested without mounting the page.
 */
export function shouldShowSubscriptionPricingShowcase(
  input: SubscriptionPricingVisibilityInput,
): boolean {
  if (!input.viewReady) return false
  if (input.showAllPlans) return true

  if (input.hasActiveSubscription && input.hasUser) return false
  if (input.hasAnyPendingSubscription && input.hasUser) return false

  if (input.hasActiveSubscription && !input.hasUser) {
    if (!input.hasAuthSession) return true
  }

  if (!input.hasAuthSession && !input.hasUser) return true

  return input.subscriptionResolved
    && !input.hasActiveSubscription
    && !input.hasAnyPendingSubscription
}
