<template>
  <div class="product-page">
    <TheHeader />

    <main class="container page-content">
      <!-- Breadcrumbs -->
      <nav class="breadcrumbs">
        <NuxtLink to="/shop" class="crumb-link">Магазин</NuxtLink>
        <span class="crumb-separator">›</span>
        <span class="crumb-link">{{ product.age }}</span>
        <span class="crumb-separator">›</span>
        <span class="crumb-current">{{ product.title }}</span>
      </nav>

      <!-- Main Product View: 2-Column Grid -->
      <section class="product-main-grid">
        <!-- LEFT: Gallery -->
        <div class="gallery-col">
          <div class="main-image-wrap">
            <img :src="currentImage" :alt="product.title" class="main-product-img" />
          </div>

          <!-- Thumbnails Strip -->
          <div class="thumbnails-row">
            <button 
              v-for="(img, idx) in product.gallery" 
              :key="idx"
              class="thumb-btn"
              :class="{ active: currentImage === img }"
              @click="currentImage = img"
            >
              <img :src="img" :alt="`${product.title} ${idx + 1}`" class="thumb-img" />
            </button>
          </div>
        </div>

        <!-- RIGHT: Product Info -->
        <div class="product-info-col">
          <!-- Badges Row -->
          <div class="badges-row">
            <span class="age-badge">👶 {{ product.age }}</span>
            <span class="skill-badge">🧩 {{ product.skill }}</span>
          </div>

          <!-- Product Title -->
          <h1 class="product-title">{{ product.title }}</h1>

          <!-- Availability -->
          <div class="availability-status">
            <span class="status-dot"></span>
            <span>В наличии в Алматы</span>
          </div>

          <!-- Purchase Mode Selector -->
          <div class="purchase-mode-selector">
            <button 
              class="mode-btn" 
              :class="{ active: purchaseMode === 'buy' }"
              @click="purchaseMode = 'buy'"
            >
              Купить
            </button>
            <button 
              class="mode-btn" 
              :class="{ active: purchaseMode === 'rent' }"
              @click="purchaseMode = 'rent'"
            >
              В аренду
            </button>
            <button 
              class="mode-btn" 
              :class="{ active: purchaseMode === 'sub' }"
              @click="purchaseMode = 'sub'"
            >
              Подписка
            </button>
          </div>

          <!-- Price & Buy Box -->
          <div class="buy-card">
            <div v-if="purchaseMode === 'buy'">
              <div class="buy-card-top">
                <span class="product-price">{{ formatPrice(product.price) }} ₸</span>
                <button class="discounts-link" @click="isDiscountModalOpen = true">
                  Узнать о скидках
                </button>
              </div>

              <div class="buy-card-actions">
                <!-- Quantity Stepper -->
                <div class="qty-stepper">
                  <button class="stepper-btn" @click="decreaseQuantity">-</button>
                  <span class="stepper-val">{{ quantity }}</span>
                  <button class="stepper-btn" @click="increaseQuantity">+</button>
                </div>

                <!-- Add to Cart Button -->
                <button 
                  class="add-to-cart-main-btn"
                  :class="{ added: isAdded }"
                  @click="handleAddToCart"
                >
                  {{ isAdded ? 'Добавлено в корзину ✓' : 'Добавить в корзину' }}
                </button>
              </div>
            </div>

            <div v-else-if="purchaseMode === 'rent'" class="rent-mode-box">
              <div class="buy-card-top">
                <span class="product-price">{{ formatPrice(dailyRentalRate) }} ₸ <span class="price-note">/ день</span></span>
              </div>
              <p class="mode-desc">Посуточная аренда с доставкой и возвратом курьером до двери.</p>

              <!-- Duration Preset Buttons -->
              <div class="rent-preset-row">
                <span class="preset-label">Срок аренды:</span>
                <div class="preset-buttons">
                  <button 
                    v-for="days in [1, 3, 5, 7]" 
                    :key="days"
                    class="preset-btn"
                    :class="{ active: rentDaysCount === days }"
                    @click="setRentPreset(days)"
                  >
                    {{ days }} {{ days === 1 ? 'день' : (days < 5 ? 'дня' : 'дней') }}
                  </button>
                </div>
              </div>

              <!-- Date Picker Row -->
              <div class="rent-dates-grid">
                <div class="date-picker-grp">
                  <label>📅 Дата получения</label>
                  <input type="date" v-model="rentStartDate" :min="minStartDate" class="date-input" @change="onStartDateChange" />
                </div>
                <div class="date-picker-grp">
                  <label>↩️ Дата возврата</label>
                  <input type="date" v-model="rentEndDate" :min="rentStartDate" class="date-input" @change="onEndDateChange" />
                </div>
              </div>

              <!-- Delivery Time Interval (ТЗ п.21) -->
              <div class="delivery-interval-grp">
                <label>🚚 Время доставки курьером:</label>
                <div class="intervals-row">
                  <button 
                    v-for="slot in ['10:00–14:00', '14:00–18:00', '19:00–21:00']" 
                    :key="slot"
                    class="slot-btn"
                    :class="{ active: deliveryInterval === slot }"
                    @click="deliveryInterval = slot"
                  >
                    {{ slot }}
                  </button>
                </div>
              </div>

              <!-- Availability Status -->
              <div class="rent-avail-status" :class="{ ok: isRentAvailable, error: !isRentAvailable && !isCheckingAvailability }">
                <span v-if="isCheckingAvailability">⏳ Проверка доступности на складе...</span>
                <span v-else-if="isRentAvailable">✓ Товар свободен и готов к доставке</span>
                <span v-else>⚠️ Товар занят на эти даты. Выберите другие дни.</span>
              </div>

              <!-- Rental Price Breakdown -->
              <div class="rent-summary-box">
                <div class="summary-line">
                  <span>Аренда ({{ rentDaysCount }} {{ rentDaysCount === 1 ? 'день' : (rentDaysCount < 5 ? 'дня' : 'дней') }}):</span>
                  <strong>{{ formatPrice(rentalCost) }} ₸</strong>
                </div>
                <div class="summary-line">
                  <span>Возвратный залог (20%):</span>
                  <strong>{{ formatPrice(depositCost) }} ₸</strong>
                </div>
                <div class="summary-divider"></div>
                <div class="summary-line total">
                  <span>Итого к оплате:</span>
                  <span class="total-price-text">{{ formatPrice(totalRentalPrice) }} ₸</span>
                </div>
                <p class="deposit-note">Залог возвращается в полном объеме курьером при возврате товара.</p>
              </div>

              <div class="buy-card-actions">
                <button 
                  class="add-to-cart-main-btn"
                  :disabled="!isRentAvailable || isCheckingAvailability"
                  @click="openRentModal"
                >
                  Оформить аренду на {{ formatPrice(totalRentalPrice) }} ₸
                </button>
              </div>
            </div>

            <div v-else-if="purchaseMode === 'sub'">
               <div class="buy-card-top">
                <span class="product-price">от 14 900 ₸ <span class="price-note">в месяц</span></span>
              </div>
              <p class="mode-desc">Получайте новые игрушки каждый месяц по подписке. Эта игрушка может быть в вашем наборе!</p>
              <div class="buy-card-actions">
                <NuxtLink to="/subscription" class="add-to-cart-main-btn" style="text-decoration: none;">Оформить подписку</NuxtLink>
              </div>
            </div>
          </div>

          <!-- Accordions -->
          <div class="accordions-wrap">
            <!-- Accordion 1: Description -->
            <div class="accordion-item" :class="{ open: openAccordion === 'desc' }">
              <button class="accordion-header" @click="toggleAccordion('desc')">
                <span>Описание игрушки</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="chevron-icon">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              </button>
              <div v-show="openAccordion === 'desc'" class="accordion-content">
                <p>{{ product.description }}</p>
              </div>
            </div>

            <!-- Accordion 2: Specs & Safety -->
            <div class="accordion-item" :class="{ open: openAccordion === 'specs' }">
              <button class="accordion-header" @click="toggleAccordion('specs')">
                <span>Характеристики и Безопасность</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="chevron-icon">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div v-show="openAccordion === 'specs'" class="accordion-content">
                <ul class="specs-list">
                  <li><strong>Материал:</strong> 100% цельный массив клена и бука</li>
                  <li><strong>Покрытие:</strong> Натуральный пчелиный воск и льняное масло (Германия)</li>
                  <li><strong>Сертификация:</strong> Соответствует стандартам безопасности ЕАС и CE</li>
                  <li><strong>Размеры:</strong> 28 × 10 × 8 см</li>
                  <li><strong>Уход:</strong> Протирать сухой или слегка влажной мягкой салфеткой</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ALSO RECOMMENDED SECTION -->
      <section class="recommended-section">
        <h2 class="recommended-title">Также рекомендуем</h2>

        <div class="recommended-grid">
          <div 
            v-for="rec in recommendedProducts" 
            :key="rec.id"
            class="rec-card"
          >
            <div class="rec-img-wrap" @click="navigateToProduct(rec)">
              <img :src="rec.image" :alt="rec.title" class="rec-img" />
            </div>

            <div class="rec-info">
              <div class="rec-badges">
                <span class="rec-age-badge">{{ rec.age }}</span>
                <span class="rec-skill-badge">{{ rec.skill }}</span>
              </div>

              <h3 class="rec-title" @click="navigateToProduct(rec)">{{ rec.title }}</h3>

              <div class="rec-bottom-row">
                <span class="rec-price">{{ formatPrice(rec.price) }} ₸</span>
                <button 
                  class="rec-buy-btn"
                  :class="{ added: addedRecs.includes(rec.id) }"
                  @click="handleAddRecToCart(rec)"
                >
                  {{ addedRecs.includes(rec.id) ? '✓' : 'В корзину' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Discounts Info Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isDiscountModalOpen" class="modal-overlay" @click.self="isDiscountModalOpen = false">
          <div class="discount-modal">
            <button class="close-btn" @click="isDiscountModalOpen = false">&times;</button>
            <h2 class="modal-title">Скидки для подписчиков Alpha 🎁</h2>
            <p class="modal-desc">
              При активной подписке на сервис обмена игрушек вы получаете постоянную скидку <strong>до -40%</strong> на выкуп любых игрушек навсегда в личную коллекцию!
            </p>
            <div class="discount-tariffs">
              <div class="tariff-item">
                <span>План Starter</span>
                <strong>-15% скидка</strong>
              </div>
              <div class="tariff-item featured">
                <span>План Explorer</span>
                <strong>-25% скидка</strong>
              </div>
              <div class="tariff-item">
                <span>План Max</span>
                <strong>-40% скидка</strong>
              </div>
            </div>
            <button class="modal-ok-btn" @click="isDiscountModalOpen = false">Понятно</button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Rent Booking Modal (ТЗ п. 20, 21) -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isRentModalOpen" class="modal-overlay" @click.self="isRentModalOpen = false">
          <div class="rent-modal">
            <button class="close-btn" @click="isRentModalOpen = false">&times;</button>
            <h2 class="modal-title">Бронирование аренды 🚚</h2>
            <p class="modal-desc">
              Вы бронируете: <strong>{{ product.title }}</strong><br />
              Срок: <strong>{{ rentStartDate }} — {{ rentEndDate }}</strong> ({{ rentDaysCount }} дн.)<br />
              Доставка: <strong>{{ deliveryInterval }}</strong>
            </p>

            <div class="modal-form">
              <!-- If Authenticated -->
              <template v-if="user">
                <div class="auth-readonly-info">
                  <div class="read-grp">
                    <span class="r-label">Получатель</span>
                    <span class="r-val">{{ user.name }}</span>
                  </div>
                  <div class="read-grp">
                    <span class="r-label">Номер телефона</span>
                    <span class="r-val" v-if="user.phone">{{ user.phone }}</span>
                    <input v-else v-model="rentBookingForm.phone" type="tel" placeholder="+7 (707) 123-45-67" class="m-input" />
                  </div>
                  <div class="read-grp">
                    <span class="r-label">Адрес доставки курьером</span>
                    <span class="r-val" v-if="user.address">{{ user.address }}</span>
                    <input v-else v-model="rentBookingForm.address" type="text" placeholder="г. Алматы, пр. Абая, 150" class="m-input" />
                  </div>
                </div>
              </template>
            </div>

            <div class="rent-modal-total">
              <span>Итого к оплате (с залогом):</span>
              <strong>{{ formatPrice(totalRentalPrice) }} ₸</strong>
            </div>

            <button class="submit-rent-btn" :disabled="isRentSubmitting" @click="submitRentBooking">
              {{ isRentSubmitting ? 'Оформление бронирования...' : `Перейти к оплате ${formatPrice(totalRentalPrice)} ₸` }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TheHeader from '~/components/TheHeader.vue'
import { useRentals } from '~/composables/useRentals'
import { useAuth } from '~/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { addItem } = useCart()
const { checkAvailability, createRental } = useRentals()
const { user, openAuthModal } = useAuth()

const quantity = ref(1)
const isAdded = ref(false)
const purchaseMode = ref('buy')
const isDiscountModalOpen = ref(false)
const openAccordion = ref<string>('desc')
const addedRecs = ref<number[]>([])
const isLoading = ref(true)
const loadError = ref(false)

// Rental state (ТЗ п.19-21)
const formatDateIso = (d: Date) => d.toISOString().split('T')[0]

const today = new Date()
const tomorrow = new Date(today)
tomorrow.setDate(today.getDate() + 1)
const in3Days = new Date(tomorrow)
in3Days.setDate(tomorrow.getDate() + 2)

const minStartDate = formatDateIso(tomorrow)
const rentStartDate = ref(formatDateIso(tomorrow))
const rentEndDate = ref(formatDateIso(in3Days))
const rentDaysCount = ref(3)
const deliveryInterval = ref('10:00–14:00')

const isCheckingAvailability = ref(false)
const isRentAvailable = ref(true)
const isRentModalOpen = ref(false)
const isRentSubmitting = ref(false)
const rentBookingForm = ref({ name: '', phone: '', address: '' })

if (route.query.mode === 'rent') {
  purchaseMode.value = 'rent'
}

interface Product {
  id: number
  title: string
  age: string
  skill: string
  price: number
  description: string
  gallery: string[]
}

const product = ref<Product>({
  id: 0,
  title: '',
  age: '',
  skill: '',
  price: 0,
  description: '',
  gallery: []
})

const currentImage = ref('')

const mapToy = (item: any): Product => {
  const minYears = Math.floor((item.min_age_months ?? 0) / 12)
  const maxYears = Math.ceil((item.max_age_months ?? 72) / 12)
  const areas: string[] = Array.isArray(item.development_areas) ? item.development_areas : []
  const skillLabel = areas.length > 0
    ? areas.slice(0, 2).map((a: string) => a.charAt(0).toUpperCase() + a.slice(1)).join(' и ')
    : 'Развитие'

  const img = item.image_url && !item.image_url.includes('placeholder')
    ? item.image_url
    : 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80'

  return {
    id: item.id,
    title: item.name,
    age: `${minYears}–${maxYears} года`,
    skill: skillLabel,
    price: item.buyout_price ?? item.price ?? 0,
    description: item.description ?? 'Развивающая игрушка из натуральных материалов.',
    gallery: [img,
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80',
    ]
  }
}

const loadProduct = async (id: string | string[]) => {
  isLoading.value = true
  loadError.value = false
  try {
    const data = await $fetch<any>(`http://localhost:8000/api/toys/${id}`)
    const toy = data?.data ?? data
    product.value = mapToy(toy)
    currentImage.value = product.value.gallery[0]
    checkToyAvailability()
  } catch (e) {
    loadError.value = true
  } finally {
    isLoading.value = false
  }
}

// Rental Computations & Actions (ТЗ п. 19-21)
const dailyRentalRate = computed(() => {
  return Math.max(1200, Math.round(product.value.price * 0.1 / 100) * 100)
})

const rentalCost = computed(() => {
  return dailyRentalRate.value * rentDaysCount.value
})

const depositCost = computed(() => {
  return Math.min(10000, Math.round(product.value.price * 0.20 / 100) * 100)
})

const totalRentalPrice = computed(() => {
  return rentalCost.value + depositCost.value
})

const setRentPreset = (days: number) => {
  rentDaysCount.value = days
  const start = new Date(rentStartDate.value)
  const end = new Date(start)
  end.setDate(start.getDate() + days - 1)
  rentEndDate.value = formatDateIso(end)
  checkToyAvailability()
}

const onStartDateChange = () => {
  const start = new Date(rentStartDate.value)
  const end = new Date(rentEndDate.value)
  if (end < start) {
    const newEnd = new Date(start)
    newEnd.setDate(start.getDate() + rentDaysCount.value - 1)
    rentEndDate.value = formatDateIso(newEnd)
  } else {
    const diffTime = Math.abs(end.getTime() - start.getTime())
    rentDaysCount.value = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1)
  }
  checkToyAvailability()
}

const onEndDateChange = () => {
  const start = new Date(rentStartDate.value)
  const end = new Date(rentEndDate.value)
  if (end >= start) {
    const diffTime = Math.abs(end.getTime() - start.getTime())
    rentDaysCount.value = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1)
  }
  checkToyAvailability()
}

const checkToyAvailability = async () => {
  if (!product.value.id) return
  isCheckingAvailability.value = true
  try {
    const res = await checkAvailability(product.value.id, rentStartDate.value, rentEndDate.value)
    isRentAvailable.value = res?.available ?? true
  } catch (e) {
    isRentAvailable.value = true
  } finally {
    isCheckingAvailability.value = false
  }
}

const openRentModal = () => {
  if (!user.value) {
    openAuthModal('login')
    return
  }
  rentBookingForm.value = {
    name: user.value.name || '',
    phone: user.value.phone || '',
    address: user.value.address || ''
  }
  isRentModalOpen.value = true
}

const submitRentBooking = async () => {
  if (isRentSubmitting.value) return
  const finalPhone = rentBookingForm.value.phone || user.value?.phone || '+7 (707) 123-45-67'
  const finalAddress = rentBookingForm.value.address || user.value?.address || 'г. Алматы, ул. Достык, 50'

  isRentSubmitting.value = true
  try {
    const res = await createRental({
      toy_id: product.value.id,
      start_date: rentStartDate.value,
      end_date: rentEndDate.value,
      delivery_address: finalAddress,
      contact_phone: finalPhone,
      notes: `Интервал доставки: ${deliveryInterval.value}`
    })

    if (res?.data) {
      isRentModalOpen.value = false
      const rentalId = res.data.id || res.data.rental_number
      router.push(`/payment?type=rental&id=${rentalId}&amount=${totalRentalPrice.value}`)
    }
  } catch (e: any) {
    alert(e?.data?.message || 'Ошибка при оформлении бронирования. Проверьте выбранные даты.')
  } finally {
    isRentSubmitting.value = false
  }
}

// Load on mount and watch for route changes (e.g. clicking recommended)
await loadProduct(route.params.id)

watch(() => route.params.id, (newId) => {
  if (newId) {
    loadProduct(newId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
})

const toggleAccordion = (name: string) => {
  openAccordion.value = openAccordion.value === name ? '' : name
}

const increaseQuantity = () => {
  quantity.value += 1
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value -= 1
  }
}

const handleAddToCart = () => {
  for (let i = 0; i < quantity.value; i++) {
    addItem({
      id: product.value.id,
      title: product.value.title,
      price: product.value.price,
      image: currentImage.value
    })
  }
  isAdded.value = true
  setTimeout(() => {
    isAdded.value = false
  }, 2500)
}

// Recommended Products — fetch from real API
const recommendedProducts = ref<any[]>([])

const loadRecommended = async () => {
  try {
    const data = await $fetch<any>('http://localhost:8000/api/toys?per_page=10')
    const items = data?.data ?? []
    const filtered = items
      .filter((t: any) => t.id !== Number(route.params.id))
      .slice(0, 3)
      .map((t: any) => {
        const img = t.image_url && !t.image_url.includes('placeholder')
          ? t.image_url
          : 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=500&q=80'
        const minYears = Math.floor((t.min_age_months ?? 0) / 12)
        const maxYears = Math.ceil((t.max_age_months ?? 72) / 12)
        const areas: string[] = Array.isArray(t.development_areas) ? t.development_areas : []
        return {
          id: t.id,
          title: t.name,
          age: `${minYears}–${maxYears} года`,
          skill: areas.length > 0 ? areas[0] : 'Развитие',
          price: t.buyout_price ?? t.price ?? 0,
          image: img
        }
      })
    recommendedProducts.value = filtered
  } catch (e) {
    // Keep empty list silently
  }
}

await loadRecommended()

const handleAddRecToCart = (rec: any) => {
  addItem({
    id: rec.id,
    title: rec.title,
    price: rec.price,
    image: rec.image
  })
  if (!addedRecs.value.includes(rec.id)) {
    addedRecs.value.push(rec.id)
    setTimeout(() => {
      const idx = addedRecs.value.indexOf(rec.id)
      if (idx > -1) addedRecs.value.splice(idx, 1)
    }, 2000)
  }
}

// Navigate via router.push so the URL changes and the watcher re-fetches real data
const navigateToProduct = (rec: any) => {
  router.push(`/product/${rec.id}`)
}

const formatPrice = (val: number) => {
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
</script>

<style scoped>
.product-page {
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
  padding-top: 28px;
}

/* Breadcrumbs */
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #7B7B93;
  margin-bottom: 28px;
}

.crumb-link {
  color: #7B7B93;
  text-decoration: none;
  transition: color 0.2s;
}

.crumb-link:hover {
  color: #7C5CFC;
}

.crumb-separator {
  color: #A0A0B8;
  font-size: 15px;
}

.crumb-current {
  color: #1A1A2E;
  font-weight: 700;
}

/* Main Grid */
.product-main-grid {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 48px;
  margin-bottom: 64px;
}

/* Gallery Column */
.gallery-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.main-image-wrap {
  background: #FFFFFF;
  border-radius: 28px;
  height: 420px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.main-product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.thumbnails-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.thumb-btn {
  background: #FFFFFF;
  border: 2px solid transparent;
  border-radius: 18px;
  height: 100px;
  overflow: hidden;
  padding: 0;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
}

.thumb-btn:hover {
  transform: translateY(-2px);
  border-color: rgba(124, 92, 252, 0.4);
}

.thumb-btn.active {
  border-color: #7C5CFC;
  box-shadow: 0 4px 16px rgba(124, 92, 252, 0.2);
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Info Column */
.product-info-col {
  display: flex;
  flex-direction: column;
}

.badges-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.age-badge {
  background: #FFF1C5;
  color: #7A5300;
  font-size: 12px;
  font-weight: 700;
  padding: 5px 14px;
  border-radius: 20px;
}

.skill-badge {
  background: #D9F7EC;
  color: #058563;
  font-size: 12px;
  font-weight: 700;
  padding: 5px 14px;
  border-radius: 20px;
}

.product-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 38px;
  color: #1A1A2E;
  line-height: 1.15;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.availability-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  color: #06D6A0;
  font-weight: 700;
  margin-bottom: 24px;
}

.status-dot {
  width: 7px;
  height: 7px;
  background: #06D6A0;
  border-radius: 50%;
}

/* Buy Card & Mode Selector */
.purchase-mode-selector {
  display: flex;
  gap: 8px;
  background: #F4F4F8;
  padding: 6px;
  border-radius: 16px;
  margin-bottom: 16px;
}

.mode-btn {
  flex: 1;
  background: transparent;
  border: none;
  border-radius: 12px;
  padding: 10px 4px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 14px;
  color: #7B7B93;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-btn.active {
  background: #FFFFFF;
  color: #1A1A2E;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.buy-card {
  background: #FFFFFF;
  border-radius: 24px;
  padding: 26px 28px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  margin-bottom: 24px;
}

.buy-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.product-price {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 30px;
  color: #1A1A2E;
}

.price-note {
  font-size: 16px;
  color: #7B7B93;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
}

.mode-desc {
  font-size: 13.5px;
  color: #7B7B93;
  line-height: 1.5;
  margin-bottom: 18px;
}

.discounts-link {
  background: none;
  border: none;
  font-size: 12.5px;
  color: #7B7B93;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
}

.discounts-link:hover {
  color: #7C5CFC;
}

.buy-card-actions {
  display: flex;
  gap: 14px;
  align-items: center;
}

.qty-stepper {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #F4F4F8;
  border-radius: 14px;
  padding: 8px 16px;
}

.stepper-btn {
  background: transparent;
  border: none;
  font-size: 18px;
  font-weight: 800;
  color: #4A4A68;
  cursor: pointer;
  padding: 2px 6px;
}

.stepper-val {
  font-weight: 700;
  font-size: 15px;
  color: #1A1A2E;
  min-width: 14px;
  text-align: center;
}

.add-to-cart-main-btn {
  flex: 1;
  background: #624CE0;
  color: #FFFFFF;
  border: none;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 15px;
  padding: 14px 24px;
  border-radius: 14px;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(98, 76, 224, 0.25);
  transition: all 0.2s ease;
  text-align: center;
}

.add-to-cart-main-btn:hover {
  background: #513bc7;
  transform: translateY(-1px);
}

.add-to-cart-main-btn.added {
  background: #06D6A0;
  box-shadow: 0 6px 20px rgba(6, 214, 160, 0.25);
}

/* Accordions */
.accordions-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.accordion-item {
  background: #FFFFFF;
  border-radius: 18px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.01);
  overflow: hidden;
  transition: all 0.2s ease;
}

.accordion-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  background: none;
  border: none;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 15.5px;
  color: #1A1A2E;
  cursor: pointer;
  text-align: left;
}

.chevron-icon {
  transition: transform 0.25s ease;
}

.accordion-item.open .chevron-icon {
  transform: rotate(180deg);
}

.accordion-content {
  padding: 0 24px 20px 24px;
  font-size: 13.5px;
  color: #7B7B93;
  line-height: 1.55;
}

.specs-list {
  margin: 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.specs-list li {
  line-height: 1.4;
}

/* Recommended Section */
.recommended-section {
  margin-top: 32px;
}

.recommended-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 26px;
  color: #1A1A2E;
  margin-bottom: 24px;
}

.recommended-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.rec-card {
  background: #FFFFFF;
  border-radius: 24px;
  padding: 16px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.rec-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(124, 92, 252, 0.08);
}

.rec-img-wrap {
  height: 190px;
  border-radius: 18px;
  background: #F4F8FC;
  overflow: hidden;
  cursor: pointer;
  margin-bottom: 14px;
}

.rec-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.rec-card:hover .rec-img {
  transform: scale(1.04);
}

.rec-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.rec-badges {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.rec-age-badge {
  background: #FFF1C5;
  color: #7A5300;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 12px;
}

.rec-skill-badge {
  background: #D9F7EC;
  color: #058563;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 12px;
}

.rec-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 16px;
  color: #1A1A2E;
  margin-bottom: 14px;
  cursor: pointer;
  line-height: 1.3;
}

.rec-title:hover {
  color: #7C5CFC;
}

.rec-bottom-row {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rec-price {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 19px;
  color: #1A1A2E;
}

.rec-buy-btn {
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

.rec-buy-btn:hover {
  background: #513bc7;
}

.rec-buy-btn.added {
  background: #06D6A0;
}

/* Discount Modal */
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

.discount-modal {
  position: relative;
  background: #FFFFFF;
  width: 100%;
  max-width: 480px;
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
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 8px;
}

.modal-desc {
  font-size: 14px;
  color: #7B7B93;
  line-height: 1.45;
  margin-bottom: 20px;
}

.discount-tariffs {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
}

.tariff-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #F8F8FC;
  padding: 12px 18px;
  border-radius: 14px;
  font-size: 14px;
}

.tariff-item.featured {
  background: #F0EDFF;
  border: 1px solid #7C5CFC;
  color: #624CE0;
}

.modal-ok-btn {
  width: 100%;
  background: #7C5CFC;
  color: #FFFFFF;
  border: none;
  padding: 12px;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
}

/* Rental UI Styles */
.rent-mode-box {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rent-preset-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preset-label {
  font-size: 13px;
  font-weight: 700;
  color: #1A1A2E;
}

.preset-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.preset-btn {
  padding: 8px 14px;
  border-radius: 12px;
  border: 1.5px solid #E2E2EC;
  background: #FFFFFF;
  font-size: 13px;
  font-weight: 700;
  color: #4A4A68;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-btn:hover {
  border-color: #7C5CFC;
}

.preset-btn.active {
  background: #7C5CFC;
  border-color: #7C5CFC;
  color: #FFFFFF;
}

.rent-dates-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.date-picker-grp {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.date-picker-grp label {
  font-size: 12.5px;
  font-weight: 700;
  color: #1A1A2E;
}

.date-input {
  padding: 10px 12px;
  border-radius: 12px;
  border: 1.5px solid #E2E2EC;
  font-size: 13.5px;
  font-family: inherit;
  outline: none;
  background: #FFFFFF;
}

.date-input:focus {
  border-color: #7C5CFC;
}

.delivery-interval-grp {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.delivery-interval-grp label {
  font-size: 12.5px;
  font-weight: 700;
  color: #1A1A2E;
}

.intervals-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.slot-btn {
  flex: 1;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1.5px solid #E2E2EC;
  background: #FFFFFF;
  font-size: 12px;
  font-weight: 700;
  color: #4A4A68;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
}

.slot-btn:hover {
  border-color: #7C5CFC;
}

.slot-btn.active {
  background: #F0EDFF;
  border-color: #7C5CFC;
  color: #7C5CFC;
}

.rent-avail-status {
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  background: #F4F4F8;
  color: #4A4A68;
}

.rent-avail-status.ok {
  background: #E8F8F3;
  color: #06D6A0;
}

.rent-avail-status.error {
  background: #FEECEB;
  color: #EF476F;
}

.rent-summary-box {
  background: #FAF9FE;
  padding: 16px;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  font-size: 13.5px;
  color: #4A4A68;
}

.summary-line.total {
  font-size: 15px;
  font-weight: 800;
  color: #1A1A2E;
}

.total-price-text {
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  color: #7C5CFC;
}

.summary-divider {
  height: 1px;
  background: #EAE8F5;
  margin: 4px 0;
}

.deposit-note {
  font-size: 11.5px;
  color: #7B7B93;
  margin: 0;
  line-height: 1.35;
}

/* Rent Modal */
.rent-modal {
  background: #FFFFFF;
  border-radius: 28px;
  max-width: 480px;
  width: 100%;
  padding: 32px;
  position: relative;
}

.modal-form {
  margin: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.auth-readonly-info {
  background: #F9F9FC;
  padding: 16px;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.read-grp {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.r-label {
  font-size: 11.5px;
  font-weight: 700;
  color: #7B7B93;
  text-transform: uppercase;
}

.r-val {
  font-size: 14px;
  font-weight: 600;
  color: #1A1A2E;
}

.m-input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #D1D1E0;
  font-size: 13.5px;
  margin-top: 4px;
}

.rent-modal-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #F0EDFF;
  border-radius: 12px;
  font-size: 14px;
  color: #1A1A2E;
}

.rent-modal-total strong {
  font-size: 18px;
  color: #7C5CFC;
}

.submit-rent-btn {
  width: 100%;
  background: #7C5CFC;
  color: #FFFFFF;
  border: none;
  padding: 14px;
  border-radius: 16px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-rent-btn:hover:not(:disabled) {
  background: #6848E0;
}

.submit-rent-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 960px) {
  .product-main-grid {
    grid-template-columns: 1fr;
  }

  .recommended-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .main-img-card {
    height: 280px;
    border-radius: 20px;
  }

  .thumbnail-card {
    width: 64px;
    height: 64px;
    border-radius: 14px;
  }

  .buy-card {
    padding: 20px 16px;
    border-radius: 20px;
  }

  .buy-card-actions {
    flex-direction: column;
    gap: 12px;
  }

  .qty-stepper {
    width: 100%;
    justify-content: space-between;
    padding: 10px 16px;
  }

  .add-to-cart-btn {
    width: 100%;
    padding: 14px;
  }

  .product-name-title {
    font-size: 26px;
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
