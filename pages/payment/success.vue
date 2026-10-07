<template>
  <div class="payment-result-page">
    <TheHeader />
    <main class="container page-content">
      <div class="result-card">
        <div v-if="state === 'loading'" class="result-body">
          <div class="spinner" aria-hidden="true" />
          <h1>{{ t('payment.checkingTitle') }}</h1>
          <p>{{ t('payment.checkingBody') }}</p>
        </div>

        <div v-else-if="state === 'paid'" class="result-body">
          <div class="badge badge--ok">✓</div>
          <h1>{{ t('payment.successTitle') }}</h1>
          <p>{{ successMessage }}</p>
          <p v-if="isPreorderPaid && preorderDatesText" class="pending-hint">{{ preorderDatesText }}</p>

          <div v-if="giftCode || giftShareLink" class="gift-share">
            <div v-if="giftCode" class="gift-code">{{ t('payment.codeLabel') }}: <strong>{{ giftCode }}</strong></div>
            <p v-if="giftShareLink" class="gift-share-hint">
              {{ t('payment.shareHint') }}
            </p>
            <div v-if="giftShareLink" class="gift-link-row">
              <input
                type="text"
                class="gift-link-input"
                readonly
                :value="giftShareLink"
                @click="($event.target as HTMLInputElement).select()"
              >
              <button type="button" class="btn btn--primary gift-copy-btn" @click="copyGiftShareLink">
                {{ linkCopied ? t('common.copied') : t('payment.copyLink') }}
              </button>
            </div>
            <div v-if="giftShareLink" class="gift-share-actions">
              <button v-if="giftCode" type="button" class="btn" @click="copyGiftCode">
                {{ codeCopied ? t('payment.codeCopied') : t('payment.copyCode') }}
              </button>
              <button type="button" class="btn" @click="shareGiftViaWhatsApp">
                {{ t('payment.whatsappShare') }}
              </button>
            </div>
          </div>

          <div class="actions">
            <NuxtLink
              v-if="orderId && isPreorderPaid"
              :to="localePath({ path: '/profile', query: { section: 'history', tab: 'orders' } })"
              class="btn btn--primary"
            >
              {{ t('payment.ctaOrderCabinet') }}
            </NuxtLink>
            <NuxtLink
              v-else-if="orderId && !giftShareLink"
              :to="localePath({ path: '/profile', query: { section: 'history', tab: 'orders' } })"
              class="btn btn--primary"
            >
              {{ t('payment.ctaOrderStatus') }}
            </NuxtLink>
            <NuxtLink v-else-if="flow === 'subscription' || flow === 'buyout'" :to="localePath('/subscription')" class="btn btn--primary">
              {{ t('payment.ctaSubscription') }}
            </NuxtLink>
            <NuxtLink v-else-if="flow === 'rental' || flow === 'rental_extend'" :to="localePath({ path: '/profile', query: { section: 'history', tab: 'rentals' } })" class="btn btn--primary">
              {{ t('payment.ctaRentals') }}
            </NuxtLink>
            <NuxtLink v-else-if="flow === 'gift_card' || flow === 'gift_subscription' || giftShareLink" :to="localePath({ path: '/profile', query: { section: 'history', tab: 'gifts' } })" class="btn btn--primary">
              {{ t('payment.ctaGifts') }}
            </NuxtLink>
            <NuxtLink :to="localePath('/profile')" class="btn">{{ t('payment.ctaProfile') }}</NuxtLink>
          </div>
        </div>

        <div v-else-if="state === 'pending'" class="result-body">
          <div class="badge badge--wait">…</div>
          <h1>{{ t('payment.pendingProcessingTitle') }}</h1>
          <p>{{ t('payment.pendingProcessingBody') }}</p>
          <p v-if="pendingHint" class="pending-hint">{{ pendingHint }}</p>
          <div class="actions">
            <button type="button" class="btn btn--primary" @click="pollOnce">{{ t('payment.refreshStatus') }}</button>
            <NuxtLink :to="localePath('/profile')" class="btn">{{ t('payment.ctaProfile') }}</NuxtLink>
          </div>
        </div>

        <div v-else class="result-body">
          <div class="badge badge--err">!</div>
          <h1>{{ t('payment.confirmFailedTitle') }}</h1>
          <p>{{ errorMessage }}</p>
          <div class="actions">
            <NuxtLink :to="retryPath" class="btn btn--primary">{{ t('payment.returnToPay') }}</NuxtLink>
            <NuxtLink :to="localePath('/profile')" class="btn">{{ t('payment.ctaProfile') }}</NuxtLink>
          </div>
        </div>
      </div>
      <RecommendedToys v-if="state === 'paid'" />
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()
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

const { success: toastSuccess } = useToast()

const state = ref<'loading' | 'paid' | 'pending' | 'error'>('loading')
const flow = ref('')
const successMessage = ref('Платёж подтверждён.')
const giftCode = ref('')
const giftClaimToken = ref('')
const giftRecipientName = ref('')
const giftActivationLink = ref('')
const codeCopied = ref(false)
const linkCopied = ref(false)
const errorMessage = ref('Платёж не найден или сессия истекла.')
const pendingHint = ref('')
const isPreorderPaid = ref(false)
const preorderDatesText = ref('')

const siteOrigin = computed(() => {
  if (import.meta.client && typeof window !== 'undefined') {
    return window.location.origin
  }
  return ''
})

const giftShareLink = computed(() => {
  if (giftActivationLink.value) return giftActivationLink.value

  const origin = siteOrigin.value
  if (!origin) return ''

  if (giftClaimToken.value) {
    return `${origin}/gift/claim/${encodeURIComponent(giftClaimToken.value)}`
  }
  if (!giftCode.value) return ''

  if (flow.value === 'gift_subscription' || giftCode.value.startsWith('GSUB-')) {
    return `${origin}/subscription?gift_code=${encodeURIComponent(giftCode.value)}`
  }
  return `${origin}/gifts/claim?code=${encodeURIComponent(giftCode.value)}`
})

const retryPath = computed(() => {
  if (flow.value === 'shop' || orderId.value) return localePath('/checkout')
  if (flow.value === 'subscription' || flow.value === 'buyout') return localePath('/subscription')
  if (flow.value === 'rental' || flow.value === 'rental_extend') return localePath('/short-rent')
  if (flow.value === 'gift_card' || flow.value === 'gift_subscription') return localePath('/gifts')
  return localePath('/cabinet')
})

const unwrapGiftPayload = (data: any) => {
  if (!data || typeof data !== 'object') return null
  // JsonResource may nest under `.data`
  if (data.code || data.gift_claim_token) return data
  if (data.data && typeof data.data === 'object' && (data.data.code || data.data.gift_claim_token)) {
    return data.data
  }
  return data
}

const copyText = async (text: string) => {
  if (!text) return false
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // fallback below
  }
  try {
    const input = document.createElement('textarea')
    input.value = text
    input.setAttribute('readonly', '')
    input.style.position = 'absolute'
    input.style.left = '-9999px'
    document.body.appendChild(input)
    input.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(input)
    return ok
  } catch {
    return false
  }
}

const copyGiftCode = async () => {
  if (!giftCode.value) return
  const ok = await copyText(giftCode.value)
  if (!ok) return
  codeCopied.value = true
  toastSuccess('Скопировано', `Код ${giftCode.value} скопирован.`)
  setTimeout(() => { codeCopied.value = false }, 2500)
}

const copyGiftShareLink = async () => {
  const link = giftShareLink.value
  if (!link) return
  const ok = await copyText(link)
  if (!ok) return
  linkCopied.value = true
  toastSuccess('Ссылка скопирована', 'Отправьте её получателю любым удобным способом.')
  setTimeout(() => { linkCopied.value = false }, 2500)
}

const shareGiftViaWhatsApp = () => {
  const link = giftShareLink.value
  if (!link) return
  const who = giftRecipientName.value ? ` для ${giftRecipientName.value}` : ''
  const text = giftCode.value
    ? `Привет! 🎁 Я отправил(а) вам подарок в Alpha${who}.\n\nКод: ${giftCode.value}\nОткрыть подарок: ${link}`
    : `Привет! 🎁 Я отправил(а) вам подарок в Alpha${who}.\n\nОткрыть подарок: ${link}`
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank')
}

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

const formatRange = (from?: string | null, to?: string | null) => {
  if (from && to && from !== to) return `${from} – ${to}`
  return to || from || ''
}

const messageForFlow = (f: string, data: any) => {
  switch (f) {
    case 'shop':
      if (data?.fulfillment_mode === 'preorder') {
        const arrival = formatRange(data?.promised_arrival_from, data?.promised_arrival_to)
        const delivery = formatRange(data?.promised_delivery_from, data?.promised_delivery_to)
        const extra = [arrival && `Поступление: ${arrival}`, delivery && `Плановая доставка: ${delivery}`]
          .filter(Boolean)
          .join('. ')
        return data?.order_number
          ? `Предзаказ ${data.order_number} оплачен.${extra ? ' ' + extra + '.' : ' Ждём поступление на склад.'}`
          : `Предзаказ оплачен.${extra ? ' ' + extra + '.' : ' Ждём поступление на склад.'}`
      }
      return data?.order_number
        ? `Заказ ${data.order_number} оплачен и ожидает сборки.`
        : 'Заказ оплачен и ожидает сборки.'
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
  isPreorderPaid.value = data?.fulfillment_mode === 'preorder'
  const arrival = formatRange(data?.promised_arrival_from, data?.promised_arrival_to)
  const delivery = formatRange(data?.promised_delivery_from, data?.promised_delivery_to)
  preorderDatesText.value = isPreorderPaid.value
    ? [arrival && `Поступление: ${arrival}`, delivery && `Плановая доставка: ${delivery}`].filter(Boolean).join('. ')
    : ''
  successMessage.value = messageForFlow(flow.value, data)

  const giftPayload = unwrapGiftPayload(data)
  giftCode.value = String(giftPayload?.code || '')
  giftClaimToken.value = String(
    giftPayload?.gift_claim_token
    || (data?.is_gift ? data?.gift_claim_token : '')
    || ''
  )
  giftRecipientName.value = String(
    giftPayload?.recipient_name
    || data?.gift_recipient_name
    || ''
  )
  giftActivationLink.value = String(giftPayload?.activation_link || '')

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
}
.result-card {
  width: min(520px, 100%);
  margin: 0 auto;
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
  margin: 0 0 12px;
  padding: 12px 16px;
  border-radius: 12px;
  background: #f3f7f4;
  color: #24352e;
  font-size: 1.05rem;
}
.gift-share {
  margin: -4px 0 24px;
  text-align: left;
}
.gift-share-hint {
  margin: 0 0 12px !important;
  color: #5b6b63 !important;
  font-size: 0.92rem;
  line-height: 1.45;
}
.gift-link-row {
  display: flex;
  gap: 8px;
  align-items: stretch;
  margin-bottom: 10px;
}
.gift-link-input {
  flex: 1;
  min-width: 0;
  padding: 11px 12px;
  border-radius: 12px;
  border: 1px solid rgba(63, 103, 87, 0.18);
  background: #f7faf8;
  color: #24352e;
  font: inherit;
  font-size: 0.86rem;
}
.gift-copy-btn {
  white-space: nowrap;
  flex-shrink: 0;
}
.gift-share-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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
.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto;
  border: 3px solid #e5e1d8;
  border-top-color: var(--green-ink);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
@media (max-width: 560px) {
  .gift-link-row {
    flex-direction: column;
  }
  .gift-copy-btn {
    width: 100%;
  }
}
</style>
