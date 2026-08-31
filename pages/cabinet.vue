<template>
  <div class="my-kit-page">
    <TheHeader />

    <main class="container page-content">
      <!-- Section Header -->
      <section class="kit-header-section">
        <div class="header-left">
          <h1 class="kit-main-title">Мой текущий набор</h1>
          <p class="kit-subtitle">
            <template v-if="isLoadingKit">Загружаем ваш набор...</template>
            <template v-else-if="currentToys.length">
              Игрушки подобраны по индивидуальному плану развития для {{ activeChildName }}<span v-if="activeChildAge">, {{ activeChildAge }}</span>.
            </template>
            <template v-else>
              У вас пока нет активного набора. <NuxtLink to="/subscription">Оформите подписку</NuxtLink>
            </template>
          </p>

          <!-- Small dot and star decor -->
          <div class="decor-row">
            <span class="purple-dot"></span>
            <span class="yellow-star">★</span>
          </div>
        </div>

        <div class="header-right">
          <!-- Playful Pastel Blobs -->
          <div class="blob-container">
            <div class="blob blob-blue">
              <span class="blob-star">★</span>
            </div>
            <div class="blob blob-yellow"></div>
          </div>
        </div>
      </section>

      <!-- Toys Grid -->
      <section class="toys-grid-section">
        <div class="toys-grid">
          <div 
            v-for="toy in currentToys" 
            :key="toy.id" 
            class="toy-item-card"
          >
            <!-- Image Area -->
            <div class="toy-card-img-wrap">
              <img :src="toy.image" :alt="toy.title" class="toy-img" />
            </div>

            <!-- Content Area -->
            <div class="toy-card-content">
              <!-- Skill Pill -->
              <span class="skill-pill">{{ toy.skill }}</span>

              <!-- Age -->
              <span class="toy-age">{{ toy.age }}</span>

              <!-- Title -->
              <h3 class="toy-name">{{ toy.title }}</h3>

              <!-- Condition -->
              <div class="toy-condition">
                <span class="cond-label">Состояние: </span>
                <span class="cond-val">{{ toy.condition }}</span>
              </div>

              <!-- Action Link -->
              <button class="details-btn" @click="openToyDetail(toy)">
                Подробнее
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Next Set Section -->
      <section v-if="nextToys.length" class="next-set-section">
        <div class="next-set-header">
          <div>
            <span class="section-badge">СЛЕДУЮЩИЙ КОМПЛЕКТ</span>
            <h2 class="next-set-title">Ваш следующий набор сформирован</h2>
            <p v-if="nextExchangeDate" class="next-set-date">Плановый обмен: {{ nextExchangeDate }}</p>
          </div>
          <button class="modify-set-btn" @click="openModifyModal">Изменить комплект</button>
        </div>
        <div class="toys-grid compact-grid">
          <div v-for="toy in nextToys" :key="'next-' + toy.id" class="toy-item-card">
            <div class="toy-card-img-wrap">
              <img :src="toy.image" :alt="toy.title" class="toy-img" />
            </div>
            <div class="toy-card-content">
              <span class="skill-pill">{{ toy.skill }}</span>
              <h3 class="toy-name">{{ toy.title }}</h3>
            </div>
          </div>
        </div>
        <p class="next-set-note">Если ничего не менять — комплект отправится автоматически по сформированному составу.</p>
      </section>

      <!-- Exchange Banner Card -->
      <section class="exchange-banner-card">
        <div class="banner-content">
          <h2 class="banner-title">Хотите новый набор?</h2>
          <p class="banner-subtitle">Мы подготовим новую подборку, когда подойдёт время обмена.</p>

          <div class="banner-actions">
            <button
              class="exchange-primary-btn"
              :disabled="isRequestingExchange || isLoadingKit || !activeSubscriptionId"
              @click="handleExchangeRequest"
            >
              {{ isRequestingExchange ? 'Отправляем...' : 'Запросить обмен наборов' }}
            </button>
            <span class="exchange-info-text">{{ exchangeInfoText }}</span>
          </div>
        </div>

        <!-- Banner Right Decor -->
        <div class="banner-decor">
          <span class="banner-star">★</span>
          <div class="decor-blob mint-blob"></div>
          <div class="decor-blob yellow-blob"></div>
          <span class="decor-small-star">★</span>
        </div>
      </section>
    </main>

    <!-- Modify Next Set Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isModifyModalOpen" class="modal-overlay" @click.self="isModifyModalOpen = false">
          <div class="modify-modal-card">
            <button class="modal-close" @click="isModifyModalOpen = false">&times;</button>
            <h2>Изменить следующий комплект</h2>
            <p class="modal-hint">Выберите игрушки из каталога ({{ selectedToyIds.length }} / {{ toysLimit }})</p>
            <div v-if="isLoadingCatalog" class="modal-loading">Загружаем каталог...</div>
            <div v-else class="catalog-picker-grid">
              <button
                v-for="toy in catalogToys"
                :key="'pick-' + toy.id"
                type="button"
                class="pick-toy-card"
                :class="{ selected: selectedToyIds.includes(toy.id) }"
                @click="togglePickToy(toy.id)"
              >
                <img :src="toy.image_url || toy.image" :alt="toy.name || toy.title" />
                <span>{{ toy.name || toy.title }}</span>
              </button>
            </div>
            <div v-if="modifyError" class="modify-error">{{ modifyError }}</div>
            <div class="modal-actions">
              <button class="cancel-btn" @click="isModifyModalOpen = false">Отмена</button>
              <button class="save-btn" :disabled="isSavingSet || !selectedToyIds.length" @click="saveModifiedSet">
                {{ isSavingSet ? 'Сохраняем...' : 'Сохранить комплект' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Toy Detail Modal -->
    <ToyDetailModal 
      :toy="selectedToy" 
      @close="selectedToy = null" 
    />

    <!-- TheFooter -->
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TheHeader from '~/components/TheHeader.vue'
import TheFooter from '~/components/TheFooter.vue'
import ToyDetailModal from '~/components/ToyDetailModal.vue'

interface ToyItem {
  id: number
  title: string
  skill: string
  age: string
  condition: string
  image: string
  description?: string
  isBoughtOut?: boolean
}

const activeChildName = ref('')
const activeChildAge = ref('')
const activeSubscriptionId = ref<number | null>(null)
const currentSetId = ref<number | null>(null)
const currentSetStatus = ref('')
const exchangeInfoText = ref('Загрузка данных...')
const isLoadingKit = ref(true)
const isRequestingExchange = ref(false)
const selectedToy = ref<ToyItem | null>(null)

const { user } = useAuth()
const { success: toastSuccess, error: toastError } = useToast()
const { fetchMySubscriptions, requestExchange, fetchNextSet, modifySetToys } = useSubscriptions()
const { fetchToys } = useToys()

const nextToys = ref<ToyItem[]>([])
const nextExchangeDate = ref('')
const toysLimit = ref(3)
const isModifyModalOpen = ref(false)
const isLoadingCatalog = ref(false)
const isSavingSet = ref(false)
const modifyError = ref('')
const catalogToys = ref<any[]>([])
const selectedToyIds = ref<number[]>([])

const mapSetToy = (item: any): ToyItem => ({
  id: item.id,
  title: item.name,
  skill: item.category?.name || 'Развивающая игрушка',
  age: `${Math.floor((item.min_age_months || 0) / 12)}–${Math.ceil((item.max_age_months || 72) / 12)} года`,
  condition: item.pivot?.is_bought_out ? 'Выкуплена' : 'Отличное',
  image: item.image_url || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80',
  description: item.description || 'Развивающая эко-игрушка из натурального дерева.',
  isBoughtOut: !!item.pivot?.is_bought_out,
})

const loadCurrentKit = async () => {
  if (!user.value) {
    isLoadingKit.value = false
    exchangeInfoText.value = 'Войдите, чтобы увидеть текущий набор'
    return
  }

  isLoadingKit.value = true
  try {
    const res = await fetchMySubscriptions()
    const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
    const active = list.find((s: any) => s.status === 'active' || s.status === 'paused')

    if (!active?.current_set) {
      currentToys.value = []
      exchangeInfoText.value = 'Активная подписка или набор не найдены'
      return
    }

    activeSubscriptionId.value = active.id
    currentSetId.value = active.current_set.id
    currentSetStatus.value = active.current_set.status
    activeChildName.value = active.child?.name || 'вашего малыша'
    activeChildAge.value = active.child?.age_in_months
      ? `${active.child.age_in_months} мес`
      : ''

    currentToys.value = (active.current_set.toys || []).map(mapSetToy)

    if (currentSetStatus.value === 'returning') {
      exchangeInfoText.value = 'Запрос на обмен принят — курьер заберёт набор'
    } else if (active.current_set.return_due_date) {
      exchangeInfoText.value = `Возврат до ${new Date(active.current_set.return_due_date).toLocaleDateString('ru-RU')}`
    } else {
      exchangeInfoText.value = 'Обмен доступен по расписанию подписки'
    }
    if (active.plan?.toys_count) {
      toysLimit.value = active.plan.toys_count + (active.extra_toys_count || 0)
    }

    await loadNextSet(active.id)
  } catch (e) {
    exchangeInfoText.value = 'Не удалось загрузить набор'
  } finally {
    isLoadingKit.value = false
  }
}

onMounted(loadCurrentKit)

const loadNextSet = async (subscriptionId: number) => {
  try {
    const res = await fetchNextSet(subscriptionId)
    const set = res?.data || res
    const toys = set?.toys || set?.next_set?.toys || []
    nextToys.value = toys.map(mapSetToy)
    nextExchangeDate.value = set?.exchange_date || set?.planned_exchange_date
      ? new Date(set.exchange_date || set.planned_exchange_date).toLocaleDateString('ru-RU')
      : ''
    selectedToyIds.value = nextToys.value.map(t => t.id)
  } catch {
    nextToys.value = []
  }
}

const openModifyModal = async () => {
  if (!activeSubscriptionId.value) return
  isModifyModalOpen.value = true
  modifyError.value = ''
  isLoadingCatalog.value = true
  try {
    const res = await fetchToys({ per_page: 40 })
    const list = res?.data || res
    catalogToys.value = Array.isArray(list) ? list : (list?.data || [])
    if (!selectedToyIds.value.length) {
      selectedToyIds.value = nextToys.value.map(t => t.id)
    }
  } catch {
    catalogToys.value = []
  } finally {
    isLoadingCatalog.value = false
  }
}

const togglePickToy = (id: number) => {
  if (selectedToyIds.value.includes(id)) {
    selectedToyIds.value = selectedToyIds.value.filter(i => i !== id)
  } else if (selectedToyIds.value.length < toysLimit.value) {
    selectedToyIds.value.push(id)
  }
}

const saveModifiedSet = async () => {
  if (!activeSubscriptionId.value) return
  isSavingSet.value = true
  modifyError.value = ''
  try {
    await modifySetToys(activeSubscriptionId.value, selectedToyIds.value)
    await loadNextSet(activeSubscriptionId.value)
    isModifyModalOpen.value = false
  } catch (e: any) {
    modifyError.value = e?.data?.message || 'Не удалось сохранить комплект'
  } finally {
    isSavingSet.value = false
  }
}

const currentToys = ref<ToyItem[]>([])

const openToyDetail = (toy: ToyItem) => {
  selectedToy.value = toy
}

const handleExchangeRequest = async () => {
  if (!activeSubscriptionId.value) {
    toastError('Подписка не найдена', 'Активная подписка не найдена')
    return
  }
  if (currentSetStatus.value === 'returning') {
    toastError('Обмен уже запрошен', 'Запрос на обмен уже принят. Курьер заберёт текущий набор.')
    return
  }
  if (!['in_use', 'delivering'].includes(currentSetStatus.value)) {
    toastError('Обмен недоступен', 'Обмен доступен, когда набор уже у вас дома.')
    return
  }

  isRequestingExchange.value = true
  try {
    const res = await requestExchange(activeSubscriptionId.value)
    currentSetStatus.value = 'returning'
    exchangeInfoText.value = 'Запрос на обмен принят — курьер заберёт набор'
    toastSuccess('Запрос принят', res.message || 'Запрос на обмен принят!')
  } catch (e: any) {
    toastError('Не удалось отправить', e?.data?.message || e?.message || 'Не удалось отправить запрос на обмен')
  } finally {
    isRequestingExchange.value = false
  }
}
</script>

<style scoped>
.my-kit-page {
  min-height: 100vh;
  background-color: #F7F3EA;
  color: #27312B;
  font-family: 'Onest', sans-serif;
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
.kit-header-section {
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
  color: #496B5A;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.kit-main-title {
  font-family: 'Onest', sans-serif;
  font-weight: 800;
  font-size: 36px;
  color: #27312B;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.kit-subtitle {
  font-size: 15px;
  color: #737B75;
  margin-bottom: 12px;
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
  background: #496B5A;
  display: inline-block;
}

.yellow-star {
  color: #D8B56A;
  font-size: 14px;
}

/* Blobs in header right */
.blob-container {
  position: relative;
  width: 140px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.blob {
  position: absolute;
  border-radius: 50%;
}

.blob-blue {
  width: 110px;
  height: 85px;
  background: #E4F2FF;
  top: 0;
  right: 0;
  border-radius: 60% 40% 70% 30% / 50% 60% 40% 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.blob-star {
  color: #FF8A7A;
  font-size: 20px;
  position: absolute;
  top: 15px;
  right: 35px;
}

.blob-yellow {
  width: 44px;
  height: 44px;
  background: #FFF1C5;
  top: -12px;
  right: 25px;
  border-radius: 50%;
  opacity: 0.85;
}

.count-pill {
  position: relative;
  z-index: 2;
  background: #E7EFE9;
  color: #6F927C;
  font-size: 12px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 20px;
  top: -15px;
  right: 60px;
  white-space: nowrap;
}

/* Toys Grid */
.toys-grid-section {
  margin-bottom: 40px;
}

.toys-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 22px;
}

.toy-item-card {
  background: #FFFDF8;
  border-radius: 24px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  padding: 16px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toy-item-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 32px rgba(51, 61, 54, 0.08);
  border-color: rgba(51, 61, 54, 0.2);
}

.toy-card-img-wrap {
  background: #F4F8FC;
  border-radius: 18px;
  height: 190px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 16px;
}

.toy-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.toy-item-card:hover .toy-img {
  transform: scale(1.04);
}

.toy-card-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.skill-pill {
  align-self: flex-start;
  background: #EFEBFF;
  color: #496B5A;
  font-size: 11.5px;
  font-weight: 700;
  padding: 5px 14px;
  border-radius: 12px;
  margin-bottom: 10px;
}

.toy-age {
  font-size: 12.5px;
  color: #8C8CA2;
  margin-bottom: 4px;
}

.toy-name {
  font-family: 'Onest', sans-serif;
  font-weight: 800;
  font-size: 17px;
  color: #27312B;
  margin-bottom: 8px;
  line-height: 1.3;
}

.toy-condition {
  font-size: 13px;
  margin-bottom: 18px;
}

.cond-label {
  color: #737B75;
}

.cond-val {
  color: #6F927C;
  font-weight: 700;
}

.details-btn {
  margin-top: auto;
  background: transparent;
  border: none;
  color: #496B5A;
  font-family: 'Onest', sans-serif;
  font-weight: 700;
  font-size: 14px;
  text-align: center;
  padding: 8px 0;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
}

.details-btn:hover {
  background: rgba(51, 61, 54, 0.08);
}

/* Exchange Banner Card */
.exchange-banner-card {
  position: relative;
  background: #FFFDF8;
  border-radius: 24px;
  padding: 36px 44px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
}

.banner-content {
  max-width: 620px;
  z-index: 2;
}

.banner-title {
  font-family: 'Onest', sans-serif;
  font-weight: 800;
  font-size: 24px;
  color: #27312B;
  margin-bottom: 6px;
}

.banner-subtitle {
  font-size: 14.5px;
  color: #737B75;
  margin-bottom: 22px;
}

.banner-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.exchange-primary-btn {
  background: #496B5A;
  color: #FFFDF8;
  border: none;
  font-family: 'Onest', sans-serif;
  font-weight: 700;
  font-size: 14.5px;
  padding: 13px 26px;
  border-radius: 14px;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(51, 61, 54, 0.3);
  transition: all 0.2s ease;
}

.exchange-primary-btn:hover {
  background: #385446;
  transform: translateY(-1px);
}

.exchange-info-text {
  font-size: 14px;
  color: #737B75;
  font-weight: 500;
}

/* Banner Right Decor */
.banner-decor {
  position: relative;
  width: 140px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-star {
  color: #496B5A;
  font-size: 26px;
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 2;
}

.mint-blob {
  position: absolute;
  width: 80px;
  height: 45px;
  background: #D9F7EC;
  border-radius: 50%;
  bottom: 0;
  right: 20px;
  opacity: 0.8;
}

.yellow-blob {
  position: absolute;
  width: 32px;
  height: 32px;
  background: #FFE8A3;
  border-radius: 50%;
  bottom: -4px;
  right: 4px;
  opacity: 0.85;
}

.decor-small-star {
  position: absolute;
  color: #B4EDDB;
  font-size: 16px;
  bottom: -6px;
  right: -15px;
}

/* Responsive */
@media (max-width: 1100px) {
  .toys-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .toys-grid {
    grid-template-columns: 1fr;
  }
  
  .exchange-banner-card {
    padding: 24px;
  }

  .banner-decor {
    display: none;
  }
}

.next-set-section {
  background: #fff;
  border-radius: 24px;
  padding: 28px 32px;
  margin-bottom: 28px;
  border: 1px solid rgba(51, 61, 54, 0.15);
}

.next-set-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.next-set-title {
  font-family: 'Onest', sans-serif;
  font-size: 22px;
  font-weight: 800;
  margin: 6px 0;
}

.modify-set-btn {
  background: #496B5A;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 26, 46, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modify-modal-card {
  background: #fff;
  border-radius: 24px;
  padding: 28px;
  max-width: 720px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
}

.catalog-picker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin: 16px 0;
}

.pick-toy-card {
  border: 2px solid #E6DFD4;
  border-radius: 14px;
  padding: 8px;
  background: #fff;
  cursor: pointer;
  text-align: center;
  font-size: 12px;
}

.pick-toy-card.selected {
  border-color: #496B5A;
  background: #E7EFE9;
}

.pick-toy-card img {
  width: 100%;
  height: 80px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 6px;
}
</style>
