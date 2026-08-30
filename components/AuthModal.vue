<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isAuthModalOpen"
        class="modal-overlay"
        @click.self="handleOverlayClick"
      >
        <div class="modal-card">
          <button class="close-btn" @click="closeAuthModal" aria-label="Закрыть">&times;</button>

          <div class="modal-header">
            <div class="logo-box">
              <img src="/logo.png" alt="Alpha" class="modal-logo-img" />
            </div>
            <div class="tab-buttons">
              <button
                :class="['tab-btn', { active: authModalMode === 'login' }]"
                @click="switchMode('login')"
              >
                Вход
              </button>
              <button
                :class="['tab-btn', { active: authModalMode === 'register' }]"
                @click="switchMode('register')"
              >
                Регистрация
              </button>
            </div>
          </div>

          <div v-if="errorMessage" class="error-alert">
            <span class="alert-icon">⚠️</span>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Phone OTP — primary flow -->
          <div v-if="authMethod === 'phone'" class="auth-form">
            <div v-if="phoneStep === 'phone'" class="phone-step">
              <p class="phone-hint">
                {{ authModalMode === 'register' ? 'Быстрая регистрация по номеру телефона' : 'Войдите по номеру телефона' }}
              </p>
              <div class="form-group">
                <label for="auth-phone">Номер телефона</label>
                <input
                  id="auth-phone"
                  :value="phoneForm.phone"
                  type="tel"
                  placeholder="+7 (701) 000-00-00"
                  maxlength="18"
                  autocomplete="tel"
                  @input="onPhoneInput"
                />
              </div>
              <button type="button" class="submit-btn" :disabled="isLoading || !phoneForm.phone" @click="handleSendCode">
                <span v-if="isLoading" class="spinner"></span>
                <span v-else>Получить код</span>
              </button>
            </div>

            <div v-else-if="phoneStep === 'code'" class="phone-step">
              <p class="phone-hint">
                <template v-if="phoneDelivery === 'mock'">
                  SMS-провайдер не подключён — код показан ниже для разработки.
                </template>
                <template v-else>
                  Код отправлен на {{ phoneForm.phone }}
                </template>
              </p>
              <div v-if="devCode" class="dev-code-banner">
                <strong>Код для входа:</strong> {{ devCode }}
              </div>
              <div class="form-group">
                <label for="auth-code">Код из SMS</label>
                <input
                  id="auth-code"
                  v-model="phoneForm.code"
                  type="text"
                  inputmode="numeric"
                  placeholder="123456"
                  maxlength="6"
                  autocomplete="one-time-code"
                />
              </div>
              <div v-if="authModalMode === 'register'" class="form-group">
                <label for="auth-name">Ваше имя</label>
                <input id="auth-name" v-model="phoneForm.name" type="text" placeholder="Анна" required />
              </div>
              <div v-if="authModalMode === 'register'" class="form-group">
                <label for="auth-email-opt">Email (необязательно)</label>
                <input id="auth-email-opt" v-model="phoneForm.email" type="email" placeholder="name@example.com" />
              </div>
              <button type="button" class="submit-btn" :disabled="isLoading || phoneForm.code.length < 4" @click="handlePhoneSubmit">
                <span v-if="isLoading" class="spinner"></span>
                <span v-else>{{ authModalMode === 'register' ? 'Зарегистрироваться' : 'Войти' }}</span>
              </button>
              <button type="button" class="text-link-btn" @click="phoneStep = 'phone'; clearOtpSession()">Изменить номер</button>
            </div>
          </div>

          <!-- Email/password — secondary -->
          <form v-else-if="authModalMode === 'login'" @submit.prevent="handleLogin" class="auth-form">
            <div class="form-group">
              <label for="login-email">Email</label>
              <input id="login-email" v-model="loginForm.email" type="email" placeholder="name@example.com" required />
            </div>
            <div class="form-group">
              <label for="login-password">Пароль</label>
              <input id="login-password" v-model="loginForm.password" type="password" placeholder="••••••••" required />
            </div>
            <button type="submit" class="submit-btn" :disabled="isLoading">
              <span v-if="isLoading" class="spinner"></span>
              <span v-else>Войти по email</span>
            </button>
          </form>

          <form v-else @submit.prevent="handleRegister" class="auth-form">
            <div class="form-group">
              <label for="reg-name">Ваше имя</label>
              <input id="reg-name" v-model="regForm.name" type="text" placeholder="Анна Смирнова" required />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="reg-email">Email</label>
                <input id="reg-email" v-model="regForm.email" type="email" placeholder="name@example.com" required />
              </div>
              <div class="form-group">
                <label for="reg-phone">Телефон</label>
                <input
                  id="reg-phone"
                  :value="regForm.phone"
                  type="tel"
                  placeholder="+7 (701) 000-00-00"
                  maxlength="18"
                  @input="onRegPhoneInput"
                  required
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="reg-password">Пароль</label>
                <input id="reg-password" v-model="regForm.password" type="password" minlength="8" required />
              </div>
              <div class="form-group">
                <label for="reg-password-confirm">Повтор пароля</label>
                <input id="reg-password-confirm" v-model="regForm.password_confirmation" type="password" minlength="8" required />
              </div>
            </div>
            <button type="submit" class="submit-btn" :disabled="isLoading">
              <span v-if="isLoading" class="spinner"></span>
              <span v-else>Зарегистрироваться по email</span>
            </button>
          </form>

          <div class="method-switch">
            <button type="button" class="method-switch-btn" @click="toggleAuthMethod">
              {{ authMethod === 'phone' ? 'Войти по email и паролю' : 'Войти по номеру телефона' }}
            </button>
          </div>

          <div class="modal-footer">
            <p v-if="authModalMode === 'login'">
              Ещё нет аккаунта?
              <a href="#" @click.prevent="switchMode('register')">Зарегистрироваться</a>
            </p>
            <p v-else>
              Уже зарегистрированы?
              <a href="#" @click.prevent="switchMode('login')">Войти</a>
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const {
  isAuthModalOpen,
  authModalMode,
  isLoading,
  login,
  register,
  loginWithPhone,
  registerWithPhone,
  closeAuthModal,
  openAuthModal,
} = useAuth()
const { sendCode } = usePhoneAuth()

const errorMessage = ref('')
const authMethod = ref<'phone' | 'email'>('phone')
const phoneStep = ref<'phone' | 'code'>('phone')
const devCode = ref('')
const phoneDelivery = ref<'mock' | 'sms'>('mock')

const loginForm = reactive({ email: '', password: '' })
const regForm = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  password_confirmation: '',
})
const phoneForm = reactive({
  phone: '',
  code: '',
  name: '',
  email: '',
})

const OTP_SESSION_KEY = 'alpha_phone_otp_pending'

const persistOtpSession = () => {
  if (!import.meta.client) return
  sessionStorage.setItem(OTP_SESSION_KEY, JSON.stringify({
    phone: phoneForm.phone,
    step: phoneStep.value,
    mode: authModalMode.value,
    delivery: phoneDelivery.value,
    devCode: devCode.value,
    savedAt: Date.now(),
  }))
}

const clearOtpSession = () => {
  if (!import.meta.client) return
  sessionStorage.removeItem(OTP_SESSION_KEY)
}

const restoreOtpSession = () => {
  if (!import.meta.client) return
  const raw = sessionStorage.getItem(OTP_SESSION_KEY)
  if (!raw) return

  try {
    const data = JSON.parse(raw) as {
      phone?: string
      step?: 'phone' | 'code'
      mode?: 'login' | 'register'
      delivery?: 'mock' | 'sms'
      devCode?: string
      savedAt?: number
    }

    if (!data.savedAt || Date.now() - data.savedAt > 10 * 60 * 1000) {
      clearOtpSession()
      return
    }

    if (data.phone) phoneForm.phone = data.phone
    if (data.mode) authModalMode.value = data.mode
    if (data.delivery) phoneDelivery.value = data.delivery
    if (data.devCode) devCode.value = data.devCode
    if (data.step === 'code' && data.phone) {
      phoneStep.value = 'code'
    }
  } catch {
    clearOtpSession()
  }
}

watch(isAuthModalOpen, (open, wasOpen) => {
  if (open && !wasOpen) {
    authMethod.value = 'phone'
    errorMessage.value = ''
    restoreOtpSession()
    if (phoneStep.value !== 'code') {
      phoneStep.value = 'phone'
    }
  }

  if (!open) {
    // Keep OTP session while user is entering the code (modal can flicker on mobile).
    if (phoneStep.value !== 'code') {
      clearOtpSession()
    }
  }
})

const handleOverlayClick = () => {
  if (phoneStep.value === 'code') return
  closeAuthModal()
}

const switchMode = (mode: 'login' | 'register') => {
  authModalMode.value = mode
  authMethod.value = 'phone'
  phoneStep.value = 'phone'
  errorMessage.value = ''
}

const toggleAuthMethod = () => {
  authMethod.value = authMethod.value === 'phone' ? 'email' : 'phone'
  phoneStep.value = 'phone'
  errorMessage.value = ''
}

const onPhoneInput = (event: Event) => {
  handlePhoneInput(event, (val) => { phoneForm.phone = val })
}

const onRegPhoneInput = (event: Event) => {
  handlePhoneInput(event, (val) => { regForm.phone = val })
}

const handlePostAuthNavigation = () => {
  clearOtpSession()
  phoneStep.value = 'phone'

  if (import.meta.client) {
    const pendingGift = sessionStorage.getItem('pending_gift_code')
    if (pendingGift) {
      sessionStorage.removeItem('pending_gift_code')
      navigateTo(`/gifts/claim?code=${pendingGift}`)
      return
    }
  }

  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
  if (redirect.startsWith('/') && !redirect.startsWith('//')) {
    closeAuthModal()
    navigateTo(redirect)
    return
  }

  if (
    route.path.startsWith('/gifts/claim') ||
    route.path.startsWith('/checkout') ||
    route.path.startsWith('/cart') ||
    route.path.startsWith('/subscription') ||
    route.path.startsWith('/product')
  ) {
    closeAuthModal()
    return
  }

  navigateTo('/profile')
}

const handleSendCode = async () => {
  errorMessage.value = ''
  devCode.value = ''
  try {
    const res = await sendCode(phoneForm.phone)
    phoneDelivery.value = res.delivery === 'sms' ? 'sms' : 'mock'
    devCode.value = res.dev_code || ''
    phoneStep.value = 'code'
    openAuthModal(authModalMode.value)
    persistOtpSession()
    await nextTick()
    document.getElementById('auth-code')?.focus()
  } catch (err: any) {
    errorMessage.value = err?.data?.message || 'Не удалось отправить код. Проверьте номер.'
  }
}

const handlePhoneSubmit = async () => {
  errorMessage.value = ''
  try {
    if (authModalMode.value === 'register') {
      if (!phoneForm.name.trim()) {
        errorMessage.value = 'Укажите ваше имя'
        return
      }
      await registerWithPhone({
        phone: phoneForm.phone,
        code: phoneForm.code,
        name: phoneForm.name.trim(),
        email: phoneForm.email || undefined,
      })
    } else {
      await loginWithPhone(phoneForm.phone, phoneForm.code)
    }
    handlePostAuthNavigation()
  } catch (err: any) {
    errorMessage.value = err?.data?.message || 'Неверный код или ошибка авторизации'
  }
}

const handleLogin = async () => {
  errorMessage.value = ''
  try {
    await login({ email: loginForm.email, password: loginForm.password })
    handlePostAuthNavigation()
  } catch (err: any) {
    errorMessage.value = err?.data?.message || 'Неверный логин или пароль'
  }
}

const handleRegister = async () => {
  errorMessage.value = ''
  if (regForm.password !== regForm.password_confirmation) {
    errorMessage.value = 'Пароли не совпадают'
    return
  }
  try {
    await register(regForm)
    handlePostAuthNavigation()
  } catch (err: any) {
    errorMessage.value = err?.data?.message || 'Ошибка регистрации. Проверьте данные.'
  }
}
</script>

<style scoped>
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

.modal-card {
  position: relative;
  background: #FFFFFF;
  width: 100%;
  max-width: 480px;
  border-radius: 28px;
  padding: 36px;
  box-sizing: border-box;
  box-shadow: 0 25px 50px -12px rgba(26, 26, 46, 0.25);
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #F4F4F8;
  color: #4A4A68;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-header { text-align: center; margin-bottom: 24px; }
.logo-box { display: flex; justify-content: center; margin-bottom: 16px; }
.modal-logo-img { height: 48px; width: auto; }
.tab-buttons { display: flex; background: #F4F4F8; padding: 4px; border-radius: 14px; }
.tab-btn {
  flex: 1; padding: 10px; border-radius: 10px; border: none; background: transparent;
  font-weight: 700; font-size: 15px; color: #7B7B93; cursor: pointer;
}
.tab-btn.active { background: #FFFFFF; color: #7C5CFC; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.error-alert {
  display: flex; align-items: center; gap: 10px; background: #FFF0F2;
  border: 1px solid #FFD0D6; color: #E63946; padding: 12px 16px; border-radius: 14px; margin-bottom: 20px; font-size: 14px;
}
.auth-form { display: flex; flex-direction: column; gap: 16px; }
.phone-hint { font-size: 14px; color: #7B7B93; margin: 0 0 4px; text-align: center; }

.dev-code-banner {
  margin: 12px 0 16px;
  padding: 14px 16px;
  border-radius: 14px;
  background: #FFF8E6;
  border: 1px dashed #F5A623;
  text-align: center;
  font-size: 15px;
  color: #5C4A1F;
  letter-spacing: 0.04em;
}

.dev-code-banner strong { display: block; font-size: 12px; font-weight: 600; margin-bottom: 6px; color: #8A6D1F; text-transform: uppercase; letter-spacing: 0.06em; }
.form-row { display: flex; gap: 12px; }
.form-group { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 0; }
.form-group label { font-size: 13px; font-weight: 700; color: #1A1A2E; }
.form-group input {
  width: 100%; box-sizing: border-box; padding: 12px 14px; border: 1.5px solid #E2E2EC;
  border-radius: 12px; font-size: 14px; background: #FAFAFC;
}
.form-group input:focus { outline: none; border-color: #7C5CFC; background: #FFF; }
.submit-btn {
  margin-top: 4px; padding: 14px; border-radius: 14px; border: none; background: #7C5CFC;
  color: #FFF; font-weight: 700; font-size: 16px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
.text-link-btn {
  background: none; border: none; color: #7C5CFC; font-weight: 700; font-size: 13px; cursor: pointer;
}
.method-switch { text-align: center; margin-top: 12px; }
.method-switch-btn {
  background: none; border: none; color: #7B7B93; font-size: 13px; font-weight: 600;
  cursor: pointer; text-decoration: underline;
}
.modal-footer { text-align: center; margin-top: 16px; font-size: 14px; color: #7B7B93; }
.modal-footer a { color: #7C5CFC; font-weight: 700; text-decoration: none; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.spinner {
  width: 20px; height: 20px; border: 2.5px solid rgba(255,255,255,0.3);
  border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 540px) {
  .modal-card { padding: 24px 18px; max-height: 94vh; overflow-y: auto; }
  .form-row { flex-direction: column; }
}
</style>
