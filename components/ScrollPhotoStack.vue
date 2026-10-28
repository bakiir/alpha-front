<template>
  <section
    v-if="loadState !== 'empty'"
    class="photo-stack"
    :aria-busy="loadState === 'loading' ? 'true' : undefined"
    aria-labelledby="photo-stack-title"
  >
    <h2 id="photo-stack-title" class="photo-stack__title">Игра в каждом моменте</h2>

    <div v-if="loadState === 'loading'" class="photo-stack__loading" aria-hidden="true">
      <div v-for="n in 4" :key="n" class="photo-stack__loading-card" />
    </div>

    <div v-else-if="loadState === 'error'" class="photo-stack__status container">
      <p>{{ t('home.photoStack.error') }}</p>
      <button type="button" class="photo-stack__retry" @click="fetchBanners">
        {{ t('home.photoStack.retry') }}
      </button>
    </div>

    <div v-else class="photo-stack__pile">
      <figure
        v-for="(photo, index) in photos"
        :key="`${photo.id}-${photo.src}`"
        class="photo-stack__card"
        :style="{ zIndex: photos.length - index }"
      >
        <img
          :src="photo.src"
          :alt="photo.alt"
          width="1440"
          height="960"
          loading="lazy"
          decoding="async"
        >
      </figure>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const { t } = useI18n()
const { banners, loadState, fetchBanners } = useBanners('home_scroll_stack')
const { cmsMediaUrl } = useCmsMediaUrl()

const photos = computed(() =>
  banners.value.map(b => ({
    id: b.id,
    src: cmsMediaUrl(b.desktop_image),
    alt: b.image_alt || b.title || 'Alpha игра',
  })),
)
</script>

<style scoped>
.photo-stack {
  padding: clamp(88px, 11vw, 176px) 0 clamp(96px, 10vw, 152px);
  background: var(--soft-sage-mist);
}

.photo-stack__title {
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

.photo-stack__loading {
  display: grid;
  gap: 16px;
  width: min(calc(100% - 64px), 1065px);
  margin: 0 auto;
}

.photo-stack__loading-card {
  height: 220px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.45);
}

.photo-stack__status {
  text-align: center;
  color: var(--graphite);
}

.photo-stack__status p {
  margin: 0 0 16px;
}

.photo-stack__retry {
  padding: 10px 18px;
  color: #fff;
  background: var(--alpha-green);
  border: 0;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}

.photo-stack__pile {
  position: relative;
  width: min(calc(100% - 64px), 1065px);
  margin: 0 auto;
}

.photo-stack__card {
  position: sticky;
  bottom: clamp(20px, 4vh, 42px);
  width: calc(100% - clamp(72px, 10vw, 150px));
  aspect-ratio: 3 / 2;
  margin-top: 0;
  margin-bottom: 0;
  overflow: hidden;
  border-radius: 22px;
  background: var(--soft-white);
  box-shadow: 0 24px 60px rgba(38, 38, 38, 0.14);
  transform-origin: center;
}

.photo-stack__card:nth-child(odd) {
  margin-right: auto;
}

.photo-stack__card:nth-child(even) {
  margin-left: auto;
}

.photo-stack__card:nth-child(1) {
  transform: rotate(-3.2deg);
}

.photo-stack__card:nth-child(2) {
  transform: rotate(3.7deg);
}

.photo-stack__card:nth-child(3) {
  margin-top: -24px;
  transform: rotate(-2.4deg);
}

.photo-stack__card:nth-child(4) {
  transform: rotate(2.8deg);
}

.photo-stack__card img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 768px) {
  .photo-stack {
    padding: 72px 0 88px;
  }

  .photo-stack__pile,
  .photo-stack__loading {
    width: min(calc(100% - 32px), 500px);
  }

  .photo-stack__card {
    bottom: 18px;
    width: calc(100% - 28px);
    border-radius: 16px;
    box-shadow: 0 16px 38px rgba(38, 38, 38, 0.14);
  }

  .photo-stack__card:nth-child(1) {
    transform: rotate(-2.8deg);
  }

  .photo-stack__card:nth-child(2) {
    transform: rotate(3.2deg);
  }

  .photo-stack__card:nth-child(3) {
    margin-top: -12px;
    transform: rotate(-2.1deg);
  }

  .photo-stack__card:nth-child(4) {
    transform: rotate(2.4deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .photo-stack__pile {
    display: grid;
    gap: 16px;
  }

  .photo-stack__card {
    position: relative;
    bottom: auto;
    width: 100%;
    margin: 0;
    transform: none;
  }
}
</style>
