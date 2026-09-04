<template>
  <div class="legal-page">
    <TheHeader />
    <main class="container">
      <nav class="breadcrumbs">
        <NuxtLink to="/">Главная</NuxtLink>
        <span>/</span>
        <span>Пользовательское соглашение</span>
      </nav>
      <article class="legal-card">
        <h1>Пользовательское соглашение</h1>
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
useHead({ title: 'Пользовательское соглашение — Alpha Play' })

const sections = [
  {
    title: '1. Предмет соглашения',
    paragraphs: [
      'Настоящее Соглашение регулирует отношения между Alpha Play Kazakhstan и пользователем при использовании сайта, оформлении подписок, покупок, аренды и иных услуг.',
    ],
  },
  {
    title: '2. Регистрация и аккаунт',
    paragraphs: [
      'Для доступа к личному кабинету необходима регистрация по номеру телефона. Пользователь обязан предоставлять достоверные данные и не передавать доступ третьим лицам.',
    ],
  },
  {
    title: '3. Подписка и обмены',
    paragraphs: [
      'Условия тарифов, количество игрушек и обменов определяются выбранным планом. Заморозка, перенос обмена и изменение комплекта — в рамках правил, указанных на сайте и в личном кабинете.',
    ],
  },
  {
    title: '4. Оплата и возвраты',
    paragraphs: [
      'Оплата производится через согласованные платёжные системы. Возврат денежных средств — в соответствии с законодательством РК и внутренними правилами сервиса.',
    ],
  },
  {
    title: '5. Ответственность',
    paragraphs: [
      'Пользователь несёт ответственность за сохранность арендованных игрушек в разумных пределах. Сервис не несёт ответственности за перебои связи и форс-мажор.',
    ],
  },
]
</script>

<style scoped>
.legal-page { min-height: 100vh; background: #FAF8F4; font-family: 'Manrope', sans-serif; padding-bottom: 80px; }
.container { max-width: 800px; margin: 0 auto; padding: 36px 24px; }
.breadcrumbs { display: flex; gap: 8px; font-size: 14px; color: #6F746F; margin-bottom: 24px; }
.breadcrumbs a { color: #3F6757; text-decoration: none; }
.legal-card { background: #fff; border-radius: 24px; padding: 40px 36px; border: 1px solid rgba(0,0,0,0.04); }
.legal-card h1 { font-family: 'Manrope', sans-serif; font-size: 32px; font-weight: 800; margin-bottom: 8px; }
.legal-updated { font-size: 13px; color: #6F746F; margin-bottom: 28px; }
.legal-card h2 { font-family: 'Manrope', sans-serif; font-size: 18px; font-weight: 800; margin: 24px 0 8px; }
.legal-card p { font-size: 14.5px; color: #5D625F; line-height: 1.6; margin-bottom: 10px; }
@media (max-width: 640px) { .legal-card { padding: 24px 18px; } .legal-card h1 { font-size: 24px; } }
</style>
