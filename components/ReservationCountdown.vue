<template>
  <p v-if="expiresAt && now !== null" class="reservation-countdown" :class="{ 'reservation-countdown--expired': remaining <= 0 }" role="status" aria-live="off">
    <span aria-hidden="true">◷</span>
    <span v-if="remaining > 0">{{ label || t('reservation.remaining') }}: <strong>{{ formatted }}</strong></span>
    <span v-else>{{ t('reservation.expiredBank') }}</span>
  </p>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ expiresAt?: string | null; label?: string }>(), {
  expiresAt: null,
  label: '',
})
const { t } = useI18n()

const now = ref<number | null>(null)
let interval: ReturnType<typeof setInterval> | null = null

const fireExpiredOnce = () => {
  if (remaining.value <= 0 && !didEmitExpired.value) {
    didEmitExpired.value = true
    emit('expired')
  }
}

onMounted(() => {
  now.value = Date.now()
  fireExpiredOnce()
  interval = setInterval(() => {
    now.value = Date.now()
    fireExpiredOnce()
  }, 1000)
})
onUnmounted(() => { if (interval) clearInterval(interval) })

const emit = defineEmits<{ expired: [] }>()
const didEmitExpired = ref(false)

const remaining = computed(() => Math.max(0, Math.ceil((Date.parse(props.expiresAt || '') - (now.value || 0)) / 1000) || 0))
const formatted = computed(() => `${Math.floor(remaining.value / 60).toString().padStart(2, '0')}:${(remaining.value % 60).toString().padStart(2, '0')}`)

watch(remaining, () => fireExpiredOnce())

watch(() => props.expiresAt, () => {
  didEmitExpired.value = false
})
</script>

<style scoped>
.reservation-countdown { display: inline-flex; align-items: center; gap: .45rem; margin: .65rem 0; padding: .5rem .75rem; border-radius: .75rem; background: #eef4eb; color: #254d39; font-size: .92rem; font-variant-numeric: tabular-nums; }
.reservation-countdown--expired { background: #fff0ec; color: #9a3528; }
</style>
