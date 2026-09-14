<template>
  <section class="contact-channels" aria-label="Способы связи">
    <a :href="whatsappUrl" target="_blank" rel="noopener noreferrer">
      <AppIcon name="message" :size="26" /><h2>WhatsApp</h2>
      <p>Поможем с выбором игрушек, заказом и доставкой.</p><strong>Написать в WhatsApp ↗</strong>
    </a>
    <a :href="`tel:${phoneRaw}`">
      <AppIcon name="phone" :size="26" /><h2>Телефон</h2>
      <p>{{ phone }}</p><strong>Позвонить →</strong>
    </a>
    <a :href="`mailto:${email}`">
      <AppIcon name="mail" :size="26" /><h2>Электронная почта</h2>
      <p>{{ email }}</p><strong>Написать письмо →</strong>
    </a>
    <p class="contact-channels__hours">{{ workHours }}</p>
  </section>
</template>

<script setup lang="ts">
const { phone, phoneRaw, email, whatsappUrl, workHours, isLoaded, fetchSettings } = useSiteSettings()
onMounted(() => { if (!isLoaded.value) fetchSettings() })
</script>

<style scoped>
.contact-channels { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
.contact-channels a { display: flex; flex-direction: column; align-items: flex-start; gap: 18px; padding: clamp(22px, 3vw, 36px); border: 1px solid var(--border-light); border-radius: var(--radius-lg); background: var(--surface); color: var(--text-dark); text-decoration: none; }
.contact-channels a:hover { background: var(--soft-sage-mist); }
.contact-channels a:focus-visible { outline: 3px solid var(--green-ink); outline-offset: 4px; }
.contact-channels h2 { font-size: 30px; }
.contact-channels p { overflow-wrap: anywhere; line-height: 1.65; }
.contact-channels strong { margin-top: auto; color: var(--green-ink); font-size: 14px; }
.contact-channels__hours { grid-column: 1 / -1; color: var(--text-muted); }
@media(max-width: 850px) { .contact-channels { grid-template-columns: 1fr; } }
</style>
