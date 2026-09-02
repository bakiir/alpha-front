<template>
  <div class="app-image-container" :class="{ 'is-loaded': isLoaded, 'has-error': hasError, 'is-skeleton': !isLoaded && !hasError }">
    <!-- Skeleton loader shimmer while image loads -->
    <div v-if="!isLoaded && !hasError" class="image-skeleton-shimmer" aria-hidden="true"></div>

    <!-- The actual image with lazy loading and async decoding -->
    <img
      v-show="!hasError"
      ref="imgRef"
      :src="currentSrc"
      :alt="alt || ''"
      :loading="lazy ? 'lazy' : 'eager'"
      decoding="async"
      :class="['app-img', customClass]"
      @load="onLoad"
      @error="onError"
    />

    <!-- Fallback SVG Placeholder on Broken/Missing Image -->
    <div v-if="hasError" class="image-fallback-placeholder" :class="customClass">
      <div class="fallback-icon-wrap">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="fallback-svg">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
        <span v-if="alt" class="fallback-text">{{ alt }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    src?: string | null
    alt?: string
    lazy?: boolean
    customClass?: string
    fallbackSrc?: string
  }>(),
  {
    src: '',
    alt: '',
    lazy: true,
    customClass: '',
    fallbackSrc: '',
  }
)

const isLoaded = ref(false)
const hasError = ref(false)
const imgRef = ref<HTMLImageElement | null>(null)

const currentSrc = computed(() => {
  if (!props.src || props.src.trim() === '') {
    return props.fallbackSrc || ''
  }
  return props.src
})

const onLoad = () => {
  isLoaded.value = true
  hasError.value = false
}

const onError = () => {
  if (props.fallbackSrc && currentSrc.value !== props.fallbackSrc) {
    // Attempt fallback source once
    if (imgRef.value) {
      imgRef.value.src = props.fallbackSrc
    }
  } else {
    hasError.value = true
    isLoaded.value = true
  }
}

watch(
  () => props.src,
  (newSrc) => {
    if (!newSrc) {
      hasError.value = true
      isLoaded.value = true
    } else {
      isLoaded.value = false
      hasError.value = false
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.app-image-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f1f5f9;
}

.image-skeleton-shimmer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(241, 245, 249, 1) 0%,
    rgba(226, 232, 240, 0.8) 50%,
    rgba(241, 245, 249, 1) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
  z-index: 1;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.app-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease, transform 0.3s ease;
  opacity: 0;
  z-index: 2;
}

.is-loaded .app-img {
  opacity: 1;
}

.image-fallback-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  color: #94a3b8;
  padding: 1rem;
  text-align: center;
}

.fallback-icon-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.fallback-svg {
  opacity: 0.6;
}

.fallback-text {
  font-size: 0.75rem;
  color: #64748b;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
