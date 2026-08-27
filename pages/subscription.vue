<template>
  <div class="subscription-page">
    <TheHeader />

    <main class="container page-content">
      <!-- IF USER HAS ACTIVE SUBSCRIPTION: Dashboard View -->
      <section v-if="user && hasActiveSubscription && !showAllPlans" class="active-sub-view">
        <!-- Section Header -->
        <div class="sub-header-section">
          <div class="header-left">
            <h1 class="sub-main-title">Управление подпиской</h1>
            <p class="sub-subtitle">
              Ваш текущий тариф активен. Управляйте наборами и условиями.
            </p>

            <div class="decor-row">
              <span class="purple-dot"></span>
              <span class="yellow-star">★</span>
            </div>
          </div>

          <div class="header-right">
            <button class="view-plans-toggle-btn" @click="showAllPlans = true">
              Сменить или посмотреть все тарифы →
            </button>
          </div>
        </div>

        <!-- Main Subscription Grid -->
        <div class="sub-grid-section">
          <!-- LEFT: Active Plan Card -->
          <div class="plan-card">
            <div class="plan-badge-row">
              <span class="active-badge">АКТИВЕН</span>
            </div>

            <h2 class="plan-name">{{ currentPlan.name }}</h2>

            <div class="plan-price-row">
              <span class="plan-price">{{ currentPlan.price }}</span>
              <span class="plan-period">/ месяц</span>
            </div>

            <ul class="plan-features">
              <li v-for="(feat, idx) in currentPlan.features" :key="idx">
                <span class="feat-dot">●</span>
                <span>{{ feat }}</span>
              </li>
            </ul>

            <div class="plan-actions-group">
              <button class="change-plan-btn" @click="showAllPlans = true">
                Изменить тарифный план
              </button>
              <button class="freeze-btn" @click="freezeSubscription">
                Заморозить подписку
              </button>
            </div>
          </div>

          <!-- RIGHT: Two Stacked Cards -->
          <div class="right-stack">
            <!-- Next Payment Card -->
            <div class="status-card payment-card">
              <div class="card-text-col">
                <span class="card-small-label">Следующее списание</span>
                <h3 class="card-main-val">{{ nextBillingDate }}</h3>
                <p class="card-sub-info">{{ currentPlan.price }} • продление подписки</p>
              </div>

              <div class="avatars-decor">
                <div class="face-avatar peach-face">
                  <span class="face-eye left"></span>
                  <span class="face-eye right"></span>
                  <span class="face-mouth line"></span>
                </div>
                <div class="face-avatar blue-face">
                  <span class="face-eye left"></span>
                  <span class="face-eye right"></span>
                  <span class="face-mouth smile"></span>
                </div>
              </div>
            </div>

            <!-- Limit Usage Card -->
            <div class="status-card limit-card">
              <span class="card-small-label">Текущая утилизация лимита</span>
              <h3 class="card-main-val">{{ toysInUse }} из {{ toysLimit }} игрушек дома</h3>
              
              <!-- Progress Bar -->
              <div class="progress-track">
                <div 
                  class="progress-fill" 
                  :style="{ width: `${(toysInUse / toysLimit) * 100}%` }"
                ></div>
              </div>

              <div class="limit-footer">
                <NuxtLink to="/cabinet" class="to-my-kit-link">Посмотреть игрушки в наборе →</NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- PUBLIC / SHOWCASE PRICING VIEW (Kiddos Toys Club Inspired in Alpha Style) -->
      <section v-else class="pricing-showcase-view">
        <!-- Return button if user was in active sub view -->
        <button 
          v-if="user && hasActiveSubscription" 
          class="back-to-sub-btn" 
          @click="showAllPlans = false"
        >
          ← Вернуться к управлению активной подпиской
        </button>

        <!-- Top Header -->
        <div class="pricing-hero-header">
          <h1 class="pricing-hero-title">
            Простая и гибкая подписка на развивающие эко-игрушки
          </h1>
          <p class="pricing-hero-subtitle">
            Регулярный обмен наборов Монтессори без захламления квартиры. Бесплатная курьерская доставка, медицинская дезинфекция и персональный подбор методистом.
          </p>

          <!-- Billing Cycle Switcher (Monthly / 6 Months / 12 Months) -->
          <div class="billing-switcher-wrapper">
            <div class="billing-switcher">
              <button 
                class="switch-tab-btn" 
                :class="{ active: billingCycle === 'monthly' }"
                @click="billingCycle = 'monthly'"
              >
                Ежемесячно
              </button>
              <button 
                class="switch-tab-btn" 
                :class="{ active: billingCycle === 'semiannual' }"
                @click="billingCycle = 'semiannual'"
              >
                <span>6 месяцев</span>
                <span class="save-badge">1 мес в подарок</span>
              </button>
              <button 
                class="switch-tab-btn" 
                :class="{ active: billingCycle === 'annual' }"
                @click="billingCycle = 'annual'"
              >
                <span>12 месяцев</span>
                <span class="save-badge gold">2 мес в подарок</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile Plan Quick Tabs -->
        <div class="mobile-sub-pills">
          <button 
            v-for="(p, pIdx) in displayPlans" 
            :key="pIdx"
            class="sub-pill-btn"
            :class="{ active: activeMobileSubPlan === pIdx }"
            @click="scrollToMobileSubPlan(pIdx)"
          >
            {{ p.name }} {{ p.badge ? '★ ' + p.badge : '' }}
          </button>
        </div>

        <!-- Dynamic Pricing Cards Grid -->
        <div class="pricing-cards-grid">
          <div 
            v-for="(plan, pIdx) in displayPlans" 
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
                  {{ formatPrice(calcPlanPrice(plan)) }} ₸
                </span>
                <span class="price-period">/ месяц</span>
              </div>
              <span v-if="billingCycle !== 'monthly'" class="billed-note">
                Списание {{ formatPrice(calcBilledTotal(plan)) }} ₸ за период
              </span>
            </div>

            <div class="plan-divider"></div>

            <ul class="plan-perks-list">
              <li v-for="(feat, fIdx) in plan.features" :key="fIdx">
                <span class="check-icon" :class="{ featured: plan.isFeatured }">✓</span>
                <span>{{ feat }}</span>
              </li>
            </ul>

            <button 
              class="select-plan-btn" 
              :class="{ featured: plan.isFeatured }"
              @click="handleSelectPlan(plan.name, calcPlanPrice(plan))"
            >
              {{ user ? `Выбрать тариф ${plan.name}` : 'Оформить подписку' }}
            </button>
          </div>
        </div>

        <!-- Custom Add Extra Toys (Like Kiddos Feature) -->
        <div class="extra-toys-banner">
          <div class="extra-toys-content">
            <div class="extra-icon">🧩</div>
            <div class="extra-text">
              <h4>Нужно больше игрушек в коробке?</h4>
              <p>Вы можете добавить дополнительные развивающие игрушки к любому тарифу всего за <strong>+2 500 ₸ / шт</strong> в месяц.</p>
            </div>
          </div>
          <div class="extra-counter-box">
            <button class="extra-step-btn" @click="extraToysCount > 0 && extraToysCount--">-</button>
            <span class="extra-step-val">+{{ extraToysCount }} игрушек</span>
            <button class="extra-step-btn" @click="extraToysCount++">+</button>
          </div>
        </div>

        <!-- What is Included in Every Plan -->
        <section class="inclusions-section">
          <h2 class="inclusions-title">Что входит в каждую подписку Alpha</h2>
          <div class="inclusions-grid">
            <div class="inclusion-card">
              <div class="inc-icon">🚚</div>
              <h3>Бесплатная доставка и обмен</h3>
              <p>Курьер привозит свежий продезинфицированный набор и сразу забирает предыдущий. Никаких поездок в пункты выдачи.</p>
            </div>

            <div class="inclusion-card">
              <div class="inc-icon">🧼</div>
              <h3>Медицинская дезинфекция</h3>
              <p>4 ступени очистки: обработка паром высокой температуры, озонирование и запечатывание в индивидуальные хлопковые мешочки.</p>
            </div>

            <div class="inclusion-card">
              <div class="inc-icon">🛡️</div>
              <h3>Страховка от поломок</h3>
              <p>Если ребенок случайно сломает или потеряет деталь — мы не штрафуем. Мы понимаем, как играют дети.</p>
            </div>

            <div class="inclusion-card">
              <div class="inc-icon">⏸️</div>
              <h3>Гибкая заморозка</h3>
              <p>Уезжаете в отпуск или гости? Заморозьте подписку в один клик в профиле на срок до 60 дней бесплатно.</p>
            </div>
          </div>
        </section>

        <!-- FAQ Section -->
        <section class="sub-faq-section">
          <h2 class="inclusions-title">Часто задаваемые вопросы</h2>
          <div class="faq-accordion-list">
            <div 
              v-for="(faq, idx) in faqs" 
              :key="idx"
              class="faq-acc-item"
              :class="{ open: openFaq === idx }"
            >
              <button class="faq-acc-header" @click="openFaq = openFaq === idx ? null : idx">
                <span>{{ faq.q }}</span>
                <span class="faq-acc-icon">{{ openFaq === idx ? '−' : '+' }}</span>
              </button>
              <div v-show="openFaq === idx" class="faq-acc-body">
                <p>{{ faq.a }}</p>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>

    <!-- Subscription Checkout Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isSubModalOpen" class="modal-overlay" @click.self="isSubModalOpen = false">
          <div class="sub-modal-card">
            <button class="close-btn" @click="isSubModalOpen = false">&times;</button>
            <h2 class="sub-modal-title">Оформление подписки 🧸</h2>
            <p class="sub-modal-desc">
              Тариф <strong>{{ selectedPlanName }}</strong> ({{ billingCycle === 'monthly' ? 'Ежемесячно' : billingCycle === 'semiannual' ? '6 месяцев' : '12 месяцев' }})
            </p>

            <div class="modal-price-summary">
              <span>Сумма к оплате:</span>
              <strong>{{ formatPrice(selectedPlanPrice) }} ₸</strong>
            </div>

            <div class="payment-methods-box">
              <label class="pay-method-radio">
                <input type="radio" name="sub_pay" value="kaspi" checked />
                <span>Оплата Kaspi QR / Счет</span>
              </label>
              <label class="pay-method-radio">
                <input type="radio" name="sub_pay" value="card" />
                <span>Банковской картой онлайн (Visa / Mastercard)</span>
              </label>
            </div>

            <button class="confirm-sub-btn" @click="activateSubscription">
              Оплатить и активировать подписку
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import TheHeader from '~/components/TheHeader.vue'

const { user, openAuthModal } = useAuth()
const { plans: apiPlans, fetchPlans } = useSubscriptionPlans()

onMounted(async () => {
  await fetchPlans()
})

interface PlanViewItem {
  id?: number
  name: string
  slug: string
  badge?: string | null
  description: string
  price_monthly: number
  price_semiannual: number
  price_annual: number
  toys_count: number
  exchanges_count: number
  extra_toy_price: number
  features: string[]
  isFeatured?: boolean
}

// Fallback plans if API is loading or empty
const defaultPlansList: PlanViewItem[] = [
  {
    name: 'Starter',
    slug: 'starter',
    badge: 'Базовый',
    description: '3 развивающие игрушки по возрасту ребенка.',
    price_monthly: 14900,
    price_semiannual: 12900,
    price_annual: 11900,
    toys_count: 3,
    exchanges_count: 1,
    extra_toy_price: 2500,
    isFeatured: false,
    features: [
      '3 игрушки в каждом комплекте',
      '1 бесплатный обмен в месяц',
      'Бесплатная доставка и забор курьером',
      '4-ступенчатая дезинфекция озоном',
      'Скидка -15% на выкуп игрушек навсегда'
    ]
  },
  {
    name: 'Explorer',
    slug: 'explorer',
    badge: 'Хит продаж',
    description: '5 игрушек Монтессори + план развития от методиста.',
    price_monthly: 22900,
    price_semiannual: 19900,
    price_annual: 17900,
    toys_count: 5,
    exchanges_count: 1,
    extra_toy_price: 2500,
    isFeatured: true,
    features: [
      '5 игрушек в каждом комплекте',
      '1 бесплатный обмен в месяц',
      'Индивидуальный план развития ребенка',
      'Онлайн-чат с ведущим методистом Алия',
      'Бесплатная курьерская доставка по адресу',
      'Скидка -25% на выкуп игрушек навсегда'
    ]
  },
  {
    name: 'Max',
    slug: 'max',
    badge: 'Премиум',
    description: '8 премиум-игрушек и частый обмен для активных детей.',
    price_monthly: 34900,
    price_semiannual: 29900,
    price_annual: 26900,
    toys_count: 8,
    exchanges_count: 2,
    extra_toy_price: 2500,
    isFeatured: false,
    features: [
      '8 премиальных игрушек в комплекте',
      '2 бесплатных обмена в месяц',
      'Возможность разделить набор на двоих детей',
      'Приоритетная доставка курьером в удобное время',
      'Скидка -40% на выкуп игрушек навсегда'
    ]
  }
]

const displayPlans = computed<PlanViewItem[]>(() => {
  if (apiPlans.value && apiPlans.value.length > 0) {
    return apiPlans.value.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      badge: p.badge,
      description: p.description || '',
      price_monthly: p.price_monthly,
      price_semiannual: p.price_semiannual || p.price_monthly,
      price_annual: p.price_annual || p.price_monthly,
      toys_count: p.toys_count,
      exchanges_count: p.exchanges_count,
      extra_toy_price: p.extra_toy_price || 2500,
      isFeatured: p.slug === 'explorer' || (p.badge ? p.badge.toLowerCase().includes('хит') || p.badge.toLowerCase().includes('популярный') : false),
      features: Array.isArray(p.features) && p.features.length > 0 ? p.features : [
        `${p.toys_count} развивающих игрушек дома`,
        `${p.exchanges_count} бесплатный обмен(а) в месяц`,
        'Бесплатная курьерская доставка',
        'Медицинская дезинфекция паром и озоном'
      ]
    }))
  }
  return defaultPlansList
})

// State: whether user has an active subscription
const hasActiveSubscription = ref(false) // becomes true after selecting and activating a plan
const showAllPlans = ref(false)
const extraToysCount = ref<number>(0)
const billingCycle = ref<'monthly' | 'semiannual' | 'annual'>('monthly')
const activeMobileSubPlan = ref(1)

const scrollToMobileSubPlan = (idx: number) => {
  activeMobileSubPlan.value = idx
  const grid = document.querySelector('.pricing-cards-grid')
  if (grid) {
    const cards = grid.querySelectorAll('.pricing-plan-card')
    if (cards[idx]) {
      cards[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }
}

const openFaq = ref<number | null>(0)
const isSubModalOpen = ref(false)
const selectedPlanName = ref('Explorer')
const selectedPlanPrice = ref(22900)

// Active Plan Dashboard Data
const currentPlan = ref({
  name: 'Explorer',
  price: '22 900 ₸',
  features: [
    '5 развивающих игрушек дома одновременно',
    '1 бесплатный обмен набора в месяц',
    'Персональный план развития от методиста',
    'Бесплатная курьерская доставка по Алматы',
    'Скидка 25% на выкуп любых игрушек навсегда'
  ]
})

const nextBillingDate = ref('24 сентября 2026')
const toysInUse = ref(4)
const toysLimit = ref(5)

const calcPlanPrice = (plan: PlanViewItem) => {
  const extraCost = extraToysCount.value * (plan.extra_toy_price || 2500)
  const base = billingCycle.value === 'semiannual' 
    ? plan.price_semiannual 
    : billingCycle.value === 'annual' 
      ? plan.price_annual 
      : plan.price_monthly
  return base + extraCost
}

const calcBilledTotal = (plan: PlanViewItem) => {
  const months = billingCycle.value === 'semiannual' ? 5 : billingCycle.value === 'annual' ? 10 : 1
  return calcPlanPrice(plan) * months
}

const getPlanPrice = (planKey: 'starter' | 'explorer' | 'max') => {
  const found = displayPlans.value.find(p => p.slug === planKey)
  if (found) return calcPlanPrice(found)
  const fallback = defaultPlansList.find(p => p.slug === planKey)!
  return calcPlanPrice(fallback)
}

const getBilledTotal = (planKey: 'starter' | 'explorer' | 'max') => {
  const found = displayPlans.value.find(p => p.slug === planKey)
  if (found) return calcBilledTotal(found)
  const fallback = defaultPlansList.find(p => p.slug === planKey)!
  return calcBilledTotal(fallback)
}

const handleSelectPlan = (name: string, price: number) => {
  if (!user.value) {
    openAuthModal('login')
    return
  }
  selectedPlanName.value = name
  selectedPlanPrice.value = price
  isSubModalOpen.value = true
}

const activateSubscription = () => {
  hasActiveSubscription.value = true
  showAllPlans.value = false
  isSubModalOpen.value = false
  currentPlan.value.name = selectedPlanName.value
  currentPlan.value.price = `${formatPrice(selectedPlanPrice.value)} ₸`
  alert(`Подписка по тарифу «${selectedPlanName.value}» успешно оформлена и активирована! 🎁`)
}

const freezeSubscription = () => {
  alert('Подписка успешно заморожена на 30 дней. Следующее списание перенесено.')
}

const formatPrice = (val: number) => {
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

const faqs = [
  {
    q: 'Что если ребенок потеряет или сломает деталь?',
    a: 'Мы понимаем, что дети активно познают мир. Мелкие царапины, потертости или потеря 1–2 небольших деталей полностью покрываются нашей страховкой без дополнительных штрафов.'
  },
  {
    q: 'Как проходит процедура обмена набора?',
    a: 'За 3 дня до даты обмена методист предложит вам новый набор на выбор в профиле. Курьер приедет в выбранное вами время, привезет новый комплект и сразу заберет старый.'
  },
  {
    q: 'Как проходит дезинфекция игрушек?',
    a: 'Все игрушки проходят 4-ступенчатую обработку: очистка сертифицированными гипоаллергенными эко-средствами, обработка сухим горячим паром, озонирование и упаковка в индивидуальный мешочек.'
  },
  {
    q: 'Можно ли выкупить понравившуюся игрушку?',
    a: 'Да! Подписчикам Alpha предоставляется специальная скидка от 15% до 40% на выкуп любой игрушки из текущего набора навсегда.'
  }
]
</script>

<style scoped>
.subscription-page {
  min-height: 100vh;
  background-color: #FFF8F0;
  color: #1A1A2E;
  font-family: 'DM Sans', sans-serif;
  padding-bottom: 90px;
}

.container {
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-content {
  padding-top: 32px;
}

/* ACTIVE SUB DASHBOARD STYLES */
.sub-header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 36px;
}

.section-badge {
  display: inline-block;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 11.5px;
  color: #7C5CFC;
  letter-spacing: 1.5px;
  margin-bottom: 8px;
}

.sub-main-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 38px;
  color: #1A1A2E;
  line-height: 1.15;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.sub-subtitle {
  font-size: 15px;
  color: #7B7B93;
}

.decor-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

.purple-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #7C5CFC;
}

.yellow-star {
  color: #FFD166;
  font-size: 14px;
}

.view-plans-toggle-btn {
  background: #FFFFFF;
  border: 1.5px solid #E2E2EC;
  padding: 10px 20px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 14px;
  color: #7C5CFC;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
}

.view-plans-toggle-btn:hover {
  border-color: #7C5CFC;
  background: #F8F6FF;
}

.sub-grid-section {
  display: grid;
  grid-template-columns: 1.25fr 1fr;
  gap: 28px;
}

.plan-card {
  background: #FFFFFF;
  border-radius: 28px;
  padding: 36px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
}

.plan-badge-row {
  margin-bottom: 14px;
}

.active-badge {
  background: #D9F7EC;
  color: #06D6A0;
  font-size: 11px;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 20px;
  letter-spacing: 0.5px;
}

.plan-name {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 32px;
  color: #1A1A2E;
  margin-bottom: 6px;
}

.plan-price-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 24px;
}

.plan-price {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 28px;
  color: #7C5CFC;
}

.plan-period {
  font-size: 14px;
  color: #7B7B93;
}

.plan-features {
  list-style: none;
  padding: 0;
  margin: 0 0 32px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.plan-features li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14.5px;
  color: #4A4A68;
}

.feat-dot {
  color: #7C5CFC;
  font-size: 8px;
}

.plan-actions-group {
  margin-top: auto;
  display: flex;
  gap: 12px;
}

.change-plan-btn {
  flex: 1;
  background: #624CE0;
  color: #FFFFFF;
  border: none;
  font-weight: 700;
  font-size: 14px;
  padding: 14px 20px;
  border-radius: 14px;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(98, 76, 224, 0.25);
  transition: all 0.2s ease;
}

.change-plan-btn:hover {
  background: #513bc7;
}

.freeze-btn {
  background: #F4F4F8;
  color: #4A4A68;
  border: none;
  font-weight: 700;
  font-size: 14px;
  padding: 14px 18px;
  border-radius: 14px;
  cursor: pointer;
}

.right-stack {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.status-card {
  background: #FFFFFF;
  border-radius: 24px;
  padding: 28px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
}

.payment-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-small-label {
  display: block;
  font-size: 12.5px;
  color: #7B7B93;
  margin-bottom: 6px;
}

.card-main-val {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 22px;
  color: #1A1A2E;
  margin-bottom: 4px;
}

.card-sub-info {
  font-size: 13px;
  color: #7B7B93;
}

.avatars-decor {
  display: flex;
  align-items: center;
  gap: 8px;
}

.face-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  position: relative;
}

.peach-face { background: #FFD4C2; }
.blue-face { background: #C2E3FF; }

.face-eye {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #1A1A2E;
  border-radius: 50%;
  top: 16px;
}
.face-eye.left { left: 12px; }
.face-eye.right { right: 12px; }

.face-mouth {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  background: #1A1A2E;
}
.face-mouth.line {
  width: 8px;
  height: 2px;
  border-radius: 2px;
}
.face-mouth.smile {
  width: 10px;
  height: 5px;
  background: transparent;
  border-bottom: 2px solid #1A1A2E;
  border-radius: 0 0 10px 10px;
}

.progress-track {
  width: 100%;
  height: 10px;
  background: #F4F4F8;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 14px;
  margin-bottom: 14px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #7C5CFC, #06D6A0);
  border-radius: 10px;
}

.to-my-kit-link {
  font-size: 13px;
  color: #7C5CFC;
  font-weight: 700;
  text-decoration: none;
}

/* SHOWCASE PRICING VIEW STYLES */
.back-to-sub-btn {
  background: none;
  border: none;
  color: #7C5CFC;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 24px;
  padding: 0;
}

.pricing-hero-header {
  text-align: center;
  max-width: 760px;
  margin: 0 auto 48px auto;
}

.section-pill-tag {
  display: inline-block;
  background: #F0EDFF;
  color: #7C5CFC;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 12px;
  letter-spacing: 1.2px;
  padding: 6px 16px;
  border-radius: 20px;
  margin-bottom: 16px;
}

.pricing-hero-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 40px;
  color: #1A1A2E;
  line-height: 1.15;
  margin-bottom: 14px;
  letter-spacing: -0.5px;
}

.pricing-hero-subtitle {
  font-size: 16px;
  color: #7B7B93;
  line-height: 1.6;
  margin-bottom: 28px;
}

.billing-switcher-wrapper {
  display: flex;
  justify-content: center;
}

.billing-switcher {
  display: inline-flex;
  background: #FFFFFF;
  border: 1px solid #E2E2EC;
  padding: 5px;
  border-radius: 50px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
}

.switch-tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  padding: 8px 20px;
  border-radius: 50px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 14px;
  color: #7B7B93;
  cursor: pointer;
  transition: all 0.2s ease;
}

.switch-tab-btn.active {
  background: #624CE0;
  color: #FFFFFF;
  box-shadow: 0 4px 12px rgba(98, 76, 224, 0.3);
}

.save-badge {
  background: #FFF1C5;
  color: #7A5300;
  font-size: 11px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 12px;
}

.save-badge.gold {
  background: #06D6A0;
  color: #FFFFFF;
}

/* 3 Cards Grid */
.pricing-cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
  margin-bottom: 48px;
}

.pricing-plan-card {
  position: relative;
  background: #FFFFFF;
  border-radius: 28px;
  padding: 36px 30px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.pricing-plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 36px rgba(124, 92, 252, 0.08);
}

.pricing-plan-card.featured-plan {
  border: 2px solid #7C5CFC;
  box-shadow: 0 16px 40px rgba(124, 92, 252, 0.12);
  transform: scale(1.02);
}

.popular-ribbon {
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  background: #FFD166;
  color: #1A1A2E;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 11.5px;
  padding: 4px 16px;
  border-radius: 20px;
  box-shadow: 0 4px 10px rgba(255, 209, 102, 0.4);
}

.card-top-head {
  margin-bottom: 18px;
}

.plan-type-tag {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  color: #7B7B93;
  margin-bottom: 6px;
}

.plan-type-tag.featured {
  color: #7C5CFC;
}

.plan-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 30px;
  color: #1A1A2E;
  margin-bottom: 6px;
}

.plan-desc {
  font-size: 13.5px;
  color: #7B7B93;
  line-height: 1.45;
  min-height: 40px;
}

.plan-pricing-box {
  margin-bottom: 20px;
}

.price-display {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.price-amount {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 32px;
  color: #1A1A2E;
}

.price-amount.featured {
  color: #624CE0;
}

.price-period {
  font-size: 14px;
  color: #7B7B93;
}

.billed-note {
  display: block;
  font-size: 12px;
  color: #06D6A0;
  font-weight: 700;
  margin-top: 4px;
}

.plan-divider {
  height: 1px;
  background: #F4F4F8;
  margin-bottom: 24px;
}

.plan-perks-list {
  list-style: none;
  padding: 0;
  margin: 0 0 32px 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
}

.plan-perks-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 14px;
  color: #4A4A68;
  line-height: 1.4;
}

.check-icon {
  color: #06D6A0;
  font-weight: 800;
  font-size: 14px;
}

.check-icon.featured {
  color: #7C5CFC;
}

.select-plan-btn {
  width: 100%;
  background: #F4F4F8;
  color: #1A1A2E;
  border: none;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 14.5px;
  padding: 14px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.select-plan-btn:hover {
  background: #EAEAF2;
}

.select-plan-btn.featured {
  background: #624CE0;
  color: #FFFFFF;
  box-shadow: 0 6px 20px rgba(98, 76, 224, 0.25);
}

.select-plan-btn.featured:hover {
  background: #513bc7;
}

/* Extra Toys Banner */
.extra-toys-banner {
  background: #FFFFFF;
  border-radius: 22px;
  padding: 22px 30px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 56px;
}

.extra-toys-content {
  display: flex;
  align-items: center;
  gap: 18px;
}

.extra-icon {
  font-size: 32px;
}

.extra-text h4 {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 17px;
  margin-bottom: 2px;
}

.extra-text p {
  font-size: 13.5px;
  color: #7B7B93;
}

.extra-counter-box {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #F4F4F8;
  padding: 6px 14px;
  border-radius: 14px;
}

.extra-step-btn {
  background: transparent;
  border: none;
  font-size: 18px;
  font-weight: 800;
  color: #4A4A68;
  cursor: pointer;
  padding: 2px 8px;
}

.extra-step-val {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 14px;
  color: #1A1A2E;
  min-width: 90px;
  text-align: center;
}

/* Inclusions Section */
.inclusions-section {
  margin-bottom: 64px;
}

.inclusions-title {
  text-align: center;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 30px;
  color: #1A1A2E;
  margin-bottom: 32px;
}

.inclusions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.inclusion-card {
  background: #FFFFFF;
  border-radius: 22px;
  padding: 24px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
}

.inc-icon {
  font-size: 28px;
  margin-bottom: 14px;
}

.inclusion-card h3 {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 16px;
  color: #1A1A2E;
  margin-bottom: 6px;
}

.inclusion-card p {
  font-size: 13px;
  color: #7B7B93;
  line-height: 1.45;
}

/* Sub FAQ */
.sub-faq-section {
  max-width: 800px;
  margin: 0 auto;
}

.faq-accordion-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.faq-acc-item {
  background: #FFFFFF;
  border-radius: 18px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.01);
}

.faq-acc-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  background: none;
  border: none;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 16px;
  color: #1A1A2E;
  cursor: pointer;
  text-align: left;
}

.faq-acc-icon {
  font-size: 20px;
  color: #7C5CFC;
  font-weight: 800;
}

.faq-acc-body {
  padding: 0 24px 20px 24px;
  font-size: 14px;
  color: #7B7B93;
  line-height: 1.55;
}

/* Subscription Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 26, 46, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.sub-modal-card {
  position: relative;
  background: #FFFFFF;
  width: 100%;
  max-width: 480px;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #F4F4F8;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4A4A68;
}

.sub-modal-title {
  font-family: 'Outfit', sans-serif;
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 6px;
}

.sub-modal-desc {
  font-size: 14px;
  color: #7B7B93;
  margin-bottom: 18px;
}

.modal-price-summary {
  background: #F0EDFF;
  border-radius: 14px;
  padding: 14px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-price-summary span {
  font-size: 14px;
  color: #4A4A68;
}

.modal-price-summary strong {
  font-family: 'Outfit', sans-serif;
  font-size: 22px;
  color: #624CE0;
}

.payment-methods-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
}

.pay-method-radio {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #FAFAFC;
  border: 1px solid #EAEAF2;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
}

.confirm-sub-btn {
  width: 100%;
  background: #624CE0;
  color: #FFFFFF;
  border: none;
  padding: 14px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(98, 76, 224, 0.25);
  transition: all 0.2s ease;
}

.confirm-sub-btn:hover {
  background: #513bc7;
}

/* Mobile Plan Pills */
.mobile-sub-pills {
  display: none;
}

/* Responsive */
@media (max-width: 992px) {
  .sub-grid-section {
    grid-template-columns: 1fr;
  }

  .inclusions-grid {
    grid-template-columns: 1fr 1fr;
  }

  .extra-toys-banner {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 14px;
  }

  .sub-header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .sub-main-title,
  .pricing-hero-title {
    font-size: 24px;
    line-height: 1.25;
    margin-bottom: 8px;
  }

  .pricing-hero-header {
    margin-bottom: 20px;
  }

  .pricing-hero-subtitle {
    font-size: 13.5px;
    line-height: 1.5;
    margin-bottom: 16px;
  }

  .billing-switcher {
    display: flex;
    flex-direction: row;
    width: 100%;
    border-radius: 50px;
    padding: 4px;
    gap: 2px;
  }

  .switch-tab-btn {
    flex: 1;
    padding: 7px 4px;
    font-size: 11.5px;
    border-radius: 50px;
    justify-content: center;
    text-align: center;
  }

  .save-badge {
    display: none;
  }

  .mobile-sub-pills {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 16px;
    width: 100%;
  }

  .sub-pill-btn {
    flex: 1;
    padding: 8px 10px;
    background: #FFFFFF;
    border: 1.5px solid #E2E2EC;
    border-radius: 50px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12.5px;
    font-weight: 700;
    color: #4A4A68;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .sub-pill-btn.active {
    background: #7C5CFC;
    border-color: #7C5CFC;
    color: #FFFFFF;
    box-shadow: 0 4px 12px rgba(124, 92, 252, 0.25);
  }

  .pricing-cards-grid {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-padding: 0 14px;
    gap: 14px;
    padding: 6px 2px 20px;
    margin-bottom: 28px;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    width: 100%;
  }

  .pricing-cards-grid::-webkit-scrollbar {
    display: none;
  }

  .pricing-plan-card {
    flex: 0 0 88%;
    width: 88%;
    scroll-snap-align: center;
    padding: 22px 18px;
    border-radius: 22px;
  }

  .pricing-plan-card.featured-plan {
    transform: none;
  }

  .plan-title {
    font-size: 24px;
  }

  .price-amount {
    font-size: 26px;
  }

  .plan-card,
  .status-card,
  .inclusion-card,
  .extra-toys-banner {
    padding: 20px 16px;
    border-radius: 20px;
  }

  .inclusions-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .inclusions-title {
    font-size: 20px;
  }

  .plan-actions-group {
    flex-direction: column;
  }

  .faq-acc-header {
    padding: 14px 16px;
    font-size: 14px;
  }

  .faq-acc-body {
    padding: 0 16px 14px 16px;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
