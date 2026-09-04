<template>
  <div class="delivery-page">
    <TheHeader />

    <main class="container page-content">
      <!-- Section Header -->
      <section class="delivery-header-section">
        <div class="header-left">
          <h1 class="delivery-main-title">{{ isReturnDelivery ? 'Возврат набора игрушек' : 'Где мои игрушки?' }}</h1>
          <p class="delivery-subtitle">
            {{ isReturnDelivery ? 'Следите за статусом выезда курьера для забора набора игрушек.' : 'Следите за статусом доставки в реальном времени.' }}
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
      <DeliveryTracker
        :task-id="taskIdFromQuery"
        :order-id="orderIdFromQuery"
        :subscription-set-id="subscriptionSetIdFromQuery"
        :show-courier-card="true"
        @delivery-loaded="onDeliveryLoaded"
      />

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

    <!-- TheFooter -->
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })

import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TheHeader from '~/components/TheHeader.vue'
import TheFooter from '~/components/TheFooter.vue'
import DeliveryTracker from '~/components/DeliveryTracker.vue'

const route = useRoute()

const taskIdFromQuery = computed(() => {
  const raw = route.query.task_id
  return raw ? Number(raw) : null
})

const orderIdFromQuery = computed(() => {
  const raw = route.query.order_id
  return raw ? Number(raw) : null
})

const subscriptionSetIdFromQuery = computed(() => {
  const raw = route.query.subscription_set_id
  return raw ? Number(raw) : null
})

const isReturnDelivery = ref(false)

const onDeliveryLoaded = (data: any) => {
  const t = (data?.type || '').toLowerCase()
  isReturnDelivery.value = t === 'pickup' || t === 'return' || t === 'exchange_pickup'
}
</script>

<style scoped>
.delivery-page {
  min-height: 100vh;
  background-color: #FAF8F4;
  color: #262626;
  font-family: 'Manrope', sans-serif;
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
  color: #3F6757;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.delivery-main-title {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 36px;
  color: #262626;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.delivery-subtitle {
  font-size: 15px;
  color: #6F746F;
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
  background: #3F6757;
  display: inline-block;
}

.yellow-star {
  color: #E8A62B;
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
  background: #FAF8F4;
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
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 32px;
  color: #262626;
  margin-bottom: 4px;
}

.status-sub {
  font-size: 14.5px;
  color: #6F746F;
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
  background: #3F6757;
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
  background: #3F6757;
  color: #FAF8F4;
  font-weight: 800;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(51, 61, 54, 0.3);
}

.step-circle.inactive {
  background: #FAF8F4;
  color: #A0A0B8;
  border: 1px solid #DCE8F5;
  box-shadow: none;
}

.step-label {
  font-size: 11.5px;
  color: #6F746F;
  font-weight: 600;
  text-align: center;
  line-height: 1.3;
}

.step-node.active .step-label {
  color: #262626;
  font-weight: 700;
}

.expected-time-block {
  margin-bottom: 24px;
}

.expected-time-block strong {
  font-size: 16px;
  color: #262626;
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
}

.contact-courier-btn {
  align-self: flex-start;
  background: #3F6757;
  color: #FAF8F4;
  border: none;
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 14.5px;
  padding: 13px 26px;
  border-radius: 14px;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(51, 61, 54, 0.25);
  transition: all 0.2s ease;
}

.contact-courier-btn:hover {
  background: #315145;
  transform: translateY(-1px);
}

/* Right Courier Card */
.courier-card {
  background: #FAF8F4;
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
  background: #3F6757;
}

.courier-middle-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
}

.courier-name {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 22px;
  color: #262626;
  margin-bottom: 4px;
}

.courier-car {
  font-size: 13.5px;
  color: #6F746F;
  margin-bottom: 2px;
}

.courier-phone {
  font-size: 13.5px;
  color: #6F746F;
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
  background: #3F6757;
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
  background: #3F6757;
  color: #FAF8F4;
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 14.5px;
  padding: 13px;
  border-radius: 14px;
  text-decoration: none;
  box-shadow: 0 6px 20px rgba(51, 61, 54, 0.25);
  transition: all 0.2s ease;
}

.call-btn:hover {
  background: #315145;
  transform: translateY(-1px);
}

.message-btn {
  background: transparent;
  border: none;
  color: #3F6757;
  font-family: 'Manrope', sans-serif;
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
  background: #FAF8F4;
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
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 20px;
  color: #262626;
  margin-bottom: 6px;
}

.banner-subtitle {
  font-size: 14px;
  color: #6F746F;
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
  color: #3F6757;
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
  background: #FAF8F4;
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

.modal-title {
  font-family: 'Manrope', sans-serif;
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 6px;
}

.modal-desc {
  font-size: 14px;
  color: #6F746F;
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
  border: 1px solid #E6DFD4;
  border-radius: 12px;
  padding: 8px 12px;
  text-align: left;
  font-size: 13px;
  color: #5D625F;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-msg-btn:hover {
  border-color: #3F6757;
  color: #3F6757;
  background: #FAF8F4;
}

.chat-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid #E3D7C6;
  border-radius: 14px;
  font-size: 14px;
  color: #262626;
  font-family: 'Manrope', sans-serif;
  outline: none;
  resize: none;
  margin-bottom: 20px;
}

.chat-textarea:focus {
  border-color: #3F6757;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  background: #F4F1EA;
  border: none;
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

.send-btn {
  background: #3F6757;
  color: #FAF8F4;
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
