<template>
  <div class="gift-page">
    <TheHeader />

    <main class="container page-content">
      <!-- Hero -->
      <section class="gift-hero">
        <span class="gift-hero-badge"><AppIcon name="gift" :size="16" class="inline-icon" /> ПОДАРКИ ALPHA</span>
        <h1 class="gift-title">Подарки, которые развивают и радуют</h1>
        <p class="gift-subtitle">
          Подарите ребенку и родителям сертификат на клубную подписку, праздничный готовый эко-бокс или развивающую игрушку в нарядной подарочной упаковке.
        </p>

        <!-- Gift Categories Quick Tabs -->
        <div class="gift-tabs-wrapper">
          <div class="gift-tabs">
            <button 
              class="gift-tab-btn" 
              :class="{ active: activeTab === 'certificate' }"
              @click="activeTab = 'certificate'"
            >
              <AppIcon name="ticket" :size="16" class="tab-icon" /> Подарочный сертификат на подписку
            </button>
            <button 
              class="gift-tab-btn" 
              :class="{ active: activeTab === 'boxes' }"
              @click="activeTab = 'boxes'"
            >
              <AppIcon name="gift" :size="16" class="tab-icon" /> Праздничные подарочные боксы
            </button>
            <button 
              class="gift-tab-btn" 
              :class="{ active: activeTab === 'toys' }"
              @click="activeTab = 'toys'"
            >
              <AppIcon name="toy" :size="16" class="tab-icon" /> Подарочные развивающие игрушки
            </button>
            <button 
              class="gift-tab-btn" 
              :class="{ active: activeTab === 'wizard' }"
              @click="activeTab = 'wizard'"
            >
              <AppIcon name="pin" :size="16" class="tab-icon" /> Подобрать подарок
            </button>
          </div>
        </div>
      </section>

      <!-- TAB: Gift Wizard -->
      <div v-if="activeTab === 'wizard'" class="gift-tab-content">
        <section class="gift-wizard-card">
          <h2 class="config-heading">Подберём идеальный подарок за 4 шага</h2>
          <p class="wizard-intro">Ответьте на несколько вопросов — мы покажем подходящие игрушки и наборы.</p>

          <div class="wizard-steps-grid">
            <div class="wizard-field">
              <label>1. Возраст ребёнка</label>
              <select v-model="wizard.age">
                <option value="">Любой</option>
                <option value="0-12">0–12 месяцев</option>
                <option value="12-24">1–2 года</option>
                <option value="24-48">2–4 года</option>
                <option value="48-72">4–6 лет</option>
              </select>
            </div>
            <div class="wizard-field">
              <label>2. Повод</label>
              <select v-model="wizard.occasion">
                <option value="">Любой</option>
                <option value="birthday">День рождения</option>
                <option value="newborn">Рождение малыша</option>
                <option value="holiday">Праздник</option>
                <option value="just-because">Просто так</option>
              </select>
            </div>
            <div class="wizard-field">
              <label>3. Бюджет</label>
              <select v-model="wizard.budget">
                <option value="">Любой</option>
                <option value="5000">до 5 000 ₸</option>
                <option value="15000">до 15 000 ₸</option>
                <option value="30000">до 30 000 ₸</option>
                <option value="50000">30 000 ₸ и выше</option>
              </select>
            </div>
            <div class="wizard-field">
              <label>4. Интересы</label>
              <div class="interest-chips">
                <button
                  v-for="interest in interestOptions"
                  :key="interest"
                  type="button"
                  class="interest-chip"
                  :class="{ active: wizard.interests.includes(interest) }"
                  @click="toggleInterest(interest)"
                >
                  {{ interest }}
                </button>
              </div>
            </div>
          </div>

          <button type="button" class="wizard-submit-btn" @click="applyGiftWizard">
            Показать подходящие подарки →
          </button>
        </section>
      </div>

      <!-- TAB 1: GIFT SUBSCRIPTION CERTIFICATE -->
      <div v-if="activeTab === 'certificate'" class="gift-tab-content">
        <!-- How Gifting Works (3 Steps) -->
        <section class="gifting-steps-row">
          <div class="g-step-card">
            <div class="g-step-num">1</div>
            <h3>Выберите длительность</h3>
            <p>От 1 месяца до целого года регулярных игровых открытий.</p>
          </div>
          <div class="g-step-card">
            <div class="g-step-num">2</div>
            <h3>Напишите пожелание</h3>
            <p>Мы напечатаем его на стильной открытке или отправим электронно.</p>
          </div>
          <div class="g-step-card">
            <div class="g-step-num">3</div>
            <h3>Родители активируют</h3>
            <p>В любой удобный момент методист подберет набор по возрасту малыша.</p>
          </div>
        </section>

        <!-- 2-Column Gift Configurator & Live Certificate Card Preview -->
        <section class="gift-configurator-grid">
          <!-- LEFT: Options Configurator Form -->
          <div class="config-col">
            <h2 class="config-heading">Настройте подарочный сертификат</h2>

            <!-- Step 1: Duration Selector -->
            <div class="config-block">
              <label class="block-label">1. Длительность подарочной подписки</label>
              <div class="duration-grid">
                <div 
                  v-for="d in durations" 
                  :key="d.id"
                  class="duration-card"
                  :class="{ active: selectedDuration === d.id }"
                  @click="selectedDuration = d.id"
                >
                  <div class="dur-months">{{ d.months }}</div>
                  <div class="dur-title">{{ d.title }}</div>
                  <span v-if="d.badge" class="dur-badge">{{ d.badge }}</span>
                </div>
              </div>
            </div>

            <!-- Step 2: Plan Tier -->
            <div class="config-block">
              <label class="block-label">2. Тариф подписки</label>

              <div v-if="isLoadingPlans" class="tier-empty-note">Загружаем тарифы...</div>

              <div v-else class="tier-cards-row">
                <div
                  v-for="plan in subscriptionPlans"
                  :key="plan.slug"
                  class="tier-select-card"
                  :class="{ active: selectedTier === plan.slug }"
                  @click="selectedTier = plan.slug"
                >
                  <div class="tier-radio">
                    <span v-if="selectedTier === plan.slug" class="dot"></span>
                  </div>
                  <div class="tier-info">
                    <strong>{{ plan.name }}{{ plan.badge ? ` ★ ${plan.badge}` : '' }}</strong>
                    <p>{{ plan.toys_count }} {{ plan.toys_count === 1 ? 'игрушка' : 'игрушки' }} • {{ formatPrice(plan.price_monthly) }} ₸/мес</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 3: Greeting and Recipient -->
            <div class="config-block">
              <label class="block-label">3. Данные получателя и открытка</label>
              <div class="gift-inputs-form">
                <div class="g-input-row">
                  <div class="g-field">
                    <label>Имя получателя (ребенка или мамы) <span class="req">*</span></label>
                    <input v-model="giftForm.recipientName" type="text" placeholder="Маленькому Мише" required />
                  </div>
                  <div class="g-field">
                    <label>От кого</label>
                    <input v-model="giftForm.senderName" type="text" placeholder="От любящих крестных" />
                  </div>
                </div>

                <div class="g-input-row">
                  <div class="g-field">
                    <label>Email получателя (для отправки кода)</label>
                    <input v-model="giftForm.recipientEmail" type="email" placeholder="misha_parents@example.com" />
                  </div>
                  <div class="g-field">
                    <label>Телефон получателя</label>
                    <input v-model="giftForm.recipientPhone" type="tel" placeholder="+7 701 000 00 00" />
                  </div>
                </div>

                <div class="g-field">
                  <label>Текст поздравления на открытке</label>
                  <textarea 
                    v-model="giftForm.message" 
                    rows="3" 
                    placeholder="Расти здоровым, любознательным и счастливым! Пусть каждый день приносит новые открытия!"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT: Live Certificate Card Preview -->
          <div class="preview-col">
            <div class="cert-preview-card">
              <div class="cert-header">
                <div class="cert-logo">
                  <AppLogo size="sm" />
                </div>
                <span class="cert-type-pill">GIFT CERTIFICATE</span>
              </div>

              <div class="cert-body">
                <span class="cert-to-label">Подарочный сертификат для:</span>
                <h3 class="cert-recipient">{{ giftForm.recipientName || 'Любимого ребенка' }}</h3>

                <div class="cert-details-badge">
                  <span>{{ currentDurationObj.months }} подписки • {{ selectedPlanLabel }}</span>
                </div>

                <p class="cert-message-quote">
                  «{{ giftForm.message || 'Расти здоровым, любознательным и счастливым!' }}»
                </p>

                <div class="cert-footer">
                  <div class="cert-from">
                    <span>С любовью,</span>
                    <strong>{{ giftForm.senderName || 'Ваши близкие' }}</strong>
                  </div>
                  <div class="cert-seal">
                    <span>★ ALPHA ★</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Buy Action Box -->
            <div class="cert-buy-action-card">
              <div class="action-price-row">
                <span>Итого к оплате:</span>
                <strong class="total-cert-price">
                  <template v-if="isLoadingQuote">Расчёт...</template>
                  <template v-else>{{ formatPrice(calculatedPrice) }} ₸</template>
                </strong>
              </div>
              <p v-if="quoteError" class="quote-error-text">{{ quoteError }}</p>

              <button
                class="submit-gift-btn"
                :disabled="isLoadingQuote || !calculatedPrice"
                @click="openPaymentModal"
              >
                Оформить и подарить за {{ formatPrice(calculatedPrice) }} ₸
              </button>
              <div class="digital-info-pill">
                <span><AppIcon name="bolt" :size="14" class="inline-icon" /> Цифровой сертификат (доставка курьером не требуется)</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- TAB 2: READY GIFT BOXES -->
      <div v-else-if="activeTab === 'boxes'" class="gift-tab-content">
        <section class="ready-boxes-section">
          <div class="boxes-header">
            <span class="sub-badge">ГОТОВЫЕ НАБОРЫ</span>
            <h2 class="section-title">Праздничные подарочные боксы</h2>
            <p class="section-subtitle">Фирменная деревянная эко-упаковка с атласной лентой, наполнителем и поздравительной открыткой.</p>
          </div>

          <div v-if="isLoadingBoxes" class="loading-state">
            <div class="spinner"></div>
            <p>Загружаем подарочные боксы...</p>
          </div>

          <div v-else-if="giftBoxesList.length === 0" class="tier-empty-note">
            Подарочные боксы скоро появятся в каталоге. Попробуйте обновить страницу позже.
          </div>

          <div v-else class="boxes-grid">
            <div v-for="box in giftBoxesList" :key="box.id" class="box-card">
              <div class="box-img-wrap">
                <img :src="box.image_url" :alt="box.name" class="box-img" />
                <span class="box-age-tag">{{ box.min_age_months }}–{{ box.max_age_months }} мес</span>
                <span class="box-gift-ribbon"><AppIcon name="gift" :size="14" class="inline-icon" /> Подарочный бокс</span>
              </div>
              <div class="box-content">
                <h3 class="box-title">{{ box.name }}</h3>
                <p class="box-desc">{{ box.description }}</p>
                <div class="box-features-mini">
                  <span><AppIcon name="tree" :size="14" class="inline-icon" /> Эко-дерево</span>
                  <span><AppIcon name="gift" :size="14" class="inline-icon" /> Подарочная лента</span>
                  <span><AppIcon name="mail" :size="14" class="inline-icon" /> Открытка внутри</span>
                </div>
                <div class="box-bottom-row">
                  <span class="box-price">{{ formatPrice(Number(box.price)) }} ₸</span>
                  <button class="box-add-btn" @click="addBox(box)">Подарить бокс</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- TAB 3: INDIVIDUAL GIFT TOYS FROM CATALOG -->
      <div v-else-if="activeTab === 'toys'" class="gift-tab-content">
        <section class="gift-toys-section">
          <div class="boxes-header">
            <span class="sub-badge">РАЗВИВАЮЩИЕ ИГРУШКИ</span>
            <h2 class="section-title">Эко-игрушки в подарок</h2>
            <p class="section-subtitle">Выберите любую любимую игрушку. Мы бережно упакуем её в фирменную коробку с бантом и приложим открытку с вашими теплыми словами.</p>
          </div>

          <div v-if="isLoadingToys" class="loading-state">
            <div class="spinner"></div>
            <p>Загрузка каталога подарков...</p>
          </div>

          <div v-else-if="giftToysList.length === 0" class="tier-empty-note">
            Каталог пока пуст. Перейдите в магазин и выберите любую игрушку для подарка.
          </div>

          <div v-else class="boxes-grid">
            <div v-for="toy in giftToysList" :key="toy.id" class="box-card toy-gift-card">
              <div class="box-img-wrap">
                <img :src="toy.image_url || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=500&q=80'" :alt="toy.name" class="box-img" />
                <span class="box-age-tag">{{ toy.min_age_months }}–{{ toy.max_age_months }} мес</span>
                <span class="box-gift-ribbon"><AppIcon name="gift" :size="14" class="inline-icon" /> В подарок</span>
              </div>
              <div class="box-content">
                <h3 class="box-title">{{ toy.name }}</h3>
                <p class="box-desc">{{ toy.description || 'Экологичная развивающая игрушка из натурального дерева в подарочной упаковке.' }}</p>
                <div class="box-bottom-row">
                  <span class="box-price">{{ formatPrice(Number(toy.price) || 12900) }} ₸</span>
                  <button class="box-add-btn" @click="addToyAsGift(toy)">В подарок</button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="!isLoadingToys" class="catalog-gift-cta">
            <p>Не нашли нужное? В каталоге — все игрушки магазина: выберите любую, мы упакуем как подарок.</p>
            <NuxtLink to="/shop?gift=1" class="catalog-gift-btn">
              Смотреть весь каталог →
            </NuxtLink>
          </div>
        </section>
      </div>
    </main>

    <!-- MODAL 1: Payment & Creation for Digital Gift Certificate -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isPaymentModalOpen" class="modal-overlay" @click.self="isPaymentModalOpen = false">
          <div class="gift-modal-card">
            <button class="close-btn" @click="isPaymentModalOpen = false">&times;</button>
            
            <div class="modal-badge-icon"><AppIcon name="gift" :size="32" /></div>
            <h2 class="g-modal-title">Оплата подарочного сертификата</h2>
            <p class="g-modal-desc">
              Для: <strong>{{ giftForm.recipientName }}</strong> • Номинал: <strong>{{ formatPrice(calculatedPrice) }} ₸</strong>
            </p>

            <div class="payment-tabs-box">
              <div class="pay-option" :class="{ active: payMethod === 'kaspi' }" @click="payMethod = 'kaspi'">
                <div class="pay-radio">
                  <span v-if="payMethod === 'kaspi'" class="dot"></span>
                </div>
                <span>Kaspi QR / Оплата в приложении</span>
              </div>
              <div class="pay-option" :class="{ active: payMethod === 'card' }" @click="payMethod = 'card'">
                <div class="pay-radio">
                  <span v-if="payMethod === 'card'" class="dot"></span>
                </div>
                <span>Банковской картой онлайн (Visa / Mastercard)</span>
              </div>
            </div>

            <!-- Kaspi QR visual mock -->
            <div v-if="payMethod === 'kaspi'" class="kaspi-qr-box">
              <div class="qr-mock-img">
                <span class="qr-label">Kaspi QR</span>
              </div>
              <p class="qr-hint">Отсканируйте QR-код камерой в приложении Kaspi.kz</p>
            </div>

            <div v-if="errorMessage" class="error-banner">
              {{ errorMessage }}
            </div>

            <div class="modal-actions-row">
              <button class="modal-cancel-btn" @click="isPaymentModalOpen = false">Отмена</button>
              <button 
                class="modal-confirm-btn" 
                :disabled="isSubmitting || isLoadingQuote || !calculatedPrice"
                @click="submitCertificatePayment"
              >
                {{ isSubmitting ? 'Выпускаем сертификат...' : `Оплатить ${formatPrice(calculatedPrice)} ₸` }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- MODAL 2: Success Celebration with Generated Code -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isSuccessModalOpen" class="modal-overlay" @click.self="isSuccessModalOpen = false">
          <div class="gift-modal-card success-card">
            <div class="success-icon-badge"><AppIcon name="party" :size="32" /></div>
            <h2 class="g-modal-title">Сертификат успешно выпущен!</h2>
            <p class="g-modal-desc">
              Подарочная подписка на <strong>{{ createdGiftDetails?.duration_months || currentDurationMonths }} мес.</strong>
              ({{ selectedPlanLabel }}) для <strong>{{ giftForm.recipientName }}</strong>.
              <span v-if="createdGiftDetails?.amount_paid">Сумма: <strong>{{ formatPrice(createdGiftDetails.amount_paid) }} ₸</strong></span>
            </p>

            <div class="cert-code-box">
              <span class="code-label">УНИКАЛЬНЫЙ КОД СЕРТИФИКАТА:</span>
              <strong class="cert-code-val">{{ createdCertCode }}</strong>
              <div class="code-buttons-row">
                <button class="copy-code-btn" @click="copyCertCode">
                  <AppIcon v-if="!isCopied" name="copy" :size="14" class="inline-icon" />
                  {{ isCopied ? '✓ Код скопирован' : 'Скопировать код' }}
                </button>
                <button class="copy-code-btn magic-link-btn" @click="copyMagicLink">
                  <AppIcon v-if="!isLinkCopied" name="link" :size="14" class="inline-icon" />
                  {{ isLinkCopied ? '✓ Ссылка скопирована' : 'Скопировать Magic-ссылку' }}
                </button>
              </div>
            </div>

            <!-- 1-Click WhatsApp Share Banner -->
            <div class="whatsapp-share-box">
              <button class="whatsapp-share-btn" @click="shareViaWhatsApp">
                <span><AppIcon name="message" :size="16" class="inline-icon" /> Отправить открытку в WhatsApp получателю</span>
              </button>
              <NuxtLink :to="`/subscription?gift_code=${createdCertCode}`" target="_blank" class="preview-unboxing-link">
                Посмотреть ссылку активации глазами получателя →
              </NuxtLink>
            </div>

            <div class="success-info-notice">
              <p>Получатель перейдёт по Magic-ссылке, войдёт в аккаунт и активирует подарочную подписку для ребёнка.</p>
            </div>

            <div class="modal-actions-row">
              <button class="modal-confirm-btn w-100" @click="isSuccessModalOpen = false">
                Отлично, закрыть
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
import { ref, reactive, computed, onMounted, watch } from 'vue'
import TheHeader from '~/components/TheHeader.vue'
import TheFooter from '~/components/TheFooter.vue'
import type { GiftSubscriptionItem, GiftSubscriptionQuote } from '~/composables/useGifts'

const { addItem } = useCart()
const { purchaseGiftSubscription, fetchGiftSubscriptionQuote } = useGifts()
const { request } = useApi()
const { user, openAuthModal } = useAuth()
const { error: toastError } = useToast()
const { plans: subscriptionPlans, fetchPlans, isLoading: isLoadingPlans } = useSubscriptionPlans()
const config = useRuntimeConfig()

const activeTab = ref<'certificate' | 'boxes' | 'toys' | 'wizard'>('certificate')

const wizard = reactive({
  age: '',
  occasion: '',
  budget: '',
  interests: [] as string[],
})

const interestOptions = ['Моторика', 'Логика', 'Музыка', 'Конструирование', 'Сенсорика', 'Ролевые игры']

const toggleInterest = (interest: string) => {
  const idx = wizard.interests.indexOf(interest)
  if (idx >= 0) wizard.interests.splice(idx, 1)
  else wizard.interests.push(interest)
}

const applyGiftWizard = () => {
  const query: Record<string, string> = { gift: '1' }
  if (wizard.age) query.age = wizard.age
  if (wizard.occasion) query.occasion = wizard.occasion
  if (wizard.budget) query.budget = wizard.budget
  if (wizard.interests.length) query.interests = wizard.interests.join(',')
  navigateTo({ path: '/shop', query })
}

const selectedDuration = ref('3m')
const selectedTier = ref('')

const durationMonthsMap: Record<string, number> = {
  '1m': 1,
  '3m': 3,
  '6m': 6,
  '12m': 12,
}

const currentDurationMonths = computed(() => durationMonthsMap[selectedDuration.value] ?? 3)

onMounted(async () => {
  await fetchPlans()
  if (subscriptionPlans.value.length > 0) {
    selectedTier.value = subscriptionPlans.value[0].slug
  }
  await loadQuote()
  loadGiftBoxes()
  loadGiftToys()
})

watch([selectedTier, selectedDuration], () => {
  loadQuote()
})

const selectedPlan = computed(() => (
  subscriptionPlans.value.find(plan => plan.slug === selectedTier.value) || subscriptionPlans.value[0]
))

const selectedPlanLabel = computed(() => {
  if (!selectedPlan.value) return 'Тариф не выбран'
  return `${selectedPlan.value.name} (${selectedPlan.value.toys_count} ${selectedPlan.value.toys_count === 1 ? 'игрушка' : 'игрушки'})`
})

const durations = [
  { id: '1m', months: '1 месяц', title: 'Знакомство', badge: null },
  { id: '3m', months: '3 месяца', title: 'Сезон игр', badge: 'ПОПУЛЯРНЫЙ' },
  { id: '6m', months: '6 месяцев', title: 'Полгода открытий', badge: '1 МЕС В ПОДАРОК' },
  { id: '12m', months: '12 месяцев', title: 'Целый год заботы', badge: '2 МЕС В ПОДАРОК' },
]

const currentDurationObj = computed(() => {
  return durations.find(d => d.id === selectedDuration.value) || durations[1]
})

const giftForm = ref({
  recipientName: '',
  senderName: '',
  recipientEmail: '',
  recipientPhone: '',
  message: '',
})

const quoteData = ref<GiftSubscriptionQuote | null>(null)
const isLoadingQuote = ref(false)
const quoteError = ref('')

const loadQuote = async () => {
  if (!selectedTier.value) {
    quoteData.value = null
    return
  }

  isLoadingQuote.value = true
  quoteError.value = ''
  try {
    const res = await fetchGiftSubscriptionQuote(selectedTier.value, currentDurationMonths.value)
    quoteData.value = res?.data ?? null
  } catch (e: any) {
    quoteData.value = null
    quoteError.value = e?.data?.message || 'Не удалось рассчитать стоимость сертификата'
  } finally {
    isLoadingQuote.value = false
  }
}

const calculatedPrice = computed(() => quoteData.value?.total ?? 0)

const giftBoxesList = ref<any[]>([])
const isLoadingBoxes = ref(false)
const giftToysList = ref<any[]>([])
const isLoadingToys = ref(false)

const parseToyList = (res: any): any[] => {
  const list = res?.data ?? res ?? []
  return Array.isArray(list) ? list : []
}

const loadGiftBoxes = async () => {
  isLoadingBoxes.value = true
  try {
    const res = await request<any>('/toys?catalog=gift&category=gift-boxes')
    giftBoxesList.value = parseToyList(res)
  } catch (e) {
    console.warn('Could not load gift boxes from API', e)
    giftBoxesList.value = []
  } finally {
    isLoadingBoxes.value = false
  }
}

const loadGiftToys = async () => {
  isLoadingToys.value = true
  try {
    const res = await request<any>('/toys?catalog=gift')
    giftToysList.value = parseToyList(res).filter(
      (toy) => toy.category?.slug !== 'gift-boxes'
    )
  } catch (e) {
    console.warn('Could not load gift toys from API', e)
    giftToysList.value = []
  } finally {
    isLoadingToys.value = false
  }
}

// Payment Modal State
const isPaymentModalOpen = ref(false)
const isSuccessModalOpen = ref(false)
const payMethod = ref<'kaspi' | 'card'>('kaspi')
const isSubmitting = ref(false)
const errorMessage = ref('')
const createdCertCode = ref('')
const createdGiftDetails = ref<GiftSubscriptionItem | null>(null)
const isCopied = ref(false)

const openPaymentModal = () => {
  if (!giftForm.value.recipientName.trim()) {
    toastError('Нужно имя получателя', 'Пожалуйста, укажите имя получателя сертификата!')
    return
  }
  if (!user.value) {
    openAuthModal('login')
    return
  }
  if (quoteError.value) {
    toastError('Ошибка расчёта', quoteError.value)
    return
  }
  if (!calculatedPrice.value || isLoadingQuote.value) {
    toastError('Подождите', 'Подождите, пока рассчитывается стоимость сертификата.')
    return
  }
  errorMessage.value = ''
  isPaymentModalOpen.value = true
}

const submitCertificatePayment = async () => {
  if (!user.value) {
    openAuthModal('login')
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const res = await purchaseGiftSubscription({
      plan: selectedTier.value,
      duration_months: currentDurationMonths.value,
      recipient_name: giftForm.value.recipientName.trim(),
      sender_name: giftForm.value.senderName.trim() || undefined,
      recipient_email: giftForm.value.recipientEmail.trim() || undefined,
      recipient_phone: giftForm.value.recipientPhone.trim() || undefined,
      message: giftForm.value.message.trim() || undefined,
    })

    const code = res?.data?.code
    if (!code || res?.status !== 'success') {
      throw new Error(res?.message || 'Не удалось оформить подарочную подписку')
    }

    createdCertCode.value = code
    createdGiftDetails.value = res.data
    isPaymentModalOpen.value = false
    isSuccessModalOpen.value = true
  } catch (e: any) {
    errorMessage.value = e?.data?.message || e?.message || 'Не удалось оформить подарочную подписку. Попробуйте ещё раз.'
  } finally {
    isSubmitting.value = false
  }
}

const isLinkCopied = ref(false)

const copyCertCode = () => {
  if (navigator?.clipboard) {
    navigator.clipboard.writeText(createdCertCode.value)
    isCopied.value = true
    setTimeout(() => { isCopied.value = false }, 2500)
  }
}

const getMagicLink = () => {
  const siteOrigin = typeof window !== 'undefined'
    ? window.location.origin
    : String(config.public.siteUrl || '').replace(/\/$/, '')

  return `${siteOrigin}/subscription?gift_code=${encodeURIComponent(createdCertCode.value)}`
}

const copyMagicLink = () => {
  const link = getMagicLink()
  if (navigator?.clipboard) {
    navigator.clipboard.writeText(link)
    isLinkCopied.value = true
    setTimeout(() => { isLinkCopied.value = false }, 2500)
  }
}

const shareViaWhatsApp = () => {
  const link = getMagicLink()
  const text = `Привет! 🎁 Я отправил(а) вам подарочный сертификат на развивающие игрушки в клубе Alpha для малыша ${giftForm.value.recipientName}!\n\nЧтобы открыть персональную открытку с пожеланием и активировать подарок:\n👉 ${link}`
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank')
}

const addBox = (box: any) => {
  addItem({
    id: box.id,
    title: `${box.name} (подарочный бокс с упаковкой)`,
    price: Number(box.price),
    image: box.image_url,
    isGiftPackaging: true,
  })
  navigateTo('/cart')
}

const addToyAsGift = (toy: any) => {
  addItem({
    id: toy.id,
    title: `${toy.name} (в подарочной упаковке с открыткой)`,
    price: Number(toy.price),
    image: toy.image_url || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=500&q=80',
    isGiftPackaging: true,
  })
  navigateTo('/cart')
}

const formatPrice = (val: number) => {
  if (!val && val !== 0) return '0'
  return Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
</script>

<style scoped>
.gift-page {
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

.gift-hero {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 40px auto;
}

.gift-hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  display: inline-block;
  background: #FFE8E8;
  color: #AF5353;
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 11.5px;
  letter-spacing: 1.5px;
  padding: 5px 14px;
  border-radius: 20px;
  margin-bottom: 12px;
}

.gift-title {
  font-family: 'Manrope', sans-serif;
  font-size: 38px;
  font-weight: 800;
  color: #262626;
  margin-bottom: 12px;
}

.gift-subtitle {
  font-size: 16px;
  color: #6F746F;
  line-height: 1.6;
  margin-bottom: 28px;
}

/* Category Tabs */
.gift-tabs-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.gift-tabs {
  display: inline-flex;
  background: #FAF8F4;
  padding: 6px;
  border-radius: 22px;
  border: 1px solid #E3D7C6;
  gap: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.03);
  flex-wrap: wrap;
  justify-content: center;
}

.gift-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  padding: 10px 22px;
  border-radius: 16px;
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 14px;
  color: #5D625F;
  cursor: pointer;
  transition: all 0.2s ease;
}

.gift-tab-btn.active {
  background: #3F6757;
  color: #FAF8F4;
  box-shadow: 0 4px 12px rgba(51, 61, 54, 0.3);
}

.gift-tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Steps Row */
.gifting-steps-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.g-step-card {
  background: #FAF8F4;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 4px 16px rgba(0,0,0,0.02);
  text-align: center;
}

.g-step-num {
  width: 36px;
  height: 36px;
  background: #D9E0D5;
  color: #3F6757;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 16px;
  margin: 0 auto 12px auto;
}

.g-step-card h3 {
  font-family: 'Manrope', sans-serif;
  font-size: 16px;
  font-weight: 800;
  margin-bottom: 6px;
}

.g-step-card p {
  font-size: 13.5px;
  color: #6F746F;
  margin: 0;
  line-height: 1.45;
}

/* Configurator & Preview Grid */
.gift-configurator-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 32px;
  margin-bottom: 60px;
}

.config-col {
  background: #FAF8F4;
  border-radius: 28px;
  padding: 36px;
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 8px 24px rgba(0,0,0,0.03);
}

.config-heading {
  font-family: 'Manrope', sans-serif;
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 24px;
}

.config-block {
  margin-bottom: 24px;
}

.block-label {
  display: block;
  font-family: 'Manrope', sans-serif;
  font-size: 14px;
  font-weight: 800;
  color: #262626;
  margin-bottom: 12px;
}

.duration-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.duration-card {
  background: #FAF8F4;
  border: 1.5px solid #E3D7C6;
  border-radius: 16px;
  padding: 14px 10px;
  text-align: center;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

.duration-card:hover {
  border-color: #3F6757;
}

.duration-card.active {
  background: #D9E0D5;
  border-color: #3F6757;
}

.dur-months {
  font-family: 'Manrope', sans-serif;
  font-size: 15px;
  font-weight: 800;
  color: #262626;
}

.dur-title {
  font-size: 11px;
  color: #6F746F;
  margin-top: 2px;
}

.dur-badge {
  position: absolute;
  top: -9px;
  left: 50%;
  transform: translateX(-50%);
  background: #9C91C9;
  color: #FAF8F4;
  font-size: 8.5px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 8px;
  white-space: nowrap;
}

.tier-empty-note {
  padding: 16px;
  border: 1px dashed #E3D7C6;
  border-radius: 16px;
  background: #FAF8F4;
  color: #747183;
  font-size: 14px;
}

.tier-cards-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.tier-select-card {
  background: #FAF8F4;
  border: 1.5px solid #E3D7C6;
  border-radius: 16px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.tier-select-card.active {
  background: #D9E0D5;
  border-color: #3F6757;
}

.tier-radio {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid #CBD5E1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tier-select-card.active .tier-radio {
  border-color: #3F6757;
}

.tier-radio .dot {
  width: 10px;
  height: 10px;
  background: #3F6757;
  border-radius: 50%;
}

.tier-info strong {
  display: block;
  font-family: 'Manrope', sans-serif;
  font-size: 13.5px;
}

.tier-info p {
  font-size: 12px;
  color: #6F746F;
  margin: 0;
}

.gift-inputs-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.g-input-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.g-field label {
  display: block;
  font-size: 12.5px;
  font-weight: 700;
  color: #5D625F;
  margin-bottom: 6px;
}

.g-field .req {
  color: #AF5353;
}

.g-field input, .g-field textarea {
  width: 100%;
  background: #FAF8F4;
  border: 1.5px solid #E3D7C6;
  border-radius: 14px;
  padding: 10px 14px;
  font-size: 13.5px;
  outline: none;
  transition: border-color 0.2s;
}

.g-field input:focus, .g-field textarea:focus {
  border-color: #3F6757;
  background: #FAF8F4;
}

/* Certificate Preview Card */
.preview-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cert-preview-card {
  background: linear-gradient(135deg, #FAF8F4 0%, #D9E0D5 100%);
  border: 2px dashed #3F6757;
  border-radius: 28px;
  padding: 32px;
  box-shadow: 0 12px 36px rgba(51, 61, 54, 0.1);
  position: relative;
}

.cert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.cert-logo :deep(.app-logo__mark) {
  height: 24px;
}

.cert-logo :deep(.app-logo__word) {
  font-size: 18px;
}

.cert-type-pill {
  background: #3F6757;
  color: #FAF8F4;
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 10.5px;
  letter-spacing: 1px;
  padding: 4px 12px;
  border-radius: 14px;
}

.cert-to-label {
  font-size: 12px;
  color: #6F746F;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.cert-recipient {
  font-family: 'Manrope', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: #262626;
  margin: 4px 0 14px 0;
}

.cert-details-badge {
  display: inline-block;
  background: #FAF8F4;
  padding: 6px 14px;
  border-radius: 12px;
  font-size: 12.5px;
  font-weight: 700;
  color: #3F6757;
  margin-bottom: 16px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.03);
}

.cert-message-quote {
  font-style: italic;
  font-size: 14px;
  color: #5D625F;
  line-height: 1.5;
  margin-bottom: 24px;
  background: rgba(255,255,255,0.6);
  padding: 12px 16px;
  border-radius: 14px;
  border-left: 3px solid #3F6757;
}

.cert-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.cert-from span {
  display: block;
  font-size: 11px;
  color: #6F746F;
}

.cert-from strong {
  font-family: 'Manrope', sans-serif;
  font-size: 15px;
  color: #262626;
}

.cert-seal {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1.5px solid #FFB703;
  background: #FFF3D6;
  color: #B37D00;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 7.5px;
  font-weight: 900;
  text-align: center;
}

.cert-buy-action-card {
  background: #FAF8F4;
  border-radius: 24px;
  padding: 24px;
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 6px 20px rgba(0,0,0,0.02);
}

.action-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.quote-error-text {
  color: #c0392b;
  font-size: 14px;
  margin: 0 0 12px;
}

.total-cert-price {
  font-family: 'Manrope', sans-serif;
  font-size: 26px;
  font-weight: 800;
  color: #3F6757;
}

.submit-gift-btn {
  width: 100%;
  background: #3F6757;
  color: #FAF8F4;
  border: none;
  padding: 15px;
  border-radius: 16px;
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-gift-btn:hover {
  background: #3F6757;
  box-shadow: 0 6px 20px rgba(51, 61, 54, 0.35);
}

.digital-info-pill {
  margin-top: 12px;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: #059669;
  background: #E8F8F3;
  padding: 6px 12px;
  border-radius: 10px;
}

/* READY BOXES & TOYS GRID */
.ready-boxes-section, .gift-toys-section {
  margin-top: 20px;
}

.catalog-gift-cta {
  margin-top: 32px;
  padding: 24px;
  text-align: center;
  border-radius: 18px;
  background: #FAF8F4;
  border: 1px dashed #C4B5FD;
}

.catalog-gift-cta p {
  margin: 0 0 14px;
  font-size: 14.5px;
  color: #5C5C72;
  line-height: 1.5;
}

.catalog-gift-btn {
  display: inline-block;
  padding: 12px 22px;
  border-radius: 12px;
  background: #3F6757;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  text-decoration: none;
  box-shadow: 0 6px 18px rgba(51, 61, 54, 0.25);
}

.catalog-gift-btn:hover {
  background: #315145;
}

.boxes-header {
  text-align: center;
  margin-bottom: 36px;
}

.sub-badge {
  display: inline-block;
  background: #D9E0D5;
  color: #3F6757;
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 1px;
  padding: 4px 12px;
  border-radius: 14px;
  margin-bottom: 8px;
}

.section-title {
  font-family: 'Manrope', sans-serif;
  font-size: 30px;
  font-weight: 800;
  margin-bottom: 8px;
}

.section-subtitle {
  font-size: 15px;
  color: #6F746F;
}

.boxes-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.box-card {
  background: #FAF8F4;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 6px 20px rgba(0,0,0,0.03);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
}

.box-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(51, 61, 54, 0.1);
}

.box-img-wrap {
  width: 100%;
  height: 190px;
  position: relative;
  background: #ECECF4;
}

.box-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.box-age-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(26, 26, 46, 0.8);
  backdrop-filter: blur(4px);
  color: #FAF8F4;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 8px;
}

.box-gift-ribbon {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: #AF5353;
  color: #FAF8F4;
  font-size: 10px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 8px;
}

.box-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.box-title {
  font-family: 'Manrope', sans-serif;
  font-size: 17px;
  font-weight: 800;
  margin-bottom: 6px;
  color: #262626;
}

.box-desc {
  font-size: 13px;
  color: #6F746F;
  line-height: 1.45;
  margin-bottom: 14px;
}

.box-features-mini {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.box-features-mini span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  background: #FAF8F4;
  border: 1px solid #E3D7C6;
  padding: 2px 8px;
  border-radius: 8px;
  color: #5D625F;
}

.box-bottom-row {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.box-price {
  font-family: 'Manrope', sans-serif;
  font-size: 18px;
  font-weight: 800;
  color: #3F6757;
}

.box-add-btn {
  background: #3F6757;
  color: #FAF8F4;
  border: none;
  padding: 8px 16px;
  border-radius: 12px;
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.box-add-btn:hover {
  background: #3F6757;
}

.loading-state {
  text-align: center;
  padding: 60px;
  color: #6F746F;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #E3D7C6;
  border-top-color: #3F6757;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 12px auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* MODALS */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 26, 46, 0.65);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.gift-modal-card {
  position: relative;
  background: #FAF8F4;
  width: 100%;
  max-width: 480px;
  border-radius: 28px;
  padding: 32px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.2);
}

.close-btn {
  position: absolute;
  top: 18px;
  right: 18px;
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

.modal-badge-icon, .success-icon-badge {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: #D9E0D5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  margin-bottom: 16px;
}

.g-modal-title {
  font-family: 'Manrope', sans-serif;
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 6px;
}

.g-modal-desc {
  font-size: 13.5px;
  color: #6F746F;
  line-height: 1.5;
  margin-bottom: 20px;
}

.payment-tabs-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.pay-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #FAF8F4;
  border: 1.5px solid #E3D7C6;
  border-radius: 14px;
  cursor: pointer;
  font-size: 13.5px;
  font-weight: 700;
  transition: all 0.2s;
}

.pay-option.active {
  background: #D9E0D5;
  border-color: #3F6757;
  color: #3F6757;
}

.pay-radio {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid #CBD5E1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pay-option.active .pay-radio {
  border-color: #3F6757;
}

.pay-radio .dot {
  width: 10px;
  height: 10px;
  background: #3F6757;
  border-radius: 50%;
}

.kaspi-qr-box {
  background: #F8FAFC;
  border: 1px dashed #CBD5E1;
  border-radius: 16px;
  padding: 16px;
  text-align: center;
  margin-bottom: 20px;
}

.qr-mock-img {
  width: 110px;
  height: 110px;
  background: #FAF8F4;
  border: 2px solid #AF5353;
  border-radius: 12px;
  margin: 0 auto 10px auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-label {
  font-family: 'Manrope', sans-serif;
  font-weight: 900;
  color: #AF5353;
  font-size: 14px;
}

.qr-hint {
  font-size: 12px;
  color: #64748B;
  margin: 0;
}

.error-banner {
  background: #FEE2E2;
  color: #DC2626;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  margin-bottom: 16px;
}

.modal-actions-row {
  display: flex;
  gap: 12px;
}

.modal-cancel-btn {
  flex: 1;
  background: #F4F1EA;
  border: none;
  padding: 12px;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
}

.modal-confirm-btn {
  flex: 1.5;
  background: #3F6757;
  color: #FAF8F4;
  border: none;
  padding: 12px;
  border-radius: 14px;
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 14.5px;
  cursor: pointer;
  transition: background 0.2s;
}

.modal-confirm-btn:hover:not(:disabled) {
  background: #3F6757;
}

.modal-confirm-btn:disabled {
  opacity: 0.6;
}

/* Success Card */
.success-card {
  text-align: center;
}

.success-icon-badge {
  margin: 0 auto 16px auto;
  background: #E8F8F3;
}

.cert-code-box {
  background: #FAF8F4;
  border: 2px dashed #3F6757;
  border-radius: 18px;
  padding: 20px;
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.code-label {
  font-size: 11px;
  font-weight: 800;
  color: #6F746F;
  letter-spacing: 1px;
}

.cert-code-val {
  font-family: 'Manrope', monospace;
  font-size: 28px;
  font-weight: 900;
  color: #3F6757;
  letter-spacing: 2px;
}

.code-buttons-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.copy-code-btn {
  background: #3F6757;
  color: #FAF8F4;
  border: none;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-code-btn.magic-link-btn {
  background: #FAF8F4;
  color: #3F6757;
  border: 1.5px solid #3F6757;
}

.whatsapp-share-box {
  margin: 16px 0 20px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.whatsapp-share-btn {
  width: 100%;
  background: #25D366;
  color: #FAF8F4;
  border: none;
  padding: 13px;
  border-radius: 14px;
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(37, 211, 102, 0.35);
  transition: transform 0.2s;
}

.whatsapp-share-btn:hover {
  transform: translateY(-2px);
  background: #20BA5A;
}

.preview-unboxing-link {
  font-size: 12px;
  color: #3F6757;
  text-decoration: underline;
  cursor: pointer;
}

.success-info-notice {
  background: #F0FDF4;
  border: 1px solid #BBF7D0;
  padding: 12px 16px;
  border-radius: 14px;
  margin-bottom: 24px;
}

.success-info-notice p {
  font-size: 12.5px;
  color: #15803D;
  margin: 0;
  line-height: 1.45;
}

@media (max-width: 1024px) {
  .boxes-grid { grid-template-columns: repeat(2, 1fr); }
  .duration-grid { grid-template-columns: repeat(2, 1fr); }
  .gift-configurator-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .gifting-steps-row { grid-template-columns: 1fr; }
  .boxes-grid { grid-template-columns: 1fr; }
  .g-input-row { grid-template-columns: 1fr; }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.gift-wizard-card {
  background: #fff;
  border-radius: 28px;
  padding: 36px;
  border: 1px solid rgba(0,0,0,0.04);
  max-width: 720px;
  margin: 0 auto;
}

.wizard-intro { color: #6F746F; margin-bottom: 24px; }
.wizard-steps-grid { display: flex; flex-direction: column; gap: 20px; margin-bottom: 24px; }
.wizard-field label { display: block; font-weight: 800; margin-bottom: 8px; font-size: 14px; }
.wizard-field select { width: 100%; padding: 12px 14px; border-radius: 12px; border: 1.5px solid #E3D7C6; }
.interest-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.interest-chip { padding: 8px 16px; border-radius: 50px; border: 1px solid #E6DFD4; background: #fff; cursor: pointer; font-size: 13px; font-weight: 600; }
.interest-chip.active { background: #3F6757; color: #fff; border-color: #3F6757; }
.wizard-submit-btn { width: 100%; background: #3F6757; color: #fff; border: none; padding: 14px; border-radius: 14px; font-weight: 700; cursor: pointer; }

.inline-icon { flex-shrink: 0; }
.gift-hero-badge .inline-icon,
.digital-info-pill .inline-icon,
.box-gift-ribbon .inline-icon,
.whatsapp-share-btn .inline-icon { vertical-align: middle; }
.copy-code-btn { display: inline-flex; align-items: center; gap: 6px; }
.digital-info-pill span { display: inline-flex; align-items: center; gap: 6px; }
.submit-gift-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
.modal-badge-icon,
.success-icon-badge { display: flex; align-items: center; justify-content: center; color: #3F6757; }
</style>
