<template>
  <component
    :is="link ? 'NuxtLink' : 'span'"
    :to="link ? to : undefined"
    class="app-logo"
    :class="`app-logo--${size}`"
  >
    <svg class="app-logo__mark" viewBox="0 0 50 50" aria-hidden="true">
      <circle cx="22" cy="25" r="11" fill="#624CE0" />
      <circle cx="36" cy="25" r="11" fill="#06D6A0" />
      <circle cx="29" cy="14" r="9" fill="#FFD166" />
    </svg>
    <span class="app-logo__word">Alpha</span>
  </component>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  link?: boolean
  to?: string
  size?: 'sm' | 'md' | 'lg'
}>(), {
  link: false,
  to: '/',
  size: 'md',
})
</script>

<style scoped>
.app-logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--text-dark, #1A1A2E);
  flex-shrink: 0;
}

.app-logo__mark {
  display: block;
  flex-shrink: 0;
  height: 36px;
  width: auto;
}

.app-logo__word {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 26px;
  line-height: 1;
  letter-spacing: -0.02em;
}

.app-logo--sm .app-logo__mark {
  height: 28px;
}

.app-logo--sm .app-logo__word {
  font-size: 20px;
}

.app-logo--md .app-logo__mark {
  height: 36px;
}

.app-logo--md .app-logo__word {
  font-size: 26px;
}

.app-logo--lg .app-logo__mark {
  height: 44px;
}

.app-logo--lg .app-logo__word {
  font-size: 30px;
}
</style>
