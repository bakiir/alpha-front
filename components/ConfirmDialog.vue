<template>
  <Teleport to="body">
    <Transition name="confirm-dialog">
      <div
        v-if="active"
        class="confirm-dialog-backdrop"
        role="presentation"
        @click.self="onCancel"
      >
        <section
          ref="dialogRef"
          class="confirm-dialog"
          role="alertdialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="messageId"
          @keydown="onKeydown"
        >
          <h2 :id="titleId" class="confirm-dialog__title">
            {{ active.title || t('common.confirmTitle') }}
          </h2>
          <p :id="messageId" class="confirm-dialog__message">
            {{ active.message }}
          </p>
          <div class="confirm-dialog__actions">
            <button
              ref="cancelRef"
              type="button"
              class="confirm-dialog__btn confirm-dialog__btn--secondary"
              @click="onCancel"
            >
              {{ active.cancelLabel || t('common.confirmCancel') }}
            </button>
            <button
              ref="confirmRef"
              type="button"
              class="confirm-dialog__btn confirm-dialog__btn--primary"
              :class="{ 'confirm-dialog__btn--danger': active.variant === 'danger' }"
              @click="onConfirm"
            >
              {{ active.confirmLabel || t('common.confirmOk') }}
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useConfirm } from '~/composables/useConfirm'

const { t } = useI18n()
const { active, respond } = useConfirm()

const dialogRef = ref<HTMLElement | null>(null)
const cancelRef = ref<HTMLButtonElement | null>(null)
const confirmRef = ref<HTMLButtonElement | null>(null)
const titleId = 'alpha-confirm-title'
const messageId = 'alpha-confirm-message'

let previousFocus: HTMLElement | null = null
let previousOverflow = ''

const onConfirm = () => respond(true)
const onCancel = () => respond(false)

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    event.preventDefault()
    onCancel()
    return
  }
  if (event.key !== 'Tab' || !dialogRef.value) return
  const focusable = [cancelRef.value, confirmRef.value].filter(Boolean) as HTMLElement[]
  if (focusable.length < 2) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(active, async (request) => {
  if (request) {
    previousFocus = document.activeElement as HTMLElement | null
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    await nextTick()
    const focusTarget = request.variant === 'danger' ? cancelRef.value : confirmRef.value
    focusTarget?.focus()
  } else if (import.meta.client) {
    document.body.style.overflow = previousOverflow
    previousFocus?.focus()
  }
})

onBeforeUnmount(() => {
  if (active.value && import.meta.client) {
    document.body.style.overflow = previousOverflow
  }
})
</script>

<style scoped>
.confirm-dialog-backdrop {
  position: fixed;
  z-index: 10020;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(20, 35, 29, 0.58);
  backdrop-filter: blur(7px);
}

.confirm-dialog {
  width: min(100%, 420px);
  padding: 28px 28px 24px;
  border-radius: 24px;
  border: 1px solid rgba(51, 61, 54, 0.12);
  background: #fff;
  box-shadow: 0 24px 64px rgba(20, 35, 29, 0.22);
}

.confirm-dialog__title {
  margin: 0 0 12px;
  font-family: 'Manrope', sans-serif;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.35;
  color: #262626;
}

.confirm-dialog__message {
  margin: 0 0 24px;
  font-size: 15px;
  line-height: 1.55;
  color: #4a4a4a;
}

.confirm-dialog__actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
}

.confirm-dialog__btn {
  min-width: 112px;
  padding: 10px 20px;
  border-radius: 999px;
  font-family: 'Manrope', sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.confirm-dialog__btn:focus-visible {
  outline: 2px solid var(--green-ink);
  outline-offset: 2px;
}

.confirm-dialog__btn--primary {
  border: none;
  background: var(--green-surface);
  color: var(--green-ink);
  box-shadow: 0 4px 14px rgba(51, 61, 54, 0.28);
}

.confirm-dialog__btn--primary:hover {
  transform: translateY(-1px);
}

.confirm-dialog__btn--primary.confirm-dialog__btn--danger {
  background: #c45c5c;
  color: #fff;
  box-shadow: 0 4px 14px rgba(196, 92, 92, 0.35);
}

.confirm-dialog__btn--secondary {
  border: 1.5px solid rgba(51, 61, 54, 0.2);
  background: #faf3dc;
  color: #262626;
  box-shadow: none;
}

.confirm-dialog__btn--secondary:hover {
  background: #f5ebd0;
}

.confirm-dialog-enter-active,
.confirm-dialog-leave-active {
  transition: opacity 0.2s ease;
}

.confirm-dialog-enter-active .confirm-dialog,
.confirm-dialog-leave-active .confirm-dialog {
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
}

.confirm-dialog-enter-from,
.confirm-dialog-leave-to {
  opacity: 0;
}

.confirm-dialog-enter-from .confirm-dialog,
.confirm-dialog-leave-to .confirm-dialog {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}
</style>
