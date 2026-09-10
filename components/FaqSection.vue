<template>
  <div v-if="isLoading || loadError || faqItems.length" class="faq-wrapper">
    <section class="faq-section container">
      <div class="section-heading">
        <div class="badge">вопросы и ответы</div>
        <h2 class="title">Остались вопросы?</h2>
        <p class="subtitle">Мы собрали ответы на самые частые вопросы родителей о безопасности и условиях подписки.</p>
      </div>

      <div v-if="isLoading" class="faq-list faq-list--status">
        <p class="faq-status">Загружаем вопросы…</p>
      </div>

      <div v-else-if="loadError" class="faq-list faq-list--status">
        <p class="faq-status">Не удалось загрузить FAQ</p>
      </div>

      <div v-else class="faq-list">
        <article
          v-for="(item, index) in faqItems"
          :key="item.id"
          class="faq-item"
          :class="{ 'faq-item--open': openIndex === index }"
        >
          <button
            :id="`faq-button-${index}`"
            class="faq-header"
            type="button"
            :aria-expanded="openIndex === index"
            :aria-controls="`faq-answer-${index}`"
            @click="toggleFaq(index)"
          >
            <span class="faq-question">{{ item.question }}</span>
            <span class="plus-icon" aria-hidden="true"></span>
          </button>

          <div
            :id="`faq-answer-${index}`"
            class="faq-answer"
            role="region"
            :aria-labelledby="`faq-button-${index}`"
            :aria-hidden="openIndex !== index"
          >
            <div class="faq-answer__inner">
              <p class="faq-body">{{ item.answer }}</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FaqItem } from '~/composables/useFaq'

const { fetchFaqs } = useFaq()

const {
  data: allFaqs,
  pending: isLoading,
  error: loadErrorRef,
} = await useAsyncData<FaqItem[]>(
  'faqs',
  () => fetchFaqs(),
  { default: () => [] },
)

const loadError = computed(() => !!loadErrorRef.value)
const faqItems = computed(() => (allFaqs.value ?? []).slice(0, 3))
const openIndex = ref<number | null>(0)

const toggleFaq = (index: number) => {
  openIndex.value = openIndex.value === index ? null : index
}
</script>

<style scoped>
.faq-wrapper {
  width: 100%;
  background: #F4F1EA;
}

.faq-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px;
  gap: 56px;
  background: transparent;
}

.section-heading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.badge {
  padding: 6px 16px;
  background: #D9E0D5;
  border-radius: 8px;
  font-weight: 700;
  font-size: 12px;
  color: var(--color-primary);
  text-transform: uppercase;
}

.title {
  font-size: 40px;
  font-weight: 700;
}

.subtitle {
  font-size: 18px;
  color: var(--text-muted);
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 800px;
}

.faq-list--status {
  align-items: center;
}

.faq-status {
  margin: 0;
  font-size: 15px;
  color: #6F746F;
  text-align: center;
}

.faq-item {
  padding: 24px;
  background: var(--text-white);
  border: 1px solid rgba(51, 61, 54, 0.12);
  box-shadow: none;
  border-radius: 12px;
  transition: border-color 180ms ease, box-shadow 180ms ease;
}

.faq-item--open {
  border-color: rgba(63, 103, 87, 0.3);
  box-shadow: var(--shadow-sm);
}

.faq-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--text-dark);
  text-align: left;
  cursor: pointer;
}

.faq-question {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.25;
}

.faq-header:focus-visible {
  outline: 3px solid rgba(63, 103, 87, 0.32);
  outline-offset: 8px;
  border-radius: 4px;
}

.plus-icon {
  flex: 0 0 auto;
  width: 20px;
  height: 20px;
  position: relative;
}

.plus-icon::before, .plus-icon::after {
  content: '';
  position: absolute;
  background: var(--color-primary);
  transition: transform 180ms ease, opacity 180ms ease;
}
.plus-icon::before {
  top: 9px; left: 0; width: 20px; height: 2px;
}
.plus-icon::after {
  left: 9px; top: 0; width: 2px; height: 20px;
}

.faq-header[aria-expanded='true'] .plus-icon::after {
  opacity: 0;
  transform: rotate(90deg);
}

.faq-answer {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition: grid-template-rows 240ms ease, opacity 180ms ease;
}

.faq-answer[aria-hidden='false'] {
  grid-template-rows: 1fr;
  opacity: 1;
}

.faq-answer__inner {
  overflow: hidden;
}

.faq-body {
  padding-top: 12px;
  font-size: 15px;
  line-height: 1.5;
  color: var(--text-muted);
}

/* Mobile Responsive */
@media (max-width: 960px) {
  .faq-section {
    padding: 36px 24px;
    gap: 40px;
  }

  .title {
    font-size: 32px;
  }
}

@media (max-width: 640px) {
  .faq-section {
    padding: 32px 16px;
    gap: 28px;
  }

  .title {
    font-size: 26px;
  }

  .subtitle {
    font-size: 14.5px;
  }

  .faq-item {
    padding: 20px 16px;
    border-radius: 14px;
  }

  .faq-question {
    font-size: 16px;
  }

  .faq-body {
    font-size: 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .faq-item,
  .plus-icon::before,
  .plus-icon::after,
  .faq-answer {
    transition: none;
  }
}
</style>
