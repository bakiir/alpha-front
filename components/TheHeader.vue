<template>
  <header class="header">
    <NuxtLink to="/" class="logo">
      <div class="logo-icon">🧸</div>
      <span class="logo-text">Alpha</span>
    </NuxtLink>
    
    <nav class="nav">
      <a href="#how-it-works" class="nav-link">Как это работает</a>
      <a href="#benefits" class="nav-link">Преимущества</a>
      <a href="#pricing" class="nav-link">Тарифы</a>
      <a href="#faq" class="nav-link">Частые вопросы</a>
    </nav>
    
    <div class="header-actions">
      <NuxtLink v-if="user" to="/cabinet" class="cabinet-btn">
        <span class="avatar-dot"></span>
        <span>Кабинет ({{ user.name.split(' ')[0] }})</span>
      </NuxtLink>
      <button v-else class="login-text-btn" @click="openAuthModal('login')">
        Войти
      </button>

      <button class="btn-primary" @click="openQuiz()">
        Подобрать набор ✨
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
const { user, openAuthModal } = useAuth()
const { openQuiz } = useQuiz()
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 80px;
  width: 100%;
  height: 90px;
  background: var(--bg-primary);
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.logo-icon {
  font-size: 26px;
}

.logo-text {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 26px;
  color: var(--text-dark);
}

.nav {
  display: flex;
  gap: 32px;
  align-items: center;
}

.nav-link {
  font-weight: 600;
  font-size: 15px;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #7C5CFC;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.login-text-btn {
  background: transparent;
  border: none;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 15px;
  color: var(--text-dark);
  cursor: pointer;
  padding: 10px 18px;
  border-radius: 12px;
  transition: all 0.2s;
}

.login-text-btn:hover {
  background: rgba(0, 0, 0, 0.04);
  color: #7C5CFC;
}

.cabinet-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #FFFFFF;
  border: 1.5px solid #E2E2EC;
  padding: 10px 18px;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 700;
  font-size: 14px;
  color: #1A1A2E;
  transition: all 0.2s;
}

.cabinet-btn:hover {
  border-color: #7C5CFC;
  color: #7C5CFC;
  box-shadow: 0 4px 12px rgba(124, 92, 252, 0.12);
}

.avatar-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #06D6A0;
}

.btn-primary {
  box-shadow: 0 8px 24px rgba(124, 92, 252, 0.35);
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  transform: translateY(-1px);
}

@media (max-width: 992px) {
  .header { padding: 16px 24px; }
  .nav { display: none; }
}
</style>
