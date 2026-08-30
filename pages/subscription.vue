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
      <SubscriptionActiveDashboard
        v-else-if="user && hasActiveSubscription && !showAllPlans"
        :is-paused="isSubscriptionPaused"
        :child-name="subscriptionChildName"
        :child-age="subscriptionChildAge"
        :plan="currentPlan"
        :next-billing-date="nextBillingDate"
        :freeze-end-formatted="freezeEndDateFormatted"
        :toys-in-use="toysInUse"
        :toys-limit="toysLimit"
        :next-delivery-date="nextDeliveryDate"
        :planned-exchange-date="plannedExchangeDateFormatted"
        :set-status-label="currentSetStatusLabel"
        :set-status="currentSetStatus"
        :delivery-task-id="deliveryTaskId"
        :current-set-id="currentSetId"
        :delivery-address="deliveryAddress"
        :delivery-track-link="deliveryTrackLink"
        :action-error="subscriptionActionError"
        :is-submitting="isSubmitting"
        :is-requesting-exchange="isRequestingExchange"
        @open-gift="isGiftCodeModalOpen = true"
        @show-plans="showAllPlans = true"
        @freeze="openFreezeModal"
        @cancel="openCancelModal"
        @resume="resumeSubscription"
        @view-toys="openCurrentSetToysModal"
        @exchange="handleExchangeRequest"
        @reschedule="openRescheduleModal"
      />

      <!-- PUBLIC / SHOWCASE PRICING VIEW -->
      <SubscriptionPricingShowcase
        v-else
        v-model:billing-cycle="billingCycle"
        v-model:extra-toys-count="extraToysCount"
        :plans="displayPlans"
        :is-loading="isLoadingPlans"
        :is-logged-in="!!user"
        :show-back-to-dashboard="!!(user && hasActiveSubscription)"
        :active-mobile-plan="activeMobileSubPlan"
        :faqs="faqs"
        @back-to-dashboard="showAllPlans = false"
        @select-plan="handleSelectPlan"
        @preview-toys="openPreviewToysModal"
        @scroll-mobile-plan="scrollToMobileSubPlan"
      />
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
                  :class="{ active: freezeOption === '1' }"
                  @click="selectFreezePreset(1)"
                >
                  <strong>1 день</strong>
                  <span>Минимум</span>
                </div>
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

    <!-- MODAL: Reschedule Exchange (ТЗ п.12) -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isRescheduleModalOpen" class="modal-overlay" @click.self="isRescheduleModalOpen = false">
          <div class="sub-modal-card freeze-modal-card">
            <button class="close-btn" @click="isRescheduleModalOpen = false">&times;</button>
            <div class="modal-icon-badge">📅</div>
            <h2 class="sub-modal-title">Перенос даты обмена</h2>
            <p class="sub-modal-desc">
              Текущая дата обмена: <strong>{{ plannedExchangeDateFormatted || 'не назначена' }}</strong>
            </p>
            <div class="reschedule-warning-banner">
              Частый перенос обмена может привести к тому, что вы не успеете использовать все обмены, предусмотренные вашим тарифом в текущем расчётном периоде.
            </div>
            <div class="custom-date-box">
              <label>Новая дата обмена:</label>
              <input v-model="rescheduleDate" type="date" :min="minRescheduleDate" class="custom-date-input" />
            </div>
            <div v-if="rescheduleError" class="modal-error-banner">{{ rescheduleError }}</div>
            <div class="modal-buttons-row">
              <button class="cancel-modal-btn" @click="isRescheduleModalOpen = false">Отмена</button>
              <button class="confirm-freeze-btn" :disabled="isSubmitting || !rescheduleDate" @click="submitRescheduleExchange">
                <span v-if="isSubmitting">Сохраняем...</span>
                <span v-else>Перенести обмен</span>
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
              <span v-if="previewMode === 'plan'" class="preview-plan-badge">Тариф {{ selectedPreviewPlan?.name }}</span>
              <span v-else class="preview-plan-badge">Ваш набор</span>
              <h2 class="sub-modal-title">
                {{ previewMode === 'plan'
                  ? `Состав набора тарифа «${selectedPreviewPlan?.name}» 🧸`
                  : 'Игрушки в вашем текущем наборе 🧸' }}
              </h2>
              <p class="sub-modal-desc">
                <template v-if="previewMode === 'plan'">
                  В этот тариф входит ровно <strong>{{ previewToys.length }} развивающих эко-игрушек</strong>, подобранных методистами Alpha:
                </template>
                <template v-else>
                  Состав вашего текущего набора, подобранного методистом Alpha:
                </template>
              </p>
            </div>

            <!-- Detailed Numbered Toys Grid in Modal -->
            <div v-if="previewToys.length === 0" class="preview-toys-empty">
              <p v-if="previewMode === 'plan'">Состав набора для этого тарифа ещё не настроен в админ-панели.</p>
              <p v-else>Набор ещё комплектуется методистом. Игрушки появятся здесь после сборки.</p>
            </div>
            <div v-else class="preview-toys-scroll-grid">
              <div 
                v-for="(toy, tIdx) in previewToys" 
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
                  <button
                    v-if="previewMode === 'set' && canBuyoutToy(toy)"
                    type="button"
                    class="buyout-toy-btn"
                    :disabled="buyoutLoadingToyId === toy.id"
                    @click="handleBuyoutToy(toy)"
                  >
                    {{ buyoutLoadingToyId === toy.id ? 'Оформляем...' : 'Выкупить со скидкой подписчика' }}
                  </button>
                  <span v-else-if="previewMode === 'set' && toy.isBoughtOut" class="buyout-done-tag">✓ Выкуплена</span>
                </div>
              </div>
            </div>

            <!-- Bottom CTA inside preview modal -->
            <div v-if="previewMode === 'plan'" class="preview-modal-footer">
              <div class="preview-footer-left">
                <span class="footer-price-lbl">Стоимость тарифа:</span>
                <strong class="footer-price-val">{{ formatPrice(planPrice(selectedPreviewPlan || displayPlans[0])) }} ₸ / мес</strong>
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
            <h2 class="sub-modal-title">{{ isChangingPlan ? 'Смена тарифного плана' : 'Оформление подписки 🧸' }}</h2>
            <p class="sub-modal-desc">
              {{ isChangingPlan ? 'Новый тариф' : 'Тариф' }} <strong>{{ selectedPlanName }}</strong>
              <template v-if="!isChangingPlan">
                ({{ billingCycle === 'monthly' ? 'Ежемесячно' : billingCycle === 'quarterly' ? '3 месяца' : billingCycle === 'semiannual' ? '6 месяцев' : '12 месяцев' }})
              </template>
            </p>

            <div class="modal-price-summary">
              <span>{{ isChangingPlan ? 'Новая стоимость:' : 'Сумма к оплате:' }}</span>
              <strong>{{ formatPrice(isChangingPlan ? selectedPlanPrice : checkoutBilledTotal) }} ₸</strong>
            </div>

            <div v-if="!isChangingPlan" class="checkout-child-fields">
              <div v-if="isLoadingCheckoutChildren" class="checkout-children-loading">
                Загружаем профили детей...
              </div>

              <template v-else-if="checkoutChildMode === 'select' && checkoutChildren.length > 0">
                <label class="checkout-section-label">Для кого оформляем подписку? <span class="req">*</span></label>
                <div class="checkout-children-list">
                  <button
                    v-for="child in checkoutChildren"
                    :key="child.id"
                    type="button"
                    class="checkout-child-card"
                    :class="{
                      selected: selectedCheckoutChildId === child.id,
                      disabled: child.hasActiveSubscription,
                    }"
                    :disabled="child.hasActiveSubscription"
                    @click="selectCheckoutChild(child.id)"
                  >
                    <span class="checkout-child-radio">
                      <span v-if="selectedCheckoutChildId === child.id" class="radio-inner"></span>
                    </span>
                    <span class="checkout-child-info">
                      <strong>{{ child.name }}</strong>
                      <span>{{ formatCheckoutChildAge(child) }}</span>
                    </span>
                    <span v-if="child.hasActiveSubscription" class="checkout-child-badge">Уже есть подписка</span>
                  </button>
                </div>
                <button type="button" class="checkout-add-child-link" @click="switchToCreateChild">
                  + Добавить другого ребёнка
                </button>
              </template>

              <template v-else>
                <div v-if="checkoutChildren.length > 0" class="checkout-back-to-list">
                  <button type="button" class="checkout-add-child-link" @click="switchToSelectChild">
                    ← Выбрать из списка детей
                  </button>
                </div>
                <p v-else class="checkout-child-hint">
                  Профилей детей пока нет — создадим новый профиль для подбора игрушек по возрасту.
                </p>
                <div class="g-field">
                  <label>Имя ребёнка <span class="req">*</span></label>
                  <input
                    v-model="checkoutChildName"
                    type="text"
                    placeholder="Например: Миша"
                    class="gift-code-input"
                  />
                </div>
                <div class="g-field">
                  <label>Возраст малыша (в месяцах) <span class="req">*</span></label>
                  <input
                    v-model.number="checkoutChildAgeMonths"
                    type="number"
                    placeholder="14"
                    min="1"
                    max="120"
                    class="gift-code-input"
                  />
                </div>
              </template>
            </div>

            <div v-if="!isChangingPlan" class="payment-methods-box">
              <label class="pay-method-radio">
                <input v-model="paymentMethod" type="radio" name="sub_pay" value="kaspi" />
                <span>Оплата Kaspi QR / Счет</span>
              </label>
              <label class="pay-method-radio">
                <input v-model="paymentMethod" type="radio" name="sub_pay" value="card" />
                <span>Банковской картой онлайн (Visa / Mastercard)</span>
              </label>
            </div>

            <div v-if="!isChangingPlan && paymentMethod === 'kaspi'" class="checkout-pay-preview">
              <div class="checkout-qr-mock">Kaspi QR</div>
              <p>Отсканируйте QR-код в приложении Kaspi.kz</p>
            </div>
            <div v-else-if="!isChangingPlan" class="checkout-pay-preview card-preview">
              <input type="text" placeholder="4400 •••• •••• 1234" class="gift-code-input" readonly />
              <p>Демо-оплата картой (интеграция в разработке)</p>
            </div>

            <div v-if="checkoutError" class="error-banner">
              {{ checkoutError }}
            </div>

            <button class="confirm-sub-btn" :disabled="isActivatingSubscription" @click="activateSubscription">
              {{
                isActivatingSubscription
                  ? (isChangingPlan ? 'Меняем тариф...' : 'Оформляем подписку...')
                  : (isChangingPlan ? 'Подтвердить смену тарифа' : 'Оплатить и активировать подписку')
              }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- MODAL: Cancel Subscription -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isCancelModalOpen" class="modal-overlay" @click.self="isCancelModalOpen = false">
          <div class="sub-modal-card">
            <button class="close-btn" @click="isCancelModalOpen = false">&times;</button>
            <h2 class="sub-modal-title">Отменить подписку?</h2>
            <p class="sub-modal-desc">
              После отмены автопродление будет отключено. Текущий набор останется у вас до завершения оплаченного периода.
            </p>
            <div v-if="subscriptionActionError" class="error-banner">
              {{ subscriptionActionError }}
            </div>
            <div class="modal-buttons-row">
              <button class="cancel-modal-btn" @click="isCancelModalOpen = false">Назад</button>
              <button class="confirm-freeze-btn danger" :disabled="isSubmitting" @click="submitCancelSubscription">
                {{ isSubmitting ? 'Отменяем...' : 'Да, отменить подписку' }}
              </button>
            </div>
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

    <!-- TheFooter -->
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import TheHeader from '~/components/TheHeader.vue'
import TheFooter from '~/components/TheFooter.vue'
import SubscriptionActiveDashboard from '~/components/subscription/SubscriptionActiveDashboard.vue'
import SubscriptionPricingShowcase from '~/components/subscription/SubscriptionPricingShowcase.vue'
import type { PlanViewItem } from '~/composables/useSubscriptionPricing'

const route = useRoute()
const { user, openAuthModal, fetchUser, isInitialized } = useAuth()
const { request } = useApi()
const { calculateBuyout, executeBuyout } = useBuyout()
const {
  createSubscription,
  paySubscription,
  changePlan,
  cancelSubscription,
  requestExchange,
  rescheduleExchange,
} = useSubscriptions()
const { plans: apiPlans, fetchPlans, isLoading: isLoadingPlans } = useSubscriptionPlans()
const { formatPrice, mapPlanToView, calcPlanPrice, calcBilledTotal } = useSubscriptionPricing()

// Gift Activation Modal State
const isGiftCodeModalOpen = ref(false)
const giftActivationCode = ref('')
const giftChildName = ref('')
const giftChildAgeMonths = ref<number | null>(null)
const isActivatingGift = ref(false)
const giftActivationError = ref('')
const giftActivationSuccess = ref('')

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
  if (!user.value) {
    openAuthModal('login')
    return
  }

  const phone = user.value.phone?.trim()
  if (!phone) {
    giftActivationError.value = 'Добавьте номер телефона в профиле — он нужен для активации сертификата.'
    return
  }

  isActivatingGift.value = true
  giftActivationError.value = ''
  giftActivationSuccess.value = ''

  try {
    if (code.startsWith('GSUB-')) {
      const childrenRes = await request<any>('/children')
      const children = Array.isArray(childrenRes?.data) ? childrenRes.data : (Array.isArray(childrenRes) ? childrenRes : [])
      const childName = giftChildName.value.trim()
      let child = children.find((c: any) => c.name?.toLowerCase() === childName.toLowerCase())

      if (!child) {
        const ageMonths = Number(giftChildAgeMonths.value) || 12
        const birthDate = new Date()
        birthDate.setMonth(birthDate.getMonth() - ageMonths)
        const created = await request<any>('/children', {
          method: 'POST',
          body: JSON.stringify({
            name: childName,
            birth_date: birthDate.toISOString().slice(0, 10),
          }),
        })
        child = created?.data || created
      }

      await request<any>('/gift-subscriptions/activate', {
        method: 'POST',
        body: JSON.stringify({
          code,
          child_id: child.id,
        }),
      })

      giftActivationSuccess.value = `🎉 Подарочная подписка ${code} успешно активирована для малыша ${giftChildName.value}! Первый набор будет сформирован методистом и отправлен курьером.`
    } else {
      await request<any>('/gift-cards/claim', {
        method: 'POST',
        body: JSON.stringify({
          code,
          child_name: giftChildName.value.trim(),
          child_age_months: Number(giftChildAgeMonths.value) || 12,
          phone,
          address: user.value.address || '',
        }),
      })

      giftActivationSuccess.value = `🎉 Подарочный сертификат ${code} успешно активирован для малыша ${giftChildName.value}! Первый набор будет сформирован методистом и отправлен курьером.`
    }

    isLoadingSubscription.value = true
    await loadUserSubscription()
    showAllPlans.value = false
    setTimeout(() => {
      isGiftCodeModalOpen.value = false
    }, 2500)
  } catch (e: any) {
    giftActivationError.value = e?.data?.message || e?.message || 'Сертификат с таким кодом не найден, уже использован или истек.'
  } finally {
    isActivatingGift.value = false
  }
}

const displayPlans = computed<PlanViewItem[]>(() => (
  apiPlans.value.map((p, index) => mapPlanToView(p, index))
))

// Active Subscription state
const hasActiveSubscription = ref(false)  // starts false — set to true only after API confirms
const activeSubId = ref<number | null>(null)  // starts null — filled from real API response
const isSubscriptionPaused = ref(false)
const freezeEndDate = ref<string | null>(null)
const showAllPlans = ref(false)
const extraToysCount = ref<number>(0)
const billingCycle = ref<'monthly' | 'quarterly' | 'semiannual' | 'annual'>('monthly')
const activeMobileSubPlan = ref(1)
const isLoadingSubscription = ref(true)  // show loader until API responds

const currentPlan = ref({
  name: '',
  price: '',
  features: [] as string[],
  isGift: false
})

const currentPlanItem = computed(() => {
  if (!currentPlan.value.name) return displayPlans.value[0]
  return displayPlans.value.find(p => p.name.toLowerCase() === currentPlan.value.name.toLowerCase()) || displayPlans.value[0]
})

const deliveryTrackLink = computed(() => {
  if (deliveryTaskId.value) return `/delivery?task_id=${deliveryTaskId.value}`
  if (currentSetId.value) return `/delivery?subscription_set_id=${currentSetId.value}`
  return '/delivery'
})

const nextBillingDate = ref('')
const nextDeliveryDate = ref('')
const plannedExchangeDate = ref('')
const subscriptionChildName = ref('')
const subscriptionChildAge = ref('')
const currentSetStatusLabel = ref('')
const currentSetStatus = ref('')
const currentSetId = ref<number | null>(null)
const deliveryTaskId = ref<number | null>(null)
const deliveryAddress = ref('')
const toysInUse = ref(0)
const toysLimit = ref(3)
const activeCurrentSetToys = ref<any[]>([])
const isSubmitting = ref(false)
const buyoutLoadingToyId = ref<number | null>(null)

const setStatusLabels: Record<string, string> = {
  assembling: 'Комплектуется на складе',
  delivering: 'Передан курьеру',
  in_use: 'У вас дома',
  returning: 'Ожидает возврата',
  returned: 'Возвращён на склад',
}

const resetSubscriptionView = () => {
  hasActiveSubscription.value = false
  activeSubId.value = null
  isSubscriptionPaused.value = false
  freezeEndDate.value = null
  showAllPlans.value = false
  nextBillingDate.value = ''
  nextDeliveryDate.value = ''
  subscriptionChildName.value = ''
  subscriptionChildAge.value = ''
  currentSetStatusLabel.value = ''
  currentSetStatus.value = ''
  currentSetId.value = null
  deliveryTaskId.value = null
  deliveryAddress.value = ''
  toysInUse.value = 0
  activeCurrentSetToys.value = []
  currentPlan.value = { name: '', price: '', features: [], isGift: false }
}

const applyActiveSubscription = async (active: any) => {
  hasActiveSubscription.value = true
  activeSubId.value = active.id
  isSubscriptionPaused.value = active.status === 'paused'
  freezeEndDate.value = active.freeze_end || null

  if (active.child?.name) {
    subscriptionChildName.value = active.child.name
    subscriptionChildAge.value = active.child.age_in_months
      ? `${active.child.age_in_months} мес`
      : ''
  }

  if (active.plan) {
    currentPlan.value.name = active.plan.name
    currentPlan.value.price = `${formatPrice(active.plan.price_monthly)} ₸`
    currentPlan.value.features = Array.isArray(active.plan.features) && active.plan.features.length > 0
      ? active.plan.features
      : [
          `${active.plan.toys_count} развивающих игрушек дома одновременно`,
          `${active.plan.exchanges_count || 1} бесплатный обмен набора в месяц`,
          'Бесплатная курьерская доставка по Алматы',
          'Медицинская дезинфекция паром и озоном',
        ]
    currentPlan.value.isGift = !!active.is_gift
    toysLimit.value = (active.plan.toys_count || 3) + (active.extra_toys_count || 0)
  } else if (active.subscription_plan_id) {
    await fetchPlans()
    const matched = displayPlans.value.find(p => p.id === active.subscription_plan_id)
    if (matched) {
      currentPlan.value.name = matched.name
      currentPlan.value.price = `${formatPrice(matched.price_monthly)} ₸`
      currentPlan.value.features = matched.features
      currentPlan.value.isGift = !!active.is_gift
      toysLimit.value = matched.toys_count || 3
    } else {
      currentPlan.value.name = 'Подарочная подписка'
      currentPlan.value.price = '0 ₸'
      currentPlan.value.features = [
        'Развивающие игрушки по возрасту ребёнка',
        'Бесплатная курьерская доставка по Алматы',
        'Медицинская дезинфекция паром и озоном',
        'Персональный подбор методистом',
      ]
      currentPlan.value.isGift = true
      toysLimit.value = 3
    }
  } else {
    currentPlan.value.name = 'Подарочная подписка'
    currentPlan.value.price = '0 ₸'
    currentPlan.value.features = [
      'Развивающие игрушки по возрасту ребёнка',
      'Бесплатная курьерская доставка по Алматы',
      'Медицинская дезинфекция паром и озоном',
      'Персональный подбор методистом',
    ]
    currentPlan.value.isGift = true
    toysLimit.value = 3
  }

  if (active.next_billing_date) {
    nextBillingDate.value = formatDateHuman(active.next_billing_date)
  } else if (active.expires_at) {
    nextBillingDate.value = formatDateHuman(active.expires_at)
  } else {
    nextBillingDate.value = ''
  }

  if (active.next_delivery_date) {
    nextDeliveryDate.value = formatDateHuman(active.next_delivery_date)
  } else {
    nextDeliveryDate.value = ''
  }

  plannedExchangeDate.value = active.next_exchange_date
    || active.current_set?.return_due_date
    || active.current_set?.exchange_date
    || ''

  const currentSet = active.current_set
  if (currentSet?.status) {
    currentSetStatus.value = currentSet.status
    currentSetStatusLabel.value = setStatusLabels[currentSet.status] || currentSet.status
  } else {
    currentSetStatus.value = ''
    currentSetStatusLabel.value = ''
  }

  currentSetId.value = currentSet?.id ?? null
  deliveryTaskId.value = currentSet?.delivery_task?.id ?? null
  deliveryAddress.value = currentSet?.delivery_task?.address || user.value?.address || ''

  if (currentSet?.toys && Array.isArray(currentSet.toys)) {
    toysInUse.value = currentSet.toys.length
    activeCurrentSetToys.value = currentSet.toys
  } else {
    toysInUse.value = 0
    activeCurrentSetToys.value = []
  }
}

// Load user subscription if exists
const loadUserSubscription = async () => {
  if (!user.value) {
    resetSubscriptionView()
    isLoadingSubscription.value = false
    return
  }

  try {
    const res = await request<any>('/subscriptions')
    const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
    const active = list.find((s: any) => s.status === 'active' || s.status === 'paused')

    if (active) {
      await applyActiveSubscription(active)
    } else {
      resetSubscriptionView()
    }
  } catch (e) {
    console.warn('Could not load user subscription:', e)
    resetSubscriptionView()
  } finally {
    isLoadingSubscription.value = false
  }
}

const initSubscriptionPage = async () => {
  isLoadingSubscription.value = true
  if (!isInitialized.value) {
    await fetchUser()
  }
  await fetchPlans()
  await loadUserSubscription()
}

onMounted(async () => {
  const queryCode = (route.query.code || route.query.gift_code) as string
  if (queryCode) {
    giftActivationCode.value = queryCode.toUpperCase()
    isGiftCodeModalOpen.value = true
  }
  await initSubscriptionPage()
})

watch(user, async (newUser, oldUser) => {
  if (newUser?.id === oldUser?.id) return
  isLoadingSubscription.value = true
  showAllPlans.value = false
  await loadUserSubscription()
})

const freezeEndDateFormatted = computed(() => {
  if (!freezeEndDate.value) return '—'
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

const isSubModalOpen = ref(false)
const isChangingPlan = ref(false)
const selectedPlanName = ref('')
const selectedPlanPrice = ref(0)
const selectedPlanId = ref<number | null>(null)
const checkoutChildName = ref('')
const checkoutChildAgeMonths = ref(12)
const checkoutError = ref('')

interface CheckoutChildOption {
  id: number
  name: string
  age_in_months?: number
  hasActiveSubscription: boolean
}

const checkoutChildren = ref<CheckoutChildOption[]>([])
const selectedCheckoutChildId = ref<number | null>(null)
const checkoutChildMode = ref<'select' | 'create'>('create')
const isLoadingCheckoutChildren = ref(false)
const isActivatingSubscription = ref(false)
const subscriptionActionError = ref('')
const paymentMethod = ref<'kaspi' | 'card'>('kaspi')
const isCancelModalOpen = ref(false)
const isRequestingExchange = ref(false)

const planPrice = (plan: PlanViewItem | undefined) =>
  calcPlanPrice(plan, billingCycle.value, extraToysCount.value)

const planBilledTotal = (plan: PlanViewItem) =>
  calcBilledTotal(plan, billingCycle.value, extraToysCount.value)

const checkoutBilledTotal = computed(() => {
  const plan = displayPlans.value.find(p => p.id === selectedPlanId.value) || displayPlans.value[0]
  return plan ? planBilledTotal(plan) : selectedPlanPrice.value
})

const handleSelectPlan = async (plan: PlanViewItem) => {
  if (!user.value) {
    openAuthModal('login')
    return
  }
  selectedPlanName.value = plan.name
  selectedPlanPrice.value = planPrice(plan)
  selectedPlanId.value = plan.id ?? null
  checkoutError.value = ''
  isChangingPlan.value = hasActiveSubscription.value
  isSubModalOpen.value = true
  if (!isChangingPlan.value) {
    await prepareCheckoutChildren()
  }
  if (hasActiveSubscription.value) {
    showAllPlans.value = true
  }
}

const formatCheckoutChildAge = (child: CheckoutChildOption) => {
  const months = child.age_in_months
  if (!months) return 'Возраст не указан'
  if (months < 12) return `${months} мес`
  const years = Math.floor(months / 12)
  const rest = months % 12
  if (rest === 0) return `${years} ${years === 1 ? 'год' : years < 5 ? 'года' : 'лет'}`
  return `${years} г. ${rest} мес`
}

const prepareCheckoutChildren = async () => {
  if (!user.value) return

  isLoadingCheckoutChildren.value = true
  checkoutError.value = ''

  try {
    const [childrenRes, subsRes] = await Promise.all([
      request<any>('/children'),
      request<any>('/subscriptions'),
    ])

    const children = Array.isArray(childrenRes?.data)
      ? childrenRes.data
      : (Array.isArray(childrenRes) ? childrenRes : [])

    const subscriptions = Array.isArray(subsRes?.data)
      ? subsRes.data
      : (Array.isArray(subsRes) ? subsRes : [])

    const busyChildIds = new Set<number>(
      subscriptions
        .filter((sub: any) => sub.status === 'active' || sub.status === 'paused')
        .map((sub: any) => sub.child?.id ?? sub.child_id)
        .filter(Boolean)
    )

    checkoutChildren.value = children.map((child: any) => ({
      id: child.id,
      name: child.name,
      age_in_months: child.age_in_months,
      hasActiveSubscription: busyChildIds.has(child.id),
    }))

    const eligible = checkoutChildren.value.filter(child => !child.hasActiveSubscription)

    if (eligible.length > 0) {
      checkoutChildMode.value = 'select'
      selectedCheckoutChildId.value = eligible[0].id
      checkoutChildName.value = eligible[0].name
      checkoutChildAgeMonths.value = eligible[0].age_in_months || 12
    } else {
      checkoutChildMode.value = 'create'
      selectedCheckoutChildId.value = null
      checkoutChildName.value = ''
      checkoutChildAgeMonths.value = 12
    }
  } catch (e) {
    checkoutChildMode.value = 'create'
    checkoutChildren.value = []
    selectedCheckoutChildId.value = null
  } finally {
    isLoadingCheckoutChildren.value = false
  }
}

const selectCheckoutChild = (childId: number) => {
  const child = checkoutChildren.value.find(item => item.id === childId)
  if (!child || child.hasActiveSubscription) return

  selectedCheckoutChildId.value = childId
  checkoutChildName.value = child.name
  checkoutChildAgeMonths.value = child.age_in_months || 12
}

const switchToCreateChild = () => {
  checkoutChildMode.value = 'create'
  selectedCheckoutChildId.value = null
  checkoutChildName.value = ''
  checkoutChildAgeMonths.value = 12
}

const switchToSelectChild = () => {
  const eligible = checkoutChildren.value.filter(child => !child.hasActiveSubscription)
  if (eligible.length === 0) return

  checkoutChildMode.value = 'select'
  selectedCheckoutChildId.value = eligible[0].id
  checkoutChildName.value = eligible[0].name
  checkoutChildAgeMonths.value = eligible[0].age_in_months || 12
}

const resolveCheckoutChildId = async (): Promise<number> => {
  if (checkoutChildMode.value === 'select' && selectedCheckoutChildId.value) {
    const selected = checkoutChildren.value.find(child => child.id === selectedCheckoutChildId.value)
    if (!selected) {
      throw new Error('Выберите ребёнка из списка')
    }
    if (selected.hasActiveSubscription) {
      throw new Error('У этого ребёнка уже есть активная подписка')
    }
    return selectedCheckoutChildId.value
  }

  const childrenRes = await request<any>('/children')
  const children = Array.isArray(childrenRes?.data) ? childrenRes.data : (Array.isArray(childrenRes) ? childrenRes : [])

  const childName = checkoutChildName.value.trim()
  if (!childName) {
    throw new Error('Укажите имя ребёнка')
  }

  const ageMonths = Number(checkoutChildAgeMonths.value)
  if (!Number.isFinite(ageMonths) || ageMonths < 1 || ageMonths > 120) {
    throw new Error('Укажите возраст ребёнка от 1 до 120 месяцев')
  }

  const birthDate = new Date()
  birthDate.setMonth(birthDate.getMonth() - ageMonths)
  const birthDateStr = birthDate.toISOString().split('T')[0]

  const matchedChild = children.find((child: any) =>
    child.name?.trim().toLowerCase() === childName.toLowerCase()
  )

  if (matchedChild?.id) {
    return matchedChild.id
  }

  const childRes = await request<any>('/children', {
    method: 'POST',
    body: {
      name: childName,
      birth_date: birthDateStr,
    },
  })

  const childId = childRes?.data?.id ?? childRes?.id
  if (!childId) {
    throw new Error('Не удалось создать профиль ребёнка')
  }

  return childId
}

const activateSubscription = async () => {
  if (!user.value) {
    openAuthModal('login')
    return
  }

  isActivatingSubscription.value = true
  checkoutError.value = ''

  try {
    if (isChangingPlan.value) {
      if (!activeSubId.value || !selectedPlanId.value) {
        throw new Error('Не удалось определить подписку или новый тариф')
      }

      await changePlan(activeSubId.value, selectedPlanId.value)
    } else {
      const childId = await resolveCheckoutChildId()

      const created = await createSubscription({
        child_id: childId,
        subscription_plan_id: selectedPlanId.value ?? undefined,
        billing_cycle: billingCycle.value,
        extra_toys_count: extraToysCount.value,
      })

      const subId = created?.data?.id ?? created?.id
      if (!subId) {
        throw new Error('Не удалось создать подписку')
      }

      await paySubscription(subId, paymentMethod.value)
    }

    isSubModalOpen.value = false
    isChangingPlan.value = false
    showAllPlans.value = false
    isLoadingSubscription.value = true
    await loadUserSubscription()
  } catch (e: any) {
    checkoutError.value = e?.data?.message || e?.message || (isChangingPlan.value
      ? 'Не удалось сменить тариф. Попробуйте ещё раз.'
      : 'Не удалось оформить подписку. Попробуйте ещё раз.')
  } finally {
    isActivatingSubscription.value = false
  }
}

const openCancelModal = () => {
  subscriptionActionError.value = ''
  isCancelModalOpen.value = true
}

const submitCancelSubscription = async () => {
  if (!activeSubId.value) return

  isSubmitting.value = true
  subscriptionActionError.value = ''

  try {
    await cancelSubscription(activeSubId.value)
    isCancelModalOpen.value = false
    isLoadingSubscription.value = true
    await loadUserSubscription()
  } catch (e: any) {
    subscriptionActionError.value = e?.data?.message || e?.message || 'Не удалось отменить подписку'
  } finally {
    isSubmitting.value = false
  }
}

const handleExchangeRequest = async () => {
  if (!activeSubId.value) return
  if (currentSetStatus.value === 'returning') return

  isRequestingExchange.value = true
  subscriptionActionError.value = ''

  try {
    const res = await requestExchange(activeSubId.value)
    currentSetStatus.value = 'returning'
    currentSetStatusLabel.value = setStatusLabels.returning
    alert(res.message || 'Запрос на обмен принят!')
    isLoadingSubscription.value = true
    await loadUserSubscription()
  } catch (e: any) {
    subscriptionActionError.value = e?.data?.message || e?.message || 'Не удалось отправить запрос на обмен'
  } finally {
    isRequestingExchange.value = false
  }
}

// -------------------------------------------------------------
// REQUIREMENT 1: FREEZE OPTIONS MODAL LOGIC
// -------------------------------------------------------------
const isFreezeModalOpen = ref(false)
const freezeOption = ref<'1' | '7' | '14' | '30' | 'custom'>('14')
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

const isRescheduleModalOpen = ref(false)
const rescheduleDate = ref('')
const rescheduleError = ref('')
const minRescheduleDate = ref(new Date(Date.now() + 86400000).toISOString().split('T')[0])

const plannedExchangeDateFormatted = computed(() => {
  if (!plannedExchangeDate.value) return ''
  return formatDateHuman(plannedExchangeDate.value)
})

const openRescheduleModal = () => {
  rescheduleError.value = ''
  rescheduleDate.value = plannedExchangeDate.value
    ? new Date(plannedExchangeDate.value).toISOString().split('T')[0]
    : minRescheduleDate.value
  isRescheduleModalOpen.value = true
}

const submitRescheduleExchange = async () => {
  if (!activeSubId.value || !rescheduleDate.value) return
  isSubmitting.value = true
  rescheduleError.value = ''
  try {
    await rescheduleExchange(activeSubId.value, rescheduleDate.value)
    isRescheduleModalOpen.value = false
    isLoadingSubscription.value = true
    await loadUserSubscription()
  } catch (e: any) {
    rescheduleError.value = e?.data?.message || e?.message || 'Не удалось перенести обмен'
  } finally {
    isSubmitting.value = false
  }
}

const submitFreezeSubscription = async () => {
  isSubmitting.value = true
  freezeError.value = ''

  const endDateStr = computedFreezeEndDateObj.value.toISOString().split('T')[0]

  try {
    if (!activeSubId.value) {
      throw new Error('Активная подписка не найдена')
    }

    await request(`/subscriptions/${activeSubId.value}/pause`, {
      method: 'POST',
      body: {
        freeze_end: endDateStr,
        reason: freezeReason.value,
      },
    })

    isFreezeModalOpen.value = false
    subscriptionActionError.value = ''
    isLoadingSubscription.value = true
    await loadUserSubscription()
  } catch (e: any) {
    freezeError.value = e?.data?.message || e?.message || 'Не удалось заморозить подписку. Попробуйте ещё раз.'
  } finally {
    isSubmitting.value = false
  }
}

const resumeSubscription = async () => {
  isSubmitting.value = true
  subscriptionActionError.value = ''

  try {
    if (!activeSubId.value) {
      throw new Error('Активная подписка не найдена')
    }

    await request(`/subscriptions/${activeSubId.value}/resume`, { method: 'POST' })
    isLoadingSubscription.value = true
    await loadUserSubscription()
  } catch (e: any) {
    subscriptionActionError.value = e?.data?.message || e?.message || 'Не удалось возобновить подписку. Попробуйте ещё раз.'
  } finally {
    isSubmitting.value = false
  }
}

// -------------------------------------------------------------
// PLAN TOYS PREVIEW (from admin-selected catalog toys)
// -------------------------------------------------------------
const isPreviewModalOpen = ref(false)
const selectedPreviewPlan = ref<PlanViewItem | null>(null)
const previewMode = ref<'plan' | 'set'>('plan')

interface PreviewToy {
  id: number
  name: string
  age: string
  skill: string
  benefit: string
  desc: string
  image: string
  isBoughtOut?: boolean
  buyoutPrice?: number | null
}

const formatToyAgeRange = (minMonths?: number, maxMonths?: number) => {
  const min = minMonths ?? 0
  const max = maxMonths ?? 72
  const minYears = Math.floor(min / 12)
  const maxYears = Math.ceil(max / 12)

  if (minYears === 0 && maxYears <= 1) return `${min}–${max} мес`
  if (minYears === maxYears) return `${minYears} ${minYears === 1 ? 'год' : 'года'}`
  return `${minYears}–${maxYears} ${maxYears < 5 ? 'года' : 'лет'}`
}

const mapToyToPreview = (toy: any): PreviewToy => {
  const categoryLabel = toy.category?.name
    ? `${toy.category.icon ? `${toy.category.icon} ` : ''}${toy.category.name}`.trim()
    : 'Развивающая игрушка'

  const description = toy.description || 'Развивающая эко-игрушка из каталога Alpha.'
  const benefit = description.split(/[.!?]/).map((part: string) => part.trim()).find(Boolean) || description

  return {
    id: toy.id,
    name: toy.name,
    age: formatToyAgeRange(toy.min_age_months, toy.max_age_months),
    skill: categoryLabel,
    benefit,
    desc: description,
    image: toy.image_url || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80',
  }
}

const getPlanToys = (plan: PlanViewItem | null | undefined): PreviewToy[] => {
  if (!plan || !Array.isArray(plan.toys) || plan.toys.length === 0) {
    return []
  }

  return plan.toys.map(mapToyToPreview)
}

const currentPlanExactToys = computed(() => {
  return getPlanToys(selectedPreviewPlan.value)
})

const currentSetPreviewToys = computed((): PreviewToy[] => {
  return activeCurrentSetToys.value.map((toy: any) => ({
    ...mapToyToPreview(toy),
    isBoughtOut: !!toy.pivot?.is_bought_out,
    buyoutPrice: toy.pivot?.buyout_price ?? null,
  }))
})

const previewToys = computed(() => {
  return previewMode.value === 'set' ? currentSetPreviewToys.value : currentPlanExactToys.value
})

const canBuyoutToy = (toy: PreviewToy) => {
  if (toy.isBoughtOut) return false
  return ['in_use', 'delivering', 'assembling'].includes(currentSetStatus.value)
}

const openPreviewToysModal = (plan: PlanViewItem) => {
  previewMode.value = 'plan'
  selectedPreviewPlan.value = plan
  isPreviewModalOpen.value = true
}

const openCurrentSetToysModal = () => {
  previewMode.value = 'set'
  selectedPreviewPlan.value = null
  isPreviewModalOpen.value = true
}

const handleBuyoutToy = async (toy: PreviewToy) => {
  if (!currentSetId.value || !canBuyoutToy(toy)) return

  buyoutLoadingToyId.value = toy.id
  try {
    const preview = await calculateBuyout(currentSetId.value, toy.id)
    const priceLabel = formatPrice(preview.buyout_price)
    const confirmed = confirm(`Выкупить «${preview.toy_name}» за ${priceLabel} ₸ со скидкой ${preview.discount_percent}%?`)
    if (!confirmed) return

    const res = await executeBuyout(currentSetId.value, toy.id)
    alert(res.message || `Игрушка «${preview.toy_name}» успешно выкуплена!`)

    const toyRef = activeCurrentSetToys.value.find((t: any) => t.id === toy.id)
    if (toyRef?.pivot) {
      toyRef.pivot.is_bought_out = true
      toyRef.pivot.buyout_price = preview.buyout_price
    }
  } catch (e: any) {
    alert(e?.data?.message || e?.message || 'Не удалось оформить выкуп игрушки')
  } finally {
    buyoutLoadingToyId.value = null
  }
}

const handleSelectPlanFromPreview = () => {
  if (!selectedPreviewPlan.value) return
  isPreviewModalOpen.value = false
  handleSelectPlan(selectedPreviewPlan.value)
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

<style src="~/assets/css/subscription-page.css"></style>
