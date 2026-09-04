<template>
  <div class="partners-page">
    <TheHeader />

    <main class="container page-content">
      <section class="partners-hero">
        <span class="partners-badge">ПАРТНЁРЫ ALPHA</span>
        <h1 class="partners-title">Вместе создаём лучший опыт для семей</h1>
        <p class="partners-subtitle">
          Мы сотрудничаем с производителями эко-игрушек, логистическими компаниями и образовательными проектами по всему Казахстану.
        </p>
      </section>

      <div v-if="isLoading" class="loading-box">Загружаем партнёров...</div>

      <div v-else-if="partners.length === 0" class="empty-box">
        <AppIcon name="handshake" :size="40" class="empty-icon" />
        <h3>Список партнёров скоро появится</h3>
        <p>Если вы заинтересованы в сотрудничестве — напишите нам на <a href="mailto:partner@alpha-toys.kz">partner@alpha-toys.kz</a></p>
      </div>

      <section v-else class="partners-grid">
        <article v-for="partner in partners" :key="partner.id" class="partner-card">
          <div class="partner-logo-wrap">
            <img
              v-if="partner.logo_url"
              :src="partner.logo_url"
              :alt="partner.name"
              class="partner-logo"
            />
            <span v-else class="partner-logo-fallback">{{ partner.name.charAt(0) }}</span>
          </div>
          <h3 class="partner-name">{{ partner.name }}</h3>
          <p v-if="partner.description" class="partner-desc">{{ partner.description }}</p>
          <a
            v-if="partner.website_url"
            :href="partner.website_url"
            target="_blank"
            rel="noopener noreferrer"
            class="partner-link"
          >
            Перейти на сайт →
          </a>
        </article>
      </section>

      <section class="partners-cta">
        <h2>Хотите стать партнёром?</h2>
        <p>Поставщики игрушек, бренды и образовательные проекты — мы открыты к диалогу.</p>
        <a href="mailto:partner@alpha-toys.kz" class="cta-btn">Написать на partner@alpha-toys.kz</a>
      </section>
    </main>

    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import type { Partner } from '~/composables/usePartners'

useHead({ title: 'Партнёры — Alpha Play' })

const { fetchPartners } = usePartners()
const partners = ref<Partner[]>([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    partners.value = await fetchPartners()
  } catch {
    partners.value = []
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.partners-page {
  min-height: 100vh;
  background: #FAF8F4;
  font-family: 'Manrope', sans-serif;
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

.partners-hero {
  text-align: center;
  max-width: 720px;
  margin: 0 auto 40px;
}

.partners-badge {
  display: inline-block;
  background: #D9E0D5;
  color: #3F6757;
  font-weight: 800;
  font-size: 12px;
  letter-spacing: 1px;
  padding: 6px 16px;
  border-radius: 20px;
  margin-bottom: 16px;
}

.partners-title {
  font-family: 'Manrope', sans-serif;
  font-size: 38px;
  font-weight: 800;
  margin-bottom: 12px;
}

.partners-subtitle {
  font-size: 16px;
  color: #6F746F;
  line-height: 1.6;
}

.loading-box,
.empty-box {
  text-align: center;
  padding: 48px 24px;
  background: #fff;
  border-radius: 24px;
  margin-bottom: 32px;
}

.empty-icon {
  display: block;
  margin: 0 auto 12px;
  color: #3F6757;
}

.empty-box a {
  color: #3F6757;
  font-weight: 700;
}

.partners-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.partner-card {
  background: #fff;
  border-radius: 22px;
  padding: 28px 24px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.partner-logo-wrap {
  width: 80px;
  height: 80px;
  border-radius: 18px;
  background: #FAF8F4;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  overflow: hidden;
}

.partner-logo {
  max-width: 70%;
  max-height: 70%;
  object-fit: contain;
}

.partner-logo-fallback {
  font-family: 'Manrope', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: #3F6757;
}

.partner-name {
  font-family: 'Manrope', sans-serif;
  font-size: 17px;
  font-weight: 800;
  margin-bottom: 6px;
}

.partner-desc {
  font-size: 13.5px;
  color: #6F746F;
  line-height: 1.45;
  margin-bottom: 12px;
  flex: 1;
}

.partner-link {
  font-size: 13px;
  font-weight: 700;
  color: #3F6757;
  text-decoration: none;
}

.partners-cta {
  text-align: center;
  background: #fff;
  border-radius: 28px;
  padding: 36px 28px;
}

.partners-cta h2 {
  font-family: 'Manrope', sans-serif;
  font-size: 24px;
  margin-bottom: 8px;
}

.partners-cta p {
  color: #6F746F;
  margin-bottom: 16px;
}

.cta-btn {
  display: inline-block;
  background: #3F6757;
  color: #fff;
  padding: 12px 24px;
  border-radius: 14px;
  font-weight: 700;
  text-decoration: none;
}

@media (max-width: 900px) {
  .partners-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .partners-title { font-size: 28px; }
  .partners-grid { grid-template-columns: 1fr; }
}
</style>
