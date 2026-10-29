<template>
  <div class="child-profiles-panel">
      <section class="family-dashboard">
        <!-- Top Family Selector Tabs -->
        <div class="family-selector-bar">
          <div class="selector-label">
            <span>Профили детей:</span>
          </div>
          <div class="selector-cards-row">
            <button 
              v-for="(c, index) in childrenList" 
              :key="index"
              class="child-selector-card"
              :class="{ active: activeChildIndex === index }"
              @click="selectChild(index)"
            >
              <div class="selector-avatar"><AppIcon name="baby" :size="20" /></div>
              <div class="selector-info">
                <span class="selector-name">{{ c.name }}</span>
                <span class="selector-age">{{ c.age }}</span>
              </div>
            </button>

            <button class="child-selector-card add-card" @click="handleAddChildClick">
              <div class="selector-avatar add-icon">+</div>
              <div class="selector-info">
                <span class="selector-name">Добавить</span>
                <span class="selector-age">профиль</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Active Child Main Workspace -->
        <div class="active-child-body" v-if="childrenList.length && child">
          <!-- Upper Profile Summary Bar -->
          <div class="profile-hero-card">
            <div class="hero-left">
              <div class="hero-avatar">
                <span>{{ child.name ? child.name.charAt(0).toUpperCase() : '' }}</span>
              </div>
              <div class="hero-details">
                <div class="name-age-row">
                  <h2 class="child-hero-name">{{ child.name }} {{ child.last_name }}</h2>
                  <span class="hero-age-badge"><AppIcon name="baby" :size="14" class="inline-icon" /> {{ child.age }}</span>
                </div>
                <p class="hero-birth-date">Дата рождения: <strong>{{ child.birthDate }}</strong></p>
                <p v-if="child.gender" class="hero-birth-date">Пол: <strong>{{ genderLabel(child.gender) }}</strong></p>
              </div>
            </div>

            <div class="hero-right">
              <button class="edit-profile-btn" @click="openEditModal">
                <AppIcon name="settings" :size="16" class="inline-icon" /> Редактировать профиль
              </button>
              <button class="delete-profile-btn" @click="confirmDeleteChild(activeChildIndex)" title="Удалить профиль ребенка" aria-label="Удалить профиль">
                <AppIcon name="trash" :size="18" />
              </button>
            </div>
          </div>

          <section v-if="shopRecsLoading || shopRecs.length" class="child-recs-section">
            <div class="child-recs-header">
              <h2 class="child-recs-title">{{ shopRecsHeading }}</h2>
              <NuxtLink :to="localePath('/shop')" class="child-recs-catalog-link">
                Смотреть весь каталог →
              </NuxtLink>
            </div>
            <p v-if="shopRecsLoading" class="child-recs-loading">Подбираем игрушки…</p>
            <div v-else class="child-recs-grid">
              <ShopProductCard
                v-for="rec in shopRecs"
                :key="rec.id"
                :item="{
                  id: rec.id,
                  title: rec.title,
                  price: rec.price,
                  image: rec.image,
                  categoryName: rec.skill,
                  age: rec.age,
                  compareAtPrice: rec.compareAtPrice,
                  discountBadge: rec.discountBadge,
                  discountNote: rec.discountNote,
                  isPreorder: rec.isPreorder,
                }"
                :in-cart="isShopRecInCart(rec.id)"
                :added="shopRecAddedIds.includes(rec.id)"
                :disabled="!rec.isPreorder && Number(rec.availableQuantity ?? 0) <= 0"
                @action="addShopRecToCart(rec)"
              />
            </div>
          </section>
        </div>

        <!-- Empty State -->
        <div class="empty-child-state" v-else>
          <div class="empty-state-content">
            <AppIcon name="baby" :size="40" class="empty-icon" />
            <h2 class="empty-title">Добавьте профиль ребёнка</h2>
            <p class="empty-desc">
              Для того чтобы мы могли подбирать персональные развивающие наборы, создайте профиль.
            </p>
            <button class="add-first-child-btn" @click="handleAddChildClick">
              + Добавить профиль
            </button>
          </div>
        </div>
      </section>

    <!-- Edit Profile Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isEditModalOpen" class="modal-overlay" @click.self="isEditModalOpen = false">
          <div class="edit-modal">
            <button class="close-btn" @click="isEditModalOpen = false">&times;</button>
            <div class="edit-modal__body">
              <h2 class="modal-title">Редактировать профиль</h2>
              <p class="modal-desc">Настройте фокусы развития для более точного подбора наборов.</p>

              <div class="form-group">
                <label>Имя ребёнка <span style="color: #3F6757">*</span></label>
                <input v-model="editForm.name" type="text" class="modal-input" placeholder="Имя ребенка" />
              </div>
              <div class="form-group">
                <label for="edit-child-last-name">Фамилия ребёнка *</label>
                <input id="edit-child-last-name" v-model="editForm.last_name" type="text" class="modal-input" maxlength="255" placeholder="Фамилия ребёнка" required />
              </div>

              <div class="form-group">
                <label for="edit-child-birth-date">Дата рождения <span style="color: #3F6757">*</span></label>
                <input
                  id="edit-child-birth-date"
                  type="date"
                  v-model="editForm.rawDate"
                  class="modal-input"
                  :min="birthDateMin"
                  :max="birthDateMax"
                  required
                  @input="syncEditAgeFromBirthDate"
                />
              </div>

              <div class="form-group">
                <label class="mb-2">Пол ребёнка <span style="color: #3F6757">*</span></label>
                <div class="gender-chips" role="group" aria-label="Пол ребёнка">
                  <button
                    type="button"
                    class="interest-chip-btn"
                    :class="{ selected: editForm.gender === 'male' }"
                    @click="editForm.gender = 'male'"
                  >
                    Мальчик
                  </button>
                  <button
                    type="button"
                    class="interest-chip-btn"
                    :class="{ selected: editForm.gender === 'female' }"
                    @click="editForm.gender = 'female'"
                  >
                    Девочка
                  </button>
                </div>
              </div>

              <div class="form-group form-group--age-preview" aria-live="polite">
                <div class="age-preview-head">
                  <span class="age-preview-label">Возраст ребёнка</span>
                  <span class="age-badge-pill">{{ formatAgeMonths(editForm.ageMonths) }}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="72"
                  :value="editForm.ageMonths"
                  class="modal-slider modal-slider--readonly"
                  disabled
                  tabindex="-1"
                  aria-hidden="true"
                />
                <p class="age-from-dob-hint">Считается автоматически по дате рождения</p>
              </div>

              <div class="form-group form-group--last">
                <label class="mb-2">Чем интересуется ребёнок?</label>
                <div class="interests-chips-grid">
                  <button
                    v-for="interest in interestOptionsForEdit"
                    :key="interest.id"
                    type="button"
                    class="interest-chip-btn"
                    :class="{
                      selected: editForm.interestIds.includes(interest.id),
                      inactive: interest.is_active === false,
                    }"
                    @click="toggleInterestId(editForm.interestIds, interest.id)"
                  >
                    {{ interest.name }}
                    <template v-if="interest.is_active === false"> (отключён)</template>
                  </button>
                </div>
                <p v-if="!interestOptionsForEdit.length" class="interests-empty-hint">
                  Справочник интересов пока пуст.
                </p>
              </div>
            </div>

            <div class="modal-actions modal-actions--split">
              <button type="button" class="delete-modal-btn" @click="confirmDeleteFromModal"><AppIcon name="trash" :size="16" class="inline-icon" /> Удалить профиль</button>
              <div class="modal-actions__right">
                <button type="button" class="cancel-btn" @click="isEditModalOpen = false">Отмена</button>
                <button type="button" class="save-btn" @click="saveProfile">Сохранить изменения</button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Add Child Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isAddModalOpen" class="modal-overlay" @click.self="isAddModalOpen = false">
          <div class="edit-modal">
            <button class="close-btn" @click="isAddModalOpen = false">&times;</button>
            <div class="edit-modal__body">
              <h2 class="modal-title">Добавить профиль ребёнка</h2>
              <p class="modal-desc">Для каждого ребенка мы формируем персональную программу развития.</p>

              <div class="form-group">
                <label>Имя ребёнка <span style="color: #3F6757">*</span></label>
                <input v-model="newChild.name" type="text" placeholder="Например: София" class="modal-input" required />
              </div>
              <div class="form-group">
                <label for="new-child-last-name">Фамилия ребёнка *</label>
                <input id="new-child-last-name" v-model="newChild.last_name" type="text" class="modal-input" maxlength="255" placeholder="Например: Смирнова" required />
              </div>

              <div class="form-group">
                <label for="new-child-birth-date">Дата рождения <span style="color: #3F6757">*</span></label>
                <input
                  id="new-child-birth-date"
                  type="date"
                  v-model="newChild.rawDate"
                  class="modal-input"
                  :min="birthDateMin"
                  :max="birthDateMax"
                  required
                  @input="syncNewChildAgeFromBirthDate"
                />
              </div>

              <div class="form-group">
                <label class="mb-2">Пол ребёнка <span style="color: #3F6757">*</span></label>
                <div class="gender-chips" role="group" aria-label="Пол ребёнка">
                  <button
                    type="button"
                    class="interest-chip-btn"
                    :class="{ selected: newChild.gender === 'male' }"
                    @click="newChild.gender = 'male'"
                  >
                    Мальчик
                  </button>
                  <button
                    type="button"
                    class="interest-chip-btn"
                    :class="{ selected: newChild.gender === 'female' }"
                    @click="newChild.gender = 'female'"
                  >
                    Девочка
                  </button>
                </div>
              </div>

              <div class="form-group form-group--age-preview" aria-live="polite">
                <div class="age-preview-head">
                  <span class="age-preview-label">Возраст ребёнка</span>
                  <span class="age-badge-pill">{{ formatAgeMonths(newChild.ageMonths) }}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="72"
                  :value="newChild.ageMonths"
                  class="modal-slider modal-slider--readonly"
                  disabled
                  tabindex="-1"
                  aria-hidden="true"
                />
                <p class="age-from-dob-hint">Считается автоматически по дате рождения</p>
              </div>

              <div class="form-group form-group--last">
                <label class="mb-2">Чем интересуется ребёнок?</label>
                <div class="interests-chips-grid">
                  <button
                    v-for="interest in catalogInterests"
                    :key="interest.id"
                    type="button"
                    class="interest-chip-btn"
                    :class="{ selected: newChild.interestIds.includes(interest.id) }"
                    @click="toggleInterestId(newChild.interestIds, interest.id)"
                  >
                    {{ interest.name }}
                  </button>
                </div>
                <p v-if="!catalogInterests.length" class="interests-empty-hint">
                  Справочник интересов пока пуст.
                </p>
              </div>
            </div>

            <div class="modal-actions">
              <button class="cancel-btn" @click="isAddModalOpen = false">Отмена</button>
              <button class="save-btn" @click="addNewChild">Добавить профиль</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { RecommendedToy } from '~/composables/useRecommendedToys'
import { fetchChildProfileShopToys } from '~/composables/useRecommendedToys'
import { buildCartItemSubtitle } from '~/utils/cartItemMeta'

const localePath = useLocalePath()
const { user, openAuthModal, isInitialized } = useAuth()
const { error: toastError, success: toastSuccess } = useToast()
const { confirm: askConfirm } = useConfirm()
const { interests: catalogInterests, loadInterests, normalizeInterests } = useInterests()
const { addItem: addCartItem, items: cartItems } = useCart()
const { cityId } = useCity()
const { fetchToys } = useToys()

interface ChildInterest {
  id: number
  slug: string
  name: string
  sort_order?: number
  is_active?: boolean
}

type ChildGender = 'male' | 'female'

interface ChildProfile {
  id?: number
  name: string
  last_name?: string
  gender?: ChildGender | null
  age: string
  ageMonths: number
  birthDate: string
  rawDate: string
  interests: ChildInterest[]
  achievements?: Array<{ title: string; date: string; desc: string }>
}

const genderLabel = (gender?: ChildGender | null) => {
  if (gender === 'male') return 'Мальчик'
  if (gender === 'female') return 'Девочка'
  return ''
}

const normalizeGender = (value: unknown): ChildGender | null => {
  if (value === 'male' || value === 'female') return value
  return null
}

const formatAgeMonths = (months: number) => {
  if (!Number.isFinite(months) || months < 1) return '—'
  const years = Math.floor(months / 12)
  const remMonths = months % 12
  if (years === 0) return `${months} мес.`
  if (remMonths === 0) return `${years} ${years === 1 ? 'год' : years < 5 ? 'года' : 'лет'}`
  return `${years} г. ${remMonths} мес.`
}

const formatIsoLocalDate = (date: Date): string => {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/** Возраст в месяцах по календарной дате (локальная TZ, без сдвига UTC). */
const monthsFromDateStr = (isoDateStr: string): number => {
  if (!isoDateStr) return 0
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDateStr.trim())
  if (!match) return 0
  const birth = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  if (isNaN(birth.getTime())) return 0
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (birth > today) return 0
  let months = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth())
  if (today.getDate() < birth.getDate()) months -= 1
  return Math.max(1, Math.min(72, months))
}

const birthDateMax = computed(() => formatIsoLocalDate(new Date()))

const birthDateMin = computed(() => {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 6)
  return formatIsoLocalDate(d)
})

const defaultBirthDateIso = (): string => {
  const d = new Date()
  d.setMonth(d.getMonth() - 18)
  return formatIsoLocalDate(d)
}

const syncEditAgeFromBirthDate = () => {
  editForm.value.ageMonths = monthsFromDateStr(editForm.value.rawDate)
}

const syncNewChildAgeFromBirthDate = () => {
  newChild.value.ageMonths = monthsFromDateStr(newChild.value.rawDate)
}

const formatDateReadable = (isoDateStr: string): string => {
  if (!isoDateStr) return '18 января, 2024'
  const date = new Date(isoDateStr)
  if (isNaN(date.getTime())) return isoDateStr
  const monthsRu = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ]
  return `${date.getDate()} ${monthsRu[date.getMonth()]}, ${date.getFullYear()}`
}

const DEFAULT_ACHIEVEMENTS = [
  { title: 'Логика & Баланс', date: 'Июнь 2026', desc: 'Ваш малыш осваивает новые горизонты' },
  { title: 'Тонкая моторика', date: 'Май 2026', desc: 'Уверенно нанизывает кольца сортера' },
  { title: 'Интерес к музыке', date: 'Апрель 2026', desc: 'Дольше удерживает внимание в ритмических играх' }
]

const childrenList = ref<ChildProfile[]>([])
const activeChildIndex = ref(0)
const childrenSynced = ref(false)
const { request, hasAuthSession } = useApi()

const ensureActiveChildIndex = () => {
  if (!childrenList.value.length) {
    activeChildIndex.value = 0
    return
  }
  if (activeChildIndex.value < 0 || activeChildIndex.value >= childrenList.value.length) {
    activeChildIndex.value = 0
  }
}

const child = computed<ChildProfile | null>(() => {
  if (!childrenList.value.length) return null
  const idx = activeChildIndex.value
  if (idx >= 0 && idx < childrenList.value.length) {
    return childrenList.value[idx] ?? null
  }
  return childrenList.value[0] ?? null
})

watch(childrenList, () => ensureActiveChildIndex(), { deep: true })

const shopRecs = ref<RecommendedToy[]>([])
const shopRecsLoading = ref(false)
const shopRecAddedIds = ref<number[]>([])
let shopRecsRequestId = 0

const shopRecsHeading = computed(() => {
  const g = child.value?.gender
  if (g === 'male' || g === 'female') return 'Подобрали по возрасту и полу'
  return 'Подобрали по возрасту'
})

const isShopRecInCart = (id: number) =>
  cartItems.value.some(item => Number(item.id) === id && !item.isPreorder)

const loadRecommendedShopToys = async () => {
  const currentChild = child.value
  shopRecs.value = []

  if (!currentChild || currentChild.ageMonths < 1) {
    shopRecsLoading.value = false
    return
  }

  const requestId = ++shopRecsRequestId
  shopRecsLoading.value = true

  try {
    const gender =
      currentChild.gender === 'male' || currentChild.gender === 'female'
        ? currentChild.gender
        : null
    const day = new Date().toISOString().slice(0, 10)
    const seed = `${currentChild.id ?? 'local'}|${currentChild.ageMonths}|${gender || ''}|${day}`
    const picked = await fetchChildProfileShopToys(
      {
        id: currentChild.id,
        ageMonths: currentChild.ageMonths,
        gender,
      },
      { limit: 3, shuffleSeed: seed, fetchToys },
    )
    if (requestId !== shopRecsRequestId) return
    shopRecs.value = picked
  } catch (e) {
    if (requestId !== shopRecsRequestId) return
    console.error('Shop recommendations fetch failed:', e)
    shopRecs.value = []
  } finally {
    if (requestId === shopRecsRequestId) {
      shopRecsLoading.value = false
    }
  }
}

const addShopRecToCart = (rec: RecommendedToy) => {
  if (rec.isPreorder) {
    navigateTo(localePath(`/product/${rec.id}`))
    return
  }

  if (isShopRecInCart(rec.id)) {
    navigateTo(localePath('/cart'))
    return
  }

  const result = addCartItem({
    id: rec.id,
    title: rec.title,
    price: rec.price,
    image: rec.image,
    subtitle: buildCartItemSubtitle({ age: rec.age }),
    availableQuantity: rec.availableQuantity,
  })

  if (result.quantity <= 0) {
    toastError('Нет в наличии', 'Этот товар сейчас нельзя добавить в корзину.')
    return
  }
  if (result.limited) {
    toastError('Недостаточно на складе', `Можно добавить не больше ${result.max} шт.`)
    return
  }

  if (!shopRecAddedIds.value.includes(rec.id)) {
    shopRecAddedIds.value = [...shopRecAddedIds.value, rec.id]
    setTimeout(() => {
      shopRecAddedIds.value = shopRecAddedIds.value.filter(id => id !== rec.id)
    }, 2000)
  }

  toastSuccess('В корзине', `«${rec.title}» добавлена в корзину.`)
}

watch(
  () => [
    child.value?.id,
    child.value?.rawDate,
    child.value?.gender,
    child.value?.ageMonths,
    cityId.value,
  ] as const,
  ([, , , ageMonths]) => {
    if (!child.value || !ageMonths) {
      shopRecs.value = []
      return
    }
    void loadRecommendedShopToys()
  },
  { immediate: true },
)

const activeAchievements = computed(() => {
  const currentChild = child.value
  if (!currentChild) return DEFAULT_ACHIEVEMENTS
  const name = currentChild.name || 'Ребёнок'
  const selected = currentChild.interests || []
  if (!selected.length) return DEFAULT_ACHIEVEMENTS

  const dates = ['Май 2026', 'Апрель 2026', 'Март 2026', 'Февраль 2026']

  return selected.map((interest, idx) => ({
    title: interest.name,
    date: dates[idx % dates.length],
    desc: `${name} проявляет интерес к теме «${interest.name}» — мы учитываем это при подборе игрушек.`,
  }))
})

const isEditModalOpen = ref(false)
const isAddModalOpen = ref(false)

const editForm = ref({
  name: '',
  last_name: '',
  gender: null as ChildGender | null,
  ageMonths: 30,
  rawDate: '2024-01-18',
  interestIds: [] as number[],
})

const newChild = ref({
  name: '',
  last_name: '',
  gender: null as ChildGender | null,
  ageMonths: 18,
  rawDate: '2025-02-15',
  interestIds: [] as number[],
})

const interestOptionsForEdit = computed(() => {
  const byId = new Map<number, ChildInterest>()
  for (const interest of catalogInterests.value) {
    byId.set(interest.id, interest)
  }
  for (const interest of child.value?.interests || []) {
    if (!byId.has(interest.id)) {
      byId.set(interest.id, interest)
    }
  }
  return Array.from(byId.values()).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id - b.id)
})

const sanitizeInterestIds = (ids: number[]): number[] => (
  [...new Set(ids.map(Number).filter(id => Number.isFinite(id) && id > 0))]
)

const openEditModal = async () => {
  if (!child.value) return
  if (!childrenSynced.value) {
    toastError('Подождите', 'Профиль ещё загружается. Попробуйте через секунду.')
    return
  }
  await loadInterests(true)
  editForm.value.name = child.value.name
  editForm.value.last_name = child.value.last_name || ''
  editForm.value.gender = normalizeGender(child.value.gender)
  editForm.value.rawDate = child.value.rawDate || defaultBirthDateIso()
  syncEditAgeFromBirthDate()
  editForm.value.interestIds = sanitizeInterestIds((child.value.interests || []).map(i => i.id))
  isEditModalOpen.value = true
}

const toggleInterestId = (targetArray: number[], interestId: number) => {
  if (!Number.isFinite(interestId) || interestId <= 0) return
  const index = targetArray.indexOf(interestId)
  if (index > -1) {
    targetArray.splice(index, 1)
  } else {
    targetArray.push(interestId)
  }
}

const resolveInterestsByIds = (ids: number[], extras: ChildInterest[] = []): ChildInterest[] => {
  const byId = new Map<number, ChildInterest>()
  for (const interest of [...catalogInterests.value, ...extras]) {
    byId.set(interest.id, interest)
  }
  return sanitizeInterestIds(ids)
    .map(id => byId.get(id))
    .filter(Boolean) as ChildInterest[]
}

const handleAddChildClick = async () => {
  if (!user.value) {
    openAuthModal('login')
    return
  }
  await loadInterests(true)
  const defaultDate = defaultBirthDateIso()
  newChild.value = {
    name: '',
    last_name: '',
    gender: null,
    ageMonths: monthsFromDateStr(defaultDate),
    rawDate: defaultDate,
    interestIds: [],
  }
  isAddModalOpen.value = true
}

const persistChildrenLocal = () => {
  if (import.meta.client) {
    try {
      localStorage.setItem('alpha_children_list', JSON.stringify(childrenList.value))
      localStorage.setItem('alpha_active_child_index', String(activeChildIndex.value))
    } catch (e) {
      console.error('Failed to save children to localStorage:', e)
    }
  }
}

const selectChild = (index: number) => {
  activeChildIndex.value = index
  persistChildrenLocal()
}

const saveProfile = async () => {
  if (!editForm.value.name.trim() || !editForm.value.last_name.trim()) {
    toastError('Заполните данные', 'Укажите имя и фамилию ребёнка.')
    return
  }
  if (!editForm.value.gender) {
    toastError('Заполните данные', 'Укажите пол ребёнка.')
    return
  }
  syncEditAgeFromBirthDate()
  if (!editForm.value.rawDate || editForm.value.ageMonths < 1) {
    toastError('Заполните данные', 'Укажите корректную дату рождения (не в будущем).')
    return
  }
  if (!childrenSynced.value) {
    toastError('Подождите', 'Профиль ещё загружается. Попробуйте через секунду.')
    return
  }
  const original = childrenList.value[activeChildIndex.value]
  if (!original) return

  const interestIds = sanitizeInterestIds(editForm.value.interestIds)
  const current: ChildProfile = {
    ...original,
    name: editForm.value.name || original.name,
    last_name: editForm.value.last_name.trim(),
    gender: editForm.value.gender,
    ageMonths: editForm.value.ageMonths,
    age: formatAgeMonths(editForm.value.ageMonths),
    rawDate: editForm.value.rawDate,
    birthDate: formatDateReadable(editForm.value.rawDate),
    interests: resolveInterestsByIds(interestIds, original.interests || []),
  }

  try {
    if (current.id) {
      const res = await request<any>(`/children/${current.id}`, {
        method: 'PUT',
        body: {
          name: current.name,
          last_name: current.last_name,
          birth_date: current.rawDate,
          gender: current.gender,
          interest_ids: interestIds,
        }
      })
      if (res?.data) {
        current.interests = normalizeInterests(res.data.interests || [])
        if (res.data.name) current.name = res.data.name
        if (res.data.last_name != null) current.last_name = res.data.last_name
        current.gender = normalizeGender(res.data.gender) ?? current.gender
        if (res.data.birth_date) {
          current.rawDate = res.data.birth_date
          current.ageMonths = monthsFromDateStr(res.data.birth_date)
          current.age = formatAgeMonths(current.ageMonths)
          current.birthDate = formatDateReadable(res.data.birth_date)
        }
      }
    }
  } catch (e: any) {
    console.error('API update failed:', e)
    toastError('Ошибка сохранения', e?.data?.message || 'Ошибка при сохранении. Пожалуйста, авторизуйтесь.')
    return
  }

  childrenList.value[activeChildIndex.value] = current
  persistChildrenLocal()
  isEditModalOpen.value = false
  toastSuccess('Профиль сохранён', 'Данные ребёнка обновлены.')
  void loadRecommendedShopToys()
  void useRecommendedToys().load(true)
}

const confirmDeleteChild = async (index: number) => {
  const target = childrenList.value[index]
  if (!target) return

  if (!(await askConfirm({
    message: `Вы действительно хотите удалить профиль ребёнка ${target.name}?`,
    variant: 'danger',
  }))) {
    return
  }

  try {
    if (target.id) {
      await request(`/children/${target.id}`, {
        method: 'DELETE'
      })
    }
  } catch (e: any) {
    console.error('API delete failed:', e)
    toastError('Ошибка удаления', e?.data?.message || 'Ошибка при удалении профиля.')
    return
  }

  childrenList.value.splice(index, 1)
  if (childrenList.value.length === 0) {
    activeChildIndex.value = 0
  } else {
    activeChildIndex.value = Math.min(activeChildIndex.value, childrenList.value.length - 1)
  }
  persistChildrenLocal()
}

const confirmDeleteFromModal = async () => {
  isEditModalOpen.value = false
  await confirmDeleteChild(activeChildIndex.value)
}

const addNewChild = async () => {
  if (!newChild.value.name.trim() || !newChild.value.last_name.trim()) {
    toastError('Заполните данные', 'Укажите имя и фамилию ребёнка.')
    return
  }
  if (!newChild.value.gender) {
    toastError('Заполните данные', 'Укажите пол ребёнка.')
    return
  }
  syncNewChildAgeFromBirthDate()
  if (!newChild.value.rawDate || newChild.value.ageMonths < 1) {
    toastError('Заполните данные', 'Укажите корректную дату рождения (не в будущем).')
    return
  }

  const createdChild: ChildProfile = {
    name: newChild.value.name.trim(),
    last_name: newChild.value.last_name.trim(),
    gender: newChild.value.gender,
    ageMonths: newChild.value.ageMonths,
    age: formatAgeMonths(newChild.value.ageMonths),
    rawDate: newChild.value.rawDate,
    birthDate: formatDateReadable(newChild.value.rawDate),
    interests: resolveInterestsByIds(newChild.value.interestIds),
    achievements: [
      { title: 'Первые шаги', date: 'Август 2026', desc: `Профиль для ${newChild.value.name.trim()} создан!` }
    ]
  }

  try {
    const interestIds = sanitizeInterestIds(newChild.value.interestIds)
    const res = await request<any>('/children', {
      method: 'POST',
      body: {
        name: createdChild.name,
        last_name: createdChild.last_name,
        birth_date: createdChild.rawDate,
        gender: createdChild.gender,
        interest_ids: interestIds,
      }
    })
    if (res && res.data && res.data.id) {
      createdChild.id = res.data.id
      createdChild.interests = normalizeInterests(res.data.interests || createdChild.interests)
      createdChild.gender = normalizeGender(res.data.gender) ?? createdChild.gender
    }
  } catch (e: any) {
    console.error('API save failed:', e)
    toastError('Не удалось добавить', e?.data?.message || 'Не удалось добавить профиль. Пожалуйста, авторизуйтесь.')
    return
  }

  childrenList.value.push(createdChild)
  activeChildIndex.value = childrenList.value.length - 1
  persistChildrenLocal()

  const defaultDate = defaultBirthDateIso()
  newChild.value = {
    name: '',
    last_name: '',
    gender: null,
    ageMonths: monthsFromDateStr(defaultDate),
    rawDate: defaultDate,
    interestIds: [],
  }
  isAddModalOpen.value = false
  toastSuccess('Ребёнок добавлен', 'Профиль создан и выбран как активный.')
  void useRecommendedToys().load(true)
}

const hydrateChildrenFromLocalCache = () => {
  if (!import.meta.client || !hasAuthSession()) return
  const saved = localStorage.getItem('alpha_children_list')
  if (!saved) return
  try {
    const parsed = JSON.parse(saved)
    if (!Array.isArray(parsed) || parsed.length === 0) return
    childrenList.value = parsed.map((item: any) => ({
      ...item,
      interests: normalizeInterests(item.interests || []),
    }))
    const savedIndex = localStorage.getItem('alpha_active_child_index')
    if (savedIndex !== null) {
      activeChildIndex.value = Math.min(Number(savedIndex) || 0, childrenList.value.length - 1)
    }
    ensureActiveChildIndex()
  } catch (e) {
    console.error('Failed to parse localStorage children:', e)
  }
}

const syncChildrenFromApi = async () => {
  if (!hasAuthSession()) {
    if (!isInitialized.value) {
      return
    }
    childrenList.value = []
    if (import.meta.client) {
      localStorage.removeItem('alpha_children_list')
      localStorage.removeItem('alpha_active_child_index')
    }
    childrenSynced.value = true
    return
  }

  hydrateChildrenFromLocalCache()

  try {
    const res = await request<any>('/children')
    if (res && res.data && Array.isArray(res.data)) {
      if (res.data.length > 0) {
        childrenList.value = res.data.map((item: any) => {
          const rawDate = item.birth_date || '2024-01-18'
          const ageMonths = monthsFromDateStr(rawDate)
          return {
            id: item.id,
            name: item.name,
            last_name: item.last_name || '',
            gender: normalizeGender(item.gender),
            ageMonths,
            age: formatAgeMonths(ageMonths),
            rawDate,
            birthDate: formatDateReadable(rawDate),
            interests: normalizeInterests(item.interests || []),
            achievements: DEFAULT_ACHIEVEMENTS,
          }
        })
        ensureActiveChildIndex()
      } else {
        childrenList.value = []
        activeChildIndex.value = 0
      }
      persistChildrenLocal()
    }
  } catch (e) {
    console.log('Children fetch skipped (guest or unauthenticated):', e)
    if (!childrenList.value.length) {
      if (import.meta.client) {
        localStorage.removeItem('alpha_children_list')
      }
    }
  } finally {
    childrenSynced.value = true
  }
}

const loadChildrenProfiles = async () => {
  await loadInterests()
  await syncChildrenFromApi()
}

onMounted(() => {
  void loadChildrenProfiles()
})

watch(
  () => [isInitialized.value, user.value?.id, hasAuthSession()] as const,
  ([initialized, , session]) => {
    if (!initialized || !session || childrenSynced.value) return
    void loadChildrenProfiles()
  },
)
</script>

<style scoped>
.child-profiles-panel {
  color: #262626;
  font-family: 'Manrope', sans-serif;
}

.child-profiles-panel .family-dashboard {
  background: transparent;
  border: none;
  box-shadow: none;
  border-radius: 0;
  margin-bottom: 0;
}

.child-profiles-panel .family-selector-bar {
  background: transparent;
  border-bottom: 1px solid rgba(51, 61, 54, 0.08);
  padding: 0 0 18px;
  margin-bottom: 20px;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px 16px;
}

.child-profiles-panel .selector-label {
  width: 100%;
  flex-basis: 100%;
}

.child-profiles-panel .selector-cards-row {
  flex: 1;
  width: 100%;
  padding: 0;
}

.child-profiles-panel .active-child-body {
  padding: 0;
}

.child-profiles-panel .empty-child-state {
  background: transparent;
  padding: 32px 12px;
  border-radius: 20px;
  border: 1px dashed rgba(51, 61, 54, 0.12);
}

/* Header Section */
.child-header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  position: relative;
}

.section-badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  color: var(--green-ink);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 8px;
}

/* Top Section Header */
.page-top-header {
  margin-bottom: 24px;
}

.child-main-title {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 32px;
  color: #262626;
  margin-bottom: 6px;
}

.child-subtitle {
  font-size: 15px;
  color: #6C6C84;
}

/* Family Dashboard Main Container */
.family-dashboard {
  overflow: visible;
}

/* Family Selector Bar */
.family-selector-bar {
  display: flex;
  align-items: center;
  gap: 20px;
}

.selector-label {
  font-size: 13.5px;
  font-weight: 700;
  color: #6F746F;
  white-space: nowrap;
}

.selector-cards-row {
  display: flex;
  align-items: stretch;
  gap: 10px;
  overflow-x: auto;
  overflow-y: visible;
  padding: 2px 2px 6px;
  scrollbar-width: thin;
}

.child-selector-card {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  padding: 10px 16px;
  min-height: 52px;
  background: #FAF8F4;
  border: 1.5px solid #E4E0F3;
  border-radius: 16px;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;
  box-sizing: border-box;
}

.child-selector-card:hover {
  border-color: var(--green-ink);
}

.child-selector-card.active {
  background: var(--green-surface);
  border-color: var(--green-ink);
  box-shadow: none;
  color: var(--green-ink);
}

.child-selector-card.active .selector-name {
  color: var(--green-ink);
}

.child-selector-card.active .selector-age {
  color: #5D625F;
}

.selector-avatar {
  width: 32px;
  height: 32px;
  background: #D9E0D5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.child-selector-card.active .selector-avatar {
  background: rgba(255, 255, 255, 0.65);
  color: var(--green-ink);
}

.child-selector-card.add-card {
  border-style: dashed;
  background: #FAF8F4;
  border-color: var(--green-ink);
}

.selector-avatar.add-icon {
  font-weight: 800;
  color: var(--green-ink);
}

.selector-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.selector-name {
  font-weight: 700;
  font-size: 14px;
  color: #262626;
}

.selector-age {
  font-size: 11.5px;
  color: #6F746F;
}

/* Active Child Body */
.active-child-body {
  padding: 32px;
}

.profile-hero-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #F4F1EA 0%, #FAF8F4 100%);
  border-radius: 20px;
  padding: 24px 28px;
  border: 1px solid #E6E0FC;
  margin-bottom: 28px;
}

.hero-left {
  display: flex;
  align-items: center;
  gap: 18px;
}

.hero-avatar {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--green-surface) 0%, #9B7CFF 100%);
  color: var(--green-ink);
  font-size: 26px;
  font-weight: 800;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 16px rgba(51, 61, 54, 0.25);
}

.name-age-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.child-hero-name {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 28px;
  color: #262626;
}

.hero-age-badge {
  padding: 4px 12px;
  background: #FAF8F4;
  color: var(--green-ink);
  font-weight: 700;
  font-size: 13px;
  border-radius: 14px;
  border: 1px solid #E3D7C6;
}

.hero-birth-date {
  font-size: 13.5px;
  color: #6C6C84;
}

.hero-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.edit-profile-btn {
  background: #FAF8F4;
  color: var(--green-ink);
  border: 1.5px solid var(--green-ink);
  padding: 10px 20px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 13.5px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-profile-btn:hover {
  background: var(--green-surface);
  color: var(--green-ink);
}

.delete-profile-btn {
  background: #FFF1F2;
  color: #E11D48;
  border: 1.5px solid #FECDD3;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-profile-btn:hover {
  background: #E11D48;
  color: #FAF8F4;
  border-color: #E11D48;
}

.delete-modal-btn {
  background: #FFF1F2;
  color: #E11D48;
  border: none;
  padding: 10px 16px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-modal-btn:hover {
  background: #FFE4E6;
}

/* 2-Column Grid Inside Dashboard */
.child-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.detail-card {
  background: #FDFDFD;
  border: 1px solid #E8E6F5;
  border-radius: 20px;
  padding: 26px 24px;
}

.card-badge-pill {
  display: inline-block;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.5px;
  padding: 4px 10px;
  border-radius: 10px;
  margin-bottom: 12px;
}

.card-badge-pill.green {
  background: #E6F9F0;
  color: #059669;
}

.card-badge-pill.purple {
  background: #D9E0D5;
  color: var(--green-ink);
}

.kit-card-title {
  font-weight: 800;
  font-size: 18px;
  color: #262626;
  margin-bottom: 8px;
}

.kit-card-desc {
  font-size: 13.5px;
  color: #6C6C84;
  line-height: 1.5;
  margin-bottom: 16px;
}

.kit-template-image-wrap {
  margin: 0 0 12px;
}

.kit-template-image {
  width: 100%;
  max-height: 160px;
  object-fit: cover;
  border-radius: 14px;
  border: 1px solid #e3d7c6;
}

.kit-plan-hint {
  font-size: 12.5px;
  color: #5d625f;
  margin: -8px 0 16px;
}

.child-recs-section {
  width: 100%;
  margin: 8px 0 28px;
}

.child-recs-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.child-recs-title {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 24px;
  color: #262626;
  margin: 0;
}

.child-recs-catalog-link {
  flex-shrink: 0;
  color: var(--green-ink);
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
}

.child-recs-catalog-link:hover {
  text-decoration: underline;
}

.child-recs-loading {
  font-size: 14px;
  color: #6c6c84;
  margin: 0;
}

.child-recs-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 768px) {
  .child-recs-grid {
    grid-template-columns: 1fr;
  }

  .child-recs-title {
    font-size: 20px;
  }
}

.interests-focus-card {
  margin-top: 0;
}

.kit-features {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.kit-features li {
  font-size: 13px;
  color: #33334A;
  font-weight: 500;
}

.kit-actions-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.btn-order-kit:disabled {
  opacity: 0.6;
  cursor: wait;
}

.btn-order-kit {
  background: var(--green-surface);
  color: var(--green-ink);
  border: none;
  font-weight: 700;
  font-size: 13.5px;
  padding: 10px 18px;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(51, 61, 54, 0.25);
  transition: all 0.2s ease;
}

.btn-order-kit:hover {
  background: var(--green-surface-hover);
  color: var(--green-ink);
}

.btn-view-kit {
  display: inline-block;
  background: #F4F1EA;
  color: var(--green-ink);
  border: 1px solid #E3D7C6;
  text-decoration: none;
  font-weight: 700;
  font-size: 13.5px;
  padding: 10px 18px;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.btn-view-kit:hover {
  background: var(--green-surface);
  color: var(--green-ink);
}

.interests-tags-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.interest-badge-item {
  background: #F4F1EA;
  color: var(--green-ink);
  border: 1px solid #E3D7C6;
  font-weight: 700;
  font-size: 13px;
  padding: 8px 16px;
  border-radius: 20px;
}

.interest-badge-item.inactive,
.interest-chip-btn.inactive {
  opacity: 0.7;
  border-style: dashed;
}

.decor-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.purple-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--green-surface);
  display: inline-block;
  color: var(--green-ink);
}

.yellow-star {
  color: #E8A62B;
  font-size: 14px;
}

/* Header Right Illustrations */
.decor-shapes-wrap {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
}

.shape {
  position: relative;
}

.ring-purple-orange {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: 12px solid #FF9F7A;
  box-shadow: inset 0 0 0 10px var(--green-ink);
}

.bear-face {
  width: 48px;
  height: 38px;
  background: #FFDCC8;
  border-radius: 20px;
  position: relative;
}

.bear-ear {
  position: absolute;
  width: 16px;
  height: 16px;
  background: #FFDCC8;
  border-radius: 50%;
  top: -6px;
}
.bear-ear.left { left: 2px; }
.bear-ear.right { right: 2px; }

.bear-eye {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #3B2A1E;
  border-radius: 50%;
  top: 14px;
}
.bear-eye.left { left: 14px; }
.bear-eye.right { right: 14px; }

.bear-nose {
  position: absolute;
  width: 6px;
  height: 5px;
  background: #E87A5D;
  border-radius: 50%;
  top: 20px;
  left: 21px;
}

.ring-pink-yellow {
  width: 75px;
  height: 75px;
  border-radius: 50%;
  background: #FCE7F0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring-pink-yellow::after {
  content: '';
  width: 32px;
  height: 32px;
  background: #FFF1C5;
  border-radius: 12px;
}

.child-photo-wrap {
  position: relative;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  overflow: visible;
}

.child-photo {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
}

.photo-star {
  position: absolute;
  top: -8px;
  left: -2px;
  color: #FF8A7A;
  font-size: 18px;
}

.photo-dot {
  position: absolute;
  top: 8px;
  right: -10px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--green-surface);
  color: var(--green-ink);
}

/* Profile Card Section */
.child-grid-section {
  max-width: 680px;
  margin: 0 auto 36px auto;
}

/* Profile Card */
.profile-card {
  width: 100%;
  background: #D9E0D5;
  border-radius: 24px;
  padding: 36px 32px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border: 1px solid rgba(51, 61, 54, 0.12);
  box-shadow: 0 10px 30px rgba(51, 61, 54, 0.05);
}

.card-header-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.avatar-badge {
  width: 44px;
  height: 44px;
  background: #FAF8F4;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  box-shadow: 0 4px 12px rgba(51, 61, 54, 0.12);
}

.child-age-pill {
  padding: 6px 14px;
  background: #FAF8F4;
  color: var(--green-ink);
  font-weight: 700;
  font-size: 13.5px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(51, 61, 54, 0.08);
}

.child-name {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 28px;
  color: #262626;
  margin-bottom: 4px;
}

.child-birth-date {
  font-size: 13.5px;
  color: #6F746F;
  margin-bottom: 28px;
}

.interests-block {
  width: 100%;
  margin-bottom: 32px;
}

.interests-title {
  font-size: 14.5px;
  font-weight: 700;
  color: #262626;
  margin-bottom: 12px;
}

.interests-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.interest-tag {
  background: #FAF8F4;
  color: var(--green-ink);
  font-weight: 600;
  font-size: 12px;
  padding: 6px 14px;
  border-radius: 20px;
  box-shadow: 0 2px 6px rgba(51, 61, 54, 0.04);
}

.edit-profile-btn {
  background: var(--green-surface);
  color: var(--green-ink);
  border: none;
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 14px;
  padding: 12px 24px;
  border-radius: 14px;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(51, 61, 54, 0.25);
  transition: all 0.2s ease;
  margin-top: auto;
}

.edit-profile-btn:hover {
  background: var(--green-surface-hover);
  transform: translateY(-1px);
  color: var(--green-ink);
}

/* Right Achievements Column */
.achievements-col {
  display: flex;
  flex-direction: column;
}

.achievements-heading {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 22px;
  color: #262626;
  margin-bottom: 16px;
}

.achievements-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.achievement-card {
  background: #FAF8F4;
  border-radius: 22px;
  padding: 22px 28px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.achievement-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
}

.achieve-left {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.achieve-icon-badge {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #FFF5D6;
  flex-shrink: 0;
  margin-top: 2px;
}

.achieve-text {
  display: flex;
  flex-direction: column;
}

.achieve-title {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 16px;
  color: #262626;
  margin-bottom: 2px;
}

.achieve-date {
  color: var(--green-ink);
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
}

.achieve-desc {
  font-size: 13.5px;
  color: #6F746F;
  line-height: 1.4;
}

/* Faces decor in achievement card 1 */
.achieve-faces {
  display: flex;
  align-items: center;
}

.face-badge {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.green-face {
  background: #D9F7EC;
  z-index: 2;
}

.pink-face {
  background: #FFE8EC;
  margin-left: -14px;
  z-index: 1;
  width: 42px;
  height: 42px;
  border-radius: 14px;
}

.f-eye {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--green-surface);
  top: 16px;
  color: var(--green-ink);
}
.f-eye.l { left: 14px; }
.f-eye.r { right: 14px; }

.pink-face .f-eye {
  background: #FF6B6B;
  top: 14px;
}
.pink-face .f-eye.l { left: 12px; }
.pink-face .f-eye.r { right: 12px; }

.f-mouth.line {
  position: absolute;
  width: 14px;
  height: 3px;
  background: var(--green-surface);
  border-radius: 2px;
  bottom: 15px;
  color: var(--green-ink);
}

.pink-face .f-mouth.line {
  width: 10px;
  height: 3px;
  background: #FF6B6B;
  bottom: 13px;
}

/* Bottom Add Child Banner */
.add-child-banner {
  position: relative;
  background: #FAF8F4;
  border-radius: 20px;
  border: 1.5px solid var(--green-ink);
  padding: 28px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
}

.add-child-banner:hover {
  background: #FAF8F4;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(51, 61, 54, 0.15);
}

.add-child-title {
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 28px;
  color: var(--green-ink);
  z-index: 2;
}

.add-child-decor {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 120px;
  height: 60px;
  pointer-events: none;
}

.add-star {
  color: var(--green-ink);
  font-size: 24px;
  position: absolute;
  right: 15px;
  top: 0;
  z-index: 2;
}

.mint-blob {
  position: absolute;
  width: 65px;
  height: 45px;
  background: #D9F7EC;
  border-radius: 50%;
  bottom: 0;
  right: 35px;
  opacity: 0.8;
}

.yellow-blob {
  position: absolute;
  width: 28px;
  height: 28px;
  background: #FFE8A3;
  border-radius: 50%;
  bottom: -2px;
  right: 20px;
  opacity: 0.85;
}

.decor-small-star {
  position: absolute;
  color: #B4EDDB;
  font-size: 16px;
  bottom: -6px;
  right: 0;
}

/* Modals */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 26, 46, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.edit-modal {
  position: relative;
  background: #FAF8F4;
  width: 100%;
  max-width: 480px;
  max-height: calc(100dvh - 32px);
  margin: auto;
  border-radius: 24px;
  padding: 0;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.edit-modal__body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  padding: 28px 24px 20px;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #F4F1EA;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5D625F;
  z-index: 3;
}

.modal-title {
  font-family: 'Manrope', sans-serif;
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 6px;
  padding-right: 36px;
}

.modal-desc {
  font-size: 14px;
  color: #6F746F;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.form-group--last {
  margin-bottom: 0;
}

.form-group label {
  font-size: 13px;
  font-weight: 700;
  color: #262626;
}

.modal-input {
  padding: 12px 16px;
  border: 1.5px solid #E3D7C6;
  border-radius: 12px;
  font-size: 14px;
  color: #262626;
  outline: none;
  font-family: 'Manrope', sans-serif;
}

.modal-input:focus {
  border-color: var(--green-ink);
}

.modal-slider {
  width: 100%;
  accent-color: var(--green-ink);
  cursor: pointer;
  height: 6px;
  background: #E8E5F4;
  border-radius: 4px;
}

.form-group--age-preview {
  margin-bottom: 16px;
}

.age-preview-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.age-preview-label {
  font-size: 13px;
  font-weight: 700;
  color: #262626;
}

.age-from-dob-hint {
  margin: 6px 0 0;
  font-size: 12px;
  line-height: 1.4;
  color: #6F746F;
}

.modal-slider--readonly {
  opacity: 0.92;
  pointer-events: none;
  cursor: default;
}

.age-badge-pill {
  padding: 4px 12px;
  background: #D9E0D5;
  color: var(--green-ink);
  border-radius: 14px;
  font-weight: 700;
  font-size: 13px;
}

.gender-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.interests-chips-grid {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 8px;
  margin-top: 8px;
}

.interest-chip-btn {
  padding: 8px 14px;
  border-radius: 20px;
  background: #F8F7FC;
  border: 1.5px solid #E4E0F3;
  color: #555;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.25;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
  flex: 0 1 auto;
  max-width: 100%;
  white-space: normal;
  text-align: left;
}

.interest-chip-btn:hover {
  border-color: var(--green-ink);
  color: var(--green-ink);
  background: #FAF8F4;
}

.interest-chip-btn.selected {
  background: var(--green-surface);
  color: var(--green-ink);
  border-color: var(--green-ink);
  box-shadow: none;
}

.interests-empty-hint {
  margin: 8px 0 0;
  font-size: 13px;
  color: #6F746F;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  padding: 14px 24px 18px;
  background: #FAF8F4;
  border-top: 1px solid #E8E2D6;
}

.modal-actions--split {
  justify-content: space-between;
}

.modal-actions__right {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-left: auto;
}

.cancel-btn {
  background: #F4F1EA;
  border: none;
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

.save-btn {
  background: var(--green-surface);
  color: var(--green-ink);
  border: none;
  padding: 10px 22px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

/* Responsive */
@media (max-width: 960px) {
  .child-grid-section {
    grid-template-columns: 1fr;
  }
  .child-details-grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }
}

@media (max-width: 680px) {
  .decor-shapes-wrap {
    display: none;
  }

  .container {
    padding: 0 14px;
  }

  .page-content {
    padding-top: 20px;
  }

  .child-main-title {
    font-size: 22px;
    line-height: 1.25;
  }

  .child-subtitle {
    font-size: 13.5px;
    line-height: 1.45;
  }

  .family-dashboard {
    border-radius: 20px;
  }

  .family-selector-bar {
    padding: 12px 14px;
    gap: 12px;
  }

  .child-selector-card {
    padding: 6px 14px;
    border-radius: 14px;
  }

  .active-child-body {
    padding: 14px;
  }

  .profile-hero-card {
    flex-direction: column;
    align-items: stretch;
    padding: 16px 14px;
    gap: 14px;
    border-radius: 16px;
    margin-bottom: 18px;
  }

  .hero-left {
    gap: 12px;
  }

  .hero-avatar {
    width: 48px;
    height: 48px;
    font-size: 18px;
  }

  .child-hero-name {
    font-size: 20px;
  }

  .hero-age-badge {
    font-size: 11.5px;
    padding: 3px 8px;
  }

  .hero-birth-date {
    font-size: 12px;
  }

  .hero-right {
    width: 100%;
    display: flex;
    gap: 8px;
  }

  .edit-profile-btn {
    flex: 1;
    padding: 10px 14px;
    font-size: 12.5px;
    text-align: center;
    border-radius: 12px;
  }

  .delete-profile-btn {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    font-size: 15px;
    flex-shrink: 0;
  }

  .child-details-grid {
    grid-template-columns: 1fr !important;
    gap: 14px;
  }

  .detail-card {
    padding: 18px 14px;
    border-radius: 16px;
  }

  .kit-card-title {
    font-size: 17px;
  }

  .form-row {
    flex-direction: column;
    gap: 14px;
  }

  .kit-actions-row {
    flex-direction: column;
    gap: 8px;
  }

  .btn-order-kit,
  .btn-view-kit {
    width: 100%;
    text-align: center;
    padding: 11px;
    font-size: 13px;
  }

  .modal-overlay {
    padding: 10px;
    align-items: stretch;
  }

  .edit-modal {
    max-width: none;
    max-height: calc(100dvh - 20px);
    border-radius: 18px;
    margin: 0;
  }

  .edit-modal__body {
    padding: 20px 14px 16px;
  }

  .modal-title {
    font-size: 20px;
  }

  .modal-desc {
    font-size: 13px;
    margin-bottom: 14px;
  }

  .form-group {
    margin-bottom: 12px;
  }

  .interests-chips-grid {
    gap: 6px;
  }

  .interest-chip-btn {
    padding: 7px 11px;
    font-size: 12px;
  }

  .modal-actions {
    gap: 8px;
    padding: 12px 14px 14px;
  }

  .modal-actions--split {
    flex-direction: column;
    align-items: stretch;
  }

  .modal-actions__right {
    margin-left: 0;
    width: 100%;
  }

  .modal-actions .cancel-btn,
  .modal-actions .save-btn,
  .modal-actions .delete-modal-btn {
    flex: 1 1 auto;
    min-height: 44px;
  }

  .modal-actions__right .cancel-btn,
  .modal-actions__right .save-btn {
    flex: 1;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Empty State Styles */
.empty-child-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: #FAF8F4;
  text-align: center;
}

.empty-state-content {
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-title {
  font-family: 'Manrope', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #262626;
  margin-bottom: 12px;
}

.empty-desc {
  font-size: 15px;
  color: #6C6C84;
  margin-bottom: 24px;
  line-height: 1.5;
}

.add-first-child-btn {
  background: var(--green-surface);
  color: var(--green-ink);
  border: none;
  border-radius: 14px;
  padding: 14px 28px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 8px 24px rgba(51, 61, 54, 0.35);
}

.add-first-child-btn:hover {
  background: var(--green-surface-hover);
  transform: translateY(-2px);
  color: var(--green-ink);
}
.edit-profile-btn,
.btn-order-kit,
.delete-modal-btn,
.kit-card-title,
.hero-age-badge,
.card-ribbon-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.inline-icon { flex-shrink: 0; }
.selector-avatar { display: flex; align-items: center; justify-content: center; color: var(--green-ink); }
.empty-icon { display: block; margin: 0 auto 12px; color: var(--green-ink); }
</style>
