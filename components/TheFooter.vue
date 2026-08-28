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
            <li><NuxtLink to="/sell" class="highlight-link">Продать нам (Trade-in) <span class="hot-badge">New</span></NuxtLink></li>
            <li><NuxtLink to="/gifts">Подарочные сертификаты</NuxtLink></li>
            <li><NuxtLink to="/short-rent">Краткосрочная аренда</NuxtLink></li>
            <li><NuxtLink to="/cart">Корзина</NuxtLink></li>
          </ul>
        </div>

        <!-- Col 2: КОМПАНИЯ -->
        <div class="footer-col">
          <h4 class="col-title">КОМПАНИЯ</h4>
          <ul class="col-links">
            <li><NuxtLink to="/#about">О компании</NuxtLink></li>
            <li><NuxtLink to="/how-it-works">Как это работает</NuxtLink></li>
            <li><NuxtLink to="/contacts">Шоурум в Алматы</NuxtLink></li>
            <li><a href="#reviews">Отзывы родителей</a></li>
            <li><NuxtLink to="/support">Консультация методиста</NuxtLink></li>
            <li><a href="mailto:partner@alpha-toys.kz">Партнерам и поставщикам</a></li>
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
            <a href="https://instagram.com" target="_blank" class="social-subscribe-btn instagram">
              <span class="btn-text">Подписаться</span>
              <span class="social-icon">📸</span>
            </a>
            <a href="https://wa.me/77071234567" target="_blank" class="social-subscribe-btn whatsapp">
              <span class="btn-text">Написать в чат</span>
              <span class="social-icon">💬</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Divider Contacts Bar (Phone Pill, Email, Lang) -->
      <div class="footer-contacts-bar">
        <div class="contacts-left">
          <a href="tel:+77071234567" class="phone-pill">
            <span class="phone-icon-circle">📞</span>
            <strong>+7 (707) 123-45-67</strong>
          </a>
          <a href="mailto:hello@alpha-toys.kz" class="email-link">
            hello@alpha-toys.kz
          </a>
        </div>

        <div class="lang-switch-box">
          <button class="lang-btn active">🇷🇺 RU</button>
          <span class="lang-divider">|</span>
          <button class="lang-btn">🇰🇿 KZ</button>
        </div>
      </div>

      <!-- Legal Bottom -->
      <div class="footer-bottom-row">
        <div class="copyright-text">
          © 2026 Alpha Play Kazakhstan. Все права защищены.
        </div>

        <div class="legal-links-list">
          <a href="#">Политика конфиденциальности</a>
          <a href="#">Пользовательское соглашение</a>
          <a href="#">Официальное уведомление</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
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
  padding: 40px 0 0;
  margin-top: auto;
}

.footer-card {
  position: relative;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  background: #2E4562; /* Rich dark slate from reference */
  border-radius: 36px 36px 0 0;
  padding: 56px 48px 36px;
  color: #FFFFFF;
  font-family: 'DM Sans', sans-serif;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.06);
}

/* Floating Scroll to Top Button (Orange circle like reference) */
.scroll-top-btn {
  position: absolute;
  top: -24px;
  right: 48px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #FF6B4A;
  color: #FFFFFF;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(255, 107, 74, 0.4);
  transition: all 0.2s ease;
  z-index: 10;
}

.scroll-top-btn:hover {
  background: #f05732;
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
  color: #FFFFFF;
  transform: translateX(3px);
}

.highlight-link {
  color: #FFD166 !important;
  font-weight: 700;
}

.hot-badge {
  background: #FF6B4A;
  color: #FFFFFF;
  font-size: 9.5px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}

/* Subscribe Orange Buttons (Matching reference) */
.subscribe-buttons-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.social-subscribe-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #FF6B4A;
  color: #FFFFFF;
  padding: 12px 20px;
  border-radius: 50px;
  text-decoration: none;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 14px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(255, 107, 74, 0.25);
}

.social-subscribe-btn.whatsapp {
  background: #06D6A0;
  box-shadow: 0 4px 14px rgba(6, 214, 160, 0.25);
}

.social-subscribe-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.06);
}

.social-icon {
  font-size: 18px;
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
  background: #FFFFFF;
  color: #1A1A2E;
  padding: 8px 18px;
  border-radius: 50px;
  text-decoration: none;
  font-family: 'Outfit', sans-serif;
  font-size: 14.5px;
  font-weight: 800;
  transition: transform 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.phone-pill:hover {
  transform: scale(1.03);
}

.phone-icon-circle {
  font-size: 14px;
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
  color: #FFFFFF;
  background: rgba(255, 255, 255, 0.12);
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


