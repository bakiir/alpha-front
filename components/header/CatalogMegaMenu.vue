<template>
  <div id="catalog-mega-menu" class="catalog-menu" role="dialog" aria-label="Каталог товаров">
    <div class="catalog-menu__panel">
      <div class="catalog-menu__heading">
        <div>
          <span class="catalog-menu__eyebrow">КАТАЛОГ ALPHA</span>
          <h2>Категории</h2>
        </div>
        <button type="button" class="catalog-menu__view-all" @click="$emit('showAll')">
          Все товары <span aria-hidden="true">→</span>
        </button>
      </div>

      <div v-if="isLoading" class="catalog-menu__state">Загрузка категорий...</div>

      <div v-else-if="categories.length === 0" class="catalog-menu__state">
        Категории пока не добавлены.
      </div>

      <div v-else class="catalog-menu__grid">
        <button
          v-for="category in categories"
          :key="category.slug"
          type="button"
          class="catalog-menu__category"
          @click="$emit('selectCategory', category.slug)"
        >
          <span class="catalog-menu__category-icon" aria-hidden="true">
            <AppIcon :name="resolveIcon(category.icon)" :size="22" />
          </span>
          <span class="catalog-menu__category-name">{{ category.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ToyCategory } from '~/composables/useToyCategories'
import { resolveIcon } from '~/utils/resolveIcon'

defineProps<{
  categories: ToyCategory[]
  isLoading?: boolean
}>()

defineEmits<{
  selectCategory: [slug: string]
  showAll: []
}>()
</script>

<style scoped>
.catalog-menu {
  width: min(calc(100vw - 72px), 720px);
  overflow: hidden;
  border: 1px solid #e8e5f2;
  border-radius: 0 0 24px 24px;
  background: #fff;
  box-shadow: 0 24px 60px rgba(33, 27, 68, 0.2);
}

.catalog-menu__panel {
  padding: 28px 30px 32px;
}

.catalog-menu__heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.catalog-menu__eyebrow {
  display: block;
  margin-bottom: 7px;
  color: #3F6757;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.2px;
}

.catalog-menu__heading h2 {
  margin: 0;
  color: #262626;
  font-family: 'Manrope', sans-serif;
  font-size: clamp(24px, 2.5vw, 34px);
  font-weight: 700;
  letter-spacing: -0.025em;
}

.catalog-menu__view-all {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border: 0;
  border-radius: 12px;
  color: #3F6757;
  background: #D9E0D5;
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
}

.catalog-menu__view-all:hover {
  background: #e4ddff;
}

.catalog-menu__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.catalog-menu__category {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 58px;
  padding: 12px 14px;
  border: 1px solid #eceaf3;
  border-radius: 14px;
  color: #242238;
  background: #FAF8F4;
  font-size: 14px;
  font-weight: 700;
  text-align: left;
  transition: color 160ms ease, background 160ms ease, border-color 160ms ease, transform 160ms ease;
}

.catalog-menu__category:hover {
  color: #3F6757;
  background: #D9E0D5;
  border-color: #E3D7C6;
  transform: translateY(-1px);
}

.catalog-menu__category-icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  border-radius: 10px;
  background: #fff;
  font-size: 18px;
}

.catalog-menu__category-name {
  line-height: 1.35;
}

.catalog-menu__state {
  padding: 18px 0 6px;
  color: #747183;
  font-size: 14px;
}

@media (max-width: 640px) {
  .catalog-menu {
    width: auto;
    border-radius: 18px;
  }

  .catalog-menu__panel {
    padding: 22px 18px 24px;
  }

  .catalog-menu__heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 14px;
  }

  .catalog-menu__grid {
    grid-template-columns: 1fr;
  }
}
</style>
