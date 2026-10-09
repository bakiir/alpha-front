<template>
  <section class="pricing-showcase-view" :class="{ 'has-mobile-cta': showMobileCta }">
    <button
      v-if="showBackToDashboard"
      class="back-to-sub-btn"
      type="button"
      @click="$emit('back-to-dashboard')"
    >
      {{ t('subscription.pricing.backDashboard') }}
    </button>

    <div class="pricing-hero-header">
      <span class="hero-tag">{{ heroTag }}</span>
      <h1 class="pricing-hero-title">
        {{ heroTitle }}
      </h1>
      <p class="pricing-hero-subtitle">
        {{ heroSubtitle }}
      </p>

      <div v-if="plans.length > 0" class="billing-switcher-wrapper">
        <div class="billing-switcher" role="group" :aria-label="t('subscription.billingCycle.aria')">
          <button
            v-for="opt in billingCycleOptions"
            :key="opt.value"
            class="switch-tab-btn"
            type="button"
            :class="{ active: billingCycle === opt.value }"
            :aria-pressed="billingCycle === opt.value"
            @click="billingCycle = opt.value"
          >
            <span class="cycle-label-desktop">{{ opt.desktopLabel }}</span>
            <span class="cycle-label-mobile">{{ opt.mobileLabel }}</span>
            <span
              v-if="opt.badge"
              class="save-badge desktop-cycle-badge"
              :class="{ gold: opt.badgeGold }"
            >
              {{ opt.badge }}
            </span>
          </button>
        </div>
        <p v-if="cycleDiscountHint" class="billing-discount-hint">
          {{ cycleDiscountHint }}
        </p>
      </div>
    </div>

    <div v-if="isLoading" class="plans-empty-state">
      <p>{{ t('subscription.pricing.loadingPlans') }}</p>
    </div>

    <div v-else-if="error && plans.length === 0" class="plans-empty-state plans-error-state">
      <AppIcon name="alert" :size="40" class="plans-empty-icon" />
      <h3>{{ t('subscription.pricing.loadErrorTitle') }}</h3>
      <p>{{ error }}</p>
      <button
        v-if="canRetry"
        type="button"
        class="plans-retry-btn"
        @click="$emit('retry')"
      >
        {{ t('subscription.retry') }}
      </button>
    </div>

    <div v-else-if="plans.length === 0" class="plans-empty-state">
      <AppIcon name="package" :size="40" class="plans-empty-icon" />
      <h3>{{ t('subscription.pricing.emptyTitle') }}</h3>
      <p>{{ t('subscription.pricing.emptyBody') }}</p>
    </div>

    <template v-else>
      <!-- Desktop cards (unchanged structure) -->
      <div class="pricing-cards-grid desktop-plans-grid">
        <div
          v-for="(plan, pIdx) in plans"
          :key="`desk-${plan.slug || pIdx}`"
          class="pricing-plan-card"
          :class="{ 'featured-plan': plan.isFeatured }"
        >
          <div v-if="plan.isFeatured || plan.badge" class="popular-ribbon">
            <AppIcon name="bolt" :size="14" class="inline-icon" /> {{ plan.badge || t('subscription.pricing.popularRibbon') }}
          </div>

          <div class="card-top-head">
            <span class="plan-type-tag" :class="{ featured: plan.isFeatured }">
              {{ plan.badge || (pIdx === 0 ? t('subscription.pricing.tagStarter') : plan.isFeatured ? t('subscription.pricing.tagHit') : t('subscription.pricing.tagMax')) }}
            </span>
            <h3 class="plan-title">{{ plan.name }}</h3>
            <p class="plan-desc">{{ plan.description }}</p>
            <p class="plan-toys-meta">
              <strong>{{ plan.toys_count }}</strong>
              {{ toysCountLabel(plan.toys_count) }} {{ t('subscription.pricing.toysAtHome') }}
            </p>
          </div>

          <div class="plan-pricing-box">
            <div v-if="planHasDiscount(plan)" class="price-comparison">
              <s class="price-original">{{ formatPrice(planRegularMonthlyPrice(plan)) }} ₸</s>
              <span class="discount-pill">−{{ planDiscountPercent(plan) }}%</span>
            </div>
            <div class="price-display">
              <span class="price-amount" :class="{ featured: plan.isFeatured }">
                {{ formatPrice(planMonthlyPrice(plan)) }} ₸
              </span>
              <span class="price-period">{{ t('subscription.billingCycle.perMonth') }}</span>
            </div>
            <div v-if="billingCycle !== 'monthly'" class="billing-summary">
              <span class="billed-note">{{ t('subscription.pricing.billedForPeriod', { amount: formatPrice(planBilledTotal(plan)) }) }}</span>
              <span v-if="planHasDiscount(plan)" class="saving-note">
                {{ t('subscription.pricing.savings', { amount: formatPrice(planPeriodSavings(plan)) }) }}
              </span>
            </div>
          </div>

          <div class="preview-toys-action-wrap">
            <button
              type="button"
              class="preview-set-btn"
              @click="$emit('preview-toys', plan)"
            >
              <AppIcon name="search" :size="16" class="inline-icon" />
              {{ t('subscription.pricing.previewBoxes') }}
            </button>
          </div>

          <div class="plan-divider" />

          <ul class="plan-perks-list">
            <li v-for="(feat, fIdx) in plan.features" :key="`f-${fIdx}`">
              <span class="check-icon" :class="{ featured: plan.isFeatured }">✓</span>
              <span>{{ feat }}</span>
            </li>
            <template v-if="(plan.category_access || []).length">
              <li
                v-for="cap in plan.category_access"
                :key="`c-${cap.slug}`"
                :class="{ 'perk-inactive': !cap.allowed }"
              >
                <span
                  class="check-icon"
                  :class="{ featured: plan.isFeatured && cap.allowed, inactive: !cap.allowed }"
                >{{ cap.allowed ? '✓' : '✕' }}</span>
                <span>{{ cap.name }}</span>
              </li>
            </template>
            <template v-else>
              <li
                v-for="(feat, fIdx) in (plan.unavailable_features || [])"
                :key="`unavailable-${fIdx}`"
                class="plan-perk-unavailable"
                :aria-label="t('subscription.pricing.unavailableInPlan', { feat, plan: plan.name })"
              >
                <span class="unavailable-icon" aria-hidden="true">×</span>
                <span>{{ feat }}</span>
              </li>
            </template>
          </ul>

          <button
            class="select-plan-btn"
            type="button"
            :class="{ featured: plan.isFeatured }"
            @click="$emit('select-plan', plan)"
          >
            {{ isLoggedIn ? t('subscription.pricing.selectPlanNamed', { name: plan.name }) : t('subscription.pricing.subscribe') }}
          </button>
        </div>
      </div>

      <!-- Mobile compact options -->
      <div class="mobile-plans-block">
        <div class="mobile-plans-list-head">
          <h2 class="mobile-plans-list-title">{{ t('subscription.pricing.mobileTitle') }}</h2>
          <button
            type="button"
            class="plans-compare-text-btn"
            @click="openCompare"
          >
            {{ t('subscription.pricing.compare') }}
          </button>
        </div>

        <div
          class="mobile-plan-options"
          role="radiogroup"
          :aria-label="t('subscription.pricing.pickPlanAria')"
          @keydown="onPlanRadiogroupKeydown"
        >
          <div
            v-for="(plan, pIdx) in plans"
            :key="`mob-${plan.slug || pIdx}`"
            class="mobile-plan-option"
            :class="{ selected: selectedPlanSlug === plan.slug }"
            role="radio"
            :aria-checked="selectedPlanSlug === plan.slug"
            :tabindex="selectedPlanSlug === plan.slug || (!selectedPlanSlug && pIdx === 0) ? 0 : -1"
            :data-plan-slug="plan.slug"
            @click="selectPlanOption(plan)"
            @keydown.enter.prevent="selectPlanOption(plan)"
            @keydown.space.prevent="selectPlanOption(plan)"
          >
            <span class="mobile-plan-radio" aria-hidden="true">
              <span class="mobile-plan-radio-dot" />
            </span>

            <div class="mobile-plan-option-body">
              <div class="mobile-plan-option-top">
                <div class="mobile-plan-name-wrap">
                  <span class="mobile-plan-name">{{ plan.name }}</span>
                  <span
                    v-if="popularityLabel(plan)"
                    class="mobile-plan-popularity"
                  >
                    {{ popularityLabel(plan) }}
                  </span>
                </div>
                <div class="mobile-plan-price-wrap">
                  <span class="mobile-plan-price">
                    {{ formatPrice(planBilledTotal(plan)) }} ₸
                  </span>
                  <span class="mobile-plan-price-period">{{ periodPriceSuffix }}</span>
                </div>
              </div>

              <p class="mobile-plan-meta-line">
                {{ plan.toys_count }} {{ toysCountLabel(plan.toys_count) }}
                ·
                {{ plan.exchanges_count }} {{ exchangesCountLabel(plan.exchanges_count) }} {{ t('subscription.pricing.perMonthMeta') }}
              </p>

              <button
                type="button"
                class="mobile-plan-includes-btn"
                @click.stop="$emit('preview-toys', plan)"
              >
                {{ t('subscription.pricing.whatsIncluded') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-if="plans.length > 0" class="extra-toys-banner">
      <div class="extra-toys-content">
        <AppIcon name="how-it-works" :size="28" class="extra-icon" />
        <div class="extra-text">
          <h4>{{ t('subscription.pricing.extraTitle') }}</h4>
          <p>
            {{ t('subscription.pricing.extraBody') }}
          </p>
        </div>
      </div>
      <NuxtLink :to="localePath('/short-rent?from=subscription')" class="extra-rent-cta">
        {{ t('subscription.pricing.extraCta') }}
        <span aria-hidden="true">→</span>
      </NuxtLink>
    </div>

    <section v-if="inclusions.length" class="inclusions-section">
      <h2 class="inclusions-title">{{ inclusionsTitle }}</h2>
      <div class="inclusions-grid">
        <div v-for="item in inclusions" :key="`${item.icon}-${item.iconImage}-${item.title}`" class="inclusion-card">
          <div class="inc-icon">
            <img
              v-if="item.iconImage"
              :src="item.iconImage"
              :alt="item.title"
              class="inc-icon-img"
              width="24"
              height="24"
            >
            <AppIcon v-else :name="item.icon" :size="24" />
          </div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.text }}</p>
        </div>
      </div>
    </section>

    <section v-if="faqs.length" class="faq-section">
      <h2 class="faq-heading">{{ t('subscription.pricing.faqTitle') }}</h2>
      <div class="faq-list">
        <div
          v-for="(item, idx) in faqs"
          :key="item.id ?? idx"
          class="faq-card"
          :class="{ open: openFaq === idx }"
          @click="openFaq = openFaq === idx ? null : idx"
        >
          <div class="faq-header">
            <h3>{{ item.question }}</h3>
            <span class="faq-toggle">{{ openFaq === idx ? '−' : '+' }}</span>
          </div>
          <div v-if="openFaq === idx" class="faq-body">
            <p>{{ item.answer }}</p>
          </div>
        </div>
      </div>
    </section>

    <div
      v-if="showMobileCta"
      class="mobile-checkout-bar"
      role="region"
      :aria-label="t('subscription.pricing.mobileCheckoutAria')"
    >
      <div class="mobile-checkout-bar-info">
        <p class="mobile-checkout-bar-plan">
          <template v-if="selectedPlan">
            {{ selectedPlan.name }} · {{ activeCycleShortLabel }}
          </template>
          <template v-else>
            {{ t('subscription.pricing.pickPlan') }}
          </template>
        </p>
        <p class="mobile-checkout-bar-amount">
          <template v-if="canContinue">
            <span class="mobile-checkout-bar-total">
              {{ formatPrice(selectedBilledTotal) }} ₸
            </span>
            <span
              v-if="billingCycle !== 'monthly'"
              class="mobile-checkout-bar-equiv"
            >
              {{ t('subscription.pricing.perMonthEquiv', { amount: formatPrice(selectedMonthlyPrice) }) }}
            </span>
          </template>
          <template v-else>
            —
          </template>
        </p>
      </div>
      <button
        type="button"
        class="mobile-checkout-bar-btn"
        :disabled="!canContinue"
        @click="continueWithSelected"
      >
        {{ t('subscription.continue') }}
      </button>
    </div>

    <SubscriptionPlansCompareSheet
      :open="isCompareOpen"
      :plans="plans"
      :billing-cycle="billingCycle"
      :cycle-label="activeCycleDesktopLabel"
      @close="closeCompare"
      @select-plan="onComparePick"
    />
  </section>
</template>

<script setup lang="ts">
import type { PlanViewItem } from '~/composables/useSubscriptionPricing'
import SubscriptionPlansCompareSheet from '~/components/subscription/SubscriptionPlansCompareSheet.vue'

type BillingCycle = 'monthly' | 'quarterly' | 'semiannual' | 'annual'

const props = withDefaults(defineProps<{
  plans: PlanViewItem[]
  isLoading: boolean
  isLoggedIn: boolean
  showBackToDashboard: boolean
  faqs: Array<{ id?: number; question: string; answer: string }>
  error?: string | null
  canRetry?: boolean
}>(), {
  error: null,
  canRetry: false,
})

const emit = defineEmits<{
  'back-to-dashboard': []
  'select-plan': [plan: PlanViewItem]
  'preview-toys': [plan: PlanViewItem]
  retry: []
}>()

const { t } = useI18n()
const localePath = useLocalePath()
const { sectionByKey } = usePageSections('subscription')

const pricingHero = sectionByKey('pricing_hero')
const pricingInclusions = sectionByKey('pricing_inclusions')

const cmsText = (value: string | null | undefined, fallback: string) => {
  const trimmed = value?.trim()
  return trimmed || fallback
}

const heroTag = computed(() =>
  cmsText(pricingHero.value?.badge_text, t('subscription.pricing.heroTag')),
)
const heroTitle = computed(() =>
  cmsText(pricingHero.value?.title, t('subscription.pricing.heroTitle')),
)
const heroSubtitle = computed(() =>
  cmsText(pricingHero.value?.subtitle, t('subscription.pricing.heroSubtitle')),
)
const inclusionsTitle = computed(() =>
  cmsText(pricingInclusions.value?.title, t('subscription.pricing.inclusionsTitle')),
)

const billingCycle = defineModel<BillingCycle>('billingCycle', { required: true })

const openFaq = ref<number | null>(0)
const isCompareOpen = ref(false)
const selectedPlanSlug = ref<string | null>(null)
const savedScrollY = ref(0)

const billingCycleOptions = computed(() => [
  { value: 'monthly' as const, desktopLabel: t('subscription.billingCycle.monthly'), mobileLabel: t('subscription.billingCycle.monthlyShort') },
  { value: 'quarterly' as const, desktopLabel: t('subscription.billingCycle.quarterly'), mobileLabel: t('subscription.billingCycle.quarterlyShort'), badge: t('subscription.billingCycle.discountBadge') },
  { value: 'semiannual' as const, desktopLabel: t('subscription.billingCycle.semiannual'), mobileLabel: t('subscription.billingCycle.semiannualShort'), badge: t('subscription.billingCycle.moreSavingsBadge') },
  { value: 'annual' as const, desktopLabel: t('subscription.billingCycle.annual'), mobileLabel: t('subscription.billingCycle.annualShort'), badge: t('subscription.billingCycle.maxSavingsBadge'), badgeGold: true },
])

const { formatPrice, calcPlanPrice, calcBilledTotal, billingCycleMonths } = useSubscriptionPricing()

const activeCycleDesktopLabel = computed(() =>
  billingCycleOptions.value.find((o) => o.value === billingCycle.value)?.desktopLabel
    || t('subscription.billingCycle.monthly'),
)

const activeCycleShortLabel = computed(() =>
  billingCycleOptions.value.find((o) => o.value === billingCycle.value)?.mobileLabel
    || t('subscription.billingCycle.monthlyShort'),
)

const periodPriceSuffix = computed(() => {
  if (billingCycle.value === 'monthly') return t('subscription.billingCycle.perMonthCompact')
  if (billingCycle.value === 'quarterly') return t('subscription.billingCycle.per3Months')
  if (billingCycle.value === 'semiannual') return t('subscription.billingCycle.per6Months')
  return t('subscription.billingCycle.per12Months')
})

const planMonthlyPrice = (plan: PlanViewItem) =>
  calcPlanPrice(plan, billingCycle.value, 0)

const planBilledTotal = (plan: PlanViewItem) =>
  calcBilledTotal(plan, billingCycle.value, 0)

const planCompareAtBasePrice = (plan: PlanViewItem) => {
  const compareAt = billingCycle.value === 'quarterly'
    ? plan.compare_at_price_quarterly
    : billingCycle.value === 'semiannual'
      ? plan.compare_at_price_semiannual
      : billingCycle.value === 'annual'
        ? plan.compare_at_price_annual
        : plan.compare_at_price_monthly

  return Number(compareAt) || 0
}

const planRegularMonthlyPrice = (plan: PlanViewItem) => planCompareAtBasePrice(plan)

const planHasDiscount = (plan: PlanViewItem) =>
  planCompareAtBasePrice(plan) > 0 && planMonthlyPrice(plan) < planRegularMonthlyPrice(plan)

const planDiscountPercent = (plan: PlanViewItem) => {
  const regularPrice = planRegularMonthlyPrice(plan)
  if (!regularPrice) return 0
  return Math.round((1 - planMonthlyPrice(plan) / regularPrice) * 100)
}

const planPeriodSavings = (plan: PlanViewItem) =>
  (planRegularMonthlyPrice(plan) - planMonthlyPrice(plan)) * billingCycleMonths(billingCycle.value)

const cycleDiscountHint = computed(() => {
  if (billingCycle.value === 'monthly' || !props.plans.length) return ''
  const percents = props.plans.map((p) => planDiscountPercent(p)).filter((p) => p > 0)
  if (!percents.length) return ''
  const max = Math.max(...percents)
  return t('subscription.billingCycle.discountHint', { max, period: activeCycleShortLabel.value })
})

const selectedPlan = computed(() =>
  props.plans.find((p) => p.slug === selectedPlanSlug.value) || null,
)

const selectedBilledTotal = computed(() =>
  selectedPlan.value ? planBilledTotal(selectedPlan.value) : 0,
)

const selectedMonthlyPrice = computed(() =>
  selectedPlan.value ? planMonthlyPrice(selectedPlan.value) : 0,
)

const canContinue = computed(() =>
  !!selectedPlan.value && selectedBilledTotal.value > 0,
)

const showMobileCta = computed(() => props.plans.length > 0 && !props.isLoading)

const popularityLabel = (plan: PlanViewItem) => {
  if (plan.badge && /popular|hit|популяр|хит/i.test(plan.badge)) return plan.badge
  if (plan.isFeatured) return plan.badge || t('subscription.pricing.tagPopular')
  return null
}

/** Concurrent toys at home — always from plan.toys_count, never from box template catalog. */
const toysCountLabel = (count: number) => {
  const n = Math.abs(Number(count) || 0) % 100
  const n1 = n % 10
  if (n > 10 && n < 20) return t('subscription.plural.toyMany')
  if (n1 === 1) return t('subscription.plural.toyOne')
  if (n1 >= 2 && n1 <= 4) return t('subscription.plural.toyFew')
  return t('subscription.plural.toyMany')
}

const exchangesCountLabel = (count: number) => {
  const n = Math.abs(Number(count) || 0) % 100
  const n1 = n % 10
  if (n > 10 && n < 20) return t('subscription.plural.exchangeMany')
  if (n1 === 1) return t('subscription.plural.exchangeOne')
  if (n1 >= 2 && n1 <= 4) return t('subscription.plural.exchangeFew')
  return t('subscription.plural.exchangeMany')
}

const selectPlanOption = (plan: PlanViewItem) => {
  selectedPlanSlug.value = plan.slug
}

const continueWithSelected = () => {
  if (!selectedPlan.value || !canContinue.value) return
  emit('select-plan', selectedPlan.value)
}

const openCompare = () => {
  if (import.meta.client) {
    savedScrollY.value = window.scrollY || window.pageYOffset || 0
  }
  isCompareOpen.value = true
}

const closeCompare = () => {
  isCompareOpen.value = false
  if (import.meta.client) {
    nextTick(() => {
      window.scrollTo(0, savedScrollY.value)
    })
  }
}

const onComparePick = (plan: PlanViewItem) => {
  selectedPlanSlug.value = plan.slug
  closeCompare()
}

const onPlanRadiogroupKeydown = (event: KeyboardEvent) => {
  const keys = ['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End']
  if (!keys.includes(event.key) || !props.plans.length) return
  event.preventDefault()

  const currentIdx = Math.max(
    0,
    props.plans.findIndex((p) => p.slug === selectedPlanSlug.value),
  )
  let nextIdx = currentIdx
  if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
    nextIdx = (currentIdx + 1) % props.plans.length
  } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
    nextIdx = (currentIdx - 1 + props.plans.length) % props.plans.length
  } else if (event.key === 'Home') {
    nextIdx = 0
  } else if (event.key === 'End') {
    nextIdx = props.plans.length - 1
  }

  const next = props.plans[nextIdx]
  if (!next) return
  selectedPlanSlug.value = next.slug
  nextTick(() => {
    const el = document.querySelector(
      `.mobile-plan-option[data-plan-slug="${CSS.escape(next.slug)}"]`,
    ) as HTMLElement | null
    el?.focus()
  })
}

watch(
  () => props.plans.map((p) => p.slug).join('|'),
  () => {
    if (!props.plans.length) {
      selectedPlanSlug.value = null
      return
    }
    if (selectedPlanSlug.value && props.plans.some((p) => p.slug === selectedPlanSlug.value)) {
      return
    }
    selectedPlanSlug.value = null
  },
  { immediate: true },
)

const fallbackInclusions = computed(() => [
  { icon: 'truck', iconImage: '', title: t('subscription.pricing.inclusionDeliveryTitle'), text: t('subscription.pricing.inclusionDeliveryText') },
  { icon: 'refresh', iconImage: '', title: t('subscription.pricing.inclusionExchangeTitle'), text: t('subscription.pricing.inclusionExchangeText') },
  { icon: 'sparkles', iconImage: '', title: t('subscription.pricing.inclusionDisinfectionTitle'), text: t('subscription.pricing.inclusionDisinfectionText') },
  { icon: 'snowflake', iconImage: '', title: t('subscription.pricing.inclusionFreezeTitle'), text: t('subscription.pricing.inclusionFreezeText') },
])

const resolveMediaUrl = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:')) return trimmed
  if (trimmed.startsWith('/')) return trimmed
  return `/${trimmed}`
}

const inclusions = computed(() => {
  const raw = pricingInclusions.value?.content as {
    cards?: Array<{ icon?: string; icon_image?: string; title?: string; text?: string }>
  } | null
  const cards = Array.isArray(raw?.cards) ? raw.cards : []
  const fromCms = cards
    .map((card) => ({
      icon: String(card?.icon || 'sparkles'),
      iconImage: resolveMediaUrl(String(card?.icon_image || '')),
      title: String(card?.title || '').trim(),
      text: String(card?.text || '').trim(),
    }))
    .filter((card) => card.title || card.text)

  return fromCms.length ? fromCms : fallbackInclusions.value
})
</script>
