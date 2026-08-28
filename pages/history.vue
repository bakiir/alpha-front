<template>
  <div class="history-redirect"></div>
</template>

<script setup lang="ts">
const route = useRoute()
const targetQuery: any = { section: 'history' }
if (route.query.tab) {
  targetQuery.tab = route.query.tab
}

await navigateTo({
  path: '/profile',
  query: targetQuery,
}, { replace: true })
</script>
