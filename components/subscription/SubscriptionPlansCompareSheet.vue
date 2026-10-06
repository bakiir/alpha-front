<template>
  <Teleport to="body">
    <Transition name="plans-compare-sheet">
      <div
        v-if="open"
        class="plans-compare-overlay"
        role="presentation"
        @click.self="close"
      >
        <div
          ref="panelRef"
          class="plans-compare-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="plans-compare-title"
          tabindex="-1"
          @keydown.escape.prevent="close"
        >
          <div class="plans-compare-handle" aria-hidden="true" />

          <header class="plans-compare-header">
            <div>
              <h2 id="plans-compare-title" class="plans-compare-title">Сравнить тарифы</h2>
              <p class="plans-compare-cycle">Срок: {{ cycleLabel }}</p>
            </div>
            <button
              ref="closeBtnRef"
              type="button"
              class="plans-compare-close"
              aria-label="Закрыть"
              @click="close"
            >
              &times;
            </button>
          </header>

          <div class="plans-compare-pickers">
            <label class="plans-compare-picker">
              <span class="plans-compare-picker-label">Тариф 1</span>
              <select v-model="leftSlug" class="plans-compare-select">
                <option
                  v-for="plan in plans"
                  :key="`left-${plan.slug}`"
                  :value="plan.slug"
                  :disabled="plan.slug === rightSlug"
                >
                  {{ plan.name }}
                </option>
              </select>
            </label>
            <label class="plans-compare-picker">
              <span class="plans-compare-picker-label">Тариф 2</span>
              <select v-model="rightSlug" class="plans-compare-select">
                <option
                  v-for="plan in plans"
                  :key="`right-${plan.slug}`"
                  :value="plan.slug"
                  :disabled="plan.slug === leftSlug"
                >
                  {{ plan.name }}
                </option>
              </select>
            </label>
          </div>

          <div v-if="leftPlan && rightPlan" class="plans-compare-body">
            <div class="plans-compare-sticky-heads">
              <div class="plans-compare-head-spacer" aria-hidden="true" />
              <div class="plans-compare-head-cell">
                <span v-if="leftPlan.badge" class="plans-compare-badge">{{ leftPlan.badge }}</span>
                <strong>{{ leftPlan.name }}</strong>
              </div>
              <div class="plans-compare-head-cell">
                <span v-if="rightPlan.badge" class="plans-compare-badge">{{ rightPlan.badge }}</span>
                <strong>{{ rightPlan.name }}</strong>
              </div>
            </div>

            <div
              v-for="row in compareRows"
              :key="row.key"
              class="plans-compare-row"
            >
              <div class="plans-compare-row-label">{{ row.label }}</div>
              <div class="plans-compare-row-value" :class="{ highlight: row.leftHighlight }">
                {{ row.left }}
              </div>
              <div class="plans-compare-row-value" :class="{ highlight: row.rightHighlight }">
                {{ row.right }}
              </div>
            </div>

            <div class="plans-compare-actions">
              <button
                type="button"
                class="plans-compare-select-btn"
                @click="emitSelect(leftPlan)"
              >
                Выбрать {{ leftPlan.name }}
              </button>
              <button
                type="button"
                class="plans-compare-select-btn featured"
                @click="emitSelect(rightPlan)"
              >
                Выбрать {{ rightPlan.name }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { PlanViewItem } from '~/composables/useSubscriptionPricing'

type BillingCycle = 'monthly' | 'quarterly' | 'semiannual' | 'annual'

const props = defineProps<{
  open: boolean
  plans: PlanViewItem[]
  billingCycle: BillingCycle
  cycleLabel: string
}>()

const emit = defineEmits<{
  close: []
  'select-plan': [plan: PlanViewItem]
}>()

const { formatPrice, calcPlanPrice, calcBilledTotal, billingCycleMonths } = useSubscriptionPricing()

const panelRef = ref<HTMLElement | null>(null)
const closeBtnRef = ref<HTMLButtonElement | null>(null)
const lockedScrollY = ref(0)
const wasOpen = ref(false)
const leftSlug = ref('')
const rightSlug = ref('')

const leftPlan = computed(() => props.plans.find((p) => p.slug === leftSlug.value) || null)
const rightPlan = computed(() => props.plans.find((p) => p.slug === rightSlug.value) || null)

const months = computed(() => billingCycleMonths(props.billingCycle))

const planMonthly = (plan: PlanViewItem) => calcPlanPrice(plan, props.billingCycle, 0)
const planTotal = (plan: PlanViewItem) => calcBilledTotal(plan, props.billingCycle, 0)

const formatPeriodCost = (plan: PlanViewItem) => {
  if (props.billingCycle === 'monthly') {
    return `${formatPrice(planMonthly(plan))} ₸ / мес`
  }
  return `${formatPrice(planTotal(plan))} ₸ / ${months.value} мес`
}

const formatMonthlyEquiv = (plan: PlanViewItem) =>
  props.billingCycle === 'monthly'
    ? '—'
    : `${formatPrice(planMonthly(plan))} ₸ / мес`

const toysLabel = (count: number) => {
  const n = Math.abs(Number(count) || 0) % 100
  const n1 = n % 10
  if (n > 10 && n < 20) return `${count} игрушек`
  if (n1 === 1) return `${count} игрушка`
  if (n1 >= 2 && n1 <= 4) return `${count} игрушки`
  return `${count} игрушек`
}

const exchangesLabel = (count: number) => {
  const n = Math.abs(Number(count) || 0) % 100
  const n1 = n % 10
  if (n > 10 && n < 20) return `${count} обменов`
  if (n1 === 1) return `${count} обмен`
  if (n1 >= 2 && n1 <= 4) return `${count} обмена`
  return `${count} обменов`
}

const categoryValue = (plan: PlanViewItem, slug: string, fallbackName: string) => {
  const access = (plan.category_access || []).find((c) => c.slug === slug)
  if (access) return access.allowed ? 'Да' : 'Нет'
  const denied = (plan.denied_category_slugs || []).includes(slug)
  if (denied) return 'Нет'
  const unavailable = (plan.unavailable_features || []).some((f) =>
    f.toLowerCase().includes(fallbackName.toLowerCase().slice(0, 8)),
  )
  if (unavailable) return 'Нет'
  const featured = (plan.features || []).some((f) =>
    f.toLowerCase().includes(fallbackName.toLowerCase().slice(0, 8)),
  )
  return featured ? 'Да' : '—'
}

const compareRows = computed(() => {
  const left = leftPlan.value
  const right = rightPlan.value
  if (!left || !right) return []

  const leftMonthly = planMonthly(left)
  const rightMonthly = planMonthly(right)
  const leftToys = Number(left.toys_count) || 0
  const rightToys = Number(right.toys_count) || 0
  const leftEx = Number(left.exchanges_count) || 0
  const rightEx = Number(right.exchanges_count) || 0

  const rows: Array<{
    key: string
    label: string
    left: string
    right: string
    leftHighlight?: boolean
    rightHighlight?: boolean
  }> = [
    {
      key: 'cost',
      label: 'Стоимость',
      left: formatPeriodCost(left),
      right: formatPeriodCost(right),
      leftHighlight: leftMonthly < rightMonthly,
      rightHighlight: rightMonthly < leftMonthly,
    },
  ]

  if (props.billingCycle !== 'monthly') {
    rows.push({
      key: 'monthly',
      label: 'В пересчёте на месяц',
      left: formatMonthlyEquiv(left),
      right: formatMonthlyEquiv(right),
      leftHighlight: leftMonthly < rightMonthly,
      rightHighlight: rightMonthly < leftMonthly,
    })
  }

  rows.push(
    {
      key: 'toys',
      label: 'Игрушки дома',
      left: toysLabel(leftToys),
      right: toysLabel(rightToys),
      leftHighlight: leftToys > rightToys,
      rightHighlight: rightToys > leftToys,
    },
    {
      key: 'exchanges',
      label: 'Обмены в месяц',
      left: exchangesLabel(leftEx),
      right: exchangesLabel(rightEx),
      leftHighlight: leftEx > rightEx,
      rightHighlight: rightEx > leftEx,
    },
    {
      key: 'delivery',
      label: 'Доставка',
      left: 'Бесплатная курьерская',
      right: 'Бесплатная курьерская',
    },
    {
      key: 'large-format',
      label: 'Крупноформатные',
      left: categoryValue(left, 'large-format', 'Крупноформатные'),
      right: categoryValue(right, 'large-format', 'Крупноформатные'),
      leftHighlight: categoryValue(left, 'large-format', 'Крупноформатные') === 'Да'
        && categoryValue(right, 'large-format', 'Крупноформатные') !== 'Да',
      rightHighlight: categoryValue(right, 'large-format', 'Крупноформатные') === 'Да'
        && categoryValue(left, 'large-format', 'Крупноформатные') !== 'Да',
    },
    {
      key: 'role-play',
      label: 'Сюжетно-ролевые',
      left: categoryValue(left, 'role-play', 'Сюжетно-ролевые'),
      right: categoryValue(right, 'role-play', 'Сюжетно-ролевые'),
      leftHighlight: categoryValue(left, 'role-play', 'Сюжетно-ролевые') === 'Да'
        && categoryValue(right, 'role-play', 'Сюжетно-ролевые') !== 'Да',
      rightHighlight: categoryValue(right, 'role-play', 'Сюжетно-ролевые') === 'Да'
        && categoryValue(left, 'role-play', 'Сюжетно-ролевые') !== 'Да',
    },
    {
      key: 'freeze',
      label: 'Заморозка',
      left: `до ${left.max_freeze_days} дн.`,
      right: `до ${right.max_freeze_days} дн.`,
    },
    {
      key: 'extra',
      label: 'Доп. игрушка',
      left: `${formatPrice(left.extra_toy_price)} ₸`,
      right: `${formatPrice(right.extra_toy_price)} ₸`,
    },
  )

  return rows
})

const syncDefaultSlugs = () => {
  if (!props.plans.length) {
    leftSlug.value = ''
    rightSlug.value = ''
    return
  }
  const featured = props.plans.find((p) => p.isFeatured) || props.plans[1] || props.plans[0]
  const other = props.plans.find((p) => p.slug !== featured?.slug) || props.plans[0]
  if (!leftSlug.value || !props.plans.some((p) => p.slug === leftSlug.value)) {
    leftSlug.value = other?.slug || props.plans[0].slug
  }
  if (!rightSlug.value || !props.plans.some((p) => p.slug === rightSlug.value) || rightSlug.value === leftSlug.value) {
    rightSlug.value = featured?.slug || props.plans[Math.min(1, props.plans.length - 1)].slug
  }
  if (leftSlug.value === rightSlug.value && props.plans.length > 1) {
    rightSlug.value = props.plans.find((p) => p.slug !== leftSlug.value)?.slug || rightSlug.value
  }
}

watch(
  () => [props.open, props.plans.map((p) => p.slug).join('|')] as const,
  () => {
    if (props.open) syncDefaultSlugs()
  },
  { immediate: true },
)

const close = () => emit('close')

const emitSelect = (plan: PlanViewItem) => {
  emit('select-plan', plan)
  close()
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
      syncDefaultSlugs()
      lockPageScroll()
      await nextTick()
      closeBtnRef.value?.focus()
      return
    }
    if (wasOpen.value) {
      unlockPageScroll()
      wasOpen.value = false
    }
  },
)

onMounted(() => {
  if (!import.meta.client) return
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  if (!import.meta.client) return
  document.removeEventListener('keydown', onKeydown)
  if (wasOpen.value || props.open) unlockPageScroll()
})
</script>

<style scoped>
.plans-compare-overlay {
  position: fixed;
  inset: 0;
  z-index: 10050;
  background: rgba(26, 26, 46, 0.55);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.plans-compare-panel {
  width: 100%;
  max-width: 560px;
  max-height: 92dvh;
  max-height: 92vh;
  background: #faf8f4;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -12px 40px rgba(26, 26, 46, 0.18);
  display: flex;
  flex-direction: column;
  outline: none;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.plans-compare-handle {
  width: 40px;
  height: 4px;
  border-radius: 999px;
  background: #d9d3c8;
  margin: 10px auto 0;
  flex-shrink: 0;
}

.plans-compare-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px 10px;
  border-bottom: 1px solid rgba(45, 42, 50, 0.08);
  flex-shrink: 0;
}

.plans-compare-title {
  margin: 0;
  font-family: 'Manrope', sans-serif;
  font-size: 1.05rem;
  font-weight: 800;
  color: #262626;
  line-height: 1.25;
}

.plans-compare-cycle {
  margin: 4px 0 0;
  font-size: 12px;
  font-weight: 700;
  color: #6f746f;
}

.plans-compare-close {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: #f4f1ea;
  color: #5d625f;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.plans-compare-pickers {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(45, 42, 50, 0.06);
  flex-shrink: 0;
}

.plans-compare-picker {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.plans-compare-picker-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #6f746f;
}

.plans-compare-select {
  width: 100%;
  min-height: 42px;
  border: 1.5px solid #e3d7c6;
  border-radius: 12px;
  background: #fff;
  padding: 8px 10px;
  font-family: 'Manrope', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #262626;
}

.plans-compare-body {
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  padding: 0 0 20px;
  min-height: 0;
  flex: 1;
}

.plans-compare-sticky-heads {
  position: sticky;
  top: 0;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(88px, 0.9fr) 1fr 1fr;
  gap: 0;
  background: #faf8f4;
  border-bottom: 1px solid rgba(45, 42, 50, 0.1);
  padding: 10px 12px;
}

.plans-compare-head-spacer {
  min-width: 0;
}

.plans-compare-head-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  min-width: 0;
  padding: 0 6px;
}

.plans-compare-head-cell strong {
  font-family: 'Manrope', sans-serif;
  font-size: 14px;
  font-weight: 800;
  color: #262626;
  line-height: 1.25;
  word-break: break-word;
}

.plans-compare-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  background: #d9e0d5;
  color: var(--green-ink, #3f6757);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.plans-compare-row {
  display: grid;
  grid-template-columns: minmax(88px, 0.9fr) 1fr 1fr;
  gap: 0;
  padding: 12px;
  border-bottom: 1px solid rgba(45, 42, 50, 0.06);
}

.plans-compare-row:nth-child(even) {
  background: rgba(255, 255, 255, 0.55);
}

.plans-compare-row-label {
  font-size: 12px;
  font-weight: 700;
  color: #6f746f;
  line-height: 1.35;
  padding-right: 6px;
}

.plans-compare-row-value {
  font-size: 13px;
  font-weight: 700;
  color: #262626;
  line-height: 1.35;
  padding: 0 6px;
  word-break: break-word;
}

.plans-compare-row-value.highlight {
  color: var(--green-ink, #3f6757);
}

.plans-compare-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 16px 12px 8px;
}

.plans-compare-select-btn {
  min-height: 46px;
  border: none;
  border-radius: 14px;
  background: #f4f1ea;
  color: #262626;
  font-family: 'Manrope', sans-serif;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  padding: 10px 8px;
  line-height: 1.25;
}

.plans-compare-select-btn.featured {
  background: var(--green-surface, #3f6757);
  color: var(--green-ink, #faf8f4);
}

.plans-compare-sheet-enter-active,
.plans-compare-sheet-leave-active {
  transition: opacity 0.2s ease;
}

.plans-compare-sheet-enter-active .plans-compare-panel,
.plans-compare-sheet-leave-active .plans-compare-panel {
  transition: transform 0.25s ease;
}

.plans-compare-sheet-enter-from,
.plans-compare-sheet-leave-to {
  opacity: 0;
}

.plans-compare-sheet-enter-from .plans-compare-panel,
.plans-compare-sheet-leave-to .plans-compare-panel {
  transform: translateY(100%);
}
</style>
