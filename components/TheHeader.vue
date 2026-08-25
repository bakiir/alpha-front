<template>
  <header class="header">
    <!-- Logo -->
    <NuxtLink to="/" class="logo" @click="currentActive = 'Главная'">
      <div class="logo-badge">α</div>
      <span class="logo-text">Alpha</span>
    </NuxtLink>
    
    <!-- Navigation Links -->
    <nav class="nav">
      <template v-for="item in navItems" :key="item.name">
        <a 
          v-if="item.isExternal" 
          :href="item.to" 
          target="_blank" 
          class="nav-link"
          :class="{ active: currentActive === item.name }"
          @click="handleNavClick(item)"
        >
          {{ item.name }}
        </a>
        <NuxtLink 
          v-else 
          :to="item.to" 
          class="nav-link"
          :class="{ active: isItemActive(item) }"
          @click="handleNavClick(item)"
        >
          {{ item.name }}
        </NuxtLink>
      </template>
    </nav>
    
    <!-- Header Right Actions -->
    <div class="header-actions">
      <!-- Search Button -->
      <button class="search-btn" aria-label="Поиск" title="Поиск (Ctrl + K)" @click="isSearchOpen = true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="7"></circle>
          <line x1="21" y1="21" x2="16.5" y2="16.5"></line>
        </svg>
      </button>

      <!-- Search Modal -->
      <SearchModal v-model="isSearchOpen" />

      <!-- Cart Button -->
      <!-- Cart Button -->
      <NuxtLink to="/cart" class="cart-btn" :class="{ active: route.path === '/cart' }">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <span class="cart-text">Корзина</span>
        <span v-if="cartTotalCount > 0" class="cart-count">{{ cartTotalCount }}</span>
      </NuxtLink>

      <!-- Profile Button -->
      <button v-if="!user" class="profile-btn" @click="openAuthModal('login')">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <span>Профиль</span>
      </button>
      <NuxtLink v-else to="/cabinet" class="profile-btn" @click="currentActive = 'Ребёнок'">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <span>{{ user.name.split(' ')[0] }}</span>
      </NuxtLink>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const { user, openAuthModal } = useAuth()
const route = useRoute()
const { totalCount: cartTotalCount } = useCart()
const isSearchOpen = ref<boolean>(false)

interface NavItem {
  name: string
  to: string
  isExternal?: boolean
}

const navItems: NavItem[] = [
  { name: 'Главная', to: '/' },
  { name: 'Мой набор', to: '/cabinet' },
  { name: 'Подписка', to: '/subscription' },
  { name: 'Ребёнок', to: '/child' },
  { name: 'Доставка', to: '/delivery' },
  { name: 'История игрушек', to: '/history' },
  { name: 'Магазин', to: '/shop' },
  { name: 'Поддержка', to: '/support' },
]

const currentActive = ref<string>('Главная')

const handleNavClick = (item: NavItem) => {
  currentActive.value = item.name
}

const isItemActive = (item: NavItem) => {
  return currentActive.value === item.name
}

const syncActiveWithRoute = () => {
  if (route.path === '/support') {
    currentActive.value = 'Поддержка'
  } else if (route.path === '/shop') {
    currentActive.value = 'Магазин'
  } else if (route.path === '/history' || route.path === '/toy-history') {
    currentActive.value = 'История игрушек'
  } else if (route.path === '/delivery') {
    currentActive.value = 'Доставка'
  } else if (route.path === '/child') {
    currentActive.value = 'Ребёнок'
  } else if (route.path === '/subscription') {
    currentActive.value = 'Подписка'
  } else if (route.path === '/cabinet' || route.path === '/my-kit') {
    currentActive.value = 'Мой набор'
  } else if (route.path === '/') {
    currentActive.value = 'Главная'
  } else if (route.path === '/cart') {
    currentActive.value = ''
  }
}

watch(() => route.fullPath, () => {
  syncActiveWithRoute()
})

onMounted(() => {
  syncActiveWithRoute()
})
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 40px;
  width: 100%;
  min-height: 76px;
  background: var(--bg-primary);
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  gap: 24px;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
}

.logo-badge {
  width: 34px;
  height: 34px;
  background: #7C5CFC;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 20px;
  line-height: 1;
  box-shadow: 0 4px 12px rgba(124, 92, 252, 0.25);
}

.logo-text {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 22px;
  color: var(--text-dark);
  letter-spacing: -0.3px;
}

/* Nav */
.nav {
  display: flex;
  gap: 14px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  flex: 1;
}

.nav-link {
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: var(--text-muted);
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 50px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: nowrap;
  cursor: pointer;
}

.nav-link:hover {
  color: #7C5CFC;
  background: rgba(124, 92, 252, 0.06);
}

.nav-link.active {
  color: #7C5CFC;
  font-weight: 700;
  background: rgba(124, 92, 252, 0.12);
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.search-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #FFFFFF;
  border: 1px solid #E2E2EC;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1A1A2E;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}

.search-btn:hover {
  border-color: #7C5CFC;
  color: #7C5CFC;
  box-shadow: 0 4px 12px rgba(124, 92, 252, 0.12);
  transform: translateY(-1px);
}

.cart-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #FFFFFF;
  border: 1px solid #E2E2EC;
  padding: 8px 16px;
  border-radius: 50px;
  text-decoration: none;
  color: #1A1A2E;
  font-weight: 700;
  font-size: 13.5px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'DM Sans', sans-serif;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}

.cart-btn:hover {
  border-color: #7C5CFC;
  color: #7C5CFC;
  box-shadow: 0 4px 12px rgba(124, 92, 252, 0.12);
  transform: translateY(-1px);
}

.cart-text {
  font-family: 'DM Sans', sans-serif;
}

.cart-count {
  background: #7C5CFC;
  color: #FFFFFF;
  font-size: 11px;
  font-weight: 800;
  width: 19px;
  height: 19px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #FFFFFF;
  border: 1px solid #E2E2EC;
  padding: 8px 16px;
  border-radius: 50px;
  text-decoration: none;
  color: #1A1A2E;
  font-weight: 700;
  font-size: 13.5px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'DM Sans', sans-serif;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}

.profile-btn:hover {
  border-color: #7C5CFC;
  color: #7C5CFC;
  box-shadow: 0 4px 12px rgba(124, 92, 252, 0.12);
  transform: translateY(-1px);
}

@media (max-width: 1380px) {
  .header { padding: 12px 20px; }
  .nav { gap: 4px; }
  .nav-link { font-size: 12.5px; padding: 6px 9px; }
}

@media (max-width: 1080px) {
  .header { padding: 12px 16px; }
  .nav { display: none; }
}
</style>
