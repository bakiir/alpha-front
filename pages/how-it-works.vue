<template>
  <div class="how-page">
    <TheHeader />
    <main>
      <HowItWorksHero />
      <HowItWorksTabs v-model="activeScenarioKey" :scenarios="howItWorksScenarioList" />

      <div class="how-page__content container">
        <Transition name="scenario" mode="out-in">
          <HowItWorksSteps :key="activeScenarioKey" :scenario="activeScenario" />
        </Transition>
      </div>
    </main>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import TheHeader from '~/components/TheHeader.vue'
import TheFooter from '~/components/TheFooter.vue'
import HowItWorksHero from '~/components/how-it-works/HowItWorksHero.vue'
import HowItWorksTabs from '~/components/how-it-works/HowItWorksTabs.vue'
import HowItWorksSteps from '~/components/how-it-works/HowItWorksSteps.vue'
import { howItWorksScenarioList, howItWorksScenarios } from '~/data/howItWorks'
import type { HowItWorksScenarioKey } from '~/types/how-it-works'

const activeScenarioKey = ref<HowItWorksScenarioKey>('subscription')
const activeScenario = computed(() => howItWorksScenarios[activeScenarioKey.value])

useHead({
  title: 'Как это работает — Alpha',
  meta: [
    {
      name: 'description',
      content: 'Как работают подписка, покупка и продажа игрушек, а также электронные подарочные сертификаты Alpha.',
    },
  ],
})
</script>

<style scoped>
.how-page {
  min-height: 100vh;
  overflow: hidden;
  background: var(--surface);
}

.how-page__content {
  position: relative;
  z-index: 4;
  margin-top: 0;
  padding-top: 84px;
  padding-bottom: 100px;
  border: 0;
  background: var(--surface);
}

.scenario-enter-active,
.scenario-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.scenario-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.scenario-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

@media (max-width: 760px) {
  .how-page__content {
    padding-top: 62px;
    padding-bottom: 64px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .scenario-enter-active,
  .scenario-leave-active {
    transition: none;
  }
}
</style>
