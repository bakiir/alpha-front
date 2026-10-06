import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { shouldShowSubscriptionPricingShowcase } from './subscriptionViewGate.ts'

const base = {
  viewReady: true,
  showAllPlans: false,
  hasActiveSubscription: false,
  hasAnyPendingSubscription: false,
  hasUser: false,
  hasAuthSession: false,
  subscriptionResolved: false,
}

describe('shouldShowSubscriptionPricingShowcase', () => {
  it('never shows pricing before the hydration gate opens', () => {
    assert.equal(
      shouldShowSubscriptionPricingShowcase({
        ...base,
        viewReady: false,
        // Even if cookies would otherwise force pricing or hide it:
        hasActiveSubscription: true,
        hasAuthSession: true,
        subscriptionResolved: true,
      }),
      false,
    )
    assert.equal(
      shouldShowSubscriptionPricingShowcase({
        ...base,
        viewReady: false,
        hasAuthSession: false,
        hasUser: false,
      }),
      false,
    )
  })

  it('shows pricing for guests after the gate opens', () => {
    assert.equal(
      shouldShowSubscriptionPricingShowcase({
        ...base,
        viewReady: true,
        hasUser: false,
        hasAuthSession: false,
      }),
      true,
    )
  })

  it('shows pricing for stale active cookie without auth session', () => {
    assert.equal(
      shouldShowSubscriptionPricingShowcase({
        ...base,
        viewReady: true,
        hasActiveSubscription: true,
        hasUser: false,
        hasAuthSession: false,
      }),
      true,
    )
  })

  it('hides pricing while authed subscriber cache is active (loading dashboard)', () => {
    assert.equal(
      shouldShowSubscriptionPricingShowcase({
        ...base,
        viewReady: true,
        hasActiveSubscription: true,
        hasUser: false,
        hasAuthSession: true,
        subscriptionResolved: true,
      }),
      false,
    )
    assert.equal(
      shouldShowSubscriptionPricingShowcase({
        ...base,
        viewReady: true,
        hasActiveSubscription: true,
        hasUser: true,
        hasAuthSession: true,
        subscriptionResolved: true,
      }),
      false,
    )
  })

  it('shows pricing only after resolved empty subscription for logged-in user', () => {
    assert.equal(
      shouldShowSubscriptionPricingShowcase({
        ...base,
        viewReady: true,
        hasUser: true,
        hasAuthSession: true,
        subscriptionResolved: false,
      }),
      false,
    )
    assert.equal(
      shouldShowSubscriptionPricingShowcase({
        ...base,
        viewReady: true,
        hasUser: true,
        hasAuthSession: true,
        subscriptionResolved: true,
        hasActiveSubscription: false,
        hasAnyPendingSubscription: false,
      }),
      true,
    )
  })

  it('forces pricing when showAllPlans is set after the gate opens', () => {
    assert.equal(
      shouldShowSubscriptionPricingShowcase({
        ...base,
        viewReady: true,
        showAllPlans: true,
        hasActiveSubscription: true,
        hasUser: true,
      }),
      true,
    )
  })
})
