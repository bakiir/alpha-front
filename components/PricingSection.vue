<template>
  <section id="pricing" class="pricing-section container">
    <div class="section-heading">
      <div class="badge">стоимость</div>
      <h2 class="title">Инвестируйте в развитие, а не в пластик</h2>
      <p class="subtitle">Тарифы дешевле покупки одной качественной деревянной игрушки в магазине.</p>
    </div>

    <div class="pricing-grid">
      <!-- Starter -->
      <div class="plan-card">
        <div class="plan-content">
          <div class="plan-header">
            <h3>Starter</h3>
            <p>3 развивающие игрушки</p>
            <div class="price">
              <span class="amount">7 900 ₸</span>
              <span class="period">/мес</span>
            </div>
          </div>
          <div class="divider"></div>
          <ul class="features">
            <li><div class="icon-check"></div> Индивидуальный подбор методистами</li>
            <li><div class="icon-check"></div> Глубокая эко-стерилизация</li>
            <li><div class="icon-check"></div> Методические материалы для родителей</li>
            <li><div class="icon-check"></div> Доставка оплачивается отдельно</li>
          </ul>
        </div>
        <button class="btn-outline btn-block" @click="openQuiz('starter')">Выбрать тариф</button>
      </div>

      <!-- Explorer (Recommended) -->
      <div class="plan-card recommended">
        <div class="recommended-badge">РЕКОМЕНДУЕМ</div>
        <div class="plan-content">
          <div class="plan-header">
            <h3 class="text-white">Explorer</h3>
            <p class="text-light">5 развивающих игрушек</p>
            <div class="price">
              <span class="amount text-white">12 900 ₸</span>
              <span class="period text-light">/мес</span>
            </div>
          </div>
          <div class="divider light"></div>
          <ul class="features">
            <li><div class="icon-check yellow"></div> <span class="text-white">Индивидуальный подбор методистами</span></li>
            <li><div class="icon-check yellow"></div> <span class="text-white">Глубокая эко-стерилизация</span></li>
            <li><div class="icon-check yellow"></div> <span class="text-white">Методические материалы для родителей</span></li>
            <li><div class="icon-check yellow"></div> <span class="text-white">Бесплатная доставка и обмен</span></li>
            <li><div class="icon-check yellow"></div> <span class="text-white">Приоритетная поддержка 24/7</span></li>
          </ul>
        </div>
        <button class="btn-primary btn-block btn-white" @click="openQuiz('explorer')">Выбрать тариф</button>
      </div>

      <!-- Max -->
      <div class="plan-card">
        <div class="plan-content">
          <div class="plan-header">
            <h3>Max</h3>
            <p>8 развивающих игрушек</p>
            <div class="price">
              <span class="amount">18 900 ₸</span>
              <span class="period">/мес</span>
            </div>
          </div>
          <div class="divider"></div>
          <ul class="features">
            <li><div class="icon-check"></div> Индивидуальный подбор методистами</li>
            <li><div class="icon-check"></div> Глубокая эко-стерилизация</li>
            <li><div class="icon-check"></div> Методические материалы для родителей</li>
            <li><div class="icon-check"></div> Бесплатная доставка и обмен</li>
            <li><div class="icon-check"></div> Приоритетная поддержка 24/7</li>
            <li><div class="icon-check"></div> Возможность заказать редкие наборы</li>
          </ul>
        </div>
        <button class="btn-outline btn-block" @click="openQuiz('max')">Выбрать тариф</button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { openQuiz } = useQuiz()
</script>

<style scoped>
.pricing-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100px 80px;
  gap: 64px;
  background: var(--bg-primary);
}

.section-heading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
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

.pricing-grid {
  display: flex;
  align-items: flex-end;
  gap: 24px;
  width: 100%;
}

.plan-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px;
  width: 100%;
  flex: 1;
  background: var(--text-white);
  border: 1px solid #EADFC9;
  border-radius: 32px;
  min-height: 600px;
  position: relative;
}

.plan-card.recommended {
  background: var(--color-primary);
  border: none;
  box-shadow: var(--shadow-lg);
  transform: translateY(-20px);
}

.recommended-badge {
  position: absolute;
  top: -14px;
  right: 24px;
  background: var(--color-secondary);
  border-radius: 12px;
  padding: 6px 16px;
  font-weight: 700;
  font-size: 12px;
  color: var(--text-dark);
}

.plan-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.plan-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.plan-header h3 {
  font-size: 24px;
  font-weight: 700;
}

.plan-header p {
  font-size: 14px;
  color: var(--text-muted);
}

.price {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-top: 8px;
}

.amount {
  font-family: 'Outfit';
  font-weight: 800;
  font-size: 40px;
  color: var(--text-dark);
}

.period {
  font-size: 16px;
  color: var(--text-muted);
}

.divider {
  width: 100%;
  height: 1px;
  background: #EADFC9;
}

.divider.light {
  background: rgba(255, 255, 255, 0.15);
}

.features {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.features li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  color: var(--text-dark);
}

.icon-check {
  width: 18px;
  height: 18px;
  position: relative;
}

.icon-check::after {
  content: '';
  position: absolute;
  left: 35%;
  top: 25%;
  width: 4px;
  height: 8px;
  border: solid var(--color-primary);
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.icon-check.yellow::after {
  border-color: var(--color-secondary);
}

.text-white { color: var(--text-white) !important; }
.text-light { color: #EDE9FF !important; }

.btn-block {
  width: 100%;
  text-align: center;
}

.btn-white {
  background: var(--text-white);
  color: var(--color-primary);
}
.btn-white:hover {
  background: #f0f0f0;
}

/* Mobile Responsive */
@media (max-width: 960px) {
  .pricing-section {
    padding: 60px 24px;
    gap: 40px;
  }

  .title {
    font-size: 32px;
  }

  .pricing-grid {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-padding: 0 16px;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding: 24px 4px 20px 4px;
    gap: 16px;
    align-items: stretch;
    -webkit-overflow-scrolling: touch;
  }

  .pricing-grid::-webkit-scrollbar {
    display: none;
  }

  .pricing-grid::after {
    content: '';
    flex: 0 0 4px;
  }

  .plan-card {
    flex: 0 0 85%;
    width: 85%;
    min-height: auto;
    scroll-snap-align: center;
    padding: 32px 24px;
    border-radius: 28px;
  }

  .plan-card.recommended {
    transform: none;
  }
}

@media (max-width: 640px) {
  .pricing-section {
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

  .plan-card {
    flex: 0 0 88%;
    width: 88%;
    padding: 28px 20px;
    border-radius: 24px;
  }
}
</style>
