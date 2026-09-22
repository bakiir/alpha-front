<template>
  <div id="alpha-app">
    <NuxtPage />
    <AuthModal />
    <SubscriptionQuizModal />
    <!-- Toast state is browser-only and may differ from the server snapshot. -->
    <ClientOnly>
      <ToastStack />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import AuthModal from '~/components/AuthModal.vue'
import SubscriptionQuizModal from '~/components/SubscriptionQuizModal.vue'
import ToastStack from '~/components/ToastStack.vue'

const { fetchUser, user, openAuthModal } = useAuth()
const { fetchNotifications, notifications } = useNotifications()
const { gift, success } = useToast()
const { fetchSettings, yandexMetrikaId, googleTagManagerId, headCustomScripts } = useSiteSettings()
const { fetchFeatures } = useFeatures()
const route = useRoute()

// Inject dynamic analytics & tracking scripts if configured in admin settings
watchEffect(() => {
  const scripts: Array<{ children: string; type?: string; async?: boolean }> = []

  if (yandexMetrikaId.value) {
    scripts.push({
      children: `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
ym(${JSON.stringify(yandexMetrikaId.value)}, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true, webvisor:true });`
    })
  }

  if (googleTagManagerId.value) {
    scripts.push({
      children: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer',${JSON.stringify(googleTagManagerId.value)});`
    })
  }

  useHead({
    script: scripts
  })
})

const GIFT_TOAST_TYPES = new Set(['gift_activated', 'gift_sent', 'certificate_activated'])
const SUCCESS_TOAST_TYPES = new Set([
  'preorder_date_changed',
  'preorder_ready',
  'order_ready',
  'delivery_scheduled',
  'delivery_received',
  'return_scheduled',
  'item_returned',
  'confirmation',
  'payment_success',
  'payment_due',
])

const seenToastKey = (userId: number | string) => `alpha_seen_notif_toasts:${userId}`

const loadSeenToastIds = (userId: number | string): Set<number> => {
  if (!import.meta.client) return new Set()
  try {
    const raw = localStorage.getItem(seenToastKey(userId))
    const ids = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(ids) ? ids.map(Number).filter(Number.isFinite) : [])
  } catch {
    return new Set()
  }
}

const saveSeenToastIds = (userId: number | string, ids: Set<number>) => {
  if (!import.meta.client) return
  const trimmed = [...ids].slice(-300)
  localStorage.setItem(seenToastKey(userId), JSON.stringify(trimmed))
}

const hydratedToastUserId = ref<number | null>(null)

const tryOpenLoginFromQuery = () => {
  if (route.query.login !== '1') return

  if (!user.value) {
    openAuthModal('login')
    return
  }

  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
  if (redirect.startsWith('/') && !redirect.startsWith('//')) {
    navigateTo(redirect)
  }
}

onMounted(async () => {
  await Promise.all([fetchSettings(), fetchFeatures(), fetchUser()])
  tryOpenLoginFromQuery()
  if (user.value) {
    await fetchNotifications()
  }
})

watch(
  () => [route.query.login, route.query.redirect, user.value?.id] as const,
  () => tryOpenLoginFromQuery(),
)

watch(user, async (u) => {
  if (!u) {
    hydratedToastUserId.value = null
    return
  }
  await fetchNotifications()
})

// Toast only brand-new events after the first snapshot. Replay on refresh is stored in localStorage.
watch(notifications, (list) => {
  const userId = user.value?.id
  if (!userId || !import.meta.client) return

  const seen = loadSeenToastIds(userId)

  if (hydratedToastUserId.value !== userId) {
    list.forEach(n => seen.add(n.id))
    saveSeenToastIds(userId, seen)
    hydratedToastUserId.value = userId
    return
  }

  const fresh = list
    .filter(n => !n.read_at && !seen.has(n.id))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  fresh.forEach(n => seen.add(n.id))
  saveSeenToastIds(userId, seen)

  const newest = fresh.slice(0, 1)
  newest.forEach((n) => {
    if (GIFT_TOAST_TYPES.has(n.type)) {
      gift(n.title, n.body)
    } else if (SUCCESS_TOAST_TYPES.has(n.type)) {
      success(n.title, n.body)
    }
  })
}, { deep: true })
</script>

<style>
/* Global resets and transitions handled in main.css */
</style>
