<template>
  <div id="alpha-app">
    <NuxtPage />
    <AuthModal />
    <SubscriptionQuizModal />
    <!-- Global toast notifications -->
    <ToastStack />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import AuthModal from '~/components/AuthModal.vue'
import SubscriptionQuizModal from '~/components/SubscriptionQuizModal.vue'
import ToastStack from '~/components/ToastStack.vue'

const { fetchUser, user, openAuthModal } = useAuth()
const { fetchNotifications, notifications } = useNotifications()
const { gift } = useToast()
const { fetchSettings, yandexMetrikaId, googleTagManagerId, headCustomScripts } = useSiteSettings()
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

// Track which notification IDs we've already toasted so we don't repeat
const toastedIds = new Set<number>()

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
  await fetchSettings()
  await fetchUser()
  tryOpenLoginFromQuery()
  if (user.value) {
    await fetchNotifications()
  }
})

watch(
  () => [route.query.login, route.query.redirect, user.value?.id] as const,
  () => tryOpenLoginFromQuery(),
)

// When user logs in, fetch notifications
watch(user, async (u) => {
  if (u) await fetchNotifications()
})

// When new unread gift notifications arrive — show a toast
watch(notifications, (list) => {
  list
    .filter(n => !n.read_at && n.type === 'gift_activated' && !toastedIds.has(n.id))
    .forEach(n => {
      toastedIds.add(n.id)
      gift(n.title, n.body)
    })
}, { deep: true })
</script>

<style>
/* Global resets and transitions handled in main.css */
</style>
