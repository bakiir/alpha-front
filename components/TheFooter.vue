<template>
  <footer ref="footerRoot" class="footer-wrapper">
    <div class="footer-card container">
      <!-- Floating Scroll to Top Button -->
      <button class="scroll-top-btn" @click="scrollToTop" :title="t('footer.scrollTop')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="19" x2="12" y2="5"></line>
          <polyline points="5 12 12 5 19 12"></polyline>
        </svg>
      </button>

      <!-- Main Columns Grid -->
      <div class="footer-main-grid">
        <!-- Col 1: ИНТЕРНЕТ-МАГАЗИН / СЕРВИС -->
        <details class="footer-col footer-accordion">
          <summary class="col-title">
            <span>{{ catalogMenu?.title || t('footer.catalogFallback') }}</span>
            <span class="accordion-icon" aria-hidden="true"></span>
          </summary>
          <ul class="col-links">
            <template v-if="catalogItems.length">
              <li v-for="item in catalogItems" :key="item.id">
                <NuxtLink v-if="isInternalCmsUrl(item.url)" :to="item.url" :target="item.target">{{ item.label }}</NuxtLink>
                <a v-else :href="item.url" :target="item.target" rel="noopener noreferrer">{{ item.label }}</a>
              </li>
            </template>
            <template v-else>
              <li v-if="isVisible('shop')"><NuxtLink :to="localePath('/shop')">{{ t('nav.footerLinks.catalogToys') }}</NuxtLink></li>
              <li v-if="isVisible('subscription')"><NuxtLink :to="localePath('/subscription')">{{ t('nav.footerLinks.subscriptionToys') }}</NuxtLink></li>
              <li v-if="isVisible('sell_to_us')"><NuxtLink :to="localePath('/sell')" class="highlight-link">{{ t('nav.footerLinks.tradeIn') }} <span class="hot-badge">New</span></NuxtLink></li>
              <li v-if="isVisible('gift_shop')"><NuxtLink :to="localePath('/gifts')">{{ t('nav.footerLinks.giftCertificates') }}</NuxtLink></li>
              <li v-if="isVisible('gift_boxes')"><NuxtLink :to="localePath('/gift-boxes')">{{ t('nav.footerLinks.giftBoxes') }}</NuxtLink></li>
              <li v-if="isVisible('short_rent')"><NuxtLink :to="localePath('/short-rent')">{{ t('nav.footerLinks.shortRent') }}</NuxtLink></li>
            </template>
          </ul>
        </details>

        <!-- Col 2: КОМПАНИЯ -->
        <details class="footer-col footer-accordion">
          <summary class="col-title">
            <span>{{ companyMenu?.title || t('footer.companyFallback') }}</span>
            <span class="accordion-icon" aria-hidden="true"></span>
          </summary>
          <ul class="col-links">
            <template v-if="companyItems.length">
              <li v-for="item in companyItems" :key="item.id">
                <NuxtLink v-if="isInternalCmsUrl(item.url)" :to="item.url" :target="item.target">{{ item.label }}</NuxtLink>
                <a v-else :href="item.url" :target="item.target" rel="noopener noreferrer">{{ item.label }}</a>
              </li>
            </template>
            <template v-else>
              <li><NuxtLink :to="localePath('/about')">{{ t('nav.footerLinks.about') }}</NuxtLink></li>
              <li><NuxtLink :to="localePath('/how-it-works')">{{ t('nav.footerLinks.howItWorks') }}</NuxtLink></li>
              <li v-if="isVisible('partners')"><NuxtLink :to="localePath('/partners')">{{ t('nav.footerLinks.partners') }}</NuxtLink></li>
            </template>
          </ul>
        </details>

        <!-- Col 3: ПОМОЩЬ ПОКУПАТЕЛЮ -->
        <details class="footer-col footer-accordion">
          <summary class="col-title">
            <span>{{ helpMenu?.title || t('footer.helpFallback') }}</span>
            <span class="accordion-icon" aria-hidden="true"></span>
          </summary>
          <ul class="col-links">
            <template v-if="helpItems.length">
              <li v-for="item in helpItems" :key="item.id">
                <NuxtLink v-if="isInternalCmsUrl(item.url)" :to="item.url" :target="item.target">{{ item.label }}</NuxtLink>
                <a v-else :href="item.url" :target="item.target" rel="noopener noreferrer">{{ item.label }}</a>
              </li>
            </template>
            <template v-else>
              <li><NuxtLink :to="localePath('/support')">{{ t('nav.footerLinks.contactUs') }}</NuxtLink></li>
              <li v-if="isVisible('faq')"><NuxtLink :to="localePath('/faq')">{{ t('nav.footerLinks.faqFull') }}</NuxtLink></li>
              <li><NuxtLink :to="localePath('/delivery')">{{ t('nav.footerLinks.courierDelivery') }}</NuxtLink></li>
              <li><NuxtLink :to="localePath('/contacts')">{{ t('nav.footerLinks.returnsWarranty') }}</NuxtLink></li>
            </template>
          </ul>
        </details>

        <!-- Col 4: БУДЬТЕ В КУРСЕ НОВОСТЕЙ -->
        <div class="footer-col subscribe-col">
          <h4 class="col-title subscribe-title">{{ t('footer.newsTitle') }}</h4>
          <div class="subscribe-buttons-group">
            <a :href="instagramUrl" target="_blank" rel="noopener noreferrer" class="social-subscribe-btn instagram">
              <span class="btn-text">Instagram</span>
              <span class="social-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </span>
            </a>
            <a :href="tiktokUrl" target="_blank" rel="noopener noreferrer" class="social-subscribe-btn">
              <span class="btn-text">TikTok</span>
              <span class="social-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 3v12a5 5 0 1 1-5-5v4a1 1 0 1 0 1 1V3h4c0 3 2 5 5 5v4a9 9 0 0 1-5-2" />
                </svg>
              </span>
            </a>
            <a :href="facebookUrl" target="_blank" rel="noopener noreferrer" class="social-subscribe-btn">
              <span class="btn-text">Facebook</span>
              <span class="social-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M15 21v-8h3l1-4h-4V7c0-1 .5-2 2-2h2V2h-3c-4 0-5 3-5 5v2H8v4h3v8" />
                </svg>
              </span>
            </a>
            <a :href="whatsappUrl" target="_blank" rel="noopener noreferrer" class="social-subscribe-btn whatsapp">
              <span class="btn-text">{{ t('footer.writeUs') }}</span>
              <span class="social-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.5-4.5A4 4 0 0 1 4 15V7a4 4 0 0 1 4-4h9a4 4 0 0 1 4 4z" />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </div>

      <!-- Divider Contacts Bar (Phone Pill, Email, Lang) -->
      <div class="footer-contacts-bar">
        <div class="contacts-left">
          <a :href="'tel:' + phoneRaw" class="phone-pill">
            <span class="phone-icon-circle" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </span>
            <strong>{{ phone }}</strong>
          </a>
          <a :href="'mailto:' + email" class="email-link">
            {{ email }}
          </a>
        </div>

        <div class="lang-switch-box">
          <template v-for="(code, index) in localeCodes" :key="code">
            <span v-if="index > 0" class="lang-divider">|</span>
            <NuxtLink
              class="lang-btn"
              :class="{ active: locale === code }"
              :to="switchLocalePath(code)"
            >{{ t(`lang.${code}`) }}</NuxtLink>
          </template>
        </div>
      </div>

      <!-- Legal Bottom -->
      <div class="footer-bottom-row">
        <div class="copyright-text">
          {{ t('footer.copyright') }}
        </div>

        <div class="legal-links-list">
          <NuxtLink :to="localePath('/legal/privacy')">{{ t('footer.privacy') }}</NuxtLink>
          <NuxtLink :to="localePath('/legal/terms')">{{ t('footer.terms') }}</NuxtLink>
          <NuxtLink :to="localePath('/legal/notice')">{{ t('footer.notice') }}</NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const localeCodes = ['ru', 'kk', 'en'] as const

const isInternalCmsUrl = (url: string) =>
  url.startsWith('/') && !url.startsWith('//')

const { fetchFeatures, isVisible, isPathVisible } = useFeatures()
const { phone, phoneRaw, email, whatsappUrl, instagramUrl, facebookUrl, tiktokUrl, fetchSettings } = useSiteSettings()
const { items: catalogMenuItems, menu: catalogMenu } = useCmsMenu('footer_catalog')
const { items: companyMenuItems, menu: companyMenu } = useCmsMenu('footer_company')
const { items: helpMenuItems, menu: helpMenu } = useCmsMenu('footer_help')

const catalogItems = computed(() => catalogMenuItems.value.filter(item => isPathVisible(item.url)))
const companyItems = computed(() => companyMenuItems.value.filter(item => isPathVisible(item.url)))
const helpItems = computed(() => helpMenuItems.value.filter(item => isPathVisible(item.url)))

const footerRoot = ref<HTMLElement | null>(null)
const MOBILE_FOOTER_MQ = '(max-width: 640px)'
let mobileMq: MediaQueryList | null = null

const syncAccordionOpenState = () => {
  if (typeof window === 'undefined' || !footerRoot.value) return
  const isMobile = window.matchMedia(MOBILE_FOOTER_MQ).matches
  footerRoot.value.querySelectorAll<HTMLDetailsElement>('.footer-accordion').forEach((el) => {
    el.open = !isMobile
  })
}

onMounted(() => {
  fetchFeatures()
  fetchSettings()

  if (typeof window === 'undefined') return
  mobileMq = window.matchMedia(MOBILE_FOOTER_MQ)
  syncAccordionOpenState()
  mobileMq.addEventListener('change', syncAccordionOpenState)
})

onBeforeUnmount(() => {
  mobileMq?.removeEventListener('change', syncAccordionOpenState)
})

const scrollToTop = () => {
  if (typeof window !== 'undefined') {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}
</script>

<style scoped>
.footer-wrapper {
  width: 100%;
  background: transparent;
  padding: 64px 0 0;
  margin-top: auto;
}

.footer-card {
  position: relative;
  width: 100%;
  max-width: 1380px;
  margin: 0 auto;
  background: #30483A;
  border-radius: 24px 24px 0 0;
  padding: 56px 48px calc(36px + env(safe-area-inset-bottom, 0px));
  color: var(--text-white);
  font-family: 'Manrope', sans-serif;
  box-shadow: 0 -8px 28px rgba(39, 49, 43, 0.08);
}

/* Floating Scroll to Top Button */
.scroll-top-btn {
  position: absolute;
  top: -24px;
  right: 48px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #EBA37E;
  color: #FAF8F4;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(99, 72, 51, 0.2);
  transition: all 0.2s ease;
  z-index: 10;
}

.scroll-top-btn:hover {
  background: #B4764C;
  transform: translateY(-3px) scale(1.05);
}

/* Main 4-Column Grid */
.footer-main-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1.15fr 1.1fr;
  gap: 40px;
  margin-bottom: 40px;
}

.footer-col {
  display: flex;
  flex-direction: column;
}

.footer-accordion {
  border: none;
  min-width: 0;
}

.footer-accordion > summary {
  list-style: none;
}

.footer-accordion > summary::-webkit-details-marker {
  display: none;
}

.accordion-icon {
  display: none;
}

.col-title {
  font-family: 'Manrope', sans-serif;
  font-size: 14px;
  font-weight: 800;
  color: #FAF8F4;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  margin-bottom: 20px;
}

.footer-accordion > .col-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.col-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.col-links a {
  color: rgba(255, 255, 255, 0.78);
  font-size: 13.5px;
  text-decoration: none;
  transition: color 0.15s ease, transform 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.col-links a:hover {
  color: var(--text-white);
  transform: translateX(3px);
}

.highlight-link {
  color: var(--color-secondary) !important;
  font-weight: 700;
}

.hot-badge {
  background: var(--color-secondary);
  color: var(--text-dark);
  font-size: 9.5px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}

/* Subscribe buttons — brand palette */
.subscribe-buttons-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.social-subscribe-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.16);
  color: var(--text-white);
  padding: 12px 20px;
  border-radius: 12px;
  text-decoration: none;
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 14px;
  transition: all 0.2s ease;
  border: 1.5px solid rgba(255, 255, 255, 0.22);
  box-shadow: none;
}

.social-subscribe-btn.instagram:hover {
  background: rgba(255, 255, 255, 0.24);
  border-color: rgba(255, 255, 255, 0.35);
}

.social-subscribe-btn.whatsapp {
  background: var(--color-tertiary);
  color: var(--text-white);
  border-color: transparent;
  box-shadow: none;
}

.social-subscribe-btn.whatsapp:hover {
  background: #527263;
  filter: none;
}

.social-subscribe-btn:hover {
  transform: translateY(-2px);
}

.social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Middle Contacts Bar */
.footer-contacts-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  margin-bottom: 24px;
}

.contacts-left {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.phone-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: var(--text-white);
  color: var(--text-dark);
  padding: 8px 18px;
  border-radius: 12px;
  text-decoration: none;
  font-family: 'Manrope', sans-serif;
  font-size: 14.5px;
  font-weight: 800;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: none;
}

.phone-pill:hover {
  transform: scale(1.03);
  box-shadow: 0 6px 16px rgba(26, 26, 46, 0.16);
}

.phone-icon-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #F4F1EA;
  color: var(--green-ink);
  flex-shrink: 0;
}

.email-link {
  color: rgba(255, 255, 255, 0.85);
  font-size: 13.5px;
  text-decoration: none;
  transition: color 0.15s ease;
}

.email-link:hover {
  color: #FAF8F4;
}

.lang-switch-box {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  font-weight: 700;
}

.lang-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.lang-btn:hover,
.lang-btn.active {
  color: var(--text-white);
  background: rgba(255, 255, 255, 0.16);
}

/* Payment & Legal Bottom Row */
.footer-bottom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  flex-wrap: wrap;
  gap: 16px;
}

.copyright-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.legal-links-list {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.legal-links-list a {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 12px;
  transition: color 0.15s ease;
}

.legal-links-list a:hover {
  color: #FAF8F4;
}

/* Responsive */
@media (max-width: 1024px) {
  .footer-main-grid {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }

  .footer-card {
    padding: 48px 32px 32px;
  }
}

@media (max-width: 640px) {
  .footer-wrapper {
    padding: 40px 0 0;
  }

  .footer-card {
    padding: 28px 16px calc(20px + env(safe-area-inset-bottom, 0px));
    border-radius: 16px 16px 0 0;
  }

  .scroll-top-btn {
    right: 16px;
    top: -18px;
    width: 40px;
    height: 40px;
  }

  .footer-main-grid {
    grid-template-columns: 1fr;
    gap: 0;
    margin-bottom: 16px;
  }

  .footer-accordion {
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  }

  .footer-accordion > .col-title {
    margin-bottom: 0;
    padding: 14px 0;
    cursor: pointer;
    user-select: none;
  }

  .footer-accordion[open] > .col-title {
    margin-bottom: 0;
    padding-bottom: 10px;
  }

  .accordion-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    position: relative;
  }

  .accordion-icon::before,
  .accordion-icon::after {
    content: '';
    position: absolute;
    background: rgba(255, 255, 255, 0.85);
    border-radius: 1px;
    transition: transform 0.2s ease, opacity 0.2s ease;
  }

  .accordion-icon::before {
    width: 12px;
    height: 1.5px;
  }

  .accordion-icon::after {
    width: 1.5px;
    height: 12px;
  }

  .footer-accordion[open] .accordion-icon::after {
    opacity: 0;
    transform: scaleY(0);
  }

  .footer-accordion .col-links {
    padding: 0 0 14px;
    gap: 10px;
  }

  .col-links a {
    font-size: 13px;
  }

  .subscribe-col {
    padding-top: 18px;
  }

  .subscribe-title {
    margin-bottom: 12px;
    font-size: 13px;
  }

  .subscribe-buttons-group {
    flex-direction: row;
    align-items: stretch;
    gap: 0;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 12px;
    overflow: hidden;
  }

  .social-subscribe-btn {
    flex: 1;
    flex-direction: column-reverse;
    justify-content: center;
    gap: 6px;
    padding: 12px 6px;
    border-radius: 0;
    border: none;
    border-right: 1px solid rgba(255, 255, 255, 0.14);
    background: transparent;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.2px;
    text-align: center;
    box-shadow: none;
  }

  .social-subscribe-btn:last-child {
    border-right: none;
  }

  .social-subscribe-btn:hover {
    transform: none;
    background: rgba(255, 255, 255, 0.08);
  }

  .social-subscribe-btn.whatsapp {
    background: transparent;
  }

  .social-subscribe-btn.whatsapp:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .social-subscribe-btn .btn-text {
    line-height: 1.2;
  }

  .social-icon svg {
    width: 18px;
    height: 18px;
  }

  .footer-contacts-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 14px 0;
    margin-bottom: 14px;
  }

  .contacts-left {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .phone-pill {
    justify-content: center;
    padding: 10px 14px;
    font-size: 14px;
  }

  .email-link {
    text-align: center;
    font-size: 13px;
  }

  .lang-switch-box {
    justify-content: center;
  }

  .footer-bottom-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .copyright-text {
    font-size: 12px;
  }

  .legal-links-list {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .legal-links-list a {
    font-size: 11.5px;
  }
}

@media (min-width: 641px) {
  .footer-accordion > .col-title {
    pointer-events: none;
  }

  /* Keep columns expanded even before/without JS open sync */
  .footer-accordion > .col-links {
    display: flex !important;
  }
}
</style>
