<template>
  <footer class="footer container">
    <div class="footer-top">
      <div class="footer-brand">
        <div class="logo">
          <div class="logo-icon">α</div>
          <span class="logo-text">Alpha</span>
        </div>
        <p class="brand-desc">Создаем экологичную развивающую среду для нового поколения счастливых и умных детей.</p>
      </div>
      
      <div class="footer-links">
        <div class="links-column">
          <h4>Сервис</h4>
          <a href="#">Подписка</a>
          <a href="#">Магазин</a>
          <a href="#">Как это работает</a>
          <a href="#">Цены</a>
        </div>
        
        <div class="links-column">
          <h4>Родителям</h4>
          <a href="#">Блог методиста</a>
          <a href="#">Отзывы</a>
          <a href="#">Реферальная программа</a>
          <a href="#">FAQ</a>
        </div>
        
        <div class="links-column">
          <h4>Компания</h4>
          <a href="#">О нас</a>
          <a href="#">Контакты</a>
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
  gap: 8px;
}

.logo-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  background: var(--color-primary);
  border-radius: 10px;
  color: var(--text-white);
  font-family: 'Outfit';
  font-weight: 900;
  font-size: 20px;
}

.logo-text {
  font-family: 'Outfit';
  font-weight: 800;
  font-size: 22px;
  color: var(--text-white);
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
</style>
