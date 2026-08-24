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
        <button class="btn-primary btn-large">Получить по подписке</button>
        <button class="btn-outline btn-large">Купить в магазине</button>
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
</style>
