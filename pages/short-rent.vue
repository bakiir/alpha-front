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
              <div class="input-grp">
                <label>Дата начала аренды</label>
                <input v-model="bookingForm.date" type="date" class="m-input" />
              </div>
            </div>

            <button class="submit-rent-btn" :disabled="isSubmitting" @click="submitBooking">
              {{ isSubmitting ? 'Оформление...' : `Подтвердить бронь на ${formatPrice(selectedPrice)} ₸` }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TheHeader from '~/components/TheHeader.vue'

const isModalOpen = ref(false)
const isSubmitting = ref(false)
const selectedPackage = ref('')
const selectedPrice = ref(0)

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

const openRentModal = (pkg: string, price: number) => {
  selectedPackage.value = pkg
  selectedPrice.value = price
  isModalOpen.value = true
}

const { createRental } = useRentals()

const submitBooking = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true

  try {
    const startDate = bookingForm.value.date
    const endDate = new Date(new Date(startDate).getTime() + 3 * 86400000).toISOString().split('T')[0]
    
    const res = await createRental({
      toy_id: 1,
      start_date: startDate,
      end_date: endDate,
      delivery_address: bookingForm.value.address || 'г. Алматы, пр. Абая, 150',
      contact_phone: bookingForm.value.phone,
      notes: `Пакет: ${selectedPackage.value}, Имя: ${bookingForm.value.name}`
    })

    if (res?.data) {
      alert(`Бронь #${res.data.rental_number} по пакету «${selectedPackage.value}» успешно создана в базе данных! 🛵`)
    } else {
      alert(`Бронь по пакету «${selectedPackage.value}» успешно оформлена!`)
    }
    isModalOpen.value = false
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

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 24px;
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

@media (max-width: 960px) {
  .rent-packages-grid { grid-template-columns: 1fr; }
  .steps-row { grid-template-columns: 1fr; gap: 24px; }
}

@media (max-width: 640px) {
  .rent-title {
    font-size: 28px;
  }

  .rent-card,
  .how-rent-works {
    padding: 22px 18px;
    border-radius: 20px;
  }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
