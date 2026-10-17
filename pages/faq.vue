<template>
  <div class="faq-page">
    <TheHeader />

    <main v-if="pageBlocked" class="container page-content">
      <FeatureUnavailable
        :title="cmsUnpublished ? 'FAQ временно недоступен' : 'FAQ временно скрыт'"
        :description="cmsUnpublished
          ? 'Страница FAQ отключена в разделе «Страницы» админки.'
          : 'Раздел частых вопросов сейчас недоступен. Напишите в поддержку, если нужна помощь.'"
      />
    </main>

    <main v-else class="container page-content">
      <section class="faq-hero">
        <h1 class="faq-title">{{ pageH1 }}</h1>
        <div
          v-if="hasCmsText(seoText)"
          class="faq-subtitle"
          v-html="bodyHtml"
        />
        <p v-else class="faq-subtitle">
          Ответы о подписке, аренде, доставке, оплате и дезинфекции игрушек.
        </p>
      </section>

      <div ref="toolbarRef" class="faq-toolbar">
        <div class="faq-search-box">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3F6757" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7"></circle>
            <line x1="21" y1="21" x2="16.5" y2="16.5"></line>
          </svg>
          <input
            v-model="searchQuery"
            type="search"
            inputmode="search"
            enterkeyhint="search"
            placeholder="Найти вопрос"
            aria-label="Поиск по вопросам"
            class="faq-search-input"
            @keydown.enter="($event.target as HTMLInputElement).blur()"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="clear-search-btn"
            aria-label="Очистить поиск"
            @click="searchQuery = ''"
          >&times;</button>
        </div>

        <div
          v-if="!isLoading && !loadError && (allFaqs?.length ?? 0)"
          class="faq-categories-row"
          role="tablist"
          aria-label="Категории вопросов"
        >
          <button
            v-for="cat in categories"
            :key="cat.id"
            type="button"
            role="tab"
            class="cat-pill-btn"
            :class="{ active: activeCategory === cat.id }"
            :aria-selected="activeCategory === cat.id"
            @click="selectCategory(cat.id, $event)"
          >
            <AppIcon :name="cat.icon" :size="16" class="cat-pill-icon" />
            <span>{{ cat.name }}</span>
            <span class="cat-pill-count">{{ categoryCounts[cat.id] ?? 0 }}</span>
          </button>
        </div>
      </div>

      <section ref="listRef" class="faq-list-section">
        <div v-if="isLoading" class="empty-faq-box">
          <AppIcon name="refresh" :size="40" class="empty-icon spin-icon" />
          <h3>Загружаем вопросы…</h3>
        </div>

        <div v-else-if="loadError" class="empty-faq-box">
          <AppIcon name="alert" :size="40" class="empty-icon" />
          <h3>Не удалось загрузить FAQ</h3>
          <p>Проверьте соединение и попробуйте ещё раз.</p>
          <button type="button" class="reset-btn" @click="loadFaqs">Повторить</button>
        </div>

        <template v-else-if="filteredFaqs.length > 0">
          <p v-if="searchQuery.trim()" class="faq-results-count">
            Найдено вопросов: {{ filteredFaqs.length }}
          </p>

          <section
            v-for="group in groupedFaqs"
            :key="group.id"
            class="faq-group"
          >
            <h2 v-if="activeCategory === 'all'" class="faq-group-title">
              <span class="faq-group-icon"><AppIcon :name="group.icon" :size="18" /></span>
              <span>{{ group.name }}</span>
            </h2>

            <div class="faq-group-list">
              <div
                v-for="item in group.items"
                :key="item.id"
                :ref="el => setItemRef(item.id, el)"
                class="faq-item"
                :class="{ open: openId === item.id }"
              >
                <h3 class="faq-question-heading">
                  <button
                    :id="`faq-q-${item.id}`"
                    type="button"
                    class="faq-question-btn"
                    :aria-expanded="openId === item.id"
                    :aria-controls="`faq-a-${item.id}`"
                    @click="toggleFaq(item.id)"
                  >
                    <span class="q-text">{{ item.question }}</span>
                    <span class="faq-chevron" aria-hidden="true">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </span>
                  </button>
                </h3>
                <div
                  v-show="openId === item.id"
                  :id="`faq-a-${item.id}`"
                  class="faq-answer-body"
                  role="region"
                  :aria-labelledby="`faq-q-${item.id}`"
                >
                  <p>{{ item.answer }}</p>
                </div>
              </div>
            </div>
          </section>
        </template>

        <div v-else class="empty-faq-box">
          <AppIcon name="search" :size="40" class="empty-icon" />
          <h3 v-if="searchQuery || activeCategory !== 'all'">
            Вопросов по запросу не найдено
          </h3>
          <h3 v-else>Пока нет вопросов</h3>
          <p v-if="searchQuery || activeCategory !== 'all'">
            Попробуйте изменить формулировку или сбросить фильтр.
          </p>
          <p v-else>
            FAQ появится здесь, как только вопросы добавят в админке.
          </p>
          <button
            v-if="searchQuery || activeCategory !== 'all'"
            type="button"
            class="reset-btn"
            @click="resetSearch"
          >
            Показать все вопросы
          </button>
        </div>
      </section>

      <section class="still-questions-banner">
        <div class="cta-left">
          <div class="cta-icon-badge"><AppIcon name="message" :size="26" /></div>
          <div class="cta-text">
            <h3>Не нашли ответ?</h3>
            <p>Напишите нам — служба заботы ответит и поможет подобрать набор для вашего ребёнка.</p>
          </div>
        </div>
        <div class="cta-actions">
          <a :href="whatsappUrl" target="_blank" rel="noopener noreferrer" class="cta-btn whatsapp">
            Написать в WhatsApp
          </a>
        </div>
      </section>
    </main>

    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import type { FaqItem } from '~/composables/useFaq'
import { cmsTextToHtml, hasCmsText } from '~/utils/cmsContent'

const { seo, seoText, isPublishedCms, isUnpublished } = usePageSeo('/faq')
const pageH1 = computed(() => {
  if (isPublishedCms.value && seo.value && seo.value.h1 !== null && seo.value.h1 !== undefined) {
    return seo.value.h1
  }
  return 'Часто задаваемые вопросы'
})
const bodyHtml = computed(() => cmsTextToHtml(seoText.value))
const { isVisible } = useFeatures()
const { whatsappUrl, fetchSettings } = useSiteSettings()
const cmsUnpublished = computed(() => isUnpublished.value)
const featureBlocked = computed(() => !isVisible('faq'))
const pageBlocked = computed(() => featureBlocked.value || cmsUnpublished.value)
const searchQuery = ref('')
const activeCategory = ref('all')
const openId = ref<number | null>(null)

const toolbarRef = ref<HTMLElement | null>(null)
const listRef = ref<HTMLElement | null>(null)
const itemRefs = new Map<number, HTMLElement>()

onMounted(fetchSettings)

const { fetchFaqs, getCategoryLabel, getCategoryAppIcon } = useFaq()

const { cmsLocale } = useCmsLocale()

const {
  data: allFaqs,
  pending: isLoading,
  error: loadErrorRef,
  refresh: loadFaqs,
} = await useAsyncData<FaqItem[]>(
  () => `faqs-${cmsLocale.value}`,
  () => fetchFaqs(),
  { default: () => [], watch: [cmsLocale] },
)

const loadError = computed(() => !!loadErrorRef.value)

const categories = computed(() => {
  const cats = new Set((allFaqs.value ?? []).map(f => f.category))
  const list = [{ id: 'all', name: 'Все', icon: 'sparkles' }]
  for (const cat of cats) {
    list.push({ id: cat, name: getCategoryLabel(cat), icon: getCategoryAppIcon(cat) })
  }
  return list
})

const searchMatchedFaqs = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return allFaqs.value ?? []
  return (allFaqs.value ?? []).filter(item =>
    item.question.toLowerCase().includes(query) ||
    item.answer.toLowerCase().includes(query),
  )
})

const filteredFaqs = computed(() => {
  if (activeCategory.value === 'all') return searchMatchedFaqs.value
  return searchMatchedFaqs.value.filter(item => item.category === activeCategory.value)
})

const groupedFaqs = computed(() => {
  return categories.value
    .filter(cat => cat.id !== 'all')
    .map(cat => ({ ...cat, items: filteredFaqs.value.filter(item => item.category === cat.id) }))
    .filter(group => group.items.length > 0)
})

const categoryCounts = computed(() => {
  const counts: Record<string, number> = { all: searchMatchedFaqs.value.length }
  for (const item of searchMatchedFaqs.value) {
    counts[item.category] = (counts[item.category] ?? 0) + 1
  }
  return counts
})

const setItemRef = (id: number, el: Element | ComponentPublicInstance | null) => {
  if (el instanceof HTMLElement) itemRefs.set(id, el)
  else itemRefs.delete(id)
}

const stickyOffset = () => {
  const headerHeight = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--header-height'),
  ) || 0
  return headerHeight + (toolbarRef.value?.offsetHeight ?? 0) + 8
}

const revealIfHidden = (el: HTMLElement | null | undefined, wholeElement = false) => {
  if (!el) return
  const rect = el.getBoundingClientRect()
  const top = rect.top - stickyOffset()
  if (top < 0 || (wholeElement && rect.bottom > window.innerHeight)) {
    window.scrollBy({ top, behavior: 'smooth' })
  }
}

const selectCategory = (id: string, event: MouseEvent) => {
  activeCategory.value = id
  openId.value = null
  ;(event.currentTarget as HTMLElement | null)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  nextTick(() => revealIfHidden(listRef.value))
}

const toggleFaq = (id: number) => {
  openId.value = openId.value === id ? null : id
  if (openId.value !== null) {
    nextTick(() => revealIfHidden(itemRefs.get(id), true))
  }
}

const resetSearch = () => {
  searchQuery.value = ''
  activeCategory.value = 'all'
}
</script>

<style scoped>
.faq-page {
  min-height: 100vh;
  background-color: #FAF8F4;
  color: #262626;
  font-family: var(--font-body);
  padding-bottom: 90px;
}

.container {
  width: 100%;
  max-width: 860px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-content {
  padding-top: 36px;
}

/* Hero */
.faq-hero {
  text-align: center;
  margin: 0 auto 24px;
}

.faq-title {
  font-weight: 700;
  font-size: 44px;
  line-height: 1.08;
  color: #262626;
  margin-bottom: 12px;
}

.faq-subtitle {
  font-size: 16px;
  color: #6F746F;
  line-height: 1.6;
}

.faq-subtitle :deep(p) {
  margin: 0 0 12px;
}

.faq-subtitle :deep(p:last-child) {
  margin-bottom: 0;
}

/* Sticky toolbar: search + categories */
.faq-toolbar {
  position: sticky;
  top: var(--header-height, 78px);
  z-index: 20;
  margin: 0 -24px 24px;
  padding: 12px 24px 4px;
  background: #FAF8F4;
}

.faq-search-box {
  display: flex;
  align-items: center;
  min-height: 52px;
  padding: 6px 8px 6px 18px;
  background: #FFFFFF;
  border: 1.5px solid #E3D7C6;
  border-radius: 999px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.faq-search-box:focus-within {
  border-color: var(--green-ink);
  box-shadow: 0 6px 24px rgba(51, 61, 54, 0.12);
}

.search-icon {
  margin-right: 12px;
  flex-shrink: 0;
}

/* 16px+ prevents iOS Safari from zooming the page on input focus */
.faq-search-input {
  flex: 1;
  min-width: 0;
  min-height: 36px;
  border: none;
  background: transparent;
  outline: none;
  font-size: 16px;
  font-family: var(--font-body);
  color: #262626;
  -webkit-appearance: none;
  appearance: none;
}

.faq-search-input::placeholder {
  color: #8A8F8B;
}

.faq-search-input::-webkit-search-cancel-button {
  display: none;
}

.clear-search-btn {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  margin-left: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #F4F1EA;
  color: #5D625F;
  font-size: 22px;
  line-height: 1;
}

.faq-categories-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 0 8px;
}

.faq-categories-row::-webkit-scrollbar {
  display: none;
}

.cat-pill-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 6px 12px 6px 14px;
  background: #FFFFFF;
  border: 1px solid #E6DFD4;
  border-radius: 999px;
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 14px;
  color: #5D625F;
  white-space: nowrap;
  transition: border-color 0.2s ease, color 0.2s ease, background-color 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.cat-pill-btn:hover {
  border-color: var(--green-ink);
  color: var(--green-ink);
}

.cat-pill-btn.active {
  background: var(--green-ink);
  border-color: var(--green-ink);
  color: #FAF8F4;
}

.cat-pill-count {
  min-width: 22px;
  padding: 1px 7px;
  border-radius: 999px;
  background: #F4F1EA;
  color: #6F746F;
  font-size: 12px;
  font-weight: 700;
  line-height: 18px;
  text-align: center;
}

.cat-pill-btn.active .cat-pill-count {
  background: rgba(250, 248, 244, 0.2);
  color: #FAF8F4;
}

/* List */
.faq-list-section {
  margin-bottom: 48px;
}

.faq-results-count {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #6F746F;
}

.faq-group + .faq-group {
  margin-top: 28px;
}

.faq-group-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 12px;
  font-size: 26px;
  line-height: 1.1;
  color: #262626;
}

.faq-group-icon {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #D9E0D5;
  color: var(--green-ink);
  flex-shrink: 0;
}

.faq-group-list {
  background: #FFFFFF;
  border: 1px solid rgba(51, 61, 54, 0.1);
  border-radius: 20px;
  overflow: hidden;
}

.faq-item + .faq-item {
  border-top: 1px solid rgba(51, 61, 54, 0.08);
}

.faq-question-heading {
  margin: 0;
  font-size: inherit;
  line-height: inherit;
  text-wrap: wrap;
}

.faq-question-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 64px;
  padding: 18px 22px;
  background: none;
  text-align: left;
  font-family: var(--font-body);
  -webkit-tap-highlight-color: transparent;
  transition: background-color 0.15s ease;
}

.faq-question-btn:hover {
  background: #FBFAF7;
}

.faq-question-btn:focus-visible {
  outline: 3px solid rgba(63, 103, 87, 0.32);
  outline-offset: -3px;
}

.q-text {
  flex: 1;
  min-width: 0;
  font-weight: 700;
  font-size: 17px;
  line-height: 1.4;
  letter-spacing: -0.01em;
  color: #262626;
  text-wrap: pretty;
  overflow-wrap: anywhere;
}

.faq-item.open .q-text {
  color: var(--green-ink);
}

.faq-chevron {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 50%;
  background: #F4F1EA;
  color: #262626;
  transition: transform 0.25s ease, background-color 0.2s ease, color 0.2s ease;
}

.faq-item.open .faq-chevron {
  transform: rotate(180deg);
  background: var(--green-ink);
  color: #FAF8F4;
}

.faq-answer-body {
  padding: 0 22px 20px;
  font-size: 16px;
  line-height: 1.65;
  color: #4A4F4B;
}

.faq-answer-body p {
  white-space: pre-line;
  overflow-wrap: anywhere;
}

/* Empty State */
.empty-faq-box {
  background: #FFFFFF;
  border-radius: 20px;
  padding: 48px 24px;
  text-align: center;
  border: 1px solid rgba(51, 61, 54, 0.1);
}

.empty-icon {
  display: block;
  margin: 0 auto 12px;
}

.spin-icon {
  animation: faq-spin 1s linear infinite;
}

@keyframes faq-spin {
  to { transform: rotate(360deg); }
}

.reset-btn {
  margin-top: 16px;
  min-height: 44px;
  padding: 10px 24px;
  border-radius: 12px;
  background: var(--green-surface);
  color: var(--green-ink);
  font-weight: 700;
}

/* CTA */
.still-questions-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 28px 32px;
  background: #FFFFFF;
  border: 1px solid rgba(51, 61, 54, 0.1);
  border-radius: 24px;
}

.cta-left {
  display: flex;
  align-items: center;
  gap: 18px;
}

.cta-icon-badge {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 16px;
  background: #D9E0D5;
  color: var(--green-ink);
}

.cta-text h3 {
  font-size: 24px;
  margin-bottom: 6px;
}

.cta-text p {
  font-size: 15px;
  line-height: 1.5;
  color: #5D625F;
}

.cta-actions {
  flex-shrink: 0;
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 12px 22px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 15px;
  white-space: nowrap;
  transition: background-color 0.2s ease;
}

.cta-btn.whatsapp {
  background: var(--green-ink);
  color: #FAF8F4;
}

.cta-btn.whatsapp:hover {
  background: #2f4535;
}

@media (max-width: 640px) {
  .faq-page {
    padding-bottom: 48px;
  }

  .container {
    padding: 0 16px;
  }

  .page-content {
    padding-top: 20px;
  }

  .faq-hero {
    text-align: left;
    margin-bottom: 8px;
  }

  .faq-title {
    font-size: 32px;
    margin-bottom: 6px;
  }

  .faq-subtitle {
    font-size: 15px;
    line-height: 1.5;
  }

  .faq-toolbar {
    margin: 0 -16px 16px;
    padding: 10px 16px 2px;
    box-shadow: 0 8px 12px -12px rgba(38, 38, 38, 0.25);
  }

  .faq-search-box {
    min-height: 48px;
    padding: 4px 6px 4px 14px;
  }

  .faq-categories-row {
    flex-wrap: nowrap;
    overflow-x: auto;
    margin: 0 -16px;
    padding: 10px 16px 8px;
    scroll-padding: 0 16px;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }

  .faq-group + .faq-group {
    margin-top: 24px;
  }

  .faq-group-title {
    font-size: 24px;
    margin-bottom: 10px;
  }

  .faq-group-list {
    border-radius: 16px;
  }

  .faq-question-btn {
    min-height: 56px;
    padding: 15px 14px 15px 16px;
    gap: 12px;
  }

  .q-text {
    font-size: 16px;
  }

  .faq-chevron {
    width: 28px;
    height: 28px;
  }

  .faq-answer-body {
    padding: 0 16px 18px;
    font-size: 15.5px;
  }

  .still-questions-banner {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    padding: 20px 16px;
    border-radius: 18px;
  }

  .cta-left {
    align-items: flex-start;
    gap: 14px;
  }

  .cta-icon-badge {
    width: 44px;
    height: 44px;
    border-radius: 14px;
  }

  .cta-text h3 {
    font-size: 22px;
  }

  .cta-btn {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .faq-chevron,
  .faq-question-btn,
  .cat-pill-btn {
    transition: none;
  }
}
</style>
