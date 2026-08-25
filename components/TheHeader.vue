<template>
  <header class="header">
    <!-- Logo -->
    <NuxtLink to="/" class="logo" @click="currentActive = 'Главная'">
      <div class="logo-badge">α</div>
      <span class="logo-text">Alpha</span>
    </NuxtLink>
    
    <!-- Navigation Links (Public pages only) -->
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
      <NuxtLink to="/cart" class="cart-btn" :class="{ active: route.path === '/cart' }">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <span class="cart-text">Корзина</span>
        <span v-if="cartTotalCount > 0" class="cart-count">{{ cartTotalCount }}</span>
      </NuxtLink>

      <!-- Profile Button (Not Logged In) -->
      <button v-if="!user" class="profile-btn" @click="openAuthModal('login')">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <span>Профиль</span>
      </button>

      <!-- Profile Dropdown Menu (Logged In) -->
      <div v-else class="profile-menu-container" ref="profileDropdownRef">
        <button 
          class="profile-btn logged-in" 
          :class="{ open: isProfileMenuOpen }"
          @click="isProfileMenuOpen = !isProfileMenuOpen"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>{{ user.name.split(' ')[0] }}</span>
          <svg class="dropdown-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        <!-- Dropdown Popup Card -->
        <Transition name="dropdown">
          <div v-if="isProfileMenuOpen" class="profile-dropdown-card">
            <div class="user-greeting-box">
              <div class="user-avatar-circle">
                <span>{{ user.name.charAt(0).toUpperCase() }}</span>
              </div>
              <div class="user-info-text">
                <strong>{{ user.name }}</strong>
                <p>{{ user.phone || user.email }}</p>
              </div>
            </div>

            <div class="dropdown-divider"></div>

            <div class="dropdown-nav-list">
              <NuxtLink to="/cabinet" class="dropdown-item" @click="closeMenuAndNav('Мой набор')">
                <span class="item-icon">🧸</span>
                <span>Мой набор</span>
              </NuxtLink>

              <NuxtLink to="/subscription" class="dropdown-item" @click="closeMenuAndNav('Подписка')">
                <span class="item-icon">💳</span>
                <span>Подписка</span>
              </NuxtLink>

              <NuxtLink to="/child" class="dropdown-item" @click="closeMenuAndNav('Ребёнок')">
                <span class="item-icon">👶</span>
                <span>Профиль ребёнка</span>
              </NuxtLink>

              <NuxtLink to="/history" class="dropdown-item" @click="closeMenuAndNav('История игрушек')">
                <span class="item-icon">🎠</span>
                <span>История игрушек</span>
              </NuxtLink>

              <NuxtLink to="/delivery" class="dropdown-item" @click="closeMenuAndNav('Доставка')">
                <span class="item-icon">🚚</span>
                <span>Доставка</span>
              </NuxtLink>
            </div>

            <div class="dropdown-divider"></div>

            <button class="logout-btn" @click="handleLogout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Выйти из аккаунта</span>
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const { user, openAuthModal, logout } = useAuth()
const route = useRoute()
const { totalCount: cartTotalCount } = useCart()

const isSearchOpen = ref<boolean>(false)
const isProfileMenuOpen = ref<boolean>(false)
const profileDropdownRef = ref<HTMLDivElement | null>(null)

interface NavItem {
  name: string
  to: string
  isExternal?: boolean
}

// Header Navigation Items
const navItems: NavItem[] = [
  { name: 'Главная', to: '/' },
  { name: 'Подписка', to: '/subscription' },
  { name: 'Краткосрочная аренда', to: '/short-rent' },
  { name: 'Подарок', to: '/gifts' },
  { name: 'Магазин', to: '/shop' },
  { name: 'FAQ', to: '/faq' },
  { name: 'Contact', to: '/contacts' },
]

const currentActive = ref<string>('Главная')

const handleNavClick = (item: NavItem) => {
  currentActive.value = item.name
}

const isItemActive = (item: NavItem) => {
  return currentActive.value === item.name
}

const closeMenuAndNav = (navName: string) => {
  currentActive.value = navName
  isProfileMenuOpen.value = false
}

const handleLogout = async () => {
  isProfileMenuOpen.value = false
  currentActive.value = 'Главная'
  await logout()
}

const handleClickOutside = (e: MouseEvent) => {
  if (profileDropdownRef.value && !profileDropdownRef.value.contains(e.target as Node)) {
    isProfileMenuOpen.value = false
  }
}

const syncActiveWithRoute = () => {
  if (route.path === '/contacts') {
    currentActive.value = 'Contact'
  } else if (route.path === '/faq') {
    currentActive.value = 'FAQ'
  } else if (route.path === '/gifts') {
    currentActive.value = 'Подарок'
  } else if (route.path === '/short-rent') {
    currentActive.value = 'Краткосрочная аренда'
  } else if (route.path === '/shop') {
    currentActive.value = 'Магазин'
  } else if (route.path === '/subscription') {
    currentActive.value = 'Подписка'
  } else if (route.path === '/') {
    currentActive.value = 'Главная'
  } else {
    currentActive.value = ''
  }
}

watch(() => route.fullPath, () => {
  syncActiveWithRoute()
  isProfileMenuOpen.value = false
})

onMounted(() => {
  syncActiveWithRoute()
  if (import.meta.client) {
    document.addEventListener('click', handleClickOutside)
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    document.removeEventListener('click', handleClickOutside)
  }
})
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 48px;
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
  width: 36px;
  height: 36px;
  background: #7C5CFC;
  border-radius: 12px;
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
  font-size: 24px;
  color: var(--text-dark);
  letter-spacing: -0.3px;
}

/* Nav */
.nav {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  flex: 1;
}

.nav-link {
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  font-size: 13.5px;
  color: var(--text-muted);
  text-decoration: none;
  padding: 7px 14px;
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
  width: 42px;
  height: 42px;
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
  padding: 9px 18px;
  border-radius: 50px;
  text-decoration: none;
  color: #1A1A2E;
  font-weight: 700;
  font-size: 14px;
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
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Profile Menu */
.profile-menu-container {
  position: relative;
}

.profile-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #FFFFFF;
  border: 1px solid #E2E2EC;
  padding: 9px 18px;
  border-radius: 50px;
  text-decoration: none;
  color: #1A1A2E;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'DM Sans', sans-serif;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}

.profile-btn:hover,
.profile-btn.open {
  border-color: #7C5CFC;
  color: #7C5CFC;
  box-shadow: 0 4px 12px rgba(124, 92, 252, 0.12);
  transform: translateY(-1px);
}

.dropdown-chevron {
  transition: transform 0.2s ease;
}

.profile-btn.open .dropdown-chevron {
  transform: rotate(180deg);
}

/* Profile Dropdown Card */
.profile-dropdown-card {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 260px;
  background: #FFFFFF;
  border-radius: 22px;
  padding: 16px;
  box-shadow: 0 16px 44px rgba(26, 26, 46, 0.14);
  border: 1px solid #ECECF4;
  z-index: 1000;
}

.user-greeting-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 6px 12px 6px;
}

.user-avatar-circle {
  width: 40px;
  height: 40px;
  background: #F0EDFF;
  color: #7C5CFC;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 16px;
  flex-shrink: 0;
}

.user-info-text strong {
  display: block;
  font-family: 'Outfit', sans-serif;
  font-size: 14.5px;
  font-weight: 800;
  color: #1A1A2E;
}

.user-info-text p {
  font-size: 12px;
  color: #7B7B93;
  margin-top: 1px;
}

.dropdown-divider {
  height: 1px;
  background: #F4F4F8;
  margin: 6px 0;
}

.dropdown-nav-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  color: #1A1A2E;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.15s ease;
}

.dropdown-item:hover {
  background: #F8F6FF;
  color: #7C5CFC;
}

.item-icon {
  font-size: 16px;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 12px;
  color: #E63946;
  background: transparent;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
  margin-top: 4px;
}

.logout-btn:hover {
  background: #FFF0F2;
}

/* Animations */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}

@media (max-width: 992px) {
  .header { padding: 14px 20px; }
  .nav { display: none; }
}
</style>
