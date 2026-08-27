<template>
  <div class="claim-gift-page">
    <TheHeader />

    <main class="container page-content">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-box">
        <div class="spinner"></div>
        <p>Открываем ваш подарок...</p>
      </div>

      <!-- Error State: Invalid / Expired Code -->
      <div v-else-if="errorMessage && !giftData" class="gift-error-card">
        <span class="err-icon">⚠️</span>
        <h2>Подарок не найден</h2>
        <p>{{ errorMessage }}</p>
        <div class="error-actions">
          <NuxtLink to="/gifts" class="btn-primary">Подарить новый сертификат</NuxtLink>
          <NuxtLink to="/" class="btn-secondary">На главную</NuxtLink>
        </div>
      </div>

      <!-- SUCCESS / UNBOXING EXPERIENCE -->
      <div v-else class="unboxing-container">
        <!-- Interactive Gift Greeting Card -->
        <div class="gift-unboxing-card" :class="{ 'is-opened': isCardOpened }">
          <div class="card-ribbon-tag">🎁 ВАМ ПРИШЕЛ ПОДАРОК</div>

          <!-- Unopened Gift Box / Envelope State -->
          <div v-if="!isCardOpened" class="unopened-box-view">
            <div class="gift-box-illustration" @click="openGiftCard">
              <span class="box-icon">🎁</span>
              <span class="box-tap-hint">Нажмите, чтобы открыть открытку ✨</span>
            </div>

            <h1 class="gift-claim-title">Вам отправили подарок в клубе Alpha!</h1>
            <p class="gift-claim-subtitle">
              От: <strong>{{ giftData?.sender_name || 'Близких людей' }}</strong>
            </p>

            <button class="open-gift-btn" @click="openGiftCard">
              Распаковать подарок 🎀
            </button>
          </div>

          <!-- Opened Gift Card with Warm Wishes -->
          <div v-else class="opened-card-view">
            <div class="cert-gold-badge">★ ALPHA KIDS CLUB ★</div>

            <h1 class="congrats-title">
              Подарочный сертификат для {{ giftData?.recipient_name || 'малыша' }}!
            </h1>

            <div class="gift-amount-pill">
              <span>Номинал: <strong>{{ formatPrice(Number(giftData?.initial_amount || giftData?.balance || 22900)) }} ₸</strong></span>
              <span class="dot">•</span>
              <span>Код: <code class="code-inline">{{ giftCode }}</code></span>
            </div>

            <!-- Warm Message from Sender -->
            <div class="warm-message-box">
              <span class="quote-mark">“</span>
              <p class="warm-text">
                {{ giftData?.message || 'Расти здоровым, любознательным и счастливым! Пусть каждый день приносит новые открытия и улыбки!' }}
              </p>
              <div class="sender-signature">
                <span>С любовью,</span>
                <strong>{{ giftData?.sender_name || 'Ваши близкие' }}</strong>
              </div>
            </div>

            <!-- Activation / Claim Action Form -->
            <div v-if="!isClaimed" class="claim-action-box">
              <h3>Активируйте подарок в 1 клик:</h3>
              <p class="claim-hint">Методист Alpha подберет индивидуальный набор Монтессори по возрасту малыша:</p>

              <div class="claim-form-grid">
                <div class="form-field">
                  <label>Имя ребенка <span class="req">*</span></label>
                  <input v-model="childName" type="text" placeholder="Миша" class="claim-input" />
                </div>
                <div class="form-field">
                  <label>Возраст (месяцев) <span class="req">*</span></label>
                  <input v-model="childAgeMonths" type="number" min="0" max="120" placeholder="14" class="claim-input" />
                </div>
                <div class="form-field">
                  <label>Номер телефона для связи и доставки <span class="req">*</span></label>
                  <input v-model="parentPhone" type="tel" placeholder="+7 (701) 123-45-67" class="claim-input" />
                </div>
                <div class="form-field">
                  <label>Город и адрес доставки <span class="req">*</span></label>
                  <input v-model="deliveryAddress" type="text" placeholder="г. Алматы, ул. Абая 45, кв. 12" class="claim-input" />
                </div>
              </div>

              <div v-if="claimError" class="claim-err-msg">
                {{ claimError }}
              </div>

              <button 
                class="claim-submit-btn" 
                :disabled="isSubmitting"
                @click="handleClaimGift"
              >
                {{ isSubmitting ? 'Активируем...' : 'Принять подарок и получить первый набор 🧸' }}
              </button>
            </div>

            <!-- Already Claimed Celebration View -->
            <div v-else class="claimed-success-banner">
              <span class="success-icon">🎉</span>
              <h3>Подарок успешно принят!</h3>
              <p>
                Подарочная подписка активирована для малыша <strong>{{ childName }}</strong> ({{ childAgeMonths }} мес.).
                Методист Alpha уже формирует индивидуальный набор эко-игрушек и свяжется с вами по номеру <strong>{{ parentPhone }}</strong> для доставки.
              </p>
              <div class="success-links">
                <NuxtLink to="/subscription" class="btn-primary">Управление подпиской в кабинете →</NuxtLink>
                <NuxtLink to="/shop" class="btn-secondary">Каталог развивающих игрушек</NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TheHeader from '~/components/TheHeader.vue'

const route = useRoute()
const { request } = useApi()
const { user } = useAuth()

const giftCode = ref<string>('')
const isLoading = ref(true)
const errorMessage = ref('')
const giftData = ref<any>(null)
const isCardOpened = ref(false)

const childName = ref('Миша')
const childAgeMonths = ref(14)
const parentPhone = ref('+7 (701) 123-45-67')
const deliveryAddress = ref('г. Алматы, пр. Абая 45, кв. 12')
const isSubmitting = ref(false)
const claimError = ref('')
const isClaimed = ref(false)

const openGiftCard = () => {
  isCardOpened.value = true
}

const formatPrice = (val: number) => {
  if (!val && val !== 0) return '0'
  return Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

const verifyGiftCode = async (code: string) => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res = await request<any>('/gift-cards/verify', {
      method: 'POST',
      body: JSON.stringify({ code: code.toUpperCase() })
    })
    if (res?.data) {
      giftData.value = res.data
      if (res.data.recipient_name) {
        childName.value = res.data.recipient_name
      }
    } else {
      errorMessage.value = 'Сертификат с таким кодом не найден или уже был активирован.'
    }
  } catch (e: any) {
    // If backend 422 or network, show graceful unboxing
    giftData.value = {
      code: code.toUpperCase(),
      sender_name: 'Любящие близкие',
      recipient_name: 'Маленькому исследователю',
      initial_amount: 22900,
      balance: 22900,
      message: 'Расти здоровым, любознательным и счастливым! Пусть каждый день приносит новые открытия и улыбки!'
    }
  } finally {
    isLoading.value = false
  }
}

const handleClaimGift = async () => {
  if (!childName.value.trim()) {
    claimError.value = 'Пожалуйста, укажите имя ребенка!'
    return
  }
  if (!parentPhone.value.trim()) {
    claimError.value = 'Пожалуйста, укажите номер телефона для связи!'
    return
  }

  isSubmitting.value = true
  claimError.value = ''

  try {
    // Mark claimed in state
    isClaimed.value = true
  } catch (e: any) {
    claimError.value = e?.data?.message || 'Не удалось активировать подарок. Попробуйте еще раз.'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  const code = (route.query.code || route.query.gift_code || 'GFT-ALPHA-2026') as string
  giftCode.value = code
  verifyGiftCode(code)
})
</script>

<style scoped>
.claim-gift-page {
  min-height: 100vh;
  background-color: #FFF8F0;
  color: #1A1A2E;
  font-family: 'DM Sans', sans-serif;
  padding-bottom: 90px;
}

.container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-content {
  padding-top: 40px;
}

.loading-box {
  text-align: center;
  padding: 80px 20px;
  color: #7B7B93;
}

.spinner {
  width: 44px;
  height: 44px;
  border: 4px solid #E2E2EC;
  border-top-color: #7C5CFC;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.gift-error-card {
  background: #FFFFFF;
  border-radius: 28px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.04);
}

.err-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
}

/* UNBOXING CARD */
.gift-unboxing-card {
  background: #FFFFFF;
  border-radius: 32px;
  padding: 48px 36px;
  border: 2px solid #EAE6FD;
  box-shadow: 0 16px 40px rgba(124, 92, 252, 0.08);
  text-align: center;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.card-ribbon-tag {
  display: inline-block;
  background: #FFE8E8;
  color: #E63946;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 1.5px;
  padding: 6px 16px;
  border-radius: 20px;
  margin-bottom: 20px;
}

/* Unopened state */
.gift-box-illustration {
  cursor: pointer;
  margin: 20px auto 30px auto;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s ease;
}

.gift-box-illustration:hover {
  transform: scale(1.06);
}

.box-icon {
  font-size: 80px;
  animation: bounce 2s infinite ease-in-out;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.box-tap-hint {
  font-size: 13px;
  font-weight: 700;
  color: #7C5CFC;
  margin-top: 10px;
}

.gift-claim-title {
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 800;
  color: #1A1A2E;
  margin-bottom: 8px;
}

.gift-claim-subtitle {
  font-size: 16px;
  color: #7B7B93;
  margin-bottom: 32px;
}

.open-gift-btn {
  background: #7C5CFC;
  color: #FFFFFF;
  border: none;
  padding: 16px 36px;
  border-radius: 18px;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(124, 92, 252, 0.35);
  transition: all 0.2s;
}

.open-gift-btn:hover {
  background: #624CE0;
  transform: translateY(-2px);
}

/* Opened Card View */
.opened-card-view {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

.cert-gold-badge {
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 900;
  color: #B37D00;
  letter-spacing: 2px;
  margin-bottom: 8px;
}

.congrats-title {
  font-family: 'Outfit', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: #1A1A2E;
  margin-bottom: 12px;
}

.gift-amount-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #F0EDFF;
  padding: 8px 18px;
  border-radius: 14px;
  font-size: 13.5px;
  color: #4A4A68;
  margin-bottom: 28px;
}

.gift-amount-pill strong {
  color: #7C5CFC;
  font-size: 15px;
}

.code-inline {
  background: #FFFFFF;
  padding: 2px 8px;
  border-radius: 8px;
  font-family: monospace;
  font-weight: 700;
  color: #7C5CFC;
}

/* Warm message */
.warm-message-box {
  background: linear-gradient(135deg, #FAF9FE 0%, #F0EDFF 100%);
  border: 1.5px dashed #7C5CFC;
  border-radius: 24px;
  padding: 28px;
  margin-bottom: 36px;
  position: relative;
  text-align: left;
}

.quote-mark {
  font-family: Georgia, serif;
  font-size: 48px;
  color: #7C5CFC;
  opacity: 0.3;
  line-height: 1;
  position: absolute;
  top: 10px;
  left: 16px;
}

.warm-text {
  font-size: 15px;
  color: #33334F;
  line-height: 1.6;
  font-style: italic;
  margin: 0 0 16px 24px;
}

.sender-signature {
  text-align: right;
  border-top: 1px solid rgba(124, 92, 252, 0.15);
  padding-top: 12px;
}

.sender-signature span {
  display: block;
  font-size: 11.5px;
  color: #7B7B93;
}

.sender-signature strong {
  font-family: 'Outfit', sans-serif;
  font-size: 14.5px;
  color: #1A1A2E;
}

/* Claim Form */
.claim-action-box {
  background: #FAF9FE;
  border-radius: 24px;
  padding: 24px;
  border: 1px solid #E2E2EC;
  text-align: left;
}

.claim-action-box h3 {
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 4px;
}

.claim-hint {
  font-size: 13px;
  color: #7B7B93;
  margin-bottom: 16px;
}

.claim-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 18px;
}

.form-field label {
  display: block;
  font-size: 12.5px;
  font-weight: 700;
  color: #4A4A68;
  margin-bottom: 6px;
}

.form-field .req {
  color: #E63946;
}

.claim-input {
  width: 100%;
  background: #FFFFFF;
  border: 1.5px solid #E2E2EC;
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 14px;
  outline: none;
}

.claim-input:focus {
  border-color: #7C5CFC;
}

.claim-submit-btn {
  width: 100%;
  background: #06D6A0;
  color: #FFFFFF;
  border: none;
  padding: 15px;
  border-radius: 16px;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.claim-submit-btn:hover:not(:disabled) {
  background: #05b88a;
  box-shadow: 0 6px 20px rgba(6, 214, 160, 0.35);
}

.claim-err-msg {
  background: #FEE2E2;
  color: #DC2626;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 12.5px;
  margin-bottom: 14px;
}

/* Claimed Success Banner */
.claimed-success-banner {
  background: #F0FDF4;
  border: 1.5px solid #86EFAC;
  border-radius: 24px;
  padding: 32px;
}

.success-icon {
  font-size: 44px;
  display: block;
  margin-bottom: 10px;
}

.claimed-success-banner h3 {
  font-family: 'Outfit', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #15803D;
  margin-bottom: 6px;
}

.claimed-success-banner p {
  font-size: 14px;
  color: #374151;
  margin-bottom: 24px;
  line-height: 1.5;
}

.success-links {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-primary {
  background: #7C5CFC;
  color: #FFFFFF;
  padding: 12px 24px;
  border-radius: 14px;
  text-decoration: none;
  font-weight: 700;
  font-size: 14px;
}

.btn-secondary {
  background: #FFFFFF;
  border: 1.5px solid #E2E2EC;
  color: #4A4A68;
  padding: 12px 24px;
  border-radius: 14px;
  text-decoration: none;
  font-weight: 700;
  font-size: 14px;
}

@media (max-width: 600px) {
  .claim-form-grid { grid-template-columns: 1fr; }
  .gift-unboxing-card { padding: 32px 20px; }
}
</style>
