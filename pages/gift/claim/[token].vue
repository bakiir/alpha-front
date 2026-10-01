<template>
  <div class="gift-claim-page">
    <TheHeader />
    <main class="container page-content claim-container">
      
      <div v-if="pending" class="loading-state">
        <AppSpinner size="48" />
        <p>Ищем ваш подарок...</p>
      </div>

      <div v-else-if="errorMessage || !gift" class="error-state">
        <h2>Ой! Подарок не найден.</h2>
        <p>{{ errorMessage || 'Проверьте правильность ссылки или обратитесь в поддержку.' }}</p>
        <NuxtLink to="/" class="btn btn-primary mt-4">На главную</NuxtLink>
      </div>

      <div v-else-if="gift.status === 'claimed_by_other'" class="claimed-state">
        <div class="icon-wrap">🔒</div>
        <h2>Подарок уже получен</h2>
        <p>{{ gift.message || 'Этот подарок уже был получен другим пользователем.' }}</p>
        <NuxtLink to="/shop" class="btn btn-primary mt-4">В каталог товаров</NuxtLink>
      </div>

      <div v-else-if="gift.status === 'expired'" class="claimed-state">
        <div class="icon-wrap">⏳</div>
        <h2>Срок получения истёк</h2>
        <p>
          {{ gift.message_blocked || 'Ссылка для получения подарка больше недоступна.' }}
        </p>
        <p v-if="gift.activation_deadline?.local_label" class="subtitle mt-2">
          Срок был до {{ gift.activation_deadline.local_label }}
        </p>
        <a href="mailto:support@alpha.kz" class="btn btn-primary mt-4">Написать в поддержку</a>
      </div>

      <div v-else-if="gift.status === 'claimed'" class="claimed-state">
        <div class="icon-wrap">🎁</div>
        <h2>Подарок уже в пути!</h2>
        <p>{{ gift.is_claimed_by_you ? 'Вы уже успешно оформили этот подарок на доставку.' : 'Этот подарок уже был успешно оформлен на доставку.' }}</p>
        <p v-if="gift.delivery?.address" class="subtitle mt-2">
          Адрес доставки: {{ gift.delivery.address }}
        </p>
        <NuxtLink to="/profile?section=history&tab=gifts" class="btn btn-primary mt-4">В личный кабинет</NuxtLink>
      </div>

      <div v-else-if="success" class="success-state">
        <div class="icon-wrap">🚚</div>
        <h2>Ура! Подарок оформлен.</h2>
        <p>Мы бережно упакуем и доставим ваш подарок по указанному адресу.</p>
        <NuxtLink to="/profile?section=history&tab=gifts" class="btn btn-primary mt-6">Перейти в профиль</NuxtLink>
      </div>

      <div v-else-if="gift.type === 'subscription'" class="claimed-state">
        <div class="icon-wrap">📦</div>
        <h2>Подарочная подписка</h2>
        <p>
          От: {{ gift.sender_name || 'Близкий человек' }}.
          Тариф: {{ gift.plan || 'Стандарт' }}, срок: {{ gift.duration_months }} мес.
        </p>
        <div class="gift-message" v-if="gift.message">"{{ gift.message }}"</div>
        <NuxtLink
          :to="gift.activation_path || `/subscription?gift_code=${encodeURIComponent(cleanToken)}`"
          class="btn btn-primary mt-4"
        >
          Активировать подписку
        </NuxtLink>
      </div>

      <div v-else-if="gift.type === 'voucher'" class="claimed-state">
        <div class="icon-wrap">🎟️</div>
        <h2>Подарочный сертификат</h2>
        <p>
          От: {{ gift.sender_name || 'Близкий человек' }}.
          Номинал: <strong>{{ formatPrice(Number(gift.initial_amount || 0)) }} ₸</strong>
        </p>
        <div class="gift-message" v-if="gift.message">"{{ gift.message }}"</div>
        <div class="error-actions mt-4">
          <NuxtLink :to="`/cart?gift_code=${encodeURIComponent(cleanToken)}`" class="btn btn-primary">
            Использовать в корзине
          </NuxtLink>
          <NuxtLink :to="`/gifts/claim?code=${encodeURIComponent(cleanToken)}`" class="btn btn-secondary">
            Открыть сертификат
          </NuxtLink>
        </div>
      </div>

      <div v-else-if="unwrapped && !user" class="unwrapped-state fade-in text-center">
        <h2>Войдите, чтобы получить подарок</h2>
        <p class="subtitle mt-2">Нужен аккаунт, чтобы сохранить адрес и показать подарок в профиле.</p>
        <button type="button" class="btn btn-primary mt-6" @click="handleOpenAuth">
          Войти / Зарегистрироваться
        </button>
      </div>

      <div v-else-if="unwrapped" class="unwrapped-state fade-in">
        <div class="gift-details text-center">
          <h2>Подарок от: {{ gift.sender_name || 'Близкого человека' }}</h2>
          <div class="gift-message" v-if="gift.message">
            "{{ gift.message }}"
          </div>

          <div class="gift-contents mt-6" v-if="gift.items && gift.items.length">
            <div v-for="(item, idx) in gift.items" :key="idx" class="gift-item">
              <img v-if="item.image" :src="item.image" alt="Игрушка" class="item-img" />
              <div class="item-icon" v-else>🧸</div>
              <span>{{ item.name }}</span>
            </div>
          </div>
        </div>

        <div class="address-form-box mt-8">
          <h3>Куда доставить ваш подарок?</h3>
          <p class="form-hint">Состав подарка менять нельзя — укажите только контакты и адрес.</p>
          
          <div v-if="submitError" class="submit-error-banner mt-4">
            {{ submitError }}
          </div>

          <form @submit.prevent="submitClaim" class="claim-form mt-4">
            <div class="form-group">
              <label>Ваше имя</label>
              <input type="text" v-model="form.name" required class="form-input" placeholder="Иван Иванов" />
            </div>
            
            <div class="form-group">
              <label>Телефон</label>
              <input
                type="tel"
                :value="form.phone"
                required
                class="form-input"
                placeholder="+7 (701) 000-00-00"
                maxlength="18"
                autocomplete="tel"
                @input="onPhoneInput"
                @paste="onPhonePaste"
              />
            </div>

            <div class="form-group">
              <label>Адрес доставки (Город, Улица, Дом, Квартира)</label>
              <textarea v-model="form.address" required class="form-input" rows="2" placeholder="г. Алматы, ул. Абая 10, кв 5"></textarea>
            </div>

            <div class="form-group">
              <label>Комментарий курьеру (необязательно)</label>
              <input type="text" v-model="form.comment" class="form-input" placeholder="Домофон, этаж…" />
            </div>

            <button type="submit" class="btn btn-primary w-full mt-6" :disabled="submitting">
              <AppSpinner v-if="submitting" size="20" class="mr-2" />
              {{ submitting ? 'Оформляем...' : 'Подтвердить получение' }}
            </button>
          </form>
        </div>
      </div>

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
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '~/composables/useApi'
import { useAuth } from '~/composables/useAuth'

const route = useRoute()
const router = useRouter()
const rawToken = route.params.token
const cleanToken = computed(() => {
  const t = Array.isArray(rawToken) ? rawToken[0] : (rawToken as string || '')
  return decodeURIComponent(t).trim()
})

const { request } = useApi()
const { user, openAuthModal } = useAuth()

const pending = ref(true)
const errorMessage = ref('')
const submitError = ref('')
const gift = ref<any>(null)
const unwrapped = ref(false)
const success = ref(false)
const submitting = ref(false)

const form = reactive({
  name: '',
  phone: '',
  address: '',
  comment: '',
})

const onPhoneInput = (event: Event) => {
  handlePhoneInput(event, (val) => { form.phone = val })
}

const onPhonePaste = (event: ClipboardEvent) => {
  handlePhonePaste(event, (val) => { form.phone = val })
}

const formatPrice = (val: number) => {
  if (!val && val !== 0) return '0'
  return Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

const prefillForm = () => {
  if (!user.value) return
  if (!form.name) form.name = user.value.name || ''
  if (!form.phone) form.phone = formatKazakhstanPhone(user.value.phone || '')
  if (!form.address) form.address = user.value.address || ''
}

const loadGiftDetails = async () => {
  if (!cleanToken.value) {
    errorMessage.value = 'Код или токен подарка не указан.'
    pending.value = false
    return
  }

  pending.value = true
  errorMessage.value = ''

  try {
    const res = await request<any>(`/gifts/claim/${encodeURIComponent(cleanToken.value)}`)
    gift.value = res?.data || res
  } catch (err: any) {
    const data = err?.data ?? err?.response?._data
    errorMessage.value = data?.message || err?.message || 'Подарок не найден или ссылка недействительна.'
    gift.value = null
  } finally {
    pending.value = false
  }
}

onMounted(async () => {
  if (import.meta.client) {
    const saved = sessionStorage.getItem(`unwrapped_gift_${cleanToken.value}`)
    if (saved === '1') {
      unwrapped.value = true
    }
  }

  await loadGiftDetails()
  if (user.value) {
    prefillForm()
  }
})

watch(user, async (newUser) => {
  if (newUser) {
    prefillForm()
    await loadGiftDetails()
  }
})

const handleOpenAuth = () => {
  if (import.meta.client) {
    sessionStorage.setItem('pending_gift_claim_token', cleanToken.value)
    sessionStorage.setItem(`unwrapped_gift_${cleanToken.value}`, '1')
  }
  openAuthModal('login')
}

const unwrapGift = () => {
  setTimeout(() => {
    unwrapped.value = true
    if (import.meta.client) {
      sessionStorage.setItem(`unwrapped_gift_${cleanToken.value}`, '1')
      sessionStorage.setItem('pending_gift_claim_token', cleanToken.value)
    }

    if (!user.value) {
      openAuthModal('login')
    } else {
      prefillForm()
    }
  }, 350)
}

const submitClaim = async () => {
  if (!user.value) {
    handleOpenAuth()
    return
  }

  if (submitting.value) return

  submitting.value = true
  submitError.value = ''

  try {
    await request(`/gifts/claim/${encodeURIComponent(cleanToken.value)}`, {
      method: 'POST',
      body: {
        name: form.name,
        phone: form.phone,
        address: form.address,
        comment: form.comment || undefined,
      },
    })
    success.value = true
    if (import.meta.client) {
      sessionStorage.removeItem(`unwrapped_gift_${cleanToken.value}`)
      sessionStorage.removeItem('pending_gift_claim_token')
    }
    setTimeout(() => {
      router.push('/profile?section=history&tab=gifts')
    }, 2000)
  } catch (err: any) {
    const data = err?.data ?? err?.response?._data
    if (err?.statusCode === 401 || err?.status === 401) {
      handleOpenAuth()
      return
    }
    submitError.value = data?.message || data?.errors?.token?.[0] || 'Произошла ошибка при оформлении доставки.'
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

.subtitle {
  color: #666;
}

.form-hint {
  margin: 0.5rem 0 0;
  color: #666;
  font-size: 0.9rem;
}

.address-form-box {
  background: var(--surface-color, #fff);
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
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

.submit-error-banner {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.95rem;
}
</style>
