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
            Просматривайте оформленные заказы, статус доставки и историю наборов по подписке.
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
              ⏱️ Краткосрочная аренда ({{ rentals.length }})
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

      <!-- TAB 3: Short Rentals History -->
      <div v-if="activeTab === 'rentals'" class="orders-tab-content">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Загрузка ваших аренд...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="rentals.length === 0" class="empty-orders-card">
          <div class="empty-icon">⏱️</div>
          <h3>У вас пока нет активных аренд</h3>
          <p>Попробуйте наш сервис краткосрочной аренды игрушек!</p>
          <NuxtLink to="/short-rent" class="primary-btn">
            Перейти к тарифам →
          </NuxtLink>
        </div>

        <!-- Rentals List -->
        <div v-else class="orders-list">
          <div v-for="rental in rentals" :key="rental.id" class="order-card">
            <!-- Header -->
            <div class="order-card-header">
              <div class="order-num-row">
                <span class="order-number">Бронь #{{ rental.rental_number }}</span>
                <span class="order-type-badge shop" style="background:#FFF3E0;color:#F57C00;">Аренда</span>
              </div>
              <div class="header-right-col">
                <span class="order-date">{{ new Date(rental.created_at || rental.start_date).toLocaleDateString('ru-RU') }}</span>
                <span class="order-status-badge" :class="rental.status">{{ getStatusName(rental.status) }}</span>
              </div>
            </div>

            <!-- Meta details -->
            <div class="order-meta-info">
              <div class="meta-item">
                <span class="meta-icon">💰</span>
                <span><strong>Сумма:</strong> {{ formatPrice(rental.total_price) }} ₸</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">📅</span>
                <span><strong>Даты:</strong> {{ new Date(rental.start_date).toLocaleDateString('ru-RU') }} — {{ new Date(rental.end_date).toLocaleDateString('ru-RU') }}</span>
              </div>
              <div class="meta-item" v-if="rental.notes && rental.notes.includes('Интервал')">
                <span class="meta-icon">🚚</span>
                <span><strong>{{ rental.notes }}</strong></span>
              </div>
            </div>

            <!-- Single Toy Rental Item (from product/[id] rent flow) -->
            <div class="order-items-wrap" v-if="rental.toy">
              <div class="order-item-row">
                <img 
                  :src="rental.toy.image_url && !rental.toy.image_url.includes('placeholder') ? rental.toy.image_url : 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=150&q=80'" 
                  :alt="rental.toy.name" 
                  class="item-img"
                />
                <div class="item-details">
                  <strong class="item-title">{{ rental.toy.name }}</strong>
                  <span class="item-meta">Артикул: #TOY-{{ rental.toy.id }} • Посуточная аренда</span>
                </div>
                <div class="item-price">
                  {{ formatPrice(rental.daily_rate) }} ₸ / день
                </div>
              </div>
            </div>

            <!-- Toys List from Notes (for package bookings) -->
            <div class="order-items-wrap" v-else-if="parseToysFromNotes(rental.notes).length > 0">
              <div style="margin-bottom: 12px; font-weight: 700; color: #1A1A2E;">Выбранные игрушки:</div>
              <div 
                v-for="(toyName, idx) in parseToysFromNotes(rental.notes)" 
                :key="idx" 
                class="order-item-row"
                style="padding: 8px 0; border-bottom: none;"
              >
                <div class="item-details" style="flex-direction: row; align-items: center; gap: 12px;">
                  <span style="font-size: 20px;">🧸</span>
                  <strong class="item-title" style="font-size: 15px;">{{ toyName }}</strong>
                </div>
              </div>
            </div>

            <!-- Order Card Footer Actions -->
            <div class="order-card-footer">
              <div class="rental-action-buttons">
                <NuxtLink 
                  v-if="rental.status === 'pending_payment'" 
                  :to="`/payment?type=rental&id=${rental.rental_number || rental.id}&amount=${rental.total_price}`"
                  class="action-pill-btn" 
                  style="background: #7C5CFC; color: #FFFFFF; font-weight: 700; text-decoration: none;"
                >
                  💳 Оплатить аренду
                </NuxtLink>
                <NuxtLink v-else to="/delivery" class="track-delivery-link">
                  🚚 Курьер и доставка →
                </NuxtLink>
                <button 
                  v-if="rental.status === 'reserved' || rental.status === 'active'"
                  class="action-pill-btn extend-btn" 
                  @click="openExtendModal(rental)"
                >
                  🔄 Продлить аренду
                </button>
                <button 
                  v-if="rental.status === 'reserved' || rental.status === 'pending_payment'" 
                  class="action-pill-btn cancel-btn-text" 
                  @click="handleCancelRental(rental)"
                >
                  ❌ Отменить бронь
                </button>
              </div>
              <NuxtLink to="/support" class="help-link">
                Нужна помощь по аренде?
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: Subscription Sets Timeline (Past Sets & Buyouts) -->
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

    <!-- Extend Rental Modal (ТЗ п. 21) -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isExtendModalOpen" class="modal-overlay" @click.self="isExtendModalOpen = false">
          <div class="buy-modal">
            <button class="close-btn" @click="isExtendModalOpen = false">&times;</button>
            <h2 class="modal-title">Продление аренды 🔄</h2>
            <p class="modal-desc">
              Бронь <strong>#{{ selectedRentalToExtend?.rental_number }}</strong><br />
              Товар: <strong>{{ selectedRentalToExtend?.toy?.name || 'Арендованный товар' }}</strong>
            </p>

            <div class="buy-details-card">
              <label style="font-size: 13px; font-weight: 700; color: #1A1A2E; margin-bottom: 8px; display: block;">
                Выберите количество дополнительных дней:
              </label>
              <div class="extend-days-selector">
                <button 
                  v-for="d in [1, 2, 3, 5, 7]" 
                  :key="d" 
                  class="extend-day-btn" 
                  :class="{ active: extendDays === d }"
                  @click="extendDays = d"
                >
                  +{{ d }} {{ d === 1 ? 'день' : (d < 5 ? 'дня' : 'дней') }}
                </button>
              </div>
              <div class="price-row" style="margin-top: 14px;">
                <span class="special-price">+{{ formatPrice((selectedRentalToExtend?.daily_rate || 2000) * extendDays) }} ₸</span>
                <span class="discount-badge">Посуточный тариф</span>
              </div>
            </div>

            <div class="modal-actions">
              <button class="cancel-btn" @click="isExtendModalOpen = false">Отмена</button>
              <button class="confirm-btn" @click="confirmExtendRental">Подтвердить продление</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrders } from '~/composables/useOrders'
import { useRentals } from '~/composables/useRentals'
import { useCart } from '~/composables/useCart'
import TheHeader from '~/components/TheHeader.vue'

const route = useRoute()
const router = useRouter()
const activeTab = ref<'orders' | 'sets' | 'rentals'>('orders')

if (route.query.tab === 'rentals') {
  activeTab.value = 'rentals'
}

const isLoading = ref(true)
const orders = ref<any[]>([])
const rentals = ref<any[]>([])

const isExtendModalOpen = ref(false)
const selectedRentalToExtend = ref<any>(null)
const extendDays = ref(2)

const { fetchMyOrders } = useOrders()
const { fetchMyRentals, cancelRental } = useRentals()
const { addItem } = useCart()

onMounted(async () => {
  try {
    const [ordersRes, rentalsRes] = await Promise.all([
      fetchMyOrders(),
      fetchMyRentals()
    ])
    if (ordersRes?.data) orders.value = ordersRes.data
    if (rentalsRes?.data) rentals.value = rentalsRes.data
  } catch (e) {
    console.error('Error fetching data:', e)
  } finally {
    isLoading.value = false
  }
})

const getStatusName = (status: string) => {
  switch(status) {
    case 'pending_payment': return '⏳ Ожидает оплаты'
    case 'reserved': return '🟢 Забронировано'
    case 'in_delivery': return '🚚 В пути (курьер)'
    case 'active': return '🏠 У вас дома'
    case 'returned': return '✅ Возвращено'
    case 'completed': return '✅ Завершено'
    case 'overdue': return '⚠️ Просрочено'
    case 'cancelled': return '❌ Отменена'
    default: return status
  }
}

const openExtendModal = (rental: any) => {
  selectedRentalToExtend.value = rental
  isExtendModalOpen.value = true
}

const confirmExtendRental = () => {
  if (!selectedRentalToExtend.value) return
  const extraAmount = (selectedRentalToExtend.value.daily_rate || 2000) * extendDays.value
  const rentalId = selectedRentalToExtend.value.rental_number || selectedRentalToExtend.value.id
  isExtendModalOpen.value = false
  router.push(`/payment?type=rental_extend&id=${rentalId}&amount=${extraAmount}&days=${extendDays.value}`)
}

const handleCancelRental = async (rental: any) => {
  if (!confirm(`Вы действительно хотите отменить бронь #${rental.rental_number}?`)) return
  try {
    await cancelRental(rental.id)
    rental.status = 'cancelled'
    alert('Бронирование аренды успешно отменено.')
  } catch (e: any) {
    alert(e?.data?.message || 'Не удалось отменить бронь.')
  }
}

const parseToysFromNotes = (notes: string) => {
  if (!notes) return []
  const match = notes.match(/Выбранные игрушки:\s*(.+)$/)
  if (match && match[1]) {
    return match[1].split(',').map(s => s.trim())
  }
  return []
}

const parsePackageFromNotes = (notes: string) => {
  if (!notes) return 'Краткосрочная аренда'
  const match = notes.match(/Пакет:\s*([^,]+)/)
  return match && match[1] ? match[1].trim() : 'Краткосрочная аренда'
}

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

const formatPrice = (val: number | string) => {
  const num = Number(val) || 0
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
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

.buy-details-card {
  background: #FAF9FE;
  padding: 18px;
  border-radius: 16px;
  margin-bottom: 24px;
}

.special-price {
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
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

/* Rental Actions in Order Card */
.rental-action-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.action-pill-btn {
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.action-pill-btn.extend-btn {
  background: #F0EDFF;
  color: #7C5CFC;
  border-color: #E2DEFB;
}

.action-pill-btn.extend-btn:hover {
  background: #7C5CFC;
  color: #FFFFFF;
}

.action-pill-btn.cancel-btn-text {
  background: #FDF2F2;
  color: #EF476F;
  border-color: #FBD5D5;
}

.action-pill-btn.cancel-btn-text:hover {
  background: #EF476F;
  color: #FFFFFF;
}

.extend-days-selector {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.extend-day-btn {
  padding: 8px 12px;
  border-radius: 10px;
  border: 1.5px solid #E2E2EC;
  background: #FFFFFF;
  font-size: 12.5px;
  font-weight: 700;
  color: #4A4A68;
  cursor: pointer;
  transition: all 0.2s;
}

.extend-day-btn:hover {
  border-color: #7C5CFC;
}

.extend-day-btn.active {
  background: #7C5CFC;
  border-color: #7C5CFC;
  color: #FFFFFF;
}

.order-status-badge {
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 10px;
}

.order-status-badge.reserved {
  background: #E8F8F3;
  color: #06D6A0;
}

.order-status-badge.cancelled {
  background: #FEECEB;
  color: #EF476F;
}

.order-status-badge.in_delivery {
  background: #E1F0FF;
  color: #1E88E5;
}

.order-status-badge.active {
  background: #F0EDFF;
  color: #7C5CFC;
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
}
</style>
