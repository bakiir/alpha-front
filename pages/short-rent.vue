<template>
  <div class="short-rent-page">
    <TheHeader />

    <main class="container page-content">
      <!-- Hero -->
      <section class="rent-hero">
        <span class="rent-badge">РАЗОВАЯ АРЕНДА</span>
        <h1 class="rent-title">Аренда специальных товаров</h1>
        <p class="rent-subtitle">
          Костюмы, коляски, батуты, автокресла и праздничный инвентарь на любой срок от 1 дня. 
          Этот раздел не входит в подписку на игрушки и оплачивается отдельно.
        </p>
      </section>

      <!-- Category Tabs -->
      <div class="category-tabs-wrapper">
        <div class="category-tabs">
          <button 
            class="cat-tab" 
            :class="{ active: selectedCategory === '' }"
            @click="selectCategory('')"
          >
            Все товары
          </button>
          <button 
            v-for="cat in categories" 
            :key="cat.id"
            class="cat-tab"
            :class="{ active: selectedCategory === cat.id }"
            @click="selectCategory(cat.id)"
          >
            {{ cat.name }}
          </button>
        </div>
      </div>

      <!-- Products Grid -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Загрузка товаров для аренды...</p>
      </div>
      
      <section v-else-if="specialToys.length > 0" class="special-products-grid">
        <div v-for="toy in specialToys" :key="toy.id" class="product-card">
          <div class="product-img-wrapper">
            <AppImage 
              :src="getToyImage(toy)" 
              :alt="toy.name" 
              :fallback-src="defaultImage"
              :lazy="true"
            />
            <span v-if="toy.category" class="card-cat-badge">{{ toy.category.icon }} {{ toy.category.name }}</span>
          </div>
          <div class="product-info">
            <h3 class="product-name">{{ toy.name }}</h3>
            <p class="product-desc">{{ truncateDesc(toy.description || 'Специальный товар для вашего праздника, поездки или досуга.', 75) }}</p>
            
            <div class="product-bottom">
              <div class="product-price">
                <span class="price">{{ formatPrice(getDailyPrice(toy)) }} ₸</span>
                <span class="period">/ сутки</span>
              </div>
              <button class="rent-btn" @click="openRentModal(toy)">
                Забронировать
              </button>
            </div>
          </div>
        </div>
      </section>
      
      <div v-else class="empty-state">
        <AppIcon name="party" :size="40" class="empty-icon" />
        <h3>В данной категории пока нет товаров</h3>
        <p>Администратор может добавить товары и отметить их как доступные для аренды в админ-панели.</p>
        <button class="reset-btn" @click="selectCategory('')">Показать все категории</button>
      </div>

      <!-- How short rent works -->
      <section class="how-rent-works">
        <h2 class="section-heading">Как работает аренда специальных товаров</h2>
        <div class="steps-row">
          <div class="step-box">
            <div class="step-icon">1</div>
            <h4>Выберите товар и даты</h4>
            <p>Укажите удобный период аренды — от 1 дня для праздника или на несколько недель для поездки.</p>
          </div>
          <div class="step-box">
            <div class="step-icon">2</div>
            <h4>Бережная доставка</h4>
            <p>Привезем чистый, продезинфицированный и проверенный товар прямо к вашей двери в назначенное время.</p>
          </div>
          <div class="step-box">
            <div class="step-icon">3</div>
            <h4>Удобный возврат</h4>
            <p>В назначенный день курьер сам приедет и заберет товар, либо вы можете продлить аренду в профиле.</p>
          </div>
        </div>
      </section>
    </main>

    <!-- Booking & Payment Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isModalOpen" class="modal-overlay" @click.self="isModalOpen = false">
          <div class="rent-modal">
            <button class="close-btn" aria-label="Закрыть" @click="isModalOpen = false">&times;</button>
            
            <!-- STEP 1: Details and Dates -->
            <div v-if="modalStep === 1">
              <div class="modal-header-box">
                <span class="step-badge">Шаг 1 из 2</span>
                <h2 class="modal-title"><AppIcon name="calendar" :size="22" class="modal-title-icon" /> Параметры аренды</h2>
                <p class="modal-desc">
                  Товар: <strong>{{ selectedToy?.name }}</strong>
                </p>
              </div>

              <!-- Notice if not logged in -->
              <div v-if="!user" class="guest-login-notice">
                <span>Для сохранения брони и доступа к заказам:</span>
                <button class="text-login-btn" type="button" @click="openAuthModal('login')">
                  Войти в аккаунт →
                </button>
              </div>

              <div class="modal-form">
                <!-- If User is Authenticated -->
                <template v-if="user">
                  <div class="auth-readonly-info">
                    <div class="read-grp">
                      <span class="r-label">Заказчик</span>
                      <span class="r-val">{{ user.name }}</span>
                    </div>
                    <div class="read-grp">
                      <span class="r-label">Номер телефона</span>
                      <span class="r-val" v-if="user.phone">{{ user.phone }}</span>
                      <input 
                        v-else 
                        :value="bookingForm.phone" 
                        type="tel" 
                        placeholder="+7 (707) 123-45-67" 
                        maxlength="18" 
                        class="m-input" 
                        @input="onPhoneInput" 
                      />
                    </div>
                    <div class="read-grp">
                      <span class="r-label">Адрес доставки</span>
                      <input 
                        v-model="bookingForm.address" 
                        type="text" 
                        placeholder="г. Алматы, пр. Абая, 150, кв. 12" 
                        class="m-input" 
                      />
                    </div>
                  </div>
                </template>

                <!-- If User is Guest -->
                <template v-else>
                  <div class="input-grp">
                    <label>Ваше имя</label>
                    <input v-model="bookingForm.name" type="text" placeholder="Иван" class="m-input" />
                  </div>
                  <div class="input-grp">
                    <label>Номер телефона</label>
                    <input 
                      :value="bookingForm.phone" 
                      type="tel" 
                      placeholder="+7 (707) 123-45-67" 
                      maxlength="18" 
                      class="m-input" 
                      @input="onPhoneInput"
                    />
                  </div>
                  <div class="input-grp">
                    <label>Адрес доставки</label>
                    <input v-model="bookingForm.address" type="text" placeholder="г. Алматы, пр. Абая, 150, кв. 12" class="m-input" />
                  </div>
                </template>

                <!-- Dates Selection -->
                <div class="date-row">
                  <div class="input-grp">
                    <label>Начало аренды</label>
                    <input 
                      v-model="bookingForm.startDate" 
                      type="date" 
                      :min="todayStr"
                      class="m-input" 
                      @change="onStartDateChange"
                    />
                  </div>
                  <div class="input-grp">
                    <label>Конец аренды</label>
                    <input 
                      v-model="bookingForm.endDate" 
                      type="date" 
                      :min="bookingForm.startDate || todayStr"
                      class="m-input" 
                      @change="checkAvailabilityDebounced"
                    />
                  </div>
                </div>

                <!-- Availability Status Banner -->
                <div v-if="availabilityStatus === 'checking'" class="avail-banner checking">
                  Проверка доступности на выбранные даты...
                </div>
                <div v-else-if="availabilityStatus === 'unavailable'" class="avail-banner unavailable">
                  <AppIcon name="alert" :size="14" class="inline-icon" /> Товар уже забронирован на эти даты. Пожалуйста, выберите другой период.
                </div>

                <!-- Price Breakdown Box -->
                <div class="total-price-box">
                  <div class="price-calc-details">
                    <span class="days-detail">{{ daysCount }} дн. × {{ formatPrice(getDailyPrice(selectedToy)) }} ₸</span>
                    <span class="deposit-note" v-if="estimatedDeposit > 0">
                      Возвратный залог: {{ formatPrice(estimatedDeposit) }} ₸
                    </span>
                  </div>
                  <div class="price-grand-total">
                    <span class="total-lbl">Итого:</span>
                    <strong>{{ formatPrice(calculatedPrice) }} ₸</strong>
                  </div>
                </div>
              </div>

              <!-- Error message banner if any -->
              <div v-if="submitError" class="submit-error-banner">
                {{ submitError }}
              </div>

              <button 
                class="submit-rent-btn" 
                :disabled="calculatedPrice <= 0 || availabilityStatus === 'unavailable'" 
                @click="goToPaymentStep"
              >
                Перейти к оплате ({{ formatPrice(calculatedPrice) }} ₸) →
              </button>
            </div>

            <!-- STEP 2: Payment -->
            <div v-else-if="modalStep === 2">
              <div class="modal-header-box">
                <button class="back-step-btn" @click="modalStep = 1">← Назад к датам</button>
                <span class="step-badge">Шаг 2 из 2</span>
                <h2 class="modal-title"><AppIcon name="credit-card" :size="22" class="modal-title-icon" /> Оплата аренды</h2>
                <p class="modal-desc">
                  Сумма к списанию: <strong>{{ formatPrice(calculatedPrice) }} ₸</strong>
                </p>
              </div>

              <!-- Payment Method Selection -->
              <div class="payment-methods-box">
                <div 
                  class="pay-method-card"
                  :class="{ selected: selectedPaymentMethod === 'kaspi' }"
                  @click="selectedPaymentMethod = 'kaspi'"
                >
                  <div class="pay-radio-circle">
                    <span v-if="selectedPaymentMethod === 'kaspi'" class="radio-inner"></span>
                  </div>
                  <div class="pay-method-icon kaspi-badge">K</div>
                  <div class="pay-method-info">
                    <strong>Kaspi QR / Удаленный счет</strong>
                    <span>Быстрая оплата в приложении Kaspi.kz</span>
                  </div>
                </div>

                <div 
                  class="pay-method-card"
                  :class="{ selected: selectedPaymentMethod === 'card' }"
                  @click="selectedPaymentMethod = 'card'"
                >
                  <div class="pay-radio-circle">
                    <span v-if="selectedPaymentMethod === 'card'" class="radio-inner"></span>
                  </div>
                  <div class="pay-method-icon card-badge"><AppIcon name="credit-card" :size="24" /></div>
                  <div class="pay-method-info">
                    <strong>Банковской картой онлайн</strong>
                    <span>Visa, MasterCard, Apple Pay</span>
                  </div>
                </div>
              </div>

              <!-- Kaspi View Mock -->
              <div v-if="selectedPaymentMethod === 'kaspi'" class="kaspi-pay-preview">
                <div class="qr-mock-box">
                  <div class="qr-code-art">
                    <div class="qr-block top-left"></div>
                    <div class="qr-block top-right"></div>
                    <div class="qr-block bottom-left"></div>
                    <span class="qr-center-text">Kaspi QR</span>
                  </div>
                </div>
                <p class="qr-hint">Отсканируйте QR-код в мобильном приложении Kaspi.kz или счет будет выставлен на номер {{ user?.phone || bookingForm.phone }}</p>
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

              <!-- Summary Recap -->
              <div class="order-recap-box">
                <div class="recap-row">
                  <span>Товар:</span>
                  <strong>{{ selectedToy?.name }}</strong>
                </div>
                <div class="recap-row">
                  <span>Срок:</span>
                  <span>{{ formatDateSimple(bookingForm.startDate) }} — {{ formatDateSimple(bookingForm.endDate) }} ({{ daysCount }} дн.)</span>
                </div>
                <div class="recap-row total">
                  <span>Итого к оплате:</span>
                  <strong>{{ formatPrice(calculatedPrice) }} ₸</strong>
                </div>
              </div>

              <div v-if="submitError" class="submit-error-banner">
                {{ submitError }}
              </div>

              <button 
                class="submit-rent-btn pay-btn" 
                :disabled="isSubmitting" 
                @click="submitBookingAndPay"
              >
                <span v-if="isSubmitting">Обработка платежа...</span>
                <span v-else>Оплатить {{ formatPrice(calculatedPrice) }} ₸</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- TheFooter -->
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import TheHeader from '~/components/TheHeader.vue'
import TheFooter from '~/components/TheFooter.vue'

const router = useRouter()
const { user, openAuthModal } = useAuth()
const { createRental, payRental } = useRentals()
const { request } = useApi()
const { fetchToys } = useToys()

const defaultImage = 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80'

interface ToyCategory {
  id: number
  slug: string
  name: string
  icon: string | null
}

const categories = ref<ToyCategory[]>([])

const loadCategories = async () => {
  try {
    const res = await request<ToyCategory[]>('/toy-categories')
    categories.value = Array.isArray(res) ? res : []
  } catch (e) {
    console.error('Failed to load categories', e)
  }
}

const getCategoryLabel = (cat: ToyCategory | null | undefined): string => {
  return cat?.name ?? 'Аренда'
}

const selectedCategory = ref<number | ''>('')
const loading = ref(true)
const specialToys = ref<any[]>([])

const loadToys = async () => {
  loading.value = true
  try {
    const params: Record<string, string | number> = {
      catalog: 'rental',
      per_page: 100,
    }
    if (selectedCategory.value !== '') {
      params.category = selectedCategory.value
    }
    const res = await fetchToys(params)
    specialToys.value = res?.data ?? res ?? []
  } catch (e) {
    console.error('Failed to load rental toys', e)
    specialToys.value = []
  } finally {
    loading.value = false
  }
}

const selectCategory = (catId: number | '') => {
  selectedCategory.value = catId
  loadToys()
}

loadCategories()
loadToys()

// Modal State & Form
const isModalOpen = ref(false)
const modalStep = ref<1 | 2>(1)
const selectedPaymentMethod = ref<'kaspi' | 'card'>('kaspi')
const isSubmitting = ref(false)
const submitError = ref('')
const selectedToy = ref<any>(null)
const availabilityStatus = ref<'idle' | 'checking' | 'available' | 'unavailable'>('idle')

const todayStr = new Date().toISOString().split('T')[0]
const defaultEndStr = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]

const bookingForm = ref({
  name: '',
  phone: '',
  address: '',
  startDate: todayStr,
  endDate: defaultEndStr
})

const getDailyPrice = (toy: any) => {
  if (!toy) return 1500
  const rate = Number(toy.rental_price_per_day)
  if (rate && rate > 0) return rate
  const retail = Number(toy.price)
  if (retail && retail > 0) return Math.round(retail * 0.05)
  return 1500
}

const getToyImage = (toy: any) => {
  if (toy?.image_url && !toy.image_url.includes('placeholder') && !toy.image_url.includes('via.placeholder')) {
    return toy.image_url
  }
  return defaultImage
}

const daysCount = computed(() => {
  if (!bookingForm.value.startDate || !bookingForm.value.endDate) return 1
  const start = new Date(bookingForm.value.startDate).getTime()
  const end = new Date(bookingForm.value.endDate).getTime()
  const diffDays = Math.round((end - start) / (1000 * 3600 * 24))
  return Math.max(1, diffDays + 1)
})

const calculatedPrice = computed(() => {
  if (!selectedToy.value) return 0
  return daysCount.value * getDailyPrice(selectedToy.value)
})

const estimatedDeposit = computed(() => {
  if (!selectedToy.value) return 0
  const price = Number(selectedToy.value.price) || 0
  return Math.min(10000, Math.round(price * 0.20))
})

const onStartDateChange = () => {
  if (bookingForm.value.startDate && bookingForm.value.endDate) {
    if (bookingForm.value.endDate < bookingForm.value.startDate) {
      bookingForm.value.endDate = bookingForm.value.startDate
    }
  }
  checkAvailabilityDebounced()
}

let checkTimer: any = null
const checkAvailabilityDebounced = () => {
  clearTimeout(checkTimer)
  availabilityStatus.value = 'checking'
  checkTimer = setTimeout(async () => {
    if (!selectedToy.value?.id || !bookingForm.value.startDate || !bookingForm.value.endDate) {
      availabilityStatus.value = 'idle'
      return
    }
    try {
      const res = await request<any>(`/rentals/check-availability?toy_id=${selectedToy.value.id}&start_date=${bookingForm.value.startDate}&end_date=${bookingForm.value.endDate}`)
      if (res?.available === false || res?.status === 'unavailable') {
        availabilityStatus.value = 'unavailable'
      } else {
        availabilityStatus.value = 'available'
      }
    } catch (e) {
      availabilityStatus.value = 'idle'
    }
  }, 400)
}

const openRentModal = (toy: any) => {
  selectedToy.value = toy
  modalStep.value = 1
  submitError.value = ''
  availabilityStatus.value = 'idle'

  bookingForm.value.startDate = todayStr
  bookingForm.value.endDate = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]

  if (user.value) {
    bookingForm.value.name = user.value.name || ''
    bookingForm.value.phone = user.value.phone || ''
    bookingForm.value.address = user.value.address || ''
  } else {
    bookingForm.value.name = ''
    bookingForm.value.phone = ''
    bookingForm.value.address = ''
  }

  isModalOpen.value = true
  checkAvailabilityDebounced()
}

// Watch user login while modal is open
watch(user, (newUser) => {
  if (newUser && isModalOpen.value) {
    bookingForm.value.name = newUser.name || bookingForm.value.name
    bookingForm.value.phone = newUser.phone || bookingForm.value.phone
    bookingForm.value.address = newUser.address || bookingForm.value.address
  }
})

const onPhoneInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let val = target.value.replace(/\D/g, '')
  if (val.startsWith('7') || val.startsWith('8')) val = val.substring(1)
  
  let formatted = '+7'
  if (val.length > 0) formatted += ' (' + val.substring(0, 3)
  if (val.length >= 4) formatted += ') ' + val.substring(3, 6)
  if (val.length >= 7) formatted += '-' + val.substring(6, 8)
  if (val.length >= 9) formatted += '-' + val.substring(8, 10)
  
  bookingForm.value.phone = formatted
}

const goToPaymentStep = () => {
  submitError.value = ''

  if (!user.value) {
    openAuthModal('login')
    submitError.value = 'Пожалуйста, авторизуйтесь для завершения бронирования.'
    return
  }

  const finalAddress = bookingForm.value.address.trim() || user.value?.address || ''
  const finalPhone = bookingForm.value.phone.trim() || user.value?.phone || ''

  if (!finalPhone) {
    submitError.value = 'Пожалуйста, укажите контактный номер телефона.'
    return
  }

  if (!finalAddress) {
    submitError.value = 'Пожалуйста, укажите адрес доставки.'
    return
  }

  modalStep.value = 2
}

const submitBookingAndPay = async () => {
  if (isSubmitting.value) return
  submitError.value = ''
  isSubmitting.value = true

  const finalAddress = bookingForm.value.address.trim() || user.value?.address || ''
  const finalPhone = bookingForm.value.phone.trim() || user.value?.phone || ''

  try {
    // 1. Create Rental record
    const res = await createRental({
      toy_id: selectedToy.value.id,
      start_date: bookingForm.value.startDate,
      end_date: bookingForm.value.endDate,
      delivery_address: finalAddress,
      contact_phone: finalPhone,
      notes: `Клиент: ${user.value?.name || bookingForm.value.name} (Оплата: ${selectedPaymentMethod.value})`
    })

    const rentalId = res?.data?.id
    
    // 2. Process Payment
    if (rentalId) {
      try {
        await payRental(rentalId)
      } catch (payErr) {
        console.warn('Auto pay call had non-critical issue', payErr)
      }
    }

    isModalOpen.value = false
    
    // 3. Redirect immediately to Profile History -> Rentals Tab!
    await router.push('/profile?section=history&tab=rentals')
  } catch (e: any) {
    console.error('Booking submission failed', e)
    const errObj = e?.data || e?.response?._data
    if (errObj?.errors) {
      const firstKey = Object.keys(errObj.errors)[0]
      submitError.value = errObj.errors[firstKey][0] || 'Ошибка валидации.'
    } else if (errObj?.message) {
      submitError.value = errObj.message
    } else {
      submitError.value = 'Не удалось оформить бронирование. Проверьте правильность дат или обратитесь в службу поддержки.'
    }
  } finally {
    isSubmitting.value = false
  }
}

const formatDateSimple = (dateStr: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short'
  })
}

const formatPrice = (val: number) => {
  if (!val && val !== 0) return '0'
  return Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

const truncateDesc = (desc: string, max: number) => {
  if (!desc) return ''
  return desc.length > max ? desc.substring(0, max) + '...' : desc
}
</script>

<style scoped>
.short-rent-page {
  min-height: 100vh;
  background-color: #F7F3EA;
  color: #27312B;
  font-family: 'Onest', sans-serif;
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

.rent-hero {
  text-align: center;
  max-width: 760px;
  margin: 0 auto 36px auto;
}

.rent-badge {
  display: inline-block;
  background: #E7EFE9;
  color: #496B5A;
  font-family: 'Onest', sans-serif;
  font-weight: 800;
  font-size: 12px;
  letter-spacing: 1.2px;
  padding: 6px 16px;
  border-radius: 20px;
  margin-bottom: 16px;
}

.rent-title {
  font-family: 'Onest', sans-serif;
  font-weight: 800;
  font-size: 38px;
  color: #27312B;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

.rent-subtitle {
  font-size: 15.5px;
  color: #737B75;
  line-height: 1.6;
}

/* Category Tabs */
.category-tabs-wrapper {
  margin-bottom: 40px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.category-tabs-wrapper::-webkit-scrollbar {
  display: none;
}
.category-tabs {
  display: flex;
  gap: 12px;
  justify-content: center;
  min-width: max-content;
  padding: 4px;
}

.cat-tab {
  background: #FFFDF8;
  border: 1.5px solid #DED7CB;
  border-radius: 50px;
  padding: 10px 22px;
  font-family: 'Onest', sans-serif;
  font-weight: 700;
  font-size: 14px;
  color: #5F6862;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cat-tab:hover {
  background: #F3EEE6;
}

.cat-tab.active {
  background: #496B5A;
  border-color: #496B5A;
  color: #FFFDF8;
  box-shadow: 0 4px 14px rgba(51, 61, 54, 0.25);
}

/* Products Grid */
.loading-state, .empty-state {
  text-align: center;
  padding: 70px 20px;
  background: #FFFDF8;
  border-radius: 28px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  margin-bottom: 64px;
}

.spinner {
  width: 44px;
  height: 44px;
  border: 4px solid #E7EFE9;
  border-top-color: #496B5A;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 52px;
  margin-bottom: 16px;
}
.empty-state h3 {
  font-family: 'Onest', sans-serif;
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 8px;
}
.empty-state p {
  color: #737B75;
  margin-bottom: 24px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}
.reset-btn {
  background: #496B5A;
  color: #fff;
  border: none;
  padding: 12px 28px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
}
.reset-btn:hover {
  background: #496B5A;
  transform: translateY(-2px);
}

.special-products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 64px;
}

.product-card {
  background: #FFFDF8;
  border-radius: 24px;
  padding: 18px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 36px rgba(51, 61, 54, 0.1);
}

.product-img-wrapper {
  position: relative;
  width: 100%;
  height: 220px;
  border-radius: 18px;
  overflow: hidden;
  margin-bottom: 16px;
  background: #F3EEE6;
}

.product-img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.product-card:hover .product-img-wrapper img {
  transform: scale(1.06);
}

.card-cat-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(26, 26, 46, 0.75);
  backdrop-filter: blur(4px);
  color: #FFFDF8;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
}

.product-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.product-name {
  font-family: 'Onest', sans-serif;
  font-weight: 800;
  font-size: 18px;
  margin-bottom: 6px;
  color: #27312B;
  line-height: 1.3;
}

.product-desc {
  font-size: 13.5px;
  color: #737B75;
  line-height: 1.45;
  margin-bottom: 18px;
  flex: 1;
}

.product-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #F3EEE6;
}

.product-price .price {
  font-family: 'Onest', sans-serif;
  font-weight: 800;
  font-size: 20px;
  color: #27312B;
}

.product-price .period {
  font-size: 12.5px;
  color: #737B75;
  margin-left: 2px;
}

.rent-btn {
  background: #496B5A;
  color: #FFFDF8;
  border: none;
  font-family: 'Onest', sans-serif;
  font-weight: 700;
  font-size: 14px;
  padding: 10px 18px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.rent-btn:hover {
  background: #496B5A;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(51, 61, 54, 0.3);
}

/* How works */
.how-rent-works {
  background: #FFFDF8;
  border-radius: 28px;
  padding: 48px;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.section-heading {
  text-align: center;
  font-family: 'Onest', sans-serif;
  font-weight: 800;
  font-size: 28px;
  margin-bottom: 36px;
}

.steps-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.step-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.step-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #D8B56A;
  color: #27312B;
  font-family: 'Onest', sans-serif;
  font-weight: 800;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.step-box h4 {
  font-family: 'Onest', sans-serif;
  font-weight: 800;
  font-size: 17px;
  margin-bottom: 6px;
}

.step-box p {
  font-size: 13.5px;
  color: #737B75;
  line-height: 1.5;
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

.rent-modal {
  position: relative;
  background: #FFFDF8;
  width: 100%;
  max-width: 480px;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  max-height: 90vh;
  overflow-y: auto;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #F3EEE6;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5F6862;
  transition: 0.2s;
}

.close-btn:hover {
  background: #DED7CB;
}

.step-badge {
  display: inline-block;
  background: #E7EFE9;
  color: #496B5A;
  font-size: 11px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 8px;
  margin-bottom: 6px;
}

.back-step-btn {
  background: none;
  border: none;
  color: #496B5A;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  padding: 0;
  margin-bottom: 8px;
  display: block;
}

.modal-header-box {
  margin-bottom: 16px;
}

.modal-title {
  font-family: 'Onest', sans-serif;
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 4px;
}

.modal-desc {
  font-size: 14px;
  color: #737B75;
}

.guest-login-notice {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #E7EFE9;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 12.5px;
  color: #496B5A;
  margin-bottom: 16px;
}

.text-login-btn {
  background: none;
  border: none;
  color: #496B5A;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 20px;
}

.auth-readonly-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #F3EEE6;
  padding: 16px;
  border-radius: 14px;
}

.read-grp {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.r-label {
  font-size: 12px;
  color: #737B75;
  font-weight: 700;
}

.r-val {
  font-size: 14.5px;
  color: #27312B;
  font-weight: 600;
}

.input-grp {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-grp label {
  font-size: 13px;
  font-weight: 700;
}

.m-input {
  padding: 12px 14px;
  border: 1.5px solid #DED7CB;
  border-radius: 12px;
  font-size: 14px;
  outline: none;
  font-family: 'Onest', sans-serif;
  transition: all 0.2s ease;
}

.m-input:focus {
  border-color: #496B5A;
}

.date-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.avail-banner {
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
}

.avail-banner.checking {
  background: #FFF8E7;
  color: #B7791F;
}

.avail-banner.unavailable {
  background: #FEE2E2;
  color: #DC2626;
}

.total-price-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
  padding: 16px;
  background: #E7EFE9;
  border-radius: 14px;
  color: #496B5A;
}

.price-calc-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.days-detail {
  font-weight: 700;
  font-size: 14px;
}

.deposit-note {
  font-size: 11.5px;
  opacity: 0.85;
}

.price-grand-total {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.total-lbl {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.price-grand-total strong {
  font-family: 'Onest', sans-serif;
  font-size: 22px;
  font-weight: 800;
}

/* Payment Methods */
.payment-methods-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 18px;
}

.pay-method-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1.5px solid #DED7CB;
  border-radius: 14px;
  cursor: pointer;
  transition: 0.2s;
}

.pay-method-card:hover {
  border-color: #496B5A;
  background: #FBF8F2;
}

.pay-method-card.selected {
  border-color: #496B5A;
  background: #E7EFE9;
}

.pay-radio-circle {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid #496B5A;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radio-inner {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #496B5A;
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
  color: #FFFDF8;
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
  color: #27312B;
}

.pay-method-info span {
  font-size: 12px;
  color: #737B75;
}

/* Kaspi Mock */
.kaspi-pay-preview {
  text-align: center;
  background: #FBF8F2;
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
  width: 110px;
  height: 110px;
  background: #FFFDF8;
  border: 2px solid #27312B;
  border-radius: 12px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.qr-block {
  position: absolute;
  width: 24px;
  height: 24px;
  background: #27312B;
  border-radius: 4px;
}

.qr-block.top-left { top: 8px; left: 8px; }
.qr-block.top-right { top: 8px; right: 8px; }
.qr-block.bottom-left { bottom: 8px; left: 8px; }

.qr-center-text {
  font-size: 10px;
  font-weight: 800;
  background: #F14635;
  color: #FFFDF8;
  padding: 2px 6px;
  border-radius: 4px;
  z-index: 2;
}

.qr-hint {
  font-size: 12px;
  color: #737B75;
  line-height: 1.4;
  margin: 0;
}

.card-inputs-preview {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #FBF8F2;
  padding: 14px;
  border-radius: 16px;
  margin-bottom: 16px;
}

.order-recap-box {
  background: #F3EEE6;
  padding: 14px;
  border-radius: 14px;
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
}

.recap-row {
  display: flex;
  justify-content: space-between;
  color: #5F6862;
}

.recap-row.total {
  border-top: 1px dashed #D0D0DC;
  padding-top: 8px;
  margin-top: 4px;
  color: #27312B;
  font-size: 15px;
}

.recap-row.total strong {
  color: #496B5A;
  font-family: 'Onest', sans-serif;
  font-size: 18px;
}

.submit-error-banner {
  background: #FEE2E2;
  color: #DC2626;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  margin-bottom: 14px;
  font-weight: 600;
}

.submit-rent-btn {
  width: 100%;
  background: #496B5A;
  color: #FFFDF8;
  border: none;
  padding: 14px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: 0.2s;
}

.submit-rent-btn.pay-btn {
  background: #6F927C;
}

.submit-rent-btn.pay-btn:hover:not(:disabled) {
  background: #05b88a;
}

.submit-rent-btn:hover:not(:disabled) {
  background: #385446;
}

.submit-rent-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 960px) {
  .steps-row { grid-template-columns: 1fr; gap: 24px; }
}

@media (max-width: 768px) {
  .container {
    padding: 0 14px;
  }

  .rent-title {
    font-size: 26px;
    line-height: 1.25;
  }

  .category-tabs {
    justify-content: flex-start;
  }
  
  .special-products-grid {
    grid-template-columns: 1fr;
  }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
