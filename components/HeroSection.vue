<template>
  <section
    class="hero-carousel container"
    aria-label="Предложения Alpha"
    aria-roledescription="carousel"
    @mouseenter="pauseAutoplay"
    @mouseleave="startAutoplay"
    @focusin="pauseAutoplay"
    @focusout="startAutoplay"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointercancel="pointerStartX = null"
  >
    <h1 class="sr-only">Развивающие игрушки Alpha для детей</h1>

    <div class="carousel-viewport">
      <div
        class="carousel-track"
        :style="{ transform: `translateX(-${activeSlide * 100}%)` }"
      >
        <NuxtLink
          v-for="(slide, index) in slides"
          :key="slide.image"
          :to="slide.to"
          class="carousel-slide"
          :aria-label="slide.label"
          :aria-hidden="index !== activeSlide"
          :tabindex="index === activeSlide ? 0 : -1"
          @click="onSlideClick"
        >
          <img
            :src="slide.image"
            :alt="slide.alt"
            class="carousel-image"
            :fetchpriority="index === 0 ? 'high' : 'auto'"
            :loading="index === 0 ? 'eager' : 'lazy'"
          >
        </NuxtLink>
      </div>

      <button
        type="button"
        class="carousel-arrow carousel-arrow--prev"
        aria-label="Предыдущий слайд"
        @click="previousSlide"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      <button
        type="button"
        class="carousel-arrow carousel-arrow--next"
        aria-label="Следующий слайд"
        @click="nextSlide"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </div>

    <div class="carousel-dots" aria-label="Выбор слайда">
      <button
        v-for="(_, index) in slides"
        :key="index"
        type="button"
        class="carousel-dot"
        :class="{ 'carousel-dot--active': index === activeSlide }"
        :aria-label="`Показать слайд ${index + 1}`"
        :aria-current="index === activeSlide ? 'true' : undefined"
        @click="goToSlide(index)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
const slides = [
  {
    image: '/images/banners/subscription-latest.jpg',
    to: '/subscription',
    label: 'Перейти к оформлению подписки',
    alt: 'С подпиской играть и развиваться выгоднее — развивающие игрушки Alpha',
  },
  {
    image: '/images/banners/shop-latest.jpg',
    to: '/shop',
    label: 'Перейти в каталог игрушек',
    alt: 'Мир игрушек для радости и развития — скидки до 30 процентов',
  },
]

const activeSlide = ref(0)
const pointerStartX = ref<number | null>(null)
const blockNextClick = ref(false)
let autoplayTimer: ReturnType<typeof setInterval> | null = null

const goToSlide = (index: number) => {
  activeSlide.value = index
}

const nextSlide = () => {
  activeSlide.value = (activeSlide.value + 1) % slides.length
}

const previousSlide = () => {
  activeSlide.value = (activeSlide.value - 1 + slides.length) % slides.length
}

const pauseAutoplay = () => {
  if (!autoplayTimer) return
  clearInterval(autoplayTimer)
  autoplayTimer = null
}

const startAutoplay = () => {
  pauseAutoplay()
  autoplayTimer = setInterval(nextSlide, 6000)
}

const onPointerDown = (event: PointerEvent) => {
  pointerStartX.value = event.clientX
  blockNextClick.value = false
}

const onPointerUp = (event: PointerEvent) => {
  if (pointerStartX.value === null) return

  const distance = event.clientX - pointerStartX.value
  pointerStartX.value = null

  if (Math.abs(distance) < 45) return
  blockNextClick.value = true
  distance < 0 ? nextSlide() : previousSlide()
}

const onSlideClick = (event: MouseEvent) => {
  if (!blockNextClick.value) return
  event.preventDefault()
  blockNextClick.value = false
}

onMounted(startAutoplay)
onBeforeUnmount(pauseAutoplay)
</script>

<style scoped>
.hero-carousel {
  padding-top: 20px;
  padding-bottom: 32px;
}

.carousel-viewport {
  position: relative;
  overflow: hidden;
  width: 100%;
  aspect-ratio: 1983 / 793;
  border-radius: 32px;
  background: var(--bg-tertiary);
  box-shadow: var(--shadow-lg);
  touch-action: pan-y;
}

.carousel-track {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 550ms cubic-bezier(0.22, 0.61, 0.36, 1);
  will-change: transform;
}

.carousel-slide {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.carousel-slide:focus-visible {
  outline: 4px solid #fff;
  outline-offset: -8px;
}

.carousel-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-arrow:focus-visible,
.carousel-dot:focus-visible {
  outline: 3px solid #fff;
  outline-offset: 3px;
}

.carousel-arrow svg {
  flex: 0 0 auto;
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2.2;
}

.carousel-arrow {
  position: absolute;
  z-index: 4;
  top: 50%;
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 50%;
  color: #27312B;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 8px 24px rgba(18, 18, 31, 0.18);
  transform: translateY(-50%);
  transition: background 180ms ease, transform 180ms ease;
  backdrop-filter: blur(8px);
}

.carousel-arrow:hover {
  background: #fff;
  transform: translateY(-50%) scale(1.06);
}

.carousel-arrow--prev {
  left: 22px;
}

.carousel-arrow--next {
  right: 22px;
}

.carousel-dots {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 18px;
}

.carousel-dot {
  width: 10px;
  height: 10px;
  padding: 0;
  border-radius: 999px;
  background: var(--border-strong);
  transition: width 200ms ease, background 200ms ease;
}

.carousel-dot--active {
  width: 32px;
  background: var(--color-primary);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 960px) {
  .hero-carousel {
    padding-top: 16px;
    padding-bottom: 24px;
  }

  .carousel-viewport {
    border-radius: 24px;
  }

  .carousel-arrow {
    width: 44px;
    height: 44px;
  }

  .carousel-arrow--prev {
    left: 14px;
  }

  .carousel-arrow--next {
    right: 14px;
  }
}

@media (max-width: 640px) {
  .hero-carousel {
    padding-top: 12px;
    padding-bottom: 20px;
  }

  .carousel-viewport {
    border-radius: 16px;
    box-shadow: 0 10px 28px rgba(46, 36, 91, 0.12);
  }

  .carousel-arrow {
    width: 36px;
    height: 36px;
  }

  .carousel-arrow svg {
    width: 22px;
    height: 22px;
  }

  .carousel-arrow--prev {
    left: 8px;
  }

  .carousel-arrow--next {
    right: 8px;
  }

  .carousel-dots {
    margin-top: 12px;
  }

  .carousel-dot {
    width: 8px;
    height: 8px;
  }

  .carousel-dot--active {
    width: 24px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .carousel-track,
  .carousel-arrow,
  .carousel-dot {
    transition: none;
  }
}
</style>
