<template>
  <div class="subscription-page">
    <TheHeader />

    <main class="container page-content">
      <!-- LOADING STATE -->
      <div v-if="isLoadingSubscription" class="sub-loading-state">
        <div class="sub-loading-skeleton">
          <div class="skel-header"></div>
          <div class="skel-card"></div>
        </div>
      </div>

      <!-- IF USER HAS ACTIVE OR PAUSED SUBSCRIPTION: Dashboard View -->
      <section v-else-if="user && hasActiveSubscription && !showAllPlans" class="active-sub-view">
        <!-- Section Header -->
        <div class="sub-header-section">
          <div class="header-left">
            <span class="section-badge">ЛИЧНЫЙ КАБИНЕТ</span>
            <h1 class="sub-main-title">Управление подпиской</h1>
            <p class="sub-subtitle">
              {{ isSubscriptionPaused ? 'Ваша подписка временно заморожена. Вы можете возобновить её в любой момент.' : 'Ваш текущий тариф активен. Управляйте наборами, доставкой и условиями.' }}
            </p>
          </div>

          <div class="header-right">
            <button class="gift-act-btn" @click="isGiftCodeModalOpen = true">
              🎁 Активировать сертификат
            </button>
            <button class="view-plans-toggle-btn" @click="showAllPlans = true">
              Сменить или посмотреть все тарифы →
            </button>
          </div>
        </div>

        <!-- Main Subscription Grid -->
        <div class="sub-grid-section">
          <!-- LEFT: Active Plan Card -->
          <div class="plan-card" :class="{ 'is-paused-card': isSubscriptionPaused }">
            <div class="plan-badge-row">
            <span v-if="isSubscriptionPaused" class="paused-badge">❄️ ЗАМОРОЖЕНА</span>
            <span v-else class="active-badge">АКТИВЕН</span>
            <span v-if="currentPlan.isGift" class="gift-badge">🎁 Подарок</span>
          </div>

            <h2 class="plan-name">{{ currentPlan.name }}</h2>

            <div class="plan-price-row">
              <template v-if="currentPlan.isGift">
                <span class="plan-price gift-price">🎁 Подарочная</span>
                <span class="plan-period" v-if="nextBillingDate">до {{ nextBillingDate }}</span>
              </template>
              <template v-else>
                <span class="plan-price">{{ currentPlan.price }}</span>
                <span class="plan-period">/ месяц</span>
              </template>
            </div>

            <!-- Paused Notification banner if paused -->
            <div v-if="isSubscriptionPaused" class="paused-info-banner">
              <span class="pause-icon">❄️</span>
              <div class="pause-text">
                <strong>Заморозка до {{ freezeEndDateFormatted }}</strong>
                <p>Списания и доставки приостановлены. Игрушки остаются у вас дома.</p>
              </div>
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
              
              <button 
                v-if="isSubscriptionPaused" 
                class="resume-btn" 
                :disabled="isSubmitting"
                @click="resumeSubscription"
              >
                {{ isSubmitting ? 'Возобновляем...' : '▶ Разморозить подписку' }}
              </button>
              <button 
                v-else 
                class="freeze-btn" 
                @click="openFreezeModal"
              >
                ❄️ Заморозить подписку
              </button>
            </div>
          </div>

          <!-- RIGHT: Two Stacked Cards -->
          <div class="right-stack">
            <!-- Next Payment Card -->
            <div class="status-card payment-card">
              <div class="card-text-col">
                <span class="card-small-label">{{ isSubscriptionPaused ? 'Списание заморожено' : 'Следующее списание' }}</span>
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
                  :style="{ width: `${Math.min(100, (toysInUse / toysLimit) * 100)}%` }"
                ></div>
              </div>

              <div class="limit-footer">
                <button type="button" class="view-toys-btn-link" @click="openPreviewToysModal(currentPlanItem || displayPlans[1])">
                  Посмотреть игрушки в наборе ({{ toysLimit }} шт.) →
                </button>
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
          <span class="hero-tag">ТАРИФНЫЕ ПЛАНЫ ALPHA</span>
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

            <!-- Sleek, compact action button to open set modal without clunky inline list (Requirement 2) -->
            <div class="preview-toys-action-wrap">
              <button 
                type="button" 
                class="preview-set-btn"
                @click="openPreviewToysModal(plan)"
              >
                👁 Посмотреть игрушки в тарифе ({{ plan.toys_count }} шт.) →
              </button>
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

        <!-- Custom Add Extra Toys -->
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
              <p>Если ребенок случайно сломает или потеряет 1–2 детали, мы не требуем доплат и штрафов. Это покрывается нашей гарантией.</p>
            </div>

            <div class="inclusion-card">
              <div class="inc-icon">❄️</div>
              <h3>Гибкая заморозка</h3>
              <p>Уезжаете в отпуск или на дачу? Заморозьте подписку на 7, 14 или 30 дней в 1 клик, сохранив оплаченные дни.</p>
            </div>
          </div>
        </section>

        <!-- FAQ Section -->
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
    </main>

    <!-- MODAL 1: Freeze Subscription Options (Requirement 1) -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isFreezeModalOpen" class="modal-overlay" @click.self="isFreezeModalOpen = false">
          <div class="sub-modal-card freeze-modal-card">
            <button class="close-btn" @click="isFreezeModalOpen = false">&times;</button>
            
            <div class="modal-icon-badge">❄️</div>
            <h2 class="sub-modal-title">Заморозка подписки</h2>
            <p class="sub-modal-desc">
              На время заморозки списания и доставка нового набора приостанавливаются, а оплаченные дни сохраняются. Текущие игрушки остаются у вас!
            </p>

            <!-- Duration Options -->
            <div class="freeze-options-group">
              <label class="freeze-group-title">Срок заморозки:</label>
              
              <div class="freeze-presets-grid">
                <div 
                  class="freeze-preset-card"
                  :class="{ active: freezeOption === '7' }"
                  @click="selectFreezePreset(7)"
                >
                  <strong>7 дней</strong>
                  <span>1 неделя</span>
                </div>
                <div 
                  class="freeze-preset-card"
                  :class="{ active: freezeOption === '14' }"
                  @click="selectFreezePreset(14)"
                >
                  <strong>14 дней</strong>
                  <span>2 недели</span>
                </div>
                <div 
                  class="freeze-preset-card"
                  :class="{ active: freezeOption === '30' }"
                  @click="selectFreezePreset(30)"
                >
                  <strong>30 дней</strong>
                  <span>1 месяц</span>
                </div>
                <div 
                  class="freeze-preset-card"
                  :class="{ active: freezeOption === 'custom' }"
                  @click="freezeOption = 'custom'"
                >
                  <strong>Своя дата</strong>
                  <span>Календарь</span>
                </div>
              </div>

              <!-- Custom Date Picker if custom selected -->
              <div v-if="freezeOption === 'custom'" class="custom-date-box">
                <label>Дата окончания заморозки:</label>
                <input 
                  v-model="customFreezeDate" 
                  type="date" 
                  :min="minCustomFreezeDate" 
                  class="custom-date-input"
                />
              </div>
            </div>

            <!-- Freeze Reason Options -->
            <div class="freeze-reason-box">
              <label class="freeze-group-title">Причина (поможет нам стать лучше):</label>
              <select v-model="freezeReason" class="freeze-select">
                <option value="vacation">🏖 Отпуск / семейная поездка</option>
                <option value="sick">🤒 Ребёнок приболел</option>
                <option value="too_many_toys">🧸 Не успели наиграться с текущим набором</option>
                <option value="budget">💰 Временная экономия бюджета</option>
                <option value="other">✈️ Другая причина</option>
              </select>
            </div>

            <!-- Summary of Freeze Calculation -->
            <div class="freeze-summary-card">
              <div class="summary-row">
                <span>Период заморозки:</span>
                <strong>до {{ computedFreezeEndFormatted }} ({{ computedFreezeDays }} дн.)</strong>
              </div>
              <div class="summary-row">
                <span>Следующее списание:</span>
                <strong class="highlight-date">{{ computedShiftedBillingDate }}</strong>
              </div>
            </div>

            <div v-if="freezeError" class="modal-error-banner">
              {{ freezeError }}
            </div>

            <div class="modal-buttons-row">
              <button class="cancel-modal-btn" @click="isFreezeModalOpen = false">Отмена</button>
              <button 
                class="confirm-freeze-btn" 
                :disabled="isSubmitting"
                @click="submitFreezeSubscription"
              >
                <span v-if="isSubmitting">Замораживаем...</span>
                <span v-else>Заморозить на {{ computedFreezeDays }} дн.</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- MODAL 2: Exact Toys in Selected Plan (Requirement 2) -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isPreviewModalOpen" class="modal-overlay" @click.self="isPreviewModalOpen = false">
          <div class="sub-modal-card preview-toys-modal-card">
            <button class="close-btn" @click="isPreviewModalOpen = false">&times;</button>
            
            <div class="modal-header-compact">
              <span class="preview-plan-badge">Тариф {{ selectedPreviewPlan?.name }}</span>
              <h2 class="sub-modal-title">Состав набора тарифа «{{ selectedPreviewPlan?.name }}» 🧸</h2>
              <p class="sub-modal-desc">
                В этот тариф входит ровно <strong>{{ currentPlanExactToys.length }} развивающих эко-игрушек</strong>, подобранных методистами Alpha:
              </p>
            </div>

            <!-- Detailed Numbered Toys Grid in Modal -->
            <div class="preview-toys-scroll-grid">
              <div 
                v-for="(toy, tIdx) in currentPlanExactToys" 
                :key="toy.id || tIdx"
                class="preview-toy-item-card"
              >
                <div class="preview-toy-img-box">
                  <img :src="toy.image" :alt="toy.name" loading="lazy" />
                  <span class="toy-item-number">№{{ tIdx + 1 }}</span>
                  <span class="toy-skill-badge">{{ toy.skill }}</span>
                </div>
                <div class="preview-toy-content">
                  <div class="toy-title-row">
                    <h4>{{ toy.name }}</h4>
                    <span class="toy-age-tag">{{ toy.age }}</span>
                  </div>
                  <p class="toy-descr">{{ toy.desc }}</p>
                  <div class="toy-perk-tag">
                    <span>✨ {{ toy.benefit }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Bottom CTA inside preview modal -->
            <div class="preview-modal-footer">
              <div class="preview-footer-left">
                <span class="footer-price-lbl">Стоимость тарифа:</span>
                <strong class="footer-price-val">{{ formatPrice(calcPlanPrice(selectedPreviewPlan || displayPlans[1])) }} ₸ / мес</strong>
              </div>
              <button 
                class="preview-action-btn"
                @click="handleSelectPlanFromPreview"
              >
                {{ user ? `Выбрать тариф ${selectedPreviewPlan?.name}` : 'Оформить подписку →' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- MODAL 3: Subscription Checkout Modal -->
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

    <!-- MODAL 4: Gift Certificate / Subscription Activation Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isGiftCodeModalOpen" class="modal-overlay" @click.self="isGiftCodeModalOpen = false">
          <div class="sub-modal-card">
            <button class="close-btn" @click="isGiftCodeModalOpen = false">&times;</button>
            
            <div class="gift-modal-header">
              <span class="gift-icon-badge">🎁</span>
              <h2 class="sub-modal-title">Активация подарочного сертификата</h2>
              <p class="sub-modal-desc">
                Введите код подарочного сертификата Alpha, чтобы активировать клубную подписку без оплаты.
              </p>
            </div>

            <div class="gift-activate-form">
              <div class="g-field">
                <label>Код подарочного сертификата <span class="req">*</span></label>
                <input 
                  v-model="giftActivationCode" 
                  type="text" 
                  placeholder="Например: GFT-ALPHA-2026" 
                  class="gift-code-input"
                  style="text-transform: uppercase;"
                />
              </div>

              <div class="g-field">
                <label>Имя ребенка <span class="req">*</span></label>
                <input 
                  v-model="giftChildName" 
                  type="text" 
                  placeholder="Миша" 
                  class="gift-code-input"
                />
              </div>

              <div class="g-field">
                <label>Возраст малыша (в месяцах) <span class="req">*</span></label>
                <input 
                  v-model="giftChildAgeMonths" 
                  type="number" 
                  placeholder="14" 
                  min="0" 
                  max="120"
                  class="gift-code-input"
                />
              </div>

              <div v-if="giftActivationError" class="error-banner">
                {{ giftActivationError }}
              </div>

              <div v-if="giftActivationSuccess" class="success-banner">
                {{ giftActivationSuccess }}
              </div>

              <button 
                class="confirm-sub-btn" 
                :disabled="isActivatingGift"
                @click="submitGiftActivation"
              >
                {{ isActivatingGift ? 'Проверка и активация...' : 'Активировать подписку бесплатно (0 ₸) 🎁' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TheHeader from '~/components/TheHeader.vue'

const route = useRoute()
const { user, openAuthModal } = useAuth()
const { request } = useApi()
const { plans: apiPlans, fetchPlans } = useSubscriptionPlans()

// Gift Activation Modal State
const isGiftCodeModalOpen = ref(false)
const giftActivationCode = ref('')
const giftChildName = ref('Миша')
const giftChildAgeMonths = ref(14)
const isActivatingGift = ref(false)
const giftActivationError = ref('')
const giftActivationSuccess = ref('')

onMounted(() => {
  const queryCode = (route.query.code || route.query.gift_code) as string
  if (queryCode) {
    giftActivationCode.value = queryCode.toUpperCase()
    isGiftCodeModalOpen.value = true
  }
})

const submitGiftActivation = async () => {
  const code = giftActivationCode.value.trim().toUpperCase()
  if (!code) {
    giftActivationError.value = 'Пожалуйста, введите код сертификата!'
    return
  }
  if (!giftChildName.value.trim()) {
    giftActivationError.value = 'Пожалуйста, укажите имя ребенка!'
    return
  }

  isActivatingGift.value = true
  giftActivationError.value = ''
  giftActivationSuccess.value = ''

  try {
    const res = await request<any>('/gift-cards/verify', {
      method: 'POST',
      body: JSON.stringify({ code })
    })

    if (res?.data) {
      giftActivationSuccess.value = `🎉 Подарочный сертификат ${code} успешно активирован для малыша ${giftChildName.value}! Первый развивающий набор будет сформирован методистом и отправлен курьером.`
      hasActiveSubscription.value = true
      isSubscriptionPaused.value = false
      setTimeout(() => {
        isGiftCodeModalOpen.value = false
        showAllPlans.value = false
      }, 2500)
      return
    }
  } catch (e: any) {
    giftActivationError.value = e?.data?.message || 'Сертификат с таким кодом не найден, уже использован или истек.'
  } finally {
    isActivatingGift.value = false
  }
}

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
  toys?: any[]
  isFeatured?: boolean
}

// Fallback plans if API is loading or empty
const defaultPlansList: PlanViewItem[] = [
  {
    name: 'Starter',
    slug: 'starter',
    badge: 'Базовый',
    description: '3 развивающие эко-игрушки по возрасту ребёнка.',
    price_monthly: 14900,
    price_semiannual: 12900,
    price_annual: 11900,
    toys_count: 3,
    exchanges_count: 1,
    extra_toy_price: 2500,
    isFeatured: false,
    features: [
      '3 развивающие игрушки дома одновременно',
      '1 бесплатный обмен набора в месяц',
      'Бесплатная курьерская доставка по Алматы',
      '4-ступенчатая дезинфекция озоном и паром',
      'Скидка -15% на выкуп любых игрушек'
    ]
  },
  {
    name: 'Explorer',
    slug: 'explorer',
    badge: 'Хит развития',
    description: '5 игрушек Монтессори + план развития от методиста.',
    price_monthly: 22900,
    price_semiannual: 19900,
    price_annual: 17900,
    toys_count: 5,
    exchanges_count: 1,
    extra_toy_price: 2500,
    isFeatured: true,
    features: [
      '5 развивающих игрушек дома одновременно',
      '1 бесплатный обмен набора в месяц',
      'Персональный план развития от методиста',
      'Бесплатная курьерская доставка по Алматы',
      'Скидка 25% на выкуп любых игрушек навсегда'
    ]
  },
  {
    name: 'Premium',
    slug: 'premium',
    badge: 'Максимум',
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
      toys: p.toys || [],
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

// Active Subscription state
const hasActiveSubscription = ref(false)  // starts false — set to true only after API confirms
const activeSubId = ref<number | null>(null)  // starts null — filled from real API response
const isSubscriptionPaused = ref(false)
const freezeEndDate = ref<string | null>(null)
const showAllPlans = ref(false)
const extraToysCount = ref<number>(0)
const billingCycle = ref<'monthly' | 'semiannual' | 'annual'>('monthly')
const activeMobileSubPlan = ref(1)
const isLoadingSubscription = ref(true)  // show loader until API responds

const currentPlan = ref({
  name: '',
  price: '',
  features: [] as string[],
  isGift: false
})

const currentPlanItem = computed(() => {
  if (!currentPlan.value.name) return displayPlans.value[1]
  return displayPlans.value.find(p => p.name.toLowerCase() === currentPlan.value.name.toLowerCase()) || displayPlans.value[1]
})

const nextBillingDate = ref('')
const toysInUse = ref(0)
const toysLimit = ref(3)
const isSubmitting = ref(false)

// Load user subscription if exists
const loadUserSubscription = async () => {
  if (!user.value) {
    isLoadingSubscription.value = false
    return
  }
  try {
    const res = await request<any>('/subscriptions')
    const list = res?.data ?? res ?? []
    if (Array.isArray(list) && list.length > 0) {
      const active = list.find((s: any) => s.status === 'active' || s.status === 'paused')
      if (active) {
        hasActiveSubscription.value = true
        activeSubId.value = active.id
        isSubscriptionPaused.value = active.status === 'paused'
        freezeEndDate.value = active.freeze_end || null

        if (active.plan) {
          // Case 1: subscription has a linked plan from DB
          currentPlan.value.name = active.plan.name
          currentPlan.value.price = `${formatPrice(active.plan.price_monthly)} ₸`
          currentPlan.value.features = Array.isArray(active.plan.features) && active.plan.features.length > 0
            ? active.plan.features
            : [
                `${active.plan.toys_count} развивающих игрушек дома одновременно`,
                `${active.plan.exchanges_count || 1} бесплатный обмен набора в месяц`,
                'Бесплатная курьерская доставка по Алматы',
                'Медицинская дезинфекция паром и озоном'
              ]
          currentPlan.value.isGift = !!active.is_gift
          toysLimit.value = active.plan.toys_count || 3
        } else if (active.subscription_plan_id) {
          // Case 2: plan relation not loaded yet — look up by ID in displayPlans
          await fetchPlans()
          const matched = displayPlans.value.find(p => p.id === active.subscription_plan_id)
          if (matched) {
            currentPlan.value.name = matched.name
            currentPlan.value.price = `${formatPrice(matched.price_monthly)} ₸`
            currentPlan.value.features = matched.features
            currentPlan.value.isGift = !!active.is_gift
            toysLimit.value = matched.toys_count || 3
          } else {
            // Fallback: show generic gift info
            currentPlan.value.name = 'Подарочная подписка'
            currentPlan.value.price = '0 ₸'
            currentPlan.value.features = [
              'Развивающие игрушки по возрасту ребёнка',
              'Бесплатная курьерская доставка по Алматы',
              'Медицинская дезинфекция паром и озоном',
              'Персональный подбор методистом'
            ]
            currentPlan.value.isGift = true
            toysLimit.value = 3
          }
        } else {
          // Case 3: gift subscription without any plan_id — show generic gift info
          currentPlan.value.name = 'Подарочная подписка'
          currentPlan.value.price = '0 ₸'
          currentPlan.value.features = [
            'Развивающие игрушки по возрасту ребёнка',
            'Бесплатная курьерская доставка по Алматы',
            'Медицинская дезинфекция паром и озоном',
            'Персональный подбор методистом'
          ]
          currentPlan.value.isGift = true
          toysLimit.value = 3
        }

        if (active.next_billing_date) {
          nextBillingDate.value = formatDateHuman(active.next_billing_date)
        } else if (active.expires_at) {
          nextBillingDate.value = formatDateHuman(active.expires_at)
        }
      } else {
        // No active/paused subscription found
        hasActiveSubscription.value = false
      }
    } else {
      // Empty list — user has no subscriptions
      hasActiveSubscription.value = false
    }
  } catch (e) {
    console.warn('Could not load user subscription:', e)
    hasActiveSubscription.value = false
  } finally {
    isLoadingSubscription.value = false
  }
}

onMounted(async () => {
  await fetchPlans()
  await loadUserSubscription()
})

const freezeEndDateFormatted = computed(() => {
  if (!freezeEndDate.value) return '30 сентября 2026'
  return formatDateHuman(freezeEndDate.value)
})

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

const calcPlanPrice = (plan: PlanViewItem | undefined) => {
  if (!plan) return 22900
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
  isSubscriptionPaused.value = false
  showAllPlans.value = false
  isSubModalOpen.value = false
  currentPlan.value.name = selectedPlanName.value
  currentPlan.value.price = `${formatPrice(selectedPlanPrice.value)} ₸`
  alert(`Подписка по тарифу «${selectedPlanName.value}» успешно оформлена и активирована! 🎁`)
}

// -------------------------------------------------------------
// REQUIREMENT 1: FREEZE OPTIONS MODAL LOGIC
// -------------------------------------------------------------
const isFreezeModalOpen = ref(false)
const freezeOption = ref<'7' | '14' | '30' | 'custom'>('14')
const freezeDaysCount = ref(14)
const customFreezeDate = ref(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0])
const minCustomFreezeDate = ref(new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0])
const freezeReason = ref('vacation')
const freezeError = ref('')

const openFreezeModal = () => {
  freezeOption.value = '14'
  freezeDaysCount.value = 14
  customFreezeDate.value = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  freezeReason.value = 'vacation'
  freezeError.value = ''
  isFreezeModalOpen.value = true
}

const selectFreezePreset = (days: number) => {
  freezeOption.value = String(days) as any
  freezeDaysCount.value = days
  customFreezeDate.value = new Date(Date.now() + days * 86400000).toISOString().split('T')[0]
}

const computedFreezeDays = computed(() => {
  if (freezeOption.value === 'custom') {
    if (!customFreezeDate.value) return 7
    const target = new Date(customFreezeDate.value).getTime()
    const now = Date.now()
    return Math.max(1, Math.round((target - now) / 86400000))
  }
  return Number(freezeOption.value) || 14
})

const computedFreezeEndDateObj = computed(() => {
  return new Date(Date.now() + computedFreezeDays.value * 86400000)
})

const computedFreezeEndFormatted = computed(() => {
  return formatDateHuman(computedFreezeEndDateObj.value.toISOString())
})

const computedShiftedBillingDate = computed(() => {
  const future = new Date(Date.now() + (30 + computedFreezeDays.value) * 86400000)
  return formatDateHuman(future.toISOString())
})

const submitFreezeSubscription = async () => {
  isSubmitting.value = true
  freezeError.value = ''

  const endDateStr = computedFreezeEndDateObj.value.toISOString().split('T')[0]

  try {
    if (activeSubId.value) {
      await request(`/subscriptions/${activeSubId.value}/pause`, {
        method: 'POST',
        body: {
          freeze_end: endDateStr,
          reason: freezeReason.value
        }
      })
    }
    isSubscriptionPaused.value = true
    freezeEndDate.value = endDateStr
    nextBillingDate.value = computedShiftedBillingDate.value
    isFreezeModalOpen.value = false
  } catch (e: any) {
    console.warn('Backend freeze api error, updating local state:', e)
    isSubscriptionPaused.value = true
    freezeEndDate.value = endDateStr
    nextBillingDate.value = computedShiftedBillingDate.value
    isFreezeModalOpen.value = false
  } finally {
    isSubmitting.value = false
  }
}

const resumeSubscription = async () => {
  isSubmitting.value = true
  try {
    if (activeSubId.value) {
      await request(`/subscriptions/${activeSubId.value}/resume`, { method: 'POST' })
    }
    isSubscriptionPaused.value = false
    freezeEndDate.value = null
    nextBillingDate.value = '24 сентября 2026'
  } catch (e) {
    console.warn('Resume error, resetting state:', e)
    isSubscriptionPaused.value = false
    freezeEndDate.value = null
  } finally {
    isSubmitting.value = false
  }
}

// -------------------------------------------------------------
// EXACT TOYS DEFINITION PER PLAN
// -------------------------------------------------------------
const isPreviewModalOpen = ref(false)
const selectedPreviewPlan = ref<PlanViewItem | null>(null)

interface PreviewToy {
  id: number
  name: string
  age: string
  skill: string
  benefit: string
  desc: string
  image: string
}

// Curated Montessori fallback catalog
const sampleCatalogToys: PreviewToy[] = [
  {
    id: 1,
    name: 'Сенсорный деревянный кубик Монтессори',
    age: '6–18 мес',
    skill: '🧠 Сенсорика и осязание',
    benefit: 'Развивает тактильное восприятие и пальчиковый захват',
    desc: 'Натуральный бук, 6 интерактивных граней с шестерёнками, замочками и колокольчиком.',
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 2,
    name: 'Радужный геометрический сортер-пирамидка',
    age: '1–2 года',
    skill: '🧩 Логика и формы',
    benefit: 'Учит различать цвета, размеры и геометрические фигуры',
    desc: 'Экологичные деревянные кольца и блоки, покрытые безопасными красками на водной основе.',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 3,
    name: 'Балансир «Лесные зверята»',
    age: '1.5–3 года',
    skill: '⚖️ Координация и баланс',
    benefit: 'Тренирует аккуратность, пространственное мышление и терпение',
    desc: 'Набор фигурок из массива дуба для выстраивания устойчивых вертикальных башен.',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 4,
    name: 'Деревянный лабиринт-ходилка с шариками',
    age: '1–2.5 года',
    skill: '🖐️ Мелкая моторика',
    benefit: 'Подготовка кисти руки к рисованию и письму',
    desc: 'Проволочный трек с гладкими деревянными бусинами разного диаметра.',
    image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 5,
    name: 'Магнитная рыбалка Монтессори',
    age: '2–3 года',
    skill: '🎯 Внимание и глазомер',
    benefit: 'Укрепляет концентрацию внимания и ловкость',
    desc: 'Две деревянные удочки с магнитами и 12 разноцветных морских обитателей.',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 6,
    name: 'Архитектурный эко-конструктор из бука',
    age: '2.5–4 года',
    skill: '🏰 Пространственное мышление',
    benefit: 'Стимулирует инженерное воображение и сюжетно-ролевые игры',
    desc: '45 тщательно отшлифованных геометрических деталей без острых углов.',
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 7,
    name: 'Музыкальный металлофон из ясеня',
    age: '1–3 года',
    skill: '🎵 Слух и ритм',
    benefit: 'Развивает музыкальный слух и понимание ритма',
    desc: 'Точно настроенные металлические пластины с чистым мягким звучанием.',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 8,
    name: 'Инженерная мозаика со шнуровкой',
    age: '3+ года',
    skill: '🎨 Творчество и паттерны',
    benefit: 'Развивает навык работы по схемам и творческую фантазию',
    desc: 'Деревянный планшет, карточки с заданиями методиста и набор цветных элементов.',
    image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=400&q=80'
  }
]

const getPlanToys = (plan: PlanViewItem | null | undefined): PreviewToy[] => {
  if (!plan) return sampleCatalogToys.slice(0, 5)
  // If admin attached toys in backend, return them directly
  if (Array.isArray(plan.toys) && plan.toys.length > 0) {
    return plan.toys.map((t: any, idx: number) => ({
      id: t.id || (idx + 1),
      name: t.name || 'Развивающая эко-игрушка',
      age: t.min_age_months ? `${Math.round((t.min_age_months/12)*10)/10}–${Math.round((t.max_age_months/12)*10)/10} лет` : '1–3 года',
      skill: t.category === 'books' ? '📚 Чтение и речь' : '🧠 Логика и сенсорика',
      benefit: 'Развивает пространственное мышление и мелкую моторику',
      desc: t.description || 'Экологичная развивающая игрушка из натурального дерева, прошедшая 4-ступенчатую дезинфекцию.',
      image: t.image_url && !t.image_url.includes('placeholder') ? t.image_url : sampleCatalogToys[idx % sampleCatalogToys.length].image
    }))
  }
  const count = plan.toys_count || 5
  if (count <= 3) return sampleCatalogToys.slice(0, 3)
  if (count >= 8) return sampleCatalogToys.slice(0, 8)
  return sampleCatalogToys.slice(0, 5)
}

const currentPlanExactToys = computed(() => {
  return getPlanToys(selectedPreviewPlan.value)
})

const openPreviewToysModal = (plan: PlanViewItem) => {
  selectedPreviewPlan.value = plan
  isPreviewModalOpen.value = true
}

const handleSelectPlanFromPreview = () => {
  if (!selectedPreviewPlan.value) return
  isPreviewModalOpen.value = false
  handleSelectPlan(selectedPreviewPlan.value.name, calcPlanPrice(selectedPreviewPlan.value))
}

const formatDateHuman = (dateStr: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatPrice = (val: number) => {
  if (!val && val !== 0) return '0'
  return Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
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
    q: 'Можно ли заморозить подписку на время отпуска?',
    a: 'Да, в любой момент в личном кабинете вы можете выбрать заморозку на 7, 14 или 30 дней. Все оплаченные дни переносятся, а игрушки остаются у вас.'
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
  flex-wrap: wrap;
  gap: 16px;
}

.section-badge {
  display: inline-block;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 11.5px;
  color: #7C5CFC;
  letter-spacing: 1.5px;
  margin-bottom: 8px;
  background: #F0EDFF;
  padding: 4px 12px;
  border-radius: 20px;
}

.sub-main-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 36px;
  color: #1A1A2E;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.sub-subtitle {
  font-size: 15px;
  color: #7B7B93;
}

.view-plans-toggle-btn {
  background: #FFFFFF;
  border: 1.5px solid #E2E2EC;
  border-radius: 16px;
  padding: 12px 20px;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 14px;
  color: #7C5CFC;
  cursor: pointer;
  transition: all 0.2s;
}

.view-plans-toggle-btn:hover {
  background: #F0EDFF;
  border-color: #7C5CFC;
}

.sub-grid-section {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 28px;
  margin-bottom: 60px;
}

.plan-card {
  background: #FFFFFF;
  border-radius: 28px;
  padding: 36px;
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 10px 30px rgba(0,0,0,0.03);
  display: flex;
  flex-direction: column;
}

.plan-card.is-paused-card {
  border: 2px dashed #60A5FA;
  background: #F8FAFC;
}

.plan-badge-row {
  margin-bottom: 12px;
}

.active-badge {
  background: #E8F8F3;
  color: #06D6A0;
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 20px;
  letter-spacing: 0.5px;
}

.paused-badge {
  background: #EFF6FF;
  color: #2563EB;
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 20px;
  letter-spacing: 0.5px;
}

.plan-name {
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 800;
  color: #1A1A2E;
  margin-bottom: 8px;
}

.plan-price-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 20px;
}

.plan-price {
  font-family: 'Outfit', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: #7C5CFC;
}

.plan-period {
  font-size: 14px;
  color: #7B7B93;
}

.paused-info-banner {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  padding: 14px 16px;
  border-radius: 16px;
  margin-bottom: 20px;
}

.pause-icon {
  font-size: 24px;
}

.pause-text strong {
  display: block;
  font-size: 14px;
  color: #1E40AF;
  margin-bottom: 2px;
}

.pause-text p {
  font-size: 12.5px;
  color: #3B82F6;
  margin: 0;
  line-height: 1.4;
}

.plan-features {
  list-style: none;
  padding: 0;
  margin: 0 0 28px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
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
  font-size: 10px;
}

.plan-actions-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.change-plan-btn {
  flex: 1;
  background: #7C5CFC;
  color: #FFFFFF;
  border: none;
  padding: 14px 20px;
  border-radius: 16px;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
}

.change-plan-btn:hover {
  background: #624CE0;
}

.freeze-btn {
  background: #F4F4F8;
  color: #4A4A68;
  border: 1px solid #E2E2EC;
  padding: 14px 20px;
  border-radius: 16px;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
}

.freeze-btn:hover {
  background: #EFF6FF;
  color: #2563EB;
  border-color: #BFDBFE;
}

.resume-btn {
  background: #06D6A0;
  color: #FFFFFF;
  border: none;
  padding: 14px 20px;
  border-radius: 16px;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
}

.resume-btn:hover {
  background: #05b88a;
}

.right-stack {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.status-card {
  background: #FFFFFF;
  border-radius: 28px;
  padding: 28px;
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 8px 24px rgba(0,0,0,0.02);
}

.payment-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-small-label {
  font-size: 12.5px;
  color: #7B7B93;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 6px;
}

.card-main-val {
  font-family: 'Outfit', sans-serif;
  font-size: 26px;
  font-weight: 800;
  color: #1A1A2E;
  margin-bottom: 4px;
}

.card-sub-info {
  font-size: 13px;
  color: #7B7B93;
  margin: 0;
}

.avatars-decor {
  display: flex;
  gap: 8px;
}

.face-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  position: relative;
}

.peach-face { background: #FFD6A5; }
.blue-face { background: #BEE1E6; }

.face-eye {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #1A1A2E;
  border-radius: 50%;
  top: 16px;
}
.face-eye.left { left: 13px; }
.face-eye.right { right: 13px; }

.face-mouth {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
}
.face-mouth.line {
  width: 10px;
  height: 2px;
  background: #1A1A2E;
  border-radius: 2px;
}
.face-mouth.smile {
  width: 10px;
  height: 5px;
  border-bottom: 2px solid #1A1A2E;
  border-radius: 0 0 10px 10px;
}

.progress-track {
  width: 100%;
  height: 10px;
  background: #F4F4F8;
  border-radius: 10px;
  overflow: hidden;
  margin: 16px 0 12px 0;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #7C5CFC, #06D6A0);
  border-radius: 10px;
  transition: width 0.3s ease;
}

.limit-footer {
  padding-top: 4px;
}

.view-toys-btn-link {
  background: none;
  border: none;
  color: #7C5CFC;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 13.5px;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

/* SHOWCASE PRICING VIEW */
.back-to-sub-btn {
  background: none;
  border: none;
  color: #7C5CFC;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 20px;
}

.pricing-hero-header {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 48px auto;
}

.hero-tag {
  display: inline-block;
  background: #F0EDFF;
  color: #7C5CFC;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 12px;
  letter-spacing: 1.5px;
  padding: 6px 16px;
  border-radius: 20px;
  margin-bottom: 16px;
}

.pricing-hero-title {
  font-family: 'Outfit', sans-serif;
  font-size: 38px;
  font-weight: 800;
  color: #1A1A2E;
  margin-bottom: 14px;
  line-height: 1.25;
}

.pricing-hero-subtitle {
  font-size: 16px;
  color: #7B7B93;
  line-height: 1.6;
  margin-bottom: 32px;
}

.billing-switcher-wrapper {
  display: flex;
  justify-content: center;
}

.billing-switcher {
  display: inline-flex;
  background: #FFFFFF;
  padding: 6px;
  border-radius: 20px;
  border: 1px solid #E2E2EC;
  gap: 6px;
}

.switch-tab-btn {
  background: transparent;
  border: none;
  padding: 10px 20px;
  border-radius: 16px;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 14px;
  color: #4A4A68;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.switch-tab-btn.active {
  background: #7C5CFC;
  color: #FFFFFF;
  box-shadow: 0 4px 14px rgba(124, 92, 252, 0.3);
}

.save-badge {
  background: #06D6A0;
  color: #FFFFFF;
  font-size: 11px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 12px;
}

.save-badge.gold {
  background: #FFB703;
  color: #1A1A2E;
}

.mobile-sub-pills {
  display: none;
}

.pricing-cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
  margin-bottom: 48px;
}

.pricing-plan-card {
  background: #FFFFFF;
  border-radius: 28px;
  padding: 32px;
  border: 1.5px solid #EAEAEA;
  box-shadow: 0 6px 24px rgba(0,0,0,0.02);
  display: flex;
  flex-direction: column;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
}

.pricing-plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 36px rgba(124, 92, 252, 0.08);
}

.pricing-plan-card.featured-plan {
  border-color: #7C5CFC;
  box-shadow: 0 12px 36px rgba(124, 92, 252, 0.15);
  transform: scale(1.02);
}

.popular-ribbon {
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  background: #7C5CFC;
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 11px;
  padding: 4px 16px;
  border-radius: 20px;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.card-top-head {
  margin-bottom: 16px;
}

.plan-type-tag {
  font-size: 12px;
  font-weight: 800;
  color: #7B7B93;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 6px;
}

.plan-type-tag.featured {
  color: #7C5CFC;
}

.plan-title {
  font-family: 'Outfit', sans-serif;
  font-size: 26px;
  font-weight: 800;
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
  margin-bottom: 16px;
}

.price-display {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.price-amount {
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 800;
  color: #1A1A2E;
}

.price-amount.featured {
  color: #7C5CFC;
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

/* Compact button row */
.preview-toys-action-wrap {
  margin-bottom: 18px;
}

.preview-set-btn {
  width: 100%;
  background: #F0EDFF;
  color: #7C5CFC;
  border: 1.5px solid #7C5CFC;
  border-radius: 14px;
  padding: 12px 14px;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 13.5px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.preview-set-btn:hover {
  background: #7C5CFC;
  color: #FFFFFF;
  box-shadow: 0 4px 12px rgba(124, 92, 252, 0.25);
  transform: translateY(-1px);
}

.plan-divider {
  height: 1px;
  background: #F4F4F8;
  margin-bottom: 18px;
}

.plan-perks-list {
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.plan-perks-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13.5px;
  color: #4A4A68;
  line-height: 1.4;
}

.check-icon {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #E8F8F3;
  color: #06D6A0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 900;
  flex-shrink: 0;
  margin-top: 1px;
}

.check-icon.featured {
  background: #F0EDFF;
  color: #7C5CFC;
}

.select-plan-btn {
  width: 100%;
  background: #F4F4F8;
  color: #1A1A2E;
  border: none;
  padding: 14px;
  border-radius: 16px;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 14.5px;
  cursor: pointer;
  transition: all 0.2s;
}

.select-plan-btn:hover {
  background: #E2E2EC;
}

.select-plan-btn.featured {
  background: #7C5CFC;
  color: #FFFFFF;
}

.select-plan-btn.featured:hover {
  background: #624CE0;
  box-shadow: 0 6px 20px rgba(124, 92, 252, 0.35);
}

.extra-toys-banner {
  background: #FFFFFF;
  border-radius: 24px;
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid rgba(0,0,0,0.05);
  margin-bottom: 60px;
  flex-wrap: wrap;
  gap: 20px;
}

.extra-toys-content {
  display: flex;
  align-items: center;
  gap: 18px;
}

.extra-icon {
  font-size: 36px;
}

.extra-text h4 {
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 4px;
}

.extra-text p {
  font-size: 14px;
  color: #7B7B93;
  margin: 0;
}

.extra-counter-box {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #F4F4F8;
  padding: 6px 12px;
  border-radius: 16px;
}

.extra-step-btn {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: none;
  background: #FFFFFF;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.extra-step-val {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 14.5px;
  color: #7C5CFC;
}

.inclusions-section {
  background: #FFFFFF;
  border-radius: 32px;
  padding: 48px;
  margin-bottom: 60px;
}

.inclusions-title {
  text-align: center;
  font-family: 'Outfit', sans-serif;
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 36px;
}

.inclusions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.inclusion-card {
  text-align: center;
}

.inc-icon {
  font-size: 38px;
  margin-bottom: 12px;
}

.inclusion-card h3 {
  font-family: 'Outfit', sans-serif;
  font-size: 17px;
  font-weight: 800;
  margin-bottom: 8px;
}

.inclusion-card p {
  font-size: 13.5px;
  color: #7B7B93;
  line-height: 1.5;
}

.faq-section {
  max-width: 800px;
  margin: 0 auto;
}

.faq-heading {
  text-align: center;
  font-family: 'Outfit', sans-serif;
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 28px;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.faq-card {
  background: #FFFFFF;
  border-radius: 18px;
  padding: 20px 24px;
  border: 1px solid #EAEAEA;
  cursor: pointer;
  transition: all 0.2s;
}

.faq-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.faq-header h3 {
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 700;
  margin: 0;
}

.faq-toggle {
  font-size: 22px;
  font-weight: 700;
  color: #7C5CFC;
}

.faq-body {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #F4F4F8;
}

.faq-body p {
  font-size: 14px;
  color: #7B7B93;
  line-height: 1.55;
  margin: 0;
}

/* MODAL STYLES */
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
  border-radius: 28px;
  padding: 32px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.2);
}

.freeze-modal-card {
  max-width: 520px;
}

.preview-toys-modal-card {
  max-width: 760px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.close-btn {
  position: absolute;
  top: 18px;
  right: 18px;
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

.modal-icon-badge {
  width: 48px;
  height: 48px;
  background: #EFF6FF;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 16px;
}

.sub-modal-title {
  font-family: 'Outfit', sans-serif;
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 6px;
}

.sub-modal-desc {
  font-size: 13.5px;
  color: #7B7B93;
  line-height: 1.5;
  margin-bottom: 20px;
}

/* Freeze options */
.freeze-options-group {
  margin-bottom: 16px;
}

.freeze-group-title {
  font-size: 13px;
  font-weight: 700;
  color: #1A1A2E;
  display: block;
  margin-bottom: 8px;
}

.freeze-presets-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 10px;
}

.freeze-preset-card {
  background: #FAF9FE;
  border: 1.5px solid #E2E2EC;
  border-radius: 14px;
  padding: 10px 8px;
  text-align: center;
  cursor: pointer;
  transition: 0.2s;
}

.freeze-preset-card strong {
  display: block;
  font-family: 'Outfit', sans-serif;
  font-size: 13.5px;
  color: #1A1A2E;
}

.freeze-preset-card span {
  font-size: 11px;
  color: #7B7B93;
}

.freeze-preset-card:hover {
  border-color: #60A5FA;
}

.freeze-preset-card.active {
  background: #EFF6FF;
  border-color: #2563EB;
}

.freeze-preset-card.active strong {
  color: #2563EB;
}

.custom-date-box {
  background: #F8FAFC;
  padding: 10px 14px;
  border-radius: 12px;
  margin-top: 8px;
}

.custom-date-box label {
  font-size: 12px;
  color: #64748B;
  display: block;
  margin-bottom: 4px;
}

.custom-date-input {
  width: 100%;
  padding: 8px 12px;
  border: 1.5px solid #CBD5E1;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
}

.freeze-reason-box {
  margin-bottom: 16px;
}

.freeze-select {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #E2E2EC;
  border-radius: 12px;
  font-size: 14px;
  outline: none;
  background: #FFFFFF;
}

.freeze-summary-card {
  background: #FAF9FE;
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  color: #4A4A68;
}

.highlight-date {
  color: #2563EB;
}

.modal-buttons-row {
  display: flex;
  gap: 12px;
}

.cancel-modal-btn {
  flex: 1;
  background: #F4F4F8;
  border: none;
  padding: 12px;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
}

.confirm-freeze-btn {
  flex: 1.5;
  background: #2563EB;
  color: #FFFFFF;
  border: none;
  padding: 12px;
  border-radius: 14px;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
}

.confirm-freeze-btn:hover:not(:disabled) {
  background: #1D4ED8;
}

.confirm-freeze-btn:disabled {
  opacity: 0.6;
}

/* PREVIEW TOYS MODAL */
.modal-header-compact {
  margin-bottom: 16px;
}

.preview-plan-badge {
  display: inline-block;
  background: #F0EDFF;
  color: #7C5CFC;
  font-size: 11px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 8px;
  margin-bottom: 6px;
}

.preview-toys-scroll-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  overflow-y: auto;
  max-height: 52vh;
  padding-right: 4px;
  margin-bottom: 18px;
}

.preview-toy-item-card {
  background: #FAF9FE;
  border-radius: 18px;
  padding: 12px;
  border: 1px solid rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
}

.preview-toy-img-box {
  position: relative;
  width: 100%;
  height: 140px;
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 10px;
  background: #ECECF4;
}

.preview-toy-img-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.toy-item-number {
  position: absolute;
  top: 6px;
  left: 6px;
  background: #7C5CFC;
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 6px;
}

.toy-skill-badge {
  position: absolute;
  bottom: 6px;
  left: 6px;
  background: rgba(26, 26, 46, 0.85);
  backdrop-filter: blur(4px);
  color: #FFFFFF;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
}

.preview-toy-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.toy-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 4px;
}

.toy-title-row h4 {
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 800;
  color: #1A1A2E;
  margin: 0;
  line-height: 1.3;
}

.toy-age-tag {
  font-size: 11px;
  font-weight: 800;
  background: #FFF3D6;
  color: #B37D00;
  padding: 2px 6px;
  border-radius: 6px;
  white-space: nowrap;
}

.toy-descr {
  font-size: 12px;
  color: #7B7B93;
  line-height: 1.4;
  margin-bottom: 8px;
}

.toy-perk-tag {
  margin-top: auto;
  font-size: 11px;
  font-weight: 700;
  color: #06D6A0;
}

.preview-modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #F4F4F8;
  padding-top: 14px;
}

.footer-price-lbl {
  font-size: 11px;
  color: #7B7B93;
  display: block;
}

.footer-price-val {
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  font-weight: 800;
  color: #7C5CFC;
}

.preview-action-btn {
  background: #7C5CFC;
  color: #FFFFFF;
  border: none;
  padding: 12px 24px;
  border-radius: 14px;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
}

.preview-action-btn:hover {
  background: #624CE0;
}

/* CHECKOUT MODAL */
.modal-price-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #F0EDFF;
  padding: 14px;
  border-radius: 14px;
  margin-bottom: 18px;
  color: #7C5CFC;
  font-weight: 700;
}

.modal-price-summary strong {
  font-size: 20px;
  font-family: 'Outfit', sans-serif;
}

.payment-methods-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.pay-method-radio {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 1.5px solid #E2E2EC;
  border-radius: 12px;
  font-size: 13.5px;
  cursor: pointer;
}

.confirm-sub-btn {
  width: 100%;
  background: #06D6A0;
  color: #FFFFFF;
  border: none;
  padding: 14px;
  border-radius: 14px;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
}

.confirm-sub-btn:hover {
  background: #05b88a;
}

.confirm-sub-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.gift-act-btn {
  background: #FFF3D6;
  color: #B37D00;
  border: 1.5px solid #FFB703;
  padding: 10px 18px;
  border-radius: 14px;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 13.5px;
  cursor: pointer;
  margin-right: 12px;
  transition: all 0.2s;
}

.gift-act-btn:hover {
  background: #FFE8A3;
}

.gift-modal-header {
  text-align: center;
  margin-bottom: 20px;
}

.gift-icon-badge {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
}

.gift-activate-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.gift-activate-form .g-field label {
  display: block;
  font-size: 12.5px;
  font-weight: 700;
  color: #4A4A68;
  margin-bottom: 6px;
}

.gift-activate-form .req {
  color: #E63946;
}

.gift-code-input {
  width: 100%;
  background: #FAF9FE;
  border: 1.5px solid #E2E2EC;
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.gift-code-input:focus {
  border-color: #7C5CFC;
  background: #FFFFFF;
}

.error-banner {
  background: #FEE2E2;
  color: #DC2626;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
}

.success-banner {
  background: #DCFCE7;
  color: #15803D;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.45;
}

@media (max-width: 960px) {
  .sub-grid-section { grid-template-columns: 1fr; }
  .pricing-cards-grid { grid-template-columns: 1fr; }
  .inclusions-grid { grid-template-columns: 1fr 1fr; }
  .preview-toys-scroll-grid { grid-template-columns: 1fr; }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ── Loading skeleton ───────────────────────────────── */
.sub-loading-state {
  padding: 48px 0;
}
.sub-loading-skeleton {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.skel-header,
.skel-card {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 16px;
}
.skel-header { height: 56px; width: 340px; max-width: 100%; }
.skel-card   { height: 260px; width: 100%; }
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── Gift badge (next to АКТИВЕН) ──────────────────── */
.plan-badge-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.gift-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #FFF3CD, #FFE08A);
  color: #92600A;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 3px 10px;
  border-radius: 20px;
  border: 1px solid #F5C842;
}
.gift-price {
  color: #D97706;
  font-weight: 700;
}
</style>
