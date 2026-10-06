<template>
  <Teleport to="body">
    <Transition name="sub-m-sheet">
      <div
        v-if="open"
        class="sub-m-overlay"
        role="presentation"
        :style="overlayStyle"
        @click.self="close"
      >
        <div
          ref="panelRef"
          class="sub-m-panel"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          tabindex="-1"
          @keydown="onPanelKeydown"
        >
          <header class="sub-m-header">
            <button
              type="button"
              class="sub-m-header-btn"
              :disabled="step <= 1"
              :aria-label="step > 1 ? 'Назад к предыдущему шагу' : 'Назад'"
              @click="goBack"
            >
              ← Назад
            </button>
            <div class="sub-m-header-center">
              <p :id="titleId" class="sub-m-step-name">{{ stepTitle }}</p>
              <p class="sub-m-step-count" aria-live="polite">{{ step }} из 3</p>
            </div>
            <button
              ref="closeBtnRef"
              type="button"
              class="sub-m-close"
              aria-label="Закрыть оформление подписки"
              @click="close"
            >
              ×
            </button>
          </header>

          <div class="sub-m-progress" aria-hidden="true">
            <div class="sub-m-progress-bar" :style="{ width: `${(step / 3) * 100}%` }" />
          </div>

          <div class="sub-m-plan-chip" aria-label="Выбранная подписка">
            <strong>{{ planName }}</strong>
            <span>{{ billingCycleLabel }} · {{ formatPrice(totalAmount) }} ₸</span>
          </div>

          <div ref="bodyRef" class="sub-m-body">
            <!-- Step 1: child -->
            <section v-show="step === 1" class="sub-m-step" aria-label="Ребёнок">
              <h2 class="sub-m-heading">Для кого подписка</h2>
              <p class="sub-m-lead">Выберите профиль ребёнка или добавьте нового — возраст нужен для подбора игрушек.</p>

              <div v-if="isLoadingChildren" class="sub-m-loading">Загружаем профили детей…</div>

              <template v-else-if="childMode === 'select' && children.length > 0">
                <div class="sub-m-choice-list" role="radiogroup" aria-label="Профиль ребёнка">
                  <button
                    v-for="child in children"
                    :key="child.id"
                    type="button"
                    class="sub-m-choice-row"
                    :class="{
                      active: selectedChildId === child.id,
                      disabled: child.hasActiveSubscription,
                    }"
                    role="radio"
                    :aria-checked="selectedChildId === child.id"
                    :disabled="child.hasActiveSubscription"
                    @click="emit('select-child', child.id)"
                  >
                    <span class="sub-m-radio" aria-hidden="true">
                      <span v-if="selectedChildId === child.id" class="sub-m-radio-dot" />
                    </span>
                    <span class="sub-m-choice-text">
                      <strong>{{ child.name }} {{ child.last_name }}</strong>
                      <span>{{ formatChildAge(child) }}</span>
                    </span>
                    <span v-if="child.hasActiveSubscription" class="sub-m-badge">Уже есть подписка</span>
                  </button>
                </div>

                <button type="button" class="sub-m-text-link" @click="emit('switch-to-create')">
                  + Добавить ребёнка
                </button>

                <div
                  v-if="selectedChildNeedsLastName"
                  class="sub-m-field"
                >
                  <label for="sub-m-existing-last-name">Фамилия ребёнка <span class="req">*</span></label>
                  <input
                    id="sub-m-existing-last-name"
                    :value="childLastName"
                    type="text"
                    maxlength="255"
                    placeholder="Укажите фамилию ребёнка"
                    :aria-invalid="!!fieldErrors.childLastName"
                    @input="onChildLastNameInput"
                    @focus="scrollFieldIntoView"
                  >
                  <p v-if="fieldErrors.childLastName" class="sub-m-error" role="alert">
                    {{ fieldErrors.childLastName }}
                  </p>
                </div>
              </template>

              <template v-else>
                <button
                  v-if="children.length > 0"
                  type="button"
                  class="sub-m-text-link"
                  @click="emit('switch-to-select')"
                >
                  ← Выбрать из списка детей
                </button>
                <p v-else class="sub-m-hint">
                  Профилей детей пока нет — создадим новый для подбора игрушек по возрасту.
                </p>

                <div class="sub-m-field">
                  <label for="sub-m-child-name">Имя ребёнка <span class="req">*</span></label>
                  <input
                    id="sub-m-child-name"
                    :value="childName"
                    type="text"
                    placeholder="Например: Миша"
                    :aria-invalid="!!fieldErrors.childName"
                    @input="onChildNameInput"
                    @focus="scrollFieldIntoView"
                  >
                  <p v-if="fieldErrors.childName" class="sub-m-error" role="alert">{{ fieldErrors.childName }}</p>
                </div>
                <div class="sub-m-field">
                  <label for="sub-m-child-last-name">Фамилия ребёнка <span class="req">*</span></label>
                  <input
                    id="sub-m-child-last-name"
                    :value="childLastName"
                    type="text"
                    maxlength="255"
                    placeholder="Например: Смирнов"
                    :aria-invalid="!!fieldErrors.childLastName"
                    @input="onChildLastNameInput"
                    @focus="scrollFieldIntoView"
                  >
                  <p v-if="fieldErrors.childLastName" class="sub-m-error" role="alert">
                    {{ fieldErrors.childLastName }}
                  </p>
                </div>
                <div class="sub-m-field">
                  <label for="sub-m-child-birth">Дата рождения ребёнка <span class="req">*</span></label>
                  <input
                    id="sub-m-child-birth"
                    :value="childBirthDate"
                    type="date"
                    :max="maxBirthDate"
                    :aria-invalid="!!fieldErrors.childBirthDate"
                    @input="onChildBirthInput"
                    @focus="scrollFieldIntoView"
                  >
                  <p class="sub-m-hint">Нужна методисту для подбора развивающих игрушек по возрасту.</p>
                  <p v-if="fieldErrors.childBirthDate" class="sub-m-error" role="alert">
                    {{ fieldErrors.childBirthDate }}
                  </p>
                </div>
              </template>
            </section>

            <!-- Step 2: delivery -->
            <section v-show="step === 2" class="sub-m-step" aria-label="Доставка">
              <h2 class="sub-m-heading">Куда доставить</h2>
              <p class="sub-m-lead">Выберите сохранённый адрес или укажите новый. Телефон курьера — ниже.</p>

              <div v-if="isLoadingAddresses" class="sub-m-loading">Загружаем сохранённые адреса…</div>

              <template v-else>
                <div v-if="addresses.length" class="sub-m-choice-list" role="radiogroup" aria-label="Адрес доставки">
                  <button
                    v-for="addr in addresses"
                    :key="addr.id"
                    type="button"
                    class="sub-m-choice-row compact"
                    :class="{ active: selectedAddressKey === String(addr.id) }"
                    role="radio"
                    :aria-checked="selectedAddressKey === String(addr.id)"
                    @click="emit('update:selectedAddressKey', String(addr.id))"
                  >
                    <span class="sub-m-radio" aria-hidden="true">
                      <span v-if="selectedAddressKey === String(addr.id)" class="sub-m-radio-dot" />
                    </span>
                    <span class="sub-m-choice-text">
                      <strong>
                        {{ addr.label || 'Адрес' }}
                        <span v-if="addr.is_default" class="sub-m-badge soft">Основной</span>
                      </strong>
                      <span>{{ formatAddress(addr) }}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    class="sub-m-choice-row compact"
                    :class="{ active: selectedAddressKey === 'new' }"
                    role="radio"
                    :aria-checked="selectedAddressKey === 'new'"
                    @click="emit('update:selectedAddressKey', 'new')"
                  >
                    <span class="sub-m-radio" aria-hidden="true">
                      <span v-if="selectedAddressKey === 'new'" class="sub-m-radio-dot" />
                    </span>
                    <span class="sub-m-choice-text">
                      <strong>Другой адрес</strong>
                      <span>Указать новый адрес доставки</span>
                    </span>
                  </button>
                </div>

                <template v-if="showAddressFields">
                  <div class="sub-m-field">
                    <label for="sub-m-city">Город <span class="req">*</span></label>
                    <select
                      id="sub-m-city"
                      :value="addressForm.city"
                      @change="onAddressCityChange"
                      @focus="scrollFieldIntoView"
                    >
                      <option value="Алматы">Алматы</option>
                      <option value="Астана">Астана</option>
                      <option value="Шымкент">Шымкент</option>
                      <option value="Караганда">Караганда</option>
                      <option value="Актобе">Актобе</option>
                    </select>
                  </div>
                  <div class="sub-m-field">
                    <label for="sub-m-street">Улица, дом <span class="req">*</span></label>
                    <input
                      id="sub-m-street"
                      :value="addressForm.street"
                      type="text"
                      placeholder="пр. Абая, 150"
                      :aria-invalid="!!fieldErrors.street"
                      @input="onAddressStreetInput"
                      @focus="scrollFieldIntoView"
                    >
                    <p v-if="fieldErrors.street" class="sub-m-error" role="alert">{{ fieldErrors.street }}</p>
                  </div>
                  <div class="sub-m-field">
                    <label for="sub-m-apartment">Кв. / офис</label>
                    <input
                      id="sub-m-apartment"
                      :value="addressForm.apartment"
                      type="text"
                      placeholder="42"
                      @input="onAddressApartmentInput"
                      @focus="scrollFieldIntoView"
                    >
                  </div>
                </template>
                <p v-else-if="!addresses.length" class="sub-m-hint">
                  Укажите город и улицу с номером дома — без адреса подписку оформить нельзя.
                </p>
              </template>

              <div class="sub-m-field">
                <label for="sub-m-phone">Телефон для доставки <span class="req">*</span></label>
                <input
                  id="sub-m-phone"
                  :value="phone"
                  type="tel"
                  inputmode="tel"
                  autocomplete="tel"
                  maxlength="18"
                  placeholder="+7 (701) 000-00-00"
                  :aria-invalid="!!fieldErrors.phone"
                  @input="onPhoneInput"
                  @paste="onPhonePaste"
                  @focus="scrollFieldIntoView"
                >
                <p v-if="fieldErrors.phone" class="sub-m-error" role="alert">{{ fieldErrors.phone }}</p>
                <p v-else class="sub-m-hint">Курьер свяжется по этому номеру.</p>
              </div>
            </section>

            <!-- Step 3: review & pay -->
            <section v-show="step === 3" class="sub-m-step" aria-label="Проверка и оплата">
              <h2 class="sub-m-heading">Проверьте заказ</h2>
              <p class="sub-m-lead">Если что-то не так — нажмите «Изменить» у нужного раздела.</p>

              <div class="sub-m-review-card">
                <div class="sub-m-review-head">
                  <strong>Тариф и срок</strong>
                </div>
                <p class="sub-m-review-line">{{ planName }} · {{ billingCycleLabel }}</p>
                <p class="sub-m-review-total">{{ formatPrice(totalAmount) }} ₸</p>
              </div>

              <div class="sub-m-review-card">
                <div class="sub-m-review-head">
                  <strong>Ребёнок</strong>
                  <button type="button" class="sub-m-edit-link" @click="goToStep(1)">Изменить</button>
                </div>
                <p class="sub-m-review-line">{{ reviewChildLabel }}</p>
              </div>

              <div class="sub-m-review-card">
                <div class="sub-m-review-head">
                  <strong>Доставка</strong>
                  <button type="button" class="sub-m-edit-link" @click="goToStep(2)">Изменить</button>
                </div>
                <p class="sub-m-review-line">{{ reviewAddressLabel }}</p>
                <p v-if="phone" class="sub-m-review-line muted">{{ phone }}</p>
              </div>

              <div class="sub-m-pay-row" role="group" aria-label="Способ оплаты">
                <span class="sub-m-pay-icon" aria-hidden="true">
                  <AppIcon name="credit-card" :size="18" />
                </span>
                <span class="sub-m-pay-text">
                  <strong>Банковская карта · Halyk ePay</strong>
                </span>
              </div>

              <p v-if="submitError" class="sub-m-error" role="alert">{{ submitError }}</p>
            </section>
          </div>

          <footer class="sub-m-footer">
            <div class="sub-m-footer-price">
              <span>К оплате</span>
              <strong>{{ formatPrice(totalAmount) }} ₸</strong>
            </div>
            <button
              type="button"
              class="sub-m-primary"
              :disabled="primaryDisabled"
              :aria-busy="isSubmitting"
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
export type CheckoutChildOption = {
  id: number
  name: string
  last_name?: string
  birth_date?: string
  age_in_months?: number
  hasActiveSubscription: boolean
}

export type CheckoutAddressOption = {
  id: number
  label: string
  city: string
  street: string
  building: string
  apartment?: string | null
  is_default: boolean
  full_address?: string
}

export type CheckoutAddressForm = {
  city: string
  street: string
  apartment: string
}

const props = withDefaults(defineProps<{
  open: boolean
  planName: string
  billingCycleLabel: string
  totalAmount: number
  formatPrice: (val: number) => string
  maxBirthDate: string
  children: CheckoutChildOption[]
  isLoadingChildren?: boolean
  childMode: 'select' | 'create'
  selectedChildId: number | null
  childName: string
  childLastName: string
  childBirthDate: string
  addresses: CheckoutAddressOption[]
  isLoadingAddresses?: boolean
  selectedAddressKey: string
  addressForm: CheckoutAddressForm
  phone: string
  isSubmitting?: boolean
  submitError?: string
  formatChildAge: (child: CheckoutChildOption) => string
  formatAddress: (addr: CheckoutAddressOption) => string
}>(), {
  isLoadingChildren: false,
  isLoadingAddresses: false,
  isSubmitting: false,
  submitError: '',
})

const emit = defineEmits<{
  close: []
  pay: []
  'select-child': [id: number]
  'switch-to-create': []
  'switch-to-select': []
  'update:childName': [value: string]
  'update:childLastName': [value: string]
  'update:childBirthDate': [value: string]
  'update:selectedAddressKey': [value: string]
  'update:addressForm': [value: CheckoutAddressForm]
  'phone-input': [event: Event]
  'phone-paste': [event: ClipboardEvent]
}>()

const titleId = 'sub-m-sheet-title'
const panelRef = ref<HTMLElement | null>(null)
const closeBtnRef = ref<HTMLButtonElement | null>(null)
const bodyRef = ref<HTMLElement | null>(null)
const lockedScrollY = ref(0)
const wasOpen = ref(false)
const step = ref(1)
const viewportOffset = ref(0)
const fieldErrors = reactive<{
  childName?: string
  childLastName?: string
  childBirthDate?: string
  street?: string
  phone?: string
}>({})

const overlayStyle = computed(() => (
  viewportOffset.value > 0
    ? { paddingBottom: `${viewportOffset.value}px` }
    : undefined
))

const stepTitle = computed(() => {
  if (step.value === 1) return 'Ребёнок'
  if (step.value === 2) return 'Доставка'
  return 'Проверка'
})

const showAddressFields = computed(() => {
  if (!props.addresses.length) return true
  return props.selectedAddressKey === 'new'
})

const selectedChild = computed(() =>
  props.children.find(c => c.id === props.selectedChildId) || null,
)

const selectedChildNeedsLastName = computed(() => {
  if (props.childMode !== 'select' || !selectedChild.value) return false
  return !selectedChild.value.last_name
})

const selectedSavedAddress = computed(() => {
  if (props.selectedAddressKey === 'new') return null
  const id = Number(props.selectedAddressKey)
  if (!Number.isFinite(id)) return null
  return props.addresses.find(a => a.id === id) || null
})

const reviewChildLabel = computed(() => {
  if (props.childMode === 'select' && selectedChild.value) {
    const last = props.childLastName || selectedChild.value.last_name || ''
    return `${selectedChild.value.name} ${last}`.trim() || '—'
  }
  const name = `${props.childName} ${props.childLastName}`.trim()
  if (!name) return '—'
  if (props.childBirthDate) return `${name} · ${props.childBirthDate}`
  return name
})

const reviewAddressLabel = computed(() => {
  if (selectedSavedAddress.value) return props.formatAddress(selectedSavedAddress.value)
  const city = props.addressForm.city.trim()
  const street = props.addressForm.street.trim()
  const apt = props.addressForm.apartment.trim()
  const parts = [city, street, apt ? `кв. ${apt}` : ''].filter(Boolean)
  return parts.join(', ') || '—'
})

const primaryDisabled = computed(() => props.isSubmitting)

const primaryLabel = computed(() => {
  if (step.value < 3) return 'Продолжить'
  if (props.isSubmitting) return 'Оформляем…'
  return `Перейти к оплате · ${props.formatPrice(props.totalAmount)} ₸`
})

const clearFieldErrors = () => {
  fieldErrors.childName = undefined
  fieldErrors.childLastName = undefined
  fieldErrors.childBirthDate = undefined
  fieldErrors.street = undefined
  fieldErrors.phone = undefined
}

const onChildNameInput = (e: Event) => {
  fieldErrors.childName = undefined
  emit('update:childName', (e.target as HTMLInputElement).value)
}

const onChildLastNameInput = (e: Event) => {
  fieldErrors.childLastName = undefined
  emit('update:childLastName', (e.target as HTMLInputElement).value)
}

const onChildBirthInput = (e: Event) => {
  fieldErrors.childBirthDate = undefined
  emit('update:childBirthDate', (e.target as HTMLInputElement).value)
}

const onAddressCityChange = (e: Event) => {
  emit('update:addressForm', {
    ...props.addressForm,
    city: (e.target as HTMLSelectElement).value,
  })
}

const onAddressStreetInput = (e: Event) => {
  fieldErrors.street = undefined
  emit('update:addressForm', {
    ...props.addressForm,
    street: (e.target as HTMLInputElement).value,
  })
}

const onAddressApartmentInput = (e: Event) => {
  emit('update:addressForm', {
    ...props.addressForm,
    apartment: (e.target as HTMLInputElement).value,
  })
}

const onPhoneInput = (e: Event) => {
  fieldErrors.phone = undefined
  emit('phone-input', e)
}

const onPhonePaste = (e: ClipboardEvent) => {
  fieldErrors.phone = undefined
  emit('phone-paste', e)
}

const goToStep = (next: number) => {
  clearFieldErrors()
  step.value = next
  nextTick(() => bodyRef.value?.scrollTo({ top: 0 }))
}

const goBack = () => {
  if (step.value <= 1) return
  goToStep(step.value - 1)
}

const validateStep1 = () => {
  clearFieldErrors()
  let ok = true

  if (props.childMode === 'select' && props.children.some(c => !c.hasActiveSubscription)) {
    if (!props.selectedChildId) {
      ok = false
      return ok
    }
    if (selectedChildNeedsLastName.value && !props.childLastName.trim()) {
      fieldErrors.childLastName = 'Укажите фамилию ребёнка'
      ok = false
    }
    return ok
  }

  if (!props.childName.trim()) {
    fieldErrors.childName = 'Укажите имя ребёнка'
    ok = false
  }
  if (!props.childLastName.trim()) {
    fieldErrors.childLastName = 'Укажите фамилию ребёнка'
    ok = false
  }
  if (!props.childBirthDate.trim()) {
    fieldErrors.childBirthDate = 'Укажите дату рождения'
    ok = false
  } else {
    const birthDate = new Date(`${props.childBirthDate}T00:00:00`)
    if (Number.isNaN(birthDate.getTime())) {
      fieldErrors.childBirthDate = 'Укажите корректную дату рождения'
      ok = false
    } else {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (birthDate > today) {
        fieldErrors.childBirthDate = 'Дата рождения не может быть в будущем'
        ok = false
      }
    }
  }
  return ok
}

const validateStep2 = () => {
  clearFieldErrors()
  let ok = true

  if (showAddressFields.value) {
    const city = props.addressForm.city.trim()
    const street = props.addressForm.street.trim()
    if (!city || !street) {
      fieldErrors.street = 'Укажите город и улицу с номером дома'
      ok = false
    } else if (!/\d/.test(street)) {
      fieldErrors.street = 'Укажите улицу с номером дома'
      ok = false
    }
  } else if (!selectedSavedAddress.value) {
    fieldErrors.street = 'Выберите адрес доставки'
    ok = false
  }

  if (!props.phone.trim()) {
    fieldErrors.phone = 'Укажите телефон для доставки'
    ok = false
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
      step.value = 1
      clearFieldErrors()
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

defineExpose({ goToStep, step })
</script>

<style scoped>
.sub-m-overlay {
  position: fixed;
  inset: 0;
  z-index: 10060;
  background: rgba(26, 26, 46, 0.45);
  display: flex;
  align-items: stretch;
  justify-content: center;
}

.sub-m-panel {
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

.sub-m-header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  flex-shrink: 0;
}

.sub-m-header-btn {
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

.sub-m-header-btn:disabled {
  opacity: 0.35;
  cursor: default;
}

.sub-m-header-center {
  text-align: center;
}

.sub-m-step-name {
  margin: 0;
  font-size: 14px;
  font-weight: 800;
  color: #262626;
}

.sub-m-step-count {
  margin: 2px 0 0;
  font-size: 12px;
  font-weight: 600;
  color: #6f746f;
}

.sub-m-close {
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

.sub-m-progress {
  height: 3px;
  background: rgba(35, 52, 40, 0.08);
  flex-shrink: 0;
}

.sub-m-progress-bar {
  height: 100%;
  background: var(--green-surface, #a8bfa8);
  transition: width 0.2s ease;
}

.sub-m-plan-chip {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 10px 16px 0;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(168, 191, 168, 0.22);
  border: 1px solid rgba(63, 103, 87, 0.18);
}

.sub-m-plan-chip strong {
  font-size: 13px;
  font-weight: 800;
  color: var(--green-ink, #233428);
}

.sub-m-plan-chip span {
  font-size: 12px;
  color: #5d625f;
}

.sub-m-body {
  flex: 1 1 auto;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 14px 16px 12px;
  overscroll-behavior: contain;
}

.sub-m-step {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sub-m-heading {
  margin: 0;
  font-family: 'Manrope', sans-serif;
  font-size: 1.25rem;
  font-weight: 800;
  color: #262626;
  line-height: 1.25;
}

.sub-m-lead {
  margin: 0;
  font-size: 14px;
  line-height: 1.45;
  color: #6f746f;
}

.sub-m-loading {
  padding: 16px;
  text-align: center;
  font-size: 13px;
  color: #6f746f;
}

.sub-m-choice-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sub-m-choice-row {
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

.sub-m-choice-row.compact {
  padding: 10px 12px;
  border-radius: 12px;
}

.sub-m-choice-row.active {
  border-color: var(--green-ink, #233428);
  background: var(--soft-sage-mist, #edf0ea);
}

.sub-m-choice-row.disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.sub-m-radio {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid #c4b8a8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sub-m-choice-row.active .sub-m-radio {
  border-color: var(--green-ink, #233428);
}

.sub-m-radio-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--green-ink, #233428);
}

.sub-m-choice-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.sub-m-choice-text strong {
  font-size: 14px;
  font-weight: 800;
  color: #262626;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.sub-m-choice-text span {
  font-size: 12.5px;
  color: #6f746f;
  line-height: 1.35;
}

.sub-m-badge {
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.02em;
  color: #8a5a2b;
  background: #f5e6d3;
  border-radius: 999px;
  padding: 3px 8px;
}

.sub-m-badge.soft {
  color: #5d625f;
  background: rgba(35, 52, 40, 0.08);
}

.sub-m-text-link {
  align-self: flex-start;
  border: none;
  background: transparent;
  color: var(--green-ink, #233428);
  font-family: 'Manrope', sans-serif;
  font-size: 13px;
  font-weight: 700;
  padding: 4px 0;
  cursor: pointer;
}

.sub-m-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sub-m-field label {
  font-size: 13px;
  font-weight: 700;
  color: #262626;
}

.sub-m-field input,
.sub-m-field select {
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

.req {
  color: #af5353;
}

.sub-m-error {
  margin: 0;
  font-size: 12.5px;
  color: #af5353;
  line-height: 1.35;
}

.sub-m-hint {
  margin: 0;
  font-size: 12px;
  color: #6f746f;
  line-height: 1.4;
}

.sub-m-review-card {
  border: 1.5px solid #e3d7c6;
  border-radius: 14px;
  background: #fff;
  padding: 12px 14px;
}

.sub-m-review-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.sub-m-review-head strong {
  font-size: 13px;
  font-weight: 800;
  color: #262626;
}

.sub-m-edit-link {
  border: none;
  background: transparent;
  color: var(--green-ink, #233428);
  font-family: 'Manrope', sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  padding: 4px 0;
}

.sub-m-review-line {
  margin: 0;
  font-size: 13.5px;
  color: #262626;
  line-height: 1.4;
}

.sub-m-review-line.muted {
  color: #6f746f;
  margin-top: 4px;
}

.sub-m-review-total {
  margin: 6px 0 0;
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--green-ink, #233428);
}

.sub-m-pay-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #e3d7c6;
  background: #fff;
}

.sub-m-pay-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(35, 52, 40, 0.06);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--green-ink, #233428);
  flex-shrink: 0;
}

.sub-m-pay-text strong {
  font-size: 13px;
  font-weight: 700;
  color: #262626;
}

.sub-m-footer {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0));
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  background: #fff;
}

.sub-m-footer-price {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  font-size: 13px;
  color: #6f746f;
}

.sub-m-footer-price strong {
  font-size: 1.15rem;
  font-weight: 800;
  color: #262626;
}

.sub-m-primary {
  width: 100%;
  min-height: 52px;
  border: none;
  border-radius: 14px;
  background: var(--green-ink, #233428);
  color: #fff;
  font-family: 'Manrope', sans-serif;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
}

.sub-m-primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.sub-m-sheet-enter-active,
.sub-m-sheet-leave-active {
  transition: opacity 0.2s ease;
}

.sub-m-sheet-enter-active .sub-m-panel,
.sub-m-sheet-leave-active .sub-m-panel {
  transition: transform 0.22s ease;
}

.sub-m-sheet-enter-from,
.sub-m-sheet-leave-to {
  opacity: 0;
}

.sub-m-sheet-enter-from .sub-m-panel,
.sub-m-sheet-leave-to .sub-m-panel {
  transform: translateY(12px);
}

@media (min-width: 640px) {
  .sub-m-overlay {
    padding: 24px;
    align-items: center;
  }

  .sub-m-panel {
    height: min(720px, 100dvh);
    max-height: min(720px, calc(100dvh - 48px));
    border-radius: 20px;
    overflow: hidden;
  }
}
</style>
