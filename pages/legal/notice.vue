<template>
  <div class="legal-page">
    <TheHeader />
    <main class="container">
      <nav class="breadcrumbs">
        <NuxtLink to="/">Главная</NuxtLink>
        <span>/</span>
        <span>Официальное уведомление</span>
      </nav>
      <article class="legal-card">
        <h1>Официальное уведомление</h1>
        <p class="legal-updated">Последнее обновление: 30 августа 2026 г.</p>
        <section v-for="section in sections" :key="section.title">
          <h2>{{ section.title }}</h2>
          <p v-for="(p, i) in section.paragraphs" :key="i">{{ p }}</p>
        </section>
      </article>
    </main>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Официальное уведомление — Alpha Play' })

const sections = [
  {
    title: 'Реквизиты',
    paragraphs: [
      'ТОО «Alpha Play Kazakhstan»',
      'г. Алматы, пр. Абая, 150',
      'Email: hello@alpha-toys.kz | Телефон: +7 (707) 123-45-67',
    ],
  },
  {
    title: 'Информация для потребителей',
    paragraphs: [
      'Сервис Alpha Play предоставляет услуги аренды развивающих игрушек по подписке, краткосрочной аренды, продажи и подарочных сертификатов на территории Республики Казахстан.',
      'Актуальные цены, условия доставки и тарифы указаны на сайте и могут изменяться с предварительным уведомлением пользователей.',
    ],
  },
  {
    title: 'Обращения',
    paragraphs: [
      'Претензии и предложения направляйте на hello@alpha-toys.kz или через форму на странице «Контакты». Срок рассмотрения — до 10 рабочих дней.',
    ],
  },
]
</script>

<style scoped>
.legal-page { min-height: 100vh; background: #fff8f0; font-family: 'DM Sans', sans-serif; padding-bottom: 80px; }
.container { max-width: 800px; margin: 0 auto; padding: 36px 24px; }
.breadcrumbs { display: flex; gap: 8px; font-size: 14px; color: #7b7b93; margin-bottom: 24px; }
.breadcrumbs a { color: #624ce0; text-decoration: none; }
.legal-card { background: #fff; border-radius: 24px; padding: 40px 36px; border: 1px solid rgba(0,0,0,0.04); }
.legal-card h1 { font-family: 'Outfit', sans-serif; font-size: 32px; font-weight: 800; margin-bottom: 8px; }
.legal-updated { font-size: 13px; color: #7b7b93; margin-bottom: 28px; }
.legal-card h2 { font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 800; margin: 24px 0 8px; }
.legal-card p { font-size: 14.5px; color: #4a4a68; line-height: 1.6; margin-bottom: 10px; }
@media (max-width: 640px) { .legal-card { padding: 24px 18px; } .legal-card h1 { font-size: 24px; } }
</style>
