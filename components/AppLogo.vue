<template>
  <component
    :is="link ? 'NuxtLink' : 'span'"
    :to="link ? to : undefined"
    class="app-logo"
    :class="`app-logo--${size}`"
  >
    <img
      class="app-logo__image"
      :src="imageSrc"
      alt="Alpha — Play, Grow, Belong"
      :width="variant === 'compact' ? 760 : 1200"
      :height="variant === 'compact' ? 802 : 451"
      decoding="async"
    >
  </component>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  link?: boolean
  to?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'horizontal' | 'compact'
}>(), {
  link: false,
  to: '/',
  size: 'md',
  variant: 'horizontal',
})

const imageSrc = computed(() => `/brand/alpha-logo-${props.variant}.png`)
</script>

<style scoped>
.app-logo {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  flex-shrink: 0;
}

.app-logo__image {
  display: block;
  flex-shrink: 0;
  width: auto;
  object-fit: contain;
}

.app-logo--sm .app-logo__image {
  height: 28px;
}

.app-logo--md .app-logo__image {
  height: 38px;
}

.app-logo--lg .app-logo__image {
  height: 44px;
}
</style>
