<template>
  <section class="active-sub-view">
    <div class="sub-header-section">
      <div class="header-left">
        <span class="section-badge">ЛИЧНЫЙ КАБИНЕТ</span>
        <h1 class="sub-main-title">Управление подпиской</h1>
        <p class="sub-subtitle">
          {{ isPaused ? 'Ваша подписка временно заморожена. Вы можете возобновить её в любой момент.' : 'Ваш текущий тариф активен. Управляйте наборами, доставкой и условиями.' }}
        </p>
        <div v-if="childName" class="sub-child-meta">
          <span class="inline-meta"><AppIcon name="baby" :size="14" class="inline-icon" /> {{ childName }}</span>
          <span v-if="childAge"> · {{ childAge }}</span>
        </div>
      </div>

      <div class="header-right">
        <button class="gift-act-btn" type="button" @click="$emit('open-gift')">
          <AppIcon name="gift" :size="16" class="inline-icon" /> Активировать сертификат
        </button>
        <button class="view-plans-toggle-btn" type="button" @click="$emit('show-plans')">
          Сменить или посмотреть все тарифы →
        </button>
      </div>
    </div>

    <div class="sub-grid-section">
      <div class="plan-card" :class="{ 'is-paused-card': isPaused }">
        <div class="plan-badge-row">
          <span v-if="isPaused" class="paused-badge"><AppIcon name="snowflake" :size="14" class="inline-icon" /> ЗАМОРОЖЕНА</span>
          <span v-else class="active-badge">АКТИВЕН</span>
          <span v-if="plan.isGift" class="gift-badge"><AppIcon name="gift" :size="14" class="inline-icon" /> Подарок</span>
        </div>

        <h2 class="plan-name">{{ plan.name }}</h2>

        <div class="plan-price-row">
          <template v-if="plan.isGift">
            <span class="plan-price gift-price"><AppIcon name="gift" :size="16" class="inline-icon" /> Подарочная</span>
            <span v-if="nextBillingDate" class="plan-period">до {{ nextBillingDate }}</span>
          </template>
          <template v-else>
            <span class="plan-price">{{ plan.price }}</span>
            <span class="plan-period">/ месяц</span>
          </template>
        </div>

        <div v-if="pendingPickup" class="pending-pickup-banner">
          <AppIcon name="truck" :size="20" class="pickup-icon" />
          <div class="pickup-text">
            <template v-if="pendingAction === 'pause' && deliveryTaskStatus === 'return_to_warehouse'">
              <strong>Курьер возвращает набор на склад</strong>
              <p>Заморозка начнётся автоматически после приёмки набора на складе.</p>
            </template>
            <template v-else>
              <strong>Курьер заберёт игрушки перед {{ pendingAction === 'pause' ? 'заморозкой' : 'отменой' }}</strong>
              <p>Мы назначили выезд курьера. Подписка будет {{ pendingAction === 'pause' ? 'заморожена' : 'отменена' }} автоматически после возврата набора.</p>
            </template>
            <NuxtLink v-if="deliveryTrackLink" :to="deliveryTrackLink" class="pickup-track-link">
              Отследить курьера →
            </NuxtLink>
          </div>
        </div>

        <div v-else-if="isPaused" class="paused-info-banner">
          <AppIcon name="snowflake" :size="20" class="pause-icon" />
          <div class="pause-text">
            <strong>Заморозка до {{ freezeEndFormatted }}</strong>
            <p>Списания и доставки приостановлены. Игрушки возвращены на склад.</p>
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
            Изменить тарифный план
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
            {{ isSubmitting ? 'Возобновляем...' : '▶ Разморозить подписку' }}
          </button>
          <div v-else-if="freezeUsed && !pendingPickup" class="freeze-used-note">
            <AppIcon name="check" :size="16" class="inline-icon" />
            <span><strong>Заморозка использована</strong><small>Повторная заморозка недоступна</small></span>
          </div>
          <button v-else class="freeze-btn" type="button" :disabled="pendingPickup || isSubmitting" @click="$emit('freeze')">
            <AppIcon name="snowflake" :size="16" class="inline-icon" /> {{ pendingPickup && pendingAction === 'pause' ? 'Забор игрушек...' : 'Заморозить подписку' }}
          </button>

          <button
            class="cancel-sub-btn"
            type="button"
            :disabled="pendingPickup || isSubmitting"
            @click="$emit('cancel')"
          >
            {{ pendingPickup && pendingAction === 'cancel' ? 'Ожидается возврат...' : 'Отменить подписку' }}
          </button>
        </div>
      </div>

      <div class="right-stack">
        <div class="status-card payment-card">
          <div class="card-text-col">
            <span class="card-small-label">{{ isPaused ? 'Списание заморожено' : 'Следующее списание' }}</span>
            <h3 class="card-main-val">{{ nextBillingDate || '—' }}</h3>
            <p class="card-sub-info">{{ plan.price }} • продление подписки</p>
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
          <span class="card-small-label">Текущая утилизация лимита</span>
          <h3 class="card-main-val">{{ toysInUse }} из {{ toysLimit }} игрушек дома</h3>
          <p v-if="nextDeliveryDate" class="card-sub-info">Следующая доставка: {{ nextDeliveryDate }}</p>
          <p v-if="currentBoxName" class="card-sub-info">Готовый комплект: {{ currentBoxName }}</p>
          <p v-if="setStatusLabel" class="card-sub-info">Статус набора: {{ setStatusLabel }}</p>
          <div class="progress-track">
            <div
              class="progress-fill"
              :style="{ width: `${Math.min(100, toysLimit ? (toysInUse / toysLimit) * 100 : 0)}%` }"
            />
          </div>
          <div class="limit-footer">
            <button type="button" class="view-toys-btn-link" @click="$emit('view-toys')">
              Посмотреть состав комплекта ({{ toysInUse || toysLimit }} шт.) →
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
        </div>
      </div>
    </div>

    <section class="sub-delivery-section">
      <div class="sub-delivery-header">
        <div>
          <span class="section-badge">ДОСТАВКА</span>
          <h2 class="sub-delivery-title">Где мой набор?</h2>
          <p class="sub-delivery-subtitle">Отслеживайте статус сборки и доставку курьером в реальном времени.</p>
        </div>
        <NuxtLink
          v-if="deliveryTaskId || currentSetId"
          :to="deliveryTrackLink"
          class="full-delivery-link"
        >
          Полная страница отслеживания →
        </NuxtLink>
      </div>

      <DeliveryTracker
        :task-id="deliveryTaskId"
        :subscription-set-id="currentSetId"
        :fallback-status="setStatus"
        :fallback-scheduled-time="nextDeliveryDate || undefined"
        :fallback-address="deliveryAddress || undefined"
        compact
        :show-courier-card="!isPaused"
      />
    </section>

    <section v-if="['in_use', 'delivering', 'returning'].includes(setStatus)" class="sub-exchange-section">
      <div class="exchange-banner-inline">
        <div>
          <h3>Хотите новый набор?</h3>
          <p>
            Плановая дата обмена:
            <strong>{{ plannedExchangeDate || 'Дата обмена не выбрана' }}</strong>
          </p>
          <p v-if="confirmedDeliverySlot" class="exchange-meta-line">
            Подтверждённый интервал доставки: {{ confirmedDeliverySlot }}
          </p>
          <p v-if="returnDueDate" class="exchange-meta-line">
            Срок возврата текущего комплекта: {{ returnDueDate }}
          </p>
          <p v-else-if="setStatus === 'returning'">Запрос на обмен принят — курьер заберёт текущий набор.</p>
          <p v-if="exchangeQuota" class="exchange-quota-line">
            Обмены за период
            <template v-if="exchangeQuota.period_start && exchangeQuota.period_end">
              ({{ exchangeQuota.period_start }} — {{ exchangeQuota.period_end }})
            </template>:
            использовано {{ exchangeQuota.used }} из {{ exchangeQuota.limit }}
            <template v-if="exchangeQuota.planned"> · запланирован обмен</template>
            <template v-if="exchangeQuota.remaining > 0"> · осталось {{ exchangeQuota.remaining }}</template>
            <template v-else-if="exchangeQuota.can_purchase_extra && exchangeQuota.extra_exchange_price">
              · доп. обмен {{ exchangeQuota.extra_exchange_price }} ₸
            </template>
          </p>
        </div>
        <div class="exchange-actions-col">
          <button
            v-if="setStatus !== 'returning'"
            type="button"
            class="exchange-reschedule-btn"
            @click="$emit('reschedule')"
          >
            <AppIcon name="calendar" :size="16" class="inline-icon" /> Перенести дату
          </button>
          <button
            type="button"
            class="exchange-inline-btn"
            :disabled="isRequestingExchange || setStatus === 'returning' || !canRequestExchange"
            @click="$emit('exchange')"
          >
            {{ exchangeButtonLabel }}
          </button>
        </div>
      </div>
    </section>

    <section v-if="showNextSet" class="sub-next-set-section">
      <div class="next-set-banner">
        <div class="next-set-banner-text">
          <span class="section-badge">СЛЕДУЮЩИЙ НАБОР</span>
          <h3>{{ nextSetTitle }}</h3>
          <p v-if="nextSetBoxName" class="next-set-box-label">Готовый комплект: {{ nextSetBoxName }}</p>
          <p v-if="nextSetToys.length">В комплекте {{ nextSetToys.length }} игрушек. Можно изменить состав до 00:00 в день обмена.</p>
          <p v-else>Мы подготовим комплект автоматически. Вы можете выбрать игрушки заранее (до 00:00 в день обмена).</p>
          <p v-if="!canEditNextSet && compositionEditLocked" class="next-set-deadline-note">
            Срок изменения состава истёк — правки закрыты за сутки до обмена.
          </p>
        </div>
        <button
          type="button"
          class="exchange-reschedule-btn"
          :disabled="!canEditNextSet"
          @click="$emit('edit-next-set')"
        >
          Изменить комплект
        </button>
      </div>

      <div v-if="replaceablePositions.length" class="next-set-positions">
        <p class="next-set-replace-hint">Можно заменить игрушку в позиции (из списка разрешённых альтернатив):</p>
        <div
          v-for="position in replaceablePositions"
          :key="position.id"
          class="next-set-position-row"
        >
          <div class="next-set-position-current">
            <strong>{{ position.toy_name_snapshot }}</strong>
            <span v-if="position.materials_snapshot">Материалы: {{ position.materials_snapshot }}</span>
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
              {{ alt.name }}{{ alt.materials ? ` · ${alt.materials}` : '' }}{{ alt.is_primary ? ' (основная)' : '' }}
            </option>
          </select>
        </div>
      </div>

      <div v-else-if="nextSetToys.length" class="next-set-toys-grid">
        <div
          v-for="toy in nextSetToys"
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
            <span v-if="toy.category?.name || toy.skill">{{ toy.category?.name || toy.skill }}</span>
          </div>
        </div>
      </div>
    </section>

    <section v-if="!isPaused" class="extra-toys-banner extra-toys-banner--dashboard">
      <div class="extra-toys-content">
        <AppIcon name="how-it-works" :size="28" class="extra-icon" />
        <div class="extra-text">
          <h4>Хотите ещё больше игрушек?</h4>
          <p>
            В тарифе {{ toysLimit }} игрушек. Если нужно больше — оформите дополнительную игрушку
            как обычную аренду. Мы отправим её вместе с набором подписки.
          </p>
        </div>
      </div>
      <NuxtLink to="/short-rent?from=subscription" class="extra-rent-cta">
        Выбрать игрушку в аренду
        <span aria-hidden="true">→</span>
      </NuxtLink>
    </section>

    <section v-if="setHistory.length" class="sub-history-section">
      <div class="sub-history-header">
        <span class="section-badge">ИСТОРИЯ</span>
        <h2 class="sub-history-title">Выдачи и возвраты</h2>
        <p class="sub-history-subtitle">Предыдущие комплекты вашей подписки.</p>
      </div>
      <ul class="set-history-list">
        <li v-for="item in setHistory" :key="item.id" class="set-history-item">
          <div class="set-history-main">
            <strong>{{ item.title }}</strong>
            <span class="set-history-status">{{ item.status_label }}</span>
          </div>
          <div class="set-history-meta">
            <span v-if="item.delivered_at">Выдан: {{ item.delivered_at }}</span>
            <span v-if="item.return_due_date">Срок возврата: {{ item.return_due_date }}</span>
            <span v-if="item.toys_count">{{ item.toys_count }} игр.</span>
          </div>
        </li>
      </ul>
    </section>
  </section>
</template>

<script setup lang="ts">
import DeliveryTracker from '~/components/DeliveryTracker.vue'
import type { ExchangeQuota } from '~/composables/useSubscriptions'

const props = defineProps<{
  isPaused: boolean
  freezeUsed: boolean
  pendingAction?: string | null
  pendingPickup?: boolean
  childName: string
  childAge: string
  plan: { name: string; price: string; features: string[]; isGift: boolean }
  nextBillingDate: string
  freezeEndFormatted: string
  toysInUse: number
  toysLimit: number
  nextDeliveryDate: string
  plannedExchangeDate?: string
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
  currentSetToys?: Array<{
    id: number
    name?: string
    title?: string
    image?: string
    image_url?: string
  }>
  setStatusLabel: string
  setStatus: string
  deliveryTaskId: number | null
  deliveryTaskStatus?: string
  currentSetId: number | null
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
  isReplacingPosition?: boolean
  canEditNextSet?: boolean
}>()

const emit = defineEmits<{
  'open-gift': []
  'show-plans': []
  freeze: []
  cancel: []
  resume: []
  'view-toys': []
  exchange: []
  reschedule: []
  'edit-next-set': []
  'replace-position': [{ positionId: number; toyId: number }]
}>()

const canRequestExchange = computed(() => {
  if (props.setStatus === 'returning') return false
  const quota = props.exchangeQuota
  if (!quota) return true
  return !!(quota.can_request || quota.can_purchase_extra)
})

const nextSetToys = computed(() => props.nextSetToys || [])
const currentSetToys = computed(() => props.currentSetToys || [])
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
  if (props.isRequestingExchange) return 'Отправляем...'
  if (props.setStatus === 'returning') return 'Обмен запрошен'
  if (props.exchangeQuota?.can_purchase_extra && !props.exchangeQuota?.can_request) {
    const price = props.exchangeQuota.extra_exchange_price
    return price ? `Доп. обмен · ${price} ₸` : 'Дополнительный обмен'
  }
  return 'Запросить обмен'
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

.next-set-box-label {
  margin: 6px 0 0;
  font-weight: 600;
  color: var(--color-text, #2d2a32);
}

.next-set-banner {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.next-set-banner-text {
  flex: 1;
  min-width: 220px;
}

.next-set-deadline-note {
  margin: 8px 0 0;
  font-size: 0.85rem;
  color: #92400e;
}

.next-set-toys-grid,
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

.exchange-meta-line,
.exchange-quota-line {
  margin-top: 6px;
  font-size: 0.9rem;
  color: #5c5660;
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
</style>
