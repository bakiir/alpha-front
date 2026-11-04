import { computed, watch } from 'vue'
import { cartLineKey, isCartLineCityBlocked, type CartItem } from '~/composables/useCart'
import { cartLineMaxQuantity } from '~/utils/cartStockLimit'

const isStockToyLine = (item: CartItem) =>
  !item.isPreorder
  && !item.giftBoxId
  && (typeof item.id === 'number'
    || (typeof item.id === 'string' && /^\d+$/.test(item.id)))

const extractToyPayload = (res: unknown): any | undefined => {
  if (!res || typeof res !== 'object') return undefined
  const row = res as Record<string, unknown>
  if (row.data && typeof row.data === 'object') return row.data
  if ('channels' in row || 'available_quantity' in row) return row
  return undefined
}

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
  const purchaseOk = Boolean(toy.channels?.is_purchase_available) && available > 0
  item.availableQuantity = available
  item.unavailableInCity = !purchaseOk
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

const touchCartItems = (items: CartItem[]) => {
  items.splice(0, items.length, ...items.map(item => ({ ...item })))
}

export const useCartCityAvailability = () => {
  const { t } = useAppI18n()
  const { cityId, loadCities, requireCityId } = useCity()
  const { fetchToyById } = useToys()
  const { error: toastError } = useToast()
  const {
    items,
    setCartSelection,
    selectedCartLineKeys,
    ensureDefaultCartSelection,
  } = useCart()

  const isCartCitySyncing = useState<boolean>('cart_city_availability_syncing', () => false)
  const cartCityAvailabilityReady = useState<boolean>('cart_city_availability_ready', () => false)
  const syncGeneration = useState<number>('cart_city_availability_sync_gen', () => 0)
  const cartCityRevision = useState<number>('cart_city_availability_revision', () => 0)

  const blockedCartLines = computed(() => {
    cartCityRevision.value
    return items.value.filter(isCartLineCityBlocked)
  })

  const syncCartAvailabilityForCity = async (opts?: {
    notify?: boolean
    forCityId?: number | null
  }) => {
    if (!import.meta.client) return { hadBlocked: false }

    const runId = ++syncGeneration.value
    isCartCitySyncing.value = true

    await loadCities()

    if (runId !== syncGeneration.value) {
      isCartCitySyncing.value = false
      return { hadBlocked: false }
    }

    const effectiveCityId = opts?.forCityId !== undefined
      ? normalizeCityIdForSync(opts.forCityId)
      : normalizeCityIdForSync(cityId.value)

    const toyLines = items.value.filter(item => item.isPreorder || isStockToyLine(item))

    if (requireCityId.value && !effectiveCityId) {
      isCartCitySyncing.value = false
      return { hadBlocked: false }
    }

    const uniqueIds = [...new Set(
      toyLines
        .map(item => Number(item.id))
        .filter(id => Number.isFinite(id) && id > 0),
    )]

    if (uniqueIds.length === 0) {
      cartCityAvailabilityReady.value = true
      isCartCitySyncing.value = false
      return { hadBlocked: false }
    }

    cartCityAvailabilityReady.value = false

    const cityQuery = effectiveCityId ? { city_id: effectiveCityId } : {}

    try {
      const settled = await Promise.allSettled(
        uniqueIds.map(async (id) => {
          const res = await fetchToyById(id, cityQuery)
          return { id, toy: extractToyPayload(res) }
        }),
      )

      if (runId !== syncGeneration.value) {
        return { hadBlocked: false }
      }

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

      touchCartItems(items.value)
      cartCityRevision.value += 1

      pruneSelectionFromBlocked(items.value, selectedCartLineKeys.value, setCartSelection)
      ensureDefaultCartSelection()

      cartCityAvailabilityReady.value = true

      if (opts?.notify && hadBlocked) {
        toastError(t('cart.cityAvailabilityUpdated'), t('cart.cityAvailabilityUpdatedHint'))
      }

      return { hadBlocked }
    } catch {
      for (const item of toyLines) {
        if (!item.isPreorder) {
          item.unavailableInCity = true
        }
      }
      touchCartItems(items.value)
      cartCityRevision.value += 1
      cartCityAvailabilityReady.value = true
      return { hadBlocked: true }
    } finally {
      if (runId === syncGeneration.value) {
        isCartCitySyncing.value = false
      }
    }
  }

  const globalSyncReady = useState<boolean>('cart_city_availability_sync_ready', () => false)

  if (import.meta.client && !globalSyncReady.value) {
    globalSyncReady.value = true

    const scheduleSync = (forCityId?: number | null, notify = false) => {
      void syncCartAvailabilityForCity({ notify, forCityId })
    }

    watch(cityId, (next, prev) => {
      if (next === prev) return
      cartCityAvailabilityReady.value = false
      scheduleSync(next, Boolean(next && prev))
    })

    watch(
      () => items.value.map(item => `${cartLineKey(item)}:${item.quantity}`).join('|'),
      () => {
        scheduleSync(cityId.value, false)
      },
    )

    window.addEventListener('alpha:cart-hydrated', () => {
      scheduleSync(cityId.value, false)
    })

    scheduleSync(cityId.value, false)
  }

  return {
    syncCartAvailabilityForCity,
    blockedCartLines,
    isCartCitySyncing,
    cartCityAvailabilityReady,
  }
}

function normalizeCityIdForSync(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : null
}
