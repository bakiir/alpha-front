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
          <NuxtLink to="/delivery" class="track-btn">
            Отслеживать доставку в реальном времени →
          </NuxtLink>
          <NuxtLink to="/" class="home-btn">
            Вернуться на главную
          </NuxtLink>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import TheHeader from '~/components/TheHeader.vue'

const { user, openAuthModal } = useAuth()
const { items: cartItems, totalPrice, clearCart } = useCart()
const currentStep = ref(1)
const orderNumber = ref(Math.floor(10000 + Math.random() * 90000))

const form = ref({
  city: 'Алматы',
  street: 'пр. Абая, 150',
  apartment: '42',
  phone: '+7 (707) 123-45-67',
  deliveryTime: 'today-evening',
  paymentMethod: 'kaspi'
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

const totalOrderSum = computed(() => {
  return itemsSubtotal.value + deliveryFee.value
})

const selectedTimeSlotText = computed(() => {
  if (form.value.deliveryTime === 'today-evening') return 'Сегодня (18:00 - 21:00)'
  if (form.value.deliveryTime === 'tomorrow-morning') return 'Завтра (10:00 - 14:00)'
  return 'Завтра (14:00 - 18:00)'
})

const goToPayment = () => {
  if (!form.value.street || !form.value.phone) {
    alert('Пожалуйста, укажите адрес и номер телефона для доставки.')
    return
  }
  currentStep.value = 2
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const { createOrder } = useOrders()
const isSubmitting = ref(false)

const completePayment = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true

  const fullAddress = `${form.value.city}, ${form.value.street}${form.value.apartment ? ', кв. ' + form.value.apartment : ''}`

  const payload = {
    items: cartItems.value.map(item => ({
      toy_id: typeof item.id === 'number' ? item.id : 1,
      title: item.title,
      quantity: item.quantity || 1,
      price: item.price,
    })),
    address: fullAddress,
    phone: form.value.phone,
    delivery_time: form.value.deliveryTime,
    payment_method: form.value.paymentMethod,
  }

  try {
    const res = await createOrder(payload)
    if (res?.data?.id) {
      orderNumber.value = res.data.id
    }
    currentStep.value = 3
    clearCart()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e: any) {
    const errMsg = e?.data?.message || e?.message || 'Не удалось оформить заказ. Пожалуйста, проверьте введённые данные.'
    alert(errMsg)
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
