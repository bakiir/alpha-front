<template>
  <section
    v-if="visible"
    class="play-comparison"
    aria-labelledby="play-comparison-title"
  >
    <div class="play-comparison__inner container">
      <header class="play-comparison__header">
        <p v-if="eyebrow" class="play-comparison__eyebrow">{{ eyebrow }}</p>
        <h2 v-if="title" id="play-comparison-title">{{ title }}</h2>
        <p v-if="subtitle">{{ subtitle }}</p>
      </header>

      <figure
        class="play-comparison__figure"
        :style="{ '--compare-position': `${position}%` }"
      >
        <div class="play-comparison__stage">
          <img
            class="play-comparison__image"
            :src="afterImage"
            alt=""
            width="1684"
            height="934"
            loading="lazy"
          >

          <div class="play-comparison__after-label-layer" aria-hidden="true">
            <span class="play-comparison__label play-comparison__label--after">
              {{ afterLabel }}
            </span>
          </div>

          <div class="play-comparison__before" aria-hidden="true">
            <img
              class="play-comparison__image"
              :src="beforeImage"
              alt=""
              width="1685"
              height="934"
              loading="lazy"
            >
            <span class="play-comparison__label play-comparison__label--before">
              {{ beforeLabel }}
            </span>
          </div>

          <div class="play-comparison__divider" aria-hidden="true">
            <span class="play-comparison__handle">
              <span>‹</span>
              <span>›</span>
            </span>
          </div>

          <input
            v-model.number="position"
            class="play-comparison__range"
            type="range"
            min="0"
            max="100"
            step="1"
            :aria-label="rangeAriaLabel"
            :aria-valuetext="rangeValueText"
          >
        </div>

        <figcaption v-if="caption">
          {{ caption }}
        </figcaption>
      </figure>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
const position = ref(50)

const { resolveSection, isLoading } = usePageSections('home')
const state = resolveSection('play_comparison')

const cmsText = (value: string | null | undefined, fallback: string) => {
  const trimmed = value?.trim()
  return trimmed || fallback
}

const resolveMediaUrl = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:')) return trimmed
  if (trimmed.startsWith('/')) return trimmed
  return `/${trimmed}`
}

const fallbackBeforeImage = '/images/comparison/child-with-phone.jpg'
const fallbackAfterImage = '/images/comparison/child-playing.jpg'

const visible = computed(() => {
  if (isLoading.value && state.value.status === 'loading') return true
  if (state.value.status === 'error') return false
  if (state.value.status === 'hidden') return false
  return true
})

const content = computed(() => {
  if (state.value.status !== 'ready') return null
  return (state.value.section.content ?? null) as Record<string, unknown> | null
})

const beforeImage = computed(() => {
  if (state.value.status === 'ready') {
    return resolveMediaUrl(
      typeof content.value?.before_image === 'string' ? content.value.before_image : '',
    ) || fallbackBeforeImage
  }
  return fallbackBeforeImage
})

const afterImage = computed(() => {
  if (state.value.status === 'ready') {
    return resolveMediaUrl(
      typeof content.value?.after_image === 'string' ? content.value.after_image : '',
    ) || fallbackAfterImage
  }
  return fallbackAfterImage
})

const eyebrow = computed(() => {
  if (state.value.status === 'ready') {
    return cmsText(state.value.section.badge_text, t('home.playComparison.badge'))
  }
  if (state.value.status === 'bootstrap' || state.value.status === 'loading') {
    return t('home.playComparison.badge')
  }
  return ''
})

const title = computed(() => {
  if (state.value.status === 'ready') {
    return cmsText(state.value.section.title, t('home.playComparison.title'))
  }
  if (state.value.status === 'bootstrap' || state.value.status === 'loading') {
    return t('home.playComparison.title')
  }
  return ''
})

const subtitle = computed(() => {
  if (state.value.status === 'ready') {
    return cmsText(state.value.section.subtitle, t('home.playComparison.subtitle'))
  }
  if (state.value.status === 'bootstrap' || state.value.status === 'loading') {
    return t('home.playComparison.subtitle')
  }
  return ''
})

const beforeLabel = computed(() => {
  if (state.value.status === 'ready') {
    return cmsText(
      typeof content.value?.before_label === 'string' ? content.value.before_label : null,
      t('home.playComparison.beforeLabel'),
    )
  }
  return t('home.playComparison.beforeLabel')
})

const afterLabel = computed(() => {
  if (state.value.status === 'ready') {
    return cmsText(
      typeof content.value?.after_label === 'string' ? content.value.after_label : null,
      t('home.playComparison.afterLabel'),
    )
  }
  return t('home.playComparison.afterLabel')
})

const caption = computed(() => {
  if (state.value.status === 'ready') {
    return cmsText(
      typeof content.value?.caption === 'string' ? content.value.caption : null,
      t('home.playComparison.caption'),
    )
  }
  if (state.value.status === 'bootstrap' || state.value.status === 'loading') {
    return t('home.playComparison.caption')
  }
  return ''
})

const rangeAriaLabel = computed(() => {
  if (state.value.status === 'ready') {
    return cmsText(
      typeof content.value?.range_aria_label === 'string' ? content.value.range_aria_label : null,
      t('home.playComparison.rangeAriaLabel'),
    )
  }
  return t('home.playComparison.rangeAriaLabel')
})

const rangeValueText = computed(() =>
  t('home.playComparison.rangeValueText', { percent: 100 - position.value }),
)
</script>

<style scoped>
.play-comparison {
  padding: clamp(72px, 8vw, 112px) 0;
  overflow: hidden;
  background: var(--bg-secondary);
}

.play-comparison__inner {
  padding-inline: clamp(20px, 4vw, 64px);
}

.play-comparison__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 850px;
  margin: 0 auto 48px;
  text-align: center;
}

.play-comparison__eyebrow {
  margin-bottom: 12px;
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.play-comparison__header h2 {
  max-width: 820px;
  margin: 0;
  color: var(--text-dark);
  font-size: clamp(42px, 5vw, 68px);
  font-weight: 600;
  line-height: 0.98;
}

.play-comparison__header > p:last-child {
  max-width: 700px;
  margin-top: 22px;
  color: var(--text-muted);
  font-size: 16px;
  line-height: 1.7;
}

.play-comparison__figure {
  width: min(100%, 1120px);
  margin: 0 auto;
}

.play-comparison__stage {
  position: relative;
  aspect-ratio: 1685 / 934;
  overflow: hidden;
  border: 8px solid var(--bg-primary);
  border-radius: var(--radius-xl);
  background: #dfd7ca;
  box-shadow: 0 22px 52px rgba(63, 103, 87, 0.16);
  isolation: isolate;
}

.play-comparison__image {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
  -webkit-user-drag: none;
}

.play-comparison__before {
  position: absolute;
  inset: 0;
  overflow: hidden;
  clip-path: inset(0 calc(100% - var(--compare-position)) 0 0);
}

.play-comparison__after-label-layer {
  position: absolute;
  inset: 0;
  z-index: 3;
  overflow: hidden;
  clip-path: inset(0 0 0 var(--compare-position));
  pointer-events: none;
}

.play-comparison__before::after {
  position: absolute;
  inset: 0;
  background: rgba(45, 47, 44, 0.06);
  content: '';
}

.play-comparison__label {
  position: absolute;
  top: clamp(14px, 2.6vw, 30px);
  padding: 11px 20px;
  border: 1px solid rgba(63, 103, 87, 0.14);
  border-radius: var(--radius-full);
  background: rgba(250, 248, 244, 0.92);
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  backdrop-filter: blur(8px);
}

.play-comparison__label--before {
  left: clamp(14px, 2.6vw, 30px);
}

.play-comparison__label--after {
  right: clamp(14px, 2.6vw, 30px);
}

.play-comparison__divider {
  position: absolute;
  inset-block: 0;
  left: var(--compare-position);
  z-index: 4;
  width: 3px;
  background: var(--bg-primary);
  box-shadow: 0 0 0 1px rgba(38, 38, 38, 0.06);
  pointer-events: none;
  transform: translateX(-50%);
}

.play-comparison__handle {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  width: 66px;
  height: 66px;
  border: 6px solid var(--bg-primary);
  border-radius: 50%;
  background: var(--green-surface);
  color: var(--green-ink);
  box-shadow: var(--shadow-lg);
  font-family: 'Manrope', sans-serif;
  font-size: 32px;
  font-weight: 500;
  line-height: 1;
  transform: translate(-50%, -50%);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.play-comparison__handle span {
  transform: translateY(-1px);
}

.play-comparison__range {
  position: absolute;
  inset: 0;
  z-index: 5;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: ew-resize;
  touch-action: none;
}

.play-comparison__stage:has(.play-comparison__range:focus-visible) .play-comparison__handle {
  box-shadow: 0 0 0 5px rgba(232, 166, 43, 0.72), var(--shadow-lg);
  transform: translate(-50%, -50%) scale(1.06);
}

.play-comparison__figure figcaption {
  margin-top: 18px;
  color: var(--text-light);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-align: center;
}

@media (max-width: 640px) {
  .play-comparison {
    padding: 56px 0;
  }

  .play-comparison__inner {
    padding-inline: 16px;
  }

  .play-comparison__header {
    margin-bottom: 30px;
  }

  .play-comparison__header h2 {
    font-size: clamp(38px, 12vw, 50px);
  }

  .play-comparison__header > p:last-child {
    margin-top: 18px;
    font-size: 14.5px;
  }

  .play-comparison__stage {
    aspect-ratio: 4 / 3;
    border-width: 5px;
    border-radius: var(--radius-lg);
  }

  .play-comparison__image {
    object-position: center;
  }

  .play-comparison__label {
    padding: 8px 11px;
    font-size: 10px;
    letter-spacing: 0.05em;
  }

  .play-comparison__handle {
    width: 54px;
    height: 54px;
    border-width: 5px;
    font-size: 27px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .play-comparison__handle {
    transition: none;
  }
}
</style>
