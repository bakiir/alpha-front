<template>
  <section v-if="section && cards.length" class="home-reels" aria-labelledby="home-reels-title">
    <div class="home-reels__inner container">
      <header class="home-reels__header">
        <div class="home-reels__heading">
          <p v-if="section.badge_text" class="home-reels__eyebrow">{{ section.badge_text }}</p>
          <h2 id="home-reels-title">{{ section.title }}</h2>
          <p v-if="section.subtitle" class="home-reels__intro">{{ section.subtitle }}</p>
        </div>
        <div v-if="cards.length > 1" class="home-reels__controls" aria-label="Листать видео">
          <button type="button" aria-label="Предыдущие видео" @click="scrollCards(-1)">←</button>
          <button type="button" aria-label="Следующие видео" @click="scrollCards(1)">→</button>
        </div>
      </header>

      <div ref="trackRef" class="home-reels__track" tabindex="0" aria-label="Истории Alpha">
        <article v-for="(card, index) in cards" :key="index" class="home-reel" :class="`home-reel--${index % 6}`">
          <button
            v-if="card.videoUrl"
            class="home-reel__surface home-reel__surface--playable"
            :class="{ 'home-reel__surface--playing': playingIndex === index }"
            type="button"
            :aria-label="`${playingIndex === index ? 'Остановить' : 'Воспроизвести'} видео «${card.title}»`"
            @pointerenter="startOnHover($event, index)"
            @pointerleave="stopOnLeave($event)"
            @click="toggleOnClick($event, index)"
            @blur="stopOnBlur($event)"
          >
            <video :src="card.videoUrl" class="home-reel__media" preload="metadata" muted playsinline aria-hidden="true" tabindex="-1" @ended="stopActiveVideo"></video>
            <img v-if="card.posterUrl && playingIndex !== index" :src="card.posterUrl" :alt="card.title" loading="lazy" class="home-reel__poster">
            <span v-if="playingIndex !== index" class="home-reel__top">ALPHA / {{ String(index + 1).padStart(2, '0') }}</span>
            <span v-if="playingIndex !== index" class="home-reel__copy"><strong>{{ card.title }}</strong><small>{{ card.caption }}</small></span>
          </button>
          <div v-else class="home-reel__surface home-reel__surface--placeholder">
            <img v-if="card.posterUrl" :src="card.posterUrl" :alt="card.title" loading="lazy" class="home-reel__poster">
            <span class="home-reel__art" aria-hidden="true"><span></span><span></span><span></span></span>
            <span class="home-reel__top">ALPHA / {{ String(index + 1).padStart(2, '0') }}</span>
            <span class="home-reel__soon">Видео скоро появится</span>
            <span class="home-reel__copy"><strong>{{ card.title }}</strong><small>{{ card.caption }}</small></span>
          </div>
        </article>
      </div>
    </div>

  </section>
</template>

<script setup lang="ts">
interface ReelCard {
  title: string
  caption: string
  videoUrl: string
  posterUrl: string
}

const { sectionByKey, hasError, refresh } = usePageSections('home')
const section = sectionByKey('reels')
const { cmsMediaUrl } = useCmsMediaUrl()
const trackRef = ref<HTMLElement | null>(null)
const playingIndex = ref<number | null>(null)
let activeVideo: HTMLVideoElement | null = null

const cards = computed<ReelCard[]>(() => {
  const raw = section.value?.content?.cards
  if (!Array.isArray(raw)) return []
  return raw.filter((item) => item && typeof item === 'object' && item.is_active !== false).map((item) => ({
    title: String(item.title || 'История Alpha'),
    caption: String(item.caption || ''),
    videoUrl: cmsMediaUrl(typeof item.video_url === 'string' ? item.video_url : ''),
    posterUrl: cmsMediaUrl(typeof item.poster_url === 'string' ? item.poster_url : ''),
  }))
})

function scrollCards(direction: number) {
  const track = trackRef.value
  if (!track) return
  const card = track.querySelector<HTMLElement>('.home-reel')
  const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 16
  track.scrollBy({ left: direction * ((card?.offsetWidth || 230) + gap), behavior: 'smooth' })
}

function stopActiveVideo() {
  if (activeVideo) {
    activeVideo.pause()
    if (activeVideo.readyState >= 1) activeVideo.currentTime = 0
  }
  activeVideo = null
  playingIndex.value = null
}

function startVideo(surface: EventTarget | null, index: number) {
  if (!(surface instanceof HTMLElement)) return
  const video = surface.querySelector('video')
  if (!video) return
  if (activeVideo && activeVideo !== video) stopActiveVideo()
  activeVideo = video
  video.play().then(() => {
    if (activeVideo === video) playingIndex.value = index
  }).catch(() => {
    if (activeVideo === video) stopActiveVideo()
  })
}

function startOnHover(event: PointerEvent, index: number) {
  if (event.pointerType === 'mouse' || event.pointerType === 'pen') startVideo(event.currentTarget, index)
}

function stopOnLeave(event: PointerEvent) {
  if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return
  if (event.currentTarget instanceof HTMLElement && event.currentTarget.contains(activeVideo)) stopActiveVideo()
}

function toggleOnClick(event: MouseEvent, index: number) {
  if (event.detail > 0 && window.matchMedia('(hover: hover)').matches) return
  if (event.currentTarget instanceof HTMLElement && event.currentTarget.contains(activeVideo)) stopActiveVideo()
  else startVideo(event.currentTarget, index)
}

function stopOnBlur(event: FocusEvent) {
  if (event.currentTarget instanceof HTMLElement && event.currentTarget.contains(activeVideo)) stopActiveVideo()
}

onMounted(() => {
  if (hasError.value) refresh()
})
onBeforeUnmount(() => {
  stopActiveVideo()
})
</script>

<style scoped>
.home-reels { padding: clamp(72px, 8vw, 112px) 0; overflow: hidden; background: var(--ivory); }
.home-reels__inner { padding-inline: clamp(20px, 4vw, 64px); }
.home-reels__header { display: flex; align-items: end; justify-content: space-between; gap: 32px; margin-bottom: 34px; }
.home-reels__eyebrow { margin: 0 0 12px; color: var(--alpha-green); font-size: 11px; font-weight: 800; letter-spacing: .15em; text-transform: uppercase; }
.home-reels h2 { max-width: 780px; margin: 0; color: var(--graphite); font-family: var(--font-display); font-size: clamp(42px, 4.8vw, 66px); font-weight: 600; line-height: .98; }
.home-reels__intro { max-width: 650px; margin: 16px 0 0; color: var(--text-secondary); font-size: 15px; line-height: 1.7; }
.home-reels__controls { display: flex; gap: 10px; flex: none; }
.home-reels__controls button { width: 48px; height: 48px; border: 1px solid var(--warm-sand); border-radius: 50%; background: #fff; color: var(--graphite); font-size: 24px; cursor: pointer; transition: background .2s, transform .2s; }
.home-reels__controls button:hover { background: var(--soft-white); transform: translateY(-2px); }
.home-reels__controls button:focus-visible { outline: 3px solid var(--alpha-green); outline-offset: 3px; }
.home-reel__surface:focus-visible { outline: 2px solid rgba(255, 255, 255, .95); outline-offset: -4px; }
.home-reels__track { display: grid; grid-auto-flow: column; grid-auto-columns: clamp(190px, calc((100% - 64px) / 5.25), 260px); gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; overscroll-behavior-inline: contain; padding: 2px 2px 12px; }
.home-reels__track::-webkit-scrollbar { display: none; }
.home-reel { min-width: 0; scroll-snap-align: start; }
.home-reel__surface { position: relative; display: block; width: 100%; aspect-ratio: 9 / 16; overflow: hidden; border: 0; border-radius: 20px; padding: 0; text-align: left; color: #fff; background: #839f8a; isolation: isolate; box-shadow: 0 12px 28px rgba(29, 52, 42, .12); }
.home-reel__surface--playable { cursor: pointer; }
.home-reel--1 .home-reel__surface { background: #ad8fbb; }
.home-reel--2 .home-reel__surface { background: #a5755e; }
.home-reel--3 .home-reel__surface { background: #638d9b; }
.home-reel--4 .home-reel__surface { background: #a78868; }
.home-reel--5 .home-reel__surface { background: #707f61; }
.home-reel__surface::after { content: ''; position: absolute; z-index: 2; inset: 35% 0 0; background: linear-gradient(transparent, rgba(15, 30, 24, .72)); pointer-events: none; }
.home-reel__surface--playing::after { display: none; }
.home-reel__media, .home-reel__poster { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
.home-reel__media { z-index: 0; }
.home-reel__poster { z-index: 1; }
.home-reel__art { position: absolute; z-index: 0; inset: 0; opacity: .64; }
.home-reel__art span { position: absolute; border-radius: 50%; border: 1px solid rgba(255, 255, 255, .45); }
.home-reel__art span:nth-child(1) { width: 78%; aspect-ratio: 1; left: 13%; top: 16%; background: rgba(255, 255, 255, .18); }
.home-reel__art span:nth-child(2) { width: 46%; aspect-ratio: 1; left: -10%; top: 33%; background: rgba(240, 198, 143, .56); }
.home-reel__art span:nth-child(3) { width: 30%; aspect-ratio: 1; right: -6%; top: 10%; background: rgba(197, 173, 221, .55); }
.home-reel__top { position: absolute; z-index: 3; top: 18px; left: 17px; font-size: 10px; font-weight: 800; letter-spacing: .16em; }
.home-reel__soon { position: absolute; z-index: 3; left: 17px; top: 44%; right: 17px; text-align: center; font-size: 12px; font-weight: 700; letter-spacing: .04em; }
.home-reel__copy { position: absolute; z-index: 3; left: 18px; right: 18px; bottom: 20px; display: grid; gap: 7px; }
.home-reel__copy strong { font-family: var(--font-display); font-size: 27px; font-weight: 600; line-height: 1; }
.home-reel__copy small { font-size: 12px; line-height: 1.45; opacity: .92; }
@media (max-width: 900px) { .home-reels__track { grid-auto-columns: min(32vw, 240px); } }
@media (max-width: 680px) { .home-reels { padding: 64px 0; } .home-reels__header { align-items: flex-start; flex-direction: column; gap: 20px; } .home-reels__controls button { width: 44px; height: 44px; } .home-reels__track { grid-auto-columns: min(58vw, 250px); gap: 12px; margin-right: -20px; } }
@media (prefers-reduced-motion: reduce) { .home-reels__controls button { transition: none; } .home-reels__track { scroll-behavior: auto; } }
</style>
