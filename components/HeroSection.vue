<template>
  <section
    v-if="loadState === 'loading'"
    class="hero-carousel hero-carousel--loading"
    aria-busy="true"
    aria-label="Загрузка баннера"
  >
    <div class="hero-loading-panel" />
  </section>

  <section
    v-else-if="loadState === 'error'"
    class="hero-carousel hero-carousel--status"
    aria-live="polite"
  >
    <div class="hero-status container">
      <p>{{ t('home.hero.error') }}</p>
      <button type="button" class="hero-retry" @click="fetchBanners">
        {{ t('home.hero.retry') }}
      </button>
    </div>
  </section>

  <section
    v-else-if="loadState === 'ready'"
    class="hero-carousel"
    aria-label="Возможности Alpha"
    aria-roledescription="carousel"
    @mouseenter="pauseAutoplay"
    @mouseleave="startAutoplay"
    @focusin="pauseAutoplay"
    @focusout="startAutoplay"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointercancel="pointerStartX = null"
  >
    <div class="hero-track" :style="{ transform: `translateX(-${activeSlide * 100}%)` }">
      <article
        v-for="(slide, index) in slides"
        :key="`${slide.id}-${index}`"
        class="hero-slide"
        :aria-hidden="index !== activeSlide"
      >
        <picture>
          <source media="(max-width: 700px)" :srcset="slide.mobileImage">
          <img
            :src="slide.desktopImage"
            :alt="slide.alt"
            class="hero-image"
            :fetchpriority="index === 0 ? 'high' : 'auto'"
            :loading="index === 0 ? 'eager' : 'lazy'"
          >
        </picture>
        <div class="hero-shade" aria-hidden="true"></div>

        <div class="hero-copy container">
          <p class="hero-kicker">{{ slide.subtitle || 'Alpha · игра и развитие' }}</p>
          <component :is="index === 0 ? 'h1' : 'h2'">{{ slide.title }}</component>
          <p v-if="slide.description" class="hero-description">{{ slide.description }}</p>
        </div>
      </article>
    </div>

    <button
      v-if="slides.length > 1"
      type="button"
      class="hero-arrow hero-arrow--prev"
      aria-label="Предыдущий слайд"
      @click="previousSlide"
    >
      <span aria-hidden="true">←</span>
    </button>
    <button
      v-if="slides.length > 1"
      type="button"
      class="hero-arrow hero-arrow--next"
      aria-label="Следующий слайд"
      @click="nextSlide"
    >
      <span aria-hidden="true">→</span>
    </button>

    <div v-if="slides.length > 1" class="hero-pagination" aria-label="Выбор слайда">
      <button
        v-for="(_, index) in slides"
        :key="index"
        type="button"
        :class="{ active: index === activeSlide }"
        :aria-label="`Показать слайд ${index + 1}`"
        :aria-current="index === activeSlide ? 'true' : undefined"
        @click="goToSlide(index)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const { t } = useI18n()
const { banners, loadState, fetchBanners } = useBanners('home_hero')
const { cmsMediaUrl } = useCmsMediaUrl()

const slides = computed(() =>
  banners.value.map(b => ({
    id: b.id,
    desktopImage: cmsMediaUrl(b.desktop_image),
    mobileImage: cmsMediaUrl(b.mobile_image || b.desktop_image),
    title: b.title,
    subtitle: b.subtitle || 'Alpha · игра и развитие',
    description: b.description || '',
    alt: b.image_alt || b.title,
  })),
)

const activeSlide = ref(0)
const pointerStartX = ref<number | null>(null)
let autoplayTimer: ReturnType<typeof setInterval> | null = null

watch(loadState, (state) => {
  if (state !== 'ready') {
    pauseAutoplay()
    activeSlide.value = 0
  } else {
    startAutoplay()
  }
})

watch(() => slides.value.length, () => {
  if (activeSlide.value >= slides.value.length) {
    activeSlide.value = 0
  }
})

const goToSlide = (index: number) => { activeSlide.value = index }
const nextSlide = () => {
  if (slides.value.length < 2) return
  activeSlide.value = (activeSlide.value + 1) % slides.value.length
}
const previousSlide = () => {
  if (slides.value.length < 2) return
  activeSlide.value = (activeSlide.value - 1 + slides.value.length) % slides.value.length
}
const pauseAutoplay = () => {
  if (!autoplayTimer) return
  clearInterval(autoplayTimer)
  autoplayTimer = null
}
const startAutoplay = () => {
  if (loadState.value !== 'ready' || slides.value.length < 2) return
  pauseAutoplay()
  autoplayTimer = setInterval(nextSlide, 6500)
}
const onPointerDown = (event: PointerEvent) => { pointerStartX.value = event.clientX }
const onPointerUp = (event: PointerEvent) => {
  if (pointerStartX.value === null) return
  const distance = event.clientX - pointerStartX.value
  pointerStartX.value = null
  if (Math.abs(distance) < 45) return
  distance < 0 ? nextSlide() : previousSlide()
}

onMounted(startAutoplay)
onBeforeUnmount(pauseAutoplay)
</script>

<style scoped>
.hero-carousel {
  position: relative;
  z-index: 0;
  overflow: hidden;
  width: 100%;
  min-height: 720px;
  height: 100svh;
  max-height: 980px;
  color: #fff;
  background: var(--graphite);
  touch-action: pan-y;
}

.hero-carousel--loading,
.hero-carousel--status {
  display: grid;
  place-items: center;
}

.hero-loading-panel {
  width: min(520px, 70%);
  height: 18px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.08));
  background-size: 200% 100%;
  animation: hero-shimmer 1.4s ease-in-out infinite;
}

.hero-status {
  text-align: center;
  color: rgba(255, 255, 255, 0.88);
}

.hero-status p {
  margin: 0 0 16px;
  font-size: 16px;
}

.hero-retry {
  padding: 10px 18px;
  color: var(--graphite);
  background: var(--ivory);
  border: 0;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}

@keyframes hero-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.hero-track {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 650ms cubic-bezier(0.22, 0.61, 0.36, 1);
  will-change: transform;
}

.hero-slide {
  position: relative;
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.hero-slide picture,
.hero-image {
  display: block;
  width: 100%;
  height: 100%;
}

.hero-image {
  object-fit: cover;
  object-position: center;
  transform: scale(1.015);
}

.hero-shade {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(24, 22, 18, 0.45) 0%, rgba(24, 22, 18, 0.06) 36%, rgba(24, 22, 18, 0.18) 58%, rgba(24, 22, 18, 0.78) 100%),
    linear-gradient(90deg, rgba(24, 22, 18, 0.2), transparent 52%, rgba(24, 22, 18, 0.12));
}

.hero-copy {
  position: absolute;
  right: 0;
  bottom: clamp(90px, 12vh, 130px);
  left: 0;
  z-index: 2;
  text-align: center;
  color: #fff;
}

.hero-kicker {
  margin-bottom: 16px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  opacity: 0.82;
}

.hero-copy h1,
.hero-copy h2 {
  max-width: 920px;
  margin: 0 auto;
  color: #fff;
  font-size: clamp(52px, 5.8vw, 88px);
  font-weight: 600;
  line-height: 0.98;
  text-shadow: 0 3px 28px rgba(0, 0, 0, 0.24);
}

.hero-description {
  max-width: 650px;
  margin: 24px auto 0;
  font-size: clamp(16px, 1.35vw, 20px);
  font-weight: 500;
  line-height: 1.65;
  text-shadow: 0 2px 18px rgba(0, 0, 0, 0.38);
}

.hero-arrow {
  position: absolute;
  top: 50%;
  z-index: 4;
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  color: #fff;
  background: rgba(250, 248, 244, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 50%;
  font-size: 24px;
  transform: translateY(-50%);
  backdrop-filter: blur(10px);
  transition: background 180ms ease, transform 180ms ease;
}

.hero-arrow:hover {
  color: var(--graphite);
  background: var(--ivory);
  transform: translateY(-50%) scale(1.05);
}

.hero-arrow--prev { left: 32px; }
.hero-arrow--next { right: 32px; }

.hero-pagination {
  position: absolute;
  bottom: 46px;
  left: 50%;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 10px;
  transform: translateX(-50%);
}

.hero-pagination button {
  width: 8px;
  height: 8px;
  padding: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.62);
  transition: width 180ms ease, background 180ms ease;
}

.hero-pagination button.active {
  width: 34px;
  background: #fff;
}

@media (max-width: 700px) {
  .hero-carousel {
    min-height: 680px;
    height: 100svh;
    max-height: 900px;
  }

  .hero-image { object-position: center; }
  .hero-shade {
    background: linear-gradient(180deg, rgba(24, 22, 18, 0.4) 0%, transparent 34%, rgba(24, 22, 18, 0.12) 53%, rgba(24, 22, 18, 0.83) 100%);
  }
  .hero-copy {
    bottom: 94px;
    padding-right: 24px;
    padding-left: 24px;
  }
  .hero-kicker { margin-bottom: 12px; font-size: 9px; }
  .hero-copy h1,
  .hero-copy h2 { font-size: clamp(44px, 13vw, 60px); }
  .hero-description { margin-top: 16px; font-size: 14px; line-height: 1.55; }
  .hero-arrow { top: auto; bottom: 28px; width: 38px; height: 38px; font-size: 19px; }
  .hero-arrow--prev { left: 20px; }
  .hero-arrow--next { right: 20px; }
  .hero-pagination { bottom: 43px; }
}

@media (prefers-reduced-motion: reduce) {
  .hero-track,
  .hero-arrow,
  .hero-pagination button,
  .hero-loading-panel { transition: none; animation: none; }
}
</style>
