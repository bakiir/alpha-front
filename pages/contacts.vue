<template>
  <div class="contact-page">
    <TheHeader />

    <main class="container page-content">
      <!-- Hero Header -->
      <section class="contact-hero">
        <h1 class="contact-title">Мы всегда рядом и рады помочь</h1>
        <p class="contact-subtitle">
          Есть вопросы по выбору набора, доставке или подписке? Свяжитесь с нами любым удобным способом — наш методист и клиентская поддержка ответят в течение нескольких минут.
        </p>
      </section>

      <!-- 4 Quick Contact Cards Grid (Like Kiddos) -->
      <section class="quick-contacts-grid">
        <!-- WhatsApp -->
        <a href="https://wa.me/77071234567" target="_blank" class="contact-feature-card whatsapp">
          <div class="card-icon-circle green">
            <AppIcon name="message" :size="24" />
          </div>
          <h3>WhatsApp Чат</h3>
          <p>Самый быстрый способ связи. Отвечаем за 5–10 минут.</p>
          <span class="card-action-link">Написать в WhatsApp →</span>
        </a>

        <!-- Phone -->
        <a href="tel:+77071234567" class="contact-feature-card">
          <div class="card-icon-circle purple">
            <AppIcon name="phone" :size="24" />
          </div>
          <h3>Телефон поддержки</h3>
          <p>+7 (707) 123-45-67</p>
          <span class="work-time-text">Ежедневно: 09:00 – 21:00</span>
          <span class="card-action-link">Позвонить сейчас →</span>
        </a>

        <!-- Methodologist Chat -->
        <NuxtLink to="/support" class="contact-feature-card">
          <div class="card-icon-circle yellow">
            <AppIcon name="book" :size="24" />
          </div>
          <h3>Консультация методиста</h3>
          <p>Помощь в подборе игрушек по возрасту и методике Монтессори.</p>
          <span class="card-action-link">Открыть чат с Алией →</span>
        </NuxtLink>

        <!-- Email -->
        <a href="mailto:hello@alpha-toys.kz" class="contact-feature-card">
          <div class="card-icon-circle blue">
            <AppIcon name="mail" :size="24" />
          </div>
          <h3>Email для связи</h3>
          <p>hello@alpha-toys.kz</p>
          <span class="work-time-text">Для вопросов и партнерства</span>
          <span class="card-action-link">Написать на почту →</span>
        </a>
      </section>

      <!-- Main 2-Column: Feedback Form & Showroom Location Info -->
      <section class="contact-main-grid">
        <!-- LEFT: Feedback Form -->
        <div class="form-card-col">
          <h2 class="form-heading">Отправьте нам сообщение</h2>
          <p class="form-subheading">Заполните короткую форму, и мы свяжемся с вами удобным способом.</p>

          <form @submit.prevent="handleSubmit" class="contact-form">
            <!-- Topic Selector -->
            <div class="f-field">
              <label>Тема обращения</label>
              <select v-model="form.topic" class="custom-select">
                <option value="selection">Подбор набора игрушек для ребенка</option>
                <option value="delivery">Вопрос по доставке и курьеру</option>
                <option value="subscription">Управление подпиской и оплатой</option>
                <option value="exchange">Обмен или выкуп игрушек</option>
                <option value="partnership">Сотрудничество и партнерство</option>
                <option value="other">Другой вопрос</option>
              </select>
            </div>

            <!-- Name + Phone -->
            <div class="f-row-2">
              <div class="f-field flex-1">
                <label>Ваше имя</label>
                <input v-model="form.name" type="text" placeholder="Анна" required />
              </div>
              <div class="f-field flex-1">
                <label>Телефон</label>
                <input 
                  :value="form.phone" 
                  type="tel" 
                  placeholder="+7 (707) 123-45-67" 
                  maxlength="18"
                  required 
                  @input="onPhoneInput"
                />
              </div>
            </div>

            <!-- Email -->
            <div class="f-field">
              <label>Электронная почта</label>
              <input v-model="form.email" type="email" placeholder="name@example.com" />
            </div>

            <!-- Message -->
            <div class="f-field">
              <label>Ваш вопрос или комментарий</label>
              <textarea 
                v-model="form.message" 
                rows="4" 
                placeholder="Здравствуйте! Хочу узнать подробнее о..."
                required
              ></textarea>
            </div>

            <button type="submit" class="submit-btn" :disabled="isSent">
              {{ isSent ? 'Сообщение отправлено ✓' : 'Отправить сообщение' }}
            </button>
            <p v-if="submitError" class="submit-error">{{ submitError }}</p>
          </form>
        </div>

        <!-- RIGHT: Showroom Location & Info -->
        <div class="location-col">
          <div class="location-card">
            <span class="loc-badge">ШОУРУМ И ЦЕНТР ДЕЗИНФЕКЦИИ</span>
            <h3 class="loc-title">Приезжайте к нам в гости</h3>
            <p class="loc-desc">
              В нашем уютном пространстве вы можете лично познакомиться со всеми игрушками Монтессори, увидеть процесс стерилизации и пообщаться с методистом.
            </p>

            <div class="loc-details-list">
              <div class="loc-item">
                <AppIcon name="map-pin" :size="20" class="item-icon" />
                <div>
                  <strong>Адрес в Алматы</strong>
                  <p>пр. Абая, 150 (БЦ «Alatau Plaza», блок В, 3 этаж, офис 312)</p>
                </div>
              </div>

              <div class="loc-item">
                <AppIcon name="clock" :size="20" class="item-icon" />
                <div>
                  <strong>График работы</strong>
                  <p>Понедельник – Воскресенье: с 09:00 до 21:00 (без выходных)</p>
                </div>
              </div>

              <div class="loc-item">
                <AppIcon name="car" :size="20" class="item-icon" />
                <div>
                  <strong>Парковка</strong>
                  <p>Бесплатная гостевая парковка для родителей перед зданием БЦ.</p>
                </div>
              </div>
            </div>

            <div class="map-placeholder-box">
              <div class="map-inner">
                <AppIcon name="map-pin" :size="28" class="map-pin" />
                <strong>г. Алматы, пр. Абая 150</strong>
                <p>Удобный заезд с улицы Манаса</p>
                <a href="https://2gis.kz/almaty" target="_blank" class="open-map-link">Открыть в 2ГИС / Яндекс Картах →</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- TheFooter -->
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const { createTicket } = useSupport()
const { user } = useAuth()

const isSent = ref(false)
const submitError = ref('')

const topicLabels: Record<string, string> = {
  selection: 'Подбор набора игрушек для ребенка',
  delivery: 'Вопрос по доставке и курьеру',
  subscription: 'Управление подпиской и оплатой',
  exchange: 'Обмен или выкуп игрушек',
  partnership: 'Сотрудничество и партнерство',
  other: 'Другой вопрос',
}

const form = ref({
  topic: 'selection',
  name: '',
  phone: '',
  email: '',
  message: ''
})

const onPhoneInput = (event: Event) => {
  handlePhoneInput(event, (val) => {
    form.value.phone = val
  })
}

const handleSubmit = async () => {
  submitError.value = ''
  try {
    await createTicket({
      subject: topicLabels[form.value.topic] || form.value.topic,
      topic: form.value.topic,
      message: form.value.message,
      name: form.value.name,
      phone: form.value.phone,
      email: form.value.email || undefined,
    })
    isSent.value = true
    setTimeout(() => {
      form.value = { topic: 'selection', name: '', phone: '', email: '', message: '' }
      isSent.value = false
    }, 3000)
  } catch (e: any) {
    submitError.value = e?.data?.message || 'Не удалось отправить обращение. Попробуйте позже.'
  }
}
</script>

<style scoped>
.contact-page {
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

/* Hero */
.contact-hero {
  text-align: center;
  max-width: 780px;
  margin: 0 auto 44px auto;
}

.contact-badge {
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

.contact-title {
  font-family: 'Onest', sans-serif;
  font-weight: 800;
  font-size: 40px;
  color: #27312B;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

.contact-subtitle {
  font-size: 16px;
  color: #737B75;
  line-height: 1.6;
}

/* Quick Contacts Grid */
.quick-contacts-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 56px;
}

.contact-feature-card {
  background: #FFFDF8;
  border-radius: 24px;
  padding: 26px 22px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: #27312B;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.contact-feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(51, 61, 54, 0.08);
}

.card-icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin-bottom: 16px;
}

.card-icon-circle.green { background: #E7EFE9; }
.card-icon-circle.purple { background: #E7EFE9; }
.card-icon-circle.yellow { background: #FFF9E6; }
.card-icon-circle.blue { background: #EBF5FF; }

.contact-feature-card h3 {
  font-family: 'Onest', sans-serif;
  font-weight: 800;
  font-size: 17px;
  margin-bottom: 4px;
}

.contact-feature-card p {
  font-size: 13px;
  color: #737B75;
  line-height: 1.45;
  margin-bottom: 12px;
  flex: 1;
}

.work-time-text {
  font-size: 11.5px;
  color: #6F927C;
  font-weight: 700;
  margin-bottom: 12px;
}

.card-action-link {
  font-size: 13px;
  font-weight: 700;
  color: #496B5A;
  margin-top: auto;
}

/* 2-Column Main Grid */
.contact-main-grid {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 36px;
  align-items: flex-start;
}

.form-card-col {
  background: #FFFDF8;
  border-radius: 28px;
  padding: 36px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.02);
}

.form-heading {
  font-family: 'Onest', sans-serif;
  font-weight: 800;
  font-size: 24px;
  margin-bottom: 4px;
}

.form-subheading {
  font-size: 14px;
  color: #737B75;
  margin-bottom: 24px;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.f-row-2 {
  display: flex;
  gap: 14px;
}

.flex-1 { flex: 1; }

.f-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.f-field label {
  font-family: 'Onest', sans-serif;
  font-size: 13px;
  font-weight: 800;
  color: #27312B;
}

.custom-select, .f-field input, .f-field textarea {
  padding: 12px 16px;
  border: 1.5px solid #DED7CB;
  border-radius: 14px;
  font-size: 14px;
  font-family: 'Onest', sans-serif;
  outline: none;
  background: #FAFAFC;
  transition: all 0.2s ease;
}

.custom-select:focus, .f-field input:focus, .f-field textarea:focus {
  border-color: #496B5A;
  background: #FFFDF8;
  box-shadow: 0 4px 14px rgba(51, 61, 54, 0.1);
}

.submit-btn {
  background: #496B5A;
  color: #FFFDF8;
  border: none;
  font-family: 'Onest', sans-serif;
  font-weight: 700;
  font-size: 15px;
  padding: 14px;
  border-radius: 14px;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(51, 61, 54, 0.25);
  transition: all 0.2s ease;
  margin-top: 8px;
}

.submit-btn:hover {
  background: #385446;
}

.submit-error {
  color: #B65D54;
  font-size: 13px;
  margin-top: 8px;
}

/* Location Card */
.location-card {
  background: #FFFDF8;
  border-radius: 28px;
  padding: 36px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
}

.loc-badge {
  display: inline-block;
  align-self: flex-start;
  background: #FFF1C5;
  color: #7A5300;
  font-size: 11px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 12px;
  margin-bottom: 12px;
}

.loc-title {
  font-family: 'Onest', sans-serif;
  font-weight: 800;
  font-size: 24px;
  margin-bottom: 8px;
}

.loc-desc {
  font-size: 13.5px;
  color: #737B75;
  line-height: 1.5;
  margin-bottom: 24px;
}

.loc-details-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.loc-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.loc-item .item-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.loc-item strong {
  display: block;
  font-size: 14px;
  font-weight: 800;
  color: #27312B;
  margin-bottom: 2px;
}

.loc-item p {
  font-size: 13px;
  color: #737B75;
  line-height: 1.4;
}

.map-placeholder-box {
  background: linear-gradient(135deg, #E7EFE9 0%, #E7EFE9 100%);
  border-radius: 20px;
  padding: 24px;
  text-align: center;
  border: 1px solid #ECECF4;
}

.map-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.map-pin {
  font-size: 28px;
  margin-bottom: 6px;
}

.map-inner strong {
  font-family: 'Onest', sans-serif;
  font-size: 15px;
  margin-bottom: 2px;
}

.map-inner p {
  font-size: 12.5px;
  color: #737B75;
  margin-bottom: 12px;
}

.open-map-link {
  font-size: 13px;
  font-weight: 700;
  color: #496B5A;
  text-decoration: underline;
}

@media (max-width: 1024px) {
  .quick-contacts-grid { grid-template-columns: repeat(2, 1fr); }
  .contact-main-grid { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .contact-title {
    font-size: 28px;
  }

  .quick-contacts-grid { 
    grid-template-columns: 1fr; 
  }

  .f-row-2 { 
    flex-direction: column; 
  }

  .form-card-col,
  .location-card {
    padding: 22px 18px;
    border-radius: 20px;
  }
}
</style>
