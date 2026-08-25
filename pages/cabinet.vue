<template>
  <div class="my-kit-page">
    <TheHeader />

    <main class="container page-content">
      <!-- Section Header -->
      <section class="kit-header-section">
        <div class="header-left">
          <span class="section-badge">ЧТО СЕЙЧАС ДОМА</span>
          <h1 class="kit-main-title">Мой текущий набор</h1>
          <p class="kit-subtitle">
            Игрушки подобраны по индивидуальному плану развития для {{ activeChildName }}, {{ activeChildAge }}.
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

      <!-- Exchange Banner Card -->
      <section class="exchange-banner-card">
        <div class="banner-content">
          <h2 class="banner-title">Хотите новый набор?</h2>
          <p class="banner-subtitle">Мы подготовим новую подборку, когда подойдёт время обмена.</p>

          <div class="banner-actions">
            <button class="exchange-primary-btn" @click="handleExchangeRequest">
              Запросить обмен наборов
            </button>
            <span class="exchange-info-text">Доступно через 12 дней</span>
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

    <!-- Toy Detail Modal -->
    <ToyDetailModal 
      :toy="selectedToy" 
      @close="selectedToy = null" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TheHeader from '~/components/TheHeader.vue'
import ToyDetailModal from '~/components/ToyDetailModal.vue'

interface ToyItem {
  id: number
  title: string
  skill: string
  age: string
  condition: string
  image: string
  description?: string
}

const activeChildName = ref('Миши')
const activeChildAge = ref('2.5 года')
const selectedToy = ref<ToyItem | null>(null)

const currentToys = ref<ToyItem[]>([
  {
    id: 1,
    title: 'Сортер Радужная Башня',
    skill: 'Мелкая моторика',
    age: '1.5–3 года',
    condition: 'Отличное',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80',
    description: 'Многоуровневый сортер из массива бука с безопасным экологичным покрытием. Развивает точность движений, пространственную координацию и понимание форм.'
  },
  {
    id: 2,
    title: 'Сенсорные Кубики',
    skill: 'Осязание',
    age: '1–2 года',
    condition: 'Отличное',
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80',
    description: 'Набор кубиков с различными фактурами, зеркальными гранями и звуковыми элементами для тактильного и сенсорного познания мира.'
  },
  {
    id: 3,
    title: 'Деревянные Весы',
    skill: 'Баланс & Логика',
    age: '2–4 года',
    condition: 'Отличное',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80',
    description: 'Классические чашечные весы с комплектом гирек разного веса. Знакомят ребенка с концепцией равновесия, тяжести и основами сравнения.'
  },
  {
    id: 4,
    title: 'Стучалка Весёлые Гвоздики',
    skill: 'Координация',
    age: '1.5–3 года',
    condition: 'Отличное',
    image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=600&q=80',
    description: 'Увлекательная игра с деревянным молоточком и разноцветными колышками. Отлично снимает мышечное напряжение и тренирует силу и точность удара.'
  }
])

const openToyDetail = (toy: ToyItem) => {
  selectedToy.value = toy
}

const handleExchangeRequest = () => {
  alert('Запрос на обмен набора принят! Наш методист подготовит новую персональную подборку игрушек для следующего возрастного этапа.')
}
</script>

<style scoped>
.my-kit-page {
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
  color: #7C5CFC;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.kit-main-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 36px;
  color: #1A1A2E;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.kit-subtitle {
  font-size: 15px;
  color: #7B7B93;
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
  background: #7C5CFC;
  display: inline-block;
}

.yellow-star {
  color: #FFD166;
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
  background: #E8FAF4;
  color: #06D6A0;
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
  background: #FFFFFF;
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
  box-shadow: 0 16px 32px rgba(124, 92, 252, 0.08);
  border-color: rgba(124, 92, 252, 0.2);
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
  color: #7C5CFC;
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
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 17px;
  color: #1A1A2E;
  margin-bottom: 8px;
  line-height: 1.3;
}

.toy-condition {
  font-size: 13px;
  margin-bottom: 18px;
}

.cond-label {
  color: #7B7B93;
}

.cond-val {
  color: #06D6A0;
  font-weight: 700;
}

.details-btn {
  margin-top: auto;
  background: transparent;
  border: none;
  color: #7C5CFC;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 14px;
  text-align: center;
  padding: 8px 0;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
}

.details-btn:hover {
  background: rgba(124, 92, 252, 0.08);
}

/* Exchange Banner Card */
.exchange-banner-card {
  position: relative;
  background: #FFFFFF;
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
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 24px;
  color: #1A1A2E;
  margin-bottom: 6px;
}

.banner-subtitle {
  font-size: 14.5px;
  color: #7B7B93;
  margin-bottom: 22px;
}

.banner-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.exchange-primary-btn {
  background: #624CE0;
  color: #FFFFFF;
  border: none;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 14.5px;
  padding: 13px 26px;
  border-radius: 14px;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(98, 76, 224, 0.3);
  transition: all 0.2s ease;
}

.exchange-primary-btn:hover {
  background: #513bc7;
  transform: translateY(-1px);
}

.exchange-info-text {
  font-size: 14px;
  color: #7B7B93;
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
  color: #7C5CFC;
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
</style>
