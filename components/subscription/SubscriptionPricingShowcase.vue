<template>
  <section class="pricing-showcase-view">
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
        <div class="billing-switcher">
          <button
            class="switch-tab-btn"
            type="button"
            :class="{ active: billingCycle === 'monthly' }"
            @click="billingCycle = 'monthly'"
          >
            Ежемесячно
          </button>
          <button
            class="switch-tab-btn"
            type="button"
            :class="{ active: billingCycle === 'semiannual' }"
            @click="billingCycle = 'semiannual'"
          >
            <span>6 месяцев</span>
            <span class="save-badge">1 мес в подарок</span>
          </button>
          <button
            class="switch-tab-btn"
            type="button"
            :class="{ active: billingCycle === 'annual' }"
            @click="billingCycle = 'annual'"
          >
            <span>12 месяцев</span>
            <span class="save-badge gold">2 мес в подарок</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="plans.length > 0" class="mobile-sub-pills">
      <button
        v-for="(p, pIdx) in plans"
        :key="pIdx"
        class="sub-pill-btn"
        type="button"
        :class="{ active: activeMobilePlan === pIdx }"
        @click="$emit('scroll-mobile-plan', pIdx)"
      >
        {{ p.name }} {{ p.badge ? '★ ' + p.badge : '' }}
      </button>
    </div>

    <div v-if="isLoading" class="plans-empty-state">
      <p>Загружаем тарифные планы...</p>
    </div>

    <div v-else-if="plans.length === 0" class="plans-empty-state">
      <div class="plans-empty-icon">📦</div>
      <h3>Тарифы пока не настроены</h3>
      <p>Активные тарифные планы появятся здесь после добавления их в админ-панели.</p>
    </div>

    <div v-else class="pricing-cards-grid">
      <div
        v-for="(plan, pIdx) in plans"
        :key="plan.slug || pIdx"
        class="pricing-plan-card"
        :class="{ 'featured-plan': plan.isFeatured }"
      >
        <div v-if="plan.isFeatured || plan.badge" class="popular-ribbon">
          🔥 {{ plan.badge || 'САМЫЙ ПОПУЛЯРНЫЙ' }}
        </div>

        <div class="card-top-head">
          <span class="plan-type-tag" :class="{ featured: plan.isFeatured }">
            {{ plan.badge || (pIdx === 0 ? 'Для старта' : plan.isFeatured ? 'Хит развития' : 'Максимальный набор') }}
          </span>
          <h3 class="plan-title">{{ plan.name }}</h3>
          <p class="plan-desc">{{ plan.description }}</p>
        </div>

        <div class="plan-pricing-box">
          <div class="price-display">
            <span class="price-amount" :class="{ featured: plan.isFeatured }">
              {{ formatPrice(planMonthlyPrice(plan)) }} ₸
            </span>
            <span class="price-period">/ месяц</span>
          </div>
          <span v-if="billingCycle !== 'monthly'" class="billed-note">
            Списание {{ formatPrice(planBilledTotal(plan)) }} ₸ за период
          </span>
        </div>

        <div class="preview-toys-action-wrap">
          <button type="button" class="preview-set-btn" @click="$emit('preview-toys', plan)">
            👁 Посмотреть игрушки в тарифе ({{ plan.toys_count }} шт.) →
          </button>
        </div>

        <div class="plan-divider" />

        <ul class="plan-perks-list">
          <li v-for="(feat, fIdx) in plan.features" :key="fIdx">
            <span class="check-icon" :class="{ featured: plan.isFeatured }">✓</span>
            <span>{{ feat }}</span>
          </li>
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

    <div v-if="plans.length > 0" class="extra-toys-banner">
      <div class="extra-toys-content">
        <div class="extra-icon">🧩</div>
        <div class="extra-text">
          <h4>Нужно больше игрушек в коробке?</h4>
          <p>
            Вы можете добавить дополнительные развивающие игрушки к любому тарифу всего за
            <strong>+{{ formatPrice(extraToyUnitPrice) }} ₸ / шт</strong> в месяц.
          </p>
        </div>
      </div>
      <div class="extra-counter-box">
        <button class="extra-step-btn" type="button" @click="extraToysCount > 0 && extraToysCount--">-</button>
        <span class="extra-step-val">+{{ extraToysCount }} игрушек</span>
        <button class="extra-step-btn" type="button" @click="extraToysCount++">+</button>
      </div>
    </div>

    <section class="inclusions-section">
      <h2 class="inclusions-title">Что входит в каждую подписку Alpha</h2>
      <div class="inclusions-grid">
        <div v-for="item in inclusions" :key="item.title" class="inclusion-card">
          <div class="inc-icon">{{ item.icon }}</div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.text }}</p>
        </div>
      </div>
    </section>

    <section class="faq-section">
      <h2 class="faq-heading">Часто задаваемые вопросы</h2>
      <div class="faq-list">
        <div
          v-for="(item, idx) in faqs"
          :key="idx"
          class="faq-card"
          :class="{ open: openFaq === idx }"
          @click="openFaq = openFaq === idx ? null : idx"
        >
          <div class="faq-header">
            <h3>{{ item.q }}</h3>
            <span class="faq-toggle">{{ openFaq === idx ? '−' : '+' }}</span>
          </div>
          <div v-if="openFaq === idx" class="faq-body">
            <p>{{ item.a }}</p>
          </div>
        </div>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import type { PlanViewItem } from '~/composables/useSubscriptionPricing'

const props = defineProps<{
  plans: PlanViewItem[]
  isLoading: boolean
  isLoggedIn: boolean
  showBackToDashboard: boolean
  activeMobilePlan: number
  faqs: Array<{ q: string; a: string }>
}>()

defineEmits<{
  'back-to-dashboard': []
  'select-plan': [plan: PlanViewItem]
  'preview-toys': [plan: PlanViewItem]
  'scroll-mobile-plan': [index: number]
}>()

const billingCycle = defineModel<'monthly' | 'semiannual' | 'annual'>('billingCycle', { required: true })
const extraToysCount = defineModel<number>('extraToysCount', { required: true })

const openFaq = ref<number | null>(0)

const { formatPrice, calcPlanPrice, calcBilledTotal } = useSubscriptionPricing()

const extraToyUnitPrice = computed(() => props.plans[0]?.extra_toy_price || 2500)

const planMonthlyPrice = (plan: PlanViewItem) =>
  calcPlanPrice(plan, billingCycle.value, extraToysCount.value)

const planBilledTotal = (plan: PlanViewItem) =>
  calcBilledTotal(plan, billingCycle.value, extraToysCount.value)

const inclusions = [
  { icon: '🚚', title: 'Бесплатная доставка и обмен', text: 'Курьер привозит свежий продезинфицированный набор и сразу забирает предыдущий. Никаких поездок в пункты выдачи.' },
  { icon: '🧼', title: 'Медицинская дезинфекция', text: '4 ступени очистки: обработка паром высокой температуры, озонирование и запечатывание в индивидуальные хлопковые мешочки.' },
  { icon: '🛡️', title: 'Страховка от поломок', text: 'Если ребенок случайно сломает или потеряет 1–2 детали, мы не требуем доплат и штрафов. Это покрывается нашей гарантией.' },
  { icon: '❄️', title: 'Гибкая заморозка', text: 'Уезжаете в отпуск или на дачу? Заморозьте подписку на 7, 14 или 30 дней в 1 клик, сохранив оплаченные дни.' },
]
</script>
