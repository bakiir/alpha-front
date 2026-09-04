<template>
  <div class="faq-page">
    <TheHeader />

    <main class="container page-content">
      <!-- Hero -->
      <section class="faq-hero">
        <h1 class="faq-title">Часто задаваемые вопросы</h1>
        <p class="faq-subtitle">
          Всё, что вам нужно знать о сервисе обмена эко-игрушками, дезинфекции, доставке и управлении подпиской.
        </p>

        <!-- Live Search Bar -->
        <div class="faq-search-box">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3F6757" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7"></circle>
            <line x1="21" y1="21" x2="16.5" y2="16.5"></line>
          </svg>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Поиск по вопросам (например, дезинфекция, поломка, обмен, заморозка)..." 
            class="faq-search-input"
          />
          <button v-if="searchQuery" class="clear-search-btn" @click="searchQuery = ''">&times;</button>
        </div>
      </section>

      <!-- Category Filter Pills -->
      <div class="faq-categories-row">
        <button 
          v-for="cat in categories" 
          :key="cat.id"
          class="cat-pill-btn"
          :class="{ active: activeCategory === cat.id }"
          @click="activeCategory = cat.id"
        >
          <AppIcon :name="cat.icon" :size="16" class="cat-pill-icon" />
          <span>{{ cat.name }}</span>
        </button>
      </div>

      <!-- FAQ Accordions List -->
      <section class="faq-accordion-section">
        <div v-if="filteredFaqs.length > 0" class="faq-accordion-list">
          <div 
            v-for="(item, idx) in filteredFaqs" 
            :key="idx" 
            class="faq-card"
            :class="{ open: openItems.includes(item.id) }"
          >
            <button class="faq-question-btn" @click="toggleFaq(item.id)">
              <div class="question-title-wrap">
                <span class="q-cat-tag">{{ getCategoryName(item.category) }}</span>
                <h3 class="q-text">{{ item.question }}</h3>
              </div>
              <div class="faq-icon-circle">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="chevron">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </button>
            <div v-show="openItems.includes(item.id)" class="faq-answer-body">
              <p>{{ item.answer }}</p>
            </div>
          </div>
        </div>

        <div v-else class="empty-faq-box">
          <AppIcon name="search" :size="40" class="empty-icon" />
          <h3>Вопросов по запросу «{{ searchQuery }}» не найдено</h3>
          <p>Попробуйте изменить формулировку или задайте вопрос нашему методисту в чате.</p>
          <button class="reset-btn" @click="resetSearch">Показать все вопросы</button>
        </div>
      </section>

      <!-- Still Have Questions CTA Banner (Like Kiddos) -->
      <section class="still-questions-banner">
        <div class="cta-left">
          <div class="cta-icon-badge"><AppIcon name="message" :size="28" /></div>
          <div class="cta-text">
            <h3>Остались вопросы или нужна консультация?</h3>
            <p>Наш ведущий методист и служба заботы всегда рады помочь подобрать идеальный набор для вашего ребенка.</p>
          </div>
        </div>
        <div class="cta-actions">
          <NuxtLink to="/support" class="cta-btn primary">
            Написать методисту в чат →
          </NuxtLink>
          <a href="https://wa.me/77071234567" target="_blank" class="cta-btn whatsapp">
            WhatsApp онлайн
          </a>
        </div>
      </section>
    </main>

    <!-- TheFooter -->
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { FaqItem } from '~/composables/useFaq'

const searchQuery = ref('')
const activeCategory = ref('all')
const openItems = ref<number[]>([])
const isLoading = ref(true)

const { fetchFaqs, getCategoryLabel } = useFaq()

const fallbackFaqs: FaqItem[] = [
  { id: 1, category: 'how', question: 'Что такое сервис Alpha и как работает подписка на игрушки?', answer: 'Alpha — это сервис регулярного обмена развивающими эко-игрушками Монтессори. Вы оформляете подписку и получаете коробку с качественными деревянными игрушками на 1 месяц.' },
  { id: 4, category: 'hygiene', question: 'Как проходит процесс дезинфекции и очистки игрушек?', answer: 'Все игрушки проходят 4-ступенчатый протокол: очистка, пар (140°C), озонирование и упаковка в стерильный мешочек.' },
  { id: 6, category: 'pricing', question: 'Как оплачивается подписка и есть ли скрытые платежи?', answer: 'Оплата происходит автоматически раз в месяц (или за 3/6/12 месяцев со скидкой). В стоимость включены игрушки, доставка и дезинфекция.' },
  { id: 10, category: 'manage', question: 'Можно ли заморозить или отменить подписку?', answer: 'Да, подписку можно заморозить от 1 до 30 дней или отменить до даты следующего списания.' },
]

const allFaqs = ref<FaqItem[]>([])

const categories = computed(() => {
  const cats = new Set(allFaqs.value.map(f => f.category))
  const list = [{ id: 'all', name: 'Все вопросы', icon: 'sparkles' }]
  const icons: Record<string, string> = { how: 'how-it-works', pricing: 'credit-card', hygiene: 'sparkles', delivery: 'truck', manage: 'settings' }
  for (const cat of cats) {
    list.push({ id: cat, name: getCategoryLabel(cat), icon: icons[cat] || 'pin' })
  }
  return list
})

onMounted(async () => {
  try {
    const items = await fetchFaqs()
    allFaqs.value = items.length ? items : fallbackFaqs
    if (allFaqs.value.length) openItems.value = [allFaqs.value[0].id]
  } catch {
    allFaqs.value = fallbackFaqs
    openItems.value = [1]
  } finally {
    isLoading.value = false
  }
})

const filteredFaqs = computed(() => {
  return allFaqs.value.filter(item => {
    const matchesCat = activeCategory.value === 'all' || item.category === activeCategory.value
    const query = searchQuery.value.toLowerCase().trim()
    const matchesSearch = !query ||
      item.question.toLowerCase().includes(query) ||
      item.answer.toLowerCase().includes(query)
    return matchesCat && matchesSearch
  })
})

const toggleFaq = (id: number) => {
  if (openItems.value.includes(id)) {
    openItems.value = openItems.value.filter(i => i !== id)
  } else {
    openItems.value.push(id)
  }
}

const getCategoryName = (catId: string) => getCategoryLabel(catId)

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
  font-family: 'Manrope', sans-serif;
  padding-bottom: 90px;
}

.container {
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-content {
  padding-top: 36px;
}

/* Hero */
.faq-hero {
  text-align: center;
  max-width: 760px;
  margin: 0 auto 36px auto;
}

.faq-badge {
  display: inline-block;
  background: #D9E0D5;
  color: #3F6757;
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 12px;
  letter-spacing: 1.2px;
  padding: 6px 16px;
  border-radius: 20px;
  margin-bottom: 16px;
}

.faq-title {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 40px;
  color: #262626;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

.faq-subtitle {
  font-size: 16px;
  color: #6F746F;
  line-height: 1.6;
  margin-bottom: 28px;
}

/* Search Box */
.faq-search-box {
  position: relative;
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  background: #FAF8F4;
  border: 1.5px solid #E3D7C6;
  border-radius: 50px;
  padding: 8px 20px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
}

.faq-search-box:focus-within {
  border-color: #3F6757;
  box-shadow: 0 6px 24px rgba(51, 61, 54, 0.15);
}

.search-icon {
  margin-right: 12px;
  flex-shrink: 0;
}

.faq-search-input {
  width: 100%;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14.5px;
  font-family: 'Manrope', sans-serif;
  color: #262626;
}

.clear-search-btn {
  background: #F4F1EA;
  border: none;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5D625F;
}

/* Categories Row */
.faq-categories-row {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 36px;
}

.cat-pill-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #FAF8F4;
  border: 1px solid #E6DFD4;
  padding: 8px 18px;
  border-radius: 50px;
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 13.5px;
  color: #6F746F;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.01);
}

.cat-pill-btn:hover {
  border-color: #3F6757;
  color: #3F6757;
}

.cat-pill-btn.active {
  background: #3F6757;
  border-color: #3F6757;
  color: #FAF8F4;
  box-shadow: 0 4px 14px rgba(51, 61, 54, 0.25);
}

/* Accordion List */
.faq-accordion-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 56px;
}

.faq-card {
  background: #FAF8F4;
  border-radius: 22px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 3px 14px rgba(0, 0, 0, 0.015);
  overflow: hidden;
  transition: all 0.2s ease;
}

.faq-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.03);
}

.faq-card.open {
  border-color: rgba(51, 61, 54, 0.3);
  box-shadow: 0 8px 28px rgba(51, 61, 54, 0.06);
}

.faq-question-btn {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px 28px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
}

.question-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 16px;
}

.q-cat-tag {
  font-size: 11px;
  font-weight: 800;
  color: #3F6757;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.q-text {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 17px;
  color: #262626;
  line-height: 1.35;
}

.faq-icon-circle {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #F4F1EA;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #262626;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.chevron {
  transition: transform 0.25s ease;
}

.faq-card.open .chevron {
  transform: rotate(180deg);
}

.faq-card.open .faq-icon-circle {
  background: #3F6757;
  color: #FAF8F4;
}

.faq-answer-body {
  padding: 0 28px 24px 28px;
  font-size: 14.5px;
  color: #6F746F;
  line-height: 1.6;
}

/* Empty State */
.empty-faq-box {
  background: #FAF8F4;
  border-radius: 24px;
  padding: 56px 24px;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.04);
  margin-bottom: 56px;
}

.empty-icon {
  font-size: 40px;
  display: block;
  margin-bottom: 12px;
}

.reset-btn {
  margin-top: 16px;
  background: #3F6757;
  color: #FAF8F4;
  font-weight: 700;
  padding: 10px 24px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
}

/* Still Have Questions Banner */
.still-questions-banner {
  background: #FAF8F4;
  border-radius: 28px;
  padding: 36px 40px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.02);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}

.cta-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.cta-icon-badge {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: #D9E0D5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  flex-shrink: 0;
}

.cta-text h3 {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 20px;
  margin-bottom: 4px;
}

.cta-text p {
  font-size: 14px;
  color: #6F746F;
  line-height: 1.45;
}

.cta-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  padding: 12px 22px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.cta-btn.primary {
  background: #3F6757;
  color: #FAF8F4;
  box-shadow: 0 4px 14px rgba(51, 61, 54, 0.25);
}

.cta-btn.primary:hover {
  background: #315145;
}

.cta-btn.whatsapp {
  background: #D9E0D5;
  color: #3F6757;
}

.cta-btn.whatsapp:hover {
  background: #d4f7eb;
}

@media (max-width: 900px) {
  .still-questions-banner {
    flex-direction: column;
    text-align: center;
    padding: 32px 24px;
  }

  .cta-left {
    flex-direction: column;
  }

  .cta-actions {
    flex-direction: column;
    width: 100%;
  }

  .cta-btn {
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .faq-title {
    font-size: 28px;
  }

  .faq-search-box {
    padding: 6px 14px;
  }

  .faq-question-btn {
    padding: 16px 18px;
  }

  .q-text {
    font-size: 15px;
  }

  .faq-answer-body {
    padding: 0 18px 18px 18px;
    font-size: 13.5px;
  }

  .still-questions-banner {
    padding: 24px 16px;
    border-radius: 20px;
  }
}
</style>
