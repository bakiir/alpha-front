<template>
  <div class="short-rent-page">
    <TheHeader />

    <main v-if="featureBlocked" class="container page-content">
      <FeatureUnavailable
        :title="t('rental.unavailableTitle')"
        :description="t('rental.unavailableDesc')"
      />
    </main>

    <main v-else class="container page-content">
      <!-- Hero -->
      <section class="rent-hero">
        <span class="rent-badge">{{ t('rental.badge') }}</span>
        <h1 class="rent-title">{{ t('rental.title') }}</h1>
        <p class="rent-subtitle">
          {{ t('rental.subtitle') }}
        </p>
      </section>

      <div v-if="isFromSubscription" class="sub-addon-banner">
        <AppIcon name="how-it-works" :size="24" class="sub-addon-icon" />
        <div>
          <strong>{{ t('rental.addonTitle') }}</strong>
          <p>
            {{ t('rental.addonBody') }}
          </p>
        </div>
      </div>

      <!-- Category Tabs -->
      <div class="category-tabs-wrapper">
        <div class="category-tabs">
          <button 
            class="cat-tab" 
            :class="{ active: selectedCategory === '' }"
            @click="selectCategory('')"
          >
            {{ t('rental.allProducts') }}
          </button>
          <button 
            v-for="cat in categories" 
            :key="cat.id"
            class="cat-tab"
            :class="{ active: selectedRootId === cat.id && selectedChildId === null }"
            @click="selectCategory(cat.id)"
          >
            {{ cat.name }}
          </button>
        </div>
        <div v-if="activeRootChildren.length" class="category-subtabs">
          <button
            v-for="child in activeRootChildren"
            :key="child.id"
            class="cat-tab cat-tab--child"
            :class="{ active: selectedChildId === child.id }"
            @click="selectCategory(child.id)"
          >
            {{ child.name }}
          </button>
        </div>
      </div>

      <!-- Products Grid -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>{{ t('rental.loading') }}</p>
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
            <p class="product-desc">{{ truncateDesc(toy.description || t('rental.descFallback'), 75) }}</p>
            
            <div class="product-bottom">
              <div class="product-price">
                <span class="price">{{ formatPrice(getDailyPrice(toy)) }} ₸</span>
                <span class="period">{{ t('rental.perDay') }}</span>
              </div>
              <button class="rent-btn" @click="openRentModal(toy)">
                {{ t('rental.book') }}
              </button>
            </div>
          </div>
        </div>
      </section>
      
      <div v-else class="empty-state">
        <AppIcon name="party" :size="40" class="empty-icon" />
        <h3>{{ t('rental.emptyTitle') }}</h3>
        <p>{{ t('rental.emptyBody') }}</p>
        <button class="reset-btn" @click="selectCategory('')">{{ t('rental.showAllCategories') }}</button>
      </div>

      <!-- How short rent works -->
      <section class="how-rent-works">
        <h2 class="section-heading">{{ t('rental.howTitle') }}</h2>
        <div class="steps-row">
          <div class="step-box">
            <div class="step-icon">1</div>
            <h4>{{ t('rental.step1Title') }}</h4>
            <p>{{ t('rental.step1Body') }}</p>
          </div>
          <div class="step-box">
            <div class="step-icon">2</div>
            <h4>{{ t('rental.step2Title') }}</h4>
            <p>{{ t('rental.step2Body') }}</p>
          </div>
          <div class="step-box">
            <div class="step-icon">3</div>
            <h4>{{ t('rental.step3Title') }}</h4>
            <p>{{ t('rental.step3Body') }}</p>
          </div>
        </div>
      </section>
    </main>

    <FaqSection
      placement="rental"
      :title="t('rental.faqTitle')"
      :subtitle="t('rental.faqSubtitle')"
    />

    <!-- Booking & Payment Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isModalOpen" class="modal-overlay" @click.self="isModalOpen = false">
          <div class="rent-modal">
            <button class="close-btn" :aria-label="t('rental.close')" @click="isModalOpen = false">&times;</button>
            
            <!-- STEP 1: Details and Dates -->
            <div v-if="modalStep === 1">
              <div class="modal-header-box">
                <span class="step-badge">{{ t('rental.modalStep1') }}</span>
                <h2 class="modal-title"><AppIcon name="calendar" :size="22" class="modal-title-icon" /> {{ t('rental.modalParamsTitle') }}</h2>
                <p class="modal-desc">
                  {{ t('rental.productLabel') }} <strong>{{ selectedToy?.name }}</strong>
                </p>
                <p v-if="isFromSubscription" class="sub-addon-modal-note">
                  {{ t('rental.addonModalNote') }}
                </p>
              </div>

              <!-- Notice if not logged in -->
              <div v-if="!user" class="guest-login-notice">
                <span>{{ t('rental.guestNotice') }}</span>
                <button class="text-login-btn" type="button" @click="openAuthModal('login')">
                  {{ t('rental.loginCta') }}
                </button>
              </div>

              <div class="modal-form">
                <!-- If User is Authenticated -->
                <template v-if="user">
                  <div class="auth-readonly-info">
                    <div class="read-grp">
                      <span class="r-label">{{ t('rental.customer') }}</span>
                      <span class="r-val">{{ user.name }}</span>
                    </div>
                    <div class="read-grp">
                      <span class="r-label">{{ t('rental.phone') }}</span>
                      <span class="r-val" v-if="user.phone">{{ user.phone }}</span>
                      <input 
                        v-else 
                        :value="bookingForm.phone" 
                        type="tel" 
                        :placeholder="t('rental.phonePlaceholder')" 
                        maxlength="18"
                        autocomplete="tel"
                        class="m-input" 
                        @input="onPhoneInput"
                        @paste="onPhonePaste"
                      />
                    </div>
                    <div class="read-grp">
                      <span class="r-label">{{ t('rental.address') }}</span>
                      <input 
                        v-model="bookingForm.address" 
                        type="text" 
                        :placeholder="t('rental.addressPlaceholder')" 
                        class="m-input" 
                      />
                    </div>
                  </div>
                </template>

                <!-- If User is Guest -->
                <template v-else>
                  <div class="input-grp">
                    <label>{{ t('rental.yourName') }}</label>
                    <input v-model="bookingForm.name" type="text" :placeholder="t('rental.namePlaceholder')" class="m-input" />
                  </div>
                  <div class="input-grp">
                    <label>{{ t('rental.phone') }}</label>
                    <input 
                      :value="bookingForm.phone" 
                      type="tel" 
                      :placeholder="t('rental.phonePlaceholder')" 
                      maxlength="18"
                      autocomplete="tel"
                      class="m-input" 
                      @input="onPhoneInput"
                      @paste="onPhonePaste"
                    />
                  </div>
                  <div class="input-grp">
                    <label>{{ t('rental.address') }}</label>
                    <input v-model="bookingForm.address" type="text" :placeholder="t('rental.addressPlaceholder')" class="m-input" />
                  </div>
                </template>

                <!-- Dates Selection -->
                <div class="date-row">
                  <div class="input-grp">
                    <label>{{ t('rental.deliveryDate') }}</label>
                    <input 
                      v-model="bookingForm.startDate" 
                      type="date" 
                      :min="todayStr"
                      class="m-input" 
                      @change="onStartDateChange"
                    />
                  </div>
                  <div class="input-grp">
                    <label>{{ t('rental.pickupDate') }}</label>
                    <input 
                      v-model="bookingForm.endDate" 
                      type="date" 
                      :min="bookingForm.startDate || todayStr"
                      class="m-input" 
                      @change="onScheduleChanged"
                    />
                  </div>
                </div>

                <div v-if="deliverySlots.length" class="slot-block">
                  <label class="slot-block-label">{{ t('rental.deliverySlot') }}</label>
                  <div class="slot-grid">
                    <button
                      v-for="slot in deliverySlots"
                      :key="'d-' + slot.key"
                      type="button"
                      class="slot-chip"
                      :class="{ active: bookingForm.deliverySlot === slot.key, disabled: slot.available === false }"
                      :disabled="slot.available === false"
                      @click="selectDeliverySlot(slot.key)"
                    >
                      {{ slot.label }}
                    </button>
                  </div>
                </div>

                <div v-if="pickupSlots.length" class="slot-block">
                  <label class="slot-block-label">{{ t('rental.pickupSlot') }}</label>
                  <div class="slot-grid">
                    <button
                      v-for="slot in pickupSlots"
                      :key="'p-' + slot.key"
                      type="button"
                      class="slot-chip"
                      :class="{ active: bookingForm.pickupSlot === slot.key, disabled: slot.available === false }"
                      :disabled="slot.available === false"
                      @click="selectPickupSlot(slot.key)"
                    >
                      {{ slot.label }}
                    </button>
                  </div>
                  <p class="slot-hint">{{ t('rental.slotHint') }}</p>
                </div>

                <!-- Availability Status Banner -->
                <div v-if="availabilityStatus === 'checking'" class="avail-banner checking">
                  {{ t('rental.checkingAvailability') }}
                </div>
                <div v-else-if="availabilityStatus === 'unavailable'" class="avail-banner unavailable">
                  <AppIcon name="alert" :size="14" class="inline-icon" /> {{ availabilityMessage || t('rental.unavailableDefault') }}
                </div>

                <div v-if="confirmationCopy" class="guarantee-box">
                  <pre>{{ confirmationCopy }}</pre>
                </div>

                <!-- Price Breakdown Box -->
                <div class="total-price-box">
                  <div class="price-calc-details">
                    <span class="days-detail">{{ t('rental.daysTimesRate', { days: serverDaysCount, rate: formatPrice(serverDailyRate) }) }}</span>
                    <span class="deposit-note" v-if="serverDeposit > 0">
                      {{ t('rental.refundableDeposit', { amount: formatPrice(serverDeposit) }) }}
                    </span>
                  </div>
                  <div class="price-grand-total">
                    <span class="total-lbl">{{ t('rental.total') }}</span>
                    <strong>{{ formatPrice(serverTotalPrice) }} ₸</strong>
                  </div>
                </div>
              </div>

              <!-- Error message banner if any -->
              <div v-if="submitError" class="submit-error-banner">
                {{ submitError }}
              </div>

              <button 
                class="submit-rent-btn" 
                :disabled="serverTotalPrice <= 0 || availabilityStatus === 'unavailable' || !bookingForm.deliverySlot || !bookingForm.pickupSlot" 
                @click="goToPaymentStep"
              >
                {{ t('rental.goToPay', { amount: formatPrice(serverTotalPrice) }) }}
              </button>
            </div>

            <!-- STEP 2: Payment -->
            <div v-else-if="modalStep === 2">
              <div class="modal-header-box">
                <button class="back-step-btn" @click="modalStep = 1">{{ t('rental.backToDates') }}</button>
                <span class="step-badge">{{ t('rental.modalStep2') }}</span>
                <h2 class="modal-title"><AppIcon name="credit-card" :size="22" class="modal-title-icon" /> {{ t('rental.payTitle') }}</h2>
                <p class="modal-desc">
                  {{ t('rental.amountDue') }} <strong>{{ formatPrice(serverTotalPrice) }} ₸</strong>
                </p>
                <p v-if="isFromSubscription" class="sub-addon-modal-note">
                  {{ t('rental.addonModalNoteShort') }}
                </p>
                <div v-if="confirmationCopy" class="guarantee-box compact">
                  <pre>{{ confirmationCopy }}</pre>
                </div>
              </div>

              <!-- Payment: Halyk ePay only -->
              <div class="payment-methods-box">
                <div class="epay-method-card selected">
                  <div class="pay-method-icon card-badge"><AppIcon name="credit-card" :size="24" /></div>
                  <div class="pay-method-info">
                    <strong>{{ t('rental.cardEpay') }}</strong>
                    <span>{{ t('rental.cardEpayHint') }}</span>
                  </div>
                </div>
                <p class="epay-hint">{{ t('rental.epayHint') }}</p>
              </div>

              <!-- Summary Recap -->
              <div class="order-recap-box">
                <div class="recap-row">
                  <span>{{ t('rental.recapProduct') }}</span>
                  <strong>{{ selectedToy?.name }}</strong>
                </div>
                <div class="recap-row">
                  <span>{{ t('rental.recapPeriod') }}</span>
                  <span>{{ formatDateSimple(bookingForm.startDate) }} — {{ formatDateSimple(bookingForm.endDate) }} ({{ t('rental.recapDays', { days: serverDaysCount }) }})</span>
                </div>
                <div v-if="isFromSubscription" class="recap-row">
                  <span>{{ t('rental.recapDelivery') }}</span>
                  <span>{{ t('rental.withSubscriptionSet') }}</span>
                </div>
                <div class="recap-row total">
                  <span>{{ t('rental.totalDue') }}</span>
                  <strong>{{ formatPrice(serverTotalPrice) }} ₸</strong>
                </div>
                <div v-if="confirmationCopy" class="recap-guarantee">
                  <pre>{{ confirmationCopy }}</pre>
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
                <span v-if="isSubmitting">{{ t('rental.processingPay') }}</span>
                <span v-else>{{ t('rental.payAmount', { amount: formatPrice(serverTotalPrice) }) }}</span>
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
import FaqSection from '~/components/FaqSection.vue'

const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
usePageSeo('/short-rent')
const { user, openAuthModal } = useAuth()
const { createRental, payRental, fetchScheduleOptions, checkAvailability } = useRentals()
const { handlePayResponse } = usePaymentLaunch()
const { request } = useApi()
const { fetchToys } = useToys()
const { success: toastSuccess, error: toastError } = useToast()
const { isVisible } = useFeatures()
const featureBlocked = computed(() => !isVisible('short_rent'))

const isFromSubscription = computed(() => String(route.query.from || '') === 'subscription')

const defaultImage = 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80'

const { categories, loadCategories } = useToyCategories()

const getCategoryLabel = (cat: { name?: string } | null | undefined): string => {
  return cat?.name ?? t('rental.categoryFallback')
}

const selectedCategory = ref<number | ''>('')
const loading = ref(true)
const specialToys = ref<any[]>([])

const selectedRootId = computed<number | null>(() => {
  if (selectedCategory.value === '') return null
  const id = Number(selectedCategory.value)
  const root = categories.value.find(c => c.id === id)
  if (root) return root.id
  for (const rootCat of categories.value) {
    if ((rootCat.children ?? []).some(child => child.id === id)) return rootCat.id
  }
  return null
})

const selectedChildId = computed<number | null>(() => {
  if (selectedCategory.value === '') return null
  const id = Number(selectedCategory.value)
  for (const rootCat of categories.value) {
    if ((rootCat.children ?? []).some(child => child.id === id)) return id
  }
  return null
})

const activeRootChildren = computed(() => {
  if (selectedRootId.value == null) return []
  const root = categories.value.find(c => c.id === selectedRootId.value)
  return root?.children ?? []
})

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

void loadCategories()
loadToys()

// Modal State & Form
const isModalOpen = ref(false)
const modalStep = ref<1 | 2>(1)
const isSubmitting = ref(false)
const submitError = ref('')
const selectedToy = ref<any>(null)
const availabilityStatus = ref<'idle' | 'checking' | 'available' | 'unavailable'>('idle')
const availabilityMessage = ref('')
const deliverySlots = ref<any[]>([])
const pickupSlots = ref<any[]>([])
const confirmationCopy = ref('')
const serverDaysCount = ref(1)
const serverDailyRate = ref(1500)
const serverTotalPrice = ref(0)
const serverDeposit = ref(0)

const almatyToday = () => {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Almaty' }).format(new Date())
  } catch {
    return new Date().toISOString().split('T')[0]
  }
}
const todayStr = almatyToday()
const defaultEndDate = () => {
  const d = new Date(todayStr + 'T12:00:00')
  d.setDate(d.getDate() + 2)
  return d.toISOString().split('T')[0]
}

const bookingForm = ref({
  name: '',
  phone: '',
  address: '',
  startDate: todayStr,
  endDate: defaultEndDate(),
  deliverySlot: '',
  pickupSlot: '',
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

const selectDeliverySlot = (key: string) => {
  bookingForm.value.deliverySlot = key
  onScheduleChanged()
}

const selectPickupSlot = (key: string) => {
  bookingForm.value.pickupSlot = key
  onScheduleChanged()
}

const onStartDateChange = () => {
  if (bookingForm.value.startDate && bookingForm.value.endDate) {
    if (bookingForm.value.endDate < bookingForm.value.startDate) {
      bookingForm.value.endDate = bookingForm.value.startDate
    }
  }
  bookingForm.value.deliverySlot = ''
  bookingForm.value.pickupSlot = ''
  onScheduleChanged()
}

let checkTimer: any = null
const onScheduleChanged = () => {
  clearTimeout(checkTimer)
  availabilityStatus.value = 'checking'
  checkTimer = setTimeout(async () => {
    await refreshScheduleAndAvailability()
  }, 350)
}

const refreshScheduleAndAvailability = async () => {
  if (!selectedToy.value?.id || !bookingForm.value.startDate || !bookingForm.value.endDate) {
    availabilityStatus.value = 'idle'
    return
  }

  try {
    const optRes = await fetchScheduleOptions({
      toy_id: selectedToy.value.id,
      start_date: bookingForm.value.startDate,
      end_date: bookingForm.value.endDate,
      delivery_slot: bookingForm.value.deliverySlot || undefined,
      pickup_slot: bookingForm.value.pickupSlot || undefined,
    })
    const data = optRes?.data
    deliverySlots.value = data?.delivery_slots || data?.slots || []
    pickupSlots.value = data?.pickup_slots || data?.slots || []

    const deliveryStillOk = deliverySlots.value.some(
      (s: any) => s.key === bookingForm.value.deliverySlot && s.available !== false,
    )
    if (!bookingForm.value.deliverySlot || !deliveryStillOk) {
      const first = deliverySlots.value.find((s: any) => s.available !== false)
      bookingForm.value.deliverySlot = first?.key || ''
    }

    const pickupStillOk = pickupSlots.value.some(
      (s: any) => s.key === bookingForm.value.pickupSlot && s.available !== false,
    )
    if (!bookingForm.value.pickupSlot || !pickupStillOk) {
      const first = pickupSlots.value.find((s: any) => s.available !== false)
      bookingForm.value.pickupSlot = first?.key || ''
    }

    if (data?.pricing) {
      serverDaysCount.value = data.pricing.days_count
      serverDailyRate.value = data.pricing.daily_rate
      serverTotalPrice.value = data.pricing.total_price
      serverDeposit.value = data.pricing.deposit_amount
    } else {
      serverDaysCount.value = 1
      serverDailyRate.value = getDailyPrice(selectedToy.value)
      serverTotalPrice.value = serverDailyRate.value
      serverDeposit.value = 0
    }

    if (!bookingForm.value.deliverySlot || !bookingForm.value.pickupSlot) {
      availabilityStatus.value = 'idle'
      confirmationCopy.value = ''
      return
    }

    const res = await checkAvailability({
      toy_id: selectedToy.value.id,
      start_date: bookingForm.value.startDate,
      end_date: bookingForm.value.endDate,
      delivery_slot: bookingForm.value.deliverySlot,
      pickup_slot: bookingForm.value.pickupSlot,
    })

    if (res?.available === false || res?.status === 'unavailable') {
      availabilityStatus.value = 'unavailable'
      availabilityMessage.value = res?.message || data?.unavailable_reason || ''
      confirmationCopy.value = ''
    } else {
      availabilityStatus.value = 'available'
      availabilityMessage.value = ''
      const payload = res?.data
      if (payload) {
        serverDaysCount.value = payload.days_count ?? serverDaysCount.value
        serverDailyRate.value = payload.daily_rate ?? serverDailyRate.value
        serverTotalPrice.value = payload.total_price ?? serverTotalPrice.value
        serverDeposit.value = payload.deposit_amount ?? serverDeposit.value
        confirmationCopy.value = payload.schedule?.confirmation_copy || data?.guarantee?.copy || ''
      }
    }
  } catch (e: any) {
    availabilityStatus.value = 'unavailable'
    availabilityMessage.value = e?.data?.message || e?.message || t('rental.availabilityFailed')
    confirmationCopy.value = ''
  }
}

const openRentModal = (toy: any) => {
  selectedToy.value = toy
  modalStep.value = 1
  submitError.value = ''
  availabilityStatus.value = 'idle'
  availabilityMessage.value = ''
  confirmationCopy.value = ''
  deliverySlots.value = []
  pickupSlots.value = []

  bookingForm.value.startDate = todayStr
  bookingForm.value.endDate = defaultEndDate()
  bookingForm.value.deliverySlot = ''
  bookingForm.value.pickupSlot = ''

  if (user.value) {
    bookingForm.value.name = user.value.name || ''
    bookingForm.value.phone = formatKazakhstanPhone(user.value.phone || '')
    bookingForm.value.address = user.value.address || ''
  } else {
    bookingForm.value.name = ''
    bookingForm.value.phone = ''
    bookingForm.value.address = ''
  }

  isModalOpen.value = true
  onScheduleChanged()
}

watch(user, (newUser) => {
  if (newUser && isModalOpen.value) {
    bookingForm.value.name = newUser.name || bookingForm.value.name
    bookingForm.value.phone = formatKazakhstanPhone(newUser.phone || bookingForm.value.phone)
    bookingForm.value.address = newUser.address || bookingForm.value.address
  }
})

const onPhoneInput = (event: Event) => {
  handlePhoneInput(event, (val) => { bookingForm.value.phone = val })
}

const onPhonePaste = (event: ClipboardEvent) => {
  handlePhonePaste(event, (val) => { bookingForm.value.phone = val })
}

const goToPaymentStep = () => {
  submitError.value = ''

  if (!user.value) {
    openAuthModal('login')
    submitError.value = t('rental.loginRequired')
    return
  }

  const finalAddress = bookingForm.value.address.trim() || user.value?.address || ''
  const finalPhone = bookingForm.value.phone.trim() || user.value?.phone || ''

  if (!finalPhone) {
    submitError.value = t('rental.phoneRequired')
    return
  }

  if (!finalAddress) {
    submitError.value = t('rental.addressRequired')
    return
  }

  if (!bookingForm.value.deliverySlot || !bookingForm.value.pickupSlot) {
    submitError.value = t('rental.slotsRequired')
    return
  }

  if (availabilityStatus.value !== 'available') {
    submitError.value = availabilityMessage.value || t('rental.pickAvailableSlots')
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
    const clientName = user.value?.name || bookingForm.value.name
    const notes = isFromSubscription.value
      ? t('rental.notesWithSubscription', { name: clientName })
      : t('rental.notesClient', { name: clientName })

    const res = await createRental({
      toy_id: selectedToy.value.id,
      start_date: bookingForm.value.startDate,
      end_date: bookingForm.value.endDate,
      delivery_address: finalAddress,
      contact_phone: finalPhone,
      delivery_slot: bookingForm.value.deliverySlot,
      pickup_slot: bookingForm.value.pickupSlot,
      notes,
    })

    const rentalId = res?.data?.id

    if (rentalId) {
      const payRes = await payRental(rentalId, 'card')
      const outcome = await handlePayResponse(payRes, {
        onRedirect: async () => {
          isModalOpen.value = false
        },
        onFulfilled: async (paid) => {
          toastSuccess(t('rental.payAcceptedTitle'), paid.message || t('rental.payAcceptedBody'))
          isModalOpen.value = false
          await router.push(localePath('/profile?section=history&tab=rentals'))
        },
      })
      if (outcome !== 'fulfilled') {
        return
      }
      return
    }

    isModalOpen.value = false
    await router.push(localePath('/profile?section=history&tab=rentals'))
  } catch (e: any) {
    console.error('Booking submission failed', e)
    const errObj = e?.data || e?.response?._data
    if (errObj?.errors) {
      const firstKey = Object.keys(errObj.errors)[0]
      submitError.value = errObj.errors[firstKey][0] || t('rental.validationError')
    } else if (errObj?.message) {
      submitError.value = errObj.message
    } else {
      submitError.value = t('rental.bookingFailed')
    }
    toastError(t('rental.bookingFailedTitle'), submitError.value)
  } finally {
    isSubmitting.value = false
  }
}

const formatDateSimple = (dateStr: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const loc = locale.value === 'kk' ? 'kk-KZ' : locale.value === 'en' ? 'en-US' : 'ru-RU'
  return d.toLocaleDateString(loc, {
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
  background-color: #FAF8F4;
  color: #262626;
  font-family: 'Manrope', sans-serif;
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
  background: #D9E0D5;
  color: var(--green-ink);
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 12px;
  letter-spacing: 1.2px;
  padding: 6px 16px;
  border-radius: 20px;
  margin-bottom: 16px;
}

.rent-title {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 38px;
  color: #262626;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

.rent-subtitle {
  font-size: 15.5px;
  color: #6F746F;
  line-height: 1.6;
}

.sub-addon-banner {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  max-width: 860px;
  margin: 0 auto 32px;
  padding: 18px 22px;
  background: #EEF3EC;
  border: 1px solid #D9E0D5;
  border-radius: 20px;
}

.sub-addon-icon {
  flex-shrink: 0;
  color: var(--green-ink);
  margin-top: 2px;
}

.sub-addon-banner strong {
  display: block;
  font-size: 15.5px;
  font-weight: 800;
  color: #262626;
  margin-bottom: 4px;
}

.sub-addon-banner p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: #5D625F;
}

.sub-addon-modal-note {
  margin: 10px 0 0;
  padding: 10px 12px;
  background: #EEF3EC;
  border-radius: 12px;
  font-size: 13.5px;
  line-height: 1.45;
  color: #3d4a40;
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

.category-subtabs {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 10px;
  padding: 0 4px;
}

.cat-tab {
  background: #FAF8F4;
  border: 1.5px solid #E3D7C6;
  border-radius: 50px;
  padding: 10px 22px;
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 14px;
  color: #5D625F;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cat-tab--child {
  padding: 7px 14px;
  font-size: 12px;
  border-radius: 12px;
}

.cat-tab:hover {
  background: #F4F1EA;
}

.cat-tab.active {
  background: var(--green-surface);
  border-color: var(--green-ink);
  color: var(--green-ink);
  box-shadow: 0 4px 14px rgba(51, 61, 54, 0.25);
}

/* Products Grid */
.loading-state, .empty-state {
  text-align: center;
  padding: 70px 20px;
  background: #FAF8F4;
  border-radius: 28px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  margin-bottom: 64px;
}

.spinner {
  width: 44px;
  height: 44px;
  border: 4px solid #D9E0D5;
  border-top-color: var(--green-ink);
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
  font-family: 'Manrope', sans-serif;
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 8px;
}
.empty-state p {
  color: #6F746F;
  margin-bottom: 24px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}
.reset-btn {
  background: var(--green-surface);
  color: var(--green-ink);
  border: none;
  padding: 12px 28px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
}
.reset-btn:hover {
  background: var(--green-surface);
  transform: translateY(-2px);
  color: var(--green-ink);
}

.special-products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 64px;
}

.product-card {
  background: #FAF8F4;
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
  background: #F4F1EA;
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
  color: #FAF8F4;
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
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 18px;
  margin-bottom: 6px;
  color: #262626;
  line-height: 1.3;
}

.product-desc {
  font-size: 13.5px;
  color: #6F746F;
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
  border-top: 1px solid #F4F1EA;
}

.product-price .price {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 20px;
  color: #262626;
}

.product-price .period {
  font-size: 12.5px;
  color: #6F746F;
  margin-left: 2px;
}

.rent-btn {
  background: var(--green-surface);
  color: var(--green-ink);
  border: none;
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 14px;
  padding: 10px 18px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.rent-btn:hover {
  background: var(--green-surface);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(51, 61, 54, 0.3);
  color: var(--green-ink);
}

/* How works */
.how-rent-works {
  background: #FAF8F4;
  border-radius: 28px;
  padding: 48px;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.section-heading {
  text-align: center;
  font-family: 'Manrope', sans-serif;
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
  background: #E8A62B;
  color: #262626;
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.step-box h4 {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 17px;
  margin-bottom: 6px;
}

.step-box p {
  font-size: 13.5px;
  color: #6F746F;
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
  background: #FAF8F4;
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
  transition: 0.2s;
}

.close-btn:hover {
  background: #E3D7C6;
}

.step-badge {
  display: inline-block;
  background: #D9E0D5;
  color: var(--green-ink);
  font-size: 11px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 8px;
  margin-bottom: 6px;
}

.back-step-btn {
  background: none;
  border: none;
  color: var(--green-ink);
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
  font-family: 'Manrope', sans-serif;
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 4px;
}

.modal-desc {
  font-size: 14px;
  color: #6F746F;
}

.guest-login-notice {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #D9E0D5;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 12.5px;
  color: var(--green-ink);
  margin-bottom: 16px;
}

.text-login-btn {
  background: none;
  border: none;
  color: var(--green-ink);
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
  background: #F4F1EA;
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
  color: #6F746F;
  font-weight: 700;
}

.r-val {
  font-size: 14.5px;
  color: #262626;
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
  border: 1.5px solid #E3D7C6;
  border-radius: 12px;
  font-size: 14px;
  outline: none;
  font-family: 'Manrope', sans-serif;
  transition: all 0.2s ease;
}

.m-input:focus {
  border-color: var(--green-ink);
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
  background: #D9E0D5;
  border-radius: 14px;
  color: var(--green-ink);
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
  font-family: 'Manrope', sans-serif;
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
  border: 1.5px solid #E3D7C6;
  border-radius: 14px;
  cursor: pointer;
  transition: 0.2s;
}

.pay-method-card:hover {
  border-color: var(--green-ink);
  background: #FAF8F4;
}

.pay-method-card.selected {
  border-color: var(--green-ink);
  background: #D9E0D5;
}

.pay-radio-circle {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid var(--green-ink);
  display: flex;
  align-items: center;
  justify-content: center;
}

.radio-inner {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--green-surface);
  color: var(--green-ink);
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
  color: #FAF8F4;
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
  color: #262626;
}

.pay-method-info span {
  font-size: 12px;
  color: #6F746F;
}

.epay-hint {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.4;
  color: #5b6b63;
}

/* Legacy kaspi/card mock styles kept inert (unused in template) */
.kaspi-pay-preview {
  text-align: center;
  background: #FAF8F4;
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
  background: #FAF8F4;
  border: 2px solid #262626;
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
  background: #262626;
  border-radius: 4px;
}

.qr-block.top-left { top: 8px; left: 8px; }
.qr-block.top-right { top: 8px; right: 8px; }
.qr-block.bottom-left { bottom: 8px; left: 8px; }

.qr-center-text {
  font-size: 10px;
  font-weight: 800;
  background: #F14635;
  color: #FAF8F4;
  padding: 2px 6px;
  border-radius: 4px;
  z-index: 2;
}

.qr-hint {
  font-size: 12px;
  color: #6F746F;
  line-height: 1.4;
  margin: 0;
}

.card-inputs-preview {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #FAF8F4;
  padding: 14px;
  border-radius: 16px;
  margin-bottom: 16px;
}

.order-recap-box {
  background: #F4F1EA;
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
  color: #5D625F;
}

.recap-row.total {
  border-top: 1px dashed #D0D0DC;
  padding-top: 8px;
  margin-top: 4px;
  color: #262626;
  font-size: 15px;
}

.recap-row.total strong {
  color: var(--green-ink);
  font-family: 'Manrope', sans-serif;
  font-size: 18px;
}

.slot-block {
  margin: 12px 0 4px;
}
.slot-block-label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #3F6757;
}
.slot-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.slot-chip {
  border: 1px solid #D0D0DC;
  background: #fff;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  color: #262626;
}
.slot-chip.active {
  border-color: #3F6757;
  background: #E8F2EE;
  color: #3F6757;
}
.slot-chip.disabled,
.slot-chip:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.slot-hint {
  margin: 8px 0 0;
  font-size: 12px;
  color: #6B7280;
}
.guarantee-box,
.recap-guarantee {
  margin: 12px 0;
  padding: 12px 14px;
  background: #F3F7F5;
  border-radius: 12px;
  border: 1px solid #D7E5DE;
}
.guarantee-box pre,
.recap-guarantee pre,
.guarantee-box.compact pre {
  margin: 0;
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.45;
  color: #2F4F43;
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
  background: var(--green-surface);
  color: var(--green-ink);
  border: none;
  padding: 14px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: 0.2s;
}

.submit-rent-btn.pay-btn {
  background: #9C91C9;
}

.submit-rent-btn.pay-btn:hover:not(:disabled) {
  background: #05b88a;
}

.submit-rent-btn:hover:not(:disabled) {
  background: var(--green-surface-hover);
  color: var(--green-ink);
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
