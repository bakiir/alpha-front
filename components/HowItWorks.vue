<template>
  <section id="how-it-works" class="how-it-works container">
    <div class="section-heading">
      <div class="badge">ПРОСТОЙ ПРОЦЕСС</div>
      <h2 class="title">Как работает подписка Alpha</h2>
      <p class="subtitle">Всего 3 простых шага, чтобы в вашем доме появились по-настоящему полезные игрушки без гор пластика:</p>
    </div>

    <!-- 3 Steps Grid -->
    <div class="steps-grid-3">
      <!-- Step 1 -->
      <div class="step-card-modern">
        <div class="step-card-top">
          <span class="step-badge">ШАГ 1</span>
          <div class="step-number">1</div>
        </div>
        <div class="step-icon-wrap">
          <span class="big-icon">👶</span>
        </div>
        <div class="step-info">
          <h3>Укажите возраст малыша</h3>
          <p>
            Методисты Монтессори подбирают 6 сертифицированных эко-игрушек из бука строго под текущий этап развития и навыки ребенка.
          </p>
        </div>
        <div class="step-pill-hint">
          <span>🎯 Точное попадание в возраст</span>
        </div>
      </div>

      <!-- Step 2 -->
      <div class="step-card-modern">
        <div class="step-card-top">
          <span class="step-badge">ШАГ 2</span>
          <div class="step-number">2</div>
        </div>
        <div class="step-icon-wrap">
          <span class="big-icon">📦</span>
        </div>
        <div class="step-info">
          <h3>Курьер привозит бокс</h3>
          <p>
            Бесплатная доставка до двери. Игрушки прошли 4-ступенчатую медицинскую дезинфекцию озоном. В комплекте — методичка с развивающими играми.
          </p>
        </div>
        <div class="step-pill-hint">
          <span>🚚 Бесплатно прямо в руки</span>
        </div>
      </div>

      <!-- Step 3 -->
      <div class="step-card-modern highlighted-step">
        <div class="step-card-top">
          <span class="step-badge green">ШАГ 3 • ОБМЕН</span>
          <div class="step-number green-number">3</div>
        </div>
        <div class="step-icon-wrap">
          <span class="big-icon">🔄</span>
        </div>
        <div class="step-info">
          <h3>Обмен через 2 месяца</h3>
          <p>
            Малыш освоил навыки и подрос. Курьер бесплатно привозит следующий набор для нового возраста, а предыдущий забирает. Никакого хлама дома!
          </p>
        </div>
        <div class="step-pill-hint green-hint">
          <span>✨ Игрушки никогда не надоедают</span>
        </div>
      </div>
    </div>

    <!-- Bottom Action CTA -->
    <div class="how-it-works-action">
      <a href="#pricing" class="btn-primary btn-large">
        Посмотреть тарифы подписки →
      </a>
      <span class="guarantee-text">🔒 Без залога • Бесплатный обмен • Отмена в любой момент</span>
    </div>
  </section>
</template>

<script setup lang="ts">
// Modern 3-Step How It Works
</script>

<style scoped>
.how-it-works {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 88px 0;
  gap: 48px;
}

.section-heading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  max-width: 760px;
}

.badge {
  padding: 6px 16px;
  background: var(--bg-secondary);
  border-radius: 50px;
  font-weight: 800;
  font-size: 12px;
  color: var(--color-primary);
  letter-spacing: 0.5px;
  border: 1px solid rgba(124, 92, 252, 0.15);
}

.title {
  font-family: 'Outfit', sans-serif;
  font-size: 38px;
  font-weight: 800;
  color: var(--text-dark);
}

.subtitle {
  font-size: 16px;
  color: var(--text-muted);
  line-height: 1.5;
}

/* 3 Steps Grid */
.steps-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
  width: 100%;
}

.step-card-modern {
  background: #FFFFFF;
  border-radius: 28px;
  padding: 36px 30px;
  border: 1.5px solid #F0EDFF;
  box-shadow: 0 10px 28px rgba(124, 92, 252, 0.04);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 20px;
  transition: all 0.25s ease;
}

.step-card-modern:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 36px rgba(124, 92, 252, 0.1);
  border-color: #D6C9FF;
}

.highlighted-step {
  border-color: var(--color-primary);
  background: #FDFAFF;
}

.step-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step-badge {
  font-size: 11px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 10px;
  background: var(--bg-secondary);
  color: var(--color-primary);
}

.step-badge.green {
  background: var(--bg-tertiary);
  color: #059669;
}

.step-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 16px;
}

.green-number {
  background: #10B981;
}

.step-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 68px;
  height: 68px;
  border-radius: 20px;
  background: #FAF8FF;
  margin: 4px 0;
}

.big-icon {
  font-size: 36px;
}

.step-info h3 {
  font-family: 'Outfit', sans-serif;
  font-size: 21px;
  font-weight: 800;
  color: var(--text-dark);
  margin-bottom: 8px;
}

.step-info p {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.55;
  margin: 0;
}

.step-pill-hint {
  padding: 8px 12px;
  background: #F8F6FF;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-primary);
  text-align: center;
}

.green-hint {
  background: #F0FDF4;
  color: #059669;
}

/* Action CTA */
.how-it-works-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.guarantee-text {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 600;
}

/* Responsive */
@media (max-width: 960px) {
  .steps-grid-3 {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .how-it-works {
    padding: 56px 0;
  }

  .title {
    font-size: 30px;
  }
}

@media (max-width: 640px) {
  .step-card-modern {
    padding: 24px 20px;
  }

  .title {
    font-size: 24px;
  }

  .how-it-works-action a {
    width: 100%;
    text-align: center;
  }
}
</style>
