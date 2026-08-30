<template>
  <div class="shop-page">
    <TheHeader />

    <main class="container page-content">
      <div v-if="isGiftMode" class="gift-mode-banner">
        <span>🎁</span>
        <div>
          <strong>Режим подарка</strong>
          <p>Любая игрушка из каталога будет добавлена с подарочной упаковкой и открыткой.</p>
        </div>
        <NuxtLink to="/gifts" class="gift-mode-back">← К подаркам</NuxtLink>
      </div>

      <nav class="catalog-breadcrumbs" aria-label="Хлебные крошки">
        <NuxtLink to="/">Главная</NuxtLink>
        <span>›</span>
        <button type="button" @click="resetFilters">Каталог</button>
        <template v-if="currentCatalogTitle !== 'Все игрушки'">
          <span>›</span>
          <strong>{{ currentCatalogTitle }}</strong>
        </template>
      </nav>

      <section class="catalog-heading">
        <div>
          <span class="catalog-heading__eyebrow">КАТАЛОГ ALPHA</span>
          <div class="catalog-heading__title-row">
            <h1>{{ currentCatalogTitle }}</h1>
            <span>{{ filteredProducts.length }} {{ pluralizeToys(filteredProducts.length) }}</span>
          </div>
          <p>Выбирайте игрушки по типу, возрасту и навыкам ребёнка. Все фильтры работают одновременно.</p>
        </div>
        <button type="button" class="catalog-gift-link" @click="isGiftModalOpen = true">
          <span aria-hidden="true">🎁</span>
          <span><strong>Подарочные наборы</strong><small>Готовые решения к празднику</small></span>
          <span aria-hidden="true">→</span>
        </button>
      </section>

      <section class="catalog-quick-links" aria-label="Категории игрушек">
        <button
          v-for="type in typeFilters"
          :key="type.id"
          type="button"
          :class="{ active: selectedTypes.includes(type.id) }"
          @click="toggleFilter(selectedTypes, type.id)"
        >
          <span>{{ type.icon }}</span>{{ type.name }}
        </button>
      </section>

      <div class="catalog-layout">
        <aside class="catalog-filters" aria-label="Фильтры каталога">
          <div class="catalog-filters__top">
            <h2>Каталог</h2>
            <button v-if="hasActiveFilters" type="button" @click="resetFilters">Сбросить</button>
          </div>

          <button type="button" class="catalog-all-link" :class="{ active: !hasActiveFilters }" @click="resetFilters">
            <span>Все игрушки</span><span>{{ products.length }}</span>
          </button>

          <div class="filter-group">
            <h3>По категории</h3>
            <button
              v-for="category in categories"
              :key="category.slug"
              type="button"
              class="filter-option"
              :class="{ active: activeCategory === category.slug }"
              @click="selectCategory(category.slug)"
            >
              <span class="filter-checkbox">✓</span>
              <span>{{ category.icon ? `${category.icon} ` : '' }}{{ category.name }}</span>
              <small>{{ getCategoryCount(category.slug) }}</small>
            </button>
          </div>

          <div class="filter-group">
            <h3>По типу</h3>
            <button
              v-for="type in typeFilters"
              :key="type.id"
              type="button"
              class="filter-option"
              :class="{ active: selectedTypes.includes(type.id) }"
              @click="toggleFilter(selectedTypes, type.id)"
            >
              <span class="filter-checkbox">✓</span>
              <span>{{ type.name }}</span>
              <small>{{ getTypeCount(type.id) }}</small>
            </button>
          </div>

          <div class="filter-group">
            <h3>По возрасту</h3>
            <button
              v-for="age in ageGroups"
              :key="age.id"
              type="button"
              class="filter-option"
              :class="{ active: selectedAges.includes(age.id) }"
              @click="toggleFilter(selectedAges, age.id)"
            >
              <span class="filter-checkbox">✓</span>
              <span>{{ age.label }}</span>
              <small>{{ getAgeCount(age.id) }}</small>
            </button>
          </div>

          <div class="filter-group">
            <h3>По навыкам</h3>
            <button
              v-for="skill in skillFilters"
              :key="skill.id"
              type="button"
              class="filter-option"
              :class="{ active: selectedSkills.includes(skill.id) }"
              @click="toggleFilter(selectedSkills, skill.id)"
            >
              <span class="filter-checkbox">✓</span>
              <span>{{ skill.name }}</span>
              <small>{{ getSkillCount(skill.id) }}</small>
            </button>
          </div>

          <div class="filter-group">
            <h3>Цена, ₸</h3>
            <div class="price-filter">
              <label><span>от</span><input v-model.number="priceFrom" type="number" min="0" placeholder="0" /></label>
              <label><span>до</span><input v-model.number="priceTo" type="number" min="0" placeholder="50 000" /></label>
            </div>
          </div>

          <div class="filter-group">
            <h3>Наличие</h3>
            <label class="availability-option">
              <input v-model="availability" type="radio" value="available" />
              <span>В наличии</span>
            </label>
            <label class="availability-option">
              <input v-model="availability" type="radio" value="all" />
              <span>Все игрушки</span>
            </label>
          </div>
        </aside>

        <div class="catalog-results">
          <section class="shop-toolbar-row">
            <div class="search-input-wrap">
              <svg class="search-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#A0A0B8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="7"></circle>
                <line x1="21" y1="21" x2="16.5" y2="16.5"></line>
              </svg>
              <input v-model="searchQuery" type="text" placeholder="Поиск в категории..." class="shop-search-input" />
              <button v-if="searchQuery" class="clear-search-btn" @click="searchQuery = ''">&times;</button>
            </div>

            <div class="sort-wrap">
              <span class="sort-label">Сортировка:</span>
              <div class="sort-select-btn" @click="isSortDropdownOpen = !isSortDropdownOpen">
                <strong>{{ currentSortLabel }}</strong>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
                <div v-if="isSortDropdownOpen" class="sort-dropdown-menu">
                  <div v-for="option in sortOptions" :key="option.value" class="sort-option" :class="{ active: currentSort === option.value }" @click.stop="selectSort(option)">
                    {{ option.label }}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div v-if="activeFilterChips.length" class="active-filters">
            <span>Выбрано:</span>
            <button v-for="chip in activeFilterChips" :key="`${chip.group}-${chip.id}`" type="button" @click="removeFilterChip(chip)">
              {{ chip.label }} <span>×</span>
            </button>
            <button type="button" class="active-filters__clear" @click="resetFilters">Очистить все</button>
          </div>

      <!-- Products Grid -->
      <section class="products-grid-section">
        <div v-if="isLoading" class="catalog-empty-state">Загрузка каталога...</div>
        <div v-else-if="filteredProducts.length === 0" class="catalog-empty-state">
          Каталог пока пуст. Обновите страницу или обратитесь в поддержку.
        </div>
        <div v-else class="products-grid">
          <div 
            v-for="product in paginatedProducts"
            :key="product.id"
            class="product-card"
          >
            <!-- Image Area -->
            <div class="product-img-wrap" @click="navigateToProduct(product)">
              <img :src="product.image" :alt="product.title" class="product-img" />
              <span class="product-status" :class="`product-status--${getProductStatus(product).kind}`">
                {{ getProductStatus(product).label }}
              </span>
            </div>

            <!-- Content Area -->
            <div class="product-info">
              <h3 class="product-title clickable" @click="navigateToProduct(product)">{{ product.title }}</h3>
              
              <div class="product-price">{{ formatPrice(product.numericPrice) }} ₸</div>

              <div class="product-actions">
                <button
                  class="add-to-cart-btn"
                  :class="{ added: addedProducts.includes(product.id) }"
                  @click="handleAddToCart(product)"
                >
                  {{ addedProducts.includes(product.id) ? 'Добавлено ✓' : (isGiftMode ? 'В подарок 🎁' : 'В корзину') }}
                </button>
                <button
                  class="card-fav-btn"
                  :class="{ active: isFavorite(product.id) }"
                  @click="toggleFavorite({ id: product.id, title: product.title, price: product.numericPrice, image: product.image })"
                  aria-label="В избранное"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" :fill="isFavorite(product.id) ? '#FF5A5F' : 'none'" :stroke="isFavorite(product.id) ? '#FF5A5F' : '#8A8A98'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="no-products-box">
          <span class="no-prod-icon">🔍</span>
          <h3>Игрушек не найдено</h3>
          <p>Попробуйте сбросить фильтры или изменить поисковый запрос.</p>
          <button class="reset-filters-btn" @click="resetFilters">Сбросить все фильтры</button>
        </div>
      </section>

          <nav v-if="totalPages > 1" class="catalog-pagination" aria-label="Страницы каталога">
            <button type="button" :disabled="currentPage === 1" @click="currentPage--">←</button>
            <button
              v-for="page in totalPages"
              :key="page"
              type="button"
              :class="{ active: currentPage === page }"
              @click="currentPage = page"
            >
              {{ page }}
            </button>
            <button type="button" :disabled="currentPage === totalPages" @click="currentPage++">→</button>
          </nav>
        </div>
      </div>
    </main>

    <!-- Gift Sets Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isGiftModalOpen" class="modal-overlay" @click.self="isGiftModalOpen = false">
          <div class="gift-modal">
            <button class="close-btn" @click="isGiftModalOpen = false">&times;</button>
            <h2 class="modal-title">🎁 Подарочные наборы Alpha</h2>
            <p class="modal-desc">
              Идеальный подарок на день рождения, выписку или праздник. Красивая крафтовая упаковка и открытка с теплыми пожеланиями в комплекте!
            </p>

            <div class="gift-boxes-grid">
              <div class="gift-box-card">
                <h4>Бокс «Первый Годик»</h4>
                <p>3 развивающие эко-игрушки + хлопковый мешочек.</p>
                <div class="gift-box-price">14 900 ₸</div>
                <button class="gift-add-btn" @click="addGiftBox('Бокс «Первый Годик»', 14900)">
                  Выбрать бокс
                </button>
              </div>

              <div class="gift-box-card featured">
                <span class="gift-hot-badge">ХИТ</span>
                <h4>Бокс «Маленький Гений»</h4>
                <p>5 игрушек Монтессори + карточки развития речи.</p>
                <div class="gift-box-price">22 900 ₸</div>
                <button class="gift-add-btn" @click="addGiftBox('Бокс «Маленький Гений»', 22900)">
                  Выбрать бокс
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
    <!-- TheFooter -->
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TheHeader from '~/components/TheHeader.vue'
import TheFooter from '~/components/TheFooter.vue'

const route = useRoute()
const router = useRouter()
const { addItem } = useCart()
const { isFavorite, toggleFavorite } = useFavorites()
const { categories, labelBySlug, loadCategories } = useToyCategories()

const searchQuery = ref('')
const activeCategory = ref('all')
const selectedTypes = ref<string[]>([])
const selectedAges = ref<string[]>([])
const selectedSkills = ref<string[]>([])
const priceFrom = ref<number | null>(null)
const priceTo = ref<number | null>(null)
const availability = ref<'available' | 'all'>('available')
const currentSort = ref('popular')
const currentPage = ref(1)
const itemsPerPage = 9
const isSortDropdownOpen = ref(false)
const isGiftModalOpen = ref(false)
const addedProducts = ref<number[]>([])

const isGiftMode = computed(() => route.query.gift === '1')

const queryValues = (value: unknown): string[] => {
  if (!value) return []
  return (Array.isArray(value) ? value : String(value).split(','))
    .map(String)
    .filter(Boolean)
}

const syncFromRoute = () => {
  searchQuery.value = route.query.search ? String(route.query.search) : ''
  activeCategory.value = route.query.category ? String(route.query.category) : 'all'
  selectedTypes.value = queryValues(route.query.type)
  selectedAges.value = queryValues(route.query.age)
  selectedSkills.value = queryValues(route.query.skill)
  currentPage.value = 1
}

watch(() => route.fullPath, syncFromRoute)

const categoryLabelBySlug = labelBySlug

const typeFilters = [
  { id: 'developing', name: 'Развивающие', icon: '🧠' },
  { id: 'constructors', name: 'Конструкторы', icon: '🧱' },
  { id: 'musical', name: 'Музыкальные', icon: '🎵' },
  { id: 'role-play', name: 'Сюжетно-ролевые', icon: '🎭' },
  { id: 'creative', name: 'Творчество', icon: '🎨' },
  { id: 'wooden', name: 'Деревянные', icon: '🌳' },
]

const ageGroups = [
  { id: '0-1', label: '0–1 года' },
  { id: '1-2', label: '1–2 года' },
  { id: '2-3', label: '2–3 года' },
  { id: '3-4', label: '3–4 года' },
  { id: '4-5', label: '4–5 лет' },
  { id: '5-6', label: '5–6 лет' },
]

const skillFilters = [
  { id: 'motor', name: 'Моторика' },
  { id: 'logic', name: 'Логика' },
  { id: 'speech', name: 'Речь' },
  { id: 'memory', name: 'Память' },
  { id: 'imagination', name: 'Воображение' },
]

const sortOptions = [
  { value: 'popular', label: 'Сначала популярные' },
  { value: 'new', label: 'Сначала новые' },
  { value: 'price-asc', label: 'По возрастанию цены' },
  { value: 'price-desc', label: 'По убыванию цены' },
  { value: 'rating', label: 'По высокому рейтингу' },
  { value: 'age', label: 'По возрасту' },
]

const currentSortLabel = computed(() => {
  return sortOptions.find(o => o.value === currentSort.value)?.label || 'Сначала популярные'
})

const selectSort = (option: { value: string; label: string }) => {
  currentSort.value = option.value
  isSortDropdownOpen.value = false
}

const toggleFilter = (target: string[], id: string) => {
  const index = target.indexOf(id)
  if (index >= 0) target.splice(index, 1)
  else target.push(id)
  currentPage.value = 1
}

const selectCategory = (id: string) => {
  activeCategory.value = activeCategory.value === id ? 'all' : id
  currentPage.value = 1
  const query = { ...route.query }
  if (activeCategory.value === 'all') delete query.category
  else query.category = activeCategory.value
  router.replace({ path: '/shop', query })
}

interface Product {
  id: number
  title: string
  rating: string
  reviewsCount: number
  numericPrice: number
  image: string
  category: string[]
  toyCategorySlug?: string | null
  age: string
  minAgeMonths: number
  maxAgeMonths: number
}

const { fetchToys } = useToys()

const isLoading = ref(true)
const products = ref<Product[]>([])

const parseCategories = (item: any): string[] => {
  const cats = new Set<string>(['all'])

  if (item.category?.name) {
    cats.add(item.category.name)
  }

  if (item.category?.slug) {
    cats.add(item.category.slug)
  }

  return Array.from(cats)
}


onMounted(async () => {
  syncFromRoute()
  loadCategories()

  try {
    const res = await fetchToys({ channel: 'shop' })
    const items = Array.isArray(res?.data) ? res.data : []
    products.value = items.map((item: any) => ({
      id: item.id,
      title: item.name,
      rating: '4.9',
      reviewsCount: 24,
      numericPrice: Number(item.price) || 0,
      image: item.image_url || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=500&q=80',
      category: parseCategories(item),
      toyCategorySlug: item.category?.slug ?? null,
      minAgeMonths: item.min_age_months ?? 0,
      maxAgeMonths: item.max_age_months ?? 72,
      age: `${Math.floor((item.min_age_months ?? 0) / 12)}–${Math.ceil((item.max_age_months ?? 72) / 12)} лет`,
    }))
  } catch (e) {
    console.warn('Could not load shop catalog from API', e)
    products.value = []
  } finally {
    isLoading.value = false
  }
})

const ageRangeMap: Record<string, { min: number; max: number }> = {
  '0-1': { min: 0, max: 12 },
  '1-2': { min: 12, max: 24 },
  '2-3': { min: 24, max: 36 },
  '3-4': { min: 36, max: 48 },
  '4-5': { min: 48, max: 60 },
  '5-6': { min: 60, max: 72 },
}

const productTypes = (product: Product): string[] => {
  const value = `${product.title} ${product.category.join(' ')}`.toLowerCase()
  const result = new Set<string>(['developing'])
  if (/конструктор|кубик|строител/.test(value)) result.add('constructors')
  if (/музык|ксилофон|барабан|пианино/.test(value)) result.add('musical')
  if (/кукл|домик|кухн|ролев|мебель|набор/.test(value)) result.add('role-play')
  if (/творч|мозаик|рисован|лепк|аппликац/.test(value)) result.add('creative')
  if (/дерев|монтессори|сортер|баланс|шнуров|пазл|лабиринт/.test(value) || product.id % 3 !== 0) result.add('wooden')
  return [...result]
}

const productSkills = (product: Product): string[] => {
  const value = `${product.title} ${product.category.join(' ')}`.toLowerCase()
  const result = new Set<string>()
  if (/мотор|сенсор|баланс|шнуров|координац/.test(value)) result.add('motor')
  if (/логик|мышлен|пазл|сортер|лабиринт|головолом/.test(value)) result.add('logic')
  if (/речь|коммуникац|алфавит|букв|слово/.test(value)) result.add('speech')
  if (/память|карточ|пазл|логик/.test(value)) result.add('memory')
  if (/воображ|творч|кукл|домик|ролев|конструктор/.test(value)) result.add('imagination')
  return [...result]
}

const isProductAvailable = (product: Product) => product.id % 5 !== 0

const getProductStatus = (product: Product) => {
  if (product.id % 7 === 0) return { label: 'Предзаказ', kind: 'preorder' }
  if (product.id % 3 === 0) return { label: 'Аренда', kind: 'rent' }
  return { label: 'В наличии', kind: 'available' }
}

const currentCatalogTitle = computed(() => {
  if (activeCategory.value !== 'all') return categoryLabelBySlug.value[activeCategory.value] || activeCategory.value
  if (selectedTypes.value.length === 1) return typeFilters.find(item => item.id === selectedTypes.value[0])?.name || 'Все игрушки'
  if (selectedSkills.value.length === 1) return skillFilters.find(item => item.id === selectedSkills.value[0])?.name || 'Все игрушки'
  if (selectedAges.value.length === 1) return `Игрушки для детей ${ageGroups.find(item => item.id === selectedAges.value[0])?.label || ''}`
  if (searchQuery.value.trim()) return `Поиск: «${searchQuery.value.trim()}»`
  return 'Все игрушки'
})

const pluralizeToys = (count: number) => {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return 'игрушка'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'игрушки'
  return 'игрушек'
}

const getTypeCount = (id: string) => products.value.filter(product => productTypes(product).includes(id)).length
const getSkillCount = (id: string) => products.value.filter(product => productSkills(product).includes(id)).length
const getCategoryCount = (slug: string) => (
  products.value.filter(product => product.toyCategorySlug === slug).length
)
const getAgeCount = (id: string) => {
  const range = ageRangeMap[id]
  if (!range) return 0
  return products.value.filter(product => product.minAgeMonths < range.max && product.maxAgeMonths > range.min).length
}

interface ActiveFilterChip {
  group: 'type' | 'age' | 'skill' | 'category' | 'price'
  id: string
  label: string
}

const activeFilterChips = computed<ActiveFilterChip[]>(() => {
  const chips: ActiveFilterChip[] = []
  if (activeCategory.value !== 'all') {
    chips.push({ group: 'category', id: activeCategory.value, label: categoryLabelBySlug.value[activeCategory.value] || activeCategory.value })
  }
  selectedTypes.value.forEach(id => chips.push({ group: 'type', id, label: typeFilters.find(item => item.id === id)?.name || id }))
  selectedAges.value.forEach(id => chips.push({ group: 'age', id, label: ageGroups.find(item => item.id === id)?.label || id }))
  selectedSkills.value.forEach(id => chips.push({ group: 'skill', id, label: skillFilters.find(item => item.id === id)?.name || id }))
  if (priceFrom.value || priceTo.value) {
    chips.push({ group: 'price', id: 'price', label: `${priceFrom.value || 0}–${priceTo.value || '∞'} ₸` })
  }
  return chips
})

const hasActiveFilters = computed(() => (
  activeCategory.value !== 'all'
  || selectedTypes.value.length > 0
  || selectedAges.value.length > 0
  || selectedSkills.value.length > 0
  || Boolean(searchQuery.value.trim())
  || Boolean(priceFrom.value)
  || Boolean(priceTo.value)
))

const removeFilterChip = (chip: ActiveFilterChip) => {
  if (chip.group === 'category') activeCategory.value = 'all'
  if (chip.group === 'type') selectedTypes.value = selectedTypes.value.filter(id => id !== chip.id)
  if (chip.group === 'age') selectedAges.value = selectedAges.value.filter(id => id !== chip.id)
  if (chip.group === 'skill') selectedSkills.value = selectedSkills.value.filter(id => id !== chip.id)
  if (chip.group === 'price') {
    priceFrom.value = null
    priceTo.value = null
  }
  currentPage.value = 1

  const query = { ...route.query }
  if (chip.group === 'category') delete query.category
  if (chip.group === 'type') {
    if (selectedTypes.value.length) query.type = selectedTypes.value.join(',')
    else delete query.type
  }
  if (chip.group === 'age') {
    if (selectedAges.value.length) query.age = selectedAges.value.join(',')
    else delete query.age
  }
  if (chip.group === 'skill') {
    if (selectedSkills.value.length) query.skill = selectedSkills.value.join(',')
    else delete query.skill
  }
  router.replace({ path: '/shop', query })
}

const filteredProducts = computed(() => {
  let list = products.value

  // Favorites filter
  if (route.query.filter === 'favorites') {
    list = list.filter(p => isFavorite(p.id))
  }

  // Search filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(p => p.title.toLowerCase().includes(q))
  }

  // Category filter by toy category slug
  if (activeCategory.value !== 'all') {
    list = list.filter(product => product.toyCategorySlug === activeCategory.value)
  }

  if (selectedTypes.value.length) {
    list = list.filter(product => selectedTypes.value.some(id => productTypes(product).includes(id)))
  }

  if (selectedAges.value.length) {
    list = list.filter(product => selectedAges.value.some(id => {
      const range = ageRangeMap[id]
      return range && product.minAgeMonths < range.max && product.maxAgeMonths > range.min
    }))
  }

  if (selectedSkills.value.length) {
    list = list.filter(product => selectedSkills.value.some(id => productSkills(product).includes(id)))
  }

  if (priceFrom.value) {
    list = list.filter(product => product.numericPrice >= Number(priceFrom.value))
  }

  if (priceTo.value) {
    list = list.filter(product => product.numericPrice <= Number(priceTo.value))
  }

  if (availability.value === 'available') {
    list = list.filter(isProductAvailable)
  }

  // Sorting
  if (currentSort.value === 'price-asc') {
    list = [...list].sort((a, b) => a.numericPrice - b.numericPrice)
  } else if (currentSort.value === 'price-desc') {
    list = [...list].sort((a, b) => b.numericPrice - a.numericPrice)
  } else if (currentSort.value === 'rating') {
    list = [...list].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
  } else if (currentSort.value === 'new') {
    list = [...list].sort((a, b) => b.id - a.id)
  } else if (currentSort.value === 'age') {
    list = [...list].sort((a, b) => a.minAgeMonths - b.minAgeMonths)
  }

  return list
})

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage))
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredProducts.value.slice(start, start + itemsPerPage)
})

watch(
  [selectedTypes, selectedAges, selectedSkills, priceFrom, priceTo, availability, searchQuery, activeCategory, currentSort],
  () => { currentPage.value = 1 },
  { deep: true },
)

const formatPrice = (val: number) => {
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

const handleAddToCart = (product: Product) => {
  addItem({
    id: product.id,
    title: isGiftMode.value
      ? `${product.title} (в подарочной упаковке с открыткой)`
      : product.title,
    price: product.numericPrice,
    image: product.image,
    isGiftPackaging: isGiftMode.value || undefined,
  })
  if (!addedProducts.value.includes(product.id)) {
    addedProducts.value.push(product.id)
    setTimeout(() => {
      const idx = addedProducts.value.indexOf(product.id)
      if (idx > -1) addedProducts.value.splice(idx, 1)
    }, 2500)
  }
}

const addGiftBox = (name: string, price: number) => {
  addItem({
    id: `gift-${Date.now()}`,
    title: name,
    price,
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=500&q=80'
  })
  alert(`«${name}» добавлен в вашу корзину! 🎁`)
  isGiftModalOpen.value = false
}

const resetFilters = () => {
  searchQuery.value = ''
  activeCategory.value = 'all'
  selectedTypes.value = []
  selectedAges.value = []
  selectedSkills.value = []
  priceFrom.value = null
  priceTo.value = null
  availability.value = 'available'
  currentPage.value = 1
  router.push('/shop')
}

const navigateToProduct = (product: Product) => {
  navigateTo(isGiftMode.value ? `/product/${product.id}?gift=1` : `/product/${product.id}`)
}
</script>

<style scoped>
.shop-page {
  min-height: 100vh;
  background-color: #FFF8F0;
  color: #1A1A2E;
  font-family: 'DM Sans', sans-serif;
  padding-bottom: 80px;
}

.container {
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-content {
  padding-top: 36px;
}

.gift-mode-banner {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  padding: 14px 18px;
  border-radius: 14px;
  background: linear-gradient(135deg, #FFF7ED 0%, #F5F0FF 100%);
  border: 1px solid rgba(98, 76, 224, 0.15);
}

.gift-mode-banner strong {
  display: block;
  font-size: 15px;
}

.gift-mode-banner p {
  margin: 2px 0 0;
  font-size: 13px;
  color: #6B6B80;
}

.gift-mode-back {
  margin-left: auto;
  font-size: 13px;
  font-weight: 700;
  color: #624CE0;
  text-decoration: none;
}

.catalog-empty-state {
  padding: 48px 24px;
  text-align: center;
  color: #6B6B80;
  font-size: 15px;
}

.catalog-breadcrumbs {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 24px;
  color: #8A8A9E;
  font-size: 13px;
}

.catalog-breadcrumbs a,
.catalog-breadcrumbs button {
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
  text-decoration: none;
}

.catalog-breadcrumbs a:hover,
.catalog-breadcrumbs button:hover {
  color: #624CE0;
}

.catalog-breadcrumbs strong {
  color: #4A4A68;
  font-weight: 700;
}

.catalog-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
  padding-bottom: 28px;
  border-bottom: 1px solid #E7E2DC;
}

.catalog-heading__eyebrow {
  display: block;
  margin-bottom: 10px;
  color: #624CE0;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.catalog-heading__title-row {
  display: flex;
  align-items: baseline;
  gap: 14px;
}

.catalog-heading h1 {
  margin: 0;
  color: #1A1A2E;
  font-family: 'Outfit', sans-serif;
  font-size: clamp(32px, 4vw, 48px);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.03em;
}

.catalog-heading__title-row > span {
  color: #9A98A8;
  font-size: 14px;
  font-weight: 700;
}

.catalog-heading p {
  max-width: 650px;
  margin: 12px 0 0;
  color: #69677C;
  font-size: 14px;
  line-height: 1.55;
}

.catalog-gift-link {
  min-width: 280px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid #E6E0FF;
  border-radius: 16px;
  background: #FFFFFF;
  color: #1A1A2E;
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.catalog-gift-link:hover {
  transform: translateY(-2px);
  border-color: #8A72F2;
}

.catalog-gift-link > span:first-child {
  font-size: 25px;
}

.catalog-gift-link strong,
.catalog-gift-link small {
  display: block;
}

.catalog-gift-link strong {
  font-size: 13px;
}

.catalog-gift-link small {
  margin-top: 2px;
  color: #8A8A9E;
  font-size: 11px;
}

.catalog-quick-links {
  display: flex;
  gap: 8px;
  padding: 20px 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.catalog-quick-links::-webkit-scrollbar {
  display: none;
}

.catalog-quick-links button {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 14px;
  border: 1px solid #E6E0FF;
  border-radius: 12px;
  background: #FFFFFF;
  color: #4A4A68;
  font: inherit;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.catalog-quick-links button:hover,
.catalog-quick-links button.active {
  border-color: #624CE0;
  background: #624CE0;
  color: #FFFFFF;
}

.catalog-layout {
  display: grid;
  grid-template-columns: 245px minmax(0, 1fr);
  gap: 34px;
  align-items: start;
}

.catalog-filters {
  position: sticky;
  top: 18px;
  padding: 22px 20px;
  border: 1px solid #E7E2DC;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.82);
}

.catalog-filters__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.catalog-filters__top h2 {
  margin: 0;
  font-family: 'Outfit', sans-serif;
  font-size: 22px;
  font-weight: 800;
}

.catalog-filters__top button {
  padding: 0;
  border: 0;
  background: none;
  color: #624CE0;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.catalog-all-link,
.filter-option {
  width: 100%;
  border: 0;
  background: none;
  color: #4A4A68;
  font: inherit;
  cursor: pointer;
}

.catalog-all-link {
  display: flex;
  justify-content: space-between;
  padding: 9px 10px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 800;
  text-align: left;
}

.catalog-all-link.active,
.catalog-all-link:hover {
  background: #F0EDFF;
  color: #624CE0;
}

.filter-group {
  margin-top: 22px;
  padding-top: 20px;
  border-top: 1px solid #ECE8E3;
}

.filter-group h3 {
  margin: 0 0 11px;
  color: #1A1A2E;
  font-size: 13px;
  font-weight: 800;
}

.filter-option {
  display: grid;
  grid-template-columns: 17px 1fr auto;
  align-items: center;
  gap: 9px;
  padding: 6px 2px;
  font-size: 12.5px;
  text-align: left;
}

.filter-option small {
  color: #AAA7B5;
  font-size: 10.5px;
}

.filter-checkbox {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #D3CEDF;
  border-radius: 5px;
  color: transparent;
  font-size: 10px;
  transition: all 0.15s ease;
}

.filter-option:hover,
.filter-option.active {
  color: #624CE0;
}

.filter-option.active .filter-checkbox {
  border-color: #624CE0;
  background: #624CE0;
  color: #FFFFFF;
}

.price-filter {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.price-filter label {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 9px;
  border: 1px solid #DED9E8;
  border-radius: 9px;
  background: #FFFFFF;
  color: #9A98A8;
  font-size: 10px;
}

.price-filter input {
  min-width: 0;
  width: 100%;
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #1A1A2E;
  font: inherit;
  font-size: 11px;
}

.availability-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
  color: #4A4A68;
  font-size: 12.5px;
  cursor: pointer;
}

.availability-option input {
  accent-color: #624CE0;
}

.catalog-results {
  min-width: 0;
}

.active-filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
  margin: -4px 0 18px;
  color: #8A8A9E;
  font-size: 11px;
}

.active-filters button {
  padding: 6px 10px;
  border: 1px solid #DDD6FF;
  border-radius: 999px;
  background: #F0EDFF;
  color: #624CE0;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.active-filters button:hover {
  border-color: #624CE0;
}

.active-filters .active-filters__clear {
  border-color: transparent;
  background: transparent;
  color: #8A8A9E;
  text-decoration: underline;
}

.catalog-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
}

.catalog-pagination button {
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  border: 1px solid #E0DBEA;
  border-radius: 10px;
  background: #FFFFFF;
  color: #4A4A68;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.catalog-pagination button.active {
  border-color: #624CE0;
  background: #624CE0;
  color: #FFFFFF;
}

.catalog-pagination button:disabled {
  opacity: 0.4;
  cursor: default;
}

/* Header Top */
.shop-header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 32px;
  margin-bottom: 32px;
}

.header-left {
  max-width: 620px;
}

.shop-main-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 38px;
  color: #1A1A2E;
  line-height: 1.15;
  margin-bottom: 14px;
  letter-spacing: -0.5px;
}

.shop-description {
  font-size: 14.5px;
  color: #7B7B93;
  line-height: 1.5;
}

/* Gift Card */
.gift-card {
  background: #FFFFFF;
  border-radius: 22px;
  padding: 20px 24px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  max-width: 380px;
  flex-shrink: 0;
}

.gift-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 209, 102, 0.25);
  border-color: rgba(255, 209, 102, 0.4);
}

.gift-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: #FFD166;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.gift-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 16px;
  color: #1A1A2E;
  margin-bottom: 2px;
}

.gift-sub {
  font-size: 12.5px;
  color: #7B7B93;
  line-height: 1.3;
}

/* Search and Sort Toolbar */
.shop-toolbar-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
}

.search-input-wrap {
  position: relative;
  width: 340px;
}

.search-icon {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.shop-search-input {
  width: 100%;
  background: #FFFFFF;
  border: 1.5px solid #EAEAF2;
  border-radius: 50px;
  padding: 10px 36px 10px 46px;
  font-size: 13.5px;
  color: #1A1A2E;
  font-family: 'DM Sans', sans-serif;
  outline: none;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}

.shop-search-input:focus {
  border-color: #7C5CFC;
  box-shadow: 0 4px 14px rgba(124, 92, 252, 0.12);
}

.clear-search-btn {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 18px;
  color: #A0A0B8;
  cursor: pointer;
}

/* Sort Select */
.sort-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-label {
  font-size: 13.5px;
  color: #7B7B93;
}

.sort-select-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #FFFFFF;
  border: 1px solid #EAEAF2;
  padding: 8px 18px;
  border-radius: 50px;
  font-size: 13.5px;
  color: #1A1A2E;
  cursor: pointer;
  user-select: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}

.sort-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: #FFFFFF;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid #EAEAF2;
  padding: 6px;
  width: 210px;
  z-index: 100;
}

.sort-option {
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 13px;
  color: #4A4A68;
  transition: all 0.15s ease;
}

.sort-option:hover {
  background: #F8F6FF;
  color: #7C5CFC;
}

.sort-option.active {
  font-weight: 700;
  color: #7C5CFC;
  background: #F0EDFF;
}

/* Category Filter Pills */
.categories-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.cat-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #FFFFFF;
  border: 1px solid #EAEAF2;
  color: #1A1A2E;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 13.5px;
  padding: 8px 20px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}

.cat-pill:hover {
  background: #F8F6FF;
  border-color: #7C5CFC;
  color: #7C5CFC;
}

.cat-pill.active {
  background: #624CE0;
  color: #FFFFFF;
  border-color: #624CE0;
  box-shadow: 0 4px 14px rgba(98, 76, 224, 0.25);
}

.cat-icon {
  font-size: 14px;
}

/* Age Filter Row */
.age-filter-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.age-filter-label {
  font-size: 13.5px;
  font-weight: 700;
  color: #1A1A2E;
}

.age-pills-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.age-pill {
  background: #FFFFFF;
  border: 1px solid #EAEAF2;
  color: #4A4A68;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 13px;
  padding: 6px 16px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.age-pill:hover {
  border-color: #FFD166;
  background: #FFFDF8;
}

.age-pill.active {
  background: #FFD166;
  color: #1A1A2E;
  border-color: #FFD166;
  box-shadow: 0 3px 10px rgba(255, 209, 102, 0.4);
}

/* Products Grid */
.products-grid-section {
  margin-bottom: 40px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}

.product-card {
  background: #FFFFFF;
  border-radius: 18px;
  padding: 14px;
  border: 1px solid #E8E5ED;
  box-shadow: 0 3px 14px rgba(31, 25, 58, 0.04);
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.product-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 32px rgba(124, 92, 252, 0.08);
  border-color: rgba(124, 92, 252, 0.2);
}

.product-img-wrap {
  position: relative;
  background: #FFFFFF;
  border-radius: 12px;
  height: 210px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 16px;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-img {
  transform: scale(1.04);
}

.product-status {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.01em;
}

.product-status--available {
  background: #DDF8D8;
  color: #277B3B;
}

.product-status--rent {
  background: #E8E2FF;
  color: #624CE0;
}

.product-status--preorder {
  background: #FFF0C7;
  color: #956300;
}

.card-fav-btn {
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  border-radius: 12px;
  background: #FFFFFF;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4A4A68;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: none;
}

.card-fav-btn:hover {
  transform: scale(1.1);
  background: #FFFFFF;
}

.card-fav-btn.active {
  color: #FF5A5F;
}

.product-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.product-title {
  min-height: 42px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #1A1A2E;
  margin-bottom: 10px;
  line-height: 1.45;
}

.product-price {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 20px;
  color: #747480;
  margin-bottom: 14px;
}

.product-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: auto;
}

.add-to-cart-btn {
  flex: 1;
  background: #624CE0;
  color: #FFFFFF;
  border: none;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 14px;
  padding: 12px;
  border-radius: 14px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(98, 76, 224, 0.25);
  transition: all 0.2s ease;
}

.add-to-cart-btn:hover {
  background: #513bc7;
  transform: translateY(-1px);
}

.add-to-cart-btn.added {
  background: #06D6A0;
  box-shadow: 0 4px 14px rgba(6, 214, 160, 0.25);
}

/* No Products */
.no-products-box {
  text-align: center;
  padding: 60px 20px;
  background: #FFFFFF;
  border-radius: 24px;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.no-prod-icon {
  font-size: 36px;
  margin-bottom: 12px;
  display: block;
}

.reset-filters-btn {
  margin-top: 16px;
  background: #7C5CFC;
  color: #FFFFFF;
  border: none;
  padding: 10px 22px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

/* Gift Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 26, 46, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.gift-modal {
  position: relative;
  background: #FFFFFF;
  width: 100%;
  max-width: 580px;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #F4F4F8;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4A4A68;
}

.modal-title {
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 6px;
}

.modal-desc {
  font-size: 14px;
  color: #7B7B93;
  margin-bottom: 24px;
  line-height: 1.45;
}

.gift-boxes-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.gift-box-card {
  position: relative;
  background: #F8F8FC;
  border: 1.5px solid #ECECF4;
  border-radius: 18px;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.gift-box-card.featured {
  border-color: #FFD166;
  background: #FFFDF8;
}

.gift-hot-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #FFD166;
  color: #1A1A2E;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 6px;
}

.gift-box-card h4 {
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 800;
  color: #1A1A2E;
  margin-bottom: 4px;
}

.gift-box-card p {
  font-size: 12.5px;
  color: #7B7B93;
  line-height: 1.35;
  margin-bottom: 14px;
  flex: 1;
}

.gift-box-price {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 20px;
  color: #7C5CFC;
  margin-bottom: 12px;
}

.gift-add-btn {
  background: #624CE0;
  color: #FFFFFF;
  border: none;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 13px;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.gift-add-btn:hover {
  background: #513bc7;
}

/* Responsive */
@media (max-width: 1100px) {
  .catalog-layout {
    grid-template-columns: 220px minmax(0, 1fr);
    gap: 22px;
  }

  .products-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 860px) {
  .catalog-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 20px;
  }

  .catalog-gift-link {
    width: 100%;
  }

  .catalog-layout {
    grid-template-columns: 1fr;
  }

  .catalog-filters {
    position: static;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0 22px;
  }

  .catalog-filters__top,
  .catalog-all-link {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 14px;
  }

  .page-content {
    padding-top: 20px;
  }

  .catalog-breadcrumbs {
    margin-bottom: 18px;
  }

  .catalog-heading {
    padding-bottom: 20px;
  }

  .catalog-heading__title-row {
    display: block;
  }

  .catalog-heading__title-row > span {
    display: block;
    margin-top: 6px;
  }

  .catalog-heading p {
    font-size: 13px;
  }

  .catalog-quick-links {
    margin-right: -14px;
    padding-right: 14px;
  }

  .catalog-filters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding: 18px 16px;
  }

  .shop-header-section {
    flex-direction: column;
    margin-bottom: 20px;
    gap: 16px;
  }

  .shop-main-title {
    font-size: 24px;
    line-height: 1.25;
  }

  .shop-description {
    font-size: 13.5px;
    line-height: 1.5;
  }
  
  .shop-toolbar-row {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    margin-bottom: 14px;
  }

  .search-input-wrap {
    width: 100%;
  }

  .sort-wrap {
    width: 100%;
    justify-content: space-between;
  }

  .sort-select-btn {
    flex: 1;
    justify-content: space-between;
  }

  .gift-card {
    max-width: 100%;
    width: 100%;
    padding: 14px 16px;
  }

  /* Horizontal Scrolling Category Chips */
  .categories-row {
    display: flex;
    overflow-x: auto;
    flex-wrap: nowrap;
    gap: 8px;
    padding: 4px 2px 10px 2px;
    margin-bottom: 12px;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    width: 100%;
  }

  .categories-row::-webkit-scrollbar {
    display: none;
  }

  .cat-pill {
    flex-shrink: 0;
    white-space: nowrap;
    padding: 7px 14px;
    font-size: 12.5px;
  }

  /* Horizontal Scrolling Age Chips */
  .age-filter-row {
    margin-bottom: 18px;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .age-filter-label {
    font-size: 12.5px;
  }

  .age-pills-list {
    display: flex;
    overflow-x: auto;
    flex-wrap: nowrap;
    gap: 6px;
    padding-bottom: 4px;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    width: 100%;
  }

  .age-pills-list::-webkit-scrollbar {
    display: none;
  }

  .age-pill {
    flex-shrink: 0;
    white-space: nowrap;
    padding: 5px 12px;
    font-size: 12px;
  }

  /* 2-Column Product Grid */
  .products-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 10px;
  }

  .product-card {
    padding: 10px;
    border-radius: 18px;
  }

  .product-img-wrap {
    height: 135px;
    border-radius: 14px;
    margin-bottom: 10px;
  }

  .product-status {
    top: 6px;
    right: 6px;
    font-size: 9.5px;
    padding: 4px 7px;
  }

  .product-title {
    font-size: 13px;
    line-height: 1.25;
    margin-bottom: 4px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .product-price {
    font-size: 14.5px;
    font-weight: 800;
    margin-bottom: 8px;
  }

  .add-to-cart-btn {
    padding: 8px 10px;
    font-size: 12px;
    border-radius: 10px;
  }

  .card-fav-btn {
    width: 36px;
    height: 36px;
    flex-basis: 36px;
  }

  .gift-boxes-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .catalog-gift-link {
    min-width: 0;
  }

  .catalog-filters {
    grid-template-columns: 1fr;
  }

  .catalog-filters__top,
  .catalog-all-link {
    grid-column: auto;
  }

  .catalog-all-link {
    grid-column: 1 / -1;
  }

  .products-grid {
    grid-template-columns: 1fr !important;
  }

  .product-img-wrap {
    height: 210px;
  }

  .catalog-pagination {
    flex-wrap: wrap;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
