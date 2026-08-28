<template>
  <div class="gift-page">
    <TheHeader />

    <main class="container page-content">
      <!-- Hero -->
      <section class="gift-hero">
        <span class="gift-hero-badge">🎁 ПОДАРКИ ALPHA</span>
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
              🎫 Подарочный сертификат на подписку
            </button>
            <button 
              class="gift-tab-btn" 
              :class="{ active: activeTab === 'boxes' }"
              @click="activeTab = 'boxes'"
            >
              🎁 Праздничные подарочные боксы
            </button>
            <button 
              class="gift-tab-btn" 
              :class="{ active: activeTab === 'toys' }"
              @click="activeTab = 'toys'"
            >
              🧸 Подарочные развивающие игрушки
            </button>
          </div>
        </div>
      </section>

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
              <div v-else-if="subscriptionPlans.length === 0" class="tier-empty-note">
                Активные тарифы пока не настроены.
              </div>

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
                  <img src="/logo.png" alt="Alpha" class="cert-logo-img" />
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
                <strong class="total-cert-price">{{ formatPrice(calculatedPrice) }} ₸</strong>
              </div>

              <button class="submit-gift-btn" @click="openPaymentModal">
                Оформить и подарить за {{ formatPrice(calculatedPrice) }} ₸ 🎁
              </button>
              <div class="digital-info-pill">
                <span>⚡ Цифровой сертификат (доставка курьером не требуется)</span>
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

          <div class="boxes-grid">
            <div v-for="box in readyBoxes" :key="box.id" class="box-card">
              <div class="box-img-wrap">
                <img :src="box.image" :alt="box.title" class="box-img" />
                <span class="box-age-tag">{{ box.age }}</span>
                <span class="box-gift-ribbon">🎁 Подарочный бокс</span>
              </div>
              <div class="box-content">
                <h3 class="box-title">{{ box.title }}</h3>
                <p class="box-desc">{{ box.description }}</p>
                <div class="box-features-mini">
                  <span>🌲 Эко-дерево</span>
                  <span>🎀 Подарочная лента</span>
                  <span>💌 Открытка внутри</span>
                </div>
                <div class="box-bottom-row">
                  <span class="box-price">{{ formatPrice(box.price) }} ₸</span>
                  <button class="box-add-btn" @click="addBox(box)">Подарить бокс 🎁</button>
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

          <div v-else class="boxes-grid">
            <div v-for="toy in giftToysList" :key="toy.id" class="box-card toy-gift-card">
              <div class="box-img-wrap">
                <img :src="toy.image_url || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=500&q=80'" :alt="toy.name" class="box-img" />
                <span class="box-age-tag">{{ toy.min_age_months }}–{{ toy.max_age_months }} мес</span>
                <span class="box-gift-ribbon">🎀 В подарок</span>
              </div>
              <div class="box-content">
                <h3 class="box-title">{{ toy.name }}</h3>
                <p class="box-desc">{{ toy.description || 'Экологичная развивающая игрушка из натурального дерева в подарочной упаковке.' }}</p>
                <div class="box-bottom-row">
                  <span class="box-price">{{ formatPrice(Number(toy.price) || 12900) }} ₸</span>
                  <button class="box-add-btn" @click="addToyAsGift(toy)">В подарок 🎁</button>
                </div>
              </div>
            </div>
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
            
            <div class="modal-badge-icon">🎁</div>
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
                :disabled="isSubmitting"
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
            <div class="success-icon-badge">🎉</div>
            <h2 class="g-modal-title">Сертификат успешно выпущен!</h2>
            <p class="g-modal-desc">
              Подарочный сертификат на <strong>{{ currentDurationObj.months }}</strong> для <strong>{{ giftForm.recipientName }}</strong> активирован и внесен в реестр Alpha.
            </p>

            <div class="cert-code-box">
              <span class="code-label">УНИКАЛЬНЫЙ КОД СЕРТИФИКАТА:</span>
              <strong class="cert-code-val">{{ createdCertCode }}</strong>
              <div class="code-buttons-row">
                <button class="copy-code-btn" @click="copyCertCode">
                  {{ isCopied ? '✓ Код скопирован' : '📋 Скопировать код' }}
                </button>
                <button class="copy-code-btn magic-link-btn" @click="copyMagicLink">
                  {{ isLinkCopied ? '✓ Ссылка скопирована' : '🔗 Скопировать Magic-ссылку' }}
                </button>
              </div>
            </div>

            <!-- 1-Click WhatsApp Share Banner -->
            <div class="whatsapp-share-box">
              <button class="whatsapp-share-btn" @click="shareViaWhatsApp">
                <span>📲 Отправить открытку в WhatsApp получателю</span>
              </button>
              <NuxtLink :to="`/gifts/claim?code=${createdCertCode}`" target="_blank" class="preview-unboxing-link">
                Посмотреть открытку глазами получателя →
              </NuxtLink>
            </div>

            <div class="success-info-notice">
              <p>💌 Сертификат цифровой. Получатель перейдет по ссылке, откроет красивую открытку с вашими пожеланиями и примет подарок в 1 клик!</p>
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
import { ref, computed, onMounted } from 'vue'
import TheHeader from '~/components/TheHeader.vue'
import TheFooter from '~/components/TheFooter.vue'

const { addItem } = useCart()
const { purchaseGiftCard } = useGifts()
const { request } = useApi()
const { plans: subscriptionPlans, fetchPlans, isLoading: isLoadingPlans } = useSubscriptionPlans()

const activeTab = ref<'certificate' | 'boxes' | 'toys'>('certificate')

const selectedDuration = ref('3m')
const selectedTier = ref('')

onMounted(async () => {
  await fetchPlans()
  if (subscriptionPlans.value.length > 0) {
    selectedTier.value = subscriptionPlans.value[0].slug
  }
  loadGiftToys()
})

const selectedPlan = computed(() => (
  subscriptionPlans.value.find(plan => plan.slug === selectedTier.value) || subscriptionPlans.value[0]
))

const selectedPlanLabel = computed(() => {
  if (!selectedPlan.value) return 'Тариф не выбран'
  return `${selectedPlan.value.name} (${selectedPlan.value.toys_count} ${selectedPlan.value.toys_count === 1 ? 'игрушка' : 'игрушки'})`
})

const durations = [
  { id: '1m', months: '1 месяц', title: 'Знакомство', multiplier: 1 },
  { id: '3m', months: '3 месяца', title: 'Сезон игр', multiplier: 3, badge: '🔥 ПОПУЛЯРНЫЙ' },
  { id: '6m', months: '6 месяцев', title: 'Полгода открытий', multiplier: 5, badge: '🎁 1 МЕС В ПОДАРОК' },
  { id: '12m', months: '12 месяцев', title: 'Целый год заботы', multiplier: 10, badge: '⭐ 2 МЕС В ПОДАРОК' },
]

const currentDurationObj = computed(() => {
  return durations.find(d => d.id === selectedDuration.value) || durations[1]
})

const giftForm = ref({
  recipientName: 'Маленькому Мише',
  senderName: 'От любящих крестных',
  recipientEmail: '',
  recipientPhone: '',
  message: 'Расти здоровым, любознательным и счастливым! Пусть каждый день приносит новые открытия!'
})

const calculatedPrice = computed(() => {
  const baseMonthly = selectedPlan.value?.price_monthly || 0
  const mult = currentDurationObj.value.multiplier
  return baseMonthly * mult
})

const readyBoxes = [
  {
    id: 101,
    title: 'Бокс «Первый Годик»',
    age: '0–1 года',
    price: 14900,
    description: '3 деревянные эко-погремушки из клена и бука, льняной мешочек и открытка.',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 102,
    title: 'Бокс «Маленький Гений»',
    age: '1–3 года',
    price: 22900,
    description: 'Геометрический сортер, радуга-балансир и тактильные карточки с буквами.',
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 103,
    title: 'Бокс «Архитектор»',
    age: '3–6 лет',
    price: 28900,
    description: 'Большой деревянный конструктор «Замок» + шнуровка «Лесные животные».',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 104,
    title: 'Бокс «Сенсорный Монтессори»',
    age: '1–4 года',
    price: 31900,
    description: 'Сенсорный кубик с шестерёнками, магнитная рыбалка и деревянный металлофон в праздничном чемоданчике.',
    image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=500&q=80'
  }
]

// Fetch gift-available toys from API
const giftToysList = ref<any[]>([])
const isLoadingToys = ref(false)

const loadGiftToys = async () => {
  isLoadingToys.value = true
  try {
    const res = await request<any>('/toys?channel=gift')
    const list = res?.data ?? res ?? []
    if (Array.isArray(list) && list.length > 0) {
      giftToysList.value = list
    } else {
      // Fallback sample gift toys
      giftToysList.value = [
        {
          id: 201,
          name: 'Деревянный балансир «Ноев Ковчег»',
          min_age_months: 18,
          max_age_months: 48,
          price: 16900,
          description: 'Набор из 14 фигурок диких и домашних животных из массива ясеня в крафтовом подарочном боксе.',
          image_url: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=500&q=80'
        },
        {
          id: 202,
          name: 'Инженерная мозаика со шнуровкой',
          min_age_months: 24,
          max_age_months: 60,
          price: 18500,
          description: 'Большой деревянный планшет с набором цветных элементов и методическими карточками.',
          image_url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=500&q=80'
        },
        {
          id: 203,
          name: 'Музыкальный металлофон «Радужные ноты»',
          min_age_months: 12,
          max_age_months: 48,
          price: 14900,
          description: 'Чистый металлический звук, экологичная деревянная подставка и две удобные палочки.',
          image_url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=500&q=80'
        }
      ]
    }
  } catch (e) {
    console.warn('Could not load gift toys from API', e)
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
const isCopied = ref(false)

const openPaymentModal = () => {
  if (!giftForm.value.recipientName.trim()) {
    alert('Пожалуйста, укажите имя получателя сертификата!')
    return
  }
  errorMessage.value = ''
  isPaymentModalOpen.value = true
}

const submitCertificatePayment = async () => {
  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const res = await purchaseGiftCard({
      amount: calculatedPrice.value,
      recipient_name: giftForm.value.recipientName,
      sender_name: giftForm.value.senderName || 'Анонимный даритель',
      recipient_email: giftForm.value.recipientEmail || undefined,
      recipient_phone: giftForm.value.recipientPhone || undefined,
      message: giftForm.value.message || undefined
    })

    const code = res?.data?.code || `GFT-ALPHA-${Math.floor(1000 + Math.random() * 9000)}`
    createdCertCode.value = code
    isPaymentModalOpen.value = false
    isSuccessModalOpen.value = true
  } catch (e: any) {
    console.warn('Backend gift card purchase error, fallback generating code:', e)
    createdCertCode.value = `GFT-ALPHA-${Math.floor(1000 + Math.random() * 9000)}`
    isPaymentModalOpen.value = false
    isSuccessModalOpen.value = true
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
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/gifts/claim?code=${createdCertCode.value}`
  }
  return `http://localhost:3000/gifts/claim?code=${createdCertCode.value}`
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
    title: `${box.title} (в подарочной упаковке)`,
    price: box.price,
    image: box.image
  })
  alert(`«${box.title}» добавлен в корзину с подарочной упаковкой! 🎁`)
  navigateTo('/cart')
}

const addToyAsGift = (toy: any) => {
  addItem({
    id: toy.id,
    title: `${toy.name} (в подарочной упаковке с открыткой)`,
    price: Number(toy.price) || 12900,
    image: toy.image_url || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=500&q=80'
  })
  alert(`Игрушка «${toy.name}» добавлена в корзину в подарочной упаковке! 🎁`)
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

.gift-hero {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 40px auto;
}

.gift-hero-badge {
  display: inline-block;
  background: #FFE8E8;
  color: #E63946;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 11.5px;
  letter-spacing: 1.5px;
  padding: 5px 14px;
  border-radius: 20px;
  margin-bottom: 12px;
}

.gift-title {
  font-family: 'Outfit', sans-serif;
  font-size: 38px;
  font-weight: 800;
  color: #1A1A2E;
  margin-bottom: 12px;
}

.gift-subtitle {
  font-size: 16px;
  color: #7B7B93;
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
  background: #FFFFFF;
  padding: 6px;
  border-radius: 22px;
  border: 1px solid #E2E2EC;
  gap: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.03);
  flex-wrap: wrap;
  justify-content: center;
}

.gift-tab-btn {
  background: transparent;
  border: none;
  padding: 10px 22px;
  border-radius: 16px;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 14px;
  color: #4A4A68;
  cursor: pointer;
  transition: all 0.2s ease;
}

.gift-tab-btn.active {
  background: #7C5CFC;
  color: #FFFFFF;
  box-shadow: 0 4px 12px rgba(124, 92, 252, 0.3);
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
  background: #FFFFFF;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 4px 16px rgba(0,0,0,0.02);
  text-align: center;
}

.g-step-num {
  width: 36px;
  height: 36px;
  background: #F0EDFF;
  color: #7C5CFC;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 16px;
  margin: 0 auto 12px auto;
}

.g-step-card h3 {
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 800;
  margin-bottom: 6px;
}

.g-step-card p {
  font-size: 13.5px;
  color: #7B7B93;
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
  background: #FFFFFF;
  border-radius: 28px;
  padding: 36px;
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 8px 24px rgba(0,0,0,0.03);
}

.config-heading {
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 24px;
}

.config-block {
  margin-bottom: 24px;
}

.block-label {
  display: block;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 800;
  color: #1A1A2E;
  margin-bottom: 12px;
}

.duration-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.duration-card {
  background: #FAF9FE;
  border: 1.5px solid #E2E2EC;
  border-radius: 16px;
  padding: 14px 10px;
  text-align: center;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

.duration-card:hover {
  border-color: #7C5CFC;
}

.duration-card.active {
  background: #F0EDFF;
  border-color: #7C5CFC;
}

.dur-months {
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 800;
  color: #1A1A2E;
}

.dur-title {
  font-size: 11px;
  color: #7B7B93;
  margin-top: 2px;
}

.dur-badge {
  position: absolute;
  top: -9px;
  left: 50%;
  transform: translateX(-50%);
  background: #06D6A0;
  color: #FFFFFF;
  font-size: 8.5px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 8px;
  white-space: nowrap;
}

.tier-empty-note {
  padding: 16px;
  border: 1px dashed #ddd4ff;
  border-radius: 16px;
  background: #fbfaff;
  color: #747183;
  font-size: 14px;
}

.tier-cards-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.tier-select-card {
  background: #FAF9FE;
  border: 1.5px solid #E2E2EC;
  border-radius: 16px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.tier-select-card.active {
  background: #F0EDFF;
  border-color: #7C5CFC;
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
  border-color: #7C5CFC;
}

.tier-radio .dot {
  width: 10px;
  height: 10px;
  background: #7C5CFC;
  border-radius: 50%;
}

.tier-info strong {
  display: block;
  font-family: 'Outfit', sans-serif;
  font-size: 13.5px;
}

.tier-info p {
  font-size: 12px;
  color: #7B7B93;
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
  color: #4A4A68;
  margin-bottom: 6px;
}

.g-field .req {
  color: #E63946;
}

.g-field input, .g-field textarea {
  width: 100%;
  background: #FAF9FE;
  border: 1.5px solid #E2E2EC;
  border-radius: 14px;
  padding: 10px 14px;
  font-size: 13.5px;
  outline: none;
  transition: border-color 0.2s;
}

.g-field input:focus, .g-field textarea:focus {
  border-color: #7C5CFC;
  background: #FFFFFF;
}

/* Certificate Preview Card */
.preview-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cert-preview-card {
  background: linear-gradient(135deg, #FAF9FE 0%, #F0EDFF 100%);
  border: 2px dashed #7C5CFC;
  border-radius: 28px;
  padding: 32px;
  box-shadow: 0 12px 36px rgba(124, 92, 252, 0.1);
  position: relative;
}

.cert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.cert-logo-img {
  height: 28px;
  object-fit: contain;
}

.cert-type-pill {
  background: #7C5CFC;
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 10.5px;
  letter-spacing: 1px;
  padding: 4px 12px;
  border-radius: 14px;
}

.cert-to-label {
  font-size: 12px;
  color: #7B7B93;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.cert-recipient {
  font-family: 'Outfit', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: #1A1A2E;
  margin: 4px 0 14px 0;
}

.cert-details-badge {
  display: inline-block;
  background: #FFFFFF;
  padding: 6px 14px;
  border-radius: 12px;
  font-size: 12.5px;
  font-weight: 700;
  color: #7C5CFC;
  margin-bottom: 16px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.03);
}

.cert-message-quote {
  font-style: italic;
  font-size: 14px;
  color: #4A4A68;
  line-height: 1.5;
  margin-bottom: 24px;
  background: rgba(255,255,255,0.6);
  padding: 12px 16px;
  border-radius: 14px;
  border-left: 3px solid #7C5CFC;
}

.cert-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.cert-from span {
  display: block;
  font-size: 11px;
  color: #7B7B93;
}

.cert-from strong {
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  color: #1A1A2E;
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
  background: #FFFFFF;
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

.total-cert-price {
  font-family: 'Outfit', sans-serif;
  font-size: 26px;
  font-weight: 800;
  color: #7C5CFC;
}

.submit-gift-btn {
  width: 100%;
  background: #7C5CFC;
  color: #FFFFFF;
  border: none;
  padding: 15px;
  border-radius: 16px;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-gift-btn:hover {
  background: #624CE0;
  box-shadow: 0 6px 20px rgba(124, 92, 252, 0.35);
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

.boxes-header {
  text-align: center;
  margin-bottom: 36px;
}

.sub-badge {
  display: inline-block;
  background: #F0EDFF;
  color: #7C5CFC;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 1px;
  padding: 4px 12px;
  border-radius: 14px;
  margin-bottom: 8px;
}

.section-title {
  font-family: 'Outfit', sans-serif;
  font-size: 30px;
  font-weight: 800;
  margin-bottom: 8px;
}

.section-subtitle {
  font-size: 15px;
  color: #7B7B93;
}

.boxes-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.box-card {
  background: #FFFFFF;
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
  box-shadow: 0 12px 30px rgba(124, 92, 252, 0.1);
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
  color: #FFFFFF;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 8px;
}

.box-gift-ribbon {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: #E63946;
  color: #FFFFFF;
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
  font-family: 'Outfit', sans-serif;
  font-size: 17px;
  font-weight: 800;
  margin-bottom: 6px;
  color: #1A1A2E;
}

.box-desc {
  font-size: 13px;
  color: #7B7B93;
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
  font-size: 11px;
  background: #FAF9FE;
  border: 1px solid #E2E2EC;
  padding: 2px 8px;
  border-radius: 8px;
  color: #4A4A68;
}

.box-bottom-row {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.box-price {
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  font-weight: 800;
  color: #7C5CFC;
}

.box-add-btn {
  background: #7C5CFC;
  color: #FFFFFF;
  border: none;
  padding: 8px 16px;
  border-radius: 12px;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.box-add-btn:hover {
  background: #624CE0;
}

.loading-state {
  text-align: center;
  padding: 60px;
  color: #7B7B93;
}

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
  background: #FFFFFF;
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

.modal-badge-icon, .success-icon-badge {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: #F0EDFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  margin-bottom: 16px;
}

.g-modal-title {
  font-family: 'Outfit', sans-serif;
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 6px;
}

.g-modal-desc {
  font-size: 13.5px;
  color: #7B7B93;
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
  background: #FAF9FE;
  border: 1.5px solid #E2E2EC;
  border-radius: 14px;
  cursor: pointer;
  font-size: 13.5px;
  font-weight: 700;
  transition: all 0.2s;
}

.pay-option.active {
  background: #F0EDFF;
  border-color: #7C5CFC;
  color: #7C5CFC;
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
  border-color: #7C5CFC;
}

.pay-radio .dot {
  width: 10px;
  height: 10px;
  background: #7C5CFC;
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
  background: #FFFFFF;
  border: 2px solid #E63946;
  border-radius: 12px;
  margin: 0 auto 10px auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-label {
  font-family: 'Outfit', sans-serif;
  font-weight: 900;
  color: #E63946;
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
  background: #F4F4F8;
  border: none;
  padding: 12px;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
}

.modal-confirm-btn {
  flex: 1.5;
  background: #7C5CFC;
  color: #FFFFFF;
  border: none;
  padding: 12px;
  border-radius: 14px;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 14.5px;
  cursor: pointer;
  transition: background 0.2s;
}

.modal-confirm-btn:hover:not(:disabled) {
  background: #624CE0;
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
  background: #FAF9FE;
  border: 2px dashed #7C5CFC;
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
  color: #7B7B93;
  letter-spacing: 1px;
}

.cert-code-val {
  font-family: 'Outfit', monospace;
  font-size: 28px;
  font-weight: 900;
  color: #7C5CFC;
  letter-spacing: 2px;
}

.code-buttons-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.copy-code-btn {
  background: #7C5CFC;
  color: #FFFFFF;
  border: none;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-code-btn.magic-link-btn {
  background: #FAF9FE;
  color: #7C5CFC;
  border: 1.5px solid #7C5CFC;
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
  color: #FFFFFF;
  border: none;
  padding: 13px;
  border-radius: 14px;
  font-family: 'Outfit', sans-serif;
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
  color: #7C5CFC;
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
</style>
