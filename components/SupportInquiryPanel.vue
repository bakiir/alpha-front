<template>
  <section class="support-inquiry" aria-labelledby="support-inquiry-title">
    <h2 id="support-inquiry-title" class="support-inquiry__title">{{ t('supportInquiry.title') }}</h2>
    <p class="support-inquiry__lead">{{ t('supportInquiry.lead') }}</p>

    <div v-if="!user" class="support-inquiry__auth">
      <p>{{ t('supportInquiry.loginHint') }}</p>
      <button type="button" class="support-inquiry__primary" @click="openAuthModal('login')">
        {{ t('supportInquiry.loginCta') }}
      </button>
    </div>

    <template v-else>
      <form class="support-inquiry__form" @submit.prevent="submitNewTicket">
        <label class="support-inquiry__field">
          <span>{{ t('supportInquiry.category') }}</span>
          <select v-model="form.category" required>
            <option v-for="cat in categories" :key="cat" :value="cat">
              {{ t(`supportInquiry.categories.${cat}`) }}
            </option>
          </select>
        </label>
        <label class="support-inquiry__field">
          <span>{{ t('supportInquiry.subject') }}</span>
          <input v-model.trim="form.subject" type="text" maxlength="255" required />
        </label>
        <label class="support-inquiry__field">
          <span>{{ t('supportInquiry.message') }}</span>
          <textarea v-model.trim="form.body" rows="4" required />
        </label>
        <button type="submit" class="support-inquiry__primary" :disabled="isSubmitting">
          {{ isSubmitting ? t('supportInquiry.sending') : t('supportInquiry.submit') }}
        </button>
      </form>

      <div v-if="loadError" class="support-inquiry__error">{{ loadError }}</div>

      <div v-if="tickets.length" class="support-inquiry__list">
        <h3 class="support-inquiry__list-title">{{ t('supportInquiry.myTickets') }}</h3>
        <article
          v-for="ticket in tickets"
          :key="ticket.id"
          class="support-inquiry__ticket"
          :class="{ open: expandedId === ticket.id }"
        >
          <button type="button" class="support-inquiry__ticket-head" @click="toggleTicket(ticket.id)">
            <div>
              <strong>{{ ticket.subject }}</strong>
              <small>
                {{ ticket.ticket_number || `#${ticket.id}` }}
                · {{ t(`supportInquiry.categories.${ticket.category}`) }}
                · {{ formatDate(ticket.created_at) }}
              </small>
            </div>
            <span class="support-inquiry__status" :data-status="ticket.status">
              {{ statusLabel(ticket.status) }}
            </span>
          </button>

          <div v-if="expandedId === ticket.id" class="support-inquiry__thread">
            <div
              v-for="msg in ticket.messages || []"
              :key="msg.id"
              class="support-inquiry__msg"
              :class="{ staff: msg.is_staff }"
            >
              <p>{{ msg.body }}</p>
              <small>{{ formatDate(msg.created_at) }}</small>
            </div>

            <form
              v-if="canReply(ticket.status)"
              class="support-inquiry__reply"
              @submit.prevent="submitReply(ticket.id)"
            >
              <textarea v-model="replyBodies[ticket.id]" rows="3" :placeholder="t('supportInquiry.replyPlaceholder')" required />
              <button type="submit" class="support-inquiry__secondary" :disabled="replyBusyId === ticket.id">
                {{ replyBusyId === ticket.id ? t('supportInquiry.sending') : t('supportInquiry.reply') }}
              </button>
            </form>
          </div>
        </article>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import type { SupportCategory, SupportTicket } from '~/composables/useSupport'

const { t } = useI18n()
const { user, openAuthModal } = useAuth()
const { success: toastSuccess, error: toastError } = useToast()
const { fetchTickets, createTicket, replyToTicket } = useSupport()

const categories: SupportCategory[] = [
  'subscription',
  'delivery',
  'toys',
  'payment',
  'purchase',
  'rental',
  'gifts',
  'other',
]

const form = reactive({
  category: 'other' as SupportCategory,
  subject: '',
  body: '',
})

const tickets = ref<SupportTicket[]>([])
const expandedId = ref<number | null>(null)
const replyBodies = reactive<Record<number, string>>({})
const isSubmitting = ref(false)
const replyBusyId = ref<number | null>(null)
const loadError = ref('')

const statusLabel = (status: string) => {
  const key = `supportInquiry.statuses.${status}`
  const translated = t(key)
  return translated === key ? status : translated
}

const canReply = (status: string) => !['closed', 'resolved'].includes(String(status))

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

const loadTickets = async () => {
  if (!user.value) return
  loadError.value = ''
  try {
    tickets.value = await fetchTickets()
  } catch {
    loadError.value = t('supportInquiry.loadFailed')
  }
}

const toggleTicket = async (id: number) => {
  expandedId.value = expandedId.value === id ? null : id
}

const submitNewTicket = async () => {
  if (!form.subject || !form.body) return
  isSubmitting.value = true
  try {
    await createTicket({
      category: form.category,
      subject: form.subject,
      body: form.body,
    })
    form.subject = ''
    form.body = ''
    form.category = 'other'
    toastSuccess(t('supportInquiry.created'))
    await loadTickets()
    expandedId.value = tickets.value[0]?.id ?? null
  } catch (e: unknown) {
    toastError(t('supportInquiry.createFailed'))
  } finally {
    isSubmitting.value = false
  }
}

const submitReply = async (ticketId: number) => {
  const body = (replyBodies[ticketId] || '').trim()
  if (!body) return
  replyBusyId.value = ticketId
  try {
    await replyToTicket(ticketId, body)
    replyBodies[ticketId] = ''
    toastSuccess(t('supportInquiry.replySent'))
    await loadTickets()
  } catch {
    toastError(t('supportInquiry.replyFailed'))
  } finally {
    replyBusyId.value = null
  }
}

watch(user, (u) => {
  if (u) void loadTickets()
  else {
    tickets.value = []
    expandedId.value = null
  }
}, { immediate: true })
</script>

<style scoped>
.support-inquiry {
  margin-top: 40px;
  padding: clamp(24px, 4vw, 36px);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  background: var(--surface);
}
.support-inquiry__title {
  font-size: clamp(28px, 3vw, 36px);
  margin: 0 0 8px;
}
.support-inquiry__lead {
  color: var(--text-muted);
  margin: 0 0 24px;
  max-width: 640px;
  line-height: 1.65;
}
.support-inquiry__auth p {
  margin: 0 0 16px;
  color: var(--text-muted);
}
.support-inquiry__form {
  display: grid;
  gap: 16px;
  max-width: 560px;
}
.support-inquiry__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
}
.support-inquiry__field span {
  font-weight: 600;
  color: var(--text-dark);
}
.support-inquiry__field input,
.support-inquiry__field select,
.support-inquiry__field textarea,
.support-inquiry__reply textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  font: inherit;
  background: #fff;
}
.support-inquiry__primary,
.support-inquiry__secondary {
  border: none;
  border-radius: 999px;
  padding: 12px 22px;
  font-weight: 700;
  cursor: pointer;
}
.support-inquiry__primary {
  background: var(--green-ink, #3f6757);
  color: #fff;
  justify-self: start;
}
.support-inquiry__primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.support-inquiry__secondary {
  background: var(--soft-sage-mist, #eef4ef);
  color: var(--green-ink, #3f6757);
}
.support-inquiry__error {
  margin-top: 16px;
  color: #b42318;
}
.support-inquiry__list {
  margin-top: 36px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.support-inquiry__list-title {
  font-size: 20px;
  margin: 0 0 4px;
}
.support-inquiry__ticket {
  border: 1px solid var(--border-light);
  border-radius: 14px;
  overflow: hidden;
  background: #fff;
}
.support-inquiry__ticket-head {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
}
.support-inquiry__ticket-head strong {
  display: block;
  margin-bottom: 4px;
}
.support-inquiry__ticket-head small {
  color: var(--text-muted);
  font-size: 12px;
}
.support-inquiry__status {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  background: #eef4ef;
  color: #3f6757;
}
.support-inquiry__status[data-status='new'] {
  background: #fff4e5;
  color: #b54708;
}
.support-inquiry__status[data-status='awaiting_client'] {
  background: #eff8ff;
  color: #175cd3;
}
.support-inquiry__thread {
  border-top: 1px solid var(--border-light);
  padding: 12px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.support-inquiry__msg {
  padding: 10px 12px;
  border-radius: 10px;
  background: #f6f7f6;
}
.support-inquiry__msg.staff {
  background: #eaf5ff;
}
.support-inquiry__msg p {
  margin: 0 0 4px;
  white-space: pre-wrap;
}
.support-inquiry__msg small {
  color: var(--text-muted);
  font-size: 11px;
}
.support-inquiry__reply {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}
</style>
