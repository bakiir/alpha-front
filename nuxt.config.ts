// https://nuxt.com/docs/api/configuration/nuxt-config
const isProd = process.env.NODE_ENV === 'production'

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "img-src 'self' data: https: blob:",
  "font-src 'self' data: https:",
  "style-src 'self' 'unsafe-inline' https:",
  // Inline analytics snippets from CMS + known third parties. Blocks unknown remote script hosts.
  "script-src 'self' 'unsafe-inline' https://mc.yandex.ru https://www.googletagmanager.com https://www.google-analytics.com https://yastatic.net",
  "connect-src 'self' https: wss: http://127.0.0.1:8000 http://localhost:8000",
  "media-src 'self' https: blob:",
].join('; ')

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  app: {
    head: {
      link: [
        { rel: 'icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
      meta: [
        { 'http-equiv': 'X-Content-Type-Options', content: 'nosniff' },
      ],
    },
  },
  css: [
    '~/assets/css/main.css'
  ],
  runtimeConfig: {
    public: {
      // Local default `/api` goes through nitro devProxy so HttpOnly cookies are first-party.
      // Production / staging: set NUXT_PUBLIC_API_BASE to the API origin (credentials + CORS).
      apiBase: process.env.NUXT_PUBLIC_API_BASE
        || (isProd
          ? 'https://back-alpha.test-nomad.kz/api'
          : '/api'),
      // Local hardcoded tariffs only when explicitly enabled (demo / maintenance).
      // Do not enable in production — masks API outages and disabled plans.
      demoSubscriptionPlans: process.env.NUXT_PUBLIC_DEMO_SUBSCRIPTION_PLANS === 'true',
    }
  },
  nitro: {
    routeRules: {
      '/**': {
        headers: {
          'Content-Security-Policy': csp,
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'X-Frame-Options': 'SAMEORIGIN',
          'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        },
      },
    },
    devProxy: {
      '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/storage': { target: 'http://127.0.0.1:8000', changeOrigin: true },
    },
  },
})
