<template>
  <div id="alpha-app">
    <NuxtPage />
    <AuthModal />
    <SubscriptionQuizModal />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import AuthModal from '~/components/AuthModal.vue'
import SubscriptionQuizModal from '~/components/SubscriptionQuizModal.vue'

const { fetchUser } = useAuth()

onMounted(() => {
  fetchUser()
})
</script>

<style>
/* Global resets and transitions handled in main.css */
</style>
