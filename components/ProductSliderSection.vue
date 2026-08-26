<template>
  <div class="product-slider-wrapper">
    <section class="product-slider-section container">
      <!-- Section Header -->
      <div class="slider-header-row">
        <div class="header-info">
          <div class="badge">🧸 КАТАЛОГ ЭКО-ИГРУШЕК</div>
          <h2 class="title">Популярные развивающие игрушки Alpha</h2>
          <p class="subtitle">
            Каждая игрушка изготовлена из натурального бука и ясеня, протестирована психологами и входит в сеты по подписке или доступна к покупке в собственность.
          </p>
        </div>

        <!-- Top Right Link to Shop -->
        <div class="header-right-action">
          <NuxtLink to="/shop" class="all-toys-link">
            <span>В магазин</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </NuxtLink>
        </div>
      </div>

      <!-- Carousel Container with SIDE ARROWS (ПО БОКАМ) -->
      <div class="slider-carousel-container">
        <!-- Side Arrow LEFT (По левому боку) -->
        <button 
          class="side-nav-arrow side-prev" 
          @click="scrollPrev" 
          :disabled="isAtStart"
          aria-label="Прокрутить влево"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 19 8 12 15 5"></polyline>
          </svg>
        </button>

        <!-- Slider Track -->
        <div 
          ref="sliderTrackRef" 
          class="slider-track"
          @scroll="handleScroll"
        >
          <div 
            v-for="toy in showcaseToys" 
            :key="toy.id" 
            class="toy-slider-card"
          >
            <!-- Toy Image Wrap -->
            <div class="card-img-wrap" @click="goToToy(toy)">
              <img :src="toy.image" :alt="toy.title" class="toy-card-img" />
              <span class="card-age-tag">{{ toy.age }}</span>
              <span class="card-eco-tag">🌿 Эко-бук</span>

              <!-- Favorite Heart Button -->
              <button 
                class="card-fav-btn" 
                :class="{ active: isFavorite(toy.id) }" 
                @click.stop="toggleFavorite({ id: toy.id, title: toy.title, price: toy.price, image: toy.image })"
                aria-label="В избранное"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" :fill="isFavorite(toy.id) ? '#FF5A5F' : 'none'" :stroke="isFavorite(toy.id) ? '#FF5A5F' : '#4A4A68'" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            </div>

            <!-- Card Content -->
            <div class="card-body">
              <div class="card-category-tag">{{ toy.category }}</div>
              <h3 class="toy-card-title" @click="goToToy(toy)">{{ toy.title }}</h3>
              
              <div class="toy-rating-row">
                <span class="rating-stars">★ {{ toy.rating }}</span>
                <span class="rating-dot">•</span>
                <span class="rating-count">{{ toy.reviewsCount }} отзывов</span>
              </div>

              <div class="toy-price-row">
                <div class="price-val">{{ formatPrice(toy.price) }} ₸</div>
                <span class="subscription-available-tag">В подписке</span>
              </div>

              <button 
                class="add-cart-btn" 
                :class="{ added: addedItems.includes(toy.id) }"
                @click="handleAddToCart(toy)"
              >
                <span v-if="addedItems.includes(toy.id)">Добавлено ✓</span>
                <span v-else>В корзину</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Side Arrow RIGHT (По правому боку) -->
        <button 
          class="side-nav-arrow side-next" 
          @click="scrollNext" 
          :disabled="isAtEnd"
          aria-label="Прокрутить вправо"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 5 16 12 9 19"></polyline>
          </svg>
        </button>
      </div>

      <!-- Mobile Footer Navigation Row -->
      <div class="slider-mobile-footer">
        <NuxtLink to="/shop" class="mobile-all-link">
          Смотреть весь каталог (20+ игрушек) ➔
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const { addItem } = useCart()
const { isFavorite, toggleFavorite } = useFavorites()
const router = useRouter()

const sliderTrackRef = ref<HTMLDivElement | null>(null)
const isAtStart = ref(true)
const isAtEnd = ref(false)
const addedItems = ref<number[]>([])

interface ShowcaseToy {
  id: number
  title: string
  category: string
  rating: string
  reviewsCount: number
  price: number
  age: string
  image: string
}

// 8 Top Montessori eco-toys with 100% working high-quality images
const showcaseToys: ShowcaseToy[] = [
  {
    id: 1,
    title: 'Балансир «Лунный Кот»',
    category: 'Мелкая моторика',
    rating: '4.9',
    reviewsCount: 38,
    price: 8900,
    age: '1–3 года',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 2,
    title: 'Пазл «Алфавит Монтессори»',
    category: 'Речь и коммуникация',
    rating: '4.8',
    reviewsCount: 42,
    price: 12500,
    age: '2–4 года',
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 6,
    title: 'Балансборд «Монтессори Дуга»',
    category: 'Крупная моторика',
    rating: '5.0',
    reviewsCount: 63,
    price: 16900,
    age: '2–5 лет',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 18,
    title: 'Развивающий бизиборд «Домик»',
    category: 'Методика Монтессори',
    rating: '5.0',
    reviewsCount: 92,
    price: 19800,
    age: '1–3 года',
    image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 4,
    title: 'Геометрический сортер «Эко-Радуга»',
    category: 'Сенсорное развитие',
    rating: '4.9',
    reviewsCount: 54,
    price: 9400,
    age: '1–2 года',
    image: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 7,
    title: 'Деревянная качалка-радуга',
    category: 'Крупная моторика',
    rating: '4.9',
    reviewsCount: 47,
    price: 24900,
    age: '1–4 года',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 16,
    title: 'Конструктор «Замок Монтессори»',
    category: 'Творчество и логика',
    rating: '5.0',
    reviewsCount: 84,
    price: 18900,
    age: '3–6 лет',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 9,
    title: 'Цилиндры Монтессори с блоками',
    category: 'Логика и мышление',
    rating: '4.8',
    reviewsCount: 36,
    price: 14500,
    age: '2–4 года',
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80'
  }
]

const formatPrice = (val: number) => {
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

const scrollPrev = () => {
  if (!sliderTrackRef.value) return
  sliderTrackRef.value.scrollBy({ left: -340, behavior: 'smooth' })
}

const scrollNext = () => {
  if (!sliderTrackRef.value) return
  sliderTrackRef.value.scrollBy({ left: 340, behavior: 'smooth' })
}

const handleScroll = () => {
  if (!sliderTrackRef.value) return
  const { scrollLeft, scrollWidth, clientWidth } = sliderTrackRef.value
  isAtStart.value = scrollLeft <= 10
  isAtEnd.value = scrollLeft + clientWidth >= scrollWidth - 10
}

const handleAddToCart = (toy: ShowcaseToy) => {
  addItem({
    id: toy.id,
    title: toy.title,
    price: toy.price,
    image: toy.image
  })
  if (!addedItems.value.includes(toy.id)) {
    addedItems.value.push(toy.id)
    setTimeout(() => {
      const idx = addedItems.value.indexOf(toy.id)
      if (idx > -1) addedItems.value.splice(idx, 1)
    }, 2200)
  }
}

const goToToy = (toy: ShowcaseToy) => {
  router.push(`/shop?search=${encodeURIComponent(toy.title)}`)
}

onMounted(() => {
  handleScroll()
})
</script>

<style scoped>
.product-slider-wrapper {
  width: 100%;
  background: #FFF8F0; /* Cream background, perfect between White Compare and Lavender HowItWorks */
  padding: 85px 0 95px;
  position: relative;
  overflow: hidden;
}

.product-slider-section {
  display: flex;
  flex-direction: column;
  gap: 36px;
  position: relative;
}

/* Header Row */
.slider-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 28px;
  padding: 0 4px;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 680px;
}

.badge {
  display: inline-flex;
  padding: 6px 16px;
  background: #EDE9FF;
  border-radius: 20px;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 12px;
  color: #7C5CFC;
  letter-spacing: 0.5px;
  align-self: flex-start;
}

.title {
  font-family: 'Outfit', sans-serif;
  font-size: 38px;
  font-weight: 800;
  line-height: 1.2;
  color: #1A1A2E;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 16px;
  line-height: 1.55;
  color: #4A4A68;
}

.header-right-action {
  flex-shrink: 0;
}

.all-toys-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #624CE0;
  color: #FFFFFF;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 14px;
  padding: 12px 22px;
  border-radius: 50px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(98, 76, 224, 0.25);
}

.all-toys-link:hover {
  background: #513bc7;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(98, 76, 224, 0.35);
}

/* CAROUSEL CONTAINER WITH SIDE ARROWS (ПО БОКАМ) */
.slider-carousel-container {
  position: relative;
  width: 100%;
}

/* Large Floating Side Arrows */
.side-nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #FFFFFF;
  border: 2px solid #EDE9FF;
  color: #624CE0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 20;
  box-shadow: 0 8px 24px rgba(98, 76, 224, 0.25), 0 2px 6px rgba(0, 0, 0, 0.04);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.side-nav-arrow:hover:not(:disabled) {
  background: #624CE0;
  color: #FFFFFF;
  border-color: #624CE0;
  transform: translateY(-50%) scale(1.12);
  box-shadow: 0 14px 32px rgba(98, 76, 224, 0.4);
}

.side-nav-arrow:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  transform: translateY(-50%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.side-prev {
  left: -28px;
}

.side-next {
  right: -28px;
}

/* Slider Track */
.slider-track {
  display: flex;
  gap: 24px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  padding: 12px 4px 20px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
}

.slider-track::-webkit-scrollbar {
  display: none; /* Chrome, Safari */
}

/* Toy Card */
.toy-slider-card {
  flex: 0 0 300px;
  scroll-snap-align: start;
  background: #FFFFFF;
  border-radius: 26px;
  overflow: hidden;
  border: 1px solid rgba(124, 92, 252, 0.1);
  box-shadow: 0 8px 24px rgba(98, 76, 224, 0.07);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.toy-slider-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 36px rgba(98, 76, 224, 0.14);
  border-color: rgba(98, 76, 224, 0.2);
}

/* Image Wrap */
.card-img-wrap {
  position: relative;
  width: 100%;
  height: 220px;
  background: #F3EFFF;
  overflow: hidden;
  cursor: pointer;
}

.toy-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}

.toy-slider-card:hover .toy-card-img {
  transform: scale(1.05);
}

.card-age-tag {
  position: absolute;
  top: 14px;
  left: 14px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  color: #1A1A2E;
  font-weight: 700;
  font-size: 11.5px;
  padding: 4px 10px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-eco-tag {
  position: absolute;
  bottom: 12px;
  left: 14px;
  background: rgba(232, 250, 244, 0.95);
  backdrop-filter: blur(8px);
  color: #058563;
  font-weight: 700;
  font-size: 11px;
  padding: 3px 9px;
  border-radius: 10px;
  border: 1px solid rgba(6, 214, 160, 0.2);
}

.card-fav-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
}

.card-fav-btn:hover {
  transform: scale(1.1);
  background: #FFFFFF;
}

.card-fav-btn.active {
  background: #FFF0F0;
}

/* Card Body */
.card-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-grow: 1;
}

.card-category-tag {
  font-size: 11.5px;
  font-weight: 700;
  color: #7C5CFC;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.toy-card-title {
  font-family: 'Outfit', sans-serif;
  font-size: 17px;
  font-weight: 800;
  color: #1A1A2E;
  line-height: 1.3;
  cursor: pointer;
  transition: color 0.2s ease;
  min-height: 44px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.toy-card-title:hover {
  color: #624CE0;
}

.toy-rating-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
}

.rating-stars {
  color: #FFB800;
  font-weight: 700;
}

.rating-dot {
  color: #C8C8DC;
}

.rating-count {
  color: #7B7B93;
}

.toy-price-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-top: 4px;
}

.price-val {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 20px;
  color: #1A1A2E;
}

.subscription-available-tag {
  font-size: 11px;
  font-weight: 700;
  color: #058563;
  background: #E8FAF4;
  padding: 3px 8px;
  border-radius: 8px;
}

.add-cart-btn {
  margin-top: 6px;
  width: 100%;
  padding: 11px;
  background: #F3EFFF;
  color: #624CE0;
  border-radius: 14px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 13.5px;
  transition: all 0.2s ease;
}

.add-cart-btn:hover {
  background: #624CE0;
  color: #FFFFFF;
  box-shadow: 0 4px 14px rgba(98, 76, 224, 0.25);
}

.add-cart-btn.added {
  background: #06D6A0;
  color: #FFFFFF;
  box-shadow: 0 4px 14px rgba(6, 214, 160, 0.3);
}

/* Mobile Footer */
.slider-mobile-footer {
  display: none;
}

/* Responsive */
@media (max-width: 1200px) {
  .side-prev {
    left: -12px;
  }
  .side-next {
    right: -12px;
  }
}

@media (max-width: 960px) {
  .product-slider-wrapper {
    padding: 60px 0 70px;
  }

  .slider-header-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .side-nav-arrow {
    width: 46px;
    height: 46px;
  }

  .side-prev {
    left: -6px;
  }

  .side-next {
    right: -6px;
  }

  .title {
    font-size: 28px;
  }
}

@media (max-width: 640px) {
  .toy-slider-card {
    flex: 0 0 260px;
  }

  .card-img-wrap {
    height: 190px;
  }

  .side-nav-arrow {
    width: 42px;
    height: 42px;
  }

  .side-prev {
    left: -4px;
  }

  .side-next {
    right: -4px;
  }

  .title {
    font-size: 24px;
  }

  .subtitle {
    font-size: 14.5px;
  }

  .slider-mobile-footer {
    display: flex;
    justify-content: center;
    padding-top: 10px;
  }

  .mobile-all-link {
    font-size: 13.5px;
    font-weight: 700;
    color: #624CE0;
  }
}
</style>
