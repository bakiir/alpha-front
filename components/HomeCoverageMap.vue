<template>
  <section v-if="section && regions.length" class="coverage-map" aria-labelledby="coverage-map-title">
    <div class="coverage-map__inner container">
      <header class="coverage-map__header">
        <p v-if="section.badge_text" class="coverage-map__eyebrow">{{ section.badge_text }}</p>
        <h2 id="coverage-map-title">{{ section.title }}</h2>
        <p v-if="section.subtitle" class="coverage-map__intro">{{ section.subtitle }}</p>
      </header>

      <div class="coverage-map__graphic" aria-hidden="true">
        <div v-if="highlightedMap" class="coverage-map__outline" v-html="highlightedMap"></div>
        <img v-else class="coverage-map__outline" src="/maps/kazakhstan.svg" alt="" width="1117" height="611" loading="lazy">

        <span
          v-for="region in regions"
          :key="region.key"
          class="coverage-map__place"
          :class="{ 'coverage-map__place--active': region.isActive }"
          :style="position(region)"
        >
          {{ region.name }}
        </span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface CoverageRegion {
  key: string
  name?: string
  is_active?: boolean
}

const viewBox = { x: -91.75, y: -85, width: 1116.6, height: 610.56 }
const defaults = [
  { key: 'oral', x: 18.5, y: 131.5, w: 224, name: 'Уральск' },
  { key: 'atyrau', x: 43.4, y: 251.4, w: 252, name: 'Атырау' },
  { key: 'aktobe', x: 242.5, y: 182.3, w: 284, name: 'Актобе' },
  { key: 'aqtau', x: 78.8, y: 383.6, w: 178, name: 'Актау' },
  { key: 'kostanay', x: 380.3, y: 50.2, w: 223, name: 'Костанай' },
  { key: 'kyzylorda', x: 394.8, y: 349.4, w: 248, name: 'Кызылорда' },
  { key: 'karaganda', x: 597.1, y: 205.7, w: 421, name: 'Караганда' },
  { key: 'petropavl', x: 568.8, y: -14.2, w: 221, name: 'Петропавловск' },
  { key: 'turkestan', x: 505.4, y: 383.5, w: 150, name: 'Туркестан' },
  { key: 'taraz', x: 613.5, y: 417.8, w: 174, name: 'Тараз' },
  { key: 'almaty', x: 767.3, y: 393.8, w: 240, name: 'Алматы' },
  { key: 'ustkamenogorsk', x: 876.5, y: 222.3, w: 292, name: 'Усть-Каменогорск' },
  { key: 'pavlodar', x: 714.4, y: 73.2, w: 156, name: 'Павлодар' },
  { key: 'astana', x: 552.1, y: 89.6, w: 243, name: 'Астана' },
  { key: 'shymkent', x: 486.7, y: 477.3, w: 134, name: 'Шымкент' },
] as const

const { sectionByKey, hasError, refresh } = usePageSections('home')
const section = sectionByKey('coverage_map')
const mapSvg = ref('')

onMounted(() => {
  if (hasError.value) refresh()
  fetch('/maps/kazakhstan.svg')
    .then(response => response.ok ? response.text() : '')
    .then(svg => { mapSvg.value = svg })
    .catch(() => {})
})

const regions = computed(() => {
  const raw = section.value?.content?.regions
  const content = Array.isArray(raw) ? raw as CoverageRegion[] : []

  return defaults.map((region) => {
    const configured = content.find(item => item?.key === region.key)
    return {
      ...region,
      name: String(configured?.name || region.name),
      isActive: configured?.is_active === true,
    }
  })
})

const activeRegions = computed(() => regions.value.filter(region => region.isActive).map(region => region.key))
const highlightedMap = computed(() => {
  if (!mapSvg.value) return ''
  const rules = activeRegions.value.map(key =>
    `.region[data-city="${key}"] .area{fill:#a8c9ae;fill-opacity:.52}.region[data-city="${key}"] .line{fill:#83a78b}`,
  ).join('')
  return mapSvg.value.replace('</style>', `${rules}</style>`)
})

const position = (region: { x: number, y: number, w: number, name: string }) => {
  const chars = Math.max([...region.name].length, 1)
  const fit = ((region.w * 0.72) / viewBox.width) * 100 / (chars * 0.9)
  return {
    left: `${((region.x - viewBox.x) / viewBox.width) * 100}%`,
    top: `${((region.y - viewBox.y) / viewBox.height) * 100}%`,
    '--fit': fit.toFixed(3),
  }
}
</script>

<style scoped>
.coverage-map { padding: clamp(78px, 8vw, 122px) 0 clamp(64px, 7vw, 104px); background: var(--ivory); }
.coverage-map__inner { padding-inline: clamp(20px, 4vw, 64px); }
.coverage-map__header { max-width: 800px; margin: 0 0 clamp(26px, 4vw, 62px); }
.coverage-map__eyebrow { margin: 0 0 14px; color: var(--alpha-green); font-size: 11px; font-weight: 800; letter-spacing: .15em; }
.coverage-map h2 { margin: 0; color: var(--graphite); font-family: var(--font-display); font-size: clamp(44px, 5.2vw, 70px); font-weight: 600; line-height: .98; }
.coverage-map__intro { margin: 18px 0 0; color: var(--text-secondary); font-size: 16px; line-height: 1.6; }
.coverage-map__graphic { position: relative; width: 100%; aspect-ratio: 1116.6 / 610.56; container-type: inline-size; }
.coverage-map__outline { display: block; width: 100%; height: 100%; }
.coverage-map__outline :deep(svg) { display: block; width: 100%; height: 100%; }
.coverage-map__place {
  position: absolute;
  transform: translate(-50%, -50%);
  color: #87958b;
  font-size: clamp(7px, calc(var(--fit) * 1cqw), 12px);
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0;
  text-align: center;
  white-space: nowrap;
}
.coverage-map__place--active { color: #365948; font-weight: 700; }
@media (max-width: 560px) {
  .coverage-map { padding: 68px 0; }
  .coverage-map__place { display: none; }
}
</style>
