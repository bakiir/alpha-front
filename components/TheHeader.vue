<template>
  <header class="header">
    <div class="logo">
      <div class="logo-icon"></div>
      <span class="logo-text">Alpha</span>
    </div>
    
    <nav class="nav">
      <NuxtLink to="/subscription" class="nav-link active">Подписка</NuxtLink>
      <NuxtLink to="/shop" class="nav-link">Магазин</NuxtLink>
      <NuxtLink to="/how-it-works" class="nav-link">Как это работает</NuxtLink>
      <NuxtLink to="/pricing" class="nav-link">Цены</NuxtLink>
    </nav>
    
    <button class="btn-primary">Начать</button>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 80px;
  width: 100%;
  height: 90px;
  background: var(--bg-primary);
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: var(--color-primary);
  border-radius: 12px;
}

.logo-text {
  font-family: 'Outfit';
  font-weight: 800;
  font-size: 24px;
  color: var(--text-dark);
}

.nav {
  display: flex;
  gap: 32px;
  align-items: center;
}

.nav-link {
  font-weight: 600;
  font-size: 15px;
  color: var(--text-muted);
  transition: color 0.3s;
}

.nav-link:hover, .nav-link.active {
  color: var(--text-dark);
}
</style>
