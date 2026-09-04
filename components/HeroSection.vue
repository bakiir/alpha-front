<template>
  <section
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
        :key="slide.title"
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
          <p class="hero-kicker">Alpha · игра и развитие</p>
          <component :is="index === 0 ? 'h1' : 'h2'">{{ slide.title }}</component>
          <p class="hero-description">{{ slide.description }}</p>
        </div>
      </article>
    </div>

    <button type="button" class="hero-arrow hero-arrow--prev" aria-label="Предыдущий слайд" @click="previousSlide">
      <span aria-hidden="true">←</span>
    </button>
    <button type="button" class="hero-arrow hero-arrow--next" aria-label="Следующий слайд" @click="nextSlide">
      <span aria-hidden="true">→</span>
    </button>

    <div class="hero-pagination" aria-label="Выбор слайда">
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
const slides = [
  {
    desktopImage: '/images/hero/slide-1-desktop.jpg',
    mobileImage: '/images/hero/slide-1-mobile.jpg',
    title: 'Каждая игра — новое открытие',
    description: 'Развивающие игрушки помогают ребёнку учиться, исследовать и расти через игру.',
    alt: 'Ребёнок играет с деревянным сортером дома',
  },
  {
    desktopImage: '/images/hero/slide-2-desktop.jpg',
    mobileImage: '/images/hero/slide-2-mobile.jpg',
    title: 'Игрушки прямо к вашей двери',
    description: 'Выбирайте подходящие игрушки — мы бережно доставим их в удобное для вас время.',
    alt: 'Курьер передаёт семье коробку с детскими игрушками',
  },
  {
    desktopImage: '/images/hero/slide-3-desktop.jpg',
    mobileImage: '/images/hero/slide-3-mobile.jpg',
    title: 'Играйте больше — выбирайте новое',
    description: 'Меняйте игрушки по мере интереса ребёнка и открывайте новые возможности для развития.',
    alt: 'Дети вместе играют с развивающими деревянными игрушками',
  },
]

const activeSlide = ref(0)
const pointerStartX = ref<number | null>(null)
let autoplayTimer: ReturnType<typeof setInterval> | null = null

const goToSlide = (index: number) => { activeSlide.value = index }
const nextSlide = () => { activeSlide.value = (activeSlide.value + 1) % slides.length }
const previousSlide = () => { activeSlide.value = (activeSlide.value - 1 + slides.length) % slides.length }
const pauseAutoplay = () => {
  if (!autoplayTimer) return
  clearInterval(autoplayTimer)
  autoplayTimer = null
}
const startAutoplay = () => {
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
  overflow: hidden;
  width: 100%;
  min-height: 720px;
  height: 100svh;
  max-height: 980px;
  color: #fff;
  background: var(--graphite);
  touch-action: pan-y;
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
  .hero-pagination button { transition: none; }
}
</style>
