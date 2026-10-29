<script setup lang="ts">
/** Старый URL — профили детей только в кабинете */
const localePath = useLocalePath()

await navigateTo(
  { path: localePath('/profile'), query: { section: 'children' } },
  { replace: true, redirectCode: 301 },
)
</script>

<template>
  <div />
</template>
