<template>
  <div class="cart-page">
    <TheHeader />

    <main class="container page-content">
      <!-- Title -->
      <h1 class="cart-page-title">Ваша корзина</h1>

      <!-- Main Cart 2-Column Section -->
      <section class="cart-main-grid">
        <!-- LEFT: Items List -->
        <div class="cart-items-col">
          <div v-if="cartItems.length > 0" class="items-list">
            <div 
              v-for="item in cartItems" 
              :key="item.id" 
              class="cart-item-card"
            >
              <!-- Image -->
              <div class="item-thumb-wrap">
                <img :src="item.image" :alt="item.title" class="item-thumb" />
              </div>

              <!-- Title & Meta -->
              <div class="item-info-block">
                <h3 class="item-title">{{ item.title }}</h3>
                <p class="item-subtitle">
                  {{ item.subtitle || 'Возраст: 1–2 года • Эко-дерево' }}
                </p>
              </div>

              <!-- Controls & Price -->
              <div class="item-actions-block">
                <!-- Stepper -->
                <div class="qty-stepper">
                  <button class="step-btn" @click="decreaseQty(item)">-</button>
                  <span class="step-count">{{ item.quantity }}</span>
                  <button class="step-btn" @click="increaseQty(item)">+</button>
                </div>

                <!-- Price -->
                <span class="item-price-val">
                  {{ formatPrice(item.price * item.quantity) }} ₸
                </span>

                <!-- Trash Delete Button -->
                <button class="trash-btn" aria-label="Удалить" @click="removeItem(item)">
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
            <span class="empty-icon">🛒</span>
            <h3>Ваша корзина пуста</h3>
            <p>Выберите развивающие эко-игрушки в нашем магазине.</p>
            <NuxtLink to="/shop" class="to-shop-btn">Перейти в магазин →</NuxtLink>
          </div>
        </div>

        <!-- RIGHT: Order Details Summary -->
        <div class="order-details-col">
          <div class="details-card">
            <h2 class="details-heading">Детали заказа</h2>

            <div class="cost-rows">
              <div class="cost-row">
                <span class="cost-label">Стоимость товаров</span>
                <strong class="cost-val">{{ formatPrice(itemsSubtotal) }} ₸</strong>
              </div>

              <div class="cost-row">
                <span class="cost-label">Доставка</span>
                <strong class="cost-val">{{ deliveryCost > 0 ? `${formatPrice(deliveryCost)} ₸` : 'Бесплатно' }}</strong>
              </div>

              <div v-if="discountAmount > 0" class="cost-row discount-row">
                <span class="cost-label">Скидка по промокоду</span>
                <strong class="cost-val">-{{ formatPrice(discountAmount) }} ₸</strong>
              </div>
            </div>

            <!-- Promo Code Input -->
            <div class="promo-code-wrap">
              <input 
                v-model="promoInput" 
                type="text" 
                placeholder="Промокод" 
                class="promo-input"
                @keyup.enter="applyPromo"
              />
              <button class="apply-promo-btn" @click="applyPromo">
                {{ promoApplied ? 'Применен ✓' : 'Применить' }}
              </button>
            </div>

            <!-- Total Row -->
            <div class="total-pay-row">
              <span class="total-pay-label">Итого к оплате</span>
              <span class="total-pay-val">{{ formatPrice(finalTotal) }} ₸</span>
            </div>

            <!-- Checkout Button -->
            <button 
              class="checkout-submit-btn" 
              :disabled="cartItems.length === 0"
              @click="navigateTo('/checkout')"
            >
              Оформить заказ
            </button>
          </div>
        </div>
      </section>

      <!-- ALSO ADD SECTION (Upsell Recommendations) -->
      <section class="upsell-section">
        <h2 class="upsell-title">Не забудьте добавить в заказ</h2>

        <div class="upsell-grid">
          <div 
            v-for="rec in upsellProducts" 
            :key="rec.id" 
            class="upsell-card"
          >
            <div class="upsell-img-wrap" @click="navigateToProduct(rec)">
              <img :src="rec.image" :alt="rec.title" class="upsell-img" />
            </div>

            <div class="upsell-info">
              <div class="upsell-badges">
                <span class="upsell-age-badge">{{ rec.age }}</span>
                <span class="upsell-skill-badge">{{ rec.skill }}</span>
              </div>

              <h3 class="upsell-card-title" @click="navigateToProduct(rec)">
                {{ rec.title }}
              </h3>

              <div class="upsell-bottom-row">
                <span class="upsell-price">{{ formatPrice(rec.price) }} ₸</span>
                <button 
                  class="upsell-buy-btn"
                  :class="{ added: addedUpsells.includes(rec.id) }"
                  @click="addUpsellToCart(rec)"
                >
                  {{ addedUpsells.includes(rec.id) ? 'Добавлено ✓' : 'В корзину' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Checkout Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isCheckoutOpen" class="modal-overlay" @click.self="isCheckoutOpen = false">
          <div class="checkout-modal">
            <button class="close-btn" @click="isCheckoutOpen = false">&times;</button>
            <h2 class="modal-title">Оформление заказа</h2>
            <p class="modal-desc">Курьерская доставка по Алматы и Казахстану.</p>

            <div class="checkout-form">
              <div class="form-group">
                <label>Имя получателя</label>
                <input v-model="orderForm.name" type="text" placeholder="Анна" class="modal-input" />
              </div>

              <div class="form-group">
                <label>Телефон</label>
                <input v-model="orderForm.phone" type="tel" placeholder="+7 (701) 123-4567" class="modal-input" />
              </div>

              <div class="form-group">
                <label>Адрес доставки</label>
                <input v-model="orderForm.address" type="text" placeholder="г. Алматы, ул. Желтоксан 115, кв. 42" class="modal-input" />
              </div>

              <div class="form-group">
                <label>Способ оплаты</label>
                <div class="payment-radios">
                  <label class="radio-card">
                    <input v-model="orderForm.payment" type="radio" value="kaspi" />
                    <span>Kaspi QR / Удаленный счет</span>
                  </label>
                  <label class="radio-card">
                    <input v-model="orderForm.payment" type="radio" value="card" />
                    <span>Банковской картой онлайн</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button class="cancel-btn" @click="isCheckoutOpen = false">Отмена</button>
              <button class="confirm-btn" @click="submitOrder">
                Оплатить {{ formatPrice(finalTotal) }} ₸
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TheHeader from '~/components/TheHeader.vue'

const { 
  items: cartItems, 
  totalPrice: itemsSubtotal, 
  increaseQty: incQty, 
  decreaseQty: decQty, 
  removeItem: remItem, 
  addItem,
  clearCart 
} = useCart()

// Ensure initial demo items match Figma if empty
if (cartItems.value.length === 0) {
  cartItems.value.push(
    {
      id: 101,
      title: 'Геометрический Сортер',
      price: 4900,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 202,
      title: 'Бусы-шнуровка Лесные Животные',
      price: 3800,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=400&q=80'
    }
  )
}

const deliveryCost = ref(1200)
const promoInput = ref('')
const promoApplied = ref(false)
const discountAmount = ref(0)
const isCheckoutOpen = ref(false)
const addedUpsells = ref<number[]>([])

const orderForm = ref({
  name: 'Анна',
  phone: '+7 (701) 123-4567',
  address: 'г. Алматы, ул. Желтоксан 115, кв. 42',
  payment: 'kaspi'
})

const finalTotal = computed(() => {
  if (cartItems.value.length === 0) return 0
  return Math.max(0, itemsSubtotal.value + deliveryCost.value - discountAmount.value)
})

const applyPromo = () => {
  if (!promoInput.value.trim()) return
  promoApplied.value = true
  discountAmount.value = Math.round(itemsSubtotal.value * 0.1) // 10% discount
  alert(`Промокод ${promoInput.value.toUpperCase()} применен! Скидка: ${formatPrice(discountAmount.value)} ₸`)
}

const increaseQty = (item: any) => {
  incQty(item.id)
}

const decreaseQty = (item: any) => {
  decQty(item.id)
}

const removeItem = (item: any) => {
  remItem(item.id)
}

const formatPrice = (val: number) => {
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

// Upsell Products
const upsellProducts = ref([
  {
    id: 301,
    title: 'Эко-погремушка Листочек',
    age: '0–1 года',
    skill: 'Сенсорика',
    price: 2900,
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 302,
    title: 'Тактильные карточки с буквами',
    age: '2–3 года',
    skill: 'Речь',
    price: 5100,
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 303,
    title: 'Ящик с Инструментами',
    age: '3–4 года',
    skill: 'Творчество',
    price: 8500,
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=500&q=80'
  }
])

const addUpsellToCart = (rec: any) => {
  addItem({
    id: rec.id,
    title: rec.title,
    price: rec.price,
    image: rec.image
  })
  if (!addedUpsells.value.includes(rec.id)) {
    addedUpsells.value.push(rec.id)
    setTimeout(() => {
      const idx = addedUpsells.value.indexOf(rec.id)
      if (idx > -1) addedUpsells.value.splice(idx, 1)
    }, 2000)
  }
}

const navigateToProduct = (rec: any) => {
  navigateTo(`/product/${rec.id}`)
}

const submitOrder = () => {
  alert(`Заказ на сумму ${formatPrice(finalTotal.value)} ₸ успешно оформлен! Курьер доставит игрушки в ближайшее время.`)
  clearCart()
  isCheckoutOpen.value = false
}
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  background-color: #FFF8F0;
  color: #1A1A2E;
  font-family: 'DM Sans', sans-serif;
  padding-bottom: 90px;
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

.cart-page-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 34px;
  color: #1A1A2E;
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
  background: #FFFFFF;
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
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 16.5px;
  color: #1A1A2E;
  margin-bottom: 3px;
  line-height: 1.3;
}

.item-subtitle {
  font-size: 12.5px;
  color: #7B7B93;
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
  background: #F4F4F8;
  border-radius: 10px;
  padding: 4px 10px;
}

.step-btn {
  background: transparent;
  border: none;
  font-size: 15px;
  font-weight: 800;
  color: #4A4A68;
  cursor: pointer;
  padding: 2px 4px;
}

.step-count {
  font-weight: 700;
  font-size: 13.5px;
  color: #1A1A2E;
  min-width: 12px;
  text-align: center;
}

.item-price-val {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 17.5px;
  color: #1A1A2E;
  min-width: 80px;
  text-align: right;
}

.trash-btn {
  background: #F4F4F8;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7B7B93;
  cursor: pointer;
  transition: all 0.2s ease;
}

.trash-btn:hover {
  background: #FFE8EC;
  color: #E63946;
}

/* Empty State Card */
.empty-cart-card {
  background: #FFFFFF;
  border-radius: 20px;
  padding: 48px 24px;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.empty-icon {
  font-size: 42px;
  display: block;
  margin-bottom: 12px;
}

.to-shop-btn {
  display: inline-block;
  margin-top: 16px;
  background: #7C5CFC;
  color: #FFFFFF;
  font-weight: 700;
  font-size: 14px;
  padding: 10px 22px;
  border-radius: 12px;
  text-decoration: none;
}

/* Right Details Summary Card */
.details-card {
  background: #FFFFFF;
  border-radius: 24px;
  padding: 28px 28px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
}

.details-heading {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 20px;
  color: #1A1A2E;
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
  color: #7B7B93;
}

.cost-val {
  color: #1A1A2E;
  font-weight: 800;
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
}

.discount-row .cost-val {
  color: #06D6A0;
}

/* Promo Code Box */
.promo-code-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #EAEAF2;
  border-radius: 14px;
  padding: 4px 6px 4px 16px;
  margin-bottom: 22px;
}

.promo-input {
  border: none;
  background: transparent;
  outline: none;
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px;
  color: #1A1A2E;
  width: 100%;
}

.promo-input::placeholder {
  color: #A0A0B8;
}

.apply-promo-btn {
  background: none;
  border: none;
  color: #7C5CFC;
  font-family: 'DM Sans', sans-serif;
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
  border-top: 1px solid #F4F4F8;
  margin-bottom: 22px;
}

.total-pay-label {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 17px;
  color: #1A1A2E;
}

.total-pay-val {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 24px;
  color: #624CE0;
}

.checkout-submit-btn {
  background: #624CE0;
  color: #FFFFFF;
  border: none;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 15px;
  padding: 14px;
  border-radius: 14px;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(98, 76, 224, 0.25);
  transition: all 0.2s ease;
  width: 100%;
}

.checkout-submit-btn:hover:not(:disabled) {
  background: #513bc7;
  transform: translateY(-1px);
}

.checkout-submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Upsell Recommendations */
.upsell-section {
  margin-top: 12px;
}

.upsell-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 24px;
  color: #1A1A2E;
  margin-bottom: 24px;
}

.upsell-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.upsell-card {
  background: #FFFFFF;
  border-radius: 24px;
  padding: 16px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.upsell-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(124, 92, 252, 0.08);
}

.upsell-img-wrap {
  height: 190px;
  border-radius: 18px;
  background: #F4F8FC;
  overflow: hidden;
  cursor: pointer;
  margin-bottom: 14px;
}

.upsell-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.upsell-card:hover .upsell-img {
  transform: scale(1.04);
}

.upsell-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.upsell-badges {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.upsell-age-badge {
  background: #FFF1C5;
  color: #7A5300;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 12px;
}

.upsell-skill-badge {
  background: #D9F7EC;
  color: #058563;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 12px;
}

.upsell-card-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 16px;
  color: #1A1A2E;
  margin-bottom: 14px;
  cursor: pointer;
  line-height: 1.3;
}

.upsell-card-title:hover {
  color: #7C5CFC;
}

.upsell-bottom-row {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upsell-price {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 19px;
  color: #1A1A2E;
}

.upsell-buy-btn {
  background: #624CE0;
  color: #FFFFFF;
  border: none;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 13px;
  padding: 8px 18px;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(98, 76, 224, 0.25);
  transition: all 0.2s ease;
}

.upsell-buy-btn:hover {
  background: #513bc7;
}

.upsell-buy-btn.added {
  background: #06D6A0;
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
  background: #FFFFFF;
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
  background: #F4F4F8;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4A4A68;
}

.modal-title {
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 6px;
}

.modal-desc {
  font-size: 14px;
  color: #7B7B93;
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
  color: #1A1A2E;
}

.modal-input {
  padding: 12px 16px;
  border: 1.5px solid #E2E2EC;
  border-radius: 12px;
  font-size: 14px;
  color: #1A1A2E;
  outline: none;
  font-family: 'DM Sans', sans-serif;
}

.modal-input:focus {
  border-color: #7C5CFC;
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
  border: 1px solid #EAEAF2;
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
  background: #F4F4F8;
  border: none;
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

.confirm-btn {
  background: #7C5CFC;
  color: #FFFFFF;
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

  .upsell-grid {
    grid-template-columns: 1fr;
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
