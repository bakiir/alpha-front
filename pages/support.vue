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

      <!-- Quick Topic Buttons -->
      <section class="quick-topics-section">
        <button 
          v-for="topic in quickTopics" 
          :key="topic.text" 
          class="topic-pill-btn"
          @click="selectTopic(topic.text, topic.reply)"
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
          <div 
            v-for="(msg, idx) in messages" 
            :key="idx" 
            :class="['message-group', msg.sender]"
          >
            <div class="message-bubble">
              {{ msg.text }}
            </div>
            <span class="message-time">{{ msg.time }}</span>
          </div>

          <div v-if="isTyping" class="message-group methodist typing">
            <div class="message-bubble typing-bubble">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>

        <!-- Chat Input Bar -->
        <form class="chat-input-bar" @submit.prevent="sendMessage">
          <input 
            v-model="inputMessage" 
            type="text" 
            placeholder="Напишите методисту..." 
            class="chat-input"
          />
          <button type="submit" class="send-message-btn" :disabled="!inputMessage.trim()">
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
import { ref, nextTick } from 'vue'
import TheHeader from '~/components/TheHeader.vue'
import TheFooter from '~/components/TheFooter.vue'

interface Message {
  text: string
  time: string
  sender: 'methodist' | 'user'
}

const inputMessage = ref('')
const isTyping = ref(false)
const messagesContainer = ref<HTMLDivElement | null>(null)

const quickTopics = [
  { 
    text: 'Обмен наборов', 
    reply: 'Обмен наборов происходит каждые 2 месяца абсолютно бесплатно. За 5 дней до обмена наш курьер согласует с вами удобный временной интервал.' 
  },
  { 
    text: 'Доставка курьером', 
    reply: 'Мы доставляем наборы до двери по всему Казахстану. Курьер заранее звонит за 30 минут до приезда.' 
  },
  { 
    text: 'Оплата подписки', 
    reply: 'Оплата списывается автоматически раз в месяц. Вы можете изменить карту или тарифный план в разделе «Подписка».' 
  },
  { 
    text: 'Дезинфекция', 
    reply: 'Каждая деревянная игрушка проходит 3 ступени эко-обработки: паровая очистка, ультрафиолетовая стерилизация и упаковка в индивидуальный герметичный бокс.' 
  },
]

const messages = ref<Message[]>([
  {
    text: 'Здравствуйте, Анна! Я проанализировала успехи Миши с прошлым набором. Думаю, в следующем комплекте стоит сделать упор на сопоставление форм и баланс.',
    time: '10:14',
    sender: 'methodist'
  },
  {
    text: 'Отличная идея, Алия! Он сейчас как раз очень интересуется весами и сортировкой по размерам.',
    time: '10:15',
    sender: 'user'
  }
])

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const getCurrentTime = () => {
  const now = new Date()
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const sendMessage = () => {
  if (!inputMessage.value.trim()) return

  const userText = inputMessage.value.trim()
  messages.value.push({
    text: userText,
    time: getCurrentTime(),
    sender: 'user'
  })
  inputMessage.value = ''
  scrollToBottom()

  // Automated smart reply from methodologist
  isTyping.value = true
  setTimeout(() => {
    isTyping.value = false
    messages.value.push({
      text: 'Спасибо за уточнение! Я внесла эти рекомендации в индивидуальный профиль развития Миши. В следующем наборе обязательно добавим весы и развивающий сортер.',
      time: getCurrentTime(),
      sender: 'methodist'
    })
    scrollToBottom()
  }, 1200)
}

const selectTopic = (topicText: string, replyText: string) => {
  messages.value.push({
    text: `Вопрос по теме: ${topicText}`,
    time: getCurrentTime(),
    sender: 'user'
  })
  scrollToBottom()

  isTyping.value = true
  setTimeout(() => {
    isTyping.value = false
    messages.value.push({
      text: replyText,
      time: getCurrentTime(),
      sender: 'methodist'
    })
    scrollToBottom()
  }, 900)
}
</script>

<style scoped>
.support-page {
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
  color: #7C5CFC;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.support-main-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 36px;
  color: #1A1A2E;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.support-subtitle {
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
  background: #FFFFFF;
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
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 22px;
  color: #1A1A2E;
  margin-bottom: 4px;
}

.status-card-desc {
  font-size: 14.5px;
  color: #7B7B93;
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
  color: #FFD166;
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
  background: #7C5CFC;
  top: 18px;
}
.p-eye.left { left: 16px; }
.p-eye.right { right: 16px; }

.p-mouth {
  position: absolute;
  width: 14px;
  height: 3px;
  background: #7C5CFC;
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
  background: #FFFFFF;
  border: 1px solid #EAEAF2;
  color: #7C5CFC;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 13.5px;
  padding: 8px 24px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}

.topic-pill-btn:hover {
  background: #624CE0;
  color: #FFFFFF;
  border-color: #624CE0;
  box-shadow: 0 4px 14px rgba(98, 76, 224, 0.25);
  transform: translateY(-1px);
}

/* Live Chat Card */
.chat-card {
  background: #FFFFFF;
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
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 18px;
  color: #1A1A2E;
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
  background: #F0EDFF;
  color: #1A1A2E;
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
  background: #624CE0;
  color: #FFFFFF;
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
  background: #7C5CFC;
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
  border-top: 1px solid #F4F4F8;
  padding-top: 20px;
}

.chat-input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: 'DM Sans', sans-serif;
  font-size: 14.5px;
  color: #1A1A2E;
  outline: none;
  padding: 10px 0;
}

.chat-input::placeholder {
  color: #A0A0B8;
}

.send-message-btn {
  background: #624CE0;
  color: #FFFFFF;
  border: none;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 14px;
  padding: 12px 28px;
  border-radius: 14px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(98, 76, 224, 0.25);
  transition: all 0.2s ease;
}

.send-message-btn:hover:not(:disabled) {
  background: #513bc7;
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
  color: #7C5CFC;
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
