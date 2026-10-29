export type ConfirmVariant = 'default' | 'danger'

export interface ConfirmOptions {
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmVariant
}

type ConfirmRequest = ConfirmOptions & {
  resolve: (value: boolean) => void
}

export const useConfirm = () => {
  const active = useState<ConfirmRequest | null>('alpha-confirm-dialog', () => null)
  const queue = useState<ConfirmRequest[]>('alpha-confirm-queue', () => [])

  const dequeue = () => {
    if (!active.value && queue.value.length > 0) {
      active.value = queue.value.shift()!
    }
  }

  const confirm = (options: ConfirmOptions | string): Promise<boolean> => {
    const normalized: ConfirmOptions = typeof options === 'string'
      ? { message: options }
      : options

    if (import.meta.server) {
      return Promise.resolve(false)
    }

    return new Promise((resolve) => {
      queue.value.push({ ...normalized, resolve })
      dequeue()
    })
  }

  const respond = (accepted: boolean) => {
    const current = active.value
    if (!current) return
    current.resolve(accepted)
    active.value = null
    dequeue()
  }

  return { active, confirm, respond }
}
