<template>
  <div class="home-page">
    <TheHeader />
    <main>
      <HeroSection />
      <ScrollPhotoStack />
      <CompareSection />
      <ProductSliderSection />
      <HowItWorks />
      <BenefitsSection />
      <PricingSection />
      <TestimonialsSection />
      <FaqSection />
    </main>
    <TheFooter />
  </div>
</template>

<script setup>
import TheHeader from '~/components/TheHeader.vue'
import HeroSection from '~/components/HeroSection.vue'
import ScrollPhotoStack from '~/components/ScrollPhotoStack.vue'
import CompareSection from '~/components/CompareSection.vue'
import ProductSliderSection from '~/components/ProductSliderSection.vue'
import HowItWorks from '~/components/HowItWorks.vue'
import BenefitsSection from '~/components/BenefitsSection.vue'
import PricingSection from '~/components/PricingSection.vue'
import TestimonialsSection from '~/components/TestimonialsSection.vue'
import FaqSection from '~/components/FaqSection.vue'
import TheFooter from '~/components/TheFooter.vue'
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

.home-page .compare-section,
.home-page .product-slider-section,
.home-page .how-it-works,
.home-page .benefits-section,
.home-page .pricing-section,
.home-page .testimonials-section,
.home-page .faq-section {
  padding-top: 88px !important;
  padding-bottom: 88px !important;
}

.home-page .compare-wrapper,
.home-page .testimonials-wrapper {
  background: var(--ivory) !important;
}

.home-page .product-slider-wrapper,
.home-page .pricing-wrapper {
  background: var(--ivory) !important;
}

.home-page .how-it-works-wrapper,
.home-page .faq-wrapper {
  background: var(--soft-white) !important;
}

.home-page .benefits-wrapper {
  background: var(--soft-sage-mist) !important;
}

.home-page .compare-card,
.home-page .toy-slider-card,
.home-page .plan-card,
.home-page .faq-item {
  border-color: var(--warm-sand) !important;
  border-radius: var(--radius-md) !important;
  box-shadow: var(--shadow-sm) !important;
}

.home-page .benefit-card,
.home-page .testimonial-card {
  border-top-color: rgba(63, 103, 87, 0.32) !important;
}

@media (max-width: 768px) {
  .home-page .compare-section,
  .home-page .product-slider-section,
  .home-page .how-it-works,
  .home-page .benefits-section,
  .home-page .pricing-section,
  .home-page .testimonials-section,
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
