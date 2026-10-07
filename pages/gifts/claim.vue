<template>
  <div class="claim-gift-page">
    <TheHeader />

    <main class="container page-content">
      <div v-if="isLoading" class="loading-box">
        <div class="spinner"></div>
        <p>{{ t('gifts.claim.loading') }}</p>
      </div>

      <div v-else-if="isMissingCode" class="gift-error-card">
        <AppIcon name="gift" :size="40" class="err-icon" />
        <h2>{{ t('gifts.claim.missingCodeTitle') }}</h2>
        <p>{{ t('gifts.claim.missingCodeDesc') }}</p>
        <div class="error-actions">
          <NuxtLink :to="localePath('/cart')" class="btn-primary">{{ t('gifts.claim.toCart') }}</NuxtLink>
          <NuxtLink :to="localePath('/gifts')" class="btn-secondary">{{ t('gifts.claim.buyCert') }}</NuxtLink>
        </div>
      </div>

      <div v-else-if="isAlreadyUsed" class="gift-already-used-card">
        <div class="used-badge-icon"><AppIcon name="shield" :size="32" /></div>
        <h2 class="used-title">{{ t('gifts.claim.usedTitle') }}</h2>
        <p class="used-desc">
          {{ t('gifts.claim.usedDesc', { code: giftCode }) }}
          <template v-if="giftData?.activated_at">{{ t('gifts.claim.usedAt', { date: giftData.activated_at }) }}</template>.
        </p>
        <div class="used-actions">
          <NuxtLink :to="localePath('/shop')" class="btn-primary">{{ t('gifts.claim.toShop') }}</NuxtLink>
          <NuxtLink :to="localePath({ path: '/gifts', query: { tab: 'voucher' } })" class="btn-secondary">{{ t('gifts.claim.buyNew') }}</NuxtLink>
        </div>
      </div>

      <div v-else-if="isActivationExpired" class="gift-error-card">
        <AppIcon name="alert" :size="40" class="err-icon" />
        <h2>{{ t('gifts.claim.expiredTitle') }}</h2>
        <p>{{ errorMessage || t('gifts.claim.expiredDefault') }}</p>
        <p v-if="activationDeadlineLabel" class="used-desc">{{ t('gifts.claim.deadlineWas', { date: activationDeadlineLabel }) }}</p>
        <div class="error-actions">
          <a href="mailto:support@alpha.kz" class="btn-primary">{{ t('gifts.claim.contactSupport') }}</a>
          <NuxtLink :to="localePath('/')" class="btn-secondary">{{ t('gifts.claim.home') }}</NuxtLink>
        </div>
      </div>

      <div v-else-if="errorMessage && !giftData" class="gift-error-card">
        <AppIcon name="alert" :size="40" class="err-icon" />
        <h2>{{ t('gifts.claim.notFoundTitle') }}</h2>
        <p>{{ errorMessage }}</p>
        <div class="error-actions">
          <NuxtLink :to="localePath('/gifts')" class="btn-primary">{{ t('gifts.claim.buyNewCert') }}</NuxtLink>
          <NuxtLink :to="localePath('/')" class="btn-secondary">{{ t('gifts.claim.home') }}</NuxtLink>
        </div>
      </div>

      <div v-else class="unboxing-container">
        <div class="gift-unboxing-card" :class="{ 'is-opened': isCardOpened }">
          <div class="card-ribbon-tag"><AppIcon name="gift" :size="14" class="inline-icon" /> {{ t('gifts.claim.ribbon') }}</div>

          <div v-if="!isCardOpened" class="unopened-box-view">
            <div class="gift-box-illustration" @click="handleOpenClick">
              <AppIcon name="gift" :size="48" class="box-icon" />
              <span class="box-tap-hint">{{ t('gifts.claim.tapHint') }}</span>
            </div>

            <h1 class="gift-claim-title">{{ t('gifts.claim.sentTitle') }}</h1>
            <p class="gift-claim-subtitle">
              {{ t('gifts.claim.from') }} <strong>{{ giftData?.sender_name || t('gifts.defaults.senderClose') }}</strong>
            </p>

            <button class="open-gift-btn" @click="handleOpenClick">
              {{ t('gifts.claim.unwrap') }}
            </button>
          </div>

          <div v-else class="opened-card-view">
            <div class="cert-gold-badge">{{ t('gifts.claim.voucherBadge') }}</div>

            <h1 class="congrats-title">
              {{ t('gifts.claim.certFor', { name: giftData?.recipient_name || t('gifts.claim.certForYou') }) }}
            </h1>

            <div class="gift-amount-pill">
              <span>{{ t('gifts.claim.nominal') }} <strong>{{ formatPrice(Number(giftData?.initial_amount || 0)) }} ₸</strong></span>
              <span class="dot">•</span>
              <span>{{ t('gifts.claim.balance') }} <strong>{{ formatPrice(Number(giftData?.balance || 0)) }} ₸</strong></span>
            </div>
            <div class="gift-amount-pill" style="margin-top: 0.5rem;">
              <span>{{ t('gifts.claim.code') }} <code class="code-inline">{{ giftCode }}</code></span>
              <span v-if="activationDeadlineLabel" class="dot">•</span>
              <span v-if="activationDeadlineLabel">{{ t('gifts.claim.activateBy', { date: activationDeadlineLabel }) }}</span>
              <span v-else-if="giftData?.expires_at" class="dot">•</span>
              <span v-else-if="giftData?.expires_at">{{ t('gifts.claim.balanceUntil', { date: giftData.expires_at }) }}</span>
            </div>

            <div class="warm-message-box">
              <span class="quote-mark">“</span>
              <p class="warm-text">
                {{ giftData?.message || t('gifts.defaults.claimMessage') }}
              </p>
              <div class="sender-signature">
                <span>{{ t('gifts.claim.withLove') }}</span>
                <strong>{{ giftData?.sender_name || t('gifts.defaults.senderRelatives') }}</strong>
              </div>
            </div>

            <div class="claim-action-box">
              <h3>{{ t('gifts.claim.howToUse') }}</h3>
              <p class="claim-hint">
                {{ t('gifts.claim.howToUseHint', { code: giftCode }) }}
              </p>

              <div class="claim-form-authenticated">
                <button class="claim-submit-btn" @click="copyCode">
                  {{ isCopied ? t('gifts.claim.codeCopied') : t('gifts.claim.copyCode') }}
                </button>
                <NuxtLink :to="localePath(cartLink)" class="claim-submit-btn" style="display: block; text-align: center; text-decoration: none; margin-top: 0.75rem;">
                  {{ t('gifts.claim.useInCart') }}
                </NuxtLink>
                <NuxtLink :to="localePath('/shop')" class="btn-secondary" style="display: block; text-align: center; margin-top: 0.75rem;">
                  {{ t('gifts.claim.browseFirst') }}
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

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { verifyGiftCard } = useGifts()

const giftCode = ref('')
const isLoading = ref(true)
const isMissingCode = ref(false)
const errorMessage = ref('')
const giftData = ref<any>(null)
const isCardOpened = ref(false)
const isAlreadyUsed = ref(false)
const isActivationExpired = ref(false)
const isCopied = ref(false)

const activationDeadlineLabel = computed(() => {
  return giftData.value?.activation_deadline?.local_label
    || giftData.value?.activation_deadline?.local
    || null
})

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
  isActivationExpired.value = false

  try {
    const res = await verifyGiftCard(code)
    if (res?.data) {
      giftData.value = res.data
      const balance = Number(res.data.balance ?? 0)
      if (res.data.status === 'used' || res.data.status === 'used_by_other' || balance <= 0 || res.is_valid === false) {
        isAlreadyUsed.value = true
      }
    } else if (res?.is_valid === false) {
      errorMessage.value = res.message || t('gifts.claim.invalidCert')
    }
  } catch (e: any) {
    if (e?.data?.status === 'already_used' || e?.data?.data?.status === 'used' || e?.data?.data?.status === 'used_by_other') {
      isAlreadyUsed.value = true
      giftData.value = e?.data?.data || { code, status: 'used', balance: 0 }
    } else if (e?.data?.status === 'activation_expired') {
      isActivationExpired.value = true
      errorMessage.value = e?.data?.message || t('gifts.claim.activationExpired')
      giftData.value = {
        activation_deadline: e?.data?.activation_deadline,
      }
    } else {
      errorMessage.value = e?.data?.message || t('gifts.claim.notFoundOrExpired')
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  let rawCode = (route.query.code || route.query.gift_code || route.query.token || (route.params as any)?.token) as string | undefined
  if (!rawCode && route.path.startsWith('/gifts/claim/')) {
    const sub = route.path.replace(/^\/gifts\/claim\//, '').split('/')[0]?.trim()
    if (sub) rawCode = decodeURIComponent(sub)
  }
  const code = rawCode?.trim()

  if (!code) {
    isMissingCode.value = true
    isLoading.value = false
    return
  }

  const upper = code.toUpperCase()
  if (upper.startsWith('GSUB-')) {
    await navigateTo(localePath({ path: '/subscription', query: { gift_code: upper } }))
    return
  }

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(code)
  if (isUuid || (!upper.startsWith('GFT-') && code.length > 20)) {
    await navigateTo(localePath(`/gift/claim/${encodeURIComponent(code)}`))
    return
  }

  giftCode.value = upper
  await verifyGiftCode(upper)
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
  border-top-color: var(--green-ink);
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
  background: var(--green-surface);
  color: var(--green-ink);
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
  color: var(--green-ink);
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
  color: var(--green-ink);
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
.quote-mark { font-size: 32px; color: var(--green-ink); line-height: 1; }
.warm-text { margin: 0; font-style: italic; color: #444; }
.sender-signature { margin-top: 12px; color: #666; font-size: 0.9rem; }
.claim-action-box { margin-top: 24px; text-align: left; max-width: 480px; margin-left: auto; margin-right: auto; }
.claim-hint { color: #666; font-size: 0.95rem; }
.used-badge-icon { color: var(--green-ink); margin-bottom: 12px; }
.used-title { margin: 0 0 8px; }
.used-desc { color: #555; }
.inline-icon { vertical-align: middle; }
</style>
