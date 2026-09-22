<template>
  <section class="feature-unavailable">
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
    <NuxtLink to="/" class="feature-unavailable__link">На главную</NuxtLink>
  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  description?: string
}>(), {
  title: 'Раздел временно недоступен',
  description: 'Этот раздел сейчас скрыт. Загляните в каталог или оформите подписку — если эти услуги открыты.',
})
</script>

<style scoped>
.feature-unavailable {
  max-width: 640px;
  margin: 48px auto 80px;
  padding: 32px 24px;
  text-align: center;
}

.feature-unavailable h1 {
  margin: 0 0 12px;
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 600;
}

.feature-unavailable p {
  margin: 0 0 24px;
  color: var(--text-muted, #5c6b66);
  line-height: 1.6;
}

.feature-unavailable__link {
  display: inline-flex;
  color: var(--alpha-green, #3f6757);
  font-weight: 700;
  text-decoration: none;
}
</style>
