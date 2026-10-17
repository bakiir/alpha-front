<template>
  <div class="shop-page">
    <TheHeader />

    <main v-if="featureBlocked" class="container page-content">
      <FeatureUnavailable
        :title="t('shop.unavailableTitle')"
        :description="t('shop.unavailableDescShop')"
      />
    </main>

    <main v-else class="container page-content">
      <div v-if="isGiftMode" class="gift-mode-banner">
        <AppIcon name="gift" :size="28" class="gift-mode-icon" />
        <div>
          <strong>{{ t('shop.giftModeTitle') }}</strong>
          <p>{{ t('shop.giftModeDescPackaging') }}</p>
        </div>
        <NuxtLink :to="localePath('/gifts')" class="gift-mode-back">{{ t('shop.giftModeBackGifts') }}</NuxtLink>
      </div>

      <nav class="catalog-breadcrumbs" :aria-label="t('shop.breadcrumbsAria')">
        <NuxtLink :to="localePath('/')">{{ t('nav.home') }}</NuxtLink>
        <span>›</span>
        <button type="button" @click="resetFilters">{{ t('shop.breadcrumbCatalog') }}</button>
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
          <span class="catalog-heading__eyebrow">{{ t('shop.catalogEyebrow') }}</span>
          <div class="catalog-heading__title-row">
            <h1>{{ currentCatalogTitle }}</h1>
            <span>{{ catalogDisplayCount }} {{ catalogCountSuffix }}</span>
          </div>
        </div>
        <NuxtLink :to="localePath('/gift-boxes')" class="catalog-gift-link">
          <AppIcon name="gift" :size="22" aria-hidden="true" />
          <span><strong>{{ t('shop.giftBoxesPromoTitle') }}</strong><small>{{ t('shop.giftBoxesPromoSubtitle') }}</small></span>
          <span aria-hidden="true">→</span>
        </NuxtLink>
      </section>


      <div
        v-if="filtersDrawerOpen"
        class="catalog-filters-backdrop"
        @click="filtersDrawerOpen = false"
      />

      <div class="catalog-layout">
        <aside
          class="catalog-filters"
          :class="{ 'catalog-filters--drawer-open': filtersDrawerOpen }"
          :aria-label="t('shop.filtersPanelAria')"
        >
          <div class="catalog-filters__top">
            <h2>{{ t('shop.filtersTitle') }}</h2>
            <div class="catalog-filters__top-actions">
              <button v-if="hasActiveFilters" type="button" @click="resetFilters">{{ t('shop.filtersReset') }}</button>
              <button type="button" class="catalog-filters__close" @click="filtersDrawerOpen = false">{{ t('shop.filtersClose') }}</button>
            </div>
          </div>

          <section class="filter-main">
            <p class="filter-main__title">{{ t('shop.age') }}</p>
            <div class="age-chips">
              <button
                v-for="age in ageOptions"
                :key="age.id"
                type="button"
                class="age-chip"
                :class="{ active: selectedAge === age.id }"
                :aria-pressed="selectedAge === age.id"
                :disabled="ageCount(age.id) === 0 && selectedAge !== age.id"
                @click="toggleAge(age.id)"
              >
                <span>{{ age.label }}</span>
                <small>{{ ageCountLabel(age.id) }}</small>
              </button>
            </div>
          </section>

          <nav class="filter-main category-tree" :aria-label="t('shop.categoriesAria')">
            <p class="filter-main__title">{{ t('shop.categoriesAria') }}</p>

            <button
              v-if="activeCategory === 'all'"
              type="button"
              class="category-tree__all active"
            >
              <span>{{ t('shop.allCategories') }}</span>
              <span class="category-tree__count">{{ sidebarCatalogCount }}</span>
            </button>
            <button
              v-else
              type="button"
              class="category-tree__back"
              @click="clearCategoryFilter"
            >
              <span class="category-tree__back-icon" aria-hidden="true" />
              {{ t('shop.allCategories') }}
            </button>

            <ul v-if="categoryTreePending" class="category-tree__list" aria-hidden="true">
              <li v-for="n in 4" :key="n" class="category-tree__skeleton" />
            </ul>

            <ul v-else class="category-tree__list">
              <li
                v-for="category in displayedCategoryTree"
                :key="category.slug"
                class="category-tree__node"
              >
                <button
                  type="button"
                  class="category-tree__link"
                  :class="{
                    active: activeCategory === category.slug,
                    'is-parent': category.children.length > 0 && activeCategory !== category.slug,
                  }"
                  @click="selectCategory(category.slug)"
                >
                  <span class="category-tree__name">{{ category.name }}</span>
                  <span class="category-tree__count">{{ categoryCount(category.slug) }}</span>
                  <span
                    v-if="category.hasChildren && !category.children.length"
                    class="category-tree__drill"
                    aria-hidden="true"
                  />
                </button>

                <ul v-if="category.children.length" class="category-tree__children">
                  <li v-for="child in category.children" :key="child.slug" class="category-tree__node">
                    <button
                      type="button"
                      class="category-tree__link category-tree__link--child"
                      :class="{ active: activeCategory === child.slug }"
                      @click="selectCategory(child.slug)"
                    >
                      <span class="category-tree__name">{{ child.name }}</span>
                      <span class="category-tree__count">{{ categoryCount(child.slug) }}</span>
                    </button>
                  </li>
                </ul>
              </li>
            </ul>

            <button
              v-if="!categoryTreePending && hiddenCategoryRootsCount > 0"
              type="button"
              class="category-tree__more"
              :aria-expanded="showAllCategoryRoots"
              @click="showAllCategoryRoots = !showAllCategoryRoots"
            >
              {{ showAllCategoryRoots ? t('shop.collapse') : t('shop.categoriesShowMore', { count: hiddenCategoryRootsCount }) }}
            </button>
          </nav>

          <section class="filter-main">
            <p class="filter-main__title">{{ t('shop.price') }}</p>
            <div class="price-filter">
              <label><span>{{ t('shop.priceFrom') }}</span><input v-model.number="priceFrom" type="number" min="0" :max="catalogMaxPrice ?? undefined" placeholder="0" /></label>
              <label><span>{{ t('shop.priceTo') }}</span><input v-model.number="priceTo" type="number" min="0" :max="catalogMaxPrice ?? undefined" :placeholder="catalogMaxPrice === null ? '—' : String(catalogMaxPrice)" /></label>
            </div>
          </section>

          <section class="filter-main">
            <p class="filter-main__title">{{ t('shop.fulfillment') }}</p>
            <div class="segmented" role="radiogroup" :aria-label="t('shop.fulfillment')">
              <label class="segmented__option" :class="{ active: availability === 'all' }" :title="t('shop.fulfillmentAllPreorder')">
                <input v-model="availability" type="radio" value="all" />
                <span>{{ t('shop.fulfillmentAll') }}</span>
              </label>
              <label class="segmented__option" :class="{ active: availability === 'available' }">
                <input v-model="availability" type="radio" value="available" />
                <span>{{ t('shop.fulfillmentInStock') }}</span>
              </label>
            </div>
          </section>

          <div class="catalog-filters__section-label">{{ t('shop.filtersMoreSection') }}</div>

          <div class="filter-group" :class="{ 'is-open': isFilterOpen('interests'), 'has-value': selectedInterests.length > 0 }">
            <button type="button" class="filter-group__toggle" :aria-expanded="isFilterOpen('interests')" @click="toggleFilterSection('interests')">
              <span>{{ t('shop.interests') }}</span>
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
              <p v-if="interestsLoaded && !interests.length" class="filter-hint">{{ t('shop.interestsNotYet') }}</p>
            </div>
          </div>

          <div class="filter-group" :class="{ 'is-open': isFilterOpen('skills'), 'has-value': selectedSkills.length > 0 }">
            <button type="button" class="filter-group__toggle" :aria-expanded="isFilterOpen('skills')" @click="toggleFilterSection('skills')">
              <span>{{ t('shop.skills') }}</span>
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
              <p v-if="skillsLoaded && !skills.length" class="filter-hint">{{ t('shop.skillsNotYet') }}</p>
            </div>
          </div>

          <div class="filter-group" :class="{ 'is-open': isFilterOpen('brand'), 'has-value': Boolean(selectedBrand) }">
            <button type="button" class="filter-group__toggle" :aria-expanded="isFilterOpen('brand')" @click="toggleFilterSection('brand')">
              <span>{{ t('shop.brand') }}</span>
              <span v-if="selectedBrand" class="filter-group__badge">1</span>
              <span class="filter-group__chevron" aria-hidden="true" />
            </button>
            <div v-show="isFilterOpen('brand')" class="filter-group__body">
              <select id="catalog-brand" class="catalog-select" :value="selectedBrand" @change="setCatalogFilter('brand', ($event.target as HTMLSelectElement).value)">
                <option value="">{{ t('shop.allBrands') }}</option>
                <option v-if="selectedBrand && !brands.includes(selectedBrand)" :value="selectedBrand">{{ selectedBrand }}</option>
                <option v-for="brand in brands" :key="brand" :value="brand">{{ brand }}</option>
              </select>
              <p v-if="brandsError" class="filter-hint">{{ t('shop.brandsLoadError') }} <button type="button" @click="loadFilterOptions">{{ t('shop.retry') }}</button></p>
              <p v-else-if="brandsLoaded && !brands.length" class="filter-hint">{{ t('shop.brandsNotYet') }}</p>
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
                  :placeholder="filter.unit ? t('shop.valueWithUnit', { unit: filter.unit }) : t('shop.value')"
                  @change="setCustomScalar(filter.code, ($event.target as HTMLInputElement).value)"
                >
              </template>
              <template v-else-if="filter.type === 'range'">
                <div class="price-filter">
                  <input
                    class="catalog-select"
                    type="number"
                    :value="customRangeMin(filter.code)"
                    :placeholder="t('shop.priceFrom')"
                    @change="setCustomRange(filter.code, 'min', ($event.target as HTMLInputElement).value)"
                  >
                  <input
                    class="catalog-select"
                    type="number"
                    :value="customRangeMax(filter.code)"
                    :placeholder="t('shop.priceToOrValue')"
                    @change="setCustomRange(filter.code, 'max', ($event.target as HTMLInputElement).value)"
                  >
                </div>
                <p class="filter-hint">{{ t('shop.rangeHintGrowth') }}</p>
              </template>
              <template v-else-if="filter.type === 'boolean'">
                <button
                  type="button"
                  class="filter-option"
                  :class="{ active: customFilterValues[filter.code] === '1' }"
                  @click="setCustomScalar(filter.code, customFilterValues[filter.code] === '1' ? '' : '1')"
                >
                  <span class="filter-checkbox">✓</span>
                  <span>{{ t('shop.yes') }}</span>
                </button>
                <button
                  type="button"
                  class="filter-option"
                  :class="{ active: customFilterValues[filter.code] === '0' }"
                  @click="setCustomScalar(filter.code, customFilterValues[filter.code] === '0' ? '' : '0')"
                >
                  <span class="filter-checkbox">✓</span>
                  <span>{{ t('shop.no') }}</span>
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
              <input v-model="searchQuery" type="text" :placeholder="t('shop.searchPlaceholderFull')" class="shop-search-input" />
              <button v-if="searchQuery" class="clear-search-btn" @click="searchQuery = ''">&times;</button>
            </div>

            <div class="catalog-toolbar-controls">
              <button type="button" class="catalog-mobile-filters-btn" @click="filtersDrawerOpen = true">
                {{ t('shop.toolbarFilters') }}
                <span v-if="activeFilterChipCount" class="catalog-mobile-filters-btn__badge">
                  {{ activeFilterChipCount }}
                </span>
              </button>

              <div class="sort-wrap">
                <span class="sort-label">{{ t('shop.sortLabel') }}:</span>
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
            </div>
          </section>

          <div v-if="activeFilterChips.length" class="active-filters">
            <span>{{ t('shop.selected') }}:</span>
            <button v-for="chip in activeFilterChips" :key="`${chip.group}-${chip.id}`" type="button" @click="removeFilterChip(chip)">
              {{ chip.label }} <span>×</span>
            </button>
            <button type="button" class="active-filters__clear" @click="resetFilters">{{ t('shop.clearAll') }}</button>
          </div>

          <p class="catalog-results-count" aria-live="polite">
            {{ catalogDisplayCount }} {{ catalogCountSuffix }}
          </p>

      <!-- Products Grid -->
      <section class="products-grid-section">
        <div v-if="isLoading" class="catalog-empty-state">{{ t('shop.loadingCatalog') }}</div>
        <div v-else-if="catalogLoadError" class="catalog-empty-state" role="alert">
          <p>{{ t('shop.loadErrorTryAgain') }}</p>
          <button type="button" class="reset-filters-btn" @click="loadProducts">{{ t('shop.retry') }}</button>
        </div>
        <div v-else-if="filteredProducts.length === 0" class="no-products-box">
          <AppIcon name="search" :size="40" class="no-prod-icon" />
          <h3>{{ t('shop.emptyTitleToys') }}</h3>
          <p>{{ t('shop.emptyHintFilters') }}</p>
          <button class="reset-filters-btn" @click="resetFilters">{{ t('shop.resetAllFilters') }}</button>
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
                :aria-label="t('shop.openProduct', { title: product.title })"
                @click="navigateToProduct(product)"
              >
                <AppImage :src="product.image" :alt="product.title" custom-class="product-img" :lazy="true" />
              </button>
              <span
                v-if="product.discountBadge"
                class="product-status product-status--discount"
              >
                {{ product.discountBadge }}
              </span>
              <span
                v-else-if="canPreorderProduct(product)"
                class="product-status product-status--preorder"
              >
                {{ t('shop.badgePreorder') }}
              </span>
              <button
                type="button"
                class="card-fav-btn"
                :class="{ active: isFavorite(product.id) }"
                :aria-label="isFavorite(product.id) ? t('shop.favoriteRemove') : t('shop.favoriteAdd')"
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
              <p v-if="product.sku" class="product-sku">{{ t('shop.skuPrefix') }} {{ product.sku }}</p>

              <div class="product-actions">
                <div class="product-price-wrap">
                  <div class="price-row">
                    <strong class="product-price">{{ formatPrice(product.numericPrice) }} ₸</strong>
                    <span v-if="product.compareAtPrice && product.compareAtPrice > product.numericPrice" class="product-compare-price">
                      {{ formatPrice(product.compareAtPrice) }} ₸
                    </span>
                  </div>
                  <span v-if="product.discountNote" class="product-promo-note">{{ product.discountNote }}</span>
                  <span v-else>{{ isGiftMode ? t('shop.priceWithPackaging') : t('shop.pricePerToy') }}</span>
                </div>
                <button
                  type="button"
                  class="add-to-cart-btn"
                  :class="{ added: addedProducts.includes(product.id) }"
                  :disabled="!canAddProduct(product) && !canPreorderProduct(product)"
                  :aria-label="canPreorderProduct(product)
                    ? t('shop.ariaPreorder')
                    : (addedProducts.includes(product.id) ? t('shop.ariaAdded') : t('shop.ariaAdd'))"
                  :title="canPreorderProduct(product) ? t('shop.badgePreorder') : (addedProducts.includes(product.id) ? t('shop.cartAdded') : t('shop.cartAdd'))"
                  @click.stop="handleAddToCart(product)"
                >
                  <AppIcon :name="addedProducts.includes(product.id) ? 'check' : (canPreorderProduct(product) ? 'clock' : (isGiftMode ? 'gift' : 'cart'))" :size="20" />
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>

          <nav v-if="totalPages > 1" class="catalog-pagination" :aria-label="t('shop.paginationPagesAria')">
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TheHeader from '~/components/TheHeader.vue'
import TheFooter from '~/components/TheFooter.vue'
import { resolveMediaUrl } from '~/utils/mediaUrl'
import { buildCartItemSubtitle, materialFromSpecifications } from '~/utils/cartItemMeta'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const localePath = useLocalePath()
const runtimeConfig = useRuntimeConfig()
const apiBase = runtimeConfig.public.apiBase as string
usePageSeo('/shop')
const { addItem } = useCart()
const { success: toastSuccess, error: toastError } = useToast()
const { isFavorite, toggleFavorite, favorites } = useFavorites()
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
const ageOptionDefs = [
  { id: '0-12m', labelKey: 'shop.age0_12', from: 0, to: 11 },
  { id: '1+', labelKey: 'shop.age1plus', from: 12, to: 216 },
  { id: '2+', labelKey: 'shop.age2plus', from: 24, to: 216 },
  { id: '3+', labelKey: 'shop.age3plus', from: 36, to: 216 },
  { id: '4+', labelKey: 'shop.age4plus', from: 48, to: 216 },
  { id: '6+', labelKey: 'shop.age6plus', from: 72, to: 216 },
] as const
const ageOptions = computed(() =>
  ageOptionDefs.map(option => ({
    ...option,
    label: t(option.labelKey),
  })),
)
const ageCounts = ref<Record<string, number>>({})
const ageCountsLoaded = ref(false)
const categoryCounts = ref<Record<string, number>>({})
const catalogTotalCount = ref<number | null>(null)
const selectedAge = computed(() => ageOptionDefs.some(age => age.id === route.query.age) ? String(route.query.age) : '')
const ageCount = (id: string) => ageCounts.value[id] ?? 0
const ageCountLabel = (id: string) => (ageCountsLoaded.value ? String(ageCount(id)) : '…')
const categoryCount = (slug: string) => categoryCounts.value[slug] ?? 0
const categoryCountsLoaded = computed(() => Object.keys(categoryCounts.value).length > 0)
const categoryTreePending = computed(() => !categoryCountsLoaded.value && !brandsLoaded.value && !brandsError.value)
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
    const age = ageOptionDefs.find(option => option.id === selectedAge.value)
    if (age) {
      params.age_from = age.from
      params.age_to = age.to
    }
    if (priceFrom.value) params.price_from = priceFrom.value
    // Only send an intentional upper bound — not the slider resting at catalog max.
    if (hasPriceToFilter.value && priceTo.value !== null) params.price_to = priceTo.value
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
      ageOptionDefs.map(async (age) => {
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
  router.replace({ path: localePath('/shop'), query })
}

const goToPage = (page: number) => {
  const nextPage = Math.min(Math.max(1, page), totalPages.value)
  currentPage.value = nextPage

  updateRouteQuery((query) => {
    if (nextPage <= 1) delete query.page
    else query.page = String(nextPage)
  })
}

const activePaginationPage = computed(() => pageFromRoute())

const categoryLabelBySlug = labelBySlug


const sortOptions = computed(() => [
  { value: 'popular', label: t('shop.sortPopular') },
  { value: 'new', label: t('shop.sortNewest') },
  { value: 'price-asc', label: t('shop.sortPriceAsc') },
  { value: 'price-desc', label: t('shop.sortPriceDesc') },
  { value: 'rating', label: t('shop.sortRating') },
  { value: 'age', label: t('shop.sortAge') },
])

const currentSortLabel = computed(() => {
  return sortOptions.value.find(o => o.value === currentSort.value)?.label || t('shop.sortPopular')
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
  if (activeCategory.value === id) return
  activeCategory.value = id
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

type FilterSectionId = string

const openFilterSections = ref<FilterSectionId[]>([])

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
  material?: string | null
  minAgeMonths: number
  maxAgeMonths: number
  stockStatus: string
  availableQuantity: number
  isPurchaseAvailable: boolean
  isRentalAvailable: boolean
  isPreorderAvailable: boolean
  compareAtPrice?: number | null
  discountType?: string | null
  discountValue?: number | null
  discountBadge?: string | null
  discountNote?: string | null
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
    compareAtPrice: item.compare_at_price ? Number(item.compare_at_price) : null,
    discountType: item.discount_type || 'none',
    discountValue: item.discount_value != null ? Number(item.discount_value) : null,
    discountBadge: item.discount_badge || (item.discount_type === 'percent' && item.discount_value ? `-${Math.round(Number(item.discount_value))}%` : null),
    discountNote: item.discount_note || null,
    image: resolveMediaUrl(
      item.image_url || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=500&q=80',
      apiBase,
    ),
    category: parseCategories(item),
    categoryName: item.category?.name || t('shop.fallbackCategory'),
    toyCategorySlug: item.category?.slug ?? null,
    minAgeMonths: item.min_age_months ?? 0,
    maxAgeMonths: item.max_age_months ?? 72,
    age: `${Math.floor((item.min_age_months ?? 0) / 12)}–${Math.ceil((item.max_age_months ?? 72) / 12)} лет`,
    material: materialFromSpecifications(item.specifications) ?? null,
    stockStatus: item.stock_status || 'available',
    availableQuantity: Number(item.available_quantity ?? 0),
    isPurchaseAvailable: !!item.channels?.is_purchase_available,
    isRentalAvailable: !!item.channels?.is_rental_available,
    isPreorderAvailable: !!item.preorder?.available,
  }
}

let loadRequestId = 0
const catalogLoadError = ref(false)

const favoriteIds = computed(() => (
  favorites.value
    .map(item => Number(item.id))
    .filter(id => Number.isFinite(id) && id > 0)
))

const isFavoritesFilter = computed(() => route.query.filter === 'favorites')

const loadProducts = async () => {
  const requestId = ++loadRequestId
  isLoading.value = true
  catalogLoadError.value = false

  try {
    if (isFavoritesFilter.value && favoriteIds.value.length === 0) {
      products.value = []
      totalCatalogCount.value = 0
      apiLastPage.value = 1
      return
    }

    const params: Record<string, string | number | boolean> = {
      catalog: 'shop',
      page: currentPage.value,
      per_page: itemsPerPage,
      include_preorder: 1,
    }

    if (isFavoritesFilter.value) {
      params.ids = favoriteIds.value.join(',')
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
    const age = ageOptionDefs.find(option => option.id === selectedAge.value)
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

// Favorites live only on the client — reload the allow-list when it changes.
watch(
  () => favoriteIds.value.join(','),
  () => {
    if (!isFavoritesFilter.value) return
    if (currentPage.value > 1) {
      updateRouteQuery((query) => { delete query.page })
      return
    }
    void loadProducts()
  },
)

const openActiveFilterSections = () => {
  if (selectedSkills.value.length) ensureFilterOpen('skills')
  if (selectedInterests.value.length) ensureFilterOpen('interests')
  if (selectedBrand.value) ensureFilterOpen('brand')
  for (const code of Object.keys(customFilterValues.value)) {
    if (customFilterValues.value[code]) ensureFilterOpen(`attr:${code}`)
  }
}

const { cityId: shopCityId } = useCity()
const onShopCityChanged = () => { void loadProducts() }

// Load products immediately on mount — do not wait for sidebar meta.
onMounted(() => {
  syncingFromRoute = true
  syncFromRoute()
  queueMicrotask(() => { syncingFromRoute = false })
  void loadProducts()
  window.addEventListener('alpha:city-changed', onShopCityChanged)
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

onUnmounted(() => {
  window.removeEventListener('alpha:city-changed', onShopCityChanged)
})

watch(shopCityId, () => {
  void loadProducts()
})

const currentCatalogTitle = computed(() => {
  if (isFavoritesFilter.value) return t('shop.titleFavorites')
  if (activeCategory.value !== 'all') return categoryLabelBySlug.value[activeCategory.value] || activeCategory.value
  if (searchQuery.value.trim()) return t('shop.titleSearch', { q: searchQuery.value.trim() })
  return t('shop.titleAllToys')
})

const activeCategoryNode = computed(() => (
  activeCategory.value === 'all' ? undefined : findBySlug(activeCategory.value)
))

const selectedRootSlug = computed(() => {
  const node = activeCategoryNode.value
  if (!node) return null
  return node.isRoot ? node.slug : node.parentSlug
})

const CATEGORY_ROOTS_PREVIEW = 8
const showAllCategoryRoots = ref(false)

/** Shop shows only categories with stock; the selected one stays visible even when empty. */
const hasCategoryItems = (slug: string) => (
  !categoryCountsLoaded.value || categoryCount(slug) > 0 || activeCategory.value === slug
)

/** Drill-down: without a selection list roots; with one, show only its branch with all siblings. */
const visibleCategoryTree = computed(() => {
  const focused = Boolean(activeCategoryNode.value)

  return categories.value
    .filter(root => (focused ? root.slug === selectedRootSlug.value : hasCategoryItems(root.slug)))
    .map((root) => {
      const children = (root.children ?? []).filter(child => hasCategoryItems(child.slug))
      return {
        slug: root.slug,
        name: root.name,
        hasChildren: children.length > 0,
        children: focused ? children : [],
      }
    })
})

const hiddenCategoryRootsCount = computed(() => (
  activeCategoryNode.value ? 0 : Math.max(0, visibleCategoryTree.value.length - CATEGORY_ROOTS_PREVIEW)
))

const displayedCategoryTree = computed(() => (
  showAllCategoryRoots.value || hiddenCategoryRootsCount.value === 0
    ? visibleCategoryTree.value
    : visibleCategoryTree.value.slice(0, CATEGORY_ROOTS_PREVIEW)
))

const pluralizeToys = (count: number) => {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return t('shop.suffixToyOne')
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return t('shop.suffixToyFew')
  return t('shop.suffixToyMany')
}

const hasPriceToFilter = computed(() => (
  priceTo.value !== null
  && (catalogMaxPrice.value === null || priceTo.value < catalogMaxPrice.value)
))

const activeFilterChips = computed<{ group: string, id: string, label: string }[]>(() => {
  const chips: { group: string, id: string, label: string }[] = []
  if (isFavoritesFilter.value) {
    chips.push({ group: 'filter', id: 'favorites', label: t('shop.titleFavorites') })
  }
  if (selectedBrand.value) chips.push({ group: 'brand', id: selectedBrand.value, label: selectedBrand.value })
  const age = ageOptions.value.find(option => option.id === selectedAge.value)
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
  isFavoritesFilter.value
  || activeCategory.value !== 'all'
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
    if (chip.group === 'filter' && chip.id === 'favorites') delete query.filter
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

const catalogDisplayCount = computed(() => totalCatalogCount.value)

const catalogCountSuffix = computed(() => {
  if (availability.value === 'available' && !isFavoritesFilter.value) {
    return t('shop.countAvailableSuffix')
  }
  return pluralizeToys(totalCatalogCount.value)
})

const sidebarCatalogCount = computed(() => {
  if (isFavoritesFilter.value) {
    return totalCatalogCount.value
  }
  if (catalogTotalCount.value !== null) {
    return catalogTotalCount.value
  }
  return totalCatalogCount.value
})

const filteredProducts = computed(() => products.value)

const totalPages = computed(() => apiLastPage.value)

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

const paginatedProducts = computed(() => filteredProducts.value)

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
    navigateTo(localePath(`/product/${product.id}`))
    return
  }
  if (!canAddProduct(product)) {
    toastError(t('errors.productUnavailable'), t('errors.cannotBuyToy'))
    return
  }
  const result = addItem({
    id: product.id,
    title: isGiftMode.value
      ? `${product.title}${t('shop.giftPackagingSuffix')}`
      : product.title,
    price: product.numericPrice,
    image: product.image,
    subtitle: buildCartItemSubtitle({ age: product.age, material: product.material }),
    isGiftPackaging: isGiftMode.value || undefined,
    availableQuantity: product.availableQuantity,
  })
  if (result.quantity <= 0) {
    toastError(t('errors.outOfStock'), t('errors.cannotAddCart'))
    return
  }
  if (result.limited) {
    toastError(t('errors.insufficientStockTitle'), t('errors.insufficientStock', { max: result.max }))
    return
  }
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
  router.push(localePath('/shop'))
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
  const base = localePath(`/product/${product.id}`)
  navigateTo(isGiftMode.value ? `${base}?gift=1` : base)
}
</script>

<style scoped>
.shop-page {
  min-height: 100vh;
  background-color: #FAF8F4;
  color: #262626;
  font-family: 'Manrope', sans-serif;
  padding-bottom: 0;
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

.catalog-toolbar-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.catalog-mobile-filters-btn {
  display: none;
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
  flex-shrink: 0;
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

.catalog-results-count {
  display: none;
  margin: 0 0 14px;
  color: #8A8A9E;
  font-size: 13px;
  font-weight: 700;
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

.filter-main {
  margin: 0;
  padding: 14px 0;
  border-top: 1px solid #ECE8E3;
}

.filter-main__title {
  margin: 0 0 10px;
  color: #262626;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0;
}

.age-chips {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.age-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  min-width: 0;
  padding: 7px 4px 6px;
  border: 1.5px solid #E7E2DC;
  border-radius: 12px;
  background: #fff;
  color: #3F4441;
  font: inherit;
  font-size: 12.5px;
  font-weight: 800;
  line-height: 1.2;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease;
}

.age-chip small {
  color: #9aa09c;
  font-size: 10.5px;
  font-weight: 700;
}

.age-chip:hover:not(:disabled) {
  border-color: var(--green-ink, #233428);
}

.age-chip.active {
  border-color: var(--green-ink, #233428);
  background: var(--green-ink, #233428);
  color: #fff;
}

.age-chip.active small {
  color: rgba(255, 255, 255, 0.75);
}

.age-chip:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.segmented {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px;
  padding: 3px;
  border-radius: 12px;
  background: #F3F1EC;
}

.segmented__option {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  padding: 4px 6px;
  border-radius: 9px;
  color: #5D625F;
  font-size: 12.5px;
  font-weight: 700;
  text-align: center;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.segmented__option input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.segmented__option.active {
  background: #fff;
  color: var(--green-ink, #233428);
  font-weight: 800;
  box-shadow: 0 1px 3px rgba(35, 52, 40, 0.12);
}

.segmented__option:has(input:focus-visible) {
  outline: 2px solid var(--green-ink, #233428);
  outline-offset: 1px;
}

.category-tree__back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 6px;
  padding: 4px 8px 4px 4px;
  border: 0;
  border-radius: 8px;
  background: none;
  color: #6f7571;
  font: inherit;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}

.category-tree__back:hover {
  background: #F3F1EC;
  color: var(--green-ink, #233428);
}

.category-tree__back-icon,
.category-tree__drill {
  flex: 0 0 auto;
  width: 7px;
  height: 7px;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
}

.category-tree__back-icon {
  margin-left: 4px;
  transform: rotate(135deg);
}

.category-tree__drill {
  margin-left: -2px;
  color: #9aa09c;
  transform: rotate(-45deg);
}

.category-tree__all {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.category-tree__all.active {
  background: #D9E0D5;
  text-decoration: none;
  cursor: default;
}

.catalog-filters__top + .filter-main {
  padding-top: 4px;
  border-top: 0;
}

.category-tree__list,
.category-tree__children {
  list-style: none;
  margin: 0;
  padding: 0;
}

.category-tree__list {
  display: grid;
  gap: 2px;
  margin-top: 4px;
}

.category-tree__children {
  display: grid;
  gap: 1px;
  margin: 2px 0 6px 14px;
  padding-left: 8px;
  border-left: 2px solid #ECE8E3;
}

.category-tree__node {
  margin: 0;
}

.category-tree__link {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 6px 10px 6px 8px;
  border: 0;
  border-radius: 10px;
  background: none;
  color: #3F4441;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.3;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.category-tree__link:hover {
  background: #F3F1EC;
  color: var(--green-ink, #233428);
}

.category-tree__link.active {
  background: #D9E0D5;
  color: var(--green-ink, #233428);
  font-weight: 800;
  cursor: default;
}

.category-tree__link.is-parent {
  color: var(--green-ink, #233428);
  font-weight: 800;
}

.category-tree__link--child {
  min-height: 30px;
  padding: 5px 10px 5px 8px;
  color: #5D625F;
  font-weight: 600;
}

.category-tree__name {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}

.category-tree__count {
  flex: 0 0 auto;
  min-width: 24px;
  padding: 1px 7px;
  border-radius: 999px;
  background: #F3F1EC;
  color: #7A807C;
  font-size: 11px;
  font-weight: 700;
  line-height: 18px;
  text-align: center;
}

.category-tree__link.active .category-tree__count,
.category-tree__all.active .category-tree__count {
  background: var(--green-ink, #233428);
  color: #fff;
}

.category-tree__more {
  width: 100%;
  margin-top: 4px;
  padding: 7px 8px;
  border: 0;
  border-radius: 10px;
  background: none;
  color: var(--green-ink, #233428);
  font: inherit;
  font-size: 12px;
  font-weight: 800;
  text-align: left;
  cursor: pointer;
}

.category-tree__more:hover {
  background: #F3F1EC;
}

.category-tree__skeleton {
  height: 30px;
  margin: 2px 0;
  border-radius: 10px;
  background: linear-gradient(90deg, #F3F1EC 0%, #FAF8F5 50%, #F3F1EC 100%);
  background-size: 200% 100%;
  animation: category-tree-shimmer 1.2s ease-in-out infinite;
}

@keyframes category-tree-shimmer {
  from { background-position: 100% 0; }
  to { background-position: -100% 0; }
}

.catalog-filters__section-label {
  margin: 0;
  padding: 14px 0 0;
  border-top: 1px solid #ECE8E3;
  color: #9aa09c;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.catalog-filters__section-label + .filter-group {
  margin-top: 2px;
  padding-top: 0;
  border-top: 0;
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

.price-filter {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.price-filter label {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 10px;
  border: 1.5px solid #E7E2DC;
  border-radius: 12px;
  background: #fff;
  color: #9A98A8;
  font-size: 11px;
  font-weight: 700;
  transition: border-color 0.15s ease;
}

.price-filter label:focus-within {
  border-color: var(--green-ink, #233428);
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
  font-size: 13px;
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
  min-width: 0;
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
  align-items: stretch;
}

.product-card {
  min-width: 0;
  height: 100%;
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

.product-status--discount {
  background: #E11D48;
  color: #fff;
  box-shadow: 0 2px 8px rgba(225, 29, 72, 0.35);
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.product-compare-price {
  font-size: 13px;
  color: #94A3B8;
  text-decoration: line-through;
  font-weight: 500;
}

.product-promo-note {
  font-size: 11px;
  color: #E11D48;
  font-weight: 600;
  line-height: 1.2;
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
  width: 100%;
  max-width: 100%;
  min-width: 0;
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
  word-break: break-word;
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

  .catalog-heading__title-row > span {
    display: none;
  }

  .catalog-gift-link {
    width: 100%;
  }

  .catalog-layout {
    grid-template-columns: 1fr;
  }

  .catalog-mobile-filters-btn {
    display: inline-flex;
  }

  .catalog-results-count {
    display: block;
  }

  .catalog-filters-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 1090;
    background: rgba(20, 24, 22, 0.45);
  }

  .catalog-filters {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 1100;
    width: min(360px, 92vw);
    max-height: 100vh;
    background: #fff;
    margin: 0;
    overflow: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
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

  .shop-toolbar-row {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    margin-bottom: 12px;
  }

  .search-input-wrap {
    width: 100%;
  }

  .catalog-toolbar-controls {
    width: 100%;
    justify-content: space-between;
    gap: 8px;
  }

  .sort-wrap {
    flex: 1;
    min-width: 0;
    justify-content: flex-end;
    gap: 6px;
  }

  .sort-label {
    display: none;
  }

  .sort-select-btn {
    flex: 1;
    min-width: 0;
    min-height: 44px;
    justify-content: space-between;
    padding: 8px 14px;
  }

  .sort-select-btn strong {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sort-dropdown-menu {
    width: min(210px, calc(100vw - 40px));
  }

  .active-filters {
    margin: 0 0 12px;
  }

  .products-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .product-card {
    height: 100%;
  }

  .product-img-wrap {
    aspect-ratio: 1 / 1;
  }

  .product-sku {
    display: none;
  }

  .product-title {
    min-height: 2.7em;
  }

  .product-actions {
    margin-top: auto;
  }

  .add-to-cart-btn {
    width: 44px;
    height: 44px;
    flex: 0 0 44px;
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

  /* Compact 2-column product cards */
  .products-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .product-card {
    height: 100%;
    padding: 6px;
    border-radius: 16px;
  }

  .product-card:hover {
    transform: none;
  }

  .product-img-wrap {
    aspect-ratio: 1 / 1;
    height: auto;
    border-radius: 12px;
  }

  .product-status {
    top: 6px;
    left: 6px;
    max-width: calc(100% - 48px);
    font-size: 9px;
    padding: 5px 7px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .product-info {
    padding: 10px 4px 4px;
    min-width: 0;
  }

  .product-meta {
    gap: 4px;
    margin-bottom: 4px;
    font-size: 8.5px;
  }

  .product-meta span:last-child {
    flex-shrink: 0;
  }

  .product-title {
    min-height: 2.7em;
    margin-bottom: 0;
  }

  .product-sku {
    display: none;
  }

  .product-title button {
    font-size: 12.5px;
    line-height: 1.35;
  }

  .product-actions {
    gap: 6px;
    margin-top: auto;
    padding-top: 8px;
  }

  .product-price-wrap {
    gap: 2px;
  }

  .product-price {
    font-size: 13.5px;
    font-weight: 800;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .product-price-wrap > span {
    font-size: 9.5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .add-to-cart-btn {
    width: 44px;
    height: 44px;
    flex: 0 0 44px;
    border-radius: 50%;
  }

  .card-fav-btn {
    width: 36px;
    height: 36px;
    top: 6px;
    right: 6px;
  }

  .gift-boxes-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .container {
    padding: 0 12px;
  }

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

  .catalog-mobile-filters-btn {
    padding: 10px 12px;
    font-size: 13px;
  }

  .products-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .product-card {
    padding: 5px;
    border-radius: 14px;
  }

  .product-img-wrap {
    border-radius: 10px;
  }

  .product-info {
    padding: 8px 3px 3px;
  }

  .product-title button {
    font-size: 12px;
  }

  .product-price {
    font-size: 12.5px;
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
