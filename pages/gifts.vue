<template>
  <div class="gift-page">
    <TheHeader />

    <main class="container page-content">
      <!-- HERO BANNER -->
      <section class="gift-hero">
        <div class="hero-content">
          <span class="hero-badge">
            <span class="badge-sparkle">✨</span> ПРАЗДНИЧНАЯ КОЛЛЕКЦИЯ NOMAD ALPHA
          </span>
          <h1 class="gift-title">Мир особенных подарков для счастливого детства</h1>
          <p class="gift-subtitle">
            Подарочные боксы из массива бука, авторские развивающие наборы Монтессори, 
            <strong>любые обычные игрушки в праздничной упаковке</strong> и подарочные сертификаты. 
            Каждый подарок бережно упакован с шелковой атласной лентой и именной открыткой.
          </p>

          <!-- Action CTA buttons -->
          <div class="hero-actions">
            <a href="#gift-finder" class="hero-btn primary-btn">
              <span>✨ Подобрать подарок</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </a>
            <button class="hero-btn regular-toy-btn" @click="handleCategorySelect('regular_toys')">
              <span>🧸 Подарить обычную игрушку</span>
            </button>
            <a href="#gift-catalog" class="hero-btn secondary-btn">
              <span>📦 Каталог боксов и наборов</span>
            </a>
            <a href="#gift-cert-section" class="hero-btn outline-btn">
              <span>🎟️ Подарить сертификат</span>
            </a>
          </div>
        </div>

        <!-- Value Propositions Grid -->
        <div class="value-props-grid">
          <div class="val-card">
            <div class="val-icon-box wood-icon">🌲</div>
            <div class="val-text">
              <h4>100% Эко-материалы</h4>
              <p>Натуральный бук, ясень, гипоаллергенные краски на водной основе.</p>
            </div>
          </div>

          <div class="val-card">
            <div class="val-icon-box ribbon-icon">🎀</div>
            <div class="val-text">
              <h4>Подарочная упаковка</h4>
              <p>Фирменный деревянный бокс или крафт-коробка с атласным бантом.</p>
            </div>
          </div>

          <div class="val-card">
            <div class="val-icon-box card-icon">💌</div>
            <div class="val-text">
              <h4>Именная открытка</h4>
              <p>Бесплатно напечатаем ваши душевные пожелания на открытке.</p>
            </div>
          </div>

          <div class="val-card">
            <div class="val-icon-box delivery-icon">🚚</div>
            <div class="val-text">
              <h4>Доставка-сюрприз</h4>
              <p>Вручим точно ко времени прямо в руки виновнику торжества.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- REGULAR TOYS GIFTING INFO CALLOUT -->
      <section class="gift-callout-banner">
        <div class="callout-icon">🧸</div>
        <div class="callout-content">
          <div class="callout-tag">НОВАЯ ВОЗМОЖНОСТЬ</div>
          <h3>Хотите подарить любую обычную игрушку из каталога?</h3>
          <p>
            Вы можете выбрать абсолютно любую развивающую игрушку — сортер, ксилофон, пирамидку или качалку — 
            и мы оформим её как праздничный подарок: в деревянном эко-боксе с шелковой лентой и бесплатной именной открыткой!
          </p>
        </div>
        <button class="callout-action-btn" @click="handleCategorySelect('regular_toys')">
          Смотреть обычные игрушки в подарок →
        </button>
      </section>

      <!-- SMART GIFT FINDER (ФУНКЦИЯ «ПОДОБРАТЬ ПОДАРОК») -->
      <section id="gift-finder" class="gift-finder-section">
        <div class="finder-header">
          <div class="finder-badge">
            <span>🎯 СМАРТ-ПОМОЩНИК</span>
          </div>
          <h2 class="finder-title">Функция «Подобрать подарок»</h2>
          <p class="finder-subtitle">
            Не знаете, чем порадовать ребенка? Укажите возраст малыша, повод, бюджет или формат подарка — 
            методисты Alpha мгновенно подберут безупречные варианты!
          </p>
        </div>

        <div class="finder-box-card">
          <!-- Step 1: Age Selector -->
          <div class="finder-filter-group">
            <div class="group-title-row">
              <span class="group-num">1</span>
              <label class="group-label">Возраст ребёнка: <strong class="highlight-val">{{ activeAgeLabel }}</strong></label>
            </div>
            <div class="finder-options-row">
              <button 
                v-for="ag in ageOptions" 
                :key="ag.id"
                class="finder-pill-btn"
                :class="{ active: selectedAge === ag.id }"
                @click="selectedAge = ag.id"
              >
                <span class="pill-icon">{{ ag.icon }}</span>
                <span class="pill-text">{{ ag.label }}</span>
                <span v-if="ag.desc" class="pill-sub">{{ ag.desc }}</span>
              </button>
            </div>
          </div>

          <!-- Step 2: Occasion Selector -->
          <div class="finder-filter-group">
            <div class="group-title-row">
              <span class="group-num">2</span>
              <label class="group-label">Повод для подарка: <strong class="highlight-val">{{ activeOccasionLabel }}</strong></label>
            </div>
            <div class="finder-options-row">
              <button 
                v-for="occ in occasionOptions" 
                :key="occ.id"
                class="finder-pill-btn"
                :class="{ active: selectedOccasion === occ.id }"
                @click="selectedOccasion = occ.id"
              >
                <span class="pill-icon">{{ occ.icon }}</span>
                <span class="pill-text">{{ occ.label }}</span>
              </button>
            </div>
          </div>

          <!-- Step 3: Budget Range Selector -->
          <div class="finder-filter-group">
            <div class="group-title-row">
              <span class="group-num">3</span>
              <label class="group-label">Бюджет: <strong class="highlight-val">{{ activeBudgetLabel }}</strong></label>
            </div>
            <div class="finder-options-row">
              <button 
                v-for="b in budgetOptions" 
                :key="b.id"
                class="finder-pill-btn"
                :class="{ active: selectedBudget === b.id }"
                @click="selectedBudget = b.id"
              >
                <span class="pill-icon">{{ b.icon }}</span>
                <span class="pill-text">{{ b.label }}</span>
              </button>
            </div>
          </div>

          <!-- Step 4: Interests Selector -->
          <div class="finder-filter-group">
            <div class="group-title-row">
              <span class="group-num">4</span>
              <label class="group-label">Интересы ребёнка: <strong class="highlight-val">{{ activeInterestLabel }}</strong></label>
            </div>
            <div class="finder-options-row">
              <button 
                v-for="int in interestOptions" 
                :key="int.id"
                class="finder-pill-btn"
                :class="{ active: selectedInterest === int.id }"
                @click="selectedInterest = int.id"
              >
                <span class="pill-icon">{{ int.icon }}</span>
                <span class="pill-text">{{ int.label }}</span>
              </button>
            </div>
          </div>

          <!-- Step 5: Format Selector (Обычные игрушки vs Боксы) -->
          <div class="finder-filter-group">
            <div class="group-title-row">
              <span class="group-num">5</span>
              <label class="group-label">Формат подарка: <strong class="highlight-val">{{ activeFormatLabel }}</strong></label>
            </div>
            <div class="finder-options-row">
              <button 
                v-for="fmt in formatOptions" 
                :key="fmt.id"
                class="finder-pill-btn"
                :class="{ active: selectedFormat === fmt.id }"
                @click="selectedFormat = fmt.id"
              >
                <span class="pill-icon">{{ fmt.icon }}</span>
                <span class="pill-text">{{ fmt.label }}</span>
              </button>
            </div>
          </div>

          <!-- Finder Actions Bar -->
          <div class="finder-action-bar">
            <div class="found-counter-box">
              <span class="counter-sparkle">✨</span>
              <span>Подобрано: <strong>{{ filteredProducts.length }}</strong> подходящих подарков</span>
            </div>

            <div class="finder-btn-wrap">
              <button 
                v-if="hasActiveFinderFilters" 
                class="reset-finder-btn" 
                @click="resetFinderFilters"
              >
                ✕ Сбросить фильтры
              </button>

              <a href="#gift-catalog" class="submit-finder-btn">
                <span>Показать подходящие варианты ({{ filteredProducts.length }})</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- GIFT CATALOG TABS & ITEMS (КАТАЛОГ ПОДАРКОВ) -->
      <section id="gift-catalog" class="catalog-section">
        <div class="catalog-header-row">
          <div>
            <span class="sub-badge">КАТАЛОГ ПОДАРКОВ</span>
            <h2 class="section-title">Праздничные боксы, наборы и обычные эко-игрушки</h2>
          </div>

          <!-- Search and Sort Toolbar -->
          <div class="catalog-toolbar">
            <div class="catalog-search-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A8A9E" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="7"></circle>
                <line x1="21" y1="21" x2="16.5" y2="16.5"></line>
              </svg>
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Поиск по подаркам..." 
                class="search-input"
              />
              <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">&times;</button>
            </div>

            <div class="catalog-sort-wrap">
              <span class="sort-title">Сортировка:</span>
              <select v-model="currentSort" class="sort-select">
                <option value="popular">По популярности</option>
                <option value="price_asc">Сначала доступные</option>
                <option value="price_desc">Сначала премиальные</option>
              </select>
            </div>
          </div>
        </div>

        <!-- CATEGORY TABS (Все требуемые категории ТЗ + Обычные игрушки) -->
        <div class="categories-tabs-scroll">
          <div class="tabs-container">
            <button 
              v-for="cat in categoryTabs" 
              :key="cat.id"
              class="cat-tab-btn"
              :class="{ active: activeCategory === cat.id, 'highlight-tab': cat.id === 'regular_toys' }"
              @click="handleCategorySelect(cat.id)"
            >
              <span class="tab-icon">{{ cat.icon }}</span>
              <span class="tab-name">{{ cat.name }}</span>
              <span class="tab-count">{{ getCategoryCount(cat.id) }}</span>
            </button>
          </div>
        </div>

        <!-- Active Filter Indicator Banner -->
        <div v-if="hasActiveFinderFilters || searchQuery" class="active-filters-bar">
          <span class="filter-lead">Применены фильтры:</span>
          <span v-if="selectedAge !== 'all'" class="filter-chip">
            Возраст: {{ activeAgeLabel }}
            <button @click="selectedAge = 'all'">&times;</button>
          </span>
          <span v-if="selectedOccasion !== 'all'" class="filter-chip">
            Повод: {{ activeOccasionLabel }}
            <button @click="selectedOccasion = 'all'">&times;</button>
          </span>
          <span v-if="selectedBudget !== 'all'" class="filter-chip">
            Бюджет: {{ activeBudgetLabel }}
            <button @click="selectedBudget = 'all'">&times;</button>
          </span>
          <span v-if="selectedInterest !== 'all'" class="filter-chip">
            Интерес: {{ activeInterestLabel }}
            <button @click="selectedInterest = 'all'">&times;</button>
          </span>
          <span v-if="selectedFormat !== 'all'" class="filter-chip">
            Формат: {{ activeFormatLabel }}
            <button @click="selectedFormat = 'all'">&times;</button>
          </span>
          <span v-if="searchQuery" class="filter-chip">
            Поиск: «{{ searchQuery }}»
            <button @click="searchQuery = ''">&times;</button>
          </span>

          <button class="clear-all-filters-btn" @click="resetAllFilters">Очистить все</button>
        </div>

        <!-- PRODUCTS GRID -->
        <div v-if="filteredProducts.length > 0" class="gift-products-grid">
          <div 
            v-for="prod in filteredProducts" 
            :key="prod.id" 
            class="gift-card"
            :class="{ 
              'card-match-highlight': isProductHighMatch(prod),
              'regular-toy-card': prod.category === 'regular_toys' || prod.category === 'toys'
            }"
          >
            <!-- Image & Tag Overlays -->
            <div class="card-img-wrap" @click="openQuickView(prod)">
              <img :src="prod.image" :alt="prod.title" class="card-img" loading="lazy" />
              
              <div class="card-badges-top">
                <span class="cat-tag" :class="{ 'regular-cat-tag': prod.category === 'regular_toys' }">
                  {{ prod.categoryBadge }}
                </span>
                <span v-if="prod.isHot" class="hot-tag">★ ХИТ</span>
                <span v-if="prod.isNew" class="new-tag">НОВИНКА</span>
              </div>

              <div class="card-age-tag">
                <span>{{ prod.ageText }}</span>
              </div>

              <!-- Recommendation match pill -->
              <div v-if="isProductHighMatch(prod)" class="match-badge">
                <span>★ Рекомендация методиста</span>
              </div>
            </div>

            <!-- Content -->
            <div class="card-body">
              <div class="card-category-sub">{{ prod.occasionLabel }}</div>
              <h3 class="card-title" @click="openQuickView(prod)">{{ prod.title }}</h3>
              <p class="card-desc">{{ prod.description }}</p>

              <!-- Components preview list -->
              <div class="box-items-preview">
                <div class="preview-heading">
                  {{ prod.category === 'regular_toys' ? 'Комплектация подарка:' : 'Внутри подарка:' }}
                </div>
                <ul class="preview-list">
                  <li v-for="(item, idx) in prod.items.slice(0, 3)" :key="idx">
                    <span class="check-icon">✓</span>
                    <span>{{ item }}</span>
                  </li>
                  <li v-if="prod.items.length > 3" class="more-items-item">
                    + еще {{ prod.items.length - 3 }} элемента
                  </li>
                </ul>
              </div>

              <!-- Packaging note -->
              <div class="packaging-pill">
                <span>🎀 Оформляется в праздничный эко-бокс с открыткой</span>
              </div>

              <!-- Bottom Price & Buttons -->
              <div class="card-footer">
                <div class="price-box">
                  <span class="price-val">{{ formatPrice(prod.price) }} ₸</span>
                  <span class="price-sub">в подарочной упаковке</span>
                </div>

                <div class="card-btns-group">
                  <button 
                    class="quick-view-btn" 
                    title="Персонализировать ленту и открытку"
                    @click="openQuickView(prod)"
                  >
                    🎁 Персонализация
                  </button>

                  <button 
                    class="add-to-cart-btn" 
                    :class="{ added: addedProductIds.includes(prod.id) }"
                    @click="handleAddToCart(prod)"
                  >
                    <span v-if="addedProductIds.includes(prod.id)">Добавлено ✓</span>
                    <span v-else>В корзину</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No Results Empty State -->
        <div v-else class="no-results-card">
          <div class="no-results-icon">🔍</div>
          <h3>По вашему запросу подарков не найдено</h3>
          <p>Попробуйте выбрать более широкий диапазон возраста или сбросить критерии фильтрации.</p>
          <button class="reset-all-btn" @click="resetAllFilters">Показать все подарки</button>
        </div>
      </section>

      <!-- GIFT MEMBERSHIP & CERTIFICATES (ПОДАРОЧНЫЙ СЕРТИФИКАТ И ПОДПИСКА КЛУБА) -->
      <section id="gift-cert-section" class="gift-cert-wrapper">
        <div class="cert-section-header">
          <span class="sub-badge">ПОДАРОЧНОЕ ЧЛЕНСТВО</span>
          <h2 class="section-title">Подарочный сертификат клуба Alpha</h2>
          <p class="section-subtitle">
            Не знаете точные предпочтения? Подарите родителям свободу выбора: методисты Alpha сформируют 
            индивидуальный игровой набор точно под возраст малыша, а игрушки будут регулярно обновляться!
          </p>
        </div>

        <!-- 3 Steps Bar -->
        <div class="cert-steps-bar">
          <div class="cert-step-card">
            <div class="step-circle">1</div>
            <h4>Срок подписки</h4>
            <p>От 1 месяца до целого года игровых открытий.</p>
          </div>
          <div class="cert-step-card">
            <div class="step-circle">2</div>
            <h4>Ваше пожелание</h4>
            <p>Напечатаем его на нарядной открытке или отправим онлайн.</p>
          </div>
          <div class="cert-step-card">
            <div class="step-circle">3</div>
            <h4>Активация родителями</h4>
            <p>В любой момент родители активируют сертификат и выберут игрушки.</p>
          </div>
        </div>

        <!-- Configurator Grid (Form + Live Card) -->
        <div class="cert-config-grid">
          <!-- Left: Options Form -->
          <div class="config-card">
            <h3 class="config-title">Оформление подарочного сертификата</h3>

            <!-- Duration Selector -->
            <div class="config-row">
              <label class="form-label">1. Длительность подарочного членства</label>
              <div class="duration-selector-grid">
                <div 
                  v-for="d in durations" 
                  :key="d.id"
                  class="dur-item"
                  :class="{ active: selectedDuration === d.id }"
                  @click="selectedDuration = d.id"
                >
                  <span class="dur-months">{{ d.months }}</span>
                  <span class="dur-name">{{ d.title }}</span>
                  <span v-if="d.badge" class="dur-tag">{{ d.badge }}</span>
                </div>
              </div>
            </div>

            <!-- Tier Selector -->
            <div class="config-row">
              <label class="form-label">2. Тариф подписки</label>
              <div class="tier-selector-grid">
                <div 
                  class="tier-box"
                  :class="{ active: selectedTier === 'starter' }"
                  @click="selectedTier = 'starter'"
                >
                  <div class="radio-mark">
                    <span v-if="selectedTier === 'starter'" class="radio-dot"></span>
                  </div>
                  <div>
                    <strong>Тариф Starter</strong>
                    <p>3 развивающие эко-игрушки в месяц</p>
                  </div>
                </div>

                <div 
                  class="tier-box"
                  :class="{ active: selectedTier === 'explorer' }"
                  @click="selectedTier = 'explorer'"
                >
                  <div class="radio-mark">
                    <span v-if="selectedTier === 'explorer'" class="radio-dot"></span>
                  </div>
                  <div>
                    <strong>Тариф Explorer ★ ХИТ</strong>
                    <p>5 игрушек + персональный план методиста</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recipient & Message -->
            <div class="config-row">
              <label class="form-label">3. Поздравление на открытке</label>
              <div class="cert-inputs-grid">
                <div class="input-field">
                  <label>Имя ребенка или семьи</label>
                  <input v-model="certForm.recipientName" type="text" placeholder="Маленькому Тимуру" />
                </div>
                <div class="input-field">
                  <label>От кого подарок</label>
                  <input v-model="certForm.senderName" type="text" placeholder="От любящей крестной" />
                </div>
              </div>

              <div class="input-field message-field">
                <label>Теплые слова поздравления</label>
                <textarea 
                  v-model="certForm.message" 
                  rows="3" 
                  placeholder="Расти здоровым, любознательным и счастливым! Пусть каждый день приносит радость новых открытий!"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Right: Live Certificate Card & Buy Card -->
          <div class="cert-display-col">
            <div class="luxury-cert-card">
              <div class="cert-pattern-overlay"></div>
              <div class="cert-top-bar">
                <div class="cert-brand">
                  <span class="cert-logo-text">★ NOMAD ALPHA ★</span>
                  <span class="cert-city">ALMATY • ASTANA</span>
                </div>
                <div class="cert-pill-badge">GIFT CERTIFICATE</div>
              </div>

              <div class="cert-center-body">
                <span class="cert-for-lead">Сертификат дарит радость:</span>
                <h2 class="cert-rec-name">{{ certForm.recipientName || 'Любимому ребенку' }}</h2>

                <div class="cert-meta-tag">
                  <span>{{ currentDurationObj.months }} подписки • {{ selectedTier === 'starter' ? 'Тариф Starter (3 игрушки)' : 'Тариф Explorer (5 игрушек)' }}</span>
                </div>

                <div class="cert-quote-box">
                  <p class="cert-quote">«{{ certForm.message || 'Расти здоровым, любознательным и счастливым!' }}»</p>
                </div>
              </div>

              <div class="cert-bottom-bar">
                <div class="cert-from-info">
                  <span class="from-lead">С любовью,</span>
                  <strong class="from-name">{{ certForm.senderName || 'Ваши близкие' }}</strong>
                </div>
                <div class="cert-stamp">
                  <span>OFFICIAL CLUB SEAL</span>
                </div>
              </div>
            </div>

            <!-- Order Action Box -->
            <div class="cert-order-action">
              <div class="order-price-row">
                <span class="order-price-label">Итого к оплате:</span>
                <span class="order-price-val">{{ formatPrice(calculatedCertPrice) }} ₸</span>
              </div>

              <button 
                class="cert-buy-btn" 
                :disabled="isSubmittingCert"
                @click="handleBuyCertificate"
              >
                {{ isSubmittingCert ? 'Оформление...' : `Подарить сертификат за ${formatPrice(calculatedCertPrice)} ₸ 🎁` }}
              </button>

              <span class="instant-delivery-hint">
                ✓ Мгновенная доставка на Email или нарядная печатная открытка с курьером
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- UNBOXING & PACKAGING EXPERIENCE (КАК МЫ УПАКОВЫВАЕМ ПОДАРКИ) -->
      <section class="packaging-showcase">
        <div class="pack-header">
          <span class="sub-badge">ФИРМЕННЫЙ СЕРВИС</span>
          <h2 class="section-title">Как мы создаем праздник в каждой коробке</h2>
        </div>

        <div class="pack-cards-grid">
          <div class="pack-card">
            <div class="pack-num">01</div>
            <h4>Деревянный бокс ручной работы</h4>
            <p>Экологичная коробка из массива бука, которая останется у ребенка для бережного хранения любимых игрушек.</p>
          </div>

          <div class="pack-card">
            <div class="pack-num">02</div>
            <h4>Атласные ленты премиум-класса</h4>
            <p>Вы можете выбрать цвет праздничной ленты: золотой, лавандовый, нежно-мятный или благородный рубин.</p>
          </div>

          <div class="pack-card">
            <div class="pack-num">03</div>
            <h4>Натуральный эко-наполнитель</h4>
            <p>Мягкая древесная стружка создает волшебную атмосферу настоящего сюрприза при распаковке подарка.</p>
          </div>

          <div class="pack-card">
            <div class="pack-num">04</div>
            <h4>Дизайнерская открытка с текстом</h4>
            <p>Мы бережно напечатаем ваше теплое поздравление на плотной хлопковой бумаге с золотым тиснением.</p>
          </div>
        </div>
      </section>
    </main>

    <!-- QUICK VIEW & PERSONALIZATION MODAL -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isQuickViewOpen && activeProduct" class="modal-backdrop" @click.self="closeQuickView">
          <div class="gift-modal-card">
            <button class="modal-close-btn" @click="closeQuickView">&times;</button>

            <div class="modal-grid">
              <!-- Left: Image & Tags -->
              <div class="modal-img-col">
                <img :src="activeProduct.image" :alt="activeProduct.title" class="modal-main-img" />
                <div class="modal-badges-row">
                  <span class="modal-tag age">{{ activeProduct.ageText }}</span>
                  <span class="modal-tag cat">{{ activeProduct.categoryBadge }}</span>
                </div>
              </div>

              <!-- Right: Info & Personalization Form -->
              <div class="modal-info-col">
                <span class="modal-occasion">{{ activeProduct.occasionLabel }}</span>
                <h2 class="modal-prod-title">{{ activeProduct.title }}</h2>
                <p class="modal-prod-desc">{{ activeProduct.description }}</p>

                <!-- Box Contents Checklist -->
                <div class="modal-contents-box">
                  <h4 class="box-contents-title">
                    {{ activeProduct.category === 'regular_toys' ? '🎁 Подарочная комплектация:' : '🎁 Что входит в подарочный комплект:' }}
                  </h4>
                  <ul class="modal-items-list">
                    <li v-for="(it, idx) in activeProduct.items" :key="idx">
                      <span class="it-check">✓</span>
                      <span>{{ it }}</span>
                    </li>
                  </ul>
                </div>

                <!-- Montessori Method Benefit -->
                <div class="montessori-benefit-box">
                  <strong>⭐ Развивающий эффект:</strong>
                  <p>{{ activeProduct.benefit }}</p>
                </div>

                <!-- Gift Customization (Ribbon & Greeting) -->
                <div class="modal-customizer">
                  <h4 class="customizer-title">🎀 Персонализация подарка</h4>

                  <!-- Gift Packaging Option for Regular Toys -->
                  <div v-if="activeProduct.category === 'regular_toys'" class="packaging-checkbox-row">
                    <label class="pack-checkbox-label">
                      <input type="checkbox" v-model="includeGiftPackaging" class="pack-checkbox" />
                      <span><strong>Включить фирменную подарочную эко-упаковку</strong> (деревянный бокс Alpha Box + шелковая лента + открытка)</span>
                    </label>
                  </div>

                  <!-- Ribbon selector -->
                  <div class="ribbon-select-row">
                    <label class="custom-label">Цвет атласной ленты:</label>
                    <div class="ribbon-pills">
                      <button 
                        v-for="r in ribbonColors" 
                        :key="r.id"
                        class="ribbon-btn"
                        :class="{ active: selectedRibbon === r.id }"
                        @click="selectedRibbon = r.id"
                      >
                        <span class="ribbon-dot" :style="{ backgroundColor: r.color }"></span>
                        <span>{{ r.name }}</span>
                      </button>
                    </div>
                  </div>

                  <!-- Greeting fields -->
                  <div class="greeting-fields-wrap">
                    <div class="modal-input-row">
                      <input 
                        v-model="modalGiftRecipient" 
                        type="text" 
                        placeholder="Имя ребенка (для открытки)" 
                        class="modal-input"
                      />
                      <input 
                        v-model="modalGiftSender" 
                        type="text" 
                        placeholder="От кого (например, от тети Алии)" 
                        class="modal-input"
                      />
                    </div>
                    <textarea 
                      v-model="modalGiftMessage" 
                      rows="2" 
                      placeholder="Текст поздравления на открытке (бесплатно)" 
                      class="modal-textarea"
                    ></textarea>
                  </div>
                </div>

                <!-- Bottom Purchase Bar -->
                <div class="modal-footer-bar">
                  <div class="modal-price-col">
                    <span class="m-price-label">Цена подарка:</span>
                    <span class="m-price-val">{{ formatPrice(modalCalculatedPrice) }} ₸</span>
                  </div>

                  <button 
                    class="modal-add-cart-btn"
                    @click="handleAddModalProductToCart"
                  >
                    <span>Добавить в корзину как подарок 🎁</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- TOAST NOTIFICATION -->
    <Transition name="toast">
      <div v-if="toastMessage" class="gift-toast">
        <div class="toast-content">
          <span class="toast-icon">🎁</span>
          <span class="toast-text">{{ toastMessage }}</span>
        </div>
        <NuxtLink to="/cart" class="toast-cart-link">В корзину →</NuxtLink>
      </div>
    </Transition>

    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TheHeader from '~/components/TheHeader.vue'
import TheFooter from '~/components/TheFooter.vue'

const route = useRoute()
const { addItem } = useCart()
const { purchaseGiftSubscription } = useGifts()
const { fetchToys } = useToys()

// TOAST NOTIFICATIONS
const toastMessage = ref('')
let toastTimer: any = null

const showToast = (msg: string) => {
  toastMessage.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, 4500)
}

// -------------------------------------------------------------
// FILTER OPTIONS FOR «ПОДОБРАТЬ ПОДАРОК»
// -------------------------------------------------------------
const selectedAge = ref('all')
const selectedOccasion = ref('all')
const selectedBudget = ref('all')
const selectedInterest = ref('all')
const selectedFormat = ref('all')
const activeCategory = ref('all')
const searchQuery = ref('')
const currentSort = ref('popular')

const ageOptions = [
  { id: 'all', label: 'Все возрасты', icon: '👶' },
  { id: '0-1', label: '0–1 год', desc: 'Первые открытия & сенсорика', icon: '🍼' },
  { id: '1-2', label: '1–2 года', desc: 'Первые шаги & сортеры', icon: '🧩' },
  { id: '2-3', label: '2–3 года', desc: 'Логика & координация', icon: '🎨' },
  { id: '3-5', label: '3–5 лет', desc: 'Фантазия & конструирование', icon: '🚀' },
  { id: '5-7', label: '5–7 лет', desc: 'Инженерия & подготовка к школе', icon: '🧠' },
]

const occasionOptions = [
  { id: 'all', label: 'Любой повод', icon: '✨' },
  { id: 'birthday', label: 'День рождения', icon: '🎂' },
  { id: 'baby_shower', label: 'Рождение / Выписка', icon: '🍼' },
  { id: 'new_year', label: 'Новый год / Зима', icon: '❄️' },
  { id: 'visit', label: 'В гости к друзьям', icon: '🏡' },
  { id: 'just_because', label: 'Просто так / Сюрприз', icon: '⭐' },
]

const budgetOptions = [
  { id: 'all', label: 'Любой бюджет', icon: '🏷️' },
  { id: 'under_15', label: 'До 15 000 ₸', icon: '🌱' },
  { id: '15_30', label: '15 000 – 30 000 ₸', icon: '🌿' },
  { id: '30_50', label: '30 000 – 50 000 ₸', icon: '💎' },
  { id: 'over_50', label: 'от 50 000 ₸ (VIP)', icon: '👑' },
]

const interestOptions = [
  { id: 'all', label: 'Все направления', icon: '🌟' },
  { id: 'motor', label: 'Мелкая моторика & Монтессори', icon: '🧩' },
  { id: 'creativity', label: 'Творчество & Конструирование', icon: '🏗️' },
  { id: 'logic', label: 'Логика, сортеры & пазлы', icon: '🧠' },
  { id: 'music', label: 'Музыка, ритм & звуки', icon: '🎵' },
  { id: 'active', label: 'Активные игры & баланс', icon: '🏃' },
  { id: 'roleplay', label: 'Сюжетно-ролевые игры', icon: '🧸' },
]

const formatOptions = [
  { id: 'all', label: 'Все форматы подарков', icon: '✨' },
  { id: 'regular_toys', label: '🧸 Обычные развивающие игрушки', icon: '🧸' },
  { id: 'boxes_sets', label: '📦 Готовые боксы и наборы', icon: '📦' },
]

// CATEGORY TABS (Согласно ТЗ + Обычные игрушки)
const categoryTabs = [
  { id: 'all', name: 'Все подарки', icon: '🎁' },
  { id: 'regular_toys', name: 'Обычные игрушки в подарок', icon: '🧸' },
  { id: 'boxes', name: 'Подарочные боксы', icon: '📦' },
  { id: 'sets', name: 'Подарочные наборы', icon: '✨' },
  { id: 'age_sets', name: 'Наборы по возрасту', icon: '👶' },
  { id: 'birthday', name: 'Ко дню рождения', icon: '🎂' },
  { id: 'seasonal', name: 'Сезонные подарки', icon: '❄️' },
  { id: 'themed', name: 'Другие тематические', icon: '🎨' },
  { id: 'certificates', name: 'Сертификаты и подписка', icon: '🎟️' },
]

const activeAgeLabel = computed(() => ageOptions.find(a => a.id === selectedAge.value)?.label || 'Все')
const activeOccasionLabel = computed(() => occasionOptions.find(o => o.id === selectedOccasion.value)?.label || 'Любой')
const activeBudgetLabel = computed(() => budgetOptions.find(b => b.id === selectedBudget.value)?.label || 'Любой')
const activeInterestLabel = computed(() => interestOptions.find(i => i.id === selectedInterest.value)?.label || 'Все')
const activeFormatLabel = computed(() => formatOptions.find(f => f.id === selectedFormat.value)?.label || 'Все')

const hasActiveFinderFilters = computed(() => {
  return selectedAge.value !== 'all' || 
         selectedOccasion.value !== 'all' || 
         selectedBudget.value !== 'all' || 
         selectedInterest.value !== 'all' ||
         selectedFormat.value !== 'all'
})

const resetFinderFilters = () => {
  selectedAge.value = 'all'
  selectedOccasion.value = 'all'
  selectedBudget.value = 'all'
  selectedInterest.value = 'all'
  selectedFormat.value = 'all'
}

const resetAllFilters = () => {
  resetFinderFilters()
  activeCategory.value = 'all'
  searchQuery.value = ''
}

// -------------------------------------------------------------
// GIFT PRODUCTS DATABASE (24 ПРОДУМАННЫХ ПОДАРКА: БОКСЫ, НАБОРЫ И ОБЫЧНЫЕ ИГРУШКИ)
// -------------------------------------------------------------
export interface GiftProduct {
  id: string | number
  title: string
  category: 'regular_toys' | 'toys' | 'boxes' | 'sets' | 'age_sets' | 'birthday' | 'seasonal' | 'themed'
  categoryBadge: string
  ageGroup: '0-1' | '1-2' | '2-3' | '3-5' | '5-7'
  ageText: string
  occasions: string[]
  occasionLabel: string
  price: number
  interests: string[]
  description: string
  benefit: string
  items: string[]
  image: string
  isHot?: boolean
  isNew?: boolean
}

// Base Curated Gift Collection
const initialGiftProducts: GiftProduct[] = [
  // 1. Обычные игрушки в подарок (Регулярные хиты каталога)
  {
    id: 'reg-toy-1',
    title: 'Деревянный сортер «Геометрическая поляна»',
    category: 'regular_toys',
    categoryBadge: 'ИГРУШКА В ПОДАРОК',
    ageGroup: '1-2',
    ageText: '1–3 года',
    occasions: ['birthday', 'visit', 'just_because'],
    occasionLabel: 'Классическая Монтессори-игрушка',
    price: 9800,
    interests: ['logic', 'motor'],
    description: 'Обычная развивающая игрушка из бука: основа с 4 штырьками и 16 разноцветных фигур для сортировки и счета.',
    benefit: 'Развивает мелкую моторику, координацию пальчиков и понимание геометрических форм.',
    items: [
      'Деревянная основа из бука',
      '16 цветных геометрических фигур (круг, треугольник, квадрат, прямоугольник)',
      'Опция: праздничный эко-бокс с шелковой лентой',
      'Бесплатная поздравительная открытка'
    ],
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80',
    isHot: true
  },
  {
    id: 'reg-toy-2',
    title: 'Деревянный ксилофон «Лесной ручеек»',
    category: 'regular_toys',
    categoryBadge: 'ИГРУШКА В ПОДАРОК',
    ageGroup: '1-2',
    ageText: '1–4 года',
    occasions: ['birthday', 'visit', 'just_because'],
    occasionLabel: 'Музыкальный подарок для малыша',
    price: 11500,
    interests: ['music', 'motor'],
    description: 'Качественный детский ксилофон из клена с 8 настроенными латунными пластинками и палочками.',
    benefit: 'Формирует музыкальный слух, чувство ритма и аудиальное восприятие мира.',
    items: [
      'Деревянный ксилофон чистейшего строя',
      '2 деревянные палочки с круглыми головками',
      'Книжечка с простыми нотами-картинками',
      'Подарочная крафт-коробка и открытка'
    ],
    image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=600&q=80',
    isHot: true
  },
  {
    id: 'reg-toy-3',
    title: 'Радужная пирамидка-счетчик из липы',
    category: 'regular_toys',
    categoryBadge: 'ИГРУШКА В ПОДАРОК',
    ageGroup: '0-1',
    ageText: '8 мес – 2 года',
    occasions: ['baby_shower', 'birthday', 'just_because'],
    occasionLabel: 'Первая любимая развивашка',
    price: 7900,
    interests: ['motor', 'sensory'],
    description: 'Гладкие деревянные кольца радужных оттенков на устойчивом основании со скругленным стержнем.',
    benefit: 'Тренирует сопоставление размеров «больше-меньше», знакомит с цветами радуги.',
    items: [
      '7 цветных колец из массива липы',
      'Безопасное основание с гибким штырьком',
      'Льняной мешочек для хранения',
      'Именная открытка в подарок'
    ],
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'reg-toy-4',
    title: 'Деревянная каталка на веревочке «Щенок Тоби»',
    category: 'regular_toys',
    categoryBadge: 'ИГРУШКА В ПОДАРОК',
    ageGroup: '1-2',
    ageText: '1–2.5 года',
    occasions: ['birthday', 'visit'],
    occasionLabel: 'Верный спутник первых шагов',
    price: 8500,
    interests: ['active', 'motor'],
    description: 'Забавная каталка с подвижными ушками и хвостиком, которая весело виляет при движении.',
    benefit: 'Мотивирует малыша больше ходить, развивает равновесие и общую моторику.',
    items: [
      'Каталка из массива бука с прорезиненными колесами',
      'Прочный хлопковый шнурок с деревянной ручкой',
      'Подарочная упаковка с лентой'
    ],
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'reg-toy-5',
    title: 'Деревянная шнуровка-яблоко «Червячок»',
    category: 'regular_toys',
    categoryBadge: 'ИГРУШКА В ПОДАРОК',
    ageGroup: '2-3',
    ageText: '2–4 года',
    occasions: ['visit', 'just_because'],
    occasionLabel: 'Компактный подарок для развития пальчиков',
    price: 6400,
    interests: ['motor', 'logic'],
    description: 'Гладкое красное деревянное яблочко со сквозными ходами и червячком на шнурке.',
    benefit: 'Идеальный тренажер для усидчивости, мелкой моторики и подготовки руки к письму.',
    items: [
      'Деревянное яблоко из массива бука',
      'Деревянная игла-червячок с прочным шнурком',
      'Подарочный крафтовый пакетик и открытка'
    ],
    image: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'reg-toy-6',
    title: 'Деревянная качалка-олень «Северный лес»',
    category: 'regular_toys',
    categoryBadge: 'ПРЕМИУМ ИГРУШКА',
    ageGroup: '1-2',
    ageText: '1–3 года',
    occasions: ['birthday', 'new_year', 'visit'],
    occasionLabel: 'Подарок с восторгом на долгие годы',
    price: 34900,
    interests: ['active'],
    description: 'Эргономичная деревянная качалка из массива березы. Прекрасный интерьерный акцент и любимая активная игра.',
    benefit: 'Тренирует вестибулярный аппарат, чувство баланса и укрепляет мышцы спины и ножек.',
    items: [
      'Качалка-олень из массива березы с защитными полозьями',
      'Мягкая съемная подушечка из органического льна',
      'Подарочный бархатный бант',
      'Именная деревянная бирка с гравировкой'
    ],
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80',
    isHot: true
  },
  {
    id: 'reg-toy-7',
    title: 'Радужный балансир «Монтессори Дуга»',
    category: 'regular_toys',
    categoryBadge: 'ИГРУШКА В ПОДАРОК',
    ageGroup: '2-3',
    ageText: '2–6 лет',
    occasions: ['birthday', 'just_because'],
    occasionLabel: 'Хит Монтессори-педагогики',
    price: 22900,
    interests: ['motor', 'creativity', 'active'],
    description: '12 разноцветных деревянных дуг из липы. Это и мост, и тоннель, и забор, и колыбелька для кукол.',
    benefit: 'Открытая развивающая среда: стимулирует креативность без заданных рамок.',
    items: [
      '12 дуг разного радиуса из массива липы',
      'Безопасное эко-покрытие натуральными маслами',
      'Книга с 40 идеями построек',
      'Хлопковый мешок и открытка'
    ],
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80'
  },

  // 2. Подарочные боксы
  {
    id: 'box-1',
    title: 'Подарочный бокс «Первый Годик»',
    category: 'boxes',
    categoryBadge: 'ПОДАРОЧНЫЙ БОКС',
    ageGroup: '0-1',
    ageText: '0–1 год',
    occasions: ['birthday', 'baby_shower', 'just_because'],
    occasionLabel: 'Идеально на выписку и 1 год',
    price: 24900,
    interests: ['motor', 'sensory'],
    description: 'Коллекция тактильных деревянных эко-игрушек из клена и ясеня в праздничном деревянном боксе с шелковой лентой.',
    benefit: 'Стимулирует тактильное восприятие, мелкую моторику и зрительно-моторную координацию младенца.',
    items: [
      'Деревянный колокольчик-погремушка из клена',
      'Грызунок из бука и натурального льна',
      'Мягкие хлопковые тактильные кубики',
      'Гравированный деревянный бокс Alpha Box',
      'Именная поздравительная открытка'
    ],
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80',
    isHot: true
  },
  {
    id: 'box-2',
    title: 'Фирменный бокс «Маленький Гений»',
    category: 'boxes',
    categoryBadge: 'ПОДАРОЧНЫЙ БОКС',
    ageGroup: '1-2',
    ageText: '1–2 года',
    occasions: ['birthday', 'visit', 'just_because'],
    occasionLabel: 'Хит на день рождения малыша',
    price: 28900,
    interests: ['logic', 'motor'],
    description: 'Набор для раннего интеллектуального развития: геометрический сортер, радуга-балансир и обучающие карточки.',
    benefit: 'Развивает пространственное мышление, распознавание форм, цветов и логические цепочки.',
    items: [
      'Геометрический сортер Монтессори на 4 фигуры',
      'Радуга-балансир из цельной липы',
      'Тактильные карточки с животными',
      'Праздничный деревянный сундучок с замком',
      'Атласная лента с открыткой'
    ],
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80',
    isHot: true
  },
  {
    id: 'box-3',
    title: 'Премиум-бокс «Архитектор Мечты VIP»',
    category: 'boxes',
    categoryBadge: 'VIP БОКС',
    ageGroup: '3-5',
    ageText: '3–5 лет',
    occasions: ['birthday', 'new_year'],
    occasionLabel: 'Особенный подарок ко дню рождения',
    price: 54900,
    interests: ['creativity', 'logic'],
    description: 'Большой деревянный конструктор замков и мостов из ясеня и ореха в массивном ящике с латунной фурнитурой.',
    benefit: 'Тренирует инженерное и объемно-пространственное воображение, концентрацию внимания и терпение.',
    items: [
      '120 деревянных архитектурных блоков из ясеня и ореха',
      'Деревянные арки, колонны и купола',
      'Большой льняной мешок для хранения',
      'Массивный деревянный ящик ручной работы',
      'Подарочная открытка с каллиграфией'
    ],
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80',
    isNew: true
  },

  // 3. Наборы ко дню рождения
  {
    id: 'bday-1',
    title: 'Именинный набор «С Днем Рождения!»',
    category: 'birthday',
    categoryBadge: 'КО ДНЮ РОЖДЕНИЯ',
    ageGroup: '1-2',
    ageText: '1–4 года',
    occasions: ['birthday'],
    occasionLabel: 'Главный праздник малыша 🎂',
    price: 26900,
    interests: ['roleplay', 'creativity'],
    description: 'Праздничный деревянный торт со свечами на магнитах, праздничный колпачок именинника и поздравительная гирлянда.',
    benefit: 'Погружает ребенка в атмосферу праздника, учит сюжетно-ролевой игре и социальному взаимодействию.',
    items: [
      'Деревянный праздничный торт со свечами на магнитах',
      'Деревянная лопатка и тарелочки для угощения',
      'Праздничный льняной колпачок именинника',
      'Деревянная гирлянда-растяжка «С Днем Рождения»',
      'Поздравительная открытка в крафтовом конверте'
    ],
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80',
    isHot: true
  },
  {
    id: 'bday-2',
    title: 'Именинный VIP-бокс «Большой Праздник»',
    category: 'birthday',
    categoryBadge: 'КО ДНЮ РОЖДЕНИЯ',
    ageGroup: '3-5',
    ageText: '3–6 лет',
    occasions: ['birthday'],
    occasionLabel: 'Супер-набор именинника 🎂',
    price: 44900,
    interests: ['roleplay', 'creativity', 'motor'],
    description: 'Роскошный подарочный бокс: деревянный торт, игровой набор посудки, праздничный декор и диплом именинника.',
    benefit: 'Дарит незабываемые эмоции, помогает устроить сказочное чаепитие с родителями и друзьями.',
    items: [
      'Большой деревянный торт с фруктами и свечами',
      'Чайный сервиз из бука на 4 персоны',
      'Именной золотой диплом именинника',
      'Хлопушка с праздничным эко-конфетти',
      'Фирменный деревянный бокс с золотым бантом'
    ],
    image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=600&q=80'
  },

  // 4. Подарочные наборы
  {
    id: 'set-1',
    title: 'Подарочный набор «Маленький Музыкант»',
    category: 'sets',
    categoryBadge: 'ПОДАРОЧНЫЙ НАБОР',
    ageGroup: '1-2',
    ageText: '1–5 лет',
    occasions: ['birthday', 'visit', 'just_because'],
    occasionLabel: 'В гости и на праздник',
    price: 19900,
    interests: ['music'],
    description: 'Набор из 5 натуральных деревянных инструментов: бубен, маракасы, треугольник, кастаньеты и трещотка.',
    benefit: 'Позволяет устроить первый семейный оркестр и развивает аудиальное восприятие.',
    items: [
      'Бубен с мембраной из натуральной кожи',
      'Пара деревянных маракасов из клена',
      'Звонкий металлический треугольник',
      'Деревянная трещотка и кастаньеты',
      'Подарочный льняной рюкзачок'
    ],
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'set-2',
    title: 'Игровой набор «Лесная Кулинария & Шеф-повар»',
    category: 'sets',
    categoryBadge: 'ПОДАРОЧНЫЙ НАБОР',
    ageGroup: '2-3',
    ageText: '2–6 лет',
    occasions: ['birthday', 'visit', 'just_because'],
    occasionLabel: 'Любимая сюжетная игра',
    price: 23500,
    interests: ['roleplay', 'motor'],
    description: 'Набор деревянных овощей и фруктов на липучках, безопасный ножик, дощечка и фартук шеф-повара.',
    benefit: 'Тренирует силу захвата пальчиков, учит разрезанию пополам и сюжетной игре.',
    items: [
      '8 овощей и фруктов на крепких липучках',
      'Безопасный деревянный ножик для нарезки',
      'Разделочная доска из цельного дуба',
      'Хлопковый фартучек шеф-повара',
      'Подарочная крафт-коробка с окном'
    ],
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80'
  },

  // 5. Наборы по возрасту
  {
    id: 'age-1',
    title: 'Возрастной набор «0–1 год: Первые прикосновения»',
    category: 'age_sets',
    categoryBadge: 'НАБОР ПО ВОЗРАСТУ',
    ageGroup: '0-1',
    ageText: '0–1 год',
    occasions: ['baby_shower', 'just_because'],
    occasionLabel: 'Специально для малышей 0–12 мес',
    price: 16900,
    interests: ['motor', 'sensory'],
    description: 'Методически выверенный комплект первых тактильных игрушек, одобренный детскими неврологами.',
    benefit: 'Успокаивает нервную систему младенца, формирует хватательный рефлекс и фокус зрения.',
    items: [
      'Контрастные черно-белые карточки Домана',
      'Массажный можжевеловый шарик с ароматом хвои',
      'Погремушка-колокольчик с тихим мелодичным звоном',
      'Грызунок из эко-силикона и бука',
      'Подарочный тубус с бантом'
    ],
    image: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'age-2',
    title: 'Возрастной набор «1–2 года: Шаг в мир»',
    category: 'age_sets',
    categoryBadge: 'НАБОР ПО ВОЗРАСТУ',
    ageGroup: '1-2',
    ageText: '1–2 года',
    occasions: ['birthday', 'visit'],
    occasionLabel: 'Идеально на возраст 1–2 года',
    price: 21900,
    interests: ['motor', 'logic'],
    description: 'Каталка на палочке для уверенных шагов, сортер-пирамидка и первые пазлы-вкладыши.',
    benefit: 'Помогает становлению уверенной походки и учит сопоставлению формы и отверстия.',
    items: [
      'Деревянная каталка на палочке «Утенок»',
      'Пирамидка-счетчик на 4 геометрические формы',
      'Пазлы-вкладыши с крупными деревянными ручками',
      'Деревянный бокс с крышкой',
      'Поздравительная открытка'
    ],
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'age-3',
    title: 'Возрастной набор «2–3 года: Юный исследователь»',
    category: 'age_sets',
    categoryBadge: 'НАБОР ПО ВОЗРАСТУ',
    ageGroup: '2-3',
    ageText: '2–3 года',
    occasions: ['birthday', 'just_because'],
    occasionLabel: 'Развитие логики и моторики 2–3 года',
    price: 27900,
    interests: ['logic', 'motor'],
    description: 'Магнитная рыбалка, сложный логический лабиринт с шариками и деревянная шнуровка.',
    benefit: 'Совершенствует усидчивость, пинцетный захват и готовит руку к рисованию.',
    items: [
      'Магнитная рыбалка «Пруд и рыбки» с двумя удочками',
      'Лабиринт с магнитным стилусом и цветными шариками',
      'Деревянная шнуровка «Лесные ягодки»',
      'Подарочная коробка с тиснением и лентой'
    ],
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'age-4',
    title: 'Возрастной набор «3–5 лет: Маленький мастер»',
    category: 'age_sets',
    categoryBadge: 'НАБОР ПО ВОЗРАСТУ',
    ageGroup: '3-5',
    ageText: '3–5 лет',
    occasions: ['birthday', 'new_year'],
    occasionLabel: 'Подарок для почемучек 3–5 лет',
    price: 31900,
    interests: ['creativity', 'logic'],
    description: 'Деревянный верстак с болтами, гайками, отверткой и соединительными планками.',
    benefit: 'Развивает сообразительность, пространственную ориентацию и технические навыки.',
    items: [
      'Портативный деревянный верстак',
      'Отвертка, молоток, гаечный ключ из дерева',
      '20 деревянных болтов, гаек и планок',
      'Ящичек мастера для порядка в комнате',
      'Праздничная открытка'
    ],
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'age-5',
    title: 'Возрастной набор «5–7 лет: Будущий инженер»',
    category: 'age_sets',
    categoryBadge: 'НАБОР ПО ВОЗРАСТУ',
    ageGroup: '5-7',
    ageText: '5–7 лет',
    occasions: ['birthday', 'new_year'],
    occasionLabel: 'Для будущих отличников 5–7 лет',
    price: 38900,
    interests: ['creativity', 'logic'],
    description: 'Кинетический Marblerun-лабиринт из бука с шестеренками и передаточными механизмами.',
    benefit: 'Знакомит с основами физики (гравитация, ускорение), учит проектному мышлению.',
    items: [
      'Кинетический трек с горками, трамплинами и спиралями',
      '10 стеклянных и деревянных шариков',
      'Механические шестеренки с ручным приводом',
      'Иллюстрированная книга экспериментов',
      'Премиальная подарочная коробка'
    ],
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80'
  },

  // 6. Сезонные подарки
  {
    id: 'season-1',
    title: 'Зимняя сказка: «Заснеженный городок & Щелкунчик»',
    category: 'seasonal',
    categoryBadge: 'СЕЗОННЫЙ ПОДАРОК',
    ageGroup: '2-3',
    ageText: '2–7 лет',
    occasions: ['new_year'],
    occasionLabel: 'Главный новогодний подарок ❄️',
    price: 33900,
    interests: ['creativity', 'roleplay'],
    description: '5 деревянных заснеженных домиков с окошками, гирлянда теплых огней, фигурки оленей и Щелкунчик.',
    benefit: 'Создает волшебную новогоднюю традицию и теплоту в детской комнате.',
    items: [
      '5 домиков из массива бука с белыми крышами',
      'Деревянная фигурка Щелкунчика и оленя',
      'Безопасная светодиодная гирлянда на батарейках',
      'Новогодняя жестяная банка с рождественской лентой',
      'Именное письмо от Деда Мороза'
    ],
    image: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=600&q=80',
    isHot: true
  },
  {
    id: 'season-2',
    title: 'Весенне-летний набор: «Юный натуралист и садовод»',
    category: 'seasonal',
    categoryBadge: 'СЕЗОННЫЙ ПОДАРОК',
    ageGroup: '3-5',
    ageText: '3–7 лет',
    occasions: ['visit', 'just_because'],
    occasionLabel: 'Для игр на природе и даче 🌿',
    price: 14900,
    interests: ['active', 'creativity'],
    description: 'Деревянная грядка с овощами, настоящая детская лупа в оправе из бука и пресс для сушки растений.',
    benefit: 'Прививает любовь к живой природе, внимательность к деталям и эко-сознательность.',
    items: [
      'Детская лупа 3x с ручкой из бука',
      'Деревянный винтовой пресс для гербария',
      'Полевой альбом с наклейками растений',
      'Льняная эко-сумка через плечо',
      'Подарочная открытка с пожеланием'
    ],
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80'
  },

  // 7. Другие тематические подарки
  {
    id: 'themed-1',
    title: 'Тематический сет «Космическая экспедиция Alpha»',
    category: 'themed',
    categoryBadge: 'ТЕМА: КОСМОС',
    ageGroup: '3-5',
    ageText: '3–7 лет',
    occasions: ['birthday', 'new_year'],
    occasionLabel: 'Мечта маленького астронавта 🚀',
    price: 29500,
    interests: ['creativity', 'roleplay'],
    description: 'Разборная 4-ступенчатая ракета на магнитах, планеты Солнечной системы и фигурки космонавтов.',
    benefit: 'Пробуждает интерес к астрономии, науке и устройству Вселенной.',
    items: [
      'Большая деревянная ракета со съемной капсулой',
      '2 фигурки космонавтов в скафандрах',
      '8 деревянных планет на устойчивых подставках',
      'Подарочный тубус «Космическая карта»'
    ],
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'themed-2',
    title: 'Тематический сет «Лесная ферма и домики зверят»',
    category: 'themed',
    categoryBadge: 'ТЕМА: ЖИВОТНЫЕ',
    ageGroup: '1-2',
    ageText: '1–4 года',
    occasions: ['visit', 'birthday', 'just_because'],
    occasionLabel: 'Любимые животные для малыша',
    price: 13900,
    interests: ['roleplay', 'motor'],
    description: '10 цельных деревянных фигурок домашних и диких животных с амбаром и заборчиком.',
    benefit: 'Помогает выучить звукоподражания («му», «бе», «гав»), развивает связную речь.',
    items: [
      '10 фигурок из липы, отшлифованных вручную',
      'Сборный деревянный амбар-домик',
      'Заборчик из 6 секций',
      'Крафт-коробка с бантом'
    ],
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'set-3',
    title: 'Подарочный набор «Монтессори Первые Формы»',
    category: 'sets',
    categoryBadge: 'МОНТЕССОРИ НАБОР',
    ageGroup: '0-1',
    ageText: '6–18 мес',
    occasions: ['baby_shower', 'visit'],
    occasionLabel: 'Монтессори-старт для самых маленьких',
    price: 12900,
    interests: ['motor', 'sensory'],
    description: 'Классическая коробочка постоянства объекта с выдвижным ящиком и шариком из ясеня.',
    benefit: 'Ребенок познает главный принцип мира: предмет не исчезает, даже если мы его не видим.',
    items: [
      'Коробочка постоянства объекта из ясеня',
      '3 шарика разной фактуры (бук, войлок, вяз)',
      'Деревянная шнуровка с крупными бусинами',
      'Подарочный мешочек из небеленого льна'
    ],
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80'
  }
]

const giftProducts = ref<GiftProduct[]>([...initialGiftProducts])

// Load regular toys from API to ensure any regular toy from store is available for gifting
const loadApiToys = async () => {
  try {
    const res = await fetchToys({ per_page: 50 })
    if (res?.data && res.data.length > 0) {
      const apiGifts: GiftProduct[] = res.data.map((toy: any) => {
        const minM = toy.min_age_months || 12
        const maxM = toy.max_age_months || 36
        let ageGroup: '0-1' | '1-2' | '2-3' | '3-5' | '5-7' = '1-2'
        if (minM <= 12 && maxM <= 14) ageGroup = '0-1'
        else if (minM <= 24) ageGroup = '1-2'
        else if (minM <= 36) ageGroup = '2-3'
        else if (minM <= 60) ageGroup = '3-5'
        else ageGroup = '5-7'

        const minY = Math.floor(minM / 12)
        const maxY = Math.ceil(maxM / 12)

        const img = toy.image_url && !toy.image_url.includes('placeholder')
          ? (toy.image_url.startsWith('http') ? toy.image_url : `http://localhost:8000${toy.image_url}`)
          : 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80'

        return {
          id: `api-toy-${toy.id}`,
          title: toy.name,
          category: 'regular_toys',
          categoryBadge: 'ИГРУШКА В ПОДАРОК',
          ageGroup,
          ageText: `${minY || 0}–${maxY} года`,
          occasions: ['birthday', 'visit', 'just_because'],
          occasionLabel: 'Обычная развивающая игрушка',
          price: toy.price || 8900,
          interests: ['motor', 'logic'],
          description: toy.description || 'Экологичная развивающая игрушка Монтессори из массива дерева.',
          benefit: 'Способствует развитию логики, сенсорной координации и мышления.',
          items: [
            toy.name,
            'Опция: фирменный деревянный бокс Alpha с атласной лентой',
            'Бесплатная именная открытка с пожеланием'
          ],
          image: img,
          isHot: toy.id % 2 === 0
        }
      })

      // Merge avoiding duplicate names
      const existingTitles = new Set(giftProducts.value.map(p => p.title.toLowerCase()))
      const newItems = apiGifts.filter(p => !existingTitles.has(p.title.toLowerCase()))
      giftProducts.value = [...giftProducts.value, ...newItems]
    }
  } catch (err) {
    console.log('Using local gift catalog')
  }
}

// CATEGORY COUNT HELPER
const getCategoryCount = (catId: string) => {
  if (catId === 'all') return giftProducts.value.length
  if (catId === 'certificates') return 1
  return giftProducts.value.filter(p => p.category === catId).length
}

const handleCategorySelect = (catId: string) => {
  activeCategory.value = catId
  if (catId === 'certificates') {
    const el = document.getElementById('gift-cert-section')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  } else {
    const el = document.getElementById('gift-catalog')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }
}

// -------------------------------------------------------------
// FILTERING & SORTING LOGIC
// -------------------------------------------------------------
const filteredProducts = computed(() => {
  let list = giftProducts.value.slice()

  // 1. Category Tab Filter
  if (activeCategory.value !== 'all' && activeCategory.value !== 'certificates') {
    list = list.filter(p => p.category === activeCategory.value)
  }

  // 2. Age Filter
  if (selectedAge.value !== 'all') {
    list = list.filter(p => p.ageGroup === selectedAge.value)
  }

  // 3. Occasion Filter
  if (selectedOccasion.value !== 'all') {
    list = list.filter(p => p.occasions.includes(selectedOccasion.value))
  }

  // 4. Budget Filter
  if (selectedBudget.value !== 'all') {
    if (selectedBudget.value === 'under_15') {
      list = list.filter(p => p.price <= 15000)
    } else if (selectedBudget.value === '15_30') {
      list = list.filter(p => p.price > 15000 && p.price <= 30000)
    } else if (selectedBudget.value === '30_50') {
      list = list.filter(p => p.price > 30000 && p.price <= 50000)
    } else if (selectedBudget.value === 'over_50') {
      list = list.filter(p => p.price > 50000)
    }
  }

  // 5. Interests Filter
  if (selectedInterest.value !== 'all') {
    list = list.filter(p => p.interests.includes(selectedInterest.value))
  }

  // 6. Format Filter (Обычные игрушки vs Боксы)
  if (selectedFormat.value !== 'all') {
    if (selectedFormat.value === 'regular_toys') {
      list = list.filter(p => p.category === 'regular_toys' || p.category === 'toys')
    } else if (selectedFormat.value === 'boxes_sets') {
      list = list.filter(p => p.category !== 'regular_toys' && p.category !== 'toys')
    }
  }

  // 7. Search Query
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q) ||
      p.categoryBadge.toLowerCase().includes(q)
    )
  }

  // 8. Sorting
  if (currentSort.value === 'price_asc') {
    list.sort((a, b) => a.price - b.price)
  } else if (currentSort.value === 'price_desc') {
    list.sort((a, b) => b.price - a.price)
  } else if (currentSort.value === 'popular') {
    list.sort((a, b) => (b.isHot ? 1 : 0) - (a.isHot ? 1 : 0))
  }

  return list
})

// Highlight matching products when filter is applied
const isProductHighMatch = (prod: GiftProduct) => {
  if (!hasActiveFinderFilters.value) return false
  let score = 0
  if (selectedAge.value !== 'all' && prod.ageGroup === selectedAge.value) score++
  if (selectedOccasion.value !== 'all' && prod.occasions.includes(selectedOccasion.value)) score++
  if (selectedInterest.value !== 'all' && prod.interests.includes(selectedInterest.value)) score++
  return score >= 2
}

// -------------------------------------------------------------
// CART ACTIONS
// -------------------------------------------------------------
const addedProductIds = ref<(string | number)[]>([])

const handleAddToCart = (prod: GiftProduct) => {
  const isRegular = prod.category === 'regular_toys'
  const title = isRegular 
    ? `${prod.title} (Оформлено как подарок 🎁)` 
    : prod.title

  addItem({
    id: prod.id,
    title,
    price: prod.price,
    image: prod.image
  })

  if (!addedProductIds.value.includes(prod.id)) {
    addedProductIds.value.push(prod.id)
  }

  showToast(`«${prod.title}» в подарочной упаковке добавлен в корзину! 🎁`)
}

// -------------------------------------------------------------
// QUICK VIEW & PERSONALIZATION MODAL
// -------------------------------------------------------------
const isQuickViewOpen = ref(false)
const activeProduct = ref<GiftProduct | null>(null)
const selectedRibbon = ref('gold')
const includeGiftPackaging = ref(true)
const modalGiftRecipient = ref('')
const modalGiftSender = ref('')
const modalGiftMessage = ref('')

const ribbonColors = [
  { id: 'gold', name: 'Золотая', color: '#D4AF37' },
  { id: 'lavender', name: 'Лаванда', color: '#B39DDB' },
  { id: 'mint', name: 'Мятная', color: '#80CBC4' },
  { id: 'ruby', name: 'Рубиновая', color: '#E53935' },
]

const modalCalculatedPrice = computed(() => {
  if (!activeProduct.value) return 0
  return activeProduct.value.price
})

const openQuickView = (prod: GiftProduct) => {
  activeProduct.value = prod
  includeGiftPackaging.value = true
  modalGiftRecipient.value = ''
  modalGiftSender.value = ''
  modalGiftMessage.value = 'Расти счастливым и любознательным! Пусть каждый день будет наполнен радостью открытий!'
  isQuickViewOpen.value = true
}

const closeQuickView = () => {
  isQuickViewOpen.value = false
  activeProduct.value = null
}

const handleAddModalProductToCart = () => {
  if (!activeProduct.value) return

  const ribbonObj = ribbonColors.find(r => r.id === selectedRibbon.value)
  const ribbonName = ribbonObj ? ribbonObj.name : 'Золотая'
  const recipient = modalGiftRecipient.value ? ` для ${modalGiftRecipient.value}` : ''
  const packNote = includeGiftPackaging.value ? ` (Подарочная упаковка, лента: ${ribbonName})` : ''
  const customTitle = `${activeProduct.value.title}${recipient}${packNote}`

  addItem({
    id: `${activeProduct.value.id}-${Date.now()}`,
    title: customTitle,
    price: modalCalculatedPrice.value,
    image: activeProduct.value.image
  })

  showToast(`Игрушка оформлена как подарок и добавлена в корзину! 🎁`)
  closeQuickView()
}

// -------------------------------------------------------------
// CERTIFICATE CONFIGURATOR (СОХРАНЕН И УЛУЧШЕН)
// -------------------------------------------------------------
const selectedDuration = ref('3m')
const selectedTier = ref<'starter' | 'explorer'>('explorer')
const isSubmittingCert = ref(false)

const durations = [
  { id: '1m', months: '1 месяц', title: 'Знакомство', multiplier: 1 },
  { id: '3m', months: '3 месяца', title: 'Сезон игр', multiplier: 3, badge: '🔥 ПОПУЛЯРНЫЙ' },
  { id: '6m', months: '6 месяцев', title: 'Полгода открытий', multiplier: 5, badge: '🎁 1 МЕС В ПОДАРОК' },
  { id: '12m', months: '12 месяцев', title: 'Целый год заботы', multiplier: 10, badge: '⭐ 2 МЕС В ПОДАРОК' },
]

const currentDurationObj = computed(() => {
  return durations.find(d => d.id === selectedDuration.value) || durations[1]
})

const certForm = ref({
  recipientName: 'Маленькому Мише',
  senderName: 'От любящих крестных',
  message: 'Расти здоровым, любознательным и счастливым! Пусть каждый день приносит новые открытия!'
})

const calculatedCertPrice = computed(() => {
  const baseMonthly = selectedTier.value === 'starter' ? 14900 : 22900
  const mult = currentDurationObj.value.multiplier
  return baseMonthly * mult
})

const handleBuyCertificate = async () => {
  isSubmittingCert.value = true
  const monthsMap: Record<string, number> = { '1m': 1, '3m': 3, '6m': 6, '12m': 12 }
  const durationMonths = monthsMap[selectedDuration.value] || 3

  try {
    const res = await purchaseGiftSubscription(durationMonths, certForm.value.recipientName)
    if (res?.gift_subscription) {
      console.log('Gift subscription created:', res.gift_subscription.code)
    }
  } catch (e: any) {
    console.log('Покупка сертификата регистрируется локально.')
  } finally {
    isSubmittingCert.value = false
  }

  addItem({
    id: `cert-${Date.now()}`,
    title: `Подарочный сертификат «${currentDurationObj.value.months} (${selectedTier.value === 'starter' ? 'Starter' : 'Explorer'})» для ${certForm.value.recipientName}`,
    price: calculatedCertPrice.value,
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&q=80'
  })

  showToast(`Подарочный сертификат добавлен в корзину! 🎟️`)
  navigateTo('/cart')
}

// -------------------------------------------------------------
// PRICE FORMATTER
// -------------------------------------------------------------
const formatPrice = (val: number) => {
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

// Sync with route query if any & load API toys
onMounted(async () => {
  if (route.query.category) {
    activeCategory.value = String(route.query.category)
  }
  if (route.query.age) {
    selectedAge.value = String(route.query.age)
  }
  await loadApiToys()
})
</script>

<style scoped>
.gift-page {
  min-height: 100vh;
  background-color: #FFF8F0;
  color: #1A1A2E;
  font-family: 'DM Sans', sans-serif;
  padding-bottom: 90px;
  overflow-x: hidden;
}

.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-content {
  padding-top: 32px;
}

/* ============================================================
   HERO SECTION
============================================================ */
.gift-hero {
  text-align: center;
  margin-bottom: 40px;
}

.hero-content {
  max-width: 860px;
  margin: 0 auto 40px auto;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #F0EDFF;
  color: #624CE0;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 12px;
  letter-spacing: 1.2px;
  padding: 8px 18px;
  border-radius: 30px;
  margin-bottom: 18px;
  border: 1px solid rgba(98, 76, 224, 0.15);
}

.badge-sparkle {
  font-size: 14px;
}

.gift-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 44px;
  color: #1A1A2E;
  margin-bottom: 16px;
  letter-spacing: -0.6px;
  line-height: 1.2;
}

.gift-subtitle {
  font-size: 16.5px;
  color: #6B6B82;
  line-height: 1.65;
  margin-bottom: 28px;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 14.5px;
  padding: 12px 22px;
  border-radius: 14px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.primary-btn {
  background: #624CE0;
  color: #FFFFFF;
  box-shadow: 0 6px 20px rgba(98, 76, 224, 0.28);
}

.primary-btn:hover {
  background: #513bc7;
  transform: translateY(-2px);
}

.regular-toy-btn {
  background: #058563;
  color: #FFFFFF;
  box-shadow: 0 6px 18px rgba(5, 133, 99, 0.25);
}

.regular-toy-btn:hover {
  background: #036b4f;
  transform: translateY(-2px);
}

.secondary-btn {
  background: #FFFFFF;
  color: #1A1A2E;
  border: 1px solid #E4E4EF;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.secondary-btn:hover {
  border-color: #624CE0;
  color: #624CE0;
  transform: translateY(-2px);
}

.outline-btn {
  background: #FFF2DF;
  color: #8C5300;
  border: 1px solid #FFE0B2;
}

.outline-btn:hover {
  background: #FFE8CC;
  transform: translateY(-2px);
}

/* Value props row */
.value-props-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.val-card {
  background: #FFFFFF;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  text-align: left;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
  transition: transform 0.2s ease;
}

.val-card:hover {
  transform: translateY(-2px);
}

.val-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.wood-icon { background: #E8F5E9; }
.ribbon-icon { background: #FCE4EC; }
.card-icon { background: #FFF9C4; }
.delivery-icon { background: #E0F2FE; }

.val-text h4 {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 14.5px;
  margin-bottom: 4px;
  color: #1A1A2E;
}

.val-text p {
  font-size: 12px;
  color: #7B7B93;
  line-height: 1.45;
  margin: 0;
}

/* ============================================================
   REGULAR TOYS CALLOUT BANNER
============================================================ */
.gift-callout-banner {
  background: linear-gradient(135deg, #FAF7FF 0%, #EFFBF6 100%);
  border: 1.5px solid #D6EFE5;
  border-radius: 24px;
  padding: 24px 30px;
  display: flex;
  align-items: center;
  gap: 22px;
  margin-bottom: 54px;
  box-shadow: 0 6px 20px rgba(5, 133, 99, 0.05);
}

.callout-icon {
  font-size: 40px;
  background: #FFFFFF;
  width: 68px;
  height: 68px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.callout-content {
  flex: 1;
}

.callout-tag {
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
  color: #058563;
  margin-bottom: 4px;
}

.callout-content h3 {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 18px;
  color: #1A1A2E;
  margin-bottom: 4px;
}

.callout-content p {
  font-size: 13.5px;
  color: #555570;
  line-height: 1.5;
  margin: 0;
}

.callout-action-btn {
  background: #058563;
  color: #FFFFFF;
  border: none;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 13.5px;
  padding: 12px 20px;
  border-radius: 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.callout-action-btn:hover {
  background: #036b4f;
  transform: translateY(-2px);
}

/* ============================================================
   SMART GIFT FINDER (ФУНКЦИЯ «ПОДОБРАТЬ ПОДАРОК»)
============================================================ */
.gift-finder-section {
  margin-bottom: 64px;
}

.finder-header {
  text-align: center;
  margin-bottom: 24px;
}

.finder-badge {
  display: inline-block;
  background: #FFF1C5;
  color: #8C5300;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 1px;
  padding: 5px 14px;
  border-radius: 20px;
  margin-bottom: 8px;
}

.finder-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 32px;
  color: #1A1A2E;
  margin-bottom: 8px;
}

.finder-subtitle {
  font-size: 15px;
  color: #7B7B93;
  max-width: 680px;
  margin: 0 auto;
}

.finder-box-card {
  background: linear-gradient(180deg, #FFFFFF 0%, #FAF8FF 100%);
  border-radius: 28px;
  padding: 34px;
  border: 2px solid #EFEAFD;
  box-shadow: 0 12px 36px rgba(98, 76, 224, 0.06);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.finder-filter-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.group-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.group-num {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #624CE0;
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.group-label {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 14.5px;
  color: #1A1A2E;
}

.highlight-val {
  color: #624CE0;
  font-weight: 800;
}

.finder-options-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.finder-pill-btn {
  background: #FAFAFC;
  border: 1.5px solid #EAEAF2;
  border-radius: 16px;
  padding: 9px 16px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px;
  font-weight: 600;
  color: #4A4A68;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.finder-pill-btn:hover {
  border-color: #7C5CFC;
  background: #FFFFFF;
  transform: translateY(-1px);
}

.finder-pill-btn.active {
  background: #624CE0;
  border-color: #624CE0;
  color: #FFFFFF;
  box-shadow: 0 4px 14px rgba(98, 76, 224, 0.28);
}

.pill-icon {
  font-size: 15px;
}

.pill-sub {
  font-size: 11px;
  opacity: 0.8;
  margin-left: 2px;
}

.finder-action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 18px;
  border-top: 1px solid #ECECF4;
  flex-wrap: wrap;
  gap: 16px;
}

.found-counter-box {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14.5px;
  color: #4A4A68;
}

.counter-sparkle {
  font-size: 18px;
}

.found-counter-box strong {
  color: #624CE0;
  font-size: 17px;
  font-weight: 800;
}

.finder-btn-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reset-finder-btn {
  background: none;
  border: none;
  color: #8A8A9E;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 12px;
}

.reset-finder-btn:hover {
  color: #E53935;
}

.submit-finder-btn {
  background: #624CE0;
  color: #FFFFFF;
  text-decoration: none;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 14.5px;
  padding: 12px 24px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 6px 18px rgba(98, 76, 224, 0.25);
  transition: all 0.2s ease;
}

.submit-finder-btn:hover {
  background: #513bc7;
  transform: translateY(-1px);
}

/* ============================================================
   CATALOG SECTION & TABS
============================================================ */
.catalog-section {
  margin-bottom: 72px;
}

.catalog-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 18px;
}

.sub-badge {
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 800;
  color: #624CE0;
  letter-spacing: 1.2px;
}

.section-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 30px;
  margin-top: 4px;
  color: #1A1A2E;
}

.section-subtitle {
  font-size: 15px;
  color: #7B7B93;
  max-width: 720px;
  margin: 8px auto 0 auto;
}

.catalog-toolbar {
  display: flex;
  align-items: center;
  gap: 14px;
}

.catalog-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.catalog-search-wrap svg {
  position: absolute;
  left: 14px;
  pointer-events: none;
}

.search-input {
  background: #FFFFFF;
  border: 1.5px solid #EAEAF2;
  border-radius: 12px;
  padding: 10px 36px 10px 38px;
  font-size: 13.5px;
  outline: none;
  width: 220px;
  font-family: 'DM Sans', sans-serif;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #624CE0;
}

.clear-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  font-size: 16px;
  color: #8A8A9E;
  cursor: pointer;
}

.catalog-sort-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-title {
  font-size: 13px;
  color: #7B7B93;
}

.sort-select {
  background: #FFFFFF;
  border: 1.5px solid #EAEAF2;
  border-radius: 12px;
  padding: 9px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #1A1A2E;
  outline: none;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
}

/* Category Tabs Scroll */
.categories-tabs-scroll {
  overflow-x: auto;
  padding-bottom: 12px;
  margin-bottom: 24px;
  -webkit-overflow-scrolling: touch;
}

.tabs-container {
  display: flex;
  gap: 8px;
  min-width: max-content;
}

.cat-tab-btn {
  background: #FFFFFF;
  border: 1.5px solid #EAEAF2;
  border-radius: 14px;
  padding: 10px 16px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px;
  font-weight: 700;
  color: #4A4A68;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.cat-tab-btn:hover {
  border-color: #624CE0;
  color: #624CE0;
}

.cat-tab-btn.highlight-tab {
  border-color: #058563;
  color: #058563;
  background: #F0FDF8;
}

.cat-tab-btn.active {
  background: #1A1A2E;
  border-color: #1A1A2E;
  color: #FFFFFF;
  box-shadow: 0 4px 14px rgba(26, 26, 46, 0.2);
}

.tab-icon {
  font-size: 16px;
}

.tab-count {
  background: #F0EDFF;
  color: #624CE0;
  font-size: 11px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 10px;
}

.cat-tab-btn.active .tab-count {
  background: rgba(255, 255, 255, 0.2);
  color: #FFFFFF;
}

/* Active filters banner */
.active-filters-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  background: #FFFFFF;
  border-radius: 14px;
  padding: 12px 18px;
  margin-bottom: 24px;
  border: 1px solid #EAEAF2;
}

.filter-lead {
  font-size: 13px;
  font-weight: 700;
  color: #7B7B93;
}

.filter-chip {
  background: #F0EDFF;
  color: #624CE0;
  font-size: 12.5px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.filter-chip button {
  background: none;
  border: none;
  color: #624CE0;
  font-size: 14px;
  cursor: pointer;
}

.clear-all-filters-btn {
  background: none;
  border: none;
  color: #E53935;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  margin-left: auto;
}

/* ============================================================
   GIFT PRODUCTS GRID & CARDS
============================================================ */
.gift-products-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 26px;
}

.gift-card {
  background: #FFFFFF;
  border-radius: 24px;
  padding: 18px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.25s ease;
}

.gift-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(98, 76, 224, 0.09);
  border-color: rgba(98, 76, 224, 0.2);
}

.card-match-highlight {
  border: 2px solid #624CE0;
  box-shadow: 0 8px 24px rgba(98, 76, 224, 0.12);
}

.regular-toy-card {
  border-top: 3px solid #058563;
}

.card-img-wrap {
  height: 220px;
  border-radius: 18px;
  background: #F4F5F9;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  margin-bottom: 16px;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.card-img-wrap:hover .card-img {
  transform: scale(1.05);
}

.card-badges-top {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
}

.cat-tag {
  background: rgba(26, 26, 46, 0.85);
  backdrop-filter: blur(4px);
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 10px;
  letter-spacing: 0.8px;
  padding: 4px 10px;
  border-radius: 8px;
}

.regular-cat-tag {
  background: rgba(5, 133, 99, 0.9);
}

.hot-tag {
  background: #FF5A5F;
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 8px;
}

.new-tag {
  background: #00B4D8;
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 8px;
}

.card-age-tag {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #FFF1C5;
  color: #7A5300;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.match-badge {
  position: absolute;
  bottom: 10px;
  left: 12px;
  right: 12px;
  background: #624CE0;
  color: #FFFFFF;
  font-size: 11.5px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 8px;
  text-align: center;
}

.card-body {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-category-sub {
  font-size: 12px;
  font-weight: 700;
  color: #624CE0;
  margin-bottom: 4px;
}

.card-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 18px;
  color: #1A1A2E;
  margin-bottom: 6px;
  cursor: pointer;
  line-height: 1.3;
}

.card-title:hover {
  color: #624CE0;
}

.card-desc {
  font-size: 13px;
  color: #7B7B93;
  line-height: 1.45;
  margin-bottom: 14px;
  min-height: 38px;
}

.box-items-preview {
  background: #FAFAFC;
  border-radius: 14px;
  padding: 12px 14px;
  margin-bottom: 14px;
  border: 1px solid #ECECF4;
}

.preview-heading {
  font-size: 11.5px;
  font-weight: 800;
  color: #1A1A2E;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preview-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-list li {
  font-size: 12px;
  color: #4A4A68;
  display: flex;
  align-items: center;
  gap: 6px;
}

.check-icon {
  color: #058563;
  font-weight: 800;
}

.more-items-item {
  font-size: 11px !important;
  color: #7B7B93 !important;
  margin-top: 2px;
}

.packaging-pill {
  font-size: 11.5px;
  color: #8C5300;
  background: #FFF8E7;
  padding: 5px 10px;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.card-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #F0F0F6;
  gap: 8px;
}

.price-box {
  display: flex;
  flex-direction: column;
}

.price-val {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 20px;
  color: #1A1A2E;
}

.price-sub {
  font-size: 11px;
  color: #7B7B93;
}

.card-btns-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.quick-view-btn {
  background: #F0EDFF;
  color: #624CE0;
  border: none;
  border-radius: 12px;
  padding: 9px 12px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.quick-view-btn:hover {
  background: #E4DFFF;
  transform: translateY(-1px);
}

.add-to-cart-btn {
  background: #624CE0;
  color: #FFFFFF;
  border: none;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 13px;
  padding: 9px 16px;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(98, 76, 224, 0.25);
  transition: all 0.2s ease;
  white-space: nowrap;
}

.add-to-cart-btn:hover {
  background: #513bc7;
}

.add-to-cart-btn.added {
  background: #058563;
  box-shadow: 0 4px 12px rgba(5, 133, 99, 0.25);
}

/* Empty state */
.no-results-card {
  text-align: center;
  background: #FFFFFF;
  border-radius: 24px;
  padding: 60px 24px;
  border: 1px dashed #D4D4E2;
}

.no-results-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.no-results-card h3 {
  font-family: 'Outfit', sans-serif;
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 8px;
}

.no-results-card p {
  font-size: 14.5px;
  color: #7B7B93;
  margin-bottom: 20px;
}

.reset-all-btn {
  background: #624CE0;
  color: #FFFFFF;
  border: none;
  font-weight: 700;
  font-size: 14px;
  padding: 12px 24px;
  border-radius: 12px;
  cursor: pointer;
}

/* ============================================================
   GIFT CERTIFICATE & SUBSCRIPTION (ПОДАРОЧНОЕ ЧЛЕНСТВО)
============================================================ */
.gift-cert-wrapper {
  background: #FFFFFF;
  border-radius: 32px;
  padding: 48px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.03);
  margin-bottom: 72px;
}

.cert-section-header {
  text-align: center;
  margin-bottom: 36px;
}

.cert-steps-bar {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 44px;
}

.cert-step-card {
  background: #FAF8FF;
  border-radius: 20px;
  padding: 22px;
  border: 1px solid #ECE8FC;
  display: flex;
  flex-direction: column;
}

.step-circle {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: #624CE0;
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.cert-step-card h4 {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 16px;
  margin-bottom: 4px;
}

.cert-step-card p {
  font-size: 13px;
  color: #7B7B93;
  line-height: 1.45;
  margin: 0;
}

.cert-config-grid {
  display: grid;
  grid-template-columns: 1.25fr 1fr;
  gap: 36px;
  align-items: flex-start;
}

.config-card {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.config-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 22px;
  color: #1A1A2E;
}

.config-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-label {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 14.5px;
  color: #1A1A2E;
}

.duration-selector-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.dur-item {
  background: #FAFAFC;
  border: 1.5px solid #EAEAF2;
  border-radius: 16px;
  padding: 14px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.2s ease;
}

.dur-item:hover {
  border-color: #624CE0;
}

.dur-item.active {
  background: #FAF8FF;
  border-color: #624CE0;
  box-shadow: 0 4px 14px rgba(98, 76, 224, 0.15);
}

.dur-months {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 16px;
  color: #1A1A2E;
}

.dur-name {
  font-size: 12px;
  color: #7B7B93;
}

.dur-tag {
  position: absolute;
  top: -8px;
  right: 8px;
  background: #FFD166;
  color: #1A1A2E;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 9px;
  padding: 2px 7px;
  border-radius: 10px;
}

.tier-selector-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.tier-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #FAFAFC;
  border: 1.5px solid #EAEAF2;
  border-radius: 14px;
  padding: 12px 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tier-box.active {
  background: #FAF8FF;
  border-color: #624CE0;
}

.radio-mark {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #D2D2E0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tier-box.active .radio-mark {
  border-color: #624CE0;
}

.radio-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #624CE0;
}

.tier-box strong {
  display: block;
  font-size: 13px;
  font-weight: 700;
}

.tier-box p {
  font-size: 11.5px;
  color: #7B7B93;
  margin: 0;
}

.cert-inputs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.input-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.input-field label {
  font-size: 12px;
  font-weight: 700;
  color: #4A4A68;
}

.input-field input, .input-field textarea {
  padding: 10px 14px;
  border: 1.5px solid #EAEAF2;
  border-radius: 12px;
  font-size: 13px;
  font-family: 'DM Sans', sans-serif;
  outline: none;
}

.input-field input:focus, .input-field textarea:focus {
  border-color: #624CE0;
}

.message-field {
  margin-top: 4px;
}

/* Certificate Display Card */
.cert-display-col {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.luxury-cert-card {
  background: linear-gradient(135deg, #201A38 0%, #15102A 100%);
  border-radius: 24px;
  padding: 30px;
  color: #FFFFFF;
  box-shadow: 0 16px 40px rgba(26, 26, 46, 0.25);
  border: 1px solid rgba(255, 215, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.cert-pattern-overlay {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%);
}

.cert-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 22px;
}

.cert-brand {
  display: flex;
  flex-direction: column;
}

.cert-logo-text {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 15px;
  color: #FFD166;
  letter-spacing: 1px;
}

.cert-city {
  font-size: 9.5px;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 1.5px;
}

.cert-pill-badge {
  background: #FFD166;
  color: #1A1A2E;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 9.5px;
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: 0.8px;
}

.cert-for-lead {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.cert-rec-name {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 26px;
  color: #FFFFFF;
  margin-top: 2px;
  margin-bottom: 12px;
}

.cert-meta-tag {
  display: inline-block;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(6px);
  color: #FFD166;
  font-size: 12px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 10px;
  margin-bottom: 14px;
}

.cert-quote-box {
  min-height: 48px;
  margin-bottom: 20px;
}

.cert-quote {
  font-style: italic;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  margin: 0;
}

.cert-bottom-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  padding-top: 14px;
}

.from-lead {
  display: block;
  font-size: 10.5px;
  color: rgba(255, 255, 255, 0.6);
}

.from-name {
  font-size: 13.5px;
  color: #FFFFFF;
}

.cert-stamp {
  font-family: 'Outfit', sans-serif;
  font-size: 8.5px;
  font-weight: 800;
  color: #FFD166;
  border: 1px solid rgba(255, 209, 102, 0.4);
  padding: 3px 8px;
  border-radius: 6px;
  letter-spacing: 0.8px;
}

/* Order Action Box */
.cert-order-action {
  background: #FAF8FF;
  border-radius: 20px;
  padding: 22px;
  border: 1px solid #ECE8FC;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-price-label {
  font-size: 13.5px;
  color: #7B7B93;
}

.order-price-val {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 24px;
  color: #1A1A2E;
}

.cert-buy-btn {
  background: #624CE0;
  color: #FFFFFF;
  border: none;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 15px;
  padding: 13px;
  border-radius: 14px;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(98, 76, 224, 0.25);
  transition: all 0.2s ease;
}

.cert-buy-btn:hover {
  background: #513bc7;
}

.instant-delivery-hint {
  font-size: 11.5px;
  color: #7B7B93;
  text-align: center;
}

/* ============================================================
   PACKAGING SHOWCASE
============================================================ */
.packaging-showcase {
  text-align: center;
}

.pack-header {
  margin-bottom: 32px;
}

.pack-cards-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.pack-card {
  background: #FFFFFF;
  border-radius: 22px;
  padding: 26px 20px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
  text-align: left;
}

.pack-num {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 24px;
  color: #624CE0;
  margin-bottom: 10px;
}

.pack-card h4 {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 15px;
  margin-bottom: 6px;
  color: #1A1A2E;
}

.pack-card p {
  font-size: 12.5px;
  color: #7B7B93;
  line-height: 1.45;
  margin: 0;
}

/* ============================================================
   QUICK VIEW & PERSONALIZATION MODAL
============================================================ */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(26, 26, 46, 0.65);
  backdrop-filter: blur(6px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.gift-modal-card {
  background: #FFFFFF;
  border-radius: 28px;
  max-width: 920px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.modal-close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: #F4F4F8;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7B7B93;
  transition: all 0.2s;
  z-index: 2;
}

.modal-close-btn:hover {
  background: #EAEAF2;
  color: #1A1A2E;
}

.modal-grid {
  display: grid;
  grid-template-columns: 1fr 1.25fr;
  gap: 28px;
}

.modal-img-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal-main-img {
  width: 100%;
  height: 320px;
  object-fit: cover;
  border-radius: 20px;
  background: #F4F5F9;
}

.modal-badges-row {
  display: flex;
  gap: 8px;
}

.modal-tag {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 8px;
}

.modal-tag.age {
  background: #FFF1C5;
  color: #7A5300;
}

.modal-tag.cat {
  background: #F0EDFF;
  color: #624CE0;
}

.modal-info-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.modal-occasion {
  font-size: 12px;
  font-weight: 700;
  color: #624CE0;
}

.modal-prod-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 24px;
  color: #1A1A2E;
  line-height: 1.25;
}

.modal-prod-desc {
  font-size: 13.5px;
  color: #6B6B82;
  line-height: 1.5;
}

.modal-contents-box {
  background: #FAF8FF;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid #EFEAFD;
}

.box-contents-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 13.5px;
  color: #1A1A2E;
  margin-bottom: 8px;
}

.modal-items-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.modal-items-list li {
  font-size: 12.5px;
  color: #4A4A68;
  display: flex;
  align-items: center;
  gap: 6px;
}

.it-check {
  color: #058563;
  font-weight: 800;
}

.montessori-benefit-box {
  background: #E8FAF4;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 12.5px;
  color: #058563;
  line-height: 1.45;
}

.montessori-benefit-box strong {
  display: block;
  font-weight: 800;
  margin-bottom: 2px;
}

/* Customizer (Ribbon + Text) */
.modal-customizer {
  background: #FAFAFC;
  border: 1.5px solid #EAEAF2;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.customizer-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 13.5px;
  color: #1A1A2E;
}

.packaging-checkbox-row {
  background: #F0FDF8;
  border: 1px solid #D6EFE5;
  border-radius: 10px;
  padding: 8px 12px;
}

.pack-checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: #1A1A2E;
  cursor: pointer;
}

.pack-checkbox {
  accent-color: #058563;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.ribbon-select-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.custom-label {
  font-size: 11.5px;
  font-weight: 700;
  color: #7B7B93;
}

.ribbon-pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.ribbon-btn {
  background: #FFFFFF;
  border: 1.5px solid #EAEAF2;
  border-radius: 10px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.ribbon-btn.active {
  border-color: #624CE0;
  background: #F8F6FF;
}

.ribbon-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.greeting-fields-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.modal-input-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.modal-input, .modal-textarea {
  background: #FFFFFF;
  border: 1.5px solid #EAEAF2;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 12.5px;
  font-family: 'DM Sans', sans-serif;
  outline: none;
}

.modal-input:focus, .modal-textarea:focus {
  border-color: #624CE0;
}

.modal-footer-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
}

.modal-price-col {
  display: flex;
  flex-direction: column;
}

.m-price-label {
  font-size: 11.5px;
  color: #7B7B93;
}

.m-price-val {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 24px;
  color: #1A1A2E;
}

.modal-add-cart-btn {
  background: #624CE0;
  color: #FFFFFF;
  border: none;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 14px;
  padding: 12px 22px;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(98, 76, 224, 0.25);
  transition: all 0.2s;
}

.modal-add-cart-btn:hover {
  background: #513bc7;
}

/* ============================================================
   TOAST NOTIFICATION
============================================================ */
.gift-toast {
  position: fixed;
  bottom: 28px;
  right: 28px;
  background: #1A1A2E;
  color: #FFFFFF;
  border-radius: 18px;
  padding: 16px 22px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  z-index: 10000;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toast-icon {
  font-size: 20px;
}

.toast-text {
  font-size: 13.5px;
  font-weight: 600;
}

.toast-cart-link {
  background: #624CE0;
  color: #FFFFFF;
  text-decoration: none;
  font-size: 12.5px;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 10px;
  white-space: nowrap;
}

.toast-enter-active, .toast-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-enter-from, .toast-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* ============================================================
   RESPONSIVE STYLES
============================================================ */
@media (max-width: 1080px) {
  .value-props-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .pack-cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .gift-products-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .cert-config-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .gift-title {
    font-size: 32px;
  }

  .value-props-grid {
    grid-template-columns: 1fr;
  }

  .gift-callout-banner {
    flex-direction: column;
    text-align: center;
  }

  .pack-cards-grid {
    grid-template-columns: 1fr;
  }

  .gift-products-grid {
    grid-template-columns: 1fr;
  }

  .cert-steps-bar {
    grid-template-columns: 1fr;
  }

  .catalog-header-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .catalog-toolbar {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    width: 100%;
  }

  .finder-box-card, .gift-cert-wrapper {
    padding: 22px 18px;
    border-radius: 20px;
  }

  .duration-selector-grid, .tier-selector-grid, .cert-inputs-grid {
    grid-template-columns: 1fr;
  }

  .modal-grid {
    grid-template-columns: 1fr;
  }

  .modal-main-img {
    height: 220px;
  }

  .modal-input-row {
    grid-template-columns: 1fr;
  }

  .finder-action-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .finder-btn-wrap {
    flex-direction: column;
  }

  .submit-finder-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
