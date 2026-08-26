<template>
  <header class="header">
    <div class="header-inner">
      <!-- Logo -->
      <NuxtLink to="/" class="logo" @click="handleMobileNavClick('/')">
        <img src="/logo.png" alt="Alpha" class="logo-img" />
      </NuxtLink>
      
      <!-- Desktop Navigation Links -->
      <nav class="desktop-nav">
        <NuxtLink 
          to="/subscription" 
          class="nav-link"
          :class="{ active: route.path === '/subscription' }"
        >
          Подписка
        </NuxtLink>

        <NuxtLink 
          to="/#how-it-works" 
          class="nav-link"
        >
          Как это работает
        </NuxtLink>

        <NuxtLink 
          to="/shop" 
          class="nav-link"
          :class="{ active: route.path === '/shop' }"
        >
          Магазин
        </NuxtLink>

        <NuxtLink 
          to="/short-rent" 
          class="nav-link"
          :class="{ active: route.path === '/short-rent' }"
        >
          Краткосрочная аренда
        </NuxtLink>

        <NuxtLink 
          to="/faq" 
          class="nav-link"
          :class="{ active: route.path === '/faq' }"
        >
          FAQ
        </NuxtLink>

        <NuxtLink 
          to="/contacts" 
          class="nav-link"
          :class="{ active: route.path === '/contacts' }"
        >
          Контакты
        </NuxtLink>
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
        <NuxtLink to="/cart" class="cart-btn" :class="{ active: route.path === '/cart' }" @click="isMobileMenuOpen = false">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <span class="cart-text">Корзина</span>
          <span v-if="cartTotalCount > 0" class="cart-count">{{ cartTotalCount }}</span>
        </NuxtLink>

        <!-- Desktop Profile Button (Not Logged In) -->
        <button v-if="!user" class="profile-btn desktop-only" @click="openAuthModal('login')">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>Войти</span>
        </button>

        <!-- Desktop Profile Dropdown (Logged In) -->
        <div v-else class="profile-menu-container desktop-only" ref="profileDropdownRef">
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

                <NuxtLink to="/history" class="dropdown-item" @click="closeMenuAndNav('История заказов')">
                  <span class="item-icon">📦</span>
                  <span>История заказов</span>
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

        <!-- Mobile Hamburger Button -->
        <button 
          class="hamburger-btn mobile-only" 
          :class="{ active: isMobileMenuOpen }" 
          aria-label="Меню" 
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <span class="bar top"></span>
          <span class="bar middle"></span>
          <span class="bar bottom"></span>
        </button>
      </div>
    </div>

    <!-- Mobile Drawer Overlay & Menu -->
    <Teleport to="body">
      <Transition name="drawer-fade">
        <div v-if="isMobileMenuOpen" class="mobile-drawer-overlay" @click="isMobileMenuOpen = false">
          <div class="mobile-drawer-card" @click.stop>
            <!-- Drawer Header -->
            <div class="drawer-header">
              <NuxtLink to="/" class="drawer-logo" @click="handleMobileNavClick('/')">
                <img src="/logo.png" alt="Alpha" class="drawer-logo-img" />
              </NuxtLink>
              <button class="drawer-close-btn" @click="isMobileMenuOpen = false" aria-label="Закрыть">&times;</button>
            </div>

            <div class="drawer-body">
              <!-- User Profile Box in Drawer -->
              <div v-if="user" class="drawer-user-box">
                <div class="user-avatar-circle">
                  <span>{{ user.name.charAt(0).toUpperCase() }}</span>
                </div>
                <div class="user-info-text">
                  <strong>{{ user.name }}</strong>
                  <p>{{ user.phone || user.email }}</p>
                </div>
              </div>
              <div v-else class="drawer-auth-box">
                <p>Войдите, чтобы управлять наборами и отслеживать доставку</p>
                <button class="drawer-login-btn" @click="handleDrawerLogin">
                  Войти или зарегистрироваться
                </button>
              </div>

              <!-- Cabinet Links if Logged In -->
              <div v-if="user" class="drawer-section">
                <span class="drawer-section-title">ЛИЧНЫЙ КАБИНЕТ</span>
                <div class="drawer-links-group">
                  <NuxtLink to="/cabinet" class="drawer-link-item cabinet-link" @click="handleMobileNavClick('/cabinet')">
                    <span class="item-icon">🧸</span>
                    <span>Мой набор</span>
                  </NuxtLink>
                  <NuxtLink to="/subscription" class="drawer-link-item cabinet-link" @click="handleMobileNavClick('/subscription')">
                    <span class="item-icon">💳</span>
                    <span>Управление подпиской</span>
                  </NuxtLink>
                  <NuxtLink to="/child" class="drawer-link-item cabinet-link" @click="handleMobileNavClick('/child')">
                    <span class="item-icon">👶</span>
                    <span>Профиль ребёнка</span>
                  </NuxtLink>
                  <NuxtLink to="/history" class="drawer-link-item cabinet-link" @click="handleMobileNavClick('/history')">
                    <span class="item-icon">🎠</span>
                    <span>История игрушек</span>
                  </NuxtLink>
                  <NuxtLink to="/delivery" class="drawer-link-item cabinet-link" @click="handleMobileNavClick('/delivery')">
                    <span class="item-icon">🚚</span>
                    <span>Отслеживание доставки</span>
                  </NuxtLink>
                </div>
              </div>

              <!-- Main Site Navigation Links -->
              <div class="drawer-section">
                <span class="drawer-section-title">НАВИГАЦИЯ</span>
                <div class="drawer-links-group">
                  <NuxtLink to="/" class="drawer-link-item" :class="{ active: route.path === '/' }" @click="handleMobileNavClick('/')">
                    <span class="item-icon">🏠</span>
                    <span>Главная</span>
                  </NuxtLink>
                  <NuxtLink to="/subscription" class="drawer-link-item" :class="{ active: route.path === '/subscription' }" @click="handleMobileNavClick('/subscription')">
                    <span class="item-icon">✨</span>
                    <span>Тарифы подписки</span>
                  </NuxtLink>
                  <NuxtLink to="/short-rent" class="drawer-link-item" :class="{ active: route.path === '/short-rent' }" @click="handleMobileNavClick('/short-rent')">
                    <span class="item-icon">⏳</span>
                    <span>Краткосрочная аренда</span>
                  </NuxtLink>
                  <NuxtLink to="/gifts" class="drawer-link-item" :class="{ active: route.path === '/gifts' || route.path === '/gift-membership' }" @click="handleMobileNavClick('/gifts')">
                    <span class="item-icon">🎁</span>
                    <span>Подарочные сертификаты</span>
                  </NuxtLink>
                  <NuxtLink to="/shop" class="drawer-link-item" :class="{ active: route.path === '/shop' }" @click="handleMobileNavClick('/shop')">
                    <span class="item-icon">🛍️</span>
                    <span>Магазин эко-игрушек</span>
                  </NuxtLink>
                  <NuxtLink to="/faq" class="drawer-link-item" :class="{ active: route.path === '/faq' }" @click="handleMobileNavClick('/faq')">
                    <span class="item-icon">❓</span>
                    <span>Частые вопросы (FAQ)</span>
                  </NuxtLink>
                  <NuxtLink to="/contacts" class="drawer-link-item" :class="{ active: route.path === '/contacts' || route.path === '/contact' }" @click="handleMobileNavClick('/contacts')">
                    <span class="item-icon">📞</span>
                    <span>Контакты и шоурум</span>
                  </NuxtLink>
                </div>
              </div>

              <!-- Quick WhatsApp support in drawer -->
              <div class="drawer-whatsapp-box">
                <a href="https://wa.me/77071234567" target="_blank" class="drawer-wa-btn">
                  <span>💬 Написать нам в WhatsApp</span>
                </a>
              </div>

              <!-- Logout Button if logged in -->
              <button v-if="user" class="drawer-logout-btn" @click="handleDrawerLogout">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Выйти из аккаунта</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const { user, openAuthModal, logout } = useAuth()
const route = useRoute()
const { totalCount: cartTotalCount } = useCart()

const isSearchOpen = ref<boolean>(false)
const isProfileMenuOpen = ref<boolean>(false)
const isMobileMenuOpen = ref<boolean>(false)
const isMoreMenuOpen = ref<boolean>(false)
const profileDropdownRef = ref<HTMLDivElement | null>(null)

const isMoreActive = computed(() => {
  return ['/short-rent', '/gifts', '/gift-membership', '/contacts', '/contact', '/faq'].includes(route.path)
})

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
  { name: 'Контакты', to: '/contacts' },
]

const currentActive = ref<string>('Главная')

const handleNavClick = (item: NavItem) => {
  currentActive.value = item.name
}

const handleMobileNavClick = (path: string) => {
  isMobileMenuOpen.value = false
}

const handleDrawerLogin = () => {
  isMobileMenuOpen.value = false
  openAuthModal('login')
}

const handleDrawerLogout = async () => {
  isMobileMenuOpen.value = false
  await logout()
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
  if (route.path === '/contacts' || route.path === '/contact') {
    currentActive.value = 'Contact'
  } else if (route.path === '/faq') {
    currentActive.value = 'FAQ'
  } else if (route.path === '/gifts' || route.path === '/gift-membership') {
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
  isMobileMenuOpen.value = false
})

watch(isMobileMenuOpen, (isOpen) => {
  if (import.meta.client) {
    document.body.style.overflow = isOpen ? 'hidden' : ''
  }
})

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    if (isMobileMenuOpen.value) isMobileMenuOpen.value = false
    if (isProfileMenuOpen.value) isProfileMenuOpen.value = false
  }
}

onMounted(() => {
  syncActiveWithRoute()
  if (import.meta.client) {
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('keydown', handleKeyDown)
  }
})
</script>

<style scoped>
.header {
  width: 100%;
  background: var(--bg-primary);
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 36px;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  min-height: 84px;
  gap: 24px;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  flex-shrink: 0;
}

.logo-img {
  height: 46px;
  width: auto;
  object-fit: contain;
  display: block;
  transition: transform 0.2s ease;
}

.logo-img:hover {
  transform: scale(1.02);
}

/* Desktop Nav */
.desktop-nav {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  flex: 1;
}

.nav-link {
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  font-size: 14.5px;
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

.nav-dropdown-wrap {
  position: relative;
}

.more-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
}

.chevron-icon {
  transition: transform 0.2s ease;
}

.nav-dropdown-wrap:hover .chevron-icon {
  transform: rotate(180deg);
}

.more-dropdown-card {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: #FFFFFF;
  border-radius: 20px;
  border: 1px solid rgba(124, 92, 252, 0.12);
  box-shadow: 0 16px 36px rgba(26, 26, 46, 0.12);
  padding: 8px;
  min-width: 260px;
  z-index: 110;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.more-dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 14px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.more-dropdown-item:hover {
  background: #F4F0FF;
}

.more-dropdown-item .sub-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.more-dropdown-item .sub-info {
  display: flex;
  flex-direction: column;
}

.more-dropdown-item strong {
  font-size: 13px;
  font-weight: 700;
  color: #1A1A2E;
}

.more-dropdown-item small {
  font-size: 11.5px;
  color: #7B7B93;
}

.whatsapp-quick-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #E8FAF4;
  border: 1px solid #A7F3D0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.whatsapp-quick-btn:hover {
  background: #059669;
  border-color: #059669;
}

.whatsapp-quick-btn:hover svg path {
  stroke: #FFFFFF;
}

.header-cta-btn {
  background: var(--color-primary);
  color: #FFFFFF;
  font-weight: 700;
  font-size: 13.5px;
  padding: 10px 20px;
  border-radius: 50px;
  text-decoration: none;
  box-shadow: 0 4px 14px rgba(124, 92, 252, 0.25);
  transition: all 0.2s ease;
  white-space: nowrap;
}

.header-cta-btn:hover {
  background: #6544E0;
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(124, 92, 252, 0.35);
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

/* Dropdown Card */
.profile-dropdown-card {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 260px;
  background: #FFFFFF;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 16px 36px rgba(26, 26, 46, 0.12);
  border: 1px solid rgba(0, 0, 0, 0.04);
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
  border-radius: 50%;
  background: linear-gradient(135deg, #7C5CFC 0%, #A284F6 100%);
  color: #FFFFFF;
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
  font-size: 14px;
  color: #1A1A2E;
}

.user-info-text p {
  font-size: 12px;
  color: #7B7B93;
  margin: 0;
}

.dropdown-divider {
  height: 1px;
  background: #F4F4F8;
  margin: 8px 0;
}

.dropdown-nav-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  text-decoration: none;
  color: #4A4A68;
  font-size: 13.5px;
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
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  border: none;
  background: transparent;
  color: #FF5A5F;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease;
}

.logout-btn:hover {
  background: #FFF0F0;
}

/* Hamburger Button */
.hamburger-btn {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: #FFFFFF;
  border: 1px solid #E2E2EC;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s ease;
}

.hamburger-btn .bar {
  width: 18px;
  height: 2px;
  background: #1A1A2E;
  border-radius: 2px;
  transition: all 0.25s ease;
}

.hamburger-btn.active .bar.top {
  transform: translateY(7px) rotate(45deg);
}

.hamburger-btn.active .bar.middle {
  opacity: 0;
}

.hamburger-btn.active .bar.bottom {
  transform: translateY(-7px) rotate(-45deg);
}

.desktop-only { display: flex; }
.mobile-only { display: none; }

/* Mobile Drawer Overlay */
.mobile-drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 26, 46, 0.45);
  backdrop-filter: blur(6px);
  z-index: 99999;
  display: flex;
  justify-content: flex-end;
}

.mobile-drawer-card {
  width: 85%;
  max-width: 360px;
  height: 100%;
  background: #FFFFFF;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #F4F4F8;
}

.drawer-logo-img {
  height: 38px;
  width: auto;
  object-fit: contain;
}

.drawer-close-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #F4F4F8;
  border: none;
  font-size: 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4A4A68;
}

.drawer-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
}

.drawer-user-box {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #F8F6FF;
  border-radius: 16px;
  padding: 12px 14px;
}

.drawer-auth-box {
  background: #F8F6FF;
  border-radius: 18px;
  padding: 16px;
  text-align: center;
}

.drawer-auth-box p {
  font-size: 13px;
  color: #7B7B93;
  margin-bottom: 12px;
  line-height: 1.4;
}

.drawer-login-btn {
  width: 100%;
  background: #624CE0;
  color: #FFFFFF;
  border: none;
  font-weight: 700;
  font-size: 13.5px;
  padding: 10px 16px;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(98, 76, 224, 0.25);
}

.drawer-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.drawer-section-title {
  font-family: 'Outfit', sans-serif;
  font-size: 10.5px;
  font-weight: 800;
  color: #7C5CFC;
  letter-spacing: 1px;
}

.drawer-links-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.drawer-link-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border-radius: 14px;
  text-decoration: none;
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  font-size: 14.5px;
  color: #1A1A2E;
  transition: all 0.15s ease;
}

.drawer-link-item:hover,
.drawer-link-item.active {
  background: #F0EDFF;
  color: #624CE0;
  font-weight: 700;
}

.drawer-whatsapp-box {
  margin-top: auto;
  padding-top: 12px;
}

.drawer-wa-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #E8FAF4;
  color: #058563;
  font-weight: 700;
  font-size: 13.5px;
  padding: 12px;
  border-radius: 14px;
  text-decoration: none;
  text-align: center;
}

.drawer-logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #FFF0F0;
  color: #FF5A5F;
  border: none;
  padding: 11px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
}

/* Transitions */
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.25s ease;
}
.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

.drawer-fade-enter-active .mobile-drawer-card {
  transition: transform 0.25s ease;
}
.drawer-fade-leave-active .mobile-drawer-card {
  transition: transform 0.25s ease;
}
.drawer-fade-enter-from .mobile-drawer-card {
  transform: translateX(100%);
}
.drawer-fade-leave-to .mobile-drawer-card {
  transform: translateX(100%);
}

/* RESPONSIVE MEDIA QUERIES */
@media (max-width: 1080px) {
  .desktop-nav {
    display: none;
  }

  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: flex;
  }

  .header-inner {
    padding: 14px 20px;
    min-height: 72px;
  }

  .logo-img {
    height: 40px;
  }
}

@media (max-width: 480px) {
  .header-inner {
    padding: 12px 16px;
  }

  .cart-text {
    display: none;
  }

  .cart-btn {
    padding: 8px 12px;
  }

  .logo-img {
    height: 36px;
  }
}
</style>
