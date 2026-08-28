<template>
  <div id="catalog-mega-menu" class="catalog-menu" role="dialog" aria-label="Каталог товаров">
    <aside class="catalog-menu__sidebar" aria-label="Основные категории">
      <button
        v-for="section in sections"
        :key="section.id"
        type="button"
        class="catalog-menu__section"
        :class="{ active: section.id === modelValue }"
        @click="$emit('update:modelValue', section.id)"
      >
        <span class="catalog-menu__section-icon" aria-hidden="true">{{ section.icon }}</span>
        <span>{{ section.name }}</span>
        <span class="catalog-menu__section-arrow" aria-hidden="true">›</span>
      </button>

      <button type="button" class="catalog-menu__all" @click="$emit('showAll')">
        <span>Все товары</span>
        <span aria-hidden="true">→</span>
      </button>
    </aside>

    <section class="catalog-menu__content">
      <Transition name="catalog-content" mode="out-in">
        <div :key="activeSection.id" class="catalog-menu__panel">
          <div class="catalog-menu__heading">
            <div>
              <span class="catalog-menu__eyebrow">КАТАЛОГ ALPHA</span>
              <h2>{{ activeSection.title }}</h2>
            </div>
            <button type="button" class="catalog-menu__view-all" @click="$emit('showAll')">
              Смотреть всё <span aria-hidden="true">→</span>
            </button>
          </div>

          <div class="catalog-menu__groups">
            <div v-for="group in activeSection.groups" :key="group.title" class="catalog-menu__group">
              <h3>{{ group.title }}</h3>
              <div class="catalog-menu__items">
                <button
                  v-for="item in group.items"
                  :key="item.slug"
                  type="button"
                  class="catalog-menu__item"
                  @click="$emit('selectItem', item)"
                >
                  {{ item.name }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { CatalogMenuItem, CatalogMenuSection } from '~/types/catalog-menu'

const props = defineProps<{
  modelValue: string
  sections: CatalogMenuSection[]
}>()

defineEmits<{
  'update:modelValue': [value: string]
  selectItem: [item: CatalogMenuItem]
  showAll: []
}>()

const activeSection = computed(() => (
  props.sections.find(section => section.id === props.modelValue) || props.sections[0]
))
</script>

<style scoped>
.catalog-menu {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  width: min(calc(100vw - 72px), 1368px);
  height: min(70vh, 690px);
  overflow: hidden;
  border: 1px solid #e8e5f2;
  border-radius: 0 0 24px 24px;
  background: #fff;
  box-shadow: 0 24px 60px rgba(33, 27, 68, 0.2);
}

.catalog-menu__sidebar {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 20px 14px;
  border-right: 1px solid #eceaf3;
  background: #fbfaff;
}

.catalog-menu__section,
.catalog-menu__all {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 48px;
  gap: 11px;
  padding: 10px 13px;
  border: 0;
  border-radius: 12px;
  color: #68657a;
  background: transparent;
  font-size: 14px;
  font-weight: 700;
  text-align: left;
  transition: color 160ms ease, background 160ms ease, transform 160ms ease;
}

.catalog-menu__section:hover {
  color: #624ce0;
  background: #f0edff;
  transform: translateX(2px);
}

.catalog-menu__section.active {
  color: #624ce0;
  background: #ebe6ff;
}

.catalog-menu__section-icon {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  border-radius: 9px;
  background: #fff;
  font-size: 16px;
}

.catalog-menu__section-arrow {
  margin-left: auto;
  opacity: 0;
  font-size: 22px;
  transition: opacity 160ms ease, transform 160ms ease;
}

.catalog-menu__section.active .catalog-menu__section-arrow {
  opacity: 1;
  transform: translateX(2px);
}

.catalog-menu__all {
  justify-content: space-between;
  margin-top: auto;
  color: #1a1a2e;
  border-top: 1px solid #e8e5f2;
  border-radius: 0;
  padding-top: 17px;
}

.catalog-menu__all:hover {
  color: #624ce0;
}

.catalog-menu__content {
  min-width: 0;
  overflow-y: auto;
  scrollbar-color: #c9c0fa transparent;
  scrollbar-width: thin;
}

.catalog-menu__panel {
  padding: 30px 34px 38px;
}

.catalog-menu__heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 30px;
}

.catalog-menu__eyebrow {
  display: block;
  margin-bottom: 7px;
  color: #7c5cfc;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.2px;
}

.catalog-menu__heading h2 {
  margin: 0;
  color: #1a1a2e;
  font-family: 'Outfit', sans-serif;
  font-size: clamp(28px, 3vw, 42px);
  font-weight: 700;
  letter-spacing: -0.025em;
}

.catalog-menu__view-all {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 12px;
  color: #624ce0;
  background: #f0edff;
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
}

.catalog-menu__view-all:hover {
  background: #e4ddff;
}

.catalog-menu__groups {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 34px 42px;
}

.catalog-menu__group h3 {
  margin: 0 0 13px;
  padding-bottom: 11px;
  border-bottom: 1px solid #e8e5ef;
  color: #242238;
  font-size: 14px;
  font-weight: 800;
}

.catalog-menu__items {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
}

.catalog-menu__item {
  width: 100%;
  padding: 6px 0;
  border: 0;
  color: #747183;
  background: transparent;
  font-size: 13.5px;
  line-height: 1.35;
  text-align: left;
  transition: color 150ms ease, transform 150ms ease;
}

.catalog-menu__item:hover {
  color: #624ce0;
  transform: translateX(3px);
}

.catalog-content-enter-active,
.catalog-content-leave-active {
  transition: opacity 160ms ease, transform 160ms ease;
}

.catalog-content-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.catalog-content-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

@media (max-width: 1100px) {
  .catalog-menu {
    grid-template-columns: 230px minmax(0, 1fr);
  }

  .catalog-menu__groups {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 840px) {
  .catalog-menu {
    display: flex;
    width: auto;
    height: min(78vh, 680px);
    flex-direction: column;
    border-radius: 18px;
  }

  .catalog-menu__sidebar {
    display: flex;
    overflow-x: auto;
    flex-direction: row;
    padding: 12px;
    border-right: 0;
    border-bottom: 1px solid #eceaf3;
    scrollbar-width: none;
  }

  .catalog-menu__sidebar::-webkit-scrollbar {
    display: none;
  }

  .catalog-menu__section {
    width: auto;
    min-width: max-content;
  }

  .catalog-menu__section-arrow,
  .catalog-menu__all {
    display: none;
  }

  .catalog-menu__panel {
    padding: 22px 18px 28px;
  }

  .catalog-menu__heading {
    align-items: flex-start;
    margin-bottom: 24px;
  }

  .catalog-menu__groups {
    grid-template-columns: 1fr;
    gap: 25px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .catalog-content-enter-active,
  .catalog-content-leave-active {
    transition: none;
  }
}
</style>
