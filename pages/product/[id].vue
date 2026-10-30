<template>
  <div class="product-page">
    <TheHeader />

    <main class="container page-content">
      <div v-if="isGiftMode" class="gift-mode-banner">
        <AppIcon name="gift" :size="20" class="gift-mode-icon" />
        <strong>{{ t('product.giftModeCheckout') }}</strong>
        <NuxtLink :to="localePath({ path: '/shop', query: { gift: '1' } })" class="gift-mode-back">{{ t('product.giftModeBackCatalog') }}</NuxtLink>
      </div>

      <nav class="breadcrumbs">
        <NuxtLink :to="localePath('/shop')" class="crumb-link">{{ t('product.breadcrumbShop') }}</NuxtLink>
        <span class="crumb-separator">›</span>
        <span class="crumb-link">{{ product.age }}</span>
        <span class="crumb-separator">›</span>
        <span class="crumb-current">{{ product.title }}</span>
      </nav>

      <section class="product-hero">
        <h1 class="product-title product-title--mobile">{{ product.title }}</h1>

        <!-- 1. Gallery -->
        <div class="gallery-col">
          <div class="main-image-wrap">
            <button
              type="button"
              class="main-image-btn"
              :aria-label="t('product.zoomImage')"
              @click="openZoom = true"
            >
              <img
                :src="currentImage"
                :alt="product.title"
                class="main-product-img"
                loading="eager"
                decoding="async"
                fetchpriority="high"
              />
            </button>
            <FavoriteButton
              v-if="product.id"
              :item="{ id: product.id, title: product.title, price: product.price, image: product.gallery[0] }"
            />
          </div>

          <div v-if="product.gallery.length > 1" class="thumbnails-row">
            <button
              v-for="(img, idx) in product.gallery"
              :key="idx"
              type="button"
              class="thumb-btn"
              :class="{ active: currentImage === img }"
              @click="currentImage = img"
            >
              <img
                :src="img"
                :alt="`${product.title} ${idx + 1}`"
                class="thumb-img"
                loading="lazy"
                decoding="async"
              />
            </button>
          </div>
        </div>

        <!-- 2. Info -->
        <div class="info-col">
          <div class="badges-row">
            <span v-if="product.age" class="age-badge">
              <AppIcon name="baby" :size="14" class="badge-icon" /> {{ product.age }}
            </span>
            <span v-if="product.skill" class="skill-badge">
              <AppIcon name="how-it-works" :size="14" class="badge-icon" /> {{ product.skill }}
            </span>
          </div>

          <h1 class="product-title product-title--desktop">{{ product.title }}</h1>

          <NuxtLink
            v-if="product.brand"
            :to="{ path: localePath('/shop'), query: { brand: product.brand } }"
            class="product-brand"
          >
            {{ product.brand }}
          </NuxtLink>

          <div class="availability-status" :class="{ preorder: isPreorder || preorderPaused }">
            <span class="status-dot" :class="{ out: isPreorder || preorderPaused || availableQty <= 0 }"></span>
            <span>{{ availabilityText }}</span>
          </div>

          <p v-if="shortDescription" class="product-short-desc">{{ shortDescription }}</p>

          <div v-if="highlightSpecs.length" class="highlight-specs">
            <h2 class="highlight-specs__title">{{ t('product.keyCharacteristics') }}</h2>
            <ul class="specs-list specs-list--compact">
              <li v-for="spec in highlightSpecs" :key="spec.key" class="spec-row">
                <span class="spec-label">{{ spec.label }}</span>
                <span class="spec-dots" aria-hidden="true" />
                <span class="spec-value">{{ spec.value }}</span>
              </li>
            </ul>
            <button
              v-if="hasSpecsSection"
              type="button"
              class="all-specs-link"
              @click="scrollToSpecs"
            >
              {{ t('product.allCharacteristics') }}
            </button>
          </div>

          <div v-else-if="hasSpecsSection" class="highlight-specs">
            <button type="button" class="all-specs-link" @click="scrollToSpecs">
              {{ t('product.allCharacteristics') }}
            </button>
          </div>
        </div>

        <!-- 3. Purchase -->
        <div class="buy-col">
          <div v-if="showPurchaseModeSelector" class="purchase-mode-selector">
            <button
              type="button"
              class="mode-btn"
              :class="{ active: purchaseMode === 'buy' }"
              @click="setPurchaseMode('buy')"
            >
              {{ isPreorder ? t('product.modePreorder') : t('product.modeBuy') }}
            </button>
            <button
              type="button"
              class="mode-btn"
              :class="{ active: purchaseMode === 'gift' }"
              @click="setPurchaseMode('gift')"
            >
              {{ t('product.modeAsGift') }}
            </button>
          </div>

          <p v-if="preorderPaused" class="preorder-terms-note">
            {{ t('product.preorderPausedNote') }}
          </p>

          <div class="buy-panel">
            <div class="price-block">
              <div class="price-row">
                <span class="product-price">{{ formatPrice(product.price) }} ₸</span>
                <span v-if="hasComparePrice" class="product-old-price">
                  {{ formatPrice(product.compareAtPrice!) }} ₸
                </span>
                <span v-if="product.discountBadge" class="product-badge-promo">
                  {{ product.discountBadge }}
                </span>
              </div>
              <p v-if="product.discountNote" class="product-promo-note">
                {{ product.discountNote }}
              </p>
              <button type="button" class="discounts-link" @click="isDiscountModalOpen = true">
                {{ t('product.learnDiscounts') }}
              </button>
            </div>

            <div class="qty-stepper" :aria-label="t('product.quantityLabel')">
              <button type="button" class="stepper-btn" @click="decreaseQuantity">-</button>
              <span class="stepper-val">{{ quantity }}</span>
              <button
                type="button"
                class="stepper-btn"
                :disabled="!canIncreaseProductQty"
                :title="canIncreaseProductQty ? undefined : stockLimitHint"
                @click="increaseQuantity"
              >+</button>
            </div>

            <div class="buy-card-ctas">
              <button
                type="button"
                class="add-to-cart-main-btn"
                :class="{ added: isAdded }"
                :disabled="!canBuy && !isPreorder"
                @click="isPreorder ? handlePreorder() : handleAddToCart()"
              >
                {{ isAdded
                  ? (isPreorder ? t('product.addedPreorderDone') : t('product.addedCartDone'))
                  : (isPreorder ? t('product.modePreorder') : (preorderPaused ? t('product.addPreorderPaused') : (canBuy ? t('product.addToCart') : t('product.outOfStock')))) }}
              </button>
              <button
                v-if="canBuy"
                type="button"
                class="buy-now-btn"
                @click="handleBuyNow"
              >
                {{ t('product.buyNow') }}
              </button>
            </div>

            <div
              v-if="isPreorder && (expectedArrival || expectedDelivery)"
              class="preorder-dates"
            >
              <div v-if="expectedArrival" class="preorder-date-card">
                <span class="preorder-date-card__label">{{ t('product.plannedArrival') }}</span>
                <span class="preorder-date-card__value">{{ expectedArrival }}</span>
              </div>
              <div v-if="expectedDelivery" class="preorder-date-card">
                <span class="preorder-date-card__label">{{ t('product.plannedDelivery') }}</span>
                <span class="preorder-date-card__value">{{ expectedDelivery }}</span>
              </div>
            </div>

            <p v-if="isPreorder && preorderMeta?.note" class="preorder-meta-note">
              {{ preorderMeta.note }}
            </p>
            <p v-if="isPreorder" class="preorder-terms-note">
              {{ t('product.preorderTermsNote') }}
            </p>
          </div>
        </div>
      </section>

      <!-- Details: full-width below hero -->
      <section id="product-details" class="product-details">
        <div class="details-tabs" role="tablist" :aria-label="t('product.detailsNavLabel')">
          <button
            v-if="hasSpecsSection"
            type="button"
            role="tab"
            class="details-tab"
            :class="{ active: activeDetailTab === 'specs' }"
            :aria-selected="activeDetailTab === 'specs'"
            @click="activeDetailTab = 'specs'"
          >
            {{ t('product.accordionSpecsSafety') }}
          </button>
          <button
            type="button"
            role="tab"
            class="details-tab"
            :class="{ active: activeDetailTab === 'desc' }"
            :aria-selected="activeDetailTab === 'desc'"
            @click="activeDetailTab = 'desc'"
          >
            {{ t('product.accordionDescription') }}
          </button>
          <button
            type="button"
            role="tab"
            class="details-tab"
            :class="{ active: activeDetailTab === 'reviews' }"
            :aria-selected="activeDetailTab === 'reviews'"
            @click="activeDetailTab = 'reviews'"
          >
            {{ t('product.tabReviews') }}
          </button>
        </div>

        <div
          v-show="activeDetailTab === 'specs' && hasSpecsSection"
          id="product-specs"
          class="details-panel"
          role="tabpanel"
        >
          <ul class="specs-list">
            <li v-if="product.brand" class="spec-row">
              <span class="spec-label">{{ t('product.specBrand') }}</span>
              <span class="spec-dots" aria-hidden="true" />
              <span class="spec-value">
                <NuxtLink
                  :to="{ path: localePath('/shop'), query: { brand: product.brand } }"
                  class="spec-link"
                >
                  {{ product.brand }}
                </NuxtLink>
              </span>
            </li>
            <li v-if="product.barcode" class="spec-row">
              <span class="spec-label">{{ t('product.specProductCode') }}</span>
              <span class="spec-dots" aria-hidden="true" />
              <span class="spec-value-wrap">
                <span class="spec-value">{{ product.barcode }}</span>
                <button
                  type="button"
                  class="spec-copy-btn"
                  :aria-label="barcodeCopied ? t('product.copyDone') : t('product.copySkuAria')"
                  :title="barcodeCopied ? t('product.copyDone') : t('product.copy')"
                  @click="copyBarcode"
                >
                  <AppIcon :name="barcodeCopied ? 'check' : 'copy'" :size="14" />
                </button>
              </span>
            </li>
            <li v-for="spec in product.specifications" :key="spec.key" class="spec-row">
              <span class="spec-label">{{ spec.label }}</span>
              <span class="spec-dots" aria-hidden="true" />
              <span class="spec-value">{{ spec.value }}</span>
            </li>
          </ul>
        </div>

        <div
          v-show="activeDetailTab === 'desc'"
          id="product-desc"
          class="details-panel"
          role="tabpanel"
        >
          <p v-if="product.description" class="details-description">{{ product.description }}</p>
          <p v-else class="details-empty">{{ t('product.noDescription') }}</p>

          <div v-if="product.skills.length" class="product-skills product-skills--details">
            <h2 class="product-skills__title">{{ t('product.skills') }}</h2>
            <div class="product-skills__tags">
              <NuxtLink
                v-for="skill in product.skills"
                :key="skill.slug"
                :to="{ path: localePath('/shop'), query: { skill: skill.slug } }"
                class="product-skill-tag"
              >
                {{ skill.name }}
              </NuxtLink>
            </div>
          </div>

          <div v-if="product.interests.length" class="product-skills product-skills--details">
            <h2 class="product-skills__title">{{ t('product.interests') }}</h2>
            <div class="product-skills__tags">
              <NuxtLink
                v-for="interest in product.interests"
                :key="interest.slug"
                :to="{ path: localePath('/shop'), query: { interest: interest.slug } }"
                class="product-skill-tag"
              >
                {{ interest.name }}
              </NuxtLink>
            </div>
          </div>
        </div>

        <div
          v-show="activeDetailTab === 'reviews'"
          id="reviews"
          class="details-panel details-panel--reviews"
          role="tabpanel"
        >
          <ProductReviews v-if="product.id" :toy-id="product.id" embedded />
        </div>
      </section>

      <section v-if="recommendedProducts.length" class="recommended-section">
        <h2 class="recommended-title">{{ t('product.recommendedTitle') }}</h2>

        <div class="recommended-grid">
          <div
            v-for="rec in recommendedProducts"
            :key="rec.id"
            class="rec-card"
          >
            <div class="rec-img-wrap" @click="navigateToProduct(rec)">
              <img :src="rec.image" :alt="rec.title" class="rec-img" />
            </div>
            <FavoriteButton :item="{ id: rec.id, title: rec.title, price: rec.price, image: rec.image }" />

            <div class="rec-info">
              <div class="rec-badges">
                <span v-if="rec.age" class="rec-age-badge">{{ rec.age }}</span>
                <span v-if="rec.skill" class="rec-skill-badge">{{ rec.skill }}</span>
              </div>

              <h3 class="rec-title" @click="navigateToProduct(rec)">{{ rec.title }}</h3>

              <div class="rec-bottom-row">
                <span class="rec-price">{{ formatPrice(rec.price) }} ₸</span>
                <button
                  type="button"
                  class="rec-buy-btn"
                  :class="{ added: addedRecs.includes(rec.id) }"
                  @click="handleAddRecToCart(rec)"
                >
                  {{ addedRecs.includes(rec.id) ? '✓' : t('product.recommendedToCart') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Image zoom -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="openZoom"
          class="zoom-overlay"
          role="dialog"
          :aria-label="t('product.zoomImage')"
          @click.self="openZoom = false"
        >
          <button type="button" class="zoom-close" :aria-label="t('product.closeZoom')" @click="openZoom = false">
            &times;
          </button>
          <img :src="currentImage" :alt="product.title" class="zoom-img" />
        </div>
      </Transition>
    </Teleport>

    <!-- Discounts Info Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isDiscountModalOpen" class="modal-overlay" @click.self="isDiscountModalOpen = false">
          <div class="discount-modal">
            <button type="button" class="close-btn" @click="isDiscountModalOpen = false">&times;</button>
            <h2 class="modal-title"><AppIcon name="gift" :size="22" class="modal-title-icon" /> {{ t('product.discountModalTitleFull') }}</h2>
            <p class="modal-desc">
              {{ t('product.discountModalDesc') }}
            </p>
            <div class="discount-tariffs">
              <div class="tariff-item">
                <span>{{ t('product.discountPlanStarter') }}</span>
                <strong>{{ t('product.discountPercent15') }}</strong>
              </div>
              <div class="tariff-item featured">
                <span>{{ t('product.discountPlanExplorer') }}</span>
                <strong>{{ t('product.discountPercent25') }}</strong>
              </div>
              <div class="tariff-item">
                <span>{{ t('product.discountPlanMax') }}</span>
                <strong>{{ t('product.discountPercent40') }}</strong>
              </div>
            </div>
            <button type="button" class="modal-ok-btn" @click="isDiscountModalOpen = false">{{ t('product.discountOk') }}</button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TheHeader from '~/components/TheHeader.vue'
import TheFooter from '~/components/TheFooter.vue'
import { resolveMediaUrl } from '~/utils/mediaUrl'
import { buildToyGallery } from '~/utils/toyImage'
import { buildCartItemSubtitle, materialFromSpecifications } from '~/utils/cartItemMeta'
import { cleanMetaDescription, truncateMetaDescription } from '~/utils/seo'
import { formatPreorderRange } from '~/utils/formatPreorderRange'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const runtimeConfig = useRuntimeConfig()
const apiBase = runtimeConfig.public.apiBase as string
const { addItem, startBuyNow } = useCart()
const { fetchToyById, fetchToys } = useToys()
const { user, openAuthModal } = useAuth()
const { success: toastSuccess, error: toastError } = useToast()
const { formatPrice } = useFormatPrice()
const { selectedCity } = useCity()

const isPreorder = ref(false)
const expectedArrival = ref('')
const expectedDelivery = ref('')
const preorderMeta = ref<any>(null)
const preorderPaused = ref(false)
const availableQty = ref(0)
const isPurchaseAvailable = ref(false)
const isGiftChannelAvailable = ref(true)
const barcodeCopied = ref(false)
let barcodeCopiedTimeout: ReturnType<typeof setTimeout> | undefined

const canBuy = computed(() => isPurchaseAvailable.value && !isPreorder.value)

const availabilityText = computed(() => {
  if (isPreorder.value) return t('product.availPreorder')
  if (preorderPaused.value) return t('product.availPreorderPaused')
  if (availableQty.value <= 0) return t('product.availOut')
  if (!isPurchaseAvailable.value) return t('product.availOut')
  const cityName = selectedCity.value?.name
  if (cityName) return t('product.availInStockCity', { city: cityName })
  return t('product.availInStock')
})

const formatPreorderRangeLabel = (from?: string | null, to?: string | null) => {
  const code = String(locale.value || 'ru')
  const tag = code.startsWith('kk') ? 'kk-KZ' : code.startsWith('en') ? 'en-GB' : 'ru-RU'
  return formatPreorderRange(from, to, tag)
}

const isGiftMode = computed(() => route.query.gift === '1')

const quantity = ref(1)
const isAdded = ref(false)
const purchaseMode = ref<'buy' | 'gift'>(isGiftMode.value ? 'gift' : 'buy')
const isDiscountModalOpen = ref(false)
const openZoom = ref(false)
const activeDetailTab = ref<'desc' | 'specs' | 'reviews'>('specs')
const addedRecs = ref<number[]>([])
const isLoading = ref(true)
const loadError = ref(false)

const showPurchaseModeSelector = computed(() => isGiftChannelAvailable.value)

const productStockCap = computed(() => {
  if (isPreorder.value) {
    const remaining = preorderMeta.value?.limit_remaining
    if (remaining == null || remaining === '') return null
    const n = Number(remaining)
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null
  }
  return Math.max(0, Math.floor(Number(availableQty.value) || 0))
})

const stockLimitHint = computed(() => {
  const max = productStockCap.value
  if (max == null) return t('common.stockLimitReached')
  return t('common.stockMaxOnly', { n: max })
})

const canIncreaseProductQty = computed(() => {
  const max = productStockCap.value
  if (max == null) return true
  return quantity.value < max
})

watch(productStockCap, (max) => {
  if (max == null) return
  if (quantity.value > max) quantity.value = Math.max(1, max)
})

const setPurchaseMode = (mode: 'buy' | 'gift') => {
  purchaseMode.value = mode
  const query = { ...route.query }
  if (mode === 'gift') {
    query.gift = '1'
  } else {
    delete query.gift
  }
  router.replace({ path: route.path, query })
}

watch(isGiftMode, (gift) => {
  purchaseMode.value = gift ? 'gift' : 'buy'
})

interface ProductSpec {
  key: string
  label: string
  value: string
}

interface ProductSkill {
  id: number
  slug: string
  name: string
}

interface ProductInterest {
  id: number
  slug: string
  name: string
}

interface Product {
  id: number
  title: string
  brand: string
  barcode: string
  age: string
  skill: string
  skills: ProductSkill[]
  interests: ProductInterest[]
  price: number
  compareAtPrice?: number | null
  discountBadge?: string | null
  discountNote?: string | null
  description: string
  specifications: ProductSpec[]
  gallery: string[]
}

const product = ref<Product>({
  id: 0,
  title: '',
  brand: '',
  barcode: '',
  age: '',
  skill: '',
  skills: [],
  interests: [],
  price: 0,
  description: '',
  specifications: [],
  gallery: []
})

const currentImage = ref('')

const hasComparePrice = computed(() =>
  Boolean(product.value.compareAtPrice && product.value.compareAtPrice > product.value.price),
)

const shortDescription = computed(() => {
  const raw = (product.value.description || '').trim()
  if (!raw) return ''
  if (raw.length <= 220) return raw
  const cut = raw.slice(0, 217).replace(/\s+\S*$/, '')
  return `${cut || raw.slice(0, 217)}…`
})

const highlightSpecs = computed(() => product.value.specifications.slice(0, 5))

const hasSpecsSection = computed(() =>
  Boolean(product.value.brand || product.value.barcode || product.value.specifications.length),
)

const productCartSubtitle = () => buildCartItemSubtitle({
  age: product.value.age,
  material: materialFromSpecifications(product.value.specifications),
})

const scrollToSpecs = async () => {
  activeDetailTab.value = 'specs'
  await nextTick()
  document.getElementById('product-details')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

watch(
  () => route.hash,
  (hash) => {
    if (hash === '#reviews') activeDetailTab.value = 'reviews'
  },
  { immediate: true },
)

const copyBarcode = async () => {
  const code = product.value.barcode?.trim()
  if (!code) return

  try {
    await navigator.clipboard.writeText(code)
    barcodeCopied.value = true
    toastSuccess(t('product.skuCopied'))
    clearTimeout(barcodeCopiedTimeout)
    barcodeCopiedTimeout = setTimeout(() => {
      barcodeCopied.value = false
    }, 1600)
  } catch {
    toastError(t('errors.copyFailed'))
  }
}

const mapToy = (item: any): Product => {
  const minYears = Math.floor((item.min_age_months ?? 0) / 12)
  const maxYears = Math.ceil((item.max_age_months ?? 72) / 12)
  const skillLabel = item.category?.name ?? 'Развитие'

  const gallery = buildToyGallery(item.images, item.image_url)
    .map((url) => resolveMediaUrl(url, apiBase))
    .filter(Boolean)

  const specifications: ProductSpec[] = Array.isArray(item.specifications)
    ? item.specifications
        .filter((s: any) => s?.label && s?.value)
        .map((s: any) => ({
          key: String(s.key ?? s.label),
          label: String(s.label),
          value: String(s.value),
        }))
    : []

  const skills: ProductSkill[] = Array.isArray(item.skills)
    ? item.skills
        .filter((s: any) => s?.slug && s?.name)
        .map((s: any) => ({
          id: Number(s.id),
          slug: String(s.slug),
          name: String(s.name),
        }))
    : []

  const interests: ProductInterest[] = Array.isArray(item.interests)
    ? item.interests
        .filter((s: any) => s?.slug && s?.name)
        .map((s: any) => ({
          id: Number(s.id),
          slug: String(s.slug),
          name: String(s.name),
        }))
    : []

  const brand = typeof item.brand === 'string' ? item.brand.trim() : ''
  const discountBadge = typeof item.discount_badge === 'string' && item.discount_badge.trim()
    ? item.discount_badge.trim()
    : null
  const discountNote = typeof item.discount_note === 'string' && item.discount_note.trim()
    ? item.discount_note.trim()
    : null

  return {
    id: item.id,
    title: item.name,
    brand,
    barcode: item.barcode ? String(item.barcode) : '',
    age: `${minYears}–${maxYears} года`,
    skill: skillLabel,
    skills,
    interests,
    price: item.buyout_price ?? item.price ?? 0,
    compareAtPrice: item.compare_at_price ? Number(item.compare_at_price) : null,
    discountBadge,
    discountNote,
    description: item.description ?? '',
    specifications,
    gallery: gallery.length ? gallery : [resolveMediaUrl('/images/placeholders/toy.svg', apiBase)],
  }
}

const loadProduct = async (id: string | string[]) => {
  isLoading.value = true
  loadError.value = false
  try {
    const data = await fetchToyById(String(id))
    const toy = data?.data ?? data
    product.value = mapToy(toy)
    currentImage.value = product.value.gallery[0]
    isPreorder.value = Boolean(toy.preorder?.available)
    availableQty.value = Number(toy.available_quantity ?? 0)
    isPurchaseAvailable.value = Boolean(toy.channels?.is_purchase_available)
    isGiftChannelAvailable.value = toy.channels?.is_gift_available !== false
    expectedArrival.value = formatPreorderRangeLabel(
      toy.preorder?.expected_arrival_from,
      toy.preorder?.expected_arrival_to,
    )
    expectedDelivery.value = formatPreorderRangeLabel(
      toy.preorder?.expected_delivery_from,
      toy.preorder?.expected_delivery_to,
    )
    preorderMeta.value = toy.preorder || null
    preorderPaused.value = Boolean(toy.preorder?.paused)
      && !Boolean(toy.preorder?.available)
      && availableQty.value <= 0
      && Boolean(toy.channels?.is_preorder_available)
    if (route.hash === '#reviews') {
      activeDetailTab.value = 'reviews'
    } else if (
      product.value.brand
      || product.value.barcode
      || product.value.specifications.length
    ) {
      activeDetailTab.value = 'specs'
    } else {
      activeDetailTab.value = 'desc'
    }
    openZoom.value = false
    quantity.value = 1
    isAdded.value = false
  } catch (e) {
    loadError.value = true
  } finally {
    isLoading.value = false
  }
}

await loadProduct(route.params.id)

const productMetaDescription = computed<string | undefined>(() => {
  const rawDesc = cleanMetaDescription(product.value.description)
  const title = cleanMetaDescription(product.value.title)
  const curLocale = locale.value

  const isCyrillicOnly = rawDesc && /[а-яё]/i.test(rawDesc) && !/[a-z]/i.test(rawDesc)
  const isEnMismatch = curLocale === 'en' && isCyrillicOnly

  if (rawDesc && !isEnMismatch) {
    return truncateMetaDescription(rawDesc)
  }

  if (title) {
    return truncateMetaDescription(t('seo.description.product', { name: title }))
  }

  return undefined
})

useSeoMeta({
  description: () => productMetaDescription.value,
  ogDescription: () => productMetaDescription.value,
})

watch(() => route.params.id, (newId) => {
  if (newId) {
    loadProduct(newId).then(() => loadRecommended())
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
})

const increaseQuantity = () => {
  const max = productStockCap.value
  if (max != null && quantity.value >= max) {
    toastError(t('errors.insufficientStockTitle'), stockLimitHint.value)
    return
  }
  quantity.value += 1
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value -= 1
  }
}

const handleAddToCart = () => {
  if (!canBuy.value) {
    toastError(t('errors.outOfStock'), t('errors.cannotAddCart'))
    return
  }
  const result = addItem({
    id: product.value.id,
    title: isGiftMode.value
      ? `${product.value.title}${t('shop.giftPackagingSuffix')}`
      : product.value.title,
    price: product.value.price,
    compareAtPrice: product.value.compareAtPrice,
    image: currentImage.value,
    subtitle: productCartSubtitle(),
    isGiftPackaging: isGiftMode.value || undefined,
    availableQuantity: availableQty.value,
    quantity: quantity.value,
  })
  if (result.quantity <= 0) {
    toastError(t('errors.outOfStock'), t('errors.cannotAddCart'))
    return
  }
  if (result.limited) {
    toastError(t('errors.insufficientStockTitle'), t('errors.insufficientStock', { max: result.max }))
  }
  isAdded.value = true
  setTimeout(() => {
    isAdded.value = false
  }, 2500)
}

const handleBuyNow = () => {
  if (!canBuy.value) {
    toastError(t('errors.outOfStock'), t('errors.cannotBuyNow'))
    return
  }
  const result = startBuyNow({
    id: product.value.id,
    title: isGiftMode.value
      ? `${product.value.title}${t('shop.giftPackagingSuffix')}`
      : product.value.title,
    price: product.value.price,
    compareAtPrice: product.value.compareAtPrice,
    image: currentImage.value,
    subtitle: productCartSubtitle(),
    quantity: quantity.value,
    isGiftPackaging: isGiftMode.value || undefined,
    availableQuantity: availableQty.value,
  })
  if (result.quantity <= 0) {
    toastError(t('errors.outOfStock'), t('errors.cannotBuyNow'))
    return
  }
  if (result.limited) {
    toastError(t('errors.insufficientStockTitle'), t('errors.insufficientStockBuy', { max: result.max }))
  }
  navigateTo(localePath('/checkout'))
}

const handlePreorder = async () => {
  if (!user.value) {
    openAuthModal('register')
    return
  }
  if (!isPreorder.value || !preorderMeta.value?.available) {
    toastError(
      t('errors.unavailable'),
      preorderPaused.value
        ? t('errors.preorderPaused')
        : t('errors.preorderPaused'),
    )
    return
  }
  const result = addItem({
    id: product.value.id,
    title: product.value.title,
    price: product.value.price,
    image: currentImage.value,
    subtitle: productCartSubtitle(),
    quantity: quantity.value,
    isPreorder: true,
    availableQuantity: productStockCap.value,
    promisedArrivalFrom: preorderMeta.value?.expected_arrival_from ?? null,
    promisedArrivalTo: preorderMeta.value?.expected_arrival_to ?? null,
    promisedDeliveryFrom: preorderMeta.value?.expected_delivery_from ?? null,
    promisedDeliveryTo: preorderMeta.value?.expected_delivery_to ?? null,
    preorderNote: preorderMeta.value?.note ?? null,
    batchId: preorderMeta.value?.batch_id ?? null,
  })
  if (result.quantity <= 0) {
    toastError(t('errors.unavailable'), t('errors.preorderLimitExhausted'))
    return
  }
  if (result.limited) {
    toastError(t('errors.preorderLimitTitle'), t('errors.preorderLimitMax', { max: result.max }))
  }
  isAdded.value = true
  setTimeout(() => { isAdded.value = false }, 2500)
  await navigateTo(`${localePath('/checkout')}?mode=preorder`)
}

const recommendedProducts = ref<any[]>([])

const loadRecommended = async () => {
  try {
    const data = await fetchToys({ catalog: 'shop', per_page: 10 })
    const items = data?.data ?? []
    const filtered = items
      .filter((t: any) => t.id !== Number(route.params.id))
      .slice(0, 3)
      .map((t: any) => {
        const img = t.image_url && !t.image_url.includes('placeholder')
          ? resolveMediaUrl(t.image_url, apiBase)
          : 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=500&q=80'
        const minYears = Math.floor((t.min_age_months ?? 0) / 12)
        const maxYears = Math.ceil((t.max_age_months ?? 72) / 12)
        return {
          id: t.id,
          title: t.name,
          age: `${minYears}–${maxYears} года`,
          skill: t.category?.name ?? 'Развитие',
          price: t.buyout_price ?? t.price ?? 0,
          image: img,
          availableQuantity: Number(t.available_quantity ?? 0),
        }
      })
    recommendedProducts.value = filtered
  } catch (e) {
    // Keep empty list silently
  }
}

loadRecommended()

const handleAddRecToCart = (rec: any) => {
  const result = addItem({
    id: rec.id,
    title: isGiftMode.value
      ? `${rec.title}${t('shop.giftPackagingSuffix')}`
      : rec.title,
    price: rec.price,
    image: rec.image,
    subtitle: buildCartItemSubtitle({ age: rec.age }),
    isGiftPackaging: isGiftMode.value || undefined,
    availableQuantity: rec.availableQuantity,
  })
  if (result.quantity <= 0) {
    toastError(t('errors.outOfStock'), t('errors.cannotAddCart'))
    return
  }
  if (result.limited) {
    toastError(t('errors.insufficientStockTitle'), t('errors.insufficientStock', { max: result.max }))
  }
  if (!addedRecs.value.includes(rec.id)) {
    addedRecs.value.push(rec.id)
    setTimeout(() => {
      const idx = addedRecs.value.indexOf(rec.id)
      if (idx > -1) addedRecs.value.splice(idx, 1)
    }, 2000)
  }
}

const navigateToProduct = (rec: any) => {
  const base = localePath(`/product/${rec.id}`)
  router.push(isGiftMode.value ? `${base}?gift=1` : base)
}
</script>

<style scoped>
.product-page {
  min-height: 100vh;
  background-color: #FAF8F4;
  color: #262626;
  font-family: 'Manrope', sans-serif;
  padding-bottom: 0;
  overflow-x: clip;
}

.container {
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-content {
  padding-top: 28px;
  padding-bottom: 48px;
}

.gift-mode-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, #FFF7ED 0%, #F4F1EA 100%);
  border: 1px solid rgba(51, 61, 54, 0.15);
  font-size: 14px;
}

.gift-mode-back {
  margin-left: auto;
  font-weight: 700;
  color: var(--green-ink);
  text-decoration: none;
}

.breadcrumbs {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 13px;
  color: #6F746F;
  margin-bottom: 24px;
}

.crumb-link {
  color: #6F746F;
  text-decoration: none;
  transition: color 0.2s;
}

.crumb-link:hover {
  color: var(--green-ink);
}

.crumb-separator {
  color: #A0A0B8;
  font-size: 15px;
}

.crumb-current {
  color: #262626;
  font-weight: 700;
  overflow-wrap: anywhere;
}

/* ===== Hero: 3 zones ===== */
.product-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(0, 1.2fr) minmax(260px, 0.95fr);
  grid-template-areas:
    "gallery info buy";
  gap: 28px 32px;
  align-items: start;
  margin-bottom: 40px;
}

.gallery-col { grid-area: gallery; min-width: 0; }
.info-col { grid-area: info; min-width: 0; }
.buy-col { grid-area: buy; min-width: 0; }

.product-title--mobile {
  display: none;
  grid-area: title;
}

.main-image-wrap {
  position: relative;
  --favorite-top: 12px;
  --favorite-right: 12px;
  background: #fff;
  border-radius: 24px;
  aspect-ratio: 1 / 1;
  width: 100%;
  max-height: min(520px, 100vw);
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.main-image-btn {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 16px;
  border: 0;
  background: transparent;
  cursor: zoom-in;
}

.main-product-img {
  display: block;
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
}

.thumbnails-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  overflow-x: auto;
  margin-top: 12px;
  padding-bottom: 2px;
  scrollbar-width: thin;
}

.thumb-btn {
  flex: 0 0 auto;
  width: 64px;
  height: 64px;
  background: #fff;
  border: 1.5px solid transparent;
  border-radius: 12px;
  overflow: hidden;
  padding: 4px;
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.thumb-btn:hover {
  border-color: rgba(51, 61, 54, 0.35);
}

.thumb-btn.active {
  border-color: var(--green-ink);
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.badges-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.age-badge,
.skill-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 700;
  padding: 5px 14px;
  border-radius: 20px;
}

.age-badge {
  background: #FFF1C5;
  color: #7A5300;
}

.skill-badge {
  background: #D9F7EC;
  color: var(--green-ink);
}

.badge-icon {
  flex-shrink: 0;
}

.product-brand {
  display: inline-block;
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--green-ink);
  text-decoration: none;
}

.product-brand:hover {
  text-decoration: underline;
}

.product-title {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: clamp(24px, 2.4vw, 34px);
  color: #262626;
  line-height: 1.2;
  margin: 0 0 10px;
  letter-spacing: -0.4px;
  overflow-wrap: anywhere;
}

.availability-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  color: #5D7A66;
  font-weight: 700;
  margin-bottom: 14px;
}

.availability-status.preorder {
  color: #8A6A3A;
}

.status-dot {
  width: 7px;
  height: 7px;
  background: #5D7A66;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot.out {
  background: #C4A574;
}

.product-short-desc {
  margin: 0 0 18px;
  font-size: 14.5px;
  line-height: 1.55;
  color: #5D625F;
}

.highlight-specs {
  margin-bottom: 18px;
}

.highlight-specs__title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 800;
  color: #262626;
}

.all-specs-link {
  display: inline-block;
  margin-top: 10px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--green-ink);
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.all-specs-link:hover {
  opacity: 0.8;
}

.product-skills {
  margin-bottom: 16px;
}

.product-skills--details {
  margin-top: 24px;
  margin-bottom: 0;
}

.product-skills__title {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 700;
  color: #262626;
}

.product-skills__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.product-skill-tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: #D9F7EC;
  color: var(--green-ink);
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
}

.product-skill-tag:hover {
  background: #c4f0df;
}

/* Buy column */
.purchase-mode-selector {
  display: flex;
  gap: 6px;
  background: #F4F1EA;
  padding: 5px;
  border-radius: 14px;
  margin-bottom: 12px;
}

.mode-btn {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  border-radius: 10px;
  padding: 10px 8px;
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 13.5px;
  color: #6F746F;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-btn.active {
  background: #fff;
  color: #262626;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.buy-panel {
  background: #fff;
  border-radius: 20px;
  padding: 20px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: sticky;
  top: 88px;
}

.price-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
}

.product-price {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 30px;
  line-height: 1.1;
  color: #262626;
}

.product-old-price {
  font-size: 15px;
  color: #94A3B8;
  text-decoration: line-through;
  font-weight: 600;
}

.product-badge-promo {
  background: #E11D48;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 999px;
}

.product-promo-note {
  font-size: 12.5px;
  color: #E11D48;
  font-weight: 600;
  margin: 0;
}

.discounts-link {
  align-self: flex-start;
  background: none;
  border: none;
  font-size: 12.5px;
  color: #6F746F;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
}

.discounts-link:hover {
  color: var(--green-ink);
}

.qty-stepper {
  display: inline-flex;
  align-items: center;
  align-self: stretch;
  justify-content: space-between;
  gap: 14px;
  background: #F4F1EA;
  border-radius: 14px;
  padding: 8px 16px;
}

.stepper-btn {
  background: transparent;
  border: none;
  font-size: 18px;
  font-weight: 800;
  color: #5D625F;
  cursor: pointer;
  padding: 2px 6px;
}

.stepper-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.stepper-val {
  font-weight: 700;
  font-size: 15px;
  color: #262626;
  min-width: 14px;
  text-align: center;
}

.buy-card-ctas {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.add-to-cart-main-btn {
  width: 100%;
  background: var(--green-surface);
  color: var(--green-ink);
  border: none;
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 16px;
  padding: 15px 18px;
  border-radius: 14px;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
  text-align: center;
}

.add-to-cart-main-btn:hover:not(:disabled) {
  background: var(--green-surface-hover);
  transform: translateY(-1px);
}

.add-to-cart-main-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.add-to-cart-main-btn.added {
  background: #9C91C9;
  color: #fff;
}

.buy-now-btn {
  width: 100%;
  background: transparent;
  color: var(--green-ink);
  border: 1.5px solid var(--green-ink);
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 15px;
  padding: 13px 18px;
  border-radius: 14px;
  cursor: pointer;
  transition: background 0.2s ease;
  text-align: center;
}

.buy-now-btn:hover {
  background: #D9E0D5;
}

.preorder-dates {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.preorder-date-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  background: #F7F1E4;
  border-radius: 14px;
}

.preorder-date-card__label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: #8A6A3A;
}

.preorder-date-card__value {
  font-size: 16px;
  font-weight: 800;
  line-height: 1.3;
  color: #2A2116;
}

.preorder-meta-note,
.preorder-terms-note {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.45;
  color: #8A6A3A;
}

.preorder-meta-note {
  font-weight: 600;
  color: #5D625F;
}

/* Details */
.product-details {
  margin-bottom: 48px;
  scroll-margin-top: 96px;
}

.details-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
  padding-bottom: 0;
}

.details-tab {
  appearance: none;
  border: 0;
  background: transparent;
  padding: 12px 16px;
  margin-bottom: -1px;
  font-family: 'Manrope', sans-serif;
  font-size: 14.5px;
  font-weight: 700;
  color: #6F746F;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
}

.details-tab.active {
  color: var(--green-ink);
  border-bottom-color: var(--green-ink);
}

.details-panel {
  max-width: 820px;
}

.details-panel--reviews {
  max-width: none;
}

.details-description {
  margin: 0;
  font-size: 15px;
  line-height: 1.65;
  color: #4A4F4A;
  white-space: pre-wrap;
}

.details-empty {
  margin: 0;
  color: #8A908A;
  font-size: 14px;
}

.specs-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.specs-list--compact {
  gap: 8px;
}

.spec-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  line-height: 1.4;
  color: #2B2F3A;
}

.spec-label {
  flex-shrink: 0;
  font-size: 13.5px;
  font-weight: 600;
  color: #6F746F;
}

.spec-dots {
  flex: 1;
  min-width: 12px;
  align-self: center;
  height: 1px;
  margin-bottom: 2px;
  background-image: radial-gradient(circle, #C8CDD8 1px, transparent 1.5px);
  background-size: 6px 1px;
  background-repeat: repeat-x;
  background-position: center;
}

.spec-value-wrap {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.spec-value {
  flex-shrink: 0;
  max-width: min(52vw, 280px);
  font-size: 13.5px;
  font-weight: 600;
  color: #2B2F3A;
  text-align: right;
  overflow-wrap: anywhere;
}

.spec-link {
  color: var(--green-ink);
  text-decoration: none;
}

.spec-link:hover {
  text-decoration: underline;
}

.spec-copy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #8B93A7;
  cursor: pointer;
}

.spec-copy-btn:hover {
  color: var(--green-ink);
  background: rgba(63, 103, 87, 0.08);
}

/* Recommended */
.recommended-section {
  margin-top: 8px;
}

.recommended-title {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 26px;
  color: #262626;
  margin: 0 0 24px;
}

.recommended-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.rec-card {
  position: relative;
  --favorite-top: 16px;
  --favorite-right: 16px;
  background: #fff;
  border-radius: 20px;
  padding: 14px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease;
}

.rec-card:hover {
  transform: translateY(-3px);
}

.rec-img-wrap {
  height: 180px;
  border-radius: 16px;
  background: #F4F1EA;
  overflow: hidden;
  cursor: pointer;
  margin-bottom: 12px;
}

.rec-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.rec-card:hover .rec-img {
  transform: scale(1.03);
}

.rec-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.rec-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.rec-age-badge,
.rec-skill-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 12px;
}

.rec-age-badge {
  background: #FFF1C5;
  color: #7A5300;
}

.rec-skill-badge {
  background: #D9F7EC;
  color: var(--green-ink);
}

.rec-title {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 16px;
  color: #262626;
  margin: 0 0 14px;
  cursor: pointer;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.rec-title:hover {
  color: var(--green-ink);
}

.rec-bottom-row {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.rec-price {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 18px;
  color: #262626;
}

.rec-buy-btn {
  background: var(--green-surface);
  color: var(--green-ink);
  border: none;
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 13px;
  padding: 8px 14px;
  border-radius: 12px;
  cursor: pointer;
  white-space: nowrap;
}

.rec-buy-btn:hover {
  background: var(--green-surface-hover);
}

.rec-buy-btn.added {
  background: #9C91C9;
  color: #fff;
}

/* Zoom + modal */
.zoom-overlay,
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 26, 46, 0.72);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.zoom-img {
  max-width: min(920px, 100%);
  max-height: min(90vh, 920px);
  object-fit: contain;
  border-radius: 12px;
  background: #fff;
}

.zoom-close,
.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #F4F1EA;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5D625F;
}

.discount-modal {
  position: relative;
  background: #FAF8F4;
  width: 100%;
  max-width: 480px;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}

.modal-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: 'Manrope', sans-serif;
  font-size: 22px;
  font-weight: 800;
  margin: 0 0 8px;
}

.modal-title-icon {
  flex-shrink: 0;
}

.modal-desc {
  font-size: 14px;
  color: #6F746F;
  line-height: 1.45;
  margin: 0 0 20px;
}

.discount-tariffs {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
}

.tariff-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #F8F8FC;
  padding: 12px 18px;
  border-radius: 14px;
  font-size: 14px;
}

.tariff-item.featured {
  background: #D9E0D5;
  border: 1px solid var(--green-ink);
  color: var(--green-ink);
}

.modal-ok-btn {
  width: 100%;
  background: var(--green-surface);
  color: var(--green-ink);
  border: none;
  padding: 12px;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Tablet: 2 columns */
@media (max-width: 1100px) {
  .product-hero {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
    grid-template-areas:
      "gallery buy"
      "info info";
    gap: 24px;
  }

  .buy-panel {
    position: static;
  }
}

/* Phone: title → gallery → buy → info */
@media (max-width: 720px) {
  .container {
    padding: 0 16px;
  }

  .product-hero {
    grid-template-columns: 1fr;
    grid-template-areas:
      "title"
      "gallery"
      "buy"
      "info";
    gap: 18px;
    margin-bottom: 28px;
  }

  .product-title--mobile {
    display: block;
    font-size: 24px;
    margin-bottom: 0;
  }

  .product-title--desktop {
    display: none;
  }

  .main-image-wrap {
    aspect-ratio: 1 / 1;
    max-height: none;
    border-radius: 18px;
  }

  .buy-panel {
    padding: 16px;
    border-radius: 16px;
  }

  .product-price {
    font-size: 26px;
  }

  .details-tab {
    padding: 10px 12px;
    font-size: 13.5px;
  }

  .recommended-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .rec-card {
    padding: 10px;
    border-radius: 14px;
    --favorite-top: 10px;
    --favorite-right: 10px;
  }

  .rec-img-wrap {
    height: auto;
    aspect-ratio: 1 / 0.9;
    border-radius: 11px;
    margin-bottom: 8px;
  }

  .rec-title {
    font-size: 13px;
    margin-bottom: 8px;
  }

  .rec-price {
    font-size: 13px;
  }

  .rec-buy-btn {
    font-size: 11px;
    padding: 5px 10px;
  }
}

@media (max-width: 420px) {
  .mode-btn {
    font-size: 12.5px;
    padding: 9px 4px;
  }

  .add-to-cart-main-btn,
  .buy-now-btn {
    font-size: 14.5px;
    padding: 13px 12px;
  }
}
</style>
