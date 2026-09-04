<template>
  <div class="delivery-tracker" :class="{ compact }">
    <div class="delivery-tracker-grid">
      <div class="tracker-card">
        <h2 class="status-heading">{{ statusTitle }}</h2>
        <p class="status-sub">{{ courierInfo.name }} • {{ courierInfo.car }}</p>

        <div class="stepper-wrap">
          <div class="stepper-line-bg">
            <div class="stepper-line-fill" :style="{ width: progressWidth }"></div>
          </div>

          <div class="stepper-nodes">
            <div class="step-node" :class="{ active: currentStepIndex >= 1 }">
              <div class="step-circle">1</div>
              <span class="step-label">{{ isReturnTask ? 'Заявка принята' : 'Собираем заказ' }}</span>
            </div>
            <div class="step-node" :class="{ active: currentStepIndex >= 2 }">
              <div class="step-circle">2</div>
              <span class="step-label">{{ isReturnTask ? 'Курьер назначен' : 'Передано курьеру' }}</span>
            </div>
            <div class="step-node" :class="{ active: currentStepIndex >= 3, current: currentStepIndex === 3 }">
              <div class="step-circle">3</div>
              <span class="step-label">{{ isReturnTask ? 'Курьер едет к вам' : 'Курьер в пути' }}</span>
            </div>
            <div class="step-node" :class="{ active: currentStepIndex >= 4 }">
              <div class="step-circle" :class="{ inactive: currentStepIndex < 4 }">4</div>
              <span class="step-label">{{ isReturnTask ? 'Забрали от вас' : 'Доставлено' }}</span>
            </div>
          </div>
        </div>

        <div class="expected-time-block">
          <strong>Ожидаемое время: {{ deliveryTimeText }}</strong>
          <div v-if="deliveryAddress" class="delivery-dest-address">
            <AppIcon name="map-pin" :size="14" class="inline-icon" /> Адрес: {{ deliveryAddress }}
          </div>
        </div>

        <button class="contact-courier-btn" @click="openChatModal">
          Связаться с курьером
        </button>
      </div>

      <div v-if="showCourierCard" class="courier-card">
        <div class="courier-card-header">
          <div class="courier-avatar">
            <span>{{ courierInfo.name ? courierInfo.name[0] : 'К' }}</span>
          </div>
        </div>

        <div class="courier-middle-row">
          <div class="courier-details">
            <h3 class="courier-name">{{ courierInfo.name }}</h3>
            <p class="courier-car">{{ courierInfo.car }}</p>
            <p class="courier-phone">{{ courierInfo.phone_display || courierInfo.phone }}</p>
          </div>
          <div class="courier-face-icon">
            <span class="cf-eye left"></span>
            <span class="cf-eye right"></span>
            <span class="cf-mouth"></span>
          </div>
        </div>

        <div class="courier-actions">
          <button class="call-btn" @click="openChatModal" title="Звонок через защищённый номер">
            Позвонить
          </button>
          <button class="message-btn" @click="openChatModal">
            Написать
          </button>
        </div>
      </div>
    </div>

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
            />

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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = withDefaults(defineProps<{
  taskId?: number | null
  orderId?: number | null
  subscriptionSetId?: number | null
  fallbackStatus?: string
  fallbackScheduledTime?: string
  fallbackAddress?: string
  compact?: boolean
  showCourierCard?: boolean
}>(), {
  taskId: null,
  orderId: null,
  subscriptionSetId: null,
  fallbackStatus: '',
  fallbackScheduledTime: '',
  fallbackAddress: '',
  compact: false,
  showCourierCard: true,
})

const emit = defineEmits<{
  'delivery-loaded': [data: any]
}>()

const { fetchActiveDelivery, sendMessage } = useDeliveryChat()

const isChatOpen = ref(false)
const isSending = ref(false)
const messageText = ref('')
const activeDelivery = ref<any>(null)
const isLoading = ref(true)

const courierInfo = ref({
  name: 'Служба доставки Alpha Play',
  phone: '+7 (707) 123-45-00',
  car: 'Служебный транспорт Alpha',
})

const deliveryAddress = ref('')
const deliveryTimeText = ref('Сегодня, 14:00–18:00')
const deliveryStatus = ref('pending')

let pollTimer: ReturnType<typeof setInterval> | null = null

const setStatusToDeliveryStatus = (setStatus: string) => {
  const map: Record<string, string> = {
    assembling: 'assembling',
    delivering: 'delivering',
    in_use: 'in_use',
    returning: 'in_progress',
    returned: 'completed',
  }
  return map[setStatus] || 'pending'
}

const loadDelivery = async () => {
  isLoading.value = true
  try {
    const params: Record<string, number> = {}
    if (props.taskId) params.task_id = props.taskId
    if (props.orderId) params.order_id = props.orderId
    if (props.subscriptionSetId) params.subscription_set_id = props.subscriptionSetId

    const res = await fetchActiveDelivery(Object.keys(params).length ? params : undefined)
    if (res?.data?.id) {
      activeDelivery.value = res.data
      deliveryStatus.value = (res.data.status || props.fallbackStatus || 'pending').toLowerCase()
      deliveryAddress.value = res.data.address || props.fallbackAddress || ''
      deliveryTimeText.value = res.data.scheduled_time || props.fallbackScheduledTime || 'Сегодня, 14:00–18:00'

      if (res.data.courier?.name) {
        courierInfo.value = {
          name: res.data.courier.name,
          phone: res.data.courier.phone || '+7 (707) 123-45-00',
          car: res.data.courier.car || 'Служебный транспорт Alpha',
        }
      }
      emit('delivery-loaded', res.data)
      return
    }
  } catch {
    // fall through to fallback values
  } finally {
    isLoading.value = false
  }

  if (props.fallbackStatus) {
    deliveryStatus.value = setStatusToDeliveryStatus(props.fallbackStatus)
  }
  if (props.fallbackAddress) {
    deliveryAddress.value = props.fallbackAddress
  }
  if (props.fallbackScheduledTime) {
    deliveryTimeText.value = props.fallbackScheduledTime
  }
}

onMounted(() => {
  loadDelivery()
  pollTimer = window.setInterval(loadDelivery, 20000)
})

onUnmounted(() => {
  if (pollTimer) {
    window.clearInterval(pollTimer)
  }
})

watch(
  () => [props.taskId, props.orderId, props.subscriptionSetId, props.fallbackStatus],
  loadDelivery,
)

const hasAssignedCourier = computed(() =>
  Boolean(activeDelivery.value?.courier?.name && activeDelivery.value.courier.name !== 'Курьер службы Alpha Play')
)

const isReturnTask = computed(() => {
  const t = (activeDelivery.value?.type || '').toLowerCase()
  const s = (props.fallbackStatus || '').toLowerCase()
  return t === 'pickup' || t === 'return' || t === 'exchange_pickup' || s === 'returning'
})

const currentStepIndex = computed(() => {
  const s = (deliveryStatus.value || '').toLowerCase()

  if (isReturnTask.value) {
    if (s === 'completed' || s === 'returned') return 4
    if (s === 'in_progress' || s === 'in_transit') {
      return hasAssignedCourier.value ? 3 : 2
    }
    if (s === 'assigned' || hasAssignedCourier.value) return 2
    return 1
  }

  if (s === 'completed' || s === 'delivered' || s === 'in_use' || s === 'returned') return 4
  if (s === 'in_progress' || s === 'delivering' || s === 'in_transit' || s === 'shipped') {
    return hasAssignedCourier.value ? 3 : 2
  }
  if (s === 'assigned' || s === 'ready_for_pickup') return 2
  return 1
})

const statusTitle = computed(() => {
  const s = (deliveryStatus.value || '').toLowerCase()
  
  if (isReturnTask.value) {
    if (s === 'completed' || s === 'returned') return 'Курьер забрал игрушки от вас'
    if (s === 'in_progress' || s === 'in_transit') {
      return hasAssignedCourier.value ? 'Курьер едет к вам за игрушками' : 'Курьер назначен на забор'
    }
    if (s === 'assigned' || hasAssignedCourier.value) return 'Курьер назначен на забор игрушек'
    if (s === 'failed') return 'Выезд не удался — мы уже связываемся с вами'
    if (s === 'rescheduled') return 'Выезд курьера перенесён на новое время'
    return 'Заявка на забор игрушек принята'
  }

  if (s === 'completed' || s === 'delivered' || s === 'in_use' || s === 'returned') {
    return 'Доставлено клиенту'
  }
  if (s === 'in_progress' || s === 'delivering' || s === 'in_transit' || s === 'shipped') {
    return hasAssignedCourier.value ? 'Курьер в пути к вам' : 'Заказ передан в доставку'
  }
  if (s === 'assigned' || s === 'ready_for_pickup') {
    return 'Курьер назначен на доставку'
  }
  if (s === 'failed') return 'Выезд не удался — мы уже связываемся с вами'
  if (s === 'rescheduled') return 'Выезд курьера перенесен на новое время'
  
  return 'Собираем ваш заказ на складе'
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
  'Буду дома через 15 минут',
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
    messageText.value = ''
    isChatOpen.value = false
  } catch {
    messageText.value = ''
    isChatOpen.value = false
  } finally {
    isSending.value = false
  }
}
</script>

<style scoped>
.delivery-tracker-grid {
  display: grid;
  grid-template-columns: 1.55fr 1fr;
  gap: 24px;
}

.delivery-tracker.compact .delivery-tracker-grid {
  grid-template-columns: 1fr;
}

.tracker-card {
  background: #EAF5FF;
  border-radius: 24px;
  padding: 32px;
  display: flex;
  flex-direction: column;
}

.delivery-tracker.compact .tracker-card {
  padding: 24px;
}

.status-heading {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 28px;
  color: #262626;
  margin-bottom: 4px;
}

.delivery-tracker.compact .status-heading {
  font-size: 22px;
}

.status-sub {
  font-size: 14px;
  color: #6F746F;
  margin-bottom: 28px;
}

.stepper-wrap {
  position: relative;
  margin-bottom: 28px;
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
  transition: width 0.3s ease;
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
  margin-bottom: 20px;
}

.expected-time-block strong {
  font-size: 15px;
  color: #262626;
  font-weight: 800;
}

.delivery-dest-address {
  margin-top: 6px;
  font-size: 13px;
  color: #5D625F;
}

.contact-courier-btn {
  align-self: flex-start;
  background: #3F6757;
  color: #FAF8F4;
  border: none;
  font-weight: 700;
  font-size: 14px;
  padding: 12px 22px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.contact-courier-btn:hover {
  background: #315145;
}

.courier-card {
  background: #FAF8F4;
  border-radius: 24px;
  padding: 28px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
}

.courier-card-header {
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

.courier-middle-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.courier-name {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 20px;
  color: #262626;
  margin-bottom: 4px;
}

.courier-car,
.courier-phone {
  font-size: 13.5px;
  color: #6F746F;
  margin: 0 0 2px;
}

.courier-face-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: #D9EFFF;
  position: relative;
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
  left: 50%;
  transform: translateX(-50%);
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
  font-weight: 700;
  font-size: 14px;
  padding: 12px;
  border-radius: 14px;
  text-decoration: none;
}

.message-btn {
  background: transparent;
  border: none;
  color: #3F6757;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
}

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
  cursor: pointer;
}

.chat-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid #E3D7C6;
  border-radius: 14px;
  font-size: 14px;
  resize: none;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn,
.send-btn {
  border: none;
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

.cancel-btn {
  background: #F4F1EA;
}

.send-btn {
  background: #3F6757;
  color: #FAF8F4;
}

@media (max-width: 960px) {
  .delivery-tracker-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .step-node {
    width: auto;
    flex: 1;
    min-width: 0;
  }

  .step-label {
    font-size: 9.5px;
  }

  .step-circle {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
}

.delivery-dest-address {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.inline-icon {
  flex-shrink: 0;
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
