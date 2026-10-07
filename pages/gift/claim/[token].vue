<template>
  <div class="gift-claim-page">
    <TheHeader />
    <main class="container page-content claim-container">
      
      <div v-if="pending" class="loading-state">
        <AppSpinner size="48" />
        <p>{{ t('gifts.tokenClaim.loading') }}</p>
      </div>

      <div v-else-if="errorMessage || !gift" class="error-state">
        <h2>{{ t('gifts.tokenClaim.notFoundTitle') }}</h2>
        <p>{{ errorMessage || t('gifts.tokenClaim.notFoundDefault') }}</p>
        <NuxtLink :to="localePath('/')" class="btn btn-primary mt-4">{{ t('gifts.claim.home') }}</NuxtLink>
      </div>

      <div v-else-if="gift.status === 'claimed_by_other'" class="claimed-state">
        <div class="icon-wrap">🔒</div>
        <h2>{{ t('gifts.tokenClaim.claimedOtherTitle') }}</h2>
        <p>{{ gift.message || t('gifts.tokenClaim.claimedOtherDefault') }}</p>
        <NuxtLink :to="localePath('/shop')" class="btn btn-primary mt-4">{{ t('gifts.tokenClaim.toCatalog') }}</NuxtLink>
      </div>

      <div v-else-if="gift.status === 'expired'" class="claimed-state">
        <div class="icon-wrap">⏳</div>
        <h2>{{ t('gifts.tokenClaim.expiredTitle') }}</h2>
        <p>
          {{ gift.message_blocked || t('gifts.tokenClaim.expiredDefault') }}
        </p>
        <p v-if="gift.activation_deadline?.local_label" class="subtitle mt-2">
          {{ t('gifts.tokenClaim.deadlineWas', { date: gift.activation_deadline.local_label }) }}
        </p>
        <a href="mailto:support@alpha.kz" class="btn btn-primary mt-4">{{ t('gifts.tokenClaim.support') }}</a>
      </div>

      <div v-else-if="gift.status === 'claimed'" class="claimed-state">
        <div class="icon-wrap">🎁</div>
        <h2>{{ t('gifts.tokenClaim.claimedTitle') }}</h2>
        <p>{{ gift.is_claimed_by_you ? t('gifts.tokenClaim.claimedYou') : t('gifts.tokenClaim.claimedOther') }}</p>
        <p v-if="gift.delivery?.address" class="subtitle mt-2">
          {{ t('gifts.tokenClaim.deliveryAddress', { address: gift.delivery.address }) }}
        </p>
        <NuxtLink :to="localePath({ path: '/profile', query: { section: 'history', tab: 'gifts' } })" class="btn btn-primary mt-4">{{ t('gifts.tokenClaim.toProfile') }}</NuxtLink>
      </div>

      <div v-else-if="success" class="success-state">
        <div class="icon-wrap">🚚</div>
        <h2>{{ t('gifts.tokenClaim.successTitle') }}</h2>
        <p>{{ t('gifts.tokenClaim.successDesc') }}</p>
        <NuxtLink :to="localePath({ path: '/profile', query: { section: 'history', tab: 'gifts' } })" class="btn btn-primary mt-6">{{ t('gifts.tokenClaim.toProfileLink') }}</NuxtLink>
      </div>

      <div v-else-if="gift.type === 'subscription'" class="claimed-state">
        <div class="icon-wrap">📦</div>
        <h2>{{ t('gifts.tokenClaim.subTitle') }}</h2>
        <p>
          {{ t('gifts.tokenClaim.subFrom', { name: gift.sender_name || t('gifts.defaults.senderPerson') }) }}
          {{ t('gifts.tokenClaim.subPlan', { plan: gift.plan || t('gifts.tokenClaim.planStandard'), months: gift.duration_months }) }}
        </p>
        <div class="gift-message" v-if="gift.message">"{{ gift.message }}"</div>
        <NuxtLink
          :to="subscriptionActivationTo"
          class="btn btn-primary mt-4"
        >
          {{ t('gifts.tokenClaim.activateSub') }}
        </NuxtLink>
      </div>

      <div v-else-if="gift.type === 'voucher'" class="claimed-state">
        <div class="icon-wrap">🎟️</div>
        <h2>{{ t('gifts.tokenClaim.voucherTitle') }}</h2>
        <p>
          {{ t('gifts.tokenClaim.voucherFrom', { name: gift.sender_name || t('gifts.defaults.senderPerson') }) }}
          {{ t('gifts.tokenClaim.voucherNominal', { amount: formatPrice(Number(gift.initial_amount || 0)) }) }}
        </p>
        <div class="gift-message" v-if="gift.message">"{{ gift.message }}"</div>
        <div class="error-actions mt-4">
          <NuxtLink :to="localePath({ path: '/cart', query: { gift_code: cleanToken } })" class="btn btn-primary">
            {{ t('gifts.tokenClaim.useInCart') }}
          </NuxtLink>
          <NuxtLink :to="localePath({ path: '/gifts/claim', query: { code: cleanToken } })" class="btn btn-secondary">
            {{ t('gifts.tokenClaim.openCert') }}
          </NuxtLink>
        </div>
      </div>

      <div v-else-if="unwrapped && !user" class="unwrapped-state fade-in text-center">
        <h2>{{ t('gifts.tokenClaim.loginTitle') }}</h2>
        <p class="subtitle mt-2">{{ t('gifts.tokenClaim.loginDesc') }}</p>
        <button type="button" class="btn btn-primary mt-6" @click="handleOpenAuth">
          {{ t('gifts.tokenClaim.loginCta') }}
        </button>
      </div>

      <div v-else-if="unwrapped" class="unwrapped-state fade-in">
        <div class="gift-details text-center">
          <h2>{{ t('gifts.tokenClaim.giftFrom', { name: gift.sender_name || t('gifts.defaults.senderSomeone') }) }}</h2>
          <div class="gift-message" v-if="gift.message">
            "{{ gift.message }}"
          </div>

          <div class="gift-contents mt-6" v-if="gift.items && gift.items.length">
            <div v-for="(item, idx) in gift.items" :key="idx" class="gift-item">
              <img v-if="item.image" :src="item.image" :alt="t('gifts.tokenClaim.toyAlt')" class="item-img" />
              <div class="item-icon" v-else>🧸</div>
              <span>{{ item.name }}</span>
            </div>
          </div>
        </div>

        <div class="address-form-box mt-8">
          <h3>{{ t('gifts.tokenClaim.deliveryHeading') }}</h3>
          <p class="form-hint">{{ t('gifts.tokenClaim.deliveryHint') }}</p>
          
          <div v-if="submitError" class="submit-error-banner mt-4">
            {{ submitError }}
          </div>

          <form @submit.prevent="submitClaim" class="claim-form mt-4">
            <div class="form-group">
              <label>{{ t('gifts.tokenClaim.yourName') }}</label>
              <input type="text" v-model="form.name" required class="form-input" :placeholder="t('checkout.placeholders.name')" />
            </div>
            
            <div class="form-group">
              <label>{{ t('gifts.tokenClaim.phone') }}</label>
              <input
                type="tel"
                :value="form.phone"
                required
                class="form-input"
                :placeholder="t('checkout.placeholders.recipientPhone')"
                maxlength="18"
                autocomplete="tel"
                @input="onPhoneInput"
                @paste="onPhonePaste"
              />
            </div>

            <div class="form-group">
              <label>{{ t('gifts.tokenClaim.address') }}</label>
              <textarea v-model="form.address" required class="form-input" rows="2" :placeholder="t('checkout.placeholders.addressFull')"></textarea>
            </div>

            <div class="form-group">
              <label>{{ t('gifts.tokenClaim.comment') }}</label>
              <input type="text" v-model="form.comment" class="form-input" :placeholder="t('checkout.placeholders.courierComment')" />
            </div>

            <button type="submit" class="btn btn-primary w-full mt-6" :disabled="submitting">
              <AppSpinner v-if="submitting" size="20" class="mr-2" />
              {{ submitting ? t('gifts.tokenClaim.submitting') : t('gifts.tokenClaim.confirm') }}
            </button>
          </form>
        </div>
      </div>

      <div v-else class="wrapped-state text-center">
        <h1>{{ t('gifts.tokenClaim.wrappedTitle') }}</h1>
        <p class="subtitle mt-2">{{ t('gifts.tokenClaim.wrappedHint') }}</p>
        
        <div class="present-box" @click="unwrapGift">
          <div class="box-lid"></div>
          <div class="box-body">
            <div class="ribbon-vertical"></div>
            <div class="ribbon-horizontal"></div>
          </div>
        </div>
      </div>

    </main>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '~/composables/useApi'
import { useAuth } from '~/composables/useAuth'

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const router = useRouter()
const rawToken = route.params.token
const cleanToken = computed(() => {
  const raw = Array.isArray(rawToken) ? rawToken[0] : (rawToken as string || '')
  return decodeURIComponent(raw).trim()
})

const subscriptionActivationTo = computed(() => {
  if (gift.value?.activation_path) {
    return gift.value.activation_path as string
  }
  return localePath({ path: '/subscription', query: { gift_code: cleanToken.value } })
})

const { request } = useApi()
const { user, openAuthModal } = useAuth()

const pending = ref(true)
const errorMessage = ref('')
const submitError = ref('')
const gift = ref<any>(null)
const unwrapped = ref(false)
const success = ref(false)
const submitting = ref(false)

const form = reactive({
  name: '',
  phone: '',
  address: '',
  comment: '',
})

const onPhoneInput = (event: Event) => {
  handlePhoneInput(event, (val) => { form.phone = val })
}

const onPhonePaste = (event: ClipboardEvent) => {
  handlePhonePaste(event, (val) => { form.phone = val })
}

const formatPrice = (val: number) => {
  if (!val && val !== 0) return '0'
  return Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

const prefillForm = () => {
  if (!user.value) return
  if (!form.name) form.name = user.value.name || ''
  if (!form.phone) form.phone = formatKazakhstanPhone(user.value.phone || '')
  if (!form.address) form.address = user.value.address || ''
}

const loadGiftDetails = async () => {
  if (!cleanToken.value) {
    errorMessage.value = t('gifts.tokenClaim.tokenMissing')
    pending.value = false
    return
  }

  pending.value = true
  errorMessage.value = ''

  try {
    const res = await request<any>(`/gifts/claim/${encodeURIComponent(cleanToken.value)}`)
    gift.value = res?.data || res
  } catch (err: any) {
    const data = err?.data ?? err?.response?._data
    errorMessage.value = data?.message || err?.message || t('gifts.tokenClaim.loadFailed')
    gift.value = null
  } finally {
    pending.value = false
  }
}

onMounted(async () => {
  if (import.meta.client) {
    const saved = sessionStorage.getItem(`unwrapped_gift_${cleanToken.value}`)
    if (saved === '1') {
      unwrapped.value = true
    }
  }

  await loadGiftDetails()
  if (user.value) {
    prefillForm()
  }
})

watch(user, async (newUser) => {
  if (newUser) {
    prefillForm()
    await loadGiftDetails()
  }
})

const handleOpenAuth = () => {
  if (import.meta.client) {
    sessionStorage.setItem('pending_gift_claim_token', cleanToken.value)
    sessionStorage.setItem(`unwrapped_gift_${cleanToken.value}`, '1')
  }
  openAuthModal('login')
}

const unwrapGift = () => {
  setTimeout(() => {
    unwrapped.value = true
    if (import.meta.client) {
      sessionStorage.setItem(`unwrapped_gift_${cleanToken.value}`, '1')
      sessionStorage.setItem('pending_gift_claim_token', cleanToken.value)
    }

    if (!user.value) {
      openAuthModal('login')
    } else {
      prefillForm()
    }
  }, 350)
}

const submitClaim = async () => {
  if (!user.value) {
    handleOpenAuth()
    return
  }

  if (submitting.value) return

  submitting.value = true
  submitError.value = ''

  try {
    await request(`/gifts/claim/${encodeURIComponent(cleanToken.value)}`, {
      method: 'POST',
      body: {
        name: form.name,
        phone: form.phone,
        address: form.address,
        comment: form.comment || undefined,
      },
    })
    success.value = true
    if (import.meta.client) {
      sessionStorage.removeItem(`unwrapped_gift_${cleanToken.value}`)
      sessionStorage.removeItem('pending_gift_claim_token')
    }
    setTimeout(() => {
      router.push(localePath({ path: '/profile', query: { section: 'history', tab: 'gifts' } }))
    }, 2000)
  } catch (err: any) {
    const data = err?.data ?? err?.response?._data
    if (err?.statusCode === 401 || err?.status === 401) {
      handleOpenAuth()
      return
    }
    submitError.value = data?.message || data?.errors?.token?.[0] || t('gifts.tokenClaim.submitFailed')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.claim-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.text-center { text-align: center; }
.mt-2 { margin-top: 0.5rem; }
.mt-4 { margin-top: 1rem; }
.mt-6 { margin-top: 1.5rem; }
.mt-8 { margin-top: 2rem; }
.w-full { width: 100%; }

.icon-wrap {
  font-size: 64px;
  margin-bottom: 20px;
}

.subtitle {
  color: #666;
}

.form-hint {
  margin: 0.5rem 0 0;
  color: #666;
  font-size: 0.9rem;
}

.address-form-box {
  background: var(--surface-color, #fff);
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}
.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}
.form-input:focus {
  border-color: var(--primary-color, #0056b3);
  outline: none;
}

.gift-message {
  font-style: italic;
  color: #666;
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  margin-top: 15px;
}
.gift-contents {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}
.gift-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  padding: 10px 15px;
  border-radius: 50px;
  border: 1px solid #eee;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
}
.item-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}
.item-icon {
  font-size: 24px;
}

.present-box {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 60px auto 0;
  cursor: pointer;
  transition: transform 0.2s;
}
.present-box:hover {
  transform: scale(1.05);
}
.box-lid {
  position: absolute;
  top: 0;
  left: -10px;
  width: 220px;
  height: 40px;
  background: #ff4757;
  border-radius: 4px;
  z-index: 2;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}
.box-body {
  position: absolute;
  top: 40px;
  left: 0;
  width: 200px;
  height: 160px;
  background: #ff6b81;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
}
.ribbon-vertical {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 100%;
  background: #f1c40f;
}
.ribbon-horizontal {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  width: 100%;
  height: 30px;
  background: #f1c40f;
}

.fade-in {
  animation: fadeIn 0.8s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.submit-error-banner {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.95rem;
}
</style>
