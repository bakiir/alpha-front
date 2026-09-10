<template>
  <div class="demo-pay-page">
    <main class="shell">
      <div class="bank-card">
        <header class="bank-head">
          <div class="bank-logo">Halyk ePay</div>
          <span class="demo-pill">DEMO</span>
        </header>

        <p class="bank-sub">Тестовая оплата Alpha — без реального списания. Когда появятся ключи Halyk, этот шаг заменится банком.</p>

        <div v-if="loading" class="state">Загрузка платежа…</div>
        <div v-else-if="error" class="state state--err">{{ error }}</div>
        <template v-else>
          <div class="amount-block">
            <span class="amount-label">К оплате</span>
            <strong class="amount-value">{{ formatPrice(amount) }} ₸</strong>
            <span v-if="orderLabel" class="amount-meta">{{ orderLabel }}</span>
          </div>

          <div class="fake-card" aria-hidden="true">
            <div class="fake-card__chip" />
            <div class="fake-card__num">4400 43•• •••• 0128</div>
            <div class="fake-card__row">
              <span>ALPHA DEMO</span>
              <span>12/28</span>
            </div>
          </div>

          <div class="actions">
            <button type="button" class="btn btn--pay" :disabled="busy" @click="confirm(true)">
              {{ busy ? 'Обработка…' : 'Оплатить' }}
            </button>
            <button type="button" class="btn btn--cancel" :disabled="busy" @click="confirm(false)">
              Отменить
            </button>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { user, isInitialized, fetchUser, openAuthModal, closeAuthModal } = useAuth()
const { request } = useApi()

const loading = ref(true)
const busy = ref(false)
const error = ref('')
const amount = ref(0)
const orderLabel = ref('')
const paymentNumber = computed(() => {
  const raw = route.query.payment
  return String(Array.isArray(raw) ? raw[0] : raw || '')
})

const formatPrice = (val: number) =>
  Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

const ensureAuth = async () => {
  if (!isInitialized.value) {
    await fetchUser()
  }
  return !!user.value
}

const load = async () => {
  loading.value = true
  error.value = ''

  const authed = await ensureAuth()
  if (!authed) {
    openAuthModal('login')
    error.value = 'Войдите, чтобы продолжить оплату.'
    loading.value = false
    return
  }
  closeAuthModal()

  if (!paymentNumber.value) {
    error.value = 'В ссылке нет номера платежа.'
    loading.value = false
    return
  }
  try {
    const res = await request<{
      status: string
      data: {
        amount: number | string
        status: string
        order_id?: number
        order_number?: string
      }
    }>(`/payments/demo?payment=${encodeURIComponent(paymentNumber.value)}`)

    if (res.data.status === 'paid') {
      const q = new URLSearchParams({ payment: paymentNumber.value })
      if (res.data.order_id) q.set('order_id', String(res.data.order_id))
      if ((res.data as any).flow) q.set('flow', String((res.data as any).flow))
      await navigateSameOrigin(`/payment/success?${q.toString()}`)
      return
    }
    if (res.data.status === 'failed') {
      const q = new URLSearchParams({ payment: paymentNumber.value })
      if (res.data.order_id) q.set('order_id', String(res.data.order_id))
      if ((res.data as any).flow) q.set('flow', String((res.data as any).flow))
      await navigateSameOrigin(`/payment/failure?${q.toString()}`)
      return
    }

    amount.value = Number(res.data.amount) || 0
    orderLabel.value = (res.data as any).label
      || (res.data.order_number
        ? `Заказ ${res.data.order_number}`
        : res.data.order_id
          ? `Заказ #${res.data.order_id}`
          : '')
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось загрузить платёж.'
  } finally {
    loading.value = false
  }
}

const confirm = async (success: boolean) => {
  if (busy.value || !paymentNumber.value) return
  busy.value = true
  try {
    const res = await request<{ redirect: string }>('/payments/demo/confirm', {
      method: 'POST',
      body: JSON.stringify({
        payment: paymentNumber.value,
        success,
      }),
    })
    await navigateSameOrigin(res.redirect || (success ? '/payment/success' : '/payment/failure'))
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось завершить демо-оплату.'
  } finally {
    busy.value = false
  }
}

onMounted(load)
watch(user, (u, prev) => {
  if (u && !prev) load()
})
</script>

<style scoped>
.demo-pay-page {
  min-height: 100vh;
  background:
    radial-gradient(ellipse at top, #1a3a4a 0%, #0b1c24 55%, #071218 100%);
  color: #f4f7f6;
  font-family: 'Manrope', system-ui, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.shell { width: min(420px, 100%); }
.bank-card {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  padding: 28px 24px 24px;
  backdrop-filter: blur(10px);
}
.bank-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.bank-logo {
  font-weight: 700;
  letter-spacing: 0.02em;
  font-size: 1.1rem;
}
.demo-pill {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 4px 8px;
  border-radius: 999px;
  background: #e8b84a;
  color: #1a1405;
}
.bank-sub {
  margin: 0 0 22px;
  font-size: 0.85rem;
  line-height: 1.45;
  color: rgba(244, 247, 246, 0.72);
}
.amount-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 20px;
}
.amount-label { font-size: 0.8rem; opacity: 0.7; }
.amount-value { font-size: 2rem; font-weight: 700; }
.amount-meta { font-size: 0.85rem; opacity: 0.75; }
.fake-card {
  border-radius: 16px;
  padding: 18px 18px 14px;
  margin-bottom: 22px;
  background: linear-gradient(135deg, #2f6b5a 0%, #1e3f4a 100%);
  min-height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.fake-card__chip {
  width: 34px;
  height: 24px;
  border-radius: 6px;
  background: linear-gradient(135deg, #d8c48a, #a8904e);
}
.fake-card__num {
  font-family: ui-monospace, monospace;
  letter-spacing: 0.12em;
  font-size: 1rem;
}
.fake-card__row {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  opacity: 0.9;
}
.actions { display: flex; flex-direction: column; gap: 10px; }
.btn {
  border: none;
  border-radius: 12px;
  padding: 14px 16px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
.btn:disabled { opacity: 0.6; cursor: wait; }
.btn--pay { background: #3ecf8e; color: #062416; }
.btn--cancel { background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.25); }
.state { padding: 24px 0; text-align: center; }
.state--err { color: #ffb4a8; }
</style>
