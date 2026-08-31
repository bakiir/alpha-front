<template>
  <div class="faq-wrapper">
    <section class="faq-section container">
    <div class="section-heading">
      <div class="badge">вопросы и ответы</div>
      <h2 class="title">Остались вопросы?</h2>
      <p class="subtitle">Мы собрали ответы на самые частые вопросы родителей о безопасности и условиях подписки.</p>
    </div>

    <div class="faq-list">
      <div class="faq-item">
        <div class="faq-header">
          <h3>Как вы дезинфицируете игрушки?</h3>
          <div class="plus-icon"></div>
        </div>
        <p class="faq-body">Каждая возвращённая игрушка проходит 4-ступенчатую медицинскую дезинфекцию: очистку паром под высоким давлением, обработку гипоаллергенными эко-растворами, УФ-стерилизацию и герметичную вакуумную упаковку.</p>
      </div>

      <div class="faq-item">
        <div class="faq-header">
          <h3>Что если ребёнок сломает или потеряет деталь?</h3>
          <div class="plus-icon"></div>
        </div>
        <p class="faq-body">Мы понимаем, что это дети. Небольшие царапины, потертости и утеря мелких базовых деталей полностью покрываются нашей гарантией без каких-либо доплат.</p>
      </div>

      <div class="faq-item">
        <div class="faq-header">
          <h3>Можно ли купить понравившуюся игрушку?</h3>
          <div class="plus-icon"></div>
        </div>
        <p class="faq-body">Да! Если малыш так привязался к игрушке, что не хочет с ней расставаться, вы можете выкупить её по специальной сниженной цене прямо в личном кабинете или приобрести аналогичную новую в нашем магазине.</p>
      </div>
    </div>
  </section>
</div>
</template>

<style scoped>
.faq-wrapper {
  width: 100%;
  background: #EFE9DF;
}

.faq-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px;
  gap: 56px;
  background: transparent;
}

.section-heading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.badge {
  padding: 6px 16px;
  background: #E4ECE6;
  border-radius: 8px;
  font-weight: 700;
  font-size: 12px;
  color: var(--color-primary);
  text-transform: uppercase;
}

.title {
  font-size: 40px;
  font-weight: 700;
}

.subtitle {
  font-size: 18px;
  color: var(--text-muted);
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 800px;
}

.faq-item {
  display: flex;
  flex-direction: column;
  padding: 24px;
  gap: 12px;
  background: var(--text-white);
  border: 1px solid rgba(51, 61, 54, 0.12);
  box-shadow: none;
  border-radius: 12px;
}

.faq-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.faq-header h3 {
  font-size: 18px;
  font-weight: 700;
}

.plus-icon {
  width: 20px;
  height: 20px;
  position: relative;
}

.plus-icon::before, .plus-icon::after {
  content: '';
  position: absolute;
  background: var(--color-primary);
}
.plus-icon::before {
  top: 9px; left: 0; width: 20px; height: 2px;
}
.plus-icon::after {
  left: 9px; top: 0; width: 2px; height: 20px;
}

.faq-body {
  font-size: 15px;
  line-height: 1.5;
  color: var(--text-muted);
}

/* Mobile Responsive */
@media (max-width: 960px) {
  .faq-section {
    padding: 36px 24px;
    gap: 40px;
  }

  .title {
    font-size: 32px;
  }
}

@media (max-width: 640px) {
  .faq-section {
    padding: 32px 16px;
    gap: 28px;
  }

  .title {
    font-size: 26px;
  }

  .subtitle {
    font-size: 14.5px;
  }

  .faq-item {
    padding: 20px 16px;
    border-radius: 14px;
  }

  .faq-header h3 {
    font-size: 16px;
  }

  .faq-body {
    font-size: 14px;
  }
}
</style>
