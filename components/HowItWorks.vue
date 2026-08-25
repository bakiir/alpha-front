<template>
  <section id="how-it-works" class="how-it-works container">
    <div class="section-heading">
      <div class="badge">простой процесс</div>
      <h2 class="title">Как устроена подписка Alpha</h2>
      <p class="subtitle">Всего 4 простых шага, чтобы в вашем доме появились по-настоящему полезные игрушки.</p>
      
      <!-- Flow Roadmap Indicator Bar -->
      <div class="flow-pills-row">
        <div class="flow-pill" :class="{ active: activeStep === 1 }" @click="activeStep = 1">
          <span class="pill-dot">1</span>
          <span class="pill-text">Тариф</span>
        </div>
        <div class="flow-arrow-sep">➔</div>
        
        <div class="flow-pill" :class="{ active: activeStep === 2 }" @click="activeStep = 2">
          <span class="pill-dot">2</span>
          <span class="pill-text">О ребёнке</span>
        </div>
        <div class="flow-arrow-sep">➔</div>
        
        <div class="flow-pill" :class="{ active: activeStep === 3 }" @click="activeStep = 3">
          <span class="pill-dot">3</span>
          <span class="pill-text">Доставка</span>
        </div>
        <div class="flow-arrow-sep">➔</div>
        
        <div class="flow-pill" :class="{ active: activeStep === 4 }" @click="activeStep = 4">
          <span class="pill-dot">4</span>
          <span class="pill-text">Обмен</span>
        </div>
      </div>
    </div>

    <div class="steps-grid">
      <!-- Шаг 1 -->
      <div class="step-card" :class="{ highlighted: activeStep === 1 }" @click="activeStep = 1">
        <div class="step-card-top">
          <div class="step-number">1</div>
          <span class="step-badge">ШАГ 1</span>
        </div>
        <div class="step-info">
          <h3>Выберите тариф</h3>
          <p>Выберите количество игрушек в наборе, которое идеально подходит вашей семье.</p>
        </div>
        <div class="step-footer-flow">
          <span class="flow-hint">Далее: анкета ➔</span>
        </div>
      </div>

      <!-- Connector 1->2 (Desktop) -->
      <div class="step-connector desktop-connector">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7C5CFC" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </div>

      <!-- Шаг 2 -->
      <div class="step-card" :class="{ highlighted: activeStep === 2 }" @click="activeStep = 2">
        <div class="step-card-top">
          <div class="step-number">2</div>
          <span class="step-badge">ШАГ 2</span>
        </div>
        <div class="step-info">
          <h3>Расскажите о ребёнке</h3>
          <p>Укажите возраст, интересы и текущие навыки для персонального подбора Монтессори.</p>
        </div>
        <div class="step-footer-flow">
          <span class="flow-hint">Далее: сборка ➔</span>
        </div>
      </div>

      <!-- Connector 2->3 (Desktop) -->
      <div class="step-connector desktop-connector">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7C5CFC" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </div>

      <!-- Шаг 3 -->
      <div class="step-card" :class="{ highlighted: activeStep === 3 }" @click="activeStep = 3">
        <div class="step-card-top">
          <div class="step-number">3</div>
          <span class="step-badge">ШАГ 3</span>
        </div>
        <div class="step-info">
          <h3>Получите набор</h3>
          <p>Мы доставим стерилизованные эко-игрушки прямо к порогу с инструкцией для развивающих игр.</p>
        </div>
        <div class="step-footer-flow">
          <span class="flow-hint">Далее: обмен ➔</span>
        </div>
      </div>

      <!-- Connector 3->4 (Desktop) -->
      <div class="step-connector desktop-connector">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7C5CFC" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </div>

      <!-- Шаг 4 -->
      <div class="step-card" :class="{ highlighted: activeStep === 4 }" @click="activeStep = 4">
        <div class="step-card-top">
          <div class="step-number green-number">4</div>
          <span class="step-badge green-badge">ФИНАЛ 🎉</span>
        </div>
        <div class="step-info">
          <h3>Обменяйте вовремя</h3>
          <p>Когда ребёнок наиграется, курьер привезёт новый развивающий набор и заберёт старый.</p>
        </div>
        <div class="step-footer-flow">
          <span class="flow-hint done">Бесконечная польза ✨</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activeStep = ref(1)
</script>

<style scoped>
.how-it-works {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 90px 80px;
  gap: 48px;
  background: var(--bg-primary);
}

.section-heading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  max-width: 760px;
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
  font-weight: 800;
}

.subtitle {
  font-size: 17px;
  color: var(--text-muted);
  line-height: 1.5;
}

/* Flow Roadmap Indicator Bar */
.flow-pills-row {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #FFFFFF;
  padding: 6px 12px;
  border-radius: 50px;
  border: 1px solid rgba(124, 92, 252, 0.12);
  box-shadow: 0 4px 16px rgba(124, 92, 252, 0.05);
  margin-top: 8px;
  overflow-x: auto;
  max-width: 100%;
  scrollbar-width: none;
}

.flow-pills-row::-webkit-scrollbar {
  display: none;
}

.flow-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.flow-pill:hover,
.flow-pill.active {
  background: #F0EDFF;
}

.pill-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #FFD166;
  color: #1A1A2E;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flow-pill.active .pill-dot {
  background: #7C5CFC;
  color: #FFFFFF;
}

.pill-text {
  font-size: 13px;
  font-weight: 700;
  color: #4A4A68;
}

.flow-pill.active .pill-text {
  color: #7C5CFC;
}

.flow-arrow-sep {
  color: #A284F6;
  font-size: 11px;
  opacity: 0.7;
}

/* Steps Grid */
.steps-grid {
  display: flex;
  align-items: stretch;
  gap: 12px;
  width: 100%;
}

.step-card {
  display: flex;
  flex-direction: column;
  padding: 28px 24px;
  gap: 16px;
  background: #FFFFFF;
  border-radius: 24px;
  border: 1.5px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.02);
  flex: 1;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
}

.step-card:hover,
.step-card.highlighted {
  border-color: #7C5CFC;
  transform: translateY(-3px);
  box-shadow: 0 10px 28px rgba(124, 92, 252, 0.1);
}

.step-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step-number {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 44px;
  height: 44px;
  background: #FFD166;
  border-radius: 16px;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 19px;
  color: #1A1A2E;
  box-shadow: 0 4px 12px rgba(255, 209, 102, 0.35);
}

.green-number {
  background: #06D6A0;
  color: #FFFFFF;
  box-shadow: 0 4px 12px rgba(6, 214, 160, 0.35);
}

.step-badge {
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 800;
  color: #7C5CFC;
  background: #F0EDFF;
  padding: 4px 10px;
  border-radius: 8px;
  letter-spacing: 0.5px;
}

.green-badge {
  color: #058563;
  background: #E8FAF4;
}

.step-info {
  flex: 1;
}

.step-info h3 {
  font-size: 18.5px;
  font-weight: 800;
  color: #1A1A2E;
  margin-bottom: 8px;
  line-height: 1.3;
}

.step-info p {
  font-size: 14px;
  line-height: 1.5;
  color: #7B7B93;
}

.step-footer-flow {
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid #F4F4F8;
}

.flow-hint {
  font-size: 12px;
  font-weight: 700;
  color: #7C5CFC;
}

.flow-hint.done {
  color: #058563;
}

/* Desktop Connector Arrows */
.step-connector {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7C5CFC;
  opacity: 0.6;
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 1080px) {
  .desktop-connector {
    display: none;
  }

  .steps-grid {
    gap: 16px;
  }
}

@media (max-width: 960px) {
  .how-it-works {
    padding: 60px 24px;
    gap: 36px;
  }

  .title {
    font-size: 32px;
  }
}

@media (max-width: 768px) {
  .how-it-works {
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

  .flow-pills-row {
    padding: 4px 8px;
    gap: 4px;
    align-self: center;
  }

  .flow-pill {
    padding: 4px 8px;
  }

  .pill-text {
    font-size: 12px;
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
    flex: 0 0 82%;
    width: 82%;
    scroll-snap-align: center;
    padding: 20px 18px;
    border-radius: 20px;
    gap: 12px;
  }

  .step-number {
    width: 38px;
    height: 38px;
    font-size: 16px;
    border-radius: 12px;
  }

  .step-info h3 {
    font-size: 17px;
    margin-bottom: 6px;
  }

  .step-info p {
    font-size: 13.5px;
    line-height: 1.45;
  }
}
</style>
