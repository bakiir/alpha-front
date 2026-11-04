<template>
  <section class="active-sub-view">
    <div class="sub-header-section">
      <div class="header-left">
        <span class="section-badge">{{ t('subscription.dashboard.badge') }}</span>
        <h1 class="sub-main-title">{{ t('subscription.dashboard.title') }}</h1>
        <p class="sub-subtitle">
          {{ isPaused ? t('subscription.dashboard.subtitlePaused') : t('subscription.dashboard.subtitleActive') }}
        </p>
        <div v-if="childName" class="sub-child-meta">
          <span class="inline-meta"><AppIcon name="baby" :size="14" class="inline-icon" /> {{ childName }}</span>
          <span v-if="childAge"> · {{ childAge }}</span>
        </div>
      </div>

      <div class="header-right">
        <button class="gift-act-btn" type="button" @click="$emit('open-gift')">
          <AppIcon name="gift" :size="16" class="inline-icon" /> {{ t('subscription.dashboard.activateGift') }}
        </button>
        <button class="view-plans-toggle-btn" type="button" @click="$emit('show-plans')">
          {{ t('subscription.dashboard.viewPlans') }}
        </button>
      </div>
    </div>

    <div class="sub-grid-section">
      <div class="plan-card" :class="{ 'is-paused-card': isPaused }">
        <div class="plan-badge-row">
          <span v-if="isPaused" class="paused-badge"><AppIcon name="snowflake" :size="14" class="inline-icon" /> {{ t('subscription.dashboard.pausedBadge') }}</span>
          <span v-else class="active-badge">{{ t('subscription.dashboard.activeBadge') }}</span>
          <span v-if="plan.isGift" class="gift-badge"><AppIcon name="gift" :size="14" class="inline-icon" /> {{ t('subscription.dashboard.giftBadge') }}</span>
        </div>

        <h2 class="plan-name">{{ plan.name }}</h2>

        <div class="plan-price-row">
          <template v-if="plan.isGift">
            <span class="plan-price gift-price"><AppIcon name="gift" :size="16" class="inline-icon" /> {{ t('subscription.dashboard.giftPrice') }}</span>
            <span v-if="nextBillingDate" class="plan-period">{{ t('subscription.dashboard.until', { date: nextBillingDate }) }}</span>
          </template>
          <template v-else>
            <span class="plan-price">{{ plan.price }}</span>
            <span class="plan-period">{{ t('subscription.dashboard.perMonth') }}</span>
          </template>
        </div>

        <div v-if="pendingPickup" class="pending-pickup-banner">
          <AppIcon name="truck" :size="20" class="pickup-icon" />
          <div class="pickup-text">
            <template v-if="pendingAction === 'pause' && deliveryTaskStatus === 'return_to_warehouse'">
              <strong>{{ t('subscription.dashboard.returnToWarehouseTitle') }}</strong>
              <p>{{ t('subscription.dashboard.returnToWarehouseBody') }}</p>
            </template>
            <template v-else>
              <strong>{{ pendingAction === 'pause' ? t('subscription.dashboard.pickupBeforePause') : t('subscription.dashboard.pickupBeforeCancel') }}</strong>
              <p>{{ pendingAction === 'pause' ? t('subscription.dashboard.pickupScheduledPause') : t('subscription.dashboard.pickupScheduledCancel') }}</p>
            </template>
            <NuxtLink v-if="deliveryTrackLink" :to="deliveryTrackLink" class="pickup-track-link">
              {{ t('subscription.dashboard.trackCourier') }}
            </NuxtLink>
          </div>
        </div>

        <div v-else-if="isPaused" class="paused-info-banner">
          <AppIcon name="snowflake" :size="20" class="pause-icon" />
          <div class="pause-text">
            <strong>{{ t('subscription.dashboard.frozenUntil', { date: freezeEndFormatted }) }}</strong>
            <p>{{ t('subscription.dashboard.frozenBody') }}</p>
          </div>
        </div>

        <div v-if="pendingPlan" class="pending-plan-banner">
          <div class="pickup-text">
            <strong>
              <template v-if="pendingPlan.status === 'paid_waiting'">
                {{ t('subscription.dashboard.pendingPaid', { name: pendingPlan.name, date: pendingPlan.effectiveOn }) }}
              </template>
              <template v-else-if="pendingPlan.status === 'payment_in_flight'">
                {{ t('subscription.dashboard.pendingPaymentFlight', { name: pendingPlan.name }) }}
              </template>
              <template v-else>
                {{ t('subscription.dashboard.pendingScheduled', { date: pendingPlan.effectiveOn, name: pendingPlan.name }) }}
              </template>
            </strong>
            <p v-if="pendingPlan.renewalAmount != null">
              {{ t('subscription.dashboard.nextPeriodPay', { amount: formatPendingAmount(pendingPlan.renewalAmount) }) }}
            </p>
            <p v-if="pendingPlan.requiresExchange">
              {{ t('subscription.dashboard.extraToysAfterChange') }}
            </p>
            <button
              v-if="pendingPlan.status === 'scheduled'"
              type="button"
              class="pickup-track-link"
              :disabled="isSubmitting"
              @click="$emit('cancel-plan-change')"
            >
              {{ t('subscription.dashboard.cancelPlanChange') }}
            </button>
          </div>
        </div>

        <ul class="plan-features">
          <li v-for="(feat, idx) in plan.features" :key="idx">
            <span class="feat-dot">●</span>
            <span>{{ feat }}</span>
          </li>
        </ul>

        <div class="plan-actions-group">
          <button class="change-plan-btn" type="button" :disabled="pendingPickup || isSubmitting" @click="$emit('show-plans')">
            {{ t('subscription.dashboard.changePlan') }}
          </button>

          <div v-if="actionError" class="error-banner subscription-action-error">
            {{ actionError }}
          </div>

          <button
            v-if="isPaused"
            class="resume-btn"
            type="button"
            :disabled="isSubmitting"
            @click="$emit('resume')"
          >
            {{ isSubmitting ? t('subscription.dashboard.resuming') : t('subscription.dashboard.resume') }}
          </button>
          <div v-else-if="freezeUsed && !pendingPickup" class="freeze-used-note">
            <AppIcon name="check" :size="16" class="inline-icon" />
            <span><strong>{{ t('subscription.dashboard.freezeUsedTitle') }}</strong><small>{{ t('subscription.dashboard.freezeUsedHint') }}</small></span>
          </div>
          <button v-else class="freeze-btn" type="button" :disabled="pendingPickup || isSubmitting" @click="$emit('freeze')">
            <AppIcon name="snowflake" :size="16" class="inline-icon" /> {{ pendingPickup && pendingAction === 'pause' ? t('subscription.dashboard.pickupInProgress') : t('subscription.dashboard.freeze') }}
          </button>

          <button
            class="cancel-sub-btn"
            type="button"
            :disabled="pendingPickup || isSubmitting"
            @click="$emit('cancel')"
          >
            {{ pendingPickup && pendingAction === 'cancel' ? t('subscription.dashboard.awaitingReturn') : t('subscription.dashboard.cancelSubscription') }}
          </button>
        </div>
      </div>

      <div class="right-stack">
        <div class="status-card payment-card">
          <div class="card-text-col">
            <span class="card-small-label">{{ isPaused ? t('subscription.dashboard.paymentPaused') : (renewalOverdue ? t('subscription.dashboard.paymentOverdue') : t('subscription.dashboard.paidUntil')) }}</span>
            <h3 class="card-main-val">{{ paidUntil || nextBillingDate || '—' }}</h3>
            <p class="card-sub-info">
              <template v-if="renewalAmountLabel">{{ renewalAmountLabel }} • </template>
              {{ plan.isGift ? t('subscription.dashboard.giftPeriod') : t('subscription.dashboard.manualRenewal') }}
            </p>
            <p v-if="renewalOverdue && !isPaused" class="renewal-overdue-hint">
              {{ t('subscription.dashboard.renewHint') }}
            </p>
            <button
              v-if="canRenew && !isPaused"
              type="button"
              class="renew-pay-btn"
              :disabled="isRenewing || pendingPickup || isSubmitting"
              @click="$emit('renew')"
            >
              {{ isRenewing ? t('subscription.dashboard.openingRenewPay') : (plan.isGift ? t('subscription.dashboard.renewGift') : t('subscription.dashboard.renew')) }}
            </button>
          </div>
          <div class="avatars-decor">
            <div class="face-avatar peach-face">
              <span class="face-eye left"></span>
              <span class="face-eye right"></span>
              <span class="face-mouth line"></span>
            </div>
            <div class="face-avatar blue-face">
              <span class="face-eye left"></span>
              <span class="face-eye right"></span>
              <span class="face-mouth smile"></span>
            </div>
          </div>
        </div>

        <div class="status-card limit-card">
          <span class="card-small-label limit-card-label-desktop">
            {{ isFirstSetCycle ? t('subscription.dashboard.firstSet') : t('subscription.dashboard.toysAtHome') }}
          </span>
          <h3 class="card-main-val limit-card-title-desktop">{{ limitCardTitle }}</h3>
          <h3 class="limit-card-title-mobile">
            <template v-if="isFirstSetCycle">{{ limitCardTitle }}</template>
            <template v-else>{{ t('subscription.dashboard.toysAtHomeCount', { used: toysInUse, limit: toysLimit }) }}</template>
          </h3>

          <p v-if="!isFirstSetCycle" class="card-sub-info limit-card-limit-desktop">
            {{ t('subscription.dashboard.planLimit', { n: toysLimit }) }}
          </p>
          <p v-if="nextDeliveryDate" class="card-sub-info">{{ t('subscription.dashboard.nextDelivery', { date: nextDeliveryDate }) }}</p>
          <p v-if="currentBoxName" class="card-sub-info limit-card-box-desktop">
            {{ t('subscription.dashboard.readyBox', { name: currentBoxName }) }}
          </p>
          <p v-if="setStatusLabel" class="card-sub-info">{{ t('subscription.dashboard.setStatus', { status: setStatusLabel }) }}</p>

          <div
            v-if="compositionToys.length"
            class="toys-thumb-row"
            role="button"
            tabindex="0"
            :aria-label="t('subscription.dashboard.openCompositionAria')"
            @click="openCompositionSheet"
            @keydown.enter.prevent="openCompositionSheet"
            @keydown.space.prevent="openCompositionSheet"
          >
            <div
              v-for="toy in thumbSlots.visible"
              :key="`thumb-${toy.id}`"
              class="toys-thumb-cell"
            >
              <AppImage
                :src="toyImageSrc(toy) || null"
                :alt="toyDisplayName(toy)"
                custom-class="toys-thumb-img"
              />
            </div>
            <div
              v-if="thumbSlots.overflow > 0"
              class="toys-thumb-cell toys-thumb-more"
              aria-hidden="true"
            >
              +{{ thumbSlots.overflow }}
            </div>
          </div>
          <p v-else class="toys-thumb-empty card-sub-info">
            {{ isFirstSetCycle ? t('subscription.dashboard.firstSetPreparing') : t('subscription.dashboard.setEmpty') }}
          </p>

          <button
            ref="openCompositionBtnRef"
            type="button"
            class="view-composition-btn-mobile"
            @click="openCompositionSheet"
          >
            {{ t('subscription.dashboard.viewComposition', { label: formatToysCountLabel(compositionPreviewCount) }) }}
          </button>

          <div v-if="currentSetToys.length || nextSetToys.length" class="limit-footer limit-footer-desktop">
            <button type="button" class="view-toys-btn-link" @click="$emit('view-toys')">
              {{ t('subscription.dashboard.viewFullComposition', { n: compositionPreviewCount }) }}
            </button>
          </div>
          <div v-if="currentSetToys.length" class="current-set-toys-grid">
            <div
              v-for="toy in currentSetToys"
              :key="toy.id"
              class="next-set-toy-card"
            >
              <img
                :src="toy.image || toy.image_url || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=300&q=80'"
                :alt="toy.name || toy.title"
                class="next-set-toy-img"
              >
              <div class="next-set-toy-meta">
                <strong>{{ toy.name || toy.title }}</strong>
              </div>
            </div>
          </div>

          <ToysCompositionSheet
            :open="isCompositionSheetOpen"
            :toys="compositionToys"
            @close="closeCompositionSheet"
          />
        </div>
      </div>
    </div>

    <section v-if="deliveryTaskId || trackedSetId" class="sub-delivery-section">
      <div class="sub-delivery-header">
        <div>
          <span class="section-badge">{{ t('subscription.dashboard.deliveryBadge') }}</span>
          <h2 class="sub-delivery-title">{{ t('subscription.dashboard.whereIsSet') }}</h2>
          <p class="sub-delivery-subtitle">{{ t('subscription.dashboard.deliverySubtitle') }}</p>
        </div>
        <NuxtLink
          :to="deliveryTrackLink"
          class="full-delivery-link"
        >
          {{ t('subscription.dashboard.fullTracking') }}
        </NuxtLink>
      </div>

      <DeliveryTracker
        :task-id="deliveryTaskId"
        :subscription-set-id="trackedSetId"
        :fallback-status="trackerFallbackStatus"
        :fallback-scheduled-time="nextDeliveryDate || undefined"
        :fallback-address="deliveryAddress || undefined"
        compact
        :show-courier-card="!isPaused"
      />
    </section>

    <section v-if="['in_use', 'returning'].includes(setStatus)" class="sub-exchange-section">
      <div class="exchange-banner-inline">
        <div class="exchange-banner-info">
          <h3>{{ t('subscription.dashboard.nextExchange') }}</h3>
          <p class="exchange-planned-line">
            <span class="exchange-field-label">{{ t('subscription.dashboard.plannedExchangeDate') }}</span>
            <strong class="exchange-planned-value">{{ plannedExchangeSlot || plannedExchangeDate || t('subscription.dashboard.exchangeNotPicked') }}</strong>
          </p>
          <p v-if="confirmedDeliverySlot" class="exchange-meta-line">
            <span class="exchange-field-label">{{ t('subscription.dashboard.confirmedDeliverySlot') }}</span>
            <span class="exchange-field-value">{{ confirmedDeliverySlot }}</span>
          </p>
          <p v-if="returnDueDate" class="exchange-meta-line">
            <span class="exchange-field-label">{{ t('subscription.dashboard.returnDue') }}</span>
            <span class="exchange-field-value">{{ returnDueDate }}</span>
          </p>
          <p v-else-if="setStatus === 'returning'" class="exchange-meta-line">
            {{ t('subscription.dashboard.exchangeAccepted') }}
          </p>
          <div v-if="exchangeQuota" class="exchange-quota-block">
            <p class="exchange-quota-stats">
              {{ t('subscription.dashboard.quotaUsed', { used: exchangeQuota.used, limit: exchangeQuota.limit }) }}
              <template v-if="exchangeQuota.remaining > 0">{{ t('subscription.dashboard.quotaRemaining', { n: exchangeQuota.remaining }) }}</template>
              <template v-else-if="exchangeQuota.can_purchase_extra && exchangeQuota.extra_exchange_price">
                {{ t('subscription.dashboard.extraExchange', { price: exchangeQuota.extra_exchange_price }) }}
              </template>
              <template v-if="exchangeQuota.planned">{{ t('subscription.dashboard.exchangePlanned') }}</template>
            </p>
            <p
              v-if="exchangeQuota.period_start && exchangeQuota.period_end"
              class="exchange-quota-period"
            >
              {{ t('subscription.dashboard.quotaPeriod', { start: exchangeQuota.period_start, end: exchangeQuota.period_end }) }}
            </p>
          </div>
        </div>
        <div class="exchange-actions-col">
          <button
            type="button"
            class="exchange-inline-btn"
            :disabled="isRequestingExchange || setStatus === 'returning' || !canRequestExchange"
            @click="$emit('exchange')"
          >
            {{ exchangeButtonLabel }}
          </button>
          <button
            type="button"
            class="exchange-reschedule-btn"
            @click="$emit('reschedule')"
          >
            <AppIcon name="calendar" :size="16" class="inline-icon" />
            {{ plannedExchangeSlot || plannedExchangeDate ? t('subscription.dashboard.rescheduleExchange') : t('subscription.dashboard.pickExchangeDate') }}
          </button>
        </div>
      </div>
    </section>

    <section v-if="showNextSet" class="sub-next-set-section">
      <article class="next-set-card">
        <header class="next-set-card-header">
          <div class="next-set-card-head-main">
            <h2 class="next-set-card-title">{{ nextSetCardTitle }}</h2>
            <p v-if="nextSetMetaLine" class="next-set-card-meta">{{ nextSetMetaLine }}</p>
            <div class="next-set-status-row">
              <span
                class="next-set-status-badge"
                :class="{ 'is-pending': !nextSetHasComposition }"
              >
                {{ nextSetStatusBadgeLabel }}
              </span>
              <span v-if="compositionEditUntil && canEditNextSet" class="next-set-deadline">
                <AppIcon name="clock" :size="14" class="inline-icon" aria-hidden="true" />
                {{ t('subscription.dashboard.editUntilShort', { date: compositionEditUntilLabel }) }}
              </span>
              <span v-else-if="!canEditNextSet && compositionEditLocked" class="next-set-deadline next-set-deadline--muted">
                {{ t('subscription.dashboard.editClosed') }}
              </span>
            </div>
            <p v-if="isFirstSetCycle && nextSetStatus === 'delivering'" class="next-set-card-hint">
              {{ t('subscription.dashboard.firstSetOnWay') }}
            </p>
            <p v-else-if="isFirstSetCycle" class="next-set-card-hint">
              {{ t('subscription.dashboard.firstSetPreparingWarehouse') }}
            </p>
            <p v-else-if="!nextSetHasComposition" class="next-set-card-hint">
              {{ t('subscription.dashboard.nextSetAuto') }}
            </p>
          </div>
          <button
            type="button"
            class="next-set-edit-btn next-set-edit-btn--desktop"
            :disabled="!canEditNextSet"
            @click="$emit('edit-next-set')"
          >
            {{ t('subscription.dashboard.editComposition') }}
          </button>
        </header>

        <div v-if="replaceablePositions.length" class="next-set-positions">
          <p class="next-set-replace-hint">{{ t('subscription.dashboard.replaceHint') }}</p>
          <div
            v-for="position in replaceablePositions"
            :key="position.id"
            class="next-set-position-row"
          >
            <div class="next-set-position-current">
              <strong>{{ position.toy_name_snapshot }}</strong>
              <span v-if="position.materials_snapshot">{{ t('subscription.dashboard.materials', { text: position.materials_snapshot }) }}</span>
            </div>
            <select
              class="next-set-replace-select"
              :disabled="isReplacingPosition"
              :value="position.selected_toy_id"
              @change="onReplacePosition(position.id, $event)"
            >
              <option
                v-for="alt in position.alternatives"
                :key="alt.id"
                :value="alt.id"
              >
                {{ alt.name }}{{ alt.materials ? ` · ${alt.materials}` : '' }}{{ alt.is_primary ? t('subscription.dashboard.primaryAlt') : '' }}
              </option>
            </select>
          </div>
        </div>

        <div v-if="nextSetToys.length" class="next-set-kit-grid">
          <div
            v-for="toy in nextSetToys"
            :key="toy.id"
            class="next-set-kit-item"
          >
            <div class="next-set-kit-img-wrap">
              <AppImage
                :src="toyImageSrc(toy) || null"
                :alt="toyDisplayName(toy)"
                custom-class="next-set-kit-img"
              />
            </div>
            <div class="next-set-kit-text">
              <strong>{{ toyDisplayName(toy) }}</strong>
              <span v-if="toyCategoryLabel(toy)">{{ toyCategoryLabel(toy) }}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="next-set-edit-btn next-set-edit-btn--mobile"
          :disabled="!canEditNextSet"
          @click="$emit('edit-next-set')"
        >
          {{ t('subscription.dashboard.editComposition') }}
        </button>

        <footer v-if="nextSetDeliveryLine || deliveryAddress" class="next-set-delivery-footer">
          <AppIcon name="truck" :size="20" class="next-set-delivery-icon" aria-hidden="true" />
          <div class="next-set-delivery-text">
            <strong v-if="nextSetDeliveryLine">{{ nextSetDeliveryLine }}</strong>
            <span v-if="deliveryAddress">{{ deliveryAddress }}</span>
          </div>
        </footer>
      </article>
    </section>

    <section v-if="!isPaused" class="extra-toys-banner extra-toys-banner--dashboard">
      <div class="extra-toys-content">
        <AppIcon name="how-it-works" :size="28" class="extra-icon" />
        <div class="extra-text">
          <h4>{{ t('subscription.pricing.extraTitle') }}</h4>
          <p>
            {{ t('subscription.dashboard.extraBodyWithLimit', { n: toysLimit }) }}
          </p>
        </div>
      </div>
      <NuxtLink :to="localePath('/short-rent?from=subscription')" class="extra-rent-cta">
        {{ t('subscription.pricing.extraCta') }}
        <span aria-hidden="true">→</span>
      </NuxtLink>
    </section>

    <section v-if="setHistory.length" class="sub-history-section">
      <div class="sub-history-header">
        <span class="section-badge">{{ t('subscription.dashboard.historyBadge') }}</span>
        <h2 class="sub-history-title">{{ t('subscription.dashboard.historyTitle') }}</h2>
        <p class="sub-history-subtitle">{{ t('subscription.dashboard.historySubtitle') }}</p>
      </div>
      <ul class="set-history-list">
        <li v-for="item in setHistory" :key="item.id" class="set-history-item">
          <div class="set-history-main">
            <strong>{{ item.title }}</strong>
            <span class="set-history-status">{{ item.status_label }}</span>
          </div>
          <div class="set-history-meta">
            <span v-if="item.delivered_at">{{ t('subscription.dashboard.historyIssued', { date: item.delivered_at }) }}</span>
            <span v-if="item.return_due_date">{{ t('subscription.dashboard.historyReturnDue', { date: item.return_due_date }) }}</span>
            <span v-if="item.toys_count">{{ t('subscription.dashboard.historyToysShort', { n: item.toys_count }) }}</span>
          </div>
        </li>
      </ul>
    </section>
  </section>
</template>

<script setup lang="ts">
import DeliveryTracker from '~/components/DeliveryTracker.vue'
import ToysCompositionSheet from '~/components/subscription/ToysCompositionSheet.vue'
import type { ExchangeQuota } from '~/composables/useSubscriptions'
import {
  buildToyThumbSlots,
  formatToysCountLabel,
  toyDisplayName,
  toyImageSrc,
  type CompositionToyLike,
} from '~/utils/toysCompositionUi'

const { t } = useI18n()
const localePath = useLocalePath()

const props = defineProps<{
  isPaused: boolean
  freezeUsed: boolean
  pendingAction?: string | null
  pendingPickup?: boolean
  childName: string
  childAge: string
  plan: { name: string; price: string; features: string[]; isGift: boolean }
  pendingPlan?: {
    name: string
    effectiveOn: string
    status: string | null
    renewalAmount: number | null
    requiresExchange: boolean
  } | null
  nextBillingDate: string
  paidUntil?: string
  canRenew?: boolean
  renewalOverdue?: boolean
  renewalAmount?: number | null
  renewalAmountLabel?: string
  isRenewing?: boolean
  freezeEndFormatted: string
  toysInUse: number
  toysLimit: number
  nextDeliveryDate: string
  plannedExchangeDate?: string
  plannedExchangeSlot?: string
  returnDueDate?: string
  confirmedDeliverySlot?: string
  compositionEditUntil?: string | null
  canEditComposition?: boolean
  setHistory?: Array<{
    id: number
    title: string
    status: string
    status_label: string
    delivered_at?: string | null
    return_due_date?: string | null
    toys_count?: number
  }>
  currentBoxName?: string | null
  currentSetToys?: CompositionToyLike[]
  setStatusLabel: string
  setStatus: string
  deliveryTaskId: number | null
  deliveryTaskStatus?: string
  currentSetId: number | null
  trackedSetId?: number | null
  deliveryAddress: string
  deliveryTrackLink: string
  actionError: string
  isSubmitting: boolean
  isRequestingExchange: boolean
  exchangeQuota?: ExchangeQuota | null
  showNextSet?: boolean
  nextSetTitle?: string
  nextSetToysCount?: number
  nextSetBoxName?: string | null
  nextSetToys?: Array<{
    id: number
    name?: string
    title?: string
    image?: string
    image_url?: string
    skill?: string
    category?: { name?: string } | null
  }>
  nextSetPositions?: Array<{
    id: number
    selected_toy_id: number
    toy_name_snapshot?: string
    materials_snapshot?: string | null
    replace_enabled?: boolean
    alternatives?: Array<{
      id: number
      name: string
      materials?: string | null
      is_primary?: boolean
    }>
  }>
  nextSetId?: number | null
  nextSetStatus?: string
  isFirstSetCycle?: boolean
  isReplacingPosition?: boolean
  canEditNextSet?: boolean
}>()

const emit = defineEmits<{
  'open-gift': []
  'show-plans': []
  'cancel-plan-change': []
  freeze: []
  cancel: []
  resume: []
  renew: []
  'view-toys': []
  exchange: []
  reschedule: []
  'edit-next-set': []
  'replace-position': [{ positionId: number; toyId: number }]
}>()

const formatPendingAmount = (amount: number) =>
  new Intl.NumberFormat('ru-RU').format(Math.round(amount))

const canRenew = computed(() => !!props.canRenew)
const renewalOverdue = computed(() => !!props.renewalOverdue)
const paidUntil = computed(() => props.paidUntil || '')
const renewalAmountLabel = computed(() => props.renewalAmountLabel || '')
const isRenewing = computed(() => !!props.isRenewing)
const isFirstSetCycle = computed(() => !!props.isFirstSetCycle)
const nextSetStatus = computed(() => props.nextSetStatus || '')
const trackedSetId = computed(() => props.trackedSetId ?? props.currentSetId)

const isCompositionSheetOpen = ref(false)
const openCompositionBtnRef = ref<HTMLButtonElement | null>(null)

const limitCardTitle = computed(() => {
  if (isFirstSetCycle.value) {
    return nextSetStatus.value === 'delivering'
      ? t('subscription.dashboard.firstSetInDelivery')
      : t('subscription.dashboard.firstSetPreparingTitle')
  }
  return t('subscription.dashboard.toysAtHomePlain', { used: props.toysInUse, limit: props.toysLimit })
})

const compositionToys = computed((): CompositionToyLike[] => {
  if (props.currentSetToys?.length && ['in_use', 'returning'].includes(props.setStatus)) {
    return props.currentSetToys
  }
  if (props.nextSetToys?.length) return props.nextSetToys
  if (props.currentSetToys?.length) return props.currentSetToys
  return []
})

const compositionPreviewCount = computed(() => {
  if (props.currentSetToys?.length && ['in_use', 'returning'].includes(props.setStatus)) {
    return props.currentSetToys.length
  }
  if (props.nextSetToys?.length) return props.nextSetToys.length
  if (props.currentSetToys?.length) return props.currentSetToys.length
  return props.toysInUse || 0
})

const thumbSlots = computed(() => buildToyThumbSlots(compositionToys.value, 5))
const nextSetToys = computed(() => props.nextSetToys || [])
const currentSetToys = computed(() => props.currentSetToys || [])
const nextSetHasComposition = computed(() => nextSetToys.value.length > 0)

const nextSetCardTitle = computed(() =>
  isFirstSetCycle.value
    ? t('subscription.dashboard.firstSetCardTitle')
    : t('subscription.dashboard.nextSetCardTitle'),
)

const nextSetMetaLine = computed(() => {
  const parts: string[] = []
  const boxLabel = props.nextSetBoxName || props.nextSetTitle
  if (boxLabel) parts.push(boxLabel)
  const count = nextSetToys.value.length || props.nextSetToysCount || props.toysLimit
  if (count) parts.push(t('subscription.dashboard.nextSetMetaToys', { n: count }))
  if (props.plan?.name) parts.push(props.plan.name)
  return parts.join(' · ')
})

const nextSetStatusBadgeLabel = computed(() => {
  if (nextSetHasComposition.value) {
    return t('subscription.dashboard.compositionFormed')
  }
  return t('subscription.dashboard.compositionPending')
})

const nextSetDeliveryLine = computed(() => {
  const when = props.confirmedDeliverySlot || props.plannedExchangeSlot || props.nextDeliveryDate
  if (!when) return ''
  return t('subscription.dashboard.nextSetDeliveryLine', { when })
})

const toyCategoryLabel = (toy: (typeof nextSetToys.value)[number]) =>
  toy.category?.name || toy.skill || ''

const openCompositionSheet = () => {
  isCompositionSheetOpen.value = true
}

const closeCompositionSheet = async () => {
  if (!isCompositionSheetOpen.value) return
  isCompositionSheetOpen.value = false
  await nextTick()
  openCompositionBtnRef.value?.focus()
}

watch(
  () => [props.currentSetId, props.nextSetId, props.toysInUse, props.setStatus] as const,
  () => {
    if (isCompositionSheetOpen.value) isCompositionSheetOpen.value = false
  },
)

const trackerFallbackStatus = computed(() => {
  // Prefer inbound set status for delivery UI; never fall back to cancelled/returned.
  if (nextSetStatus.value && ['assembling', 'delivering'].includes(nextSetStatus.value)) {
    return nextSetStatus.value
  }
  if (props.setStatus && ['in_use', 'returning'].includes(props.setStatus)) {
    return props.setStatus
  }
  return nextSetStatus.value || ''
})

const compositionEditUntilLabel = computed(() => {
  if (!props.compositionEditUntil) return ''
  try {
    return new Date(props.compositionEditUntil).toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return props.compositionEditUntil
  }
})

const canRequestExchange = computed(() => {
  if (props.setStatus === 'returning') return false
  const quota = props.exchangeQuota
  if (!quota) return true
  return !!(quota.can_request || quota.can_purchase_extra)
})

const setHistory = computed(() => props.setHistory || [])
const compositionEditLocked = computed(() => props.canEditComposition === false)
const replaceablePositions = computed(() => {
  if (!props.canEditNextSet) return []
  return (props.nextSetPositions || []).filter(
    p => p.replace_enabled && Array.isArray(p.alternatives) && p.alternatives.length > 1,
  )
})

const onReplacePosition = (positionId: number, event: Event) => {
  const target = event.target as HTMLSelectElement | null
  const toyId = Number(target?.value)
  if (!toyId || Number.isNaN(toyId)) return
  const current = (props.nextSetPositions || []).find(p => p.id === positionId)
  if (current && current.selected_toy_id === toyId) return
  emit('replace-position', { positionId, toyId })
}

const exchangeButtonLabel = computed(() => {
  if (props.isRequestingExchange) return t('subscription.dashboard.exchangeSending')
  if (props.setStatus === 'returning') return t('subscription.dashboard.exchangeBtnRequested')
  if (props.exchangeQuota?.can_purchase_extra && !props.exchangeQuota?.can_request) {
    const price = props.exchangeQuota.extra_exchange_price
    return price ? t('subscription.dashboard.exchangeBtnExtra', { price }) : t('subscription.dashboard.exchangeExtraPlain')
  }
  return t('subscription.dashboard.exchangeBtnDefault')
})
</script>

<style scoped>
.inline-icon {
  flex-shrink: 0;
  vertical-align: middle;
}

.freeze-used-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 11px 14px;
  border: 1px solid #d6e0d5;
  border-radius: 14px;
  background: #f2f5f1;
  color: #526653;
}

.freeze-used-note span {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.freeze-used-note strong,
.freeze-used-note small {
  line-height: 1.25;
}

.freeze-used-note small {
  color: #747c74;
  font-size: 11px;
}

.gift-act-btn,
.freeze-btn,
.paused-badge,
.gift-badge,
.plan-price.gift-price,
.exchange-reschedule-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.inline-meta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.next-set-card {
  background: #fff;
  border-radius: 20px;
  padding: 24px 28px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
}

.next-set-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.next-set-card-head-main {
  flex: 1;
  min-width: 0;
}

.next-set-card-title {
  margin: 0 0 8px;
  font-family: 'Manrope', sans-serif;
  font-size: clamp(1.35rem, 2.5vw, 1.75rem);
  font-weight: 800;
  color: #262626;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.next-set-card-meta {
  margin: 0 0 14px;
  font-size: 0.9rem;
  color: #6f746f;
  line-height: 1.4;
}

.next-set-status-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 16px;
}

.next-set-status-badge {
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  border-radius: 999px;
  background: #dce6d8;
  color: #3f6757;
  font-family: 'Manrope', sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
}

.next-set-status-badge.is-pending {
  background: #f4f1ea;
  color: #7a7480;
}

.next-set-deadline {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  color: #6f746f;
}

.next-set-deadline--muted {
  color: #92400e;
}

.next-set-card-hint {
  margin: 12px 0 0;
  font-size: 0.875rem;
  color: #6f746f;
  line-height: 1.45;
}

.next-set-edit-btn {
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: opacity 0.15s ease, background 0.15s ease;
}

.next-set-edit-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.next-set-edit-btn--desktop {
  flex-shrink: 0;
  padding: 10px 18px;
  border: 1px solid #262626;
  border-radius: 999px;
  background: #fff;
  color: #262626;
}

.next-set-edit-btn--desktop:not(:disabled):hover {
  background: #faf8f4;
}

.next-set-edit-btn--mobile {
  display: none;
  width: 100%;
  margin-top: 20px;
  padding: 14px 18px;
  border: none;
  border-radius: 14px;
  background: #3f6757;
  color: #fff;
}

.next-set-kit-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
  margin-top: 22px;
}

.next-set-kit-item {
  min-width: 0;
}

.next-set-kit-img-wrap {
  aspect-ratio: 1;
  border-radius: 14px;
  overflow: hidden;
  background: #f4f1ea;
  border: 1px solid rgba(45, 42, 50, 0.06);
}

.next-set-kit-img-wrap :deep(.next-set-kit-img),
.next-set-kit-img-wrap :deep(.app-img),
.next-set-kit-img-wrap :deep(.image-fallback-placeholder) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.next-set-kit-text {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.next-set-kit-text strong {
  font-size: 0.88rem;
  font-weight: 700;
  color: #262626;
  line-height: 1.25;
}

.next-set-kit-text span {
  font-size: 0.75rem;
  color: #6f746f;
}

.next-set-delivery-footer {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 22px;
  padding-top: 20px;
  border-top: 1px solid rgba(45, 42, 50, 0.08);
}

.next-set-delivery-icon {
  flex-shrink: 0;
  color: #3f6757;
  margin-top: 2px;
}

.next-set-delivery-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.next-set-delivery-text strong {
  font-size: 0.95rem;
  font-weight: 700;
  color: #262626;
}

.next-set-delivery-text span {
  font-size: 0.85rem;
  color: #6f746f;
  line-height: 1.35;
}

.current-set-toys-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.next-set-toy-card {
  border: 1px solid rgba(45, 42, 50, 0.08);
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}

.next-set-toy-img {
  width: 100%;
  height: 110px;
  object-fit: cover;
  display: block;
}

.next-set-toy-meta {
  padding: 10px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.next-set-toy-meta strong {
  font-size: 0.9rem;
  line-height: 1.25;
}

.next-set-toy-meta span {
  font-size: 0.75rem;
  color: #6b6570;
}

.paused-info-banner,
.pending-pickup-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  margin: 12px 0;
}

.paused-info-banner {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  color: #0369a1;
}

.pending-pickup-banner {
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
}

.pickup-icon {
  color: #d97706;
  flex-shrink: 0;
}

.pickup-text strong {
  display: block;
  margin-bottom: 2px;
  font-size: 0.95rem;
}

.pickup-text p {
  font-size: 0.825rem;
  margin-bottom: 6px;
  line-height: 1.4;
  color: #78350f;
}

.pickup-track-link {
  display: inline-block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #b45309;
  text-decoration: underline;
}

.exchange-banner-info {
  flex: 1;
  min-width: 0;
}

.exchange-planned-line,
.exchange-meta-line {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.exchange-planned-line {
  margin-top: 4px;
}

.exchange-meta-line {
  margin-top: 8px;
  font-size: 0.9rem;
  color: #5c5660;
}

.exchange-field-label {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: #7a7480;
  line-height: 1.3;
}

.exchange-planned-value,
.exchange-field-value {
  display: block;
  overflow-wrap: anywhere;
  word-break: normal;
  line-height: 1.35;
}

.exchange-planned-value {
  margin-top: 2px;
  font-size: 1.05rem;
  font-weight: 800;
  color: #262626;
}

.exchange-quota-block {
  margin-top: 10px;
}

.exchange-quota-stats {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--green-ink, #3f6757);
  line-height: 1.35;
}

.exchange-quota-period {
  margin: 4px 0 0;
  font-size: 0.78rem;
  font-weight: 500;
  color: #8a8490;
  line-height: 1.35;
}

@media (max-width: 768px) {
  .exchange-banner-inline {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    padding: 18px 16px;
  }

  .exchange-banner-info {
    width: 100%;
  }

  .exchange-banner-inline :deep(h3) {
    width: 100%;
  }

  .exchange-actions-col {
    width: 100%;
  }

  .exchange-actions-col :deep(.exchange-inline-btn),
  .exchange-actions-col :deep(.exchange-reschedule-btn) {
    width: 100%;
    justify-content: center;
    white-space: normal;
  }
}

.sub-history-section {
  margin-top: 28px;
}

.sub-history-header {
  margin-bottom: 14px;
}

.sub-history-title {
  margin: 6px 0 4px;
  font-size: 1.35rem;
}

.sub-history-subtitle {
  margin: 0;
  color: #6b6570;
  font-size: 0.9rem;
}

.set-history-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.set-history-item {
  padding: 12px 14px;
  border: 1px solid rgba(45, 42, 50, 0.08);
  border-radius: 12px;
  background: #fff;
}

.set-history-main {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: baseline;
}

.set-history-status {
  font-size: 0.8rem;
  color: #6b6570;
  white-space: nowrap;
}

.set-history-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  margin-top: 6px;
  font-size: 0.8rem;
  color: #747c74;
}

.next-set-positions {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.next-set-replace-hint {
  margin: 0;
  font-size: 0.9rem;
  color: #5c5660;
}

.next-set-position-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border: 1px solid rgba(45, 42, 50, 0.08);
  border-radius: 12px;
  background: #fff;
}

.next-set-position-current {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.next-set-position-current span {
  font-size: 0.8rem;
  color: #6b6570;
}

.next-set-replace-select {
  min-width: 220px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(45, 42, 50, 0.15);
  background: #fafafa;
}

.renew-pay-btn {
  margin-top: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  border: none;
  border-radius: 12px;
  background: #3F6757;
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
}

.renew-pay-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.renewal-overdue-hint {
  margin: 8px 0 0;
  font-size: 0.82rem;
  color: #b45309;
  line-height: 1.35;
}

.limit-card-title-mobile,
.toys-thumb-row,
.toys-thumb-empty,
.view-composition-btn-mobile {
  display: none;
}

.toys-thumb-row {
  display: none;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  margin: 14px 0 12px;
  width: 100%;
}

.toys-thumb-cell {
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  background: #f1f5f9;
  border: 1px solid rgba(45, 42, 50, 0.08);
}

.toys-thumb-cell :deep(.toys-thumb-img),
.toys-thumb-cell :deep(.app-img),
.toys-thumb-cell :deep(.image-fallback-placeholder) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.toys-thumb-cell :deep(.fallback-text) {
  display: none;
}

.toys-thumb-cell :deep(.fallback-svg) {
  width: 18px;
  height: 18px;
}

.toys-thumb-more {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f4f1ea;
  color: #3f6757;
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 0.92rem;
}

.view-composition-btn-mobile {
  width: 100%;
  margin-top: 4px;
  padding: 12px 14px;
  border: 1px solid rgba(63, 103, 87, 0.22);
  border-radius: 14px;
  background: #fff;
  color: #3f6757;
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  text-align: center;
}

.view-composition-btn-mobile:focus-visible {
  outline: 2px solid #3f6757;
  outline-offset: 2px;
}

@media (max-width: 768px) {
  .limit-card-label-desktop,
  .limit-card-title-desktop,
  .limit-card-limit-desktop,
  .limit-card-box-desktop,
  .limit-footer-desktop,
  .current-set-toys-grid {
    display: none !important;
  }

  .next-set-card {
    padding: 18px 16px;
  }

  .next-set-card-header {
    flex-direction: column;
    gap: 0;
  }

  .next-set-edit-btn--desktop {
    display: none;
  }

  .next-set-edit-btn--mobile {
    display: block;
  }

  .next-set-kit-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-top: 18px;
  }

  .limit-card-title-mobile {
    display: block;
    margin: 0 0 8px;
    font-family: 'Manrope', sans-serif;
    font-size: 1.15rem;
    font-weight: 800;
    color: #262626;
    line-height: 1.25;
  }

  .toys-thumb-row {
    display: grid;
  }

  .toys-thumb-empty {
    display: block;
    margin: 12px 0 8px;
  }

  .view-composition-btn-mobile {
    display: block;
  }
}
</style>
