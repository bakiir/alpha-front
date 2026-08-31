<template>
  <div class="legal-page">
    <TheHeader />
    <main class="container">
      <nav class="breadcrumbs">
        <NuxtLink to="/">Главная</NuxtLink>
        <span>/</span>
        <span>Политика конфиденциальности</span>
      </nav>
      <article class="legal-card">
        <h1>Политика конфиденциальности</h1>
        <p class="legal-updated">Последнее обновление: 30 августа 2026 г.</p>
        <section v-for="section in sections" :key="section.title">
          <h2>{{ section.title }}</h2>
          <p v-for="(p, i) in section.paragraphs" :key="i">{{ p }}</p>
        </section>
        <p class="legal-contact">
          По вопросам обработки данных: <a href="mailto:hello@alpha-toys.kz">hello@alpha-toys.kz</a>
        </p>
      </article>
    </main>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Политика конфиденциальности — Alpha Play' })

const sections = [
  {
    title: '1. Общие положения',
    paragraphs: [
      'Настоящая Политика конфиденциальности описывает, как Alpha Play Kazakhstan («Alpha», «мы») собирает, использует и защищает персональные данные пользователей сайта и мобильных сервисов.',
      'Используя наш сервис, вы соглашаетесь с условиями настоящей Политики.',
    ],
  },
  {
    title: '2. Какие данные мы собираем',
    paragraphs: [
      'Имя, телефон, email, адреса доставки, данные о детях (имя, возраст, интересы — по вашему желанию), история заказов, подписок и обращений в поддержку.',
      'Технические данные: cookies, IP-адрес, тип устройства и браузера — для обеспечения работы сайта и аналитики.',
    ],
  },
  {
    title: '3. Цели обработки',
    paragraphs: [
      'Оформление и доставка заказов, управление подписками, связь с клиентом, улучшение сервиса, выполнение требований законодательства Республики Казахстан.',
    ],
  },
  {
    title: '4. Передача третьим лицам',
    paragraphs: [
      'Мы можем передавать данные курьерским службам, платёжным провайдерам и партнёрам только в объёме, необходимом для оказания услуги. Мы не продаём персональные данные.',
    ],
  },
  {
    title: '5. Ваши права',
    paragraphs: [
      'Вы можете запросить доступ, исправление или удаление данных, отозвать согласие на рассылку, обратившись в службу поддержки.',
    ],
  },
]
</script>

<style scoped>
.legal-page { min-height: 100vh; background: #F7F3EA; font-family: 'Onest', sans-serif; padding-bottom: 80px; }
.container { max-width: 800px; margin: 0 auto; padding: 36px 24px; }
.breadcrumbs { display: flex; gap: 8px; font-size: 14px; color: #737B75; margin-bottom: 24px; }
.breadcrumbs a { color: #496B5A; text-decoration: none; }
.legal-card { background: #fff; border-radius: 24px; padding: 40px 36px; border: 1px solid rgba(0,0,0,0.04); }
.legal-card h1 { font-family: 'Onest', sans-serif; font-size: 32px; font-weight: 800; margin-bottom: 8px; }
.legal-updated { font-size: 13px; color: #737B75; margin-bottom: 28px; }
.legal-card h2 { font-family: 'Onest', sans-serif; font-size: 18px; font-weight: 800; margin: 24px 0 8px; }
.legal-card p { font-size: 14.5px; color: #5F6862; line-height: 1.6; margin-bottom: 10px; }
.legal-contact { margin-top: 32px; padding-top: 20px; border-top: 1px solid #F3EEE6; }
.legal-contact a { color: #496B5A; font-weight: 700; }
@media (max-width: 640px) { .legal-card { padding: 24px 18px; } .legal-card h1 { font-size: 24px; } }
</style>
