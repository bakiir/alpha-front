<template>
  <div class="fresh-page">
    <TheHeader />

    <main>
      <div v-if="isLoading" class="state-box container">
        <AppIcon name="refresh" :size="40" class="state-icon spin-icon" />
        <h2>Загружаем страницу…</h2>
      </div>

      <FeatureUnavailable
        v-else-if="isUnpublished || (!hasError && !isPublishedCms)"
        title="Страница временно недоступна"
        description="Раздел «Чистота и безопасность» сейчас скрыт или не опубликован."
      />

      <div v-else-if="hasError" class="state-box container">
        <AppIcon name="alert" :size="40" class="state-icon" />
        <h2>Не удалось загрузить содержимое</h2>
        <p>Проверьте соединение и попробуйте ещё раз.</p>
        <button type="button" class="retry-btn" @click="reload">Повторить</button>
      </div>

      <template v-else>
        <section class="fresh-hero">
          <div class="container fresh-hero__inner">
            <p v-if="badgeText" class="fresh-hero__badge">
              <AppIcon name="shield" :size="18" />
              <span>{{ badgeText }}</span>
            </p>
            <h1 v-if="pageH1 !== null" class="fresh-hero__title">{{ pageH1 }}</h1>
            <div
              v-if="hasCmsText(seoText)"
              class="fresh-hero__lead"
              v-html="bodyHtml"
            />
          </div>
        </section>

        <div v-if="sectionsLoading" class="state-box container compact">
          <p>Загружаем блоки страницы…</p>
        </div>

        <div v-else-if="sectionsError" class="state-box container compact">
          <p>Не удалось загрузить дополнительные блоки.</p>
          <button type="button" class="retry-btn" @click="refreshSections">Повторить</button>
        </div>

        <template v-else>
          <section v-if="showProcess" class="fresh-process">
            <div class="container">
              <header class="fresh-process__header">
                <h2 v-if="processTitle" class="fresh-process__title">{{ processTitle }}</h2>
                <p v-if="processIntro" class="fresh-process__intro">{{ processIntro }}</p>
              </header>

              <ol v-if="processSteps.length" class="fresh-steps">
                <li
                  v-for="(step, index) in processSteps"
                  :key="`${step.step}-${index}`"
                  class="fresh-steps__item"
                >
                  <span class="fresh-steps__num" aria-hidden="true">{{ step.step || String(index + 1).padStart(2, '0') }}</span>
                  <div class="fresh-steps__body">
                    <h3 v-if="step.title">{{ step.title }}</h3>
                    <p v-if="step.description">{{ step.description }}</p>
                  </div>
                </li>
              </ol>
            </div>
          </section>

          <section v-if="showGuarantee" class="fresh-guarantee">
            <div class="container">
              <div class="fresh-guarantee__card">
                <AppIcon name="check" :size="28" class="fresh-guarantee__icon" />
                <div>
                  <h2 v-if="guaranteeTitle">{{ guaranteeTitle }}</h2>
                  <p v-if="guaranteeText">{{ guaranteeText }}</p>
                </div>
              </div>
            </div>
          </section>

          <section v-if="showStandards" class="fresh-standards">
            <div class="container">
              <header class="fresh-standards__header">
                <h2 v-if="standardsTitle">{{ standardsTitle }}</h2>
                <p v-if="standardsIntro">{{ standardsIntro }}</p>
              </header>

              <div v-if="standardCards.length" class="fresh-standards__grid">
                <article
                  v-for="(card, index) in standardCards"
                  :key="`${card.title}-${index}`"
                  class="fresh-standards__card"
                >
                  <span v-if="card.icon" class="fresh-standards__icon">
                    <AppIcon :name="card.icon" :size="28" />
                  </span>
                  <h3 v-if="card.title">{{ card.title }}</h3>
                  <p v-if="card.text">{{ card.text }}</p>
                </article>
              </div>
            </div>
          </section>

          <section v-if="showTrust" class="fresh-trust">
            <div class="container fresh-trust__inner">
              <figure class="fresh-trust__visual">
                <img
                  :src="trustImage"
                  :alt="trustImageAlt"
                  width="1684"
                  height="934"
                  loading="lazy"
                >
                <figcaption v-if="trustCaption">
                  <span aria-hidden="true" />
                  {{ trustCaption }}
                </figcaption>
              </figure>
              <div class="fresh-trust__copy">
                <h2 v-if="trustTitle">{{ trustTitle }}</h2>
                <p v-if="trustText">{{ trustText }}</p>
                <div class="fresh-trust__cta">
                  <NuxtLink to="/subscription" class="cta-btn primary">Тарифы подписки</NuxtLink>
                  <NuxtLink to="/shop" class="cta-btn secondary">Каталог игрушек</NuxtLink>
                </div>
              </div>
            </div>
          </section>
        </template>
      </template>
    </main>

    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { cmsTextToHtml, hasCmsText } from '~/utils/cmsContent'
import { resolveMediaUrl } from '~/utils/mediaUrl'

interface ProcessStep {
  step: string
  title: string
  description: string
}

interface StandardCard {
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
} = usePageSeo('/freshness-promise')

const {
  sectionByKey,
  isLoading: sectionsLoading,
  hasError: sectionsError,
  refresh: refreshSections,
} = usePageSections('freshness-promise')

const processSection = sectionByKey('process')
const guaranteeSection = sectionByKey('guarantee')
const standardsSection = sectionByKey('standards')
const trustSection = sectionByKey('trust')

const pageH1 = computed(() => {
  if (!isPublishedCms.value || !seo.value) return null
  return seo.value.h1
})

const badgeText = computed(() => {
  const fromSection = processSection.value?.badge_text?.trim()
  if (fromSection) return fromSection.toUpperCase()
  return 'НАШЕ ОБЯЗАТЕЛЬСТВО'
})

const bodyHtml = computed(() => cmsTextToHtml(seoText.value))

const showProcess = computed(() => !!processSection.value)
const processTitle = computed(() => processSection.value?.title || '')
const processIntro = computed(() => processSection.value?.subtitle || '')
const processSteps = computed<ProcessStep[]>(() => {
  const raw = processSection.value?.content as { steps?: Array<Partial<ProcessStep>> } | null
  if (!Array.isArray(raw?.steps)) return []
  return raw.steps
    .map((step) => ({
      step: String(step?.step || ''),
      title: String(step?.title || ''),
      description: String(step?.description || ''),
    }))
    .filter((step) => step.title || step.description)
})

const showGuarantee = computed(() => {
  const s = guaranteeSection.value
  return !!(s && (s.title || s.subtitle))
})
const guaranteeTitle = computed(() => guaranteeSection.value?.title || '')
const guaranteeText = computed(() => guaranteeSection.value?.subtitle || '')

const showStandards = computed(() => !!standardsSection.value)
const standardsTitle = computed(() => standardsSection.value?.title || '')
const standardsIntro = computed(() => standardsSection.value?.subtitle || '')
const standardCards = computed<StandardCard[]>(() => {
  const raw = standardsSection.value?.content as { cards?: Array<Partial<StandardCard>> } | null
  if (!Array.isArray(raw?.cards)) return []
  return raw.cards
    .map((card) => ({
      icon: String(card?.icon || ''),
      title: String(card?.title || ''),
      text: String(card?.text || ''),
    }))
    .filter((card) => card.title || card.text)
})

const showTrust = computed(() => !!trustSection.value)
const trustTitle = computed(() => trustSection.value?.title || '')
const trustText = computed(() => trustSection.value?.subtitle || '')
const trustContent = computed(() => {
  return (trustSection.value?.content || {}) as {
    image?: string
    image_alt?: string
    caption?: string
  }
})
const config = useRuntimeConfig()
const trustImage = computed(() => {
  const raw = trustContent.value.image || '/images/hygiene/disinfection.jpg'
  return resolveMediaUrl(raw, config.public.apiBase as string)
})
const trustImageAlt = computed(() => trustContent.value.image_alt || 'Обработка игрушки Alpha')
const trustCaption = computed(() => trustContent.value.caption || '')

const reload = async () => {
  await Promise.all([refreshSeo(), refreshSections()])
}
</script>

<style scoped>
.fresh-page {
  min-height: 100vh;
  background: #FAF8F4;
  font-family: 'Manrope', sans-serif;
}

.container {
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 24px;
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
  color: var(--green-ink, #3F6757);
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
  color: var(--green-ink, #3F6757);
  font-weight: 700;
  cursor: pointer;
}

.fresh-hero {
  padding: 48px 0 40px;
  background:
    radial-gradient(ellipse 80% 60% at 20% 0%, rgba(217, 224, 213, 0.55), transparent 60%),
    radial-gradient(ellipse 70% 50% at 90% 20%, rgba(63, 103, 87, 0.08), transparent 55%),
    #FAF8F4;
}

.fresh-hero__inner {
  max-width: 760px;
  text-align: center;
}

.fresh-hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 18px;
  padding: 8px 16px;
  border-radius: 999px;
  background: #D9E0D5;
  color: var(--green-ink, #3F6757);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.fresh-hero__title {
  margin: 0 0 16px;
  color: #262626;
  font-size: clamp(28px, 4.5vw, 42px);
  font-weight: 800;
  line-height: 1.15;
}

.fresh-hero__lead {
  margin: 0;
  color: #6F746F;
  font-size: 17px;
  line-height: 1.65;
}

.fresh-hero__lead :deep(p) {
  margin: 0 0 12px;
}

.fresh-hero__lead :deep(p:last-child) {
  margin-bottom: 0;
}

.fresh-process {
  padding: 24px 0 56px;
}

.fresh-process__header {
  max-width: 720px;
  margin: 0 auto 36px;
  text-align: center;
}

.fresh-process__title {
  margin: 0 0 12px;
  color: #262626;
  font-size: clamp(24px, 3.2vw, 32px);
  font-weight: 800;
  line-height: 1.25;
}

.fresh-process__intro {
  margin: 0;
  color: #6F746F;
  font-size: 16px;
  line-height: 1.6;
}

.fresh-steps {
  display: grid;
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.fresh-steps__item {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: 18px;
  align-items: start;
  padding: 22px 24px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.02);
}

.fresh-steps__num {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: #D9E0D5;
  color: var(--green-ink, #3F6757);
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.fresh-steps__body h3 {
  margin: 4px 0 6px;
  color: #262626;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.25;
}

.fresh-steps__body p {
  margin: 0;
  color: #6F746F;
  font-size: 15px;
  line-height: 1.55;
}

.fresh-guarantee {
  padding: 0 0 48px;
}

.fresh-guarantee__card {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 18px;
  align-items: start;
  padding: 28px 32px;
  border-radius: 24px;
  background: linear-gradient(135deg, #E8EFE6 0%, #F4F7F2 100%);
  border: 1px solid rgba(63, 103, 87, 0.12);
}

.fresh-guarantee__icon {
  color: var(--green-ink, #3F6757);
  margin-top: 2px;
}

.fresh-guarantee__card h2 {
  margin: 0 0 8px;
  color: #262626;
  font-size: 22px;
  font-weight: 800;
}

.fresh-guarantee__card p {
  margin: 0;
  color: #4A524C;
  font-size: 15.5px;
  line-height: 1.6;
}

.fresh-standards {
  padding: 8px 0 56px;
}

.fresh-standards__header {
  max-width: 680px;
  margin: 0 auto 32px;
  text-align: center;
}

.fresh-standards__header h2 {
  margin: 0 0 10px;
  color: #262626;
  font-size: clamp(24px, 3vw, 30px);
  font-weight: 800;
}

.fresh-standards__header p {
  margin: 0;
  color: #6F746F;
  font-size: 16px;
  line-height: 1.6;
}

.fresh-standards__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.fresh-standards__card {
  padding: 24px 20px;
  border-radius: 20px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.02);
  text-align: center;
}

.fresh-standards__icon {
  display: inline-flex;
  margin-bottom: 12px;
  color: var(--green-ink, #3F6757);
}

.fresh-standards__card h3 {
  margin: 0 0 6px;
  color: #262626;
  font-size: 18px;
  font-weight: 800;
}

.fresh-standards__card p {
  margin: 0;
  color: #6F746F;
  font-size: 13.5px;
  line-height: 1.45;
}

.fresh-trust {
  padding: 0 0 80px;
}

.fresh-trust__inner {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: clamp(28px, 5vw, 56px);
  align-items: center;
}

.fresh-trust__visual {
  position: relative;
  margin: 0;
  aspect-ratio: 4 / 3;
}

.fresh-trust__visual::before {
  position: absolute;
  inset: 16px -16px -16px 16px;
  z-index: 0;
  border-radius: 24px;
  background: #D9E0D5;
  content: '';
}

.fresh-trust__visual img {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 24px;
  box-shadow: 0 20px 48px rgba(51, 61, 54, 0.16);
}

.fresh-trust__visual figcaption {
  position: absolute;
  right: 18px;
  bottom: 18px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(250, 248, 244, 0.92);
  border: 1px solid rgba(63, 103, 87, 0.15);
  color: var(--green-ink, #3F6757);
  font-size: 12px;
  font-weight: 800;
  backdrop-filter: blur(8px);
}

.fresh-trust__visual figcaption span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #7BA88A;
}

.fresh-trust__copy h2 {
  margin: 0 0 14px;
  color: #262626;
  font-size: clamp(26px, 3.4vw, 34px);
  font-weight: 800;
  line-height: 1.2;
}

.fresh-trust__copy p {
  margin: 0 0 24px;
  color: #6F746F;
  font-size: 16px;
  line-height: 1.65;
}

.fresh-trust__cta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.cta-btn {
  padding: 12px 24px;
  border-radius: 14px;
  font-weight: 700;
  text-decoration: none;
  font-size: 14px;
}

.cta-btn.primary {
  background: var(--green-surface, #3F6757);
  color: var(--green-ink, #FAF8F4);
}

.cta-btn.secondary {
  background: #D9E0D5;
  color: var(--green-ink, #3F6757);
}

@media (max-width: 900px) {
  .fresh-standards__grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .fresh-trust__inner {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .fresh-hero {
    padding: 32px 0 28px;
  }

  .fresh-steps__item {
    grid-template-columns: 52px minmax(0, 1fr);
    gap: 14px;
    padding: 18px 16px;
  }

  .fresh-steps__num {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    font-size: 15px;
  }

  .fresh-guarantee__card {
    grid-template-columns: 1fr;
    padding: 22px 20px;
  }

  .fresh-standards__grid {
    grid-template-columns: 1fr;
  }

  .fresh-trust {
    padding-bottom: 64px;
  }

  .fresh-trust__visual::before {
    inset: 10px -8px -10px 10px;
  }
}
</style>
