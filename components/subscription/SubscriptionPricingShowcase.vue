<template>
  <section class="pricing-showcase-view" :class="{ 'has-mobile-cta': showMobileCta }">
    <button
      v-if="showBackToDashboard"
      class="back-to-sub-btn"
      type="button"
      @click="$emit('back-to-dashboard')"
    >
      ← Вернуться к управлению активной подпиской
    </button>

    <div class="pricing-hero-header">
      <span class="hero-tag">ТАРИФНЫЕ ПЛАНЫ ALPHA</span>
      <h1 class="pricing-hero-title">
        Простая и гибкая подписка на развивающие эко-игрушки
      </h1>
      <p class="pricing-hero-subtitle">
        Регулярный обмен наборов Монтессори без захламления квартиры. Бесплатная курьерская доставка, медицинская дезинфекция и персональный подбор методистом.
      </p>

      <div v-if="plans.length > 0" class="billing-switcher-wrapper">
        <div class="billing-switcher" role="group" aria-label="Срок подписки">
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
      <p>Загружаем тарифные планы...</p>
    </div>

    <div v-else-if="error && plans.length === 0" class="plans-empty-state plans-error-state">
      <AppIcon name="alert" :size="40" class="plans-empty-icon" />
      <h3>Не удалось загрузить тарифы</h3>
      <p>{{ error }}</p>
      <button
        v-if="canRetry"
        type="button"
        class="plans-retry-btn"
        @click="$emit('retry')"
      >
        Попробовать снова
      </button>
    </div>

    <div v-else-if="plans.length === 0" class="plans-empty-state">
      <AppIcon name="package" :size="40" class="plans-empty-icon" />
      <h3>Тарифы пока не настроены</h3>
      <p>Активные тарифные планы появятся здесь после добавления их в админ-панели.</p>
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
            <AppIcon name="bolt" :size="14" class="inline-icon" /> {{ plan.badge || 'САМЫЙ ПОПУЛЯРНЫЙ' }}
          </div>

          <div class="card-top-head">
            <span class="plan-type-tag" :class="{ featured: plan.isFeatured }">
              {{ plan.badge || (pIdx === 0 ? 'Для старта' : plan.isFeatured ? 'Хит развития' : 'Максимальный набор') }}
            </span>
            <h3 class="plan-title">{{ plan.name }}</h3>
            <p class="plan-desc">{{ plan.description }}</p>
            <p class="plan-toys-meta">
              <strong>{{ plan.toys_count }}</strong>
              {{ toysCountLabel(plan.toys_count) }} дома одновременно
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
              <span class="price-period">/ месяц</span>
            </div>
            <div v-if="billingCycle !== 'monthly'" class="billing-summary">
              <span class="billed-note">Списание {{ formatPrice(planBilledTotal(plan)) }} ₸ за период</span>
              <span v-if="planHasDiscount(plan)" class="saving-note">
                Экономия {{ formatPrice(planPeriodSavings(plan)) }} ₸
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
              Посмотреть примеры боксов →
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
                :aria-label="`${feat} — недоступно в тарифе ${plan.name}`"
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
            {{ isLoggedIn ? `Выбрать тариф ${plan.name}` : 'Оформить подписку' }}
          </button>
        </div>
      </div>

      <!-- Mobile compact options -->
      <div class="mobile-plans-block">
        <div class="mobile-plans-list-head">
          <h2 class="mobile-plans-list-title">Тарифы</h2>
          <button
            type="button"
            class="plans-compare-text-btn"
            @click="openCompare"
          >
            Сравнить тарифы
          </button>
        </div>

        <div
          class="mobile-plan-options"
          role="radiogroup"
          aria-label="Выбор тарифа"
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
                {{ plan.exchanges_count }} {{ exchangesCountLabel(plan.exchanges_count) }} в месяц
              </p>

              <button
                type="button"
                class="mobile-plan-includes-btn"
                @click.stop="$emit('preview-toys', plan)"
              >
                Что входит →
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
          <h4>Хотите ещё больше игрушек?</h4>
          <p>
            В тарифе уже есть свой набор. Если нужно больше — оформите дополнительную игрушку
            как обычную аренду. Мы отправим её вместе с набором подписки.
          </p>
        </div>
      </div>
      <NuxtLink to="/short-rent?from=subscription" class="extra-rent-cta">
        Выбрать игрушку в аренду
        <span aria-hidden="true">→</span>
      </NuxtLink>
    </div>

    <section class="inclusions-section">
      <h2 class="inclusions-title">Что входит в каждую подписку Alpha</h2>
      <div class="inclusions-grid">
        <div v-for="item in inclusions" :key="item.title" class="inclusion-card">
          <div class="inc-icon"><AppIcon :name="item.icon" :size="24" /></div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.text }}</p>
        </div>
      </div>
    </section>

    <section v-if="faqs.length" class="faq-section">
      <h2 class="faq-heading">Часто задаваемые вопросы</h2>
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
      aria-label="Оформление выбранного тарифа"
    >
      <div class="mobile-checkout-bar-info">
        <p class="mobile-checkout-bar-plan">
          <template v-if="selectedPlan">
            {{ selectedPlan.name }} · {{ activeCycleShortLabel }}
          </template>
          <template v-else>
            Выберите тариф
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
              {{ formatPrice(selectedMonthlyPrice) }} ₸ / мес
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
        Продолжить
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

const billingCycle = defineModel<BillingCycle>('billingCycle', { required: true })

const openFaq = ref<number | null>(0)
const isCompareOpen = ref(false)
const selectedPlanSlug = ref<string | null>(null)
const savedScrollY = ref(0)

const billingCycleOptions: Array<{
  value: BillingCycle
  desktopLabel: string
  mobileLabel: string
  badge?: string
  badgeGold?: boolean
}> = [
  { value: 'monthly', desktopLabel: 'Ежемесячно', mobileLabel: '1 мес.' },
  { value: 'quarterly', desktopLabel: '3 месяца', mobileLabel: '3 мес.', badge: 'Скидка' },
  { value: 'semiannual', desktopLabel: '6 месяцев', mobileLabel: '6 мес.', badge: 'Больше выгоды' },
  { value: 'annual', desktopLabel: '12 месяцев', mobileLabel: '12 мес.', badge: 'Макс. выгода', badgeGold: true },
]

const { formatPrice, calcPlanPrice, calcBilledTotal, billingCycleMonths } = useSubscriptionPricing()

const activeCycleDesktopLabel = computed(() =>
  billingCycleOptions.find((o) => o.value === billingCycle.value)?.desktopLabel || 'Ежемесячно',
)

const activeCycleShortLabel = computed(() =>
  billingCycleOptions.find((o) => o.value === billingCycle.value)?.mobileLabel || '1 мес.',
)

const periodPriceSuffix = computed(() => {
  if (billingCycle.value === 'monthly') return '/ мес'
  if (billingCycle.value === 'quarterly') return '/ 3 мес'
  if (billingCycle.value === 'semiannual') return '/ 6 мес'
  return '/ 12 мес'
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
  return `Скидка до ${max}% при оплате за ${activeCycleShortLabel.value}`
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
  if (plan.badge && /популяр|хит/i.test(plan.badge)) return plan.badge
  if (plan.isFeatured) return plan.badge || 'Популярный'
  return null
}

/** Concurrent toys at home — always from plan.toys_count, never from box template catalog. */
const toysCountLabel = (count: number) => {
  const n = Math.abs(Number(count) || 0) % 100
  const n1 = n % 10
  if (n > 10 && n < 20) return 'игрушек'
  if (n1 === 1) return 'игрушка'
  if (n1 >= 2 && n1 <= 4) return 'игрушки'
  return 'игрушек'
}

const exchangesCountLabel = (count: number) => {
  const n = Math.abs(Number(count) || 0) % 100
  const n1 = n % 10
  if (n > 10 && n < 20) return 'обменов'
  if (n1 === 1) return 'обмен'
  if (n1 >= 2 && n1 <= 4) return 'обмена'
  return 'обменов'
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

const inclusions = [
  { icon: 'truck', title: 'Бесплатная доставка', text: 'Курьер привезёт набор игрушек прямо к вашей двери. Никаких поездок в пункты выдачи.' },
  { icon: 'refresh', title: 'Обмен игрушек', text: 'Выбирайте новый набор по условиям вашего тарифа. Курьер привезёт его и заберёт предыдущий.' },
  { icon: 'sparkles', title: 'Медицинская дезинфекция', text: '4 ступени очистки: обработка паром высокой температуры, озонирование и запечатывание в индивидуальные хлопковые мешочки.' },
  { icon: 'snowflake', title: 'Гибкая заморозка', text: 'Уезжаете в отпуск или на дачу? Один раз выберите срок от 1 до 30 дней — оплаченные дни сохранятся.' },
]
</script>
