<template>
  <footer class="footer-wrapper">
    <div class="footer-card container">
      <!-- Floating Scroll to Top Button -->
      <button class="scroll-top-btn" @click="scrollToTop" title="Наверх">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="19" x2="12" y2="5"></line>
          <polyline points="5 12 12 5 19 12"></polyline>
        </svg>
      </button>

      <!-- Main Columns Grid -->
      <div class="footer-main-grid">
        <!-- Col 1: ИНТЕРНЕТ-МАГАЗИН / СЕРВИС -->
        <div class="footer-col">
          <h4 class="col-title">ИНТЕРНЕТ-МАГАЗИН</h4>
          <ul class="col-links">
            <li><NuxtLink to="/shop">Каталог эко-игрушек</NuxtLink></li>
            <li><NuxtLink to="/subscription">Клубная подписка</NuxtLink></li>
            <li v-if="isVisible('sell_to_us')"><NuxtLink to="/sell" class="highlight-link">Продать нам (Trade-in) <span class="hot-badge">New</span></NuxtLink></li>
            <li><NuxtLink to="/gifts">Подарочные сертификаты</NuxtLink></li>
            <li v-if="isVisible('short_rent')"><NuxtLink to="/short-rent">Краткосрочная аренда</NuxtLink></li>
            <li><NuxtLink to="/cart">Корзина</NuxtLink></li>
          </ul>
        </div>

        <!-- Col 2: КОМПАНИЯ -->
        <div class="footer-col">
          <h4 class="col-title">КОМПАНИЯ</h4>
          <ul class="col-links">
            <li><NuxtLink to="/about">О компании</NuxtLink></li>
            <li><NuxtLink to="/how-it-works">Как это работает</NuxtLink></li>
            <li><NuxtLink to="/partners">Партнёры</NuxtLink></li>
            <li><NuxtLink to="/contacts">Шоурум в Алматы</NuxtLink></li>
            <li><a href="#reviews">Отзывы родителей</a></li>
            <li><NuxtLink to="/support">Консультация методиста</NuxtLink></li>
            <li><NuxtLink to="/partners">Партнерам и поставщикам</NuxtLink></li>
          </ul>
        </div>

        <!-- Col 3: ПОМОЩЬ ПОКУПАТЕЛЮ -->
        <div class="footer-col">
          <h4 class="col-title">ПОМОЩЬ ПОКУПАТЕЛЮ</h4>
          <ul class="col-links">
            <li><NuxtLink to="/faq">Частые вопросы (FAQ)</NuxtLink></li>
            <li><NuxtLink to="/how-it-works">Как сделать заказ и обмен</NuxtLink></li>
            <li><NuxtLink to="/delivery">Доставка курьером</NuxtLink></li>
            <li><NuxtLink to="/faq#hygiene">Дезинфекция озоном и паром</NuxtLink></li>
            <li><NuxtLink to="/profile">Личный кабинет</NuxtLink></li>
            <li><NuxtLink to="/contacts">Условия возврата и гарантии</NuxtLink></li>
          </ul>
        </div>

        <!-- Col 4: БУДЬТЕ В КУРСЕ НОВОСТЕЙ -->
        <div class="footer-col subscribe-col">
          <h4 class="col-title">БУДЬТЕ В КУРСЕ НОВОСТЕЙ</h4>
          <div class="subscribe-buttons-group">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" class="social-subscribe-btn instagram">
              <span class="btn-text">Подписаться</span>
              <span class="social-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </span>
            </a>
            <a href="https://wa.me/77071234567" target="_blank" rel="noopener noreferrer" class="social-subscribe-btn whatsapp">
              <span class="btn-text">Написать в чат</span>
              <span class="social-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.5-4.5A4 4 0 0 1 4 15V7a4 4 0 0 1 4-4h9a4 4 0 0 1 4 4z" />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </div>

      <!-- Divider Contacts Bar (Phone Pill, Email, Lang) -->
      <div class="footer-contacts-bar">
        <div class="contacts-left">
          <a href="tel:+77071234567" class="phone-pill">
            <span class="phone-icon-circle" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </span>
            <strong>+7 (707) 123-45-67</strong>
          </a>
          <a href="mailto:hello@alpha-toys.kz" class="email-link">
            hello@alpha-toys.kz
          </a>
        </div>

        <div class="lang-switch-box">
          <button class="lang-btn active">RU</button>
          <span class="lang-divider">|</span>
          <button class="lang-btn">KZ</button>
        </div>
      </div>

      <!-- Legal Bottom -->
      <div class="footer-bottom-row">
        <div class="copyright-text">
          © 2026 Alpha Play Kazakhstan. Все права защищены.
        </div>

        <div class="legal-links-list">
          <NuxtLink to="/legal/privacy">Политика конфиденциальности</NuxtLink>
          <NuxtLink to="/legal/terms">Пользовательское соглашение</NuxtLink>
          <NuxtLink to="/legal/notice">Официальное уведомление</NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { fetchFeatures, isVisible } = useFeatures()

onMounted(() => {
  fetchFeatures()
})

const scrollToTop = () => {
  if (typeof window !== 'undefined') {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}
</script>

<style scoped>
.footer-wrapper {
  width: 100%;
  background: transparent;
  padding: 24px 0 0;
  margin-top: auto;
}

.footer-card {
  position: relative;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  background: linear-gradient(160deg, #624CE0 0%, #4f3bc5 100%);
  border-radius: 36px 36px 0 0;
  padding: 56px 48px 36px;
  color: var(--text-white);
  font-family: 'DM Sans', sans-serif;
  box-shadow: 0 -8px 32px rgba(98, 76, 224, 0.18);
}

/* Floating Scroll to Top Button */
.scroll-top-btn {
  position: absolute;
  top: -24px;
  right: 48px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-secondary);
  color: var(--text-dark);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(255, 209, 102, 0.45);
  transition: all 0.2s ease;
  z-index: 10;
}

.scroll-top-btn:hover {
  background: #ffc84a;
  transform: translateY(-3px) scale(1.05);
}

/* Main 4-Column Grid */
.footer-main-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1.15fr 1.1fr;
  gap: 40px;
  margin-bottom: 40px;
}

.footer-col {
  display: flex;
  flex-direction: column;
}

.col-title {
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 800;
  color: #FFFFFF;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  margin-bottom: 20px;
}

.col-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.col-links a {
  color: rgba(255, 255, 255, 0.78);
  font-size: 13.5px;
  text-decoration: none;
  transition: color 0.15s ease, transform 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.col-links a:hover {
  color: var(--text-white);
  transform: translateX(3px);
}

.highlight-link {
  color: var(--color-secondary) !important;
  font-weight: 700;
}

.hot-badge {
  background: var(--color-secondary);
  color: var(--text-dark);
  font-size: 9.5px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}

/* Subscribe buttons — brand palette */
.subscribe-buttons-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.social-subscribe-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.16);
  color: var(--text-white);
  padding: 12px 20px;
  border-radius: 50px;
  text-decoration: none;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 14px;
  transition: all 0.2s ease;
  border: 1.5px solid rgba(255, 255, 255, 0.22);
  box-shadow: 0 4px 14px rgba(26, 26, 46, 0.08);
}

.social-subscribe-btn.instagram:hover {
  background: rgba(255, 255, 255, 0.24);
  border-color: rgba(255, 255, 255, 0.35);
}

.social-subscribe-btn.whatsapp {
  background: var(--color-tertiary);
  color: var(--text-dark);
  border-color: transparent;
  box-shadow: 0 4px 14px rgba(6, 214, 160, 0.3);
}

.social-subscribe-btn.whatsapp:hover {
  background: #05c492;
  filter: none;
}

.social-subscribe-btn:hover {
  transform: translateY(-2px);
}

.social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Middle Contacts Bar */
.footer-contacts-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  margin-bottom: 24px;
}

.contacts-left {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.phone-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: var(--text-white);
  color: var(--text-dark);
  padding: 8px 18px;
  border-radius: 50px;
  text-decoration: none;
  font-family: 'Outfit', sans-serif;
  font-size: 14.5px;
  font-weight: 800;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 12px rgba(26, 26, 46, 0.12);
}

.phone-pill:hover {
  transform: scale(1.03);
  box-shadow: 0 6px 16px rgba(26, 26, 46, 0.16);
}

.phone-icon-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #F3EFFF;
  color: #624CE0;
  flex-shrink: 0;
}

.email-link {
  color: rgba(255, 255, 255, 0.85);
  font-size: 13.5px;
  text-decoration: none;
  transition: color 0.15s ease;
}

.email-link:hover {
  color: #FFFFFF;
}

.lang-switch-box {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  font-weight: 700;
}

.lang-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.lang-btn:hover,
.lang-btn.active {
  color: var(--text-white);
  background: rgba(255, 255, 255, 0.16);
}

/* Payment & Legal Bottom Row */
.footer-bottom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  flex-wrap: wrap;
  gap: 16px;
}

.copyright-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.legal-links-list {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.legal-links-list a {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 12px;
  transition: color 0.15s ease;
}

.legal-links-list a:hover {
  color: #FFFFFF;
}

/* Responsive */
@media (max-width: 1024px) {
  .footer-main-grid {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }

  .footer-card {
    padding: 48px 32px 32px;
  }
}

@media (max-width: 640px) {
  .footer-card {
    padding: 40px 20px 28px;
    border-radius: 28px 28px 0 0;
  }

  .scroll-top-btn {
    right: 24px;
    top: -20px;
    width: 42px;
    height: 42px;
  }

  .footer-main-grid {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .footer-contacts-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .footer-bottom-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .legal-links-list {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>


