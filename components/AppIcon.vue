<template>
  <svg
    class="app-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <!-- Navigation -->
    <template v-if="name === 'how-it-works'">
      <path d="M12 2 2 7l10 5 10-5-10-5Z" />
      <path d="m2 17 10 5 10-5" />
      <path d="m2 12 10 5 10-5" />
    </template>
    <template v-else-if="name === 'shop'">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </template>
    <template v-else-if="name === 'subscription'">
      <path d="m12 3-1.9 5.8H4l4.9 3.6-1.9 5.8L12 14.6l4.9 3.6-1.9-5.8L20 8.8h-6.1Z" />
    </template>
    <template v-else-if="name === 'clock'">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </template>
    <template v-else-if="name === 'gift'">
      <rect x="3" y="8" width="18" height="13" rx="2" />
      <path d="M12 8v13" />
      <path d="M3 12h18" />
      <path d="M12 8c-2-3-6-3-6 0s4 0 6 0 6-3 6 0-4 0-6 0Z" />
    </template>
    <template v-else-if="name === 'heart'">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.8 1-1.1a5.5 5.5 0 0 0 0-7.8Z" />
    </template>
    <template v-else-if="name === 'handshake'">
      <path d="m11 17 2 2a1 1 0 0 0 1.4 0l2.2-2.2a1 1 0 0 0 0-1.4l-2-2" />
      <path d="m7 13 2 2a1 1 0 0 0 1.4 0l2.2-2.2a1 1 0 0 0 0-1.4l-2-2" />
      <path d="M2 12l3-3 3 3" />
      <path d="M19 12l-3-3-3 3" />
    </template>

    <!-- Account / cabinet -->
    <template v-else-if="name === 'user'">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </template>
    <template v-else-if="name === 'toy'">
      <rect x="4" y="8" width="16" height="10" rx="2" />
      <path d="M8 8V6a2 2 0 0 1 4 0v2" />
      <path d="M9 13h.01" />
      <path d="M15 13h.01" />
    </template>
    <template v-else-if="name === 'credit-card'">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </template>
    <template v-else-if="name === 'baby'">
      <circle cx="12" cy="8" r="4" />
      <path d="M6 21v-1a6 6 0 0 1 12 0v1" />
    </template>
    <template v-else-if="name === 'package'">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </template>
    <template v-else-if="name === 'timer'">
      <path d="M10 2h4" />
      <path d="M12 14v-4" />
      <path d="M4 13a8 8 0 0 1 8-7 8 8 0 1 1-5.3 14" />
    </template>
    <template v-else-if="name === 'truck'">
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.3a1 1 0 0 0-.3-.7L19 11h-3" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </template>
    <template v-else-if="name === 'cart'">
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2 2h3l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
    </template>
    <template v-else-if="name === 'refresh'">
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.7 2.7L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.7-2.7L21 16" />
      <path d="M16 16h5v5" />
    </template>

    <!-- Catalog categories -->
    <template v-else-if="name === 'brain'">
      <path d="M12 5a3 3 0 1 0-5.7 1.4A3.5 3.5 0 0 0 3 10.5 3 3 0 0 0 5 16h14a3 3 0 0 0 2-5.5 3.5 3.5 0 0 0-3.3-4.1A3 3 0 0 0 12 5Z" />
    </template>
    <template v-else-if="name === 'blocks'">
      <path d="M12 2 2 7l10 5 10-5-10-5Z" />
      <path d="m2 17 10 5 10-5" />
    </template>
    <template v-else-if="name === 'music'">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </template>
    <template v-else-if="name === 'masks'">
      <circle cx="9" cy="10" r="3" />
      <circle cx="15" cy="10" r="3" />
      <path d="M5.5 16.5c1.2-1.5 3.1-2.5 6.5-2.5s5.3 1 6.5 2.5" />
    </template>
    <template v-else-if="name === 'palette'">
      <circle cx="13.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="10.5" r="2.5" />
      <circle cx="8.5" cy="7.5" r="2.5" />
      <circle cx="6.5" cy="12.5" r="2.5" />
      <path d="M12 22a8 8 0 0 0 8-8c0-4-3.6-7.2-8-7.2S4 10 4 14a8 8 0 0 0 8 8Z" />
    </template>
    <template v-else-if="name === 'tree'">
      <path d="M12 22v-7" />
      <path d="M8 22h8" />
      <path d="M12 15 8 9h8l-4 6Z" />
      <path d="M12 9 9 4h6l-3 5Z" />
    </template>

    <!-- Utility -->
    <template v-else-if="name === 'search'">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </template>
    <template v-else-if="name === 'phone'">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.5-1.1a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6A2 2 0 0 1 22 16.9Z" />
    </template>
    <template v-else-if="name === 'message'">
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.5-4.5A4 4 0 0 1 4 15V7a4 4 0 0 1 4-4h9a4 4 0 0 1 4 4Z" />
    </template>
    <template v-else-if="name === 'mail'">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 7L2 7" />
    </template>
    <template v-else-if="name === 'map-pin'">
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </template>
    <template v-else-if="name === 'car'">
      <path d="M19 17h2a1 1 0 0 0 1-1v-3.3a1 1 0 0 0-.3-.7L19 9H5L3.3 12.3a1 1 0 0 0-.3.7V16a1 1 0 0 0 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
      <path d="M5 9l1-4h12l1 4" />
    </template>
    <template v-else-if="name === 'camera'">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
      <circle cx="12" cy="13" r="3" />
    </template>
    <template v-else-if="name === 'lightbulb'">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.2 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </template>
    <template v-else-if="name === 'alert'">
      <path d="m21.7 18.4-9-16a1 1 0 0 0-1.7 0l-9 16A1 1 0 0 0 3 20h18a1 1 0 0 0 .7-1.6Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </template>
    <template v-else-if="name === 'check'">
      <path d="M20 6 9 17l-5-5" />
    </template>
    <template v-else-if="name === 'settings'">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </template>
    <template v-else-if="name === 'sparkles'">
      <path d="m12 3 1.2 3.6L17 8l-3.8 1.4L12 13l-1.2-3.6L7 8l3.8-1.4Z" />
      <path d="M19 13l.8 2.2L22 16l-2.2.8L19 19l-.8-2.2L16 16l2.2-.8Z" />
    </template>
    <template v-else-if="name === 'pin'">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </template>
    <template v-else-if="name === 'home'">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <path d="M9 22V12h6v10" />
    </template>
    <template v-else-if="name === 'edit'">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </template>
    <template v-else-if="name === 'trash'">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    </template>
    <template v-else-if="name === 'ticket'">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M9 9h.01" />
      <path d="M9 15h.01" />
    </template>
    <template v-else-if="name === 'shield'">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    </template>
    <template v-else-if="name === 'rocket'">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2Z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </template>
    <template v-else-if="name === 'party'">
      <path d="M5 8l4 4" />
      <path d="M12 4v4" />
      <path d="M19 8l-4 4" />
      <path d="M4 14l4 4" />
      <path d="M16 14l4 4" />
      <path d="M12 12v8" />
    </template>

    <template v-else-if="name === 'leaf'">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 18 2c1 2 2 4.5 2 8a6 6 0 0 1-9 10Z" />
      <path d="M12 22v-8" />
    </template>
    <template v-else-if="name === 'calendar'">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </template>
    <template v-else-if="name === 'snowflake'">
      <path d="M12 2v20" />
      <path d="m4.9 4.9 14.2 14.2" />
      <path d="m19.1 4.9-14.2 14.2" />
      <path d="M2 12h20" />
      <path d="m4.9 19.1 14.2-14.2" />
      <path d="m19.1 19.1-14.2-14.2" />
    </template>
    <template v-else-if="name === 'copy'">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </template>
    <template v-else-if="name === 'link'">
      <path d="M10 13a5 5 0 0 0 7.5 0l2.5-2.5a5 5 0 0 0-7.1-7.1L11 4" />
      <path d="M14 11a5 5 0 0 0-7.5 0L4 13.5a5 5 0 0 0 7.1 7.1L13 20" />
    </template>
    <template v-else-if="name === 'bolt'">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
    </template>
    <template v-else-if="name === 'book'">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </template>
    <template v-else-if="name === 'arrow-right'">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </template>

    <!-- Fallback -->
    <template v-else>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </template>
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  name: string
  size?: number
}>(), {
  size: 18,
})
</script>

<style scoped>
.app-icon {
  display: block;
  flex-shrink: 0;
}
</style>
