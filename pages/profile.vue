<template>
  <div class="profile-page">
    <TheHeader />

    <main class="profile-container">
      <nav class="breadcrumbs" aria-label="Хлебные крошки">
        <NuxtLink to="/">Главная</NuxtLink>
        <span>/</span>
        <span>Профиль</span>
        <template v-if="activeSection !== 'profile'">
          <span>/</span>
          <span>{{ currentSection.label }}</span>
        </template>
      </nav>

      <div class="profile-layout">
        <aside class="profile-sidebar" aria-label="Разделы профиля">
          <div class="sidebar-card">
            <button type="button" class="sidebar-link" :class="{ active: activeSection === 'profile' }" @click="selectSection('profile')">
              <span class="sidebar-icon">👤</span>
              <span>Профиль</span>
            </button>
            <button type="button" class="sidebar-link" :class="{ active: activeSection === 'history' || activeSection === 'orders' }" @click="selectSection('history')">
              <span class="sidebar-icon">📦</span>
              <span>История заказов</span>
              <span v-if="orders.length" class="sidebar-count">{{ orders.length }}</span>
            </button>
            <button type="button" class="sidebar-link" :class="{ active: activeSection === 'favorites' }" @click="selectSection('favorites')">
              <span class="sidebar-icon">♡</span>
              <span>Избранное</span>
              <span v-if="favorites.length" class="sidebar-count">{{ favorites.length }}</span>
            </button>
            <button type="button" class="sidebar-link" :class="{ active: activeSection === 'promocodes' }" @click="selectSection('promocodes')">
              <span class="sidebar-icon">%</span>
              <span>Мои промокоды</span>
            </button>

          </div>

          <div class="sidebar-card compact-card">
            <button type="button" class="sidebar-link" :class="{ active: activeSection === 'children' }" @click="selectSection('children')">
              <span class="sidebar-icon">🧸</span>
              <span>Мои дети</span>
            </button>
          </div>

        </aside>

        <section class="profile-content">
          <template v-if="activeSection === 'profile'">
          <div class="welcome-card">
            <div class="welcome-copy">
              <div class="welcome-heading-row">
                <div class="welcome-avatar" :class="{ authenticated: user }">
                  {{ user ? firstName.charAt(0).toUpperCase() : '☺' }}
                </div>
                <div>
                  <span class="welcome-kicker">ЛИЧНЫЙ КАБИНЕТ ALPHA</span>
                  <h1>{{ user ? `Привет, ${firstName}!` : 'Привет!' }}</h1>
                </div>
              </div>

              <p v-if="!user" class="welcome-description">
                Войдите или создайте профиль, чтобы сохранять избранное, видеть заказы и управлять подпиской.
              </p>
              <p v-else class="welcome-description">
                Рады видеть вас снова. Здесь собраны ваши заказы, подписка и персональные предложения.
              </p>

              <button v-if="!user" class="auth-primary-btn" @click="openAuthModal('login')">
                Войти или создать профиль
                <span>→</span>
              </button>

              <div v-else class="profile-summary">
                <div class="summary-item">
                  <span>Email</span>
                  <strong>{{ user.email }}</strong>
                </div>
                <div class="summary-item">
                  <span>Телефон</span>
                  <strong>{{ user.phone || 'Не указан' }}</strong>
                </div>
                <div class="profile-summary-actions">
                  <button class="edit-profile-btn" @click="isEditOpen = !isEditOpen">
                    {{ isEditOpen ? '✕ Закрыть' : '✏️ Изменить данные' }}
                  </button>
                  <button class="logout-link" @click="logout">Выйти</button>
                </div>
              </div>
            </div>

            <div class="welcome-illustration" aria-hidden="true">
              <span class="shape shape-purple"></span>
              <span class="shape shape-yellow"></span>
              <span class="shape shape-mint"></span>
              <span class="welcome-bear">🧸</span>
            </div>
          </div>

          <!-- Inline Edit Form -->
          <Transition name="slide-down">
            <div v-if="isEditOpen && user" class="inline-edit-form">
              <h3 class="edit-form-title">Редактирование данных</h3>
              <div class="edit-form-grid">
                <div class="edit-form-group">
                  <label>Имя</label>
                  <input v-model="editForm.name" type="text" class="edit-input" placeholder="Ваше имя" />
                </div>
                <div class="edit-form-group">
                  <label>Email</label>
                  <input v-model="editForm.email" type="email" class="edit-input" placeholder="Ваш email" />
                </div>
                <div class="edit-form-group">
                  <label>Телефон</label>
                  <input v-model="editForm.phone" type="tel" class="edit-input" placeholder="+7 (___) ___-__-__" />
                </div>
              </div>
              <div class="edit-form-actions">
                <button class="edit-save-btn" :disabled="isSaving" @click="saveProfile">
                  {{ isSaving ? 'Сохраняем...' : 'Сохранить изменения' }}
                </button>
                <span v-if="saveSuccess" class="edit-save-success">✓ Сохранено</span>
              </div>
            </div>
          </Transition>

          <section id="promocodes" class="promos-section">
            <div class="section-heading-row">
              <div>
                <span class="section-kicker">ПЕРСОНАЛЬНЫЕ ПРЕДЛОЖЕНИЯ</span>
                <h2>Промокоды</h2>
              </div>
              <NuxtLink to="/shop" class="all-promos-link">Смотреть товары →</NuxtLink>
            </div>

            <div class="promos-grid">
              <article v-for="promo in promos" :key="promo.code" class="promo-card">
                <div class="promo-discount" :class="promo.color">{{ promo.discount }}</div>
                <div class="promo-body">
                  <span class="promo-condition">{{ promo.condition }}</span>
                  <div class="promo-code-row">
                    <strong>{{ promo.code }}</strong>
                    <button type="button" class="copy-btn" :aria-label="`Скопировать промокод ${promo.code}`" @click="copyPromo(promo.code)">
                      {{ copiedCode === promo.code ? '✓' : '⧉' }}
                    </button>
                  </div>
                  <p>{{ promo.description }}</p>
                </div>
                <NuxtLink :to="promo.to" class="promo-action">Применить →</NuxtLink>
              </article>
            </div>
          </section>

          <section class="quick-actions-section">
            <NuxtLink to="/subscription" class="quick-action-card purple-card">
              <span class="quick-icon">✨</span>
              <div>
                <strong>Подписка Alpha</strong>
                <p>Новые развивающие игрушки регулярно</p>
              </div>
              <span class="quick-arrow">→</span>
            </NuxtLink>

            <NuxtLink to="/child" class="quick-action-card mint-card">
              <span class="quick-icon">👶</span>
              <div>
                <strong>Профили детей</strong>
                <p>Возраст, интересы и подборки</p>
              </div>
              <span class="quick-arrow">→</span>
            </NuxtLink>
          </section>
          </template>

          <section v-else class="cabinet-section">
            <div class="cabinet-title-row">
              <div>
                <span class="section-kicker">ЛИЧНЫЙ КАБИНЕТ ALPHA</span>
                <h1>{{ currentSection.label }}</h1>
              </div>
              <button type="button" class="back-profile-btn" @click="selectSection('profile')">← В профиль</button>
            </div>

            <div v-if="activeSection === 'bonus'" class="bonus-panel content-panel">
              <div class="bonus-card">
                <span>ALPHA BONUS</span>
                <strong>0</strong>
                <small>№ 2221 6086 1665 5410</small>
              </div>
              <div class="bonus-note">
                <span>🎂</span>
                <div>
                  <strong>Получайте 3000 бонусов</strong>
                  <p>Ко дню рождения ребёнка</p>
                </div>
              </div>
            </div>

            <div v-else-if="activeSection === 'promocodes'" class="section-stack">
              <div class="empty-state compact-empty">
                <span class="empty-icon">🎟️</span>
                <div>
                  <h2>Персональные</h2>
                  <p>Новые персональные промокоды появятся здесь автоматически.</p>
                </div>
              </div>
              <h2 class="subsection-title">Общие промокоды</h2>
              <div class="promos-grid">
                <article v-for="promo in promos" :key="promo.code" class="promo-card">
                  <div class="promo-discount" :class="promo.color">{{ promo.discount }}</div>
                  <div class="promo-body">
                    <span class="promo-condition">{{ promo.condition }}</span>
                    <div class="promo-code-row">
                      <strong>{{ promo.code }}</strong>
                      <button type="button" class="copy-btn" :aria-label="`Скопировать промокод ${promo.code}`" @click="copyPromo(promo.code)">
                        {{ copiedCode === promo.code ? '✓' : '⧉' }}
                      </button>
                    </div>
                    <p>{{ promo.description }}</p>
                  </div>
                  <NuxtLink :to="promo.to" class="promo-action">Применить →</NuxtLink>
                </article>
              </div>
            </div>

            <div v-else-if="activeSection === 'favorites'" class="content-panel">
              <div v-if="favorites.length" class="favorites-grid">
                <article v-for="item in favorites" :key="item.id" class="favorite-card">
                  <NuxtLink :to="`/product/${item.id}`" class="favorite-image-wrap">
                    <img v-if="item.image" :src="item.image" :alt="item.title" />
                    <span v-else>🧸</span>
                  </NuxtLink>
                  <div class="favorite-info">
                    <h3>{{ item.title }}</h3>
                    <strong v-if="item.price">{{ formatPrice(item.price) }} ₸</strong>
                    <button type="button" @click="toggleFavorite(item)">Убрать из избранного</button>
                  </div>
                </article>
              </div>
              <div v-else class="empty-state">
                <span class="empty-icon">♡</span>
                <div>
                  <h2>В избранном пока пусто</h2>
                  <p>Добавляйте понравившиеся игрушки — они будут храниться здесь.</p>
                  <NuxtLink to="/shop" class="panel-primary-link">Перейти в магазин</NuxtLink>
                </div>
              </div>
            </div>

            <div v-else-if="activeSection === 'settings'" class="content-panel settings-panel">
              <div class="settings-tabs">
                <button class="active">Личные данные</button>
                <button>Настройки</button>
              </div>
              <div class="settings-list">
                <div class="settings-field"><span>Телефон</span><strong>{{ user?.phone || 'Не указан' }}</strong></div>
                <div class="settings-field"><span>Электронная почта</span><strong>{{ user?.email || 'Не указана' }}</strong></div>
                <div class="settings-field"><span>Имя</span><strong>{{ user?.name || 'Не указано' }}</strong></div>
                <div class="settings-field"><span>Город</span><strong>Алматы</strong></div>
              </div>
            </div>

            <div v-else-if="activeSection === 'history' || activeSection === 'orders'" class="content-panel history-panel">
              <!-- History Tabs Switcher -->
              <div class="history-subtabs">
                <button 
                  class="subtab-btn" 
                  :class="{ active: historyTab === 'orders' }"
                  @click="historyTab = 'orders'"
                >
                  📦 Мои заказы ({{ orders.length }})
                </button>
                <button 
                  class="subtab-btn" 
                  :class="{ active: historyTab === 'rentals' }"
                  @click="historyTab = 'rentals'"
                >
                  ⏱ Аренда товаров ({{ rentals.length }})
                </button>
                <button 
                  class="subtab-btn" 
                  :class="{ active: historyTab === 'sets' }"
                  @click="historyTab = 'sets'"
                >
                  🎠 Прошлые наборы
                </button>
                <button 
                  class="subtab-btn" 
                  :class="{ active: historyTab === 'gifts' }"
                  @click="historyTab = 'gifts'"
                >
                  🎁 Подарки ({{ (giftCards.sent?.length || 0) + (giftCards.received?.length || 0) }})
                </button>
              </div>

              <!-- Loading State -->
              <div v-if="isLoadingHistory" class="orders-loading-state">
                <div class="orders-spinner"></div>
                <p>Загрузка данных...</p>
              </div>

              <!-- TAB 1: E-Commerce Orders -->
              <div v-else-if="historyTab === 'orders'">
                <div v-if="orders.length === 0" class="empty-state">
                  <span class="empty-icon">📦</span>
                  <div>
                    <h2>Заказов пока нет</h2>
                    <p>После оформления заказа здесь появятся его состав, статус и доставка.</p>
                    <NuxtLink to="/shop" class="panel-primary-link">Перейти в каталог</NuxtLink>
                  </div>
                </div>

                <div v-else class="profile-orders-list">
                  <div v-for="order in orders" :key="order.id" class="profile-order-card">
                    <div class="p-order-head">
                      <div class="p-order-main">
                        <strong class="p-order-num">{{ order.order_number || ('#ORD-' + order.id) }}</strong>
                        <span class="p-order-badge" :class="order.order_type === 'toy_buyout' ? 'buyout' : 'shop'">
                          {{ order.order_type === 'toy_buyout' ? '⭐ Выкуп из подписки' : '🛒 Покупка в магазине' }}
                        </span>
                        <span class="p-order-date">{{ formatDate(order.created_at) }}</span>
                      </div>
                      <div class="p-order-right">
                        <span class="p-order-status" :class="getOrderStatusClass(order.status)">
                          {{ getOrderStatusText(order.status) }}
                        </span>
                        <strong class="p-order-total">{{ formatPrice(order.total_price) }} ₸</strong>
                      </div>
                    </div>

                    <div v-if="order.address || order.phone" class="p-order-meta">
                      <span v-if="order.address">📍 {{ order.address }}</span>
                      <span v-if="order.phone">📞 {{ order.phone }}</span>
                    </div>

                    <div v-if="order.items && order.items.length" class="p-order-items">
                      <div v-for="item in order.items" :key="item.id" class="p-order-item-row">
                        <img :src="item.toy?.image_url || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=150&q=80'" :alt="item.toy?.name || item.title" class="p-item-img" />
                        <div class="p-item-info">
                          <span class="p-item-title">{{ item.toy?.name || item.title || 'Развивающая эко-игрушка' }}</span>
                          <span class="p-item-qty">{{ item.quantity }} шт. • {{ formatPrice(item.price) }} ₸</span>
                        </div>
                        <strong class="p-item-sum">{{ formatPrice(item.price * item.quantity) }} ₸</strong>
                      </div>
                    </div>

                    <div class="p-order-foot">
                      <NuxtLink to="/delivery" class="p-track-btn">🚚 Отследить доставку курьером →</NuxtLink>
                      <NuxtLink to="/support" class="p-help-link">Нужна помощь по заказу?</NuxtLink>
                    </div>
                  </div>
                </div>
              </div>

              <!-- TAB 2: Short-term Rentals -->
              <div v-else-if="historyTab === 'rentals'">
                <div v-if="rentals.length === 0" class="empty-state">
                  <span class="empty-icon">⏱️</span>
                  <div>
                    <h2>Аренд пока нет</h2>
                    <p>Возьмите карнавальные костюмы, брендовые коляски, батуты или автокресла в посуточную аренду.</p>
                    <NuxtLink to="/short-rent" class="panel-primary-link">Каталог посуточной аренды</NuxtLink>
                  </div>
                </div>

                <div v-else class="profile-orders-list">
                  <div v-for="rental in rentals" :key="rental.id" class="profile-order-card rental-card">
                    <div class="p-order-head">
                      <div class="p-order-main">
                        <strong class="p-order-num">#{{ rental.rental_number || ('RNT-' + rental.id) }}</strong>
                        <span class="p-order-badge buyout">⏱ Посуточная аренда</span>
                        <span class="p-order-date">Оформлено: {{ formatDate(rental.created_at) }}</span>
                      </div>
                      <div class="p-order-right">
                        <span class="p-order-status" :class="getRentalStatusClass(rental.status)">
                          {{ rental.status_label || getRentalStatusText(rental.status) }}
                        </span>
                        <strong class="p-order-total">{{ formatPrice(rental.total_price) }} ₸</strong>
                      </div>
                    </div>

                    <div class="p-order-meta">
                      <span>📅 {{ formatDateSimple(rental.start_date) }} — {{ formatDateSimple(rental.end_date) }} ({{ rental.days_count || 1 }} дн.)</span>
                      <span v-if="rental.deposit_amount">🛡️ Залог: {{ formatPrice(rental.deposit_amount) }} ₸ (возвратный)</span>
                      <span v-if="rental.delivery_address">📍 {{ rental.delivery_address }}</span>
                    </div>

                    <div class="p-order-items">
                      <div class="p-order-item-row">
                        <img :src="rental.toy?.image_url || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=150&q=80'" :alt="rental.toy?.name" class="p-item-img" />
                        <div class="p-item-info">
                          <span class="p-item-title">{{ rental.toy?.name || 'Специальный товар для аренды' }}</span>
                          <span class="p-item-qty">Тариф: {{ formatPrice(rental.daily_rate) }} ₸ / сутки</span>
                        </div>
                        <strong class="p-item-sum">{{ formatPrice(rental.total_price) }} ₸</strong>
                      </div>
                    </div>

                    <div class="p-order-foot p-rental-foot">
                      <div class="p-rental-actions">
                        <button 
                          v-if="rental.status === 'pending_payment'" 
                          class="p-action-btn pay-btn"
                          @click="openPaymentModal(rental)"
                        >
                          💳 Оплатить аренду
                        </button>
                        <button 
                          v-if="['pending_payment', 'reserved'].includes(rental.status)" 
                          class="p-action-btn cancel-btn"
                          @click="handleCancelRental(rental)"
                        >
                          Отменить бронь
                        </button>
                        <button 
                          v-if="rental.status === 'active'" 
                          class="p-action-btn extend-btn"
                          @click="openExtendModal(rental)"
                        >
                          ⏱ Продлить срок аренды
                        </button>
                        <NuxtLink to="/delivery" class="p-track-btn">
                          🚚 Статус доставки курьером →
                        </NuxtLink>
                      </div>
                      <NuxtLink to="/support" class="p-help-link">
                        Служба заботы
                      </NuxtLink>
                    </div>
                  </div>
                </div>
              </div>

              <!-- TAB 3: Past Subscription Sets -->
              <div v-else-if="historyTab === 'sets'">
                <div class="profile-sets-wrap">
                  <div class="p-set-card">
                    <div class="p-set-head">
                      <h3>🎠 Комплект «Младенчество и сенсорика»</h3>
                      <span class="p-set-period">Март — Май 2026</span>
                    </div>
                    <div class="p-set-grid">
                      <div class="p-set-toy">
                        <img src="https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=300&q=80" alt="Сенсорный кубик" />
                        <strong>Сенсорный кубик с колокольчиком</strong>
                        <NuxtLink to="/subscription" class="p-buyout-link">Выкупить со скидкой 2 900 ₸</NuxtLink>
                      </div>
                      <div class="p-set-toy">
                        <img src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=300&q=80" alt="Радужные погремушки" />
                        <strong>Радужные эко-погремушки</strong>
                        <NuxtLink to="/subscription" class="p-buyout-link">Выкупить со скидкой 3 200 ₸</NuxtLink>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- TAB 4: Gifts (Sent & Received) -->
              <div v-else-if="historyTab === 'gifts'">
                <div v-if="(!giftCards.sent || giftCards.sent.length === 0) && (!giftCards.received || giftCards.received.length === 0)" class="empty-state">
                  <span class="empty-icon">🎁</span>
                  <div>
                    <h2>Подарочных сертификатов пока нет</h2>
                    <p>Дарите радость и развитие близким! Подарите сертификат на клубную подписку развивающих эко-игрушек.</p>
                    <NuxtLink to="/gifts" class="panel-primary-link">Оформить подарок</NuxtLink>
                  </div>
                </div>

                <div v-else class="profile-orders-list">
                  <!-- Sent Gifts -->
                  <div v-if="giftCards.sent && giftCards.sent.length" class="gift-section-block">
                    <h3 class="gift-subheading">🎁 Отправленные подарки</h3>
                    <div v-for="gift in giftCards.sent" :key="'sent-' + gift.id" class="profile-order-card gift-card">
                      <div class="p-order-head">
                        <div class="p-order-main">
                          <strong class="p-order-num">{{ gift.code }}</strong>
                          <span class="p-order-badge buyout">
                            Кому: {{ gift.recipient_name }}
                          </span>
                          <span class="p-order-date">Оформлен: {{ formatDate(gift.created_at) }}</span>
                        </div>
                        <div class="p-order-right">
                          <span class="p-order-status" :class="gift.status === 'used' ? 'status-delivered' : 'status-paid'">
                            {{ gift.status === 'used' ? '🎉 Получен и активирован' : '⏳ Ожидает активации' }}
                          </span>
                          <strong class="p-order-total">{{ formatPrice(gift.initial_amount) }} ₸</strong>
                        </div>
                      </div>
                      <div v-if="gift.message" class="p-order-meta">
                        <span>💬 «{{ gift.message }}»</span>
                      </div>
                      <div v-if="gift.status === 'used' && gift.activated_at" class="p-order-meta">
                        <span class="gift-active-date">✨ Активирован получателем: {{ formatDate(gift.activated_at) }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Received Gifts -->
                  <div v-if="giftCards.received && giftCards.received.length" class="gift-section-block">
                    <h3 class="gift-subheading">🎀 Полученные подарки</h3>
                    <div v-for="gift in giftCards.received" :key="'rec-' + gift.id" class="profile-order-card gift-card">
                      <div class="p-order-head">
                        <div class="p-order-main">
                          <strong class="p-order-num">{{ gift.code }}</strong>
                          <span class="p-order-badge shop">
                            От: {{ gift.sender_name || 'Анонимный даритель' }}
                          </span>
                          <span class="p-order-date">{{ formatDate(gift.created_at) }}</span>
                        </div>
                        <div class="p-order-right">
                          <span class="p-order-status status-delivered">
                            🎉 Активирован
                          </span>
                          <strong class="p-order-total">{{ formatPrice(gift.initial_amount) }} ₸</strong>
                        </div>
                      </div>
                      <div v-if="gift.message" class="p-order-meta">
                        <span>💬 «{{ gift.message }}»</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="content-panel">
              <div class="empty-state">
                <span class="empty-icon">{{ currentSection.icon }}</span>
                <div>
                  <h2>{{ currentSection.emptyTitle }}</h2>
                  <p>{{ currentSection.emptyText }}</p>
                  <button v-if="currentSection.action" type="button" class="panel-primary-link" @click="handleSectionAction">{{ currentSection.action }}</button>
                </div>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>

    <TheFooter />

    <!-- Payment Modal for Rentals -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="payingRental" class="modal-overlay" @click.self="payingRental = null">
          <div class="buy-modal payment-modal">
            <button class="close-btn" @click="payingRental = null">&times;</button>
            <h2 class="modal-title">Оплата аренды 💳</h2>
            <p class="modal-desc">
              Бронь <strong>#{{ payingRental.rental_number || ('RNT-' + payingRental.id) }}</strong> ({{ payingRental.toy?.name }})
            </p>

            <!-- Payment Methods -->
            <div class="payment-methods-box">
              <div 
                class="pay-method-card" 
                :class="{ selected: paymentMethod === 'kaspi' }"
                @click="paymentMethod = 'kaspi'"
              >
                <div class="pay-radio-circle">
                  <span v-if="paymentMethod === 'kaspi'" class="radio-inner"></span>
                </div>
                <div class="pay-method-icon kaspi-badge">K</div>
                <div class="pay-method-info">
                  <strong>Kaspi QR / Удаленный счет</strong>
                  <span>Быстрая оплата в приложении Kaspi.kz</span>
                </div>
              </div>

              <div 
                class="pay-method-card" 
                :class="{ selected: paymentMethod === 'card' }"
                @click="paymentMethod = 'card'"
              >
                <div class="pay-radio-circle">
                  <span v-if="paymentMethod === 'card'" class="radio-inner"></span>
                </div>
                <div class="pay-method-icon card-badge">💳</div>
                <div class="pay-method-info">
                  <strong>Банковской картой онлайн</strong>
                  <span>Visa, MasterCard, Apple Pay</span>
                </div>
              </div>
            </div>

            <!-- Kaspi Mock -->
            <div v-if="paymentMethod === 'kaspi'" class="kaspi-pay-preview">
              <div class="qr-mock-box">
                <div class="qr-code-art">
                  <div class="qr-block top-left"></div>
                  <div class="qr-block top-right"></div>
                  <div class="qr-block bottom-left"></div>
                  <span class="qr-center-text">Kaspi QR</span>
                </div>
              </div>
              <p class="qr-hint">Отсканируйте QR-код в мобильном приложении Kaspi.kz для оплаты</p>
            </div>

            <!-- Card Inputs Mock -->
            <div v-else class="card-inputs-preview">
              <div class="input-grp">
                <label>Номер карты</label>
                <input type="text" placeholder="4400 •••• •••• 1234" maxlength="19" class="m-input" />
              </div>
              <div class="date-row">
                <div class="input-grp">
                  <label>Срок</label>
                  <input type="text" placeholder="MM/YY" maxlength="5" class="m-input" />
                </div>
                <div class="input-grp">
                  <label>CVV</label>
                  <input type="password" placeholder="•••" maxlength="3" class="m-input" />
                </div>
              </div>
            </div>

            <div class="buy-details-card">
              <div class="price-row" style="display: flex; justify-content: space-between; align-items: center;">
                <span>Сумма к оплате:</span>
                <span class="special-price" style="color: #7c5cfc; font-weight: 800; font-size: 18px;">{{ formatPrice(payingRental.total_price) }} ₸</span>
              </div>
            </div>

            <div class="modal-actions">
              <button class="cancel-btn" @click="payingRental = null">Отмена</button>
              <button class="confirm-btn pay-submit-btn" :disabled="isPaying" @click="confirmPayRental">
                {{ isPaying ? 'Обработка платежа...' : `Оплатить ${formatPrice(payingRental.total_price)} ₸` }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Extend Rental Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="extendingRental" class="modal-overlay" @click.self="extendingRental = null">
          <div class="buy-modal">
            <button class="close-btn" @click="extendingRental = null">&times;</button>
            <h2 class="modal-title">Продление аренды ⏱️</h2>
            <p class="modal-desc">
              Товар: <strong>{{ extendingRental.toy?.name }}</strong>
            </p>

            <div class="buy-details-card">
              <label style="display: block; font-size: 13px; font-weight: 700; margin-bottom: 8px;">
                На сколько дней продлить?
              </label>
              <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                <button 
                  v-for="d in [3, 7, 14]" 
                  :key="d" 
                  type="button" 
                  class="subtab-btn" 
                  :class="{ active: extendDays === d }" 
                  style="flex: 1; text-align: center; padding: 8px; justify-content: center;"
                  @click="extendDays = d"
                >
                  +{{ d }} дн.
                </button>
              </div>
              <div class="price-row" style="display: flex; justify-content: space-between; align-items: center;">
                <span>Доплата:</span>
                <span class="special-price" style="color: #7c5cfc; font-weight: 800; font-size: 18px;">+{{ formatPrice(extendDays * (extendingRental.daily_rate || 1500)) }} ₸</span>
              </div>
            </div>

            <div class="modal-actions">
              <button class="cancel-btn" @click="extendingRental = null">Отмена</button>
              <button class="confirm-btn" :disabled="isExtending" @click="confirmExtendRental">
                {{ isExtending ? 'Продлеваем...' : 'Подтвердить продление' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import TheHeader from '~/components/TheHeader.vue'
import TheFooter from '~/components/TheFooter.vue'

const { user, openAuthModal, logout } = useAuth()
const { favorites, toggleFavorite } = useFavorites()
const route = useRoute()
const router = useRouter()
const copiedCode = ref('')
const firstName = computed(() => user.value?.name?.trim().split(/\s+/)[0] || 'друг')

// Inline edit form state
const isEditOpen = ref(false)
const isSaving = ref(false)
const saveSuccess = ref(false)
const editForm = ref({
  name: '',
  email: '',
  phone: '',
})

const historyTab = ref<'orders' | 'rentals' | 'sets' | 'gifts'>('orders')
const { fetchMyOrders } = useOrders()
const { fetchMyRentals, cancelRental, payRental, extendRental } = useRentals()
const { fetchMyGiftCards } = useGifts()

const orders = ref<any[]>([])
const rentals = ref<any[]>([])
const giftCards = ref<{ sent: any[]; received: any[] }>({ sent: [], received: [] })
const isLoadingHistory = ref(false)

const payingRental = ref<any>(null)
const extendingRental = ref<any>(null)
const extendDays = ref(3)
const isPaying = ref(false)
const isExtending = ref(false)
const paymentMethod = ref<'kaspi' | 'card'>('kaspi')

const openPaymentModal = (rental: any) => {
  payingRental.value = rental
  paymentMethod.value = 'kaspi'
}

const openExtendModal = (rental: any) => {
  extendingRental.value = rental
  extendDays.value = 3
}

const confirmPayRental = async () => {
  if (!payingRental.value) return
  isPaying.value = true
  try {
    await payRental(payingRental.value.id)
    payingRental.value = null
    await loadHistoryData()
  } catch (e: any) {
    alert(e?.data?.message || 'Ошибка оплаты')
  } finally {
    isPaying.value = false
  }
}

const confirmExtendRental = async () => {
  if (!extendingRental.value) return
  isExtending.value = true
  try {
    await extendRental(extendingRental.value.id, extendDays.value)
    extendingRental.value = null
    await loadHistoryData()
  } catch (e: any) {
    alert(e?.data?.message || 'Ошибка продления')
  } finally {
    isExtending.value = false
  }
}

const handleCancelRental = async (rental: any) => {
  if (!confirm(`Вы уверены, что хотите отменить бронь #${rental.rental_number || rental.id}?`)) return
  try {
    await cancelRental(rental.id)
    await loadHistoryData()
  } catch (e: any) {
    alert(e?.data?.message || 'Ошибка отмены')
  }
}

const loadHistoryData = async () => {
  if (!user.value) return
  isLoadingHistory.value = true
  try {
    const [ordersRes, rentalsRes, giftsRes] = await Promise.allSettled([
      fetchMyOrders(),
      fetchMyRentals(),
      fetchMyGiftCards()
    ])

    if (ordersRes.status === 'fulfilled' && ordersRes.value?.data) {
      orders.value = ordersRes.value.data
    }
    if (rentalsRes.status === 'fulfilled' && rentalsRes.value?.data) {
      rentals.value = rentalsRes.value.data
    }
    if (giftsRes.status === 'fulfilled' && giftsRes.value?.data) {
      giftCards.value = giftsRes.value.data as any
    }
  } catch (e) {
    console.error('Error loading history data:', e)
  } finally {
    isLoadingHistory.value = false
  }
}

onMounted(() => {
  if (user.value) {
    loadHistoryData()
  }
})

watch(
  () => user.value,
  (u) => {
    if (u) {
      editForm.value.name = u.name || ''
      editForm.value.email = u.email || ''
      editForm.value.phone = u.phone || ''
      loadHistoryData()
    }
  },
  { immediate: true }
)

const getOrderStatusClass = (status: string) => {
  switch (status) {
    case 'delivered': return 'status-delivered'
    case 'paid': return 'status-paid'
    case 'shipped': return 'status-shipped'
    case 'new': return 'status-new'
    case 'cancelled': return 'status-cancelled'
    default: return 'status-pending'
  }
}

const getOrderStatusText = (status: string) => {
  switch (status) {
    case 'new': return '🆕 Новый заказ'
    case 'paid': return '🟢 Оплачен'
    case 'shipped': return '🚚 В пути'
    case 'delivered': return '🎁 Доставлен'
    case 'cancelled': return '⛔ Отменен'
    default: return 'Ожидает'
  }
}

const getRentalStatusClass = (status: string) => {
  switch (status) {
    case 'active': return 'status-paid'
    case 'reserved': return 'status-shipped'
    case 'returned': return 'status-delivered'
    case 'pending_payment': return 'status-new'
    case 'cancelled': return 'status-cancelled'
    default: return 'status-pending'
  }
}

const getRentalStatusText = (status: string) => {
  switch (status) {
    case 'pending_payment': return '⏳ Ожидает оплаты'
    case 'reserved': return '📅 Забронировано'
    case 'active': return '✨ В аренде'
    case 'returned': return '✓ Возвращен'
    case 'cancelled': return '⛔ Отменен'
    default: return status
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatDateSimple = (dateStr: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short'
  })
}

const saveProfile = async () => {
  isSaving.value = true
  saveSuccess.value = false
  try {
    await $fetch('http://localhost:8000/api/user', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${useCookie('auth_token').value}` },
      body: {
        name: editForm.value.name,
        phone: editForm.value.phone,
      }
    })
    if (user.value) {
      user.value.name = editForm.value.name
      user.value.phone = editForm.value.phone
    }
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false; isEditOpen.value = false }, 1800)
  } catch (e) {
    // ignore — show nothing on error for now
  } finally {
    isSaving.value = false
  }
}

const sections = {
  profile: { label: 'Профиль', icon: '👤', emptyTitle: '', emptyText: '' },
  bonus: { label: 'Бонусная карта', icon: '★', emptyTitle: '', emptyText: '' },
  orders: { label: 'Мои заказы', icon: '📦', emptyTitle: 'Заказов пока нет', emptyText: 'После оформления заказа здесь появятся его состав, статус и доставка.', action: 'Перейти в магазин', to: '/shop' },
  favorites: { label: 'Избранное', icon: '♡', emptyTitle: '', emptyText: '' },
  history: { label: 'История заказов', icon: '🕐', emptyTitle: 'Заказов пока нет', emptyText: 'Все ваши заказы и выкупы игрушек появятся здесь.', action: 'Перейти в магазин', to: '/shop' },
  promocodes: { label: 'Мои промокоды', icon: '%', emptyTitle: '', emptyText: '' },
  settings: { label: 'Личные данные и настройки', icon: '⚙', emptyTitle: '', emptyText: '' },
  children: { label: 'Мои дети', icon: '🧸', emptyTitle: 'Добавьте профиль ребёнка', emptyText: 'Возраст и интересы помогут нам точнее подбирать развивающие игрушки.', action: 'Добавить ребёнка', to: '/child' },
  payments: { label: 'Мои способы оплаты', icon: '💳', emptyTitle: 'Способы оплаты не добавлены', emptyText: 'Сохранённые карты появятся здесь после первой оплаты.' },
  delivery: { label: 'Мои способы получения', icon: '🚚', emptyTitle: 'Адресов пока нет', emptyText: 'Добавьте удобный адрес доставки при оформлении заказа.', action: 'Условия доставки', to: '/delivery' },
  reviews: { label: 'Мои отзывы', icon: '✎', emptyTitle: 'Отзывов пока нет', emptyText: 'После покупки вы сможете поделиться впечатлениями об игрушках.' },
  support: { label: 'Мои вопросы и ответы', icon: '?', emptyTitle: 'Вопросов пока нет', emptyText: 'Здесь будет сохраняться ваша переписка со службой поддержки.', action: 'Задать вопрос', to: '/support' },
} as const

type SectionKey = keyof typeof sections

const activeSection = computed<SectionKey>(() => {
  const section = String(route.query.section || 'profile') as SectionKey
  return section in sections ? section : 'profile'
})

const currentSection = computed(() => sections[activeSection.value])

const selectSection = (section: SectionKey) => {
  router.replace({
    path: '/profile',
    query: section === 'profile' ? {} : { section },
  })
}

const handleSectionAction = () => {
  const target = 'to' in currentSection.value ? currentSection.value.to : undefined
  if (target) navigateTo(target)
}

const formatPrice = (price: number) => new Intl.NumberFormat('ru-RU').format(price)

const promos = [
  {
    discount: '-20%',
    code: 'PLAY20',
    condition: 'Для первой подписки',
    description: 'Скидка на первый месяц подписки Alpha',
    color: 'purple',
    to: '/subscription',
  },
  {
    discount: '-15%',
    code: 'WELCOME15',
    condition: 'Для новых пользователей',
    description: 'На первую покупку в интернет-магазине',
    color: 'yellow',
    to: '/shop',
  },
  {
    discount: '-10%',
    code: 'GIFT10',
    condition: 'Подарки и сертификаты',
    description: 'На подарочные наборы для детей',
    color: 'mint',
    to: '/gifts',
  },
]

const copyPromo = async (code: string) => {
  copiedCode.value = code
  if (import.meta.client && navigator.clipboard) {
    await navigator.clipboard.writeText(code).catch(() => {})
  }
  window.setTimeout(() => {
    if (copiedCode.value === code) copiedCode.value = ''
  }, 1600)
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f7f4ff;
  color: #1a1a2e;
}

.profile-container {
  width: min(1320px, calc(100% - 48px));
  margin: 0 auto;
  padding: 32px 0 88px;
}

.breadcrumbs {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
  color: #8b88a3;
  font-size: 14px;
}

.breadcrumbs a:hover {
  color: #624ce0;
}

.profile-layout {
  display: grid;
  grid-template-columns: 270px minmax(0, 1fr);
  gap: 28px;
  align-items: start;
}

.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 150px;
}

.sidebar-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px;
  border: 1px solid rgba(98, 76, 224, 0.08);
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 12px 30px rgba(60, 47, 118, 0.06);
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 48px;
  padding: 11px 14px;
  border-radius: 15px;
  color: #3f3d55;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  text-align: left;
  transition: color 180ms ease, background 180ms ease, transform 180ms ease;
}

.sidebar-link:hover {
  color: #624ce0;
  background: #f5f2ff;
  transform: translateX(2px);
}

.sidebar-link.active {
  color: #624ce0;
  background: #ede9ff;
  font-weight: 800;
}

.sidebar-icon {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 9px;
  background: #f4f1ff;
  font-size: 14px;
}

.sidebar-count {
  display: grid;
  place-items: center;
  min-width: 22px;
  height: 22px;
  margin-left: auto;
  padding: 0 6px;
  border-radius: 999px;
  color: #fff;
  background: #624ce0;
  font-size: 11px;
}

.profile-content {
  min-width: 0;
}

.welcome-card {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  overflow: hidden;
  min-height: 310px;
  padding: 46px;
  border: 1px solid rgba(98, 76, 224, 0.1);
  border-radius: 32px;
  background: linear-gradient(135deg, #fff 0%, #f8f5ff 64%, #eee9ff 100%);
  box-shadow: 0 18px 48px rgba(60, 47, 118, 0.09);
}

.welcome-copy {
  position: relative;
  z-index: 2;
  max-width: 690px;
}

.welcome-heading-row {
  display: flex;
  align-items: center;
  gap: 18px;
}

.welcome-avatar {
  display: grid;
  place-items: center;
  width: 68px;
  height: 68px;
  flex: 0 0 auto;
  border-radius: 22px;
  color: #624ce0;
  background: #ede9ff;
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 900;
}

.welcome-avatar.authenticated {
  color: #fff;
  background: linear-gradient(135deg, #7c5cfc, #513bc7);
}

.welcome-kicker,
.section-kicker {
  display: block;
  margin-bottom: 6px;
  color: #7c5cfc;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.2px;
}

.welcome-card h1 {
  margin: 0;
  color: #1a1a2e;
  font-size: clamp(38px, 5vw, 58px);
  line-height: 1;
}

.welcome-description {
  max-width: 630px;
  margin: 24px 0 28px;
  color: #626078;
  font-size: 16px;
  line-height: 1.6;
}

.auth-primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-height: 54px;
  padding: 15px 26px;
  border-radius: 17px;
  color: #fff;
  background: #624ce0;
  box-shadow: 0 8px 0 #4934b5, 0 14px 30px rgba(98, 76, 224, 0.24);
  font-size: 16px;
  font-weight: 800;
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.auth-primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 0 #4934b5, 0 18px 34px rgba(98, 76, 224, 0.28);
}

.profile-summary {
  display: flex;
  align-items: stretch;
  flex-wrap: wrap;
  gap: 12px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 190px;
  padding: 12px 16px;
  border-radius: 15px;
  background: #fff;
  box-shadow: 0 8px 22px rgba(60, 47, 118, 0.08);
}

.summary-item span {
  color: #8b88a3;
  font-size: 11px;
}

.summary-item strong {
  overflow: hidden;
  font-size: 13px;
  text-overflow: ellipsis;
}

.logout-link {
  padding: 0 16px;
  border-radius: 15px;
  color: #e14f62;
  background: #fff0f2;
  font-weight: 700;
}

.profile-summary-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.edit-profile-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 14px;
  background: #7C5CFC;
  color: #FFFFFF;
  font-weight: 700;
  font-size: 13.5px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(124, 92, 252, 0.3);
}

.edit-profile-btn:hover {
  background: #624CE0;
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(124, 92, 252, 0.4);
}

/* Inline Edit Form */
.inline-edit-form {
  background: #FFFFFF;
  border: 1.5px solid rgba(124, 92, 252, 0.18);
  border-radius: 24px;
  padding: 28px 32px;
  margin-bottom: 24px;
  box-shadow: 0 8px 28px rgba(98, 76, 224, 0.08);
}

.edit-form-title {
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  font-weight: 800;
  color: #1A1A2E;
  margin: 0 0 20px 0;
}

.edit-form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .edit-form-grid {
    grid-template-columns: 1fr;
  }
}

.edit-form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.edit-form-group label {
  font-size: 12px;
  font-weight: 700;
  color: #7B7B93;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.edit-input {
  padding: 10px 14px;
  border: 1.5px solid #E8E6F4;
  border-radius: 12px;
  font-size: 14px;
  color: #1A1A2E;
  background: #F7F4FF;
  font-family: 'DM Sans', sans-serif;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
}

.edit-input:focus {
  border-color: #7C5CFC;
  box-shadow: 0 0 0 3px rgba(124, 92, 252, 0.12);
  background: #FFFFFF;
}

.edit-form-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.edit-save-btn {
  padding: 10px 24px;
  background: #7C5CFC;
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(124, 92, 252, 0.3);
}

.edit-save-btn:hover:not(:disabled) {
  background: #624CE0;
  transform: translateY(-1px);
}

.edit-save-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.edit-save-success {
  font-size: 14px;
  font-weight: 700;
  color: #06D6A0;
}

/* Slide-down transition */
.slide-down-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-down-leave-active {
  transition: all 0.2s ease;
}
.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-12px);
}
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.welcome-illustration {
  position: relative;
  min-height: 210px;
}

.welcome-bear {
  position: absolute;
  z-index: 2;
  right: 54px;
  bottom: 8px;
  font-size: 104px;
  filter: drop-shadow(0 16px 20px rgba(67, 50, 142, 0.14));
}

.shape {
  position: absolute;
  border-radius: 999px;
}

.shape-purple {
  top: 2px;
  right: -40px;
  width: 230px;
  height: 230px;
  background: #ddd4ff;
}

.shape-yellow {
  right: 160px;
  bottom: -55px;
  width: 140px;
  height: 140px;
  background: #ffe49a;
}

.shape-mint {
  top: -20px;
  right: 165px;
  width: 82px;
  height: 82px;
  background: #bff4df;
}

.promos-section {
  padding-top: 46px;
  scroll-margin-top: 24px;
}

.section-heading-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}

.section-heading-row h2 {
  margin: 0;
  font-size: 34px;
}

.all-promos-link {
  color: #624ce0;
  font-size: 14px;
  font-weight: 800;
}

.promos-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.promo-card {
  display: grid;
  grid-template-columns: 90px minmax(0, 1fr);
  grid-template-rows: 1fr auto;
  overflow: hidden;
  min-height: 190px;
  border: 1px solid rgba(98, 76, 224, 0.08);
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 12px 30px rgba(60, 47, 118, 0.07);
}

.promo-discount {
  display: grid;
  place-items: center;
  grid-row: 1;
  color: #1a1a2e;
  font-family: 'Outfit', sans-serif;
  font-size: 25px;
  font-weight: 900;
}

.promo-discount.purple { background: #ded5ff; }
.promo-discount.yellow { background: #ffe99c; }
.promo-discount.mint { background: #bff4df; }

.promo-body {
  min-width: 0;
  padding: 20px 18px 14px;
}

.promo-condition {
  color: #8b88a3;
  font-size: 11px;
}

.promo-code-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 7px 0;
}

.promo-code-row strong {
  overflow: hidden;
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  text-overflow: ellipsis;
}

.promo-body p {
  color: #5e5b73;
  font-size: 12px;
  line-height: 1.35;
}

.copy-btn {
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  border-radius: 9px;
  color: #624ce0;
  background: #f1edff;
  font-weight: 900;
}

.promo-action {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  color: #3f3d55;
  background: #faf9ff;
  border-top: 1px solid #f0edf9;
  font-size: 13px;
  font-weight: 800;
}

.quick-actions-section {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  padding-top: 24px;
}

.quick-action-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 16px;
  min-height: 112px;
  padding: 22px;
  border-radius: 24px;
  color: #1a1a2e;
}

.purple-card { background: #e9e3ff; }
.mint-card { background: #d9f7eb; }

.quick-icon {
  font-size: 30px;
}

.quick-action-card strong {
  display: block;
  margin-bottom: 4px;
  font-family: 'Outfit', sans-serif;
  font-size: 19px;
}

.quick-action-card p {
  color: #626078;
  font-size: 13px;
}

.quick-arrow {
  font-size: 25px;
}

.cabinet-section {
  min-height: 620px;
}

.cabinet-title-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
}

.cabinet-title-row h1 {
  margin: 0;
  font-size: clamp(34px, 4vw, 50px);
  line-height: 1.08;
}

.back-profile-btn {
  padding: 11px 16px;
  border-radius: 13px;
  color: #624ce0;
  background: #ede9ff;
  font-size: 13px;
  font-weight: 800;
}

.content-panel {
  min-height: 390px;
  padding: 34px;
  border: 1px solid rgba(98, 76, 224, 0.08);
  border-radius: 28px;
  background: #fff;
  box-shadow: 0 12px 34px rgba(60, 47, 118, 0.06);
}

.section-stack {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.subsection-title {
  margin: 8px 0 0;
  font-size: 28px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  min-height: 320px;
  text-align: left;
}

.compact-empty {
  justify-content: flex-start;
  min-height: 150px;
  padding: 28px 34px;
  border-radius: 24px;
  background: #fff;
}

.empty-icon {
  display: grid;
  place-items: center;
  width: 74px;
  height: 74px;
  flex: 0 0 auto;
  border-radius: 24px;
  color: #624ce0;
  background: #ede9ff;
  font-size: 34px;
  font-weight: 900;
}

.empty-state h2 {
  margin: 0 0 8px;
  font-size: 25px;
}

.empty-state p {
  max-width: 530px;
  margin: 0;
  color: #77748b;
  line-height: 1.55;
}

.panel-primary-link {
  display: inline-flex;
  margin-top: 18px;
  padding: 12px 18px;
  border-radius: 13px;
  color: #fff;
  background: #624ce0;
  font-size: 13px;
  font-weight: 800;
}

.bonus-panel {
  display: flex;
  align-items: center;
  gap: 26px;
}

.bonus-card {
  position: relative;
  display: flex;
  flex-direction: column;
  width: min(390px, 100%);
  min-height: 240px;
  padding: 28px;
  overflow: hidden;
  border-radius: 26px;
  color: #fff;
  background: linear-gradient(135deg, #7c5cfc, #4d32c6);
  box-shadow: 0 18px 36px rgba(80, 55, 200, 0.26);
}

.bonus-card::after {
  position: absolute;
  right: -35px;
  bottom: -60px;
  width: 190px;
  height: 190px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  content: '';
}

.bonus-card span { font-size: 13px; font-weight: 800; letter-spacing: 1.4px; }
.bonus-card strong { margin: 38px 0 28px; font-size: 52px; line-height: 1; }
.bonus-card small { margin-top: auto; font-size: 14px; font-weight: 700; }

.bonus-note {
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 310px;
  padding: 22px;
  border-radius: 22px;
  background: #f2efff;
}

.bonus-note > span { font-size: 32px; }
.bonus-note strong { display: block; margin-bottom: 4px; }
.bonus-note p { color: #77748b; font-size: 13px; }

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.favorite-card {
  overflow: hidden;
  border: 1px solid #eeebf8;
  border-radius: 20px;
  background: #fff;
}

.favorite-image-wrap {
  display: grid;
  place-items: center;
  height: 180px;
  overflow: hidden;
  background: #f5f2ff;
  font-size: 52px;
}

.favorite-image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.favorite-info { padding: 17px; }
.favorite-info h3 { min-height: 42px; margin: 0 0 10px; font-size: 16px; }
.favorite-info strong { display: block; margin-bottom: 12px; color: #624ce0; }
.favorite-info button { color: #e14f62; font-size: 12px; font-weight: 700; }

.settings-panel {
  max-width: 850px;
}

.settings-tabs {
  display: flex;
  gap: 24px;
  margin-bottom: 28px;
  border-bottom: 1px solid #ece9f5;
}

.settings-tabs button {
  padding: 0 0 14px;
  color: #77748b;
  background: transparent;
  font-size: 15px;
  font-weight: 800;
}

.settings-tabs button.active {
  margin-bottom: -1px;
  color: #624ce0;
  border-bottom: 3px solid #624ce0;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.settings-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 17px 20px;
  border-radius: 18px;
  background: #f2efff;
}

.settings-field span { color: #8b88a3; font-size: 12px; }
.settings-field strong { font-size: 15px; }

@media (max-width: 1060px) {
  .profile-layout {
    grid-template-columns: 220px minmax(0, 1fr);
  }

  .welcome-card {
    grid-template-columns: 1fr;
  }

  .welcome-illustration {
    display: none;
  }

  .promos-grid {
    grid-template-columns: 1fr;
  }

  .favorites-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .profile-container {
    width: min(calc(100% - 32px), 1320px);
    padding-top: 20px;
  }

  .breadcrumbs {
    margin-bottom: 16px;
  }

  .profile-layout {
    display: flex;
    flex-direction: column;
  }

  .profile-sidebar {
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 5px;
    scrollbar-width: none;
  }

  .profile-sidebar::-webkit-scrollbar {
    display: none;
  }

  .sidebar-card {
    min-width: max-content;
    flex-direction: row;
    padding: 7px;
    border-radius: 18px;
  }

  .sidebar-link {
    min-height: 42px;
    padding: 9px 12px;
  }

  .sidebar-icon {
    display: none;
  }

  .welcome-card {
    min-height: auto;
    padding: 28px 22px 34px;
    border-radius: 26px;
  }

  .welcome-heading-row {
    align-items: flex-start;
  }

  .welcome-avatar {
    width: 54px;
    height: 54px;
    border-radius: 17px;
    font-size: 25px;
  }

  .welcome-card h1 {
    font-size: 36px;
  }

  .welcome-description {
    margin: 20px 0 24px;
    font-size: 14px;
  }

  .auth-primary-btn {
    width: 100%;
    justify-content: center;
    font-size: 14px;
  }

  .profile-summary {
    flex-direction: column;
  }

  .summary-item,
  .logout-link {
    width: 100%;
    min-height: 48px;
  }

  .section-heading-row {
    align-items: flex-start;
  }

  .section-heading-row h2 {
    font-size: 28px;
  }

  .quick-actions-section {
    grid-template-columns: 1fr;
  }

  .cabinet-title-row {
    align-items: flex-start;
  }

  .back-profile-btn {
    display: none;
  }

  .content-panel {
    min-height: 340px;
    padding: 24px 20px;
    border-radius: 24px;
  }

  .bonus-panel {
    align-items: stretch;
    flex-direction: column;
  }

  .bonus-note {
    max-width: none;
  }

  .favorites-grid {
    grid-template-columns: 1fr;
  }

  .empty-state {
    align-items: flex-start;
    flex-direction: column;
    min-height: 280px;
  }

  .compact-empty {
    min-height: 0;
  }
}

@media (max-width: 480px) {
  .promo-card {
    grid-template-columns: 78px minmax(0, 1fr);
  }

  .promo-discount {
    font-size: 21px;
  }

  .all-promos-link {
    display: none;
  }
}

/* ── Profile Orders List Styles ─────────────────────── */
.profile-orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.profile-order-card {
  background: #ffffff;
  border: 1px solid rgba(124, 92, 252, 0.12);
  border-radius: 20px;
  padding: 20px 24px;
  box-shadow: 0 4px 18px rgba(60, 47, 118, 0.04);
  transition: transform 0.2s, box-shadow 0.2s;
}

.profile-order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(60, 47, 118, 0.08);
}

.p-order-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f0fe;
}

.p-order-main {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.p-order-num {
  font-family: 'Outfit', sans-serif;
  font-size: 17px;
  font-weight: 800;
  color: #1a1a2e;
}

.p-order-badge {
  font-size: 11.5px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
}

.p-order-badge.buyout {
  background: #fef3c7;
  color: #92400e;
}

.p-order-badge.shop {
  background: #ede9fe;
  color: #624ce0;
}

.p-order-date {
  font-size: 13px;
  color: #88869e;
}

.p-order-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.p-order-status {
  font-size: 12px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
}

.p-order-status.status-paid,
.p-order-status.status-delivered {
  background: #dcfce7;
  color: #166534;
}

.p-order-status.status-shipped {
  background: #dbeafe;
  color: #1e40af;
}

.p-order-status.status-new,
.p-order-status.status-pending {
  background: #fef9c3;
  color: #854d0e;
}

.p-order-status.status-cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.p-order-total {
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  font-weight: 900;
  color: #1a1a2e;
}

.p-order-meta {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  font-size: 13px;
  color: #626078;
  padding: 10px 0 6px;
}

.p-order-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 8px 0;
}

.p-order-item-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 12px;
  background: #faf8ff;
  border-radius: 12px;
}

.p-item-img {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  object-fit: cover;
  background: #fff;
  border: 1px solid #eee;
  flex-shrink: 0;
}

.p-item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.p-item-title {
  font-size: 13.5px;
  font-weight: 700;
  color: #1a1a2e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.p-item-qty {
  font-size: 12px;
  color: #88869e;
}

.p-item-sum {
  font-size: 14px;
  font-weight: 800;
  color: #1a1a2e;
  flex-shrink: 0;
}

.p-order-foot {
  display: flex;
  justify-content: flex-start;
  padding-top: 10px;
  border-top: 1px solid #f8f6ff;
}

.p-track-btn {
  font-size: 13px;
  font-weight: 700;
  color: #7c5cfc;
  text-decoration: none;
  transition: color 0.15s;
}

.p-track-btn:hover {
  color: #513bc7;
  text-decoration: underline;
}

.orders-loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 12px;
  color: #7c5cfc;
  font-weight: 600;
}

.orders-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #ede9fe;
  border-top-color: #7c5cfc;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── History Subtabs Switcher ────────────────────────── */
.history-subtabs {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f3f0fe;
}

.subtab-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 14px;
  border: 1.5px solid #ece9fc;
  background: #ffffff;
  color: #626078;
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.subtab-btn:hover {
  border-color: #7c5cfc;
  color: #7c5cfc;
  background: #f8f6ff;
}

.subtab-btn.active {
  background: linear-gradient(135deg, #7c5cfc, #6342e8);
  color: #ffffff;
  border-color: transparent;
  box-shadow: 0 4px 14px rgba(124, 92, 252, 0.28);
}

/* ── Past Sets Styles ───────────────────────────────── */
.profile-sets-wrap {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.p-set-card {
  background: #ffffff;
  border: 1px solid rgba(124, 92, 252, 0.12);
  border-radius: 20px;
  padding: 24px;
}

.p-set-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f0fe;
}

.p-set-head h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #1a1a2e;
}

.p-set-period {
  font-size: 13px;
  color: #7c5cfc;
  font-weight: 700;
}

.p-set-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.p-set-toy {
  background: #faf8ff;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
}

.p-set-toy img {
  width: 90px;
  height: 90px;
  border-radius: 12px;
  object-fit: cover;
}

.p-set-toy strong {
  font-size: 13px;
  color: #1a1a2e;
  line-height: 1.3;
}

.p-buyout-link {
  font-size: 12px;
  font-weight: 700;
  color: #7c5cfc;
  text-decoration: none;
  background: #fff;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #e0d7ff;
  transition: all 0.15s;
}

.p-buyout-link:hover {
  background: #7c5cfc;
  color: #fff;
  border-color: transparent;
}

/* ── Gifts Section Styles ───────────────────────────── */
.gift-section-block {
  margin-bottom: 20px;
}

.gift-subheading {
  font-size: 15px;
  font-weight: 800;
  color: #1a1a2e;
  margin: 0 0 12px;
}

.gift-active-date {
  color: #16a34a;
  font-weight: 700;
  font-size: 12.5px;
}

/* ── Rental Action Buttons & Footers ────────────────── */
.p-rental-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.p-rental-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.p-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
}

.extend-btn {
  background: #7c5cfc;
  color: #ffffff;
}

.extend-btn:hover {
  background: #624ce0;
  box-shadow: 0 4px 12px rgba(124, 92, 252, 0.3);
}

.pay-btn {
  background: #10b981;
  color: #ffffff;
}

.pay-btn:hover {
  background: #059669;
}

.cancel-btn {
  background: #f4f4f8;
  color: #e63946;
  border: 1px solid #e2e2ec;
}

.cancel-btn:hover {
  background: #ffe8e8;
}

.p-help-link {
  font-size: 13px;
  color: #7b7b93;
  text-decoration: none;
  margin-left: auto;
  transition: color 0.15s;
}

.p-help-link:hover {
  color: #1a1a2e;
  text-decoration: underline;
}

/* ── Modals (Rental Pay / Extend) ────────────────────── */
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
  background: #ffffff;
  border-radius: 28px;
  max-width: 480px;
  width: 100%;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #f4f4f8;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  transition: 0.15s;
}

.close-btn:hover {
  background: #ede9fe;
  color: #7c5cfc;
}

.modal-title {
  font-family: 'Outfit', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #1a1a2e;
  margin: 0 0 6px;
}

.modal-desc {
  font-size: 13.5px;
  color: #626078;
  margin-bottom: 20px;
  line-height: 1.4;
}

.payment-methods-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 18px;
}

.pay-method-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1.5px solid #ece9fc;
  cursor: pointer;
  transition: 0.15s;
}

.pay-method-card:hover {
  border-color: #7c5cfc;
  background: #faf8ff;
}

.pay-method-card.selected {
  border-color: #7c5cfc;
  background: #f3efff;
}

.pay-radio-circle {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid #7c5cfc;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.radio-inner {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #7c5cfc;
}

.pay-method-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 800;
  flex-shrink: 0;
}

.kaspi-badge {
  background: #f14635;
  color: #fff;
  font-family: 'Outfit', sans-serif;
}

.card-badge {
  background: #ede9fe;
}

.pay-method-info {
  display: flex;
  flex-direction: column;
}

.pay-method-info strong {
  font-size: 13.5px;
  color: #1a1a2e;
}

.pay-method-info span {
  font-size: 11.5px;
  color: #88869e;
}

.kaspi-pay-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 16px;
  background: #faf8ff;
  border-radius: 16px;
  margin-bottom: 18px;
}

.qr-mock-box {
  background: #ffffff;
  padding: 16px;
  border-radius: 14px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
  margin-bottom: 8px;
}

.qr-code-art {
  width: 110px;
  height: 110px;
  background: #1a1a2e;
  position: relative;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-block {
  position: absolute;
  width: 24px;
  height: 24px;
  background: #ffffff;
  border: 4px solid #1a1a2e;
}

.qr-block.top-left { top: 6px; left: 6px; }
.qr-block.top-right { top: 6px; right: 6px; }
.qr-block.bottom-left { bottom: 6px; left: 6px; }

.qr-center-text {
  color: #f14635;
  font-family: 'Outfit', sans-serif;
  font-weight: 900;
  font-size: 13px;
  background: #ffffff;
  padding: 2px 6px;
  border-radius: 4px;
}

.qr-hint {
  font-size: 12px;
  color: #626078;
  margin: 0;
}

.card-inputs-preview {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 18px;
}

.input-grp {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.input-grp label {
  font-size: 12px;
  font-weight: 700;
  color: #626078;
}

.m-input {
  padding: 10px 14px;
  border-radius: 10px;
  border: 1.5px solid #ece9fc;
  font-size: 13.5px;
  font-family: inherit;
}

.date-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.buy-details-card {
  background: #f8f6ff;
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  gap: 10px;
}

.modal-actions .cancel-btn {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  border: 1px solid #e2e2ec;
  cursor: pointer;
  background: #f4f4f8;
}

.modal-actions .confirm-btn {
  flex: 2;
  padding: 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  background: #7c5cfc;
  color: #ffffff;
  border: none;
  cursor: pointer;
  transition: 0.15s;
}

.modal-actions .confirm-btn:hover {
  background: #624ce0;
}
</style>
