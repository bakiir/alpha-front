<template>
  <article class="product-card">
    <div class="product-img-wrap">
      <NuxtLink class="product-image-link" :to="localePath(`/product/${item.id}`)" :aria-label="`Открыть «${item.title}»`">
        <AppImage :src="item.image" :alt="item.title" custom-class="product-img" :lazy="true" />
      </NuxtLink>
      <span v-if="item.discountBadge" class="product-status product-status--discount">{{ item.discountBadge }}</span>
      <span v-else-if="item.isPreorder" class="product-status product-status--preorder">{{ t('shop.badgePreorder') }}</span>
      <FavoriteButton :item="{ id: item.id, title: item.title, price: item.price, image: item.image }" />
    </div>
    <div class="product-info">
      <div v-if="item.categoryName || item.age" class="product-meta">
        <span>{{ item.categoryName }}</span>
        <span v-if="item.categoryName && item.age" aria-hidden="true">·</span>
        <span>{{ item.age }}</span>
      </div>
      <h3 class="product-title"><NuxtLink :to="localePath(`/product/${item.id}`)">{{ item.title }}</NuxtLink></h3>
      <p v-if="item.barcode" class="product-sku">{{ t('shop.skuPrefix') }} {{ item.barcode }}</p>
      <div class="product-actions">
        <div class="product-price-wrap">
          <div class="price-row">
            <strong class="product-price">{{ formatPrice(item.price) }} ₸</strong>
            <span v-if="item.compareAtPrice && item.compareAtPrice > item.price" class="product-compare-price">{{ formatPrice(item.compareAtPrice) }} ₸</span>
          </div>
          <span v-if="item.discountNote" class="product-promo-note">{{ item.discountNote }}</span>
          <span v-else>{{ priceLabel || t('shop.pricePerToy') }}</span>
        </div>
        <button
          type="button"
          class="add-to-cart-btn"
          :class="{ added, 'in-cart': !added && inCart }"
          :disabled="disabled && !item.isPreorder && !inCart"
          :aria-label="item.isPreorder ? t('shop.ariaPreorder') : (inCart ? t('shop.cartGo') : t('shop.ariaAdd'))"
          :title="item.isPreorder ? t('shop.badgePreorder') : (inCart ? t('shop.cartGo') : t('shop.cartAdd'))"
          @click.stop="$emit('action')"
        >
          <AppIcon :name="added ? 'check' : (item.isPreorder ? 'clock' : (inCart ? 'arrow-right' : (giftMode ? 'gift' : 'cart')))" :size="20" />
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
export interface ShopCardItem {
  id: number
  title: string
  price: number
  image: string
  categoryName?: string
  age?: string
  barcode?: string
  compareAtPrice?: number | null
  discountBadge?: string | null
  discountNote?: string | null
  isPreorder?: boolean
}

withDefaults(defineProps<{
  item: ShopCardItem
  inCart?: boolean
  added?: boolean
  disabled?: boolean
  giftMode?: boolean
  priceLabel?: string
}>(), {
  inCart: false,
  added: false,
  disabled: false,
  giftMode: false,
  priceLabel: '',
})
defineEmits<{ action: [] }>()
const { t } = useI18n()
const localePath = useLocalePath()
const { formatPrice } = useFormatPrice()
</script>

<style scoped>
.product-card{min-width:0;height:100%;overflow:hidden;background:#fff;border-radius:20px;padding:7px;border:1px solid rgba(38,38,38,.1);box-shadow:0 10px 28px rgba(38,38,38,.045);display:flex;flex-direction:column;transition:transform .25s,box-shadow .25s,border-color .25s}
.product-card:hover{transform:translateY(-4px);box-shadow:0 18px 40px rgba(38,38,38,.085);border-color:rgba(63,103,87,.3)}
.product-img-wrap{position:relative;width:100%;background:#f4f1ea;border-radius:14px;aspect-ratio:1/.88;overflow:hidden}
.product-image-link{display:block;width:100%;height:100%}
.product-image-link :deep(.app-image-container){background:#f4f1ea}
.product-image-link :deep(.image-fallback-placeholder){background:#f4f1ea;color:#778477}
.product-image-link :deep(.fallback-text){display:none}
.product-image-link :deep(.product-img){width:100%;height:100%;object-fit:cover;object-position:center;padding:0;transition:transform .3s}
.product-card:hover .product-image-link :deep(.product-img){transform:scale(1.04)}
.product-status{position:absolute;top:12px;left:12px;z-index:3;padding:7px 11px;border-radius:999px;font-size:11px;font-weight:800;line-height:1;letter-spacing:.02em;pointer-events:none}
.product-status--preorder{background:#c9852a;color:#fff}
.product-status--discount{background:#e11d48;color:#fff;box-shadow:0 2px 8px rgba(225,29,72,.35)}
.product-info{display:flex;flex-direction:column;flex:1;padding:13px 8px 9px;min-width:0}
.product-meta{display:flex;align-items:center;gap:6px;margin-bottom:7px;color:#74706a;font-size:9.5px;font-weight:700;line-height:1.25;letter-spacing:.035em;text-transform:uppercase}
.product-meta span:first-child{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.product-title{min-height:42px;margin:0 0 6px}
.product-title a{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;width:100%;font-family:Manrope,sans-serif;font-weight:750;font-size:14px;color:#262626;line-height:1.4;text-decoration:none;word-break:break-word}
.product-title a:hover{color:var(--green-ink)}
.product-sku{margin:0 0 12px;color:#9a958e;font-size:11px;font-weight:600;line-height:1.3;letter-spacing:.02em}
.product-actions{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:auto}
.product-price-wrap{display:flex;min-width:0;flex-direction:column;gap:3px}
.price-row{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}
.product-price{font-family:Manrope,sans-serif;font-weight:800;font-size:16px;line-height:1.1;color:#262626}
.product-compare-price{font-size:13px;color:#94a3b8;text-decoration:line-through;font-weight:500}
.product-price-wrap>span{color:#7b7b75;font-size:10.5px;font-weight:600}
.product-price-wrap>.product-promo-note{color:#e11d48;font-size:11px;line-height:1.2}
.add-to-cart-btn{width:44px;height:44px;flex:0 0 44px;background:var(--green-surface);color:var(--green-ink);border:0;padding:0;border-radius:50%;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;box-shadow:0 7px 18px rgba(63,103,87,.24);transition:all .2s}
.add-to-cart-btn:hover{background:var(--green-surface-hover);transform:translateY(-1px)}
.add-to-cart-btn.added{background:#42634d;color:#fff}
.add-to-cart-btn.in-cart{background:#dcebdd;color:#294a35}
.add-to-cart-btn:disabled{color:#999690;background:#e2ded6;box-shadow:none;cursor:not-allowed}
@media(max-width:860px){.product-img-wrap{aspect-ratio:1}.product-sku{display:none}.product-title{min-height:2.7em}}
@media(max-width:600px){.product-card{padding:6px;border-radius:16px}.product-card:hover{transform:none}.product-img-wrap{border-radius:12px}.product-status{top:6px;left:6px;max-width:calc(100% - 48px);font-size:9px;padding:5px 7px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.product-info{padding:10px 4px 4px}.product-meta{gap:4px;margin-bottom:4px;font-size:8.5px}.product-title{margin-bottom:0}.product-title a{font-size:12.5px;line-height:1.35}.product-actions{gap:6px;padding-top:8px}.product-price{font-size:13.5px;white-space:nowrap}.product-price-wrap>span{font-size:9.5px}.add-to-cart-btn{width:44px;height:44px;flex-basis:44px}}
@media(max-width:390px){.product-card{padding:5px;border-radius:14px}.product-img-wrap{border-radius:10px}.product-info{padding:8px 3px 3px}.product-title a{font-size:12px}.product-price{font-size:12.5px}}
</style>
