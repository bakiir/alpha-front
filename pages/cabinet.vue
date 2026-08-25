<template>
  <div class="cabinet-page">
    <!-- Cabinet Top Bar -->
    <header class="cabinet-header">
      <div class="container header-container">
        <NuxtLink to="/" class="brand-link">
          <span class="brand-icon">🧸</span>
          <span class="brand-name">Alpha</span>
          <span class="brand-badge">Личный кабинет</span>
        </NuxtLink>

        <div class="user-menu" v-if="user">
          <div class="user-info">
            <span class="user-name">{{ user.name }}</span>
            <span class="user-email">{{ user.phone || user.email }}</span>
          </div>
          <button @click="logout" class="logout-btn" title="Выйти из аккаунта">
            🚪 Выйти
          </button>
        </div>
      </div>
    </header>

    <!-- Main Container -->
    <main class="container cabinet-main">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-box">
        <div class="spinner-purple"></div>
        <p>Загрузка данных личного кабинета...</p>
      </div>

      <!-- Unauthorized warning -->
      <div v-else-if="!user" class="unauth-card">
        <h2>👋 Пожалуйста, войдите в систему</h2>
        <p>Чтобы увидеть ваши активные наборы и статус доставки, войдите в свой аккаунт родителя.</p>
        <button class="primary-btn" @click="openAuthModal('login')">Войти в аккаунт</button>
      </div>

      <!-- Dashboard Content -->
      <div v-else class="cabinet-grid">
        <!-- LEFT COLUMN: Subscriptions & Current Kit -->
        <div class="left-col">
          <!-- Active Subscription Card -->
          <div v-if="activeSubscription" class="card sub-status-card">
            <div class="card-header">
              <div>
                <span class="sub-pill" :class="activeSubscription.status">
                  ● {{ formatStatus(activeSubscription.status) }}
                </span>
                <h1 class="sub-title">Подписка для {{ activeSubscription.child?.name || 'малыша' }}</h1>
              </div>

              <div class="sub-actions">
                <button 
                  v-if="activeSubscription.status === 'active'" 
                  class="action-btn pause" 
                  @click="togglePause(activeSubscription)"
                >
                  ⏸ Поставить на паузу
                </button>
                <button 
                  v-else-if="activeSubscription.status === 'paused'" 
                  class="action-btn resume" 
                  @click="togglePause(activeSubscription)"
                >
                  ▶ Возобновить
                </button>
              </div>
            </div>

            <!-- Delivery Tracker -->
            <div class="delivery-tracker">
              <div class="tracker-item active">
                <div class="step-circle">1</div>
                <div class="step-text">
                  <strong>Сборка набора</strong>
                  <span>Стерилизация & комплектация</span>
                </div>
              </div>
              <div class="tracker-line" :class="{ filled: activeSubscription.current_set?.status !== 'assembling' }"></div>
              <div class="tracker-item" :class="{ active: ['delivering', 'in_use'].includes(activeSubscription.current_set?.status) }">
                <div class="step-circle">2</div>
                <div class="step-text">
                  <strong>Доставка</strong>
                  <span>Курьер в пути</span>
                </div>
              </div>
              <div class="tracker-line" :class="{ filled: activeSubscription.current_set?.status === 'in_use' }"></div>
              <div class="tracker-item" :class="{ active: activeSubscription.current_set?.status === 'in_use' }">
                <div class="step-circle">3</div>
                <div class="step-text">
                  <strong>У малыша</strong>
                  <span>Развивающие игры</span>
                </div>
              </div>
            </div>

            <!-- Delivery dates info -->
            <div class="dates-banner">
              <div class="date-item">
                <span class="date-label">📅 Плановый обмен набора:</span>
                <strong class="date-val">{{ formatDate(activeSubscription.next_delivery_date) }}</strong>
              </div>
              <button class="exchange-btn" @click="requestExchange">
                🔄 Запросить обмен раньше
              </button>
            </div>
          </div>

          <!-- Empty Subscription state -->
          <div v-else class="card empty-sub-card">
            <h3>У вас пока нет активной подписки 📦</h3>
            <p>Пройдите 2-минутный квиз, и мы подберем идеальный развивающий набор для вашего малыша!</p>
            <button class="primary-btn" @click="openQuiz()">Подобрать первый набор →</button>
          </div>

          <!-- CURRENT KIT TOYS -->
          <div v-if="activeSubscription?.current_set?.toys?.length" class="card kit-toys-card">
            <div class="card-header">
              <h2 class="section-title">Игрушки в текущем наборе ({{ activeSubscription.current_set.toys.length }} шт)</h2>
            </div>

            <div class="toys-grid">
              <div v-for="toy in activeSubscription.current_set.toys" :key="toy.id" class="toy-card">
                <img :src="toy.image_url" :alt="toy.name" class="toy-photo" />
                <div class="toy-info">
                  <span class="age-badge">{{ toy.min_age_months }}–{{ toy.max_age_months }} мес</span>
                  <h3 class="toy-title">{{ toy.name }}</h3>
                  <p class="toy-desc">{{ toy.description }}</p>

                  <div class="skills-tags" v-if="toy.development_areas">
                    <span v-for="area in toy.development_areas" :key="area" class="skill-tag">
                      ✦ {{ area }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: Children & Parent Profile -->
        <div class="right-col">
          <!-- Child Profile Card -->
          <div class="card profile-card">
            <h3 class="card-title">👶 Профили детей</h3>
            
            <div class="children-list" v-if="children.length">
              <div v-for="child in children" :key="child.id" class="child-item">
                <div class="child-avatar">🧸</div>
                <div class="child-details">
                  <strong>{{ child.name }}</strong>
                  <span>{{ child.age_in_months }} месяцев (рожд. {{ child.birth_date }})</span>
                </div>
              </div>
            </div>
            <p v-else class="text-muted">Дети пока не добавлены</p>

            <button class="secondary-btn btn-block mt-3" @click="openQuiz()">
              + Добавить ещё ребёнка
            </button>
          </div>

          <!-- Delivery Address & Parent Details -->
          <div class="card profile-card">
            <h3 class="card-title">📍 Адрес и контакты</h3>
            <div class="profile-info-list">
              <div class="info-row">
                <span class="info-label">Имя:</span>
                <span class="info-val">{{ user.name }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Телефон:</span>
                <span class="info-val">{{ user.phone || 'Не указан' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-val">{{ user.email }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Адрес доставки:</span>
                <span class="info-val">{{ user.address || 'Адрес уточняется при заказе' }}</span>
              </div>
            </div>
          </div>

          <!-- Support Card -->
          <div class="card support-card">
            <span class="support-icon">💬</span>
            <h4>Нужна помощь методиста?</h4>
            <p>Наши специалисты ответят на любые вопросы по развитию вашего малыша.</p>
            <a href="https://wa.me/77011234567" target="_blank" class="whatsapp-btn">
              Написать в WhatsApp
            </a>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

const { user, openAuthModal, logout, fetchUser } = useAuth()
const { openQuiz } = useQuiz()
const { request } = useApi()

const isLoading = ref<boolean>(true)
const subscriptions = ref<any[]>([])
const children = ref<any[]>([])

const activeSubscription = computed(() => {
  return subscriptions.value.find(s => ['active', 'paused'].includes(s.status)) || subscriptions.value[0] || null
})

const loadCabinetData = async () => {
  isLoading.value = true
  try {
    const [userRes, subsRes, childrenRes] = await Promise.all([
      fetchUser(),
      request<any>('/subscriptions').catch(() => ({ data: [] })),
      request<any>('/children').catch(() => ({ data: [] })),
    ])

    subscriptions.value = subsRes.data || []
    children.value = childrenRes.data || []
  } catch (err) {
    console.error('Error loading cabinet data', err)
  } finally {
    isLoading.value = false
  }
}

const togglePause = async (sub: any) => {
  const isCurrentlyActive = sub.status === 'active'
  const endpoint = `/subscriptions/${sub.id}/${isCurrentlyActive ? 'pause' : 'resume'}`

  try {
    await request(endpoint, { method: 'POST' })
    sub.status = isCurrentlyActive ? 'paused' : 'active'
  } catch (err) {
    alert('Не удалось изменить статус подписки')
  }
}

const requestExchange = () => {
  alert('Запрос на досрочный обмен принят! Наш оператор свяжется с вами для согласования удобного времени доставки нового набора.')
}

const formatStatus = (status: string) => {
  switch (status) {
    case 'active': return 'Активна'
    case 'paused': return 'На паузе'
    case 'cancelled': return 'Отменена'
    default: return status
  }
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return 'По графику (через 60 дней)'
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

onMounted(() => {
  loadCabinetData()
})
</script>

<style scoped>
.cabinet-page {
  min-height: 100vh;
  background: #FFF8F0;
  color: #1A1A2E;
  font-family: 'DM Sans', sans-serif;
}

.container {
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Header */
.cabinet-header {
  background: #FFFFFF;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding: 16px 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.brand-icon {
  font-size: 26px;
}

.brand-name {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 22px;
  color: #1A1A2E;
}

.brand-badge {
  background: rgba(124, 92, 252, 0.1);
  color: #7C5CFC;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.user-name {
  font-weight: 700;
  font-size: 15px;
  color: #1A1A2E;
}

.user-email {
  font-size: 13px;
  color: #7B7B93;
}

.logout-btn {
  background: #F4F4F8;
  border: none;
  padding: 8px 14px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 13px;
  color: #4A4A68;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: #FFE8EC;
  color: #E63946;
}

/* Main Layout */
.cabinet-main {
  padding: 40px 24px 80px 24px;
}

.loading-box {
  text-align: center;
  padding: 80px;
  color: #7B7B93;
}

.unauth-card {
  text-align: center;
  background: #FFFFFF;
  padding: 60px 40px;
  border-radius: 24px;
  max-width: 500px;
  margin: 40px auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.unauth-card h2 {
  font-family: 'Outfit', sans-serif;
  font-size: 26px;
  font-weight: 800;
  margin-bottom: 12px;
}

.unauth-card p {
  color: #7B7B93;
  margin-bottom: 24px;
}

.cabinet-grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 32px;
}

/* Cards */
.card {
  background: #FFFFFF;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.04);
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.sub-pill {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 12px;
  margin-bottom: 8px;
}

.sub-pill.active {
  background: #E6FBF5;
  color: #06D6A0;
}

.sub-pill.paused {
  background: #FFF4E5;
  color: #FFB703;
}

.sub-title {
  font-family: 'Outfit', sans-serif;
  font-size: 26px;
  font-weight: 800;
  color: #1A1A2E;
  margin: 0;
}

.action-btn {
  padding: 8px 16px;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.pause {
  background: #F4F4F8;
  color: #4A4A68;
}

.action-btn.pause:hover {
  background: #EAEAF2;
}

.action-btn.resume {
  background: #7C5CFC;
  color: #FFFFFF;
}

/* Delivery Tracker */
.delivery-tracker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #FAFAFC;
  padding: 24px;
  border-radius: 18px;
  margin-bottom: 24px;
}

.tracker-item {
  display: flex;
  align-items: center;
  gap: 12px;
  opacity: 0.45;
}

.tracker-item.active {
  opacity: 1;
}

.step-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #E2E2EC;
  color: #1A1A2E;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tracker-item.active .step-circle {
  background: #7C5CFC;
  color: #FFFFFF;
  box-shadow: 0 4px 12px rgba(124, 92, 252, 0.3);
}

.step-text strong {
  display: block;
  font-size: 14px;
  color: #1A1A2E;
}

.step-text span {
  font-size: 12px;
  color: #7B7B93;
}

.tracker-line {
  flex: 1;
  height: 3px;
  background: #E2E2EC;
  margin: 0 16px;
}

.tracker-line.filled {
  background: #7C5CFC;
}

.dates-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #F5F3FF;
  border-radius: 16px;
  border: 1px solid rgba(124, 92, 252, 0.15);
}

.date-label {
  font-size: 13px;
  color: #7B7B93;
  display: block;
}

.date-val {
  font-size: 16px;
  color: #1A1A2E;
}

.exchange-btn {
  background: #FFFFFF;
  border: 1.5px solid #7C5CFC;
  color: #7C5CFC;
  padding: 8px 16px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.exchange-btn:hover {
  background: #7C5CFC;
  color: #FFFFFF;
}

/* Toys Grid */
.section-title {
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 800;
  color: #1A1A2E;
}

.toys-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.toy-card {
  background: #FAFAFC;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid #ECECF4;
  display: flex;
  flex-direction: column;
}

.toy-photo {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.toy-info {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.age-badge {
  align-self: flex-start;
  background: rgba(124, 92, 252, 0.1);
  color: #7C5CFC;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
}

.toy-title {
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 800;
  color: #1A1A2E;
  margin: 0;
}

.toy-desc {
  font-size: 13px;
  color: #7B7B93;
  line-height: 1.4;
  flex: 1;
}

.skills-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.skill-tag {
  background: #FFFFFF;
  border: 1px solid #E2E2EC;
  color: #4A4A68;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 6px;
}

/* Right Column Profiles */
.profile-card h3 {
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 16px;
}

.children-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.child-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #FAFAFC;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid #ECECF4;
}

.child-avatar {
  font-size: 24px;
  width: 42px;
  height: 42px;
  background: #FFFFFF;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.child-details strong {
  display: block;
  font-size: 14px;
  color: #1A1A2E;
}

.child-details span {
  font-size: 12px;
  color: #7B7B93;
}

.profile-info-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  border-bottom: 1px solid #F4F4F8;
  padding-bottom: 8px;
}

.info-label {
  color: #7B7B93;
}

.info-val {
  font-weight: 700;
  color: #1A1A2E;
  text-align: right;
}

.support-card {
  background: linear-gradient(135deg, #1A1A2E, #2B2B4A);
  color: #FFFFFF;
  text-align: center;
}

.support-icon {
  font-size: 32px;
  margin-bottom: 8px;
  display: block;
}

.support-card h4 {
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 6px;
}

.support-card p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 16px;
}

.whatsapp-btn {
  display: block;
  background: #25D366;
  color: #FFFFFF;
  font-weight: 700;
  padding: 12px;
  border-radius: 12px;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s ease;
}

.whatsapp-btn:hover {
  background: #20b859;
}

.primary-btn {
  background: #7C5CFC;
  color: #FFFFFF;
  border: none;
  font-weight: 700;
  font-size: 15px;
  padding: 14px 28px;
  border-radius: 14px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(124, 92, 252, 0.35);
  transition: all 0.2s ease;
}

.primary-btn:hover {
  background: #6848e0;
}

.secondary-btn {
  background: #F4F4F8;
  color: #4A4A68;
  border: none;
  font-weight: 700;
  font-size: 14px;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
}

.secondary-btn:hover {
  background: #EAEAF2;
}

.btn-block {
  width: 100%;
}

.mt-3 {
  margin-top: 12px;
}

.spinner-purple {
  display: inline-block;
  width: 32px;
  height: 32px;
  border: 3px solid rgba(124, 92, 252, 0.2);
  border-top-color: #7C5CFC;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 992px) {
  .cabinet-grid { grid-template-columns: 1fr; }
  .toys-grid { grid-template-columns: 1fr; }
}
</style>
