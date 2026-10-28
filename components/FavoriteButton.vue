<template>
  <button
    type="button"
    class="favorite-button"
    :class="{ 'favorite-button--active': isFavorite(item.id) }"
    :aria-label="label"
    :title="label"
    :aria-pressed="isFavorite(item.id)"
    @click.stop.prevent="toggleFavorite(item)"
  >
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
      <path
        d="M12.62 20.71C12.28 20.83 11.72 20.83 11.38 20.71C8.48 19.72 2 15.59 2 8.59C2 5.5 4.49 3 7.56 3C9.38 3 10.99 3.88 12 5.24C13.01 3.88 14.63 3 16.44 3C19.51 3 22 5.5 22 8.59C22 15.59 15.52 19.72 12.62 20.71Z"
        :fill="isFavorite(item.id) ? '#E53935' : '#fff'"
      />
      <path
        clip-rule="evenodd"
        d="M7.56 3.75C4.90771 3.75 2.75 5.9107 2.75 8.59C2.75 11.8405 4.25068 14.4449 6.13923 16.3799C8.03683 18.3242 10.2799 19.542 11.6223 20.0002L11.6296 20.0027L11.6296 20.0028C11.6944 20.0256 11.8286 20.05 12 20.05C12.1714 20.05 12.3056 20.0256 12.3704 20.0028L12.3777 20.0002L12.3777 20.0002C13.7201 19.542 15.9632 18.3242 17.8608 16.3799C19.7493 14.4449 21.25 11.8405 21.25 8.59C21.25 5.9107 19.0923 3.75 16.44 3.75C14.8778 3.75 13.477 4.50911 12.6021 5.68716C12.4606 5.87768 12.2373 5.99 12 5.99C11.7627 5.99 11.5394 5.87768 11.3979 5.68716C10.5225 4.5085 9.13147 3.75 7.56 3.75ZM1.25 8.59C1.25 5.0893 4.07229 2.25 7.56 2.25C9.29674 2.25 10.8646 2.95599 12.0003 4.09472C13.1385 2.95564 14.7122 2.25 16.44 2.25C19.9277 2.25 22.75 5.0893 22.75 8.59C22.75 12.3395 21.0107 15.3001 18.9342 17.4276C16.8683 19.5443 14.4235 20.8861 12.8657 21.4186C12.5914 21.5147 12.2773 21.55 12 21.55C11.7227 21.55 11.4086 21.5147 11.1343 21.4186C9.57655 20.8861 7.13169 19.5443 5.06577 17.4276C2.98932 15.3001 1.25 12.3395 1.25 8.59Z"
        :fill="isFavorite(item.id) ? '#E53935' : '#33383D'"
        fill-rule="evenodd"
      />
    </svg>
  </button>
</template>

<script setup lang="ts">
import type { FavoriteItem } from '~/composables/useFavorites'

const props = defineProps<{ item: FavoriteItem }>()
const { t } = useI18n()
const { isFavorite, toggleFavorite } = useFavorites()
const label = computed(() => isFavorite(props.item.id) ? t('shop.favoriteRemove') : t('shop.favoriteAdd'))
</script>

<style scoped>
.favorite-button {
  position: absolute;
  z-index: 2;
  top: var(--favorite-top, 0px);
  right: var(--favorite-right, 0px);
  display: grid;
  width: 44px;
  height: 44px;
  padding: 0;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  transition: transform 160ms ease;
}

.favorite-button:hover {
  transform: scale(1.12);
}

.favorite-button:focus-visible {
  outline: 2px solid var(--alpha-green);
  outline-offset: 2px;
}

.favorite-button svg {
  display: block;
  filter: drop-shadow(0 1px 2px rgb(0 0 0 / 14%));
}

@media (prefers-reduced-motion: reduce) {
  .favorite-button { transition: none; }
}
</style>
