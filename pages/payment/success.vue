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
          <p>{{ successMessage }}</p>
          <div v-if="giftCode" class="gift-code">Код: <strong>{{ giftCode }}</strong></div>
          <div class="actions">
            <NuxtLink v-if="orderId" :to="`/delivery?order_id=${orderId}`" class="btn btn--primary">
              Отследить доставку
            </NuxtLink>
            <NuxtLink v-else-if="flow === 'subscription' || flow === 'buyout'" to="/subscription" class="btn btn--primary">
              К подписке
            </NuxtLink>
            <NuxtLink v-else-if="flow === 'rental' || flow === 'rental_extend'" to="/profile?section=history&tab=rentals" class="btn btn--primary">
              К арендам
            </NuxtLink>
            <NuxtLink v-else-if="flow === 'gift_card' || flow === 'gift_subscription'" to="/profile?section=history&tab=gifts" class="btn btn--primary">
              К подаркам
            </NuxtLink>
            <NuxtLink to="/profile" class="btn">В кабинет</NuxtLink>
          </div>
        </div>

        <div v-else-if="state === 'pending'" class="result-body">
          <div class="badge badge--wait">…</div>
          <h1>Оплата ещё обрабатывается</h1>
          <p>Если деньги списались, статус обновится автоматически. Можно обновить страницу через минуту.</p>
          <p v-if="pendingHint" class="pending-hint">{{ pendingHint }}</p>
          <div class="actions">
            <button type="button" class="btn btn--primary" @click="pollOnce">Обновить статус</button>
            <NuxtLink to="/profile" class="btn">В кабинет</NuxtLink>
          </div>
        </div>

        <div v-else class="result-body">
          <div class="badge badge--err">!</div>
          <h1>Не удалось подтвердить оплату</h1>
          <p>{{ errorMessage }}</p>
          <div class="actions">
            <NuxtLink :to="retryPath" class="btn btn--primary">Вернуться к оплате</NuxtLink>
            <NuxtLink to="/profile" class="btn">В кабинет</NuxtLink>
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
const { syncPayment, fetchPayment } = usePayments()
const { clearCart } = useCart()
const { clearAppliedGiftCard } = useCartPromo()

const orderId = computed(() => {
  const raw = route.query.order_id
  const n = Number(Array.isArray(raw) ? raw[0] : raw)
  return Number.isFinite(n) && n > 0 ? n : null
})

const paymentNumber = computed(() => {
  const raw = route.query.payment
  const value = Array.isArray(raw) ? raw[0] : raw
  return typeof value === 'string' && value ? value : ''
})

const flowFromQuery = computed(() => {
  const raw = route.query.flow
  const value = Array.isArray(raw) ? raw[0] : raw
  return typeof value === 'string' && value ? value : ''
})

const queryHint = (key: string) => {
  const raw = route.query[key]
  const value = Array.isArray(raw) ? raw[0] : raw
  return typeof value === 'string' && value ? value : undefined
}

const state = ref<'loading' | 'paid' | 'pending' | 'error'>('loading')
const flow = ref('')
const successMessage = ref('Платёж подтверждён.')
const giftCode = ref('')
const errorMessage = ref('Платёж не найден или сессия истекла.')
const pendingHint = ref('')

const retryPath = computed(() => {
  if (flow.value === 'shop' || orderId.value) return '/checkout'
  if (flow.value === 'subscription' || flow.value === 'buyout') return '/subscription'
  if (flow.value === 'rental' || flow.value === 'rental_extend') return '/short-rent'
  if (flow.value === 'gift_card' || flow.value === 'gift_subscription') return '/gifts'
  return '/cabinet'
})

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

const messageForFlow = (f: string, data: any) => {
  switch (f) {
    case 'shop':
      return data?.order_number
        ? `Заказ ${data.order_number} оплачен и передан в доставку.`
        : 'Заказ оплачен и передан в доставку.'
    case 'subscription':
      return 'Подписка оплачена и активирована.'
    case 'rental':
      return 'Аренда оплачена. Заказ передан в курьерскую службу.'
    case 'rental_extend':
      return 'Продление аренды оплачено.'
    case 'gift_card':
      return 'Подарочный сертификат оформлен.'
    case 'gift_subscription':
      return 'Подарочная подписка оформлена.'
    case 'buyout':
      return data?.toy_name
        ? `Игрушка «${data.toy_name}» выкуплена.`
        : 'Игрушка успешно выкуплена.'
    default:
      return 'Платёж подтверждён.'
  }
}

const applyPaid = (f: string, data: any) => {
  flow.value = f || flowFromQuery.value || 'shop'
  successMessage.value = messageForFlow(flow.value, data)
  giftCode.value = data?.code || ''
  state.value = 'paid'
  if (flow.value === 'shop') {
    clearCart()
    clearAppliedGiftCard()
  }
  stopPolling()
}

const pollOnce = async () => {
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
    payment: paymentNumber.value || queryHint('payment'),
    confirm: queryHint('confirm'),
  }

  try {
    if (hints.payment) {
      try {
        const synced = await syncPayment({
          payment: hints.payment,
          invoice_id: hints.invoice_id,
          confirm: hints.confirm,
        })
        const f = synced.payment?.flow || flowFromQuery.value
        if (synced.payment?.status === 'paid' || synced.synced) {
          applyPaid(String(f || ''), synced.data)
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
        flow.value = String(f || flow.value)
      } catch (e: any) {
        pendingHint.value = e?.data?.message || 'Не удалось связаться с банком, пробуем ещё…'
      }

      const shown = await fetchPayment(hints.payment)
      const f = shown.payment?.flow || flowFromQuery.value
      if (shown.payment?.status === 'paid') {
        applyPaid(String(f || ''), shown.data)
        return
      }
      if (shown.payment?.status === 'failed') {
        state.value = 'error'
        errorMessage.value = 'Банк отклонил платёж. Попробуйте ещё раз.'
        stopPolling()
        return
      }
      flow.value = String(f || flow.value)
      state.value = 'pending'
      return
    }

    if (!orderId.value) {
      state.value = 'error'
      errorMessage.value = 'В ссылке нет номера платежа.'
      return
    }

    // Legacy shop-only return URL with order_id
    try {
      const synced = await syncOrderPayment(orderId.value, hints)
      if (synced.data?.payment_status === 'paid' || synced.payment?.status === 'paid' || synced.synced) {
        applyPaid('shop', synced.data)
        return
      }
      if (synced.payment?.status === 'failed' || synced.epay_result_code === '101') {
        state.value = 'error'
        errorMessage.value = 'Банк отклонил платёж. Попробуйте ещё раз.'
        stopPolling()
        return
      }
    } catch (e: any) {
      pendingHint.value = e?.data?.message || 'Не удалось связаться с банком, пробуем ещё…'
    }

    const res = await fetchOrder(orderId.value)
    const paid = res.data?.payment_status === 'paid' || res.payment?.status === 'paid'
    if (paid) {
      applyPaid('shop', res.data)
      return
    }
    if (res.payment?.status === 'failed') {
      state.value = 'error'
      errorMessage.value = 'Банк отклонил платёж. Попробуйте ещё раз.'
      stopPolling()
      return
    }
    flow.value = 'shop'
    state.value = 'pending'
  } catch (e: any) {
    state.value = 'error'
    errorMessage.value = e?.data?.message || 'Не удалось получить статус оплаты.'
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
.gift-code {
  margin: -8px 0 24px;
  padding: 12px 16px;
  border-radius: 12px;
  background: #f3f7f4;
  color: #24352e;
  font-size: 1.05rem;
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
