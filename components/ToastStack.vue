<template>
  <!-- Global toast stack — renders in body via Teleport -->
  <Teleport to="body">
    <div class="toast-stack" aria-live="polite">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast-item"
          :class="`toast-${toast.type}`"
          @click="dismiss(toast.id)"
        >
          <span class="toast-icon"><AppIcon :name="resolveIcon(toast.icon)" :size="24" /></span>
          <div class="toast-content">
            <strong class="toast-title">{{ toast.title }}</strong>
            <p class="toast-body">{{ toast.body }}</p>
          </div>
          <button class="toast-close" @click.stop="dismiss(toast.id)">✕</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'
import { resolveIcon } from '~/utils/resolveIcon'
const { toasts, dismiss } = useToast()
</script>

<style scoped>
.toast-stack {
  position: fixed;
  bottom: 28px;
  right: 24px;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.toast-item {
  pointer-events: all;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #FFFDF8;
  border-radius: 16px;
  box-shadow: 0 6px 32px rgba(0,0,0,0.14), 0 1px 6px rgba(0,0,0,0.06);
  padding: 14px 16px;
  width: 340px;
  max-width: calc(100vw - 32px);
  cursor: pointer;
  border-left: 4px solid #496B5A;
  transition: transform 0.15s, box-shadow 0.15s;
}
.toast-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 40px rgba(0,0,0,0.18);
}
.toast-item.toast-gift  { border-left-color: #F59E0B; }
.toast-item.toast-error { border-left-color: #EF4444; }
.toast-item.toast-success { border-left-color: #10B981; }

.toast-icon { font-size: 24px; flex-shrink: 0; line-height: 1; }
.toast-content { flex: 1; min-width: 0; }
.toast-title {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #27312B;
  margin-bottom: 2px;
}
.toast-body {
  font-size: 12.5px;
  color: #555;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.toast-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  color: #CCC;
  padding: 0 2px;
  flex-shrink: 0;
  transition: color 0.15s;
}
.toast-close:hover { color: #888; }

/* Transitions */
.toast-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from  { opacity: 0; transform: translateY(20px) scale(0.95); }
.toast-leave-to    { opacity: 0; transform: translateX(40px); }

@media (max-width: 480px) {
  .toast-stack { bottom: 16px; right: 8px; left: 8px; }
  .toast-item  { width: 100%; }
}
</style>
