<template>
  <div class="about-page">
    <TheHeader />

    <main class="container page-content">
      <div v-if="isLoading" class="state-box">
        <AppIcon name="refresh" :size="40" class="state-icon spin-icon" />
        <h2>Загружаем страницу…</h2>
      </div>

      <FeatureUnavailable
        v-else-if="isUnpublished || (!hasError && !isPublishedCms)"
        title="Страница временно недоступна"
        description="Раздел «О компании» сейчас скрыт или не опубликован."
      />

      <div v-else-if="hasError" class="state-box">
        <AppIcon name="alert" :size="40" class="state-icon" />
        <h2>Не удалось загрузить содержимое</h2>
        <p>Проверьте соединение и попробуйте ещё раз. Показан только актуальный ответ API — старый текст не подставляется.</p>
        <button type="button" class="retry-btn" @click="reload">Повторить</button>
      </div>

      <template v-else>
        <section class="about-hero">
          <span v-if="badgeText" class="about-badge">{{ badgeText }}</span>
          <h1 v-if="pageH1 !== null" class="about-title">{{ pageH1 }}</h1>
          <div
            v-if="hasCmsText(seoText)"
            class="about-subtitle"
            v-html="bodyHtml"
          />
        </section>

        <div v-if="sectionsLoading" class="state-box compact">
          <p>Загружаем блоки страницы…</p>
        </div>

        <div v-else-if="sectionsError" class="state-box compact">
          <p>Не удалось загрузить дополнительные блоки. Основной текст выше из админки сохранён.</p>
          <button type="button" class="retry-btn" @click="refreshSections">Повторить</button>
        </div>

        <section v-else-if="valueCards.length" class="about-grid">
          <article
            v-for="(card, index) in valueCards"
            :key="`${card.title}-${index}`"
            class="about-card"
          >
            <span v-if="card.icon" class="card-icon">
              <AppIcon :name="card.icon" :size="32" />
            </span>
            <h2 v-if="card.title">{{ card.title }}</h2>
            <p v-if="card.text">{{ card.text }}</p>
          </article>
        </section>

        <section class="about-cta">
          <h2>Готовы попробовать?</h2>
          <p>Оформите подписку или загляните в каталог — мы подберём набор под вашего малыша.</p>
          <div class="cta-row">
            <NuxtLink to="/subscription" class="cta-btn primary">Тарифы подписки</NuxtLink>
            <NuxtLink to="/shop" class="cta-btn secondary">Каталог игрушек</NuxtLink>
          </div>
        </section>
      </template>
    </main>

    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { cmsTextToHtml, hasCmsText } from '~/utils/cmsContent'

interface ValueCard {
  icon: string
  title: string
  text: string
}

const {
  seo,
  seoText,
  isPublishedCms,
  isUnpublished,
  isLoading,
  hasError,
  refresh: refreshSeo,
} = usePageSeo('/about')

const {
  sectionByKey,
  isLoading: sectionsLoading,
  hasError: sectionsError,
  refresh: refreshSections,
} = usePageSections('about')

const valuesSection = sectionByKey('values')

// Raw CMS h1: '' = cleared, null = absent. Never inject seed/hardcoded copy.
const pageH1 = computed(() => {
  if (!isPublishedCms.value || !seo.value) return null
  return seo.value.h1
})

const badgeText = computed(() => {
  const fromSection = valuesSection.value?.badge_text?.trim()
  if (fromSection) return fromSection.toUpperCase()
  return 'О КОМПАНИИ ALPHA'
})

const bodyHtml = computed(() => cmsTextToHtml(seoText.value))

const valueCards = computed<ValueCard[]>(() => {
  const raw = valuesSection.value?.content as { cards?: Array<Partial<ValueCard>> } | null
  if (!Array.isArray(raw?.cards)) return []
  return raw.cards
    .map((card) => ({
      icon: String(card?.icon || ''),
      title: String(card?.title || ''),
      text: String(card?.text || ''),
    }))
    .filter((card) => card.title || card.text)
})

const reload = async () => {
  await Promise.all([refreshSeo(), refreshSections()])
}
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  background: #FAF8F4;
  font-family: 'Manrope', sans-serif;
  padding-bottom: 80px;
}

.container {
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-content {
  padding-top: 36px;
}

.state-box {
  text-align: center;
  padding: 64px 16px;
  color: #6F746F;
}

.state-box.compact {
  padding: 24px 16px 40px;
}

.state-box h2 {
  margin: 12px 0 8px;
  color: #262626;
  font-size: 22px;
}

.state-icon {
  color: var(--green-ink);
}

.spin-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.retry-btn {
  margin-top: 12px;
  padding: 10px 18px;
  border: 0;
  border-radius: 12px;
  background: #D9E0D5;
  color: var(--green-ink);
  font-weight: 700;
  cursor: pointer;
}

.about-hero {
  text-align: center;
  max-width: 760px;
  margin: 0 auto 48px;
}

.about-badge {
  display: inline-block;
  background: #D9E0D5;
  color: var(--green-ink);
  font-weight: 800;
  font-size: 12px;
  letter-spacing: 1px;
  padding: 6px 16px;
  border-radius: 20px;
  margin-bottom: 16px;
}

.about-title {
  font-family: 'Manrope', sans-serif;
  font-size: 40px;
  font-weight: 800;
  color: #262626;
  margin-bottom: 12px;
  line-height: 1.2;
  height: auto;
  min-height: 0;
}

.about-subtitle {
  font-size: 16px;
  color: #6F746F;
  line-height: 1.6;
}

.about-subtitle :deep(p) {
  margin: 0 0 12px;
}

.about-subtitle :deep(p:last-child) {
  margin-bottom: 0;
}

.about-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 48px;
}

.about-card {
  background: #fff;
  border-radius: 24px;
  padding: 32px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.02);
}

.card-icon {
  display: inline-flex;
  align-items: center;
  margin-bottom: 12px;
  color: var(--green-ink);
}

.about-card h2 {
  font-family: 'Manrope', sans-serif;
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 8px;
}

.about-card p {
  font-size: 14.5px;
  color: #6F746F;
  line-height: 1.55;
  margin: 0;
}

.about-cta {
  text-align: center;
  background: #fff;
  border-radius: 28px;
  padding: 40px 32px;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.about-cta h2 {
  font-family: 'Manrope', sans-serif;
  font-size: 26px;
  margin-bottom: 8px;
}

.about-cta p {
  color: #6F746F;
  margin-bottom: 20px;
}

.cta-row {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.cta-btn {
  padding: 12px 24px;
  border-radius: 14px;
  font-weight: 700;
  text-decoration: none;
  font-size: 14px;
}

.cta-btn.primary {
  background: var(--green-surface);
  color: var(--green-ink);
}

.cta-btn.secondary {
  background: #D9E0D5;
  color: var(--green-ink);
}

@media (max-width: 768px) {
  .about-title { font-size: 28px; }
  .about-grid { grid-template-columns: 1fr; }
  .about-card { padding: 24px 20px; }
}
</style>
