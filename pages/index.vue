<template>
  <div class="home-page">
    <TheHeader />
    <main>
      <HeroSection />
      <BrandMarquee />
      <ScrollPhotoStack />
      <HowItWorks />
      <PlayComparison />
      <HygieneSection />
      <NewArrivalsCarousel />
      <ImpactSection />
      <FaqSection />

      <!-- Bottom SEO Article (from Admin) -->
      <section v-if="seoText" class="container py-4 seo-text-section">
        <div class="card border-0 bg-light p-4 rounded-3 shadow-none">
          <div class="seo-article-content text-muted small" v-html="seoText"></div>
        </div>
      </section>
    </main>
    <TheFooter />
  </div>
</template>

<script setup>
import TheHeader from '~/components/TheHeader.vue'
import HeroSection from '~/components/HeroSection.vue'
import BrandMarquee from '~/components/BrandMarquee.vue'
import ScrollPhotoStack from '~/components/ScrollPhotoStack.vue'
import HowItWorks from '~/components/HowItWorks.vue'
import PlayComparison from '~/components/PlayComparison.vue'
import HygieneSection from '~/components/HygieneSection.vue'
import NewArrivalsCarousel from '~/components/NewArrivalsCarousel.vue'
import ImpactSection from '~/components/ImpactSection.vue'
import FaqSection from '~/components/FaqSection.vue'
import TheFooter from '~/components/TheFooter.vue'

const { seoText } = usePageSeo('/')
</script>

<style>
.home-page main > *:not(.hero) {
  scroll-margin-top: 92px;
}

.home-page .section-heading .badge,
.home-page .header-info .badge {
  padding: 0 !important;
  color: var(--alpha-green) !important;
  background: transparent !important;
  border-radius: 0 !important;
  font-size: 11px !important;
  font-weight: 800 !important;
  letter-spacing: 0.14em !important;
}

.home-page .section-heading .title,
.home-page .header-info .title {
  max-width: 780px;
  font-size: clamp(42px, 4.6vw, 64px) !important;
  font-weight: 600 !important;
}

.home-page .section-heading .subtitle,
.home-page .header-info .subtitle {
  max-width: 700px;
  font-size: 16px !important;
  line-height: 1.7 !important;
}

.home-page .how-it-works,
.home-page .faq-section {
  padding-top: 88px !important;
  padding-bottom: 88px !important;
}

.home-page .how-it-works-wrapper,
.home-page .faq-wrapper {
  background: var(--soft-white) !important;
}

.home-page .faq-item {
  border-color: var(--warm-sand) !important;
  border-radius: var(--radius-md) !important;
  box-shadow: var(--shadow-sm) !important;
}

@media (max-width: 768px) {
  .home-page .how-it-works,
  .home-page .faq-section {
    padding-top: 56px !important;
    padding-bottom: 56px !important;
  }

  .home-page .section-heading .title,
  .home-page .header-info .title {
    font-size: clamp(38px, 12vw, 50px) !important;
  }
}
</style>
