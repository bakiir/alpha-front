<template>
  <div class="shop-page">
    <TheHeader />

    <main class="container page-content">
      <!-- Section Header -->
      <section class="shop-header-section">
        <!-- Left Title & Description -->
        <div class="header-left">
          <h1 class="shop-main-title">Развивающие игрушки<br />Монтессори</h1>
          <p class="shop-description">
            Каждая игрушка создана из натурального дерева, сертифицирована экспертами
            и бережно обработана вручную. Подарите ребенку качественное и безопасное
            развитие.
          </p>
        </div>

        <!-- Right Gift Sets Card -->
        <div class="gift-card" @click="isGiftModalOpen = true">
          <div class="gift-icon-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1A1A2E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 12 20 22 4 22 4 12"></polyline>
              <rect x="2" y="7" width="20" height="5"></rect>
              <line x1="12" y1="22" x2="12" y2="7"></line>
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
            </svg>
          </div>
          <div class="gift-text">
            <h3 class="gift-title">Подарочные наборы</h3>
            <p class="gift-sub">Подберем готовые решения к любому празднику!</p>
          </div>
        </div>
      </section>

      <!-- Search and Sort Toolbar -->
      <section class="shop-toolbar-row">
        <!-- Search Input -->
        <div class="search-input-wrap">
          <svg class="search-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#A0A0B8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7"></circle>
            <line x1="21" y1="21" x2="16.5" y2="16.5"></line>
          </svg>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Поиск игрушек..." 
            class="shop-search-input"
          />
          <button v-if="searchQuery" class="clear-search-btn" @click="searchQuery = ''">&times;</button>
        </div>

        <!-- Sort Dropdown -->
        <div class="sort-wrap">
          <span class="sort-label">Сортировка:</span>
          <div class="sort-select-btn" @click="isSortDropdownOpen = !isSortDropdownOpen">
            <strong>{{ currentSortLabel }}</strong>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>

            <!-- Dropdown Options -->
            <div v-if="isSortDropdownOpen" class="sort-dropdown-menu">
              <div 
                v-for="option in sortOptions" 
                :key="option.value" 
                class="sort-option"
                :class="{ active: currentSort === option.value }"
                @click.stop="selectSort(option)"
              >
                {{ option.label }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Skill / Category Filter Pills -->
      <section class="categories-row">
        <button 
          v-for="cat in categories" 
          :key="cat.id"
          class="cat-pill"
          :class="{ active: activeCategory === cat.id }"
          @click="activeCategory = cat.id"
        >
          <span v-if="cat.icon" class="cat-icon">{{ cat.icon }}</span>
          <span>{{ cat.name }}</span>
        </button>
      </section>

      <!-- Age Filter Row -->
      <section class="age-filter-row">
        <span class="age-filter-label">Возраст ребенка:</span>
        <div class="age-pills-list">
          <button 
            v-for="age in ageGroups" 
            :key="age.id"
            class="age-pill"
            :class="{ active: activeAge === age.id }"
            @click="toggleAge(age.id)"
          >
            {{ age.label }}
          </button>
        </div>
      </section>

      <!-- Castle Wooden Hero Banner -->
      <section class="shop-hero-banner">
        <img 
          src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1400&q=80" 
          alt="Развивающий деревянный замок" 
          class="hero-banner-img"
        />
        <div class="hero-banner-overlay">
          <div class="hero-tag">НОВАЯ КОЛЛЕКЦИЯ 2026</div>
          <h2 class="hero-title">Деревянный Замок «Монтессори Архитектор»</h2>
          <p class="hero-subtitle">64 детали из бука и ясеня с натуральным восковым покрытием.</p>
          <button 
            class="hero-buy-btn"
            @click="addItem({ id: 99, title: 'Деревянный Замок «Монтессори Архитектор»', price: 18900, image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=500&q=80' })"
          >
            В корзину • 18 900 ₸
          </button>
        </div>
      </section>

      <!-- Products Grid -->
      <section class="products-grid-section">
        <div v-if="filteredProducts.length > 0" class="products-grid">
          <div 
            v-for="product in filteredProducts" 
            :key="product.id"
            class="product-card"
          >
            <!-- Image Area -->
            <div class="product-img-wrap" @click="navigateToProduct(product)">
              <img :src="product.image" :alt="product.title" class="product-img" />
              <span v-if="product.age" class="card-age-tag">{{ product.age }}</span>
            </div>

            <!-- Content Area -->
            <div class="product-info">
              <h3 class="product-title clickable" @click="navigateToProduct(product)">{{ product.title }}</h3>
              
              <div class="product-rating">
                <span class="rating-val">★ {{ product.rating }}</span>
                <span class="rating-dot">•</span>
                <span class="rating-text">{{ product.reviewsCount }} отзывов</span>
              </div>

              <div class="product-price">{{ formatPrice(product.numericPrice) }} ₸</div>

              <button 
                class="add-to-cart-btn" 
                :class="{ added: addedProducts.includes(product.id) }"
                @click="handleAddToCart(product)"
              >
                {{ addedProducts.includes(product.id) ? 'Добавлено ✓' : 'В корзину' }}
              </button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TheHeader from '~/components/TheHeader.vue'

const { addItem } = useCart()

const searchQuery = ref('')
const activeCategory = ref('all')
const activeAge = ref('1-2')
const currentSort = ref('popular')
const isSortDropdownOpen = ref(false)
const isGiftModalOpen = ref(false)
const addedProducts = ref<number[]>([])

const categories = [
  { id: 'all', name: 'Все категории' },
  { id: 'motor', name: 'Моторика', icon: '🧩' },
  { id: 'logic', name: 'Логика', icon: '🧠' },
  { id: 'creativity', name: 'Творчество', icon: '🎨' },
  { id: 'sensory', name: 'Сенсорика', icon: '🌈' },
  { id: 'speech', name: 'Речь', icon: '🗣️' },
]

const ageGroups = [
  { id: '0-1', label: '0–1 года' },
  { id: '1-2', label: '1–2 года' },
  { id: '2-3', label: '2–3 года' },
  { id: '3-4', label: '3–4 года' },
  { id: '4-6', label: '4–6 лет' },
]

const sortOptions = [
  { value: 'popular', label: 'Сначала популярные' },
  { value: 'price-asc', label: 'По возрастанию цены' },
  { value: 'price-desc', label: 'По убыванию цены' },
  { value: 'rating', label: 'По высокому рейтингу' },
]

const currentSortLabel = computed(() => {
  return sortOptions.find(o => o.value === currentSort.value)?.label || 'Сначала популярные'
})

const selectSort = (option: { value: string; label: string }) => {
  currentSort.value = option.value
  isSortDropdownOpen.value = false
}

const toggleAge = (ageId: string) => {
  if (activeAge.value === ageId) {
    activeAge.value = ''
  } else {
    activeAge.value = ageId
  }
}

interface Product {
  id: number
  title: string
  rating: string
  reviewsCount: number
  numericPrice: number
  image: string
  category: string[]
  age: string
}

const products = ref<Product[]>([
  {
    id: 1,
    title: 'Балансир Лунный Кот',
    rating: '4.9',
    reviewsCount: 24,
    numericPrice: 8900,
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=500&q=80',
    category: ['all', 'motor', 'sensory'],
    age: '1–2 года'
  },
  {
    id: 2,
    title: 'Пазл Алфавит Монтессори',
    rating: '4.8',
    reviewsCount: 42,
    numericPrice: 12500,
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=500&q=80',
    category: ['all', 'speech', 'logic', 'motor'],
    age: '1–2 года'
  },
  {
    id: 3,
    title: 'Деревянный Оркестр',
    rating: '4.8',
    reviewsCount: 19,
    numericPrice: 15900,
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=500&q=80',
    category: ['all', 'sensory', 'creativity'],
    age: '1–2 года'
  },
  {
    id: 4,
    title: 'Бизиборд Альфа куб',
    rating: '4.8',
    reviewsCount: 56,
    numericPrice: 24900,
    image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=500&q=80',
    category: ['all', 'motor', 'logic'],
    age: '1–2 года'
  },
  {
    id: 5,
    title: 'Деревянная Башня-Пирамидка',
    rating: '4.9',
    reviewsCount: 31,
    numericPrice: 6500,
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=500&q=80',
    category: ['all', 'motor', 'logic'],
    age: '0–1 года'
  },
  {
    id: 6,
    title: 'Сенсорные Мешочки Монтессори',
    rating: '4.7',
    reviewsCount: 15,
    numericPrice: 7900,
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=500&q=80',
    category: ['all', 'sensory', 'motor'],
    age: '0–1 года'
  },
  {
    id: 7,
    title: 'Геометрический Сортер 4в1',
    rating: '4.9',
    reviewsCount: 68,
    numericPrice: 9900,
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=500&q=80',
    category: ['all', 'logic', 'motor'],
    age: '2–3 года'
  },
  {
    id: 8,
    title: 'Набор Юного Столяра',
    rating: '4.8',
    reviewsCount: 29,
    numericPrice: 14500,
    image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=500&q=80',
    category: ['all', 'creativity', 'motor'],
    age: '3–4 года'
  }
])

const filteredProducts = computed(() => {
  let list = products.value

  // Search filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(p => p.title.toLowerCase().includes(q))
  }

  // Category filter
  if (activeCategory.value !== 'all') {
    list = list.filter(p => p.category.includes(activeCategory.value))
  }

  // Age filter
  if (activeAge.value) {
    const ageMap: Record<string, string> = {
      '0-1': '0–1 года',
      '1-2': '1–2 года',
      '2-3': '2–3 года',
      '3-4': '3–4 года',
      '4-6': '4–6 лет',
    }
    const targetAge = ageMap[activeAge.value]
    if (targetAge) {
      list = list.filter(p => p.age === targetAge)
    }
  }

  // Sorting
  if (currentSort.value === 'price-asc') {
    list = [...list].sort((a, b) => a.numericPrice - b.numericPrice)
  } else if (currentSort.value === 'price-desc') {
    list = [...list].sort((a, b) => b.numericPrice - a.numericPrice)
  } else if (currentSort.value === 'rating') {
    list = [...list].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
  }

  return list
})

const formatPrice = (val: number) => {
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

const handleAddToCart = (product: Product) => {
  addItem({
    id: product.id,
    title: product.title,
    price: product.numericPrice,
    image: product.image
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
  activeAge.value = ''
}

const navigateToProduct = (product: Product) => {
  navigateTo(`/product/${product.id}`)
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

/* Hero Banner */
.shop-hero-banner {
  position: relative;
  border-radius: 28px;
  overflow: hidden;
  height: 280px;
  margin-bottom: 36px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
}

.hero-banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-banner-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(26, 26, 46, 0.8) 0%, rgba(26, 26, 46, 0.3) 60%, transparent 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 40px;
  color: #FFFFFF;
}

.hero-tag {
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 1px;
  color: #FFD166;
  margin-bottom: 8px;
}

.hero-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 26px;
  color: #FFFFFF;
  margin-bottom: 6px;
  max-width: 480px;
}

.hero-subtitle {
  font-size: 13.5px;
  color: #E2E2EC;
  margin-bottom: 20px;
  max-width: 440px;
}

.hero-buy-btn {
  background: #624CE0;
  color: #FFFFFF;
  border: none;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 14px;
  padding: 11px 24px;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(98, 76, 224, 0.35);
  transition: all 0.2s ease;
}

.hero-buy-btn:hover {
  background: #513bc7;
  transform: translateY(-1px);
}

/* Products Grid */
.products-grid-section {
  margin-bottom: 40px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 22px;
}

.product-card {
  background: #FFFFFF;
  border-radius: 24px;
  padding: 16px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
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
  background: #F4F8FC;
  border-radius: 18px;
  height: 190px;
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

.card-age-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  color: #1A1A2E;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 8px;
}

.product-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.product-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 16.5px;
  color: #1A1A2E;
  margin-bottom: 4px;
  line-height: 1.3;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: #7B7B93;
  margin-bottom: 12px;
}

.rating-val {
  font-weight: 700;
  color: #1A1A2E;
}

.rating-dot {
  font-size: 10px;
}

.product-price {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 20px;
  color: #624CE0;
  margin-bottom: 16px;
}

.add-to-cart-btn {
  margin-top: auto;
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
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .shop-header-section {
    flex-direction: column;
  }
  
  .shop-toolbar-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-input-wrap {
    width: 100%;
  }

  .gift-card {
    max-width: 100%;
    width: 100%;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }

  .gift-boxes-grid {
    grid-template-columns: 1fr;
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
