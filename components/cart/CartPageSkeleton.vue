<template>
  <section
    class="cart-skeleton-grid"
    aria-busy="true"
    :aria-label="ariaLabel"
  >
    <div class="cart-skeleton-items">
      <div class="cart-skeleton-panel">
        <div class="cart-skeleton-toolbar">
          <span class="cart-skeleton-block cart-skeleton-block--check" />
          <span class="cart-skeleton-block cart-skeleton-block--toolbar" />
        </div>
        <article
          v-for="n in rowCount"
          :key="n"
          class="cart-skeleton-item"
        >
          <span class="cart-skeleton-block cart-skeleton-block--check" />
          <span class="cart-skeleton-block cart-skeleton-block--thumb" />
          <div class="cart-skeleton-item-body">
            <span class="cart-skeleton-block cart-skeleton-block--title" />
            <span class="cart-skeleton-block cart-skeleton-block--meta" />
            <div class="cart-skeleton-item-bottom">
              <span class="cart-skeleton-block cart-skeleton-block--price" />
              <span class="cart-skeleton-block cart-skeleton-block--stepper" />
            </div>
          </div>
        </article>
      </div>
    </div>
    <aside class="cart-skeleton-sidebar">
      <div class="cart-skeleton-side-card">
        <span class="cart-skeleton-block cart-skeleton-block--heading" />
        <span class="cart-skeleton-block cart-skeleton-block--line" />
        <span class="cart-skeleton-block cart-skeleton-block--promo" />
      </div>
      <div class="cart-skeleton-side-card">
        <div class="cart-skeleton-total-head">
          <span class="cart-skeleton-block cart-skeleton-block--heading" />
          <span class="cart-skeleton-block cart-skeleton-block--total" />
        </div>
        <span
          v-for="n in 3"
          :key="`row-${n}`"
          class="cart-skeleton-block cart-skeleton-block--line"
        />
        <span class="cart-skeleton-block cart-skeleton-block--checkout" />
      </div>
    </aside>
  </section>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  rows?: number
  ariaLabel?: string
}>(), {
  rows: 2,
  ariaLabel: '',
})

const rowCount = computed(() => Math.min(4, Math.max(1, props.rows)))
</script>

<style scoped>
.cart-skeleton-grid {
  display: grid;
  grid-template-columns: 1.55fr 1fr;
  gap: 32px;
  margin-bottom: 54px;
}

.cart-skeleton-panel,
.cart-skeleton-side-card {
  background: #fff;
  border: 1px solid #e9e5dc;
  border-radius: 20px;
  box-shadow: 0 8px 30px rgb(39 48 42 / 4%);
  overflow: hidden;
}

.cart-skeleton-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px;
  border-bottom: 1px solid #eeeae3;
}

.cart-skeleton-item {
  display: flex;
  align-items: flex-start;
  gap: 17px;
  padding: 22px;
  border-bottom: 1px solid #eeeae3;
}

.cart-skeleton-item:last-child {
  border-bottom: none;
}

.cart-skeleton-item-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.cart-skeleton-item-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 6px;
}

.cart-skeleton-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cart-skeleton-side-card {
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cart-skeleton-total-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 4px;
}

.cart-skeleton-block {
  display: block;
  border-radius: 10px;
  background: linear-gradient(90deg, #ece8e0 0%, #f5f2ec 45%, #ece8e0 90%);
  background-size: 200% 100%;
  animation: cart-skeleton-shimmer 1.35s ease-in-out infinite;
}

.cart-skeleton-block--check {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  flex: none;
}

.cart-skeleton-block--toolbar {
  width: 140px;
  height: 18px;
}

.cart-skeleton-block--thumb {
  width: 88px;
  height: 88px;
  border-radius: 16px;
  flex: none;
}

.cart-skeleton-block--title {
  width: min(72%, 320px);
  height: 20px;
}

.cart-skeleton-block--meta {
  width: min(48%, 200px);
  height: 14px;
}

.cart-skeleton-block--price {
  width: 96px;
  height: 22px;
}

.cart-skeleton-block--stepper {
  width: 108px;
  height: 36px;
  border-radius: 12px;
}

.cart-skeleton-block--heading {
  width: 55%;
  height: 20px;
}

.cart-skeleton-block--line {
  width: 100%;
  height: 14px;
}

.cart-skeleton-block--promo {
  width: 100%;
  height: 44px;
  border-radius: 12px;
  margin-top: 4px;
}

.cart-skeleton-block--total {
  width: 88px;
  height: 24px;
}

.cart-skeleton-block--checkout {
  width: 100%;
  height: 48px;
  border-radius: 14px;
  margin-top: 8px;
  animation-duration: 1.1s;
}

@keyframes cart-skeleton-shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

@media (max-width: 960px) {
  .cart-skeleton-grid {
    grid-template-columns: 1fr;
  }
}
</style>
