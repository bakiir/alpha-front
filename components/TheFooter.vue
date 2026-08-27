<template>
  <footer class="footer container">
    <div class="footer-top">
      <div class="footer-brand">
        <div class="logo">
          <img src="/logo.png" alt="Alpha" class="footer-logo-img" />
        </div>
        <p class="brand-desc">Создаем экологичную развивающую среду для нового поколения счастливых и умных детей.</p>
      </div>
      
      <div class="footer-links">
        <div class="links-column">
          <h4>Сервис</h4>
          <a href="#">Подписка</a>
          <a href="#">Магазин</a>
          <NuxtLink to="/how-it-works">Как это работает</NuxtLink>
          <a href="#">Цены</a>
        </div>
        
        <div class="links-column">
          <h4>Родителям</h4>
          <a href="#">Блог методиста</a>
          <a href="#">Отзывы</a>
          <a href="#">Реферальная программа</a>
          <NuxtLink to="/faq">FAQ</NuxtLink>
        </div>
        
        <div class="links-column">
          <h4>Компания</h4>
          <NuxtLink to="/#about">О нас</NuxtLink>
          <NuxtLink to="/contacts">Контакты</NuxtLink>
          <a href="#">Партнерам</a>
          <a href="#">Вакансии</a>
        </div>
      </div>
    </div>
    
    <div class="footer-bottom">
      <p>© 2026 Alpha Toy Subscription & Shop. Все права защищены.</p>
      <div class="legal-links">
        <a href="#">Политика конфиденциальности</a>
        <a href="#">Публичная оферта</a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  display: flex;
  flex-direction: column;
  padding: 80px 80px 40px;
  gap: 80px;
  background: var(--text-dark);
}

.footer-top {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 320px;
}

.logo {
  display: flex;
  align-items: center;
}

.footer-logo-img {
  height: 40px;
  width: auto;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.brand-desc {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-light);
}

.footer-links {
  display: flex;
  gap: 80px;
}

.links-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.links-column h4 {
  font-size: 14px;
  text-transform: uppercase;
  color: var(--text-white);
  margin-bottom: 4px;
}

.links-column a {
  font-size: 14px;
  color: var(--text-light);
  transition: color 0.3s;
}

.links-column a:hover {
  color: var(--text-white);
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: #707090;
  font-size: 13px;
}

.legal-links {
  display: flex;
  gap: 24px;
}

.legal-links a:hover {
  color: var(--text-white);
}

@media (max-width: 900px) {
  .footer {
    padding: 56px 32px 36px;
    gap: 48px;
  }

  .footer-top {
    flex-direction: column;
    gap: 36px;
  }
}

@media (max-width: 640px) {
  .footer {
    padding: 40px 20px 28px;
    gap: 36px;
  }

  .footer-links {
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 14px;
    align-items: flex-start;
  }

  .legal-links {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
