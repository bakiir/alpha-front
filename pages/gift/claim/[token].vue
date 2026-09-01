<template>
  <div class="gift-claim-page">
    <TheHeader />
    <main class="container page-content claim-container">
      
      <!-- Loading State -->
      <div v-if="pending" class="loading-state">
        <AppSpinner size="48" />
        <p>Ищем ваш подарок...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error || !gift" class="error-state">
        <h2>Ой! Подарок не найден.</h2>
        <p>Проверьте правильность ссылки или обратитесь в поддержку.</p>
        <NuxtLink to="/" class="btn btn-primary mt-4">На главную</NuxtLink>
      </div>

      <!-- Claimed State -->
      <div v-else-if="gift.status === 'claimed'" class="claimed-state">
        <div class="icon-wrap">🎁</div>
        <h2>Подарок уже в пути!</h2>
        <p>Этот подарок уже был успешно оформлен на доставку.</p>
        <NuxtLink to="/profile" class="btn btn-primary mt-4">В личный кабинет</NuxtLink>
      </div>

      <!-- Success State (After submitting form) -->
      <div v-else-if="success" class="success-state">
        <div class="icon-wrap">🚚</div>
        <h2>Ура! Подарок оформлен.</h2>
        <p>Мы бережно упакуем и доставим ваш подарок по указанному адресу.</p>
        <p v-if="form.createAccount">Вам отправлено письмо с деталями доступа к личному кабинету.</p>
        <NuxtLink to="/profile" class="btn btn-primary mt-6">Перейти в профиль</NuxtLink>
      </div>

      <!-- Unwrapped & Address Form State -->
      <div v-else-if="unwrapped" class="unwrapped-state fade-in">
        <div class="gift-details text-center">
          <h2>Подарок от: {{ gift.sender_name }}</h2>
          <div class="gift-message" v-if="gift.message">
            "{{ gift.message }}"
          </div>

          <div class="gift-contents mt-6">
            <template v-if="gift.type === 'order'">
              <div v-for="(item, idx) in gift.items" :key="idx" class="gift-item">
                <img v-if="item.image" :src="item.image" alt="Игрушка" class="item-img" />
                <div class="item-icon" v-else>🧸</div>
                <span>{{ item.name }}</span>
              </div>
            </template>
            <template v-else-if="gift.type === 'subscription'">
              <div class="gift-item subscription-item">
                <div class="item-icon">📦</div>
                <span>Подписка "{{ gift.plan }}" на {{ gift.duration_months }} мес.</span>
              </div>
            </template>
          </div>
        </div>

        <div class="address-form-box mt-8">
          <h3>Куда доставить ваш подарок?</h3>
          <form @submit.prevent="submitClaim" class="claim-form mt-4">
            <div class="form-group">
              <label>Ваше Имя</label>
              <input type="text" v-model="form.name" required class="form-input" placeholder="Иван Иванов" />
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Email</label>
                <input type="email" v-model="form.email" required class="form-input" placeholder="email@example.com" />
              </div>
              <div class="form-group">
                <label>Телефон</label>
                <input type="tel" v-model="form.phone" required class="form-input" placeholder="+7 777 000 0000" />
              </div>
            </div>

            <div class="form-group">
              <label>Адрес доставки (Город, Улица, Дом, Квартира)</label>
              <textarea v-model="form.address" required class="form-input" rows="2" placeholder="г. Алматы, ул. Абая 10, кв 5"></textarea>
            </div>

            <!-- Optional fields for subscription -->
            <template v-if="gift.type === 'subscription'">
              <div class="form-group mt-4">
                <label>Имя ребенка (для персонализации)</label>
                <input type="text" v-model="form.child_name" class="form-input" placeholder="Например, Али" />
              </div>
            </template>

            <template v-if="!user">
              <div class="form-group checkbox-group mt-4">
                <label class="custom-checkbox">
                  <input type="checkbox" v-model="form.createAccount" />
                  <span class="checkmark"></span>
                  <span class="label-text">Создать аккаунт для управления подпиской / заказами</span>
                </label>
              </div>
            </template>

            <button type="submit" class="btn btn-primary w-full mt-6" :disabled="submitting">
              <AppSpinner v-if="submitting" size="20" class="mr-2" />
              {{ submitting ? 'Оформляем...' : 'Оформить доставку' }}
            </button>
          </form>
        </div>
      </div>

      <!-- Initial Wrapped State -->
      <div v-else class="wrapped-state text-center">
        <h1>Вам прислали подарок! 🎁</h1>
        <p class="subtitle mt-2">Нажмите на коробку, чтобы открыть его</p>
        
        <div class="present-box" @click="unwrapGift">
          <div class="box-lid"></div>
          <div class="box-body">
            <div class="ribbon-vertical"></div>
            <div class="ribbon-horizontal"></div>
          </div>
        </div>
      </div>

    </main>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useFetch, useRuntimeConfig } from '#app'
import { useApi } from '~/composables/useApi'
import { useAuth } from '~/composables/useAuth'

const route = useRoute()
const token = route.params.token
const config = useRuntimeConfig()
const { request } = useApi()
const { user, openAuthModal } = useAuth()

const unwrapped = ref(false)
const success = ref(false)
const submitting = ref(false)

const form = reactive({
  name: '',
  email: '',
  phone: '',
  address: '',
  child_name: '',
  createAccount: true
})

// Fetch gift details
const { data: giftResponse, pending, error } = await useFetch(`/gifts/claim/${token}`, {
  baseURL: config.public.apiBase || 'http://127.0.0.1:8000/api',
})

const gift = ref(giftResponse.value)

const prefillForm = () => {
  if (user.value) {
    if (!form.name) form.name = user.value.name || ''
    if (!form.email) form.email = user.value.email || ''
    if (!form.phone) form.phone = user.value.phone || ''
    if (!form.address) form.address = user.value.address || ''
    form.createAccount = false
  }
}

watch(user, (newUser) => {
  if (newUser && unwrapped.value) {
    prefillForm()
  }
})

const unwrapGift = () => {
  // Add some delay for animation effect
  setTimeout(() => {
    unwrapped.value = true
    if (!user.value) {
      openAuthModal('register')
    } else {
      prefillForm()
    }
  }, 500)
}

const submitClaim = async () => {
  submitting.value = true
  try {
    await request(`/gifts/claim/${token}`, {
      method: 'POST',
      body: form
    })
    success.value = true
    
    // Redirect to profile history gifts tab after a short delay
    setTimeout(() => {
      useRouter().push('/profile?section=history&tab=gifts')
    }, 2000)
  } catch (err: any) {
    const data = err?.data ?? err?.response?._data
    alert(data?.message || 'Произошла ошибка при оформлении доставки.')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.claim-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.text-center { text-align: center; }
.mt-2 { margin-top: 0.5rem; }
.mt-4 { margin-top: 1rem; }
.mt-6 { margin-top: 1.5rem; }
.mt-8 { margin-top: 2rem; }
.w-full { width: 100%; }

.icon-wrap {
  font-size: 64px;
  margin-bottom: 20px;
}

/* Forms */
.address-form-box {
  background: var(--surface-color, #fff);
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}
.form-row {
  display: flex;
  gap: 15px;
}
.form-row > .form-group {
  flex: 1;
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}
.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}
.form-input:focus {
  border-color: var(--primary-color, #0056b3);
  outline: none;
}

/* Gift Details */
.gift-message {
  font-style: italic;
  color: #666;
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  margin-top: 15px;
}
.gift-contents {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}
.gift-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  padding: 10px 15px;
  border-radius: 50px;
  border: 1px solid #eee;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
}
.item-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}
.item-icon {
  font-size: 24px;
}

/* Present Animation */
.present-box {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 60px auto 0;
  cursor: pointer;
  transition: transform 0.2s;
}
.present-box:hover {
  transform: scale(1.05);
}
.box-lid {
  position: absolute;
  top: 0;
  left: -10px;
  width: 220px;
  height: 40px;
  background: #ff4757;
  border-radius: 4px;
  z-index: 2;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}
.box-body {
  position: absolute;
  top: 40px;
  left: 0;
  width: 200px;
  height: 160px;
  background: #ff6b81;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
}
.ribbon-vertical {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 100%;
  background: #f1c40f;
}
.ribbon-horizontal {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  width: 100%;
  height: 30px;
  background: #f1c40f;
}

.fade-in {
  animation: fadeIn 0.8s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
