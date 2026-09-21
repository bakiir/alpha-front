<template>
  <div class="legal-page">
    <TheHeader />
    <main class="container">
      <nav class="breadcrumbs">
        <NuxtLink to="/">Главная</NuxtLink>
        <span>/</span>
        <span>{{ title }}</span>
      </nav>
      <article class="legal-card">
        <template v-if="doc">
          <h1>{{ doc.title }}</h1>
          <p v-if="doc.published_at" class="legal-updated">
            Редакция №{{ doc.edition_number }} · {{ formatDate(doc.published_at) }}
          </p>
          <div class="legal-body" v-html="doc.body_html" />
        </template>
        <template v-else>
          <h1>{{ title }}</h1>
          <p class="legal-pending">Документ ещё не опубликован в CMS. Актуальная редакция появится после проверки юридической командой.</p>
        </template>
      </article>
    </main>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ slug: string; title: string }>()

useHead({ title: `${props.title} — Alpha Play` })

const config = useRuntimeConfig()
const apiBase = config.public.apiBase || 'http://127.0.0.1:8000/api'

const { data } = await useAsyncData(`legal-${props.slug}`, async () => {
  try {
    return await $fetch<{ success: boolean; data: any }>(`${apiBase}/legal/${props.slug}`)
  } catch {
    return null
  }
})

const doc = computed(() => data.value?.data || null)

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('ru-RU')
  } catch {
    return iso
  }
}
</script>

<style scoped>
.legal-page { min-height: 60vh; }
.legal-card { padding: 2rem 0 4rem; max-width: 720px; }
.legal-updated { color: var(--text-muted, #666); font-size: 0.9rem; }
.legal-pending { color: var(--text-muted, #666); line-height: 1.6; }
.legal-body :deep(p) { margin: 0 0 1rem; line-height: 1.7; }
.breadcrumbs { display: flex; gap: 0.5rem; margin: 1.5rem 0; font-size: 0.9rem; }
</style>
