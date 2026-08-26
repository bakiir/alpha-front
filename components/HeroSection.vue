<template>
  <div class="hero-wrapper">
    <!-- Decorative Ambient Blobs for subtle depth (< 15% opacity) -->
    <div class="hero-bg-blobs" aria-hidden="true">
      <div class="blob blob-purple"></div>
      <div class="blob blob-mint"></div>
    </div>

    <section class="hero container">
      <!-- Left Column: Content -->
      <div class="hero-content">
        <div class="badge">
          <span>🧸 ПОДПИСКА НА УМНЫЕ ИГРУШКИ ДЛЯ ДЕТЕЙ 0–6 ЛЕТ</span>
        </div>

        <h1 class="hero-title">
          Новые игрушки для развития ребёнка — без горы игрушек дома
        </h1>

        <p class="hero-subtitle">
          Получайте персональный набор развивающих эко-игрушек Монтессори каждые 2 месяца. Играйте, развивайтесь и меняйте на новые, когда ребёнок вырастет.
        </p>
        
        <!-- CTA Action Buttons -->
        <div class="hero-actions">
          <button class="btn-primary btn-large" @click="openQuiz()">Получить по подписке</button>
          <a href="#how-it-works" class="btn-outline btn-large">Как это устроено</a>
        </div>

        <!-- Trust Bar with Icons -->
        <div class="hero-trust-bar">
          <div class="trust-item">
            <span class="trust-icon">🛡️</span>
            <span>Сертифицировано ГОСТ</span>
          </div>
          <span class="trust-sep">•</span>
          <div class="trust-item">
            <span class="trust-icon">🧼</span>
            <span>4 этапа эко-дезинфекции</span>
          </div>
          <span class="trust-sep">•</span>
          <div class="trust-item">
            <span class="trust-icon">🚚</span>
            <span>Бесплатная доставка до двери</span>
          </div>
          <span class="trust-sep">•</span>
          <div class="trust-item">
            <span class="trust-icon">🔄</span>
            <span>Без штрафов за царапины</span>
          </div>
        </div>

        <!-- Modern Social Proof Card -->
        <div class="social-proof-card">
          <div class="avatars-cluster">
            <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80" alt="Айгерим" class="avatar-img" />
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80" alt="Алихан" class="avatar-img" />
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80" alt="Динара" class="avatar-img" />
            <div class="avatar-plus">+1k</div>
          </div>
          
          <div class="proof-details">
            <div class="stars-row">
              <span class="stars-gold">★★★★★</span>
              <strong class="rating-num">4.9 / 5.0</strong>
            </div>
            <span class="proof-desc">1 200+ родителей уже доверяют развитию детей с Alpha</span>
          </div>
        </div>
      </div>
      
      <!-- Right Column: Visual Composition on #EDE9FF with 2 Floating Cards -->
      <div class="hero-visual-wrapper">
        <div class="hero-visual-card">
          <img 
            src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=900&q=80" 
            alt="Набор развивающих эко-игрушек Монтессори" 
            class="hero-visual-img"
          />
        </div>

        <!-- Floating Badge 1 (Top Left) -->
        <div class="floating-badge badge-top">
          <div class="badge-icon-box eco">🌿</div>
          <div class="badge-text-box">
            <strong>100% Эко-материалы</strong>
            <span>Массив бука, ясень и хлопок</span>
          </div>
        </div>

        <!-- Floating Badge 2 (Bottom Right) -->
        <div class="floating-badge badge-bottom">
          <div class="badge-icon-box rotate">🔄</div>
          <div class="badge-text-box">
            <strong>Новый набор каждые 2 мес.</strong>
            <span>Бесплатный курьерский обмен</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { openQuiz } = useQuiz()
</script>

<style scoped>
.hero-wrapper {
  position: relative;
  overflow: hidden;
  background-color: #FFF8F0;
  width: 100%;
}

/* 2. Decorative Ambient Blobs (< 15% opacity) */
.hero-bg-blobs {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.blob {
  position: absolute;
  border-radius: 50%;
  opacity: 0.12;
}

.blob-purple {
  width: 500px;
  height: 500px;
  background: #7C5CFC;
  filter: blur(95px);
  top: -80px;
  right: 8%;
}

.blob-mint {
  width: 440px;
  height: 440px;
  background: #06D6A0;
  filter: blur(100px);
  bottom: -60px;
  left: 6%;
}

/* Hero Container */
.hero {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40px 36px 70px;
  gap: 48px;
  min-height: 640px;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1.15;
  max-width: 680px;
}

.badge {
  display: inline-flex;
  padding: 8px 18px;
  background: #EDE9FF;
  border-radius: 50px;
  align-self: flex-start;
}

.badge span {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 12px;
  color: #7C5CFC;
  letter-spacing: 0.5px;
}

.hero-title {
  font-weight: 800;
  font-size: 50px;
  line-height: 1.14;
  color: #1A1A2E;
  letter-spacing: -0.5px;
}

.hero-subtitle {
  font-size: 17px;
  line-height: 1.55;
  color: #4A4A68;
}

.hero-actions {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-top: 4px;
}

.btn-large {
  padding: 14px 28px;
  font-size: 15.5px;
  border-radius: 50px;
  font-weight: 700;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #624CE0;
  color: #FFFFFF;
  box-shadow: 0 6px 20px rgba(98, 76, 224, 0.28);
}

.btn-primary:hover {
  background: #513bc7;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(98, 76, 224, 0.35);
}

.btn-outline {
  background: #FFFFFF;
  color: #1A1A2E;
  border: 1.5px solid #E2E2EC;
}

.btn-outline:hover {
  border-color: #624CE0;
  color: #624CE0;
  background: #FAF8FF;
}

/* 5. Trust Bar */
.hero-trust-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding-top: 4px;
}

.trust-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #4A4A68;
}

.trust-icon {
  font-size: 14px;
}

.trust-sep {
  color: #D4D4E2;
  font-size: 12px;
}

/* 3. Modern Social Proof Card */
.social-proof-card {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  background: #FFFFFF;
  padding: 10px 20px;
  border-radius: 50px;
  border: 1px solid rgba(124, 92, 252, 0.12);
  box-shadow: 0 8px 24px rgba(98, 76, 224, 0.12);
  align-self: flex-start;
  margin-top: 4px;
}

.avatars-cluster {
  display: flex;
  align-items: center;
}

.avatar-img,
.avatar-plus {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2.5px solid #FFFFFF;
  margin-left: -10px;
  object-fit: cover;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.avatar-img:first-child {
  margin-left: 0;
}

.avatar-plus {
  background: #7C5CFC;
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.proof-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stars-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stars-gold {
  color: #FFD166;
  font-size: 14px;
  letter-spacing: 1px;
}

.rating-num {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 13px;
  color: #1A1A2E;
}

.proof-desc {
  font-size: 12px;
  font-weight: 600;
  color: #7B7B93;
}

/* 1. Right Visual Composition on #EDE9FF with 2 Floating Cards */
.hero-visual-wrapper {
  position: relative;
  flex: 1;
  max-width: 520px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-visual-card {
  width: 100%;
  height: 470px;
  background: #EDE9FF;
  border-radius: 36px;
  overflow: hidden;
  position: relative;
  border: 5px solid #FFFFFF;
  box-shadow: 0 20px 48px rgba(98, 76, 224, 0.15);
}

.hero-visual-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}

.hero-visual-card:hover .hero-visual-img {
  transform: scale(1.03);
}

/* Floating Badges */
.floating-badge {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #FFFFFF;
  padding: 12px 18px;
  border-radius: 20px;
  border: 1px solid rgba(124, 92, 252, 0.1);
  box-shadow: 0 10px 24px rgba(98, 76, 224, 0.15);
  z-index: 2;
  transition: all 0.25s ease;
}

.floating-badge:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 28px rgba(98, 76, 224, 0.2);
}

.badge-top {
  top: 24px;
  left: -28px;
}

.badge-bottom {
  bottom: 28px;
  right: -24px;
}

.badge-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  background: #F3EFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.badge-icon-box.eco {
  background: #E8FAF4;
}

.badge-text-box {
  display: flex;
  flex-direction: column;
}

.badge-text-box strong {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 13px;
  color: #1A1A2E;
}

.badge-text-box span {
  font-size: 11px;
  color: #7B7B93;
}

/* Responsive Media Queries */
@media (max-width: 1080px) {
  .hero-title {
    font-size: 42px;
  }

  .hero-visual-card {
    height: 420px;
  }

  .badge-top {
    left: -10px;
  }

  .badge-bottom {
    right: -10px;
  }
}

@media (max-width: 960px) {
  .hero {
    flex-direction: column;
    padding: 32px 20px 48px;
    gap: 40px;
    min-height: auto;
  }

  .hero-content {
    max-width: 100%;
  }

  .hero-title {
    font-size: 34px;
  }

  .hero-subtitle {
    font-size: 15px;
  }

  .hero-visual-wrapper {
    width: 100%;
    max-width: 480px;
    margin-top: 10px;
  }

  .hero-visual-card {
    height: 360px;
  }

  .badge-top {
    left: 8px;
    top: -16px;
  }

  .badge-bottom {
    right: 8px;
    bottom: -16px;
  }
}

@media (max-width: 640px) {
  .hero {
    padding: 20px 16px 36px;
    gap: 28px;
  }

  .hero-title {
    font-size: 27px;
  }

  .hero-actions {
    flex-direction: column;
    width: 100%;
  }

  .hero-actions .btn-large {
    width: 100%;
    text-align: center;
    justify-content: center;
  }

  .hero-trust-bar {
    gap: 8px;
    font-size: 12px;
  }

  .trust-item {
    font-size: 12px;
  }

  .social-proof-card {
    width: 100%;
    border-radius: 20px;
  }

  .hero-visual-card {
    height: 280px;
    border-radius: 24px;
  }

  .floating-badge {
    padding: 8px 12px;
    gap: 8px;
  }

  .badge-icon-box {
    width: 32px;
    height: 32px;
    font-size: 15px;
    border-radius: 10px;
  }

  .badge-text-box strong {
    font-size: 12px;
  }

  .badge-text-box span {
    font-size: 10px;
  }
}
</style>
