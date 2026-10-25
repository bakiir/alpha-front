<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="sub-m-overlay" role="presentation" @click.self="emit('close')">
        <div class="sub-m-panel selection-mode-panel" role="dialog" aria-modal="true" aria-labelledby="selection-mode-title">
          <header class="sub-m-header">
            <button type="button" class="sub-m-header-btn" @click="emit('close')">
              {{ t('subscription.close') }}
            </button>
            <div class="sub-m-header-center">
              <p id="selection-mode-title" class="sub-m-step-name">{{ t('subscription.boxBuilder.modeTitle') }}</p>
            </div>
            <span class="sub-m-close-spacer" aria-hidden="true" />
          </header>

          <div class="sub-m-plan-chip">
            <strong>{{ planName }}</strong>
            <span>{{ t('subscription.boxBuilder.toysInPlan', { n: toysLimit }) }}</span>
          </div>

          <div class="selection-mode-body">
            <p class="selection-mode-lead">{{ t('subscription.boxBuilder.modeLead') }}</p>

            <button
              type="button"
              class="selection-mode-card"
              @click="emit('choose', 'methodist')"
            >
              <strong>{{ t('subscription.boxBuilder.modeMethodistTitle') }}</strong>
              <span>{{ t('subscription.boxBuilder.modeMethodistDesc') }}</span>
            </button>

            <button
              type="button"
              class="selection-mode-card"
              :class="{ disabled: !parentSelectionAvailable }"
              :disabled="!parentSelectionAvailable"
              @click="parentSelectionAvailable && emit('choose', 'parent')"
            >
              <strong>{{ t('subscription.boxBuilder.modeSelfTitle') }}</strong>
              <span v-if="parentSelectionAvailable">{{ t('subscription.boxBuilder.modeSelfDesc') }}</span>
              <span v-else class="selection-mode-unavailable">{{ t('subscription.boxBuilder.modeSelfUnavailable') }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  open: boolean
  planName: string
  toysLimit: number
  parentSelectionAvailable: boolean
}>()

const emit = defineEmits<{
  close: []
  choose: [mode: 'methodist' | 'parent']
}>()

const { t } = useI18n()
</script>

<style scoped>
.selection-mode-panel {
  max-width: 480px;
}

.selection-mode-body {
  padding: 8px 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.selection-mode-lead {
  margin: 0 0 4px;
  font-size: 14px;
  line-height: 1.5;
  color: #5c635c;
}

.selection-mode-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  width: 100%;
  padding: 16px 18px;
  border: 2px solid #e8ebe6;
  border-radius: 16px;
  background: #fff;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.selection-mode-card:hover:not(.disabled) {
  border-color: #9bb89a;
  box-shadow: 0 4px 16px rgba(35, 52, 40, 0.08);
}

.selection-mode-card strong {
  font-size: 16px;
  color: #233428;
}

.selection-mode-card span {
  font-size: 13px;
  line-height: 1.45;
  color: #6f746f;
}

.selection-mode-card.disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.selection-mode-unavailable {
  color: #a65c5c !important;
}

.sub-m-close-spacer {
  width: 64px;
}
</style>

<style>
.sub-m-overlay {
  position: fixed;
  inset: 0;
  z-index: 10070;
  background: rgba(26, 26, 46, 0.45);
  display: flex;
  align-items: stretch;
  justify-content: center;
}

.sub-m-panel {
  width: 100%;
  max-width: 480px;
  height: 100dvh;
  background: var(--ivory, #faf8f4);
  display: flex;
  flex-direction: column;
}

.sub-m-header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 10px 12px;
}

.sub-m-header-btn {
  justify-self: start;
  border: none;
  background: transparent;
  color: var(--green-ink, #233428);
  font-weight: 700;
  cursor: pointer;
}

.sub-m-header-center {
  text-align: center;
}

.sub-m-step-name {
  margin: 0;
  font-size: 14px;
  font-weight: 800;
}

.sub-m-plan-chip {
  margin: 10px 16px 0;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(168, 191, 168, 0.22);
  display: flex;
  flex-direction: column;
  gap: 2px;
}
</style>
