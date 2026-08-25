<template>
  <div class="faq-page">
    <TheHeader />

    <main class="container page-content">
      <!-- Hero -->
      <section class="faq-hero">
        <h1 class="faq-title">Часто задаваемые вопросы</h1>
        <p class="faq-subtitle">
          Всё, что вам нужно знать о сервисе обмена эко-игрушками, дезинфекции, доставке и управлении подпиской.
        </p>

        <!-- Live Search Bar -->
        <div class="faq-search-box">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C5CFC" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7"></circle>
            <line x1="21" y1="21" x2="16.5" y2="16.5"></line>
          </svg>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Поиск по вопросам (например, дезинфекция, поломка, обмен, заморозка)..." 
            class="faq-search-input"
          />
          <button v-if="searchQuery" class="clear-search-btn" @click="searchQuery = ''">&times;</button>
        </div>
      </section>

      <!-- Category Filter Pills -->
      <div class="faq-categories-row">
        <button 
          v-for="cat in categories" 
          :key="cat.id"
          class="cat-pill-btn"
          :class="{ active: activeCategory === cat.id }"
          @click="activeCategory = cat.id"
        >
          <span>{{ cat.icon }}</span>
          <span>{{ cat.name }}</span>
        </button>
      </div>

      <!-- FAQ Accordions List -->
      <section class="faq-accordion-section">
        <div v-if="filteredFaqs.length > 0" class="faq-accordion-list">
          <div 
            v-for="(item, idx) in filteredFaqs" 
            :key="idx" 
            class="faq-card"
            :class="{ open: openItems.includes(item.id) }"
          >
            <button class="faq-question-btn" @click="toggleFaq(item.id)">
              <div class="question-title-wrap">
                <span class="q-cat-tag">{{ getCategoryName(item.category) }}</span>
                <h3 class="q-text">{{ item.q }}</h3>
              </div>
              <div class="faq-icon-circle">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="chevron">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </button>
            <div v-show="openItems.includes(item.id)" class="faq-answer-body">
              <p>{{ item.a }}</p>
            </div>
          </div>
        </div>

        <div v-else class="empty-faq-box">
          <span class="empty-icon">🔍</span>
          <h3>Вопросов по запросу «{{ searchQuery }}» не найдено</h3>
          <p>Попробуйте изменить формулировку или задайте вопрос нашему методисту в чате.</p>
          <button class="reset-btn" @click="resetSearch">Показать все вопросы</button>
        </div>
      </section>

      <!-- Still Have Questions CTA Banner (Like Kiddos) -->
      <section class="still-questions-banner">
        <div class="cta-left">
          <div class="cta-icon-badge">💬</div>
          <div class="cta-text">
            <h3>Остались вопросы или нужна консультация?</h3>
            <p>Наш ведущий методист и служба заботы всегда рады помочь подобрать идеальный набор для вашего ребенка.</p>
          </div>
        </div>
        <div class="cta-actions">
          <NuxtLink to="/support" class="cta-btn primary">
            Написать методисту в чат →
          </NuxtLink>
          <a href="https://wa.me/77071234567" target="_blank" class="cta-btn whatsapp">
            WhatsApp онлайн
          </a>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TheHeader from '~/components/TheHeader.vue'

const searchQuery = ref('')
const activeCategory = ref('all')
const openItems = ref<number[]>([1, 4])

const categories = [
  { id: 'all', name: 'Все вопросы', icon: '✨' },
  { id: 'how', name: 'Как это работает', icon: '🧩' },
  { id: 'pricing', name: 'Тарифы и оплата', icon: '💳' },
  { id: 'hygiene', name: 'Дезинфекция и безопасность', icon: '🧼' },
  { id: 'delivery', name: 'Доставка и обмен', icon: '🚚' },
  { id: 'manage', name: 'Управление подпиской', icon: '⚙️' },
]

const allFaqs = [
  {
    id: 1,
    category: 'how',
    q: 'Что такое сервис Alpha и как работает подписка на игрушки?',
    a: 'Alpha — это сервис регулярного обмена развивающими эко-игрушками Монтессори. Вы оформляете подписку и получаете коробку с качественными деревянными игрушками на 1 месяц. Когда ребенку надоест или придет время следующего этапа развития, курьер бесплатно привозит новый свежий набор и забирает предыдущий.'
  },
  {
    id: 2,
    category: 'how',
    q: 'Кто подбирает игрушки для ребенка?',
    a: 'Вы можете доверить подбор нашему дипломированному методисту Монтессори, который сформирует индивидуальный план развития под возраст и интересы вашего малыша, либо выбрать игрушки самостоятельно в каталоге магазина.'
  },
  {
    id: 3,
    category: 'how',
    q: 'Для какого возраста подходят ваши игрушки?',
    a: 'Наша коллекция рассчитана на детей от 0 до 6 лет: от первых тактильных эко-погремушек и прорезывателей до сложных геометрических балансиров, лабиринтов, замков-конструкторов и математических счетов.'
  },
  {
    id: 4,
    category: 'hygiene',
    q: 'Как проходит процесс дезинфекции и очистки игрушек?',
    a: 'Мы уделяем безопасности максимальное внимание. Все игрушки проходят 4-ступенчатый лабораторный протокол: 1) механическая очистка гипоаллергенными эко-средствами, 2) обработка сухим горячим паром под давлением (140°C), 3) озонирование в специальной камере, 4) запечатывание в стерильный хлопковый мешочек.'
  },
  {
    id: 5,
    category: 'hygiene',
    q: 'Что делать, если ребенок потерял или сломал деталь игрушки?',
    a: 'Не волнуйтесь! Мы понимаем, как играют дети. Мелкие потертости, царапины и случайная утеря 1–2 деталей полностью покрываются нашей страховкой. Никаких штрафов или оплат за случайные повреждения не предусмотрено.'
  },
  {
    id: 6,
    category: 'pricing',
    q: 'Как оплачивается подписка и есть ли скрытые платежи?',
    a: 'Оплата происходит автоматически раз в месяц (или за 6/12 месяцев со скидкой) через безопасный шлюз банковской картой или Kaspi QR. В стоимость тарифа уже включены все игрушки, доставка, забор, дезинфекция и страховка. Никаких скрытых платежей нет.'
  },
  {
    id: 7,
    category: 'pricing',
    q: 'Можно ли выкупить понравившуюся игрушку навсегда?',
    a: 'Да! Если малыш очень привязался к какой-то игрушке, вы можете выкупить ее в личную коллекцию навсегда со скидкой от 15% до 40% (в зависимости от вашего тарифа) прямо в личном кабинете.'
  },
  {
    id: 8,
    category: 'delivery',
    q: 'В какие города осуществляется доставка?',
    a: 'Курьерская доставка «до двери» работает по всему Алматы и Астане бесплатно. Также мы отправляем наборы курьерскими службами во все областные центры Казахстана (Шымкент, Караганда, Актобе и др.).'
  },
  {
    id: 9,
    category: 'delivery',
    q: 'Как происходит процедура обмена набора?',
    a: 'За 3 дня до даты обмена мы присылаем вам уведомление. Вы выбираете новый комплект в личном кабинете и удобный 3-часовой интервал доставки. Курьер привозит новый чистый бокс и в этот же момент забирает старый.'
  },
  {
    id: 10,
    category: 'manage',
    q: 'Можно ли заморозить или отменить подписку?',
    a: 'Да, подписка полностью гибкая. Если вы уезжаете в отпуск или гости, вы можете бесплатно заморозить подписку на срок до 60 дней в личном кабинете в один клик. Отменить подписку также можно в любой момент до даты следующего списания.'
  },
  {
    id: 11,
    category: 'manage',
    q: 'Можно ли использовать один тариф на двоих детей?',
    a: 'Да! В тарифе Max (8 игрушек) вы можете указать двоих детей разного возраста, и методист разделит набор по 4 развивающие игрушки для каждого ребенка.'
  }
]

const filteredFaqs = computed(() => {
  return allFaqs.filter(item => {
    const matchesCat = activeCategory.value === 'all' || item.category === activeCategory.value
    const query = searchQuery.value.toLowerCase().trim()
    const matchesSearch = !query || 
      item.q.toLowerCase().includes(query) || 
      item.a.toLowerCase().includes(query)
    return matchesCat && matchesSearch
  })
})

const toggleFaq = (id: number) => {
  if (openItems.value.includes(id)) {
    openItems.value = openItems.value.filter(i => i !== id)
  } else {
    openItems.value.push(id)
  }
}

const getCategoryName = (catId: string) => {
  return categories.find(c => c.id === catId)?.name || 'Общее'
}

const resetSearch = () => {
  searchQuery.value = ''
  activeCategory.value = 'all'
}
</script>

<style scoped>
.faq-page {
  min-height: 100vh;
  background-color: #FFF8F0;
  color: #1A1A2E;
  font-family: 'DM Sans', sans-serif;
  padding-bottom: 90px;
}

.container {
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-content {
  padding-top: 36px;
}

/* Hero */
.faq-hero {
  text-align: center;
  max-width: 760px;
  margin: 0 auto 36px auto;
}

.faq-badge {
  display: inline-block;
  background: #F0EDFF;
  color: #7C5CFC;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 12px;
  letter-spacing: 1.2px;
  padding: 6px 16px;
  border-radius: 20px;
  margin-bottom: 16px;
}

.faq-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 40px;
  color: #1A1A2E;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

.faq-subtitle {
  font-size: 16px;
  color: #7B7B93;
  line-height: 1.6;
  margin-bottom: 28px;
}

/* Search Box */
.faq-search-box {
  position: relative;
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border: 1.5px solid #E2E2EC;
  border-radius: 50px;
  padding: 8px 20px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
}

.faq-search-box:focus-within {
  border-color: #7C5CFC;
  box-shadow: 0 6px 24px rgba(124, 92, 252, 0.15);
}

.search-icon {
  margin-right: 12px;
  flex-shrink: 0;
}

.faq-search-input {
  width: 100%;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14.5px;
  font-family: 'DM Sans', sans-serif;
  color: #1A1A2E;
}

.clear-search-btn {
  background: #F4F4F8;
  border: none;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4A4A68;
}

/* Categories Row */
.faq-categories-row {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 36px;
}

.cat-pill-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #FFFFFF;
  border: 1px solid #EAEAF2;
  padding: 8px 18px;
  border-radius: 50px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 13.5px;
  color: #7B7B93;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.01);
}

.cat-pill-btn:hover {
  border-color: #7C5CFC;
  color: #7C5CFC;
}

.cat-pill-btn.active {
  background: #624CE0;
  border-color: #624CE0;
  color: #FFFFFF;
  box-shadow: 0 4px 14px rgba(98, 76, 224, 0.25);
}

/* Accordion List */
.faq-accordion-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 56px;
}

.faq-card {
  background: #FFFFFF;
  border-radius: 22px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 3px 14px rgba(0, 0, 0, 0.015);
  overflow: hidden;
  transition: all 0.2s ease;
}

.faq-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.03);
}

.faq-card.open {
  border-color: rgba(124, 92, 252, 0.3);
  box-shadow: 0 8px 28px rgba(124, 92, 252, 0.06);
}

.faq-question-btn {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px 28px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
}

.question-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 16px;
}

.q-cat-tag {
  font-size: 11px;
  font-weight: 800;
  color: #7C5CFC;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.q-text {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 17px;
  color: #1A1A2E;
  line-height: 1.35;
}

.faq-icon-circle {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #F4F4F8;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1A1A2E;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.chevron {
  transition: transform 0.25s ease;
}

.faq-card.open .chevron {
  transform: rotate(180deg);
}

.faq-card.open .faq-icon-circle {
  background: #624CE0;
  color: #FFFFFF;
}

.faq-answer-body {
  padding: 0 28px 24px 28px;
  font-size: 14.5px;
  color: #7B7B93;
  line-height: 1.6;
}

/* Empty State */
.empty-faq-box {
  background: #FFFFFF;
  border-radius: 24px;
  padding: 56px 24px;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.04);
  margin-bottom: 56px;
}

.empty-icon {
  font-size: 40px;
  display: block;
  margin-bottom: 12px;
}

.reset-btn {
  margin-top: 16px;
  background: #7C5CFC;
  color: #FFFFFF;
  font-weight: 700;
  padding: 10px 24px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
}

/* Still Have Questions Banner */
.still-questions-banner {
  background: #FFFFFF;
  border-radius: 28px;
  padding: 36px 40px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.02);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}

.cta-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.cta-icon-badge {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: #F0EDFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  flex-shrink: 0;
}

.cta-text h3 {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 20px;
  margin-bottom: 4px;
}

.cta-text p {
  font-size: 14px;
  color: #7B7B93;
  line-height: 1.45;
}

.cta-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  padding: 12px 22px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.cta-btn.primary {
  background: #624CE0;
  color: #FFFFFF;
  box-shadow: 0 4px 14px rgba(98, 76, 224, 0.25);
}

.cta-btn.primary:hover {
  background: #513bc7;
}

.cta-btn.whatsapp {
  background: #E8FAF4;
  color: #058563;
}

.cta-btn.whatsapp:hover {
  background: #d4f7eb;
}

@media (max-width: 900px) {
  .still-questions-banner {
    flex-direction: column;
    text-align: center;
    padding: 32px 24px;
  }

  .cta-left {
    flex-direction: column;
  }

  .cta-actions {
    flex-direction: column;
    width: 100%;
  }

  .cta-btn {
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .faq-title {
    font-size: 28px;
  }

  .faq-search-box {
    padding: 6px 14px;
  }

  .faq-question-btn {
    padding: 16px 18px;
  }

  .q-text {
    font-size: 15px;
  }

  .faq-answer-body {
    padding: 0 18px 18px 18px;
    font-size: 13.5px;
  }

  .still-questions-banner {
    padding: 24px 16px;
    border-radius: 20px;
  }
}
</style>
