<template>
  <section class="hero container">
    <div class="hero-content">
      <!-- Top Badge -->
      <div class="hero-badge">
        <span class="badge-icon">🧸</span>
        <span>ПОДПИСКА НА УМНЫЕ ИГРУШКИ ДЛЯ ДЕТЕЙ 0–5 ЛЕТ</span>
      </div>

      <!-- Main Heading -->
      <h1 class="hero-title">
        Развивающие игрушки по возрасту — с обменом каждые 2 месяца
      </h1>

      <!-- Subtitle -->
      <p class="hero-subtitle">
        Избавьтесь от гор пластика и экономьте до 70% семейного бюджета. Получайте персональный бокс сертифицированных эко-игрушек из бука и ясеня с бесплатной доставкой до вашей двери.
      </p>

      <!-- Hero Actions -->
      <div class="hero-actions">
        <button class="btn-primary btn-large hero-main-btn" @click="handleCtaClick">
          <span>Подобрать набор под возраст</span>
          <span class="btn-arrow">→</span>
        </button>
        <a href="#how-it-works" class="btn-outline btn-large">
          Как это устроено
        </a>
      </div>

      <!-- Social Proof -->
      <div class="social-proof">
        <div class="stars-rating">
          <span class="stars">★★★★★</span>
          <strong class="rating-val">4.9 / 5</strong>
        </div>
        <div class="divider-dot"></div>
        <span class="proof-text">1 200+ родителей уже доверяют Alpha в Казахстане</span>
      </div>
    </div>
    
    <!-- Hero Image Area with Floating Badges -->
    <div class="hero-visual">
      <div class="hero-image-wrap">
        <img 
          src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=900&q=80" 
          alt="Монтессори деревянные развивающие игрушки Alpha" 
          class="hero-main-img" 
        />
        
        <!-- Floating Trust Badge 1 -->
        <div class="float-badge top-badge">
          <span class="float-icon">🌿</span>
          <div>
            <strong>100% Эко-дерево</strong>
            <small>Бук, ясень, пищевой воск</small>
          </div>
        </div>

        <!-- Floating Trust Badge 2 -->
        <div class="float-badge bottom-badge">
          <span class="float-icon">🧼</span>
          <div>
            <strong>Медицинская дезинфекция</strong>
            <small>Озонирование перед отправкой</small>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { openQuiz } = useQuiz()

const handleCtaClick = () => {
  openQuiz()
}
</script>

<style scoped>
.hero {
  display: flex;
  align-items: center;
  padding: 48px 0 72px;
  gap: 56px;
  min-height: 600px;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1.1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: var(--bg-secondary);
  border-radius: 50px;
  align-self: flex-start;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.5px;
  color: var(--color-primary);
  border: 1px solid rgba(124, 92, 252, 0.15);
}

.hero-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 46px;
  line-height: 1.15;
  color: var(--text-dark);
  letter-spacing: -0.5px;
}

.hero-subtitle {
  font-size: 17px;
  line-height: 1.6;
  color: var(--text-muted);
  max-width: 620px;
}

/* Actions */
.hero-actions {
  display: flex;
  gap: 14px;
  align-items: center;
  flex-wrap: wrap;
}

.hero-main-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 8px 24px rgba(124, 92, 252, 0.35);
  transition: all 0.25s ease;
  border: none;
  cursor: pointer;
}

.hero-main-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(124, 92, 252, 0.45);
}

.btn-arrow {
  font-size: 16px;
  transition: transform 0.2s ease;
}

.hero-main-btn:hover .btn-arrow {
  transform: translateX(3px);
}

/* Social Proof */
.social-proof {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 13.5px;
  color: var(--text-muted);
}

.stars-rating {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stars {
  color: #F59E0B;
  font-size: 15px;
}

.rating-val {
  color: var(--text-dark);
}

.divider-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #CBD5E1;
}

/* Visual Area */
.hero-visual {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-image-wrap {
  position: relative;
  width: 100%;
  max-width: 520px;
  border-radius: 36px;
  overflow: visible;
}

.hero-main-img {
  width: 100%;
  height: 480px;
  object-fit: cover;
  border-radius: 36px;
  box-shadow: 0 20px 48px rgba(26, 26, 46, 0.1);
  display: block;
}

/* Floating Badges */
.float-badge {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 12px 18px;
  border-radius: 20px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.8);
  animation: float 4s ease-in-out infinite alternate;
}

.float-badge.top-badge {
  top: 24px;
  left: -28px;
}

.float-badge.bottom-badge {
  bottom: 24px;
  right: -24px;
  animation-delay: 2s;
}

.float-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.float-badge strong {
  display: block;
  font-size: 13px;
  color: var(--text-dark);
}

.float-badge small {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
}

@keyframes float {
  0% { transform: translateY(0px); }
  100% { transform: translateY(-6px); }
}

/* Responsive */
@media (max-width: 1080px) {
  .hero {
    flex-direction: column;
    padding: 32px 0 56px;
    gap: 40px;
  }

  .hero-title {
    font-size: 38px;
  }

  .hero-image-wrap {
    max-width: 480px;
  }

  .hero-main-img {
    height: 380px;
  }

  .float-badge.top-badge {
    left: 8px;
  }

  .float-badge.bottom-badge {
    right: 8px;
  }
}

@media (max-width: 640px) {
  .hero {
    padding: 20px 0 40px;
    gap: 28px;
  }

  .hero-title {
    font-size: 28px;
  }

  .hero-subtitle {
    font-size: 14.5px;
  }

  .hero-actions {
    flex-direction: column;
    width: 100%;
  }

  .hero-actions a,
  .hero-actions button {
    width: 100%;
    text-align: center;
    justify-content: center;
  }

  .hero-main-img {
    height: 280px;
    border-radius: 24px;
  }

  .float-badge {
    padding: 8px 12px;
    border-radius: 14px;
  }

  .float-badge strong {
    font-size: 11.5px;
  }

  .float-badge small {
    font-size: 10px;
  }

  .social-proof {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .divider-dot {
    display: none;
  }
}
</style>
