<template>
  <div class="payment-result-page">
    <TheHeader />
    <main class="container page-content">
      <div class="result-card">
        <div class="badge">!</div>
        <h1>Оплата не завершена</h1>
        <p>
          Платёж отменён или не прошёл. Заказ
          <template v-if="orderId"> №{{ orderId }} </template>
          остаётся неоплаченным — можно попробовать снова.
        </p>
        <p v-if="retryError" class="retry-error">{{ retryError }}</p>
        <div class="actions">
          <button
            v-if="orderId"
            type="button"
            class="btn btn--primary"
            :disabled="retrying"
            @click="retryPayment"
          >
            {{ retrying ? 'Открываем оплату…' : 'Повторить оплату' }}
          </button>
          <NuxtLink v-else to="/checkout" class="btn btn--primary">К оформлению</NuxtLink>
          <NuxtLink to="/cabinet" class="btn">В кабинет</NuxtLink>
          <NuxtLink to="/shop" class="btn">В магазин</NuxtLink>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { user, isInitialized, fetchUser, openAuthModal, closeAuthModal } = useAuth()
const { payOrder } = useOrders()
const { launchEpay } = useEpay()

const orderId = computed(() => {
  const raw = route.query.order_id
  const n = Number(Array.isArray(raw) ? raw[0] : raw)
  return Number.isFinite(n) && n > 0 ? n : null
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
  if (!orderId.value || retrying.value) return
  retrying.value = true
  retryError.value = ''

  try {
    const authed = await ensureAuth()
    if (!authed) {
      openAuthModal('login')
      retryError.value = 'Войдите в аккаунт, чтобы повторить оплату.'
      return
    }
    closeAuthModal()

    const payRes = await payOrder(orderId.value, { payment_method: 'card' })

    if (payRes?.fulfilled) {
      await navigateSameOrigin(`/payment/success?order_id=${orderId.value}`)
      return
    }

    if (payRes?.demo?.payment_url) {
      await navigateSameOrigin(payRes.demo.payment_url)
      return
    }

    if (payRes?.epay) {
      await launchEpay(payRes.epay)
      return
    }

    retryError.value = 'Не удалось открыть оплату. Попробуйте из кабинета или создайте заказ заново.'
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
  color: #b42318;
  margin-top: -8px;
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
  color: #3F6757;
  text-decoration: none;
  background: #fff;
  font: inherit;
  cursor: pointer;
}
.btn:disabled {
  opacity: 0.65;
  cursor: wait;
}
.btn--primary {
  background: #3F6757;
  border-color: #3F6757;
  color: #fff;
}
</style>
