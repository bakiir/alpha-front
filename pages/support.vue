<template>
  <div class="support-page">
    <TheHeader />

    <main class="container page-content">
      <!-- Section Header -->
      <section class="support-header-section">
        <div class="header-left">
          <h1 class="support-main-title">Чем можем помочь?</h1>
          <p class="support-subtitle">
            Методист и поддержка всегда рядом.
          </p>

          <!-- Dot & star decor -->
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
          </div>
        </div>
      </section>

      <!-- Status Top Card -->
      <section class="methodist-status-card">
        <div class="status-info-col">
          <h2 class="status-card-title">Методист Алия онлайн</h2>
          <p class="status-card-desc">Задайте вопрос или выберите готовую тему ниже.</p>
        </div>

        <!-- Composite Face Avatar Illustration -->
        <div class="methodist-avatar-wrap">
          <div class="avatar-mint-circle">
            <div class="bear-ear left"></div>
            <div class="bear-ear right"></div>
            <span class="b-eye left"></span>
            <span class="b-eye right"></span>
            <span class="b-nose"></span>
            <span class="mint-star">★</span>
          </div>

          <div class="avatar-peach-body">
            <span class="p-eye left"></span>
            <span class="p-eye right"></span>
            <span class="p-mouth"></span>
          </div>

          <div class="avatar-blue-circle">
            <span class="bl-eye left"></span>
            <span class="bl-eye right"></span>
            <span class="bl-mouth"></span>
          </div>
        </div>
      </section>

      <!-- Ticket selector -->
      <section v-if="user" class="tickets-toolbar">
        <button class="topic-pill-btn" :class="{ active: !activeTicketId }" @click="startNewTicket">
          + Новое обращение
        </button>
        <button
          v-for="ticket in tickets"
          :key="ticket.id"
          class="topic-pill-btn"
          :class="{ active: activeTicketId === ticket.id }"
          @click="selectTicket(ticket.id)"
        >
          {{ ticket.subject }}
        </button>
      </section>

      <!-- Quick Topic Buttons -->
      <section v-if="!activeTicketId" class="quick-topics-section">
        <button 
          v-for="topic in quickTopics" 
          :key="topic.text" 
          class="topic-pill-btn"
          @click="selectTopic(topic.text, topic.subject)"
        >
          {{ topic.text }}
        </button>
      </section>

      <!-- Live Chat Card -->
      <section class="chat-card">
        <div class="chat-card-header">
          <h3 class="methodist-name">Алия • методист</h3>
        </div>

        <!-- Messages Area -->
        <div ref="messagesContainer" class="chat-messages-area">
          <div v-if="!user" class="auth-prompt-box">
            <p>Войдите, чтобы писать методисту и сохранять историю обращений.</p>
            <button class="send-message-btn" @click="openAuthModal('login')">Войти</button>
          </div>
          <div v-else-if="isLoadingMessages" class="auth-prompt-box">Загружаем переписку...</div>
          <template v-else>
          <div 
            v-for="(msg, idx) in messages" 
            :key="msg.id || idx" 
            :class="['message-group', msg.sender_type === 'user' ? 'user' : 'methodist']"
          >
            <div class="message-bubble">
              {{ msg.body }}
            </div>
            <span class="message-time">{{ formatMessageTime(msg.created_at) }}</span>
          </div>
          </template>

          <div v-if="isSending" class="message-group methodist typing">
            <div class="message-bubble typing-bubble">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>

        <!-- Chat Input Bar -->
        <form class="chat-input-bar" @submit.prevent="sendMessageHandler">
          <input 
            v-model="inputMessage" 
            type="text" 
            placeholder="Напишите методисту..." 
            class="chat-input"
          />
          <button type="submit" class="send-message-btn" :disabled="!inputMessage.trim() || !user || isSending">
            Отправить
          </button>
        </form>
      </section>

      <!-- Bottom Decor -->
      <div class="support-bottom-decor">
        <span class="bottom-star">★</span>
        <div class="decor-blob mint-blob"></div>
        <div class="decor-blob yellow-blob"></div>
        <span class="decor-small-star">★</span>
      </div>
    </main>

    <!-- TheFooter -->
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import type { SupportMessage, SupportTicket } from '~/composables/useSupport'

const { user, openAuthModal } = useAuth()
const { error: toastError } = useToast()
const { fetchTickets, createTicket, fetchMessages, sendMessage } = useSupport()

const inputMessage = ref('')
const isSending = ref(false)
const isLoadingMessages = ref(false)
const messagesContainer = ref<HTMLDivElement | null>(null)
const tickets = ref<SupportTicket[]>([])
const activeTicketId = ref<number | null>(null)
const messages = ref<SupportMessage[]>([])

const quickTopics = [
  { text: 'Обмен наборов', subject: 'Обмен наборов' },
  { text: 'Доставка курьером', subject: 'Доставка курьером' },
  { text: 'Оплата подписки', subject: 'Оплата подписки' },
  { text: 'Дезинфекция', subject: 'Дезинфекция игрушек' },
]

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const formatMessageTime = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const loadTickets = async () => {
  if (!user.value) return
  try {
    tickets.value = await fetchTickets()
    if (tickets.value.length && !activeTicketId.value) {
      await selectTicket(tickets.value[0].id)
    }
  } catch {
    tickets.value = []
  }
}

const loadMessages = async (ticketId: number) => {
  isLoadingMessages.value = true
  try {
    messages.value = await fetchMessages(ticketId)
  } catch {
    messages.value = []
  } finally {
    isLoadingMessages.value = false
    scrollToBottom()
  }
}

const selectTicket = async (ticketId: number) => {
  activeTicketId.value = ticketId
  await loadMessages(ticketId)
}

const startNewTicket = () => {
  activeTicketId.value = null
  messages.value = []
}

const sendMessageToApi = async (text: string, subject?: string) => {
  if (!user.value) {
    openAuthModal('login')
    return
  }

  isSending.value = true
  try {
    if (!activeTicketId.value) {
      const res = await createTicket({
        subject: subject || text.slice(0, 60),
        message: text,
        topic: subject,
      })
      const ticket = (res as any)?.data || res
      activeTicketId.value = ticket.id
      await loadTickets()
      await loadMessages(ticket.id)
    } else {
      await sendMessage(activeTicketId.value, text)
      await loadMessages(activeTicketId.value)
    }
  } catch (e: any) {
    toastError('Не удалось отправить', e?.data?.message || 'Не удалось отправить сообщение')
  } finally {
    isSending.value = false
    scrollToBottom()
  }
}

const sendMessageHandler = async () => {
  if (!inputMessage.value.trim()) return
  const text = inputMessage.value.trim()
  inputMessage.value = ''
  await sendMessageToApi(text)
}

const selectTopic = async (topicText: string, subject: string) => {
  await sendMessageToApi(`Вопрос по теме: ${topicText}`, subject)
}

onMounted(async () => {
  if (user.value) await loadTickets()
})
</script>

<style scoped>
.tickets-toolbar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.tickets-toolbar .topic-pill-btn.active {
  background: #3F6757;
  color: #fff;
  border-color: #3F6757;
}

.auth-prompt-box {
  text-align: center;
  padding: 32px 16px;
  color: #6F746F;
}

.support-page {
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
.support-header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
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

.support-main-title {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 36px;
  color: #262626;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.support-subtitle {
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

/* Header Right Blobs */
.blob-container {
  position: relative;
  width: 140px;
  height: 90px;
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

/* Methodist Status Card */
.methodist-status-card {
  background: #FAF8F4;
  border-radius: 24px;
  padding: 28px 36px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.status-card-title {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 22px;
  color: #262626;
  margin-bottom: 4px;
}

.status-card-desc {
  font-size: 14.5px;
  color: #6F746F;
}

/* Methodist Avatar Wrap */
.methodist-avatar-wrap {
  position: relative;
  display: flex;
  align-items: center;
  height: 60px;
}

.avatar-mint-circle {
  width: 52px;
  height: 52px;
  background: #D9F7EC;
  border-radius: 50%;
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bear-ear {
  position: absolute;
  width: 14px;
  height: 14px;
  background: #FFDCC8;
  border-radius: 50%;
  top: -4px;
}
.bear-ear.left { left: 2px; }
.bear-ear.right { right: 2px; }

.b-eye {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #3B2A1E;
  border-radius: 50%;
  top: 20px;
}
.b-eye.left { left: 16px; }
.b-eye.right { right: 16px; }

.b-nose {
  position: absolute;
  width: 6px;
  height: 5px;
  background: #E87A5D;
  border-radius: 50%;
  top: 28px;
  left: 23px;
}

.mint-star {
  position: absolute;
  top: -8px;
  right: -4px;
  color: #E8A62B;
  font-size: 14px;
}

.avatar-peach-body {
  width: 48px;
  height: 52px;
  background: #FEE0CE;
  border-radius: 16px;
  position: relative;
  margin-left: -12px;
  z-index: 2;
}

.p-eye {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #3F6757;
  top: 18px;
}
.p-eye.left { left: 16px; }
.p-eye.right { right: 16px; }

.p-mouth {
  position: absolute;
  width: 14px;
  height: 3px;
  background: #3F6757;
  border-radius: 2px;
  bottom: 16px;
  left: 17px;
}

.avatar-blue-circle {
  width: 44px;
  height: 44px;
  background: #DCF0FF;
  border-radius: 14px;
  position: relative;
  margin-left: -10px;
  z-index: 1;
}

.bl-eye {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #FF6B6B;
  top: 15px;
}
.bl-eye.left { left: 13px; }
.bl-eye.right { right: 13px; }

.bl-mouth {
  position: absolute;
  width: 12px;
  height: 3px;
  background: #FF6B6B;
  border-radius: 2px;
  bottom: 14px;
  left: 16px;
}

/* Quick Topics */
.quick-topics-section {
  display: flex;
  gap: 12px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.topic-pill-btn {
  background: #FAF8F4;
  border: 1px solid #E6DFD4;
  color: #3F6757;
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 13.5px;
  padding: 8px 24px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}

.topic-pill-btn:hover {
  background: #3F6757;
  color: #FAF8F4;
  border-color: #3F6757;
  box-shadow: 0 4px 14px rgba(51, 61, 54, 0.25);
  transform: translateY(-1px);
}

/* Live Chat Card */
.chat-card {
  background: #FAF8F4;
  border-radius: 24px;
  padding: 32px 36px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
}

.chat-card-header {
  margin-bottom: 24px;
}

.methodist-name {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 18px;
  color: #262626;
}

.chat-messages-area {
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-height: 440px;
  overflow-y: auto;
  padding-right: 8px;
  margin-bottom: 24px;
}

.message-group {
  display: flex;
  flex-direction: column;
  max-width: 580px;
}

.message-group.methodist {
  align-self: flex-start;
}

.message-group.methodist .message-bubble {
  background: #D9E0D5;
  color: #262626;
  border-radius: 20px 20px 20px 6px;
  padding: 16px 22px;
  font-size: 14px;
  line-height: 1.45;
}

.message-group.user {
  align-self: flex-end;
  align-items: flex-end;
}

.message-group.user .message-bubble {
  background: #3F6757;
  color: #FAF8F4;
  border-radius: 20px 20px 6px 20px;
  padding: 16px 22px;
  font-size: 14px;
  line-height: 1.45;
}

.message-time {
  font-size: 11.5px;
  color: #A0A0B8;
  margin-top: 4px;
  padding: 0 4px;
}

/* Typing animation */
.typing-bubble {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 18px !important;
}

.typing-bubble span {
  width: 6px;
  height: 6px;
  background: #3F6757;
  border-radius: 50%;
  animation: blink 1.2s infinite;
}
.typing-bubble span:nth-child(2) { animation-delay: 0.2s; }
.typing-bubble span:nth-child(3) { animation-delay: 0.4s; }

@keyframes blink {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1.1); }
}

/* Chat Input Bar */
.chat-input-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  border-top: 1px solid #F4F1EA;
  padding-top: 20px;
}

.chat-input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: 'Manrope', sans-serif;
  font-size: 14.5px;
  color: #262626;
  outline: none;
  padding: 10px 0;
}

.chat-input::placeholder {
  color: #A0A0B8;
}

.send-message-btn {
  background: #3F6757;
  color: #FAF8F4;
  border: none;
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 14px;
  padding: 12px 28px;
  border-radius: 14px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(51, 61, 54, 0.25);
  transition: all 0.2s ease;
}

.send-message-btn:hover:not(:disabled) {
  background: #315145;
  transform: translateY(-1px);
}

.send-message-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Bottom Decor */
.support-bottom-decor {
  position: relative;
  width: 140px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  margin-top: 20px;
}

.bottom-star {
  color: #3F6757;
  font-size: 24px;
  position: absolute;
  right: 15px;
  top: 0;
  z-index: 2;
}

.mint-blob {
  position: absolute;
  width: 75px;
  height: 45px;
  background: #D9F7EC;
  border-radius: 50%;
  bottom: 0;
  right: 30px;
  opacity: 0.8;
}

.yellow-blob {
  position: absolute;
  width: 30px;
  height: 30px;
  background: #FFE8A3;
  border-radius: 50%;
  bottom: -4px;
  right: 15px;
  opacity: 0.85;
}

.decor-small-star {
  position: absolute;
  color: #B4EDDB;
  font-size: 16px;
  bottom: -6px;
  right: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .methodist-status-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 24px;
  }
  
  .chat-card {
    padding: 24px 20px;
  }
}
</style>
