<template>
  <div class="testimonials-wrapper">
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
</div>
</template>

<style scoped>
.testimonials-wrapper {
  width: 100%;
  background: #FFFFFF;
}

.testimonials-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 90px 24px;
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
  background: #FAF8F5;
  border: 1px solid rgba(124, 92, 252, 0.08);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.02);
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

/* Mobile Responsive */
@media (max-width: 960px) {
  .testimonials-section {
    padding: 60px 24px;
    gap: 40px;
  }

  .title {
    font-size: 32px;
  }
}

@media (max-width: 768px) {
  .testimonials-section {
    padding: 40px 16px;
    gap: 28px;
    align-items: stretch;
  }

  .title {
    font-size: 26px;
  }

  .subtitle {
    font-size: 14.5px;
  }

  .testimonials-grid {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-padding: 0 16px;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding: 8px 4px 20px 4px;
    gap: 16px;
    -webkit-overflow-scrolling: touch;
  }

  .testimonials-grid::-webkit-scrollbar {
    display: none;
  }

  .testimonials-grid::after {
    content: '';
    flex: 0 0 4px;
  }

  .testimonial-card {
    flex: 0 0 85%;
    width: 85%;
    scroll-snap-align: center;
    padding: 24px 20px;
    border-radius: 24px;
  }

  .quote {
    font-size: 14.5px;
  }
}
</style>
