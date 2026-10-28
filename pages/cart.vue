<template>
  <div class="cart-page">
    <TheHeader />

    <main class="container page-content">
      <!-- Title -->
      <h1 class="cart-page-title">{{ t('cart.pageTitle') }}</h1>

      <ClientOnly>
      <div v-if="cartItems.length > 0 && freeDeliveryThreshold > 0" class="free-shipping-bar-wrap">
        <div v-if="!qualifiesForFreeDelivery(itemsSubtotal)" class="free-shipping-bar-info">
          <p class="shipping-msg"><AppIcon name="truck" :size="16" class="inline-icon" /> {{ t('cart.freeShippingProgress', { amount: formatPrice(amountToFreeDelivery(itemsSubtotal)) }) }}</p>
          <div class="progress-bar-bg"><div class="progress-bar-fill" :style="{ width: `${Math.min(100, (itemsSubtotal / freeDeliveryThreshold) * 100)}%` }"></div></div>
        </div>
        <div v-else class="free-shipping-success"><AppIcon name="party" :size="16" class="inline-icon" /> {{ t('cart.freeShippingCongrats') }}</div>
      </div>

      <section class="cart-main-grid">
        <div class="cart-items-col">
          <div v-if="cartItems.length" class="basket-panel">
            <div class="basket-toolbar">
              <label class="basket-select-all"><input type="checkbox" :checked="allSelected" :indeterminate.prop="someSelected && !allSelected" @change="toggleAll" />{{ t('cart.selectAll') }}</label>
              <div class="basket-toolbar-actions">
                <button type="button" class="basket-text-action" disabled :title="t('cart.shareSoon')" :aria-label="t('cart.shareSoon')"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.7 10.7 6.6-4.2m-6.6 6.8 6.6 4.2"/></svg>{{ t('cart.share') }}</button>
                <button type="button" class="basket-text-action basket-text-action--danger" :disabled="!someSelected" @click="removeSelected">{{ t('cart.removeSelected', { count: selectedItems.length }) }}</button>
              </div>
            </div>
            <template v-for="group in cartGroups" :key="group.key">
              <div v-if="isMixedCart" class="basket-group-heading"><strong>{{ group.title }}</strong><span>{{ group.hint }}</span></div>
              <article v-for="item in group.items" :key="cartLineKey(item)" class="basket-item" :class="{ 'basket-item--unselected': !isSelected(item) }">
                <label class="basket-item-check"><input type="checkbox" :checked="isSelected(item)" :aria-label="t('cart.selectItem', { name: item.title })" @change="toggleItem(item)" /></label>
                <div class="basket-item-image"><img :src="item.image" :alt="item.title" /></div>
                <div class="basket-item-body">
                  <div class="basket-item-name-row">
                    <div>
                      <h3>{{ item.title }}</h3>
                      <span v-if="item.isPreorder" class="basket-tag basket-tag--preorder">{{ t('cart.itemPreorder') }}</span>
                      <span v-if="item.isGiftPackaging" class="basket-tag">{{ t('cart.giftPackaging') }}</span>
                      <p v-if="item.subtitle" class="basket-item-meta">{{ item.subtitle }}</p>
                      <p v-if="item.isPreorder && (item.promisedArrivalFrom || item.promisedArrivalTo)" class="basket-item-meta">{{ t('cart.arrival') }}: {{ item.promisedArrivalFrom || '—' }} – {{ item.promisedArrivalTo || '—' }}</p>
                      <p v-if="item.isPreorder && (item.promisedDeliveryFrom || item.promisedDeliveryTo)" class="basket-item-meta">{{ t('cart.plannedDelivery') }}: {{ item.promisedDeliveryFrom || '—' }} – {{ item.promisedDeliveryTo || '—' }}</p>
                      <p v-if="!item.isPreorder && item.availableQuantity != null && item.quantity >= item.availableQuantity" class="basket-stock-hint">{{ t('cart.maxStock', { n: item.availableQuantity }) }}</p>
                    </div>
                    <FavoriteButton v-if="!item.giftBoxId" class="basket-favorite" :item="{ id: item.id, title: item.title, price: item.price, image: item.image }" />
                  </div>
                  <div class="basket-item-bottom">
                    <div class="basket-price">
                      <strong>{{ formatPrice(item.price * item.quantity) }} ₸</strong>
                      <span v-if="item.compareAtPrice && item.compareAtPrice > item.price" class="basket-old-price">{{ formatPrice(item.compareAtPrice * item.quantity) }} ₸</span>
                      <span v-if="item.compareAtPrice && item.compareAtPrice > item.price" class="basket-sale-badge">−{{ Math.round((1 - item.price / item.compareAtPrice) * 100) }}%</span>
                    </div>
                    <div class="basket-quantity-actions">
                      <div class="basket-stepper" :aria-label="t('cart.quantityLabel')">
                        <button type="button" :aria-label="item.quantity === 1 ? t('cart.removeAria') : t('cart.decreaseQty')" @click="decreaseQty(item)"><AppIcon v-if="item.quantity === 1" name="trash" :size="18" /><template v-else>−</template></button>
                        <span>{{ item.quantity }}</span>
                        <button type="button" :aria-label="t('cart.increaseQty')" :disabled="!canIncreaseItem(item)" :title="canIncreaseItem(item) ? undefined : stockLimitTitle(item)" @click="increaseQty(item)">+</button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </template>
            <p v-if="isMixedCart" class="basket-mixed-hint">{{ t('cart.mixedShipmentsHint') }}</p>
          </div>
          <div v-else class="empty-cart-card">
            <AppIcon name="cart" :size="40" class="empty-icon" />
            <h3>{{ t('cart.emptyTitle') }}</h3>
            <p>{{ t('cart.emptyHint') }}</p>
            <NuxtLink :to="localePath('/shop')" class="to-shop-btn">{{ t('cart.goShop') }} →</NuxtLink>
          </div>
        </div>

        <aside v-if="cartItems.length" class="basket-sidebar">
          <section class="basket-side-card basket-promo-card">
            <h2>{{ t('cart.promotionsTitle') }}</h2>
            <p>{{ t('cart.promotionsHint') }}</p>
            <div class="promo-code-wrap">
              <input v-model="promoInput" type="text" :placeholder="t('cart.promoPlaceholderFull')" class="promo-input" :disabled="isVerifyingPromo" @keyup.enter="applyPromo" />
              <button type="button" class="apply-promo-btn" :disabled="isVerifyingPromo" @click="promoApplied ? removePromo() : applyPromo()">{{ isVerifyingPromo ? t('cart.verifying') : (promoApplied ? t('cart.reset') : t('cart.apply')) }}</button>
            </div>
            <p v-if="appliedGiftCard?.code" class="promo-balance-hint">{{ t('cart.giftCertBalanceOnly', { balance: formatPrice(Number(appliedGiftCard.balance || 0)) }) }}</p>
          </section>
          <section class="basket-side-card basket-total-card">
            <div class="basket-total-header"><h2>{{ t('cart.totalToPay') }}</h2><strong>{{ formatPrice(finalTotal) }} ₸</strong></div>
            <div class="basket-total-rows">
              <div><span>{{ t('cart.selectedGoods', { count: selectedCount }) }}</span><span>{{ formatPrice(itemsSubtotal) }} ₸</span></div>
              <div v-if="savings > 0" class="basket-savings"><span>{{ t('cart.savings') }}</span><strong>{{ formatPrice(savings) }} ₸</strong></div>
              <div><span>{{ t('cart.delivery') }}</span><span>{{ deliveryCost > 0 ? `${formatPrice(deliveryCost)} ₸` : t('cart.free') }}</span></div>
              <div v-if="discountAmount > 0" class="basket-savings"><span>{{ t('cart.giftCertApplied', { code: appliedGiftCard?.code }) }}</span><strong>−{{ formatPrice(discountAmount) }} ₸</strong></div>
            </div>
            <button type="button" class="checkout-submit-btn" :disabled="!someSelected" @click="handleCheckout">{{ t('cart.checkout') }}</button>
            <p v-if="!someSelected" class="basket-select-hint">{{ t('cart.selectForCheckout') }}</p>
          </section>
        </aside>
      </section>
      </ClientOnly>

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
import { cartLineKey, type CartItem } from '~/composables/useCart'

const { t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  robots: 'noindex, nofollow',
})

const { 
  items: cartItems, 
  selectedCartLineKeys,
  setCartSelection,
  increaseQty: incQty, 
  decreaseQty: decQty, 
  removeItem: remItem,
  setAvailableQuantity,
  clearBuyNow,
} = useCart()

const selectedItems = computed(() => {
  if (selectedCartLineKeys.value === null) return cartItems.value
  const selected = new Set(selectedCartLineKeys.value)
  return cartItems.value.filter(item => selected.has(cartLineKey(item)))
})
const someSelected = computed(() => selectedItems.value.length > 0)
const allSelected = computed(() => cartItems.value.length > 0 && selectedItems.value.length === cartItems.value.length)
const selectedCount = computed(() => selectedItems.value.reduce((sum, item) => sum + item.quantity, 0))
const itemsSubtotal = computed(() => selectedItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0))
const savings = computed(() => selectedItems.value.reduce((sum, item) => {
  const oldPrice = Number(item.compareAtPrice)
  return sum + (oldPrice > item.price ? (oldPrice - item.price) * item.quantity : 0)
}, 0))

const isSelected = (item: CartItem) =>
  selectedCartLineKeys.value === null || selectedCartLineKeys.value.includes(cartLineKey(item))

const toggleItem = (item: CartItem) => {
  const current = selectedCartLineKeys.value === null
    ? cartItems.value.map(cartLineKey)
    : [...selectedCartLineKeys.value]
  const key = cartLineKey(item)
  const nextSelection = current.includes(key)
    ? current.filter(value => value !== key)
    : [...current, key]
  setCartSelection(nextSelection.length === cartItems.value.length ? null : nextSelection)
}

const toggleAll = () => {
  setCartSelection(allSelected.value ? [] : null)
}

const removeSelected = () => {
  for (const item of [...selectedItems.value]) remItem(item.id, item.isPreorder)
  setCartSelection(null)
}

const { fetchToys } = useToys()

const {
  pricing: shopPricing,
  fetchPricing: fetchShopPricing,
  deliveryFeeFor,
  amountToFreeDelivery,
  qualifiesForFreeDelivery,
} = useShopDelivery()

const freeDeliveryThreshold = computed(() => shopPricing.value.free_delivery_threshold)

const isMixedCart = computed(() =>
  cartItems.value.some(i => i.isPreorder) && cartItems.value.some(i => !i.isPreorder)
)

const cartGroups = computed(() => {
  const stock = cartItems.value.filter(i => !i.isPreorder)
  const preorder = cartItems.value.filter(i => i.isPreorder)
  const groups = []
  if (stock.length) {
    groups.push({ key: 'stock', title: t('cart.groupInStock'), hint: t('cart.groupInStockHint'), items: stock })
  }
  if (preorder.length) {
    groups.push({ key: 'preorder', title: t('cart.groupPreorder'), hint: t('cart.groupPreorderHint'), items: preorder })
  }
  return groups
})

const deliveryCost = computed(() => {
  return deliveryFeeFor(itemsSubtotal.value, {
    hasItems: someSelected.value,
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
  if (!someSelected.value) return 0
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
  if (!someSelected.value) return
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

.cart-group-header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 12px;
  margin: 8px 0 4px;
  font-size: 15px;
  color: #262626;
}

.cart-group-header span {
  font-size: 13px;
  color: #77572F;
}

.cart-mixed-hint {
  margin: 4px 0 0;
  font-size: 13px;
  color: #666;
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

/* Unified cart, matching the Alpha palette while keeping the reference layout. */
.cart-main-grid { grid-template-columns: minmax(0, 1.8fr) minmax(300px, 0.9fr); gap: 22px; align-items: start; }
.basket-panel, .basket-side-card { background: #fff; border: 1px solid #e9e5dc; border-radius: 20px; box-shadow: 0 8px 30px rgb(39 48 42 / 4%); }
.basket-panel { overflow: hidden; }
.basket-toolbar { min-height: 66px; padding: 13px 22px; display: flex; align-items: center; justify-content: space-between; gap: 16px; border-bottom: 1px solid #eeeae3; }
.basket-select-all, .basket-item-check { display: inline-flex; align-items: center; cursor: pointer; }
.basket-select-all { gap: 10px; font-weight: 700; font-size: 14px; white-space: nowrap; }
.basket-select-all input, .basket-item-check input { width: 20px; height: 20px; margin: 0; accent-color: #42634d; cursor: pointer; flex: none; }
.basket-toolbar-actions { display: flex; align-items: center; gap: 18px; }
.basket-text-action { border: 0; background: none; padding: 8px 0; color: #41604b; font: inherit; font-weight: 700; font-size: 13px; white-space: nowrap; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; }
.basket-text-action:disabled { color: #929a92; cursor: not-allowed; }
.basket-text-action--danger { color: #a54242; }
.basket-text-action--danger:disabled { opacity: .55; }
.basket-group-heading { display: flex; gap: 8px 14px; align-items: baseline; padding: 16px 22px 0; flex-wrap: wrap; }
.basket-group-heading strong { font-size: 14px; }
.basket-group-heading span { font-size: 12px; color: #757f77; }
.basket-item { display: flex; align-items: flex-start; gap: 17px; padding: 22px; border-bottom: 1px solid #eeeae3; transition: opacity 150ms ease; }
.basket-item:last-of-type { border-bottom: 0; }
.basket-item--unselected { opacity: .65; }
.basket-item-check { padding-top: 37px; flex: none; }
.basket-item-image { width: 112px; height: 112px; flex: none; border-radius: 14px; background: #faf8f4; overflow: hidden; }
.basket-item-image img { width: 100%; height: 100%; object-fit: cover; }
.basket-item-body { flex: 1; min-width: 0; }
.basket-item-name-row { display: flex; justify-content: space-between; gap: 8px; min-height: 65px; }
.basket-item-name-row > div { min-width: 0; }
.basket-item-name-row h3 { margin: 0 0 7px; font-family: var(--font-body) !important; font-size: 15px; line-height: 1.35; font-weight: 700; overflow-wrap: anywhere; }
.basket-item-name-row :deep(.basket-favorite) { position: relative; top: auto; right: auto; flex: 0 0 44px; margin: -12px -12px 0 0; }
.basket-tag { display: inline-block; margin: 0 6px 6px 0; padding: 3px 7px; border-radius: 6px; background: #eaf0e9; color: #40624a; font-size: 11px; font-weight: 700; }
.basket-tag--preorder { background: #f8ead5; color: #8b5b21; }
.basket-item-meta { margin: 1px 0 3px; font-size: 12px; line-height: 1.4; color: #798079; }
.basket-stock-hint { margin: 4px 0 0; font-size: 12px; color: #a65b17; }
.basket-item-bottom { display: flex; justify-content: space-between; align-items: flex-end; gap: 14px; margin-top: 20px; }
.basket-price { display: flex; flex-wrap: wrap; align-items: baseline; gap: 5px 10px; }
.basket-price strong { font-size: 20px; line-height: 1.2; white-space: nowrap; }
.basket-old-price { font-size: 12px; text-decoration: line-through; color: #979d98; white-space: nowrap; }
.basket-sale-badge { font-size: 11px; font-weight: 800; border-radius: 5px; padding: 3px 5px; color: #fff; background: #5b9b65; white-space: nowrap; }
.basket-quantity-actions { display: inline-flex; align-items: center; gap: 3px; flex: none; }
.basket-stepper button { width: 34px; height: 34px; display: inline-grid; place-items: center; border: 0; background: transparent; color: #7d8980; cursor: pointer; border-radius: 8px; }
.basket-stepper button:hover:not(:disabled) { background: #f2f4ef; color: #35563d; }
.basket-stepper { display: inline-flex; align-items: center; gap: 3px; }
.basket-stepper button { font-size: 20px; line-height: 1; }
.basket-stepper button:disabled { opacity: .35; cursor: not-allowed; }
.basket-stepper span { min-width: 32px; height: 32px; display: grid; place-items: center; border: 1px solid #dedfd9; border-radius: 8px; font-size: 14px; }
.basket-mixed-hint { margin: 0; padding: 14px 22px; background: #fcf8f0; color: #746046; font-size: 12px; line-height: 1.5; }
.basket-sidebar { display: grid; gap: 14px; }
.basket-side-card { padding: 22px; }
.basket-side-card h2 { margin: 0; font-family: var(--font-body) !important; font-size: 17px; line-height: 1.35; font-weight: 800; }
.basket-promo-card > p { margin: 11px 0 15px; color: #707a71; font-size: 13px; line-height: 1.5; }
.basket-promo-card .promo-code-wrap { margin: 0; }
.basket-promo-card .promo-balance-hint { margin: 9px 0 0; }
.basket-total-header { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; padding-bottom: 18px; border-bottom: 1px solid #eeeae3; }
.basket-total-header strong { font-size: 25px; white-space: nowrap; color: #263b2c; }
.basket-total-rows { display: grid; gap: 13px; padding: 18px 0 22px; }
.basket-total-rows > div { display: flex; justify-content: space-between; gap: 14px; font-size: 13px; }
.basket-total-rows > div span:last-child, .basket-total-rows strong { white-space: nowrap; }
.basket-savings strong { color: #418449; }
.basket-total-card .checkout-submit-btn { box-shadow: none; }
.basket-select-hint { margin: 11px 0 0; color: #7b817b; font-size: 12px; text-align: center; }
.basket-text-action:focus-visible, .basket-stepper button:focus-visible, .checkout-submit-btn:focus-visible { outline: 2px solid #315f40; outline-offset: 2px; }
@media (max-width: 960px) { .cart-main-grid { grid-template-columns: 1fr; } }
@media (max-width: 640px) {
  .page-content { padding-top: 22px; }
  .cart-page-title { font-size: 28px; margin-bottom: 20px; }
  .basket-toolbar { padding: 10px 12px; gap: 6px; }
  .basket-select-all { gap: 6px; font-size: 12px; }
  .basket-toolbar-actions { margin-left: auto; gap: 8px; }
  .basket-text-action { font-size: 11px; }
  .basket-item { padding: 16px 13px; gap: 10px; }
  .basket-item-check { padding-top: 22px; }
  .basket-item-image { width: 72px; height: 72px; border-radius: 10px; }
  .basket-item-name-row h3 { font-size: 13px; }
  .basket-item-bottom { flex-direction: column; align-items: flex-start; gap: 10px; margin-top: 16px; }
  .basket-quantity-actions { align-self: flex-end; }
  .basket-price strong { font-size: 17px; }
  .basket-side-card { padding: 18px; }
}
@media (prefers-reduced-motion: reduce) { .basket-item { transition: none; } }
</style>
