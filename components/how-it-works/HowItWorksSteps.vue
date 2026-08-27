<template>
  <section
    :id="`how-panel-${scenario.key}`"
    class="how-steps-section"
    role="tabpanel"
    :aria-labelledby="`how-tab-${scenario.key}`"
  >
    <div class="how-steps-section__intro">
      <span>{{ scenario.eyebrow }}</span>
      <h2>{{ scenario.title }}</h2>
      <p>{{ scenario.description }}</p>
    </div>

    <div class="how-steps-list">
      <HowItWorksStep
        v-for="(step, index) in scenario.steps"
        :key="`${scenario.key}-${index}`"
        :step="step"
        :index="index"
        :reversed="index % 2 === 1"
      />
    </div>

  </section>
</template>

<script setup lang="ts">
import type { HowItWorksScenario } from '~/types/how-it-works'
import HowItWorksStep from './HowItWorksStep.vue'

defineProps<{
  scenario: HowItWorksScenario
}>()
</script>

<style scoped>
.how-steps-section {
  animation: scenario-enter 360ms ease both;
}

.how-steps-section__intro {
  max-width: 790px;
  margin: 0 auto 58px;
  text-align: center;
}

.how-steps-section__intro > span {
  display: block;
  margin-bottom: 10px;
  color: #7c5cfc;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.4px;
}

.how-steps-section__intro h2 {
  margin: 0;
  font-size: clamp(38px, 5vw, 64px);
  line-height: 1;
}

.how-steps-section__intro p {
  margin-top: 18px;
  color: #69667f;
  font-size: 17px;
  line-height: 1.65;
}

.how-steps-list {
  display: flex;
  flex-direction: column;
  gap: clamp(88px, 10vw, 148px);
}

@keyframes scenario-enter {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .how-steps-section {
    animation: none;
  }
}

@media (max-width: 680px) {
  .how-steps-section__intro {
    margin-bottom: 34px;
    text-align: left;
  }

  .how-steps-section__intro p {
    font-size: 15px;
  }

  .how-steps-list {
    gap: 72px;
  }

}
</style>
