<template>
  <div class="payment-result-page">
    <TheHeader />
    <main class="container page-content">
      <div class="result-card">
        <div class="badge">!</div>
        <h1>{{ t('payment.failureIncompleteTitle') }}</h1>
        <p>
          {{ t('payment.failureIncompleteBody') }}
          <template v-if="orderId">{{ t('payment.failureOrderUnpaid', { orderId }) }}</template>
          {{ t('payment.failureTryAgain') }}
        </p>
        <p v-if="retryError" class="retry-error">{{ retryError }}</p>
        <div class="actions">
          <button
            v-if="canRetryApi"
            type="button"
            class="btn btn--primary"
            :disabled="retrying"
            @click="retryPayment"
          >
            {{ retrying ? t('payment.openingPay') : t('payment.failureRetry') }}
          </button>
          <NuxtLink v-else :to="fallbackPath" class="btn btn--primary">
            {{ fallbackLabel }}
          </NuxtLink>
          <NuxtLink :to="localePath('/profile')" class="btn">{{ t('payment.ctaProfile') }}</NuxtLink>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { PaymentLaunchResponse } from '~/composables/usePaymentLaunch'
import { rotateSubscriptionPayIdempotencyKey } from '~/utils/subscriptionPayIdempotency'

const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()
const { user, isInitialized, fetchUser, openAuthModal, closeAuthModal } = useAuth()
const { payOrder } = useOrders()
const { payRental, extendRental } = useRentals()
const { paySubscription } = useSubscriptions()
const { handlePayResponse } = usePaymentLaunch()

const queryNumber = (key: string) => {
  const raw = route.query[key]
  const n = Number(Array.isArray(raw) ? raw[0] : raw)
  return Number.isFinite(n) && n > 0 ? n : null
}

const queryString = (key: string) => {
  const raw = route.query[key]
  const value = Array.isArray(raw) ? raw[0] : raw
  return typeof value === 'string' && value ? value : ''
}

const orderId = computed(() => queryNumber('order_id'))
const rentalId = computed(() => queryNumber('rental_id'))
const subscriptionId = computed(() => queryNumber('subscription_id'))
const setId = computed(() => queryNumber('set_id'))
const toyId = computed(() => queryNumber('toy_id'))
const extendDays = computed(() => queryNumber('days') || 1)
const flow = computed(() => queryString('flow'))

const canRetryApi = computed(() => {
  if (flow.value === 'shop' || (!flow.value && orderId.value)) return !!orderId.value
  if (flow.value === 'rental') return !!rentalId.value
  if (flow.value === 'rental_extend') return !!rentalId.value
  if (flow.value === 'subscription') return !!subscriptionId.value
  return false
})

const fallbackPath = computed(() => {
  if (flow.value === 'subscription') return localePath('/subscription')
  if (flow.value === 'buyout') {
    return localePath('/subscription')
  }
  if (flow.value === 'rental' || flow.value === 'rental_extend') {
    return rentalId.value
      ? localePath({ path: '/profile', query: { section: 'history', tab: 'rentals' } })
      : localePath('/short-rent')
  }
  if (flow.value === 'gift_card' || flow.value === 'gift_subscription') return localePath('/gifts')
  return localePath('/checkout')
})

const fallbackLabel = computed(() => {
  if (flow.value === 'buyout') return t('payment.fallbackBuyout')
  if (flow.value === 'gift_card' || flow.value === 'gift_subscription') return t('payment.ctaGifts')
  if (flow.value === 'rental_extend') return t('payment.fallbackRentals')
  if (flow.value === 'rental') return t('payment.fallbackRent')
  if (flow.value === 'subscription') return t('payment.ctaSubscription')
  return t('payment.fallbackCheckout')
})

const retrying = ref(false)
const retryError = ref('')

const ensureAuth = async () => {
  if (!isInitialized.value) {
    await fetchUser()
  }
  return !!user.value
}

const retryPayment = async () => {
  if (!canRetryApi.value || retrying.value) return
  retrying.value = true
  retryError.value = ''

  try {
    const authed = await ensureAuth()
    if (!authed) {
      openAuthModal('login')
      retryError.value = t('payment.loginToRetry')
      return
    }
    closeAuthModal()

    let payRes: PaymentLaunchResponse | null = null
    if ((flow.value === 'shop' || (!flow.value && orderId.value)) && orderId.value) {
      payRes = await payOrder(orderId.value, { payment_method: 'card' })
    } else if (flow.value === 'rental' && rentalId.value) {
      payRes = await payRental(rentalId.value, 'card')
    } else if (flow.value === 'rental_extend' && rentalId.value) {
      payRes = await extendRental(rentalId.value, extendDays.value, 'card')
    } else if (flow.value === 'subscription' && subscriptionId.value) {
      payRes = await paySubscription(
        subscriptionId.value,
        'card',
        rotateSubscriptionPayIdempotencyKey(subscriptionId.value),
      )
    }

    if (!payRes) {
      retryError.value = t('payment.retryFromCheckout')
      return
    }

    await handlePayResponse(payRes, {
      onFulfilled: async (paid) => {
        const q = new URLSearchParams()
        if (orderId.value) q.set('order_id', String(orderId.value))
        if (paid.payment?.payment_number) q.set('payment', paid.payment.payment_number)
        if (flow.value) q.set('flow', flow.value)
        await navigateSameOrigin(`/payment/success?${q.toString()}`)
      },
    })
  } catch (e: any) {
    retryError.value = e?.data?.message
      || e?.data?.errors?.order?.[0]
      || e?.message
      || 'Не удалось повторить оплату.'
  } finally {
    retrying.value = false
  }
}
</script>

<style scoped>
.payment-result-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f7f4ef 0%, #fff 45%);
}
.page-content {
  padding: 48px 16px 80px;
  display: flex;
  justify-content: center;
}
.result-card {
  width: min(520px, 100%);
  background: #fff;
  border: 1px solid rgba(63, 103, 87, 0.12);
  border-radius: 20px;
  padding: 36px 28px;
  text-align: center;
  box-shadow: 0 12px 40px rgba(40, 50, 40, 0.06);
}
h1 {
  font-size: 1.5rem;
  margin: 16px 0 8px;
  color: #24352e;
}
p {
  color: #5b6b63;
  line-height: 1.5;
  margin: 0 0 24px;
}
.retry-error {
  color: #b42318 !important;
  margin-top: -12px !important;
}
.badge {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: 700;
  background: #fdeceb;
  color: #b42318;
  margin: 0 auto;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 18px;
  border-radius: 12px;
  border: 1px solid rgba(63, 103, 87, 0.2);
  color: var(--green-ink);
  text-decoration: none;
  background: #fff;
  cursor: pointer;
  font: inherit;
}
.btn--primary {
  background: var(--green-surface);
  border-color: var(--green-ink);
  color: var(--green-ink);
}
.btn:disabled {
  opacity: 0.6;
  cursor: wait;
}
</style>
