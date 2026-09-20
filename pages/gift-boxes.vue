<template>
  <div class="gift-boxes-page">
    <TheHeader />

    <main class="container page-content">
      <section class="page-hero">
        <span class="sub-badge">ГОТОВЫЕ НАБОРЫ</span>
        <h1 class="page-title">Подарочные боксы</h1>
        <p class="page-subtitle">
          Фирменная деревянная эко-упаковка с атласной лентой, наполнителем и поздравительной открыткой.
        </p>
      </section>

      <div class="occasion-filter" role="group" aria-label="Повод">
        <span class="occasion-filter-label">Повод</span>
        <div class="occasion-chips">
          <button
            type="button"
            class="occasion-chip"
            :class="{ active: selectedOccasionSlug === '' }"
            @click="selectOccasion('')"
          >
            Все боксы
          </button>
          <button
            v-for="occasion in giftOccasions"
            :key="occasion.id"
            type="button"
            class="occasion-chip"
            :class="{ active: selectedOccasionSlug === occasion.slug }"
            @click="selectOccasion(occasion.slug)"
          >
            <span v-if="occasion.icon" class="occasion-chip-icon">{{ occasion.icon }}</span>
            {{ occasion.name }}
          </button>
        </div>
      </div>

      <div v-if="isLoadingBoxes" class="loading-state">
        <div class="spinner"></div>
        <p>Загружаем подарочные боксы...</p>
      </div>

      <div v-else-if="giftBoxesList.length === 0" class="empty-note">
        <template v-if="selectedOccasionSlug">
          Для этого повода пока нет боксов. Попробуйте «Все боксы» или другой повод.
        </template>
        <template v-else>
          Подарочные боксы скоро появятся в каталоге. Попробуйте обновить страницу позже.
        </template>
      </div>

      <div v-else class="boxes-grid">
        <div v-for="box in giftBoxesList" :key="box.id" class="box-card">
          <div class="box-img-wrap">
            <img :src="box.image_url" :alt="box.name" class="box-img" />
            <span class="box-age-tag">{{ box.min_age_months }}–{{ box.max_age_months }} мес</span>
            <span class="box-gift-ribbon"><AppIcon name="gift" :size="14" class="inline-icon" /> Подарочный бокс</span>
          </div>
          <div class="box-content">
            <h2 class="box-title">{{ box.name }}</h2>
            <p class="box-desc">{{ box.description }}</p>
            <div v-if="box.gift_occasions?.length" class="box-occasions">
              <span
                v-for="occasion in box.gift_occasions"
                :key="occasion.id"
                class="box-occasion-tag"
              >
                <span v-if="occasion.icon">{{ occasion.icon }}</span>
                {{ occasion.name }}
              </span>
            </div>

            <div v-if="box.components?.length" class="box-composition-actions">
              <button type="button" class="box-contents-btn" @click="openContentsModal(box)">
                Что внутри
                <span class="box-contents-count">{{ box.components.length }}</span>
              </button>
            </div>

            <div class="box-features-mini">
              <span><AppIcon name="tree" :size="14" class="inline-icon" /> Эко-дерево</span>
              <span><AppIcon name="gift" :size="14" class="inline-icon" /> Подарочная лента</span>
              <span><AppIcon name="mail" :size="14" class="inline-icon" /> Открытка внутри</span>
            </div>
            <div class="box-bottom-row">
              <span class="box-price">{{ formatPrice(Number(box.price)) }} ₸</span>
              <button type="button" class="box-add-btn" @click="addBox(box)">Подарить бокс</button>
            </div>
          </div>
        </div>
      </div>

      <p class="hub-link">
        Нужен сертификат или подписка?
        <NuxtLink to="/gifts">Перейти к подарочным сертификатам →</NuxtLink>
      </p>
    </main>

    <TheFooter />

    <Teleport to="body">
      <Transition name="gb-modal">
        <div
          v-if="contentsBox"
          class="gb-modal-overlay"
          role="dialog"
          aria-modal="true"
          :aria-label="`Состав: ${contentsBox.name}`"
          @click.self="closeContentsModal"
        >
          <div class="gb-modal-card">
            <button type="button" class="gb-modal-close" aria-label="Закрыть" @click="closeContentsModal">×</button>

            <div class="gb-modal-hero">
              <img
                v-if="contentsBox.image_url"
                :src="contentsBox.image_url"
                :alt="contentsBox.name"
                class="gb-modal-hero-img"
              >
              <div v-else class="gb-modal-hero-fallback">
                <AppIcon name="gift" :size="36" />
              </div>
            </div>

            <div class="gb-modal-body">
              <p class="gb-modal-eyebrow">Состав бокса</p>
              <h2 class="gb-modal-title">{{ contentsBox.name }}</h2>
              <p v-if="contentsBox.description" class="gb-modal-desc">{{ contentsBox.description }}</p>

              <ul class="gb-modal-list">
                <li
                  v-for="part in contentsBox.components"
                  :key="part.toy_id"
                  class="gb-modal-item"
                >
                  <div class="gb-modal-thumb">
                    <img
                      v-if="part.image_url"
                      :src="part.image_url"
                      :alt="part.name || 'Игрушка'"
                    >
                    <span v-else class="gb-modal-thumb-fallback">{{ (part.name || '?').slice(0, 1) }}</span>
                  </div>
                  <div class="gb-modal-item-meta">
                    <span class="gb-modal-item-name">{{ part.name || 'Игрушка' }}</span>
                    <span class="gb-modal-item-qty">{{ part.quantity }} шт.</span>
                  </div>
                </li>
              </ul>

              <div class="gb-modal-footer">
                <span class="gb-modal-price">{{ formatPrice(Number(contentsBox.price)) }} ₸</span>
                <button type="button" class="box-add-btn" @click="addBoxFromModal">Подарить бокс</button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'

useSeoMeta({
  title: 'Подарочные боксы | Alpha',
  description: 'Праздничные подарочные боксы Alpha — фильтр по поводу и готовые наборы.',
})

const { request } = useApi()
const { addItem } = useCart()
const { occasions: giftOccasions, loadOccasions } = useGiftOccasions()

const giftBoxesList = ref<any[]>([])
const isLoadingBoxes = ref(false)
const selectedOccasionSlug = ref('')
const contentsBox = ref<any | null>(null)

const parseToyList = (res: any): any[] => {
  const list = res?.data ?? res ?? []
  return Array.isArray(list) ? list : []
}

const openContentsModal = (box: any) => {
  contentsBox.value = box
}

const closeContentsModal = () => {
  contentsBox.value = null
}

const onEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && contentsBox.value) {
    closeContentsModal()
  }
}

watch(contentsBox, (box) => {
  if (!import.meta.client) return
  document.body.style.overflow = box ? 'hidden' : ''
})

onMounted(async () => {
  if (import.meta.client) {
    window.addEventListener('keydown', onEscape)
  }
  await loadOccasions()
  await loadGiftBoxes()
})

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('keydown', onEscape)
    document.body.style.overflow = ''
  }
})

const loadGiftBoxes = async () => {
  isLoadingBoxes.value = true
  try {
    let url = '/gift-boxes'
    if (selectedOccasionSlug.value) {
      url += `?occasion=${encodeURIComponent(selectedOccasionSlug.value)}`
    }
    const res = await request<any>(url)
    giftBoxesList.value = parseToyList(res)
  } catch (e) {
    console.warn('Could not load gift boxes from API', e)
    giftBoxesList.value = []
  } finally {
    isLoadingBoxes.value = false
  }
}

const selectOccasion = (slug: string) => {
  if (selectedOccasionSlug.value === slug) return
  selectedOccasionSlug.value = slug
  closeContentsModal()
  loadGiftBoxes()
}

const addBox = (box: any) => {
  addItem({
    id: `gb-${box.id}`,
    giftBoxId: Number(box.id),
    title: `${box.name} (подарочный бокс)`,
    price: Number(box.price),
    image: box.image_url,
    isGiftPackaging: true,
  })
  navigateTo('/cart')
}

const addBoxFromModal = () => {
  if (!contentsBox.value) return
  const box = contentsBox.value
  closeContentsModal()
  addBox(box)
}

const formatPrice = (val: number) => {
  if (!val && val !== 0) return '0'
  return Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
</script>

<style scoped>
.gift-boxes-page {
  min-height: 100vh;
  background-color: #FAF8F4;
  color: #262626;
  font-family: 'Manrope', sans-serif;
  padding-bottom: 90px;
}

.page-content {
  padding-top: 32px;
}

.page-hero {
  text-align: center;
  margin-bottom: 28px;
}

.sub-badge {
  display: inline-block;
  background: #D9E0D5;
  color: var(--green-ink);
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 1px;
  padding: 4px 12px;
  border-radius: 14px;
  margin-bottom: 8px;
}

.page-title {
  font-family: 'Manrope', sans-serif;
  font-size: 34px;
  font-weight: 800;
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 15px;
  color: #6F746F;
  max-width: 560px;
  margin: 0 auto;
}

.occasion-filter {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin: 0 0 28px;
}

.occasion-filter-label {
  font-family: 'Manrope', sans-serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #6F746F;
}

.occasion-chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.occasion-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid rgba(51, 61, 54, 0.18);
  background: #FAF8F4;
  color: var(--green-ink);
  font-family: 'Manrope', sans-serif;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.occasion-chip:hover {
  border-color: rgba(51, 61, 54, 0.35);
  background: #F0EDE6;
}

.occasion-chip.active {
  background: var(--green-ink);
  border-color: var(--green-ink);
  color: #FAF8F4;
}

.occasion-chip-icon {
  font-size: 15px;
  line-height: 1;
}

.loading-state,
.empty-note {
  text-align: center;
  padding: 48px 16px;
  color: #6F746F;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(51, 61, 54, 0.15);
  border-top-color: var(--green-ink);
  border-radius: 50%;
  margin: 0 auto 12px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.boxes-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.box-card {
  background: #FAF8F4;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
}

.box-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(51, 61, 54, 0.1);
}

.box-img-wrap {
  width: 100%;
  height: 190px;
  position: relative;
  background: #ECECF4;
}

.box-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.box-age-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(26, 26, 46, 0.8);
  backdrop-filter: blur(4px);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 8px;
}

.box-gift-ribbon {
  position: absolute;
  bottom: 12px;
  left: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #fff;
  color: var(--green-ink);
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 8px;
}

.box-content {
  padding: 18px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.box-title {
  font-size: 17px;
  font-weight: 800;
  margin: 0 0 8px;
}

.box-desc {
  font-size: 13px;
  color: #6F746F;
  margin: 0 0 12px;
  line-height: 1.45;
  flex: 1;
}

.box-occasions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0 0 12px;
}

.box-occasion-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--green-ink);
  background: #D9E0D5;
  padding: 4px 10px;
  border-radius: 999px;
}

.box-composition-actions {
  margin: 0 0 12px;
}

.box-contents-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  background: transparent;
  color: var(--green-ink);
  font-family: 'Manrope', sans-serif;
  font-size: 13px;
  font-weight: 700;
  padding: 0;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.box-contents-btn:hover {
  opacity: 0.8;
}

.box-contents-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: #D9E0D5;
  font-size: 11px;
  font-weight: 800;
  text-decoration: none;
}

.box-features-mini {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
  font-size: 12px;
  color: #6F746F;
}

.box-features-mini span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.box-bottom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.box-price {
  font-size: 18px;
  font-weight: 800;
  color: var(--green-ink);
}

.box-add-btn {
  border: none;
  background: var(--green-ink);
  color: #FAF8F4;
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 13px;
  padding: 10px 14px;
  border-radius: 12px;
  cursor: pointer;
}

.box-add-btn:hover {
  opacity: 0.92;
}

.hub-link {
  text-align: center;
  margin-top: 40px;
  color: #6F746F;
  font-size: 14px;
}

.hub-link a {
  color: var(--green-ink);
  font-weight: 700;
  margin-left: 6px;
}

.inline-icon {
  display: inline-block;
  vertical-align: -2px;
}

.gb-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(38, 38, 38, 0.48);
  backdrop-filter: blur(4px);
}

.gb-modal-card {
  position: relative;
  width: min(440px, 100%);
  max-height: min(88vh, 720px);
  overflow: auto;
  background: #FAF8F4;
  border-radius: 24px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18);
}

.gb-modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(250, 248, 244, 0.92);
  color: #262626;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

.gb-modal-hero {
  height: 180px;
  background: #ECECF4;
}

.gb-modal-hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gb-modal-hero-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--green-ink);
}

.gb-modal-body {
  padding: 20px 22px 22px;
}

.gb-modal-eyebrow {
  margin: 0 0 4px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #6F746F;
}

.gb-modal-title {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.25;
}

.gb-modal-desc {
  margin: 0 0 16px;
  font-size: 14px;
  line-height: 1.45;
  color: #6F746F;
}

.gb-modal-list {
  list-style: none;
  margin: 0 0 18px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.gb-modal-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 14px;
  background: #F3F0EA;
}

.gb-modal-thumb {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  overflow: hidden;
  background: #ECECF4;
  flex-shrink: 0;
}

.gb-modal-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gb-modal-thumb-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 16px;
  font-weight: 800;
  color: #6F746F;
}

.gb-modal-item-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.gb-modal-item-name {
  font-size: 14px;
  font-weight: 700;
  color: #262626;
}

.gb-modal-item-qty {
  font-size: 12px;
  font-weight: 600;
  color: #6F746F;
}

.gb-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 4px;
}

.gb-modal-price {
  font-size: 20px;
  font-weight: 800;
  color: var(--green-ink);
}

.gb-modal-enter-active,
.gb-modal-leave-active {
  transition: opacity 0.18s ease;
}

.gb-modal-enter-active .gb-modal-card,
.gb-modal-leave-active .gb-modal-card {
  transition: transform 0.18s ease, opacity 0.18s ease;
}

.gb-modal-enter-from,
.gb-modal-leave-to {
  opacity: 0;
}

.gb-modal-enter-from .gb-modal-card,
.gb-modal-leave-to .gb-modal-card {
  transform: translateY(10px);
  opacity: 0;
}

@media (max-width: 1100px) {
  .boxes-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .page-title { font-size: 26px; }
  .boxes-grid { grid-template-columns: 1fr; }
}
</style>
