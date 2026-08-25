<template>
  <div class="history-page">
    <TheHeader />

    <main class="container page-content">
      <!-- Section Header -->
      <section class="history-header-section">
        <div class="header-left">
          <span class="section-badge">ВАШИ ПРОШЛЫЕ НАБОРЫ</span>
          <h1 class="history-main-title">История игрушек</h1>
          <p class="history-subtitle">
            Все игрушки, в которые играл Миша. Любимые можно выкупить со скидкой.
          </p>

          <!-- Dot & star decor -->
          <div class="decor-row">
            <span class="purple-dot"></span>
            <span class="yellow-star">★</span>
          </div>
        </div>

        <div class="header-right">
          <!-- Playful Pastel Blobs & Shape -->
          <div class="blob-container">
            <div class="blob blob-blue">
              <span class="blob-star">★</span>
            </div>
            <div class="blob blob-yellow"></div>
            <div class="blob blob-mint"></div>
            <div class="shape-pill-purple"></div>
          </div>
        </div>
      </section>

      <!-- Sets Timeline -->
      <div class="sets-timeline">
        <!-- SET 1: Младенчество -->
        <section class="set-section">
          <div class="set-header">
            <h2 class="set-title">Комплект «Младенчество»</h2>
            <p class="set-date">Март — Май 2026</p>
          </div>

          <div class="set-toys-grid">
            <!-- Toy 1 -->
            <div class="history-toy-card">
              <div class="toy-img-box">
                <img 
                  src="https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=400&q=80" 
                  alt="Сенсорный кубик" 
                  class="toy-thumb" 
                />
              </div>

              <div class="toy-info-box">
                <h3 class="toy-name">Сенсорный кубик с колокольчиком</h3>
                <span class="favorite-badge">Любимая игрушка</span>
                <button class="buy-btn" @click="handleBuy('Сенсорный кубик с колокольчиком', '2 900 ₸')">
                  Купить
                </button>
              </div>
            </div>

            <!-- Toy 2 -->
            <div class="history-toy-card">
              <div class="toy-img-box">
                <img 
                  src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80" 
                  alt="Радужные погремушки" 
                  class="toy-thumb" 
                />
              </div>

              <div class="toy-info-box">
                <h3 class="toy-name">Радужные погремушки</h3>
                <span class="favorite-badge">Любимая игрушка</span>
                <button class="buy-btn" @click="handleBuy('Радужные погремушки', '3 200 ₸')">
                  Купить
                </button>
              </div>

              <!-- Card Right Decor Icon -->
              <div class="card-decor-circle">
                <span class="dc-dot d1"></span>
                <span class="dc-dot d2"></span>
              </div>
            </div>
          </div>
        </section>

        <!-- SET 2: Ранние Шаги -->
        <section class="set-section">
          <div class="set-header">
            <h2 class="set-title">Комплект «Ранние Шаги»</h2>
            <p class="set-date">Январь — Март 2026</p>
          </div>

          <div class="set-toys-grid">
            <!-- Toy 3 -->
            <div class="history-toy-card">
              <div class="toy-img-box">
                <img 
                  src="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=400&q=80" 
                  alt="Бизиборд Альфа куб" 
                  class="toy-thumb" 
                />
              </div>

              <div class="toy-info-box">
                <h3 class="toy-name">Бизиборд Альфа куб</h3>
                <span class="favorite-badge">Любимая игрушка</span>
                <button class="buy-btn" @click="handleBuy('Бизиборд Альфа куб', '4 500 ₸')">
                  Купить
                </button>
              </div>
            </div>

            <!-- Toy 4 -->
            <div class="history-toy-card">
              <div class="toy-img-box">
                <img 
                  src="https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=400&q=80" 
                  alt="Паровозик-Геометрия" 
                  class="toy-thumb" 
                />
              </div>

              <div class="toy-info-box">
                <h3 class="toy-name">Паровозик-Геометрия</h3>
                <span class="favorite-badge">Любимая игрушка</span>
                <button class="buy-btn" @click="handleBuy('Паровозик-Геометрия', '2 800 ₸')">
                  Купить
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Bottom Row: Left Decor Card & Right Decor Blobs -->
      <section class="history-bottom-row">
        <!-- Bottom Left Character Card -->
        <div class="bottom-char-card">
          <div class="char-box coral-char">
            <span class="ch-eye left"></span>
            <span class="ch-eye right"></span>
            <span class="ch-mouth"></span>
          </div>

          <div class="char-box bear-char">
            <span class="b-ear l"></span>
            <span class="b-ear r"></span>
            <span class="b-eye l"></span>
            <span class="b-eye r"></span>
            <span class="b-nose"></span>
          </div>

          <div class="char-box mint-char">
            <span class="ch-eye left"></span>
            <span class="ch-eye right"></span>
            <span class="ch-mouth smile"></span>
            <span class="char-star">★</span>
          </div>
        </div>

        <!-- Bottom Right Vertical Decor -->
        <div class="bottom-right-decor">
          <div class="vertical-coral-bar">
            <span class="bar-star">★</span>
          </div>
          <div class="decor-blob mint-blob"></div>
          <div class="decor-blob yellow-blob"></div>
          <span class="decor-small-star">★</span>
        </div>
      </section>
    </main>

    <!-- Buyout Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="selectedBuyToy" class="modal-overlay" @click.self="selectedBuyToy = null">
          <div class="buy-modal">
            <button class="close-btn" @click="selectedBuyToy = null">&times;</button>
            <h2 class="modal-title">Выкуп игрушки со скидкой 🎁</h2>
            <p class="modal-desc">
              Как подписчик Alpha, вы получаете специальную цену на любимую игрушку вашего малыша.
            </p>

            <div class="buy-details-card">
              <h3>{{ selectedBuyToy.name }}</h3>
              <div class="price-row">
                <span class="special-price">{{ selectedBuyToy.price }}</span>
                <span class="old-price">6 900 ₸</span>
                <span class="discount-badge">-58%</span>
              </div>
            </div>

            <div class="modal-actions">
              <button class="cancel-btn" @click="selectedBuyToy = null">Позже</button>
              <button class="confirm-btn" @click="confirmBuy">Добавить в корзину</button>
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

const { addItem } = useCart()

const selectedBuyToy = ref<{ name: string; price: string; image?: string } | null>(null)

const handleBuy = (name: string, price: string) => {
  selectedBuyToy.value = { 
    name, 
    price,
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=400&q=80'
  }
}

const confirmBuy = () => {
  if (selectedBuyToy.value) {
    addItem({
      id: `history-${Date.now()}`,
      title: selectedBuyToy.value.name,
      price: selectedBuyToy.value.price,
      image: selectedBuyToy.value.image || 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=400&q=80'
    })
    alert(`Игрушка «${selectedBuyToy.value.name}» добавлена в корзину по специальной цене!`)
    selectedBuyToy.value = null
  }
}
</script>

<style scoped>
.history-page {
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
.history-header-section {
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

.history-main-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 36px;
  color: #1A1A2E;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.history-subtitle {
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

/* Header Right Blobs */
.blob-container {
  position: relative;
  width: 160px;
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
  width: 90px;
  height: 75px;
  background: #E4F2FF;
  top: 0;
  right: 50px;
  border-radius: 60% 40% 70% 30% / 50% 60% 40% 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.blob-star {
  color: #FF8A7A;
  font-size: 18px;
  position: absolute;
  top: 12px;
  right: 18px;
}

.blob-yellow {
  width: 44px;
  height: 44px;
  background: #FFF1C5;
  top: -12px;
  right: 65px;
  opacity: 0.85;
}

.blob-mint {
  width: 70px;
  height: 60px;
  background: #D9F7EC;
  top: 25px;
  right: 25px;
  border-radius: 40% 60% 50% 50%;
  opacity: 0.85;
}

.shape-pill-purple {
  position: absolute;
  width: 24px;
  height: 80px;
  background: #7C5CFC;
  border-radius: 20px;
  top: 40px;
  right: 0;
}

/* Sets Timeline */
.sets-timeline {
  display: flex;
  flex-direction: column;
  gap: 36px;
  margin-bottom: 48px;
}

.set-header {
  margin-bottom: 16px;
}

.set-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 22px;
  color: #1A1A2E;
  margin-bottom: 2px;
}

.set-date {
  font-size: 13.5px;
  color: #7B7B93;
}

.set-toys-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.history-toy-card {
  background: #FFFFFF;
  border-radius: 24px;
  padding: 20px 24px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.history-toy-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 28px rgba(124, 92, 252, 0.08);
}

.toy-img-box {
  width: 110px;
  height: 105px;
  background: #F8FAFC;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.toy-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.toy-info-box {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
}

.toy-name {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 16.5px;
  color: #1A1A2E;
  margin-bottom: 6px;
  line-height: 1.3;
}

.favorite-badge {
  display: inline-block;
  background: #EFEBFF;
  color: #7C5CFC;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 12px;
  margin-bottom: 12px;
}

.buy-btn {
  background: #624CE0;
  color: #FFFFFF;
  border: none;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 13.5px;
  padding: 8px 24px;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(98, 76, 224, 0.25);
  transition: all 0.2s ease;
}

.buy-btn:hover {
  background: #513bc7;
  transform: translateY(-1px);
}

/* Card Decor Icon */
.card-decor-circle {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: #E4F2FF;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-shrink: 0;
}

.dc-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #FF8A7A;
}
.dc-dot.d2 {
  margin-top: 6px;
}

/* Bottom Row */
.history-bottom-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 20px;
}

.bottom-char-card {
  background: #FFFFFF;
  border-radius: 20px;
  padding: 20px 28px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  display: flex;
  align-items: center;
  gap: 16px;
}

.char-box {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.coral-char {
  width: 52px;
  height: 48px;
  background: #FF8A7A;
  border-radius: 14px;
}

.ch-eye {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #FFFFFF;
  top: 16px;
}
.ch-eye.left { left: 14px; }
.ch-eye.right { right: 14px; }

.ch-mouth {
  position: absolute;
  width: 14px;
  height: 3px;
  background: #FFFFFF;
  border-radius: 2px;
  bottom: 14px;
}
.ch-mouth.smile {
  border-radius: 0 0 6px 6px;
  height: 4px;
}

.bear-char {
  width: 48px;
  height: 38px;
  background: #FFDCC8;
  border-radius: 20px;
}

.b-ear {
  position: absolute;
  width: 16px;
  height: 16px;
  background: #FFDCC8;
  border-radius: 50%;
  top: -6px;
}
.b-ear.l { left: 2px; }
.b-ear.r { right: 2px; }

.b-eye {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #3B2A1E;
  border-radius: 50%;
  top: 14px;
}
.b-eye.l { left: 14px; }
.b-eye.r { right: 14px; }

.b-nose {
  position: absolute;
  width: 6px;
  height: 5px;
  background: #E87A5D;
  border-radius: 50%;
  top: 20px;
  left: 21px;
}

.mint-char {
  width: 48px;
  height: 52px;
  background: #C6F6E5;
  border-radius: 16px;
}

.mint-char .ch-eye {
  background: #06D6A0;
  top: 16px;
}
.mint-char .ch-eye.left { left: 12px; }
.mint-char .ch-eye.right { right: 12px; }

.mint-char .ch-mouth {
  background: #06D6A0;
  bottom: 16px;
}

.char-star {
  position: absolute;
  top: -14px;
  right: -6px;
  color: #FFE8A3;
  font-size: 16px;
}

/* Bottom Right Decor */
.bottom-right-decor {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vertical-coral-bar {
  position: absolute;
  width: 18px;
  height: 120px;
  background: #FF8A7A;
  border-radius: 12px;
  right: 25px;
  bottom: 0;
  display: flex;
  justify-content: center;
}

.bar-star {
  color: #7C5CFC;
  font-size: 18px;
  margin-top: 16px;
}

.mint-blob {
  position: absolute;
  width: 65px;
  height: 40px;
  background: #D9F7EC;
  border-radius: 50%;
  bottom: 30px;
  right: 35px;
  opacity: 0.85;
}

.yellow-blob {
  position: absolute;
  width: 28px;
  height: 28px;
  background: #FFE8A3;
  border-radius: 50%;
  bottom: 22px;
  right: 20px;
  opacity: 0.85;
}

.decor-small-star {
  position: absolute;
  color: #B4EDDB;
  font-size: 16px;
  bottom: 12px;
  right: 0;
}

/* Modal */
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

.buy-modal {
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

.buy-details-card {
  background: #F8F8FC;
  border: 1px solid #ECECF4;
  border-radius: 16px;
  padding: 16px 20px;
  margin-bottom: 24px;
}

.buy-details-card h3 {
  font-family: 'Outfit', sans-serif;
  font-size: 17px;
  font-weight: 800;
  color: #1A1A2E;
  margin-bottom: 8px;
}

.price-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.special-price {
  font-family: 'Outfit', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #7C5CFC;
}

.old-price {
  font-size: 14px;
  color: #A0A0B8;
  text-decoration: line-through;
}

.discount-badge {
  background: #FFD166;
  color: #1A1A2E;
  font-size: 11.5px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 8px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  background: #F4F4F8;
  border: none;
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

.confirm-btn {
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
  .set-toys-grid {
    grid-template-columns: 1fr;
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
