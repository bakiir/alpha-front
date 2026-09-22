<template>
  <section id="reviews" class="reviews-section">
    <div class="reviews-header">
      <h2 class="reviews-title">Отзывы</h2>
      <p v-if="meta.reviews_count" class="reviews-summary">
        <span class="reviews-avg">{{ formatAvg(meta.rating_avg) }}</span>
        <span class="reviews-stars">{{ stars(Math.round(meta.rating_avg || 0)) }}</span>
        <span class="reviews-count">{{ meta.reviews_count }} {{ reviewsWord(meta.reviews_count) }}</span>
      </p>
    </div>

    <div v-if="isLoading" class="reviews-empty">Загружаем отзывы...</div>

    <div v-else-if="!reviews.length && !myReview" class="reviews-empty">
      Отзывов пока нет.
    </div>

    <div v-if="reviews.length" class="reviews-list">
      <article v-for="review in reviews" :key="review.id" class="review-card">
        <div class="review-card-top">
          <strong>{{ review.user?.name || 'Клиент' }}</strong>
          <span class="review-stars">{{ stars(review.rating) }}</span>
        </div>
        <p v-if="review.body">{{ review.body }}</p>
        <small>{{ formatDate(review.created_at) }}</small>
      </article>
    </div>

    <div v-if="myReview" class="my-review-box">
      <p class="my-review-label">Ваш отзыв</p>
      <div class="review-stars">{{ stars(myReview.rating) }}</div>
      <p v-if="myReview.body">{{ myReview.body }}</p>
    </div>

    <form v-else-if="user && canReview" class="review-form" @submit.prevent="submit">
      <p class="form-label">Оцените игрушку</p>
      <div class="star-picker" role="group" aria-label="Оценка">
        <button
          v-for="n in 5"
          :key="n"
          type="button"
          class="star-btn"
          :class="{ active: draftRating >= n }"
          @click="draftRating = n"
        >★</button>
      </div>
      <textarea
        v-model="draftBody"
        class="review-textarea"
        rows="4"
        maxlength="2000"
        placeholder="Расскажите о впечатлениях — по желанию"
      ></textarea>
      <p v-if="formError" class="review-error">{{ formError }}</p>
      <button type="submit" class="review-submit" :disabled="isSubmitting || draftRating < 1">
        {{ isSubmitting ? 'Отправляем...' : 'Отправить отзыв' }}
      </button>
    </form>

    <div v-else-if="!user" class="review-login">
      <p>Войдите, чтобы оставить оценку и отзыв — после того, как получите эту игрушку.</p>
      <button type="button" class="review-submit" @click="openAuthModal('login')">Войти</button>
    </div>

    <div v-else class="review-login">
      <p>Оставить отзыв можно после получения этой игрушки: доставка заказа, аренда или набор подписки.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Review, ToyReviewsMeta } from '~/composables/useReviews'

const props = defineProps<{
  toyId: number | string
}>()

const { fetchToyReviews, createReview } = useReviews()
const { user, openAuthModal } = useAuth()
const { success: toastSuccess, error: toastError } = useToast()
const route = useRoute()

const isLoading = ref(true)
const isSubmitting = ref(false)
const reviews = ref<Review[]>([])
const meta = ref<ToyReviewsMeta>({
  rating_avg: null,
  reviews_count: 0,
  can_review: false,
  my_review: null,
})
const draftRating = ref(5)
const draftBody = ref('')
const formError = ref('')

const canReview = computed(() => meta.value.can_review)
const myReview = computed(() => meta.value.my_review)

const stars = (n: number) => {
  const rating = Math.min(5, Math.max(0, n || 0))
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}

const formatAvg = (value: number | null) => {
  if (value == null) return '—'
  return value.toFixed(1).replace('.', ',')
}

const reviewsWord = (count: number) => {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return 'отзыв'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'отзыва'
  return 'отзывов'
}

const formatDate = (value?: string) => {
  if (!value) return ''
  const date = new Date(value.replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('ru-RU')
}

const load = async () => {
  if (!props.toyId) return
  isLoading.value = true
  try {
    const res = await fetchToyReviews(props.toyId)
    reviews.value = res.data
    meta.value = res.meta
  } catch {
    reviews.value = []
    meta.value = {
      rating_avg: null,
      reviews_count: 0,
      can_review: false,
      my_review: null,
    }
  } finally {
    isLoading.value = false
    if (route.hash === '#reviews') {
      await nextTick()
      document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
}

const submit = async () => {
  formError.value = ''
  if (draftRating.value < 1) {
    formError.value = 'Поставьте оценку от 1 до 5.'
    return
  }
  isSubmitting.value = true
  try {
    await createReview({
      toy_id: Number(props.toyId),
      rating: draftRating.value,
      body: draftBody.value.trim() || undefined,
    })
    toastSuccess('Спасибо за отзыв', 'Ваша оценка сохранена.')
    draftBody.value = ''
    await load()
  } catch (e: any) {
    const message = e?.data?.errors?.toy_id?.[0]
      || e?.data?.errors?.rating?.[0]
      || e?.data?.message
      || 'Не удалось отправить отзыв.'
    formError.value = message
    toastError('Не удалось отправить отзыв', message)
  } finally {
    isSubmitting.value = false
  }
}

watch(
  () => [props.toyId, user.value?.id],
  () => { load() },
  { immediate: true },
)
</script>

<style scoped>
.reviews-section {
  margin-top: 32px;
  scroll-margin-top: 96px;
  background: #FAF8F4;
  border-radius: 24px;
  padding: 28px;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.reviews-header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.reviews-title {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 26px;
  color: #262626;
  margin: 0;
}

.reviews-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6F746F;
  font-size: 14px;
}

.reviews-avg {
  font-weight: 800;
  color: #262626;
}

.reviews-stars,
.review-stars {
  color: #E8A62B;
  letter-spacing: 1px;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-card,
.my-review-box,
.review-form,
.review-login,
.reviews-empty {
  background: #fff;
  border-radius: 16px;
  padding: 16px 18px;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.reviews-empty {
  color: #6F746F;
}

.review-card-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
}

.review-card p,
.my-review-box p {
  margin: 6px 0;
  line-height: 1.45;
}

.review-card small {
  color: #6F746F;
}

.my-review-label {
  font-weight: 700;
  margin-bottom: 4px;
}

.my-review-note {
  color: #6F746F;
  font-size: 13px;
}

.review-form,
.review-login,
.my-review-box {
  margin-top: 16px;
}

.form-label {
  font-weight: 700;
  margin-bottom: 8px;
}

.star-picker {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
}

.star-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #D9D4C8;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.star-btn.active {
  color: #E8A62B;
}

.review-textarea {
  width: 100%;
  border: 1px solid rgba(51, 61, 54, 0.14);
  border-radius: 14px;
  padding: 12px 14px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  margin-bottom: 12px;
  background: #FAF8F4;
}

.review-error {
  color: #AF5353;
  font-size: 13px;
  margin-bottom: 10px;
}

.review-submit {
  background: var(--green-surface);
  color: var(--green-ink);
  border: none;
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 14px;
  padding: 10px 20px;
  border-radius: 12px;
  cursor: pointer;
}

.review-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.review-login p {
  margin-bottom: 12px;
  color: #6F746F;
}

@media (max-width: 640px) {
  .reviews-section {
    padding: 20px 16px;
  }
}
</style>
