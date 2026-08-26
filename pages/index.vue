<template>
  <div>
    <TheHeader />
    <main>
      <HeroSection />
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
import CompareSection from '~/components/CompareSection.vue'
import ProductSliderSection from '~/components/ProductSliderSection.vue'
import HowItWorks from '~/components/HowItWorks.vue'
import BenefitsSection from '~/components/BenefitsSection.vue'
import PricingSection from '~/components/PricingSection.vue'
import TestimonialsSection from '~/components/TestimonialsSection.vue'
import FaqSection from '~/components/FaqSection.vue'
import TheFooter from '~/components/TheFooter.vue'
</script>
