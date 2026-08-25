<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isAuthModalOpen" class="modal-overlay" @click.self="closeAuthModal">
        <div class="modal-card">
          <button class="close-btn" @click="closeAuthModal" aria-label="Закрыть">&times;</button>

          <!-- Header / Tabs -->
          <div class="modal-header">
            <div class="logo-badge">
              <span class="logo-icon">🧸</span>
              <span class="logo-text">Alpha</span>
            </div>
            <div class="tab-buttons">
              <button 
                :class="['tab-btn', { active: authModalMode === 'login' }]"
                @click="authModalMode = 'login'"
              >
                Вход
              </button>
              <button 
                :class="['tab-btn', { active: authModalMode === 'register' }]"
                @click="authModalMode = 'register'"
              >
                Регистрация
              </button>
            </div>
          </div>

          <!-- Error Alert -->
          <div v-if="errorMessage" class="error-alert">
            <span class="alert-icon">⚠️</span>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Login Form -->
          <form v-if="authModalMode === 'login'" @submit.prevent="handleLogin" class="auth-form">
            <div class="form-group">
              <label for="login-email">Email</label>
              <input 
                id="login-email"
                v-model="loginForm.email" 
                type="email" 
                placeholder="name@example.com" 
                required 
              />
            </div>

            <div class="form-group">
              <label for="login-password">Пароль</label>
              <input 
                id="login-password"
                v-model="loginForm.password" 
                type="password" 
                placeholder="••••••••" 
                required 
              />
            </div>

            <button type="submit" class="submit-btn" :disabled="isLoading">
              <span v-if="isLoading" class="spinner"></span>
              <span v-else>Войти в личный кабинет</span>
            </button>
          </form>

          <!-- Register Form -->
          <form v-else @submit.prevent="handleRegister" class="auth-form">
            <div class="form-group">
              <label for="reg-name">Ваше имя (родитель)</label>
              <input 
                id="reg-name"
                v-model="regForm.name" 
                type="text" 
                placeholder="Анна Смирнова" 
                required 
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="reg-email">Email</label>
                <input 
                  id="reg-email"
                  v-model="regForm.email" 
                  type="email" 
                  placeholder="name@example.com" 
                  required 
                />
              </div>
              <div class="form-group">
                <label for="reg-phone">Телефон</label>
                <input 
                  id="reg-phone"
                  v-model="regForm.phone" 
                  type="tel" 
                  placeholder="+7 (701) 000-00-00" 
                  required 
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="reg-password">Пароль</label>
                <input 
                  id="reg-password"
                  v-model="regForm.password" 
                  type="password" 
                  placeholder="Минимум 8 символов" 
                  minlength="8"
                  required 
                />
              </div>
              <div class="form-group">
                <label for="reg-password-confirm">Повтор пароля</label>
                <input 
                  id="reg-password-confirm"
                  v-model="regForm.password_confirmation" 
                  type="password" 
                  placeholder="••••••••" 
                  minlength="8"
                  required 
                />
              </div>
            </div>

            <button type="submit" class="submit-btn" :disabled="isLoading">
              <span v-if="isLoading" class="spinner"></span>
              <span v-else>Зарегистрироваться</span>
            </button>
          </form>

          <div class="modal-footer">
            <p v-if="authModalMode === 'login'">
              Ещё нет аккаунта? 
              <a href="#" @click.prevent="authModalMode = 'register'">Зарегистрироваться</a>
            </p>
            <p v-else>
              Уже зарегистрированы? 
              <a href="#" @click.prevent="authModalMode = 'login'">Войти</a>
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const { isAuthModalOpen, authModalMode, isLoading, login, register, closeAuthModal } = useAuth()

const errorMessage = ref<string>('')

const loginForm = reactive({
  email: '',
  password: '',
})

const regForm = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  password_confirmation: '',
})

const handleLogin = async () => {
  errorMessage.value = ''
  try {
    await login({
      email: loginForm.email,
      password: loginForm.password,
    })
    navigateTo('/cabinet')
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
    navigateTo('/cabinet')
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
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #E8E8EE;
  color: #1A1A2E;
}

.modal-header {
  text-align: center;
  margin-bottom: 24px;
}

.logo-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 24px;
  color: #1A1A2E;
}

.tab-buttons {
  display: flex;
  background: #F4F4F8;
  padding: 4px;
  border-radius: 14px;
  margin-top: 8px;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  border: none;
  background: transparent;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 15px;
  color: #7B7B93;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: #FFFFFF;
  color: #7C5CFC;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.error-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #FFF0F2;
  border: 1px solid #FFD0D6;
  color: #E63946;
  padding: 12px 16px;
  border-radius: 14px;
  margin-bottom: 20px;
  font-size: 14px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.form-row {
  display: flex;
  gap: 12px;
  width: 100%;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.form-group label {
  font-size: 13px;
  font-weight: 700;
  color: #1A1A2E;
}

.form-group input {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  border: 1.5px solid #E2E2EC;
  border-radius: 12px;
  font-size: 14px;
  color: #1A1A2E;
  background: #FAFAFC;
  transition: all 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #7C5CFC;
  background: #FFFFFF;
  box-shadow: 0 0 0 3px rgba(124, 92, 252, 0.15);
}

.submit-btn {
  margin-top: 8px;
  padding: 14px;
  border-radius: 14px;
  border: none;
  background: #7C5CFC;
  color: #FFFFFF;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(124, 92, 252, 0.35);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-btn:hover:not(:disabled) {
  background: #6848e0;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.modal-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #7B7B93;
}

.modal-footer a {
  color: #7C5CFC;
  font-weight: 700;
  text-decoration: none;
}

.modal-footer a:hover {
  text-decoration: underline;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
