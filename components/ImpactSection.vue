<template>
  <section id="impact" class="impact-section" aria-labelledby="impact-title">
    <div class="impact-section__inner container">
      <div class="impact-section__card">
        <div class="impact-section__content">
          <p class="impact-section__eyebrow">
            <span aria-hidden="true"></span>
            Круговорот Alpha
          </p>

          <h2 id="impact-title">
            Игрушки продолжают
            <em>играть.</em>
          </h2>

          <p class="impact-section__intro">
            Одна качественная игрушка может радовать несколько семей.
            Возврат и повторная выдача продлевают её жизнь и помогают
            покупать меньше лишнего.
          </p>

          <ol class="impact-cycle" aria-label="Круговорот игрушки Alpha">
            <li>
              <span>01</span>
              Выбрали
            </li>
            <li aria-hidden="true" class="impact-cycle__arrow">→</li>
            <li>
              <span>02</span>
              Поиграли
            </li>
            <li aria-hidden="true" class="impact-cycle__arrow">→</li>
            <li>
              <span>03</span>
              Передали дальше
            </li>
          </ol>

          <NuxtLink to="/how-it-works" class="impact-section__link">
            Как это работает
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M14 7l5 5-5 5" />
            </svg>
          </NuxtLink>
        </div>

        <div class="impact-counter" aria-label="Ноль игрушек получили вторую жизнь">
          <span class="impact-counter__kicker">Уже</span>
          <strong>{{ formattedImpactCount }}</strong>
          <p>игрушек получили<br>вторую жизнь</p>
          <span class="impact-counter__note">
            Каждый следующий обмен увеличит этот счётчик
          </span>

          <span class="impact-counter__orbit impact-counter__orbit--one" aria-hidden="true"></span>
          <span class="impact-counter__orbit impact-counter__orbit--two" aria-hidden="true"></span>
          <span class="impact-counter__block impact-counter__block--peach" aria-hidden="true"></span>
          <span class="impact-counter__block impact-counter__block--lavender" aria-hidden="true"></span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const impactCount = 0
const formattedImpactCount = new Intl.NumberFormat('ru-RU').format(impactCount)
</script>

<style scoped>
.impact-section {
  padding: clamp(72px, 8vw, 112px) 0;
  background: var(--bg-tertiary);
}

.impact-section__inner {
  padding-inline: clamp(20px, 4vw, 64px);
}

.impact-section__card {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(340px, 0.85fr);
  align-items: stretch;
  gap: clamp(32px, 5vw, 72px);
  min-height: 520px;
  padding: clamp(42px, 6vw, 82px);
  overflow: hidden;
  border-radius: var(--radius-xl);
  background: var(--color-primary);
  box-shadow: 0 24px 60px rgba(49, 81, 69, 0.15);
}

.impact-section__content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}

.impact-section__eyebrow {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 18px;
  color: var(--soft-sage);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.impact-section__eyebrow span {
  width: 34px;
  height: 2px;
  border-radius: 2px;
  background: var(--color-secondary);
}

.impact-section h2 {
  max-width: 650px;
  margin: 0;
  color: var(--text-white);
  font-size: clamp(48px, 5vw, 72px);
  font-weight: 600;
  line-height: 0.94;
}

.impact-section h2 em {
  color: var(--color-secondary);
  font-weight: 600;
}

.impact-section__intro {
  max-width: 620px;
  margin: 25px 0 0;
  color: rgba(255, 255, 255, 0.78);
  font-size: 16px;
  line-height: 1.7;
}

.impact-cycle {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 32px 0 0;
  padding: 0;
  color: var(--text-white);
  list-style: none;
}

.impact-cycle li:not(.impact-cycle__arrow) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border: 1px solid rgba(255, 255, 255, 0.17);
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.07);
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.impact-cycle li span {
  color: var(--color-secondary);
  font-size: 10px;
  font-weight: 800;
}

.impact-cycle__arrow {
  color: rgba(255, 255, 255, 0.46);
  font-size: 15px;
}

.impact-section__link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  margin-top: 34px;
  padding: 0 20px;
  border: 1px solid var(--text-white);
  border-radius: var(--radius-full);
  background: var(--text-white);
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 800;
  transition: transform 180ms ease, background-color 180ms ease, color 180ms ease;
}

.impact-section__link svg {
  width: 19px;
  height: 19px;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
}

.impact-section__link:hover {
  transform: translateY(-2px);
  background: transparent;
  color: var(--text-white);
}

.impact-section__link:focus-visible {
  outline: 3px solid var(--color-secondary);
  outline-offset: 4px;
}

.impact-counter {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 0;
  padding: 48px 32px;
  overflow: hidden;
  border-radius: calc(var(--radius-xl) - 4px);
  background: var(--bg-primary);
  color: var(--color-primary);
  text-align: center;
}

.impact-counter::before {
  position: absolute;
  inset: 28px;
  z-index: -1;
  border: 1px solid rgba(63, 103, 87, 0.12);
  border-radius: 50%;
  content: '';
}

.impact-counter__kicker {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.impact-counter strong {
  display: block;
  margin: -8px 0 -10px;
  color: var(--color-primary);
  font-family: var(--font-display);
  font-size: clamp(132px, 13vw, 190px);
  font-weight: 600;
  letter-spacing: -0.08em;
  line-height: 1;
}

.impact-counter p {
  margin: 0;
  color: var(--text-dark);
  font-family: var(--font-display);
  font-size: clamp(26px, 2.3vw, 35px);
  font-weight: 600;
  line-height: 1.02;
}

.impact-counter__note {
  max-width: 260px;
  margin-top: 22px;
  color: var(--text-muted);
  font-size: 11px;
  line-height: 1.5;
}

.impact-counter__orbit {
  position: absolute;
  z-index: -1;
  border: 1px solid rgba(63, 103, 87, 0.1);
  border-radius: 50%;
}

.impact-counter__orbit--one {
  width: 330px;
  height: 330px;
}

.impact-counter__orbit--two {
  width: 430px;
  height: 430px;
}

.impact-counter__block {
  position: absolute;
  width: 54px;
  height: 54px;
  border-radius: 14px;
  opacity: 0.9;
}

.impact-counter__block--peach {
  top: 34px;
  right: 38px;
  background: var(--color-secondary);
  transform: rotate(13deg);
}

.impact-counter__block--lavender {
  bottom: 38px;
  left: 34px;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--color-tertiary);
}

@media (max-width: 1050px) {
  .impact-section__card {
    grid-template-columns: 1fr;
  }

  .impact-counter {
    min-height: 390px;
  }

  .impact-counter strong {
    font-size: 150px;
  }
}

@media (max-width: 640px) {
  .impact-section {
    padding: 56px 0;
  }

  .impact-section__inner {
    padding-inline: 16px;
  }

  .impact-section__card {
    gap: 34px;
    min-height: 0;
    padding: 38px 20px 20px;
    border-radius: var(--radius-lg);
  }

  .impact-section h2 {
    font-size: clamp(43px, 13vw, 54px);
  }

  .impact-section__intro {
    margin-top: 20px;
    font-size: 14px;
  }

  .impact-cycle {
    align-items: stretch;
    width: 100%;
    gap: 7px;
    margin-top: 26px;
  }

  .impact-cycle li:not(.impact-cycle__arrow) {
    flex: 1;
    flex-direction: column;
    justify-content: center;
    gap: 2px;
    min-width: 0;
    padding: 9px 5px;
    text-align: center;
    white-space: normal;
  }

  .impact-cycle__arrow {
    align-self: center;
  }

  .impact-section__link {
    width: 100%;
    justify-content: center;
    margin-top: 28px;
  }

  .impact-counter {
    min-height: 350px;
    padding: 42px 20px;
    border-radius: var(--radius-md);
  }

  .impact-counter::before {
    inset: 20px;
  }

  .impact-counter strong {
    font-size: 134px;
  }

  .impact-counter p {
    font-size: 28px;
  }

  .impact-counter__orbit--one {
    width: 270px;
    height: 270px;
  }

  .impact-counter__orbit--two {
    width: 350px;
    height: 350px;
  }

  .impact-counter__block--peach {
    top: 28px;
    right: 27px;
    width: 42px;
    height: 42px;
    border-radius: 11px;
  }

  .impact-counter__block--lavender {
    bottom: 28px;
    left: 27px;
    width: 34px;
    height: 34px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .impact-section__link {
    transition: none;
  }
}
</style>
