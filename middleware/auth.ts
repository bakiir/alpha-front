export default defineNuxtRouteMiddleware((to) => {
  const tokenCookie = useCookie<string | null>('alpha_auth_token')

  const hasToken = Boolean(
    tokenCookie.value
    || (import.meta.client && localStorage.getItem('alpha_auth_token')),
  )

  if (!hasToken) {
    return navigateTo(`/?login=1&redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
