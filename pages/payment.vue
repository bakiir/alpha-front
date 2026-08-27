<template>
  <div class="payment-page">
    <TheHeader />

    <main class="container page-content">
      <div class="payment-container">
        <!-- Success State -->
        <div v-if="isPaid" class="success-screen">
          <div class="success-icon">✅</div>
          <h2>Оплата прошла успешно!</h2>
          <p>Мы получили ваш платеж в размере <strong>{{ formatPrice(amount) }} ₸</strong>.</p>
          <p>Сейчас вы будете перенаправлены в Личный кабинет...</p>
        </div>

        <!-- Payment Form -->
        <div v-else class="payment-card">
          <h1 class="page-title">{{ paymentType === 'rental_extend' ? 'Оплата продления аренды' : 'Оплата заказа' }}</h1>
          <p class="order-info">К оплате: <strong>{{ formatPrice(amount) }} ₸</strong></p>
          <p class="order-meta" v-if="orderId">
            {{ paymentType === 'rental_extend' ? `Продление аренды #${orderId} на ${extraDays} дн.` : `Заказ #${orderId}` }}
          </p>

          <h3 class="method-title">Выберите способ оплаты:</h3>
          
          <div class="payment-methods-grid">
            <!-- Kaspi -->
            <div 
              class="payment-option-card"
              :class="{ selected: selectedMethod === 'kaspi' }"
              @click="selectedMethod = 'kaspi'"
            >
              <div class="pay-radio">
                <span class="radio-dot" v-if="selectedMethod === 'kaspi'"></span>
              </div>
              <div class="pay-icon-box kaspi-icon">
                <span>K</span>
              </div>
              <div class="pay-text">
                <strong>Kaspi QR / Удаленный счет</strong>
                <p>Оплата через приложение Kaspi.kz</p>
              </div>
            </div>

            <!-- Card -->
            <div 
              class="payment-option-card"
              :class="{ selected: selectedMethod === 'card' }"
              @click="selectedMethod = 'card'"
            >
              <div class="pay-radio">
                <span class="radio-dot" v-if="selectedMethod === 'card'"></span>
              </div>
              <div class="pay-icon-box card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C5CFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                  <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
              </div>
              <div class="pay-text">
                <strong>Банковская карта</strong>
                <p>Visa, MasterCard, Apple Pay</p>
              </div>
            </div>
          </div>

          <!-- Dummy Card Inputs -->
          <div v-if="selectedMethod === 'card'" class="card-details-form">
            <div class="input-grp">
              <label>Номер карты</label>
              <input type="text" placeholder="0000 0000 0000 0000" class="m-input" />
            </div>
            <div class="form-row-2">
              <div class="input-grp">
                <label>Срок действия</label>
                <input type="text" placeholder="ММ / ГГ" class="m-input" />
              </div>
              <div class="input-grp">
                <label>CVC</label>
                <input type="password" placeholder="•••" class="m-input" />
              </div>
            </div>
          </div>

          <!-- Dummy Kaspi QR -->
          <div v-if="selectedMethod === 'kaspi'" class="kaspi-qr-mock">
            <div class="qr-placeholder">
              <div class="qr-pattern"></div>
            </div>
            <p>Отсканируйте QR в приложении Kaspi.kz</p>
          </div>

          <button class="pay-btn" :disabled="isProcessing" @click="processPayment">
            <span v-if="!isProcessing">Оплатить {{ formatPrice(amount) }} ₸</span>
            <span v-else>Обработка...</span>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TheHeader from '~/components/TheHeader.vue'

const route = useRoute()
const router = useRouter()

const amount = ref(0)
const orderId = ref('')
const paymentType = ref('')
const extraDays = ref(1)
const selectedMethod = ref('kaspi')
const isProcessing = ref(false)
const isPaid = ref(false)

onMounted(() => {
  if (route.query.amount) {
    amount.value = Number(route.query.amount)
  }
  if (route.query.id) {
    orderId.value = route.query.id as string
  }
  if (route.query.type) {
    paymentType.value = route.query.type as string
  }
  if (route.query.days) {
    extraDays.value = Number(route.query.days)
  }
})

const formatPrice = (price: number) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

import { useRentals } from '~/composables/useRentals'

const { payRental, extendRental } = useRentals()

const processPayment = async () => {
  if (isProcessing.value) return
  isProcessing.value = true

  try {
    if (paymentType.value === 'rental' && orderId.value) {
      await payRental(orderId.value)
    } else if (paymentType.value === 'rental_extend' && orderId.value) {
      await extendRental(orderId.value, extraDays.value)
    }

    isProcessing.value = false
    isPaid.value = true

    // Redirect to history after success
    setTimeout(() => {
      router.push('/history?tab=rentals')
    }, 2000)
  } catch (e: any) {
    isProcessing.value = false
    alert(e?.data?.message || 'Ошибка обработки платежа. Попробуйте еще раз.')
  }
}
</script>

<style scoped>
.payment-page {
  min-height: 100vh;
  background-color: #F8F9FB;
  font-family: 'DM Sans', sans-serif;
}
.page-content {
  padding: 40px 20px;
  display: flex;
  justify-content: center;
}
.payment-container {
  width: 100%;
  max-width: 500px;
}
.payment-card {
  background: #FFFFFF;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}
.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1A1A2E;
  margin: 0 0 8px 0;
  text-align: center;
}
.order-info {
  font-size: 18px;
  color: #1A1A2E;
  text-align: center;
  margin: 0 0 4px 0;
}
.order-meta {
  font-size: 14px;
  color: #7B7B93;
  text-align: center;
  margin: 0 0 24px 0;
}

.method-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.payment-methods-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.payment-option-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1.5px solid #E2E2EC;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.payment-option-card:hover {
  border-color: #7C5CFC;
}
.payment-option-card.selected {
  border-color: #7C5CFC;
  background: #F4F2FF;
}

.pay-radio {
  width: 20px;
  height: 20px;
  border: 2px solid #D1D1E0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.payment-option-card.selected .pay-radio {
  border-color: #7C5CFC;
}
.radio-dot {
  width: 10px;
  height: 10px;
  background: #7C5CFC;
  border-radius: 50%;
}

.pay-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.kaspi-icon {
  background: #F14635;
  color: white;
  font-weight: bold;
  font-size: 20px;
  font-family: sans-serif;
}
.card-icon {
  background: #F4F4F8;
}

.pay-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.pay-text strong {
  font-size: 15px;
  color: #1A1A2E;
}
.pay-text p {
  font-size: 13px;
  color: #7B7B93;
  margin: 0;
}

.card-details-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}
.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.input-grp {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.input-grp label {
  font-size: 13px;
  font-weight: 600;
  color: #1A1A2E;
}
.m-input {
  padding: 12px 14px;
  border: 1.5px solid #E2E2EC;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  font-family: inherit;
}
.m-input:focus {
  border-color: #7C5CFC;
}

.kaspi-qr-mock {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}
.qr-placeholder {
  width: 160px;
  height: 160px;
  background: #fff;
  border: 2px solid #E2E2EC;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}
.qr-pattern {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #F14635 25%, transparent 25%) -25px 0,
              linear-gradient(225deg, #F14635 25%, transparent 25%) -25px 0,
              linear-gradient(315deg, #F14635 25%, transparent 25%),
              linear-gradient(45deg, #F14635 25%, transparent 25%);
  background-size: 20px 20px;
  background-color: #fff;
  opacity: 0.8;
}

.pay-btn {
  width: 100%;
  background: #7C5CFC;
  color: white;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.pay-btn:hover:not(:disabled) {
  background: #624CE0;
}
.pay-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.success-screen {
  background: #fff;
  border-radius: 20px;
  padding: 48px 32px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}
.success-icon {
  font-size: 72px;
  margin-bottom: 24px;
}
.success-screen h2 {
  font-size: 24px;
  color: #1A1A2E;
  margin-bottom: 12px;
}
.success-screen p {
  color: #7B7B93;
  margin-bottom: 8px;
  font-size: 15px;
}
</style>
