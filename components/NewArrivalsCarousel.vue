<template>
  <section class="new-arrivals" aria-labelledby="new-arrivals-title">
    <div class="new-arrivals__inner container">
      <header class="new-arrivals__header">
        <div>
          <p class="new-arrivals__eyebrow">Недавно в Alpha</p>
          <h2 id="new-arrivals-title">Новинки для новых открытий</h2>
          <p class="new-arrivals__intro">Свежие игрушки для игры, развития и радостных семейных моментов.</p>
        </div>

        <div class="new-arrivals__actions">
          <NuxtLink to="/shop?sort=new" class="new-arrivals__all">
            Смотреть все
            <span aria-hidden="true">↗</span>
          </NuxtLink>
          <div v-if="products.length > 1" class="new-arrivals__controls" aria-label="Управление каруселью">
            <button type="button" aria-label="Предыдущие игрушки" @click="moveCarousel(-1)">
              <span aria-hidden="true">←</span>
            </button>
            <button type="button" aria-label="Следующие игрушки" @click="moveCarousel(1)">
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </header>

      <div v-if="isLoading" class="new-arrivals__track new-arrivals__track--loading" aria-label="Загрузка новинок">
        <div v-for="item in 6" :key="item" class="new-arrivals__skeleton" aria-hidden="true"></div>
      </div>

      <div v-else-if="loadError" class="new-arrivals__empty" role="status">
        <p>Не удалось загрузить новинки.</p>
        <button type="button" @click="loadProducts">Попробовать снова</button>
      </div>

      <div
        v-else
        ref="trackRef"
        class="new-arrivals__track"
        tabindex="0"
        aria-label="Новинки игрушек"
        @mouseenter="isPaused = true"
        @mouseleave="isPaused = false"
        @focusin="isPaused = true"
        @focusout="isPaused = false"
      >
        <article v-for="product in products" :key="product.id" class="arrival-card">
          <div class="arrival-card__image-wrap">
            <NuxtLink :to="`/product/${product.id}`" :aria-label="`Открыть «${product.name}»`">
              <AppImage :src="product.image_url" :alt="product.name" custom-class="arrival-card__image" />
            </NuxtLink>
            <span class="arrival-card__status" :class="`arrival-card__status--${getStatus(product).kind}`">
              {{ getStatus(product).label }}
            </span>
          </div>

          <div class="arrival-card__content">
            <p class="arrival-card__meta">
              <span>{{ product.category?.name || 'Развивающая игрушка' }}</span>
              <span aria-hidden="true">·</span>
              <span>{{ formatAge(product) }}</span>
            </p>
            <h3><NuxtLink :to="`/product/${product.id}`">{{ product.name }}</NuxtLink></h3>

            <div class="arrival-card__footer">
              <div>
                <strong>{{ formatPrice(product.price) }} ₸</strong>
                <span>за игрушку</span>
              </div>
              <button
                type="button"
                class="arrival-card__cart"
                :class="{ 'arrival-card__cart--added': addedIds.includes(product.id) }"
                :disabled="!canAdd(product)"
                :aria-label="addedIds.includes(product.id) ? `«${product.name}» добавлено в корзину` : `Добавить «${product.name}» в корзину`"
                @click="addToCart(product)"
              >
                <AppIcon :name="addedIds.includes(product.id) ? 'check' : 'cart'" :size="21" />
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { ToyItem } from '~/composables/useToys'

const { fetchToys } = useToys()
const { addItem } = useCart()

const products = ref<ToyItem[]>([])
const isLoading = ref(true)
const loadError = ref(false)
const trackRef = ref<HTMLElement | null>(null)
const isPaused = ref(false)
const addedIds = ref<number[]>([])
let autoplayTimer: ReturnType<typeof setInterval> | undefined

const loadProducts = async () => {
  isLoading.value = true
  loadError.value = false
  try {
    const response = await fetchToys({
      catalog: 'shop',
      page: 1,
      per_page: 12,
      sort: 'new',
      stock_status: 'available',
    })
    products.value = Array.isArray(response?.data) ? response.data : []
  } catch (error) {
    console.warn('Could not load new arrivals', error)
    loadError.value = true
  } finally {
    isLoading.value = false
  }
}

const getScrollStep = () => {
  const track = trackRef.value
  if (!track) return 0
  const firstCard = track.querySelector<HTMLElement>('.arrival-card')
  if (!firstCard) return track.clientWidth
  const styles = getComputedStyle(track)
  return firstCard.offsetWidth + (Number.parseFloat(styles.columnGap || styles.gap) || 20)
}

const moveCarousel = (direction: number) => {
  const track = trackRef.value
  if (!track) return

  const isAtEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8
  const isAtStart = track.scrollLeft <= 8
  if (direction > 0 && isAtEnd) {
    track.scrollTo({ left: 0, behavior: 'smooth' })
    return
  }
  if (direction < 0 && isAtStart) {
    track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' })
    return
  }
  track.scrollBy({ left: getScrollStep() * direction, behavior: 'smooth' })
}

const formatPrice = (price?: number) => new Intl.NumberFormat('ru-RU').format(Number(price) || 0)

const formatAge = (product: ToyItem) => {
  const from = Math.floor((product.min_age_months || 0) / 12)
  const to = Math.ceil((product.max_age_months || 72) / 12)
  return `${from}–${to} лет`
}

const getStatus = (product: ToyItem) => {
  if (product.channels?.is_preorder_available) return { label: 'Предзаказ', kind: 'preorder' }
  if (product.channels?.is_rental_available) return { label: 'Аренда', kind: 'rent' }
  return { label: 'Покупка', kind: 'purchase' }
}

const canAdd = (product: ToyItem) => (
  product.stock_status === 'available'
  || Boolean(product.channels?.is_rental_available)
  || Boolean(product.channels?.is_preorder_available)
)

const addToCart = (product: ToyItem) => {
  addItem({
    id: product.id,
    title: product.name,
    price: Number(product.price) || 0,
    image: product.image_url,
  })
  if (addedIds.value.includes(product.id)) return
  addedIds.value.push(product.id)
  window.setTimeout(() => {
    addedIds.value = addedIds.value.filter(id => id !== product.id)
  }, 2200)
}

onMounted(async () => {
  await loadProducts()
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reduceMotion) {
    autoplayTimer = setInterval(() => {
      if (!isPaused.value && document.visibilityState === 'visible') moveCarousel(1)
    }, 4200)
  }
})

onBeforeUnmount(() => clearInterval(autoplayTimer))
</script>

<style scoped>
.new-arrivals {
  padding: clamp(70px, 8vw, 112px) 0;
  overflow: hidden;
  background: var(--ivory);
}

.new-arrivals__inner {
  padding-inline: clamp(20px, 4vw, 64px);
}

.new-arrivals__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
  margin-bottom: 34px;
}

.new-arrivals__eyebrow {
  margin: 0 0 12px;
  color: var(--alpha-green);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.new-arrivals h2 {
  max-width: 760px;
  margin: 0;
  color: var(--graphite);
  font-family: var(--font-display);
  font-size: clamp(42px, 4.8vw, 66px);
  font-weight: 600;
  line-height: 0.98;
}

.new-arrivals__intro {
  max-width: 590px;
  margin: 16px 0 0;
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.65;
}

.new-arrivals__actions,
.new-arrivals__controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.new-arrivals__actions {
  flex-shrink: 0;
  gap: 18px;
}

.new-arrivals__all {
  color: var(--graphite);
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
}

.new-arrivals__all span {
  color: var(--alpha-green);
}

.new-arrivals__controls button {
  display: grid;
  width: 48px;
  height: 48px;
  padding: 0;
  place-items: center;
  border: 1px solid var(--warm-sand);
  border-radius: 50%;
  color: var(--graphite);
  background: #fff;
  font-size: 20px;
  cursor: pointer;
  transition: color 180ms ease, background 180ms ease, transform 180ms ease;
}

.new-arrivals__controls button:hover {
  color: #fff;
  background: var(--alpha-green);
  transform: translateY(-2px);
}

.new-arrivals__track {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: calc((100% - 75px) / 6);
  gap: 15px;
  padding: 2px 2px 20px;
  overflow-x: auto;
  overscroll-behavior-inline: contain;
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}

.new-arrivals__track::-webkit-scrollbar {
  display: none;
}

.new-arrivals__track:focus-visible {
  outline: 2px solid var(--alpha-green);
  outline-offset: 6px;
}

.arrival-card,
.new-arrivals__skeleton {
  min-width: 0;
  border: 1px solid rgba(63, 103, 87, 0.15);
  border-radius: 24px;
  background: #fff;
  scroll-snap-align: start;
}

.arrival-card {
  display: flex;
  min-height: 360px;
  overflow: hidden;
  flex-direction: column;
  box-shadow: 0 16px 36px rgba(38, 38, 38, 0.055);
  transition: transform 200ms ease, box-shadow 200ms ease;
}

.arrival-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 22px 42px rgba(38, 38, 38, 0.09);
}

.arrival-card__image-wrap {
  position: relative;
  height: 190px;
  margin: 8px 8px 0;
  overflow: hidden;
  border-radius: 16px;
  background: var(--soft-white);
}

.arrival-card__image-wrap > a,
.arrival-card__image-wrap :deep(.app-image-container) {
  display: block;
  width: 100%;
  height: 100%;
}

.arrival-card__image-wrap :deep(.arrival-card__image) {
  object-fit: cover;
}

.arrival-card__status {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 6px 9px;
  border-radius: 999px;
  color: var(--graphite);
  background: rgba(255, 255, 255, 0.92);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.04em;
  backdrop-filter: blur(8px);
}

.arrival-card__status--rent { background: rgba(217, 224, 213, 0.94); }
.arrival-card__status--preorder { background: rgba(232, 166, 43, 0.9); }
.arrival-card__status--purchase { background: rgba(227, 215, 198, 0.94); }

.arrival-card__content {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 17px 15px 15px;
}

.arrival-card__meta {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0 0 8px;
  overflow: hidden;
  color: var(--text-secondary);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
}

.arrival-card__meta span:first-child {
  overflow: hidden;
  text-overflow: ellipsis;
}

.arrival-card h3 {
  display: -webkit-box;
  min-height: 42px;
  margin: 0 0 15px;
  overflow: hidden;
  color: var(--graphite);
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 700;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.arrival-card h3 a {
  color: inherit;
  text-decoration: none;
}

.arrival-card__footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
  margin-top: auto;
}

.arrival-card__footer > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.arrival-card__footer strong {
  color: var(--graphite);
  font-size: 17px;
  line-height: 1.2;
}

.arrival-card__footer > div span {
  color: var(--text-secondary);
  font-size: 11px;
}

.arrival-card__cart {
  display: grid;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  padding: 0;
  place-items: center;
  border: 0;
  border-radius: 50%;
  color: #fff;
  background: var(--alpha-green);
  cursor: pointer;
  transition: background 180ms ease, transform 180ms ease;
}

.arrival-card__cart:hover:not(:disabled) {
  background: var(--alpha-green-dark);
  transform: scale(1.05);
}

.arrival-card__cart--added {
  background: #7d9a7f;
}

.arrival-card__cart:disabled {
  cursor: not-allowed;
  opacity: 0.42;
}

.new-arrivals__track--loading {
  overflow: hidden;
}

.new-arrivals__skeleton {
  height: 360px;
  background: linear-gradient(100deg, var(--soft-white) 20%, #fff 40%, var(--soft-white) 60%);
  background-size: 220% 100%;
  animation: arrivals-shimmer 1.35s linear infinite;
}

.new-arrivals__empty {
  display: flex;
  min-height: 180px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 14px;
  border: 1px solid var(--warm-sand);
  border-radius: 24px;
  background: var(--soft-white);
  color: var(--text-secondary);
}

.new-arrivals__empty p { margin: 0; }
.new-arrivals__empty button {
  border: 0;
  color: var(--alpha-green);
  background: transparent;
  font-weight: 800;
  cursor: pointer;
}

@keyframes arrivals-shimmer {
  to { background-position: -220% 0; }
}

@media (max-width: 1199px) {
  .new-arrivals__track { grid-auto-columns: calc((100% - 45px) / 4); }
}

@media (max-width: 900px) {
  .new-arrivals__track { grid-auto-columns: calc((100% - 30px) / 3); }
  .arrival-card__image-wrap { height: 205px; }
}

@media (max-width: 768px) {
  .new-arrivals { padding: 64px 0; }
  .new-arrivals__header { align-items: flex-start; flex-direction: column; gap: 22px; }
  .new-arrivals__actions { width: 100%; justify-content: space-between; }
  .new-arrivals__track { grid-auto-columns: min(82vw, 330px); gap: 14px; margin-right: -20px; }
  .arrival-card { min-height: 410px; }
  .arrival-card__image-wrap { height: 238px; }
  .arrival-card__content { padding: 20px; }
  .arrival-card h3 { min-height: 50px; font-size: 18px; }
  .arrival-card__meta { font-size: 10px; }
  .arrival-card__footer strong { font-size: 20px; }
  .arrival-card__cart { width: 48px; height: 48px; flex-basis: 48px; }
  .new-arrivals__controls button { width: 44px; height: 44px; }
}

@media (prefers-reduced-motion: reduce) {
  .new-arrivals__track { scroll-behavior: auto; }
  .arrival-card, .new-arrivals__controls button, .arrival-card__cart { transition: none; }
  .new-arrivals__skeleton { animation: none; }
}
</style>
