<template>
  <div class="child-page">
    <TheHeader />

    <main class="container page-content">
      <!-- Section Header -->
      <section class="child-header-section">
        <div class="header-left">
          <span class="section-badge">РАЗВИВАЮЩАЯ КАРТА</span>
          <h1 class="child-main-title">Профиль ребёнка</h1>
          <p class="child-subtitle">
            Интересы, достижения и индивидуальные фокусы развития.
          </p>

          <!-- Dot & star decor -->
          <div class="decor-row">
            <span class="purple-dot"></span>
            <span class="yellow-star">★</span>
          </div>
        </div>

        <div class="header-right">
          <!-- Playful pastel illustration & Child Photo -->
          <div class="decor-shapes-wrap">
            <div class="shape ring-purple-orange"></div>
            <div class="shape bear-face">
              <span class="bear-ear left"></span>
              <span class="bear-ear right"></span>
              <span class="bear-eye left"></span>
              <span class="bear-eye right"></span>
              <span class="bear-nose"></span>
            </div>
            <div class="shape ring-pink-yellow"></div>
            
            <div class="child-photo-wrap">
              <img 
                src="https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&w=400&q=80" 
                alt="Миша" 
                class="child-photo" 
              />
              <span class="photo-star">★</span>
              <span class="photo-dot"></span>
            </div>
          </div>
        </div>
      </section>

      <!-- Main 2-Column Content -->
      <section class="child-grid-section">
        <!-- LEFT: Child Profile Card -->
        <div class="profile-card">
          <div class="avatar-badge">
            <span>{{ child.name.charAt(0) }}</span>
          </div>

          <h2 class="child-name-age">{{ child.name }}, {{ child.age }}</h2>
          <p class="child-birth-date">Дата рождения: {{ child.birthDate }}</p>

          <div class="interests-block">
            <h3 class="interests-title">Интересы и фокусы</h3>
            <div class="interests-tags">
              <span 
                v-for="interest in child.interests" 
                :key="interest" 
                class="interest-tag"
              >
                {{ interest }}
              </span>
            </div>
          </div>

          <button class="edit-profile-btn" @click="isEditModalOpen = true">
            Редактировать профиль
          </button>
        </div>

        <!-- RIGHT: Achievements Column -->
        <div class="achievements-col">
          <h2 class="achievements-heading">Достижения в развитии</h2>

          <div class="achievements-list">
            <!-- Achievement 1 -->
            <div class="achievement-card">
              <div class="achieve-left">
                <div class="achieve-icon-badge"></div>
                <div class="achieve-text">
                  <h4 class="achieve-title">Логика & Баланс</h4>
                  <span class="achieve-date">Июнь 2026</span>
                  <p class="achieve-desc">Миша научился сопоставлять 4 базовые формы на весах</p>
                </div>
              </div>

              <!-- Right face avatars decor -->
              <div class="achieve-faces">
                <div class="face-badge green-face">
                  <span class="f-eye l"></span>
                  <span class="f-eye r"></span>
                  <span class="f-mouth line"></span>
                </div>
                <div class="face-badge pink-face">
                  <span class="f-eye l"></span>
                  <span class="f-eye r"></span>
                  <span class="f-mouth line"></span>
                </div>
              </div>
            </div>

            <!-- Achievement 2 -->
            <div class="achievement-card">
              <div class="achieve-left">
                <div class="achieve-icon-badge"></div>
                <div class="achieve-text">
                  <h4 class="achieve-title">Тонкая моторика</h4>
                  <span class="achieve-date">Май 2026</span>
                  <p class="achieve-desc">Уверенно нанизывает кольца сортера по цветам</p>
                </div>
              </div>
            </div>

            <!-- Achievement 3 -->
            <div class="achievement-card">
              <div class="achieve-left">
                <div class="achieve-icon-badge"></div>
                <div class="achieve-text">
                  <h4 class="achieve-title">Интерес к музыке</h4>
                  <span class="achieve-date">Апрель 2026</span>
                  <p class="achieve-desc">Дольше удерживает внимание в ритмических играх</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Bottom Add Child Banner -->
      <section class="add-child-banner" @click="isAddModalOpen = true">
        <h2 class="add-child-title">Добавить ребенка</h2>

        <!-- Banner Right Decor -->
        <div class="add-child-decor">
          <span class="add-star">★</span>
          <div class="decor-blob mint-blob"></div>
          <div class="decor-blob yellow-blob"></div>
          <span class="decor-small-star">★</span>
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
              <label>Имя ребёнка</label>
              <input v-model="editForm.name" type="text" class="modal-input" />
            </div>

            <div class="form-group">
              <label>Возраст</label>
              <input v-model="editForm.age" type="text" class="modal-input" />
            </div>

            <div class="form-group">
              <label>Дата рождения</label>
              <input v-model="editForm.birthDate" type="text" class="modal-input" />
            </div>

            <div class="form-group">
              <label>Интересы и фокусы (через запятую)</label>
              <input v-model="editInterestsString" type="text" class="modal-input" />
            </div>

            <div class="modal-actions">
              <button class="cancel-btn" @click="isEditModalOpen = false">Отмена</button>
              <button class="save-btn" @click="saveProfile">Сохранить изменения</button>
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
            <h2 class="modal-title">Добавить второго ребёнка</h2>
            <p class="modal-desc">Для каждого ребенка мы формируем персональную программу развития.</p>

            <div class="form-group">
              <label>Имя ребёнка</label>
              <input v-model="newChild.name" type="text" placeholder="Например: София" class="modal-input" />
            </div>

            <div class="form-group">
              <label>Возраст</label>
              <input v-model="newChild.age" type="text" placeholder="Например: 1 год" class="modal-input" />
            </div>

            <div class="form-group">
              <label>Дата рождения</label>
              <input v-model="newChild.birthDate" type="text" placeholder="15 мая 2025" class="modal-input" />
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
import { ref } from 'vue'
import TheHeader from '~/components/TheHeader.vue'

interface ChildProfile {
  name: string
  age: string
  birthDate: string
  interests: string[]
}

const child = ref<ChildProfile>({
  name: 'Миша',
  age: '2.5 года',
  birthDate: '18 января, 2024',
  interests: ['Конструкторы', 'Пазлы', 'Весы', 'Мелкая моторика', 'Музыка']
})

const isEditModalOpen = ref(false)
const isAddModalOpen = ref(false)

const editForm = ref({
  name: child.value.name,
  age: child.value.age,
  birthDate: child.value.birthDate,
})
const editInterestsString = ref(child.value.interests.join(', '))

const newChild = ref({
  name: '',
  age: '',
  birthDate: '',
  interests: ['Монтессори', 'Сенсорика']
})

const saveProfile = () => {
  child.value.name = editForm.value.name
  child.value.age = editForm.value.age
  child.value.birthDate = editForm.value.birthDate
  child.value.interests = editInterestsString.value.split(',').map(s => s.trim()).filter(Boolean)
  isEditModalOpen.value = false
}

const addNewChild = () => {
  if (!newChild.value.name) return
  alert(`Профиль для ${newChild.value.name} успешно создан! Мы добавили индивидуальный подбор наборов.`)
  isAddModalOpen.value = false
}
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

.child-main-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 36px;
  color: #1A1A2E;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.child-subtitle {
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

/* 2-Column Section */
.child-grid-section {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 28px;
  margin-bottom: 36px;
}

/* Left Profile Card */
.profile-card {
  background: #F0EDFF;
  border-radius: 24px;
  padding: 36px 28px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border: 1px solid rgba(124, 92, 252, 0.12);
}

.avatar-badge {
  width: 38px;
  height: 38px;
  background: #FFF8F0;
  color: #7C5CFC;
  font-weight: 800;
  font-size: 15px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.child-name-age {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 26px;
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
