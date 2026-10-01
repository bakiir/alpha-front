<template>
  <div class="shop-page">
    <TheHeader />

    <main v-if="featureBlocked" class="container page-content">
      <FeatureUnavailable
        title="Магазин временно недоступен"
        description="Каталог покупки сейчас скрыт. Посмотрите подписку или другие открытые разделы."
      />
    </main>

    <main v-else class="container page-content">
      <div v-if="isGiftMode" class="gift-mode-banner">
        <AppIcon name="gift" :size="28" class="gift-mode-icon" />
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
        <template v-if="activeCategoryNode?.parentSlug">
          <span>›</span>
          <button type="button" @click="selectCategory(activeCategoryNode.parentSlug!)">
            {{ activeCategoryNode.parentName }}
          </button>
          <span>›</span>
          <strong>{{ activeCategoryNode.name }}</strong>
        </template>
        <template v-else-if="activeCategory !== 'all'">
          <span>›</span>
          <strong>{{ currentCatalogTitle }}</strong>
        </template>
      </nav>

      <section class="catalog-heading">
        <div>
          <span class="catalog-heading__eyebrow">КАТАЛОГ ALPHA</span>
          <div class="catalog-heading__title-row">
            <h1>{{ currentCatalogTitle }}</h1>
            <span>{{ catalogDisplayCount }} {{ catalogCountSuffix }}</span>
          </div>
          <p>Выбирайте игрушки по типу, возрасту и навыкам ребёнка. Все фильтры работают одновременно.</p>
        </div>
        <NuxtLink to="/gift-boxes" class="catalog-gift-link">
          <AppIcon name="gift" :size="22" aria-hidden="true" />
          <span><strong>Подарочные боксы</strong><small>Готовые наборы к празднику</small></span>
          <span aria-hidden="true">→</span>
        </NuxtLink>
      </section>


      <div class="catalog-mobile-bar">
        <button type="button" class="catalog-mobile-filters-btn" @click="filtersDrawerOpen = true">
          Фильтры
          <span v-if="activeCustomFilterCount + (hasActiveFilters ? 1 : 0)" class="catalog-mobile-filters-btn__badge">
            {{ activeFilterChipCount }}
          </span>
        </button>
      </div>

      <div
        v-if="filtersDrawerOpen"
        class="catalog-filters-backdrop"
        @click="filtersDrawerOpen = false"
      />

      <div class="catalog-layout">
        <aside
          class="catalog-filters"
          :class="{ 'catalog-filters--drawer-open': filtersDrawerOpen }"
          aria-label="Фильтры каталога"
        >
          <div class="catalog-filters__top">
            <h2>Фильтры</h2>
            <div class="catalog-filters__top-actions">
              <button v-if="hasActiveFilters" type="button" @click="resetFilters">Сбросить</button>
              <button type="button" class="catalog-filters__close" @click="filtersDrawerOpen = false">Закрыть</button>
            </div>
          </div>

          <nav class="category-tree" aria-label="Категории">
            <button
              type="button"
              class="category-tree__all"
              :class="{ active: activeCategory === 'all' }"
              @click="clearCategoryFilter"
            >
              <span>Все категории</span>
              <span class="category-tree__count">({{ sidebarCatalogCount }})</span>
            </button>

            <ul class="category-tree__list">
              <li
                v-for="category in visibleCategoryTree"
                :key="category.slug"
                class="category-tree__node"
              >
                <div class="category-tree__row" :class="{ active: activeCategory === category.slug }">
                  <button
                    v-if="category.showExpand"
                    type="button"
                    class="category-tree__expand"
                    :class="{ 'is-open': category.childrenVisible }"
                    :aria-expanded="category.childrenVisible"
                    :aria-label="category.childrenVisible ? 'Свернуть' : 'Развернуть'"
                    @click="toggleCategoryExpand(category.slug)"
                  />
                  <span v-else class="category-tree__bullet" aria-hidden="true" />
                  <button
                    type="button"
                    class="category-tree__link"
                    :class="{ active: activeCategory === category.slug }"
                    @click="selectCategory(category.slug)"
                  >
                    <span>{{ category.name }}</span>
                    <span class="category-tree__count">({{ categoryCountLabel(category.slug) }})</span>
                  </button>
                </div>

                <ul
                  v-if="category.childrenVisible && category.visibleChildren.length"
                  class="category-tree__children"
                >
                  <li
                    v-for="child in category.visibleChildren"
                    :key="child.slug"
                    class="category-tree__node category-tree__node--child"
                  >
                    <div class="category-tree__row" :class="{ active: activeCategory === child.slug }">
                      <span class="category-tree__bullet" aria-hidden="true" />
                      <button
                        type="button"
                        class="category-tree__link"
                        :class="{ active: activeCategory === child.slug }"
                        @click="selectCategory(child.slug)"
                      >
                        <span>{{ child.name }}</span>
                        <span class="category-tree__count">({{ categoryCountLabel(child.slug) }})</span>
                      </button>
                    </div>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>

          <div class="catalog-filters__section-label">Характеристики</div>

          <div class="filter-group" :class="{ 'is-open': isFilterOpen('age'), 'has-value': Boolean(selectedAge) }">
            <button type="button" class="filter-group__toggle" :aria-expanded="isFilterOpen('age')" @click="toggleFilterSection('age')">
              <span>Возраст</span>
              <span v-if="selectedAge" class="filter-group__badge">1</span>
              <span class="filter-group__chevron" aria-hidden="true" />
            </button>
            <div v-show="isFilterOpen('age')" class="filter-group__body">
              <button
                v-for="age in ageOptions"
                :key="age.id"
                type="button"
                class="filter-option filter-option--age"
                :class="{
                  active: selectedAge === age.id,
                  'filter-option--empty': ageCount(age.id) === 0,
                }"
                :disabled="ageCount(age.id) === 0 && selectedAge !== age.id"
                @click="toggleAge(age.id)"
              >
                <span class="filter-checkbox">✓</span>
                <span>{{ age.label }}</span>
                <small>({{ ageCountLabel(age.id) }})</small>
              </button>
            </div>
          </div>

          <div class="filter-group" :class="{ 'is-open': isFilterOpen('skills'), 'has-value': selectedSkills.length > 0 }">
            <button type="button" class="filter-group__toggle" :aria-expanded="isFilterOpen('skills')" @click="toggleFilterSection('skills')">
              <span>Навыки</span>
              <span v-if="selectedSkills.length" class="filter-group__badge">{{ selectedSkills.length }}</span>
              <span class="filter-group__chevron" aria-hidden="true" />
            </button>
            <div v-show="isFilterOpen('skills')" class="filter-group__body filter-group__body--scroll">
              <button
                v-for="skill in skills"
                :key="skill.slug"
                type="button"
                class="filter-option"
                :class="{ active: selectedSkills.includes(skill.slug) }"
                @click="toggleSkill(skill.slug)"
              >
                <span class="filter-checkbox">✓</span>
                <span>{{ skill.name }}</span>
              </button>
              <p v-if="skillsLoaded && !skills.length" class="filter-hint">Навыки пока не добавлены.</p>
            </div>
          </div>

          <div class="filter-group" :class="{ 'is-open': isFilterOpen('interests'), 'has-value': selectedInterests.length > 0 }">
            <button type="button" class="filter-group__toggle" :aria-expanded="isFilterOpen('interests')" @click="toggleFilterSection('interests')">
              <span>Интересы</span>
              <span v-if="selectedInterests.length" class="filter-group__badge">{{ selectedInterests.length }}</span>
              <span class="filter-group__chevron" aria-hidden="true" />
            </button>
            <div v-show="isFilterOpen('interests')" class="filter-group__body filter-group__body--scroll">
              <button
                v-for="interest in interests"
                :key="interest.slug"
                type="button"
                class="filter-option"
                :class="{ active: selectedInterests.includes(interest.slug) }"
                @click="toggleInterest(interest.slug)"
              >
                <span class="filter-checkbox">✓</span>
                <span>{{ interest.name }}</span>
              </button>
              <p v-if="interestsLoaded && !interests.length" class="filter-hint">Интересы пока не добавлены.</p>
            </div>
          </div>

          <div class="filter-group" :class="{ 'is-open': isFilterOpen('availability'), 'has-value': availability !== 'all' }">
            <button type="button" class="filter-group__toggle" :aria-expanded="isFilterOpen('availability')" @click="toggleFilterSection('availability')">
              <span>Как получить</span>
              <span v-if="availability !== 'all'" class="filter-group__badge">1</span>
              <span class="filter-group__chevron" aria-hidden="true" />
            </button>
            <div v-show="isFilterOpen('availability')" class="filter-group__body">
              <label class="availability-option">
                <input v-model="availability" type="radio" value="all" />
                <span>Все, включая предзаказ</span>
              </label>
              <label class="availability-option">
                <input v-model="availability" type="radio" value="available" />
                <span>Только в наличии</span>
              </label>
            </div>
          </div>

          <div class="filter-group" :class="{ 'is-open': isFilterOpen('price'), 'has-value': Boolean(priceFrom) || hasPriceToFilter }">
            <button type="button" class="filter-group__toggle" :aria-expanded="isFilterOpen('price')" @click="toggleFilterSection('price')">
              <span>Цена</span>
              <span v-if="priceFrom || hasPriceToFilter" class="filter-group__badge">1</span>
              <span class="filter-group__chevron" aria-hidden="true" />
            </button>
            <div v-show="isFilterOpen('price')" class="filter-group__body">
              <div class="price-filter">
                <label><span>от</span><input v-model.number="priceFrom" type="number" min="0" :max="catalogMaxPrice ?? undefined" placeholder="0" /></label>
                <label><span>до</span><input v-model.number="priceTo" type="number" min="0" :max="catalogMaxPrice ?? undefined" :placeholder="catalogMaxPrice === null ? '—' : String(catalogMaxPrice)" /></label>
              </div>
            </div>
          </div>

          <div class="filter-group" :class="{ 'is-open': isFilterOpen('brand'), 'has-value': Boolean(selectedBrand) }">
            <button type="button" class="filter-group__toggle" :aria-expanded="isFilterOpen('brand')" @click="toggleFilterSection('brand')">
              <span>Бренд</span>
              <span v-if="selectedBrand" class="filter-group__badge">1</span>
              <span class="filter-group__chevron" aria-hidden="true" />
            </button>
            <div v-show="isFilterOpen('brand')" class="filter-group__body">
              <select id="catalog-brand" class="catalog-select" :value="selectedBrand" @change="setCatalogFilter('brand', ($event.target as HTMLSelectElement).value)">
                <option value="">Все бренды</option>
                <option v-if="selectedBrand && !brands.includes(selectedBrand)" :value="selectedBrand">{{ selectedBrand }}</option>
                <option v-for="brand in brands" :key="brand" :value="brand">{{ brand }}</option>
              </select>
              <p v-if="brandsError" class="filter-hint">Не удалось загрузить параметры фильтров. <button type="button" @click="loadFilterOptions">Повторить</button></p>
              <p v-else-if="brandsLoaded && !brands.length" class="filter-hint">Бренды пока не указаны у товаров.</p>
            </div>
          </div>

          <div
            v-for="filter in customFilterDefs"
            :key="filter.code"
            class="filter-group"
            :class="{ 'is-open': isFilterOpen(`attr:${filter.code}`), 'has-value': hasCustomFilterValue(filter.code) }"
          >
            <button
              type="button"
              class="filter-group__toggle"
              :aria-expanded="isFilterOpen(`attr:${filter.code}`)"
              @click="toggleFilterSection(`attr:${filter.code}`)"
            >
              <span>{{ filterLabel(filter) }}</span>
              <span v-if="customFilterSelectionCount(filter.code)" class="filter-group__badge">
                {{ customFilterSelectionCount(filter.code) }}
              </span>
              <span class="filter-group__chevron" aria-hidden="true" />
            </button>
            <div v-show="isFilterOpen(`attr:${filter.code}`)" class="filter-group__body filter-group__body--scroll">
              <template v-if="filter.type === 'multi_enum' || filter.type === 'enum'">
                <button
                  v-for="opt in (filter.options || [])"
                  :key="opt.value"
                  type="button"
                  class="filter-option"
                  :class="{
                    active: isCustomOptionSelected(filter.code, opt.value),
                    'filter-option--empty': (opt.count ?? 0) === 0,
                  }"
                  :disabled="(opt.count ?? 0) === 0 && !isCustomOptionSelected(filter.code, opt.value)"
                  @click="toggleCustomOption(filter, opt.value)"
                >
                  <span class="filter-checkbox">✓</span>
                  <span>{{ opt.label }}</span>
                  <small v-if="opt.count != null">({{ opt.count }})</small>
                </button>
              </template>
              <template v-else-if="filter.type === 'number'">
                <input
                  class="catalog-select"
                  type="number"
                  :value="customFilterValues[filter.code] || ''"
                  :placeholder="filter.unit ? `Значение, ${filter.unit}` : 'Значение'"
                  @change="setCustomScalar(filter.code, ($event.target as HTMLInputElement).value)"
                >
              </template>
              <template v-else-if="filter.type === 'range'">
                <div class="price-filter">
                  <input
                    class="catalog-select"
                    type="number"
                    :value="customRangeMin(filter.code)"
                    placeholder="от"
                    @change="setCustomRange(filter.code, 'min', ($event.target as HTMLInputElement).value)"
                  >
                  <input
                    class="catalog-select"
                    type="number"
                    :value="customRangeMax(filter.code)"
                    placeholder="до / значение"
                    @change="setCustomRange(filter.code, 'max', ($event.target as HTMLInputElement).value)"
                  >
                </div>
                <p class="filter-hint">Для роста/веса достаточно одного значения — «до» или одно поле.</p>
              </template>
              <template v-else-if="filter.type === 'boolean'">
                <button
                  type="button"
                  class="filter-option"
                  :class="{ active: customFilterValues[filter.code] === '1' }"
                  @click="setCustomScalar(filter.code, customFilterValues[filter.code] === '1' ? '' : '1')"
                >
                  <span class="filter-checkbox">✓</span>
                  <span>Да</span>
                </button>
                <button
                  type="button"
                  class="filter-option"
                  :class="{ active: customFilterValues[filter.code] === '0' }"
                  @click="setCustomScalar(filter.code, customFilterValues[filter.code] === '0' ? '' : '0')"
                >
                  <span class="filter-checkbox">✓</span>
                  <span>Нет</span>
                </button>
              </template>
            </div>
          </div>
        </aside>

        <div class="catalog-results">
          <section class="shop-toolbar-row">
            <div class="search-input-wrap">
              <svg class="search-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#A0A0B8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="7"></circle>
                <line x1="21" y1="21" x2="16.5" y2="16.5"></line>
              </svg>
              <input v-model="searchQuery" type="text" placeholder="Поиск по названию или артикулу..." class="shop-search-input" />
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
        <div v-else-if="catalogLoadError" class="catalog-empty-state" role="alert">
          <p>Не удалось загрузить игрушки. Попробуйте ещё раз.</p>
          <button type="button" class="reset-filters-btn" @click="loadProducts">Повторить</button>
        </div>
        <div v-else-if="filteredProducts.length === 0" class="no-products-box">
          <AppIcon name="search" :size="40" class="no-prod-icon" />
          <h3>Игрушек не найдено</h3>
          <p>Попробуйте сбросить фильтры или изменить поисковый запрос.</p>
          <button class="reset-filters-btn" @click="resetFilters">Сбросить все фильтры</button>
        </div>
        <div v-else class="products-grid">
          <article
            v-for="product in paginatedProducts"
            :key="product.id"
            class="product-card"
          >
            <!-- Image Area -->
            <div class="product-img-wrap">
              <button
                type="button"
                class="product-image-link"
                :aria-label="`Открыть «${product.title}»`"
                @click="navigateToProduct(product)"
              >
                <AppImage :src="product.image" :alt="product.title" custom-class="product-img" :lazy="true" />
              </button>
              <span
                v-if="canPreorderProduct(product)"
                class="product-status product-status--preorder"
              >
                Предзаказ
              </span>
              <button
                type="button"
                class="card-fav-btn"
                :class="{ active: isFavorite(product.id) }"
                :aria-label="isFavorite(product.id) ? `Убрать «${product.title}» из избранного` : `Добавить «${product.title}» в избранное`"
                @click.stop="toggleFavorite({ id: product.id, title: product.title, price: product.numericPrice, image: product.image })"
              >
                <AppIcon name="heart" :size="20" />
              </button>
            </div>

            <!-- Content Area -->
            <div class="product-info">
              <div class="product-meta">
                <span>{{ product.categoryName }}</span>
                <span aria-hidden="true">·</span>
                <span>{{ product.age }}</span>
              </div>
              <h3 class="product-title">
                <button type="button" @click="navigateToProduct(product)">{{ product.title }}</button>
              </h3>
              <p v-if="product.sku" class="product-sku">Арт. {{ product.sku }}</p>

              <div class="product-actions">
                <div class="product-price-wrap">
                  <strong class="product-price">{{ formatPrice(product.numericPrice) }} ₸</strong>
                  <span>{{ isGiftMode ? 'с упаковкой' : 'за игрушку' }}</span>
                </div>
                <button
                  class="add-to-cart-btn"
                  :class="{ added: addedProducts.includes(product.id) }"
                  :disabled="!canAddProduct(product) && !canPreorderProduct(product)"
                  :aria-label="canPreorderProduct(product)
                    ? `Оформить предзаказ «${product.title}»`
                    : (addedProducts.includes(product.id) ? `«${product.title}» добавлено в корзину` : `Добавить «${product.title}» в корзину`)"
                  :title="canPreorderProduct(product) ? 'Предзаказ' : (addedProducts.includes(product.id) ? 'Добавлено' : 'Добавить в корзину')"
                  @click="handleAddToCart(product)"
                >
                  <AppIcon :name="addedProducts.includes(product.id) ? 'check' : (canPreorderProduct(product) ? 'clock' : (isGiftMode ? 'gift' : 'cart'))" :size="20" />
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>

          <nav v-if="totalPages > 1" class="catalog-pagination" aria-label="Страницы каталога">
            <button type="button" :disabled="activePaginationPage === 1" @click="goToPage(activePaginationPage - 1)">←</button>
            <template v-for="(page, index) in visiblePages" :key="`${page}-${index}`">
              <span v-if="page === 'ellipsis'" class="catalog-pagination__ellipsis">…</span>
              <button
                v-else
                type="button"
                :class="{ active: activePaginationPage === page }"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
            </template>
            <button type="button" :disabled="activePaginationPage === totalPages" @click="goToPage(activePaginationPage + 1)">→</button>
          </nav>
        </div>
      </div>
    </main>

    <!-- TheFooter -->
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import type { CatalogFilterDef } from '~/composables/useCatalogFilters'
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TheHeader from '~/components/TheHeader.vue'
import TheFooter from '~/components/TheFooter.vue'
import { resolveMediaUrl } from '~/utils/mediaUrl'

const route = useRoute()
const router = useRouter()
const runtimeConfig = useRuntimeConfig()
const apiBase = runtimeConfig.public.apiBase as string
usePageSeo('/shop')
const { addItem } = useCart()
const { success: toastSuccess, error: toastError } = useToast()
const { isFavorite, toggleFavorite } = useFavorites()
const { categories, labelBySlug, findBySlug, loadCategories } = useToyCategories()
const { skills, labelBySlug: skillLabelBySlug, loadSkills } = useSkills()
const skillsLoaded = ref(false)
const { interests, labelBySlug: interestLabelBySlug, loadInterests } = useInterests()
const interestsLoaded = ref(false)
const { fetchFilterSchema, filterLabel } = useCatalogFilters()
const filtersDrawerOpen = ref(false)
const schemaFilters = ref<CatalogFilterDef[]>([])
const customFilterValues = ref<Record<string, string>>({})
const customFilterDefs = computed(() =>
  schemaFilters.value.filter(f => f.type !== 'builtin'),
)
const activeCustomFilterCount = computed(() =>
  Object.values(customFilterValues.value).filter(Boolean).length,
)
const { isVisible } = useFeatures()
const featureBlocked = computed(() => !isVisible('shop'))
const { fetchToys } = useToys()
const { request: catalogRequest } = useApi()

const searchQuery = ref('')
const activeCategory = ref('all')
const selectedSkills = ref<string[]>([])
const selectedInterests = ref<string[]>([])
const priceFrom = ref<number | null>(null)
const priceTo = ref<number | null>(null)
const catalogMaxPrice = ref<number | null>(null)
const availability = ref<'available' | 'all'>('all')
const currentSort = ref('popular')
const currentPage = ref(1)
const itemsPerPage = 12
const brands = ref<string[]>([])
const brandsLoaded = ref(false)
const brandsError = ref(false)
const selectedBrand = computed(() => typeof route.query.brand === 'string' ? route.query.brand : '')
const ageOptions = [
  { id: '0-12m', label: '0–12 мес', from: 0, to: 11 },
  { id: '1+', label: '1 год+', from: 12, to: 216 },
  { id: '2+', label: '2 года+', from: 24, to: 216 },
  { id: '3+', label: '3 года+', from: 36, to: 216 },
  { id: '4+', label: '4 года+', from: 48, to: 216 },
  { id: '6+', label: '6 лет+', from: 72, to: 216 },
] as const
const ageCounts = ref<Record<string, number>>({})
const ageCountsLoaded = ref(false)
const categoryCounts = ref<Record<string, number>>({})
const catalogTotalCount = ref<number | null>(null)
const expandedCategorySlugs = ref<string[]>([])
const selectedAge = computed(() => ageOptions.some(age => age.id === route.query.age) ? String(route.query.age) : '')
const ageCount = (id: string) => ageCounts.value[id] ?? 0
const ageCountLabel = (id: string) => (ageCountsLoaded.value ? String(ageCount(id)) : '…')
const categoryCount = (slug: string) => categoryCounts.value[slug] ?? 0
const categoryCountLabel = (slug: string) => (
  Object.keys(categoryCounts.value).length ? String(categoryCount(slug)) : '…'
)
const toggleAge = (id: string) => {
  setCatalogFilter('age', selectedAge.value === id ? '' : id)
}
const setCatalogFilter = (key: string, value: string) => {
  updateRouteQuery(query => {
    delete query.page
    if (value) query[key] = value
    else delete query[key]
  })
}
const loadFilterOptions = async () => {
  brandsError.value = false
  ageCountsLoaded.value = false
  try {
    const params: Record<string, string | number | undefined> = {
      catalog: 'shop',
    }
    if (activeCategory.value !== 'all') params.category = activeCategory.value
    if (selectedSkills.value.length) params.skill = selectedSkills.value.join(',')
    if (selectedInterests.value.length) params.interest = selectedInterests.value.join(',')
    if (selectedBrand.value) params.brand = selectedBrand.value
    const age = ageOptions.find(option => option.id === selectedAge.value)
    if (age) {
      params.age_from = age.from
      params.age_to = age.to
    }
    for (const [code, value] of Object.entries(customFilterValues.value)) {
      if (value) params[`f[${code}]`] = value
    }

    const response = await fetchFilterSchema(params)
    brands.value = response.data.brands || []
    catalogMaxPrice.value = response.data.max_price === null || response.data.max_price === undefined
      ? null
      : Math.ceil(Number(response.data.max_price))
    brandsLoaded.value = true
    schemaFilters.value = Array.isArray(response.data.filters) ? response.data.filters : []
    pruneIncompatibleCustomFilters()
    if (response.data.category_counts && typeof response.data.category_counts === 'object') {
      categoryCounts.value = response.data.category_counts
    }
    if (typeof response.data.total_count === 'number') {
      catalogTotalCount.value = response.data.total_count
    }
    if (response.data.age_counts) {
      ageCounts.value = response.data.age_counts
      ageCountsLoaded.value = true
    } else {
      await loadAgeCountsFallback()
    }
  } catch {
    brandsError.value = true
    await loadAgeCountsFallback()
  }
}

const loadAgeCountsFallback = async () => {
  try {
    const entries = await Promise.all(
      ageOptions.map(async (age) => {
        const res = await fetchToys({
          catalog: 'shop',
          age_from: age.from,
          age_to: age.to,
          per_page: 1,
          page: 1,
          include_preorder: 1,
          stock_status: 'all',
        })
        return [age.id, Number(res?.meta?.total ?? 0)] as const
      }),
    )
    ageCounts.value = Object.fromEntries(entries)
  } catch {
    ageCounts.value = {}
  } finally {
    ageCountsLoaded.value = true
  }
}
const isSortDropdownOpen = ref(false)
const addedProducts = ref<number[]>([])

const isGiftMode = computed(() => route.query.gift === '1')

const queryValues = (value: unknown): string[] => {
  if (!value) return []
  return (Array.isArray(value) ? value : String(value).split(','))
    .map(String)
    .filter(Boolean)
}

const pageFromRoute = () => {
  const page = route.query.page
  if (!page) return 1
  const raw = Array.isArray(page) ? page[0] : page
  return Math.max(1, Number(raw) || 1)
}

const syncFromRoute = () => {
  searchQuery.value = route.query.search ? String(route.query.search) : ''
  activeCategory.value = route.query.category ? String(route.query.category) : 'all'
  selectedSkills.value = queryValues(route.query.skill)
  selectedInterests.value = queryValues(route.query.interest)
  currentSort.value = route.query.sort ? String(route.query.sort) : 'popular'
  priceFrom.value = route.query.price_from ? Number(route.query.price_from) : null
  const requestedPriceTo = route.query.price_to ? Number(route.query.price_to) : null
  priceTo.value = requestedPriceTo === null
    ? catalogMaxPrice.value
    : Math.min(requestedPriceTo, catalogMaxPrice.value ?? requestedPriceTo)
  currentPage.value = pageFromRoute()
  customFilterValues.value = readCustomFiltersFromRoute()
}

/** Prevent route→state sync from echoing back into router.replace loops. */
let syncingFromRoute = false

const updateRouteQuery = (mutate: (query: Record<string, any>) => void) => {
  if (syncingFromRoute) return
  const query = { ...route.query }
  mutate(query)
  router.replace({ path: '/shop', query })
}

const goToPage = (page: number) => {
  const nextPage = Math.min(Math.max(1, page), totalPages.value)
  currentPage.value = nextPage

  if (hasClientOnlyFilters.value) {
    return
  }

  updateRouteQuery((query) => {
    if (nextPage <= 1) delete query.page
    else query.page = String(nextPage)
  })
}

const activePaginationPage = computed(() => (
  hasClientOnlyFilters.value ? currentPage.value : pageFromRoute()
))

const categoryLabelBySlug = labelBySlug


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
  updateRouteQuery((query) => {
    delete query.page
    if (option.value === 'popular') delete query.sort
    else query.sort = option.value
  })
}


const selectCategory = (id: string) => {
  const next = activeCategory.value === id ? 'all' : id
  activeCategory.value = next
  if (next !== 'all') {
    const node = findBySlug(next)
    const rootSlug = node?.isRoot ? node.slug : node?.parentSlug
    if (rootSlug) ensureCategoryExpanded(rootSlug)
  }
  updateRouteQuery((query) => {
    delete query.page
    stripCustomFilterQueryKeys(query)
    customFilterValues.value = {}
    if (activeCategory.value === 'all') delete query.category
    else query.category = activeCategory.value
  })
  void loadFilterOptions()
}

const clearCategoryFilter = () => {
  if (activeCategory.value === 'all') return
  activeCategory.value = 'all'
  updateRouteQuery((query) => {
    delete query.page
    delete query.category
    stripCustomFilterQueryKeys(query)
    customFilterValues.value = {}
  })
  void loadFilterOptions()
}

const isCategoryExpanded = (slug: string) => expandedCategorySlugs.value.includes(slug)

const toggleCategoryExpand = (slug: string) => {
  expandedCategorySlugs.value = isCategoryExpanded(slug)
    ? expandedCategorySlugs.value.filter(item => item !== slug)
    : [...expandedCategorySlugs.value, slug]
}

const ensureCategoryExpanded = (slug: string) => {
  if (!isCategoryExpanded(slug)) {
    expandedCategorySlugs.value = [...expandedCategorySlugs.value, slug]
  }
}

type FilterSectionId = string

const openFilterSections = ref<FilterSectionId[]>(['age', 'price', 'brand'])

const isFilterOpen = (id: FilterSectionId) => openFilterSections.value.includes(id)

const toggleFilterSection = (id: FilterSectionId) => {
  openFilterSections.value = isFilterOpen(id)
    ? openFilterSections.value.filter(section => section !== id)
    : [...openFilterSections.value, id]
}

const ensureFilterOpen = (id: FilterSectionId) => {
  if (!isFilterOpen(id)) {
    openFilterSections.value = [...openFilterSections.value, id]
  }
}

const toggleSkill = (slug: string) => {
  const next = selectedSkills.value.includes(slug)
    ? selectedSkills.value.filter(s => s !== slug)
    : [...selectedSkills.value, slug]
  selectedSkills.value = next
  updateRouteQuery((query) => {
    delete query.page
    if (next.length) query.skill = next.join(',')
    else delete query.skill
  })
}

const toggleInterest = (slug: string) => {
  const next = selectedInterests.value.includes(slug)
    ? selectedInterests.value.filter(s => s !== slug)
    : [...selectedInterests.value, slug]
  selectedInterests.value = next
  updateRouteQuery((query) => {
    delete query.page
    if (next.length) query.interest = next.join(',')
    else delete query.interest
  })
}

interface Product {
  id: number
  title: string
  sku: string
  rating: string
  reviewsCount: number
  numericPrice: number
  image: string
  category: string[]
  categoryName: string
  toyCategorySlug?: string | null
  age: string
  minAgeMonths: number
  maxAgeMonths: number
  stockStatus: string
  availableQuantity: number
  isPurchaseAvailable: boolean
  isRentalAvailable: boolean
  isPreorderAvailable: boolean
}

const isLoading = ref(true)
const products = ref<Product[]>([])
const totalCatalogCount = ref(0)
const apiLastPage = ref(1)

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

const mapToyToProduct = (item: any): Product => {
  return {
    id: item.id,
    title: item.name,
    sku: item.sku ? String(item.sku) : '',
    rating: item.rating_avg != null ? String(item.rating_avg) : '',
    reviewsCount: Number(item.reviews_count ?? 0),
    numericPrice: Number(item.price) || 0,
    image: resolveMediaUrl(
      item.image_url || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=500&q=80',
      apiBase,
    ),
    category: parseCategories(item),
    categoryName: item.category?.name || 'Развивающая игрушка',
    toyCategorySlug: item.category?.slug ?? null,
    minAgeMonths: item.min_age_months ?? 0,
    maxAgeMonths: item.max_age_months ?? 72,
    age: `${Math.floor((item.min_age_months ?? 0) / 12)}–${Math.ceil((item.max_age_months ?? 72) / 12)} лет`,
    stockStatus: item.stock_status || 'available',
    availableQuantity: Number(item.available_quantity ?? 0),
    isPurchaseAvailable: !!item.channels?.is_purchase_available,
    isRentalAvailable: !!item.channels?.is_rental_available,
    isPreorderAvailable: !!item.preorder?.available,
  }
}

let loadRequestId = 0
const catalogLoadError = ref(false)

const loadProducts = async () => {
  const requestId = ++loadRequestId
  isLoading.value = true
  catalogLoadError.value = false

  try {
    const params: Record<string, string | number | boolean> = {
      catalog: 'shop',
      page: currentPage.value,
      per_page: itemsPerPage,
      include_preorder: 1,
    }

    if (currentSort.value !== 'popular') {
      params.sort = currentSort.value
    }

    if (searchQuery.value.trim()) {
      params.search = searchQuery.value.trim()
    }
    if (activeCategory.value !== 'all') {
      params.category = activeCategory.value
    }
    if (priceFrom.value) {
      params.price_from = priceFrom.value
    }
    if (hasPriceToFilter.value && priceTo.value !== null) {
      params.price_to = priceTo.value
    }
    if (availability.value === 'available') {
      params.stock_status = 'available'
    } else {
      params.stock_status = 'all'
    }

    if (selectedBrand.value) params.brand = selectedBrand.value
    const age = ageOptions.find(option => option.id === selectedAge.value)
    if (age) {
      params.age_from = age.from
      params.age_to = age.to
    }
    if (selectedSkills.value.length) {
      params.skill = selectedSkills.value.join(',')
    }
    if (selectedInterests.value.length) {
      params.interest = selectedInterests.value.join(',')
    }
    const customF: Record<string, string> = {}
    for (const [code, value] of Object.entries(customFilterValues.value)) {
      if (value) customF[code] = value
    }
    if (Object.keys(customF).length) {
      ;(params as any).f = customF
    }
    const res = await fetchToys(params)
    if (requestId !== loadRequestId) return

    const items = Array.isArray(res?.data) ? res.data : []
    products.value = items.map(mapToyToProduct)
    totalCatalogCount.value = Number(res?.meta?.total ?? products.value.length)
    apiLastPage.value = Number(res?.meta?.last_page ?? 1)
  } catch (e) {
    if (requestId !== loadRequestId) return
    console.warn('Could not load shop catalog from API', e)
    catalogLoadError.value = true
    products.value = []
    totalCatalogCount.value = 0
    apiLastPage.value = 1
  } finally {
    if (requestId === loadRequestId) {
      isLoading.value = false
    }
  }
}

// Keep route → catalog sync after loadProducts exists (avoids TDZ + stuck loading).
watch(() => route.fullPath, () => {
  syncingFromRoute = true
  syncFromRoute()
  void loadProducts()
  void loadFilterOptions()
  queueMicrotask(() => { syncingFromRoute = false })
})

const openActiveFilterSections = () => {
  if (selectedAge.value) ensureFilterOpen('age')
  if (selectedRootSlug.value) ensureCategoryExpanded(selectedRootSlug.value)
  if (selectedSkills.value.length) ensureFilterOpen('skills')
  if (selectedInterests.value.length) ensureFilterOpen('interests')
  if (availability.value !== 'all') ensureFilterOpen('availability')
  if (priceFrom.value || hasPriceToFilter.value) ensureFilterOpen('price')
  if (selectedBrand.value) ensureFilterOpen('brand')
  for (const code of Object.keys(customFilterValues.value)) {
    if (customFilterValues.value[code]) ensureFilterOpen(`attr:${code}`)
  }
}

// Load products immediately on mount — do not wait for sidebar meta.
onMounted(() => {
  syncingFromRoute = true
  syncFromRoute()
  queueMicrotask(() => { syncingFromRoute = false })
  void loadProducts()
  void Promise.all([
    loadCategories(),
    loadFilterOptions(),
    loadSkills().then(() => { skillsLoaded.value = true }),
    loadInterests().then(() => { interestsLoaded.value = true }),
  ]).then(() => {
    syncingFromRoute = true
    syncFromRoute()
    openActiveFilterSections()
    queueMicrotask(() => { syncingFromRoute = false })
  }).catch((e) => {
    console.warn('Shop sidebar meta failed', e)
  })
})

const currentCatalogTitle = computed(() => {
  if (activeCategory.value !== 'all') return categoryLabelBySlug.value[activeCategory.value] || activeCategory.value
  if (searchQuery.value.trim()) return `Поиск: «${searchQuery.value.trim()}»`
  return 'Все игрушки'
})

const activeCategoryNode = computed(() => (
  activeCategory.value === 'all' ? undefined : findBySlug(activeCategory.value)
))

const selectedRootSlug = computed(() => {
  const node = activeCategoryNode.value
  if (!node) return null
  return node.isRoot ? node.slug : node.parentSlug
})

/** Focused tree: after picking a category/subcategory, hide unrelated branches. */
const visibleCategoryTree = computed(() => {
  const selected = activeCategoryNode.value
  const expanded = new Set(expandedCategorySlugs.value)

  return categories.value
    .filter((root) => {
      if (!selected) return true
      return root.slug === selectedRootSlug.value
    })
    .map((root) => {
      const allChildren = root.children ?? []
      const hasChildren = allChildren.length > 0
      const isRootSelected = selected?.slug === root.slug
      const isChildSelected = Boolean(selected && !selected.isRoot && selected.parentSlug === root.slug)

      let visibleChildren = allChildren
      if (isChildSelected) {
        visibleChildren = allChildren.filter(child => child.slug === selected!.slug)
      }

      const childrenVisible = !selected
        ? expanded.has(root.slug)
        : isRootSelected || isChildSelected

      return {
        slug: root.slug,
        name: root.name,
        showExpand: !selected && hasChildren,
        childrenVisible: childrenVisible && visibleChildren.length > 0,
        visibleChildren,
      }
    })
})

watch(selectedRootSlug, (slug) => {
  if (slug) ensureCategoryExpanded(slug)
}, { immediate: true })

const pluralizeToys = (count: number) => {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return 'игрушка'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'игрушки'
  return 'игрушек'
}

const hasPriceToFilter = computed(() => (
  priceTo.value !== null
  && (catalogMaxPrice.value === null || priceTo.value < catalogMaxPrice.value)
))

const activeFilterChips = computed<{ group: string, id: string, label: string }[]>(() => {
  const chips: { group: string, id: string, label: string }[] = []
  if (selectedBrand.value) chips.push({ group: 'brand', id: selectedBrand.value, label: selectedBrand.value })
  const age = ageOptions.find(option => option.id === selectedAge.value)
  if (age) chips.push({ group: 'age', id: age.id, label: age.label })
  if (activeCategory.value !== 'all') {
    chips.push({ group: 'category', id: activeCategory.value, label: categoryLabelBySlug.value[activeCategory.value] || activeCategory.value })
  }
  for (const slug of selectedSkills.value) {
    chips.push({
      group: 'skill',
      id: slug,
      label: skillLabelBySlug.value[slug] || slug,
    })
  }
  for (const slug of selectedInterests.value) {
    chips.push({
      group: 'interest',
      id: slug,
      label: interestLabelBySlug.value[slug] || slug,
    })
  }
  if (priceFrom.value || hasPriceToFilter.value) {
    chips.push({
      group: 'price',
      id: 'price',
      label: `${priceFrom.value || 0}–${hasPriceToFilter.value ? priceTo.value : (catalogMaxPrice.value ?? '∞')} ₸`,
    })
  }
  for (const [code, value] of Object.entries(customFilterValues.value)) {
    if (!value) continue
    const def = customFilterDefs.value.find(f => f.code === code)
    const labelBase = def ? filterLabel(def) : code
    chips.push({ group: 'attr', id: code, label: `${labelBase}: ${value}` })
  }
  return chips
})

const activeFilterChipCount = computed(() => activeFilterChips.value.length)

const hasActiveFilters = computed(() => (
  activeCategory.value !== 'all'
  || selectedSkills.value.length > 0
  || selectedInterests.value.length > 0
  || Boolean(selectedBrand.value)
  || Boolean(selectedAge.value)
  || Boolean(searchQuery.value.trim())
  || Boolean(priceFrom.value)
  || hasPriceToFilter.value
  || activeCustomFilterCount.value > 0
))

const removeFilterChip = (chip: { group: string, id: string, label: string }) => {
  if (chip.group === 'category') activeCategory.value = 'all'
  if (chip.group === 'skill') {
    selectedSkills.value = selectedSkills.value.filter(slug => slug !== chip.id)
  }
  if (chip.group === 'interest') {
    selectedInterests.value = selectedInterests.value.filter(slug => slug !== chip.id)
  }
  if (chip.group === 'price') {
    priceFrom.value = null
    priceTo.value = catalogMaxPrice.value
  }
  if (chip.group === 'attr') {
    const next = { ...customFilterValues.value }
    delete next[chip.id]
    customFilterValues.value = next
  }
  currentPage.value = 1

  updateRouteQuery((query) => {
    delete query.page
    if (chip.group === 'category') {
      delete query.category
      stripCustomFilterQueryKeys(query)
      customFilterValues.value = {}
    }
    if (chip.group === 'brand') delete query.brand
    if (chip.group === 'age') delete query.age
    if (chip.group === 'skill') {
      if (selectedSkills.value.length) query.skill = selectedSkills.value.join(',')
      else delete query.skill
    }
    if (chip.group === 'interest') {
      if (selectedInterests.value.length) query.interest = selectedInterests.value.join(',')
      else delete query.interest
    }
    if (chip.group === 'price') {
      delete query.price_from
      delete query.price_to
    }
    if (chip.group === 'attr') {
      writeCustomFiltersToQuery(query, customFilterValues.value)
    }
  })
  if (chip.group === 'category') void loadFilterOptions()
}

const hasClientOnlyFilters = computed(() => route.query.filter === 'favorites')

const catalogDisplayCount = computed(() => (
  hasClientOnlyFilters.value ? filteredProducts.value.length : totalCatalogCount.value
))

const catalogCountSuffix = computed(() => {
  if (hasClientOnlyFilters.value) {
    return pluralizeToys(filteredProducts.value.length)
  }
  if (availability.value === 'available') {
    return 'в наличии'
  }
  return pluralizeToys(totalCatalogCount.value)
})

const sidebarCatalogCount = computed(() => {
  if (hasClientOnlyFilters.value) {
    return filteredProducts.value.length
  }
  if (catalogTotalCount.value !== null) {
    return catalogTotalCount.value
  }
  return totalCatalogCount.value
})

const filteredProducts = computed(() => {
  let list = products.value

  if (route.query.filter === 'favorites') {
    list = list.filter(p => isFavorite(p.id))
  }

  return list
})

const totalPages = computed(() => (
  hasClientOnlyFilters.value
    ? Math.max(1, Math.ceil(filteredProducts.value.length / itemsPerPage))
    : apiLastPage.value
))

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = activePaginationPage.value
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  const pages = new Set<number>([1, total, current, current - 1, current + 1])
  const sorted = [...pages].filter(page => page >= 1 && page <= total).sort((a, b) => a - b)
  const result: Array<number | 'ellipsis'> = []

  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) {
      result.push('ellipsis')
    }
    result.push(page)
  })

  return result
})

const paginatedProducts = computed(() => {
  if (hasClientOnlyFilters.value) {
    const start = (currentPage.value - 1) * itemsPerPage
    return filteredProducts.value.slice(start, start + itemsPerPage)
  }
  return filteredProducts.value
})

const canAddProduct = (product: Product) => (
  product.isPurchaseAvailable
  && product.stockStatus === 'available'
  && product.availableQuantity > 0
  && Number.isFinite(product.id)
  && product.id > 0
)

const canPreorderProduct = (product: Product) => (
  product.isPreorderAvailable
  && product.availableQuantity <= 0
  && Number.isFinite(product.id)
  && product.id > 0
)

const handleAddToCart = (product: Product) => {
  if (canPreorderProduct(product)) {
    navigateTo(`/product/${product.id}`)
    return
  }
  if (!canAddProduct(product)) {
    toastError('Товар недоступен', 'Эту игрушку сейчас нельзя купить.')
    return
  }
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

watch(availability, () => {
  if (syncingFromRoute) return
  updateRouteQuery((query) => {
    delete query.page
  })
})

let searchDebounce: ReturnType<typeof setTimeout> | undefined
watch(searchQuery, () => {
  if (syncingFromRoute) return
  clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    if (syncingFromRoute) return
    updateRouteQuery((query) => {
      delete query.page
      if (searchQuery.value.trim()) query.search = searchQuery.value.trim()
      else delete query.search
    })
  }, 350)
})

let priceDebounce: ReturnType<typeof setTimeout> | undefined
watch([priceFrom, priceTo], () => {
  if (syncingFromRoute) return
  clearTimeout(priceDebounce)
  if (catalogMaxPrice.value !== null && priceTo.value !== null && priceTo.value > catalogMaxPrice.value) {
    priceTo.value = catalogMaxPrice.value
    return
  }
  priceDebounce = setTimeout(() => {
    if (syncingFromRoute) return
    updateRouteQuery((query) => {
      delete query.page
      if (priceFrom.value) query.price_from = String(priceFrom.value)
      else delete query.price_from

      if (hasPriceToFilter.value && priceTo.value !== null) query.price_to = String(priceTo.value)
      else delete query.price_to
    })
  }, 500)
})

const formatPrice = (val: number) => {
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

const resetFilters = () => {
  searchQuery.value = ''
  activeCategory.value = 'all'
  selectedSkills.value = []
  selectedInterests.value = []
  availability.value = 'all'
  priceFrom.value = null
  priceTo.value = catalogMaxPrice.value
  customFilterValues.value = {}
  filtersDrawerOpen.value = false
  currentPage.value = 1
  router.push('/shop')
  void loadFilterOptions()
}

const readCustomFiltersFromRoute = (): Record<string, string> => {
  const out: Record<string, string> = {}
  const q = route.query
  if (q.f && typeof q.f === 'object' && !Array.isArray(q.f)) {
    for (const [code, raw] of Object.entries(q.f as Record<string, unknown>)) {
      const value = Array.isArray(raw) ? raw.filter(Boolean).join(',') : String(raw || '')
      if (value) out[code] = value
    }
  }
  for (const [key, raw] of Object.entries(q)) {
    if (!key.startsWith('f.') && !key.startsWith('f[')) continue
    let code = key
    if (key.startsWith('f.')) code = key.slice(2)
    else {
      const match = key.match(/^f\[(.+)\]$/)
      if (match) code = match[1]
    }
    const value = Array.isArray(raw) ? raw.filter(Boolean).join(',') : String(raw || '')
    if (value) out[code] = value
  }
  return out
}

const stripCustomFilterQueryKeys = (query: Record<string, any>) => {
  delete query.f
  for (const key of Object.keys(query)) {
    if (key.startsWith('f.') || /^f\[.+\]$/.test(key)) delete query[key]
  }
}

const writeCustomFiltersToQuery = (query: Record<string, any>, values: Record<string, string>) => {
  stripCustomFilterQueryKeys(query)
  for (const [code, value] of Object.entries(values)) {
    if (value) query[`f[${code}]`] = value
  }
}

const pruneIncompatibleCustomFilters = () => {
  const allowed = new Set(customFilterDefs.value.map(f => f.code))
  const next: Record<string, string> = {}
  let changed = false
  for (const [code, value] of Object.entries(customFilterValues.value)) {
    if (allowed.has(code) && value) next[code] = value
    else changed = true
  }
  if (!changed && Object.keys(next).length === Object.keys(customFilterValues.value).length) return
  customFilterValues.value = next
  updateRouteQuery((query) => {
    writeCustomFiltersToQuery(query, next)
  })
}

const hasCustomFilterValue = (code: string) => Boolean(customFilterValues.value[code])
const customFilterSelectionCount = (code: string) => {
  const value = customFilterValues.value[code]
  if (!value) return 0
  return value.split(',').filter(Boolean).length
}
const isCustomOptionSelected = (code: string, option: string) =>
  (customFilterValues.value[code] || '').split(',').filter(Boolean).includes(option)

const toggleCustomOption = (filter: CatalogFilterDef, option: string) => {
  const code = filter.code
  const current = (customFilterValues.value[code] || '').split(',').filter(Boolean)
  let next: string[]
  if (filter.type === 'enum') {
    next = current.includes(option) ? [] : [option]
  } else {
    next = current.includes(option)
      ? current.filter(v => v !== option)
      : [...current, option]
  }
  const serialized = next.join(',')
  customFilterValues.value = { ...customFilterValues.value, [code]: serialized }
  if (!serialized) {
    const copy = { ...customFilterValues.value }
    delete copy[code]
    customFilterValues.value = copy
  }
  updateRouteQuery((query) => {
    delete query.page
    writeCustomFiltersToQuery(query, customFilterValues.value)
  })
  void loadFilterOptions()
}

const setCustomScalar = (code: string, value: string) => {
  const next = { ...customFilterValues.value }
  if (value) next[code] = value
  else delete next[code]
  customFilterValues.value = next
  updateRouteQuery((query) => {
    delete query.page
    writeCustomFiltersToQuery(query, next)
  })
  void loadFilterOptions()
}

const customRangeMin = (code: string) => {
  const raw = customFilterValues.value[code] || ''
  if (raw.includes('-')) return raw.split('-')[0] || ''
  return raw
}
const customRangeMax = (code: string) => {
  const raw = customFilterValues.value[code] || ''
  if (raw.includes('-')) return raw.split('-')[1] || ''
  return ''
}
const setCustomRange = (code: string, part: 'min' | 'max', value: string) => {
  let min = customRangeMin(code)
  let max = customRangeMax(code)
  if (part === 'min') min = value
  else max = value
  let serialized = ''
  if (min && max) serialized = `${min}-${max}`
  else if (min) serialized = min
  else if (max) serialized = max
  setCustomScalar(code, serialized)
}

const navigateToProduct = (product: Product) => {
  navigateTo(isGiftMode.value ? `/product/${product.id}?gift=1` : `/product/${product.id}`)
}
</script>

<style scoped>
.shop-page {
  min-height: 100vh;
  background-color: #FAF8F4;
  color: #262626;
  font-family: 'Manrope', sans-serif;
  padding-bottom: 80px;
}

.catalog-select-label {
  display: block;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 700;
}
.catalog-select {
  width: 100%;
  min-width: 0;
  min-height: 44px;
  padding: 10px 12px;
  border: 1px solid var(--warm-sand, #e3d7c6);
  border-radius: 12px;
  background: #fff;
  color: var(--green-ink, #233428);
  font: inherit;
  font-size: 14px;
}
.catalog-select:focus-visible {
  outline: 2px solid var(--alpha-green);
  outline-offset: 3px;
}
.filter-hint { font-size: 12px; line-height: 1.5; margin-top: 8px; }
.filter-hint button { color: inherit; text-decoration: underline; }

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
  background: linear-gradient(135deg, #FFF7ED 0%, #F4F1EA 100%);
  border: 1px solid rgba(51, 61, 54, 0.15);
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
  color: var(--green-ink);
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
  color: var(--green-ink);
}

.catalog-breadcrumbs strong {
  color: #5D625F;
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
  color: var(--green-ink);
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
  color: #262626;
  font-family: 'Manrope', sans-serif;
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
  background: #FAF8F4;
  color: #262626;
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
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 14px;
  border: 1px solid #E6E0FF;
  border-radius: 12px;
  background: #FAF8F4;
  color: #5D625F;
  font: inherit;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.catalog-quick-links button:hover,
.catalog-quick-links button.active {
  border-color: var(--green-ink);
  background: var(--green-surface);
  color: var(--green-ink);
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
  max-height: calc(100vh - 36px);
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 18px 16px;
  border: 1px solid #E7E2DC;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.82);
  scrollbar-width: thin;
}

.catalog-filters__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 12px;
}

.catalog-filters__top-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.catalog-filters__close {
  display: none;
}

.catalog-mobile-bar {
  display: none;
  margin-bottom: 16px;
}

.catalog-mobile-filters-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 10px 16px;
  border: 1px solid var(--warm-sand, #e3d7c6);
  border-radius: 12px;
  background: #fff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.catalog-mobile-filters-btn__badge {
  display: inline-flex;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  align-items: center;
  justify-content: center;
  background: var(--green-ink, #233428);
  color: #fff;
  font-size: 12px;
}

.catalog-filters-backdrop {
  display: none;
}

.catalog-filters__top h2 {
  margin: 0;
  font-family: 'Manrope', sans-serif;
  font-size: 18px;
  font-weight: 800;
}

.catalog-filters__top button {
  padding: 0;
  border: 0;
  background: none;
  color: var(--green-ink);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.category-tree {
  margin: 0 0 4px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ECE8E3;
}

.category-tree__all {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  padding: 8px 8px;
  border: 0;
  border-radius: 10px;
  background: none;
  color: var(--green-ink, #233428);
  font: inherit;
  font-size: 13px;
  font-weight: 800;
  text-align: left;
  cursor: pointer;
}

.category-tree__all.active,
.category-tree__all:hover {
  background: #D9E0D5;
  text-decoration: none;
}

.category-tree__list,
.category-tree__children {
  list-style: none;
  margin: 0;
  padding: 0;
}

.category-tree__children {
  margin-left: 14px;
}

.category-tree__node {
  margin: 0;
}

.category-tree__row {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  min-height: 30px;
  border-radius: 10px;
}

.category-tree__row.active {
  background: #D9E0D5;
}

.category-tree__expand,
.category-tree__bullet {
  flex: 0 0 16px;
  width: 16px;
  height: 22px;
  margin-top: 4px;
}

.category-tree__expand {
  position: relative;
  border: 0;
  background: none;
  padding: 0;
  cursor: pointer;
}

.category-tree__expand::before {
  content: '';
  position: absolute;
  top: 7px;
  left: 4px;
  border-style: solid;
  border-width: 4px 0 4px 6px;
  border-color: transparent transparent transparent #6f7571;
  transition: transform 0.15s ease;
}

.category-tree__expand.is-open::before {
  transform: rotate(90deg);
  top: 8px;
  left: 3px;
}

.category-tree__bullet::before {
  content: '';
  display: block;
  width: 5px;
  height: 5px;
  margin: 8px auto 0;
  border: 1px solid #9aa09c;
  border-radius: 50%;
  background: transparent;
}

.category-tree__link {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
  padding: 5px 6px 5px 2px;
  border: 0;
  border-radius: 8px;
  background: none;
  color: #5D625F;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.35;
  text-align: left;
  cursor: pointer;
}

.category-tree__link span:first-child {
  min-width: 0;
}

.category-tree__link:hover {
  color: var(--green-ink, #233428);
  text-decoration: none;
}

.category-tree__link.active {
  color: var(--green-ink, #233428);
  font-weight: 800;
  text-decoration: none;
}

.category-tree__count {
  flex: 0 0 auto;
  color: #9aa09c;
  font-size: 12px;
  font-weight: 600;
}

.category-tree__row.active .category-tree__count,
.category-tree__all.active .category-tree__count {
  color: #6f7571;
}

.catalog-filters__section-label {
  margin: 12px 0 2px;
  padding-top: 4px;
  color: #262626;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.01em;
}

.catalog-all-link,
.filter-option {
  width: 100%;
  border: 0;
  background: none;
  color: #5D625F;
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
  background: #D9E0D5;
  color: var(--green-ink);
}

.filter-group {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #ECE8E3;
}

.filter-group__toggle {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 2px;
  border: 0;
  background: none;
  color: #262626;
  font: inherit;
  font-size: 13px;
  font-weight: 800;
  text-align: left;
  cursor: pointer;
}

.filter-group__toggle > span:first-child {
  flex: 1;
}

.filter-group__badge {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--green-surface);
  color: var(--green-ink);
  font-size: 10px;
  font-weight: 800;
  line-height: 18px;
  text-align: center;
}

.filter-group__chevron {
  width: 8px;
  height: 8px;
  border-right: 1.5px solid #8A8A9E;
  border-bottom: 1.5px solid #8A8A9E;
  transform: rotate(45deg);
  transition: transform 0.18s ease;
  flex-shrink: 0;
}

.filter-group.is-open .filter-group__chevron {
  transform: rotate(-135deg);
  margin-top: 4px;
}

.filter-group__body {
  padding: 2px 0 6px;
}

.filter-group__body--scroll {
  max-height: 168px;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-right: 2px;
  scrollbar-width: thin;
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
  color: var(--green-ink);
}

.filter-option.active .filter-checkbox {
  border-color: var(--green-ink);
  background: var(--green-surface);
  color: var(--green-ink);
}

.filter-option--age small {
  color: var(--green-ink);
  font-size: 12px;
  font-weight: 700;
}

.filter-option--age.filter-option--empty:not(.active) {
  opacity: 0.42;
}

.filter-option--age.filter-option--empty:not(.active) small {
  color: #9A98A8;
  font-weight: 600;
}

.filter-option--age:disabled {
  cursor: not-allowed;
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
  background: #FAF8F4;
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
  color: #262626;
  font: inherit;
  font-size: 11px;
}

.availability-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
  color: #5D625F;
  font-size: 12.5px;
  cursor: pointer;
}

.availability-option input {
  accent-color: var(--green-ink);
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
  background: #D9E0D5;
  color: var(--green-ink);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.active-filters button:hover {
  border-color: var(--green-ink);
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
  background: #FAF8F4;
  color: #5D625F;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.catalog-pagination button.active {
  border-color: var(--green-ink);
  background: var(--green-surface);
  color: var(--green-ink);
}

.catalog-pagination button:disabled {
  opacity: 0.4;
  cursor: default;
}

.catalog-pagination__ellipsis {
  min-width: 20px;
  text-align: center;
  color: #8A928C;
  font-weight: 700;
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
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 38px;
  color: #262626;
  line-height: 1.15;
  margin-bottom: 14px;
  letter-spacing: -0.5px;
}

.shop-description {
  font-size: 14.5px;
  color: #6F746F;
  line-height: 1.5;
}

/* Gift Card */
.gift-card {
  background: #FAF8F4;
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
  background: #E8A62B;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.gift-title {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 16px;
  color: #262626;
  margin-bottom: 2px;
}

.gift-sub {
  font-size: 12.5px;
  color: #6F746F;
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
  background: #FAF8F4;
  border: 1.5px solid #E6DFD4;
  border-radius: 50px;
  padding: 10px 36px 10px 46px;
  font-size: 13.5px;
  color: #262626;
  font-family: 'Manrope', sans-serif;
  outline: none;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}

.shop-search-input:focus {
  border-color: var(--green-ink);
  box-shadow: 0 4px 14px rgba(51, 61, 54, 0.12);
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
  color: #6F746F;
}

.sort-select-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #FAF8F4;
  border: 1px solid #E6DFD4;
  padding: 8px 18px;
  border-radius: 50px;
  font-size: 13.5px;
  color: #262626;
  cursor: pointer;
  user-select: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}

.sort-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: #FAF8F4;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid #E6DFD4;
  padding: 6px;
  width: 210px;
  z-index: 100;
}

.sort-option {
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 13px;
  color: #5D625F;
  transition: all 0.15s ease;
}

.sort-option:hover {
  background: #FAF8F4;
  color: var(--green-ink);
}

.sort-option.active {
  font-weight: 700;
  color: var(--green-ink);
  background: #D9E0D5;
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
  background: #FAF8F4;
  border: 1px solid #E6DFD4;
  color: #262626;
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 13.5px;
  padding: 8px 20px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}

.cat-pill:hover {
  background: #FAF8F4;
  border-color: var(--green-ink);
  color: var(--green-ink);
}

.cat-pill.active {
  background: var(--green-surface);
  color: var(--green-ink);
  border-color: var(--green-ink);
  box-shadow: 0 4px 14px rgba(51, 61, 54, 0.25);
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
  color: #262626;
}

.age-pills-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.age-pill {
  background: #FAF8F4;
  border: 1px solid #E6DFD4;
  color: #5D625F;
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 13px;
  padding: 6px 16px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.age-pill:hover {
  border-color: #E8A62B;
  background: #FAF8F4;
}

.age-pill.active {
  background: #E8A62B;
  color: #262626;
  border-color: #E8A62B;
  box-shadow: 0 3px 10px rgba(255, 209, 102, 0.4);
}

/* Products Grid */
.products-grid-section {
  margin-bottom: 40px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.product-card {
  min-width: 0;
  overflow: hidden;
  background: #FFFFFF;
  border-radius: 20px;
  padding: 7px;
  border: 1px solid rgba(38, 38, 38, 0.1);
  box-shadow: 0 10px 28px rgba(38, 38, 38, 0.045);
  display: flex;
  flex-direction: column;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 40px rgba(38, 38, 38, 0.085);
  border-color: rgba(63, 103, 87, 0.3);
}

.product-img-wrap {
  position: relative;
  width: 100%;
  background: #F4F1EA;
  border-radius: 14px;
  aspect-ratio: 1 / 0.88;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.product-image-link {
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.product-image-link :deep(.app-image-container) {
  background: #F4F1EA;
}

.product-image-link :deep(.product-img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  padding: 0;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image-link :deep(.product-img) {
  transform: scale(1.04);
}

.product-status {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 3;
  padding: 7px 11px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.02em;
  pointer-events: none;
}

.product-status--preorder {
  background: #C9852A;
  color: #fff;
}

.card-fav-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(38, 38, 38, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #646862;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 5px 14px rgba(38, 38, 38, 0.08);
}

.card-fav-btn:hover {
  transform: scale(1.05);
  color: #AF5353;
}

.card-fav-btn.active {
  color: #AF5353;
  background: #FFF6F3;
}

.card-fav-btn.active :deep(path) {
  fill: currentColor;
}

.product-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 13px 8px 9px;
}

.product-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 7px;
  color: #74706A;
  font-size: 9.5px;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: 0.035em;
  text-transform: uppercase;
}

.product-meta span:first-child {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-title {
  min-height: 42px;
  margin: 0 0 6px;
}

.product-sku {
  margin: 0 0 12px;
  color: #9A958E;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: 0.02em;
}

.product-title button {
  width: fit-content;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
  font-family: 'Manrope', sans-serif;
  font-weight: 750;
  font-size: 14px;
  color: #262626;
  line-height: 1.4;
  cursor: pointer;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-title button:hover {
  color: var(--green-ink);
}

.product-price {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 16px;
  line-height: 1.1;
  color: #262626;
}

.product-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
}

.product-price-wrap {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
}

.product-price-wrap > span {
  color: #7B7B75;
  font-size: 10.5px;
  font-weight: 600;
}

.add-to-cart-btn {
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  background: var(--green-surface);
  color: var(--green-ink);
  border: 0;
  padding: 0;
  border-radius: 50%;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 7px 18px rgba(63, 103, 87, 0.24);
  transition: all 0.2s ease;
}

.add-to-cart-btn:hover {
  background: var(--green-surface-hover);
  transform: translateY(-1px);
  color: var(--green-ink);
}

.add-to-cart-btn.added {
  background: #AF5353;
  box-shadow: 0 7px 18px rgba(175, 83, 83, 0.22);
}

.add-to-cart-btn:disabled {
  color: #999690;
  background: #E2DED6;
  box-shadow: none;
  cursor: not-allowed;
}

/* No Products */
.no-products-box {
  text-align: center;
  padding: 60px 20px;
  background: #FAF8F4;
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
  background: var(--green-surface);
  color: var(--green-ink);
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
  background: #FAF8F4;
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
  background: #F4F1EA;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5D625F;
}

.modal-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: 'Manrope', sans-serif;
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 6px;
}

.type-filter-icon,
.modal-title-icon {
  flex-shrink: 0;
}

.modal-desc {
  font-size: 14px;
  color: #6F746F;
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
  border-color: #E8A62B;
  background: #FAF8F4;
}

.gift-hot-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #E8A62B;
  color: #262626;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 6px;
}

.gift-box-card h4 {
  font-family: 'Manrope', sans-serif;
  font-size: 16px;
  font-weight: 800;
  color: #262626;
  margin-bottom: 4px;
}

.gift-box-card p {
  font-size: 12.5px;
  color: #6F746F;
  line-height: 1.35;
  margin-bottom: 14px;
  flex: 1;
}

.gift-box-price {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 20px;
  color: var(--green-ink);
  margin-bottom: 12px;
}

.gift-add-btn {
  background: var(--green-surface);
  color: var(--green-ink);
  border: none;
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 13px;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.gift-add-btn:hover {
  background: var(--green-surface-hover);
  color: var(--green-ink);
}

/* Responsive */
@media (max-width: 1100px) {
  .catalog-layout {
    grid-template-columns: 220px minmax(0, 1fr);
    gap: 22px;
  }

  .products-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
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

  .catalog-mobile-bar {
    display: block;
  }

  .catalog-filters-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 80;
    background: rgba(20, 24, 22, 0.45);
  }

  .catalog-filters {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 90;
    width: min(360px, 92vw);
    max-height: 100vh;
    margin: 0;
    overflow: auto;
    transform: translateX(-105%);
    transition: transform 0.22s ease;
    display: block;
  }

  .catalog-filters--drawer-open {
    transform: translateX(0);
  }

  .catalog-filters__close {
    display: inline-flex;
  }

  .catalog-filters__top,
  .catalog-all-link {
    grid-column: auto;
  }

  .filter-group__body--scroll {
    max-height: 140px;
  }

  .products-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
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
    padding: 7px;
    border-radius: 18px;
  }

  .product-img-wrap {
    height: auto;
    border-radius: 14px;
  }

  .product-status {
    top: 8px;
    left: 8px;
    font-size: 9.5px;
    padding: 6px 8px;
  }

  .product-info {
    padding: 12px 7px 7px;
  }

  .product-meta {
    gap: 4px;
    margin-bottom: 5px;
    font-size: 9px;
  }

  .product-title {
    min-height: 36px;
    margin-bottom: 4px;
  }

  .product-sku {
    margin-bottom: 10px;
    font-size: 10px;
  }

  .product-title button {
    font-size: 13px;
    line-height: 1.35;
  }

  .product-price {
    font-size: 15px;
    font-weight: 800;
  }

  .add-to-cart-btn {
    width: 44px;
    height: 44px;
    flex-basis: 44px;
    border-radius: 50%;
  }

  .card-fav-btn {
    width: 38px;
    height: 38px;
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
    max-height: none;
  }

  .catalog-filters__top,
  .catalog-all-link {
    grid-column: auto;
  }

  .products-grid {
    grid-template-columns: 1fr !important;
  }

  .product-img-wrap {
    height: auto;
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
