<template>
  <Teleport to="body">
    <Transition name="search-fade">
      <div v-if="isOpen" class="search-overlay" @click.self="close">
        <div class="search-modal">
          <!-- Search Header -->
          <div class="search-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="search-icon">
              <circle cx="11" cy="11" r="7"></circle>
              <line x1="21" y1="21" x2="16.5" y2="16.5"></line>
            </svg>
            <input 
              ref="searchInput"
              v-model="searchQuery" 
              type="text" 
              placeholder="Поиск игрушек, возрастов, навыков или разделов..." 
              class="search-input"
              @keydown.esc="close"
            />
            <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''" aria-label="Очистить">✕</button>
            <button class="close-badge" @click="close">ESC</button>
          </div>

          <!-- Quick Tags -->
          <div class="quick-tags">
            <span class="tags-label">Популярное:</span>
            <button 
              v-for="tag in popularTags" 
              :key="tag" 
              class="tag-btn"
              @click="searchQuery = tag"
            >
              {{ tag }}
            </button>
          </div>

          <!-- Search Results / Catalog -->
          <div class="search-body">
            <div v-if="filteredResults.length > 0" class="results-list">
              <div 
                v-for="item in filteredResults" 
                :key="item.id" 
                class="result-card"
                @click="handleSelect(item)"
              >
                <div class="result-icon">{{ item.icon }}</div>
                <div class="result-info">
                  <div class="result-title-row">
                    <span class="result-title">{{ item.title }}</span>
                    <span class="result-badge">{{ item.category }}</span>
                  </div>
                  <p class="result-desc">{{ item.description }}</p>
                </div>
                <span class="result-arrow">→</span>
              </div>
            </div>

            <div v-else class="empty-state">
              <span class="empty-icon">🔍</span>
              <p>Ничего не найдено по запросу «{{ searchQuery }}»</p>
              <span class="empty-hint">Попробуйте поискать «Монтессори», «Сортер» или «Тарифы»</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const router = useRouter()
const { openQuiz } = useQuiz()

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const searchQuery = ref('')
const searchInput = ref<HTMLInputElement | null>(null)

const popularTags = ['Монтессори', 'Сортер', '0-12 мес', 'Логика', 'Тарифы', 'Доставка']

interface SearchItem {
  id: string
  title: string
  category: string
  description: string
  icon: string
  action: () => void
}

const itemsDatabase: SearchItem[] = [
  {
    id: 'toy-sorter',
    title: 'Деревянный сортер Монтессори',
    category: 'Игрушка • 6–18 мес',
    description: 'Развивает мелкую моторику, координацию и пространственное мышление.',
    icon: '🪵',
    action: () => { openQuiz(); close(); }
  },
  {
    id: 'toy-rainbow',
    title: 'Радуга-балансир из массива бука',
    category: 'Игрушка • 1–4 года',
    description: 'Сенсорное развитие, балансировка и творческое конструирование.',
    icon: '🌈',
    action: () => { openQuiz(); close(); }
  },
  {
    id: 'toy-busyboard',
    title: 'Развивающий мини-бизиборд',
    category: 'Игрушка • 8–24 мес',
    description: 'Шестеренки, замочки и тактильные элементы для исследования.',
    icon: '⚙️',
    action: () => { openQuiz(); close(); }
  },
  {
    id: 'toy-pyramid',
    title: 'Геометрическая пирамидка',
    category: 'Игрушка • 6–18 мес',
    description: 'Изучение цветов, размеров и последовательностей.',
    icon: '🔺',
    action: () => { openQuiz(); close(); }
  },
  {
    id: 'section-pricing',
    title: 'Тарифы и стоимость подписки',
    category: 'Раздел сайта',
    description: 'Starter (3 игрушки), Explorer (5 игрушек), Max (8 игрушек).',
    icon: '💳',
    action: () => { router.push('/#pricing'); close(); }
  },
  {
    id: 'section-how',
    title: 'Как устроена доставка и обмен',
    category: 'Раздел сайта',
    description: 'Бесплатная курьерская доставка каждые 2 месяца и эко-стерилизация.',
    icon: '🚚',
    action: () => { router.push('/#how-it-works'); close(); }
  },
  {
    id: 'section-cabinet',
    title: 'Личный кабинет родителя',
    category: 'Страница',
    description: 'Управление подпиской, профили детей, статус текущего набора.',
    icon: '🧸',
    action: () => { router.push('/cabinet'); close(); }
  },
  {
    id: 'section-quiz',
    title: 'Индивидуальный подбор набора (Квиз)',
    category: 'Сервис',
    description: 'Пройдите быстрый квиз для возраста и интересов вашего ребенка.',
    icon: '✨',
    action: () => { openQuiz(); close(); }
  },
]

const filteredResults = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return itemsDatabase
  return itemsDatabase.filter(item => 
    item.title.toLowerCase().includes(query) ||
    item.category.toLowerCase().includes(query) ||
    item.description.toLowerCase().includes(query)
  )
})

const handleSelect = (item: SearchItem) => {
  item.action()
}

const close = () => {
  isOpen.value = false
  searchQuery.value = ''
}

watch(isOpen, (newVal) => {
  if (newVal) {
    nextTick(() => {
      searchInput.value?.focus()
    })
  }
})
</script>

<style scoped>
.search-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 26, 46, 0.55);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 10000;
  padding: 80px 20px 20px 20px;
}

.search-modal {
  background: #FFFFFF;
  width: 100%;
  max-width: 640px;
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(26, 26, 46, 0.25);
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
}

.search-header {
  display: flex;
  align-items: center;
  padding: 18px 24px;
  gap: 14px;
  border-bottom: 1px solid #F0F0F6;
}

.search-icon {
  color: #7C5CFC;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  color: #1A1A2E;
  background: transparent;
}

.search-input::placeholder {
  color: #A0A0B8;
}

.clear-btn {
  background: #F4F4F8;
  border: none;
  color: #7B7B93;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.clear-btn:hover {
  background: #E8E8EE;
  color: #1A1A2E;
}

.close-badge {
  background: #F4F4F8;
  border: 1px solid #E2E2EC;
  color: #7B7B93;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 8px;
  cursor: pointer;
}

.close-badge:hover {
  background: #E8E8EE;
  color: #1A1A2E;
}

.quick-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #FAFAFC;
  border-bottom: 1px solid #F0F0F6;
  overflow-x: auto;
  scrollbar-width: none;
}

.tags-label {
  font-size: 12px;
  color: #7B7B93;
  font-weight: 600;
  white-space: nowrap;
}

.tag-btn {
  background: #FFFFFF;
  border: 1px solid #E4E4EE;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  color: #4A4A68;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.tag-btn:hover {
  border-color: #7C5CFC;
  color: #7C5CFC;
  background: rgba(124, 92, 252, 0.05);
}

.search-body {
  max-height: 420px;
  overflow-y: auto;
  padding: 12px;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.result-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.result-card:hover {
  background: #F6F4FE;
  transform: translateX(4px);
}

.result-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  background: #F4F4F8;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.result-card:hover .result-icon {
  background: #FFFFFF;
}

.result-info {
  flex: 1;
}

.result-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.result-title {
  font-weight: 700;
  font-size: 14.5px;
  color: #1A1A2E;
}

.result-card:hover .result-title {
  color: #7C5CFC;
}

.result-badge {
  font-size: 11px;
  font-weight: 600;
  color: #7C5CFC;
  background: rgba(124, 92, 252, 0.1);
  padding: 2px 8px;
  border-radius: 8px;
}

.result-desc {
  font-size: 12.5px;
  color: #7B7B93;
  line-height: 1.35;
}

.result-arrow {
  font-size: 18px;
  color: #B0B0C4;
  transition: transform 0.2s ease;
}

.result-card:hover .result-arrow {
  color: #7C5CFC;
  transform: translateX(2px);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #7B7B93;
}

.empty-icon {
  font-size: 36px;
  margin-bottom: 8px;
  display: block;
}

.empty-hint {
  display: block;
  font-size: 12px;
  color: #A0A0B8;
  margin-top: 6px;
}

/* Transitions */
.search-fade-enter-active,
.search-fade-leave-active {
  transition: opacity 0.25s ease;
}

.search-fade-enter-from,
.search-fade-leave-to {
  opacity: 0;
}

.search-fade-enter-active .search-modal,
.search-fade-leave-active .search-modal {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.search-fade-enter-from .search-modal,
.search-fade-leave-to .search-modal {
  transform: scale(0.96) translateY(-10px);
}
</style>
