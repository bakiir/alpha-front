<template>
  <div class="child-page">
    <TheHeader />

    <main class="container page-content">
      <!-- Top Section Header -->
      <section class="page-top-header">
        <h1 class="child-main-title">Программа развития и дети</h1>
        <p class="child-subtitle">
          Персональные наборы игрушек и индивидуальные фокусы развития для каждого ребенка.
        </p>
      </section>

      <!-- Main Dashboard Container -->
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
              <div class="selector-avatar">👶</div>
              <div class="selector-info">
                <span class="selector-name">{{ c.name }}</span>
                <span class="selector-age">{{ c.age }}</span>
              </div>
            </button>

            <button class="child-selector-card add-card" @click="isAddModalOpen = true">
              <div class="selector-avatar add-icon">+</div>
              <div class="selector-info">
                <span class="selector-name">Добавить</span>
                <span class="selector-age">профиль</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Active Child Main Workspace -->
        <div class="active-child-body" v-if="child">
          <!-- Upper Profile Summary Bar -->
          <div class="profile-hero-card">
            <div class="hero-left">
              <div class="hero-avatar">
                <span>{{ child.name ? child.name.charAt(0).toUpperCase() : '👶' }}</span>
              </div>
              <div class="hero-details">
                <div class="name-age-row">
                  <h2 class="child-hero-name">{{ child.name }}</h2>
                  <span class="hero-age-badge">👶 {{ child.age }}</span>
                </div>
                <p class="hero-birth-date">Дата рождения: <strong>{{ child.birthDate }}</strong></p>
              </div>
            </div>

            <div class="hero-right">
              <button class="edit-profile-btn" @click="openEditModal">
                ⚙️ Редактировать профиль
              </button>
              <button class="delete-profile-btn" @click="confirmDeleteChild(activeChildIndex)" title="Удалить профиль ребенка">
                🗑️
              </button>
            </div>
          </div>

          <!-- 2-Column Details: Recommended Kit + Interests -->
          <div class="child-details-grid">
            <!-- Recommended Kit Card -->
            <div class="detail-card kit-recommendation-card">
              <div class="card-badge-pill green">РЕКОМЕНДОВАННЫЙ НАБОР ПОД ВОЗРАСТ</div>
              <h3 class="kit-card-title">🎁 {{ getAgeRecommendedKit(child.ageMonths) }}</h3>
              <p class="kit-card-desc">
                Индивидуальная программа Alpha подбирает 6 развивающих эко-игрушек для возраста {{ child.age }}.
              </p>
              <ul class="kit-features">
                <li>✓ Экологичные гипоаллергенные материалы</li>
                <li>✓ Методическое пособие для родителей в комплекте</li>
                <li>✓ Развитие ключевых навыков по методике Монтессори</li>
              </ul>
              <div class="kit-actions-row">
                <button class="btn-order-kit" @click="openQuiz()">
                  ✨ Заказать набор для {{ child.name }}
                </button>
                <NuxtLink to="/shop" class="btn-view-kit">
                  Посмотреть каталог →
                </NuxtLink>
              </div>
            </div>

            <!-- Interests & Focuses Card -->
            <div class="detail-card interests-focus-card">
              <div class="card-badge-pill purple">ФОКУСЫ РАЗВИТИЯ</div>
              <h3 class="kit-card-title">Интересы {{ child.name }}</h3>
              <p class="kit-card-desc mb-3">
                Выбранные направления учитываются нашей системой при сборке каждого персонального набора.
              </p>

              <div class="interests-tags-grid">
                <span 
                  v-for="interest in child.interests" 
                  :key="interest" 
                  class="interest-badge-item"
                >
                  {{ getInterestLabel(interest) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Edit Profile Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isEditModalOpen" class="modal-overlay" @click.self="isEditModalOpen = false">
          <div class="edit-modal">
            <button class="close-btn" @click="isEditModalOpen = false">&times;</button>
            <h2 class="modal-title">Редактировать профиль</h2>
            <p class="modal-desc">Настройте фокусы развития для более точного подбора наборов.</p>

            <div class="form-group">
              <label>Имя ребёнка <span style="color: #7C5CFC">*</span></label>
              <input v-model="editForm.name" type="text" class="modal-input" placeholder="Имя ребенка" />
            </div>

            <div class="form-group">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <label class="mb-0">Возраст ребёнка:</label>
                <span class="age-badge-pill">{{ formatAgeMonths(editForm.ageMonths) }}</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="72" 
                v-model.number="editForm.ageMonths" 
                class="modal-slider"
                @input="onEditAgeSliderChange"
              />
            </div>

            <div class="form-group">
              <label>Дата рождения</label>
              <input 
                type="date" 
                v-model="editForm.rawDate" 
                class="modal-input"
                @change="onEditDateChange"
              />
            </div>

            <div class="form-group">
              <label class="mb-2">Интересы и фокусы развития (нажмите для выбора):</label>
              <div class="interests-chips-grid">
                <button 
                  v-for="interest in AVAILABLE_INTERESTS" 
                  :key="interest"
                  type="button"
                  class="interest-chip-btn"
                  :class="{ selected: editForm.interests.includes(interest) }"
                  @click="toggleInterest(editForm.interests, interest)"
                >
                  {{ interest }}
                </button>
              </div>
            </div>

            <div class="modal-actions d-flex justify-content-between align-items-center">
              <button type="button" class="delete-modal-btn" @click="confirmDeleteFromModal">🗑️ Удалить профиль</button>
              <div class="d-flex gap-2">
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
            <h2 class="modal-title">Добавить профиль ребёнка</h2>
            <p class="modal-desc">Для каждого ребенка мы формируем персональную программу развития.</p>

            <div class="form-group">
              <label>Имя ребёнка <span style="color: #7C5CFC">*</span></label>
              <input v-model="newChild.name" type="text" placeholder="Например: София" class="modal-input" required />
            </div>

            <div class="form-group">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <label class="mb-0">Возраст ребёнка:</label>
                <span class="age-badge-pill">{{ formatAgeMonths(newChild.ageMonths) }}</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="72" 
                v-model.number="newChild.ageMonths" 
                class="modal-slider"
                @input="onNewAgeSliderChange"
              />
            </div>

            <div class="form-group">
              <label>Дата рождения</label>
              <input 
                type="date" 
                v-model="newChild.rawDate" 
                class="modal-input"
                @change="onNewDateChange"
              />
            </div>

            <div class="form-group">
              <label class="mb-2">Интересы и фокусы развития (выберите подходящие):</label>
              <div class="interests-chips-grid">
                <button 
                  v-for="interest in AVAILABLE_INTERESTS" 
                  :key="interest"
                  type="button"
                  class="interest-chip-btn"
                  :class="{ selected: newChild.interests.includes(interest) }"
                  @click="toggleInterest(newChild.interests, interest)"
                >
                  {{ interest }}
                </button>
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
import { ref, computed, onMounted } from 'vue'
import TheHeader from '~/components/TheHeader.vue'

interface ChildProfile {
  id?: number
  name: string
  age: string
  ageMonths: number
  birthDate: string
  rawDate: string
  interests: string[]
  achievements?: Array<{ title: string; date: string; desc: string }>
}

const AVAILABLE_INTERESTS = [
  '🎨 Монтессори & Сенсорика',
  '🧩 Конструкторы & Формы',
  '⚖️ Логика & Баланс',
  '🖐️ Мелкая моторика',
  '🏃 Крупная моторика',
  '🎵 Музыка & Звуки',
  '🖼️ Пазлы',
  '🗣️ Речь & Язык',
  '✨ Творчество & Фантазия'
]

const formatAgeMonths = (months: number) => {
  const years = Math.floor(months / 12)
  const remMonths = months % 12
  if (years === 0) return `${months} мес.`
  if (remMonths === 0) return `${years} ${years === 1 ? 'год' : years < 5 ? 'года' : 'лет'}`
  return `${years} г. ${remMonths} мес.`
}

const monthsFromDateStr = (isoDateStr: string): number => {
  if (!isoDateStr) return 24
  const birth = new Date(isoDateStr)
  if (isNaN(birth.getTime())) return 24
  const now = new Date()
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  return Math.max(1, Math.min(72, months))
}

const dateStrFromMonths = (months: number): string => {
  const date = new Date()
  date.setMonth(date.getMonth() - months)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
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

const defaultChildren: ChildProfile[] = [
  {
    id: 1,
    name: 'Миша',
    age: '2.5 года',
    ageMonths: 30,
    rawDate: '2024-01-18',
    birthDate: '18 января, 2024',
    interests: ['🧩 Конструкторы & Формы', '🖼️ Пазлы', '⚖️ Логика & Баланс', '🖐️ Мелкая моторика', '🎵 Музыка & Звуки'],
    achievements: [
      { title: 'Логика & Баланс', date: 'Июнь 2026', desc: 'Миша научился сопоставлять 4 базовые формы на весах' },
      { title: 'Тонкая моторика', date: 'Май 2026', desc: 'Уверенно нанизывает кольца сортера по цветам' },
      { title: 'Интерес к музыке', date: 'Апрель 2026', desc: 'Дольше удерживает внимание в ритмических играх' }
    ]
  }
]

const childrenList = ref<ChildProfile[]>(defaultChildren)
const activeChildIndex = ref(0)

const child = computed<ChildProfile>(() => {
  return childrenList.value[activeChildIndex.value] || childrenList.value[0] || defaultChildren[0]
})

const INTEREST_MAP: Record<string, { label: string; title: string; desc: (name: string) => string }> = {
  fine_motor: {
    label: '🖐️ Мелкая моторика',
    title: 'Тонкая моторика & Захват',
    desc: (name) => `${name} уверенно нанизывает кольца сортера по цветам, развивая мелкую моторику и точность движений.`
  },
  logic: {
    label: '⚖️ Логика & Баланс',
    title: 'Логическое мышление',
    desc: (name) => `${name} научился(лась) сопоставлять 4 базовые формы на весах и осваивает принципы баланса.`
  },
  montessori: {
    label: '🎨 Сенсорика & Монтессори',
    title: 'Сенсорное восприятие',
    desc: (name) => `${name} активно исследует разницу фактур натурального дерева и тактильные грани сортеров.`
  },
  creativity: {
    label: '✨ Творчество & Фантазия',
    title: 'Творческое воображение',
    desc: (name) => `${name} создает свои первые игровые сюжеты и находит оригинальные способы сборки элементов.`
  },
  puzzles: {
    label: '🖼️ Пазлы & Созидание',
    title: 'Пазлы & Формы',
    desc: (name) => `${name} самостоятельно собирает сортеры из 4+ предметов и пространственные пазлы.`
  },
  music: {
    label: '🎵 Музыка & Звуки',
    title: 'Слуховое восприятие',
    desc: (name) => `${name} с интересом улавливает ритмы акустических игрушек и удерживает внимание.`
  },
  gross_motor: {
    label: '🏃 Крупная моторика',
    title: 'Двигательная активность',
    desc: (name) => `${name} координирует движения тела в активных играх с напольными наборами.`
  },
  language: {
    label: '🗣️ Речь & Язык',
    title: 'Речевое развитие',
    desc: (name) => `${name} активно проговаривает названия предметов и форм в игровом процессе.`
  },
  constructors: {
    label: '🧩 Конструкторы',
    title: 'Конструирование',
    desc: (name) => `${name} возводит первые башни и сопоставляет объёмные фигуры.`
  }
}

const getInterestLabel = (key: string): string => {
  if (INTEREST_MAP[key]) {
    return INTEREST_MAP[key].label
  }
  return key
}

const getAgeRecommendedKit = (months: number = 24): string => {
  if (months <= 6) return 'Набор "Первые сенсоры" (0-6 месяцев)'
  if (months <= 12) return 'Набор "Первые открытия" (6-12 месяцев)'
  if (months <= 18) return 'Набор "Исследователь" (12-18 месяцев)'
  if (months <= 24) return 'Набор "Первопроходец" (18-24 месяцев)'
  if (months <= 36) return 'Набор "Мыслитель & Созидатель" (2-3 года)'
  if (months <= 48) return 'Набор "Творец & Изобретатель" (3-4 года)'
  return 'Набор "Архитектор & Мастер" (4+ года)'
}

const activeAchievements = computed(() => {
  const currentChild = child.value
  const name = currentChild.name || 'Ребёнок'
  const rawInterests = currentChild.interests && currentChild.interests.length > 0
    ? currentChild.interests
    : ['fine_motor', 'logic', 'montessori', 'creativity']

  const dates = ['Май 2026', 'Апрель 2026', 'Март 2026', 'Февраль 2026']

  return rawInterests.map((key, idx) => {
    const mapped = INTEREST_MAP[key]
    if (mapped) {
      return {
        title: mapped.title,
        date: dates[idx % dates.length],
        desc: mapped.desc(name)
      }
    }

    let cleanTitle = key.replace(/^[^\s]+\s*/, '') || key
    let desc = `${name} активно осваивает навыки в направлении «${cleanTitle}» с набором Alpha.`
    if (key.includes('Монтессори') || key.includes('Сенсорика')) {
      desc = `${name} изучает фактуры, формы и развивает сенсорные качества с эко-игрушками Монтессори.`
    } else if (key.includes('Конструкторы') || key.includes('Формы') || key.includes('Пазлы')) {
      desc = `${name} строит первые пространственные конструкции и сопоставляет объёмные фигуры.`
    } else if (key.includes('Логика') || key.includes('Баланс')) {
      desc = `${name} осваивает равновесие и сопоставление предметов на весах и балансирах.`
    } else if (key.includes('моторика')) {
      desc = `${name} уверенно нанизывает элементы, развивает пальчиковый захват и ловкость рук.`
    } else if (key.includes('Музыка') || key.includes('Звуки')) {
      desc = `${name} увлеченно исследует ритмические игры и слуховое восприятие.`
    }

    return {
      title: cleanTitle,
      date: dates[idx % dates.length],
      desc
    }
  })
})

const isEditModalOpen = ref(false)
const isAddModalOpen = ref(false)

const editForm = ref({
  name: '',
  ageMonths: 30,
  rawDate: '2024-01-18',
  interests: [] as string[]
})

const newChild = ref({
  name: '',
  ageMonths: 18,
  rawDate: '2025-02-15',
  interests: ['🎨 Монтессори & Сенсорика', '✨ Творчество & Фантазия']
})

const openEditModal = () => {
  editForm.value.name = child.value.name
  editForm.value.ageMonths = child.value.ageMonths || 30
  editForm.value.rawDate = child.value.rawDate || '2024-01-18'
  editForm.value.interests = [...(child.value.interests || [])]
  isEditModalOpen.value = true
}

const toggleInterest = (targetArray: string[], interest: string) => {
  const index = targetArray.indexOf(interest)
  if (index > -1) {
    targetArray.splice(index, 1)
  } else {
    targetArray.push(interest)
  }
}

const onEditAgeSliderChange = () => {
  editForm.value.rawDate = dateStrFromMonths(editForm.value.ageMonths)
}

const onEditDateChange = () => {
  editForm.value.ageMonths = monthsFromDateStr(editForm.value.rawDate)
}

const onNewAgeSliderChange = () => {
  newChild.value.rawDate = dateStrFromMonths(newChild.value.ageMonths)
}

const onNewDateChange = () => {
  newChild.value.ageMonths = monthsFromDateStr(newChild.value.rawDate)
}

const { request } = useApi()

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
  const current = childrenList.value[activeChildIndex.value]
  if (!current) return

  current.name = editForm.value.name || current.name
  current.ageMonths = editForm.value.ageMonths
  current.age = formatAgeMonths(editForm.value.ageMonths)
  current.rawDate = editForm.value.rawDate
  current.birthDate = formatDateReadable(editForm.value.rawDate)
  current.interests = [...editForm.value.interests]

  try {
    if (current.id) {
      await request<any>(`/children/${current.id}`, {
        method: 'PUT',
        body: {
          name: current.name,
          birth_date: current.rawDate,
          interests: current.interests
        }
      })
    }
  } catch (e) {
    console.log('API update skipped, updated locally:', e)
  }

  persistChildrenLocal()
  isEditModalOpen.value = false
}

const confirmDeleteChild = async (index: number) => {
  const target = childrenList.value[index]
  if (!target) return

  if (!confirm(`Вы действительно хотите удалить профиль ребёнка ${target.name}?`)) {
    return
  }

  try {
    if (target.id) {
      await request(`/children/${target.id}`, {
        method: 'DELETE'
      })
    }
  } catch (e) {
    console.log('API delete skipped, removed locally:', e)
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
  if (!newChild.value.name.trim()) return

  const createdChild: ChildProfile = {
    name: newChild.value.name.trim(),
    ageMonths: newChild.value.ageMonths,
    age: formatAgeMonths(newChild.value.ageMonths),
    rawDate: newChild.value.rawDate,
    birthDate: formatDateReadable(newChild.value.rawDate),
    interests: [...newChild.value.interests],
    achievements: [
      { title: 'Первые шаги', date: 'Август 2026', desc: `Персональная программа подбора Монтессори для ${newChild.value.name.trim()} активирована!` }
    ]
  }

  try {
    const res = await request<any>('/children', {
      method: 'POST',
      body: {
        name: createdChild.name,
        birth_date: createdChild.rawDate,
        interests: createdChild.interests
      }
    })
    if (res && res.data && res.data.id) {
      createdChild.id = res.data.id
    }
  } catch (e) {
    console.log('API save skipped, added locally:', e)
  }

  childrenList.value.push(createdChild)
  activeChildIndex.value = childrenList.value.length - 1
  persistChildrenLocal()

  newChild.value = {
    name: '',
    ageMonths: 18,
    rawDate: '2025-02-15',
    interests: ['🎨 Монтессори & Сенсорика', '✨ Творчество & Фантазия']
  }
  isAddModalOpen.value = false
}

onMounted(async () => {
  // 1. Load locally stored children first
  if (import.meta.client) {
    const saved = localStorage.getItem('alpha_children_list')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          childrenList.value = parsed
          const savedIndex = localStorage.getItem('alpha_active_child_index')
          if (savedIndex !== null) {
            activeChildIndex.value = Math.min(Number(savedIndex) || 0, childrenList.value.length - 1)
          }
        }
      } catch (e) {
        console.error('Failed to parse localStorage children:', e)
      }
    }
  }

  // 2. Fetch authenticated user's children from backend API
  try {
    const res = await request<any>('/children')
    if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
      childrenList.value = res.data.map((item: any) => {
        const rawDate = item.birth_date || '2024-01-18'
        const ageMonths = monthsFromDateStr(rawDate)
        return {
          id: item.id,
          name: item.name,
          ageMonths,
          age: formatAgeMonths(ageMonths),
          rawDate,
          birthDate: formatDateReadable(rawDate),
          interests: item.interests && item.interests.length ? item.interests : ['🎨 Монтессори & Сенсорика'],
          achievements: defaultChildren[0].achievements
        }
      })
      activeChildIndex.value = 0
      persistChildrenLocal()
    }
  } catch (e) {
    console.log('Children fetch skipped (guest or unauthenticated):', e)
  }
})
</script>

<style scoped>
.child-page {
  min-height: 100vh;
  background-color: #FFF8F0;
  color: #1A1A2E;
  font-family: 'DM Sans', sans-serif;
  padding-bottom: 80px;
}

.container {
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-content {
  padding-top: 36px;
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
  color: #7C5CFC;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 8px;
}

/* Top Section Header */
.page-top-header {
  margin-bottom: 24px;
}

.child-main-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 32px;
  color: #1A1A2E;
  margin-bottom: 6px;
}

.child-subtitle {
  font-size: 15px;
  color: #6C6C84;
}

/* Family Dashboard Main Container */
.family-dashboard {
  background: #FFFFFF;
  border-radius: 28px;
  border: 1px solid #E8E6F5;
  box-shadow: 0 16px 40px rgba(124, 92, 252, 0.06);
  overflow: hidden;
  margin-bottom: 40px;
}

/* Family Selector Bar */
.family-selector-bar {
  background: #FAF9FF;
  border-bottom: 1px solid #EAE7FA;
  padding: 18px 28px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.selector-label {
  font-size: 13.5px;
  font-weight: 700;
  color: #7B7B93;
  white-space: nowrap;
}

.selector-cards-row {
  display: flex;
  align-items: center;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.child-selector-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 18px;
  background: #FFFFFF;
  border: 2px solid #E4E0F3;
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.child-selector-card:hover {
  border-color: #7C5CFC;
  transform: translateY(-1px);
}

.child-selector-card.active {
  background: #7C5CFC;
  border-color: #7C5CFC;
  box-shadow: 0 6px 16px rgba(124, 92, 252, 0.25);
}

.child-selector-card.active .selector-name {
  color: #FFFFFF;
}

.child-selector-card.active .selector-age {
  color: rgba(255, 255, 255, 0.85);
}

.selector-avatar {
  width: 32px;
  height: 32px;
  background: #EDE9FF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.child-selector-card.active .selector-avatar {
  background: rgba(255, 255, 255, 0.2);
}

.child-selector-card.add-card {
  border-style: dashed;
  background: #FAF8FF;
  border-color: #7C5CFC;
}

.selector-avatar.add-icon {
  font-weight: 800;
  color: #7C5CFC;
}

.selector-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.selector-name {
  font-weight: 700;
  font-size: 14px;
  color: #1A1A2E;
}

.selector-age {
  font-size: 11.5px;
  color: #7B7B93;
}

/* Active Child Body */
.active-child-body {
  padding: 32px;
}

.profile-hero-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #F3EFFF 0%, #FAF8FF 100%);
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
  background: linear-gradient(135deg, #7C5CFC 0%, #9B7CFF 100%);
  color: #FFFFFF;
  font-size: 26px;
  font-weight: 800;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 16px rgba(124, 92, 252, 0.25);
}

.name-age-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.child-hero-name {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 28px;
  color: #1A1A2E;
}

.hero-age-badge {
  padding: 4px 12px;
  background: #FFFFFF;
  color: #7C5CFC;
  font-weight: 700;
  font-size: 13px;
  border-radius: 14px;
  border: 1px solid #E2D9FF;
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
  background: #FFFFFF;
  color: #7C5CFC;
  border: 1.5px solid #7C5CFC;
  padding: 10px 20px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 13.5px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-profile-btn:hover {
  background: #7C5CFC;
  color: #FFFFFF;
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
  color: #FFFFFF;
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
  background: #EDE9FF;
  color: #7C5CFC;
}

.kit-card-title {
  font-weight: 800;
  font-size: 18px;
  color: #1A1A2E;
  margin-bottom: 8px;
}

.kit-card-desc {
  font-size: 13.5px;
  color: #6C6C84;
  line-height: 1.5;
  margin-bottom: 16px;
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

.btn-order-kit {
  background: #7C5CFC;
  color: #FFFFFF;
  border: none;
  font-weight: 700;
  font-size: 13.5px;
  padding: 10px 18px;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(124, 92, 252, 0.25);
  transition: all 0.2s ease;
}

.btn-order-kit:hover {
  background: #6544E0;
}

.btn-view-kit {
  display: inline-block;
  background: #F4F0FF;
  color: #7C5CFC;
  border: 1px solid #E2D9FF;
  text-decoration: none;
  font-weight: 700;
  font-size: 13.5px;
  padding: 10px 18px;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.btn-view-kit:hover {
  background: #7C5CFC;
  color: #FFFFFF;
}

.interests-tags-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.interest-badge-item {
  background: #F4F0FF;
  color: #624CE0;
  border: 1px solid #E2D9FF;
  font-weight: 700;
  font-size: 13px;
  padding: 8px 16px;
  border-radius: 20px;
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
  background: #7C5CFC;
  display: inline-block;
}

.yellow-star {
  color: #FFD166;
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
  box-shadow: inset 0 0 0 10px #7C5CFC;
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
  background: #7C5CFC;
}

/* Profile Card Section */
.child-grid-section {
  max-width: 680px;
  margin: 0 auto 36px auto;
}

/* Profile Card */
.profile-card {
  width: 100%;
  background: #F0EDFF;
  border-radius: 24px;
  padding: 36px 32px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border: 1px solid rgba(124, 92, 252, 0.12);
  box-shadow: 0 10px 30px rgba(124, 92, 252, 0.05);
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
  background: #FFFFFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  box-shadow: 0 4px 12px rgba(124, 92, 252, 0.12);
}

.child-age-pill {
  padding: 6px 14px;
  background: #FFFFFF;
  color: #7C5CFC;
  font-weight: 700;
  font-size: 13.5px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(124, 92, 252, 0.08);
}

.child-name {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 28px;
  color: #1A1A2E;
  margin-bottom: 4px;
}

.child-birth-date {
  font-size: 13.5px;
  color: #7B7B93;
  margin-bottom: 28px;
}

.interests-block {
  width: 100%;
  margin-bottom: 32px;
}

.interests-title {
  font-size: 14.5px;
  font-weight: 700;
  color: #1A1A2E;
  margin-bottom: 12px;
}

.interests-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.interest-tag {
  background: #FFFFFF;
  color: #7C5CFC;
  font-weight: 600;
  font-size: 12px;
  padding: 6px 14px;
  border-radius: 20px;
  box-shadow: 0 2px 6px rgba(124, 92, 252, 0.04);
}

.edit-profile-btn {
  background: #624CE0;
  color: #FFFFFF;
  border: none;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 14px;
  padding: 12px 24px;
  border-radius: 14px;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(98, 76, 224, 0.25);
  transition: all 0.2s ease;
  margin-top: auto;
}

.edit-profile-btn:hover {
  background: #513bc7;
  transform: translateY(-1px);
}

/* Right Achievements Column */
.achievements-col {
  display: flex;
  flex-direction: column;
}

.achievements-heading {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 22px;
  color: #1A1A2E;
  margin-bottom: 16px;
}

.achievements-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.achievement-card {
  background: #FFFFFF;
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
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 16px;
  color: #1A1A2E;
  margin-bottom: 2px;
}

.achieve-date {
  color: #7C5CFC;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
}

.achieve-desc {
  font-size: 13.5px;
  color: #7B7B93;
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
  background: #7C5CFC;
  top: 16px;
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
  background: #7C5CFC;
  border-radius: 2px;
  bottom: 15px;
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
  background: #FFFFFF;
  border-radius: 20px;
  border: 1.5px solid #7C5CFC;
  padding: 28px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
}

.add-child-banner:hover {
  background: #F8F6FF;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(124, 92, 252, 0.15);
}

.add-child-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 28px;
  color: #624CE0;
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
  color: #7C5CFC;
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
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.edit-modal {
  position: relative;
  background: #FFFFFF;
  width: 100%;
  max-width: 480px;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #F4F4F8;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4A4A68;
}

.modal-title {
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 6px;
}

.modal-desc {
  font-size: 14px;
  color: #7B7B93;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.form-group label {
  font-size: 13px;
  font-weight: 700;
  color: #1A1A2E;
}

.modal-input {
  padding: 12px 16px;
  border: 1.5px solid #E2E2EC;
  border-radius: 12px;
  font-size: 14px;
  color: #1A1A2E;
  outline: none;
  font-family: 'DM Sans', sans-serif;
}

.modal-input:focus {
  border-color: #7C5CFC;
}

.modal-slider {
  width: 100%;
  accent-color: #7C5CFC;
  cursor: pointer;
  height: 6px;
  background: #E8E5F4;
  border-radius: 4px;
}

.age-badge-pill {
  padding: 4px 12px;
  background: #EDE9FF;
  color: #7C5CFC;
  border-radius: 14px;
  font-weight: 700;
  font-size: 13px;
}

.interests-chips-grid {
  display: flex;
  flex-wrap: wrap;
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
  cursor: pointer;
  transition: all 0.2s ease;
}

.interest-chip-btn:hover {
  border-color: #7C5CFC;
  color: #7C5CFC;
  background: #FAF8FF;
}

.interest-chip-btn.selected {
  background: #7C5CFC;
  color: #FFFFFF;
  border-color: #7C5CFC;
  box-shadow: 0 4px 10px rgba(124, 92, 252, 0.25);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.cancel-btn {
  background: #F4F4F8;
  border: none;
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

.save-btn {
  background: #7C5CFC;
  color: #FFFFFF;
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
}

@media (max-width: 680px) {
  .decor-shapes-wrap {
    display: none;
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
</style>
