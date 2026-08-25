<template>
  <section id="subscription" class="compare-section container">
    <div class="section-heading">
      <div class="badge">два пути к развитию</div>
      <h2 class="title">Как вы хотите наполнить детство?</h2>
      <p class="subtitle">Выбирайте гибкую подписку с регулярным обновлением или покупайте премиальные деревянные игрушки навсегда.</p>
    </div>

    <div class="cards-wrapper">
      <div class="compare-card">
        <div class="card-content">
          <div class="card-image bg-subscription"></div>
          <div class="card-info">
            <div class="card-header">
              <h3>Подписка Alpha</h3>
              <div class="card-badge badge-purple">ВЫГОДНО & УДОБНО</div>
            </div>
            <p class="card-desc">Идеальный вариант для быстрорастущих детей. Игрушки меняются по мере развития ребёнка, не загромождая дом.</p>
            
            <ul class="features-list">
              <li>
                <div class="icon-check"></div>
                Новый набор каждые 2 месяца по методикам Монтессори
              </li>
              <li>
                <div class="icon-check"></div>
                Бесплатный обмен и экологичная дезинфекция
              </li>
              <li>
                <div class="icon-check"></div>
                Экономия до 70% бюджета на детские товары
              </li>
            </ul>
          </div>
        </div>
        <div class="card-footer">
          <button class="btn-primary btn-block">Попробовать подписку</button>
        </div>
      </div>

      <div class="compare-card">
        <div class="card-content">
          <div class="card-image bg-shop"></div>
          <div class="card-info">
            <div class="card-header">
              <h3>Магазин Alpha</h3>
              <div class="card-badge badge-green">НАВСЕГДА В КОЛЛЕКЦИЮ</div>
            </div>
            <p class="card-desc">Купите понравившиеся развивающие бестселлеры в постоянную собственность. Превосходное качество дерева и сборки.</p>
            
            <ul class="features-list">
              <li>
                <div class="icon-check green"></div>
                Сертифицированное эко-дерево и нетоксичные краски
              </li>
              <li>
                <div class="icon-check green"></div>
                Игрушки, которые передаются из поколения в поколение
              </li>
              <li>
                <div class="icon-check green"></div>
                Быстрая доставка прямо к вашей двери
              </li>
            </ul>
          </div>
        </div>
        <div class="card-footer">
          <button class="btn-primary btn-block green-btn">Перейти в магазин</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.compare-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px;
  gap: 48px;
  background: var(--bg-secondary);
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

.cards-wrapper {
  display: flex;
  gap: 32px;
  width: 100%;
}

.compare-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 50%;
  background: var(--text-white);
  box-shadow: var(--shadow-md);
  border-radius: 32px;
  overflow: hidden;
}

.card-image {
  height: 280px;
  background-size: cover;
  background-position: center;
}

.bg-subscription {
  background-image: url('https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80');
}

.bg-shop {
  background-image: url('https://images.unsplash.com/photo-1618842676088-c4d48a6a7c9d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80');
}

.card-info {
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  font-size: 28px;
  font-weight: 700;
}

.card-badge {
  padding: 6px 12px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 12px;
}

.badge-purple {
  background: #EDE9FF;
  color: var(--color-primary);
}

.badge-green {
  background: #E1FAF2;
  color: var(--color-tertiary);
}

.card-desc {
  font-size: 16px;
  line-height: 1.5;
  color: var(--text-muted);
}

.features-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.features-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  color: var(--text-dark);
}

.icon-check {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #EDE9FF;
  position: relative;
}

.icon-check::after {
  content: '';
  position: absolute;
  left: 35%;
  top: 25%;
  width: 5px;
  height: 9px;
  border: solid var(--color-primary);
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.icon-check.green {
  background: #E1FAF2;
}

.icon-check.green::after {
  border-color: var(--color-tertiary);
}

.card-footer {
  padding: 0 40px 40px;
}

.btn-block {
  width: 100%;
  padding: 16px 0;
  font-size: 16px;
  border-radius: 20px;
}

.green-btn {
  background: var(--color-tertiary);
}
.green-btn:hover {
  background: #05b88a;
}

/* Mobile Responsive */
@media (max-width: 960px) {
  .compare-section {
    padding: 48px 24px;
    gap: 36px;
  }

  .title {
    font-size: 32px;
  }

  .cards-wrapper {
    flex-direction: column;
    gap: 24px;
  }

  .compare-card {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .compare-section {
    padding: 36px 16px;
    gap: 24px;
    align-items: stretch;
  }

  .title {
    font-size: 24px;
    line-height: 1.2;
  }

  .subtitle {
    font-size: 14px;
    line-height: 1.45;
  }

  .cards-wrapper {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
  }

  .compare-card {
    width: 100%;
    border-radius: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  }

  .card-image {
    height: 180px;
  }

  .card-info {
    padding: 20px 18px;
    gap: 16px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .card-header h3 {
    font-size: 20px;
    line-height: 1.25;
  }

  .card-badge {
    font-size: 10.5px;
    padding: 4px 10px;
    border-radius: 8px;
    letter-spacing: 0.5px;
    white-space: nowrap;
  }

  .card-desc {
    font-size: 13.5px;
    line-height: 1.45;
  }

  .features-list {
    gap: 10px;
  }

  .features-list li {
    font-size: 13px;
    line-height: 1.4;
    gap: 10px;
  }

  .icon-check {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  .card-footer {
    padding: 0 18px 20px;
  }

  .btn-block {
    padding: 14px 0;
    font-size: 14.5px;
    border-radius: 16px;
  }
}
</style>
