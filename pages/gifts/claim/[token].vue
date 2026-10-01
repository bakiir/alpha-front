<template>
  <div class="redirecting-box">
    <AppSpinner size="40" />
    <p>Переходим к получению подарка...</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, navigateTo } from '#app'

const route = useRoute()
const rawToken = route.params.token
const token = Array.isArray(rawToken) ? rawToken[0] : (rawToken as string || '')

onMounted(async () => {
  if (token) {
    await navigateTo(`/gift/claim/${encodeURIComponent(token)}`, { replace: true })
  } else {
    await navigateTo('/gifts', { replace: true })
  }
})
</script>

<style scoped>
.redirecting-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 16px;
  color: #666;
}
</style>
