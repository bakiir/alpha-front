<template>
  <section class="hygiene-section" aria-labelledby="hygiene-title">
    <div class="hygiene-section__inner container">
      <div class="hygiene-section__content">
        <p class="hygiene-section__eyebrow">
          <span aria-hidden="true"></span>
          Забота о чистоте
        </p>

        <h2 id="hygiene-title">
          Чисто и бережно —
          <em>каждый раз.</em>
        </h2>

        <p class="hygiene-section__intro">
          После возврата каждая игрушка проходит полный цикл обработки,
          прежде чем отправиться к следующей семье.
        </p>

        <ol class="hygiene-steps">
          <li>
            <span class="hygiene-steps__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="6.5" />
                <path d="m16 16 4 4" />
                <path d="m8.5 11 1.7 1.7 3.6-3.8" />
              </svg>
            </span>
            <div>
              <h3>Проверяем</h3>
              <p>Сверяем комплектность и внимательно осматриваем состояние каждой детали.</p>
            </div>
          </li>

          <li>
            <span class="hygiene-steps__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 3.5s5 5.8 5 10a5 5 0 0 1-10 0c0-4.2 5-10 5-10Z" />
                <path d="M9.5 14.2a2.6 2.6 0 0 0 2.5 2" />
              </svg>
            </span>
            <div>
              <h3>Очищаем</h3>
              <p>Удаляем загрязнения паром и гипоаллергенными средствами, безопасными для детей.</p>
            </div>
          </li>

          <li>
            <span class="hygiene-steps__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M4 8.5h16v11H4z" />
                <path d="M3 5h18v3.5H3zM9 5V3.5h6V5" />
                <path d="m9 14 2 2 4-4" />
              </svg>
            </span>
            <div>
              <h3>Обеззараживаем и упаковываем</h3>
              <p>Завершаем обработку УФ-светом и герметично упаковываем чистую игрушку.</p>
            </div>
          </li>
        </ol>
      </div>

      <figure class="hygiene-section__visual">
        <img
          src="/images/hygiene/disinfection.jpg"
          alt="Сотрудница Alpha очищает и дезинфицирует деревянную игрушку"
          width="1684"
          height="934"
          loading="lazy"
        >
        <figcaption>
          <span aria-hidden="true"></span>
          Игрушка готова к новой игре
        </figcaption>
      </figure>
    </div>
  </section>
</template>

<style scoped>
.hygiene-section {
  padding: clamp(72px, 8vw, 112px) 0;
  background: var(--bg-primary);
}

.hygiene-section__inner {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  align-items: center;
  gap: clamp(48px, 7vw, 96px);
  padding-inline: clamp(20px, 4vw, 64px);
}

.hygiene-section__content {
  max-width: 590px;
}

.hygiene-section__eyebrow {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 18px;
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.hygiene-section__eyebrow span {
  width: 34px;
  height: 2px;
  border-radius: 2px;
  background: var(--color-secondary);
}

.hygiene-section h2 {
  max-width: 600px;
  margin: 0;
  color: var(--text-dark);
  font-size: clamp(44px, 4.6vw, 66px);
  font-weight: 600;
  line-height: 0.98;
}

.hygiene-section h2 em {
  color: var(--color-primary);
  font-weight: 600;
}

.hygiene-section__intro {
  max-width: 570px;
  margin-top: 24px;
  color: var(--text-muted);
  font-size: 16px;
  line-height: 1.7;
}

.hygiene-steps {
  display: flex;
  flex-direction: column;
  gap: 22px;
  margin-top: 34px;
  list-style: none;
}

.hygiene-steps li {
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr);
  align-items: start;
  gap: 16px;
}

.hygiene-steps__icon {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border: 1px solid rgba(63, 103, 87, 0.16);
  border-radius: 50%;
  background: var(--bg-tertiary);
  color: var(--color-primary);
}

.hygiene-steps__icon svg {
  width: 23px;
  height: 23px;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
}

.hygiene-steps h3 {
  margin: 0 0 5px;
  color: var(--text-dark);
  font-size: 23px;
  font-weight: 600;
  line-height: 1.15;
}

.hygiene-steps p {
  margin: 0;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.55;
}

.hygiene-section__visual {
  position: relative;
  aspect-ratio: 4 / 3;
  margin: 0;
}

.hygiene-section__visual::before {
  position: absolute;
  inset: 18px -18px -18px 18px;
  z-index: 0;
  border-radius: var(--radius-xl);
  background: var(--bg-tertiary);
  content: '';
}

.hygiene-section__visual img {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  height: 100%;
  border-radius: var(--radius-xl);
  object-fit: cover;
  object-position: center;
  box-shadow: 0 20px 48px rgba(51, 61, 54, 0.16);
}

.hygiene-section__visual figcaption {
  position: absolute;
  right: 22px;
  bottom: 22px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px 15px;
  border: 1px solid rgba(63, 103, 87, 0.15);
  border-radius: var(--radius-full);
  background: rgba(250, 248, 244, 0.92);
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
  font-size: 12px;
  font-weight: 800;
  backdrop-filter: blur(8px);
}

.hygiene-section__visual figcaption span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-secondary);
}

@media (max-width: 900px) {
  .hygiene-section__inner {
    grid-template-columns: 1fr;
    gap: 46px;
  }

  .hygiene-section__content {
    max-width: 720px;
  }
}

@media (max-width: 640px) {
  .hygiene-section {
    padding: 56px 0 66px;
  }

  .hygiene-section__inner {
    gap: 36px;
    padding-inline: 16px;
  }

  .hygiene-section__eyebrow {
    margin-bottom: 14px;
  }

  .hygiene-section h2 {
    font-size: clamp(40px, 12vw, 50px);
  }

  .hygiene-section__intro {
    margin-top: 18px;
    font-size: 14.5px;
  }

  .hygiene-steps {
    gap: 20px;
    margin-top: 28px;
  }

  .hygiene-steps li {
    grid-template-columns: 42px minmax(0, 1fr);
    gap: 13px;
  }

  .hygiene-steps__icon {
    width: 42px;
    height: 42px;
  }

  .hygiene-steps h3 {
    font-size: 21px;
  }

  .hygiene-section__visual::before {
    inset: 10px -6px -10px 10px;
    border-radius: var(--radius-lg);
  }

  .hygiene-section__visual img {
    border-radius: var(--radius-lg);
    object-position: 52% center;
  }

  .hygiene-section__visual figcaption {
    right: 12px;
    bottom: 12px;
    max-width: calc(100% - 24px);
    padding: 8px 11px;
    font-size: 10px;
  }
}
</style>
