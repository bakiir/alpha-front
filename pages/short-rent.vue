<template>
  <div class="short-rent-page">
    <TheHeader />

    <main class="container page-content">
      <!-- Hero -->
      <section class="rent-hero">
        <h1 class="rent-title">Краткосрочная аренда эко-игрушек</h1>
        <p class="rent-subtitle">
          Идеальное решение для праздников, дней рождения, гостей, дачи или поездки на выходные. Возьмите развивающие наборы на срок от 3 до 14 дней.
        </p>
      </section>

      <!-- Mobile Package Quick Tabs -->
      <div class="mobile-rent-pills">
        <button 
          v-for="(pkg, pIdx) in ['3 дня', '7 дней ★ Хит', '14 дней']" 
          :key="pIdx"
          class="rent-pill-btn"
          :class="{ active: activeRentIndex === pIdx }"
          @click="scrollToRentCard(pIdx)"
        >
          {{ pkg }}
        </button>
      </div>

      <!-- 3 Period Packages Grid -->
      <section class="rent-packages-grid">
        <!-- Pack 1: Выходные -->
        <div class="rent-card">
          <div class="rent-duration">3 дня</div>
          <h3 class="card-title">Пакет «Выходные»</h3>
          <p class="card-desc">Отлично подходит для поездки за город или визита гостей с детьми.</p>
          <div class="rent-price-box">
            <span class="price-val">5 900 ₸</span>
            <span class="price-note">за 3 дня</span>
          </div>
          <ul class="card-perks">
            <li>✓ 4 эко-игрушки на выбор</li>
            <li>✓ Доставка и забор в точное время</li>
            <li>✓ Обработка горячим паром</li>
          </ul>
          <button class="rent-btn" @click="openRentModal('Пакет «Выходные» (3 дня)', 5900)">
            Забронировать
          </button>
        </div>

        <!-- Pack 2: Праздник (FEATURED) -->
        <div class="rent-card featured">
          <span class="top-tag">ХИТ ДЛЯ ПРАЗДНИКОВ</span>
          <div class="rent-duration featured">7 дней</div>
          <h3 class="card-title">Пакет «Праздничная неделя»</h3>
          <p class="card-desc">Для детского дня рождения или каникул. Большой игровой комплекс и развивающие сортеры.</p>
          <div class="rent-price-box">
            <span class="price-val featured">9 900 ₸</span>
            <span class="price-note">за неделю</span>
          </div>
          <ul class="card-perks">
            <li>✓ 7 развивающих игрушек + балансир</li>
            <li>✓ Бесплатная экспресс-доставка</li>
            <li>✓ Страховка от случайных поломок</li>
          </ul>
          <button class="rent-btn featured" @click="openRentModal('Пакет «Праздничная неделя» (7 дней)', 9900)">
            Забронировать
          </button>
        </div>

        <!-- Pack 3: Отпуск -->
        <div class="rent-card">
          <div class="rent-duration">14 дней</div>
          <h3 class="card-title">Пакет «Каникулы и Отпуск»</h3>
          <p class="card-desc">Две недели разнообразных игр без необходимости покупать дорогие игрушки.</p>
          <div class="rent-price-box">
            <span class="price-val">15 900 ₸</span>
            <span class="price-note">за 14 дней</span>
          </div>
          <ul class="card-perks">
            <li>✓ 10 премиальных игрушек Монтессори</li>
            <li>✓ Возможность замены 2 игрушек в процессе</li>
            <li>✓ Доставка и забор включены</li>
          </ul>
          <button class="rent-btn" @click="openRentModal('Пакет «Каникулы и Отпуск» (14 дней)', 15900)">
            Забронировать
          </button>
        </div>
      </section>

      <!-- How short rent works -->
      <section class="how-rent-works">
        <h2 class="section-heading">Как работает краткосрочная аренда</h2>
        <div class="steps-row">
          <div class="step-box">
            <div class="step-icon">1</div>
            <h4>Выберите пакет</h4>
            <p>Укажите количество дней и возраст ребенка (от 0 до 6 лет).</p>
          </div>
          <div class="step-box">
            <div class="step-icon">2</div>
            <h4>Привезем курьером</h4>
            <p>Доставим чистые и продезинфицированные игрушки прямо к вашей двери.</p>
          </div>
          <div class="step-box">
            <div class="step-icon">3</div>
            <h4>Заберем обратно</h4>
            <p>В назначенный день курьер сам приедет и заберет набор в удобное время.</p>
          </div>
        </div>
      </section>

      <!-- Individual Rental Catalog Section (ТЗ п.19, 20) -->
      <section class="rent-catalog-section">
        <div class="catalog-section-header">
          <h2 class="section-heading">Каталог товаров для посуточной аренды</h2>
          <p class="section-subtext">Выбирайте конкретный товар, указывайте точные даты и оформляйте доставку на дом.</p>
        </div>

        <div class="rent-items-grid">
          <div v-for="toy in availableToys" :key="toy.id" class="rent-item-card">
            <div class="rent-item-img-box">
              <img :src="toy.image_url && !toy.image_url.includes('placeholder') ? toy.image_url : 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80'" :alt="toy.name" />
              <span class="rent-badge-tag">Посуточно</span>
            </div>
            <div class="rent-item-body">
              <h3 class="rent-item-title">{{ toy.name }}</h3>
              <div class="rent-item-price-row">
                <span class="item-daily-rate">от {{ formatPrice(Math.max(1200, Math.round((toy.buyout_price || toy.price || 15000) * 0.1 / 100) * 100)) }} ₸ <span>/ день</span></span>
              </div>
              <NuxtLink :to="`/product/${toy.id}?mode=rent`" class="rent-item-action-btn">
                Выбрать даты аренды →
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Booking Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isModalOpen" class="modal-overlay" @click.self="isModalOpen = false">
          <div class="rent-modal">
            <button class="close-btn" @click="isModalOpen = false">&times;</button>
            <h2 class="modal-title">Бронирование набора 📅</h2>
            <p class="modal-desc">Вы выбрали: <strong>{{ selectedPackage }}</strong> ({{ formatPrice(selectedPrice) }} ₸)</p>

            <div class="modal-form">
              <!-- If User is Authenticated -->
              <template v-if="user">
              <div class="auth-readonly-info">
                <div class="read-grp">
                  <span class="r-label">Ваше имя</span>
                  <span class="r-val">{{ user.name }}</span>
                </div>
                <div class="read-grp">
                  <span class="r-label">Номер телефона</span>
                  <span class="r-val" v-if="user.phone">{{ user.phone }}</span>
                  <input v-else :value="bookingForm.phone" type="tel" placeholder="+7 (707) 123-45-67" maxlength="18" class="m-input" @input="onPhoneInput" />
                </div>
                <div class="read-grp">
                  <span class="r-label">Адрес доставки</span>
                  <span class="r-val" v-if="user.address">{{ user.address }}</span>
                  <input v-else v-model="bookingForm.address" type="text" placeholder="г. Алматы, пр. Абая, 150" class="m-input" />
                </div>
              </div>
            </template>

            <!-- If User is Guest -->
            <template v-else>
              <div class="input-grp">
                <label>Ваше имя</label>
                <input v-model="bookingForm.name" type="text" placeholder="Анна" class="m-input" />
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
                <input v-model="bookingForm.address" type="text" placeholder="г. Алматы, пр. Абая, 150" class="m-input" />
              </div>
            </template>

            <div class="input-grp" style="margin-top: 14px;">
              <label>Дата начала аренды</label>
              <input v-model="bookingForm.date" type="date" class="m-input" />
            </div>
            
            <div class="input-grp toy-selector-grp">
              <label>
                Выберите игрушки ({{ selectedToys.length }} из {{ maxToysAllowed }})
              </label>
              <div class="toy-selector-grid">
                <div 
                  v-for="toy in availableToys" 
                  :key="toy.id"
                  class="toy-select-card"
                  :class="{ selected: selectedToys.some(t => t.id === toy.id) }"
                  @click="toggleToySelection(toy)"
                >
                  <img :src="toy.image_url && !toy.image_url.includes('placeholder') ? toy.image_url : 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=150&q=80'" :alt="toy.name" />
                  <span>{{ toy.name }}</span>
                </div>
              </div>
            </div>
          </div>

          <button class="submit-rent-btn" :disabled="isSubmitting" @click="submitBooking">
            {{ isSubmitting ? 'Оформление...' : `Перейти к оплате ${formatPrice(selectedPrice)} ₸` }}
          </button>
        </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TheHeader from '~/components/TheHeader.vue'

const isModalOpen = ref(false)
const isSubmitting = ref(false)
const selectedPackage = ref('')
const selectedPrice = ref(0)
const activeRentIndex = ref(1)

const availableToys = ref<any[]>([])
const selectedToys = ref<any[]>([])

const loadToys = async () => {
  try {
    const data = await $fetch<any>('http://localhost:8000/api/toys?per_page=100')
    availableToys.value = data?.data ?? data ?? []
  } catch (e) {
    console.error('Failed to load toys', e)
  }
}
loadToys()

const maxToysAllowed = computed(() => {
  if (selectedPackage.value.includes('Выходные')) return 4
  if (selectedPackage.value.includes('Праздничная неделя')) return 7
  if (selectedPackage.value.includes('Каникулы и Отпуск')) return 10
  return 4
})

const toggleToySelection = (toy: any) => {
  const idx = selectedToys.value.findIndex(t => t.id === toy.id)
  if (idx > -1) {
    selectedToys.value.splice(idx, 1)
  } else {
    if (selectedToys.value.length < maxToysAllowed.value) {
      selectedToys.value.push(toy)
    } else {
      alert(`Максимум можно выбрать ${maxToysAllowed.value} игрушек для этого пакета.`)
    }
  }
}

const scrollToRentCard = (idx: number) => {
  activeRentIndex.value = idx
  const grid = document.querySelector('.rent-packages-grid')
  if (grid) {
    const cards = grid.querySelectorAll('.rent-card')
    if (cards[idx]) {
      cards[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }
}

const bookingForm = ref({
  name: 'Анна',
  phone: '+7 (707) 123-45-67',
  address: 'г. Алматы, пр. Абая, 150',
  date: new Date().toISOString().split('T')[0]
})

const onPhoneInput = (event: Event) => {
  handlePhoneInput(event, (val) => {
    bookingForm.value.phone = val
  })
}

const { user, openAuthModal } = useAuth()

const router = useRouter()

const openRentModal = (pkg: string, price: number) => {
  if (!user.value) {
    openAuthModal('login')
    return
  }
  selectedPackage.value = pkg
  selectedPrice.value = price
  selectedToys.value = []

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
}

const { createRental } = useRentals()

const submitBooking = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true

  try {
    const startDate = bookingForm.value.date
    const durationDays = selectedPackage.value.includes('14 дней') ? 14 : (selectedPackage.value.includes('7 дней') ? 7 : 3)
    const startObj = new Date(startDate)
    const endObj = new Date(startObj)
    endObj.setDate(startObj.getDate() + durationDays - 1)
    const endDate = endObj.toISOString().split('T')[0]
    
    let extraNotes = ''
    if (selectedToys.value.length > 0) {
      const toyNames = selectedToys.value.map(t => t.name).join(', ')
      extraNotes = `\nВыбранные игрушки: ${toyNames}`
    }

    const finalName = user.value ? user.value.name : bookingForm.value.name
    const finalPhone = user.value?.phone ? user.value.phone : bookingForm.value.phone
    const finalAddress = user.value?.address ? user.value.address : bookingForm.value.address

    // Use selected toy if chosen, or first from catalog
    const chosenToyId = selectedToys.value.length > 0 
      ? Number(selectedToys.value[0].id) 
      : (availableToys.value.length > 0 ? Number(availableToys.value[0].id) : 1)

    // Deposit is 20% of the package price
    const packageDeposit = Math.round(selectedPrice.value * 0.20 / 100) * 100

    const res = await createRental({
      toy_id: chosenToyId,
      start_date: startDate,
      end_date: endDate,
      delivery_address: finalAddress || 'г. Алматы, пр. Абая, 150',
      contact_phone: finalPhone,
      total_price: selectedPrice.value,
      deposit_amount: packageDeposit,
      notes: `Пакет: ${selectedPackage.value}, Имя: ${finalName}${extraNotes}`
    })

    if (res?.data) {
      isModalOpen.value = false
      const rentalId = res.data.id || res.data.rental_number
      const totalAmount = selectedPrice.value + packageDeposit
      router.push(`/payment?type=rental&id=${rentalId}&amount=${totalAmount}`)
    }
  } catch (e: any) {
    const errMsg = e?.data?.message || e?.message || 'Не удалось забронировать. Пожалуйста, авторизуйтесь или проверьте даты.'
    alert(errMsg)
  } finally {
    isSubmitting.value = false
  }
}

const formatPrice = (val: number) => {
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
</script>

<style scoped>
.short-rent-page {
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

.rent-hero {
  text-align: center;
  max-width: 760px;
  margin: 0 auto 48px auto;
}

.rent-badge {
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

.rent-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 38px;
  color: #1A1A2E;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

.rent-subtitle {
  font-size: 15.5px;
  color: #7B7B93;
  line-height: 1.6;
}

.rent-packages-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
  margin-bottom: 64px;
}

.rent-card {
  position: relative;
  background: #FFFFFF;
  border-radius: 28px;
  padding: 36px 30px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.rent-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 36px rgba(124, 92, 252, 0.08);
}

.rent-card.featured {
  border: 2px solid #7C5CFC;
  transform: scale(1.02);
}

.top-tag {
  position: absolute;
  top: -13px;
  left: 50%;
  transform: translateX(-50%);
  background: #FFD166;
  color: #1A1A2E;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 11px;
  padding: 4px 16px;
  border-radius: 20px;
}

.rent-duration {
  display: inline-block;
  align-self: flex-start;
  background: #F4F4F8;
  color: #1A1A2E;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 13px;
  padding: 4px 14px;
  border-radius: 12px;
  margin-bottom: 14px;
}

.rent-duration.featured {
  background: #F0EDFF;
  color: #624CE0;
}

.card-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 22px;
  margin-bottom: 8px;
}

.card-desc {
  font-size: 13.5px;
  color: #7B7B93;
  line-height: 1.45;
  margin-bottom: 20px;
  min-height: 40px;
}

.rent-price-box {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 24px;
  padding-bottom: 18px;
  border-bottom: 1px solid #F4F4F8;
}

.price-val {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 30px;
  color: #1A1A2E;
}

.price-val.featured {
  color: #624CE0;
}

.price-note {
  font-size: 13px;
  color: #7B7B93;
}

.card-perks {
  list-style: none;
  padding: 0;
  margin: 0 0 32px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  font-size: 14px;
  color: #4A4A68;
}

.rent-btn {
  width: 100%;
  background: #F4F4F8;
  color: #1A1A2E;
  border: none;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 14.5px;
  padding: 14px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.rent-btn:hover {
  background: #E8E8EE;
}

.rent-btn.featured {
  background: #624CE0;
  color: #FFFFFF;
  box-shadow: 0 6px 20px rgba(98, 76, 224, 0.25);
}

.rent-btn.featured:hover {
  background: #513bc7;
}

/* How works */
.how-rent-works {
  background: #FFFFFF;
  border-radius: 28px;
  padding: 48px;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.section-heading {
  text-align: center;
  font-family: 'Outfit', sans-serif;
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
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #7C5CFC;
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.step-box h4 {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 17px;
  margin-bottom: 6px;
}

.step-box p {
  font-size: 13.5px;
  color: #7B7B93;
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
  background: #FFFFFF;
  width: 100%;
  max-width: 460px;
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
  margin-bottom: 6px;
}

.modal-desc {
  font-size: 14px;
  color: #7B7B93;
  margin-bottom: 20px;
}

.success-state {
  text-align: center;
  padding: 24px 0 12px;
}

.success-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.success-actions {
  margin-top: 32px;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 24px;
}

.auth-readonly-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #F4F4F8;
  padding: 16px;
  border-radius: 12px;
}

.read-grp {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.r-label {
  font-size: 12.5px;
  color: #7B7B93;
  font-weight: 700;
}

.r-val {
  font-size: 15px;
  color: #1A1A2E;
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
  border: 1.5px solid #E2E2EC;
  border-radius: 12px;
  font-size: 14px;
  outline: none;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.2s ease;
}

.submit-rent-btn {
  width: 100%;
  background: #624CE0;
  color: #FFFFFF;
  border: none;
  padding: 14px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
}

.toy-selector-grp {
  margin-top: 4px;
}

.toy-selector-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  max-height: 200px;
  overflow-y: auto;
  padding-right: 4px;
}

.toy-select-card {
  border: 1.5px solid #E2E2EC;
  border-radius: 8px;
  padding: 6px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  user-select: none;
}

.toy-select-card img {
  width: 100%;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.toy-select-card span {
  font-size: 11px;
  line-height: 1.2;
  color: #1A1A2E;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.toy-select-card.selected {
  border-color: #7C5CFC;
  background: #F0EDFF;
}

.toy-selector-grid::-webkit-scrollbar {
  width: 4px;
}

.toy-selector-grid::-webkit-scrollbar-thumb {
  background: #E2E2EC;
  border-radius: 4px;
}

/* Mobile Rent Pills */
.mobile-rent-pills {
  display: none;
}

@media (max-width: 960px) {
  .rent-packages-grid { grid-template-columns: 1fr; }
  .steps-row { grid-template-columns: 1fr; gap: 24px; }
}

@media (max-width: 768px) {
  .container {
    padding: 0 14px;
  }

  .rent-hero {
    margin-bottom: 20px;
    padding-top: 10px;
  }

  .rent-title {
    font-size: 24px;
    line-height: 1.25;
  }

  .rent-subtitle {
    font-size: 13.5px;
    line-height: 1.5;
  }

  .mobile-rent-pills {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 16px;
  }

  .rent-pill-btn {
    flex: 1;
    padding: 8px 10px;
    background: #FFFFFF;
    border: 1.5px solid #E2E2EC;
    border-radius: 50px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12.5px;
    font-weight: 700;
    color: #4A4A68;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .rent-pill-btn.active {
    background: #7C5CFC;
    border-color: #7C5CFC;
    color: #FFFFFF;
    box-shadow: 0 4px 12px rgba(124, 92, 252, 0.25);
  }

  .rent-packages-grid {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-padding: 0 14px;
    gap: 14px;
    padding: 6px 2px 16px;
    margin-bottom: 28px;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }

  .rent-packages-grid::-webkit-scrollbar {
    display: none;
  }

  .rent-card {
    flex: 0 0 88%;
    width: 88%;
    scroll-snap-align: center;
    padding: 22px 18px;
    border-radius: 22px;
  }

  .rent-card.featured {
    transform: none;
  }

  .card-title {
    font-size: 20px;
  }

  .card-desc {
    font-size: 13px;
    min-height: auto;
    margin-bottom: 14px;
  }

  .price-val {
    font-size: 26px;
  }

  .card-perks {
    gap: 10px;
    margin-bottom: 20px;
    font-size: 13px;
  }

  .how-rent-works {
    padding: 22px 16px;
    border-radius: 20px;
  }

  .section-heading {
    font-size: 19px;
    margin-bottom: 18px;
  }

  .steps-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .step-box {
    flex-direction: row;
    align-items: center;
    text-align: left;
    gap: 12px;
    padding: 12px 14px;
    background: #FAF9FF;
    border-radius: 16px;
  }

  .step-icon {
    width: 36px;
    height: 36px;
    font-size: 15px;
    flex-shrink: 0;
    margin-bottom: 0;
  }

  .step-box h4 {
    font-size: 14.5px;
    margin-bottom: 2px;
  }

  .step-box p {
    font-size: 12px;
    line-height: 1.35;
  }
}

/* Individual Rent Catalog Styles */
.rent-catalog-section {
  margin-top: 54px;
}

.catalog-section-header {
  text-align: center;
  margin-bottom: 32px;
}

.section-subtext {
  font-size: 15px;
  color: #7B7B93;
  max-width: 600px;
  margin: 0 auto;
}

.rent-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}

.rent-item-card {
  background: #FFFFFF;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 4px 18px rgba(0,0,0,0.02);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
}

.rent-item-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(124, 92, 252, 0.08);
}

.rent-item-img-box {
  position: relative;
  width: 100%;
  height: 200px;
  background: #F8F8FC;
}

.rent-item-img-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.rent-badge-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(124, 92, 252, 0.9);
  color: #FFFFFF;
  font-size: 11px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 8px;
  backdrop-filter: blur(4px);
}

.rent-item-body {
  padding: 18px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.rent-item-title {
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #1A1A2E;
  margin: 0 0 10px 0;
  line-height: 1.3;
}

.rent-item-price-row {
  margin-top: auto;
  margin-bottom: 14px;
}

.item-daily-rate {
  font-size: 16px;
  font-weight: 800;
  color: #7C5CFC;
}

.item-daily-rate span {
  font-size: 12px;
  color: #7B7B93;
  font-weight: normal;
}

.rent-item-action-btn {
  display: block;
  text-align: center;
  background: #F0EDFF;
  color: #7C5CFC;
  padding: 10px 14px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 13.5px;
  text-decoration: none;
  transition: all 0.2s;
}

.rent-item-action-btn:hover {
  background: #7C5CFC;
  color: #FFFFFF;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
