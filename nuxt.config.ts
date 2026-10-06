// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  app: {
    head: {
      link: [
        { rel: 'icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    },
  },
  css: [
    '~/assets/css/main.css'
  ],
  runtimeConfig: {
    public: {
      // Never bake 127.0.0.1 into production builds — phones cannot reach the developer's PC.
      apiBase: process.env.NUXT_PUBLIC_API_BASE
        || (process.env.NODE_ENV === 'production'
          ? 'https://back-alpha.test-nomad.kz/api'
          : 'http://127.0.0.1:8000/api'),
      // Local hardcoded tariffs only when explicitly enabled (demo / maintenance).
      // Do not enable in production — masks API outages and disabled plans.
      demoSubscriptionPlans: process.env.NUXT_PUBLIC_DEMO_SUBSCRIPTION_PLANS === 'true',
    }
  }
})
