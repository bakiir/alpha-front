<template>
  <div class="redirecting-box">
    <AppSpinner size="40" />
    <p>{{ t('gifts.claim.redirect') }}</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, navigateTo } from '#app'

const { t } = useI18n()
const localePath = useLocalePath()

const route = useRoute()
const rawToken = route.params.token
const token = Array.isArray(rawToken) ? rawToken[0] : (rawToken as string || '')

onMounted(async () => {
  if (token) {
    await navigateTo(localePath(`/gift/claim/${encodeURIComponent(token)}`), { replace: true })
  } else {
    await navigateTo(localePath('/gifts'), { replace: true })
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
