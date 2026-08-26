<template>
  <section class="hero container">
    <div class="hero-content">
      <div class="badge">
        <span>🧸 ПОДПИСКА НА УМНЫЕ ИГРУШКИ ДЛЯ ДЕТЕЙ 0–6 ЛЕТ</span>
      </div>
      <h1 class="hero-title">
        Новые игрушки для развития ребёнка — без горы игрушек дома
      </h1>
      <p class="hero-subtitle">
        Получайте персональный набор развивающих игрушек по возрасту каждые 2 месяца. Играйте, развивайтесь и меняйте на новые, когда ребёнок вырастет.
      </p>
      
      <div class="hero-actions">
        <button class="btn-primary btn-large" @click="openQuiz()">Получить по подписке</button>
        <a href="#how-it-works" class="btn-outline btn-large">Как это устроено</a>
      </div>

      <div class="social-proof">
        <div class="avatars">
          <div class="avatar avatar-1"></div>
          <div class="avatar avatar-2"></div>
          <div class="avatar avatar-3"></div>
        </div>
        <span class="proof-text">1 200+ родителей уже доверяют развитию детей с Alpha</span>
      </div>
    </div>
    
    <div class="hero-image">
    </div>
  </section>
</template>

<script setup lang="ts">
const { openQuiz } = useQuiz()
</script>

<style scoped>
.hero {
  display: flex;
  align-items: center;
  padding: 40px 80px 80px;
  gap: 40px;
  min-height: 675px;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
  flex: 1;
}

.badge {
  display: inline-flex;
  padding: 8px 16px;
  background: #FFF9E6;
  border-radius: 20px;
  align-self: flex-start;
}

.badge span {
  font-weight: 700;
  font-size: 13px;
  color: var(--text-dark);
  text-transform: uppercase;
}

.hero-title {
  font-weight: 800;
  font-size: 54px;
  line-height: 1.15;
  color: var(--text-dark);
}

.hero-subtitle {
  font-weight: 400;
  font-size: 18px;
  line-height: 1.5;
  color: var(--text-muted);
  max-width: 660px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.social-proof {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-top: 8px;
}

.avatars {
  display: flex;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--text-white);
  margin-left: -12px;
}
.avatar:first-child {
  margin-left: 0;
}

.avatar-1 { background: var(--color-primary); z-index: 3; }
.avatar-2 { background: var(--color-secondary); z-index: 2; }
.avatar-3 { background: var(--color-tertiary); z-index: 1; }

.proof-text {
  font-size: 14px;
  color: var(--text-dark);
}

.hero-image {
  flex: 1;
  max-width: 580px;
  height: 520px;
  background: url('https://images.unsplash.com/photo-1595960965022-f94df297fb95?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80') center/cover;
  border-radius: 40px;
}

@media (max-width: 960px) {
  .hero {
    flex-direction: column;
    padding: 32px 24px 48px;
    min-height: auto;
  }

  .hero-title {
    font-size: 38px;
  }

  .hero-image {
    width: 100%;
    max-width: 100%;
    height: 340px;
    border-radius: 28px;
  }
}

@media (max-width: 640px) {
  .hero {
    padding: 20px 16px 40px;
    gap: 28px;
  }

  .hero-content {
    gap: 20px;
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

  .hero-actions .btn-large {
    width: 100%;
    text-align: center;
    justify-content: center;
  }

  .hero-image {
    height: 240px;
    border-radius: 20px;
  }

  .social-proof {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
