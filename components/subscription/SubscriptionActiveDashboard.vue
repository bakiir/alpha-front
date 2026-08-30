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
          <span>👶 {{ childName }}</span>
          <span v-if="childAge"> · {{ childAge }}</span>
        </div>
      </div>

      <div class="header-right">
        <button class="gift-act-btn" type="button" @click="$emit('open-gift')">
          🎁 Активировать сертификат
        </button>
        <button class="view-plans-toggle-btn" type="button" @click="$emit('show-plans')">
          Сменить или посмотреть все тарифы →
        </button>
      </div>
    </div>

    <div class="sub-grid-section">
      <div class="plan-card" :class="{ 'is-paused-card': isPaused }">
        <div class="plan-badge-row">
          <span v-if="isPaused" class="paused-badge">❄️ ЗАМОРОЖЕНА</span>
          <span v-else class="active-badge">АКТИВЕН</span>
          <span v-if="plan.isGift" class="gift-badge">🎁 Подарок</span>
        </div>

        <h2 class="plan-name">{{ plan.name }}</h2>

        <div class="plan-price-row">
          <template v-if="plan.isGift">
            <span class="plan-price gift-price">🎁 Подарочная</span>
            <span v-if="nextBillingDate" class="plan-period">до {{ nextBillingDate }}</span>
          </template>
          <template v-else>
            <span class="plan-price">{{ plan.price }}</span>
            <span class="plan-period">/ месяц</span>
          </template>
        </div>

        <div v-if="isPaused" class="paused-info-banner">
          <span class="pause-icon">❄️</span>
          <div class="pause-text">
            <strong>Заморозка до {{ freezeEndFormatted }}</strong>
            <p>Списания и доставки приостановлены. Игрушки остаются у вас дома.</p>
          </div>
        </div>

        <ul class="plan-features">
          <li v-for="(feat, idx) in plan.features" :key="idx">
            <span class="feat-dot">●</span>
            <span>{{ feat }}</span>
          </li>
        </ul>

        <div class="plan-actions-group">
          <button class="change-plan-btn" type="button" @click="$emit('show-plans')">
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
          <button v-else class="freeze-btn" type="button" @click="$emit('freeze')">
            ❄️ Заморозить подписку
          </button>

          <button
            class="cancel-sub-btn"
            type="button"
            :disabled="isSubmitting"
            @click="$emit('cancel')"
          >
            Отменить подписку
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
          <p v-if="setStatusLabel" class="card-sub-info">Статус набора: {{ setStatusLabel }}</p>
          <div class="progress-track">
            <div
              class="progress-fill"
              :style="{ width: `${Math.min(100, toysLimit ? (toysInUse / toysLimit) * 100 : 0)}%` }"
            />
          </div>
          <div class="limit-footer">
            <button type="button" class="view-toys-btn-link" @click="$emit('view-toys')">
              Посмотреть игрушки в наборе ({{ toysInUse || toysLimit }} шт.) →
            </button>
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
          <p v-if="plannedExchangeDate">Плановая дата обмена: {{ plannedExchangeDate }}</p>
          <p v-else-if="setStatus === 'returning'">Запрос на обмен принят — курьер заберёт текущий набор.</p>
          <p v-else>Мы подготовим новую подборку после возврата текущего комплекта.</p>
        </div>
        <div class="exchange-actions-col">
          <button
            v-if="setStatus !== 'returning'"
            type="button"
            class="exchange-reschedule-btn"
            @click="$emit('reschedule')"
          >
            📅 Перенести дату
          </button>
          <button
            type="button"
            class="exchange-inline-btn"
            :disabled="isRequestingExchange || setStatus === 'returning'"
            @click="$emit('exchange')"
          >
            {{ isRequestingExchange ? 'Отправляем...' : (setStatus === 'returning' ? 'Обмен запрошен' : 'Запросить обмен') }}
          </button>
        </div>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import DeliveryTracker from '~/components/DeliveryTracker.vue'

defineProps<{
  isPaused: boolean
  childName: string
  childAge: string
  plan: { name: string; price: string; features: string[]; isGift: boolean }
  nextBillingDate: string
  freezeEndFormatted: string
  toysInUse: number
  toysLimit: number
  nextDeliveryDate: string
  plannedExchangeDate?: string
  setStatusLabel: string
  setStatus: string
  deliveryTaskId: number | null
  currentSetId: number | null
  deliveryAddress: string
  deliveryTrackLink: string
  actionError: string
  isSubmitting: boolean
  isRequestingExchange: boolean
}>()

defineEmits<{
  'open-gift': []
  'show-plans': []
  freeze: []
  cancel: []
  resume: []
  'view-toys': []
  exchange: []
  reschedule: []
}>()
</script>
