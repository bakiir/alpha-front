<template>
  <div class="gift-page">
    <TheHeader />

    <main class="container page-content">
      <!-- Hero -->
      <section class="gift-hero">
        <h1 class="gift-title">Подарочное членство в клубе Alpha</h1>
        <p class="gift-subtitle">
          Подарите ребенку и родителям целый мир развивающих эко-игрушек без захламления квартиры. Вы дарите сертификат, а родители сами выбирают любимые наборы!
        </p>
      </section>

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
          <h2 class="config-heading">Настройте ваш подарок</h2>

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

          <!-- Step 2: Plan Tier (Starter vs Explorer) -->
          <div class="config-block">
            <label class="block-label">2. Тариф подписки</label>
            <div class="tier-cards-row">
              <div 
                class="tier-select-card"
                :class="{ active: selectedTier === 'starter' }"
                @click="selectedTier = 'starter'"
              >
                <div class="tier-radio">
                  <span v-if="selectedTier === 'starter'" class="dot"></span>
                </div>
                <div class="tier-info">
                  <strong>Тариф Starter</strong>
                  <p>3 эко-игрушки в месяц</p>
                </div>
              </div>

              <div 
                class="tier-select-card"
                :class="{ active: selectedTier === 'explorer' }"
                @click="selectedTier = 'explorer'"
              >
                <div class="tier-radio">
                  <span v-if="selectedTier === 'explorer'" class="dot"></span>
                </div>
                <div class="tier-info">
                  <strong>Тариф Explorer ★ ХИТ</strong>
                  <p>5 игрушек + план методиста</p>
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
                  <label>Имя ребенка / семьи</label>
                  <input v-model="giftForm.recipientName" type="text" placeholder="Маленькому Мише" />
                </div>
                <div class="g-field">
                  <label>От кого</label>
                  <input v-model="giftForm.senderName" type="text" placeholder="От любящих крестных" />
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
              <span class="cert-type-pill">GIFT MEMBERSHIP</span>
            </div>

            <div class="cert-body">
              <span class="cert-to-label">Подарочный сертификат для:</span>
              <h3 class="cert-recipient">{{ giftForm.recipientName || 'Любимого ребенка' }}</h3>

              <div class="cert-details-badge">
                <span>{{ currentDurationObj.months }} подписки • {{ selectedTier === 'starter' ? 'Тариф Starter (3 игрушки)' : 'Тариф Explorer (5 игрушек)' }}</span>
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

            <button class="submit-gift-btn" @click="handleBuyGift">
              Подарить сертификат за {{ formatPrice(calculatedPrice) }} ₸ 🎁
            </button>
            <span class="gift-instant-note">Мгновенная доставка на Email или нарядная печатная открытка</span>
          </div>
        </div>
      </section>

      <!-- Ready Gift Boxes Section -->
      <section class="ready-boxes-section">
        <div class="boxes-header">
          <span class="sub-badge">ГОТОВЫЕ НАБОРЫ</span>
          <h2 class="section-title">Праздничные подарочные боксы</h2>
          <p class="section-subtitle">Фирменная деревянная эко-упаковка с атласной лентой и поздравлением.</p>
        </div>

        <div class="boxes-grid">
          <div v-for="box in readyBoxes" :key="box.id" class="box-card">
            <div class="box-img-wrap">
              <img :src="box.image" :alt="box.title" class="box-img" />
              <span class="box-age-tag">{{ box.age }}</span>
            </div>
            <div class="box-content">
              <h3 class="box-title">{{ box.title }}</h3>
              <p class="box-desc">{{ box.description }}</p>
              <div class="box-bottom-row">
                <span class="box-price">{{ formatPrice(box.price) }} ₸</span>
                <button class="box-add-btn" @click="addBox(box)">В корзину</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TheHeader from '~/components/TheHeader.vue'

const { addItem } = useCart()

const selectedDuration = ref('3m')
const selectedTier = ref<'starter' | 'explorer'>('explorer')

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
  message: 'Расти здоровым, любознательным и счастливым! Пусть каждый день приносит новые открытия!'
})

const calculatedPrice = computed(() => {
  const baseMonthly = selectedTier.value === 'starter' ? 14900 : 22900
  const mult = currentDurationObj.value.multiplier
  return baseMonthly * mult
})

const readyBoxes = [
  {
    id: 1,
    title: 'Бокс «Первый Годик»',
    age: '0–1 года',
    price: 14900,
    description: '3 деревянные эко-погремушки из клена и бука, льняной мешочек и открытка.',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 2,
    title: 'Бокс «Маленький Гений»',
    age: '1–3 года',
    price: 22900,
    description: 'Геометрический сортер, радуга-балансир и тактильные карточки с буквами.',
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 3,
    title: 'Бокс «Архитектор»',
    age: '3–6 лет',
    price: 28900,
    description: 'Большой деревянный конструктор «Замок» + шнуровка «Лесные животные».',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=500&q=80'
  }
]

const { purchaseGiftSubscription } = useGifts()
const isSubmitting = ref(false)

const handleBuyGift = async () => {
  isSubmitting.value = true
  const monthsMap: Record<string, number> = { '1m': 1, '3m': 3, '6m': 6, '12m': 12 }
  const durationMonths = monthsMap[selectedDuration.value] || 3

  try {
    const res = await purchaseGiftSubscription(durationMonths, giftForm.value.recipientName)
    if (res?.gift_subscription) {
      alert(`Подарочный сертификат #${res.gift_subscription.code} успешно создан на бэкенде! 🎁`)
    }
  } catch (e: any) {
    console.log('Покупка зарегистрирована локально.')
  } finally {
    isSubmitting.value = false
  }

  addItem({
    id: `cert-${Date.now()}`,
    title: `Подарочный сертификат «${currentDurationObj.value.months} (${selectedTier.value === 'starter' ? 'Starter' : 'Explorer'})» для ${giftForm.value.recipientName}`,
    price: calculatedPrice.value,
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&q=80'
  })
  navigateTo('/cart')
}

const addBox = (box: any) => {
  addItem({
    id: box.id,
    title: box.title,
    price: box.price,
    image: box.image
  })
  alert(`«${box.title}» добавлен в корзину! 🎁`)
  navigateTo('/cart')
}

const formatPrice = (val: number) => {
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
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
  max-width: 780px;
  margin: 0 auto 40px auto;
}

.gift-badge {
  display: inline-block;
  background: #F0EDFF;
  color: #7C5CFC;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 12px;
  letter-spacing: 1.2px;
  padding: 6px 16px;
  border-radius: 20px;
  margin-bottom: 16px;
}

.gift-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 40px;
  color: #1A1A2E;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

.gift-subtitle {
  font-size: 16px;
  color: #7B7B93;
  line-height: 1.6;
}

/* Steps Row */
.gifting-steps-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 56px;
}

.g-step-card {
  background: #FFFFFF;
  border-radius: 24px;
  padding: 28px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
}

.g-step-num {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: #F0EDFF;
  color: #7C5CFC;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.g-step-card h3 {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 18px;
  margin-bottom: 6px;
}

.g-step-card p {
  font-size: 13.5px;
  color: #7B7B93;
  line-height: 1.5;
}

/* Configurator Grid */
.gift-configurator-grid {
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  gap: 36px;
  margin-bottom: 64px;
  align-items: flex-start;
}

.config-col {
  background: #FFFFFF;
  border-radius: 28px;
  padding: 36px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.config-heading {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 24px;
}

.block-label {
  display: block;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 15px;
  color: #1A1A2E;
  margin-bottom: 12px;
}

.duration-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.duration-card {
  background: #FAFAFC;
  border: 1.5px solid #EAEAF2;
  border-radius: 18px;
  padding: 16px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.2s ease;
}

.duration-card:hover {
  border-color: #7C5CFC;
}

.duration-card.active {
  background: #F8F6FF;
  border-color: #624CE0;
  box-shadow: 0 4px 14px rgba(98, 76, 224, 0.15);
}

.dur-months {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 17px;
  color: #1A1A2E;
  margin-bottom: 2px;
}

.dur-title {
  font-size: 12.5px;
  color: #7B7B93;
}

.dur-badge {
  position: absolute;
  top: -9px;
  right: 10px;
  background: #FFD166;
  color: #1A1A2E;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 9.5px;
  padding: 2px 8px;
  border-radius: 10px;
}

.tier-cards-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.tier-select-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #FAFAFC;
  border: 1.5px solid #EAEAF2;
  border-radius: 16px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tier-select-card.active {
  background: #F8F6FF;
  border-color: #624CE0;
}

.tier-radio {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid #D2D2E0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tier-select-card.active .tier-radio {
  border-color: #624CE0;
}

.tier-radio .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #624CE0;
}

.tier-info strong {
  display: block;
  font-size: 13.5px;
  font-weight: 700;
}

.tier-info p {
  font-size: 12px;
  color: #7B7B93;
}

.gift-inputs-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.g-input-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.g-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.g-field label {
  font-size: 12.5px;
  font-weight: 700;
}

.g-field input, .g-field textarea {
  padding: 11px 14px;
  border: 1.5px solid #EAEAF2;
  border-radius: 12px;
  font-size: 13.5px;
  font-family: 'DM Sans', sans-serif;
  outline: none;
}

.g-field input:focus, .g-field textarea:focus {
  border-color: #7C5CFC;
}

/* Certificate Preview Column */
.preview-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cert-preview-card {
  background: linear-gradient(135deg, #FAF7FF 0%, #FFFFFF 100%);
  border-radius: 28px;
  padding: 32px;
  border: 2px dashed #D3C7FF;
  box-shadow: 0 12px 36px rgba(124, 92, 252, 0.12);
  display: flex;
  flex-direction: column;
  position: relative;
}

.cert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.cert-logo {
  display: flex;
  align-items: center;
}

.cert-logo-img {
  height: 32px;
  width: auto;
  object-fit: contain;
}

.cert-type-pill {
  background: #FFD166;
  color: #1A1A2E;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 10px;
  padding: 4px 12px;
  border-radius: 20px;
  letter-spacing: 0.8px;
}

.cert-to-label {
  font-size: 12px;
  color: #7B7B93;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cert-recipient {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 26px;
  color: #624CE0;
  margin-bottom: 12px;
}

.cert-details-badge {
  display: inline-block;
  background: #E8FAF4;
  color: #058563;
  font-weight: 700;
  font-size: 12.5px;
  padding: 6px 14px;
  border-radius: 12px;
  margin-bottom: 16px;
}

.cert-message-quote {
  font-style: italic;
  font-size: 14px;
  color: #4A4A68;
  line-height: 1.5;
  margin-bottom: 24px;
  min-height: 44px;
}

.cert-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-top: 1px solid #ECECF4;
  padding-top: 14px;
}

.cert-from span {
  display: block;
  font-size: 11.5px;
  color: #7B7B93;
}

.cert-from strong {
  font-size: 14px;
  color: #1A1A2E;
}

.cert-seal {
  background: #F0EDFF;
  color: #7C5CFC;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 10px;
  padding: 4px 10px;
  border-radius: 8px;
}

.cert-buy-action-card {
  background: #FFFFFF;
  border-radius: 24px;
  padding: 24px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.action-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-price-row span {
  font-size: 14px;
  color: #7B7B93;
}

.total-cert-price {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 26px;
  color: #1A1A2E;
}

.submit-gift-btn {
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
}

.submit-gift-btn:hover {
  background: #513bc7;
}

.gift-instant-note {
  font-size: 11.5px;
  color: #7B7B93;
  text-align: center;
}

/* Ready Boxes Section */
.ready-boxes-section {
  margin-top: 24px;
}

.boxes-header {
  text-align: center;
  margin-bottom: 36px;
}

.sub-badge {
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 800;
  color: #7C5CFC;
  letter-spacing: 1px;
}

.section-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 32px;
  margin-top: 4px;
  margin-bottom: 6px;
}

.section-subtitle {
  font-size: 15px;
  color: #7B7B93;
}

.boxes-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}

.box-card {
  background: #FFFFFF;
  border-radius: 28px;
  padding: 18px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
}

.box-img-wrap {
  height: 200px;
  border-radius: 20px;
  background: #F4F8FC;
  overflow: hidden;
  position: relative;
  margin-bottom: 16px;
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
  background: #FFF1C5;
  color: #7A5300;
  font-size: 11px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 12px;
}

.box-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.box-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 18px;
  margin-bottom: 6px;
}

.box-desc {
  font-size: 13px;
  color: #7B7B93;
  line-height: 1.45;
  margin-bottom: 18px;
  min-height: 38px;
}

.box-bottom-row {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.box-price {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 20px;
}

.box-add-btn {
  background: #624CE0;
  color: #FFFFFF;
  border: none;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 13.5px;
  padding: 10px 20px;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(98, 76, 224, 0.25);
}

@media (max-width: 960px) {
  .gift-configurator-grid { grid-template-columns: 1fr; }
  .gifting-steps-row { grid-template-columns: 1fr; }
  .boxes-grid { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .gift-title {
    font-size: 28px;
  }

  .config-col,
  .cert-preview-card,
  .cert-buy-action-card {
    padding: 22px 18px;
    border-radius: 20px;
  }

  .duration-grid {
    grid-template-columns: 1fr;
  }

  .tier-cards-row {
    grid-template-columns: 1fr;
  }

  .g-input-row {
    grid-template-columns: 1fr;
  }

  .cert-recipient {
    font-size: 22px;
  }
}
</style>
