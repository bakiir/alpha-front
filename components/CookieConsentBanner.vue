<template>
  <Teleport to="body">
    <Transition name="cookie-banner">
      <div
        v-if="showBanner"
        class="cookie-banner"
        role="dialog"
        aria-labelledby="cookie-banner-title"
        aria-describedby="cookie-banner-desc"
      >
        <div class="cookie-banner-inner container">
          <div class="cookie-banner-text">
            <p id="cookie-banner-title" class="cookie-banner-title">
              {{ t('cookieConsent.title') }}
            </p>
            <p id="cookie-banner-desc" class="cookie-banner-desc">
              {{ t('cookieConsent.description') }}
              <NuxtLink :to="localePath('/legal/privacy')" class="cookie-banner-link">
                {{ t('footer.privacy') }}
              </NuxtLink>
            </p>
          </div>
          <button type="button" class="btn-primary cookie-banner-accept" @click="accept">
            {{ t('cookieConsent.accept') }}
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { showBanner, accept } = useCookieConsent()
</script>

<style scoped>
.cookie-banner {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100000;
  padding: 16px 0 calc(16px + env(safe-area-inset-bottom, 0px));
  background: rgba(38, 38, 38, 0.92);
  backdrop-filter: blur(8px);
  color: var(--text-white);
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.18);
}

.cookie-banner-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px 24px;
}

.cookie-banner-title {
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-white);
  margin-bottom: 6px;
}

.cookie-banner-desc {
  font-size: 0.875rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.88);
  max-width: 52rem;
}

.cookie-banner-link {
  color: var(--green-surface);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.cookie-banner-link:hover {
  color: #fff;
}

.cookie-banner-accept {
  flex-shrink: 0;
  min-width: 140px;
}

.cookie-banner-enter-active,
.cookie-banner-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.cookie-banner-enter-from,
.cookie-banner-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

@media (max-width: 640px) {
  .cookie-banner-inner {
    flex-direction: column;
    align-items: stretch;
  }

  .cookie-banner-accept {
    width: 100%;
  }
}
</style>
