<template>
  <header class="header">
    <!-- Top Header Main Bar -->
    <div class="header-main-bar">
      <div class="header-inner">
        <!-- Brand Logo -->
        <NuxtLink to="/" class="logo" @click="handleMobileNavClick('/')">
          <img src="/logo.png" alt="Alpha" class="logo-img" />
        </NuxtLink>

        <!-- Catalog Button with Dropdown -->
        <div class="catalog-btn-wrapper" ref="catalogWrapperRef">
          <button 
            class="catalog-btn" 
            :class="{ active: isCatalogOpen }"
            @click="toggleCatalog"
            aria-label="Каталог игрушек"
          >
            <span class="catalog-icon">
              <span class="c-bar" :class="{ open: isCatalogOpen }"></span>
              <span class="c-bar" :class="{ open: isCatalogOpen }"></span>
              <span class="c-bar" :class="{ open: isCatalogOpen }"></span>
            </span>
            <span class="catalog-btn-text">Каталог</span>
          </button>

          <!-- Catalog Mega-Menu Dropdown -->
          <Transition name="catalog-dropdown">
            <div v-if="isCatalogOpen" class="catalog-mega-card" @click.stop>
              <div class="catalog-mega-body">
                <!-- Column 1: Development Categories -->
                <div class="mega-col categories-col">
                  <span class="mega-col-heading">Категории развития</span>

                  <div class="mega-list">
                    <button 
                      v-for="cat in visibleCategories" 
                      :key="cat.id"
                      class="mega-item-btn"
                      @click="selectCatalogCategory(cat.name)"
                    >
                      <div class="cat-icon-circle">
                        <!-- Monochrome outline SVG icon (#624CE0 on #EDE9FF) -->
                        <svg v-if="cat.id === 'fine_motor'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#624CE0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <rect x="3" y="3" width="7" height="7"></rect>
                          <rect x="14" y="3" width="7" height="7"></rect>
                          <rect x="14" y="14" width="7" height="7"></rect>
                          <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        <svg v-else-if="cat.id === 'gross_motor'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#624CE0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="5" r="3"></circle>
                          <path d="M6.5 9a11.5 11.5 0 0 0 11 0"></path>
                          <path d="M12 12v9"></path>
                          <path d="M8 21l4-4 4 4"></path>
                        </svg>
                        <svg v-else-if="cat.id === 'logic'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#624CE0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"></path>
                          <path d="M9 21h6"></path>
                        </svg>
                        <svg v-else-if="cat.id === 'montessori'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#624CE0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        <svg v-else-if="cat.id === 'sensory'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#624CE0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="12" r="5"></circle>
                          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
                        </svg>
                        <svg v-else-if="cat.id === 'language'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#624CE0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#624CE0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2z"></path>
                        </svg>
                      </div>

                      <div class="mega-item-text">
                        <div class="item-title-row">
                          <span class="item-title">{{ cat.name }}</span>
                          <span v-if="cat.isTop" class="cat-top-badge">ТОП</span>
                        </div>
                        <span class="item-desc">{{ cat.desc }}</span>
                      </div>
                    </button>

                    <!-- Expand / Collapse 4 vs All Toggle -->
                    <button 
                      class="categories-expand-btn"
                      @click="isAllCategoriesExpanded = !isAllCategoriesExpanded"
                    >
                      <span v-if="!isAllCategoriesExpanded">+ ещё {{ catalogCategories.length - 4 }} категории ▾</span>
                      <span v-else>Свернуть список ▴</span>
                    </button>
                  </div>
                </div>

                <!-- Column 2: Compact Age Chips / Pills -->
                <div class="mega-col ages-col">
                  <span class="mega-col-heading">По возрасту</span>
                  <div class="age-chips-grid">
                    <button 
                      v-for="age in catalogAges" 
                      :key="age.id"
                      class="age-chip-btn"
                      @click="selectCatalogAge(age.id)"
                    >
                      {{ age.label }}
                    </button>
                    <button 
                      class="age-chip-btn all-ages"
                      @click="selectCatalogAge('all')"
                    >
                      Все возраста
                    </button>
                  </div>
                </div>
              </div>

              <!-- Mega Menu Footer with Arrow Button -->
              <div class="catalog-mega-footer">
                <NuxtLink to="/shop" class="all-catalog-link" @click="isCatalogOpen = false">
                  <span class="footer-link-text">Перейти во весь каталог эко-игрушек (40+ моделей)</span>
                  <div class="footer-arrow-circle">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </div>
                </NuxtLink>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Center Search Input -->
        <div class="header-search-box">
          <form class="search-form" @submit.prevent="handleHeaderSearch">
            <input 
              v-model="headerSearchQuery"
              type="text" 
              placeholder="Поиск..."
              class="search-input"
              @keydown.enter="handleHeaderSearch"
            />
            <button type="submit" class="search-submit-btn" aria-label="Искать">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="7"></circle>
                <line x1="21" y1="21" x2="16.5" y2="16.5"></line>
              </svg>
            </button>
          </form>
        </div>

        <!-- Header Right Actions: Избранные, Войти, Корзина -->
        <div class="header-actions">
          <!-- Favorites Action -->
          <NuxtLink to="/profile?section=favorites" class="header-action-item" title="Избранные">
            <div class="action-icon-wrap">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <span v-if="favoritesCount > 0" class="action-badge fav-badge">{{ favoritesCount }}</span>
            </div>
            <span class="action-label">Избранные</span>
          </NuxtLink>

          <!-- Cart Action -->
          <NuxtLink to="/cart" class="header-action-item cart-action" title="Корзина">
            <div class="action-icon-wrap">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span v-if="cartTotalCount > 0" class="action-badge cart-badge">{{ cartTotalCount }}</span>
            </div>
            <span class="action-label">Корзина</span>
          </NuxtLink>

          <!-- Profile / Auth (Not logged in) -->
          <NuxtLink v-if="!user" to="/profile" class="header-action-item">
            <div class="action-icon-wrap">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <span class="action-label">Войти</span>
          </NuxtLink>

          <!-- Profile (Logged in) -->
          <div v-else class="profile-menu-container" ref="profileDropdownRef">
            <button 
              class="header-action-item" 
              :class="{ active: isProfileMenuOpen }"
              @click="isProfileMenuOpen = !isProfileMenuOpen"
            >
              <div class="action-icon-wrap user-avatar-icon">
                <span>{{ user.name.charAt(0).toUpperCase() }}</span>
              </div>
              <span class="action-label">Привет, {{ firstName }}</span>
            </button>

            <!-- Dropdown Popup Card -->
            <Transition name="dropdown">
              <div v-if="isProfileMenuOpen" class="profile-dropdown-card">
                <div class="user-greeting-box">
                  <div class="user-avatar-circle">
                    <span>{{ user.name.charAt(0).toUpperCase() }}</span>
                  </div>
                  <div class="user-info-text">
                    <strong>Привет, {{ firstName }}</strong>
                    <p>{{ user.phone || user.email }}</p>
                  </div>
                </div>

                <div class="dropdown-divider"></div>

                <div class="dropdown-nav-list">
                  <NuxtLink to="/profile" class="dropdown-item" @click="closeMenuAndNav('Профиль')">
                    <span class="item-icon">👤</span>
                    <span>Мой профиль</span>
                  </NuxtLink>

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
    </div>

    <!-- Sleek Desktop Site Navigation Bar (Clean White Bar with Soft Pills) -->
    <nav class="header-sub-nav desktop-only">
      <div class="sub-nav-inner">
        <ul class="sub-nav-list">
          <li v-for="item in navItems" :key="item.name" class="sub-nav-item">
            <NuxtLink 
              :to="item.to" 
              class="sub-nav-link"
              :class="{ active: currentActive === item.name || route.path === item.to }"
              @click="handleNavClick(item)"
            >
              <span>{{ item.name }}</span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </nav>

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
              <!-- Search inside drawer on mobile -->
              <div class="drawer-search-box">
                <form class="search-form" @submit.prevent="handleHeaderSearch">
                  <input 
                    v-model="headerSearchQuery"
                    type="text" 
                    placeholder="Поиск по каталогу..."
                    class="search-input"
                  />
                  <button type="submit" class="search-submit-btn" aria-label="Искать">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="11" cy="11" r="7"></circle>
                      <line x1="21" y1="21" x2="16.5" y2="16.5"></line>
                    </svg>
                  </button>
                </form>
              </div>

              <!-- User Profile Box in Drawer -->
              <div v-if="user" class="drawer-user-box">
                <div class="user-avatar-circle">
                  <span>{{ user.name.charAt(0).toUpperCase() }}</span>
                </div>
                <div class="user-info-text">
                  <strong>Привет, {{ firstName }}</strong>
                  <p>{{ user.phone || user.email }}</p>
                </div>
              </div>
              <div v-else class="drawer-auth-box">
                <p>Войдите, чтобы управлять наборами и отслеживать доставку</p>
                <button class="drawer-login-btn" @click="handleDrawerLogin">
                  Войти или зарегистрироваться
                </button>
              </div>

              <!-- Catalog Shortcut in Drawer -->
              <div class="drawer-section">
                <span class="drawer-section-title">КАТАЛОГ ИГРУШЕК</span>
                <NuxtLink to="/shop" class="drawer-catalog-promo" @click="handleMobileNavClick('/shop')">
                  <span class="promo-icon">🎁</span>
                  <div class="promo-text">
                    <strong>Все эко-игрушки (40+)</strong>
                    <small>Монтессори, моторика, логика</small>
                  </div>
                  <span class="promo-arrow">➔</span>
                </NuxtLink>
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
                    <span class="item-icon">📦</span>
                    <span>История заказов</span>
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
                  <NuxtLink to="/shop" class="drawer-link-item" :class="{ active: route.path === '/shop' }" @click="handleMobileNavClick('/shop')">
                    <span class="item-icon">🛍️</span>
                    <span>Магазин</span>
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
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const { user, logout } = useAuth()
const route = useRoute()
const router = useRouter()
const { totalCount: cartTotalCount } = useCart()
const { count: favoritesCount } = useFavorites()

const firstName = computed(() => user.value?.name?.trim().split(/\s+/)[0] || 'друг')

const isCatalogOpen = ref<boolean>(false)
const isProfileMenuOpen = ref<boolean>(false)
const isMobileMenuOpen = ref<boolean>(false)
const headerSearchQuery = ref<string>('')

const catalogWrapperRef = ref<HTMLDivElement | null>(null)
const profileDropdownRef = ref<HTMLDivElement | null>(null)

interface NavItem {
  name: string
  to: string
}

// Navigation Items
const navItems: NavItem[] = [
  { name: 'Главная', to: '/' },
  { name: 'Магазин', to: '/shop' },
  { name: 'Подписка', to: '/subscription' },
  { name: 'Краткосрочная аренда', to: '/short-rent' },
  { name: 'Подарок', to: '/gifts' },
  { name: 'FAQ', to: '/faq' },
  { name: 'Контакты', to: '/contacts' },
]

// Catalog Mega-Menu Categories
const isAllCategoriesExpanded = ref(false)

const catalogCategories = [
  { id: 'fine_motor', name: 'Мелкая моторика', desc: 'Балансиры, шнуровки, сортеры', isTop: true },
  { id: 'gross_motor', name: 'Крупная моторика', desc: 'Качалки, лазалки, балансборды' },
  { id: 'logic', name: 'Логика и мышление', desc: 'Головоломки, лабиринты, пазлы' },
  { id: 'montessori', name: 'Методика Монтессори', desc: 'Классические Монтессори материалы' },
  { id: 'sensory', name: 'Сенсорное развитие', desc: 'Тактильные пирамидки, фактуры' },
  { id: 'language', name: 'Речь и коммуникация', desc: 'Звуковые кубики, карточки' },
  { id: 'creativity', name: 'Творчество и воображение', desc: 'Деревянные конструкторы, мозаики' },
]

const visibleCategories = computed(() => {
  return isAllCategoriesExpanded.value ? catalogCategories : catalogCategories.slice(0, 4)
})

// Catalog Mega-Menu Ages (Compact Chips)
const catalogAges = [
  { id: '0-1', label: '0–1 года' },
  { id: '1-2', label: '1–2 года' },
  { id: '2-3', label: '2–3 года' },
  { id: '3-4', label: '3–4 года' },
  { id: '4-6', label: '4–6 лет' },
]

const currentActive = ref<string>('Главная')

const getNavIcon = (name: string) => {
  const map: Record<string, string> = {
    'Главная': '🏠',
    'Магазин': '🛍️',
    'Подписка': '✨',
    'Краткосрочная аренда': '⏳',
    'Подарок': '🎁',
    'FAQ': '❓',
    'Контакты': '📞',
  }
  return map[name] || '📌'
}

const toggleCatalog = () => {
  isCatalogOpen.value = !isCatalogOpen.value
}

const selectCatalogCategory = (catName: string) => {
  isCatalogOpen.value = false
  router.push(`/shop?category=${encodeURIComponent(catName)}`)
}

const selectCatalogAge = (ageId: string) => {
  isCatalogOpen.value = false
  if (ageId === 'all') {
    router.push('/shop')
  } else {
    router.push(`/shop?age=${encodeURIComponent(ageId)}`)
  }
}

const handleHeaderSearch = () => {
  isMobileMenuOpen.value = false
  if (headerSearchQuery.value.trim()) {
    router.push(`/shop?search=${encodeURIComponent(headerSearchQuery.value.trim())}`)
  } else {
    router.push('/shop')
  }
}

const handleNavClick = (item: NavItem) => {
  currentActive.value = item.name
}

const handleMobileNavClick = (path: string) => {
  isMobileMenuOpen.value = false
}

const handleDrawerLogin = () => {
  isMobileMenuOpen.value = false
  router.push('/profile')
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
  const target = e.target as Node
  if (catalogWrapperRef.value && !catalogWrapperRef.value.contains(target)) {
    isCatalogOpen.value = false
  }
  if (profileDropdownRef.value && !profileDropdownRef.value.contains(target)) {
    isProfileMenuOpen.value = false
  }
}

const syncActiveWithRoute = () => {
  if (route.path === '/contacts' || route.path === '/contact') {
    currentActive.value = 'Контакты'
  } else if (route.path === '/faq') {
    currentActive.value = 'FAQ'
  } else if (route.path === '/gifts' || route.path === '/gift-membership') {
    currentActive.value = 'Подарок'
  } else if (route.path === '/short-rent') {
    currentActive.value = 'Краткосрочная аренда'
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
  isCatalogOpen.value = false
})

watch(isMobileMenuOpen, (isOpen) => {
  if (import.meta.client) {
    document.body.style.overflow = isOpen ? 'hidden' : ''
  }
})

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    if (isCatalogOpen.value) isCatalogOpen.value = false
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
  z-index: 1000;
  backdrop-filter: blur(10px);
}

/* 1. TOP MAIN BAR */
.header-main-bar {
  width: 100%;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 36px;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  min-height: 94px;
  gap: 28px;
}

/* 2. Sleek Desktop Site Navigation Bar (White, Clean, No Clutter) */
.header-sub-nav {
  width: 100%;
  background: #FFFFFF;
  border-top: 1px solid #EAEAF2;
  border-bottom: 1px solid #EAEAF2;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}

.sub-nav-inner {
  max-width: 1440px;
  margin: 0 auto;
  padding: 6px 36px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.sub-nav-list {
  display: flex;
  align-items: center;
  gap: 6px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.sub-nav-item {
  display: flex;
  align-items: center;
}

.sub-nav-link {
  padding: 6px 14px;
  border-radius: 50px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px;
  font-weight: 600;
  color: #4A4A68;
  text-decoration: none;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
}

.sub-nav-link:hover {
  color: #624CE0;
  background: #EDE9FF;
}

.sub-nav-link.active {
  color: #624CE0;
  font-weight: 700;
  background: #EDE9FF;
}

.desktop-only {
  display: block;
}

@media (max-width: 960px) {
  .desktop-only {
    display: none !important;
  }
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  flex-shrink: 0;
}

.logo-img {
  height: 50px;
  width: auto;
  object-fit: contain;
  display: block;
  transition: transform 0.2s ease;
}

.logo-img:hover {
  transform: scale(1.02);
}

/* Catalog Button & Wrapper */
.catalog-btn-wrapper {
  position: relative;
  flex-shrink: 0;
}

.catalog-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #624CE0;
  color: #FFFFFF;
  border: none;
  padding: 13px 26px;
  border-radius: 16px;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(98, 76, 224, 0.28);
  transition: all 0.2s ease;
}

.catalog-btn:hover,
.catalog-btn.active {
  background: #513bc7;
  box-shadow: 0 6px 18px rgba(98, 76, 224, 0.35);
  transform: translateY(-1px);
}

.catalog-icon {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3.5px;
  width: 16px;
  height: 14px;
}

.c-bar {
  display: block;
  width: 100%;
  height: 2px;
  background: #FFFFFF;
  border-radius: 2px;
  transition: all 0.2s ease;
}

.catalog-btn.active .c-bar:nth-child(1) {
  transform: translateY(5.5px) rotate(45deg);
}

.catalog-btn.active .c-bar:nth-child(2) {
  opacity: 0;
}

.catalog-btn.active .c-bar:nth-child(3) {
  transform: translateY(-5.5px) rotate(-45deg);
}

/* Catalog Mega-Menu Card (Simplified 2-column, reduced noise by >40%) */
.catalog-mega-card {
  position: absolute;
  top: calc(100% + 12px);
  left: 0;
  width: 560px;
  background: #FFFFFF;
  border-radius: 20px;
  box-shadow: 0 16px 40px rgba(98, 76, 224, 0.1);
  border: 1px solid #EAEAF2;
  z-index: 2000;
  overflow: hidden;
}

.catalog-mega-body {
  display: grid;
  grid-template-columns: 1.55fr 1fr;
  padding: 22px 24px 18px;
  gap: 24px;
}

.mega-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mega-col-heading {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 11px;
  color: #7C5CFC;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

.mega-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mega-item-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 7px 10px;
  border-radius: 12px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
  width: 100%;
}

.mega-item-btn:hover {
  background: #F8F6FF;
}

/* 3. Monochrome Outline Icon (#624CE0 on #EDE9FF circle) */
.cat-icon-circle {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #EDE9FF;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.15s ease;
}

.mega-item-btn:hover .cat-icon-circle {
  transform: scale(1.05);
}

.mega-item-text {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.item-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 5. Heading #1A1A2E bolder, subtitle #A6A6C0 lighter */
.item-title {
  font-size: 13.5px;
  font-weight: 700;
  color: #1A1A2E;
  line-height: 1.2;
}

/* 7. ТОП badge */
.cat-top-badge {
  background: #FFD166;
  color: #1A1A2E;
  font-family: 'Outfit', sans-serif;
  font-size: 9.5px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 5px;
  letter-spacing: 0.4px;
  line-height: 1.2;
}

.item-desc {
  font-size: 11px;
  font-weight: 400;
  color: #A6A6C0;
  line-height: 1.3;
  margin-top: 1px;
}

/* 4. Expand / collapse categories toggle */
.categories-expand-btn {
  background: none;
  border: none;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 12px;
  color: #624CE0;
  text-align: left;
  padding: 6px 10px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.15s ease;
  align-self: flex-start;
  margin-top: 2px;
}

.categories-expand-btn:hover {
  background: #EDE9FF;
}

/* 6. "По возрасту" as compact chips */
.age-chips-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-content: flex-start;
}

.age-chip-btn {
  background: #FFFFFF;
  border: 1.5px solid #EAEAF2;
  border-radius: 50px;
  padding: 7px 14px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 12.5px;
  color: #1A1A2E;
  cursor: pointer;
  transition: all 0.15s ease;
}

.age-chip-btn:hover {
  background: #EDE9FF;
  border-color: #624CE0;
  color: #624CE0;
  transform: translateY(-1px);
}

.age-chip-btn.all-ages {
  border-style: dashed;
  color: #7B7B93;
}

.age-chip-btn.all-ages:hover {
  border-style: solid;
  color: #624CE0;
}

/* 8. Mega Menu Footer with crisp arrow button separated by border-top */
.catalog-mega-footer {
  background: #FFFFFF;
  padding: 13px 24px;
  border-top: 1px solid #EAEAF2;
}

.all-catalog-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-decoration: none;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 13.5px;
  color: #624CE0;
  transition: all 0.15s ease;
}

.footer-link-text {
  color: #624CE0;
  font-weight: 700;
}

.footer-arrow-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #EDE9FF;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #624CE0;
  transition: all 0.2s ease;
}

.all-catalog-link:hover .footer-arrow-circle {
  background: #624CE0;
  color: #FFFFFF;
  transform: translateX(3px);
}

/* Center Search Form */
.header-search-box {
  flex: 1;
  max-width: 600px;
  min-width: 220px;
}

.search-form {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  background: #FFFFFF;
  border: 1.5px solid #E2E2EC;
  border-radius: 50px;
  padding: 4px 6px 4px 22px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  min-height: 48px;
}

.search-form:focus-within {
  border-color: #624CE0;
  box-shadow: 0 4px 14px rgba(98, 76, 224, 0.14);
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  color: #1A1A2E;
  background: transparent;
  padding: 8px 0;
}

.search-input::placeholder {
  color: #8E8EA8;
}

.search-submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #624CE0;
  color: #FFFFFF;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.search-submit-btn:hover {
  background: #513bc7;
  transform: scale(1.05);
}

/* Header Right Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 30px;
  flex-shrink: 0;
}

.header-action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-decoration: none;
  color: #4A4A68;
  transition: all 0.2s ease;
  padding: 4px 6px;
}

.header-action-item:hover {
  color: #624CE0;
}

.action-icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.action-label {
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 12.5px;
  color: inherit;
  white-space: nowrap;
}

.action-badge {
  position: absolute;
  top: -4px;
  right: -8px;
  background: #624CE0;
  color: #FFFFFF;
  font-size: 10px;
  font-weight: 800;
  min-width: 17px;
  height: 17px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  box-shadow: 0 2px 6px rgba(98, 76, 224, 0.35);
}

.fav-badge {
  background: #FF5A5F;
  box-shadow: 0 2px 6px rgba(255, 90, 95, 0.35);
}

.user-avatar-icon {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #624CE0;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 12px;
}

/* Profile Menu */
.profile-menu-container {
  position: relative;
}

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
  z-index: 2000;
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

/* Mobile Drawer */
.mobile-only { display: none; }

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

.drawer-search-box {
  width: 100%;
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

.drawer-catalog-promo {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #624CE0 0%, #7C5CFC 100%);
  color: #FFFFFF;
  padding: 14px;
  border-radius: 16px;
  text-decoration: none;
  box-shadow: 0 6px 18px rgba(98, 76, 224, 0.25);
}

.promo-icon {
  font-size: 24px;
}

.promo-text {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.promo-text strong {
  font-size: 14px;
}

.promo-text small {
  font-size: 11px;
  opacity: 0.85;
}

.promo-arrow {
  font-size: 16px;
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
.catalog-dropdown-enter-active,
.catalog-dropdown-leave-active {
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}
.catalog-dropdown-enter-from,
.catalog-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

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
  .catalog-mega-card {
    width: 600px;
  }
}

@media (max-width: 840px) {
  .mobile-only {
    display: flex;
  }

  .header-actions {
    gap: 14px;
  }

  .header-action-item .action-label {
    display: none;
  }

  .catalog-btn-text {
    display: none;
  }

  .catalog-btn {
    padding: 10px 14px;
    border-radius: 12px;
  }

  .header-inner {
    padding: 10px 16px;
    min-height: 64px;
    gap: 12px;
  }

  .logo-img {
    height: 36px;
  }

  .catalog-mega-card {
    position: fixed;
    top: 70px;
    left: 16px;
    right: 16px;
    width: auto;
    max-height: 80vh;
    overflow-y: auto;
  }

  .catalog-mega-body {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 18px;
  }
}
</style>
