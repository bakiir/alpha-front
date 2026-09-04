<template>
  <section class="photo-stack" aria-labelledby="photo-stack-title">
    <h2 id="photo-stack-title" class="photo-stack__title">Игра в каждом моменте</h2>

    <div class="photo-stack__pile">
      <figure
        v-for="(photo, index) in photos"
        :key="photo.src"
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
const photos = [
  {
    src: '/images/scroll-stack/photo-1.jpg',
    alt: 'Дети играют с мягкими игрушками',
  },
  {
    src: '/images/scroll-stack/photo-2.jpg',
    alt: 'Ребёнок строит башню из деревянных кубиков',
  },
  {
    src: '/images/scroll-stack/photo-3.jpg',
    alt: 'Дети играют с деревянной железной дорогой',
  },
  {
    src: '/images/scroll-stack/photo-4.jpg',
    alt: 'Мама играет с ребёнком на ковре',
  },
]
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

  .photo-stack__pile {
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
