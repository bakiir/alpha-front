<template>
  <Teleport to="body">
    <Transition name="gift-m-sheet">
      <div
        v-if="open"
        class="gift-m-overlay"
        role="presentation"
        :style="overlayStyle"
        @click.self="close"
      >
        <div
          ref="panelRef"
          class="gift-m-panel"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          tabindex="-1"
          @keydown="onPanelKeydown"
        >
          <header class="gift-m-header">
            <button
              type="button"
              class="gift-m-header-btn"
              :disabled="step <= 1"
              :aria-label="step > 1 ? 'Назад к предыдущему шагу' : 'Назад'"
              @click="goBack"
            >
              ← Назад
            </button>
            <p :id="titleId" class="gift-m-step-label">Шаг {{ step }} из 3</p>
            <button
              ref="closeBtnRef"
              type="button"
              class="gift-m-close"
              aria-label="Закрыть оформление подарка"
              @click="close"
            >
              ×
            </button>
          </header>

          <div class="gift-m-progress" aria-hidden="true">
            <div class="gift-m-progress-bar" :style="{ width: `${(step / 3) * 100}%` }" />
          </div>

          <div ref="bodyRef" class="gift-m-body">
            <!-- Step 1: gift params -->
            <section v-show="step === 1" class="gift-m-step" aria-label="Параметры подарка">
              <h2 class="gift-m-heading">
                {{ kind === 'subscription' ? 'Подарочная подписка' : 'Денежный сертификат' }}
              </h2>
              <p class="gift-m-lead">
                {{ kind === 'subscription'
                  ? 'Выберите срок и тариф — стоимость пересчитается автоматически.'
                  : 'Выберите номинал или укажите свою сумму.' }}
              </p>

              <template v-if="kind === 'subscription'">
                <p class="gift-m-field-label">Срок</p>
                <div class="gift-m-duration-row" role="group" aria-label="Срок подписки">
                  <button
                    v-for="d in durations"
                    :key="d.id"
                    type="button"
                    class="gift-m-duration-btn"
                    :class="{ active: selectedDuration === d.id }"
                    :aria-pressed="selectedDuration === d.id"
                    @click="emit('update:selectedDuration', d.id)"
                  >
                    {{ durationShortLabel(d) }}
                  </button>
                </div>

                <p class="gift-m-field-label">Тариф</p>
                <p v-if="isLoadingPlans" class="gift-m-hint">Загружаем тарифы…</p>
                <div v-else class="gift-m-tier-list" role="radiogroup" aria-label="Тариф подписки">
                  <button
                    v-for="plan in subscriptionPlans"
                    :key="plan.slug"
                    type="button"
                    class="gift-m-tier-row"
                    :class="{ active: selectedTier === plan.slug }"
                    role="radio"
                    :aria-checked="selectedTier === plan.slug"
                    @click="emit('update:selectedTier', plan.slug)"
                  >
                    <span class="gift-m-radio" aria-hidden="true">
                      <span v-if="selectedTier === plan.slug" class="gift-m-radio-dot" />
                    </span>
                    <span class="gift-m-tier-text">
                      <strong>{{ plan.name }}</strong>
                      <span>
                        {{ plan.toys_count }} {{ toysWord(plan.toys_count) }}
                        · {{ formatPrice(plan.price_monthly) }} ₸/мес
                      </span>
                    </span>
                  </button>
                </div>
                <p v-if="quoteError" class="gift-m-error" role="alert">{{ quoteError }}</p>
              </template>

              <template v-else>
                <p class="gift-m-field-label">Номинал</p>
                <div class="gift-m-amount-grid" role="group" aria-label="Номинал сертификата">
                  <button
                    v-for="preset in voucherPresets"
                    :key="preset"
                    type="button"
                    class="gift-m-amount-btn"
                    :class="{ active: voucherAmountMode === 'preset' && voucherPreset === preset }"
                    :aria-pressed="voucherAmountMode === 'preset' && voucherPreset === preset"
                    @click="emit('select-voucher-preset', preset)"
                  >
                    {{ formatPrice(preset) }} ₸
                  </button>
                  <button
                    type="button"
                    class="gift-m-amount-btn"
                    :class="{ active: voucherAmountMode === 'custom' }"
                    :aria-pressed="voucherAmountMode === 'custom'"
                    @click="emit('update:voucherAmountMode', 'custom')"
                  >
                    Своя
                  </button>
                </div>
                <div v-if="voucherAmountMode === 'custom'" class="gift-m-field">
                  <label for="gift-m-custom-amount">Сумма (от 5 000 до 500 000 ₸)</label>
                  <input
                    id="gift-m-custom-amount"
                    :value="voucherCustomAmount"
                    type="number"
                    min="5000"
                    max="500000"
                    step="1000"
                    inputmode="numeric"
                    placeholder="25000"
                    @input="onCustomAmountInput"
                    @focus="scrollFieldIntoView"
                  >
                  <p v-if="voucherAmountError" class="gift-m-error" role="alert">{{ voucherAmountError }}</p>
                </div>
              </template>
            </section>

            <!-- Step 2: recipient -->
            <section v-show="step === 2" class="gift-m-step" aria-label="Получатель">
              <h2 class="gift-m-heading">Кому подарок</h2>
              <p class="gift-m-lead">Укажите имя и контакт для отправки кода — достаточно одного способа связи.</p>

              <div class="gift-m-field">
                <label for="gift-m-recipient-name">
                  Имя получателя <span class="req">*</span>
                </label>
                <input
                  id="gift-m-recipient-name"
                  :value="form.recipientName"
                  type="text"
                  autocomplete="name"
                  placeholder="Маленькому Мише"
                  :aria-invalid="!!fieldErrors.recipientName"
                  :aria-describedby="fieldErrors.recipientName ? 'gift-m-recipient-name-err' : undefined"
                  @input="onFormInput('recipientName', ($event.target as HTMLInputElement).value)"
                  @focus="scrollFieldIntoView"
                >
                <p
                  v-if="fieldErrors.recipientName"
                  id="gift-m-recipient-name-err"
                  class="gift-m-error"
                  role="alert"
                >
                  {{ fieldErrors.recipientName }}
                </p>
              </div>

              <div class="gift-m-contact-toggle" role="tablist" aria-label="Способ связи">
                <button
                  type="button"
                  role="tab"
                  :aria-selected="contactChannel === 'email'"
                  class="gift-m-contact-tab"
                  :class="{ active: contactChannel === 'email' }"
                  @click="contactChannel = 'email'"
                >
                  Email
                </button>
                <button
                  type="button"
                  role="tab"
                  :aria-selected="contactChannel === 'phone'"
                  class="gift-m-contact-tab"
                  :class="{ active: contactChannel === 'phone' }"
                  @click="contactChannel = 'phone'"
                >
                  Телефон
                </button>
              </div>

              <div v-if="contactChannel === 'email'" class="gift-m-field">
                <label for="gift-m-recipient-email">Email для отправки кода</label>
                <input
                  id="gift-m-recipient-email"
                  :value="form.recipientEmail"
                  type="email"
                  autocomplete="email"
                  inputmode="email"
                  placeholder="parents@example.com"
                  :aria-invalid="!!fieldErrors.recipientEmail"
                  :aria-describedby="fieldErrors.recipientEmail ? 'gift-m-recipient-email-err' : undefined"
                  @input="onFormInput('recipientEmail', ($event.target as HTMLInputElement).value)"
                  @focus="scrollFieldIntoView"
                >
                <p
                  v-if="fieldErrors.recipientEmail"
                  id="gift-m-recipient-email-err"
                  class="gift-m-error"
                  role="alert"
                >
                  {{ fieldErrors.recipientEmail }}
                </p>
              </div>

              <div v-else class="gift-m-field">
                <label for="gift-m-recipient-phone">Телефон для отправки кода</label>
                <input
                  id="gift-m-recipient-phone"
                  :value="form.recipientPhone"
                  type="tel"
                  autocomplete="tel"
                  inputmode="tel"
                  maxlength="18"
                  placeholder="+7 (701) 000-00-00"
                  :aria-invalid="!!fieldErrors.recipientPhone"
                  :aria-describedby="phoneDescribedBy"
                  @input="onPhoneInput"
                  @paste="onPhonePaste"
                  @focus="scrollFieldIntoView"
                >
                <p
                  v-if="fieldErrors.recipientPhone"
                  id="gift-m-recipient-phone-err"
                  class="gift-m-error"
                  role="alert"
                >
                  {{ fieldErrors.recipientPhone }}
                </p>
                <small v-if="activationPolicyNote" id="gift-m-activation-note" class="gift-m-hint">
                  {{ activationPolicyNote }}
                </small>
              </div>

              <small
                v-if="contactChannel === 'email' && activationPolicyNote"
                class="gift-m-hint gift-m-hint-block"
              >
                {{ activationPolicyNote }}
              </small>

              <button
                type="button"
                class="gift-m-accordion-btn"
                :aria-expanded="greetingOpen"
                aria-controls="gift-m-greeting-panel"
                @click="greetingOpen = !greetingOpen"
              >
                <span>{{ greetingOpen ? 'Скрыть поздравление' : 'Добавить поздравление' }}</span>
                <span aria-hidden="true">{{ greetingOpen ? '−' : '+' }}</span>
              </button>

              <div
                v-show="greetingOpen"
                id="gift-m-greeting-panel"
                class="gift-m-greeting"
              >
                <div class="gift-m-field">
                  <label for="gift-m-sender">От кого</label>
                  <input
                    id="gift-m-sender"
                    :value="form.senderName"
                    type="text"
                    placeholder="От любящих крестных"
                    @input="onFormInput('senderName', ($event.target as HTMLInputElement).value)"
                    @focus="scrollFieldIntoView"
                  >
                </div>
                <div class="gift-m-field">
                  <label for="gift-m-message">Текст поздравления</label>
                  <textarea
                    id="gift-m-message"
                    :value="form.message"
                    rows="3"
                    maxlength="1000"
                    placeholder="Расти здоровым, любознательным и счастливым!"
                    @input="onFormInput('message', ($event.target as HTMLTextAreaElement).value)"
                    @focus="scrollFieldIntoView"
                  />
                </div>
              </div>
            </section>

            <!-- Step 3: review -->
            <section v-show="step === 3" class="gift-m-step" aria-label="Проверка">
              <h2 class="gift-m-heading">Проверьте заказ</h2>
              <p class="gift-m-lead">Если что-то не так — вернитесь к нужному шагу и поправьте.</p>

              <div class="gift-m-review-card">
                <div class="gift-m-review-head">
                  <strong>{{ kind === 'subscription' ? 'Подарочная подписка' : 'Денежный сертификат' }}</strong>
                  <button type="button" class="gift-m-edit-link" @click="goToStep(1)">Изменить</button>
                </div>
                <p v-if="kind === 'subscription'" class="gift-m-review-line">
                  {{ currentDurationLabel }} · {{ selectedPlanLabel }}
                </p>
                <p v-else class="gift-m-review-line">
                  Номинал {{ formatPrice(totalAmount) }} ₸
                </p>
              </div>

              <div class="gift-m-review-card">
                <div class="gift-m-review-head">
                  <strong>Получатель</strong>
                  <button type="button" class="gift-m-edit-link" @click="goToStep(2)">Изменить</button>
                </div>
                <p class="gift-m-review-line">{{ form.recipientName || '—' }}</p>
                <p v-if="reviewContact" class="gift-m-review-line muted">{{ reviewContact }}</p>
                <p v-if="form.senderName" class="gift-m-review-line muted">От: {{ form.senderName }}</p>
              </div>

              <div class="gift-m-review-card">
                <div class="gift-m-review-head">
                  <strong>Итого</strong>
                </div>
                <p class="gift-m-review-total">
                  <template v-if="kind === 'subscription' && isLoadingQuote">Расчёт…</template>
                  <template v-else>{{ formatPrice(totalAmount) }} ₸</template>
                </p>
                <p v-if="kind === 'subscription' && quoteError" class="gift-m-error" role="alert">{{ quoteError }}</p>
                <p v-if="kind === 'voucher' && voucherAmountError" class="gift-m-error" role="alert">{{ voucherAmountError }}</p>
              </div>

              <button
                type="button"
                class="gift-m-accordion-btn"
                :aria-expanded="cardPreviewOpen"
                aria-controls="gift-m-card-preview"
                @click="cardPreviewOpen = !cardPreviewOpen"
              >
                <span>{{ cardPreviewOpen ? 'Скрыть открытку' : 'Посмотреть открытку' }}</span>
                <span aria-hidden="true">{{ cardPreviewOpen ? '−' : '+' }}</span>
              </button>

              <div
                v-show="cardPreviewOpen"
                id="gift-m-card-preview"
                class="gift-m-card-preview"
              >
                <div class="gift-m-card-preview-inner">
                  <div class="gift-m-card-top">
                    <AppLogo size="sm" />
                    <span>{{ kind === 'subscription' ? 'GIFT SUBSCRIPTION' : 'GIFT VOUCHER' }}</span>
                  </div>
                  <p class="gift-m-card-to">Для: {{ form.recipientName || 'Любимого ребёнка' }}</p>
                  <p class="gift-m-card-detail">
                    <template v-if="kind === 'subscription'">
                      {{ currentDurationLabel }} · {{ selectedPlanLabel }}
                    </template>
                    <template v-else>
                      Номинал {{ formatPrice(totalAmount) }} ₸
                    </template>
                  </p>
                  <p class="gift-m-card-msg">
                    «{{ form.message || defaultMessage }}»
                  </p>
                  <p class="gift-m-card-from">С любовью, {{ form.senderName || 'Ваши близкие' }}</p>
                </div>
              </div>

              <p v-if="submitError" class="gift-m-error" role="alert">{{ submitError }}</p>
            </section>
          </div>

          <footer class="gift-m-footer">
            <div class="gift-m-footer-price">
              <span>Итого</span>
              <strong>
                <template v-if="kind === 'subscription' && isLoadingQuote">Расчёт…</template>
                <template v-else>{{ formatPrice(totalAmount) }} ₸</template>
              </strong>
            </div>
            <button
              type="button"
              class="gift-m-primary"
              :disabled="primaryDisabled"
              :aria-busy="isSubmitting || (kind === 'subscription' && isLoadingQuote)"
              @click="onPrimary"
            >
              {{ primaryLabel }}
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
type GiftKind = 'subscription' | 'voucher'
type ContactChannel = 'email' | 'phone'

export type GiftMobileForm = {
  recipientName: string
  senderName: string
  recipientEmail: string
  recipientPhone: string
  message: string
}

type DurationItem = {
  id: string
  months: string
  title: string
  badge?: string | null
}

type PlanItem = {
  slug: string
  name: string
  badge?: string | null
  toys_count: number
  price_monthly: number
}

const props = withDefaults(defineProps<{
  open: boolean
  kind: GiftKind
  step: number
  form: GiftMobileForm
  durations: DurationItem[]
  selectedDuration: string
  subscriptionPlans: PlanItem[]
  selectedTier: string
  isLoadingPlans?: boolean
  selectedPlanLabel: string
  currentDurationLabel: string
  isLoadingQuote?: boolean
  quoteError?: string
  calculatedPrice: number
  voucherPresets: number[]
  voucherAmountMode: 'preset' | 'custom'
  voucherPreset: number
  voucherCustomAmount: number
  voucherAmountError?: string
  voucherAmount: number
  activationPolicyNote?: string
  isSubmitting?: boolean
  submitError?: string
  formatPrice: (val: number) => string
}>(), {
  isLoadingPlans: false,
  isLoadingQuote: false,
  quoteError: '',
  voucherAmountError: '',
  activationPolicyNote: '',
  isSubmitting: false,
  submitError: '',
})

const emit = defineEmits<{
  close: []
  'update:step': [step: number]
  'update:selectedDuration': [id: string]
  'update:selectedTier': [slug: string]
  'update:form': [form: GiftMobileForm]
  'update:voucherAmountMode': [mode: 'preset' | 'custom']
  'update:voucherCustomAmount': [amount: number]
  'select-voucher-preset': [amount: number]
  pay: []
  'phone-input': [event: Event]
  'phone-paste': [event: ClipboardEvent]
  'request-step': [step: number]
}>()

const titleId = 'gift-m-sheet-title'
const panelRef = ref<HTMLElement | null>(null)
const closeBtnRef = ref<HTMLButtonElement | null>(null)
const bodyRef = ref<HTMLElement | null>(null)
const lockedScrollY = ref(0)
const wasOpen = ref(false)
const contactChannel = ref<ContactChannel>('email')
const greetingOpen = ref(false)
const cardPreviewOpen = ref(false)
const fieldErrors = reactive<{
  recipientName?: string
  recipientEmail?: string
  recipientPhone?: string
}>({})
const viewportOffset = ref(0)

const overlayStyle = computed(() => (
  viewportOffset.value > 0
    ? { paddingBottom: `${viewportOffset.value}px` }
    : undefined
))

const step = computed({
  get: () => props.step,
  set: (v: number) => emit('update:step', v),
})

const totalAmount = computed(() => (
  props.kind === 'subscription' ? props.calculatedPrice : props.voucherAmount
))

const defaultMessage = computed(() => (
  props.kind === 'subscription'
    ? 'Расти здоровым, любознательным и счастливым!'
    : 'С днём рождения! Пусть этот сертификат порадует вас в магазине Alpha.'
))

const reviewContact = computed(() => {
  const email = props.form.recipientEmail?.trim()
  const phone = props.form.recipientPhone?.trim()
  if (contactChannel.value === 'email') return email || phone || ''
  return phone || email || ''
})

const phoneDescribedBy = computed(() => {
  const ids: string[] = []
  if (fieldErrors.recipientPhone) ids.push('gift-m-recipient-phone-err')
  if (props.activationPolicyNote) ids.push('gift-m-activation-note')
  return ids.length ? ids.join(' ') : undefined
})

const primaryDisabled = computed(() => {
  if (props.isSubmitting) return true
  if (step.value < 3) return false
  if (props.kind === 'subscription') {
    return props.isLoadingQuote || !props.calculatedPrice || !!props.quoteError
  }
  return !!props.voucherAmountError || !props.voucherAmount
})

const primaryLabel = computed(() => {
  if (step.value < 3) return 'Продолжить'
  if (props.isSubmitting) return 'Оформляем…'
  if (props.kind === 'subscription' && props.isLoadingQuote) return 'Расчёт…'
  return `Оформить и подарить за ${props.formatPrice(totalAmount.value)} ₸`
})

const toysWord = (count: number) => {
  const n = Math.abs(Number(count) || 0) % 100
  const n1 = n % 10
  if (n > 10 && n < 20) return 'игрушек'
  if (n1 === 1) return 'игрушка'
  if (n1 >= 2 && n1 <= 4) return 'игрушки'
  return 'игрушек'
}

const durationShortLabel = (d: DurationItem) => {
  if (d.id === '1m') return '1 мес'
  if (d.id === '3m') return '3 мес'
  if (d.id === '6m') return '6 мес'
  if (d.id === '12m') return '12 мес'
  return d.months
}

const clearFieldErrors = () => {
  fieldErrors.recipientName = undefined
  fieldErrors.recipientEmail = undefined
  fieldErrors.recipientPhone = undefined
}

const onFormInput = (key: keyof GiftMobileForm, value: string) => {
  if (key === 'recipientName' && fieldErrors.recipientName) fieldErrors.recipientName = undefined
  if (key === 'recipientEmail' && fieldErrors.recipientEmail) fieldErrors.recipientEmail = undefined
  emit('update:form', { ...props.form, [key]: value })
}

const onCustomAmountInput = (event: Event) => {
  const raw = (event.target as HTMLInputElement).value
  emit('update:voucherCustomAmount', Number(raw) || 0)
}

const onPhoneInput = (event: Event) => emit('phone-input', event)
const onPhonePaste = (event: ClipboardEvent) => emit('phone-paste', event)

const goToStep = (next: number) => {
  clearFieldErrors()
  emit('update:step', next)
  emit('request-step', next)
  nextTick(() => {
    bodyRef.value?.scrollTo({ top: 0 })
  })
}

const goBack = () => {
  if (step.value <= 1) return
  goToStep(step.value - 1)
}

const validateStep1 = () => {
  if (props.kind === 'subscription') {
    if (!props.selectedTier) return false
    if (props.quoteError) return false
    return true
  }
  if (props.voucherAmountError) return false
  return true
}

const validateStep2 = () => {
  clearFieldErrors()
  let ok = true
  if (!props.form.recipientName.trim()) {
    fieldErrors.recipientName = 'Укажите имя получателя'
    ok = false
  }
  if (contactChannel.value === 'email') {
    const email = props.form.recipientEmail.trim()
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      fieldErrors.recipientEmail = 'Проверьте формат email'
      ok = false
    }
  }
  return ok
}

const onPrimary = () => {
  if (props.isSubmitting) return
  if (step.value === 1) {
    if (!validateStep1()) return
    goToStep(2)
    return
  }
  if (step.value === 2) {
    if (!validateStep2()) return
    goToStep(3)
    return
  }
  if (primaryDisabled.value) return
  emit('pay')
}

const close = () => emit('close')

const focusables = () => {
  if (!panelRef.value) return [] as HTMLElement[]
  return Array.from(
    panelRef.value.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null)
}

const onPanelKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    e.preventDefault()
    close()
    return
  }
  if (e.key !== 'Tab' || !panelRef.value) return
  const nodes = focusables()
  if (!nodes.length) return
  const first = nodes[0]
  const last = nodes[nodes.length - 1]
  const active = document.activeElement as HTMLElement | null
  if (e.shiftKey && active === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && active === last) {
    e.preventDefault()
    first.focus()
  }
}

const scrollFieldIntoView = (event: FocusEvent) => {
  const el = event.target as HTMLElement | null
  if (!el || !bodyRef.value) return
  window.setTimeout(() => {
    el.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, 120)
}

const lockPageScroll = () => {
  if (!import.meta.client) return
  lockedScrollY.value = window.scrollY || window.pageYOffset || 0
  const body = document.body
  body.style.position = 'fixed'
  body.style.top = `-${lockedScrollY.value}px`
  body.style.left = '0'
  body.style.right = '0'
  body.style.width = '100%'
  body.style.overflow = 'hidden'
}

const unlockPageScroll = () => {
  if (!import.meta.client) return
  const body = document.body
  const y = lockedScrollY.value
  body.style.position = ''
  body.style.top = ''
  body.style.left = ''
  body.style.right = ''
  body.style.width = ''
  body.style.overflow = ''
  window.scrollTo(0, y)
}

const syncViewportInset = () => {
  if (!import.meta.client || !window.visualViewport) {
    viewportOffset.value = 0
    return
  }
  const vv = window.visualViewport
  const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
  viewportOffset.value = inset > 40 ? inset : 0
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.open) {
    e.preventDefault()
    close()
  }
}

watch(
  () => props.open,
  async (isOpen) => {
    if (!import.meta.client) return
    if (isOpen) {
      wasOpen.value = true
      lockPageScroll()
      syncViewportInset()
      await nextTick()
      closeBtnRef.value?.focus()
      return
    }
    if (wasOpen.value) {
      unlockPageScroll()
      wasOpen.value = false
      viewportOffset.value = 0
    }
  },
)

watch(
  () => props.step,
  () => {
    clearFieldErrors()
    nextTick(() => bodyRef.value?.scrollTo({ top: 0 }))
  },
)

/** Parent can force a step after API error */
watch(
  () => props.submitError,
  (err) => {
    if (!err || !props.open) return
    // Keep user on review unless parent moved step; field-level mapping is parent's job.
  },
)

onMounted(() => {
  if (!import.meta.client) return
  document.addEventListener('keydown', onKeydown)
  window.visualViewport?.addEventListener('resize', syncViewportInset)
  window.visualViewport?.addEventListener('scroll', syncViewportInset)
})

onUnmounted(() => {
  if (!import.meta.client) return
  document.removeEventListener('keydown', onKeydown)
  window.visualViewport?.removeEventListener('resize', syncViewportInset)
  window.visualViewport?.removeEventListener('scroll', syncViewportInset)
  if (wasOpen.value || props.open) unlockPageScroll()
})

defineExpose({
  goToStep,
  contactChannel,
})
</script>

<style scoped>
.gift-m-overlay {
  position: fixed;
  inset: 0;
  z-index: 10060;
  background: rgba(26, 26, 46, 0.45);
  display: flex;
  align-items: stretch;
  justify-content: center;
}

.gift-m-panel {
  width: 100%;
  max-width: 480px;
  height: 100%;
  height: 100dvh;
  max-height: 100%;
  max-height: 100dvh;
  background: var(--ivory, #faf8f4);
  display: flex;
  flex-direction: column;
  outline: none;
  padding-top: env(safe-area-inset-top, 0);
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.gift-m-header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  flex-shrink: 0;
}

.gift-m-header-btn {
  justify-self: start;
  border: none;
  background: transparent;
  color: var(--green-ink, #233428);
  font-family: 'Manrope', sans-serif;
  font-size: 14px;
  font-weight: 700;
  padding: 8px 4px;
  cursor: pointer;
}

.gift-m-header-btn:disabled {
  opacity: 0.35;
  cursor: default;
}

.gift-m-step-label {
  margin: 0;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  color: #6f746f;
}

.gift-m-close {
  justify-self: end;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 12px;
  background: rgba(35, 52, 40, 0.06);
  color: var(--green-ink, #233428);
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
}

.gift-m-progress {
  height: 3px;
  background: rgba(35, 52, 40, 0.08);
  flex-shrink: 0;
}

.gift-m-progress-bar {
  height: 100%;
  background: var(--green-surface, #a8bfa8);
  transition: width 0.2s ease;
}

.gift-m-body {
  flex: 1 1 auto;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 16px 16px 12px;
  overscroll-behavior: contain;
}

.gift-m-step {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.gift-m-heading {
  margin: 0;
  font-family: 'Manrope', sans-serif;
  font-size: 1.25rem;
  font-weight: 800;
  color: #262626;
  line-height: 1.25;
}

.gift-m-lead {
  margin: 0;
  font-size: 14px;
  line-height: 1.45;
  color: #6f746f;
}

.gift-m-field-label {
  margin: 8px 0 0;
  font-size: 13px;
  font-weight: 800;
  color: #262626;
}

.gift-m-duration-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
}

.gift-m-duration-btn {
  min-height: 44px;
  border: 1.5px solid #e3d7c6;
  border-radius: 12px;
  background: #fff;
  font-family: 'Manrope', sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: #262626;
  cursor: pointer;
  padding: 8px 4px;
}

.gift-m-duration-btn.active {
  border-color: var(--green-ink, #233428);
  background: var(--soft-sage-mist, #edf0ea);
  color: var(--green-ink, #233428);
}

.gift-m-tier-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.gift-m-tier-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  text-align: left;
  border: 1.5px solid #e3d7c6;
  border-radius: 14px;
  background: #fff;
  padding: 12px;
  cursor: pointer;
  font-family: 'Manrope', sans-serif;
}

.gift-m-tier-row.active {
  border-color: var(--green-surface, #a8bfa8);
  background: rgba(168, 191, 168, 0.28);
}

.gift-m-radio {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid #b8b2a6;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.gift-m-tier-row.active .gift-m-radio {
  border-color: var(--green-ink, #233428);
}

.gift-m-radio-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--green-ink, #233428);
}

.gift-m-tier-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.gift-m-tier-text strong {
  font-size: 14px;
  color: #262626;
}

.gift-m-tier-text span {
  font-size: 12px;
  color: #6f746f;
}

.gift-m-amount-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.gift-m-amount-btn {
  min-height: 48px;
  border: 1.5px solid #e3d7c6;
  border-radius: 12px;
  background: #fff;
  font-family: 'Manrope', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #262626;
  cursor: pointer;
}

.gift-m-amount-btn.active {
  border-color: var(--green-ink, #233428);
  background: rgba(168, 191, 168, 0.28);
  color: var(--green-ink, #233428);
}

.gift-m-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.gift-m-field label {
  font-size: 13px;
  font-weight: 700;
  color: #262626;
}

.gift-m-field input,
.gift-m-field textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1.5px solid #e3d7c6;
  border-radius: 12px;
  padding: 12px 14px;
  font-family: 'Manrope', sans-serif;
  font-size: 16px;
  background: #fff;
  color: #262626;
}

.gift-m-field textarea {
  resize: vertical;
  min-height: 88px;
}

.req {
  color: #af5353;
}

.gift-m-error {
  margin: 0;
  font-size: 12.5px;
  color: #af5353;
  line-height: 1.35;
}

.gift-m-hint {
  display: block;
  margin: 0;
  font-size: 12px;
  color: #6f746f;
  line-height: 1.4;
}

.gift-m-hint-block {
  margin-top: -4px;
}

.gift-m-contact-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  padding: 4px;
  border-radius: 12px;
  background: rgba(35, 52, 40, 0.06);
}

.gift-m-contact-tab {
  border: none;
  border-radius: 10px;
  min-height: 40px;
  background: transparent;
  font-family: 'Manrope', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #6f746f;
  cursor: pointer;
}

.gift-m-contact-tab.active {
  background: #fff;
  color: var(--green-ink, #233428);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.gift-m-accordion-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border: 1px dashed #d4cbbd;
  border-radius: 12px;
  background: transparent;
  padding: 12px 14px;
  font-family: 'Manrope', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: var(--green-ink, #233428);
  cursor: pointer;
}

.gift-m-greeting {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.gift-m-review-card {
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 14px;
  padding: 14px;
}

.gift-m-review-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.gift-m-review-head strong {
  font-size: 14px;
  color: #262626;
}

.gift-m-edit-link {
  border: none;
  background: transparent;
  color: var(--alpha-green, #536b59);
  font-family: 'Manrope', sans-serif;
  font-size: 13px;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
  padding: 4px;
}

.gift-m-review-line {
  margin: 0;
  font-size: 13.5px;
  color: #262626;
  line-height: 1.4;
}

.gift-m-review-line.muted {
  color: #6f746f;
  margin-top: 4px;
}

.gift-m-review-total {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--green-ink, #233428);
}

.gift-m-card-preview {
  border-radius: 14px;
  overflow: hidden;
}

.gift-m-card-preview-inner {
  background: linear-gradient(135deg, #faf8f4 0%, #d9e0d5 100%);
  border: 1.5px dashed var(--green-ink, #233428);
  border-radius: 14px;
  padding: 16px;
}

.gift-m-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: var(--green-ink, #233428);
}

.gift-m-card-to,
.gift-m-card-detail,
.gift-m-card-msg,
.gift-m-card-from {
  margin: 0 0 8px;
  font-size: 13px;
  line-height: 1.4;
  color: #262626;
}

.gift-m-card-msg {
  font-style: italic;
  color: #455c4b;
}

.gift-m-footer {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0));
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  background: #fff;
}

.gift-m-footer-price {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  font-size: 13px;
  color: #6f746f;
}

.gift-m-footer-price strong {
  font-size: 1.15rem;
  color: var(--green-ink, #233428);
}

.gift-m-primary {
  width: 100%;
  min-height: 48px;
  border: none;
  border-radius: 14px;
  background: var(--green-surface, #a8bfa8);
  color: var(--green-ink, #233428);
  font-family: 'Manrope', sans-serif;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
}

.gift-m-primary:disabled {
  opacity: 0.55;
  cursor: default;
}

.gift-m-sheet-enter-active,
.gift-m-sheet-leave-active {
  transition: opacity 0.2s ease;
}

.gift-m-sheet-enter-active .gift-m-panel,
.gift-m-sheet-leave-active .gift-m-panel {
  transition: transform 0.22s ease;
}

.gift-m-sheet-enter-from,
.gift-m-sheet-leave-to {
  opacity: 0;
}

.gift-m-sheet-enter-from .gift-m-panel,
.gift-m-sheet-leave-to .gift-m-panel {
  transform: translateY(12px);
}

@media (min-width: 769px) {
  .gift-m-overlay {
    display: none !important;
  }
}
</style>
