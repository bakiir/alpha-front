<template>
  <div class="payment-result-page">
    <TheHeader />
    <main class="container page-content">
      <div class="result-card">
        <div v-if="state === 'loading'" class="result-body">
          <div class="spinner" aria-hidden="true" />
          <h1>Проверяем оплату…</h1>
          <p>Подождите несколько секунд — банк подтверждает платёж.</p>
        </div>

        <div v-else-if="state === 'paid'" class="result-body">
          <div class="badge badge--ok">✓</div>
          <h1>Оплата прошла успешно</h1>
          <p v-if="orderNumber">Заказ {{ orderNumber }} оплачен и передан в доставку.</p>
          <p v-else>Платёж подтверждён.</p>
          <div class="actions">
            <NuxtLink v-if="orderId" :to="`/delivery?order_id=${orderId}`" class="btn btn--primary">
              Отследить доставку
            </NuxtLink>
            <NuxtLink to="/cabinet" class="btn">В кабинет</NuxtLink>
          </div>
        </div>

        <div v-else-if="state === 'pending'" class="result-body">
          <div class="badge badge--wait">…</div>
          <h1>Оплата ещё обрабатывается</h1>
          <p>Если деньги списались, статус обновится автоматически. Можно обновить страницу через минуту.</p>
          <p v-if="pendingHint" class="pending-hint">{{ pendingHint }}</p>
          <div class="actions">
            <button type="button" class="btn btn--primary" @click="pollOnce">Обновить статус</button>
            <NuxtLink to="/cabinet" class="btn">В кабинет</NuxtLink>
          </div>
        </div>

        <div v-else class="result-body">
          <div class="badge badge--err">!</div>
          <h1>Не удалось подтвердить оплату</h1>
          <p>{{ errorMessage }}</p>
          <div class="actions">
            <NuxtLink to="/checkout" class="btn btn--primary">Вернуться к оплате</NuxtLink>
            <NuxtLink to="/cart" class="btn">В корзину</NuxtLink>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { user, isInitialized, fetchUser, openAuthModal, closeAuthModal } = useAuth()
const { fetchOrder, syncOrderPayment } = useOrders()
const { clearCart } = useCart()
const { clearAppliedGiftCard } = useCartPromo()

const orderId = computed(() => {
  const raw = route.query.order_id
  const n = Number(Array.isArray(raw) ? raw[0] : raw)
  return Number.isFinite(n) && n > 0 ? n : null
})

const queryHint = (key: string) => {
  const raw = route.query[key]
  const value = Array.isArray(raw) ? raw[0] : raw
  return typeof value === 'string' && value ? value : undefined
}

const state = ref<'loading' | 'paid' | 'pending' | 'error'>('loading')
const orderNumber = ref<string | number | null>(null)
const errorMessage = ref('Заказ не найден или сессия истекла.')
const pendingHint = ref('')

let timer: ReturnType<typeof setInterval> | null = null
let attempts = 0

const stopPolling = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const ensureAuth = async () => {
  if (!isInitialized.value) {
    await fetchUser()
  }
  return !!user.value
}

const applyPaid = (order: any) => {
  orderNumber.value = order?.order_number || order?.id || orderId.value
  state.value = 'paid'
  clearCart()
  clearAppliedGiftCard()
  stopPolling()
}

const pollOnce = async () => {
  if (!orderId.value) {
    state.value = 'error'
    errorMessage.value = 'В ссылке нет номера заказа.'
    return
  }

  const authed = await ensureAuth()
  if (!authed) {
    openAuthModal('login')
    state.value = 'error'
    errorMessage.value = 'Войдите в аккаунт, чтобы увидеть статус оплаты.'
    return
  }
  closeAuthModal()

  const hints = {
    invoice_id: queryHint('invoice_id'),
    payment: queryHint('payment'),
    confirm: queryHint('confirm'),
  }

  try {
    try {
      const synced = await syncOrderPayment(orderId.value, hints)
      orderNumber.value = synced.data?.order_number || synced.data?.id || orderId.value
      if (synced.data?.payment_status === 'paid' || synced.payment?.status === 'paid' || synced.synced) {
        applyPaid(synced.data)
        return
      }
      if (synced.payment?.status === 'failed' || synced.epay_result_code === '101') {
        state.value = 'error'
        errorMessage.value = 'Банк отклонил платёж. Попробуйте ещё раз.'
        stopPolling()
        return
      }
      if (synced.method === 'status_error') {
        pendingHint.value = 'Банк подтвердил переход, ждём фиксацию статуса…'
      }
    } catch (e: any) {
      pendingHint.value = e?.data?.message || 'Не удалось связаться с банком, пробуем ещё…'
    }

    const res = await fetchOrder(orderId.value)
    orderNumber.value = res.data?.order_number || res.data?.id || orderId.value
    const paid = res.data?.payment_status === 'paid' || res.payment?.status === 'paid'
    if (paid) {
      applyPaid(res.data)
      return
    }
    if (res.payment?.status === 'failed') {
      state.value = 'error'
      errorMessage.value = 'Банк отклонил платёж. Попробуйте ещё раз.'
      stopPolling()
      return
    }
    state.value = 'pending'
  } catch (e: any) {
    state.value = 'error'
    errorMessage.value = e?.data?.message || 'Не удалось получить статус заказа.'
    stopPolling()
  }
}

onMounted(async () => {
  await pollOnce()
  if (state.value === 'paid' || state.value === 'error') return

  timer = setInterval(async () => {
    attempts += 1
    await pollOnce()
    if (attempts >= 20) stopPolling()
  }, 2000)
})

onBeforeUnmount(stopPolling)
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
.result-body h1 {
  font-size: 1.5rem;
  margin: 16px 0 8px;
  color: #24352e;
}
.result-body p {
  color: #5b6b63;
  line-height: 1.5;
  margin: 0 0 24px;
}
.pending-hint {
  color: #8a7a55 !important;
  font-size: 0.9rem;
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
}
.badge--ok { background: #e7f5ee; color: #2f7a55; }
.badge--wait { background: #f3f0e8; color: #8a7a55; }
.badge--err { background: #fdeceb; color: #b42318; }
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
  cursor: pointer;
  font: inherit;
}
.btn--primary {
  background: #3F6757;
  border-color: #3F6757;
  color: #fff;
}
.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto;
  border: 3px solid #e5e1d8;
  border-top-color: #3F6757;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
