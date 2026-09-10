<template>
  <div class="claim-gift-page">
    <TheHeader />

    <main class="container page-content">
      <div v-if="isLoading" class="loading-box">
        <div class="spinner"></div>
        <p>Открываем ваш подарок...</p>
      </div>

      <div v-else-if="isMissingCode" class="gift-error-card">
        <AppIcon name="gift" :size="40" class="err-icon" />
        <h2>Код подарка не указан</h2>
        <p>Откройте ссылку из сообщения дарителя или введите код GFT в корзине при оплате.</p>
        <div class="error-actions">
          <NuxtLink to="/cart" class="btn-primary">Перейти в корзину</NuxtLink>
          <NuxtLink to="/gifts" class="btn-secondary">Подарить сертификат</NuxtLink>
        </div>
      </div>

      <div v-else-if="isAlreadyUsed" class="gift-already-used-card">
        <div class="used-badge-icon"><AppIcon name="shield" :size="32" /></div>
        <h2 class="used-title">Баланс сертификата исчерпан</h2>
        <p class="used-desc">
          Код <code class="code-inline">{{ giftCode }}</code> уже полностью использован
          <template v-if="giftData?.activated_at"> ({{ giftData.activated_at }})</template>.
        </p>
        <div class="used-actions">
          <NuxtLink to="/shop" class="btn-primary">В каталог игрушек →</NuxtLink>
          <NuxtLink to="/gifts?tab=voucher" class="btn-secondary">Купить новый сертификат</NuxtLink>
        </div>
      </div>

      <div v-else-if="errorMessage && !giftData" class="gift-error-card">
        <AppIcon name="alert" :size="40" class="err-icon" />
        <h2>Подарок не найден</h2>
        <p>{{ errorMessage }}</p>
        <div class="error-actions">
          <NuxtLink to="/gifts" class="btn-primary">Подарить новый сертификат</NuxtLink>
          <NuxtLink to="/" class="btn-secondary">На главную</NuxtLink>
        </div>
      </div>

      <div v-else class="unboxing-container">
        <div class="gift-unboxing-card" :class="{ 'is-opened': isCardOpened }">
          <div class="card-ribbon-tag"><AppIcon name="gift" :size="14" class="inline-icon" /> ДЕНЕЖНЫЙ СЕРТИФИКАТ</div>

          <div v-if="!isCardOpened" class="unopened-box-view">
            <div class="gift-box-illustration" @click="handleOpenClick">
              <AppIcon name="gift" :size="48" class="box-icon" />
              <span class="box-tap-hint">Нажмите, чтобы открыть открытку</span>
            </div>

            <h1 class="gift-claim-title">Вам отправили сертификат Alpha!</h1>
            <p class="gift-claim-subtitle">
              От: <strong>{{ giftData?.sender_name || 'Близких людей' }}</strong>
            </p>

            <button class="open-gift-btn" @click="handleOpenClick">
              Распаковать подарок
            </button>
          </div>

          <div v-else class="opened-card-view">
            <div class="cert-gold-badge">★ ALPHA GIFT VOUCHER ★</div>

            <h1 class="congrats-title">
              Сертификат для {{ giftData?.recipient_name || 'вас' }}!
            </h1>

            <div class="gift-amount-pill">
              <span>Номинал: <strong>{{ formatPrice(Number(giftData?.initial_amount || 0)) }} ₸</strong></span>
              <span class="dot">•</span>
              <span>Остаток: <strong>{{ formatPrice(Number(giftData?.balance || 0)) }} ₸</strong></span>
            </div>
            <div class="gift-amount-pill" style="margin-top: 0.5rem;">
              <span>Код: <code class="code-inline">{{ giftCode }}</code></span>
              <span v-if="giftData?.expires_at" class="dot">•</span>
              <span v-if="giftData?.expires_at">до {{ giftData.expires_at }}</span>
            </div>

            <div class="warm-message-box">
              <span class="quote-mark">“</span>
              <p class="warm-text">
                {{ giftData?.message || 'Пусть этот сертификат порадует вас в магазине Alpha!' }}
              </p>
              <div class="sender-signature">
                <span>С любовью,</span>
                <strong>{{ giftData?.sender_name || 'Ваши близкие' }}</strong>
              </div>
            </div>

            <div class="claim-action-box">
              <h3>Как использовать</h3>
              <p class="claim-hint">
                Добавьте игрушки или набор в корзину и примените код
                <code class="code-inline">{{ giftCode }}</code>
                при оплате. Можно списать часть суммы — остаток сохранится.
              </p>

              <div class="claim-form-authenticated">
                <button class="claim-submit-btn" @click="copyCode">
                  {{ isCopied ? '✓ Код скопирован' : 'Скопировать код' }}
                </button>
                <NuxtLink :to="cartLink" class="claim-submit-btn" style="display: block; text-align: center; text-decoration: none; margin-top: 0.75rem;">
                  Использовать в корзине →
                </NuxtLink>
                <NuxtLink to="/shop" class="btn-secondary" style="display: block; text-align: center; margin-top: 0.75rem;">
                  Сначала в каталог
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TheHeader from '~/components/TheHeader.vue'

const route = useRoute()
const { verifyGiftCard } = useGifts()

const giftCode = ref('')
const isLoading = ref(true)
const isMissingCode = ref(false)
const errorMessage = ref('')
const giftData = ref<any>(null)
const isCardOpened = ref(false)
const isAlreadyUsed = ref(false)
const isCopied = ref(false)

const cartLink = computed(() => ({
  path: '/cart',
  query: { gift_code: giftCode.value },
}))

const handleOpenClick = () => {
  isCardOpened.value = true
}

const formatPrice = (val: number) => {
  if (!val && val !== 0) return '0'
  return Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(giftCode.value)
    isCopied.value = true
    setTimeout(() => { isCopied.value = false }, 2500)
  } catch {
    // ignore
  }
}

const verifyGiftCode = async (code: string) => {
  isLoading.value = true
  errorMessage.value = ''
  isAlreadyUsed.value = false

  try {
    const res = await verifyGiftCard(code)
    if (res?.data) {
      giftData.value = res.data
      const balance = Number(res.data.balance ?? 0)
      if (res.data.status === 'used' || balance <= 0 || res.is_valid === false) {
        isAlreadyUsed.value = true
      }
    } else if (res?.is_valid === false) {
      errorMessage.value = res.message || 'Сертификат недействителен.'
    }
  } catch (e: any) {
    if (e?.data?.status === 'already_used' || e?.data?.data?.status === 'used') {
      isAlreadyUsed.value = true
      giftData.value = e?.data?.data || { code, status: 'used', balance: 0 }
    } else {
      errorMessage.value = e?.data?.message || 'Подарочный сертификат не найден или срок его действия истёк.'
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  const rawCode = (route.query.code || route.query.gift_code) as string | undefined
  const code = rawCode?.trim().toUpperCase()

  if (!code) {
    isMissingCode.value = true
    isLoading.value = false
    return
  }

  if (code.startsWith('GSUB-')) {
    await navigateTo(`/subscription?gift_code=${encodeURIComponent(code)}`)
    return
  }

  giftCode.value = code
  await verifyGiftCode(code)
})
</script>

<style scoped>
.claim-gift-page {
  min-height: 100vh;
  background-color: #FAF8F4;
  color: #262626;
  font-family: 'Manrope', sans-serif;
  padding-bottom: 90px;
}

.container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 16px;
}

.loading-box,
.gift-error-card,
.gift-already-used-card {
  text-align: center;
  padding: 48px 24px;
  background: #fff;
  border-radius: 16px;
  margin-top: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #eee;
  border-top-color: #3F6757;
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.err-icon { color: #b45309; margin-bottom: 12px; }
.error-actions, .used-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 20px;
}

.btn-primary, .btn-secondary, .claim-submit-btn, .open-gift-btn, .auth-prompt-btn {
  display: inline-block;
  padding: 12px 20px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.btn-primary, .claim-submit-btn, .open-gift-btn {
  background: #3F6757;
  color: #fff;
}

.btn-secondary {
  background: #eee;
  color: #333;
  text-decoration: none;
}

.gift-unboxing-card {
  background: #fff;
  border-radius: 20px;
  padding: 28px 20px 36px;
  margin-top: 24px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.06);
}

.card-ribbon-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #3F6757;
  margin-bottom: 20px;
}

.unopened-box-view, .opened-card-view { text-align: center; }
.gift-box-illustration {
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
  background: #f3f6f4;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #3F6757;
}
.box-tap-hint { font-size: 11px; margin-top: 8px; color: #666; }
.gift-claim-title, .congrats-title { font-size: 1.5rem; margin: 0 0 8px; }
.gift-claim-subtitle { color: #666; }
.cert-gold-badge { color: #b45309; font-weight: 700; margin-bottom: 12px; }
.gift-amount-pill {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  background: #f3f6f4;
  padding: 10px 14px;
  border-radius: 999px;
  font-size: 0.95rem;
}
.dot { opacity: 0.5; }
.code-inline {
  font-family: ui-monospace, monospace;
  background: #eee;
  padding: 2px 6px;
  border-radius: 4px;
}
.warm-message-box {
  margin: 24px auto;
  max-width: 480px;
  background: #faf8f4;
  border-radius: 12px;
  padding: 20px;
  text-align: left;
}
.quote-mark { font-size: 32px; color: #3F6757; line-height: 1; }
.warm-text { margin: 0; font-style: italic; color: #444; }
.sender-signature { margin-top: 12px; color: #666; font-size: 0.9rem; }
.claim-action-box { margin-top: 24px; text-align: left; max-width: 480px; margin-left: auto; margin-right: auto; }
.claim-hint { color: #666; font-size: 0.95rem; }
.used-badge-icon { color: #3F6757; margin-bottom: 12px; }
.used-title { margin: 0 0 8px; }
.used-desc { color: #555; }
.inline-icon { vertical-align: middle; }
</style>
