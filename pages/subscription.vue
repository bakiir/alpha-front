<template>
  <div class="subscription-page">
    <TheHeader />

    <main class="container page-content">
      <!-- Section Header -->
      <section class="sub-header-section">
        <div class="header-left">
          <span class="section-badge">ТАРИФЫ И УСЛОВИЯ</span>
          <h1 class="sub-main-title">Управление подпиской</h1>
          <p class="sub-subtitle">
            Ваш текущий план и все условия подписки.
          </p>

          <!-- Small dot and star decor -->
          <div class="decor-row">
            <span class="purple-dot"></span>
            <span class="yellow-star">★</span>
          </div>
        </div>

        <div class="header-right">
          <!-- Playful Pastel Blobs -->
          <div class="blob-container">
            <div class="blob blob-pink">
              <span class="blob-star">★</span>
            </div>
            <div class="blob blob-yellow"></div>
            <div class="cloud-decor"></div>
          </div>
        </div>
      </section>

      <!-- Main Subscription Grid -->
      <section class="sub-grid-section">
        <!-- LEFT: Active Plan Card -->
        <div class="plan-card">
          <div class="plan-badge-row">
            <span class="active-badge">АКТИВЕН</span>
          </div>

          <h2 class="plan-name">{{ currentPlan.name }}</h2>

          <div class="plan-price-row">
            <span class="plan-price">{{ currentPlan.price }}</span>
            <span class="plan-period">/ месяц</span>
          </div>

          <ul class="plan-features">
            <li v-for="(feat, idx) in currentPlan.features" :key="idx">
              <span class="feat-dot">●</span>
              <span>{{ feat }}</span>
            </li>
          </ul>

          <button class="change-plan-btn" @click="isChangePlanOpen = true">
            Изменить тарифный план
          </button>
        </div>

        <!-- RIGHT: Two Stacked Cards -->
        <div class="right-stack">
          <!-- Next Payment Card -->
          <div class="status-card payment-card">
            <div class="card-text-col">
              <span class="card-small-label">Следующее списание</span>
              <h3 class="card-main-val">{{ nextBillingDate }}</h3>
              <p class="card-sub-info">{{ currentPlan.price }} • продление подписки</p>
            </div>

            <div class="avatars-decor">
              <div class="face-avatar peach-face">
                <span class="face-eye left"></span>
                <span class="face-eye right"></span>
                <span class="face-mouth line"></span>
              </div>
              <div class="face-avatar blue-face">
                <span class="face-eye left"></span>
                <span class="face-eye right"></span>
                <span class="face-mouth smile"></span>
              </div>
            </div>
          </div>

          <!-- Limit Usage Card -->
          <div class="status-card limit-card">
            <span class="card-small-label">Текущая утилизация лимита</span>
            <h3 class="card-main-val">{{ toysInUse }} из {{ toysLimit }} игрушек дома</h3>
            
            <!-- Progress Bar -->
            <div class="progress-track">
              <div 
                class="progress-fill" 
                :style="{ width: `${(toysInUse / toysLimit) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Bottom Pause Banner -->
      <section class="pause-banner-card">
        <div class="pause-content">
          <h2 class="pause-title">Нужна пауза?</h2>
          <p class="pause-subtitle">Можно временно приостановить подписку, если набор пока не нужен.</p>

          <button class="pause-action-link" @click="handlePauseClick">
            {{ isPaused ? 'Возобновить подписку' : 'Приостановить подписку' }}
          </button>
        </div>

        <!-- Banner Right Decor -->
        <div class="pause-decor">
          <span class="pause-star">★</span>
          <div class="decor-blob mint-blob"></div>
          <div class="decor-blob yellow-blob"></div>
          <span class="decor-small-star">★</span>
        </div>
      </section>
    </main>

    <!-- Change Plan Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isChangePlanOpen" class="modal-overlay" @click.self="isChangePlanOpen = false">
          <div class="plan-modal">
            <button class="close-btn" @click="isChangePlanOpen = false">&times;</button>
            <h2 class="modal-title">Выберите тарифный план</h2>
            <p class="modal-desc">Изменения вступят в силу со следующего расчетного периода.</p>

            <div class="plans-select-list">
              <div 
                v-for="plan in availablePlans" 
                :key="plan.id"
                :class="['plan-option-card', { selected: selectedPlanId === plan.id }]"
                @click="selectedPlanId = plan.id"
              >
                <div class="option-header">
                  <h3>{{ plan.name }}</h3>
                  <span class="option-price">{{ plan.price }} <small>/мес</small></span>
                </div>
                <p class="option-count">🧸 {{ plan.count }} развивающих игрушек в наборе</p>
              </div>
            </div>

            <div class="modal-actions">
              <button class="cancel-btn" @click="isChangePlanOpen = false">Отмена</button>
              <button class="confirm-btn" @click="savePlanChange">Сохранить тариф</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TheHeader from '~/components/TheHeader.vue'

interface Plan {
  id: string
  name: string
  price: string
  count: number
  features: string[]
}

const isPaused = ref(false)
const isChangePlanOpen = ref(false)
const selectedPlanId = ref('explorer')

const nextBillingDate = ref('12 сентября, 2026')
const toysInUse = ref(5)
const toysLimit = ref(5)

const availablePlans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '8 900 ₸',
    count: 3,
    features: [
      '3 развивающих эко-игрушки в наборе',
      'Обмен на новые каждые 2 месяца',
      'Индивидуальный подбор по развитию'
    ]
  },
  {
    id: 'explorer',
    name: 'Explorer',
    price: '12 900 ₸',
    count: 5,
    features: [
      '5 развивающих эко-игрушек в наборе',
      'Обмен на новые каждые 2 месяца',
      'Индивидуальный подбор по развитию'
    ]
  },
  {
    id: 'max',
    name: 'Max',
    price: '18 900 ₸',
    count: 8,
    features: [
      '8 развивающих эко-игрушек в наборе',
      'Обмен на новые каждые 2 месяца',
      'Индивидуальный подбор по развитию'
    ]
  }
]

const currentPlan = ref<Plan>(availablePlans[1])

const savePlanChange = () => {
  const chosen = availablePlans.find(p => p.id === selectedPlanId.value)
  if (chosen) {
    currentPlan.value = chosen
    toysLimit.value = chosen.count
    toysInUse.value = chosen.count
  }
  isChangePlanOpen.value = false
}

const handlePauseClick = () => {
  isPaused.value = !isPaused.value
  alert(isPaused.value ? 'Подписка приостановлена. Вы можете возобновить ее в любой момент.' : 'Подписка успешно возобновлена!')
}
</script>

<style scoped>
.subscription-page {
  min-height: 100vh;
  background-color: #FFF8F0;
  color: #1A1A2E;
  font-family: 'DM Sans', sans-serif;
  padding-bottom: 80px;
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

/* Header Section */
.sub-header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  position: relative;
}

.section-badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  color: #7C5CFC;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.sub-main-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 36px;
  color: #1A1A2E;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.sub-subtitle {
  font-size: 15px;
  color: #7B7B93;
  margin-bottom: 12px;
}

.decor-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.purple-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #7C5CFC;
  display: inline-block;
}

.yellow-star {
  color: #FFD166;
  font-size: 14px;
}

/* Header Right Decor Blobs */
.blob-container {
  position: relative;
  width: 140px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.blob {
  position: absolute;
  border-radius: 50%;
}

.blob-pink {
  width: 100px;
  height: 80px;
  background: #FCE7F0;
  top: 0;
  right: 0;
  border-radius: 60% 40% 70% 30% / 50% 60% 40% 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.blob-star {
  color: #FF8A7A;
  font-size: 18px;
  position: absolute;
  top: 14px;
  right: 28px;
}

.blob-yellow {
  width: 44px;
  height: 44px;
  background: #FFF1C5;
  top: -10px;
  right: 15px;
  border-radius: 50%;
  opacity: 0.85;
}

.cloud-decor {
  position: absolute;
  width: 50px;
  height: 28px;
  background: #FFFFFF;
  border-radius: 20px;
  bottom: 0;
  right: 45px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

/* Subscription Grid Section */
.sub-grid-section {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

/* Left Plan Card */
.plan-card {
  background: #FFFFFF;
  border-radius: 24px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  padding: 36px;
  display: flex;
  flex-direction: column;
}

.plan-badge-row {
  margin-bottom: 16px;
}

.active-badge {
  display: inline-block;
  background: #E8FAF4;
  color: #06D6A0;
  font-size: 11.5px;
  font-weight: 800;
  padding: 4px 14px;
  border-radius: 20px;
  letter-spacing: 0.5px;
}

.plan-name {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 32px;
  color: #1A1A2E;
  margin-bottom: 4px;
}

.plan-price-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 24px;
}

.plan-price {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 26px;
  color: #1A1A2E;
}

.plan-period {
  font-size: 14px;
  color: #7B7B93;
}

.plan-features {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 32px;
}

.plan-features li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14.5px;
  color: #1A1A2E;
  font-weight: 500;
}

.feat-dot {
  color: #7C5CFC;
  font-size: 10px;
}

.change-plan-btn {
  align-self: flex-start;
  background: #624CE0;
  color: #FFFFFF;
  border: none;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 14.5px;
  padding: 13px 26px;
  border-radius: 14px;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(98, 76, 224, 0.25);
  transition: all 0.2s ease;
  margin-top: auto;
}

.change-plan-btn:hover {
  background: #513bc7;
  transform: translateY(-1px);
}

/* Right Stacked Cards */
.right-stack {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.status-card {
  border-radius: 24px;
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.payment-card {
  background: #FFF3EB;
  border: 1px solid rgba(255, 180, 140, 0.2);
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  min-height: 140px;
}

.card-text-col {
  display: flex;
  flex-direction: column;
}

.card-small-label {
  font-size: 13px;
  color: #7B7B93;
  font-weight: 600;
  margin-bottom: 6px;
}

.card-main-val {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 24px;
  color: #1A1A2E;
  margin-bottom: 4px;
}

.card-sub-info {
  font-size: 13.5px;
  color: #7B7B93;
}

/* Avatars in payment card */
.avatars-decor {
  display: flex;
  align-items: center;
}

.face-avatar {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.peach-face {
  background: #FEE0CE;
  z-index: 2;
}

.blue-face {
  background: #DCF0FF;
  margin-left: -14px;
  z-index: 1;
  width: 44px;
  height: 44px;
  border-radius: 14px;
}

.face-eye {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #7C5CFC;
  top: 18px;
}

.face-eye.left { left: 16px; }
.face-eye.right { right: 16px; }

.blue-face .face-eye {
  background: #FF6B6B;
  top: 15px;
}
.blue-face .face-eye.left { left: 13px; }
.blue-face .face-eye.right { right: 13px; }

.face-mouth.line {
  position: absolute;
  width: 14px;
  height: 3px;
  background: #7C5CFC;
  border-radius: 2px;
  bottom: 16px;
}

.face-mouth.smile {
  position: absolute;
  width: 10px;
  height: 3px;
  background: #FF6B6B;
  border-radius: 2px;
  bottom: 14px;
}

/* Limit Card */
.limit-card {
  background: #F0EDFF;
  border: 1px solid rgba(124, 92, 252, 0.15);
  min-height: 140px;
}

.progress-track {
  width: 100%;
  height: 10px;
  background: rgba(124, 92, 252, 0.15);
  border-radius: 10px;
  margin-top: 16px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #624CE0;
  border-radius: 10px;
  transition: width 0.4s ease;
}

/* Pause Banner Card */
.pause-banner-card {
  position: relative;
  background: #FFFFFF;
  border-radius: 24px;
  padding: 36px 44px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
}

.pause-content {
  max-width: 620px;
  z-index: 2;
}

.pause-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 22px;
  color: #1A1A2E;
  margin-bottom: 6px;
}

.pause-subtitle {
  font-size: 14.5px;
  color: #7B7B93;
  margin-bottom: 20px;
}

.pause-action-link {
  background: transparent;
  border: none;
  color: #E63946;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 14.5px;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.2s;
}

.pause-action-link:hover {
  opacity: 0.8;
  text-decoration: underline;
}

/* Pause Right Decor */
.pause-decor {
  position: relative;
  width: 140px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pause-star {
  color: #7C5CFC;
  font-size: 26px;
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 2;
}

.mint-blob {
  position: absolute;
  width: 80px;
  height: 45px;
  background: #D9F7EC;
  border-radius: 50%;
  bottom: 0;
  right: 20px;
  opacity: 0.8;
}

.yellow-blob {
  position: absolute;
  width: 32px;
  height: 32px;
  background: #FFE8A3;
  border-radius: 50%;
  bottom: -4px;
  right: 4px;
  opacity: 0.85;
}

.decor-small-star {
  position: absolute;
  color: #B4EDDB;
  font-size: 16px;
  bottom: -6px;
  right: -15px;
}

/* Plan Modal */
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

.plan-modal {
  position: relative;
  background: #FFFFFF;
  width: 100%;
  max-width: 520px;
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
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 6px;
}

.modal-desc {
  font-size: 14px;
  color: #7B7B93;
  margin-bottom: 20px;
}

.plans-select-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.plan-option-card {
  border: 2px solid #EAEAF2;
  border-radius: 16px;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.plan-option-card.selected {
  border-color: #7C5CFC;
  background: rgba(124, 92, 252, 0.05);
}

.option-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.option-header h3 {
  font-size: 18px;
  font-weight: 800;
}

.option-price {
  font-size: 17px;
  font-weight: 800;
  color: #7C5CFC;
}

.option-count {
  font-size: 13px;
  color: #7B7B93;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  background: #F4F4F8;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

.confirm-btn {
  background: #7C5CFC;
  color: #FFFFFF;
  border: none;
  padding: 10px 22px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

/* Responsive */
@media (max-width: 960px) {
  .sub-grid-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .pause-banner-card {
    padding: 24px;
  }

  .pause-decor {
    display: none;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
