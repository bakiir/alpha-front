<template>
  <div>
    <TheHeader />
    <main v-if="cmsUnpublished" class="container contact-page-content">
      <FeatureUnavailable
        title="Страница поддержки временно недоступна"
        description="Раздел отключён в админке (страница «Страницы» → Support)."
      />
    </main>
    <main v-else class="container contact-page-content">
      <h1>{{ pageH1 }}</h1>
      <div
        v-if="hasCmsText(seoText)"
        class="contact-intro"
        v-html="bodyHtml"
      />
      <p v-else class="contact-intro">Вопросы об игрушках, заказе или подписке? Выберите удобный способ связи.</p>
      <ContactChannels />
    </main>
    <TheFooter />
  </div>
</template>
<script setup lang="ts">
import { cmsTextToHtml, hasCmsText } from '~/utils/cmsContent'

const { seo, seoText, isPublishedCms, isUnpublished } = usePageSeo('/support')
const cmsUnpublished = computed(() => isUnpublished.value)
const pageH1 = computed(() => {
  if (isPublishedCms.value && seo.value && seo.value.h1 !== null && seo.value.h1 !== undefined) {
    return seo.value.h1
  }
  return 'Связаться с нами'
})
const bodyHtml = computed(() => cmsTextToHtml(seoText.value))
</script>
<style scoped>
.contact-page-content { padding-top: 140px; padding-bottom: 80px; min-height: 65vh; }
h1 { font-size: clamp(40px, 5vw, 64px); }
.contact-intro { max-width: 650px; margin: 22px 0 36px; line-height: 1.7; }
.contact-intro :deep(p) { margin: 0 0 12px; }
.contact-intro :deep(p:last-child) { margin-bottom: 0; }
@media(max-width: 768px) { .contact-page-content { padding-top: 110px; padding-bottom: 48px; } }
</style>
