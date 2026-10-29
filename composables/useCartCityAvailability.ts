import { computed, watch } from 'vue'
import { cartLineKey, isCartLineCityBlocked, type CartItem } from '~/composables/useCart'
import { cartLineMaxQuantity } from '~/utils/cartStockLimit'

const isStockToyLine = (item: CartItem) =>
  !item.isPreorder
  && !item.giftBoxId
  && (typeof item.id === 'number'
    || (typeof item.id === 'string' && /^\d+$/.test(item.id)))

/** Refresh stock cap without removing lines (unavailable lines stay in cart). */
const applyStockCapFromSync = (item: CartItem, available: number) => {
  item.availableQuantity = Math.max(0, available)
  if (item.isPreorder) return
  const max = cartLineMaxQuantity({
    isPreorder: false,
    availableQuantity: item.availableQuantity,
  })
  if (max != null && max > 0 && item.quantity > max) {
    item.quantity = max
  }
}

const applyToyAvailability = (item: CartItem, toy: any | undefined) => {
  if (item.isPreorder) {
    const preorderOk = Boolean(toy?.preorder?.available ?? toy?.channels?.is_preorder_available)
    item.unavailableInCity = !preorderOk
    return
  }

  if (!toy) {
    item.unavailableInCity = true
    item.availableQuantity = 0
    return
  }

  const available = Math.max(0, Number(toy.available_quantity ?? 0))
  item.availableQuantity = available
  item.unavailableInCity = !Boolean(toy.channels?.is_purchase_available)
}

const pruneSelectionFromBlocked = (
  items: CartItem[],
  selectedKeys: string[] | null,
  setCartSelection: (keys: string[] | null) => void,
) => {
  const eligibleKeys = items.filter(item => !isCartLineCityBlocked(item)).map(cartLineKey)
  if (eligibleKeys.length === 0) {
    setCartSelection([])
    return
  }

  if (eligibleKeys.length === items.length) {
    if (selectedKeys === null || selectedKeys.length === 0) {
      setCartSelection(null)
    }
    return
  }

  if (selectedKeys === null || selectedKeys.length === 0) {
    setCartSelection(null)
    return
  }

  const eligible = new Set(eligibleKeys)
  const next = selectedKeys.filter(key => eligible.has(key))
  setCartSelection(next.length === eligibleKeys.length ? null : (next.length ? next : null))
}

export const useCartCityAvailability = () => {
  const { t } = useI18n()
  const { cityId, loadCities, requireCityId } = useCity()
  const { fetchToyById } = useToys()
  const { error: toastError } = useToast()
  const {
    items,
    setCartSelection,
    selectedCartLineKeys,
    ensureDefaultCartSelection,
  } = useCart()

  const blockedCartLines = computed(() => items.value.filter(isCartLineCityBlocked))

  const syncCartAvailabilityForCity = async (opts?: { notify?: boolean }) => {
    if (!import.meta.client) return { hadBlocked: false }

    await loadCities()

    const toyLines = items.value.filter(item => item.isPreorder || isStockToyLine(item))
    for (const item of toyLines) {
      item.unavailableInCity = false
    }
    for (const item of items.value) {
      if (!item.isPreorder && !isStockToyLine(item)) {
        item.unavailableInCity = false
      }
    }

    if (requireCityId.value && !cityId.value) {
      return { hadBlocked: false }
    }

    const uniqueIds = [...new Set(
      toyLines
        .map(item => Number(item.id))
        .filter(id => Number.isFinite(id) && id > 0),
    )]

    if (uniqueIds.length === 0) {
      return { hadBlocked: false }
    }

    try {
      const settled = await Promise.allSettled(
        uniqueIds.map(async (id) => {
          const res = await fetchToyById(id)
          return { id, toy: res?.data as any }
        }),
      )

      const byId = new Map<number, any>()
      for (const entry of settled) {
        if (entry.status === 'fulfilled' && entry.value?.toy) {
          byId.set(entry.value.id, entry.value.toy)
        }
      }

      let hadBlocked = false
      for (const item of toyLines) {
        const toy = byId.get(Number(item.id))
        applyToyAvailability(item, toy)
        if (!item.isPreorder && toy && !item.unavailableInCity) {
          const before = item.quantity
          applyStockCapFromSync(item, item.availableQuantity ?? 0)
          if (item.quantity < before) hadBlocked = true
        } else if (isCartLineCityBlocked(item)) {
          hadBlocked = true
        }
      }

      pruneSelectionFromBlocked(items.value, selectedCartLineKeys.value, setCartSelection)
      ensureDefaultCartSelection()

      if (opts?.notify && hadBlocked) {
        toastError(t('cart.cityAvailabilityUpdated'), t('cart.cityAvailabilityUpdatedHint'))
      }

      return { hadBlocked }
    } catch {
      for (const item of toyLines) {
        item.unavailableInCity = false
      }
      return { hadBlocked: false }
    }
  }

  const globalSyncReady = useState<boolean>('cart_city_availability_sync_ready', () => false)

  if (import.meta.client && !globalSyncReady.value) {
    globalSyncReady.value = true

    watch(cityId, (next, prev) => {
      if (next !== prev) {
        void syncCartAvailabilityForCity({ notify: Boolean(next && prev) })
      }
    })

    const onCityChanged = () => {
      void syncCartAvailabilityForCity({ notify: true })
    }

    window.addEventListener('alpha:city-changed', onCityChanged)
    void syncCartAvailabilityForCity()
  }

  return { syncCartAvailabilityForCity, blockedCartLines }
}
