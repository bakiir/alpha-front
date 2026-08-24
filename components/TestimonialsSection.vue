<template>
  <section class="testimonials-section container">
    <div class="section-heading">
      <div class="badge">отзывы родителей</div>
      <h2 class="title">Слово нашему комьюнити</h2>
      <p class="subtitle">Как подписка Alpha изменила будни семей по всему Казахстану.</p>
    </div>

    <div class="testimonials-grid">
      <div class="testimonial-card">
        <p class="quote">"Alpha — это спасение для нашей квартиры! Больше нет этой горы пластикового шума. Ребёнок (1.5 года) в восторге от деревянных сортеров, а я — от чистоты в гостиной."</p>
        <div class="author">
          <div class="author-avatar bg-1"></div>
          <span class="author-name">Алия, мама Сажана (1.8 года)</span>
        </div>
      </div>

      <div class="testimonial-card">
        <p class="quote">"Качество игрушек на высоте, идеальная обработка дерева. Самим покупать такие наборы вышло бы раза в три дороже. Сервис обмена работает как часы."</p>
        <div class="author">
          <div class="author-avatar bg-2"></div>
          <span class="author-name">Дмитрий, папа Миши (3 года)</span>
        </div>
      </div>

      <div class="testimonial-card">
        <p class="quote">"Методички для родителей — это отдельная любовь. Теперь я точно знаю, как правильно вовлекать ребёнка в игру, чтобы развивать мелкую моторику."</p>
        <div class="author">
          <div class="author-avatar bg-3"></div>
          <span class="author-name">Камила, мама Амины (10 месяцев)</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.testimonials-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px;
  gap: 56px;
  background: var(--bg-secondary);
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
  background: #EDE9FF;
  border-radius: 20px;
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

.testimonials-grid {
  display: flex;
  gap: 24px;
  width: 100%;
}

.testimonial-card {
  display: flex;
  flex-direction: column;
  padding: 32px;
  gap: 24px;
  background: var(--text-white);
  border-radius: 28px;
  flex: 1;
}

.quote {
  font-size: 16px;
  line-height: 1.6;
  font-style: italic;
  color: var(--text-muted);
  flex-grow: 1;
}

.author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-size: cover;
  background-position: center;
  background-color: var(--color-primary);
}

.bg-1 { background-image: url('https://images.unsplash.com/photo-1544928147-79a2dbc1f389?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'); }
.bg-2 { background-image: url('https://images.unsplash.com/photo-1536640712-4d4c36ef0e2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'); }
.bg-3 { background-image: url('https://images.unsplash.com/photo-1554151228-14d9def656e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'); }

.author-name {
  font-weight: 700;
  font-size: 14px;
  color: var(--text-dark);
}
</style>
