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
        <span class="rent-badge">{{ rentBadge }}</span>
        <h1 class="rent-title">{{ rentTitle }}</h1>
        <p class="rent-subtitle">
          {{ rentSubtitle }}
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
      <section
        v-if="loading"
        class="special-products-grid special-products-grid--skeleton"
        role="status"
        aria-busy="true"
        :aria-label="t('rental.loading')"
      >
        <article
          v-for="n in 6"
          :key="n"
          class="product-card product-card--skeleton"
          aria-hidden="true"
        >
          <div class="rent-skeleton-media" />
          <div class="product-info">
            <span class="rent-skeleton-line rent-skeleton-line--title" />
            <span class="rent-skeleton-line rent-skeleton-line--desc" />
            <span class="rent-skeleton-line rent-skeleton-line--desc-short" />
            <div class="product-bottom">
              <span class="rent-skeleton-line rent-skeleton-line--price" />
              <span class="rent-skeleton-line rent-skeleton-line--btn" />
            </div>
          </div>
        </article>
      </section>

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
      <section v-if="rentHowSteps.length" class="how-rent-works">
        <h2 class="section-heading">{{ rentHowTitle }}</h2>
        <div class="steps-row">
          <div
            v-for="(step, idx) in rentHowSteps"
            :key="`${step.icon}-${step.iconImage}-${step.title}-${idx}`"
            class="step-box"
          >
            <div class="step-icon">
              <img
                v-if="step.iconImage"
                :src="step.iconImage"
                :alt="step.title"
                class="step-icon-img"
                width="24"
                height="24"
              >
              <template v-else>{{ step.icon || (idx + 1) }}</template>
            </div>
            <h4>{{ step.title }}</h4>
            <p>{{ step.text }}</p>
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
            <div v-if="modalStep === 1" class="rent-step">
              <div class="rent-step-body">
              <div class="rent-modal-brand">
                <AppLogo size="sm" />
              </div>
              <div class="modal-header-box">
                <p class="rent-kicker">{{ t('rental.bookStep') }}</p>
                <h2 class="modal-title rent-title-serif">{{ t('rental.bookTitle') }}</h2>
                <p v-if="isFromSubscription" class="sub-addon-modal-note">
                  {{ t('rental.addonModalNote') }}
                </p>
              </div>

              <div v-if="!user" class="guest-login-notice">
                <span>{{ t('rental.guestNotice') }}</span>
                <button class="text-login-btn" type="button" @click="openAuthModal('login')">
                  {{ t('rental.loginCta') }}
                </button>
              </div>

              <div class="modal-form">
                <div class="rent-toy-card">
                  <img :src="getToyImage(selectedToy)" :alt="selectedToy?.name || ''" />
                  <span>{{ selectedToy?.name }}</span>
                </div>
                <!-- If User is Authenticated -->
                <template v-if="user">
                  <div v-if="!user.phone" class="input-grp">
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
                  <div v-if="presentedAddress.line && !addressEditing" class="address-row">
                    <AppIcon name="map-pin" :size="18" class="address-row-icon" />
                    <p class="address-row-main">
                      {{ presentedAddress.line }}<template v-if="presentedAddress.details"> · {{ presentedAddress.details }}</template>
                    </p>
                    <button type="button" class="linkish" @click="addressEditing = true">{{ t('rental.changeAddress') }}</button>
                  </div>
                  <div v-else class="input-grp">
                    <label>{{ t('rental.address') }}</label>
                    <input
                      v-model="bookingForm.address"
                      type="text"
                      :placeholder="t('rental.addressPlaceholder')"
                      class="m-input"
                    />
                  </div>
                </template>

                <!-- If User is Guest -->
                <template v-else>
                  <div class="field-pair">
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
                  </div>
                  <div class="input-grp">
                    <label>{{ t('rental.address') }}</label>
                    <input v-model="bookingForm.address" type="text" :placeholder="t('rental.addressPlaceholder')" class="m-input" />
                  </div>
                </template>

                <div class="schedule-panels">
                  <section class="schedule-panel">
                    <h3>{{ t('rental.deliveryBlock') }}</h3>
                    <p class="schedule-panel-label">{{ t('rental.deliveryWhen') }}</p>
                    <div class="date-field-wrap" @click="openNativeDatePicker">
                      <AppIcon name="calendar" :size="18" class="date-field-icon" aria-hidden="true" />
                      <input
                        v-model="bookingForm.startDate"
                        type="date"
                        :min="todayStr"
                        class="date-field-input"
                        :aria-label="t('rental.deliveryDate')"
                        @change="onStartDateChange"
                      />
                    </div>
                    <div v-if="deliverySlots.length" class="slot-grid">
                      <button
                        v-for="slot in deliverySlots"
                        :key="'d-' + slot.key"
                        type="button"
                        class="slot-chip"
                        :class="{ active: bookingForm.deliverySlot === slot.key, disabled: slot.available === false }"
                        :disabled="slot.available === false"
                        @click="selectDeliverySlot(slot.key)"
                      >
                        <AppIcon
                          v-if="bookingForm.deliverySlot === slot.key"
                          name="check"
                          :size="14"
                          class="slot-check"
                        />
                        {{ slot.label }}
                      </button>
                    </div>
                    <p v-if="availabilityStatus === 'checking'" class="schedule-note quiet">{{ t('rental.checkingAvailability') }}</p>
                    <p v-else-if="deliveryNote" class="schedule-note" :class="deliveryNote.tone">{{ deliveryNote.text }}</p>
                  </section>

                  <section class="schedule-panel">
                    <h3>{{ t('rental.returnBlock') }}</h3>
                    <p class="schedule-panel-label">{{ t('rental.returnWhen') }}</p>
                    <div class="date-field-wrap" @click="openNativeDatePicker">
                      <AppIcon name="calendar" :size="18" class="date-field-icon" aria-hidden="true" />
                      <input
                        v-model="bookingForm.endDate"
                        type="date"
                        :min="bookingForm.startDate || todayStr"
                        class="date-field-input"
                        :aria-label="t('rental.returnDate')"
                        @change="onReturnDateChange"
                      />
                    </div>
                    <div v-if="pickupSlots.length" class="slot-grid">
                      <button
                        v-for="slot in pickupSlots"
                        :key="'p-' + slot.key"
                        type="button"
                        class="slot-chip"
                        :class="{ active: bookingForm.pickupSlot === slot.key, disabled: slot.available === false }"
                        :disabled="slot.available === false"
                        @click="selectPickupSlot(slot.key)"
                      >
                        <AppIcon
                          v-if="bookingForm.pickupSlot === slot.key"
                          name="check"
                          :size="14"
                          class="slot-check"
                        />
                        {{ slot.label }}
                      </button>
                    </div>
                    <p v-if="pickupNote" class="schedule-note" :class="pickupNote.tone">{{ pickupNote.text }}</p>
                    <p v-else-if="presentedAddress.line || bookingForm.address" class="schedule-note quiet">{{ t('rental.sameAddress') }}</p>
                  </section>
                </div>
              </div>
              </div>

              <div v-if="submitError" class="submit-error-banner">
                {{ submitError }}
              </div>

              <div class="rent-footer">
                <div class="rent-checkout">
                  <div class="rent-footer-summary">
                    <p class="footer-rent-line">
                      {{ t('rental.footerRentLine', {
                        days: rentalDaysPhrase(serverDaysCount, locale),
                        rate: formatPrice(serverDailyRate),
                        costLabel: t('rental.rentCostLabel'),
                      }) }}
                    </p>
                    <p class="footer-rent-total">{{ formatPrice(serverTotalPrice) }} ₸</p>
                  </div>
                  <p v-if="serverDeposit > 0" class="footer-deposit-note">
                    {{ t('rental.refundableDeposit', { amount: formatPrice(serverDeposit) }) }}
                  </p>
                  <button
                    class="submit-rent-btn rent-cta"
                    :class="{ 'rent-cta--busy': availabilityStatus === 'checking' }"
                    :disabled="rentContinueDisabled"
                    @click="goToPaymentStep"
                  >
                    {{ availabilityStatus === 'checking' ? t('rental.checkingAvailability') : t('rental.continueArrow') }}
                  </button>
                </div>
              </div>
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
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import TheHeader from '~/components/TheHeader.vue'
import TheFooter from '~/components/TheFooter.vue'
import FaqSection from '~/components/FaqSection.vue'

const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
usePageSeo('/short-rent')
const { sectionByKey } = usePageSections('short-rent')
const rentHero = sectionByKey('rent_hero')
const rentHow = sectionByKey('rent_how')

const cmsText = (value: string | null | undefined, fallback: string) => {
  const trimmed = value?.trim()
  return trimmed || fallback
}

const { cmsMediaUrl: resolveMediaUrl } = useCmsMediaUrl()

const rentBadge = computed(() => cmsText(rentHero.value?.badge_text, t('rental.badge')))
const rentTitle = computed(() => cmsText(rentHero.value?.title, t('rental.title')))
const rentSubtitle = computed(() => cmsText(rentHero.value?.subtitle, t('rental.subtitle')))
const rentHowTitle = computed(() => cmsText(rentHow.value?.title, t('rental.howTitle')))

const fallbackHowSteps = computed(() => [
  { icon: '1', iconImage: '', title: t('rental.step1Title'), text: t('rental.step1Body') },
  { icon: '2', iconImage: '', title: t('rental.step2Title'), text: t('rental.step2Body') },
  { icon: '3', iconImage: '', title: t('rental.step3Title'), text: t('rental.step3Body') },
])

const rentHowSteps = computed(() => {
  const raw = rentHow.value?.content as {
    cards?: Array<{ icon?: string; icon_image?: string; title?: string; text?: string }>
  } | null
  const cards = Array.isArray(raw?.cards) ? raw.cards : []
  const fromCms = cards
    .map((card, idx) => ({
      icon: String(card?.icon || String(idx + 1)),
      iconImage: resolveMediaUrl(String(card?.icon_image || '')),
      title: String(card?.title || '').trim(),
      text: String(card?.text || '').trim(),
    }))
    .filter((card) => card.title || card.text)

  return fromCms.length ? fromCms : fallbackHowSteps.value
})

const { user, openAuthModal } = useAuth()
const { createRental, payRental, fetchScheduleOptions, checkAvailability } = useRentals()
const { cityId: rentalCityId } = useCity()
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
watch(rentalCityId, () => {
  void loadToys()
  if (isModalOpen.value) {
    availabilityStatus.value = 'idle'
    void refreshScheduleAndAvailability()
  }
})

// Modal State & Form
const isModalOpen = ref(false)
const modalStep = ref<1 | 2>(1)
const isSubmitting = ref(false)
const submitError = ref('')
const selectedToy = ref<any>(null)
const availabilityStatus = ref<'idle' | 'checking' | 'available' | 'unavailable'>('idle')
const availabilityTitle = ref('')
const availabilityMessage = ref('')
const deliverySlots = ref<any[]>([])
const pickupSlots = ref<any[]>([])
const deliverySlotsClosed = computed(() =>
  deliverySlots.value.length > 0 && deliverySlots.value.every((slot: any) => slot?.available === false),
)
const pickupSlotsClosed = computed(() =>
  pickupSlots.value.length > 0 && pickupSlots.value.every((slot: any) => slot?.available === false),
)

watch(isModalOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})
onBeforeUnmount(() => {
  document.body.style.overflow = ''
})
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
const addressEditing = ref(false)
const datesTouchedByUser = ref(false)
const shiftedFromToday = ref(false)
const presentedAddress = computed(() => presentRentalAddress(bookingForm.value.address || ''))
const stayLabel = computed(() => rentalStayLabel(
  bookingForm.value.startDate,
  bookingForm.value.endDate,
  serverDaysCount.value,
  locale.value,
))
const rentContinueDisabled = computed(() =>
  serverTotalPrice.value <= 0
  || availabilityStatus.value === 'unavailable'
  || availabilityStatus.value === 'checking'
  || !bookingForm.value.deliverySlot
  || !bookingForm.value.pickupSlot,
)

const deliveryNote = computed(() => {
  if (availabilityStatus.value === 'checking') return null
  if (!datesTouchedByUser.value && shiftedFromToday.value && !deliverySlotsClosed.value) {
    return { tone: 'quiet', text: t('rental.shiftedToNearest') }
  }
  if (deliverySlotsClosed.value) {
    const today = bookingForm.value.startDate === todayStr
    return {
      tone: datesTouchedByUser.value ? 'alert' : 'quiet',
      text: today ? t('rental.noSlotsToday') : t('rental.noSlotsDate'),
    }
  }
  if (availabilityStatus.value === 'unavailable' && availabilityMessage.value && bookingForm.value.deliverySlot) {
    return { tone: 'alert', text: availabilityMessage.value }
  }
  return null
})
const pickupNote = computed(() => {
  if (availabilityStatus.value === 'checking' || !pickupSlotsClosed.value) return null
  return {
    tone: datesTouchedByUser.value ? 'alert' : 'quiet',
    text: bookingForm.value.endDate === todayStr ? t('rental.noSlotsToday') : t('rental.noSlotsDate'),
  }
})

const getDailyPrice = (toy: any) => {
  if (!toy) return 1500
  const rate = Number(toy.rental_price_per_day)
  if (rate && rate > 0) return rate
  return 1500
}

const getToyImage = (toy: any) => {
  if (toy?.image_url && !toy.image_url.includes('placeholder') && !toy.image_url.includes('via.placeholder')) {
    return toy.image_url
  }
  return defaultImage
}

const openNativeDatePicker = (event: MouseEvent) => {
  const wrap = event.currentTarget as HTMLElement | null
  const input = wrap?.querySelector('input[type="date"]')
  if (!(input instanceof HTMLInputElement)) return
  input.focus({ preventScroll: true })
  try {
    input.showPicker()
  } catch {
    // Native click on the input still opens the picker in most browsers.
  }
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
  datesTouchedByUser.value = true
  if (bookingForm.value.startDate && bookingForm.value.endDate) {
    if (bookingForm.value.endDate < bookingForm.value.startDate) {
      bookingForm.value.endDate = bookingForm.value.startDate
    }
  }
  bookingForm.value.deliverySlot = ''
  bookingForm.value.pickupSlot = ''
  onScheduleChanged()
}

const onReturnDateChange = () => {
  datesTouchedByUser.value = true
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

const refreshScheduleAndAvailability = async (shiftLeft = 7) => {
  if (!selectedToy.value?.id || !bookingForm.value.startDate || !bookingForm.value.endDate) {
    availabilityStatus.value = 'idle'
    return
  }

  if (!rentalCityId.value) {
    availabilityStatus.value = 'unavailable'
    availabilityTitle.value = 'Выберите город перед оформлением аренды.'
    availabilityMessage.value = ''
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

    if (!datesTouchedByUser.value && shiftLeft > 0 && slotsClosedByCalendar(deliverySlots.value)) {
      shiftedFromToday.value = true
      bookingForm.value.startDate = addIsoDays(bookingForm.value.startDate, 1)
      bookingForm.value.endDate = addIsoDays(bookingForm.value.endDate, 1)
      bookingForm.value.deliverySlot = ''
      bookingForm.value.pickupSlot = ''
      return refreshScheduleAndAvailability(shiftLeft - 1)
    }

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
    if (!bookingForm.value.deliverySlot) {
      bookingForm.value.pickupSlot = ''
    } else if (!bookingForm.value.pickupSlot || !pickupStillOk) {
      const first = pickupSlots.value.find((s: any) => s.available !== false)
      bookingForm.value.pickupSlot = first?.key || ''
    }

    const closedSlots = closedRentalSlots(deliverySlots.value, pickupSlots.value)

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
      if (closedSlots) {
        availabilityStatus.value = 'unavailable'
        availabilityTitle.value = t(closedSlots.title)
        availabilityMessage.value = t(closedSlots.body)
      } else if (data?.unavailable_reason) {
        availabilityStatus.value = 'unavailable'
        availabilityTitle.value = t('rental.unavailableTitle')
        availabilityMessage.value = data.unavailable_reason
      } else {
        availabilityStatus.value = 'idle'
        availabilityTitle.value = ''
        availabilityMessage.value = ''
      }
      return
    }

    const res = await checkAvailability({
      toy_id: selectedToy.value.id,
      city_id: rentalCityId.value,
      start_date: bookingForm.value.startDate,
      end_date: bookingForm.value.endDate,
      delivery_slot: bookingForm.value.deliverySlot,
      pickup_slot: bookingForm.value.pickupSlot,
    })

    if (res?.available === false || res?.status === 'unavailable') {
      availabilityStatus.value = 'unavailable'
      availabilityTitle.value = t('rental.unavailableTitle')
      availabilityMessage.value = res?.message || data?.unavailable_reason || ''
    } else {
      availabilityStatus.value = 'available'
      availabilityTitle.value = ''
      availabilityMessage.value = ''
      const payload = res?.data
      if (payload) {
        serverDaysCount.value = payload.days_count ?? serverDaysCount.value
        serverDailyRate.value = payload.daily_rate ?? serverDailyRate.value
        serverTotalPrice.value = payload.total_price ?? serverTotalPrice.value
        serverDeposit.value = payload.deposit_amount ?? serverDeposit.value
      }
    }
  } catch (e: any) {
    availabilityStatus.value = 'unavailable'
    availabilityTitle.value = t('rental.unavailableTitle')
    availabilityMessage.value = e?.data?.message || e?.message || t('rental.availabilityFailed')
  }
}

const openRentModal = (toy: any) => {
  selectedToy.value = toy
  modalStep.value = 1
  submitError.value = ''
  availabilityStatus.value = 'idle'
  availabilityTitle.value = ''
  availabilityMessage.value = ''
  deliverySlots.value = []
  pickupSlots.value = []

  bookingForm.value.startDate = todayStr
  bookingForm.value.endDate = defaultEndDate()
  bookingForm.value.deliverySlot = ''
  bookingForm.value.pickupSlot = ''
  datesTouchedByUser.value = false
  shiftedFromToday.value = false
  addressEditing.value = false

  if (user.value) {
    bookingForm.value.name = user.value.name || ''
    bookingForm.value.phone = formatKazakhstanPhone(user.value.phone || '')
    bookingForm.value.address = collapseRepeatedLocality(user.value.address || '')
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
    bookingForm.value.address = collapseRepeatedLocality(newUser.address || bookingForm.value.address)
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
    if (!rentalCityId.value) {
      submitError.value = 'Выберите город перед оформлением аренды.'
      return
    }
    const clientName = user.value?.name || bookingForm.value.name
    const notes = isFromSubscription.value
      ? t('rental.notesWithSubscription', { name: clientName })
      : t('rental.notesClient', { name: clientName })

    const res = await createRental({
      toy_id: selectedToy.value.id,
      city_id: rentalCityId.value,
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
.empty-state {
  text-align: center;
  padding: 70px 20px;
  background: #FAF8F4;
  border-radius: 28px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  margin-bottom: 64px;
}

.product-card--skeleton {
  pointer-events: none;
}

.product-card--skeleton:hover {
  transform: none;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.02);
}

.rent-skeleton-media,
.rent-skeleton-line {
  display: block;
  background: linear-gradient(90deg, #e4dfd6 0%, #f6f3ed 45%, #e4dfd6 90%);
  background-size: 200% 100%;
  animation: rent-skeleton-shimmer 1.2s ease-in-out infinite;
}

.rent-skeleton-media {
  width: 100%;
  height: 220px;
  border-radius: 18px;
  margin-bottom: 16px;
}

.rent-skeleton-line {
  border-radius: 8px;
}

.rent-skeleton-line--title {
  width: 72%;
  height: 18px;
  margin-bottom: 12px;
}

.rent-skeleton-line--desc {
  width: 100%;
  height: 12px;
  margin-bottom: 8px;
}

.rent-skeleton-line--desc-short {
  width: 64%;
  height: 12px;
  margin-bottom: 18px;
}

.rent-skeleton-line--price {
  width: 108px;
  height: 20px;
}

.rent-skeleton-line--btn {
  width: 96px;
  height: 38px;
  border-radius: 12px;
  flex: none;
}

@keyframes rent-skeleton-shimmer {
  from { background-position: 100% 0; }
  to { background-position: -100% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .rent-skeleton-media,
  .rent-skeleton-line {
    animation: none;
  }
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

.step-icon-img {
  width: 24px;
  height: 24px;
  object-fit: contain;
  display: block;
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
  align-items: flex-start;
  justify-content: center;
  z-index: 9999;
  padding: max(20px, 3vh) 16px;
  overflow-y: auto;
}

.rent-modal {
  position: relative;
  background: #FAF8F4;
  width: 100%;
  max-width: 640px;
  border-radius: 24px;
  padding: 22px 28px 26px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  max-height: none;
  overflow: visible;
  display: flex;
  flex-direction: column;
  margin: auto 0;
}

.rent-step {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.rent-step-body {
  overflow: visible;
  flex: 0 0 auto;
}

.rent-kicker {
  margin: 0 0 4px;
  font-size: 13px;
  font-weight: 600;
  color: #6F746F;
}

.rent-modal-brand {
  margin-bottom: 8px;
}

.rent-title-serif {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-weight: 700;
  font-size: 22px;
}

.rent-toy-card {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  padding: 12px 14px;
  border: 1px solid #E8E2D8;
  border-radius: 14px;
  background: #fff;
}

.rent-toy-card img {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  object-fit: cover;
  background: #F4F1EA;
  flex-shrink: 0;
}

.rent-toy-card span {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.35;
  color: #262626;
}

.address-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  background: #F4F1EA;
  border-radius: 14px;
}

.address-row-icon {
  flex-shrink: 0;
  color: #6F746F;
  margin-top: 1px;
}

.address-row-main {
  flex: 1;
  min-width: 0;
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  color: #262626;
}

.address-row .linkish {
  flex-shrink: 0;
  margin-top: 1px;
}

.linkish {
  background: none;
  border: none;
  padding: 0;
  color: var(--green-ink);
  font-weight: 700;
  cursor: pointer;
}

.schedule-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 28px;
  margin-top: 0;
  padding-top: 14px;
  border-top: 1px solid #E8E2D8;
  align-items: stretch;
  position: relative;
}

.schedule-panels::after {
  content: '';
  position: absolute;
  top: 14px;
  bottom: 0;
  left: 50%;
  width: 1px;
  transform: translateX(-50%);
  background: #E8E2D8;
  pointer-events: none;
}

.schedule-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.schedule-panel + .schedule-panel {
  padding-left: 0;
  border-left: none;
}

.schedule-panel h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  color: #262626;
}

.schedule-panel-label {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #6F746F;
}

.date-field-wrap {
  position: relative;
  display: block;
}

.date-field-wrap .date-field-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #6F746F;
  pointer-events: none;
  z-index: 1;
}

.date-field-input {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  min-height: 40px;
  padding: 8px 10px 8px 36px;
  border: 1.5px solid #D9D0C4;
  border-radius: 12px;
  background: #fff;
  font-family: 'Manrope', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #262626;
  outline: none;
  color-scheme: light;
  cursor: pointer;
}

.date-field-input:focus {
  border-color: #8DA382;
}

.date-field-input::-webkit-calendar-picker-indicator {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  cursor: pointer;
  opacity: 0;
}

.schedule-note {
  margin: 0;
  font-size: 11px;
  line-height: 1.35;
}

.schedule-note.quiet {
  color: #6F746F;
}

.schedule-note.alert {
  color: #9B1C1C;
  font-weight: 700;
}

.rent-footer {
  flex-shrink: 0;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid #E8E2D8;
}

.rent-checkout {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rent-footer-summary {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 20px;
}

.footer-rent-line {
  margin: 0;
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 600;
  color: #6F746F;
  line-height: 1.4;
}

.footer-rent-total {
  margin: 0;
  flex-shrink: 0;
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 22px;
  font-weight: 700;
  color: #262626;
  white-space: nowrap;
  letter-spacing: -0.02em;
}

.footer-deposit-note {
  margin: -6px 0 0;
  font-size: 12px;
  line-height: 1.35;
  color: #6F746F;
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
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
  padding: 2px 8px;
  border-radius: 8px;
  margin: 0;
  flex-shrink: 0;
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
  margin-bottom: 4px;
  padding-right: 28px;
}

.rent-step .modal-header-box {
  margin-bottom: 0;
  padding-right: 36px;
}

.modal-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  font-family: 'Manrope', sans-serif;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
  margin: 0;
}

.modal-desc {
  margin: 0;
  font-size: 13px;
  color: #6F746F;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.modal-desc strong {
  color: #262626;
  font-weight: 700;
}

.guest-login-notice {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background: transparent;
  padding: 0;
  border-radius: 0;
  font-size: 12.5px;
  line-height: 1.3;
  color: #5D625F;
  margin-bottom: 8px;
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
  margin-bottom: 0;
}

.field-pair {
  display: grid;
  grid-template-columns: 1fr 1.15fr;
  gap: 8px;
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
  gap: 4px;
}

.input-grp label,
.slot-block-label {
  font-size: 12px;
  font-weight: 700;
  color: #5D625F;
}

.m-input {
  box-sizing: border-box;
  width: 100%;
  height: 36px;
  min-height: 36px;
  padding: 0 10px;
  border: 1.5px solid #E3D7C6;
  border-radius: 12px;
  background: #fff;
  font-size: 14px;
  outline: none;
  font-family: 'Manrope', sans-serif;
  transition: border-color 0.2s ease;
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
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}

.avail-banner.checking {
  background: #FFF8E7;
  color: #B7791F;
}

.avail-banner.unavailable {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 8px 10px 8px 12px;
  background: #FDE8E4;
  color: #7F1D1D;
  border: 1.5px solid #E8A098;
  border-left: 5px solid #C2412D;
  font-size: 13px;
  line-height: 1.3;
}

.avail-banner.unavailable strong {
  font-size: 14px;
  font-weight: 800;
  color: #9B1C1C;
}

.total-price-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0;
  padding: 8px 2px 0;
  background: transparent;
  border: none;
  border-top: 1px solid #E7E0D6;
  border-radius: 0;
  color: #262626;
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
  font-size: 18px;
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
  margin: 0;
}
.slot-block-label {
  display: block;
  margin-bottom: 6px;
}
.slot-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.slot-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: 1.5px solid #D9D0C4;
  background: #fff;
  border-radius: 10px;
  padding: 8px 4px;
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
  text-align: center;
  cursor: pointer;
  color: #262626;
}
.slot-check {
  flex-shrink: 0;
}
.slot-chip.active {
  border-color: #8DA382;
  background: #8DA382;
  color: #fff;
}
.slot-chip.active .slot-check {
  color: #fff;
}
.slot-chip.disabled,
.slot-chip:disabled {
  opacity: 1;
  cursor: not-allowed;
  background: #F4F1EA;
  color: #B3ADA4;
  border-color: transparent;
}
.slot-hint {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.3;
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
  margin: 12px 0 0;
  font-weight: 600;
}

.submit-rent-btn {
  width: 100%;
  background: var(--green-surface);
  color: var(--green-ink);
  border: none;
  padding: 10px 14px;
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
  opacity: 1;
  background: #E6DFD4;
  color: #8A847C;
  cursor: not-allowed;
}

.rent-step .submit-rent-btn.rent-cta {
  width: 100%;
  border: none;
  padding: 15px 18px;
  min-height: 52px;
  font-size: 16px;
  font-weight: 700;
  border-radius: 14px;
  margin: 0;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}

.rent-step .submit-rent-btn.rent-cta:not(:disabled) {
  background: #8DA382;
  color: #fff;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.14) inset;
  cursor: pointer;
}

.rent-step .submit-rent-btn.rent-cta:not(:disabled):hover {
  background: #7A9680;
  color: #fff;
}

.rent-step .submit-rent-btn.rent-cta:disabled {
  background: #FAF8F4;
  color: #B3ADA4;
  border: 1.5px solid #E4DCD0;
  box-shadow: none;
  cursor: not-allowed;
}

.rent-step .submit-rent-btn.rent-cta.rent-cta--busy:disabled {
  background: #EEF2EB;
  color: #6F746F;
  border-color: #D7E3D4;
}

@media (max-width: 960px) {
  .steps-row { grid-template-columns: 1fr; gap: 24px; }
}

@media (max-width: 720px) {
  .modal-overlay {
    padding: 0;
    align-items: stretch;
    overflow: hidden;
  }

  .rent-modal {
    max-width: none;
    width: 100%;
    min-height: 100%;
    max-height: none;
    border-radius: 0;
    padding: 16px 16px 0;
    margin: 0;
    overflow: visible;
  }

  .rent-step {
    flex: 1;
    min-height: 0;
  }

  .rent-step-body {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .schedule-panels {
    grid-template-columns: 1fr;
    gap: 24px;
    padding-top: 16px;
  }

  .schedule-panels::after {
    display: none;
  }

  .schedule-panel + .schedule-panel {
    padding-top: 24px;
    border-top: 1px solid #E8E2D8;
  }

  .address-row {
    flex-wrap: wrap;
  }

  .address-row .linkish {
    margin-left: auto;
  }

  .rent-footer {
    position: sticky;
    bottom: 0;
    margin-top: 12px;
    padding: 16px 0 max(20px, env(safe-area-inset-bottom, 0px));
    background: linear-gradient(to bottom, rgba(250, 248, 244, 0.92) 0%, #FAF8F4 28%);
    box-shadow: 0 -12px 28px rgba(250, 248, 244, 0.98);
  }
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
