<template>
  <div class="cart-page">
    <TheHeader />

    <main class="container page-content">
      <!-- Title -->
      <h1 class="cart-page-title">{{ t('cart.pageTitle') }}</h1>

      <!-- Free Shipping Progress Bar -->
      <div v-if="cartItems.length > 0 && !cartItems.some((i: any) => i.isPreorder) && freeDeliveryThreshold > 0" class="free-shipping-bar-wrap">
        <div v-if="!qualifiesForFreeDelivery(itemsSubtotal)" class="free-shipping-bar-info">
          <p class="shipping-msg"><AppIcon name="truck" :size="16" class="inline-icon" /> {{ t('cart.freeShippingProgress', { amount: formatPrice(amountToFreeDelivery(itemsSubtotal)) }) }}</p>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" :style="{ width: `${Math.min(100, (itemsSubtotal / freeDeliveryThreshold) * 100)}%` }"></div>
          </div>
        </div>
        <div v-else class="free-shipping-success">
          <AppIcon name="party" :size="16" class="inline-icon" /> {{ t('cart.freeShippingCongrats') }}
        </div>
      </div>

      <!-- Main Cart 2-Column Section -->
      <section class="cart-main-grid">
        <!-- LEFT: Items List -->
        <div class="cart-items-col">
          <div v-if="cartItems.length > 0" class="items-list">
            <div 
              v-for="item in cartItems" 
              :key="`${item.id}:${item.isPreorder ? 'p' : 's'}`" 
              class="cart-item-card"
            >
              <!-- Image -->
              <div class="item-thumb-wrap">
                <img :src="item.image" :alt="item.title" class="item-thumb" />
              </div>

              <!-- Title & Meta -->
              <div class="item-info-block">
                <h3 class="item-title">{{ item.title }}</h3>
                <p v-if="item.isPreorder" class="preorder-cart-badge">{{ t('cart.itemPreorder') }}</p>
                <p v-if="item.isGiftPackaging" class="gift-packaging-badge"><AppIcon name="gift" :size="14" class="inline-icon" /> {{ t('cart.giftPackaging') }}</p>
                <p v-if="item.isPreorder && (item.promisedArrivalFrom || item.promisedArrivalTo)" class="item-subtitle">
                  {{ t('cart.arrival') }}: {{ item.promisedArrivalFrom || '—' }} – {{ item.promisedArrivalTo || '—' }}
                </p>
                <p v-if="item.isPreorder && (item.promisedDeliveryFrom || item.promisedDeliveryTo)" class="item-subtitle">
                  {{ t('cart.plannedDelivery') }}: {{ item.promisedDeliveryFrom || '—' }} – {{ item.promisedDeliveryTo || '—' }}
                </p>
                <p v-else-if="!item.isPreorder && item.subtitle" class="item-subtitle">
                  {{ item.subtitle }}
                </p>
                <p
                  v-if="!item.isPreorder && item.availableQuantity != null && item.quantity >= item.availableQuantity"
                  class="stock-limit-hint"
                >
                  {{ t('cart.maxStock', { n: item.availableQuantity }) }}
                </p>
              </div>

              <!-- Controls & Price -->
              <div class="item-actions-block">
                <!-- Stepper -->
                <div class="qty-stepper">
                  <button class="step-btn" @click="decreaseQty(item)">-</button>
                  <span class="step-count">{{ item.quantity }}</span>
                  <button
                    class="step-btn"
                    :disabled="!canIncreaseItem(item)"
                    :title="canIncreaseItem(item) ? undefined : stockLimitTitle(item)"
                    @click="increaseQty(item)"
                  >+</button>
                </div>

                <!-- Price -->
                <span class="item-price-val">
                  {{ formatPrice(item.price * item.quantity) }} ₸
                </span>

                <!-- Trash Delete Button -->
                <button class="trash-btn" :aria-label="t('cart.removeAria')" @click="removeItem(item)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="empty-cart-card">
            <AppIcon name="cart" :size="40" class="empty-icon" />
            <h3>{{ t('cart.emptyTitle') }}</h3>
            <p>{{ t('cart.emptyHint') }}</p>
            <NuxtLink :to="localePath('/shop')" class="to-shop-btn">{{ t('cart.goShop') }} →</NuxtLink>
          </div>
        </div>

        <!-- RIGHT: Order Details Summary -->
        <div class="order-details-col">
          <div class="details-card">
            <h2 class="details-heading">{{ t('cart.orderDetails') }}</h2>

            <div class="cost-rows">
              <div class="cost-row">
                <span class="cost-label">{{ t('cart.itemsSubtotal') }}</span>
                <strong class="cost-val">{{ formatPrice(itemsSubtotal) }} ₸</strong>
              </div>

              <div class="cost-row">
                <span class="cost-label">{{ t('cart.delivery') }}</span>
                <strong class="cost-val">{{ deliveryCost > 0 ? `${formatPrice(deliveryCost)} ₸` : t('cart.free') }}</strong>
              </div>

              <div v-if="discountAmount > 0" class="cost-row discount-row">
                <span class="cost-label">{{ t('cart.giftCertApplied', { code: appliedGiftCard?.code }) }}</span>
                <strong class="cost-val">-{{ formatPrice(discountAmount) }} ₸</strong>
              </div>
              <p v-if="appliedGiftCard?.code" class="promo-balance-hint">
                {{ t('cart.giftCertBalanceOnly', { balance: formatPrice(Number(appliedGiftCard.balance || 0)) }) }}
                <template v-if="discountAmount > 0">
                  {{ t('cart.giftCertChargeNow', { amount: formatPrice(discountAmount) }) }}
                </template>
              </p>
            </div>

            <!-- Promo / Gift Certificate Code Input -->
            <div class="promo-code-wrap">
              <input 
                v-model="promoInput" 
                type="text" 
                :placeholder="t('cart.promoPlaceholderFull')"
                class="promo-input"
                :disabled="isVerifyingPromo"
                @keyup.enter="applyPromo"
              />
              <button class="apply-promo-btn" :disabled="isVerifyingPromo" @click="promoApplied ? removePromo() : applyPromo()">
                {{ isVerifyingPromo ? t('cart.verifying') : (promoApplied ? t('cart.reset') : t('cart.apply')) }}
              </button>
            </div>

            <!-- Total Row -->
            <div class="total-pay-row">
              <span class="total-pay-label">{{ t('cart.totalToPay') }}</span>
              <span class="total-pay-val">{{ formatPrice(finalTotal) }} ₸</span>
            </div>

            <!-- Checkout Button (Protected with Auth) -->
            <button 
              class="checkout-submit-btn" 
              :disabled="cartItems.length === 0"
              @click="handleCheckout"
            >
              {{ t('cart.checkout') }}
            </button>
          </div>
        </div>
      </section>

      <RecommendedToys :title="t('cart.recommendedAlso')" />
    </main>

    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import TheHeader from '~/components/TheHeader.vue'
import TheFooter from '~/components/TheFooter.vue'
import { canIncreaseCartQuantity } from '~/utils/cartStockLimit'

const { t } = useI18n()
const localePath = useLocalePath()

const { 
  items: cartItems, 
  totalPrice: itemsSubtotal, 
  increaseQty: incQty, 
  decreaseQty: decQty, 
  removeItem: remItem,
  setAvailableQuantity,
  clearBuyNow,
} = useCart()

const { fetchToys } = useToys()

const {
  pricing: shopPricing,
  fetchPricing: fetchShopPricing,
  deliveryFeeFor,
  amountToFreeDelivery,
  qualifiesForFreeDelivery,
} = useShopDelivery()

const freeDeliveryThreshold = computed(() => shopPricing.value.free_delivery_threshold)

const deliveryCost = computed(() => {
  return deliveryFeeFor(itemsSubtotal.value, {
    hasItems: cartItems.value.length > 0,
  })
})

const payableBeforeDiscount = computed(() => itemsSubtotal.value + deliveryCost.value)

const {
  appliedGiftCard,
  setAppliedGiftCard,
  clearAppliedGiftCard,
  computeGiftDiscount,
  refreshDiscountForTotal,
} = useCartPromo()

const promoInput = ref('')
const { success: toastSuccess, error: toastError } = useToast()

const discountAmount = computed(() => computeGiftDiscount(payableBeforeDiscount.value))
const promoApplied = computed(() => Boolean(appliedGiftCard.value?.code))

const finalTotal = computed(() => {
  if (cartItems.value.length === 0) return 0
  return Math.max(0, payableBeforeDiscount.value - discountAmount.value)
})

const isVerifyingPromo = ref(false)

const applyPromo = async () => {
  const code = promoInput.value.trim().toUpperCase()
  if (!code) return

  if (!code.startsWith('GFT-')) {
    toastError(t('errors.invalidFormat'), t('errors.giftCertFormatHint'))
    return
  }

  isVerifyingPromo.value = true
  const { request } = useApi()

  try {
    const res = await request<any>('/gift-cards/verify', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })

    const balance = Number(res?.data?.balance)
    if (!balance || balance <= 0) {
      throw new Error(t('errors.giftCertNoBalance'))
    }

    const discount = Math.min(payableBeforeDiscount.value, balance)
    setAppliedGiftCard({ code, balance, discountAmount: discount })
    promoInput.value = code
    toastSuccess(t('errors.giftApplied'), t('errors.giftCertAppliedDetail', { amount: formatPrice(discount) }))
  } catch (e: any) {
    clearAppliedGiftCard()
    toastError(t('errors.giftRejected'), e?.data?.message || e?.message || t('errors.giftRejected'))
  } finally {
    isVerifyingPromo.value = false
  }
}

const removePromo = () => {
  clearAppliedGiftCard()
  promoInput.value = ''
}

watch(payableBeforeDiscount, (total) => {
  refreshDiscountForTotal(total)
})

const route = useRoute()

const syncCartStock = async () => {
  const uniqueIds = [...new Set(
    cartItems.value
      .filter(item => !item.isPreorder)
      .map(item => Number(item.id))
      .filter(id => Number.isFinite(id) && id > 0),
  )]
  if (uniqueIds.length === 0) return

  try {
    const res = await fetchToys({
      catalog: 'shop',
      ids: uniqueIds,
      per_page: Math.max(uniqueIds.length, 1),
      include_preorder: 1,
    })
    const toys = res?.data ?? []
    const byId = new Map(toys.map((toy: any) => [Number(toy.id), toy]))

    let clamped = false
    for (const item of [...cartItems.value]) {
      if (item.isPreorder) continue
      const toy = byId.get(Number(item.id))
      if (!toy) continue
      const available = Number(toy.available_quantity ?? 0)
      const before = item.quantity
      const result = setAvailableQuantity(item.id, available, item.isPreorder)
      if (result.limited || result.quantity < before) clamped = true
    }
    if (clamped) {
      toastError(t('cart.qtyUpdated'), t('cart.qtyUpdatedHint'))
    }
  } catch {
    // Keep local cart caps if refresh fails; checkout still validates.
  }
}

onMounted(() => {
  void fetchShopPricing()
  void syncCartStock()
  const queryPromo = (route.query.promo || route.query.code || route.query.gift_code) as string
  if (queryPromo) {
    promoInput.value = queryPromo
    applyPromo()
  } else if (appliedGiftCard.value?.code) {
    promoInput.value = appliedGiftCard.value.code
    refreshDiscountForTotal(payableBeforeDiscount.value)
  }
})

const handleCheckout = () => {
  clearBuyNow()
  navigateTo(localePath('/checkout'))
}

const canIncreaseItem = (item: { quantity: number; isPreorder?: boolean; availableQuantity?: number | null }) =>
  canIncreaseCartQuantity(item.quantity, item.isPreorder ? null : (item.availableQuantity ?? null))

const stockLimitTitle = (item: { availableQuantity?: number | null }) => {
  const max = item.availableQuantity
  if (max == null) return t('common.stockLimitReached')
  return t('common.stockMaxOnly', { n: max })
}

const increaseQty = (item: any) => {
  const result = incQty(item.id, item.isPreorder)
  if (result.limited) {
    toastError(t('errors.insufficientStockTitle'), stockLimitTitle(item))
  }
}

const decreaseQty = (item: any) => {
  decQty(item.id, item.isPreorder)
}

const removeItem = (item: any) => {
  remItem(item.id, item.isPreorder)
}

const formatPrice = (val: number) => {
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  background-color: #FAF8F4;
  color: #262626;
  font-family: 'Manrope', sans-serif;
  padding-bottom: 0;
}

.container {
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-content {
  padding-top: 36px;
}

.free-shipping-bar-wrap {
  background: #F6F4FF;
  border: 1px solid #E3D7C6;
  border-radius: 18px;
  padding: 16px 24px;
  margin-bottom: 24px;
}

.shipping-msg {
  font-size: 14px;
  color: #262626;
  margin-bottom: 10px;
}

.progress-bar-bg {
  width: 100%;
  height: 8px;
  background: #E4DCFF;
  border-radius: 6px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--green-surface) 0%, #059669 100%);
  border-radius: 6px;
  transition: width 0.3s ease;
  color: var(--green-ink);
}

.free-shipping-success {
  background: #E6F9F0;
  color: #059669;
  font-weight: 700;
  font-size: 14px;
  padding: 12px 18px;
  border-radius: 14px;
  border: 1px solid #A7F3D0;
}

.cart-page-title {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 34px;
  color: #262626;
  margin-bottom: 28px;
  letter-spacing: -0.5px;
}

/* 2-Column Main Grid */
.cart-main-grid {
  display: grid;
  grid-template-columns: 1.55fr 1fr;
  gap: 32px;
  margin-bottom: 54px;
}

/* Left Items Column */
.items-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cart-item-card {
  background: #FAF8F4;
  border-radius: 20px;
  padding: 16px 22px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
  display: flex;
  align-items: center;
  gap: 18px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.cart-item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
}

.item-thumb-wrap {
  width: 72px;
  height: 72px;
  border-radius: 16px;
  background: #F4F8FC;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.item-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info-block {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-title {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 16.5px;
  color: #262626;
  margin-bottom: 3px;
  line-height: 1.3;
}

.item-subtitle {
  font-size: 12.5px;
  color: #6F746F;
}

.stock-limit-hint {
  margin: 4px 0 0;
  font-size: 12px;
  font-weight: 600;
  color: #B45309;
}

.gift-packaging-badge {
  display: inline-block;
  font-size: 11.5px;
  font-weight: 700;
  color: #B45309;
  background: #FFF7ED;
  border: 1px solid #FDBA74;
  border-radius: 8px;
  padding: 2px 8px;
  margin: 0 0 4px;
}

.preorder-cart-badge {
  display: inline-block;
  font-size: 11.5px;
  font-weight: 700;
  color: #77572F;
  background: #F3E2C8;
  border-radius: 8px;
  padding: 2px 8px;
  margin: 0 0 4px;
}

.item-actions-block {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.qty-stepper {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #F4F1EA;
  border-radius: 10px;
  padding: 4px 10px;
}

.step-btn {
  background: transparent;
  border: none;
  font-size: 15px;
  font-weight: 800;
  color: #5D625F;
  cursor: pointer;
  padding: 2px 4px;
}

.step-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.step-count {
  font-weight: 700;
  font-size: 13.5px;
  color: #262626;
  min-width: 12px;
  text-align: center;
}

.item-price-val {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 17.5px;
  color: #262626;
  min-width: 80px;
  text-align: right;
}

.trash-btn {
  background: #F4F1EA;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6F746F;
  cursor: pointer;
  transition: all 0.2s ease;
}

.trash-btn:hover {
  background: #FFE8EC;
  color: #AF5353;
}

/* Empty State Card */
.empty-cart-card {
  background: #FAF8F4;
  border-radius: 20px;
  padding: 48px 24px;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.empty-icon {
  display: block;
  margin: 0 auto 12px;
  color: var(--green-ink);
}

.inline-icon {
  flex-shrink: 0;
  vertical-align: middle;
}

.shipping-msg,
.free-shipping-success,
.gift-packaging-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.to-shop-btn {
  display: inline-block;
  margin-top: 16px;
  background: var(--green-surface);
  color: var(--green-ink);
  font-weight: 700;
  font-size: 14px;
  padding: 10px 22px;
  border-radius: 12px;
  text-decoration: none;
}

/* Right Details Summary Card */
.details-card {
  background: #FAF8F4;
  border-radius: 24px;
  padding: 28px 28px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
}

.details-heading {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 20px;
  color: #262626;
  margin-bottom: 20px;
}

.cost-rows {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 18px;
}

.cost-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.cost-label {
  color: #6F746F;
}

.cost-val {
  color: #262626;
  font-weight: 800;
  font-family: 'Manrope', sans-serif;
  font-size: 15px;
}

.discount-row .cost-val {
  color: #9C91C9;
}

.promo-balance-hint {
  margin: -8px 0 16px;
  font-size: 12.5px;
  color: #6F746F;
  font-family: 'Manrope', sans-serif;
}

/* Promo Code Box */
.promo-code-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #E6DFD4;
  border-radius: 14px;
  padding: 4px 6px 4px 16px;
  margin-bottom: 22px;
}

.promo-input {
  border: none;
  background: transparent;
  outline: none;
  font-family: 'Manrope', sans-serif;
  font-size: 13.5px;
  color: #262626;
  width: 100%;
}

.promo-input::placeholder {
  color: #A0A0B8;
}

.apply-promo-btn {
  background: none;
  border: none;
  color: var(--green-ink);
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  padding: 8px 12px;
  white-space: nowrap;
}

.apply-promo-btn:hover {
  text-decoration: underline;
}

/* Total Pay Row */
.total-pay-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 14px;
  border-top: 1px solid #F4F1EA;
  margin-bottom: 22px;
}

.total-pay-label {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 17px;
  color: #262626;
}

.total-pay-val {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 24px;
  color: var(--green-ink);
}

.checkout-submit-btn {
  background: var(--green-surface);
  color: var(--green-ink);
  border: none;
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 15px;
  padding: 14px;
  border-radius: 14px;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(51, 61, 54, 0.25);
  transition: all 0.2s ease;
  width: 100%;
}

.checkout-submit-btn:hover:not(:disabled) {
  background: var(--green-surface-hover);
  transform: translateY(-1px);
  color: var(--green-ink);
}

.checkout-submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 26, 46, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.checkout-modal {
  position: relative;
  background: #FAF8F4;
  width: 100%;
  max-width: 500px;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #F4F1EA;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5D625F;
}

.modal-title {
  font-family: 'Manrope', sans-serif;
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 6px;
}

.modal-desc {
  font-size: 14px;
  color: #6F746F;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.form-group label {
  font-size: 13px;
  font-weight: 700;
  color: #262626;
}

.modal-input {
  padding: 12px 16px;
  border: 1.5px solid #E3D7C6;
  border-radius: 12px;
  font-size: 14px;
  color: #262626;
  outline: none;
  font-family: 'Manrope', sans-serif;
}

.modal-input:focus {
  border-color: var(--green-ink);
}

.payment-radios {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.radio-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #FAFAFC;
  border: 1px solid #E6DFD4;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.cancel-btn {
  background: #F4F1EA;
  border: none;
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

.confirm-btn {
  background: var(--green-surface);
  color: var(--green-ink);
  border: none;
  padding: 10px 22px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

/* Responsive */
@media (max-width: 960px) {
  .cart-main-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .cart-item-card {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
    gap: 12px;
  }

  .item-actions-block {
    width: 100%;
    justify-content: space-between;
    padding-top: 8px;
    border-top: 1px solid #F4F1EA;
  }

  .item-thumb-wrap {
    width: 60px;
    height: 60px;
  }

  .details-card {
    padding: 20px 16px;
  }

  .promo-input-row {
    flex-direction: column;
    gap: 8px;
  }

  .apply-promo-btn {
    width: 100%;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
