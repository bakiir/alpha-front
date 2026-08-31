<template>
  <div class="about-page">
    <TheHeader />

    <main class="container page-content">
      <section class="about-hero">
        <span class="about-badge">О КОМПАНИИ ALPHA</span>
        <h1 class="about-title">Развиваем детей через игру — бережно и осознанно</h1>
        <p class="about-subtitle">
          Alpha Play — сервис аренды, покупки и подарков развивающих эко-игрушек в Казахстане. Мы помогаем родителям давать ребёнку новые впечатления без захламления дома.
        </p>
      </section>

      <section class="about-grid">
        <article class="about-card mission">
          <span class="card-icon"><AppIcon name="pin" :size="32" /></span>
          <h2>Наша миссия</h2>
          <p>
            Сделать качественные развивающие игрушки доступными каждой семье. Мы верим, что ребёнку важнее разнообразие и безопасность, чем бесконечное накопление вещей.
          </p>
        </article>

        <article class="about-card team">
          <span class="card-icon"><AppIcon name="book" :size="32" /></span>
          <h2>Команда и методисты</h2>
          <p>
            Наборы формируют дипломированные методисты Монтессори с учётом возраста, интересов и этапа развития. Каждый комплект — это продуманный маршрут от тактильных игр до логики и моторики.
          </p>
        </article>

        <article class="about-card safety">
          <span class="card-icon"><AppIcon name="shield" :size="32" /></span>
          <h2>Безопасность</h2>
          <p>
            Все игрушки сертифицированы (ЕАС, CE), изготовлены из натуральных материалов с гипоаллергенными покрытиями. Мы не используем токсичные краски и мелкие нестандартные детали без контроля.
          </p>
        </article>

        <article class="about-card cleanliness">
          <span class="card-icon"><AppIcon name="sparkles" :size="32" /></span>
          <h2>Чистота и дезинфекция</h2>
          <p>
            Каждая игрушка проходит многоступенчатую обработку: механическая очистка, пар под давлением (140°C), озонирование и упаковка в стерильный мешочек перед следующей семьёй.
          </p>
        </article>
      </section>

      <section class="about-cta">
        <h2>Готовы попробовать?</h2>
        <p>Оформите подписку или загляните в каталог — мы подберём набор под вашего малыша.</p>
        <div class="cta-row">
          <NuxtLink to="/subscription" class="cta-btn primary">Тарифы подписки</NuxtLink>
          <NuxtLink to="/shop" class="cta-btn secondary">Каталог игрушек</NuxtLink>
        </div>
      </section>
    </main>

    <TheFooter />
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'О компании — Alpha Play' })
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  background: #F7F3EA;
  font-family: 'Onest', sans-serif;
  padding-bottom: 80px;
}

.container {
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-content {
  padding-top: 36px;
}

.about-hero {
  text-align: center;
  max-width: 760px;
  margin: 0 auto 48px;
}

.about-badge {
  display: inline-block;
  background: #E7EFE9;
  color: #496B5A;
  font-weight: 800;
  font-size: 12px;
  letter-spacing: 1px;
  padding: 6px 16px;
  border-radius: 20px;
  margin-bottom: 16px;
}

.about-title {
  font-family: 'Onest', sans-serif;
  font-size: 40px;
  font-weight: 800;
  color: #27312B;
  margin-bottom: 12px;
}

.about-subtitle {
  font-size: 16px;
  color: #737B75;
  line-height: 1.6;
}

.about-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 48px;
}

.about-card {
  background: #fff;
  border-radius: 24px;
  padding: 32px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.02);
}

.card-icon {
  display: inline-flex;
  align-items: center;
  margin-bottom: 12px;
  color: #496B5A;
}

.about-card h2 {
  font-family: 'Onest', sans-serif;
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 8px;
}

.about-card p {
  font-size: 14.5px;
  color: #737B75;
  line-height: 1.55;
}

.about-cta {
  text-align: center;
  background: #fff;
  border-radius: 28px;
  padding: 40px 32px;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.about-cta h2 {
  font-family: 'Onest', sans-serif;
  font-size: 26px;
  margin-bottom: 8px;
}

.about-cta p {
  color: #737B75;
  margin-bottom: 20px;
}

.cta-row {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.cta-btn {
  padding: 12px 24px;
  border-radius: 14px;
  font-weight: 700;
  text-decoration: none;
  font-size: 14px;
}

.cta-btn.primary {
  background: #496B5A;
  color: #fff;
}

.cta-btn.secondary {
  background: #E7EFE9;
  color: #496B5A;
}

@media (max-width: 768px) {
  .about-title { font-size: 28px; }
  .about-grid { grid-template-columns: 1fr; }
  .about-card { padding: 24px 20px; }
}
</style>
