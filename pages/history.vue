<template>
  <div class="history-redirect"></div>
</template>

<script setup lang="ts">
useSeoMeta({
  robots: 'noindex, nofollow',
})
const route = useRoute()
const localePath = useLocalePath()

const targetQuery: Record<string, any> = {
  ...route.query,
  section: 'history',
}

await navigateTo(
  localePath({
    path: '/profile',
    query: targetQuery,
  }),
  { replace: true }
)
</script>
