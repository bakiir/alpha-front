export default defineNuxtRouteMiddleware((to) => {
  const { hasAuthSession } = useApi()
  const user = useState<unknown>('auth_user', () => null)

  if (!hasAuthSession() && !user.value) {
    return navigateTo(`/?login=1&redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
