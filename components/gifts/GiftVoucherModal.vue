<template>
  <Teleport to="body">
    <Transition name="gv-fade">
      <div v-if="open" class="gv-overlay" @click.self="emit('close')">
        <section
          ref="dialogRef"
          class="gv-modal"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          tabindex="-1"
        >
          <header class="gv-top">
            <span class="gv-logo" aria-hidden="true">alpha</span>
            <button type="button" class="gv-close" :aria-label="t('gifts.claim.close')" @click="emit('close')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
                <path d="M5 5l14 14M19 5L5 19" />
              </svg>
            </button>
          </header>

          <div class="gv-heading">
            <h2 :id="titleId" class="gv-title">{{ t('gifts.claim.modalTitle') }}</h2>
            <p class="gv-subtitle">{{ t('gifts.claim.modalSubtitle') }}</p>
            <p v-if="recipientName" class="gv-recipient">
              {{ t('gifts.claim.recipient') }} <strong>{{ recipientName }}</strong>
            </p>
          </div>

          <div class="gv-gift">
            <div class="gv-balance">
              <p class="gv-eyebrow">{{ t('gifts.claim.available') }}</p>
              <p class="gv-amount" :class="{ 'gv-amount--long': balanceText.length > 6 }">
                {{ balanceText }}<span class="gv-currency">₸</span>
              </p>
              <p class="gv-nominal">
                {{ t('gifts.claim.nominal') }} <strong>{{ formatPrice(initialAmount) }} ₸</strong>
              </p>
            </div>
            <img
              class="gv-envelope"
              src="/images/gifts/gift-envelope.webp"
              alt=""
              width="760"
              height="636"
              decoding="async"
            >
          </div>

          <div class="gv-wish">
            <p class="gv-wish-label">{{ t('gifts.claim.wishLabel') }}</p>
            <p class="gv-wish-text">{{ message || t('gifts.defaults.claimMessage') }}</p>
            <p class="gv-wish-sign">
              {{ t('gifts.claim.withLove') }} <strong>{{ senderName || t('gifts.defaults.senderRelatives') }}</strong>
            </p>
            <img
              class="gv-sprig"
              src="/images/gifts/gift-sprig.webp"
              alt=""
              width="397"
              height="362"
              decoding="async"
            >
          </div>

          <div class="gv-details">
            <p :id="codeLabelId" class="gv-code-label">{{ t('gifts.claim.codeLabel') }}</p>
            <div class="gv-code-row">
              <code class="gv-code" :aria-labelledby="codeLabelId">{{ code }}</code>
              <button type="button" class="gv-copy" @click="emit('copy')">
                <AppIcon :name="copied ? 'check' : 'copy'" :size="20" class="gv-copy-icon" />
                <span aria-live="polite">{{ copied ? t('gifts.claim.copied') : t('gifts.claim.copy') }}</span>
              </button>
            </div>

            <div v-if="deadline" class="gv-deadline">
              <AppIcon name="clock" :size="33" class="gv-clock" />
              <div class="gv-deadline-text">
                <p class="gv-deadline-main">
                  {{ deadline.kind === 'activation' ? t('gifts.claim.activateUntil') : t('gifts.claim.balanceValidUntil') }}
                  <strong>{{ deadline.date }}</strong>
                </p>
                <p v-if="timezoneNote" class="gv-deadline-note">{{ timezoneNote }}</p>
              </div>
            </div>
          </div>

          <p class="gv-hint">
            <span>{{ t('gifts.claim.modalHint1') }}</span>
            <span>{{ t('gifts.claim.modalHint2') }}</span>
          </p>

          <NuxtLink :to="cartTo" class="gv-cta">{{ t('gifts.claim.useInCart') }}</NuxtLink>
          <NuxtLink :to="catalogTo" class="gv-catalog">{{ t('gifts.claim.toCatalog') }}</NuxtLink>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import type { GiftCardDeadline } from '~/utils/giftDeadline'

const props = defineProps<{
  open: boolean
  code: string
  balance: number
  initialAmount: number
  recipientName?: string | null
  senderName?: string | null
  message?: string | null
  deadline?: GiftCardDeadline | null
  copied?: boolean
  cartTo: RouteLocationRaw
  catalogTo: RouteLocationRaw
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'copy'): void
}>()

const { t } = useI18n()
const titleId = useId()
const codeLabelId = useId()
const dialogRef = ref<HTMLElement | null>(null)

const formatPrice = (val: number) => {
  if (!val && val !== 0) return '0'
  return Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

const balanceText = computed(() => formatPrice(Number(props.balance || 0)))

const timezoneNote = computed(() => {
  const deadline = props.deadline
  if (!deadline || deadline.kind !== 'activation' || !deadline.timezone) return null
  return deadline.timezone === 'Asia/Almaty'
    ? t('gifts.claim.almatyTime')
    : t('gifts.claim.timezoneNote', { tz: deadline.timezone })
})

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') emit('close')
}

let previousFocus: HTMLElement | null = null
let previousOverflow = ''

const lockPage = (locked: boolean) => {
  if (!import.meta.client) return
  const root = document.documentElement
  if (locked) {
    previousOverflow = root.style.overflow
    root.style.overflow = 'hidden'
    previousFocus = document.activeElement as HTMLElement | null
    window.addEventListener('keydown', onKeydown)
    nextTick(() => dialogRef.value?.focus({ preventScroll: true }))
  } else {
    root.style.overflow = previousOverflow
    window.removeEventListener('keydown', onKeydown)
    previousFocus?.focus?.({ preventScroll: true })
    previousFocus = null
  }
}

watch(() => props.open, (open, wasOpen) => {
  if (open !== Boolean(wasOpen)) lockPage(open)
}, { immediate: true })

onBeforeUnmount(() => {
  if (props.open) lockPage(false)
})
</script>

<style scoped>
.gv-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(58, 38, 18, 0.58);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.gv-modal {
  --gv-ink: #1f2b22;
  --gv-green: #2d4836;
  --gv-muted: #6e6c66;
  --gv-line: #e6e1d8;

  position: relative;
  width: 560px;
  max-width: 100%;
  max-height: calc(100dvh - 32px);
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 18px 18px 17px;
  border-radius: 18px;
  background: #fbf8f3;
  box-shadow: 0 30px 80px rgba(30, 20, 10, 0.35), 0 4px 14px rgba(30, 20, 10, 0.12);
  color: var(--gv-ink);
  font-family: var(--font-body);
  outline: none;
}

/* Header */
.gv-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  height: 24px;
}

.gv-logo {
  margin: -4px 0 0 4px;
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.01em;
  color: #26372b;
}

.gv-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin: -6px -8px 0 0;
  border-radius: 50%;
  background: transparent;
  color: #5d615d;
  transition: background 0.2s ease, color 0.2s ease;
}

.gv-close:hover {
  background: rgba(35, 52, 40, 0.07);
  color: var(--gv-ink);
}

/* Heading */
.gv-heading {
  text-align: center;
}

.gv-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 53px;
  font-weight: 600;
  line-height: 1.02;
  letter-spacing: -0.03em;
  color: var(--gv-ink);
}

.gv-subtitle {
  margin-top: 4px;
  font-size: 14px;
  line-height: 20px;
  color: var(--gv-muted);
}

.gv-recipient {
  margin-top: 7px;
  padding: 0 24px;
  font-size: 12.5px;
  line-height: 18px;
  color: #77756e;
  overflow-wrap: anywhere;
}

.gv-recipient strong {
  font-weight: 700;
  color: #2b2b27;
}

/* Gift block: balance + envelope artwork */
.gv-gift {
  --gv-env-top: -8.2cqw;
  --gv-env-left: 34.5cqw;
  --gv-env-width: 69.7cqw;

  position: relative;
  z-index: 2;
  margin-top: 8px;
  container-type: inline-size;
}

.gv-balance {
  position: relative;
  min-height: 35cqw;
  padding: 7.4cqw 0 5.6cqw 5.6cqw;
  border-radius: 12px;
  background: linear-gradient(96deg, #e3e3d5 0%, #dcddcd 48%, #d4d8c5 100%);
}

.gv-eyebrow {
  position: relative;
  z-index: 3;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.17em;
  text-transform: uppercase;
  color: #44473f;
}

.gv-amount {
  position: relative;
  z-index: 3;
  margin-top: 0.8cqw;
  font-family: var(--font-display);
  font-size: clamp(38px, 12.2cqw, 64px);
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.01em;
  font-variant-numeric: lining-nums;
  white-space: nowrap;
  color: var(--gv-ink);
}

.gv-amount--long {
  font-size: clamp(34px, 9.8cqw, 52px);
}

.gv-currency {
  margin-left: 0.14em;
  font-family: var(--font-body);
  font-size: 0.74em;
  font-weight: 600;
}

.gv-nominal {
  position: relative;
  z-index: 3;
  width: min(30cqw, 160px);
  margin-top: 2.4cqw;
  padding-top: 2.4cqw;
  border-top: 1px solid rgba(80, 90, 70, 0.22);
  font-size: 14px;
  line-height: 1.2;
  white-space: nowrap;
  color: #3b3e37;
}

.gv-nominal strong {
  font-weight: 700;
  color: var(--gv-ink);
}

.gv-envelope {
  position: absolute;
  z-index: 2;
  top: var(--gv-env-top);
  left: var(--gv-env-left);
  width: var(--gv-env-width);
  height: auto;
  pointer-events: none;
  user-select: none;
  filter: drop-shadow(0 10px 14px rgba(60, 50, 30, 0.16));
}

/* Wish card */
.gv-wish {
  position: relative;
  z-index: 1;
  margin-top: 15px;
  padding: 18px 64px 20px 29px;
  border: 1px solid rgba(222, 210, 192, 0.7);
  border-radius: 10px;
  background-color: #f8f2ea;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .42 0 0 0 0 .34 0 0 0 0 .24 0 0 0 .16 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  box-shadow: 0 10px 22px -10px rgba(70, 55, 35, 0.28), 0 1px 2px rgba(70, 55, 35, 0.06);
  overflow-wrap: anywhere;
}

.gv-wish-label {
  font-size: 10.5px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #4b4a44;
}

.gv-wish-text {
  margin-top: 10px;
  font-family: var(--font-display);
  font-size: 18.5px;
  font-style: italic;
  font-weight: 600;
  line-height: 1.22;
  color: #1f231e;
}

.gv-wish-sign {
  margin-top: 9px;
  font-size: 13px;
  line-height: 1.3;
  color: #55544e;
}

.gv-wish-sign strong {
  font-weight: 700;
  color: #2b2b27;
}

.gv-sprig {
  position: absolute;
  right: 10px;
  bottom: 2px;
  width: 70px;
  height: auto;
  pointer-events: none;
  user-select: none;
}

/* Code + deadline */
.gv-details {
  margin: 13px 16px 0;
}

.gv-code-label {
  font-size: 13px;
  line-height: 18px;
  color: #4a4a45;
}

.gv-code-row {
  display: flex;
  align-items: stretch;
  margin-top: 3px;
  border-radius: 8px;
  background: #f0eee9;
}

.gv-code {
  flex: 1 1 auto;
  min-width: 0;
  padding: 10px 12px 10px 21px;
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;
  font-size: 23.5px;
  font-weight: 600;
  line-height: 26px;
  letter-spacing: 0.065em;
  color: #1d211d;
  background: none;
  overflow-wrap: anywhere;
  user-select: all;
}

.gv-copy {
  position: relative;
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 11px;
  min-height: 46px;
  padding: 0 21px 0 23px;
  border-radius: 0 8px 8px 0;
  background: transparent;
  font-size: 12px;
  font-weight: 500;
  color: #2f3a31;
  transition: background 0.2s ease;
}

.gv-copy::before {
  content: '';
  position: absolute;
  left: 0;
  top: 9px;
  bottom: 9px;
  width: 1px;
  background: #d8d3c9;
}

.gv-copy:hover {
  background: rgba(45, 72, 54, 0.06);
}

.gv-copy-icon {
  color: var(--gv-green);
}

.gv-copy-icon :deep(*),
.gv-clock :deep(*) {
  stroke-width: 1.5;
}

.gv-deadline {
  display: flex;
  align-items: center;
  gap: 19px;
  margin-top: 11px;
  padding: 11px 12px 11px 17px;
  border-top: 1px solid var(--gv-line);
  border-bottom: 1px solid var(--gv-line);
}

.gv-clock {
  color: #d79c56;
}

.gv-deadline-main {
  font-size: 13px;
  line-height: 18px;
  color: #3a3a36;
}

.gv-deadline-main strong {
  font-weight: 650;
  color: #22241f;
}

.gv-deadline-note {
  margin-top: 1px;
  font-size: 12.5px;
  line-height: 17px;
  color: #8a8780;
}

/* Footer */
.gv-hint {
  display: flex;
  flex-direction: column;
  margin-top: 12px;
  padding: 0 24px;
  font-size: 12px;
  line-height: 20px;
  text-align: center;
  color: #7a7770;
}

.gv-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  margin: 13px 23px 0;
  padding: 10px 20px;
  border-radius: 10px;
  background: var(--gv-green);
  font-size: 15px;
  font-weight: 500;
  color: #fff;
  text-align: center;
  transition: background 0.2s ease, transform 0.2s ease;
}

.gv-cta:hover {
  background: #233a2b;
}

.gv-catalog {
  display: block;
  width: fit-content;
  margin: 12px auto 0;
  padding: 2px 4px;
  font-size: 12px;
  font-weight: 600;
  line-height: 18px;
  color: var(--gv-green);
  text-decoration: underline;
  text-decoration-color: #c9c4b8;
  text-decoration-thickness: 1px;
  text-underline-offset: 4px;
}

.gv-catalog:hover {
  text-decoration-color: currentColor;
}

/* Transition */
.gv-fade-enter-active,
.gv-fade-leave-active {
  transition: opacity 0.25s ease;
}

.gv-fade-enter-active .gv-modal,
.gv-fade-leave-active .gv-modal {
  transition: transform 0.25s ease;
}

.gv-fade-enter-from,
.gv-fade-leave-to {
  opacity: 0;
}

.gv-fade-enter-from .gv-modal,
.gv-fade-leave-to .gv-modal {
  transform: translateY(12px) scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .gv-fade-enter-active,
  .gv-fade-leave-active,
  .gv-fade-enter-active .gv-modal,
  .gv-fade-leave-active .gv-modal {
    transition: none;
  }
}

/* Phones */
@media (max-width: 560px) {
  .gv-overlay {
    padding: 10px;
  }

  .gv-modal {
    max-height: calc(100dvh - 20px);
    padding: 16px 12px 16px;
    border-radius: 16px;
  }

  .gv-logo {
    font-size: 24px;
  }

  .gv-title {
    font-size: clamp(38px, 11.5vw, 48px);
  }

  .gv-subtitle {
    font-size: 13.5px;
  }

  /* Text column needs more room than on desktop: keep it in the artwork's transparent corner. */
  .gv-gift {
    --gv-env-top: -6cqw;
    --gv-env-left: 50cqw;
    --gv-env-width: 58cqw;
  }

  .gv-eyebrow {
    font-size: 10.5px;
    letter-spacing: 0.15em;
  }

  .gv-wish {
    padding: 16px 48px 20px 18px;
  }

  .gv-wish-text {
    font-size: 19px;
  }

  .gv-sprig {
    right: 6px;
    width: 52px;
  }

  .gv-details {
    margin: 18px 4px 0;
  }

  .gv-code {
    padding-left: 14px;
    font-size: clamp(16px, 4.9vw, 20px);
    letter-spacing: 0.06em;
  }

  .gv-copy {
    padding: 0 14px;
    gap: 8px;
  }

  .gv-deadline {
    gap: 14px;
    padding: 12px 6px 12px 10px;
  }

  .gv-hint {
    padding: 0 6px;
  }

  .gv-cta {
    min-height: 50px;
    margin: 16px 0 0;
  }

  .gv-catalog {
    margin-top: 12px;
    padding: 6px 10px;
  }
}

@media (max-width: 360px) {
  .gv-gift {
    --gv-env-left: 53cqw;
    --gv-env-width: 55cqw;
  }

  .gv-copy span {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
}
</style>
