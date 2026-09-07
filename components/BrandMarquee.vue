<template>
  <section class="brand-marquee" aria-labelledby="brand-marquee-title">
    <h2 id="brand-marquee-title" class="brand-marquee__title">
      Популярные бренды игрушек
    </h2>

    <div class="brand-marquee__viewport">
      <div class="brand-marquee__track">
        <ul class="brand-marquee__group">
          <li v-for="brand in brands" :key="brand">
            <span aria-hidden="true"></span>
            {{ brand }}
          </li>
        </ul>

        <ul class="brand-marquee__group" aria-hidden="true">
          <li v-for="brand in brands" :key="`copy-${brand}`">
            <span aria-hidden="true"></span>
            {{ brand }}
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup>
const brands = [
  'LEGO',
  'Fisher-Price',
  'Hape',
  'Djeco',
  'Janod',
  'Melissa & Doug',
  'Magna-Tiles',
  'Playmobil',
  'Schleich',
  'Hot Wheels',
  'Barbie',
  'Bruder',
  'Ravensburger',
  'Tiny Love',
]
</script>

<style scoped>
.brand-marquee {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-top: 1px solid rgba(227, 215, 198, 0.72);
  border-bottom: 1px solid rgba(227, 215, 198, 0.72);
  background: #f7efe9;
}

.brand-marquee__title {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.brand-marquee__viewport {
  width: 100%;
  overflow: hidden;
  mask-image: linear-gradient(to right, transparent, #000 5%, #000 95%, transparent);
}

.brand-marquee__track {
  display: flex;
  width: max-content;
  animation: brand-marquee-slide 32s linear infinite;
  will-change: transform;
}

.brand-marquee__group {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: clamp(34px, 4vw, 64px);
  margin: 0;
  padding: 21px clamp(34px, 4vw, 64px) 21px 0;
  list-style: none;
}

.brand-marquee__group li {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: #746e67;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1;
  white-space: nowrap;
  user-select: none;
}

.brand-marquee__group li:first-child {
  margin-left: clamp(34px, 4vw, 64px);
}

.brand-marquee__group li span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-secondary);
  opacity: 0.72;
}

.brand-marquee:hover .brand-marquee__track {
  animation-play-state: paused;
}

@keyframes brand-marquee-slide {
  to {
    transform: translateX(-50%);
  }
}

@media (max-width: 640px) {
  .brand-marquee__viewport {
    mask-image: linear-gradient(to right, transparent, #000 9%, #000 91%, transparent);
  }

  .brand-marquee__track {
    animation-duration: 26s;
  }

  .brand-marquee__group {
    gap: 34px;
    padding: 18px 34px 18px 0;
  }

  .brand-marquee__group li {
    gap: 10px;
    font-size: 13px;
  }

  .brand-marquee__group li:first-child {
    margin-left: 34px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .brand-marquee__viewport {
    overflow-x: auto;
    mask-image: none;
    scrollbar-width: none;
  }

  .brand-marquee__viewport::-webkit-scrollbar {
    display: none;
  }

  .brand-marquee__track {
    animation: none;
    will-change: auto;
  }

  .brand-marquee__group[aria-hidden='true'] {
    display: none;
  }
}
</style>
