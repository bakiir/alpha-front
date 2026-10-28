const AUTH_SESSION_COOKIE = 'alpha_auth_session'

export default defineNuxtRouteMiddleware((to) => {
  const user = useState<unknown>('auth_user', () => null)
  const authSession = useCookie<string | null>(AUTH_SESSION_COOKIE, {
    maxAge: 60 * 60 * 24 * 180,
  })
  const hasSession = authSession.value === '1' || !!user.value

  if (!hasSession) {
    return navigateTo(`/?login=1&redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
