<template>
  <div class="contact-page">
    <TheHeader />

    <main class="container page-content">
      <!-- Hero Header -->
      <section class="contact-hero">
        <h1 class="contact-title">{{ h1 || 'Мы всегда рядом и рады помочь' }}</h1>
        <p class="contact-subtitle">
          Есть вопросы по выбору набора, доставке или подписке? Свяжитесь с нами любым удобным способом — наш методист и клиентская поддержка ответят в течение нескольких минут.
        </p>
      </section>

      <!-- 4 Quick Contact Cards Grid (Like Kiddos) -->
      <section class="quick-contacts-grid">
        <!-- WhatsApp -->
        <a :href="whatsappUrl" target="_blank" class="contact-feature-card whatsapp">
          <div class="card-icon-circle green">
            <AppIcon name="message" :size="24" />
          </div>
          <h3>WhatsApp</h3>
          <p>Самый быстрый способ связи. Отвечаем за 5–10 минут.</p>
          <span class="card-action-link">Написать в WhatsApp →</span>
        </a>

        <!-- Phone -->
        <a :href="'tel:' + phoneRaw" class="contact-feature-card">
          <div class="card-icon-circle purple">
            <AppIcon name="phone" :size="24" />
          </div>
          <h3>Телефон поддержки</h3>
          <p>{{ phone }}</p>
          <span class="work-time-text">{{ workHours }}</span>
          <span class="card-action-link">Позвонить сейчас →</span>
        </a>


        <!-- Email -->
        <a :href="'mailto:' + email" class="contact-feature-card">
          <div class="card-icon-circle blue">
            <AppIcon name="mail" :size="24" />
          </div>
          <h3>Email для связи</h3>
          <p>{{ email }}</p>
          <span class="work-time-text">Для вопросов и партнерства</span>
          <span class="card-action-link">Написать на почту →</span>
        </a>
      </section>

      <!-- Main 2-Column: Feedback Form & Showroom Location Info -->
      <section class="contact-main-grid">
        <!-- Showroom Location & Info -->
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
                  <strong>Адрес шоурума</strong>
                  <p>{{ address }}</p>
                </div>
              </div>

              <div class="loc-item">
                <AppIcon name="clock" :size="20" class="item-icon" />
                <div>
                  <strong>График работы</strong>
                  <p>{{ workHours }}</p>
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
import { ref, onMounted } from 'vue'

const { h1, seoText } = usePageSeo()
const { phone, phoneRaw, email, address, workHours, whatsappUrl, fetchSettings } = useSiteSettings()

onMounted(() => {
  fetchSettings()
})

</script>

<style scoped>
.contact-page {
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

/* Hero */
.contact-hero {
  text-align: center;
  max-width: 780px;
  margin: 0 auto 44px auto;
}

.contact-badge {
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

.contact-title {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 40px;
  color: #262626;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

.contact-subtitle {
  font-size: 16px;
  color: #6F746F;
  line-height: 1.6;
}

/* Quick Contacts Grid */
.quick-contacts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 56px;
}

.contact-feature-card {
  background: #FAF8F4;
  border-radius: 24px;
  padding: 26px 22px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: #262626;
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

.card-icon-circle.green { background: #D9E0D5; }
.card-icon-circle.purple { background: #D9E0D5; }
.card-icon-circle.yellow { background: #FFF9E6; }
.card-icon-circle.blue { background: #EBF5FF; }

.contact-feature-card h3 {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 17px;
  margin-bottom: 4px;
}

.contact-feature-card p {
  font-size: 13px;
  color: #6F746F;
  line-height: 1.45;
  margin-bottom: 12px;
  flex: 1;
}

.work-time-text {
  font-size: 11.5px;
  color: #9C91C9;
  font-weight: 700;
  margin-bottom: 12px;
}

.card-action-link {
  font-size: 13px;
  font-weight: 700;
  color: var(--green-ink);
  margin-top: auto;
}

/* 2-Column Main Grid */
.contact-main-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 36px;
  align-items: flex-start;
}

.form-card-col {
  background: #FAF8F4;
  border-radius: 28px;
  padding: 36px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.02);
}

.form-heading {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 24px;
  margin-bottom: 4px;
}

.form-subheading {
  font-size: 14px;
  color: #6F746F;
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
  font-family: 'Manrope', sans-serif;
  font-size: 13px;
  font-weight: 800;
  color: #262626;
}

.custom-select, .f-field input, .f-field textarea {
  padding: 12px 16px;
  border: 1.5px solid #E3D7C6;
  border-radius: 14px;
  font-size: 14px;
  font-family: 'Manrope', sans-serif;
  outline: none;
  background: #FAFAFC;
  transition: all 0.2s ease;
}

.custom-select:focus, .f-field input:focus, .f-field textarea:focus {
  border-color: var(--green-ink);
  background: #FAF8F4;
  box-shadow: 0 4px 14px rgba(51, 61, 54, 0.1);
}

.submit-btn {
  background: var(--green-surface);
  color: var(--green-ink);
  border: none;
  font-family: 'Manrope', sans-serif;
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
  background: var(--green-surface-hover);
  color: var(--green-ink);
}

.submit-error {
  color: #AF5353;
  font-size: 13px;
  margin-top: 8px;
}

/* Location Card */
.location-card {
  background: #FAF8F4;
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
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 24px;
  margin-bottom: 8px;
}

.loc-desc {
  font-size: 13.5px;
  color: #6F746F;
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
  color: #262626;
  margin-bottom: 2px;
}

.loc-item p {
  font-size: 13px;
  color: #6F746F;
  line-height: 1.4;
}

.map-placeholder-box {
  background: linear-gradient(135deg, #D9E0D5 0%, #D9E0D5 100%);
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
  font-family: 'Manrope', sans-serif;
  font-size: 15px;
  margin-bottom: 2px;
}

.map-inner p {
  font-size: 12.5px;
  color: #6F746F;
  margin-bottom: 12px;
}

.open-map-link {
  font-size: 13px;
  font-weight: 700;
  color: var(--green-ink);
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
