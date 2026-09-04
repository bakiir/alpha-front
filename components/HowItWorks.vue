<template>
  <section id="how-it-works" class="how-it-works" aria-labelledby="how-it-works-title">
    <div class="how-it-works__inner container">
      <header class="how-it-works__header">
        <div>
          <p class="how-it-works__eyebrow">Как это работает</p>
          <h2 id="how-it-works-title">Один сервис — четыре сценария</h2>
        </div>
        <p class="how-it-works__intro">Выберите подходящий вариант — покажем главное в трёх шагах.</p>
      </header>

      <div
        class="how-it-works__tabs"
        role="tablist"
        aria-label="Сценарии работы сервиса Alpha"
        @keydown="handleTabKeydown"
      >
        <button
          v-for="(scenario, index) in scenarios"
          :id="`home-how-tab-${scenario.key}`"
          :key="scenario.key"
          type="button"
          role="tab"
          class="scenario-tab"
          :class="{ 'is-active': activeScenario.key === scenario.key }"
          :data-scenario-key="scenario.key"
          :aria-selected="activeScenario.key === scenario.key"
          :aria-controls="`home-how-panel-${scenario.key}`"
          :tabindex="activeScenario.key === scenario.key ? 0 : -1"
          @click="activeScenarioKey = scenario.key"
        >
          <span class="scenario-tab__number">{{ String(index + 1).padStart(2, '0') }}</span>
          <span>{{ scenario.tabLabel }}</span>
        </button>
      </div>

      <div
        :id="`home-how-panel-${activeScenario.key}`"
        class="scenario-panel"
        role="tabpanel"
        :aria-labelledby="`home-how-tab-${activeScenario.key}`"
      >
        <div class="scenario-panel__visual">
          <img
            :src="activeScenario.image"
            :alt="activeScenario.imageAlt"
            width="1332"
            height="1181"
            loading="lazy"
          >
          <span class="scenario-panel__label">{{ activeScenario.shortLabel }}</span>
        </div>

        <div class="scenario-panel__content">
          <p class="scenario-panel__eyebrow">{{ activeScenario.eyebrow }}</p>
          <h3>{{ activeScenario.title }}</h3>
          <p class="scenario-panel__description">{{ activeScenario.description }}</p>

          <ol class="scenario-steps">
            <li v-for="(step, index) in activeScenario.steps" :key="step.title">
              <span class="scenario-steps__number">{{ index + 1 }}</span>
              <div>
                <h4>{{ step.title }}</h4>
                <p>{{ step.text }}</p>
              </div>
            </li>
          </ol>

          <NuxtLink :to="activeScenario.cta.to" class="scenario-panel__cta">
            {{ activeScenario.cta.label }}
            <span aria-hidden="true">→</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { HowItWorksScenarioKey } from '~/types/how-it-works'

interface ScenarioPreview {
  key: HowItWorksScenarioKey
  tabLabel: string
  shortLabel: string
  eyebrow: string
  title: string
  description: string
  image: string
  imageAlt: string
  steps: Array<{ title: string; text: string }>
  cta: { label: string; to: string }
}

const scenarios: ScenarioPreview[] = [
  {
    key: 'subscription',
    tabLabel: 'Аренда',
    shortLabel: 'Меняйте, когда ребёнок готов к новому',
    eyebrow: 'Игрушки растут вместе с интересами',
    title: 'Арендуйте и меняйте',
    description: 'Полезные игрушки дома — без лишних покупок и хранения.',
    image: '/images/how-it-works/home-rent.png',
    imageAlt: 'Родитель передаёт ребёнку игрушку для игры по подписке Alpha',
    steps: [
      { title: 'Выберите тариф', text: 'Подберите удобный размер набора.' },
      { title: 'Соберите бокс', text: 'Добавьте игрушки по возрасту и интересам.' },
      { title: 'Играйте и меняйте', text: 'Верните набор, когда захочется нового.' },
    ],
    cta: { label: 'Выбрать тариф', to: '/subscription' },
  },
  {
    key: 'buying',
    tabLabel: 'Покупка',
    shortLabel: 'Любимые игрушки остаются с вами',
    eyebrow: 'Для постоянной домашней коллекции',
    title: 'Покупайте понравившееся',
    description: 'Выбирайте игрушки без подписки и играйте сколько угодно.',
    image: '/images/how-it-works/home-buy.png',
    imageAlt: 'Родитель и ребёнок выбирают игрушки для покупки в Alpha',
    steps: [
      { title: 'Найдите игрушку', text: 'Используйте каталог и фильтры по возрасту.' },
      { title: 'Оформите заказ', text: 'Проверьте корзину и укажите адрес.' },
      { title: 'Получите доставку', text: 'Мы подготовим заказ и привезём его вам.' },
    ],
    cta: { label: 'Перейти в магазин', to: '/shop' },
  },
  {
    key: 'selling',
    tabLabel: 'Продажа',
    shortLabel: 'Освободите место и верните часть стоимости',
    eyebrow: 'Вторая жизнь для хороших игрушек',
    title: 'Продайте игрушки Alpha',
    description: 'Предложите нам игрушки, которыми ребёнок больше не играет.',
    image: '/images/how-it-works/home-sell.png',
    imageAlt: 'Родитель передаёт игрушку сотруднику магазина Alpha',
    steps: [
      { title: 'Расскажите об игрушке', text: 'Укажите состояние и добавьте фотографии.' },
      { title: 'Получите оценку', text: 'Мы предложим предварительную стоимость.' },
      { title: 'Передайте и получите деньги', text: 'После проверки переведём итоговую сумму.' },
    ],
    cta: { label: 'Продать игрушку', to: '/sell' },
  },
  {
    key: 'gift',
    tabLabel: 'Сертификат',
    shortLabel: 'Подарок, с которым трудно ошибиться',
    eyebrow: 'Свобода выбрать любимую игрушку',
    title: 'Подарите сертификат',
    description: 'Электронный подарок для близких — быстро и без лишних хлопот.',
    image: '/images/how-it-works/home-gift.png',
    imageAlt: 'Электронный подарочный сертификат Alpha',
    steps: [
      { title: 'Выберите номинал', text: 'Определите удобную сумму подарка.' },
      { title: 'Добавьте получателя', text: 'Укажите имя и короткое поздравление.' },
      { title: 'Отправьте подарок', text: 'Сертификат придёт в электронном виде.' },
    ],
    cta: { label: 'Выбрать сертификат', to: '/gifts' },
  },
]

const activeScenarioKey = ref<HowItWorksScenarioKey>('subscription')
const activeScenario = computed(() => (
  scenarios.find((scenario) => scenario.key === activeScenarioKey.value) ?? scenarios[0]
))

const handleTabKeydown = (event: KeyboardEvent) => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return

  event.preventDefault()
  const tabList = event.currentTarget as HTMLElement | null
  const currentIndex = scenarios.findIndex((scenario) => scenario.key === activeScenarioKey.value)
  let nextIndex = currentIndex

  if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + scenarios.length) % scenarios.length
  if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % scenarios.length
  if (event.key === 'Home') nextIndex = 0
  if (event.key === 'End') nextIndex = scenarios.length - 1

  const nextScenario = scenarios[nextIndex]
  activeScenarioKey.value = nextScenario.key
  nextTick(() => {
    tabList?.querySelector<HTMLButtonElement>(`[data-scenario-key="${nextScenario.key}"]`)?.focus()
  })
}
</script>

<style scoped>
.how-it-works {
  padding: clamp(72px, 8vw, 112px) 0;
  background: var(--bg-primary);
}

.how-it-works__inner {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.how-it-works__header {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.55fr);
  align-items: end;
  gap: 48px;
}

.how-it-works__eyebrow,
.scenario-panel__eyebrow {
  margin: 0 0 10px;
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.how-it-works__header h2 {
  max-width: 760px;
  margin: 0;
  font-size: clamp(42px, 5vw, 68px);
  line-height: 0.98;
}

.how-it-works__intro {
  max-width: 440px;
  margin: 0 0 5px;
  color: var(--text-muted);
  font-size: 16px;
  line-height: 1.65;
}

.how-it-works__tabs {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  padding: 6px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  background: var(--soft-white);
}

.scenario-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 54px;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  color: var(--text-muted);
  background: transparent;
  font-size: 14px;
  font-weight: 700;
}

.scenario-tab.is-active {
  color: var(--text-white);
  background: var(--color-primary);
}

.scenario-tab__number {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  opacity: 0.72;
}

.scenario-panel {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(380px, 0.92fr);
  min-height: 610px;
  overflow: hidden;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  background: var(--soft-white);
  box-shadow: var(--shadow-md);
}

.scenario-panel__visual {
  position: relative;
  min-height: 100%;
  overflow: hidden;
  background: var(--warm-sand);
}

.scenario-panel__visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scenario-panel__label {
  position: absolute;
  right: 24px;
  bottom: 24px;
  left: 24px;
  max-width: 410px;
  padding: 13px 17px;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: var(--radius-md);
  color: var(--graphite);
  background: rgba(250, 248, 244, 0.88);
  backdrop-filter: blur(10px);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.45;
}

.scenario-panel__content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(38px, 5vw, 72px);
  background: var(--soft-white);
}

.scenario-panel__content h3 {
  margin: 0;
  font-size: clamp(36px, 4vw, 54px);
  line-height: 1;
}

.scenario-panel__description {
  max-width: 480px;
  margin: 17px 0 0;
  color: var(--text-muted);
  font-size: 15px;
  line-height: 1.65;
}

.scenario-steps {
  display: flex;
  flex-direction: column;
  margin: 30px 0 0;
  padding: 0;
  list-style: none;
}

.scenario-steps li {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 14px;
  padding: 16px 0;
  border-top: 1px solid var(--border-light);
}

.scenario-steps li:last-child {
  border-bottom: 1px solid var(--border-light);
}

.scenario-steps__number {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  color: var(--color-primary);
  background: var(--soft-sage);
  font-size: 12px;
  font-weight: 800;
}

.scenario-steps h4 {
  margin: 0;
  color: var(--text-dark);
  font-family: var(--font-body) !important;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.35;
}

.scenario-steps p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.5;
}

.scenario-panel__cta {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 16px;
  margin-top: 28px;
  padding: 14px 20px;
  border-radius: var(--radius-sm);
  color: var(--text-white);
  background: var(--color-primary);
  font-size: 14px;
  font-weight: 800;
}

.scenario-panel__cta span {
  font-size: 18px;
  line-height: 1;
}

@media (max-width: 940px) {
  .how-it-works__header {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .scenario-panel {
    grid-template-columns: minmax(0, 0.9fr) minmax(360px, 1.1fr);
    min-height: 570px;
  }

  .scenario-panel__content {
    padding: 38px;
  }
}

@media (max-width: 720px) {
  .how-it-works {
    padding: 64px 0;
  }

  .how-it-works__inner {
    gap: 22px;
  }

  .how-it-works__header h2 {
    font-size: clamp(38px, 12vw, 52px);
  }

  .how-it-works__intro {
    font-size: 14px;
  }

  .how-it-works__tabs {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .scenario-tab {
    justify-content: flex-start;
    min-height: 48px;
    padding: 9px 12px;
    font-size: 13px;
  }

  .scenario-panel {
    grid-template-columns: 1fr;
    min-height: 0;
    border-radius: var(--radius-lg);
  }

  .scenario-panel__visual {
    min-height: 0;
    aspect-ratio: 1.2;
  }

  .scenario-panel__label {
    right: 14px;
    bottom: 14px;
    left: 14px;
  }

  .scenario-panel__content {
    padding: 30px 22px 26px;
  }

  .scenario-panel__content h3 {
    font-size: 38px;
  }

  .scenario-steps {
    margin-top: 24px;
  }

  .scenario-steps li {
    padding: 14px 0;
  }

  .scenario-panel__cta {
    width: 100%;
    justify-content: space-between;
    margin-top: 24px;
  }
}
</style>
