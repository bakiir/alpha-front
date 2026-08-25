<template>
  <section class="benefits-section container">
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
</template>

<style scoped>
.benefits-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px;
  gap: 56px;
  background: var(--bg-tertiary);
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
  background: #EDE9FF;
  border-radius: 20px;
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
  padding: 32px;
  gap: 16px;
  background: var(--text-white);
  box-shadow: var(--shadow-sm);
  border-radius: 24px;
}

.icon-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  background: #EDE9FF;
  border-radius: 16px;
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
    padding: 60px 24px;
    gap: 40px;
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
    padding: 40px 16px;
    gap: 28px;
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
    flex: 0 0 78%;
    width: 78%;
    scroll-snap-align: center;
    padding: 24px 20px;
    border-radius: 20px;
  }

  .info h3 {
    font-size: 18px;
  }

  .info p {
    font-size: 13.5px;
  }
}
</style>
