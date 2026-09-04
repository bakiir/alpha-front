<template>
  <div class="notif-bell-wrap" ref="bellWrapRef">
    <!-- Bell Button -->
    <button
      class="notif-bell-btn"
      :class="{ 'has-unread': unreadCount > 0, 'is-open': isOpen }"
      @click="togglePanel"
      aria-label="Уведомления"
      :title="`Уведомления${unreadCount > 0 ? ` (${unreadCount} новых)` : ''}`"
    >
      <!-- Bell SVG -->
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      <!-- Unread badge -->
      <span v-if="unreadCount > 0" class="notif-badge" :class="{ 'is-shaking': isShaking }">
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>

    <!-- Dropdown Panel -->
    <Teleport to="body">
      <Transition name="notif-panel">
        <div
          v-if="isOpen"
          class="notif-panel-overlay"
          @click.self="isOpen = false"
        >
          <div class="notif-panel" :style="panelStyle">
            <!-- Panel Header -->
            <div class="notif-panel-head">
              <div class="notif-panel-title">
                <span class="notif-panel-icon">🔔</span>
                <span>Уведомления</span>
                <span v-if="unreadCount > 0" class="notif-count-pill">{{ unreadCount }}</span>
              </div>
              <div class="notif-panel-actions">
                <button
                  v-if="unreadCount > 0"
                  class="notif-read-all-btn"
                  @click="handleMarkAllRead"
                >
                  Прочитать все
                </button>
                <button class="notif-close-btn" @click="isOpen = false">✕</button>
              </div>
            </div>

            <!-- Notification List -->
            <div class="notif-list-scroll">
              <!-- Loading skeleton -->
              <div v-if="isLoading" class="notif-loading">
                <div v-for="i in 3" :key="i" class="notif-skel-item">
                  <div class="skel-icon-circle"></div>
                  <div class="skel-text-block">
                    <div class="skel-line skel-title"></div>
                    <div class="skel-line skel-body"></div>
                  </div>
                </div>
              </div>

              <!-- Empty state -->
              <div v-else-if="notifications.length === 0" class="notif-empty">
                <span class="notif-empty-icon">📭</span>
                <p>Пока нет уведомлений</p>
                <span>Здесь появятся события по вашим подаркам и подписке</span>
              </div>

              <!-- Notification items -->
              <TransitionGroup v-else name="notif-item" tag="div" class="notif-items-list">
                <div
                  v-for="notif in notifications"
                  :key="notif.id"
                  class="notif-item"
                  :class="{ 'is-unread': !notif.read_at }"
                  @click="handleNotifClick(notif)"
                >
                  <!-- Icon -->
                  <div class="notif-item-icon" :class="`type-${notif.type}`">
                    {{ notif.icon || '🔔' }}
                  </div>

                  <!-- Content -->
                  <div class="notif-item-content">
                    <div class="notif-item-head">
                      <strong class="notif-item-title">{{ notif.title }}</strong>
                      <span class="notif-item-time">{{ relativeTime(notif.created_at) }}</span>
                    </div>
                    <p class="notif-item-body">{{ notif.body }}</p>

                    <!-- Action link -->
                    <NuxtLink
                      v-if="notif.action_url"
                      :to="notif.action_url"
                      class="notif-item-action"
                      @click.stop="handleActionClick(notif)"
                    >
                      {{ notif.action_label || 'Подробнее →' }}
                    </NuxtLink>
                  </div>

                  <!-- Remove button -->
                  <button
                    class="notif-item-remove"
                    @click.stop="remove(notif.id)"
                    title="Удалить"
                  >✕</button>
                </div>
              </TransitionGroup>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { AppNotification } from '~/composables/useNotifications'

const {
  notifications,
  unreadCount,
  isLoading,
  hasFetched,
  fetchNotifications,
  markRead,
  markAllRead,
  remove,
  relativeTime,
} = useNotifications()

const { user } = useAuth()
const router = useRouter()

const isOpen = ref(false)
const isShaking = ref(false)
const bellWrapRef = ref<HTMLElement | null>(null)
const panelStyle = ref({})

// Shake bell when new unread arrives
let prevUnread = 0
watch(unreadCount, (val) => {
  if (val > prevUnread) {
    isShaking.value = true
    setTimeout(() => { isShaking.value = false }, 800)
  }
  prevUnread = val
})

// Fetch on mount if user logged in
onMounted(async () => {
  if (user.value && !hasFetched.value) {
    await fetchNotifications()
  }
  // Poll every 60s for new notifications
  pollInterval = setInterval(() => {
    if (user.value) fetchNotifications()
  }, 60000)
})

let pollInterval: ReturnType<typeof setInterval>
onUnmounted(() => {
  clearInterval(pollInterval)
})

// Position panel near the bell button
const togglePanel = async () => {
  if (!isOpen.value) {
    if (user.value && !hasFetched.value) {
      await fetchNotifications()
    }
    // Position panel below the bell button
    if (bellWrapRef.value) {
      const rect = bellWrapRef.value.getBoundingClientRect()
      panelStyle.value = {
        top: `${rect.bottom + window.scrollY + 8}px`,
        right: `${window.innerWidth - rect.right}px`,
      }
    }
  }
  isOpen.value = !isOpen.value
}

const handleNotifClick = async (notif: AppNotification) => {
  if (!notif.read_at) {
    await markRead(notif.id)
  }
  if (notif.action_url) {
    isOpen.value = false
    router.push(notif.action_url)
  }
}

const handleActionClick = async (notif: AppNotification) => {
  if (!notif.read_at) {
    await markRead(notif.id)
  }
  isOpen.value = false
}

const handleMarkAllRead = async () => {
  await markAllRead()
}

// Close on Escape
const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') isOpen.value = false
}
onMounted(() => document.addEventListener('keydown', onKeyDown))
onUnmounted(() => document.removeEventListener('keydown', onKeyDown))
</script>

<style scoped>
/* ── Bell button ───────────────────────────────────── */
.notif-bell-wrap {
  position: relative;
}

.notif-bell-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 10px;
  color: #555;
  transition: color 0.2s, background 0.2s;
}
.notif-bell-btn:hover,
.notif-bell-btn.is-open {
  color: #3F6757;
  background: #F4F1EA;
}
.notif-bell-btn.has-unread {
  color: #3F6757;
}

/* Badge */
.notif-badge {
  position: absolute;
  top: 0px;
  right: 2px;
  min-width: 18px;
  height: 18px;
  background: #EF4444;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid #fff;
  line-height: 1;
}

/* Shake animation */
@keyframes bell-shake {
  0%, 100% { transform: rotate(0deg); }
  15%       { transform: rotate(14deg); }
  30%       { transform: rotate(-12deg); }
  45%       { transform: rotate(10deg); }
  60%       { transform: rotate(-8deg); }
  75%       { transform: rotate(5deg); }
}
.notif-badge.is-shaking {
  animation: bell-shake 0.8s ease-in-out;
}

/* ── Dropdown panel ─────────────────────────────────── */
.notif-panel-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
}

.notif-panel {
  position: absolute;
  width: 380px;
  max-width: calc(100vw - 16px);
  max-height: 520px;
  background: #FAF8F4;
  border-radius: 20px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(51, 61, 54, 0.08);
  border: 1px solid #EDE9FE;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Panel header */
.notif-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px 12px;
  border-bottom: 1px solid #F4F1EA;
  flex-shrink: 0;
}
.notif-panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 15px;
  color: #262626;
}
.notif-panel-icon { font-size: 18px; }
.notif-count-pill {
  background: #3F6757;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 10px;
}
.notif-panel-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.notif-read-all-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  color: #3F6757;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.15s;
}
.notif-read-all-btn:hover { background: #F4F1EA; }
.notif-close-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #999;
  padding: 4px 6px;
  border-radius: 6px;
  transition: background 0.15s, color 0.15s;
}
.notif-close-btn:hover { background: #F5F5F5; color: #333; }

/* Scrollable list */
.notif-list-scroll {
  overflow-y: auto;
  flex: 1;
}

/* Empty state */
.notif-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  gap: 8px;
  text-align: center;
}
.notif-empty-icon { font-size: 40px; }
.notif-empty p {
  font-weight: 700;
  font-size: 15px;
  color: #333;
  margin: 0;
}
.notif-empty span { font-size: 13px; color: #888; }

/* Notification item */
.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 18px;
  cursor: pointer;
  transition: background 0.15s;
  position: relative;
  border-bottom: 1px solid #F5F4FB;
}
.notif-item:last-child { border-bottom: none; }
.notif-item:hover { background: #FAFAFE; }
.notif-item.is-unread { background: #FAF8F4; }
.notif-item.is-unread:hover { background: #EDE9FE; }

/* Unread dot */
.notif-item.is-unread::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #3F6757;
}

/* Icon circle */
.notif-item-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #F4F1EA;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
.notif-item-icon.type-gift_activated {
  background: linear-gradient(135deg, #FFF3CD, #FFE08A);
}

/* Content */
.notif-item-content { flex: 1; min-width: 0; }
.notif-item-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}
.notif-item-title {
  font-size: 13px;
  font-weight: 700;
  color: #262626;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.notif-item-time {
  font-size: 11px;
  color: #AAAABC;
  flex-shrink: 0;
}
.notif-item-body {
  font-size: 12.5px;
  color: #555;
  line-height: 1.45;
  margin: 0 0 6px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.notif-item-action {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  color: #3F6757;
  text-decoration: none;
}
.notif-item-action:hover { text-decoration: underline; }

/* Remove button */
.notif-item-remove {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  color: #CCC;
  padding: 2px 4px;
  border-radius: 4px;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.15s, color 0.15s;
}
.notif-item:hover .notif-item-remove { opacity: 1; }
.notif-item-remove:hover { color: #EF4444; }

/* Loading skeleton */
.notif-loading { padding: 8px 0; }
.notif-skel-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
}
.skel-icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  flex-shrink: 0;
}
.skel-text-block { flex: 1; }
.skel-line {
  border-radius: 6px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
.skel-title { height: 12px; width: 60%; margin-bottom: 8px; }
.skel-body  { height: 10px; width: 90%; }
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── Transitions ────────────────────────────────────── */
.notif-panel-enter-active { transition: opacity 0.2s, transform 0.2s; }
.notif-panel-leave-active { transition: opacity 0.15s, transform 0.15s; }
.notif-panel-enter-from  { opacity: 0; transform: scale(0.97) translateY(-6px); }
.notif-panel-leave-to    { opacity: 0; transform: scale(0.97) translateY(-6px); }

.notif-item-enter-active { transition: opacity 0.2s, transform 0.2s; }
.notif-item-leave-active { transition: opacity 0.15s; }
.notif-item-enter-from   { opacity: 0; transform: translateX(10px); }
.notif-item-leave-to     { opacity: 0; }

/* ── Mobile ─────────────────────────────────────────── */
@media (max-width: 480px) {
  .notif-panel {
    width: calc(100vw - 16px);
    right: 8px !important;
  }
}
</style>
