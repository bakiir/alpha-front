<template>
  <Teleport to="body">
    <Transition name="city-modal">
      <div v-if="isOpen" class="city-modal-backdrop" @click.self="dismiss">
        <section
          ref="dialogRef"
          class="city-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="city-modal-title"
          aria-describedby="city-modal-description"
          @keydown="onKeydown"
        >
          <button class="city-modal__close" type="button" :aria-label="t('cityModal.close')" @click="dismiss">×</button>

          <div class="city-modal__top">
            <AppLogo size="md" />
            <span class="city-modal__eyebrow">{{ t('cityModal.eyebrow') }}</span>
          </div>

          <h2 id="city-modal-title">{{ t('cityModal.title') }}</h2>
          <p id="city-modal-description" class="city-modal__description">{{ t('cityModal.description') }}</p>

          <div v-if="!cities.length" class="city-modal__empty" role="status">
            <p>{{ t('cityModal.unavailable') }}</p>
            <button type="button" @click="retry">{{ t('cityModal.retry') }}</button>
          </div>

          <fieldset v-else class="city-modal__choices">
            <legend class="visually-hidden">{{ t('cityModal.title') }}</legend>
            <label v-for="city in cities" :key="city.id" class="city-modal__choice" :class="{ 'city-modal__choice--selected': selectedId === city.id }">
              <input v-model.number="selectedId" type="radio" name="home-city" :value="city.id">
              <span class="city-modal__pin"><AppIcon name="map-pin" :size="21" /></span>
              <span class="city-modal__name">{{ city.name }}</span>
              <span class="city-modal__check"><AppIcon name="check" :size="18" /></span>
            </label>
          </fieldset>

          <button class="city-modal__confirm" type="button" :disabled="selectedId === null" @click="confirm">
            {{ t('cityModal.confirm') }}
            <AppIcon name="arrow-right" :size="18" />
          </button>
          <p class="city-modal__note">{{ t('cityModal.note') }}</p>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { hasConsent } = useCookieConsent()
const { cities, cityId, citiesLoaded, loadCities, setCityId } = useCity()
const { isAuthModalOpen } = useAuth()
const route = useRoute()

const mounted = ref(false)
const dismissed = ref(false)
const selectedId = ref<number | null>(null)
const dialogRef = ref<HTMLElement | null>(null)
const isOpen = computed(() => mounted.value && hasConsent.value && citiesLoaded.value && !cityId.value && !dismissed.value && !isAuthModalOpen.value && route.query.login !== '1')

let previousFocus: HTMLElement | null = null
let previousOverflow = ''

const dismiss = () => { dismissed.value = true }

const retry = async () => { await loadCities(true) }

const confirm = () => {
  if (selectedId.value === null || !cities.value.some(city => city.id === selectedId.value)) return
  setCityId(selectedId.value)
  window.dispatchEvent(new CustomEvent('alpha:city-changed', { detail: { cityId: selectedId.value } }))
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    dismiss()
    return
  }
  if (event.key !== 'Tab' || !dialogRef.value) return
  const focusable = [...dialogRef.value.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled])')]
  if (!focusable.length) return
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

watch(isOpen, async (open) => {
  if (open) {
    previousFocus = document.activeElement as HTMLElement | null
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    await nextTick()
    dialogRef.value?.querySelector<HTMLElement>('input, button')?.focus()
  } else if (mounted.value) {
    document.body.style.overflow = previousOverflow
    previousFocus?.focus()
  }
})

onMounted(() => {
  mounted.value = true
  if (!citiesLoaded.value) void loadCities()
})

onBeforeUnmount(() => {
  if (isOpen.value) document.body.style.overflow = previousOverflow
})
</script>

<style scoped>
.city-modal-backdrop { position: fixed; z-index: 10010; inset: 0; display: grid; place-items: center; padding: 20px; background: rgba(20, 35, 29, .58); backdrop-filter: blur(7px); }
.city-modal { position: relative; width: min(100%, 560px); max-height: min(92dvh, 760px); overflow-y: auto; padding: clamp(28px, 5vw, 48px); border: 1px solid var(--warm-sand); border-radius: 28px; background: var(--ivory); box-shadow: 0 30px 100px rgba(20, 35, 29, .24); }
.city-modal__close { position: absolute; top: 22px; right: 22px; width: 40px; height: 40px; border: 1px solid var(--warm-sand); border-radius: 50%; background: #fff; color: var(--graphite); font-size: 28px; line-height: 1; }
.city-modal__close:hover { background: var(--soft-sage-mist); }
.city-modal__top { display: flex; align-items: center; gap: 20px; margin-bottom: 30px; }
.city-modal__eyebrow { padding-left: 20px; border-left: 1px solid var(--warm-sand); color: var(--alpha-green); font-size: 11px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
.city-modal h2 { max-width: 430px; margin: 0; font-family: var(--font-display); font-size: clamp(42px, 7vw, 58px); font-weight: 600; line-height: .98; color: var(--graphite); }
.city-modal__description { max-width: 440px; margin: 18px 0 28px; color: var(--text-muted); font-size: 15px; line-height: 1.65; }
.city-modal__choices { display: grid; gap: 12px; margin: 0 0 24px; padding: 0; border: 0; }
.city-modal__choices legend { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
.city-modal__choice { display: flex; align-items: center; gap: 14px; min-height: 76px; padding: 12px 18px; border: 1px solid var(--warm-sand); border-radius: 18px; background: #fff; cursor: pointer; transition: border-color .18s, background .18s, transform .18s; }
.city-modal__choice:hover { border-color: var(--alpha-green); transform: translateY(-1px); }
.city-modal__choice:focus-within { outline: 2px solid var(--alpha-green); outline-offset: 2px; }
.city-modal__choice--selected { border-color: var(--alpha-green); background: var(--soft-sage-mist); }
.city-modal__choice input { position: absolute; width: 1px; height: 1px; opacity: 0; }
.city-modal__pin { display: grid; flex: 0 0 40px; width: 40px; height: 40px; place-items: center; border-radius: 50%; background: var(--soft-sage-mist); color: var(--alpha-green); }
.city-modal__name { flex: 1; color: var(--graphite); font-size: 17px; font-weight: 700; }
.city-modal__check { display: grid; width: 26px; height: 26px; place-items: center; border: 1px solid var(--warm-sand); border-radius: 50%; color: transparent; }
.city-modal__choice--selected .city-modal__check { border-color: var(--alpha-green); background: var(--alpha-green); color: #fff; }
.city-modal__confirm { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; min-height: 56px; border-radius: 16px; background: var(--alpha-green); color: #fff; font-size: 15px; font-weight: 700; transition: background .18s; }
.city-modal__confirm:not(:disabled):hover { background: var(--alpha-green-dark); }
.city-modal__confirm:disabled { opacity: .48; cursor: not-allowed; }
.city-modal__note { margin: 15px 0 0; color: var(--text-muted); font-size: 12px; line-height: 1.5; text-align: center; }
.city-modal__empty { margin-bottom: 22px; padding: 22px; border-radius: 16px; background: #fff; color: var(--text-muted); }
.city-modal__empty button { margin-top: 10px; color: var(--alpha-green-dark); font-weight: 700; text-decoration: underline; }
.city-modal-enter-active, .city-modal-leave-active { transition: opacity .22s ease; }
.city-modal-enter-active .city-modal, .city-modal-leave-active .city-modal { transition: transform .22s ease; }
.city-modal-enter-from, .city-modal-leave-to { opacity: 0; }
.city-modal-enter-from .city-modal, .city-modal-leave-to .city-modal { transform: translateY(12px) scale(.98); }
@media (max-width: 600px) { .city-modal-backdrop { padding: 12px; align-items: end; } .city-modal { width: 100%; max-height: calc(100dvh - 24px); padding: 30px 22px max(26px, env(safe-area-inset-bottom)); border-radius: 24px; } .city-modal__top { margin-bottom: 24px; } .city-modal__choice { min-height: 68px; } }
@media (prefers-reduced-motion: reduce) { .city-modal-enter-active, .city-modal-leave-active, .city-modal-enter-active .city-modal, .city-modal-leave-active .city-modal { transition: none; } }
</style>
