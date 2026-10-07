<template>
  <Teleport to="body">
    <Transition name="toys-sheet">
      <div
        v-if="open"
        class="toys-sheet-overlay"
        role="presentation"
        @click.self="close"
      >
        <div
          ref="panelRef"
          class="toys-sheet-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="toys-sheet-title"
          tabindex="-1"
          @keydown.escape.prevent="close"
        >
          <div class="toys-sheet-handle" aria-hidden="true" />

          <header class="toys-sheet-header">
            <h2 id="toys-sheet-title" class="toys-sheet-title">{{ sheetTitle }}</h2>
            <button
              ref="closeBtnRef"
              type="button"
              class="toys-sheet-close"
              :aria-label="t('subscription.composition.close')"
              @click="close"
            >
              &times;
            </button>
          </header>

          <div class="toys-sheet-body">
            <p v-if="loading" class="toys-sheet-empty">{{ t('subscription.composition.loading') }}</p>
            <p v-else-if="!toys.length" class="toys-sheet-empty">
              {{ t('subscription.composition.empty') }}
            </p>
            <ul v-else class="toys-sheet-list">
              <li v-for="toy in toys" :key="toyKey(toy)" class="toys-sheet-row">
                <NuxtLink
                  v-if="toyLink(toy)"
                  :to="toyLink(toy)!"
                  class="toys-sheet-row-link"
                  @click="close"
                >
                  <div class="toys-sheet-thumb">
                    <AppImage
                      :src="toyImageSrc(toy) || null"
                      :alt="toyDisplayName(toy)"
                      custom-class="toys-sheet-thumb-img"
                    />
                  </div>
                  <div class="toys-sheet-row-text">
                    <span class="toys-sheet-row-name">{{ toyDisplayName(toy) }}</span>
                    <span v-if="toyCompositionQuantity(toy)" class="toys-sheet-row-qty">
                      {{ t('subscription.composition.qty', { n: toyCompositionQuantity(toy) }) }}
                    </span>
                  </div>
                </NuxtLink>
                <div v-else class="toys-sheet-row-static">
                  <div class="toys-sheet-thumb">
                    <AppImage
                      :src="toyImageSrc(toy) || null"
                      :alt="toyDisplayName(toy)"
                      custom-class="toys-sheet-thumb-img"
                    />
                  </div>
                  <div class="toys-sheet-row-text">
                    <span class="toys-sheet-row-name">{{ toyDisplayName(toy) }}</span>
                    <span v-if="toyCompositionQuantity(toy)" class="toys-sheet-row-qty">
                      {{ t('subscription.composition.qty', { n: toyCompositionQuantity(toy) }) }}
                    </span>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import {
  toyCompositionQuantity,
  toyDisplayName,
  toyImageSrc,
  type CompositionToyLike,
} from '~/utils/toysCompositionUi'

const { t } = useI18n()
const localePath = useLocalePath()

const props = withDefaults(defineProps<{
  open: boolean
  toys: CompositionToyLike[]
  loading?: boolean
  title?: string
}>(), {
  loading: false,
  title: '',
})

const sheetTitle = computed(() => props.title || t('subscription.composition.titleDefault'))

const emit = defineEmits<{
  close: []
}>()

const panelRef = ref<HTMLElement | null>(null)
const closeBtnRef = ref<HTMLButtonElement | null>(null)
const lockedScrollY = ref(0)
const wasOpen = ref(false)

const toyKey = (toy: CompositionToyLike, indexFallback = 0) =>
  toy.id != null ? String(toy.id) : `toy-${indexFallback}-${toyDisplayName(toy)}`

const toyLink = (toy: CompositionToyLike) => {
  const id = Number(toy.id)
  if (!Number.isFinite(id) || id <= 0) return null
  return localePath(`/product/${id}`)
}

const lockPageScroll = () => {
  if (!import.meta.client) return
  lockedScrollY.value = window.scrollY || window.pageYOffset || 0
  const body = document.body
  body.style.position = 'fixed'
  body.style.top = `-${lockedScrollY.value}px`
  body.style.left = '0'
  body.style.right = '0'
  body.style.width = '100%'
  body.style.overflow = 'hidden'
}

const unlockPageScroll = () => {
  if (!import.meta.client) return
  const body = document.body
  const y = lockedScrollY.value
  body.style.position = ''
  body.style.top = ''
  body.style.left = ''
  body.style.right = ''
  body.style.width = ''
  body.style.overflow = ''
  window.scrollTo(0, y)
}

const close = () => emit('close')

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.open) {
    e.preventDefault()
    close()
  }
}

watch(
  () => props.open,
  async (isOpen) => {
    if (!import.meta.client) return
    if (isOpen) {
      wasOpen.value = true
      lockPageScroll()
      await nextTick()
      closeBtnRef.value?.focus()
      return
    }
    if (wasOpen.value) {
      unlockPageScroll()
      wasOpen.value = false
    }
  },
)

onMounted(() => {
  if (!import.meta.client) return
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  if (!import.meta.client) return
  document.removeEventListener('keydown', onKeydown)
  if (wasOpen.value || props.open) unlockPageScroll()
})
</script>

<style scoped>
.toys-sheet-overlay {
  position: fixed;
  inset: 0;
  z-index: 10050;
  background: rgba(26, 26, 46, 0.55);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.toys-sheet-panel {
  width: 100%;
  max-width: 560px;
  max-height: 85dvh;
  max-height: 85vh;
  background: #faf8f4;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -12px 40px rgba(26, 26, 46, 0.18);
  display: flex;
  flex-direction: column;
  outline: none;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.toys-sheet-handle {
  width: 40px;
  height: 4px;
  border-radius: 999px;
  background: #d9d3c8;
  margin: 10px auto 0;
  flex-shrink: 0;
}

.toys-sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px 10px;
  border-bottom: 1px solid rgba(45, 42, 50, 0.08);
  flex-shrink: 0;
}

.toys-sheet-title {
  margin: 0;
  font-family: 'Manrope', sans-serif;
  font-size: 1.05rem;
  font-weight: 800;
  color: #262626;
  line-height: 1.25;
}

.toys-sheet-close {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: #f4f1ea;
  color: #5d625f;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.toys-sheet-close:hover,
.toys-sheet-close:focus-visible {
  background: #e8e8ee;
  color: #262626;
  outline: none;
}

.toys-sheet-body {
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  padding: 8px 12px 20px;
  min-height: 0;
  flex: 1;
}

.toys-sheet-empty {
  margin: 24px 12px;
  text-align: center;
  color: #6b6570;
  font-size: 0.92rem;
  line-height: 1.45;
}

.toys-sheet-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.toys-sheet-row-link,
.toys-sheet-row-static {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 14px;
  text-decoration: none;
  color: inherit;
  background: #fff;
  border: 1px solid rgba(45, 42, 50, 0.06);
}

.toys-sheet-row-link:active {
  background: #f4f1ea;
}

.toys-sheet-thumb {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f1f5f9;
}

.toys-sheet-thumb :deep(.toys-sheet-thumb-img),
.toys-sheet-thumb :deep(.app-img),
.toys-sheet-thumb :deep(.image-fallback-placeholder) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.toys-sheet-thumb :deep(.fallback-text) {
  display: none;
}

.toys-sheet-row-text {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.toys-sheet-row-name {
  font-size: 0.92rem;
  font-weight: 650;
  color: #262626;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.toys-sheet-row-qty {
  font-size: 0.78rem;
  color: #6b6570;
}

.toys-sheet-enter-active,
.toys-sheet-leave-active {
  transition: opacity 0.2s ease;
}

.toys-sheet-enter-active .toys-sheet-panel,
.toys-sheet-leave-active .toys-sheet-panel {
  transition: transform 0.25s ease;
}

.toys-sheet-enter-from,
.toys-sheet-leave-to {
  opacity: 0;
}

.toys-sheet-enter-from .toys-sheet-panel,
.toys-sheet-leave-to .toys-sheet-panel {
  transform: translateY(100%);
}
</style>
