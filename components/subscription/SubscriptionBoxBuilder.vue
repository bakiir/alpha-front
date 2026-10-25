<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="sub-m-overlay" role="presentation" @click.self="emit('close')">
        <div class="sub-m-panel box-builder-panel" role="dialog" aria-modal="true" aria-labelledby="box-builder-title">
          <header class="sub-m-header">
            <button type="button" class="sub-m-header-btn" @click="emit('back')">
              {{ t('subscription.back') }}
            </button>
            <div class="sub-m-header-center">
              <p id="box-builder-title" class="sub-m-step-name">{{ t('subscription.boxBuilder.title') }}</p>
            </div>
            <button type="button" class="sub-m-close" :aria-label="t('subscription.close')" @click="emit('close')">×</button>
          </header>

          <div class="sub-m-plan-chip">
            <strong>{{ planName }}</strong>
            <span>{{ t('subscription.boxBuilder.selectedCount', { current: selectedIds.length, max: toysLimit }) }}</span>
          </div>

          <div v-if="error" class="box-builder-error">{{ error }}</div>

          <div class="box-builder-scroll">
            <div v-if="loading" class="box-builder-loading">
              <AppIcon name="loader" :size="20" class="spin-icon" />
              {{ t('subscription.boxBuilder.loading') }}
            </div>

            <div v-else-if="catalog.length === 0" class="box-builder-empty">
              <p>{{ t('subscription.boxBuilder.emptyCatalog') }}</p>
              <button type="button" class="box-builder-secondary" @click="emit('trust-methodist')">
                {{ t('subscription.boxBuilder.trustMethodist') }}
              </button>
            </div>

            <template v-else>
              <div class="preview-toys-grid box-builder-grid">
                <button
                  v-for="toy in catalog"
                  :key="toy.id"
                  type="button"
                  class="preview-toy-card next-set-toy-card"
                  :class="{ selected: selectedIds.includes(toy.id) }"
                  :aria-pressed="selectedIds.includes(toy.id)"
                  @click="toggle(toy.id)"
                >
                  <span v-if="selectedIds.includes(toy.id)" class="next-set-toy-check" aria-hidden="true">
                    <AppIcon name="check" :size="14" />
                  </span>
                  <img
                    v-if="toy.image_url"
                    :src="toy.image_url"
                    :alt="toy.name"
                    class="preview-toy-img"
                  >
                  <div v-else class="preview-toy-img preview-toy-img--empty" aria-hidden="true" />
                  <div class="preview-toy-body">
                    <strong>{{ toy.name }}</strong>
                    <span v-if="toy.category?.name">{{ toy.category.name }}</span>
                  </div>
                </button>
              </div>

              <div v-if="selectedToys.length" class="box-builder-picked">
                <h3>{{ t('subscription.boxBuilder.pickedHeading') }}</h3>
                <ul>
                  <li v-for="toy in selectedToys" :key="toy.id">
                    <span>{{ toy.name }}</span>
                    <button type="button" class="box-builder-remove" @click="toggle(toy.id)">
                      {{ t('subscription.boxBuilder.remove') }}
                    </button>
                  </li>
                </ul>
              </div>
            </template>
          </div>

          <footer class="box-builder-footer">
            <button
              type="button"
              class="sub-m-primary"
              :disabled="selectedIds.length !== toysLimit || loading"
              @click="emit('continue', [...selectedIds])"
            >
              {{ t('subscription.boxBuilder.continue') }}
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { PlanPreviewToy } from '~/composables/useSubscriptionPlans'

const props = defineProps<{
  open: boolean
  planName: string
  toysLimit: number
  catalog: PlanPreviewToy[]
  selectedIds: number[]
  loading?: boolean
  error?: string
}>()

const emit = defineEmits<{
  close: []
  back: []
  continue: [ids: number[]]
  'trust-methodist': []
  'update:selectedIds': [ids: number[]]
}>()

const { t } = useI18n()

const selectedToys = computed(() => {
  const byId = new Map(props.catalog.map(t => [t.id, t]))
  return props.selectedIds.map(id => byId.get(id)).filter(Boolean) as PlanPreviewToy[]
})

const toggle = (toyId: number) => {
  const current = [...props.selectedIds]
  const idx = current.indexOf(toyId)
  if (idx >= 0) {
    emit('update:selectedIds', current.filter(id => id !== toyId))
    return
  }
  if (current.length >= props.toysLimit) {
    return
  }
  emit('update:selectedIds', [...current, toyId])
}
</script>

<style scoped>
.box-builder-panel {
  max-width: 560px;
}

.box-builder-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 12px;
}

.box-builder-grid {
  padding-bottom: 12px;
}

.box-builder-error {
  margin: 0 16px 8px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #fdecec;
  color: #8b3a3a;
  font-size: 13px;
}

.box-builder-loading,
.box-builder-empty {
  padding: 24px 8px;
  text-align: center;
  color: #6f746f;
  font-size: 14px;
}

.box-builder-secondary {
  margin-top: 12px;
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid #d8ddd6;
  background: #fff;
  cursor: pointer;
  font-weight: 600;
}

.box-builder-picked {
  margin-top: 8px;
  padding: 14px 16px;
  border-radius: 14px;
  background: #f3f6f1;
}

.box-builder-picked h3 {
  margin: 0 0 10px;
  font-size: 14px;
  color: #233428;
}

.box-builder-picked ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.box-builder-picked li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 14px;
}

.box-builder-remove {
  border: none;
  background: transparent;
  color: #5a7a5e;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
}

.box-builder-footer {
  padding: 12px 16px 20px;
  border-top: 1px solid #eceee9;
}

.box-builder-panel {
  display: flex;
  flex-direction: column;
  max-height: 100dvh;
}

.preview-toys-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.preview-toy-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  text-align: left;
  border: 2px solid #e8ebe6;
  border-radius: 14px;
  background: #fff;
  padding: 0;
  cursor: pointer;
  overflow: hidden;
}

.preview-toy-card.selected {
  border-color: #3f6757;
  box-shadow: 0 0 0 1px #3f6757;
}

.preview-toy-img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  background: #f0f2ee;
}

.preview-toy-body {
  padding: 8px 10px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}

.preview-toy-body strong {
  font-size: 13px;
  color: #233428;
}

.next-set-toy-check {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #3f6757;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
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
  max-width: 560px;
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

.sub-m-header-btn,
.sub-m-close {
  border: none;
  background: transparent;
  color: var(--green-ink, #233428);
  font-weight: 700;
  cursor: pointer;
}

.sub-m-close {
  font-size: 28px;
  line-height: 1;
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

.sub-m-primary {
  width: 100%;
  min-height: 52px;
  border: none;
  border-radius: 14px;
  background: var(--green-ink, #233428);
  color: #fff;
  font-weight: 800;
  cursor: pointer;
}

.sub-m-primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
