// composables/useToast.ts
// Global toast notification system. Call showToast() from anywhere.

export interface Toast {
  id: string
  type: 'default' | 'gift' | 'success' | 'error'
  icon: string
  title: string
  body: string
  duration?: number
}

export const useToast = () => {
  // useState must be called inside the composable function (requires Nuxt context)
  const toasts = useState<Toast[]>('toasts', () => [])
  const show = (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const duration = toast.duration ?? 5000

    toasts.value.push({ ...toast, id })

    if (duration > 0) {
      setTimeout(() => dismiss(id), duration)
    }

    return id
  }

  const dismiss = (id: string) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  const gift = (title: string, body: string) =>
    show({ type: 'gift', icon: '🎁', title, body })

  const success = (title: string, body: string) =>
    show({ type: 'success', icon: '✅', title, body })

  const error = (title: string, body: string) =>
    show({ type: 'error', icon: '❌', title, body })

  return { toasts, show, dismiss, gift, success, error }
}
