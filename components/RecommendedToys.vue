<template>
  <section v-if="!loading && visibleToys.length" class="recs-section">
    <div class="recs-header">
      <h2 class="recs-title">{{ heading }}</h2>
      <NuxtLink to="/shop" class="recs-catalog-link">Смотреть весь каталог →</NuxtLink>
    </div>

    <div class="recs-grid">
      <article
        v-for="rec in visibleToys"
        :key="rec.id"
        class="recs-card"
      >
        <button type="button" class="recs-img-wrap" :aria-label="`Открыть «${rec.title}»`" @click="openProduct(rec.id)">
          <img v-if="rec.image" :src="rec.image" :alt="rec.title" class="recs-img" />
          <AppIcon v-else name="toy" :size="36" />
        </button>

        <div class="recs-info">
          <div class="recs-badges">
            <span v-if="rec.age" class="recs-age-badge">{{ rec.age }}</span>
            <span v-if="rec.skill" class="recs-skill-badge">{{ rec.skill }}</span>
          </div>

          <h3 class="recs-card-title">
            <button type="button" @click="openProduct(rec.id)">{{ rec.title }}</button>
          </h3>

          <div class="recs-bottom-row">
            <span class="recs-price">{{ formatPrice(rec.price) }} ₸</span>
            <button
              type="button"
              class="recs-buy-btn"
              :class="{ added: addedIds.includes(rec.id) }"
              @click="addToCart(rec)"
            >
              {{ addedIds.includes(rec.id) ? 'Добавлено ✓' : 'В корзину' }}
            </button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { RecommendedToy } from '~/composables/useRecommendedToys'

const props = defineProps<{
  title?: string
}>()

const { toys, loading, defaultTitle, load } = useRecommendedToys()
const { addItem } = useCart()
const { formatPrice } = useFormatPrice()
const { success: toastSuccess } = useToast()

const addedIds = ref<number[]>([])
const localToys = ref<RecommendedToy[]>([])

const heading = computed(() => props.title || defaultTitle.value)
const visibleToys = computed(() => localToys.value)

watch(loading, (isLoading) => {
  if (isLoading) localToys.value = []
})

watch(toys, (next) => {
  if (!localToys.value.length && next.length) {
    localToys.value = [...next]
  }
}, { immediate: true })

const openProduct = (id: number) => {
  navigateTo(`/product/${id}`)
}

const addToCart = (rec: RecommendedToy) => {
  addItem({
    id: rec.id,
    title: rec.title,
    price: rec.price,
    image: rec.image,
  })

  if (!addedIds.value.includes(rec.id)) {
    addedIds.value = [...addedIds.value, rec.id]
    setTimeout(() => {
      addedIds.value = addedIds.value.filter(id => id !== rec.id)
    }, 2000)
  }

  toastSuccess('В корзине', `«${rec.title}» добавлена в корзину.`)
}

onMounted(() => {
  void load()
})
</script>

<style scoped>
.recs-section {
  width: 100%;
  margin: 28px 0;
}

.recs-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.recs-title {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 24px;
  color: #262626;
  margin: 0;
}

.recs-catalog-link {
  flex-shrink: 0;
  color: var(--green-ink);
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
}

.recs-catalog-link:hover {
  text-decoration: underline;
}

.recs-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}

.recs-card {
  background: #fff;
  border-radius: 24px;
  padding: 16px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.recs-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(51, 61, 54, 0.08);
}

.recs-img-wrap {
  height: 190px;
  border-radius: 18px;
  background: #F4F8FC;
  overflow: hidden;
  cursor: pointer;
  margin-bottom: 14px;
  border: none;
  padding: 0;
  display: grid;
  place-items: center;
  color: #8a918c;
}

.recs-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.recs-card:hover .recs-img {
  transform: scale(1.04);
}

.recs-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.recs-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.recs-age-badge {
  background: #FFF1C5;
  color: #7A5300;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 12px;
}

.recs-skill-badge {
  background: #D9F7EC;
  color: var(--green-ink);
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 12px;
}

.recs-card-title {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 16px;
  color: #262626;
  margin: 0 0 14px;
  line-height: 1.3;
}

.recs-card-title button {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.recs-card-title button:hover {
  color: var(--green-ink);
}

.recs-bottom-row {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.recs-price {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 19px;
  color: #262626;
}

.recs-buy-btn {
  background: var(--green-surface);
  color: var(--green-ink);
  border: none;
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 13px;
  padding: 8px 18px;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(51, 61, 54, 0.25);
  transition: all 0.2s ease;
  white-space: nowrap;
}

.recs-buy-btn:hover {
  background: var(--green-surface-hover);
  color: var(--green-ink);
}

.recs-buy-btn.added {
  background: #9C91C9;
}

@media (max-width: 960px) {
  .recs-grid {
    grid-template-columns: 1fr;
  }

  .recs-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
