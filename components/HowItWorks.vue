<template>
  <section id="how-it-works" class="how-it-works container">
    <div class="section-heading">
      <div class="badge">простой процесс</div>
      <h2 class="title">Как устроена подписка Alpha</h2>
      <p class="subtitle">Всего 4 простых шага, чтобы в вашем доме появились по-настоящему полезные игрушки.</p>
    </div>

    <div class="steps-grid">
      <!-- Шаг 1 -->
      <div class="step-card">
        <div class="step-number">1</div>
        <div class="step-info">
          <h3>Выберите тариф</h3>
          <p>Выберите количество игрушек в наборе, которое подходит вашей семье.</p>
        </div>
      </div>

      <!-- Шаг 2 -->
      <div class="step-card">
        <div class="step-number">2</div>
        <div class="step-info">
          <h3>Расскажите о ребёнке</h3>
          <p>Укажите возраст, интересы и текущие навыки для идеального подбора.</p>
        </div>
      </div>

      <!-- Шаг 3 -->
      <div class="step-card">
        <div class="step-number">3</div>
        <div class="step-info">
          <h3>Получите набор</h3>
          <p>Мы доставим тщательно продезинфицированные эко-игрушки с инструкцией для игр.</p>
        </div>
      </div>

      <!-- Шаг 4 -->
      <div class="step-card">
        <div class="step-number">4</div>
        <div class="step-info">
          <h3>Обменяйте вовремя</h3>
          <p>Когда ребёнок наиграется, мы привезём новый набор и заберём старый.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.how-it-works {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100px 80px;
  gap: 56px;
  background: var(--bg-primary);
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

.steps-grid {
  display: flex;
  gap: 24px;
  width: 100%;
}

.step-card {
  display: flex;
  flex-direction: column;
  padding: 32px;
  gap: 20px;
  background: var(--text-white);
  border-radius: 24px;
  flex: 1;
}

.step-number {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  background: var(--color-secondary);
  border-radius: 24px;
  font-family: 'Outfit';
  font-weight: 700;
  font-size: 20px;
  color: var(--text-dark);
}

.step-info h3 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
}

.step-info p {
  font-size: 15px;
  line-height: 1.5;
  color: var(--text-muted);
}

/* Mobile Responsive */
@media (max-width: 960px) {
  .how-it-works {
    padding: 60px 24px;
    gap: 40px;
  }

  .title {
    font-size: 32px;
  }
}

@media (max-width: 768px) {
  .how-it-works {
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

  .steps-grid {
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

  .steps-grid::-webkit-scrollbar {
    display: none;
  }

  .steps-grid::after {
    content: '';
    flex: 0 0 4px;
  }

  .step-card {
    flex: 0 0 78%;
    width: 78%;
    scroll-snap-align: center;
    padding: 24px 20px;
    border-radius: 20px;
  }

  .step-info h3 {
    font-size: 18px;
  }

  .step-info p {
    font-size: 14px;
  }
}
</style>
