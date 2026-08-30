<template>
  <div id="alpha-app">
    <NuxtPage />
    <AuthModal />
    <SubscriptionQuizModal />
    <!-- Global toast notifications -->
    <ToastStack />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import AuthModal from '~/components/AuthModal.vue'
import SubscriptionQuizModal from '~/components/SubscriptionQuizModal.vue'
import ToastStack from '~/components/ToastStack.vue'

const { fetchUser, user, openAuthModal } = useAuth()
const { fetchNotifications, notifications } = useNotifications()
const { gift } = useToast()
const route = useRoute()

// Track which notification IDs we've already toasted so we don't repeat
const toastedIds = new Set<number>()

onMounted(async () => {
  await fetchUser()
  if (route.query.login === '1' && !user.value) {
    openAuthModal('login')
  }
  if (user.value) {
    await fetchNotifications()
  }
})

// When user logs in, fetch notifications
watch(user, async (u) => {
  if (u) await fetchNotifications()
})

// When new unread gift notifications arrive — show a toast
watch(notifications, (list) => {
  list
    .filter(n => !n.read_at && n.type === 'gift_activated' && !toastedIds.has(n.id))
    .forEach(n => {
      toastedIds.add(n.id)
      gift(n.title, n.body)
    })
}, { deep: true })
</script>

<style>
/* Global resets and transitions handled in main.css */
</style>
