<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="toy" class="modal-overlay" @click.self="$emit('close')">
        <div class="toy-modal">
          <button class="close-btn" @click="$emit('close')" aria-label="Закрыть">&times;</button>
          
          <div class="modal-grid">
            <div class="toy-img-wrap">
              <img :src="toy.image" :alt="toy.title" class="toy-modal-img" />
              <span class="toy-age-pill">{{ toy.age }}</span>
            </div>

            <div class="toy-modal-info">
              <div class="badge-row">
                <span class="skill-badge">{{ toy.skill }}</span>
                <span class="condition-badge">● {{ toy.condition || 'Состояние: Отличное' }}</span>
              </div>

              <h2 class="toy-modal-title">{{ toy.title }}</h2>
              <p class="toy-modal-desc">{{ toy.description || 'Сертифицированная развивающая игрушка из натурального дерева и гипоаллергенных материалов. Прошла многоступенчатую эко-стерилизацию.' }}</p>

              <div class="benefits-block">
                <h4 class="benefits-heading"><AppIcon name="brain" :size="18" class="block-heading-icon" /> Что развивает:</h4>
                <ul>
                  <li>Пинцетный захват и координацию движений</li>
                  <li>Пространственное и логическое мышление</li>
                  <li>Концентрацию внимания и усидчивость</li>
                </ul>
              </div>

              <div class="tips-block">
                <h4 class="tips-heading"><AppIcon name="lightbulb" :size="18" class="block-heading-icon" /> Совет методиста Alpha:</h4>
                <p>Предложите малышу изучить цвета и формы, не подсказывая сразу правильное решение. Дайте ребенку возможность исследовать игрушку самостоятельно.</p>
              </div>

              <button class="primary-btn" @click="$emit('close')">Понятно, спасибо!</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  toy: {
    id: number | string
    title: string
    skill: string
    age: string
    condition?: string
    image: string
    description?: string
  } | null
}>()

defineEmits<{
  (e: 'close'): void
}>()
</script>

<style scoped>
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

.toy-modal {
  position: relative;
  background: #FFFFFF;
  width: 100%;
  max-width: 680px;
  border-radius: 28px;
  box-shadow: 0 25px 60px rgba(26, 26, 46, 0.2);
  overflow: hidden;
  padding: 32px;
}

.close-btn {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #F4F4F8;
  color: #4A4A68;
  font-size: 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
}

.close-btn:hover {
  background: #E8E8EE;
  color: #1A1A2E;
}

.modal-grid {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 28px;
}

.toy-img-wrap {
  position: relative;
  background: #F8FAFC;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ECECF4;
}

.toy-modal-img {
  width: 100%;
  height: 220px;
  object-fit: contain;
}

.toy-age-pill {
  position: absolute;
  top: 12px;
  left: 12px;
  background: #FFFFFF;
  border: 1px solid #E2E2EC;
  color: #4A4A68;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 8px;
}

.toy-modal-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.badge-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.skill-badge {
  background: #EFEBFF;
  color: #7C5CFC;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 10px;
}

.condition-badge {
  color: #06D6A0;
  font-size: 12px;
  font-weight: 700;
}

.toy-modal-title {
  font-family: 'Outfit', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #1A1A2E;
}

.toy-modal-desc {
  font-size: 13.5px;
  color: #7B7B93;
  line-height: 1.45;
}

.benefits-block h4,
.tips-block h4 {
  font-size: 13px;
  font-weight: 700;
  color: #1A1A2E;
  margin-bottom: 4px;
}

.benefits-block ul {
  padding-left: 18px;
  font-size: 12.5px;
  color: #4A4A68;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tips-block {
  background: #FFF9E6;
  border-radius: 14px;
  padding: 12px 14px;
  border: 1px solid rgba(255, 209, 102, 0.4);
}

.tips-block p {
  font-size: 12px;
  color: #5A4A1E;
  line-height: 1.4;
}

.benefits-heading,
.tips-heading {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.block-heading-icon {
  flex-shrink: 0;
  color: #7C5CFC;
}

.tips-heading .block-heading-icon {
  color: #D4A017;
}

.primary-btn {
  background: #7C5CFC;
  color: #FFFFFF;
  border: none;
  font-weight: 700;
  font-size: 14px;
  padding: 12px;
  border-radius: 14px;
  cursor: pointer;
  margin-top: 6px;
  transition: all 0.2s ease;
}

.primary-btn:hover {
  background: #6848E0;
}

@media (max-width: 680px) {
  .modal-grid {
    grid-template-columns: 1fr;
  }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
