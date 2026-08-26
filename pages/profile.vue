<template>
  <div class="profile-page">
    <TheHeader />

    <main class="profile-container">
      <nav class="breadcrumbs" aria-label="Хлебные крошки">
        <NuxtLink to="/">Главная</NuxtLink>
        <span>/</span>
        <span>Профиль</span>
        <template v-if="activeSection !== 'profile'">
          <span>/</span>
          <span>{{ currentSection.label }}</span>
        </template>
      </nav>

      <div class="profile-layout">
        <aside class="profile-sidebar" aria-label="Разделы профиля">
          <div class="sidebar-card">
            <button type="button" class="sidebar-link" :class="{ active: activeSection === 'profile' }" @click="selectSection('profile')">
              <span class="sidebar-icon">👤</span>
              <span>Профиль</span>
            </button>
            <button type="button" class="sidebar-link" :class="{ active: activeSection === 'bonus' }" @click="selectSection('bonus')">
              <span class="sidebar-icon">★</span>
              <span>Бонусная карта</span>
            </button>
            <button type="button" class="sidebar-link" :class="{ active: activeSection === 'orders' }" @click="selectSection('orders')">
              <span class="sidebar-icon">📦</span>
              <span>Мои заказы</span>
            </button>
            <button type="button" class="sidebar-link" :class="{ active: activeSection === 'favorites' }" @click="selectSection('favorites')">
              <span class="sidebar-icon">♡</span>
              <span>Избранное</span>
              <span v-if="favorites.length" class="sidebar-count">{{ favorites.length }}</span>
            </button>
            <button type="button" class="sidebar-link" :class="{ active: activeSection === 'purchases' }" @click="selectSection('purchases')">
              <span class="sidebar-icon">🛍️</span>
              <span>Купленное</span>
            </button>
            <button type="button" class="sidebar-link" :class="{ active: activeSection === 'promocodes' }" @click="selectSection('promocodes')">
              <span class="sidebar-icon">%</span>
              <span>Мои промокоды</span>
            </button>
            <button type="button" class="sidebar-link" :class="{ active: activeSection === 'settings' }" @click="selectSection('settings')">
              <span class="sidebar-icon">⚙</span>
              <span>Личные данные и настройки</span>
            </button>
          </div>

          <div class="sidebar-card compact-card">
            <button type="button" class="sidebar-link" :class="{ active: activeSection === 'children' }" @click="selectSection('children')">
              <span class="sidebar-icon">🧸</span>
              <span>Мои дети</span>
            </button>
          </div>

          <div class="sidebar-card compact-card">
            <button type="button" class="sidebar-link" :class="{ active: activeSection === 'payments' }" @click="selectSection('payments')">
              <span class="sidebar-icon">💳</span>
              <span>Мои способы оплаты</span>
            </button>
            <button type="button" class="sidebar-link" :class="{ active: activeSection === 'delivery' }" @click="selectSection('delivery')">
              <span class="sidebar-icon">🚚</span>
              <span>Мои способы получения</span>
            </button>
            <button type="button" class="sidebar-link" :class="{ active: activeSection === 'reviews' }" @click="selectSection('reviews')">
              <span class="sidebar-icon">✎</span>
              <span>Мои отзывы</span>
            </button>
            <button type="button" class="sidebar-link" :class="{ active: activeSection === 'support' }" @click="selectSection('support')">
              <span class="sidebar-icon">?</span>
              <span>Мои вопросы и ответы</span>
            </button>
          </div>
        </aside>

        <section class="profile-content">
          <template v-if="activeSection === 'profile'">
          <div class="welcome-card">
            <div class="welcome-copy">
              <div class="welcome-heading-row">
                <div class="welcome-avatar" :class="{ authenticated: user }">
                  {{ user ? firstName.charAt(0).toUpperCase() : '☺' }}
                </div>
                <div>
                  <span class="welcome-kicker">ЛИЧНЫЙ КАБИНЕТ ALPHA</span>
                  <h1>{{ user ? `Привет, ${firstName}!` : 'Привет!' }}</h1>
                </div>
              </div>

              <p v-if="!user" class="welcome-description">
                Войдите или создайте профиль, чтобы сохранять избранное, видеть заказы и управлять подпиской.
              </p>
              <p v-else class="welcome-description">
                Рады видеть вас снова. Здесь собраны ваши заказы, подписка и персональные предложения.
              </p>

              <button v-if="!user" class="auth-primary-btn" @click="openAuthModal('login')">
                Войти или создать профиль
                <span>→</span>
              </button>

              <div v-else class="profile-summary">
                <div class="summary-item">
                  <span>Email</span>
                  <strong>{{ user.email }}</strong>
                </div>
                <div class="summary-item">
                  <span>Телефон</span>
                  <strong>{{ user.phone || 'Не указан' }}</strong>
                </div>
                <button class="logout-link" @click="logout">Выйти</button>
              </div>
            </div>

            <div class="welcome-illustration" aria-hidden="true">
              <span class="shape shape-purple"></span>
              <span class="shape shape-yellow"></span>
              <span class="shape shape-mint"></span>
              <span class="welcome-bear">🧸</span>
            </div>
          </div>

          <section id="promocodes" class="promos-section">
            <div class="section-heading-row">
              <div>
                <span class="section-kicker">ПЕРСОНАЛЬНЫЕ ПРЕДЛОЖЕНИЯ</span>
                <h2>Промокоды</h2>
              </div>
              <NuxtLink to="/shop" class="all-promos-link">Смотреть товары →</NuxtLink>
            </div>

            <div class="promos-grid">
              <article v-for="promo in promos" :key="promo.code" class="promo-card">
                <div class="promo-discount" :class="promo.color">{{ promo.discount }}</div>
                <div class="promo-body">
                  <span class="promo-condition">{{ promo.condition }}</span>
                  <div class="promo-code-row">
                    <strong>{{ promo.code }}</strong>
                    <button type="button" class="copy-btn" :aria-label="`Скопировать промокод ${promo.code}`" @click="copyPromo(promo.code)">
                      {{ copiedCode === promo.code ? '✓' : '⧉' }}
                    </button>
                  </div>
                  <p>{{ promo.description }}</p>
                </div>
                <NuxtLink :to="promo.to" class="promo-action">Применить →</NuxtLink>
              </article>
            </div>
          </section>

          <section class="quick-actions-section">
            <NuxtLink to="/subscription" class="quick-action-card purple-card">
              <span class="quick-icon">✨</span>
              <div>
                <strong>Подписка Alpha</strong>
                <p>Новые развивающие игрушки регулярно</p>
              </div>
              <span class="quick-arrow">→</span>
            </NuxtLink>

            <NuxtLink to="/child" class="quick-action-card mint-card">
              <span class="quick-icon">👶</span>
              <div>
                <strong>Профили детей</strong>
                <p>Возраст, интересы и подборки</p>
              </div>
              <span class="quick-arrow">→</span>
            </NuxtLink>
          </section>
          </template>

          <section v-else class="cabinet-section">
            <div class="cabinet-title-row">
              <div>
                <span class="section-kicker">ЛИЧНЫЙ КАБИНЕТ ALPHA</span>
                <h1>{{ currentSection.label }}</h1>
              </div>
              <button type="button" class="back-profile-btn" @click="selectSection('profile')">← В профиль</button>
            </div>

            <div v-if="activeSection === 'bonus'" class="bonus-panel content-panel">
              <div class="bonus-card">
                <span>ALPHA BONUS</span>
                <strong>0</strong>
                <small>№ 2221 6086 1665 5410</small>
              </div>
              <div class="bonus-note">
                <span>🎂</span>
                <div>
                  <strong>Получайте 3000 бонусов</strong>
                  <p>Ко дню рождения ребёнка</p>
                </div>
              </div>
            </div>

            <div v-else-if="activeSection === 'promocodes'" class="section-stack">
              <div class="empty-state compact-empty">
                <span class="empty-icon">🎟️</span>
                <div>
                  <h2>Персональные</h2>
                  <p>Новые персональные промокоды появятся здесь автоматически.</p>
                </div>
              </div>
              <h2 class="subsection-title">Общие промокоды</h2>
              <div class="promos-grid">
                <article v-for="promo in promos" :key="promo.code" class="promo-card">
                  <div class="promo-discount" :class="promo.color">{{ promo.discount }}</div>
                  <div class="promo-body">
                    <span class="promo-condition">{{ promo.condition }}</span>
                    <div class="promo-code-row">
                      <strong>{{ promo.code }}</strong>
                      <button type="button" class="copy-btn" :aria-label="`Скопировать промокод ${promo.code}`" @click="copyPromo(promo.code)">
                        {{ copiedCode === promo.code ? '✓' : '⧉' }}
                      </button>
                    </div>
                    <p>{{ promo.description }}</p>
                  </div>
                  <NuxtLink :to="promo.to" class="promo-action">Применить →</NuxtLink>
                </article>
              </div>
            </div>

            <div v-else-if="activeSection === 'favorites'" class="content-panel">
              <div v-if="favorites.length" class="favorites-grid">
                <article v-for="item in favorites" :key="item.id" class="favorite-card">
                  <NuxtLink :to="`/product/${item.id}`" class="favorite-image-wrap">
                    <img v-if="item.image" :src="item.image" :alt="item.title" />
                    <span v-else>🧸</span>
                  </NuxtLink>
                  <div class="favorite-info">
                    <h3>{{ item.title }}</h3>
                    <strong v-if="item.price">{{ formatPrice(item.price) }} ₸</strong>
                    <button type="button" @click="toggleFavorite(item)">Убрать из избранного</button>
                  </div>
                </article>
              </div>
              <div v-else class="empty-state">
                <span class="empty-icon">♡</span>
                <div>
                  <h2>В избранном пока пусто</h2>
                  <p>Добавляйте понравившиеся игрушки — они будут храниться здесь.</p>
                  <NuxtLink to="/shop" class="panel-primary-link">Перейти в магазин</NuxtLink>
                </div>
              </div>
            </div>

            <div v-else-if="activeSection === 'settings'" class="content-panel settings-panel">
              <div class="settings-tabs">
                <button class="active">Личные данные</button>
                <button>Настройки</button>
              </div>
              <div class="settings-list">
                <div class="settings-field"><span>Телефон</span><strong>{{ user?.phone || 'Не указан' }}</strong></div>
                <div class="settings-field"><span>Электронная почта</span><strong>{{ user?.email || 'Не указана' }}</strong></div>
                <div class="settings-field"><span>Имя</span><strong>{{ user?.name || 'Не указано' }}</strong></div>
                <div class="settings-field"><span>Город</span><strong>Алматы</strong></div>
              </div>
            </div>

            <div v-else class="content-panel">
              <div class="empty-state">
                <span class="empty-icon">{{ currentSection.icon }}</span>
                <div>
                  <h2>{{ currentSection.emptyTitle }}</h2>
                  <p>{{ currentSection.emptyText }}</p>
                  <button v-if="currentSection.action" type="button" class="panel-primary-link" @click="handleSectionAction">{{ currentSection.action }}</button>
                </div>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>

    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import TheHeader from '~/components/TheHeader.vue'
import TheFooter from '~/components/TheFooter.vue'

const { user, openAuthModal, logout } = useAuth()
const { favorites, toggleFavorite } = useFavorites()
const route = useRoute()
const router = useRouter()
const copiedCode = ref('')
const firstName = computed(() => user.value?.name?.trim().split(/\s+/)[0] || 'друг')

const sections = {
  profile: { label: 'Профиль', icon: '👤', emptyTitle: '', emptyText: '' },
  bonus: { label: 'Бонусная карта', icon: '★', emptyTitle: '', emptyText: '' },
  orders: { label: 'Мои заказы', icon: '📦', emptyTitle: 'Заказов пока нет', emptyText: 'После оформления заказа здесь появятся его состав, статус и доставка.', action: 'Перейти в магазин', to: '/shop' },
  favorites: { label: 'Избранное', icon: '♡', emptyTitle: '', emptyText: '' },
  purchases: { label: 'Купленное', icon: '🛍️', emptyTitle: 'Покупок пока нет', emptyText: 'Все купленные игрушки и наборы будут собраны в этом разделе.', action: 'Выбрать игрушки', to: '/shop' },
  promocodes: { label: 'Мои промокоды', icon: '%', emptyTitle: '', emptyText: '' },
  settings: { label: 'Личные данные и настройки', icon: '⚙', emptyTitle: '', emptyText: '' },
  children: { label: 'Мои дети', icon: '🧸', emptyTitle: 'Добавьте профиль ребёнка', emptyText: 'Возраст и интересы помогут нам точнее подбирать развивающие игрушки.', action: 'Добавить ребёнка', to: '/child' },
  payments: { label: 'Мои способы оплаты', icon: '💳', emptyTitle: 'Способы оплаты не добавлены', emptyText: 'Сохранённые карты появятся здесь после первой оплаты.' },
  delivery: { label: 'Мои способы получения', icon: '🚚', emptyTitle: 'Адресов пока нет', emptyText: 'Добавьте удобный адрес доставки при оформлении заказа.', action: 'Условия доставки', to: '/delivery' },
  reviews: { label: 'Мои отзывы', icon: '✎', emptyTitle: 'Отзывов пока нет', emptyText: 'После покупки вы сможете поделиться впечатлениями об игрушках.' },
  support: { label: 'Мои вопросы и ответы', icon: '?', emptyTitle: 'Вопросов пока нет', emptyText: 'Здесь будет сохраняться ваша переписка со службой поддержки.', action: 'Задать вопрос', to: '/support' },
} as const

type SectionKey = keyof typeof sections

const activeSection = computed<SectionKey>(() => {
  const section = String(route.query.section || 'profile') as SectionKey
  return section in sections ? section : 'profile'
})

const currentSection = computed(() => sections[activeSection.value])

const selectSection = (section: SectionKey) => {
  router.replace({
    path: '/profile',
    query: section === 'profile' ? {} : { section },
  })
}

const handleSectionAction = () => {
  const target = 'to' in currentSection.value ? currentSection.value.to : undefined
  if (target) navigateTo(target)
}

const formatPrice = (price: number) => new Intl.NumberFormat('ru-RU').format(price)

const promos = [
  {
    discount: '-20%',
    code: 'PLAY20',
    condition: 'Для первой подписки',
    description: 'Скидка на первый месяц подписки Alpha',
    color: 'purple',
    to: '/subscription',
  },
  {
    discount: '-15%',
    code: 'WELCOME15',
    condition: 'Для новых пользователей',
    description: 'На первую покупку в интернет-магазине',
    color: 'yellow',
    to: '/shop',
  },
  {
    discount: '-10%',
    code: 'GIFT10',
    condition: 'Подарки и сертификаты',
    description: 'На подарочные наборы для детей',
    color: 'mint',
    to: '/gifts',
  },
]

const copyPromo = async (code: string) => {
  copiedCode.value = code
  if (import.meta.client && navigator.clipboard) {
    await navigator.clipboard.writeText(code).catch(() => {})
  }
  window.setTimeout(() => {
    if (copiedCode.value === code) copiedCode.value = ''
  }, 1600)
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f7f4ff;
  color: #1a1a2e;
}

.profile-container {
  width: min(1320px, calc(100% - 48px));
  margin: 0 auto;
  padding: 32px 0 88px;
}

.breadcrumbs {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
  color: #8b88a3;
  font-size: 14px;
}

.breadcrumbs a:hover {
  color: #624ce0;
}

.profile-layout {
  display: grid;
  grid-template-columns: 270px minmax(0, 1fr);
  gap: 28px;
  align-items: start;
}

.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px;
  border: 1px solid rgba(98, 76, 224, 0.08);
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 12px 30px rgba(60, 47, 118, 0.06);
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 48px;
  padding: 11px 14px;
  border-radius: 15px;
  color: #3f3d55;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  text-align: left;
  transition: color 180ms ease, background 180ms ease, transform 180ms ease;
}

.sidebar-link:hover {
  color: #624ce0;
  background: #f5f2ff;
  transform: translateX(2px);
}

.sidebar-link.active {
  color: #624ce0;
  background: #ede9ff;
  font-weight: 800;
}

.sidebar-icon {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 9px;
  background: #f4f1ff;
  font-size: 14px;
}

.sidebar-count {
  display: grid;
  place-items: center;
  min-width: 22px;
  height: 22px;
  margin-left: auto;
  padding: 0 6px;
  border-radius: 999px;
  color: #fff;
  background: #624ce0;
  font-size: 11px;
}

.profile-content {
  min-width: 0;
}

.welcome-card {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  overflow: hidden;
  min-height: 310px;
  padding: 46px;
  border: 1px solid rgba(98, 76, 224, 0.1);
  border-radius: 32px;
  background: linear-gradient(135deg, #fff 0%, #f8f5ff 64%, #eee9ff 100%);
  box-shadow: 0 18px 48px rgba(60, 47, 118, 0.09);
}

.welcome-copy {
  position: relative;
  z-index: 2;
  max-width: 690px;
}

.welcome-heading-row {
  display: flex;
  align-items: center;
  gap: 18px;
}

.welcome-avatar {
  display: grid;
  place-items: center;
  width: 68px;
  height: 68px;
  flex: 0 0 auto;
  border-radius: 22px;
  color: #624ce0;
  background: #ede9ff;
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 900;
}

.welcome-avatar.authenticated {
  color: #fff;
  background: linear-gradient(135deg, #7c5cfc, #513bc7);
}

.welcome-kicker,
.section-kicker {
  display: block;
  margin-bottom: 6px;
  color: #7c5cfc;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.2px;
}

.welcome-card h1 {
  margin: 0;
  color: #1a1a2e;
  font-size: clamp(38px, 5vw, 58px);
  line-height: 1;
}

.welcome-description {
  max-width: 630px;
  margin: 24px 0 28px;
  color: #626078;
  font-size: 16px;
  line-height: 1.6;
}

.auth-primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-height: 54px;
  padding: 15px 26px;
  border-radius: 17px;
  color: #fff;
  background: #624ce0;
  box-shadow: 0 8px 0 #4934b5, 0 14px 30px rgba(98, 76, 224, 0.24);
  font-size: 16px;
  font-weight: 800;
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.auth-primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 0 #4934b5, 0 18px 34px rgba(98, 76, 224, 0.28);
}

.profile-summary {
  display: flex;
  align-items: stretch;
  flex-wrap: wrap;
  gap: 12px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 190px;
  padding: 12px 16px;
  border-radius: 15px;
  background: #fff;
  box-shadow: 0 8px 22px rgba(60, 47, 118, 0.08);
}

.summary-item span {
  color: #8b88a3;
  font-size: 11px;
}

.summary-item strong {
  overflow: hidden;
  font-size: 13px;
  text-overflow: ellipsis;
}

.logout-link {
  padding: 0 16px;
  border-radius: 15px;
  color: #e14f62;
  background: #fff0f2;
  font-weight: 700;
}

.welcome-illustration {
  position: relative;
  min-height: 210px;
}

.welcome-bear {
  position: absolute;
  z-index: 2;
  right: 54px;
  bottom: 8px;
  font-size: 104px;
  filter: drop-shadow(0 16px 20px rgba(67, 50, 142, 0.14));
}

.shape {
  position: absolute;
  border-radius: 999px;
}

.shape-purple {
  top: 2px;
  right: -40px;
  width: 230px;
  height: 230px;
  background: #ddd4ff;
}

.shape-yellow {
  right: 160px;
  bottom: -55px;
  width: 140px;
  height: 140px;
  background: #ffe49a;
}

.shape-mint {
  top: -20px;
  right: 165px;
  width: 82px;
  height: 82px;
  background: #bff4df;
}

.promos-section {
  padding-top: 46px;
  scroll-margin-top: 24px;
}

.section-heading-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}

.section-heading-row h2 {
  margin: 0;
  font-size: 34px;
}

.all-promos-link {
  color: #624ce0;
  font-size: 14px;
  font-weight: 800;
}

.promos-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.promo-card {
  display: grid;
  grid-template-columns: 90px minmax(0, 1fr);
  grid-template-rows: 1fr auto;
  overflow: hidden;
  min-height: 190px;
  border: 1px solid rgba(98, 76, 224, 0.08);
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 12px 30px rgba(60, 47, 118, 0.07);
}

.promo-discount {
  display: grid;
  place-items: center;
  grid-row: 1;
  color: #1a1a2e;
  font-family: 'Outfit', sans-serif;
  font-size: 25px;
  font-weight: 900;
}

.promo-discount.purple { background: #ded5ff; }
.promo-discount.yellow { background: #ffe99c; }
.promo-discount.mint { background: #bff4df; }

.promo-body {
  min-width: 0;
  padding: 20px 18px 14px;
}

.promo-condition {
  color: #8b88a3;
  font-size: 11px;
}

.promo-code-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 7px 0;
}

.promo-code-row strong {
  overflow: hidden;
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  text-overflow: ellipsis;
}

.promo-body p {
  color: #5e5b73;
  font-size: 12px;
  line-height: 1.35;
}

.copy-btn {
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  border-radius: 9px;
  color: #624ce0;
  background: #f1edff;
  font-weight: 900;
}

.promo-action {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  color: #3f3d55;
  background: #faf9ff;
  border-top: 1px solid #f0edf9;
  font-size: 13px;
  font-weight: 800;
}

.quick-actions-section {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  padding-top: 24px;
}

.quick-action-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 16px;
  min-height: 112px;
  padding: 22px;
  border-radius: 24px;
  color: #1a1a2e;
}

.purple-card { background: #e9e3ff; }
.mint-card { background: #d9f7eb; }

.quick-icon {
  font-size: 30px;
}

.quick-action-card strong {
  display: block;
  margin-bottom: 4px;
  font-family: 'Outfit', sans-serif;
  font-size: 19px;
}

.quick-action-card p {
  color: #626078;
  font-size: 13px;
}

.quick-arrow {
  font-size: 25px;
}

.cabinet-section {
  min-height: 620px;
}

.cabinet-title-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
}

.cabinet-title-row h1 {
  margin: 0;
  font-size: clamp(34px, 4vw, 50px);
  line-height: 1.08;
}

.back-profile-btn {
  padding: 11px 16px;
  border-radius: 13px;
  color: #624ce0;
  background: #ede9ff;
  font-size: 13px;
  font-weight: 800;
}

.content-panel {
  min-height: 390px;
  padding: 34px;
  border: 1px solid rgba(98, 76, 224, 0.08);
  border-radius: 28px;
  background: #fff;
  box-shadow: 0 12px 34px rgba(60, 47, 118, 0.06);
}

.section-stack {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.subsection-title {
  margin: 8px 0 0;
  font-size: 28px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  min-height: 320px;
  text-align: left;
}

.compact-empty {
  justify-content: flex-start;
  min-height: 150px;
  padding: 28px 34px;
  border-radius: 24px;
  background: #fff;
}

.empty-icon {
  display: grid;
  place-items: center;
  width: 74px;
  height: 74px;
  flex: 0 0 auto;
  border-radius: 24px;
  color: #624ce0;
  background: #ede9ff;
  font-size: 34px;
  font-weight: 900;
}

.empty-state h2 {
  margin: 0 0 8px;
  font-size: 25px;
}

.empty-state p {
  max-width: 530px;
  margin: 0;
  color: #77748b;
  line-height: 1.55;
}

.panel-primary-link {
  display: inline-flex;
  margin-top: 18px;
  padding: 12px 18px;
  border-radius: 13px;
  color: #fff;
  background: #624ce0;
  font-size: 13px;
  font-weight: 800;
}

.bonus-panel {
  display: flex;
  align-items: center;
  gap: 26px;
}

.bonus-card {
  position: relative;
  display: flex;
  flex-direction: column;
  width: min(390px, 100%);
  min-height: 240px;
  padding: 28px;
  overflow: hidden;
  border-radius: 26px;
  color: #fff;
  background: linear-gradient(135deg, #7c5cfc, #4d32c6);
  box-shadow: 0 18px 36px rgba(80, 55, 200, 0.26);
}

.bonus-card::after {
  position: absolute;
  right: -35px;
  bottom: -60px;
  width: 190px;
  height: 190px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  content: '';
}

.bonus-card span { font-size: 13px; font-weight: 800; letter-spacing: 1.4px; }
.bonus-card strong { margin: 38px 0 28px; font-size: 52px; line-height: 1; }
.bonus-card small { margin-top: auto; font-size: 14px; font-weight: 700; }

.bonus-note {
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 310px;
  padding: 22px;
  border-radius: 22px;
  background: #f2efff;
}

.bonus-note > span { font-size: 32px; }
.bonus-note strong { display: block; margin-bottom: 4px; }
.bonus-note p { color: #77748b; font-size: 13px; }

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.favorite-card {
  overflow: hidden;
  border: 1px solid #eeebf8;
  border-radius: 20px;
  background: #fff;
}

.favorite-image-wrap {
  display: grid;
  place-items: center;
  height: 180px;
  overflow: hidden;
  background: #f5f2ff;
  font-size: 52px;
}

.favorite-image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.favorite-info { padding: 17px; }
.favorite-info h3 { min-height: 42px; margin: 0 0 10px; font-size: 16px; }
.favorite-info strong { display: block; margin-bottom: 12px; color: #624ce0; }
.favorite-info button { color: #e14f62; font-size: 12px; font-weight: 700; }

.settings-panel {
  max-width: 850px;
}

.settings-tabs {
  display: flex;
  gap: 24px;
  margin-bottom: 28px;
  border-bottom: 1px solid #ece9f5;
}

.settings-tabs button {
  padding: 0 0 14px;
  color: #77748b;
  background: transparent;
  font-size: 15px;
  font-weight: 800;
}

.settings-tabs button.active {
  margin-bottom: -1px;
  color: #624ce0;
  border-bottom: 3px solid #624ce0;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.settings-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 17px 20px;
  border-radius: 18px;
  background: #f2efff;
}

.settings-field span { color: #8b88a3; font-size: 12px; }
.settings-field strong { font-size: 15px; }

@media (max-width: 1060px) {
  .profile-layout {
    grid-template-columns: 220px minmax(0, 1fr);
  }

  .welcome-card {
    grid-template-columns: 1fr;
  }

  .welcome-illustration {
    display: none;
  }

  .promos-grid {
    grid-template-columns: 1fr;
  }

  .favorites-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .profile-container {
    width: min(calc(100% - 32px), 1320px);
    padding-top: 20px;
  }

  .breadcrumbs {
    margin-bottom: 16px;
  }

  .profile-layout {
    display: flex;
    flex-direction: column;
  }

  .profile-sidebar {
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 5px;
    scrollbar-width: none;
  }

  .profile-sidebar::-webkit-scrollbar {
    display: none;
  }

  .sidebar-card {
    min-width: max-content;
    flex-direction: row;
    padding: 7px;
    border-radius: 18px;
  }

  .sidebar-link {
    min-height: 42px;
    padding: 9px 12px;
  }

  .sidebar-icon {
    display: none;
  }

  .welcome-card {
    min-height: auto;
    padding: 28px 22px 34px;
    border-radius: 26px;
  }

  .welcome-heading-row {
    align-items: flex-start;
  }

  .welcome-avatar {
    width: 54px;
    height: 54px;
    border-radius: 17px;
    font-size: 25px;
  }

  .welcome-card h1 {
    font-size: 36px;
  }

  .welcome-description {
    margin: 20px 0 24px;
    font-size: 14px;
  }

  .auth-primary-btn {
    width: 100%;
    justify-content: center;
    font-size: 14px;
  }

  .profile-summary {
    flex-direction: column;
  }

  .summary-item,
  .logout-link {
    width: 100%;
    min-height: 48px;
  }

  .section-heading-row {
    align-items: flex-start;
  }

  .section-heading-row h2 {
    font-size: 28px;
  }

  .quick-actions-section {
    grid-template-columns: 1fr;
  }

  .cabinet-title-row {
    align-items: flex-start;
  }

  .back-profile-btn {
    display: none;
  }

  .content-panel {
    min-height: 340px;
    padding: 24px 20px;
    border-radius: 24px;
  }

  .bonus-panel {
    align-items: stretch;
    flex-direction: column;
  }

  .bonus-note {
    max-width: none;
  }

  .favorites-grid {
    grid-template-columns: 1fr;
  }

  .empty-state {
    align-items: flex-start;
    flex-direction: column;
    min-height: 280px;
  }

  .compact-empty {
    min-height: 0;
  }
}

@media (max-width: 480px) {
  .promo-card {
    grid-template-columns: 78px minmax(0, 1fr);
  }

  .promo-discount {
    font-size: 21px;
  }

  .all-promos-link {
    display: none;
  }
}
</style>
