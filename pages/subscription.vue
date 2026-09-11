<template>
  <div class="subscription-page">
    <TheHeader />

    <main class="container page-content">
      <!-- IF USER HAS ACTIVE OR PAUSED SUBSCRIPTION: Dashboard View -->
      <SubscriptionActiveDashboard
        v-if="user && hasActiveSubscription && !showAllPlans"
        :is-paused="isSubscriptionPaused"
        :pending-action="pendingAction"
        :pending-pickup="pendingPickup"
        :child-name="subscriptionChildName"
        :child-age="subscriptionChildAge"
        :plan="currentPlan"
        :next-billing-date="nextBillingDate"
        :freeze-end-formatted="freezeEndDateFormatted"
        :toys-in-use="toysInUse"
        :toys-limit="toysLimit"
        :next-delivery-date="nextDeliveryDate"
        :planned-exchange-date="plannedExchangeDateFormatted"
        :current-box-name="currentBoxName"
        :current-set-toys="activeCurrentSetToys"
        :set-status-label="currentSetStatusLabel"
        :set-status="currentSetStatus"
        :delivery-task-id="deliveryTaskId"
        :current-set-id="currentSetId"
        :delivery-address="deliveryAddress"
        :delivery-track-link="deliveryTrackLink"
        :action-error="subscriptionActionError"
        :is-submitting="isSubmitting"
        :is-requesting-exchange="isRequestingExchange"
        :exchange-quota="exchangeQuota"
        :show-next-set="showNextSetSection"
        :next-set-title="nextSetTitle"
        :next-set-toys-count="nextSetToys.length"
        :next-set-box-name="nextSetBoxName"
        :next-set-toys="nextSetToys"
        @open-gift="isGiftCodeModalOpen = true"
        @show-plans="showAllPlans = true"
        @freeze="openFreezeModal"
        @cancel="openCancelModal"
        @resume="resumeSubscription"
        @view-toys="openCurrentSetToysModal"
        @exchange="handleExchangeRequest"
        @reschedule="openRescheduleModal"
      />

      <!-- PUBLIC / SHOWCASE PRICING VIEW — only when we know user has no active sub (or is guest) -->
      <SubscriptionPricingShowcase
        v-else-if="showPricingShowcase"
        v-model:billing-cycle="billingCycle"
        v-model:extra-toys-count="extraToysCount"
        :plans="displayPlans"
        :is-loading="isLoadingPlans && displayPlans.length === 0"
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
            
            <div class="modal-icon-badge"><AppIcon name="snowflake" :size="32" /></div>
            <h2 class="sub-modal-title">Заморозка подписки</h2>
            <p class="sub-modal-desc">
              На время заморозки списания и доставка нового набора приостанавливаются, а оплаченные дни сохраняются. Текущие игрушки остаются у вас!
            </p>

            <!-- Duration Options -->
            <div class="freeze-options-group">
              <label class="freeze-group-title">Срок заморозки:</label>
              
              <div class="freeze-presets-grid">
                <div
                  v-if="maxFreezeDays >= 1"
                  class="freeze-preset-card"
                  :class="{ active: freezeOption === '1' }"
                  @click="selectFreezePreset(1)"
                >
                  <strong>1 день</strong>
                  <span>Минимум</span>
                </div>
                <div
                  v-if="maxFreezeDays >= 7"
                  class="freeze-preset-card"
                  :class="{ active: freezeOption === '7' }"
                  @click="selectFreezePreset(7)"
                >
                  <strong>7 дней</strong>
                  <span>1 неделя</span>
                </div>
              </div>
              <p class="freeze-limit-hint">Максимум для вашего тарифа: {{ maxFreezeDays }} дн.</p>
            </div>

            <!-- Freeze Reason Options -->
            <div class="freeze-reason-box">
              <label class="freeze-group-title">Причина (поможет нам стать лучше):</label>
              <select v-model="freezeReason" class="freeze-select">
                <option value="vacation">Отпуск / семейная поездка</option>
                <option value="sick">Ребёнок приболел</option>
                <option value="too_many_toys">Не успели наиграться с текущим набором</option>
                <option value="budget">Временная экономия бюджета</option>
                <option value="other">Другая причина</option>
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
            <div class="modal-icon-badge"><AppIcon name="calendar" :size="32" /></div>
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

    <!-- MODAL 2: Exact Toys in Selected Plan / Current Set -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isPreviewModalOpen" class="modal-overlay" @click.self="isPreviewModalOpen = false">
          <div class="sub-modal-card preview-toys-modal-card">
            <button class="close-btn" @click="isPreviewModalOpen = false">&times;</button>
            
            <div class="modal-header-compact">
              <span v-if="previewMode === 'plan'" class="preview-plan-badge">Тариф {{ selectedPreviewPlan?.name }}</span>
              <span v-else class="preview-plan-badge">Ваш набор</span>
              <h2 class="sub-modal-title">
                <template v-if="previewMode === 'plan'">
                  Боксы тарифа «{{ selectedPreviewPlan?.name }}»
                </template>
                <template v-else>
                  <template v-if="currentBoxName">Готовый комплект: {{ currentBoxName }}</template>
                  <template v-else>Игрушки в вашем текущем наборе</template>
                </template>
              </h2>
              <p class="sub-modal-desc">
                <template v-if="previewMode === 'plan'">
                  В тариф входят готовые боксы. Ниже — состав каждого бокса:
                </template>
                <template v-else>
                  Состав вашего текущего готового комплекта:
                </template>
              </p>
            </div>

            <!-- Plan: boxes with nested toys -->
            <template v-if="previewMode === 'plan'">
              <div v-if="previewPlanBoxes.length === 0 && previewToys.length === 0" class="preview-toys-empty">
                <p>Боксы для этого тарифа ещё не настроены в админ-панели.</p>
              </div>
              <div v-else-if="previewPlanBoxes.length" class="preview-boxes-list">
                <div
                  v-for="box in previewPlanBoxes"
                  :key="box.id"
                  class="preview-box-block"
                  :class="{ focused: focusedPreviewBoxId === box.id }"
                >
                  <div class="preview-box-head">
                    <h3>{{ box.name }}</h3>
                    <span>{{ (box.toys?.length || box.toys_count || 0) }} игрушек</span>
                  </div>
                  <p v-if="box.description" class="preview-box-desc">{{ box.description }}</p>
                  <div v-if="!(box.toys?.length)" class="preview-toys-empty compact">
                    <p>В этом боксе пока нет игрушек.</p>
                  </div>
                  <div v-else class="preview-toys-scroll-grid">
                    <div
                      v-for="(toy, tIdx) in box.toys"
                      :key="toy.id || tIdx"
                      class="preview-toy-item-card"
                    >
                      <div class="preview-toy-img-box">
                        <img :src="toy.image_url || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80'" :alt="toy.name" loading="lazy" />
                        <span class="toy-item-number">№{{ tIdx + 1 }}</span>
                        <span class="toy-skill-badge">{{ toy.category?.name || 'Игрушка' }}</span>
                      </div>
                      <div class="preview-toy-content">
                        <div class="toy-title-row">
                          <h4>{{ toy.name }}</h4>
                          <span class="toy-age-tag">{{ formatToyAgeRange(toy.min_age_months, toy.max_age_months) }}</span>
                        </div>
                        <p class="toy-descr">{{ toy.description || 'Развивающая эко-игрушка из каталога Alpha.' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
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
                  </div>
                </div>
              </div>
            </template>

            <!-- Current set toys -->
            <template v-else>
              <div v-if="previewToys.length === 0" class="preview-toys-empty">
                <p>Набор ещё комплектуется методистом. Игрушки появятся здесь после сборки.</p>
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
                      <span><AppIcon name="sparkles" :size="14" class="inline-icon" /> {{ toy.benefit }}</span>
                    </div>
                    <button
                      v-if="canBuyoutToy(toy)"
                      type="button"
                      class="buyout-toy-btn"
                      :disabled="buyoutLoadingToyId === toy.id"
                      @click="handleBuyoutToy(toy)"
                    >
                      {{ buyoutLoadingToyId === toy.id ? 'Оформляем...' : 'Выкупить со скидкой подписчика' }}
                    </button>
                    <span v-else-if="toy.isBoughtOut" class="buyout-done-tag">✓ Выкуплена</span>
                  </div>
                </div>
              </div>
            </template>

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
            <h2 class="sub-modal-title">{{ isChangingPlan ? 'Смена тарифного плана' : 'Оформление подписки' }}</h2>
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
              <div class="epay-method-card">
                <div class="epay-method-icon"><AppIcon name="credit-card" :size="22" /></div>
                <div class="epay-method-text">
                  <strong>Банковская карта · Halyk ePay</strong>
                  <span>Visa, Mastercard и другие способы на защищённой странице банка</span>
                </div>
              </div>
              <p class="epay-hint">Оплата проходит на защищённой странице Halyk Bank. Карточные данные на сайте Alpha не вводятся.</p>
            </div>
            <div v-else class="payment-methods-box">
              <p class="epay-hint">Смена тарифа выполняется без дополнительной оплаты на этом шаге.</p>
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
              <span class="gift-icon-badge"><AppIcon name="gift" :size="28" /></span>
              <h2 class="sub-modal-title">Активация подарочной подписки</h2>
              <p class="sub-modal-desc">
                Введите код GSUB и выберите ребёнка — подписка активируется без оплаты.
              </p>
            </div>

            <div class="gift-activate-form">
              <div class="g-field">
                <label>Код подарочной подписки <span class="req">*</span></label>
                <input 
                  v-model="giftActivationCode" 
                  type="text" 
                  placeholder="Например: GSUB-A8K3-72P9" 
                  class="gift-code-input"
                  style="text-transform: uppercase;"
                />
              </div>

              <div class="g-field">
                <label>Ребёнок <span class="req">*</span></label>
                <select
                  v-if="giftChildren.length"
                  v-model="giftSelectedChildId"
                  class="gift-code-input"
                >
                  <option :value="null" disabled>Выберите ребёнка</option>
                  <option v-for="child in giftChildren" :key="child.id" :value="child.id">
                    {{ child.name }}
                  </option>
                </select>
                <p v-else class="sub-modal-desc" style="margin: 0.5rem 0 0;">
                  Сначала добавьте ребёнка в
                  <NuxtLink to="/profile">профиле</NuxtLink>.
                </p>
              </div>

              <div v-if="giftActivationError" class="error-banner">
                {{ giftActivationError }}
              </div>

              <div v-if="giftActivationSuccess" class="success-banner">
                {{ giftActivationSuccess }}
              </div>

              <button 
                class="confirm-sub-btn" 
                :disabled="isActivatingGift || !giftChildren.length"
                @click="submitGiftActivation"
              >
                {{ isActivatingGift ? 'Проверка и активация...' : 'Активировать подписку бесплатно (0 ₸)' }}
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
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import TheHeader from '~/components/TheHeader.vue'
import TheFooter from '~/components/TheFooter.vue'
import SubscriptionActiveDashboard from '~/components/subscription/SubscriptionActiveDashboard.vue'
import SubscriptionPricingShowcase from '~/components/subscription/SubscriptionPricingShowcase.vue'
import type { PlanViewItem } from '~/composables/useSubscriptionPricing'

const route = useRoute()
const config = useRuntimeConfig()
usePageSeo('/subscription')
const tokenCookie = useCookie<string | null>('alpha_auth_token')
const { user, openAuthModal, fetchUser, isInitialized } = useAuth()
const { success: toastSuccess, error: toastError } = useToast()
const { request, getToken } = useApi()
const { calculateBuyout, executeBuyout } = useBuyout()
const { handlePayResponse } = usePaymentLaunch()
const {
  createSubscription,
  paySubscription,
  changePlan,
  cancelSubscription,
  requestExchange,
  rescheduleExchange,
} = useSubscriptions()
const { plans: apiPlans, fetchPlans, isLoading: isLoadingPlans, hydratePlans, hasFreshPlans } = useSubscriptionPlans()
const { formatPrice, mapPlanToView, calcPlanPrice, calcBilledTotal } = useSubscriptionPricing()

useAsyncData('subscription-plans-ssr', async () => {
  if (hasFreshPlans()) return true

  try {
    const res = await $fetch<{ data: import('~/composables/useSubscriptionPlans').SubscriptionPlanItem[] }>(
      `${config.public.apiBase}/subscription-plans`
    )
    if (Array.isArray(res?.data) && res.data.length > 0) {
      hydratePlans(res.data)
    }
  } catch {
    // Defaults from useState are shown instantly.
  }

  return true
}, { lazy: true, server: false })

// Gift Activation Modal State (GSUB prepaid subscription only)
const isGiftCodeModalOpen = ref(false)
const giftActivationCode = ref('')
const giftChildren = ref<Array<{ id: number; name: string }>>([])
const giftSelectedChildId = ref<number | null>(null)
const isActivatingGift = ref(false)
const giftActivationError = ref('')
const giftActivationSuccess = ref('')

const loadGiftChildren = async () => {
  if (!user.value) {
    giftChildren.value = []
    giftSelectedChildId.value = null
    return
  }
  try {
    const childrenRes = await request<any>('/children')
    const children = Array.isArray(childrenRes?.data) ? childrenRes.data : (Array.isArray(childrenRes) ? childrenRes : [])
    giftChildren.value = children
    if (!giftSelectedChildId.value && children.length === 1) {
      giftSelectedChildId.value = children[0].id
    }
  } catch {
    giftChildren.value = []
  }
}

watch(isGiftCodeModalOpen, async (open) => {
  if (open) {
    if (!user.value) {
      openAuthModal('login')
      isGiftCodeModalOpen.value = false
      return
    }
    await loadGiftChildren()
  }
})

const submitGiftActivation = async () => {
  const code = giftActivationCode.value.trim().toUpperCase()
  if (!code) {
    giftActivationError.value = 'Пожалуйста, введите код GSUB!'
    return
  }
  if (!user.value) {
    openAuthModal('login')
    return
  }
  if (!code.startsWith('GSUB-')) {
    giftActivationError.value = 'Сейчас активируются только коды подарочной подписки (GSUB-…). Денежные сертификаты — отдельный сценарий.'
    return
  }
  if (!giftSelectedChildId.value) {
    giftActivationError.value = 'Выберите ребёнка из списка. Если детей нет — добавьте в профиле.'
    return
  }

  const phone = user.value.phone?.trim()
  if (!phone) {
    giftActivationError.value = 'Добавьте номер телефона в профиле — он нужен для доставки набора.'
    return
  }

  isActivatingGift.value = true
  giftActivationError.value = ''
  giftActivationSuccess.value = ''

  try {
    const child = giftChildren.value.find((c) => c.id === giftSelectedChildId.value)

    await request<any>('/gift-subscriptions/activate', {
      method: 'POST',
      body: JSON.stringify({
        code,
        child_id: giftSelectedChildId.value,
      }),
    })

    giftActivationSuccess.value = `Подарочная подписка ${code} успешно активирована для малыша ${child?.name || ''}! Первый набор будет сформирован методистом и отправлен курьером.`

    isCheckingSubscription.value = true
    await loadUserSubscription()
    showAllPlans.value = false
    setTimeout(() => {
      isGiftCodeModalOpen.value = false
    }, 2500)
  } catch (e: any) {
    giftActivationError.value = e?.data?.message || e?.message || 'Код не найден, уже использован или истёк.'
  } finally {
    isActivatingGift.value = false
  }
}

const displayPlans = computed<PlanViewItem[]>(() => (
  apiPlans.value.map((p, index) => mapPlanToView(p, index))
))

// Active Subscription state
// Cookie so SSR + first paint know not to flash tariffs for subscribers
const subActiveCookie = useCookie<'1' | '0' | null>('alpha_has_active_subscription', {
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 30,
})

const writeSubActiveCache = (active: boolean) => {
  subActiveCookie.value = active ? '1' : '0'
}

const clearSubActiveCache = () => {
  subActiveCookie.value = null
}

// Persist across SPA navigations + cookie hydrate to avoid tariff→dashboard flash
const hasActiveSubscription = useState(
  'subscription_has_active',
  () => subActiveCookie.value === '1',
)
const subscriptionResolved = useState(
  'subscription_resolved',
  () => subActiveCookie.value === '1' || subActiveCookie.value === '0',
)
const activeSubId = ref<number | null>(null)
const isSubscriptionPaused = ref(false)
const pendingAction = ref<string | null>(null)
const pendingPickup = ref(false)
const freezeEndDate = ref<string | null>(null)
const maxFreezeDays = ref(7)
const showAllPlans = ref(false)
const extraToysCount = ref<number>(0)
const billingCycle = ref<'monthly' | 'quarterly' | 'semiannual' | 'annual'>('monthly')
const activeMobileSubPlan = ref(1)
const isCheckingSubscription = ref(false)

/** Show tariffs only for guests, or after we know there is no active subscription */
const showPricingShowcase = computed(() => {
  if (showAllPlans.value) return true
  if (hasActiveSubscription.value) return false
  const hasToken = !!tokenCookie.value || (import.meta.client && !!getToken())
  if (!hasToken && !user.value) return true
  // Logged-in / has token: wait until subscription status is resolved
  return subscriptionResolved.value
})

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
const exchangeQuota = ref<import('~/composables/useSubscriptions').ExchangeQuota | null>(null)
const nextSetId = ref<number | null>(null)
const nextSetStatus = ref('')
const nextSetToys = ref<any[]>([])
const nextSetTitle = ref('Следующий комплект')
const nextSetBoxName = ref<string | null>(null)
const currentBoxName = ref<string | null>(null)
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

const showNextSetSection = computed(() => {
  return !!hasActiveSubscription.value && !isSubscriptionPaused.value && ['in_use', 'delivering', 'returning', 'assembling'].includes(currentSetStatus.value)
})

const setStatusLabels: Record<string, string> = {
  assembling: 'Комплектуется на складе',
  delivering: 'Передан курьеру',
  in_use: 'У вас дома',
  returning: 'Ожидает возврата',
  returned: 'Возвращён на склад',
  cancelled: 'Отменён',
}

const resetSubscriptionView = (opts?: { confirmed?: boolean }) => {
  hasActiveSubscription.value = false
  if (opts?.confirmed) {
    writeSubActiveCache(false)
    subscriptionResolved.value = true
  }
  activeSubId.value = null
  isSubscriptionPaused.value = false
  pendingAction.value = null
  pendingPickup.value = false
  freezeEndDate.value = null
  maxFreezeDays.value = 7
  showAllPlans.value = false
  nextBillingDate.value = ''
  nextDeliveryDate.value = ''
  plannedExchangeDate.value = ''
  exchangeQuota.value = null
  nextSetId.value = null
  nextSetStatus.value = ''
  nextSetToys.value = []
  nextSetTitle.value = 'Следующий комплект'
  nextSetBoxName.value = null
  currentBoxName.value = null
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
  writeSubActiveCache(true)
  subscriptionResolved.value = true
  activeSubId.value = active.id
  isSubscriptionPaused.value = active.status === 'paused'
  pendingAction.value = active.pending_action || null
  pendingPickup.value = !!active.pending_pickup || ['pause', 'cancel'].includes(active.pending_action)
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
    maxFreezeDays.value = Math.max(1, Number(active.plan.max_freeze_days) || 7)
  } else if (active.subscription_plan_id) {
    if (!displayPlans.value.some(p => p.id === active.subscription_plan_id)) {
      await fetchPlans()
    }
    const matched = displayPlans.value.find(p => p.id === active.subscription_plan_id)
    if (matched) {
      currentPlan.value.name = matched.name
      currentPlan.value.price = `${formatPrice(matched.price_monthly)} ₸`
      currentPlan.value.features = matched.features
      currentPlan.value.isGift = !!active.is_gift
      toysLimit.value = matched.toys_count || 3
      maxFreezeDays.value = Math.max(1, Number(matched.max_freeze_days) || 7)
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
      maxFreezeDays.value = 7
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
    maxFreezeDays.value = 7
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

  exchangeQuota.value = active.exchange_quota || null

  const nextSet = active.next_set
  if (nextSet?.id) {
    nextSetId.value = nextSet.id
    nextSetStatus.value = nextSet.status || 'assembling'
    nextSetToys.value = Array.isArray(nextSet.toys) ? nextSet.toys : []
    nextSetBoxName.value = nextSet.box_template?.name || null
    nextSetTitle.value = nextSet.box_template?.name
      || nextSet.title
      || nextSet.set_number
      || 'Следующий комплект'
  } else {
    nextSetId.value = null
    nextSetStatus.value = ''
    nextSetToys.value = []
    nextSetBoxName.value = null
    nextSetTitle.value = 'Следующий комплект'
  }

  const currentSet = active.current_set
  if (currentSet?.status) {
    currentSetStatus.value = currentSet.status
    currentSetStatusLabel.value = setStatusLabels[currentSet.status] || currentSet.status
  } else {
    currentSetStatus.value = ''
    currentSetStatusLabel.value = ''
  }

  currentSetId.value = currentSet?.id ?? null
  currentBoxName.value = currentSet?.box_template?.name || null
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
    resetSubscriptionView({ confirmed: true })
    clearSubActiveCache()
    subscriptionResolved.value = true
    isCheckingSubscription.value = false
    return
  }

  try {
    const res = await request<any>('/subscriptions')
    const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
    const active = list.find((s: any) => s.status === 'active' || s.status === 'paused')

    if (active) {
      await applyActiveSubscription(active)
    } else {
      resetSubscriptionView({ confirmed: true })
    }
  } catch (e) {
    console.warn('Could not load user subscription:', e)
    // Keep optimistic cache on network errors — avoid flashing tariffs for subscribers
    subscriptionResolved.value = true
  } finally {
    isCheckingSubscription.value = false
  }
}

const initSubscriptionPage = () => {
  // Prefer cached plans for instant paint; refresh in background.
  void fetchPlans({ force: !hasFreshPlans() })

  // Hydrate from cookie before fetch so subscribers never see tariffs first
  if (subActiveCookie.value === '1') {
    hasActiveSubscription.value = true
    subscriptionResolved.value = true
  } else if (subActiveCookie.value === '0') {
    hasActiveSubscription.value = false
    subscriptionResolved.value = true
  }

  const hasToken = !!tokenCookie.value || !!getToken()
  if (!hasToken) {
    subscriptionResolved.value = true
    return
  }

  // Check subscription in background — do not blank the page for known guests/subscribers.
  void (async () => {
    if (!isInitialized.value || !user.value) {
      await fetchUser()
    }
    if (user.value) {
      await loadUserSubscription()
    } else {
      resetSubscriptionView({ confirmed: true })
      clearSubActiveCache()
    }
  })()
}

const { fetchFaqs } = useFaq()
const { data: faqsData } = await useAsyncData(
  'faqs',
  () => fetchFaqs(),
  { default: () => [] },
)

const faqs = computed(() => {
  const items = faqsData.value ?? []
  const preferredCategories = new Set([
    'subscription',
    'delivery',
    'rental',
    'purchase',
    'payment',
    'general',
  ])
  const preferred = items.filter(item => preferredCategories.has(item.category))
  return (preferred.length ? preferred : items).slice(0, 5)
})

onMounted(() => {
  const queryCode = (route.query.code || route.query.gift_code) as string
  if (queryCode) {
    giftActivationCode.value = queryCode.toUpperCase()
    isGiftCodeModalOpen.value = true
  }
  initSubscriptionPage()
})

watch(user, (newUser, oldUser) => {
  if (newUser?.id === oldUser?.id) return
  if (!newUser) {
    resetSubscriptionView({ confirmed: true })
    clearSubActiveCache()
    return
  }
  showAllPlans.value = false
  // Unknown until this fetch finishes — don't flash tariffs if cookie says active
  if (subActiveCookie.value !== '1') {
    subscriptionResolved.value = false
  }
  void loadUserSubscription()
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

      const payRes = await paySubscription(subId, 'card')
      const outcome = await handlePayResponse(payRes, {
        onRedirect: async () => {
          isSubModalOpen.value = false
        },
        onFulfilled: async () => {
          isSubModalOpen.value = false
          isChangingPlan.value = false
          showAllPlans.value = false
          isCheckingSubscription.value = true
          await loadUserSubscription()
        },
      })
      if (outcome !== 'fulfilled') {
        return
      }
      return
    }

    isSubModalOpen.value = false
    isChangingPlan.value = false
    showAllPlans.value = false
    isCheckingSubscription.value = true
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
    isCheckingSubscription.value = true
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
    const quota = exchangeQuota.value
    if (quota && !quota.can_request && !quota.can_purchase_extra) {
      subscriptionActionError.value = 'Лимит обменов исчерпан для текущего периода.'
      return
    }

    if (quota?.can_purchase_extra && !quota.can_request) {
      const payRes = await requestExchange(activeSubId.value, {
        purchase_extra: true,
        payment_method: 'card',
      })

      await handlePayResponse(payRes, {
        onFulfilled: async () => {
          currentSetStatus.value = 'returning'
          currentSetStatusLabel.value = setStatusLabels.returning
          toastSuccess('Оплачено', payRes.message || 'Дополнительный обмен запрошен!')
          isCheckingSubscription.value = true
          await loadUserSubscription()
        },
        onRedirect: async () => {
          toastSuccess('Оплата', 'Сейчас откроется страница оплаты дополнительного обмена.')
        },
      })
      return
    }

    const res = await requestExchange(activeSubId.value)
    currentSetStatus.value = 'returning'
    currentSetStatusLabel.value = setStatusLabels.returning
    toastSuccess('Запрос принят', res.message || 'Запрос на обмен принят!')
    isCheckingSubscription.value = true
    await loadUserSubscription()
  } catch (e: any) {
    const msg = e?.data?.message || e?.message || 'Не удалось отправить запрос на обмен'
    subscriptionActionError.value = msg
  } finally {
    isRequestingExchange.value = false
  }
}

// -------------------------------------------------------------
// REQUIREMENT 1: FREEZE OPTIONS MODAL LOGIC
// -------------------------------------------------------------
const isFreezeModalOpen = ref(false)
const freezeOption = ref<'1' | '7'>('7')
const freezeReason = ref('vacation')
const freezeError = ref('')

const defaultFreezeDays = computed((): 1 | 7 => (
  maxFreezeDays.value >= 7 ? 7 : 1
))

const addLocalDaysYmd = (days: number) => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + days)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const openFreezeModal = () => {
  const days = defaultFreezeDays.value
  freezeOption.value = String(days) as '1' | '7'
  freezeReason.value = 'vacation'
  freezeError.value = ''
  isFreezeModalOpen.value = true
}

const selectFreezePreset = (days: 1 | 7) => {
  if (days > maxFreezeDays.value) return
  freezeOption.value = String(days) as '1' | '7'
}

const computedFreezeDays = computed(() => {
  const days = Number(freezeOption.value) || defaultFreezeDays.value
  return Math.min(Math.max(1, days), maxFreezeDays.value)
})

const computedFreezeEndYmd = computed(() => addLocalDaysYmd(computedFreezeDays.value))

const computedFreezeEndFormatted = computed(() => {
  return formatDateHuman(computedFreezeEndYmd.value)
})

const computedShiftedBillingDate = computed(() => {
  return formatDateHuman(addLocalDaysYmd(30 + computedFreezeDays.value))
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
    isCheckingSubscription.value = true
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

  const endDateStr = computedFreezeEndYmd.value

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
    isCheckingSubscription.value = true
    await loadUserSubscription()
  } catch (e: any) {
    const validationMsg = e?.data?.errors?.freeze_end?.[0]
    freezeError.value = validationMsg || e?.data?.message || e?.message || 'Не удалось заморозить подписку. Попробуйте ещё раз.'
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
    isCheckingSubscription.value = true
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
const focusedPreviewBoxId = ref<number | null>(null)

const previewPlanBoxes = computed(() => {
  const boxes = selectedPreviewPlan.value?.box_templates
  return Array.isArray(boxes) ? boxes : []
})

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

const openPreviewToysModal = async (plan: PlanViewItem, boxId?: number) => {
  previewMode.value = 'plan'
  selectedPreviewPlan.value = plan
  focusedPreviewBoxId.value = boxId ?? null
  isPreviewModalOpen.value = true

  const hasBoxes = Array.isArray(plan.box_templates) && plan.box_templates.length > 0
  const hasToys = Array.isArray(plan.toys) && plan.toys.length > 0
  if (!hasBoxes && !hasToys) {
    await fetchPlans({ force: true })
    const refreshed = displayPlans.value.find(p => p.id === plan.id)
    if (refreshed) {
      selectedPreviewPlan.value = refreshed
    }
  }

  if (boxId) {
    await nextTick()
    const el = document.querySelector(`.preview-box-block.focused`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const openCurrentSetToysModal = () => {
  previewMode.value = 'set'
  selectedPreviewPlan.value = null
  focusedPreviewBoxId.value = null
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
    await handlePayResponse(res, {
      onFulfilled: async (payRes) => {
        toastSuccess('Выкуп оформлен', payRes.message || `Игрушка «${preview.toy_name}» успешно выкуплена!`)
        const toyRef = activeCurrentSetToys.value.find((t: any) => t.id === toy.id)
        if (toyRef?.pivot) {
          toyRef.pivot.is_bought_out = true
          toyRef.pivot.buyout_price = preview.buyout_price
        }
      },
    })
  } catch (e: any) {
    toastError('Не удалось выкупить', e?.data?.message || e?.message || 'Не удалось оформить выкуп игрушки')
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
</script>

<style src="~/assets/css/subscription-page.css"></style>
