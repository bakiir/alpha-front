<template>
  <div class="pricing-wrapper">
    <section id="pricing" class="pricing-section container">
    <div class="section-heading">
      <div class="badge">стоимость</div>
      <h2 class="title">Инвестируйте в развитие, а не в пластик</h2>
      <p class="subtitle">Тарифы дешевле покупки одной качественной деревянной игрушки в магазине.</p>
      
      <!-- Duration Switcher on Desktop -->
      <div class="desktop-billing-switcher">
        <button 
          class="switch-btn" 
          :class="{ active: selectedDuration === 1 }"
          @click="selectedDuration = 1"
        >
          1 месяц
        </button>
        <button 
          class="switch-btn" 
          :class="{ active: selectedDuration === 6 }"
          @click="selectedDuration = 6"
        >
          6 месяцев
          <span class="save-badge">-15%</span>
        </button>
        <button 
          class="switch-btn" 
          :class="{ active: selectedDuration === 12 }"
          @click="selectedDuration = 12"
        >
          12 месяцев
          <span class="save-badge">-25%</span>
        </button>
      </div>
    </div>

    <!-- DESKTOP CARDS GRID (Hidden on mobile) -->
    <div v-if="isLoading" class="plans-placeholder">Загрузка тарифов...</div>
    <div v-else-if="tiers.length === 0" class="plans-placeholder">
      Тарифные планы пока не настроены. Добавьте их в админ-панели.
    </div>
    <div v-else class="pricing-grid desktop-only-grid">
      <div
        v-for="(tier, idx) in tiers"
        :key="tier.id"
        class="plan-card"
        :class="{ recommended: tier.isFeatured, selected: selectedTierIndex === idx }"
      >
        <div v-if="tier.isFeatured" class="recommended-badge">РЕКОМЕНДУЕМ</div>
        <div class="plan-content">
          <div class="plan-header">
            <h3 :class="{ 'text-white': tier.isFeatured }">{{ tier.name }}</h3>
            <p :class="{ 'text-light': tier.isFeatured }">{{ tier.toys }} развивающих игрушек / набор</p>
            <div class="price">
              <span class="amount" :class="{ 'text-white': tier.isFeatured }">{{ formatPrice(getMonthlyPrice(tier.id)) }} ₸</span>
              <span class="period" :class="{ 'text-light': tier.isFeatured }">/мес</span>
            </div>
            <p v-if="selectedDuration > 1" class="total-duration-hint" :class="{ 'text-light': tier.isFeatured }">
              {{ formatPrice(getTotalPrice(tier.id)) }} ₸ за {{ selectedDuration }} мес.
            </p>
          </div>
          <div class="divider" :class="{ light: tier.isFeatured }"></div>
          <ul class="features">
            <li v-for="(feature, featureIdx) in tier.features" :key="featureIdx">
              <div class="icon-check" :class="{ yellow: tier.isFeatured }"></div>
              <span :class="{ 'text-white': tier.isFeatured }">{{ feature }}</span>
            </li>
          </ul>
        </div>
        <button
          class="btn-block"
          :class="tier.isFeatured ? 'btn-primary btn-white' : 'btn-outline'"
          @click="handleSelectPlan(tier.id)"
        >
          Выбрать {{ tier.name }}
        </button>
      </div>
    </div>

    <!-- MOBILE INTERACTIVE CONFIGURATOR (Shown on mobile <= 960px) -->
    <div v-if="tiers.length > 0" class="mobile-pricing-widget">
      <!-- 1. Toy Stepper Section -->
      <div class="widget-step-box">
        <h3 class="widget-step-title">Сколько игрушек нужно семье?</h3>
        
        <div class="toy-stepper-row">
          <button 
            class="stepper-arrow-btn" 
            :disabled="selectedTierIndex <= 0" 
            @click="prevTier"
            aria-label="Меньше игрушек"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <div class="toy-stepper-center">
            <span class="toy-big-number">{{ currentTier.toys }}</span>
            <span class="toy-stepper-label">игрушек / набор</span>
            <span class="toy-stepper-plan-name">{{ currentTier.name }}</span>
          </div>

          <button 
            class="stepper-arrow-btn" 
            :disabled="selectedTierIndex >= tiers.length - 1" 
            @click="nextTier"
            aria-label="Больше игрушек"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        <p class="toy-stepper-subtext">{{ currentTier.desc }}</p>
      </div>

      <!-- 2. Billing Cycle Cards -->
      <div class="widget-step-box">
        <h3 class="widget-step-title">Выберите период подписки</h3>

        <div class="billing-cards-grid">
          <!-- 1 Month -->
          <div 
            class="m-billing-card" 
            :class="{ active: selectedDuration === 1 }"
            @click="selectedDuration = 1"
          >
            <div class="m-card-header">
              <span class="m-cycle-name">1 месяц</span>
            </div>
            <div class="m-price-box">
              <span class="m-price-val">{{ formatPrice(getMonthlyPrice(currentTier.id, 1)) }} ₸</span>
              <span class="m-price-period">/ месяц</span>
            </div>
            <div class="m-badge-placeholder">Без обязательств</div>
            <div class="m-check-row">
              <span class="m-check-icon">✓</span>
              <span>Отмена в 1 клик</span>
            </div>
          </div>

          <!-- 6 Months (Most Popular) -->
          <div 
            class="m-billing-card popular" 
            :class="{ active: selectedDuration === 6 }"
            @click="selectedDuration = 6"
          >
            <div class="m-popular-tag">ПОПУЛЯРНЫЙ</div>
            <div class="m-card-header">
              <span class="m-cycle-name">6 месяцев</span>
            </div>
            <div class="m-price-box">
              <span class="m-price-val">{{ formatPrice(getTotalPrice(currentTier.id, 6)) }} ₸</span>
              <span class="m-price-period">{{ formatPrice(getMonthlyPrice(currentTier.id, 6)) }} ₸/мес</span>
            </div>
            <div class="m-discount-pill">1 месяц в подарок</div>
            <div class="m-check-row">
              <span class="m-check-icon">✓</span>
              <span>Экономия 15%</span>
            </div>
          </div>

          <!-- 12 Months (Best Value) -->
          <div 
            class="m-billing-card best-value" 
            :class="{ active: selectedDuration === 12 }"
            @click="selectedDuration = 12"
          >
            <div class="m-value-tag">ВЫГОДНО</div>
            <div class="m-card-header">
              <span class="m-cycle-name">12 месяцев</span>
            </div>
            <div class="m-price-box">
              <span class="m-price-val">{{ formatPrice(getTotalPrice(currentTier.id, 12)) }} ₸</span>
              <span class="m-price-period">{{ formatPrice(getMonthlyPrice(currentTier.id, 12)) }} ₸/мес</span>
            </div>
            <div class="m-discount-pill gold">2 месяца в подарок</div>
            <div class="m-check-row">
              <span class="m-check-icon">✓</span>
              <span>Экономия 25%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Inclusions checklist -->
      <div class="m-inclusions-card">
        <ul class="m-inclusions-list">
          <li><span>✓</span> Индивидуальный подбор Монтессори-педагогами</li>
          <li><span>✓</span> 4-ступенчатая медицинская эко-дезинфекция</li>
          <li><span>✓</span> Бесплатная курьерская доставка и забор</li>
          <li><span>✓</span> Полная гарантия: без штрафов за царапины</li>
        </ul>
      </div>

      <!-- CTA Button -->
      <button class="m-cta-submit-btn" @click="handleSelectPlan(currentTier.id)">
        <span>Оформить тариф «{{ currentTier.name }}»</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </button>
    </div>
  </section>
</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

const { openQuiz } = useQuiz()
const { plans, fetchPlans, isLoading } = useSubscriptionPlans()

const selectedDuration = ref<number>(1)
const selectedTierIndex = ref<number>(0)

interface PricingTier {
  id: string
  name: string
  toys: number
  baseMonthly: number
  priceSemiannual: number
  priceAnnual: number
  desc: string
  features: string[]
  isFeatured: boolean
}

const tiers = computed<PricingTier[]>(() => (
  plans.value.map((plan, index) => ({
    id: plan.slug,
    name: plan.name,
    toys: plan.toys_count,
    baseMonthly: plan.price_monthly,
    priceSemiannual: plan.price_semiannual || plan.price_monthly,
    priceAnnual: plan.price_annual || plan.price_monthly,
    desc: plan.description || `${plan.toys_count} игрушек в наборе`,
    features: Array.isArray(plan.features) && plan.features.length > 0
      ? plan.features
      : [
          `${plan.toys_count} развивающих игрушек дома`,
          `${plan.exchanges_count} бесплатный обмен(а) в месяц`,
          'Бесплатная курьерская доставка',
        ],
    isFeatured: index === 1 || Boolean(plan.badge && /хит|популяр/i.test(plan.badge)),
  }))
))

const currentTier = computed(() => tiers.value[selectedTierIndex.value] || tiers.value[0])

onMounted(async () => {
  await fetchPlans()
  const featuredIndex = tiers.value.findIndex(tier => tier.isFeatured)
  selectedTierIndex.value = featuredIndex >= 0 ? featuredIndex : 0
})

watch(tiers, (list) => {
  if (!list.length) {
    selectedTierIndex.value = 0
    return
  }
  if (selectedTierIndex.value >= list.length) {
    selectedTierIndex.value = 0
  }
})

const prevTier = () => {
  if (selectedTierIndex.value > 0) {
    selectedTierIndex.value--
  }
}

const nextTier = () => {
  if (selectedTierIndex.value < tiers.value.length - 1) {
    selectedTierIndex.value++
  }
}

const getTierById = (tierId: string) => tiers.value.find(tier => tier.id === tierId) || currentTier.value

const getMonthlyPrice = (tierId: string, duration = selectedDuration.value) => {
  const tier = getTierById(tierId)
  if (!tier) return 0
  if (duration === 12) return tier.priceAnnual
  if (duration === 6) return tier.priceSemiannual
  return tier.baseMonthly
}

const getTotalPrice = (tierId: string, duration = selectedDuration.value) => {
  const monthly = getMonthlyPrice(tierId, duration)
  return monthly * duration
}

const formatPrice = (val: number) => {
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

const handleSelectPlan = (tierId: string) => {
  if (!tierId) return
  openQuiz(tierId)
}
</script>

<style scoped>
.pricing-wrapper {
  width: 100%;
  background: #FAF8F4;
}

.pricing-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px;
  gap: 48px;
  background: transparent;
}

.section-heading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  max-width: 760px;
}

.badge {
  padding: 6px 16px;
  background: #D9E0D5;
  border-radius: 20px;
  font-weight: 700;
  font-size: 12px;
  color: var(--color-primary);
  text-transform: uppercase;
}

.title {
  font-size: 40px;
  font-weight: 800;
}

.subtitle {
  font-size: 17px;
  color: var(--text-muted);
  line-height: 1.5;
}

.plans-placeholder {
  width: 100%;
  padding: 48px 24px;
  border: 1px dashed #E3D7C6;
  border-radius: 14px;
  background: var(--surface);
  color: #747183;
  text-align: center;
  font-size: 15px;
  line-height: 1.5;
}

/* Desktop Duration Switcher */
.desktop-billing-switcher {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #FAF8F4;
  padding: 6px;
  border-radius: 14px;
  border: 1px solid rgba(51, 61, 54, 0.12);
  box-shadow: none;
  margin-top: 8px;
}

.switch-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 9px;
  background: transparent;
  color: #5D625F;
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.switch-btn.active {
  background: #3F6757;
  color: #FAF8F4;
  box-shadow: 0 4px 12px rgba(51, 61, 54, 0.25);
}

.save-badge {
  font-size: 11px;
  background: #E8A62B;
  color: #262626;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 800;
}

/* Desktop 3-Card Grid */
.desktop-only-grid {
  display: flex;
  align-items: flex-end;
  gap: 24px;
  width: 100%;
}

.plan-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px;
  width: 100%;
  flex: 1;
  background: var(--text-white);
  border: 1.5px solid #EADFC9;
  border-radius: 14px;
  min-height: 560px;
  position: relative;
  transition: all 0.25s ease;
}

.plan-card.recommended {
  background: var(--color-primary);
  border: none;
  box-shadow: var(--shadow-lg);
  transform: translateY(-8px);
}

.recommended-badge {
  position: absolute;
  top: -14px;
  right: 24px;
  background: var(--color-secondary);
  border-radius: 12px;
  padding: 6px 16px;
  font-weight: 800;
  font-size: 11.5px;
  color: var(--text-dark);
}

.plan-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.plan-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.plan-header h3 {
  font-size: 24px;
  font-weight: 800;
}

.plan-header p {
  font-size: 14px;
  color: var(--text-muted);
}

.price {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-top: 6px;
}

.amount {
  font-family: 'Manrope';
  font-weight: 800;
  font-size: 38px;
  color: var(--text-dark);
}

.period {
  font-size: 15px;
  color: var(--text-muted);
}

.total-duration-hint {
  font-size: 13px;
  color: #6F746F;
  margin-top: 2px;
}

.divider {
  width: 100%;
  height: 1px;
  background: #EADFC9;
}

.divider.light {
  background: rgba(255, 255, 255, 0.15);
}

.features {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.features li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14.5px;
  color: var(--text-dark);
}

.icon-check {
  width: 18px;
  height: 18px;
  position: relative;
}

.icon-check::after {
  content: '';
  position: absolute;
  left: 35%;
  top: 25%;
  width: 4px;
  height: 8px;
  border: solid var(--color-primary);
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.icon-check.yellow::after {
  border-color: var(--color-secondary);
}

.text-white { color: var(--text-white) !important; }
.text-light { color: #D9E0D5 !important; }

.btn-block {
  width: 100%;
  text-align: center;
  padding: 14px 0;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-white {
  background: var(--text-white);
  color: var(--color-primary);
}
.btn-white:hover {
  background: #f0f0f0;
}

/* ================================================= */
/* MOBILE INTERACTIVE CONFIGURATOR (Kiddos Style) */
/* ================================================= */
.mobile-pricing-widget {
  display: none;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 480px;
}

.widget-step-box {
  background: #FAF8F4;
  border-radius: 14px;
  padding: 24px 20px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.02);
  text-align: center;
}

.widget-step-title {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 20px;
  color: #262626;
  margin-bottom: 20px;
}

/* Toy Stepper Row */
.toy-stepper-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-bottom: 12px;
}

.stepper-arrow-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #F4F1EA;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #262626;
  cursor: pointer;
  transition: all 0.2s ease;
}

.stepper-arrow-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.stepper-arrow-btn:not(:disabled):hover {
  background: #D9E0D5;
  color: #3F6757;
}

.toy-stepper-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 130px;
}

.toy-big-number {
  font-family: 'Manrope', sans-serif;
  font-weight: 900;
  font-size: 54px;
  line-height: 1;
  color: #262626;
}

.toy-stepper-label {
  font-size: 13px;
  color: #6F746F;
  font-weight: 600;
  margin-top: 4px;
}

.toy-stepper-plan-name {
  font-family: 'Manrope', sans-serif;
  font-size: 11px;
  font-weight: 800;
  color: #3F6757;
  background: #D9E0D5;
  padding: 2px 8px;
  border-radius: 6px;
  margin-top: 6px;
  text-transform: uppercase;
}

.toy-stepper-subtext {
  font-size: 13px;
  color: #6F746F;
  margin-top: 8px;
}

/* Billing Cards Grid */
.billing-cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.m-billing-card {
  position: relative;
  background: #FAF8F4;
  border: 1.5px solid #E6DFD4;
  border-radius: 14px;
  padding: 20px 8px 14px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.m-billing-card.active {
  border-color: #3F6757;
  background: #FAF8F4;
  box-shadow: 0 4px 16px rgba(51, 61, 54, 0.15);
}

.m-popular-tag,
.m-value-tag {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: #AF5353;
  color: #FAF8F4;
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 9px;
  padding: 3px 8px;
  border-radius: 10px;
  white-space: nowrap;
}

.m-value-tag {
  background: #262626;
}

.m-cycle-name {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 13px;
  color: #262626;
  margin-bottom: 8px;
  display: block;
}

.m-price-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 8px;
}

.m-price-val {
  font-family: 'Manrope', sans-serif;
  font-weight: 900;
  font-size: 15.5px;
  color: #262626;
}

.m-price-period {
  font-size: 10.5px;
  color: #6F746F;
}

.m-discount-pill {
  background: #FFF3D6;
  color: #B26A00;
  font-size: 9.5px;
  font-weight: 800;
  padding: 3px 6px;
  border-radius: 6px;
  margin-bottom: 10px;
  line-height: 1.2;
}

.m-discount-pill.gold {
  background: #D9E0D5;
  color: #3F6757;
}

.m-badge-placeholder {
  font-size: 10px;
  color: #6F746F;
  margin-bottom: 10px;
}

.m-check-row {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #5D625F;
  font-weight: 600;
  margin-top: auto;
}

.m-check-icon {
  color: #9C91C9;
  font-weight: 800;
}

/* Inclusions Card */
.m-inclusions-card {
  background: #FAF8F4;
  border-radius: 14px;
  padding: 18px 20px;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.m-inclusions-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.m-inclusions-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #5D625F;
}

.m-inclusions-list li span {
  color: #9C91C9;
  font-weight: 800;
  font-size: 14px;
}

/* Mobile CTA Button */
.m-cta-submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  background: #3F6757;
  color: #FAF8F4;
  padding: 16px;
  border-radius: 14px;
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 15.5px;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(51, 61, 54, 0.28);
  transition: all 0.2s ease;
}

.m-cta-submit-btn:hover {
  background: #315145;
}

/* Responsive Media Queries */
@media (max-width: 960px) {
  .desktop-only-grid,
  .desktop-billing-switcher {
    display: none;
  }

  .mobile-pricing-widget {
    display: flex;
  }

  .pricing-section {
    padding: 32px 16px;
    gap: 24px;
  }

  .title {
    font-size: 24px;
    line-height: 1.2;
  }

  .subtitle {
    font-size: 14px;
    line-height: 1.45;
  }
}

@media (max-width: 420px) {
  .billing-cards-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .m-billing-card {
    padding: 16px;
  }

  .m-popular-tag,
  .m-value-tag {
    position: static;
    transform: none;
    margin-bottom: 8px;
  }
}
</style>
