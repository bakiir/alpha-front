<template>
  <div id="catalog-mega-menu" class="catalog-menu" role="dialog" aria-label="Каталог товаров">
    <div v-if="isLoading" class="catalog-menu__state catalog-menu__state--padded">
      Загрузка категорий...
    </div>

    <div v-else-if="loadError" class="catalog-menu__state catalog-menu__state--padded">
      Не удалось загрузить категории. Проверьте подключение к API.
    </div>

    <div v-else-if="categories.length === 0" class="catalog-menu__state catalog-menu__state--padded">
      Категории пока не добавлены.
    </div>

    <div v-else class="catalog-menu__layout">
      <aside class="catalog-menu__sidebar">
        <label class="catalog-menu__search">
          <AppIcon name="search" :size="16" aria-hidden="true" />
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Искать по категориям"
            autocomplete="off"
          >
        </label>

        <nav class="catalog-menu__nav" aria-label="Основные категории">
          <button
            v-for="category in filteredCategories"
            :key="category.slug"
            type="button"
            class="catalog-menu__nav-item"
            :class="{ active: activeSlug === category.slug }"
            @mouseenter="activeSlug = category.slug"
            @focus="activeSlug = category.slug"
            @click="$emit('selectCategory', category.slug)"
          >
            <span class="catalog-menu__nav-icon" aria-hidden="true">
              <AppIcon :name="resolveIcon(category.icon)" :size="18" />
            </span>
            <span class="catalog-menu__nav-name">{{ category.name }}</span>
            <span class="catalog-menu__nav-chevron" aria-hidden="true">›</span>
          </button>

          <p v-if="filteredCategories.length === 0" class="catalog-menu__empty-search">
            Ничего не найдено
          </p>
        </nav>

        <button type="button" class="catalog-menu__view-all" @click="$emit('showAll')">
          Все товары <span aria-hidden="true">→</span>
        </button>
      </aside>

      <section class="catalog-menu__panel" aria-live="polite">
        <template v-if="activeCategory">
          <header class="catalog-menu__panel-head">
            <div>
              <span class="catalog-menu__eyebrow">КАТАЛОГ ALPHA</span>
              <h2>{{ activeCategory.name }}</h2>
            </div>
            <button
              type="button"
              class="catalog-menu__panel-all"
              @click="$emit('selectCategory', activeCategory.slug)"
            >
              Смотреть все
            </button>
          </header>

          <div v-if="activeChildren.length" class="catalog-menu__columns">
            <button
              v-for="child in activeChildren"
              :key="child.slug"
              type="button"
              class="catalog-menu__child"
              @click="$emit('selectCategory', child.slug)"
            >
              <span class="catalog-menu__child-icon" aria-hidden="true">
                <AppIcon :name="resolveIcon(child.icon || activeCategory.icon)" :size="16" />
              </span>
              <span>{{ child.name }}</span>
            </button>
          </div>

          <div v-else class="catalog-menu__state">
            В этой категории пока нет подкатегорий.
            <button
              type="button"
              class="catalog-menu__inline-link"
              @click="$emit('selectCategory', activeCategory.slug)"
            >
              Открыть все товары раздела
            </button>
          </div>
        </template>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ToyCategory } from '~/composables/useToyCategories'
import { resolveIcon } from '~/utils/resolveIcon'

const props = defineProps<{
  categories: ToyCategory[]
  isLoading?: boolean
  loadError?: boolean
}>()

defineEmits<{
  selectCategory: [slug: string]
  showAll: []
}>()

const searchQuery = ref('')
const activeSlug = ref('')

watch(
  () => props.categories,
  (list) => {
    if (!list.length) {
      activeSlug.value = ''
      return
    }
    if (!list.some(category => category.slug === activeSlug.value)) {
      activeSlug.value = list[0].slug
    }
  },
  { immediate: true },
)

const filteredCategories = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return props.categories

  return props.categories.filter((category) => {
    if (category.name.toLowerCase().includes(q) || category.slug.toLowerCase().includes(q)) {
      return true
    }
    return (category.children ?? []).some(child =>
      child.name.toLowerCase().includes(q) || child.slug.toLowerCase().includes(q),
    )
  })
})

watch(filteredCategories, (list) => {
  if (!list.length) return
  if (!list.some(category => category.slug === activeSlug.value)) {
    activeSlug.value = list[0].slug
  }
})

const activeCategory = computed(() =>
  filteredCategories.value.find(category => category.slug === activeSlug.value)
  ?? filteredCategories.value[0]
  ?? null,
)

const activeChildren = computed(() => {
  const category = activeCategory.value
  if (!category) return []

  const q = searchQuery.value.trim().toLowerCase()
  const children = category.children ?? []
  if (!q) return children

  const parentMatched = category.name.toLowerCase().includes(q) || category.slug.toLowerCase().includes(q)
  if (parentMatched) return children

  return children.filter(child =>
    child.name.toLowerCase().includes(q) || child.slug.toLowerCase().includes(q),
  )
})
</script>

<style scoped>
.catalog-menu {
  width: 100%;
  max-width: none;
  overflow: hidden;
  border: 1px solid #e8e5f2;
  border-radius: 0 0 24px 24px;
  background: #fff;
  box-shadow: 0 24px 60px rgba(33, 27, 68, 0.2);
}

.catalog-menu__layout {
  display: grid;
  grid-template-columns: minmax(240px, 300px) minmax(0, 1fr);
  min-height: 420px;
}

.catalog-menu__sidebar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 12px 16px 16px;
  background: #FAF8F4;
  border-right: 1px solid #eceaf3;
}

.catalog-menu__search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid #e3d7c6;
  border-radius: 12px;
  background: #fff;
  color: #6f746f;
}

.catalog-menu__search input {
  width: 100%;
  border: 0;
  outline: none;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  color: #333d36;
}

.catalog-menu__search input::placeholder {
  color: #9aa19a;
  font-weight: 500;
}

.catalog-menu__nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  overflow-y: auto;
  max-height: 420px;
  padding-right: 4px;
}

.catalog-menu__nav-item {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) 16px;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 10px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: #333d36;
  text-align: left;
  cursor: pointer;
  transition: background 140ms ease, color 140ms ease;
}

.catalog-menu__nav-item:hover {
  background: #ece7dc;
}

.catalog-menu__nav-item.active {
  background: var(--green-surface);
  color: var(--green-ink);
}

.catalog-menu__nav-icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid #e8e5f2;
}

.catalog-menu__nav-item.active .catalog-menu__nav-icon {
  border-color: transparent;
  background: rgba(255, 255, 255, 0.7);
}

.catalog-menu__nav-name {
  font-size: 13.5px;
  font-weight: 700;
  line-height: 1.3;
}

.catalog-menu__nav-chevron {
  justify-self: end;
  font-size: 18px;
  opacity: 0.55;
}

.catalog-menu__view-all {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 11px 14px;
  border: 0;
  border-radius: 12px;
  color: var(--green-ink);
  background: #D9E0D5;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}

.catalog-menu__view-all:hover {
  filter: brightness(0.97);
}

.catalog-menu__panel {
  padding: 22px 24px 24px;
}

.catalog-menu__panel-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.catalog-menu__eyebrow {
  display: block;
  margin-bottom: 6px;
  color: var(--green-ink);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.2px;
}

.catalog-menu__panel-head h2 {
  margin: 0;
  color: #262626;
  font-family: 'Manrope', sans-serif;
  font-size: clamp(22px, 2.2vw, 30px);
  font-weight: 700;
  letter-spacing: -0.025em;
}

.catalog-menu__panel-all {
  border: 0;
  background: none;
  color: var(--green-ink);
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
}

.catalog-menu__panel-all:hover {
  text-decoration: underline;
}

.catalog-menu__columns {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px 20px;
}

.catalog-menu__child {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 8px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #3d433f;
  font-size: 13.5px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: background 140ms ease, color 140ms ease;
}

.catalog-menu__child:hover {
  background: #D9E0D5;
  color: var(--green-ink);
}

.catalog-menu__child-icon {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  border-radius: 8px;
  background: #FAF8F4;
}

.catalog-menu__state {
  color: #747183;
  font-size: 14px;
  line-height: 1.5;
}

.catalog-menu__state--padded {
  padding: 28px 30px;
}

.catalog-menu__empty-search {
  margin: 12px 8px;
  color: #747183;
  font-size: 13px;
}

.catalog-menu__inline-link {
  display: inline-block;
  margin-top: 10px;
  border: 0;
  background: none;
  color: var(--green-ink);
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  padding: 0;
}

@media (max-width: 860px) {
  .catalog-menu__layout {
    grid-template-columns: 1fr;
    min-height: 0;
  }

  .catalog-menu__sidebar {
    border-right: 0;
    border-bottom: 1px solid #eceaf3;
  }

  .catalog-menu__nav {
    max-height: 220px;
  }

  .catalog-menu__columns {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .catalog-menu__columns {
    grid-template-columns: 1fr;
  }

  .catalog-menu__panel-head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
