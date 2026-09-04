<template>
  <div class="benefits-wrapper">
    <section id="about" class="benefits-section container">
    <div class="section-heading">
      <div class="badge">почему мы</div>
      <h2 class="title">Забота о развитии без лишних хлопот</h2>
      <p class="subtitle">Спроектировано детскими психологами и экологами, чтобы приносить пользу вашему ребёнку и планете.</p>
    </div>

    <div class="benefits-grid">
      <div class="benefit-card">
        <div class="icon-wrapper">
          <div class="icon-sparkles"></div>
        </div>
        <div class="info">
          <h3>Развитие по возрасту</h3>
          <p>Каждая игрушка точно соответствует сенсорным и когнитивным потребностям возраста.</p>
        </div>
      </div>
      
      <div class="benefit-card">
        <div class="icon-wrapper">
          <div class="icon-home"></div>
        </div>
        <div class="info">
          <h3>Экономия места</h3>
          <p>Больше никаких переполненных ящиков. В доме только актуальные и любимые игрушки.</p>
        </div>
      </div>
      
      <div class="benefit-card">
        <div class="icon-wrapper">
          <div class="icon-leaf"></div>
        </div>
        <div class="info">
          <h3>Экологичность</h3>
          <p>Используем только дерево и безопасный хлопок. Продлеваем жизненный цикл вещей.</p>
        </div>
      </div>
      
      <div class="benefit-card">
        <div class="icon-wrapper">
          <div class="icon-shield"></div>
        </div>
        <div class="info">
          <h3>Экспертный подбор</h3>
          <p>Наборы составляются сертифицированными Монтессори-педагогами.</p>
        </div>
      </div>

      <div class="benefit-card">
        <div class="icon-wrapper">
          <div class="icon-calendar"></div>
        </div>
        <div class="info">
          <h3>Гибкая подписка</h3>
          <p>Пауза или отмена в любой момент в один клик без штрафов и скрытых платежей.</p>
        </div>
      </div>

      <div class="benefit-card">
        <div class="icon-wrapper">
          <div class="icon-truck"></div>
        </div>
        <div class="info">
          <h3>Доставка и забор</h3>
          <p>Курьер сам привезёт новый набор и заберёт предыдущий — вам не нужно никуда идти.</p>
        </div>
      </div>
    </div>
  </section>
</div>
</template>

<style scoped>
.benefits-wrapper {
  width: 100%;
  background: #D9E0D5;
}

.benefits-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px;
  gap: 36px;
  background: transparent;
}

.section-heading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  max-width: 720px;
}

.badge {
  padding: 6px 16px;
  background: #D9E0D5;
  border-radius: 8px;
  font-weight: 700;
  font-size: 12px;
  color: var(--color-primary);
  text-transform: uppercase;
}

.title {
  font-size: 40px;
  font-weight: 700;
}

.subtitle {
  font-size: 18px;
  color: var(--text-muted);
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  width: 100%;
}

.benefit-card {
  display: flex;
  flex-direction: column;
  padding: 28px 8px;
  gap: 16px;
  background: transparent;
  box-shadow: none;
  border-top: 1px solid var(--border-strong);
  border-radius: 0;
}

.icon-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  background: #D9E0D5;
  border-radius: 10px;
}

.icon-wrapper div {
  width: 24px;
  height: 24px;
  border: 2px solid var(--color-primary);
  border-radius: 4px; /* placeholder style for icons */
}

.info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info h3 {
  font-size: 20px;
  font-weight: 700;
}

.info p {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-muted);
}

/* Mobile Responsive */
@media (max-width: 960px) {
  .benefits-section {
    padding: 36px 24px;
    gap: 28px;
  }

  .title {
    font-size: 32px;
  }

  .benefits-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .benefits-section {
    padding: 32px 16px;
    gap: 24px;
    align-items: stretch;
  }

  .title {
    font-size: 26px;
  }

  .subtitle {
    font-size: 14.5px;
  }

  .benefits-grid {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-padding: 0 16px;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding: 8px 4px 20px 4px;
    gap: 14px;
    -webkit-overflow-scrolling: touch;
  }

  .benefits-grid::-webkit-scrollbar {
    display: none;
  }

  .benefits-grid::after {
    content: '';
    flex: 0 0 4px;
  }

  .benefit-card {
    flex: 0 0 80%;
    width: 80%;
    scroll-snap-align: center;
    padding: 22px 18px;
    border-radius: 14px;
    gap: 14px;
  }

  .icon-wrapper {
    width: 44px;
    height: 44px;
    border-radius: 14px;
  }

  .info h3 {
    font-size: 17px;
  }

  .info p {
    font-size: 13.5px;
    line-height: 1.45;
  }
}
</style>
