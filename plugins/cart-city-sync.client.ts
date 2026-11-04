/** Keep cart city availability in sync whenever the user changes city (any page). */
export default defineNuxtPlugin(() => {
  useCartCityAvailability()
})
