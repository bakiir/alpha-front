<template>
  <div class="history-page">
    <TheHeader />

    <main class="container page-content">
      <!-- Section Header -->
      <section class="history-header-section">
        <div class="header-left">
          <span class="badge-tag">Личный кабинет</span>
          <h1 class="history-main-title">История заказов и наборов</h1>
          <p class="history-subtitle">
            Просматривайте оформленные заказы, статус доставки, аренду товаров и историю наборов по подписке.
          </p>

          <!-- Tabs Switcher -->
          <div class="tabs-switcher">
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'orders' }"
              @click="activeTab = 'orders'"
            >
              📦 Мои заказы ({{ orders.length }})
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'rentals' }"
              @click="activeTab = 'rentals'"
            >
              ⏱ Аренда товаров ({{ rentals.length }})
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'sets' }"
              @click="activeTab = 'sets'"
            >
              🎠 Прошлые наборы
            </button>
          </div>
        </div>

        <div class="header-right">
          <div class="blob-container">
            <div class="blob blob-blue">
              <span class="blob-star">★</span>
            </div>
            <div class="blob blob-yellow"></div>
            <div class="blob blob-mint"></div>
          </div>
        </div>
      </section>

      <!-- TAB 1: E-Commerce Orders History -->
      <div v-if="activeTab === 'orders'" class="orders-tab-content">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Загрузка ваших заказов...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="orders.length === 0" class="empty-orders-card">
          <div class="empty-icon">🛍️</div>
          <h3>У вас пока нет оформленных заказов</h3>
          <p>Перейдите в наш каталог развивающих эко-игрушек и выберите то, что понравится вашему малышу!</p>
          <NuxtLink to="/shop" class="primary-btn">
            Перейти в каталог →
          </NuxtLink>
        </div>

        <!-- Orders List -->
        <div v-else class="orders-list">
          <div 
            v-for="order in orders" 
            :key="order.id" 
            class="order-card"
          >
            <!-- Order Header Bar -->
            <div class="order-card-header">
              <div class="header-left-col">
                <div class="order-num-row">
                  <strong class="order-number">{{ order.order_number || ('#ORD-' + order.id) }}</strong>
                  <span class="order-type-badge" :class="order.order_type === 'toy_buyout' ? 'buyout' : 'shop'">
                    {{ order.order_type === 'toy_buyout' ? '⭐ Выкуп из подписки' : '🛒 Покупка в магазине' }}
                  </span>
                </div>
                <span class="order-date">{{ formatDate(order.created_at) }}</span>
              </div>

              <div class="header-right-col">
                <span class="status-pill" :class="getStatusClass(order.status)">
                  {{ getStatusText(order.status) }}
                </span>
                <span class="order-total">{{ formatPrice(order.total_price) }} ₸</span>
              </div>
            </div>

            <!-- Order Delivery & Meta Info -->
            <div class="order-meta-info">
              <div v-if="order.address" class="meta-item">
                <span class="meta-icon">📍</span>
                <span><strong>Адрес:</strong> {{ order.address }}</span>
              </div>
              <div v-if="order.phone" class="meta-item">
                <span class="meta-icon">📞</span>
                <span><strong>Телефон:</strong> {{ order.phone }}</span>
              </div>
              <div v-if="order.payment_method" class="meta-item">
                <span class="meta-icon">💳</span>
                <span><strong>Оплата:</strong> {{ order.payment_method }} ({{ order.payment_status === 'paid' ? 'Оплачено' : 'Ожидает' }})</span>
              </div>
            </div>

            <!-- Items Table in Order -->
            <div class="order-items-wrap">
              <div 
                v-for="item in (order.items || [])" 
                :key="item.id" 
                class="order-item-row"
              >
                <img 
                  :src="item.toy?.image_url || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=150&q=80'" 
                  :alt="item.toy?.name || 'Товар'" 
                  class="item-img"
                />
                <div class="item-details">
                  <strong class="item-title">{{ item.toy?.name || item.title || 'Развивающая эко-игрушка' }}</strong>
                  <span class="item-meta">Артикул: #TOY-{{ item.toy_id }} • Количество: {{ item.quantity }} шт.</span>
                </div>
                <div class="item-price">
                  {{ formatPrice(item.price * item.quantity) }} ₸
                </div>
              </div>
            </div>

            <!-- Order Card Footer Actions -->
            <div class="order-card-footer">
              <NuxtLink to="/delivery" class="track-delivery-link">
                🚚 Отследить доставку курьером →
              </NuxtLink>
              <NuxtLink to="/support" class="help-link">
                Нужна помощь по заказу?
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: Short-term Rentals History -->
      <div v-if="activeTab === 'rentals'" class="rentals-tab-content">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Загрузка ваших аренд...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="rentals.length === 0" class="empty-orders-card">
          <div class="empty-icon">⏱️</div>
          <h3>У вас пока нет активных аренд</h3>
          <p>Возьмите карнавальные костюмы, брендовые коляски, батуты или автокресла в посуточную аренду.</p>
          <NuxtLink to="/short-rent" class="primary-btn">
            Каталог аренды товаров →
          </NuxtLink>
        </div>

        <!-- Rentals List -->
        <div v-else class="orders-list">
          <div 
            v-for="rental in rentals" 
            :key="rental.id" 
            class="order-card rental-card"
          >
            <!-- Header -->
            <div class="order-card-header">
              <div class="header-left-col">
                <div class="order-num-row">
                  <strong class="order-number">#{{ rental.rental_number || ('RNT-' + rental.id) }}</strong>
                  <span class="order-type-badge rental-badge-tag">
                    ⏱ Краткосрочная аренда
                  </span>
                </div>
                <span class="order-date">Оформлено: {{ formatDate(rental.created_at) }}</span>
              </div>

              <div class="header-right-col">
                <span class="status-pill" :class="getRentalStatusClass(rental.status)">
                  {{ rental.status_label || getRentalStatusText(rental.status) }}
                </span>
                <span class="order-total">{{ formatPrice(rental.total_price) }} ₸</span>
              </div>
            </div>

            <!-- Meta Info -->
            <div class="order-meta-info">
              <div class="meta-item">
                <span class="meta-icon">📅</span>
                <span><strong>Срок аренды:</strong> {{ formatDateSimple(rental.start_date) }} — {{ formatDateSimple(rental.end_date) }} ({{ rental.days_count || 1 }} дн.)</span>
              </div>
              <div v-if="rental.daily_rate" class="meta-item">
                <span class="meta-icon">🏷️</span>
                <span><strong>Тариф:</strong> {{ formatPrice(rental.daily_rate) }} ₸/сутки</span>
              </div>
              <div v-if="rental.deposit_amount" class="meta-item">
                <span class="meta-icon">🛡️</span>
                <span><strong>Залог:</strong> {{ formatPrice(rental.deposit_amount) }} ₸ (возвратный)</span>
              </div>
              <div v-if="rental.delivery_address" class="meta-item">
                <span class="meta-icon">📍</span>
                <span><strong>Адрес доставки:</strong> {{ rental.delivery_address }}</span>
              </div>
              <div v-if="rental.contact_phone" class="meta-item">
                <span class="meta-icon">📞</span>
                <span><strong>Контакт:</strong> {{ rental.contact_phone }}</span>
              </div>
            </div>

            <!-- Item Display -->
            <div class="order-items-wrap">
              <div class="order-item-row">
                <img 
                  :src="rental.toy?.image_url || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=150&q=80'" 
                  :alt="rental.toy?.name || 'Товар в аренду'" 
                  class="item-img"
                />
                <div class="item-details">
                  <strong class="item-title">{{ rental.toy?.name || 'Специальный товар для аренды' }}</strong>
                  <span class="item-meta">Артикул: {{ rental.toy?.sku || ('#TOY-' + rental.toy_id) }} • Категория: {{ rental.toy?.category || 'Аренда' }}</span>
                </div>
                <div class="item-price">
                  {{ formatPrice(rental.total_price) }} ₸
                </div>
              </div>
            </div>

            <!-- Footer & Actions -->
            <div class="order-card-footer">
              <div class="rental-action-buttons">
                <button 
                  v-if="rental.status === 'pending_payment'" 
                  class="pay-rental-btn"
                  @click="openPaymentModal(rental)"
                >
                  💳 Оплатить аренду
                </button>
                <button 
                  v-if="['pending_payment', 'reserved'].includes(rental.status)" 
                  class="cancel-rental-btn"
                  @click="handleCancelRental(rental)"
                >
                  Отменить бронь
                </button>
                <button 
                  v-if="rental.status === 'active'" 
                  class="extend-rental-btn"
                  @click="openExtendModal(rental)"
                >
                  ⏱ Продлить срок аренды
                </button>
                <NuxtLink to="/delivery" class="track-delivery-link">
                  🚚 Статус доставки курьером →
                </NuxtLink>
              </div>

              <NuxtLink to="/support" class="help-link">
                Служба заботы
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: Subscription Sets Timeline (Past Sets & Buyouts) -->
      <div v-if="activeTab === 'sets'" class="sets-tab-content">
        <div class="sets-timeline">
          <!-- SET 1 -->
          <section class="set-section">
            <div class="set-header">
              <h2 class="set-title">Комплект «Младенчество»</h2>
              <p class="set-date">Март — Май 2026</p>
            </div>

            <div class="set-toys-grid">
              <div class="history-toy-card">
                <div class="toy-img-box">
                  <img 
                    src="https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=400&q=80" 
                    alt="Сенсорный кубик" 
                    class="toy-thumb" 
                  />
                </div>
                <div class="toy-info-box">
                  <h3 class="toy-name">Сенсорный кубик с колокольчиком</h3>
                  <span class="favorite-badge">Любимая игрушка</span>
                  <button class="buy-btn" @click="handleBuy('Сенсорный кубик с колокольчиком', '2 900 ₸')">
                    Выкупить за 2 900 ₸
                  </button>
                </div>
              </div>

              <div class="history-toy-card">
                <div class="toy-img-box">
                  <img 
                    src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80" 
                    alt="Радужные погремушки" 
                    class="toy-thumb" 
                  />
                </div>
                <div class="toy-info-box">
                  <h3 class="toy-name">Радужные погремушки</h3>
                  <span class="favorite-badge">Любимая игрушка</span>
                  <button class="buy-btn" @click="handleBuy('Радужные погремушки', '3 200 ₸')">
                    Выкупить за 3 200 ₸
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>

    <!-- Buyout Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="selectedBuyToy" class="modal-overlay" @click.self="selectedBuyToy = null">
          <div class="buy-modal">
            <button class="close-btn" @click="selectedBuyToy = null">&times;</button>
            <h2 class="modal-title">Выкуп игрушки со скидкой 🎁</h2>
            <p class="modal-desc">
              Как подписчик Alpha, вы получаете специальную цену на любимую игрушку вашего малыша.
            </p>

            <div class="buy-details-card">
              <h3>{{ selectedBuyToy.name }}</h3>
              <div class="price-row">
                <span class="special-price">{{ selectedBuyToy.price }}</span>
                <span class="old-price">6 900 ₸</span>
                <span class="discount-badge">-58%</span>
              </div>
            </div>

            <div class="modal-actions">
              <button class="cancel-btn" @click="selectedBuyToy = null">Позже</button>
              <button class="confirm-btn" @click="confirmBuy">Добавить в корзину</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Payment Modal for Rentals -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="payingRental" class="modal-overlay" @click.self="payingRental = null">
          <div class="buy-modal payment-modal">
            <button class="close-btn" @click="payingRental = null">&times;</button>
            <h2 class="modal-title">Оплата аренды 💳</h2>
            <p class="modal-desc">
              Бронь <strong>#{{ payingRental.rental_number }}</strong> ({{ payingRental.toy?.name }})
            </p>

            <!-- Payment Methods -->
            <div class="payment-methods-box">
              <div 
                class="pay-method-card"
                :class="{ selected: paymentMethod === 'kaspi' }"
                @click="paymentMethod = 'kaspi'"
              >
                <div class="pay-radio-circle">
                  <span v-if="paymentMethod === 'kaspi'" class="radio-inner"></span>
                </div>
                <div class="pay-method-icon kaspi-badge">K</div>
                <div class="pay-method-info">
                  <strong>Kaspi QR / Удаленный счет</strong>
                  <span>Быстрая оплата в приложении Kaspi.kz</span>
                </div>
              </div>

              <div 
                class="pay-method-card"
                :class="{ selected: paymentMethod === 'card' }"
                @click="paymentMethod = 'card'"
              >
                <div class="pay-radio-circle">
                  <span v-if="paymentMethod === 'card'" class="radio-inner"></span>
                </div>
                <div class="pay-method-icon card-badge">💳</div>
                <div class="pay-method-info">
                  <strong>Банковской картой онлайн</strong>
                  <span>Visa, MasterCard, Apple Pay</span>
                </div>
              </div>
            </div>

            <!-- Kaspi Mock -->
            <div v-if="paymentMethod === 'kaspi'" class="kaspi-pay-preview">
              <div class="qr-mock-box">
                <div class="qr-code-art">
                  <div class="qr-block top-left"></div>
                  <div class="qr-block top-right"></div>
                  <div class="qr-block bottom-left"></div>
                  <span class="qr-center-text">Kaspi QR</span>
                </div>
              </div>
              <p class="qr-hint">Отсканируйте QR-код в мобильном приложении Kaspi.kz для оплаты</p>
            </div>

            <!-- Card Inputs Mock -->
            <div v-else class="card-inputs-preview">
              <div class="input-grp">
                <label>Номер карты</label>
                <input type="text" placeholder="4400 •••• •••• 1234" maxlength="19" class="m-input" />
              </div>
              <div class="date-row">
                <div class="input-grp">
                  <label>Срок</label>
                  <input type="text" placeholder="MM/YY" maxlength="5" class="m-input" />
                </div>
                <div class="input-grp">
                  <label>CVV</label>
                  <input type="password" placeholder="•••" maxlength="3" class="m-input" />
                </div>
              </div>
            </div>

            <div class="buy-details-card">
              <div class="price-row" style="justify-content: space-between;">
                <span>Сумма к оплате:</span>
                <span class="special-price">{{ formatPrice(payingRental.total_price) }} ₸</span>
              </div>
            </div>

            <div class="modal-actions">
              <button class="cancel-btn" @click="payingRental = null">Отмена</button>
              <button class="confirm-btn pay-submit-btn" :disabled="isPaying" @click="confirmPayRental">
                {{ isPaying ? 'Обработка платежа...' : `Оплатить ${formatPrice(payingRental.total_price)} ₸` }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Extend Rental Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="extendingRental" class="modal-overlay" @click.self="extendingRental = null">
          <div class="buy-modal">
            <button class="close-btn" @click="extendingRental = null">&times;</button>
            <h2 class="modal-title">Продление аренды ⏱️</h2>
            <p class="modal-desc">
              Товар: <strong>{{ extendingRental.toy?.name }}</strong>
            </p>

            <div class="buy-details-card">
              <label style="display: block; font-size: 13px; font-weight: 700; margin-bottom: 8px;">
                На сколько дней продлить?
              </label>
              <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                <button 
                  v-for="d in [3, 7, 14]" 
                  :key="d" 
                  type="button" 
                  class="tab-btn" 
                  :class="{ active: extendDays === d }" 
                  style="flex: 1; text-align: center; padding: 8px;"
                  @click="extendDays = d"
                >
                  +{{ d }} дн.
                </button>
              </div>
              <div class="price-row">
                <span class="special-price">+{{ formatPrice(extendDays * (extendingRental.daily_rate || 1500)) }} ₸</span>
              </div>
            </div>

            <div class="modal-actions">
              <button class="cancel-btn" @click="extendingRental = null">Отмена</button>
              <button class="confirm-btn" :disabled="isExtending" @click="confirmExtendRental">
                {{ isExtending ? 'Продлеваем...' : 'Подтвердить продление' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TheHeader from '~/components/TheHeader.vue'

const route = useRoute()
const initialTab = (route.query.tab as 'orders' | 'rentals' | 'sets') || 'orders'
const activeTab = ref<'orders' | 'rentals' | 'sets'>(['orders', 'rentals', 'sets'].includes(initialTab) ? initialTab : 'orders')
const isLoading = ref(true)
const orders = ref<any[]>([])
const rentals = ref<any[]>([])

const { fetchMyOrders } = useOrders()
const { fetchMyRentals, cancelRental, payRental, extendRental } = useRentals()
const { addItem } = useCart()

const loadData = async () => {
  isLoading.value = true
  try {
    const [ordersRes, rentalsRes] = await Promise.allSettled([
      fetchMyOrders(),
      fetchMyRentals()
    ])

    if (ordersRes.status === 'fulfilled' && ordersRes.value?.data) {
      orders.value = ordersRes.value.data
    }
    if (rentalsRes.status === 'fulfilled' && rentalsRes.value?.data) {
      rentals.value = rentalsRes.value.data
    }
  } catch (e) {
    console.error('Error fetching history:', e)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadData()
})

const getStatusClass = (status: string) => {
  switch (status) {
    case 'delivered': return 'delivered'
    case 'paid': return 'paid'
    case 'shipped': return 'shipped'
    case 'new': return 'new'
    case 'cancelled': return 'cancelled'
    default: return 'pending'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'new': return '🆕 Новый заказ'
    case 'paid': return '🟢 Оплачен'
    case 'shipped': return '🚚 В пути'
    case 'delivered': return '🎁 Доставлен'
    case 'cancelled': return '⛔ Отменен'
    default: return 'Ожидает'
  }
}

const getRentalStatusClass = (status: string) => {
  switch (status) {
    case 'active': return 'paid'
    case 'reserved': return 'shipped'
    case 'returned': return 'delivered'
    case 'pending_payment': return 'new'
    case 'cancelled': return 'cancelled'
    default: return 'pending'
  }
}

const getRentalStatusText = (status: string) => {
  switch (status) {
    case 'pending_payment': return '⏳ Ожидает оплаты'
    case 'reserved': return '📅 Забронировано'
    case 'active': return '✨ В аренде'
    case 'returned': return '✓ Возвращен'
    case 'cancelled': return '⛔ Отменен'
    default: return status
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDateSimple = (dateStr: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short'
  })
}

const formatPrice = (val: number | string) => {
  const num = Number(val) || 0
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

const selectedBuyToy = ref<{ name: string; price: string; image?: string } | null>(null)

const handleBuy = (name: string, price: string) => {
  selectedBuyToy.value = { 
    name, 
    price,
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=400&q=80'
  }
}

const confirmBuy = () => {
  if (selectedBuyToy.value) {
    addItem({
      id: 1,
      title: selectedBuyToy.value.name,
      price: selectedBuyToy.value.price,
      image: selectedBuyToy.value.image || 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=400&q=80'
    })
    alert(`Игрушка «${selectedBuyToy.value.name}» добавлена в корзину!`)
    selectedBuyToy.value = null
  }
}

// Rental Actions
const handleCancelRental = async (rental: any) => {
  if (!confirm(`Вы уверены, что хотите отменить бронь #${rental.rental_number}?`)) return
  try {
    await cancelRental(rental.id)
    loadData()
  } catch (e: any) {
    alert(e?.data?.message || 'Не удалось отменить бронь.')
  }
}

// Payment Modal State
const payingRental = ref<any>(null)
const paymentMethod = ref<'kaspi' | 'card'>('kaspi')
const isPaying = ref(false)

const openPaymentModal = (rental: any) => {
  payingRental.value = rental
  paymentMethod.value = 'kaspi'
}

const confirmPayRental = async () => {
  if (!payingRental.value) return
  isPaying.value = true
  try {
    await payRental(payingRental.value.id)
    payingRental.value = null
    loadData()
  } catch (e: any) {
    alert(e?.data?.message || 'Ошибка при оплате.')
  } finally {
    isPaying.value = false
  }
}

const extendingRental = ref<any>(null)
const extendDays = ref(3)
const isExtending = ref(false)

const openExtendModal = (rental: any) => {
  extendingRental.value = rental
  extendDays.value = 3
}

const confirmExtendRental = async () => {
  if (!extendingRental.value) return
  isExtending.value = true
  try {
    await extendRental(extendingRental.value.id, extendDays.value)
    extendingRental.value = null
    loadData()
  } catch (e: any) {
    alert(e?.data?.message || 'Не удалось продлить аренду.')
  } finally {
    isExtending.value = false
  }
}
</script>

<style scoped>
.history-page {
  min-height: 100vh;
  background-color: #FFF8F0;
  color: #1A1A2E;
  font-family: 'DM Sans', sans-serif;
  padding-bottom: 80px;
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

.history-header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 36px;
  position: relative;
}

.badge-tag {
  display: inline-block;
  background: #F0EDFF;
  color: #7C5CFC;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 12px;
  letter-spacing: 1px;
  padding: 4px 14px;
  border-radius: 12px;
  margin-bottom: 12px;
  text-transform: uppercase;
}

.history-main-title {
  font-family: 'Outfit', sans-serif;
  font-size: 38px;
  font-weight: 800;
  color: #1A1A2E;
  margin-bottom: 10px;
  letter-spacing: -0.5px;
}

.history-subtitle {
  font-size: 16px;
  color: #7B7B93;
  margin-bottom: 24px;
  max-width: 600px;
}

.tabs-switcher {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.tab-btn {
  background: #FFFFFF;
  border: 1px solid #E2E2EC;
  padding: 10px 22px;
  border-radius: 16px;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 15px;
  color: #4A4A68;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background: #F4F4F8;
}

.tab-btn.active {
  background: #7C5CFC;
  border-color: #7C5CFC;
  color: #FFFFFF;
  box-shadow: 0 4px 14px rgba(124, 92, 252, 0.3);
}

.loading-state,
.empty-orders-card {
  background: #FFFFFF;
  border-radius: 28px;
  padding: 50px 30px;
  text-align: center;
  border: 1px solid rgba(0,0,0,0.04);
  box-shadow: 0 4px 20px rgba(0,0,0,0.02);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-orders-card h3 {
  font-family: 'Outfit', sans-serif;
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 8px;
}

.empty-orders-card p {
  color: #7B7B93;
  max-width: 480px;
  margin: 0 auto 24px auto;
}

.primary-btn {
  display: inline-block;
  background: #7C5CFC;
  color: #FFFFFF;
  text-decoration: none;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  padding: 12px 28px;
  border-radius: 16px;
  transition: background 0.2s;
}

.primary-btn:hover {
  background: #6848E0;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.order-card {
  background: #FFFFFF;
  border-radius: 24px;
  padding: 24px 28px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.02);
}

.order-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 16px;
  border-bottom: 1px solid #F4F4F8;
  margin-bottom: 16px;
}

.order-num-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.order-number {
  font-family: 'Outfit', sans-serif;
  font-size: 19px;
  color: #1A1A2E;
}

.order-type-badge {
  font-size: 11px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 10px;
}

.order-type-badge.buyout {
  background: #E8F8F3;
  color: #06D6A0;
}

.order-type-badge.shop {
  background: #F0EDFF;
  color: #7C5CFC;
}

.rental-badge-tag {
  background: #FFF3D6;
  color: #B37D00;
}

.order-date {
  font-size: 13px;
  color: #7B7B93;
}

.header-right-col {
  display: flex;
  align-items: center;
  gap: 14px;
}

.status-pill {
  font-size: 12px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 12px;
}

.status-pill.new { background: #FFF3D6; color: #B37D00; }
.status-pill.paid { background: #E8F8F3; color: #06D6A0; }
.status-pill.shipped { background: #E1F0FF; color: #1E88E5; }
.status-pill.delivered { background: #F0EDFF; color: #7C5CFC; }
.status-pill.cancelled { background: #FFE8E8; color: #E63946; }

.order-total {
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 800;
  color: #1A1A2E;
}

.order-meta-info {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  background: #FAF9FE;
  padding: 12px 18px;
  border-radius: 14px;
  font-size: 13px;
  color: #4A4A68;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.order-items-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 18px;
}

.order-item-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px dashed #ECECF4;
}

.order-item-row:last-child {
  border-bottom: none;
}

.item-img {
  width: 54px;
  height: 54px;
  object-fit: cover;
  border-radius: 12px;
  background: #F4F4F8;
}

.item-details {
  flex: 1;
}

.item-title {
  font-size: 15px;
  color: #1A1A2E;
  display: block;
}

.item-meta {
  font-size: 12.5px;
  color: #7B7B93;
}

.item-price {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 16px;
  color: #1A1A2E;
}

.order-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 14px;
  border-top: 1px solid #F4F4F8;
  flex-wrap: wrap;
  gap: 12px;
}

.rental-action-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.pay-rental-btn {
  background: #06D6A0;
  color: #FFFFFF;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: 0.2s;
}

.pay-rental-btn:hover {
  background: #05b88a;
}

.cancel-rental-btn {
  background: #F4F4F8;
  color: #E63946;
  border: 1px solid #E2E2EC;
  padding: 8px 14px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: 0.2s;
}

.cancel-rental-btn:hover {
  background: #FFE8E8;
}

.extend-rental-btn {
  background: #7C5CFC;
  color: #FFFFFF;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: 0.2s;
}

.extend-rental-btn:hover {
  background: #624CE0;
}

.track-delivery-link {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 13.5px;
  color: #7C5CFC;
  text-decoration: none;
}

.track-delivery-link:hover {
  text-decoration: underline;
}

.help-link {
  font-size: 13px;
  color: #7B7B93;
  text-decoration: none;
}

/* SETS SECTION */
.set-section {
  background: #FFFFFF;
  border-radius: 28px;
  padding: 30px;
  margin-bottom: 30px;
  border: 1px solid rgba(0,0,0,0.04);
}

.set-title {
  font-family: 'Outfit', sans-serif;
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 4px;
}

.set-date {
  font-size: 13.5px;
  color: #7B7B93;
  margin-bottom: 20px;
}

.set-toys-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.history-toy-card {
  display: flex;
  gap: 16px;
  align-items: center;
  background: #FAF9FE;
  padding: 16px;
  border-radius: 18px;
}

.toy-thumb {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 14px;
}

.toy-name {
  font-size: 14.5px;
  font-weight: 700;
  margin-bottom: 4px;
}

.favorite-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  color: #FFB703;
  margin-bottom: 8px;
}

.buy-btn {
  display: block;
  background: #7C5CFC;
  color: white;
  border: none;
  font-weight: 700;
  font-size: 12.5px;
  padding: 6px 14px;
  border-radius: 10px;
  cursor: pointer;
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

.buy-modal {
  position: relative;
  background: #FFFFFF;
  border-radius: 28px;
  max-width: 480px;
  width: 100%;
  padding: 32px;
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
}

.modal-title {
  font-family: 'Outfit', sans-serif;
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 8px;
}

.modal-desc {
  font-size: 14px;
  color: #7B7B93;
  margin-bottom: 20px;
  line-height: 1.45;
}

/* Payment Methods */
.payment-methods-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.pay-method-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1.5px solid #E2E2EC;
  border-radius: 14px;
  cursor: pointer;
  transition: 0.2s;
}

.pay-method-card:hover {
  border-color: #7C5CFC;
  background: #FAF9FE;
}

.pay-method-card.selected {
  border-color: #7C5CFC;
  background: #F0EDFF;
}

.pay-radio-circle {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid #7C5CFC;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radio-inner {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #7C5CFC;
}

.pay-method-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 800;
}

.kaspi-badge {
  background: #F14635;
  color: #FFFFFF;
}

.card-badge {
  background: #E8E8EE;
}

.pay-method-info {
  display: flex;
  flex-direction: column;
}

.pay-method-info strong {
  font-size: 14px;
  color: #1A1A2E;
}

.pay-method-info span {
  font-size: 12px;
  color: #7B7B93;
}

.kaspi-pay-preview {
  text-align: center;
  background: #FAF9FE;
  padding: 16px;
  border-radius: 16px;
  margin-bottom: 16px;
}

.qr-mock-box {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.qr-code-art {
  width: 100px;
  height: 100px;
  background: #FFFFFF;
  border: 2px solid #1A1A2E;
  border-radius: 12px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.qr-block {
  position: absolute;
  width: 22px;
  height: 22px;
  background: #1A1A2E;
  border-radius: 4px;
}

.qr-block.top-left { top: 8px; left: 8px; }
.qr-block.top-right { top: 8px; right: 8px; }
.qr-block.bottom-left { bottom: 8px; left: 8px; }

.qr-center-text {
  font-size: 10px;
  font-weight: 800;
  background: #F14635;
  color: #FFFFFF;
  padding: 2px 6px;
  border-radius: 4px;
  z-index: 2;
}

.qr-hint {
  font-size: 12px;
  color: #7B7B93;
  line-height: 1.4;
  margin: 0;
}

.card-inputs-preview {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #FAF9FE;
  padding: 14px;
  border-radius: 16px;
  margin-bottom: 16px;
}

.input-grp {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.input-grp label {
  font-size: 12.5px;
  font-weight: 700;
}

.m-input {
  padding: 10px 12px;
  border: 1.5px solid #E2E2EC;
  border-radius: 10px;
  font-size: 13.5px;
  outline: none;
}

.date-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.buy-details-card {
  background: #FAF9FE;
  padding: 16px;
  border-radius: 16px;
  margin-bottom: 20px;
}

.special-price {
  font-family: 'Outfit', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #7C5CFC;
}

.old-price {
  font-size: 15px;
  color: #7B7B93;
  text-decoration: line-through;
  margin: 0 10px;
}

.discount-badge {
  background: #06D6A0;
  color: white;
  font-size: 12px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 8px;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.cancel-btn, .confirm-btn {
  flex: 1;
  padding: 12px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
}

.cancel-btn {
  background: #F4F4F8;
  border: none;
  color: #4A4A68;
}

.confirm-btn {
  background: #7C5CFC;
  border: none;
  color: #FFFFFF;
}

.confirm-btn.pay-submit-btn {
  background: #06D6A0;
}

.confirm-btn.pay-submit-btn:hover:not(:disabled) {
  background: #05b88a;
}

.confirm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Spinner */
.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #E2E2EC;
  border-top-color: #7C5CFC;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 12px auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .order-card-header {
    flex-direction: column;
    gap: 10px;
  }
  .header-right-col {
    width: 100%;
    justify-content: space-between;
  }
  .order-card-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
