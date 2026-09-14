<template>
  <div>
    <TheHeader />
    <main class="container contact-page-content">
      <h1>Связаться с нами</h1>
      <p class="contact-intro">Вопросы об игрушках, заказе или подписке? Выберите удобный способ связи.</p>
      <ContactChannels />
    </main>
    <TheFooter />
  </div>
</template>
<script setup lang="ts">
useHead({ title: 'Связаться с нами — Alpha' })
</script>
<style scoped>
.contact-page-content { padding-top: 140px; padding-bottom: 80px; min-height: 65vh; }
h1 { font-size: clamp(40px, 5vw, 64px); }
.contact-intro { max-width: 650px; margin: 22px 0 36px; line-height: 1.7; }
@media(max-width: 768px) { .contact-page-content { padding-top: 110px; padding-bottom: 48px; } }
</style>
