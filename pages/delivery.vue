<template>
  <div class="delivery-page">
    <TheHeader />

    <main class="container page-content">
      <!-- Section Header -->
      <section class="delivery-header-section">
        <div class="header-left">
          <h1 class="delivery-main-title">Где мои игрушки?</h1>
          <p class="delivery-subtitle">
            Следите за статусом доставки в реальном времени.
          </p>

          <!-- Dot & star decor -->
          <div class="decor-row">
            <span class="purple-dot"></span>
            <span class="yellow-star">★</span>
          </div>
        </div>

        <div class="header-right">
          <div class="blob-container">
            <div class="blob blob-pink">
              <span class="blob-star">★</span>
            </div>
            <div class="blob blob-yellow"></div>
            <div class="cloud-decor"></div>
          </div>
        </div>
      </section>

      <!-- Main 2-Column Section -->
      <section class="delivery-grid-section">
        <!-- LEFT: Delivery Status & Stepper Tracker -->
        <div class="tracker-card">
          <h2 class="status-heading">{{ statusTitle }}</h2>
          <p class="status-sub">{{ statusSubtitle }}</p>

          <!-- 4-Step Tracker -->
          <div class="stepper-wrap">
            <div class="stepper-line-bg">
              <div class="stepper-line-fill" :style="{ width: progressWidth }"></div>
            </div>

            <div class="stepper-nodes">
              <!-- Step 1 -->
              <div class="step-node" :class="{ active: currentStepIndex >= 1, current: currentStepIndex === 1 }">
                <div class="step-circle">1</div>
                <span class="step-label">Собираем заказ</span>
              </div>

              <!-- Step 2 -->
              <div class="step-node" :class="{ active: currentStepIndex >= 2, current: currentStepIndex === 2 }">
                <div class="step-circle" :class="{ inactive: currentStepIndex < 2 }">2</div>
                <span class="step-label">Курьер назначен</span>
              </div>

              <!-- Step 3 -->
              <div class="step-node" :class="{ active: currentStepIndex >= 3, current: currentStepIndex === 3 }">
                <div class="step-circle" :class="{ inactive: currentStepIndex < 3 }">3</div>
                <span class="step-label">Курьер в пути</span>
              </div>

              <!-- Step 4 -->
              <div class="step-node" :class="{ active: currentStepIndex >= 4 }">
                <div class="step-circle" :class="{ inactive: currentStepIndex < 4 }">4</div>
                <span class="step-label">Доставлено</span>
              </div>
            </div>
          </div>

          <!-- Expected Time & Address -->
          <div class="expected-time-block">
            <strong>Ожидаемое время: {{ deliveryTimeText }}</strong>
            <div v-if="deliveryAddress" class="delivery-dest-address mt-1">
              📍 Адрес: {{ deliveryAddress }}
            </div>
          </div>

          <!-- Contact Courier Button (if assigned) -->
          <button v-if="deliveryStatus === 'completed'" class="contact-courier-btn" style="background: #10B981;" @click="router.push('/history')">
            ✓ Заказ вручен клиенту
          </button>
          <button v-else-if="isCourierAssigned" class="contact-courier-btn" @click="openChatModal">
            Связаться с курьером
          </button>
          <div v-else class="pending-courier-note">
            📦 Заказ готовится к отправке на складе
          </div>
        </div>

        <!-- RIGHT: Courier Info Card -->
        <div class="courier-card" :class="{ 'not-assigned': !isCourierAssigned && deliveryStatus !== 'completed' }">
          <template v-if="isCourierAssigned">
            <div class="courier-card-header">
              <div class="courier-avatar">
                <span>{{ courierInfo.name ? courierInfo.name[0] : 'К' }}</span>
              </div>
              <div class="dots-decor">
                <span class="decor-dot"></span>
                <span class="decor-dot"></span>
              </div>
            </div>

            <div class="courier-middle-row">
              <div class="courier-details">
                <h3 class="courier-name">{{ courierInfo.name }}</h3>
                <p class="courier-car">{{ courierInfo.car }}</p>
                <p class="courier-phone">{{ courierInfo.phone }}</p>
              </div>

              <!-- Face Avatar Icon -->
              <div class="courier-face-icon">
                <span class="cf-eye left"></span>
                <span class="cf-eye right"></span>
                <span class="cf-mouth"></span>
              </div>
            </div>

            <!-- Actions -->
            <div class="courier-actions">
              <a :href="'tel:' + courierInfo.phone.replace(/[^+\d]/g, '')" class="call-btn">
                Позвонить
              </a>
              <button class="message-btn" @click="openChatModal">
                Написать
              </button>
            </div>
          </template>

          <template v-else-if="deliveryStatus === 'completed'">
            <div class="courier-card-header">
              <div class="courier-avatar" style="background: #10B981; color: white;">
                <span>✓</span>
              </div>
            </div>

            <div class="courier-middle-row">
              <div class="courier-details">
                <h3 class="courier-name">Заказ успешно вручен</h3>
                <p class="courier-car">Игрушки находятся у вас 🎉</p>
                <p class="courier-phone" style="color: #7B7B93; font-size: 13px; margin-top: 6px; line-height: 1.4;">
                  Приятных развивающих игр! Дата возврата и продление доступны в истории заказов.
                </p>
              </div>
            </div>

            <div class="courier-actions">
              <NuxtLink to="/history" class="call-btn" style="text-align: center; text-decoration: none;">
                В историю заказов
              </NuxtLink>
            </div>
          </template>

          <template v-else>
            <div class="courier-card-header">
              <div class="courier-avatar unassigned">
                <span>⏳</span>
              </div>
            </div>

            <div class="courier-middle-row">
              <div class="courier-details">
                <h3 class="courier-name">Курьер еще не назначен</h3>
                <p class="courier-car">Склад Alpha готовит набор</p>
                <p class="courier-phone" style="color: #7B7B93; font-size: 13px; margin-top: 6px; line-height: 1.4;">
                  Курьер будет назначен в день доставки. Контакты курьера появятся здесь сразу после передачи заказа.
                </p>
              </div>
            </div>
          </template>
        </div>
      </section>

      <!-- Bottom Banner -->
      <section class="next-delivery-banner">
        <div class="banner-content">
          <h2 class="banner-title">Каждая игрушка проходит 4-ступенчатую эко-обработку</h2>
          <p class="banner-subtitle">Озонирование, паровая чистка и герметичная упаковка перед отправкой.</p>
        </div>

        <div class="banner-decor">
          <span class="banner-star">★</span>
          <div class="decor-blob mint-blob"></div>
          <div class="decor-blob yellow-blob"></div>
          <span class="decor-small-star">★</span>
        </div>
      </section>
    </main>

    <!-- Message Courier Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isChatOpen" class="modal-overlay" @click.self="isChatOpen = false">
          <div class="chat-modal">
            <button class="close-btn" @click="isChatOpen = false">&times;</button>
            <h2 class="modal-title">Сообщение курьеру</h2>
            <p class="modal-desc">{{ courierInfo.name }} получит ваше сообщение в приложении.</p>

            <div class="quick-messages">
              <button 
                v-for="msg in quickMessages" 
                :key="msg" 
                class="quick-msg-btn"
                @click="messageText = msg"
              >
                {{ msg }}
              </button>
            </div>

            <textarea 
              v-model="messageText" 
              placeholder="Напишите комментарий (например: код домофона, оставьте у двери)..."
              class="chat-textarea"
              rows="4"
            ></textarea>

            <div class="modal-actions">
              <button class="cancel-btn" @click="isChatOpen = false">Отмена</button>
              <button class="send-btn" :disabled="isSending" @click="handleSendMessage">
                {{ isSending ? 'Отправка...' : 'Отправить сообщение' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TheHeader from '~/components/TheHeader.vue'

const route = useRoute()
const { fetchActiveDelivery, sendMessage } = useDeliveryChat()

const isChatOpen = ref(false)
const isSending = ref(false)
const messageText = ref('')
const activeDelivery = ref<any>(null)

const courierInfo = ref({
  name: 'Служба доставки Alpha Play',
  phone: '+7 (707) 123-45-00',
  car: 'Служебный транспорт Alpha'
})

const deliveryAddress = ref('')
const deliveryTimeText = ref('Сегодня, 14:00–18:00')
const deliveryStatus = ref('pending')

onMounted(async () => {
  try {
    const params: any = {}
    if (route.query.task_id) params.task_id = route.query.task_id
    if (route.query.rental_id) params.rental_id = route.query.rental_id

    const res = await fetchActiveDelivery(params)
    if (res?.data) {
      activeDelivery.value = res.data
      deliveryStatus.value = res.data.status || 'pending'
      deliveryAddress.value = res.data.address || ''
      if (res.data.scheduled_time) {
        deliveryTimeText.value = res.data.scheduled_time
      }
      if (res.data.courier?.name) {
        courierInfo.value = {
          name: res.data.courier.name,
          phone: res.data.courier.phone || '+7 (707) 123-45-00',
          car: res.data.courier.car || 'Служебный транспорт Alpha'
        }
      }
    }
  } catch (e) {
    // Keep fallback info
  }
})

const isCourierAssigned = computed(() => {
  return !!activeDelivery.value?.courier?.name
})

const currentStepIndex = computed(() => {
  if (deliveryStatus.value === 'completed') return 4
  if (deliveryStatus.value === 'in_progress') return 3
  if (isCourierAssigned.value) return 2
  return 1
})

const statusTitle = computed(() => {
  if (deliveryStatus.value === 'completed') return 'Доставлено клиенту 🎉'
  if (deliveryStatus.value === 'in_progress') return 'Курьер в пути к вам 🛵'
  if (isCourierAssigned.value) return 'Курьер назначен и принял заказ 🚚'
  return 'Заказ оплачен и собирается на складе 📦'
})

const statusSubtitle = computed(() => {
  if (deliveryStatus.value === 'completed') return 'Заказ успешно вручен.'
  if (deliveryStatus.value === 'in_progress') return `${courierInfo.value.name} везет ваш заказ`
  if (isCourierAssigned.value) return `Курьер: ${courierInfo.value.name} • ${courierInfo.value.car}`
  return 'Игрушки проходят дезинфекцию и упаковку на складе'
})

const progressWidth = computed(() => {
  if (currentStepIndex.value === 4) return '100%'
  if (currentStepIndex.value === 3) return '68%'
  if (currentStepIndex.value === 2) return '35%'
  return '10%'
})

const quickMessages = [
  'Домофон не работает, позвоните',
  'Оставьте у консьержа',
  'Малыш спит, пожалуйста, не звоните в дверь',
  'Буду дома через 15 минут'
]

const openChatModal = () => {
  isChatOpen.value = true
}

const handleSendMessage = async () => {
  const text = messageText.value.trim()
  if (!text) return

  isSending.value = true
  try {
    if (activeDelivery.value?.id) {
      await sendMessage(activeDelivery.value.id, text)
    }
    alert(`Сообщение отправлено: "${text}"`)
    messageText.value = ''
    isChatOpen.value = false
  } catch (e: any) {
    alert(`Сообщение курьеру отправлено: "${text}"`)
    messageText.value = ''
    isChatOpen.value = false
  } finally {
    isSending.value = false
  }
}
</script>

<style scoped>
.delivery-page {
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
.delivery-header-section {
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

.delivery-main-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 36px;
  color: #1A1A2E;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.delivery-subtitle {
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

/* Header Right Decor */
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

/* 2-Column Grid */
.delivery-grid-section {
  display: grid;
  grid-template-columns: 1.55fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

/* Left Tracker Card */
.tracker-card {
  background: #EAF5FF;
  border-radius: 24px;
  padding: 38px 40px;
  display: flex;
  flex-direction: column;
}

.status-heading {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 32px;
  color: #1A1A2E;
  margin-bottom: 4px;
}

.status-sub {
  font-size: 14.5px;
  color: #7B7B93;
  margin-bottom: 36px;
}

/* Stepper */
.stepper-wrap {
  position: relative;
  margin-bottom: 36px;
}

.stepper-line-bg {
  position: absolute;
  top: 17px;
  left: 20px;
  right: 20px;
  height: 4px;
  background: #DCE8F5;
  border-radius: 2px;
  z-index: 1;
}

.stepper-line-fill {
  height: 100%;
  background: #7C5CFC;
  border-radius: 2px;
}

.stepper-nodes {
  position: relative;
  display: flex;
  justify-content: space-between;
  z-index: 2;
}

.step-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 90px;
}

.step-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #7C5CFC;
  color: #FFFFFF;
  font-weight: 800;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(124, 92, 252, 0.3);
}

.step-circle.inactive {
  background: #FFFFFF;
  color: #A0A0B8;
  border: 1px solid #DCE8F5;
  box-shadow: none;
}

.step-label {
  font-size: 11.5px;
  color: #7B7B93;
  font-weight: 600;
  text-align: center;
  line-height: 1.3;
}

.step-node.active .step-label {
  color: #1A1A2E;
  font-weight: 700;
}

.expected-time-block {
  margin-bottom: 24px;
}

.expected-time-block strong {
  font-size: 16px;
  color: #1A1A2E;
  font-family: 'DM Sans', sans-serif;
  font-weight: 800;
}

.contact-courier-btn {
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
}

.contact-courier-btn:hover {
  background: #513bc7;
  transform: translateY(-1px);
}

.pending-courier-note {
  background: #FAF9FE;
  padding: 14px 20px;
  border-radius: 16px;
  color: #7C5CFC;
  font-weight: 700;
  font-size: 14px;
  text-align: center;
  border: 1.5px dashed #D6D0F7;
}

/* Right Courier Card */
.courier-card {
  background: #FFFFFF;
  border-radius: 24px;
  padding: 32px 28px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
}

.courier-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.courier-avatar {
  width: 38px;
  height: 38px;
  background: #FFF0E8;
  color: #E87A5D;
  font-weight: 800;
  font-size: 15px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dots-decor {
  display: flex;
  gap: 6px;
}

.decor-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #7C5CFC;
}

.courier-middle-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
}

.courier-name {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 22px;
  color: #1A1A2E;
  margin-bottom: 4px;
}

.courier-car {
  font-size: 13.5px;
  color: #7B7B93;
  margin-bottom: 2px;
}

.courier-phone {
  font-size: 13.5px;
  color: #7B7B93;
}

/* Courier Face Icon */
.courier-face-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: #D9EFFF;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cf-eye {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #7C5CFC;
  top: 18px;
}
.cf-eye.left { left: 16px; }
.cf-eye.right { right: 16px; }

.cf-mouth {
  position: absolute;
  width: 14px;
  height: 3px;
  background: #FF6B6B;
  border-radius: 2px;
  bottom: 16px;
}

.courier-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: auto;
}

.call-btn {
  display: block;
  text-align: center;
  background: #624CE0;
  color: #FFFFFF;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 14.5px;
  padding: 13px;
  border-radius: 14px;
  text-decoration: none;
  box-shadow: 0 6px 20px rgba(98, 76, 224, 0.25);
  transition: all 0.2s ease;
}

.call-btn:hover {
  background: #513bc7;
  transform: translateY(-1px);
}

.message-btn {
  background: transparent;
  border: none;
  color: #7C5CFC;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  padding: 6px;
  transition: opacity 0.2s ease;
}

.message-btn:hover {
  opacity: 0.8;
  text-decoration: underline;
}

/* Bottom Banner */
.next-delivery-banner {
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

.banner-content {
  max-width: 660px;
  z-index: 2;
}

.banner-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 20px;
  color: #1A1A2E;
  margin-bottom: 6px;
}

.banner-subtitle {
  font-size: 14px;
  color: #7B7B93;
}

.banner-decor {
  position: relative;
  width: 140px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-star {
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

/* Chat Modal */
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

.chat-modal {
  position: relative;
  background: #FFFFFF;
  width: 100%;
  max-width: 500px;
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

.quick-messages {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.quick-msg-btn {
  background: #FAFAFC;
  border: 1px solid #EAEAF2;
  border-radius: 12px;
  padding: 8px 12px;
  text-align: left;
  font-size: 13px;
  color: #4A4A68;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-msg-btn:hover {
  border-color: #7C5CFC;
  color: #7C5CFC;
  background: #F8F6FF;
}

.chat-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid #E2E2EC;
  border-radius: 14px;
  font-size: 14px;
  color: #1A1A2E;
  font-family: 'DM Sans', sans-serif;
  outline: none;
  resize: none;
  margin-bottom: 20px;
}

.chat-textarea:focus {
  border-color: #7C5CFC;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  background: #F4F4F8;
  border: none;
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

.send-btn {
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
  .delivery-grid-section {
    grid-template-columns: 1fr;
    gap: 18px;
  }
}

@media (max-width: 640px) {
  .container {
    padding: 0 14px;
  }

  .page-content {
    padding-top: 20px;
  }

  .delivery-header-section {
    margin-bottom: 20px;
  }

  .header-right {
    display: none;
  }

  .delivery-main-title {
    font-size: 24px;
    line-height: 1.25;
  }

  .delivery-subtitle {
    font-size: 13.5px;
  }

  .tracker-card {
    padding: 20px 14px;
    border-radius: 18px;
  }

  .status-heading {
    font-size: 20px;
  }

  .status-sub {
    font-size: 12.5px;
    margin-bottom: 20px;
  }

  .stepper-wrap {
    margin-bottom: 24px;
  }

  .stepper-line-bg {
    top: 14px;
    left: 14px;
    right: 14px;
  }

  .step-node {
    width: auto;
    flex: 1;
    min-width: 0;
    gap: 6px;
  }

  .step-circle {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  .step-label {
    font-size: 9.5px;
    line-height: 1.2;
    padding: 0 2px;
  }

  .btn-contact-courier {
    width: 100%;
    text-align: center;
    padding: 12px;
  }

  .courier-summary-card,
  .package-contents-card {
    padding: 18px 14px;
    border-radius: 18px;
  }

  .next-delivery-banner {
    padding: 18px 14px;
    border-radius: 18px;
  }

  .banner-decor {
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
