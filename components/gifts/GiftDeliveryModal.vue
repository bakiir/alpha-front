<template>
  <Teleport to="body">
    <Transition name="gd-fade">
      <div v-if="open" class="gd-overlay" @click.self="requestClose">
        <section
          ref="dialogRef"
          class="gd-modal"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="`${greetingId} ${titleId}`"
          :aria-describedby="subtitleId"
          tabindex="-1"
          @keydown="onKeydown"
        >
          <button
            type="button"
            class="gd-close"
            :aria-label="t('gifts.claim.close')"
            :disabled="submitting"
            @click="requestClose"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>

          <div class="gd-gift">
            <span class="gd-logo" aria-hidden="true"><AppLogo size="sm" /></span>

            <p class="gd-eyebrow">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3.5" y="8" width="17" height="4" rx="0.8" />
                <path d="M5 12v8.2h14V12M12 8v12.2" />
                <path d="M12 8c-1.6-2.9-5.4-3.6-5.4-1.3C6.6 8.1 9.4 8 12 8zM12 8c1.6-2.9 5.4-3.6 5.4-1.3 0 1.4-2.8 1.3-5.4 1.3z" />
              </svg>
              {{ t('gifts.tokenClaim.modal.eyebrow') }}
            </p>

            <h2 :id="greetingId" class="gd-greeting">{{ t('gifts.tokenClaim.modal.title') }}</h2>

            <p class="gd-from">
              {{ t('gifts.tokenClaim.modal.from') }} <strong>{{ senderName || t('gifts.defaults.senderPerson') }}</strong>
            </p>
            <p v-if="message" class="gd-message">«{{ message }}»</p>

            <div class="gd-stage" aria-hidden="true">
              <div class="gd-scene">
                <img
                  class="gd-scene-img"
                  :src="sceneSrc"
                  alt=""
                  width="1024"
                  height="1024"
                  decoding="async"
                >
                <span class="gd-tag">{{ t('gifts.tokenClaim.modal.tag') }}</span>
              </div>
            </div>

            <ul
              class="gd-card"
              :class="{ 'gd-card--multi': items.length > 1 }"
              :aria-label="items.length > 1 ? t('gifts.tokenClaim.modal.itemsLabel') : t('gifts.tokenClaim.modal.itemLabel')"
            >
              <li v-for="(item, index) in items" :key="item.key" class="gd-item">
                <img
                  v-if="item.image && !brokenImages[item.key]"
                  class="gd-item-img"
                  :src="item.image"
                  :alt="item.name || t('gifts.tokenClaim.toyAlt')"
                  loading="lazy"
                  decoding="async"
                  @error="brokenImages[item.key] = true"
                >
                <span v-else class="gd-item-img gd-item-img--empty">
                  <AppIcon name="gift" :size="30" />
                </span>
                <div class="gd-item-text">
                  <p v-if="index === 0" class="gd-item-label" aria-hidden="true">
                    {{ items.length > 1 ? t('gifts.tokenClaim.modal.itemsLabel') : t('gifts.tokenClaim.modal.itemLabel') }}
                  </p>
                  <p class="gd-item-name">{{ item.name || t('gifts.tokenClaim.toyAlt') }}</p>
                </div>
                <span class="gd-item-qty">{{ t('gifts.tokenClaim.modal.quantity', { count: item.quantity }) }}</span>
              </li>
            </ul>

            <p class="gd-note">{{ t('gifts.tokenClaim.modal.note') }}</p>
          </div>

          <div class="gd-form-col">
            <h3 :id="titleId" class="gd-title">{{ t('gifts.tokenClaim.modal.heading') }}</h3>
            <p :id="subtitleId" class="gd-subtitle">{{ t('gifts.tokenClaim.modal.subtitle') }}</p>

            <div v-if="submitError" class="gd-banner" role="alert">{{ submitError }}</div>

            <form class="gd-form" novalidate @submit.prevent="onSubmit">
              <div class="gd-field">
                <label :for="fieldId('name')" class="gd-label">{{ t('gifts.tokenClaim.modal.name') }}</label>
                <input
                  :id="fieldId('name')"
                  ref="nameRef"
                  v-model="form.name"
                  type="text"
                  class="gd-input"
                  :class="{ 'gd-input--error': errors.name }"
                  autocomplete="name"
                  :maxlength="GIFT_DELIVERY_LIMITS.name"
                  :placeholder="t('checkout.placeholders.name')"
                  :aria-invalid="errors.name ? 'true' : undefined"
                  :aria-describedby="errors.name ? errorId('name') : undefined"
                  @input="clearError('name')"
                >
                <p v-if="errors.name" :id="errorId('name')" class="gd-error">{{ errors.name }}</p>
              </div>

              <div class="gd-field">
                <label :for="fieldId('phone')" class="gd-label">{{ t('gifts.tokenClaim.modal.phone') }}</label>
                <input
                  :id="fieldId('phone')"
                  ref="phoneRef"
                  :value="form.phone"
                  type="tel"
                  inputmode="tel"
                  class="gd-input"
                  :class="{ 'gd-input--error': errors.phone }"
                  autocomplete="tel"
                  maxlength="18"
                  :placeholder="t('checkout.placeholders.recipientPhone')"
                  :aria-invalid="errors.phone ? 'true' : undefined"
                  :aria-describedby="errors.phone ? errorId('phone') : undefined"
                  @input="onPhoneInput"
                  @paste="onPhonePaste"
                >
                <p v-if="errors.phone" :id="errorId('phone')" class="gd-error">{{ errors.phone }}</p>
              </div>

              <div class="gd-field">
                <label :for="fieldId('address')" class="gd-label">{{ t('gifts.tokenClaim.modal.address') }}</label>
                <textarea
                  :id="fieldId('address')"
                  ref="addressRef"
                  v-model="form.address"
                  rows="2"
                  class="gd-input gd-input--area"
                  :class="{ 'gd-input--error': errors.address }"
                  autocomplete="street-address"
                  :maxlength="GIFT_DELIVERY_LIMITS.address"
                  :placeholder="t('checkout.placeholders.addressFull')"
                  :aria-invalid="errors.address ? 'true' : undefined"
                  :aria-describedby="errors.address ? errorId('address') : undefined"
                  @input="clearError('address')"
                />
                <p v-if="errors.address" :id="errorId('address')" class="gd-error">{{ errors.address }}</p>
              </div>

              <div class="gd-field">
                <label :for="fieldId('comment')" class="gd-label">
                  {{ t('gifts.tokenClaim.modal.comment') }}
                  <span class="gd-optional">{{ t('gifts.tokenClaim.modal.optional') }}</span>
                </label>
                <input
                  :id="fieldId('comment')"
                  ref="commentRef"
                  v-model="form.comment"
                  type="text"
                  class="gd-input"
                  :class="{ 'gd-input--error': errors.comment }"
                  :maxlength="GIFT_DELIVERY_LIMITS.comment"
                  :placeholder="t('gifts.tokenClaim.modal.commentPlaceholder')"
                  :aria-invalid="errors.comment ? 'true' : undefined"
                  :aria-describedby="errors.comment ? errorId('comment') : undefined"
                  @input="clearError('comment')"
                >
                <p v-if="errors.comment" :id="errorId('comment')" class="gd-error">{{ errors.comment }}</p>
              </div>

              <button type="submit" class="gd-submit" :disabled="submitting" :aria-busy="submitting ? 'true' : undefined">
                <span v-if="submitting" class="gd-spinner" aria-hidden="true" />
                <span>{{ submitting ? t('gifts.tokenClaim.modal.submitting') : t('gifts.tokenClaim.modal.submit') }}</span>
                <svg v-if="!submitting" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M4 12h15M13 6l6 6-6 6" />
                </svg>
              </button>
            </form>

            <p class="gd-hint">{{ t('gifts.tokenClaim.modal.hint') }}</p>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Ref } from 'vue'
import {
  GIFT_DELIVERY_FIELDS,
  GIFT_DELIVERY_LIMITS,
  validateGiftDeliveryForm,
  type GiftDeliveryField,
  type GiftDeliveryForm,
  type GiftDeliveryItem,
} from '~/utils/giftDelivery'

const props = defineProps<{
  open: boolean
  senderName?: string | null
  message?: string | null
  items: GiftDeliveryItem[]
  submitting?: boolean
  submitError?: string | null
  serverErrors?: Partial<Record<GiftDeliveryField, string>>
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit'): void
}>()

const form = defineModel<GiftDeliveryForm>('form', { required: true })

const sceneSrc = '/images/gifts/gift-box-scene.webp'

const { t } = useI18n()
const uid = useId()
const greetingId = `${uid}-greeting`
const titleId = `${uid}-title`
const subtitleId = `${uid}-subtitle`
const fieldId = (field: GiftDeliveryField) => `${uid}-${field}`
const errorId = (field: GiftDeliveryField) => `${uid}-${field}-error`

const dialogRef = ref<HTMLElement | null>(null)
const nameRef = ref<HTMLInputElement | null>(null)
const phoneRef = ref<HTMLInputElement | null>(null)
const addressRef = ref<HTMLTextAreaElement | null>(null)
const commentRef = ref<HTMLInputElement | null>(null)
const fieldRefs: Record<GiftDeliveryField, Ref<HTMLInputElement | HTMLTextAreaElement | null>> = {
  name: nameRef,
  phone: phoneRef,
  address: addressRef,
  comment: commentRef,
}

const errors = ref<Partial<Record<GiftDeliveryField, string>>>({})
const brokenImages = reactive<Record<string, boolean>>({})

const clearError = (field: GiftDeliveryField) => {
  if (errors.value[field]) {
    const next = { ...errors.value }
    delete next[field]
    errors.value = next
  }
}

const focusFirstError = () => {
  const field = GIFT_DELIVERY_FIELDS.find((f) => errors.value[f])
  if (field) nextTick(() => fieldRefs[field].value?.focus())
}

watch(() => props.serverErrors, (serverErrors) => {
  if (serverErrors && Object.keys(serverErrors).length) {
    errors.value = { ...errors.value, ...serverErrors }
    focusFirstError()
  }
})

const onPhoneInput = (event: Event) => {
  clearError('phone')
  handlePhoneInput(event, (val) => { form.value.phone = val })
}

const onPhonePaste = (event: ClipboardEvent) => {
  clearError('phone')
  handlePhonePaste(event, (val) => { form.value.phone = val })
}

const errorMessages = computed(() => ({
  required: t('gifts.tokenClaim.modal.errors.required'),
  phone: t('gifts.tokenClaim.modal.errors.phone'),
  tooLong: t('gifts.tokenClaim.modal.errors.tooLong'),
}))

const onSubmit = () => {
  if (props.submitting) return
  const codes = validateGiftDeliveryForm(form.value)
  const next: Partial<Record<GiftDeliveryField, string>> = {}
  for (const [field, code] of Object.entries(codes) as [GiftDeliveryField, keyof typeof errorMessages.value][]) {
    next[field] = errorMessages.value[code]
  }
  errors.value = next
  if (Object.keys(next).length) {
    focusFirstError()
    return
  }
  emit('submit')
}

const requestClose = () => {
  if (!props.submitting) emit('close')
}

const focusableSelector = 'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    event.stopPropagation()
    requestClose()
    return
  }
  if (event.key !== 'Tab' || !dialogRef.value) return
  const focusable = Array.from(dialogRef.value.querySelectorAll<HTMLElement>(focusableSelector))
  if (!focusable.length) return
  const first = focusable[0]!
  const last = focusable[focusable.length - 1]!
  const active = document.activeElement
  if (event.shiftKey && (active === first || active === dialogRef.value)) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}

// Desktop fits short viewports by zooming instead of scrolling. scrollHeight is in unzoomed px;
// extra passes settle it because a smaller zoom widens the layout and lowers its height.
const MIN_ZOOM = 0.7
let fitFrame = 0
let resizeObserver: ResizeObserver | null = null

const fitToViewport = () => {
  fitFrame = 0
  const dialog = dialogRef.value
  if (!dialog) return
  let zoom = 1
  if (window.matchMedia('(min-width: 861px)').matches) {
    const overlay = dialog.parentElement as HTMLElement
    const gap = parseFloat(getComputedStyle(overlay).paddingTop) || 0
    const available = window.innerHeight - gap * 2
    zoom = Number(dialog.style.getPropertyValue('--gd-zoom')) || 1
    for (let pass = 0; pass < 4; pass++) {
      dialog.style.zoom = String(zoom)
      const fit = Math.min(1, Math.max(MIN_ZOOM, Math.floor((available / dialog.scrollHeight) * 1000) / 1000))
      if (Math.abs(fit - zoom) < 0.002) break
      zoom = fit
    }
  }
  dialog.style.zoom = zoom < 1 ? String(zoom) : ''
  dialog.style.setProperty('--gd-zoom', String(zoom))
}

const scheduleFit = () => {
  if (!fitFrame) fitFrame = requestAnimationFrame(fitToViewport)
}

const startFitting = () => {
  const dialog = dialogRef.value
  if (!dialog) return
  fitToViewport()
  window.addEventListener('resize', scheduleFit)
  resizeObserver = new ResizeObserver(scheduleFit)
  for (const child of Array.from(dialog.children)) resizeObserver.observe(child)
  document.fonts?.ready.then(scheduleFit)
}

const stopFitting = () => {
  window.removeEventListener('resize', scheduleFit)
  resizeObserver?.disconnect()
  resizeObserver = null
  if (fitFrame) cancelAnimationFrame(fitFrame)
  fitFrame = 0
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
    nextTick(() => {
      startFitting()
      dialogRef.value?.focus({ preventScroll: true })
    })
  } else {
    stopFitting()
    root.style.overflow = previousOverflow
    previousFocus?.focus?.({ preventScroll: true })
    previousFocus = null
  }
}

watch(() => props.open, (open, wasOpen) => {
  if (open !== Boolean(wasOpen)) lockPage(open)
  if (!open) errors.value = {}
}, { immediate: true })

onBeforeUnmount(() => {
  if (props.open) lockPage(false)
})
</script>

<style scoped>
.gd-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  --gd-gap: 24px;
  padding: var(--gd-gap);
  background: rgba(58, 38, 18, 0.56);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.gd-modal {
  --gd-ink: #0f140f;
  --gd-green: #1c3a25;
  --gd-sage: #d6dfcc;
  --gd-muted: #6d7186;
  --gd-line: #e3e4e8;

  position: relative;
  display: grid;
  grid-template-columns: 46fr 54fr;
  width: 1100px;
  max-width: 100%;
  /* zoom scales max-height too, so divide it back out */
  max-height: calc((100dvh - 2 * var(--gd-gap)) / var(--gd-zoom, 1));
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 32px 90px rgba(24, 30, 22, 0.32), 0 6px 18px rgba(24, 30, 22, 0.12);
  color: var(--gd-ink);
  font-family: var(--font-body);
  outline: none;
}

.gd-close {
  position: absolute;
  top: 12px;
  right: 10px;
  z-index: 5;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: transparent;
  color: #474c48;
  transition: background 0.2s ease, color 0.2s ease;
}

.gd-close:hover {
  background: rgba(31, 58, 41, 0.07);
  color: var(--gd-ink);
}

.gd-close:focus-visible,
.gd-submit:focus-visible {
  outline: 2px solid var(--gd-green);
  outline-offset: 2px;
}

.gd-close:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Left: gift column */
.gd-gift {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 681px;
  padding: 26px 23px 23px 35px;
  overflow: hidden;
  background: var(--gd-sage);
  container-type: inline-size;
}

/* The scene hangs from the stage (space between greeting and card) so longer texts push it down instead of overlapping it. */
.gd-stage {
  position: relative;
  flex: 1 1 auto;
  min-height: 45.5cqw;
}

.gd-scene {
  position: absolute;
  top: -42.9cqw;
  left: calc(1.6cqw - 35px);
  width: 120cqw;
  pointer-events: none;
  user-select: none;
}

.gd-scene-img {
  display: block;
  width: 100%;
  height: auto;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 22%, #000 86%, transparent 100%);
  mask-image: linear-gradient(to bottom, transparent 0%, #000 22%, #000 86%, transparent 100%);
}

.gd-tag {
  position: absolute;
  top: 65.6%;
  left: 74.4%;
  width: 3.2em;
  margin-left: -1.6em;
  font-size: clamp(11px, 3cqw, 15.5px);
  font-weight: 500;
  line-height: 1.15;
  text-align: center;
  color: #4b5547;
  transform: rotate(-17deg);
  overflow-wrap: anywhere;
}

.gd-logo,
.gd-eyebrow,
.gd-greeting,
.gd-from,
.gd-message,
.gd-card,
.gd-note {
  position: relative;
  z-index: 1;
}

.gd-logo {
  display: inline-flex;
  align-items: center;
}

.gd-eyebrow {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 32px;
  font-size: 15px;
  font-weight: 700;
  line-height: 28px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #203a24;
}

.gd-eyebrow svg {
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  margin-left: -1px;
  color: #203a24;
}

.gd-greeting {
  max-width: 440px;
  margin-top: 6px;
  font-family: var(--font-body) !important;
  font-size: 50px;
  font-weight: 800;
  line-height: 53px;
  letter-spacing: -0.035em;
  color: var(--gd-ink);
  text-wrap: balance;
}

.gd-from {
  margin-top: 10px;
  font-size: 20.5px;
  line-height: 27px;
  color: #0f140f;
  overflow-wrap: anywhere;
}

.gd-from strong {
  font-weight: 800;
  color: var(--gd-ink);
}

.gd-message {
  max-width: 440px;
  margin-top: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 14px;
  font-style: italic;
  line-height: 20px;
  color: #3e473e;
  overflow-wrap: anywhere;
}

.gd-card {
  margin-left: -6px;
  max-height: 252px;
  overflow-y: auto;
  overscroll-behavior: contain;
  list-style: none;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 10px 28px rgba(44, 60, 40, 0.1);
}

.gd-item {
  display: flex;
  align-items: center;
  min-height: 129px;
  padding: 13px 0 13px 14px;
}

.gd-item + .gd-item {
  border-top: 1px solid #edefeb;
}

.gd-item-img {
  flex: 0 0 auto;
  width: 106px;
  height: 101px;
  border-radius: 10px;
  background: #f1f2ef;
  object-fit: cover;
}

.gd-item-img--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8a9a86;
}

.gd-item-text {
  flex: 1 1 auto;
  min-width: 0;
  padding: 0 36px 0 16px;
}

.gd-item-label {
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 600;
  line-height: 14px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #9093a1;
}

.gd-item-name {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 20px;
  font-weight: 500;
  line-height: 25px;
  color: var(--gd-ink);
  overflow-wrap: anywhere;
}

.gd-item-qty {
  flex: 0 0 auto;
  align-self: center;
  min-width: 82px;
  padding: 18px 20px 18px 22px;
  border-left: 1px solid #e3e5e1;
  font-size: 18px;
  font-weight: 500;
  line-height: 26px;
  white-space: nowrap;
  color: var(--gd-ink);
}

.gd-card--multi .gd-item {
  min-height: 96px;
  padding: 12px 0 12px 12px;
}

.gd-card--multi .gd-item-img {
  width: 72px;
  height: 72px;
}

.gd-card--multi .gd-item-name {
  -webkit-line-clamp: 2;
  font-size: 17px;
  line-height: 22px;
}

.gd-card--multi .gd-item-qty {
  padding-top: 12px;
  padding-bottom: 12px;
  font-size: 16px;
}

.gd-note {
  margin-top: 15px;
  font-size: 16px;
  line-height: 22px;
  color: #44524d;
}

/* Right: form column */
.gd-form-col {
  min-width: 0;
  padding: 53px 34px 18px 45px;
  background: #fff;
}

.gd-title {
  padding-right: 24px;
  font-family: var(--font-body) !important;
  font-size: 37px;
  font-weight: 800;
  line-height: 42px;
  letter-spacing: -0.03em;
  color: #0b0d0b;
  text-wrap: balance;
}

.gd-subtitle {
  margin-top: 8px;
  font-size: 17.5px;
  line-height: 24px;
  color: var(--gd-muted);
}

.gd-banner {
  margin-top: 16px;
  padding: 12px 16px;
  border: 1px solid #f1c8c4;
  border-radius: 10px;
  background: #fdf3f2;
  font-size: 14px;
  line-height: 20px;
  color: #a5302a;
  white-space: pre-line;
}

.gd-form {
  margin-top: 23px;
}

.gd-field + .gd-field {
  margin-top: 21px;
}

.gd-label {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 4px 8px;
  margin-bottom: 10px;
  font-size: 15.5px;
  font-weight: 500;
  line-height: 20px;
  color: #1f222e;
}

.gd-optional {
  font-size: 13px;
  font-weight: 500;
  color: #8e93a5;
}

.gd-input {
  display: block;
  width: 100%;
  height: 52px;
  padding: 0 17px;
  border: 1px solid var(--gd-line);
  border-radius: 10px;
  background: #fff;
  font-size: 16.5px;
  line-height: 22px;
  color: #181825;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.gd-input--area {
  height: 68px;
  min-height: 68px;
  padding-top: 14px;
  padding-bottom: 8px;
  resize: vertical;
}

.gd-input::placeholder {
  color: #9a9aab;
}

.gd-input:hover {
  border-color: #cdd3cd;
}

.gd-input:focus {
  border-color: #6f8a75;
  box-shadow: 0 0 0 3px rgba(31, 58, 41, 0.1);
  outline: none;
}

.gd-input--error,
.gd-input--error:hover {
  border-color: #d0574f;
}

.gd-input--error:focus {
  border-color: #d0574f;
  box-shadow: 0 0 0 3px rgba(208, 87, 79, 0.12);
}

.gd-error {
  margin-top: 6px;
  font-size: 13px;
  line-height: 18px;
  color: #b23a32;
}

.gd-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  min-height: 53px;
  margin-top: 22px;
  padding: 10px 20px;
  border-radius: 9px;
  background: var(--gd-green);
  font-size: 18px;
  font-weight: 500;
  line-height: 22px;
  color: #fff;
  transition: background 0.2s ease;
}

.gd-submit:hover:not(:disabled) {
  background: #172e20;
}

.gd-submit:disabled {
  cursor: progress;
  opacity: 0.85;
}

.gd-spinner {
  flex: 0 0 auto;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: gd-spin 0.8s linear infinite;
}

@keyframes gd-spin {
  to { transform: rotate(360deg); }
}

.gd-hint {
  margin-top: 12px;
  font-size: 13.5px;
  line-height: 18px;
  text-align: center;
  color: #828295;
}

/* Transition */
.gd-fade-enter-active,
.gd-fade-leave-active {
  transition: opacity 0.25s ease;
}

.gd-fade-enter-active .gd-modal,
.gd-fade-leave-active .gd-modal {
  transition: transform 0.25s ease;
}

.gd-fade-enter-from,
.gd-fade-leave-to {
  opacity: 0;
}

.gd-fade-enter-from .gd-modal,
.gd-fade-leave-to .gd-modal {
  transform: translateY(12px) scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .gd-fade-enter-active,
  .gd-fade-leave-active,
  .gd-fade-enter-active .gd-modal,
  .gd-fade-leave-active .gd-modal {
    transition: none;
  }

  .gd-spinner {
    animation-duration: 2.4s;
  }
}

@media (min-width: 861px) and (max-height: 760px) {
  .gd-overlay {
    --gd-gap: 14px;
  }
}

/* Narrow desktops / tablets */
@media (max-width: 1060px) {
  .gd-greeting {
    font-size: 40px;
    line-height: 47px;
  }

  .gd-title {
    font-size: 31px;
    line-height: 36px;
  }
}

/* Phones: stacked layout */
@media (max-width: 860px) {
  .gd-overlay {
    align-items: flex-start;
    --gd-gap: 12px;
  }

  .gd-modal {
    grid-template-columns: minmax(0, 1fr);
    width: 560px;
    border-radius: 20px;
  }

  .gd-close {
    top: 10px;
    right: 8px;
  }

  .gd-gift {
    min-height: 0;
    padding: 20px 16px 16px 20px;
  }

  /* 16:9 crop of the square scene that keeps the whole box visible. */
  .gd-stage {
    min-height: 0;
    aspect-ratio: 16 / 9;
    margin: 0 -16px -30px -20px;
    overflow: hidden;
  }

  .gd-scene {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .gd-scene-img {
    position: absolute;
    top: -48.2%;
    left: 0;
    -webkit-mask-image: linear-gradient(to bottom, transparent 27%, #000 38%);
    mask-image: linear-gradient(to bottom, transparent 27%, #000 38%);
  }

  .gd-tag {
    top: 68.4%;
    font-size: clamp(10px, 2.9cqw, 14px);
  }

  .gd-logo {
    max-width: 100%;
  }

  .gd-eyebrow {
    gap: 10px;
    margin-top: 22px;
    font-size: 12px;
  }

  .gd-greeting {
    max-width: none;
    margin-top: 6px;
    padding-right: 8px;
    font-size: clamp(28px, 8.6vw, 38px);
    line-height: 1.1;
  }

  .gd-from {
    margin-top: 8px;
    font-size: 16.5px;
    line-height: 22px;
  }

  .gd-message {
    max-width: none;
    font-size: 13.5px;
    line-height: 19px;
  }

  .gd-card {
    margin-left: -4px;
    max-height: 216px;
  }

  .gd-item {
    min-height: 96px;
    padding: 10px 0 10px 10px;
  }

  .gd-item-img,
  .gd-card--multi .gd-item-img {
    width: 76px;
    height: 76px;
  }

  .gd-item-text {
    padding: 0 12px;
  }

  .gd-item-label {
    margin-bottom: 4px;
    font-size: 10.5px;
  }

  .gd-item-name,
  .gd-card--multi .gd-item-name {
    font-size: 16px;
    line-height: 21px;
  }

  .gd-item-qty,
  .gd-card--multi .gd-item-qty {
    min-width: 0;
    padding: 10px 14px;
    font-size: 15px;
  }

  .gd-note {
    margin-top: 12px;
    font-size: 13.5px;
    line-height: 19px;
  }

  .gd-form-col {
    padding: 24px 20px 20px;
  }

  .gd-title {
    padding-right: 0;
    font-size: 26px;
    line-height: 31px;
  }

  .gd-subtitle {
    margin-top: 8px;
    font-size: 14.5px;
    line-height: 20px;
  }

  .gd-form {
    margin-top: 20px;
  }

  .gd-field + .gd-field {
    margin-top: 16px;
  }

  .gd-label {
    margin-bottom: 8px;
    font-size: 14px;
  }

  .gd-input {
    height: 50px;
    font-size: 16px;
  }

  .gd-input--area {
    height: 72px;
  }

  .gd-submit {
    min-height: 52px;
    margin-top: 20px;
    font-size: 16px;
  }

  .gd-hint {
    font-size: 13px;
  }
}
</style>
