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
              :placeholder="t('header.searchModal.placeholder')"
              class="search-input"
              @keydown.esc="close"
            />
            <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''" :aria-label="t('header.searchModal.clear')">✕</button>
            <button class="close-badge" @click="close">ESC</button>
          </div>

          <!-- Quick Tags -->
          <div class="quick-tags">
            <span class="tags-label">{{ t('header.searchModal.popular') }}</span>
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
            <div v-if="isSearchingToys && filteredResults.length === 0" class="search-loading">{{ t('header.searchModal.loading') }}</div>
            <div v-else-if="filteredResults.length > 0" class="results-list">
              <div 
                v-for="item in filteredResults" 
                :key="item.id" 
                class="result-card"
                @click="handleSelect(item)"
              >
                <div class="result-icon">
                  <img v-if="item.image" :src="item.image" :alt="item.title" class="result-thumb" />
                  <AppIcon v-else :name="item.icon" :size="22" />
                </div>
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
              <AppIcon name="search" :size="40" class="empty-icon" />
              <p>{{ t('header.searchModal.empty', { q: searchQuery }) }}</p>
              <span class="empty-hint">{{ t('header.searchModal.emptyHint') }}</span>
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
import { resolveMediaUrl } from '~/utils/mediaUrl'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const router = useRouter()
const localePath = useLocalePath()
const { t } = useI18n()
const { openQuiz } = useQuiz()
const { fetchToys } = useToys()
const runtimeConfig = useRuntimeConfig()
const apiBase = runtimeConfig.public.apiBase as string

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const searchQuery = ref('')
const searchInput = ref<HTMLInputElement | null>(null)
const toyResults = ref<SearchItem[]>([])
const isSearchingToys = ref(false)
let toySearchRequestId = 0
let toySearchDebounce: ReturnType<typeof setTimeout> | undefined

const popularTags = ['Монтессори', 'Сортер', '0-12 мес', 'Логика', 'Тарифы', 'Доставка']

interface SearchItem {
  id: string
  title: string
  category: string
  description: string
  icon: string
  image?: string
  action: () => void
}

const itemsDatabase: SearchItem[] = [
  {
    id: 'toy-sorter',
    title: 'Деревянный сортер Монтессори',
    category: 'Игрушка • 6–18 мес',
    description: 'Развивает мелкую моторику, координацию и пространственное мышление.',
    icon: 'tree',
    action: () => { router.push({ path: localePath('/shop'), query: { search: 'сортер' } }); close(); }
  },
  {
    id: 'toy-rainbow',
    title: 'Радуга-балансир из массива бука',
    category: 'Игрушка • 1–4 года',
    description: 'Сенсорное развитие, балансировка и творческое конструирование.',
    icon: 'palette',
    action: () => { router.push({ path: localePath('/shop'), query: { search: 'балансир' } }); close(); }
  },
  {
    id: 'toy-busyboard',
    title: 'Развивающий мини-бизиборд',
    category: 'Игрушка • 8–24 мес',
    description: 'Шестеренки, замочки и тактильные элементы для исследования.',
    icon: 'settings',
    action: () => { router.push({ path: localePath('/shop'), query: { search: 'бизиборд' } }); close(); }
  },
  {
    id: 'toy-pyramid',
    title: 'Геометрическая пирамидка',
    category: 'Игрушка • 6–18 мес',
    description: 'Изучение цветов, размеров и последовательностей.',
    icon: 'pin',
    action: () => { router.push({ path: localePath('/shop'), query: { search: 'пирамидка' } }); close(); }
  },
  {
    id: 'section-how',
    title: 'Как устроена доставка и обмен',
    category: 'Раздел сайта',
    description: 'Бесплатная курьерская доставка каждые 2 месяца и эко-стерилизация.',
    icon: 'truck',
    action: () => { router.push(localePath('/how-it-works')); close(); }
  },
  {
    id: 'section-cabinet',
    title: 'Личный кабинет родителя',
    category: 'Страница',
    description: 'Управление подпиской, профили детей, статус текущего набора.',
    icon: 'toy',
    action: () => { router.push(localePath('/cabinet')); close(); }
  },
  {
    id: 'section-quiz',
    title: 'Индивидуальный подбор набора (Квиз)',
    category: 'Сервис',
    description: 'Пройдите быстрый квиз для возраста и интересов вашего ребенка.',
    icon: 'sparkles',
    action: () => { openQuiz(); close(); }
  },
]

const filteredStaticResults = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return itemsDatabase
  return itemsDatabase.filter(item => 
    item.title.toLowerCase().includes(query) ||
    item.category.toLowerCase().includes(query) ||
    item.description.toLowerCase().includes(query)
  )
})

const filteredResults = computed(() => {
  const query = searchQuery.value.trim()
  if (!query) return itemsDatabase
  return [...toyResults.value, ...filteredStaticResults.value]
})

const searchToys = async (query: string) => {
  const requestId = ++toySearchRequestId
  const trimmed = query.trim()
  if (!trimmed) {
    toyResults.value = []
    isSearchingToys.value = false
    return
  }

  isSearchingToys.value = true
  try {
    const res = await fetchToys({
      catalog: 'shop',
      search: trimmed,
      per_page: 8,
      include_preorder: 1,
    })
    if (requestId !== toySearchRequestId) return

    const items = Array.isArray(res?.data) ? res.data : []
    toyResults.value = items.map((item: any) => {
      const sku = item.sku ? String(item.sku) : ''
      const categoryName = item.category?.name || 'Игрушка'
      const image = resolveMediaUrl(item.image_url || '', apiBase)
      return {
        id: `api-toy-${item.id}`,
        title: String(item.name || 'Игрушка'),
        category: sku ? `Арт. ${sku}` : categoryName,
        description: sku
          ? `${categoryName} · артикул ${sku}`
          : (item.description || categoryName),
        icon: 'toy',
        image: image || undefined,
        action: () => {
          router.push(localePath(`/product/${item.id}`))
          close()
        },
      } satisfies SearchItem
    })
  } catch {
    if (requestId !== toySearchRequestId) return
    toyResults.value = []
  } finally {
    if (requestId === toySearchRequestId) {
      isSearchingToys.value = false
    }
  }
}

const handleSelect = (item: SearchItem) => {
  item.action()
}

const close = () => {
  isOpen.value = false
  searchQuery.value = ''
  toyResults.value = []
  isSearchingToys.value = false
}

watch(searchQuery, (value) => {
  clearTimeout(toySearchDebounce)
  toySearchDebounce = setTimeout(() => {
    searchToys(value)
  }, 280)
})

watch(isOpen, (newVal) => {
  if (newVal) {
    nextTick(() => {
      searchInput.value?.focus()
    })
  } else {
    clearTimeout(toySearchDebounce)
    toyResults.value = []
    isSearchingToys.value = false
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
  background: #FAF8F4;
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
  color: var(--green-ink);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: 'Manrope', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #1A1A2E;
  outline: none;
}

.search-input::placeholder {
  color: #A0A0B8;
  font-weight: 500;
}

.clear-btn {
  background: #F0F0F6;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: background 0.2s;
}

.clear-btn:hover {
  background: #E0E0E8;
}

.close-badge {
  background: #F0F0F6;
  border: none;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #888;
  cursor: pointer;
  letter-spacing: 0.5px;
}

.quick-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  overflow-x: auto;
  border-bottom: 1px solid #F0F0F6;
}

.tags-label {
  font-size: 12px;
  font-weight: 600;
  color: #999;
  white-space: nowrap;
}

.tag-btn {
  background: #fff;
  border: 1px solid #E8E8F0;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #555;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.tag-btn:hover {
  border-color: var(--green-ink);
  color: var(--green-ink);
  background: #F0FAF6;
}

.search-body {
  max-height: 420px;
  overflow-y: auto;
  padding: 12px;
}

.search-loading {
  padding: 28px 16px;
  text-align: center;
  color: #888;
  font-size: 14px;
  font-weight: 600;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 14px;
  cursor: pointer;
  transition: background 0.15s;
}

.result-card:hover {
  background: #fff;
}

.result-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #F0F0F6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--green-ink);
  flex-shrink: 0;
  overflow: hidden;
}

.result-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.result-title {
  font-weight: 700;
  font-size: 14px;
  color: #1A1A2E;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-badge {
  font-size: 10px;
  font-weight: 700;
  color: #888;
  background: #F0F0F6;
  padding: 2px 8px;
  border-radius: 10px;
  white-space: nowrap;
  flex-shrink: 0;
}

.result-desc {
  font-size: 12px;
  color: #888;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-arrow {
  color: #CCC;
  font-size: 16px;
  flex-shrink: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  color: #DDD;
  margin-bottom: 12px;
}

.empty-state p {
  font-weight: 600;
  color: #666;
  margin: 0 0 6px;
}

.empty-hint {
  font-size: 12px;
  color: #AAA;
}

.search-fade-enter-active,
.search-fade-leave-active {
  transition: opacity 0.2s ease;
}

.search-fade-enter-from,
.search-fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .search-overlay {
    padding: 20px 12px;
  }

  .search-modal {
    border-radius: 18px;
    max-height: calc(100vh - 40px);
  }

  .search-header {
    padding: 14px 16px;
  }

  .quick-tags {
    padding: 12px 16px;
  }
}
</style>
