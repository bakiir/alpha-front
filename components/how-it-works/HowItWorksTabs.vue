<template>
  <div class="how-tabs-shell container">
    <div class="how-tabs" role="tablist" aria-label="Сценарии работы сервиса">
      <button
        v-for="scenario in scenarios"
        :id="`how-tab-${scenario.key}`"
        :key="scenario.key"
        type="button"
        role="tab"
        class="how-tab"
        :class="{ active: modelValue === scenario.key }"
        :aria-selected="modelValue === scenario.key"
        :aria-controls="`how-panel-${scenario.key}`"
        @click="$emit('update:modelValue', scenario.key)"
      >
        <span class="how-tab__number">{{ tabNumber(scenario.key) }}</span>
        <span>{{ scenario.tabLabel }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HowItWorksScenario, HowItWorksScenarioKey } from '~/types/how-it-works'

defineProps<{
  modelValue: HowItWorksScenarioKey
  scenarios: HowItWorksScenario[]
}>()

defineEmits<{
  'update:modelValue': [value: HowItWorksScenarioKey]
}>()

const tabNumber = (key: HowItWorksScenarioKey) => ({
  subscription: '01',
  buying: '02',
  selling: '03',
  gift: '04',
}[key])
</script>

<style scoped>
.how-tabs-shell {
  position: relative;
  z-index: 5;
  margin-top: -58px;
}

.how-tabs {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.how-tab {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 78px;
  padding: 15px 14px;
  border-radius: 20px;
  color: var(--text-muted);
  background: var(--color-primary-soft);
  font-family: 'Onest', sans-serif;
  font-size: clamp(14px, 1.2vw, 17px);
  font-weight: 800;
  transition: transform 180ms ease, color 180ms ease, background 180ms ease, box-shadow 180ms ease;
}

.how-tab:not(.active):hover {
  transform: translateY(-2px);
  color: #496B5A;
}

.how-tab.active {
  z-index: 1;
  margin-bottom: -1px;
  border: 0;
  color: #496B5A;
  border-radius: 20px 20px 0 0;
  background: var(--surface);
  box-shadow: none;
  transform: none;
}

.how-tab.active::after {
  position: absolute;
  right: 0;
  bottom: -2px;
  left: 0;
  height: 3px;
  background: var(--surface);
  content: '';
}

.how-tab__number {
  display: grid;
  place-items: center;
  width: 29px;
  height: 29px;
  flex: 0 0 auto;
  border-radius: 9px;
  color: #496B5A;
  background: rgba(255, 253, 248, 0.82);
  font-size: 11px;
}

.how-tab.active .how-tab__number {
  color: #496B5A;
  background: var(--color-primary-soft);
}

@media (max-width: 760px) {
  .how-tabs-shell {
    margin-top: -54px;
  }

  .how-tabs {
    display: flex;
    overflow-x: auto;
    scrollbar-width: none;
    scroll-snap-type: x mandatory;
  }

  .how-tabs::-webkit-scrollbar {
    display: none;
  }

  .how-tab {
    min-width: 184px;
    min-height: 66px;
    scroll-snap-align: start;
  }

  .how-tab.active {
    border-radius: 17px 17px 0 0;
  }
}
</style>
