<template>
  <div class="checkout-page">
    <TheHeader />

    <main class="container page-content">
      <!-- 3-Step Header Stepper -->
      <section class="stepper-header">
        <div class="stepper-track">
          <!-- Step 1: Доставка -->
          <div 
            class="stepper-item" 
            :class="{ active: currentStep === 1, completed: currentStep > 1 }"
            @click="currentStep > 1 && (currentStep = 1)"
          >
            <div class="step-num">1</div>
            <span class="step-title">Доставка</span>
          </div>

          <div class="step-divider" :class="{ filled: currentStep > 1 }"></div>

          <!-- Step 2: Оплата -->
          <div 
            class="stepper-item" 
            :class="{ active: currentStep === 2, completed: currentStep > 2 }"
            @click="currentStep > 2 && (currentStep = 2)"
          >
            <div class="step-num">2</div>
            <span class="step-title">Оплата</span>
          </div>

          <div class="step-divider" :class="{ filled: currentStep > 2 }"></div>

          <!-- Step 3: Подтверждение -->
          <div class="stepper-item" :class="{ active: currentStep === 3 }">
            <div class="step-num">3</div>
            <span class="step-title">Подтверждение</span>
          </div>
        </div>
      </section>

      <!-- Stock / checkout problems -->
      <section
        v-if="checkoutProblem"
        ref="problemPanelRef"
        class="checkout-problem-panel"
        :class="{ 'checkout-problem-panel--resolved': checkoutProblem.resolved }"
      >
        <div class="checkout-problem-panel__icon">{{ checkoutProblem.resolved ? '✅' : '⚠️' }}</div>
        <div class="checkout-problem-panel__body">
          <h3>{{ checkoutProblem.resolved ? 'Заказ обновлён' : 'Не удалось оформить заказ' }}</h3>
          <p>{{ checkoutProblem.message }}</p>

          <ul v-if="checkoutProblem.stockIssues.length" class="checkout-problem-list">
            <li v-for="issue in checkoutProblem.stockIssues" :key="issue.toy_id" class="checkout-problem-item">
              <div class="checkout-problem-item__text">
                <strong>{{ cartTitleFor(issue.toy_id, issue.toy_name) }}</strong>
                <span>{{ stockIssueHint(issue) }}</span>
              </div>
              <div class="checkout-problem-item__actions">
                <button
                  v-if="issue.available > 0 && issue.issue === 'insufficient_quantity'"
                  type="button"
                  class="problem-btn problem-btn--primary"
                  @click="applyAvailableQuantity(issue)"
                >
                  Оставить {{ issue.available }} шт.
                </button>
                <button type="button" class="problem-btn" @click="removeIssueItem(issue)">
                  Убрать из заказа
                </button>
                <NuxtLink
                  v-if="issue.can_preorder"
                  :to="`/product/${issue.toy_id}`"
                  class="problem-btn problem-btn--link"
                >
                  Оформить предзаказ
                </NuxtLink>
              </div>
            </li>
          </ul>

          <div class="checkout-problem-panel__footer">
            <button
              v-if="checkoutProblem.resolved || !checkoutProblem.stockIssues.length"
              type="button"
              class="problem-btn problem-btn--primary"
              @click="retryCheckout"
            >
              Попробовать снова
            </button>
            <button
              v-if="!checkoutProblem.resolved"
              type="button"
              class="problem-btn"
              :class="{ 'problem-btn--primary': !checkoutProblem.stockIssues.length }"
              @click="goToCart"
            >
              Вернуться в корзину
            </button>
            <NuxtLink v-if="!checkoutProblem.resolved" to="/shop" class="problem-btn problem-btn--ghost">
              Выбрать другие игрушки
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- Main Content Grid -->
      <div v-if="currentStep < 3" class="checkout-grid">
        <!-- LEFT: Form Steps -->
        <div class="checkout-left-col">
          <!-- STEP 1: Доставка -->
          <div v-if="currentStep === 1" class="step-content-box">
            <!-- Guest Banner if not logged in -->
            <div v-if="!user" class="guest-auth-banner mb-4">
              <div class="banner-text">
                <strong>Уже есть аккаунт Alpha?</strong>
                <span>Войдите для быстрого заполнения адреса и начисления бонусов.</span>
              </div>
              <button class="btn-guest-login" @click="openAuthModal('login')">Войти →</button>
            </div>

            <h2 class="step-heading">Адрес и детали доставки</h2>

            <div class="form-layout">
              <!-- Город -->
              <div class="form-field">
                <label class="field-label">Город</label>
                <div class="select-wrapper">
                  <select v-model="form.city" class="custom-select">
                    <option value="Алматы">Алматы</option>
                    <option value="Астана">Астана</option>
                    <option value="Шымкент">Шымкент</option>
                    <option value="Караганда">Караганда</option>
                    <option value="Актобе">Актобе</option>
                  </select>
                  <svg class="select-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A1A2E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>

              <!-- Улица, дом + Кв. / Офис -->
              <div class="form-row-2">
                <div class="form-field flex-2">
                  <label class="field-label">Улица, дом</label>
                  <input 
                    v-model="form.street" 
                    type="text" 
                    placeholder="пр. Абая, 150" 
                    class="custom-input"
                  />
                </div>
                <div class="form-field flex-1">
                  <label class="field-label">Кв. / Офис</label>
                  <input 
                    v-model="form.apartment" 
                    type="text" 
                    placeholder="42" 
                    class="custom-input"
                  />
                </div>
              </div>

              <!-- Номер телефона -->
              <div class="form-field">
                <label class="field-label">Номер телефона</label>
                <input 
                  :value="form.phone" 
                  type="tel" 
                  placeholder="+7 (707) 123-45-67" 
                  maxlength="18"
                  class="custom-input"
                  @input="onPhoneInput"
                />
              </div>

              <!-- Желаемое время доставки -->
              <div class="time-slots-section">
                <h3 class="time-heading">Желаемое время доставки</h3>
                <div class="time-slots-grid">
                  <!-- Slot 1 -->
                  <div 
                    class="time-slot-card"
                    :class="{ active: form.deliveryTime === 'today-evening' }"
                    @click="form.deliveryTime = 'today-evening'"
                  >
                    <strong class="slot-day">Сегодня</strong>
                    <span class="slot-hours">18:00 - 21:00</span>
                  </div>

                  <!-- Slot 2 -->
                  <div 
                    class="time-slot-card"
                    :class="{ active: form.deliveryTime === 'tomorrow-morning' }"
                    @click="form.deliveryTime = 'tomorrow-morning'"
                  >
                    <strong class="slot-day">Завтра</strong>
                    <span class="slot-hours">10:00 - 14:00</span>
                  </div>

                  <!-- Slot 3 -->
                  <div 
                    class="time-slot-card"
                    :class="{ active: form.deliveryTime === 'tomorrow-afternoon' }"
                    @click="form.deliveryTime = 'tomorrow-afternoon'"
                  >
                    <strong class="slot-day">Завтра</strong>
                    <span class="slot-hours">14:00 - 18:00</span>
                  </div>
                </div>
              </div>

              <div v-if="hasGiftPackagingItems" class="gift-checkout-block">
                <h3 class="time-heading">🎁 Оформление как подарок</h3>
                <p class="gift-checkout-hint">
                  Мы упакуем заказ в фирменную коробку с лентой и приложим открытку с вашим текстом.
                </p>
                <div class="form-field">
                  <label class="field-label">Имя получателя подарка <span class="req">*</span></label>
                  <input
                    v-model="giftForm.recipientName"
                    type="text"
                    placeholder="Маленькому Мише"
                    class="custom-input"
                  />
                </div>
                <div class="form-field">
                  <label class="field-label">От кого</label>
                  <input
                    v-model="giftForm.senderName"
                    type="text"
                    placeholder="От любящих крестных"
                    class="custom-input"
                  />
                </div>
                <div class="form-field">
                  <label class="field-label">Текст на открытке</label>
                  <textarea
                    v-model="giftForm.message"
                    rows="3"
                    placeholder="Расти здоровым, любознательным и счастливым!"
                    class="custom-input gift-textarea"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- STEP 2: Оплата -->
          <div v-else-if="currentStep === 2" class="step-content-box">
            <h2 class="step-heading">Способ оплаты</h2>

            <div class="payment-methods-grid">
              <!-- Kaspi Pay Card -->
              <div 
                class="payment-option-card"
                :class="{ selected: form.paymentMethod === 'kaspi' }"
                @click="form.paymentMethod = 'kaspi'"
              >
                <div class="pay-radio">
                  <span class="radio-dot" v-if="form.paymentMethod === 'kaspi'"></span>
                </div>
                <div class="pay-icon-box kaspi-icon">
                  <span>K</span>
                </div>
                <div class="pay-text">
                  <strong>Kaspi QR / Удаленный счет</strong>
                  <p>Оплата через приложение Kaspi.kz по QR или номеру телефона</p>
                </div>
              </div>

              <!-- Credit Card Option -->
              <div 
                class="payment-option-card"
                :class="{ selected: form.paymentMethod === 'card' }"
                @click="form.paymentMethod = 'card'"
              >
                <div class="pay-radio">
                  <span class="radio-dot" v-if="form.paymentMethod === 'card'"></span>
                </div>
                <div class="pay-icon-box card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C5CFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                </div>
                <div class="pay-text">
                  <strong>Банковской картой онлайн</strong>
                  <p>Visa, MasterCard, Apple Pay (без комиссии)</p>
                </div>
              </div>
            </div>

            <!-- Card inputs if card selected -->
            <div v-if="form.paymentMethod === 'card'" class="card-details-form">
              <div class="form-field">
                <label class="field-label">Номер карты</label>
                <input type="text" placeholder="4400 •••• •••• 1234" class="custom-input" />
              </div>
              <div class="form-row-2">
                <div class="form-field flex-1">
                  <label class="field-label">Срок действия</label>
                  <input type="text" placeholder="ММ / ГГ" class="custom-input" />
                </div>
                <div class="form-field flex-1">
                  <label class="field-label">CVC / CVV</label>
                  <input type="password" placeholder="•••" maxlength="3" class="custom-input" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT: Order Summary Card ("Ваш заказ") -->
        <div class="checkout-right-col">
          <div class="order-summary-box">
            <h3 class="summary-box-title">Ваш заказ</h3>

            <!-- Items mini list -->
            <div class="summary-items-list">
              <div 
                v-for="item in displayItems" 
                :key="item.id" 
                class="summary-item-row"
              >
                <img :src="item.image" :alt="item.title" class="summary-item-thumb" />
                <span class="summary-item-name">{{ item.title }}</span>
                <span class="summary-item-price">{{ formatPrice(item.price * item.quantity) }} ₸</span>
              </div>
            </div>

            <div class="summary-divider"></div>

            <!-- Costs -->
            <div class="summary-cost-rows">
              <div class="sum-row">
                <span class="sum-label">Товары</span>
                <strong class="sum-val">{{ formatPrice(itemsSubtotal) }} ₸</strong>
              </div>
              <div class="sum-row">
                <span class="sum-label">Доставка</span>
                <strong class="sum-val">{{ formatPrice(deliveryFee) }} ₸</strong>
              </div>
              <div v-if="giftCardDiscount > 0" class="sum-row discount-row">
                <span class="sum-label">Сертификат {{ appliedGiftCard?.code }}</span>
                <strong class="sum-val">-{{ formatPrice(giftCardDiscount) }} ₸</strong>
              </div>
            </div>

            <div class="summary-divider"></div>

            <!-- Total -->
            <div class="summary-total-row">
              <span class="sum-total-label">Итого</span>
              <span class="sum-total-price">{{ formatPrice(totalOrderSum) }} ₸</span>
            </div>

            <!-- Next Action Button -->
            <button 
              v-if="currentStep === 1" 
              class="primary-action-btn"
              @click="goToPayment"
            >
              Перейти к оплате
            </button>
            <button 
              v-else-if="currentStep === 2" 
              class="primary-action-btn"
              @click="completePayment"
            >
              Оплатить {{ formatPrice(totalOrderSum) }} ₸
            </button>
          </div>
        </div>
      </div>

      <!-- STEP 3: SUCCESS CONFIRMATION -->
      <div v-else class="success-screen-box">
        <div class="success-icon-badge">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#06D6A0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        <h2 class="success-title">Заказ №{{ orderNumber }} успешно оформлен!</h2>
        <p class="success-subtitle">
          Мы уже начали бережно собирать и упаковывать ваш набор.<br />
          Служба доставки Alpha Play привезет заказ <strong>{{ selectedTimeSlotText }}</strong> по адресу:
          <br /><span class="success-address">{{ form.city }}, {{ form.street }}{{ form.apartment ? ', кв. ' + form.apartment : '' }}</span>
        </p>

        <div class="success-actions">
          <NuxtLink :to="deliveryTrackLink" class="track-btn">
            Отслеживать доставку в реальном времени →
          </NuxtLink>
          <NuxtLink to="/" class="home-btn">
            Вернуться на главную
          </NuxtLink>
        </div>
      </div>
    </main>

    <!-- TheFooter -->
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect, nextTick } from 'vue'
import TheHeader from '~/components/TheHeader.vue'
import TheFooter from '~/components/TheFooter.vue'
import { formatApiError } from '~/utils/formatApiError'

type StockIssue = {
  toy_id: number
  toy_name: string
  requested: number
  available: number
  issue: string
  can_preorder?: boolean
}

type CheckoutProblem = {
  message: string
  stockIssues: StockIssue[]
  resolved?: boolean
}

const { user, openAuthModal } = useAuth()
const { items: cartItems, totalPrice, clearCart, hasGiftPackagingItems, setQuantity, removeItem } = useCart()
const { appliedGiftCard, computeGiftDiscount, clearAppliedGiftCard, refreshDiscountForTotal } = useCartPromo()
const { createOrder } = useOrders()
const { error: toastError, success: toastSuccess } = useToast()
const currentStep = ref(1)
const orderNumber = ref(Math.floor(10000 + Math.random() * 90000))
const createdOrderId = ref<number | null>(null)
const checkoutProblem = ref<CheckoutProblem | null>(null)
const problemPanelRef = ref<HTMLElement | null>(null)

const form = ref({
  city: 'Алматы',
  street: 'пр. Абая, 150',
  apartment: '42',
  phone: '+7 (707) 123-45-67',
  deliveryTime: 'today-evening',
  paymentMethod: 'kaspi'
})

const giftForm = ref({
  recipientName: '',
  senderName: '',
  message: '',
})

const onPhoneInput = (event: Event) => {
  handlePhoneInput(event, (val) => {
    form.value.phone = val
  })
}

watchEffect(() => {
  if (user.value) {
    if (user.value.phone) form.value.phone = user.value.phone
    if (user.value.address) form.value.street = user.value.address
  }
})

const deliveryFee = computed(() => {
  return cartItems.value.length > 0 ? 1200 : 0
})

const displayItems = computed(() => {
  return cartItems.value
})

const itemsSubtotal = computed(() => {
  return displayItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
})

const payableBeforeDiscount = computed(() => itemsSubtotal.value + deliveryFee.value)

const giftCardDiscount = computed(() => computeGiftDiscount(payableBeforeDiscount.value))

const totalOrderSum = computed(() => {
  return Math.max(0, payableBeforeDiscount.value - giftCardDiscount.value)
})

watch(payableBeforeDiscount, (total) => {
  refreshDiscountForTotal(total)
})

const selectedTimeSlotText = computed(() => {
  if (form.value.deliveryTime === 'today-evening') return 'Сегодня (18:00 - 21:00)'
  if (form.value.deliveryTime === 'tomorrow-morning') return 'Завтра (10:00 - 14:00)'
  return 'Завтра (14:00 - 18:00)'
})

const deliveryTrackLink = computed(() =>
  createdOrderId.value ? `/delivery?order_id=${createdOrderId.value}` : '/delivery'
)

const goToPayment = () => {
  checkoutProblem.value = null
  if (!form.value.street || !form.value.phone) {
    toastError('Укажите адрес и телефон', 'Без них мы не сможем доставить заказ.')
    return
  }
  if (hasGiftPackagingItems.value && !giftForm.value.recipientName.trim()) {
    toastError('Нужно имя получателя', 'Укажите, для кого подарочная упаковка.')
    return
  }
  currentStep.value = 2
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cartTitleFor = (toyId: number, fallback: string) => {
  const inCart = cartItems.value.find(i => Number(i.id) === toyId)
  return inCart?.title || fallback
}

const stockIssueHint = (issue: StockIssue) => {
  if (issue.issue === 'insufficient_quantity') {
    return `В корзине ${issue.requested} шт., на складе только ${issue.available}.`
  }
  if (issue.issue === 'out_of_stock') {
    return 'Товар закончился на складе.'
  }
  if (issue.issue === 'not_for_sale') {
    return 'Этот товар сейчас недоступен для покупки.'
  }
  if (issue.issue === 'unavailable') {
    return 'Товар временно недоступен.'
  }
  return 'Товар недоступен для заказа.'
}

const showCheckoutProblem = async (message: string, stockIssues: StockIssue[] = []) => {
  checkoutProblem.value = { message, stockIssues, resolved: false }
  currentStep.value = Math.min(currentStep.value, 2)
  await nextTick()
  problemPanelRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const markCheckoutResolved = (message: string) => {
  checkoutProblem.value = { message, stockIssues: [], resolved: true }
}

const applyAvailableQuantity = (issue: StockIssue) => {
  setQuantity(issue.toy_id, issue.available)
  if (checkoutProblem.value) {
    checkoutProblem.value.stockIssues = checkoutProblem.value.stockIssues.filter(i => i.toy_id !== issue.toy_id)
  }
  if (checkoutProblem.value?.stockIssues.length === 0) {
    markCheckoutResolved(`«${cartTitleFor(issue.toy_id, issue.toy_name)}» — ${issue.available} шт. Нажмите «Попробовать снова» для оплаты.`)
  }
}

const removeIssueItem = (issue: StockIssue) => {
  removeItem(issue.toy_id)
  if (checkoutProblem.value) {
    checkoutProblem.value.stockIssues = checkoutProblem.value.stockIssues.filter(i => i.toy_id !== issue.toy_id)
  }
  if (cartItems.value.length === 0) {
    checkoutProblem.value = null
    navigateTo('/cart')
    return
  }
  if (checkoutProblem.value?.stockIssues.length === 0) {
    markCheckoutResolved('Корзина обновлена. Можно продолжить оплату.')
  }
}

const retryCheckout = () => {
  checkoutProblem.value = null
  if (currentStep.value < 2) {
    currentStep.value = 2
  }
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
}

const goToCart = () => {
  checkoutProblem.value = null
  navigateTo('/cart')
}

const parseCheckoutError = (e: any): CheckoutProblem => {
  const data = e?.data ?? e?.response?._data
  const stockIssues = Array.isArray(data?.stock_issues) ? data.stock_issues as StockIssue[] : []
  return {
    message: data?.message || formatApiError(e, 'Не удалось оформить заказ. Попробуйте обновить корзину.'),
    stockIssues,
  }
}

const isSubmitting = ref(false)

const completePayment = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true
  checkoutProblem.value = null

  const fullAddress = `${form.value.city}, ${form.value.street}${form.value.apartment ? ', кв. ' + form.value.apartment : ''}`

  const payload = {
    items: cartItems.value.map(item => ({
      toy_id: Number(item.id),
      quantity: item.quantity || 1,
    })).filter(item => Number.isFinite(item.toy_id) && item.toy_id > 0),
    address: fullAddress,
    phone: form.value.phone,
    delivery_time: form.value.deliveryTime,
    payment_method: form.value.paymentMethod,
    gift_card_code: appliedGiftCard.value?.code,
    is_gift: hasGiftPackagingItems.value,
    gift_recipient_name: hasGiftPackagingItems.value ? giftForm.value.recipientName.trim() : undefined,
    gift_sender_name: hasGiftPackagingItems.value ? giftForm.value.senderName.trim() || undefined : undefined,
    gift_message: hasGiftPackagingItems.value ? giftForm.value.message.trim() || undefined : undefined,
  }

  if (hasGiftPackagingItems.value && !giftForm.value.recipientName.trim()) {
    toastError('Нужно имя получателя', 'Укажите, для кого подарочная упаковка.')
    isSubmitting.value = false
    return
  }

  if (payload.items.length === 0) {
    toastError('Корзина пуста', 'Добавьте товары из каталога и попробуйте снова.')
    isSubmitting.value = false
    navigateTo('/shop')
    return
  }

  try {
    const res = await createOrder(payload)
    if (res?.data?.id) {
      orderNumber.value = res.data.order_number || res.data.id
      createdOrderId.value = res.data.id
    }
    currentStep.value = 3
    clearCart()
    clearAppliedGiftCard()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e: any) {
    const problem = parseCheckoutError(e)
    await showCheckoutProblem(problem.message, problem.stockIssues)
  } finally {
    isSubmitting.value = false
  }
}

const formatPrice = (val: number) => {
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
</script>

<style scoped>
.checkout-page {
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
  padding-top: 28px;
}

.checkout-problem-panel {
  display: flex;
  gap: 16px;
  margin-bottom: 28px;
  padding: 20px 22px;
  border-radius: 20px;
  background: #FFF5F5;
  border: 1px solid #FECACA;
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.08);
}

.checkout-problem-panel--resolved {
  background: #F0FDF4;
  border-color: #BBF7D0;
  box-shadow: 0 8px 24px rgba(34, 197, 94, 0.08);
}

.checkout-problem-panel--resolved .checkout-problem-panel__body h3 {
  color: #166534;
}

.checkout-problem-panel--resolved .checkout-problem-panel__body > p {
  color: #15803D;
}

.checkout-problem-panel__icon {
  font-size: 28px;
  line-height: 1;
  flex-shrink: 0;
}

.checkout-problem-panel__body {
  flex: 1;
  min-width: 0;
}

.checkout-problem-panel__body h3 {
  margin: 0 0 6px;
  font-size: 18px;
  color: #991B1B;
}

.checkout-problem-panel__body > p {
  margin: 0 0 16px;
  color: #7F1D1D;
  line-height: 1.5;
}

.checkout-problem-list {
  list-style: none;
  margin: 0 0 18px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkout-problem-item {
  padding: 14px 16px;
  border-radius: 14px;
  background: #FFFFFF;
  border: 1px solid #FEE2E2;
}

.checkout-problem-item__text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
}

.checkout-problem-item__text strong {
  color: #1A1A2E;
  font-size: 15px;
}

.checkout-problem-item__text span {
  color: #6B7280;
  font-size: 14px;
}

.checkout-problem-item__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.checkout-problem-panel__footer {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.problem-btn {
  appearance: none;
  border: 1px solid #E5E7EB;
  background: #fff;
  color: #1A1A2E;
  border-radius: 999px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.problem-btn--primary {
  background: #7C5CFC;
  border-color: #7C5CFC;
  color: #fff;
}

.problem-btn--ghost {
  background: transparent;
}

.problem-btn--link {
  border-color: #C4B5FD;
  color: #7C5CFC;
}

/* Stepper Header */
.stepper-header {
  margin-bottom: 36px;
}

/* Auth Guard Card */
.auth-guard-box {
  background: #FFFFFF;
  border-radius: 28px;
  padding: 56px 36px;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.02);
  max-width: 580px;
  margin: 20px auto 40px auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.auth-guard-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #F0EDFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-bottom: 20px;
}

.auth-guard-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 24px;
  color: #1A1A2E;
  margin-bottom: 10px;
}

.auth-guard-desc {
  font-size: 14.5px;
  color: #7B7B93;
  line-height: 1.55;
  margin-bottom: 28px;
}

.auth-gate-btn {
  background: #624CE0;
  color: #FFFFFF;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 15px;
  padding: 14px 32px;
  border-radius: 14px;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(98, 76, 224, 0.25);
  transition: all 0.2s ease;
}

.auth-gate-btn:hover {
  background: #513bc7;
  transform: translateY(-1px);
}

.stepper-track {
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 600px;
}

.stepper-item {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.guest-auth-banner {
  background: #F4F0FF;
  border: 1px solid #E2D9FF;
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.banner-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 13.5px;
  color: #1A1A2E;
}

.btn-guest-login {
  background: #7C5CFC;
  color: #FFFFFF;
  border: none;
  font-weight: 700;
  font-size: 13px;
  padding: 8px 16px;
  border-radius: 10px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.btn-guest-login:hover {
  background: #6544E0;
}

.step-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #FFFFFF;
  border: 1px solid #EAEAF2;
  color: #7B7B93;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.step-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 15px;
  color: #7B7B93;
  transition: color 0.2s ease;
}

.stepper-item.active .step-num {
  background: #624CE0;
  border-color: #624CE0;
  color: #FFFFFF;
  box-shadow: 0 4px 12px rgba(98, 76, 224, 0.3);
}

.stepper-item.active .step-title {
  color: #1A1A2E;
  font-weight: 800;
}

.stepper-item.completed .step-num {
  background: #06D6A0;
  border-color: #06D6A0;
  color: #FFFFFF;
}

.stepper-item.completed .step-title {
  color: #1A1A2E;
}

.step-divider {
  width: 48px;
  height: 2px;
  background: #EAEAF2;
  border-radius: 2px;
}

.step-divider.filled {
  background: #624CE0;
}

/* Grid Layout */
.checkout-grid {
  display: grid;
  grid-template-columns: 1.55fr 1fr;
  gap: 36px;
  align-items: flex-start;
}

/* Left Box */
.step-content-box {
  display: flex;
  flex-direction: column;
}

.step-heading {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 26px;
  color: #1A1A2E;
  margin-bottom: 22px;
}

.form-layout {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-family: 'Outfit', sans-serif;
  font-size: 13.5px;
  font-weight: 800;
  color: #1A1A2E;
}

.select-wrapper {
  position: relative;
  width: 100%;
}

.custom-select {
  width: 100%;
  background: #FFFFFF;
  border: 1.5px solid #EAEAF2;
  border-radius: 14px;
  padding: 12px 18px;
  font-size: 14px;
  color: #1A1A2E;
  font-family: 'DM Sans', sans-serif;
  outline: none;
  appearance: none;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}

.select-arrow {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.form-row-2 {
  display: flex;
  gap: 16px;
}

.flex-2 { flex: 2; }
.flex-1 { flex: 1; }

.custom-input {
  width: 100%;
  background: #FFFFFF;
  border: 1.5px solid #EAEAF2;
  border-radius: 14px;
  padding: 12px 18px;
  font-size: 14px;
  color: #1A1A2E;
  font-family: 'DM Sans', sans-serif;
  outline: none;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}

.custom-input:focus {
  border-color: #7C5CFC;
  box-shadow: 0 4px 14px rgba(124, 92, 252, 0.12);
}

/* Time Slots */
.time-slots-section {
  margin-top: 8px;
}

.time-heading {
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 800;
  color: #1A1A2E;
  margin-bottom: 12px;
}

.time-slots-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.gift-checkout-block {
  margin-top: 28px;
  padding: 20px;
  border-radius: 16px;
  background: linear-gradient(135deg, #FFF8F0 0%, #F5F0FF 100%);
  border: 1px solid rgba(98, 76, 224, 0.15);
}

.gift-checkout-hint {
  font-size: 13.5px;
  color: #6B6B80;
  margin: 0 0 16px;
  line-height: 1.5;
}

.gift-textarea {
  resize: vertical;
  min-height: 80px;
}

.req {
  color: #E53935;
}

.time-slot-card {
  background: #FFFFFF;
  border: 1.5px solid #EAEAF2;
  border-radius: 16px;
  padding: 14px 16px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 3px;
  transition: all 0.2s ease;
}

.time-slot-card:hover {
  border-color: #FFD166;
}

.time-slot-card.active {
  background: #FFF9E6;
  border-color: #FFD166;
  box-shadow: 0 4px 14px rgba(255, 209, 102, 0.25);
}

.slot-day {
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 800;
  color: #1A1A2E;
}

.slot-hours {
  font-size: 12px;
  color: #7B7B93;
}

/* Payment Methods (Step 2) */
.payment-methods-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 24px;
}

.payment-option-card {
  background: #FFFFFF;
  border: 1.5px solid #EAEAF2;
  border-radius: 18px;
  padding: 16px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s ease;
}

.payment-option-card:hover {
  border-color: #7C5CFC;
}

.payment-option-card.selected {
  border-color: #624CE0;
  background: #F8F6FF;
}

.pay-radio {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #D2D2E0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.payment-option-card.selected .pay-radio {
  border-color: #624CE0;
}

.radio-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #624CE0;
}

.pay-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kaspi-icon {
  background: #F14635;
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-weight: 900;
  font-size: 22px;
}

.card-icon {
  background: #F0EDFF;
}

.pay-text strong {
  display: block;
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 800;
  color: #1A1A2E;
  margin-bottom: 2px;
}

.pay-text p {
  font-size: 12.5px;
  color: #7B7B93;
}

.card-details-form {
  background: #FFFFFF;
  border-radius: 18px;
  padding: 20px;
  border: 1px solid #EAEAF2;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Right Summary Card */
.order-summary-box {
  background: #FFFFFF;
  border-radius: 24px;
  padding: 28px 28px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
}

.summary-box-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 20px;
  color: #1A1A2E;
  margin-bottom: 20px;
}

.summary-items-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 18px;
}

.summary-item-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.summary-item-thumb {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #F4F8FC;
  object-fit: cover;
  flex-shrink: 0;
}

.summary-item-name {
  flex: 1;
  font-size: 13.5px;
  font-weight: 700;
  color: #1A1A2E;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.summary-item-price {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 15px;
  color: #1A1A2E;
  flex-shrink: 0;
}

.summary-divider {
  height: 1px;
  background: #F4F4F8;
  margin: 16px 0;
}

.summary-cost-rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sum-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.sum-label {
  color: #7B7B93;
}

.sum-val {
  color: #1A1A2E;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
}

.summary-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 22px;
}

.sum-total-label {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 18px;
  color: #1A1A2E;
}

.sum-total-price {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 24px;
  color: #624CE0;
}

.primary-action-btn {
  width: 100%;
  background: #624CE0;
  color: #FFFFFF;
  border: none;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 15px;
  padding: 14px;
  border-radius: 14px;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(98, 76, 224, 0.25);
  transition: all 0.2s ease;
}

.primary-action-btn:hover {
  background: #513bc7;
  transform: translateY(-1px);
}

/* Success Screen (Step 3) */
.success-screen-box {
  background: #FFFFFF;
  border-radius: 28px;
  padding: 56px 40px;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.02);
  max-width: 680px;
  margin: 20px auto 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.success-icon-badge {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #D9F7EC;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.success-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 28px;
  color: #1A1A2E;
  margin-bottom: 12px;
}

.success-subtitle {
  font-size: 15px;
  color: #7B7B93;
  line-height: 1.6;
  margin-bottom: 32px;
}

.success-address {
  color: #1A1A2E;
  font-weight: 700;
}

.success-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 380px;
}

.track-btn {
  background: #624CE0;
  color: #FFFFFF;
  padding: 14px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 14.5px;
  text-decoration: none;
  box-shadow: 0 6px 20px rgba(98, 76, 224, 0.25);
  transition: all 0.2s ease;
}

.track-btn:hover {
  background: #513bc7;
}

.home-btn {
  background: #F4F4F8;
  color: #4A4A68;
  padding: 12px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 14px;
  text-decoration: none;
}

/* Responsive */
@media (max-width: 960px) {
  .checkout-grid {
    grid-template-columns: 1fr;
  }

  .time-slots-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .container {
    padding: 0 16px;
  }

  .page-content {
    padding-top: 16px;
  }

  .checkout-main-card,
  .checkout-summary-card,
  .success-card,
  .auth-guard-box {
    padding: 20px 16px;
    border-radius: 20px;
  }

  .form-row-2 {
    flex-direction: column;
    gap: 14px;
  }

  .stepper-track {
    padding: 8px 12px;
  }

  .step-title {
    font-size: 11.5px;
  }

  .step-num {
    width: 22px;
    height: 22px;
    font-size: 11px;
  }

  .payment-method-card {
    padding: 16px 14px;
  }

  .step-buttons-row {
    flex-direction: column-reverse;
  }

  .back-btn,
  .next-btn {
    width: 100%;
    text-align: center;
    justify-content: center;
  }
}
</style>
