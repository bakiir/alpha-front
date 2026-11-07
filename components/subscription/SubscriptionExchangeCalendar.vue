<template>
  <section class="exchange-calendar" aria-labelledby="exchange-calendar-title">
    <header class="calendar-header">
      <div>
        <span class="calendar-eyebrow">{{ t('subscription.dashboard.calendar.eyebrow') }}</span>
        <h3 id="exchange-calendar-title">{{ t('subscription.dashboard.calendar.title') }}</h3>
      </div>
      <div class="calendar-controls">
        <button type="button" class="today-button" @click="goToday">{{ t('subscription.dashboard.calendar.today') }}</button>
        <button type="button" class="arrow-button" :aria-label="t('subscription.dashboard.calendar.previousMonth')" @click="changeMonth(-1)">‹</button>
        <button type="button" class="arrow-button" :aria-label="t('subscription.dashboard.calendar.nextMonth')" @click="changeMonth(1)">›</button>
      </div>
    </header>

    <div class="calendar-month">{{ monthTitle }}</div>
    <p class="calendar-caption">{{ t('subscription.dashboard.calendar.timelineHint') }}</p>
    <div v-if="calendarChildren.length > 1" class="calendar-children" :aria-label="t('subscription.dashboard.calendar.title')">
      <span v-for="child in calendarChildren" :key="child.id" class="child-chip" :class="child.color">
        <i aria-hidden="true"></i>{{ child.name }}
      </span>
    </div>

    <div class="calendar-scroll" role="region" tabindex="0" :aria-label="t('subscription.dashboard.calendar.weeksAria')">
      <div class="calendar-body" role="grid" :aria-label="monthTitle">
        <div class="weekday-row" role="row">
          <span v-for="day in weekdayNames" :key="day" role="columnheader">{{ day }}</span>
        </div>
        <div v-for="week in calendarWeeks" :key="week.start" class="calendar-week" role="row" :style="{ '--lanes': week.lanes }">
          <button
            v-for="day in week.days"
            :key="day.iso"
            type="button"
            class="day-cell"
            :class="{ 'outside-month': !day.inMonth, today: day.iso === todayIso, selected: hasSelectedDay && day.iso === selectedDay }"
            :aria-label="day.ariaLabel"
            :aria-pressed="hasSelectedDay && day.iso === selectedDay"
            @click="selectDay(day.iso)"
          >
            <span class="day-number">{{ day.number }}</span>
          </button>
          <button
            v-for="bar in week.bars"
            :key="bar.key"
            type="button"
            class="timeline-bar"
            :class="[bar.kind, bar.childColor, { continuation: bar.continuation, 'continues-next': bar.continuesNext }]"
            :style="{ '--start': bar.start, '--span': bar.span, '--lane': bar.lane }"
            :title="bar.fullLabel"
            :aria-label="bar.fullLabel"
            @click="selectDay(bar.focusDay)"
          >{{ bar.displayLabel }}</button>
        </div>
      </div>
    </div>
    <p class="mobile-scroll-hint">{{ t('subscription.dashboard.calendar.scrollHint') }}</p>

    <div class="calendar-legend">
      <span><i class="legend-period"></i>{{ t('subscription.dashboard.calendar.period') }}</span>
      <span><i class="legend-event"></i>{{ t('subscription.dashboard.calendar.event') }}</span>
      <span><i class="legend-freeze"></i>{{ t('subscription.dashboard.calendar.freeze') }}</span>
    </div>

    <div v-if="hasSelectedDay" class="day-detail" aria-live="polite">
      <strong class="detail-date">{{ selectedDayLabel }}</strong>
      <div v-if="selectedDetails.length" class="detail-list">
        <div v-for="detail in selectedDetails" :key="detail.subscriptionId" class="detail-child">
          <strong>{{ detail.childName }}</strong>
          <span v-if="detail.periodNumber" class="detail-period">{{ t('subscription.dashboard.calendar.periodHint', { n: detail.periodNumber }) }}</span>
          <span v-if="detail.frozen" class="detail-freeze">{{ t('subscription.dashboard.calendar.freeze') }}</span>
          <div v-for="event in detail.events" :key="event.key" class="detail-event">
            <span class="event-type">{{ event.badge }}</span>
            <span>{{ event.title }}</span>
            <small v-if="event.toys.length">{{ event.toys.join(', ') }}</small>
          </div>
        </div>
      </div>
      <p v-else class="detail-empty">{{ t('subscription.dashboard.calendar.noEvents') }}</p>
      <button v-if="canViewSelectedComposition" type="button" class="composition-link" @click="emit('view-composition')">
        {{ t('subscription.dashboard.calendar.viewComposition') }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
type SetEntry = {
  id: number
  title: string
  status: string
  delivered_at?: string | null
  return_due_date?: string | null
  toys?: string[]
}

type CalendarSchedule = {
  subscriptionId: number
  childName: string
  exchangeCount: number
  periodStart?: string | null
  periodEnd?: string | null
  plannedExchangeDate?: string | null
  nextDeliveryDate?: string | null
  freezeStart?: string | null
  freezeEnd?: string | null
  isPaused: boolean
  sets: SetEntry[]
  currentSetId?: number | null
  nextSetId?: number | null
}

type CalendarEvent = {
  key: string
  date: string
  kind: 'exchange' | 'delivery' | 'received' | 'due'
  badge: string
  title: string
  toys: string[]
}

type TimelineEntry = {
  key: string
  subscriptionId: number
  childName: string
  childColor: string
  kind: 'period' | 'freeze' | 'exchange' | 'delivery' | 'received' | 'due'
  label: string
  shortLabel: string
  fullLabel: string
  start: Date
  end: Date
}

const props = defineProps<{
  schedules: CalendarSchedule[]
  selectedSubscriptionId?: number | null
  currentToys?: Array<{ name?: string; title?: string }>
  nextToys?: Array<{ name?: string; title?: string }>
}>()

const emit = defineEmits<{ 'view-composition': [] }>()
const { t, locale } = useI18n()
const calendarKey = (key: string) => t(`subscription.dashboard.calendar.${key}`)
const weekdayNames = computed(() => ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => t(`subscription.dashboard.calendar.weekdays.${day}`)))
const calendarChildren = computed(() => (props.schedules || []).map((schedule, index) => ({
  id: schedule.subscriptionId,
  name: schedule.childName || t('subscription.childFallback'),
  color: `child-${index % 4}`,
})))
const now = new Date()
const todayIso = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-')
const visibleMonth = ref(new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)))
const selectedDay = ref(todayIso)
const hasSelectedDay = ref(false)

const parseDate = (value?: string | null): Date | null => {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return null
  const parsed = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
  return Number.isNaN(parsed.getTime()) ? null : parsed
}
const isoDate = (date: Date) => date.toISOString().slice(0, 10)
const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 86_400_000)
const diffDays = (start: Date, end: Date) => Math.round((end.getTime() - start.getTime()) / 86_400_000)
const formatDate = (date: Date, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(locale.value === 'kk' ? 'kk-KZ' : locale.value === 'en' ? 'en-US' : 'ru-RU', { timeZone: 'UTC', ...options }).format(date)
const monthTitle = computed(() => formatDate(visibleMonth.value, { month: 'long', year: 'numeric' }))
const selectedDayLabel = computed(() => formatDate(parseDate(selectedDay.value) || visibleMonth.value, {
  day: 'numeric', month: 'long', weekday: 'long',
}))

const periodFor = (schedule: CalendarSchedule, date: Date): number | null => {
  const start = parseDate(schedule.periodStart)
  const end = parseDate(schedule.periodEnd)
  const total = start && end ? diffDays(start, end) : 0
  const elapsed = start ? diffDays(start, date) : -1
  if (!start || !end || !schedule.exchangeCount || total < 1 || elapsed < 0 || elapsed >= total) return null
  const freezeStart = schedule.isPaused ? parseDate(schedule.freezeStart) : null
  if (freezeStart && date >= freezeStart) return null
  return Math.min(schedule.exchangeCount - 1, Math.floor(elapsed * schedule.exchangeCount / total))
}

const isFrozenOn = (schedule: CalendarSchedule, date: Date) => {
  if (!schedule.isPaused) return false
  const start = parseDate(schedule.freezeStart)
  const end = parseDate(schedule.freezeEnd)
  return !!start && !!end && date >= start && date <= end
}

const eventsFor = (schedule: CalendarSchedule): CalendarEvent[] => {
  const events: CalendarEvent[] = []
  const nextSet = schedule.sets.find(set => set.id === schedule.nextSetId)
  const currentSet = schedule.sets.find(set => set.id === schedule.currentSetId)
  const nextToys = nextSet?.toys?.length ? nextSet.toys : schedule.subscriptionId === props.selectedSubscriptionId
    ? (props.nextToys || []).map(toy => toy.name || toy.title || '').filter(Boolean)
    : []
  const exchangeDate = schedule.plannedExchangeDate?.slice(0, 10)
  const deliveryDate = schedule.nextDeliveryDate?.slice(0, 10)
  if (exchangeDate && !schedule.isPaused) {
    events.push({ key: 'exchange', date: exchangeDate, kind: 'exchange', badge: calendarKey('exchange'), title: calendarKey('exchangePlanned'), toys: nextToys })
  }
  if (deliveryDate && schedule.nextSetId && deliveryDate !== exchangeDate && nextSet?.delivered_at?.slice(0, 10) !== deliveryDate && !schedule.isPaused) {
    events.push({ key: 'delivery', date: deliveryDate, kind: 'delivery', badge: calendarKey('delivery'), title: nextSet?.title || calendarKey('nextSet'), toys: nextToys })
  }
  for (const set of schedule.sets) {
    const delivered = set.delivered_at?.slice(0, 10)
    if (delivered) {
      events.push({ key: `received-${set.id}`, date: delivered, kind: 'received', badge: calendarKey('received'), title: set.title || calendarKey('setFallback'), toys: set.toys || [] })
    }
  }
  const due = currentSet?.return_due_date?.slice(0, 10)
  if (due && due !== exchangeDate && !schedule.isPaused) {
    events.push({ key: 'due', date: due, kind: 'due', badge: calendarKey('due'), title: currentSet?.title || calendarKey('currentSet'), toys: currentSet?.toys || [] })
  }
  return events
}

const timelineEntries = computed<TimelineEntry[]>(() => {
  const entries: TimelineEntry[] = []
  const schedules = props.schedules || []
  schedules.forEach((schedule, index) => {
    const childColor = `child-${index % 4}`
    const childName = schedule.childName || t('subscription.childFallback')
    const start = parseDate(schedule.periodStart)
    const end = parseDate(schedule.periodEnd)
    const total = start && end ? diffDays(start, end) : 0
    const count = Math.max(0, Math.min(schedule.exchangeCount, 31))
    const freezeStart = schedule.isPaused ? parseDate(schedule.freezeStart) : null
    if (start && end && total > 0 && count > 0) {
      for (let period = 0; period < count; period++) {
        const periodStart = addDays(start, Math.floor(period * total / count))
        const periodEnd = addDays(start, Math.floor((period + 1) * total / count))
        const visibleEnd = freezeStart && periodEnd > freezeStart ? freezeStart : periodEnd
        if (visibleEnd <= periodStart) continue
        const label = t('subscription.dashboard.calendar.periodBar', { name: childName, n: period + 1, total: count })
        entries.push({ key: `${schedule.subscriptionId}-period-${period}`, subscriptionId: schedule.subscriptionId, childName, childColor, kind: 'period', label, shortLabel: `${period + 1}/${count}`, fullLabel: label, start: periodStart, end: visibleEnd })
      }
    }
    const freezeEnd = schedule.isPaused ? parseDate(schedule.freezeEnd) : null
    if (freezeStart && freezeEnd && freezeEnd >= freezeStart) {
      const label = t('subscription.dashboard.calendar.freezeBar', { name: childName })
      entries.push({ key: `${schedule.subscriptionId}-freeze`, subscriptionId: schedule.subscriptionId, childName, childColor, kind: 'freeze', label, shortLabel: calendarKey('freezeShort'), fullLabel: label, start: freezeStart, end: addDays(freezeEnd, 1) })
    }
    eventsFor(schedule).forEach(event => {
      const date = parseDate(event.date)
      if (!date) return
      const label = `${childName} · ${event.badge}`
      entries.push({ key: `${schedule.subscriptionId}-${event.key}`, subscriptionId: schedule.subscriptionId, childName, childColor, kind: event.kind, label, shortLabel: calendarKey(`${event.kind}Short`), fullLabel: `${label}: ${event.title}`, start: date, end: addDays(date, 1) })
    })
  })
  return entries
})

const calendarWeeks = computed(() => {
  const first = visibleMonth.value
  const offset = (first.getUTCDay() + 6) % 7
  const gridStart = addDays(first, -offset)
  const daysInMonth = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate()
  const rows = Math.ceil((offset + daysInMonth) / 7)
  return Array.from({ length: rows }, (_, weekIndex) => {
    const start = addDays(gridStart, weekIndex * 7)
    const end = addDays(start, 7)
    const days = Array.from({ length: 7 }, (_, dayIndex) => {
      const date = addDays(start, dayIndex)
      return {
        iso: isoDate(date),
        number: date.getUTCDate(),
        inMonth: date.getUTCMonth() === first.getUTCMonth(),
        ariaLabel: formatDate(date, { day: 'numeric', month: 'long', year: 'numeric' }),
      }
    })
    const bars: Array<Omit<TimelineEntry, 'start'> & { start: number; span: number; lane: number; focusDay: string; continuation: boolean; continuesNext: boolean; displayLabel: string }> = []
    let laneOffset = 0
    const schedules = props.schedules || []
    schedules.forEach(schedule => {
      const entries = timelineEntries.value
        .filter(entry => entry.subscriptionId === schedule.subscriptionId && entry.start < end && entry.end > start)
        .sort((a, b) => a.start.getTime() - b.start.getTime()
          || Number(b.kind === 'period') - Number(a.kind === 'period'))
      const laneEnds: number[] = []
      entries.forEach(entry => {
        const clippedStart = entry.start > start ? entry.start : start
        const clippedEnd = entry.end < end ? entry.end : end
        const startDay = diffDays(start, clippedStart)
        const span = diffDays(clippedStart, clippedEnd)
        let lane = laneEnds.findIndex(lastEnd => lastEnd <= startDay)
        if (lane === -1) lane = laneEnds.length
        laneEnds[lane] = startDay + span
        bars.push({ ...entry, key: `${entry.key}-${weekIndex}`, start: startDay, span, lane: laneOffset + lane, focusDay: isoDate(clippedStart), continuation: entry.start < start, continuesNext: entry.end > end, displayLabel: span >= 3 ? entry.label : entry.shortLabel })
      })
      laneOffset += laneEnds.length
    })
    return { start: isoDate(start), days, bars, lanes: Math.max(1, laneOffset) }
  })
})

const selectedDetails = computed(() => {
  const date = parseDate(selectedDay.value)
  if (!date) return []
  return (props.schedules || []).map(schedule => {
    const period = periodFor(schedule, date)
    const frozen = isFrozenOn(schedule, date)
    const events = eventsFor(schedule).filter(event => event.date === selectedDay.value)
    return { subscriptionId: schedule.subscriptionId, childName: schedule.childName || t('subscription.childFallback'), periodNumber: period === null ? null : period + 1, frozen, events }
  }).filter(detail => detail.periodNumber || detail.frozen || detail.events.length)
})
const canViewSelectedComposition = computed(() =>
  !!(props.currentToys?.length || props.nextToys?.length)
  && selectedDetails.value.some(detail => detail.subscriptionId === props.selectedSubscriptionId)
)
const selectDay = (iso: string) => {
  selectedDay.value = iso
  hasSelectedDay.value = true
}
const changeMonth = (step: number) => {
  visibleMonth.value = new Date(Date.UTC(visibleMonth.value.getUTCFullYear(), visibleMonth.value.getUTCMonth() + step, 1))
  selectedDay.value = isoDate(visibleMonth.value)
  hasSelectedDay.value = false
}
const goToday = () => {
  visibleMonth.value = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1))
  selectDay(todayIso)
}
</script>

<style scoped>
.exchange-calendar { display: flex; flex-direction: column; min-width: 0; min-height: 480px; padding: 22px; border: 1px solid #e6e7df; border-radius: 28px; background: #fdfcf9; color: #263b2e; box-shadow: 0 14px 35px #263b2e08; }
.calendar-header,.calendar-controls,.calendar-legend { display: flex; align-items: center; }
.calendar-header { justify-content: space-between; gap: 12px; }
.calendar-eyebrow { color: #6b806e; font-size: 10px; font-weight: 800; letter-spacing: .14em; }
h3 { margin: 5px 0 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: clamp(26px, 2vw, 32px); line-height: 1; font-weight: 600; }
.calendar-controls { flex-shrink: 0; gap: 6px; }
.calendar-controls button { display: grid; place-items: center; border: 1px solid #dfe4db; background: #fff; color: #284637; cursor: pointer; font: inherit; transition: background .15s ease, border-color .15s ease; }
.today-button { padding: 8px 12px; border-radius: 999px; font-size: 11px; font-weight: 800; }
.arrow-button { width: 32px; height: 32px; border-radius: 50%; font-size: 23px !important; line-height: 1; }
.calendar-controls button:hover,.calendar-controls button:focus-visible { border-color: #9eb7a3; background: #eaf1e9; outline: 2px solid #4a7059; outline-offset: 2px; }
.calendar-month { margin-top: 15px; font-size: 18px; font-weight: 800; text-transform: capitalize; }
.calendar-caption { margin: 3px 0 11px; color: #7a847b; font-size: 11px; line-height: 1.4; }
.calendar-children { display: flex; flex-wrap: wrap; gap: 6px; margin: 0 0 10px; }
.child-chip { display: inline-flex; align-items: center; gap: 6px; min-height: 24px; padding: 3px 9px; border: 1px solid #e8ebe5; border-radius: 999px; background: #fff; color: #526357; font-size: 11px; font-weight: 700; }
.child-chip i { width: 8px; height: 8px; border-radius: 50%; background: var(--child-accent); }
.child-0 { --child-accent: #739e78; }.child-1 { --child-accent: #a78ab7; }.child-2 { --child-accent: #79a9aa; }.child-3 { --child-accent: #c2a177; }
.calendar-scroll { flex: 1; min-height: 0; overflow-x: auto; overflow-y: hidden; border: 1px solid #e4e8e0; border-radius: 16px; background: #fff; scrollbar-color: #b7c9b9 #f4f6f1; scrollbar-width: thin; }
.mobile-scroll-hint { display: none; }
.calendar-body { min-width: 0; }
.weekday-row,.calendar-week { display: grid; grid-template-columns: repeat(7, minmax(0,1fr)); }
.weekday-row { background: #f2f5ef; }
.weekday-row span { padding: 8px 4px; border-right: 1px solid #e6ebe3; color: #65766a; text-align: center; font-size: 10px; font-weight: 800; letter-spacing: .04em; }
.weekday-row span:last-child { border-right: 0; }
.calendar-week { position: relative; height: calc(32px + var(--lanes) * 24px); border-top: 1px solid #e5e9e2; }
.day-cell { display: flex; justify-content: flex-end; align-items: flex-start; min-width: 0; padding: 4px 7px 0 0; border: 0; border-right: 1px solid #e9ede7; background: #fff; color: #314637; text-align: right; cursor: pointer; font: inherit; transition: background .15s ease; }
.day-cell:last-of-type { border-right: 0; }
.day-cell:hover,.day-cell.selected { background: #f0f5ef; }
.day-cell.outside-month { background: #fbfbf8; color: #b5bdb4; }
.day-cell.outside-month:hover { background: #f0f5ef; }
.day-number { display: inline-grid; place-items: center; min-width: 23px; height: 23px; font-size: 12px; font-weight: 800; }
.day-cell.today .day-number { border-radius: 50%; background: #3f6757; color: white; }
.day-cell:focus-visible,.timeline-bar:focus-visible { outline: 2px solid #315d43; outline-offset: -2px; }
.timeline-bar { position: absolute; z-index: 1; left: calc((100% / 7) * var(--start) + 3px); width: calc((100% / 7) * var(--span) - 6px); top: calc(30px + var(--lane) * 24px); height: 21px; padding: 0 7px; overflow: hidden; border: 0; border-radius: 6px; text-align: left; text-overflow: ellipsis; white-space: nowrap; cursor: pointer; font: inherit; font-size: 11px; line-height: 21px; font-weight: 800; box-shadow: inset 3px 0 var(--child-accent); }
.timeline-bar:hover { filter: saturate(1.15) brightness(.97); }
.timeline-bar.period.child-0 { background: #dfece0; color: #2e5840; }
.timeline-bar.period.child-1 { background: #ebe3f0; color: #624d70; }
.timeline-bar.period.child-2 { background: #dfefee; color: #315f60; }
.timeline-bar.period.child-3 { background: #f2e9da; color: #755b38; }
.timeline-bar.freeze { background: #e9ebea; color: #526360; }
.timeline-bar.exchange { background: #f9e5d7; color: #8a5536; }
.timeline-bar.delivery,.timeline-bar.received { background: #e3edf4; color: #486981; }
.timeline-bar.due { background: #f5ecdc; color: #806743; }
.timeline-bar.continuation { border-top-left-radius: 3px; border-bottom-left-radius: 3px; }
.timeline-bar.continues-next { border-top-right-radius: 3px; border-bottom-right-radius: 3px; }
.calendar-legend { flex-wrap: wrap; gap: 7px 16px; margin-top: 12px; color: #6a766d; font-size: 11px; font-weight: 700; }
.calendar-legend span { display: inline-flex; align-items: center; gap: 6px; }
.calendar-legend i { width: 13px; height: 7px; border-radius: 999px; }
.legend-period { background: #a8cba9; }.legend-event { background: #e5b393; }.legend-freeze { background: #a7b2b0; }
.day-detail { flex-shrink: 0; max-height: 155px; overflow-y: auto; margin-top: 12px; padding: 12px; border: 1px solid #e5e8e1; border-radius: 16px; background: #fff; }
.detail-date { display: block; text-transform: capitalize; font-size: 13px; }
.detail-list { display: grid; gap: 12px; margin-top: 10px; }
.detail-child + .detail-child { padding-top: 11px; border-top: 1px solid #e9ece7; }
.detail-child > strong { margin-right: 8px; font-size: 12px; }
.detail-period,.detail-freeze { display: inline-block; padding: 3px 7px; border-radius: 999px; background: #e7efe5; color: #3e6349; font-size: 11px; font-weight: 700; }
.detail-freeze { background: #e6e8e8; color: #596766; }
.detail-event { margin-top: 7px; color: #46584a; font-size: 12px; }
.detail-event small { display: block; margin: 4px 0 0; color: #6e7b70; line-height: 1.4; }
.event-type { margin-right: 7px; font-weight: 800; color: #966e4e; }
.detail-empty { margin: 8px 0 0; color: #6f786f; font-size: 12px; }
.composition-link { margin-top: 11px; padding: 0; border: 0; background: none; color: #315d43; font: inherit; font-size: 12px; font-weight: 800; text-decoration: underline; cursor: pointer; }
@media (max-width: 600px) { .exchange-calendar { min-height: 0; padding: 18px 14px; border-radius: 22px; }.calendar-header { align-items: flex-start; }.calendar-controls { gap: 3px; }.today-button { padding: 7px 8px; }.arrow-button { width: 28px; height: 28px; }.calendar-body { min-width: 0; }.calendar-caption { margin-bottom: 8px; }.day-cell { padding-right: 3px; }.timeline-bar { padding: 0 4px; font-size: 10px; }.mobile-scroll-hint { display: none; } }
</style>
