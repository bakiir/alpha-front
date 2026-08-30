<template>
  <div class="sell-page">
    <TheHeader />

    <main v-if="featureBlocked" class="sell-unavailable container">
      <h1>Раздел временно недоступен</h1>
      <p>Программа выкупа игрушек сейчас скрыта. Загляните в <NuxtLink to="/shop">каталог</NuxtLink> или оформите подписку.</p>
    </main>

    <main v-else class="sell-main">
      <!-- Breadcrumbs -->
      <div class="sell-breadcrumbs container">
        <NuxtLink to="/" class="bc-link">Главная</NuxtLink>
        <span class="bc-sep">/</span>
        <span class="bc-current">Продать нам</span>
      </div>

      <!-- Hero Header -->
      <section class="sell-hero container">
        <div class="hero-badge">
          <span><AppIcon name="leaf" :size="14" class="inline-icon" /> ПРОГРАММА ВЫКУПА И TRADE-IN ALPHA</span>
        </div>
        <h1 class="sell-title">
          Подарите любимым эко-игрушкам вторую жизнь
        </h1>
        <p class="sell-subtitle">
          Малыш вырос из балансиров и сортеров? Не копите игрушки дома — мы выкупим качественные развивающие игрушки деньгами на карту или начислим бонусы на подписку с выгодой +15%.
        </p>

        <!-- Benefits Highlights Grid -->
        <div class="sell-highlights">
          <div class="highlight-pill">
            <span class="hl-icon"><AppIcon name="leaf" :size="18" /></span>
            <span class="hl-text">Экологично и осознанно</span>
          </div>
          <div class="highlight-pill">
            <span class="hl-icon"><AppIcon name="truck" :size="18" /></span>
            <span class="hl-text">Бесплатный вывоз курьером</span>
          </div>
          <div class="highlight-pill">
            <span class="hl-icon"><AppIcon name="credit-card" :size="18" /></span>
            <span class="hl-text">Быстрая выплата на Kaspi</span>
          </div>
          <div class="highlight-pill">
            <span class="hl-icon"><AppIcon name="gift" :size="18" /></span>
            <span class="hl-text">+15% бонусами на подписку</span>
          </div>
        </div>
      </section>

      <!-- Main Form / Request Tracker Section -->
      <section class="sell-app-section container">
        <!-- MODE 1: Step-by-Step Application Wizard -->
        <div v-if="!submittedRequest" class="sell-card wizard-card">
          <!-- Wizard Steps Progress Bar -->
          <div class="wizard-stepper">
            <div 
              v-for="step in 4" 
              :key="step"
              class="step-item"
              :class="{
                active: currentStep === step,
                completed: currentStep > step
              }"
              @click="goToStep(step)"
            >
              <div class="step-circle">
                <span v-if="currentStep > step">✓</span>
                <span v-else>{{ step }}</span>
              </div>
              <span class="step-label">
                {{ getStepTitle(step) }}
              </span>
            </div>
          </div>

          <div class="wizard-content">
            <!-- STEP 1: Выбор и описание товара -->
            <div v-if="currentStep === 1" class="step-view">
              <div class="step-heading">
                <span class="step-counter">Шаг 1 из 4</span>
                <h2>Какую игрушку вы хотите продать?</h2>
                <p>Выберите категорию и укажите название или бренд игрушки.</p>
              </div>

              <!-- Categories Select Grid -->
              <div class="form-group">
                <label class="form-label">Категория игрушки <span class="req">*</span></label>
                <div class="categories-selector-grid">
                  <button
                    v-for="cat in toyCategories"
                    :key="cat.id"
                    type="button"
                    class="cat-select-btn"
                    :class="{ selected: form.category === cat.name }"
                    @click="form.category = cat.name"
                  >
                    <span class="cat-icon"><AppIcon :name="cat.icon" :size="20" /></span>
                    <span class="cat-name">{{ cat.name }}</span>
                  </button>
                </div>
              </div>

              <!-- Row 1: Title & Original Price in balanced 2 columns -->
              <div class="step-fields-row-2">
                <div class="form-group">
                  <label class="form-label" for="toyTitle">Название игрушки и бренд <span class="req">*</span></label>
                  <input 
                    id="toyTitle"
                    v-model="form.title" 
                    type="text" 
                    class="form-input" 
                    placeholder="Например: Балансир «Лунный кот», PlanToys, Grimm's..."
                  />
                  <span class="form-hint">Если не помните бренд — опишите игрушку своими словами</span>
                </div>

                <div class="form-group">
                  <label class="form-label" for="origPrice">Примерная цена покупки (необязательно)</label>
                  <div class="input-with-suffix">
                    <input 
                      id="origPrice"
                      v-model="form.originalPrice" 
                      type="number" 
                      class="form-input" 
                      placeholder="Например: 18000"
                    />
                    <span class="input-suffix">₸</span>
                  </div>
                  <span class="form-hint">Поможет быстрее рассчитать процент выкупа</span>
                </div>
              </div>

              <!-- Row 2: Bought at Alpha Switch -->
              <div class="form-group bought-alpha-group">
                <label class="form-label">Покупалась ли эта игрушка ранее в магазине Alpha?</label>
                <div class="radio-pill-group">
                  <button 
                    type="button" 
                    class="radio-pill" 
                    :class="{ active: form.boughtAtAlpha === 'yes' }"
                    @click="form.boughtAtAlpha = 'yes'"
                  >
                    Да, покупали в магазине Alpha
                  </button>
                  <button 
                    type="button" 
                    class="radio-pill" 
                    :class="{ active: form.boughtAtAlpha === 'no' }"
                    @click="form.boughtAtAlpha = 'no'"
                  >
                    Нет, покупали в другом месте
                  </button>
                </div>
              </div>
            </div>

            <!-- STEP 2: Загрузка фотографий -->
            <div v-else-if="currentStep === 2" class="step-view">
              <div class="step-heading">
                <span class="step-counter">Шаг 2 из 4</span>
                <h2>Загрузите фотографии игрушки</h2>
                <p>Хорошие фото при дневном свете помогут нам быстрее и точнее сделать оценку.</p>
              </div>

              <div class="step-photos-grid-2">
                <!-- Left: Upload Drag & Drop Area -->
                <div 
                  class="photo-dropzone" 
                  :class="{ dragover: isDragging }"
                  @dragover.prevent="isDragging = true"
                  @dragleave.prevent="isDragging = false"
                  @drop.prevent="handleFileDrop"
                  @click="triggerFileInput"
                >
                  <input 
                    ref="fileInputRef" 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    class="hidden-file-input" 
                    @change="handleFileSelect"
                  />
                  <div class="dropzone-inner">
                    <div class="drop-icon-circle"><AppIcon name="camera" :size="28" /></div>
                    <strong class="drop-title">Нажмите или перетащите сюда фото</strong>
                    <span class="drop-desc">Поддерживаются JPG, PNG до 10 МБ (до 6 фотографий)</span>
                    <button type="button" class="btn-select-photos">Выбрать файлы</button>
                  </div>
                </div>

                <!-- Right: Photos Preview Grid & Tips -->
                <div class="photos-right-panel">
                  <div v-if="form.photos.length > 0" class="uploaded-photos-grid">
                    <div 
                      v-for="(photo, idx) in form.photos" 
                      :key="idx" 
                      class="photo-preview-card"
                    >
                      <img :src="photo" :alt="`Фото ${idx + 1}`" class="preview-img" />
                      <span v-if="idx === 0" class="main-photo-badge">Главное</span>
                      <button 
                        type="button" 
                        class="btn-remove-photo" 
                        @click.stop="removePhoto(idx)"
                        title="Удалить фото"
                      >
                        &times;
                      </button>
                    </div>
                  </div>

                  <!-- Photo Tips Alert -->
                  <div class="photo-tips-box">
                    <div class="tip-icon"><AppIcon name="lightbulb" :size="22" /></div>
                    <div class="tip-text">
                      <strong>Совет для максимальной оценки:</strong>
                      <span>Сфотографируйте игрушку со всех сторон, а также снимите крупным планом комплектность и наличие коробки.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 3: Состояние и комплектация -->
            <div v-else-if="currentStep === 3" class="step-view">
              <div class="step-heading">
                <span class="step-counter">Шаг 3 из 4</span>
                <h2>Оцените состояние игрушки</h2>
                <p>Мы принимаем игрушки в любом игровом состоянии — просто укажите честно.</p>
              </div>

              <!-- Condition Cards 2x2 Grid -->
              <div class="form-group">
                <label class="form-label">Текущее состояние <span class="req">*</span></label>
                <div class="condition-cards-grid">
                  <div 
                    v-for="cond in conditionOptions" 
                    :key="cond.id"
                    class="condition-card"
                    :class="{ selected: form.condition === cond.id }"
                    @click="form.condition = cond.id"
                  >
                    <div class="cond-radio-circle">
                      <div v-if="form.condition === cond.id" class="cond-radio-dot"></div>
                    </div>
                    <div class="cond-info">
                      <div class="cond-title-row">
                        <strong class="cond-title">{{ cond.title }}</strong>
                        <span class="cond-tag" :class="cond.tagClass">{{ cond.badge }}</span>
                      </div>
                      <p class="cond-desc">{{ cond.desc }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="step-fields-grid-2">
                <!-- Completeness Checkboxes -->
                <div class="form-group">
                  <label class="form-label">Комплектация и упаковка</label>
                  <div class="checkboxes-list">
                    <label class="custom-checkbox">
                      <input v-model="form.hasAllParts" type="checkbox" />
                      <span class="chk-box"></span>
                      <span class="chk-label">Все основные детали и элементы на месте</span>
                    </label>
                    <label class="custom-checkbox">
                      <input v-model="form.hasOriginalBox" type="checkbox" />
                      <span class="chk-box"></span>
                      <span class="chk-label">Сохранилась оригинальная коробка / упаковка</span>
                    </label>
                    <label class="custom-checkbox">
                      <input v-model="form.hasManual" type="checkbox" />
                      <span class="chk-box"></span>
                      <span class="chk-label">Есть методичка / карточки для развивающих занятий</span>
                    </label>
                  </div>
                </div>

                <!-- Defects / Comment Note -->
                <div class="form-group">
                  <label class="form-label" for="defectsNote">Комментарий или особенности (если есть)</label>
                  <textarea 
                    id="defectsNote"
                    v-model="form.comment" 
                    class="form-textarea" 
                    rows="4"
                    placeholder="Например: небольшая потертость на уголке основания, в остальном всё идеально..."
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- STEP 4: Контактные данные и отправка -->
            <div v-else-if="currentStep === 4" class="step-view">
              <div class="step-heading">
                <span class="step-counter">Шаг 4 из 4</span>
                <h2>Куда отправить оценку и предложение?</h2>
                <p>Менеджер оценит заявку и пришлёт расчёт стоимости выкупа в течение 2–4 часов.</p>
              </div>

              <div class="step-contacts-grid-2">
                <!-- Left: Contacts -->
                <div class="contacts-left-col">
                  <!-- Name -->
                  <div class="form-group">
                    <label class="form-label" for="clientName">Ваше имя <span class="req">*</span></label>
                    <input 
                      id="clientName"
                      v-model="form.name" 
                      type="text" 
                      class="form-input" 
                      placeholder="Как к вам обращаться"
                    />
                  </div>

                  <!-- Phone / WhatsApp -->
                  <div class="form-group">
                    <label class="form-label" for="clientPhone">Телефон WhatsApp <span class="req">*</span></label>
                    <input 
                      id="clientPhone"
                      :value="form.phone" 
                      type="tel" 
                      class="form-input" 
                      placeholder="+7 (700) 000-00-00"
                      @input="onPhoneInput"
                      @paste="onPhonePaste"
                    />
                  </div>

                  <!-- City Select -->
                  <div class="form-group">
                    <label class="form-label" for="clientCity">Город <span class="req">*</span></label>
                    <select id="clientCity" v-model="form.city" class="form-select">
                      <option value="Алматы">Алматы (бесплатный курьерский вывоз)</option>
                      <option value="Астана">Астана (бесплатный курьерский вывоз)</option>
                      <option value="Шымкент">Шымкент</option>
                      <option value="Караганда">Караганда</option>
                      <option value="Актобе">Актобе</option>
                      <option value="Другой город">Другой город РК (через СДЭК / Казпочту)</option>
                    </select>
                  </div>
                </div>

                <!-- Right: Payout Options & Recap -->
                <div class="contacts-right-col">
                  <!-- Payout Preference Choice -->
                  <div class="form-group">
                    <label class="form-label">Предпочитаемый способ получения средств</label>
                    <div class="payout-options-grid">
                      <div 
                        class="payout-option-card"
                        :class="{ selected: form.payoutType === 'kaspi' }"
                        @click="form.payoutType = 'kaspi'"
                      >
                        <div class="payout-header">
                          <span class="p-icon"><AppIcon name="credit-card" :size="20" /></span>
                          <strong>Деньги на Kaspi / Карту</strong>
                        </div>
                        <p>Прямой перевод средств после проверки игрушки.</p>
                      </div>

                      <div 
                        class="payout-option-card bonus-card"
                        :class="{ selected: form.payoutType === 'bonus' }"
                        @click="form.payoutType = 'bonus'"
                      >
                        <span class="bonus-badge">+15% ВЫГОДА</span>
                        <div class="payout-header">
                          <span class="p-icon"><AppIcon name="gift" :size="20" /></span>
                          <strong>Бонусы на баланс Alpha</strong>
                        </div>
                        <p>На 15% больше суммы для оплаты будущей подписки и покупок.</p>
                      </div>
                    </div>
                  </div>

                  <!-- Summary Recap Box -->
                  <div class="recap-summary-box">
                    <div class="recap-header">
                      <strong>Сводка заявки:</strong>
                      <span>{{ form.category }} • {{ form.title || 'Игрушка' }}</span>
                    </div>
                    <div class="recap-details">
                      <span>Состояние: <b>{{ getConditionLabel(form.condition) }}</b></span>
                      <span>Фото: <b>{{ form.photos.length }} шт.</b></span>
                      <span>Город: <b>{{ form.city }}</b></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Wizard Footer Navigation Buttons -->
          <div class="wizard-footer">
            <button 
              v-if="currentStep > 1"
              type="button" 
              class="btn-step-back"
              @click="currentStep--"
            >
              ← Назад
            </button>
            <div v-else></div>

            <button 
              v-if="currentStep < 4"
              type="button" 
              class="btn-step-next"
              :disabled="!isCurrentStepValid"
              @click="currentStep++"
            >
              Далее →
            </button>

            <button 
              v-else
              type="button" 
              class="btn-submit-request"
              :disabled="!isCurrentStepValid || isSubmitting"
              @click="submitSellRequest"
            >
              <span v-if="isSubmitting">Отправка заявки...</span>
              <span v-else>Отправить заявку на оценку</span>
            </button>
          </div>
        </div>

        <!-- MODE 2: Submitted Request Flow / Real Backend Status Screen -->
        <div v-else class="sell-card status-tracker-card">
          <!-- Top Status Header -->
          <div class="tracker-header">
            <div class="success-icon-badge">
              <AppIcon v-if="isTransferConfirmed" name="party" :size="28" />
              <AppIcon v-else-if="submittedRequest.status === 'evaluated'" name="sparkles" :size="28" />
              <AppIcon v-else name="timer" :size="28" />
            </div>
            <div class="tracker-meta">
              <span class="req-number">Заявка #{{ submittedRequest.request_number || submittedRequest.id }} • {{ formatDate(submittedRequest.created_at) }}</span>
              <h2 v-if="isTransferConfirmed">Сделка успешно подтверждена!</h2>
              <h2 v-else-if="submittedRequest.status === 'evaluated'">Оценка готова! Ознакомьтесь с предложением</h2>
              <h2 v-else-if="submittedRequest.status === 'pending'">Заявка на оценке у методиста Alpha</h2>
              <h2 v-else-if="submittedRequest.status === 'declined'">Предложение отклонено</h2>
              <h2 v-else>Статус заявки: {{ submittedRequest.status }}</h2>

              <p v-if="isTransferConfirmed">Осталось передать игрушку — выплата поступит сразу после проверки.</p>
              <p v-else-if="submittedRequest.status === 'evaluated'">Эксперты Alpha оценили игрушку «{{ submittedRequest.title }}» и сформировали предложение.</p>
              <p v-else-if="submittedRequest.status === 'pending'">Эксперты проверяют фото игрушки «{{ submittedRequest.title }}». Ожидайте выставления оценки в системе.</p>
            </div>
          </div>

          <!-- Interactive 5-Phase Flow Progress Bar -->
          <div class="flow-progress-bar">
            <div class="flow-stage completed">
              <div class="stage-dot">✓</div>
              <span>1. Заявка</span>
            </div>
            <div class="flow-line" :class="{ completed: submittedRequest.status !== 'pending' }"></div>

            <div class="flow-stage" :class="{ completed: ['evaluated', 'accepted', 'confirmed', 'received', 'completed'].includes(submittedRequest.status), active: submittedRequest.status === 'pending' }">
              <div class="stage-dot">
                <span v-if="['evaluated', 'accepted', 'confirmed', 'received', 'completed'].includes(submittedRequest.status)">✓</span>
                <span v-else>2</span>
              </div>
              <span>2. Оценка</span>
            </div>
            <div class="flow-line" :class="{ completed: ['accepted', 'confirmed', 'received', 'completed'].includes(submittedRequest.status), active: submittedRequest.status === 'evaluated' }"></div>

            <div class="flow-stage" :class="{ completed: ['accepted', 'confirmed', 'received', 'completed'].includes(submittedRequest.status), active: submittedRequest.status === 'evaluated' }">
              <div class="stage-dot">
                <span v-if="['accepted', 'confirmed', 'received', 'completed'].includes(submittedRequest.status)">✓</span>
                <span v-else>3</span>
              </div>
              <span>3. Согласование</span>
            </div>
            <div class="flow-line" :class="{ active: isTransferConfirmed, completed: isTransferConfirmed }"></div>

            <div class="flow-stage" :class="{ active: isTransferConfirmed }">
              <div class="stage-dot">4</div>
              <span>4. Передача</span>
            </div>
            <div class="flow-line"></div>

            <div class="flow-stage">
              <div class="stage-dot">5</div>
              <span>5. Выплата</span>
            </div>
          </div>

          <!-- STATE 1: PENDING EVALUATION (Ждем оценку эксперта из админки) -->
          <div v-if="submittedRequest.status === 'pending'" class="pending-evaluation-box">
            <div class="pending-banner">
              <div class="pb-icon"><AppIcon name="search" :size="24" /></div>
              <div class="pb-content">
                <h3>Эксперт Alpha проводит оценку по фото</h3>
                <p>
                  Мы проверяем состояние, комплектность и бренд игрушки <b>«{{ submittedRequest.title }}»</b>. 
                  Обычно это занимает <b>от 20 минут до 2 часов</b> в рабочее время.
                </p>
                <div class="status-realtime-badge">
                  <span class="live-dot"></span>
                  <span>Ожидание решения методиста в админ-панели...</span>
                </div>
              </div>
            </div>

            <div class="pending-actions-row" style="display: flex; gap: 12px; margin-top: 20px; align-items: center;">
              <button 
                type="button" 
                class="btn-step-next" 
                :disabled="isRefreshing" 
                style="margin: 0;"
                @click="refreshRequestStatus"
              >
                {{ isRefreshing ? 'Проверяем...' : 'Обновить статус оценки' }}
              </button>
              <a 
                :href="`https://wa.me/77000000000?text=${encodeURIComponent('Здравствуйте! Я отправил заявку на выкуп игрушки #' + (submittedRequest.request_number || submittedRequest.id))}`" 
                target="_blank" 
                class="btn-whatsapp-manager"
                style="padding: 12px 20px; text-decoration: none;"
              >
                <span><AppIcon name="message" :size="16" class="inline-icon" /> Уточнить в WhatsApp</span>
              </a>
            </div>
          </div>

          <!-- STATE 2 & 3: EVALUATED & OFFER READY (Эксперт выставил сумму в админке) -->
          <div v-else-if="!isTransferConfirmed && (submittedRequest.status === 'evaluated' || submittedRequest.status === 'accepted')" class="alpha-offer-box">
            <div class="offer-header">
              <div class="offer-tag">ПРЕДЛОЖЕНИЕ СФОРМИРОВАНО ЭКСПЕРТОМ</div>
              <h3>Оценка по выкупу игрушки «{{ submittedRequest.title }}»</h3>
              <p>Эксперт-методист проверил фотографии и утвердил стоимость выкупа:</p>
            </div>

            <!-- Price Variants Display -->
            <div class="offer-price-variants">
              <div class="price-variant-card primary" :class="{ chosen: chosenPayout === 'cash' }" @click="chosenPayout = 'cash'">
                <div class="pv-badge">ВЫПЛАТА НА КАРТУ</div>
                <div class="pv-amount">{{ formatPrice(calculatedPrice) }} ₸</div>
                <span class="pv-desc">Моментальный перевод Kaspi / Halyk после получения</span>
              </div>

              <div class="price-variant-card bonus" :class="{ chosen: chosenPayout === 'bonus' }" @click="chosenPayout = 'bonus'">
                <div class="pv-badge gold">+15% ВЫГОДА</div>
                <div class="pv-amount">{{ formatPrice(Math.round(calculatedPrice * 1.15)) }} ₸</div>
                <span class="pv-desc">Бонусами на баланс подписки и покупок в Alpha</span>
              </div>
            </div>

            <!-- Decision Action Buttons: Принять / Отклонить (только в статусе evaluated) -->
            <div v-if="submittedRequest.status === 'evaluated'" class="decision-actions-row">
              <button class="btn-accept-offer" @click="handleDecision('accepted')">
                <span>Согласиться с оценкой и продолжить</span>
              </button>
              <button class="btn-decline-offer" @click="handleDecision('declined')">
                <span>Отказаться от предложения</span>
              </button>
            </div>

            <!-- If Accepted: Delivery Method Selection & Payout Form -->
            <div v-else-if="submittedRequest.status === 'accepted'" class="accepted-flow-box">
              <div class="accepted-badge">✓ ВЫ СОГЛАСИЛИСЬ С ОЦЕНКОЙ!</div>
              
              <div class="flow-instructions-alert">
                <strong>Шаг 1 из 2: Заполните детали передачи и номер для выплаты</strong>
                <p>Выберите, как вам удобнее передать игрушку, и укажите номер Kaspi для получения средств.</p>
              </div>

              <div class="form-section-title">1. Способ передачи игрушки:</div>
              <div class="transfer-methods-grid">
                <label class="transfer-method-card" :class="{ selected: transferMethod === 'courier' }">
                  <input v-model="transferMethod" type="radio" value="courier" />
                  <div class="tm-content">
                    <strong><AppIcon name="truck" :size="16" class="inline-icon" /> Бесплатный вызов курьера Alpha</strong>
                    <p>Курьер приедет по вашему адресу, привезёт фирменный пакет и выдаст акт приёма.</p>
                  </div>
                </label>

                <label class="transfer-method-card" :class="{ selected: transferMethod === 'showroom' }">
                  <input v-model="transferMethod" type="radio" value="showroom" />
                  <div class="tm-content">
                    <strong><AppIcon name="shop" :size="16" class="inline-icon" /> Привезти в шоурум Alpha</strong>
                    <p>г. Алматы, пр. Достык 180 (ежедневно с 10:00 до 20:00 без выходных).</p>
                  </div>
                </label>
              </div>

              <!-- If Courier: Address input -->
              <div v-if="transferMethod === 'courier'" class="courier-details-box">
                <div class="form-group">
                  <label class="form-label">Адрес забора (улица, дом, квартира):</label>
                  <input 
                    v-model="courierAddress" 
                    type="text" 
                    class="form-input" 
                    placeholder="Например: ул. Абая 45, кв. 12"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Удобное время приезда курьера:</label>
                  <select v-model="courierTime" class="form-select">
                    <option value="Завтра, 10:00 - 14:00">Завтра (10:00 – 14:00)</option>
                    <option value="Завтра, 14:00 - 18:00">Завтра (14:00 – 18:00)</option>
                    <option value="Завтра, 18:00 - 21:00">Завтра (18:00 – 21:00)</option>
                    <option value="Послезавтра, 10:00 - 18:00">Послезавтра (10:00 – 18:00)</option>
                  </select>
                </div>
              </div>

              <!-- Payout Requisites -->
              <div class="form-section-title">2. Реквизиты для выплаты денег:</div>
              <div class="payout-requisites-form">
                <label class="form-label">
                  <span v-if="chosenPayout === 'cash'">Номер телефона для перевода Kaspi Gold:</span>
                  <span v-else>Номер телефона для зачисления бонусов Alpha:</span>
                </label>
                <div class="requisites-input-row">
                  <input 
                    :value="kaspiPhone" 
                    type="tel" 
                    class="form-input" 
                    placeholder="+7 (700) 000-00-00"
                    @input="onKaspiPhoneInput"
                  />
                  <button class="btn-confirm-transfer" @click="confirmTransfer">
                    <span v-if="transferMethod === 'courier'">Подтвердить и вызвать курьера ({{ formatPrice(calculatedPrice) }} ₸)</span>
                    <span v-else>Подтвердить сдачу в шоурум ({{ formatPrice(calculatedPrice) }} ₸)</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- If Declined -->
            <div v-else-if="submittedRequest.status === 'declined'" class="declined-flow-box">
              <p>Вы отклонили предложение. Спасибо за обращение! Если передумаете или захотите оценить другую игрушку — мы всегда на связи.</p>
              <button class="btn-start-new" @click="startNewRequest">
                + Оценить другую игрушку
              </button>
            </div>
          </div>

          <!-- STATE 3: FULL ROADMAP AFTER TRANSFER IS CONFIRMED (Пошаговый план к деньгам) -->
          <div v-else class="confirmed-payout-roadmap-card">
            <div class="confirmed-header-banner">
              <div class="ch-badge">СДЕЛКА ЗАФИКСИРОВАНА</div>
              <h3>Сумма к выплате: <span class="highlight-sum">{{ formatPrice(calculatedPrice) }} ₸</span></h3>
              <p>
                Способ выплаты: <b>Kaspi Gold ({{ kaspiPhone }})</b> • Игрушка: <b>«{{ submittedRequest.title }}»</b>
              </p>
            </div>

            <div class="roadmap-steps-title">
              <h4>Что происходит дальше? (3 простых шага до денег):</h4>
            </div>

            <div class="roadmap-steps-list">
              <!-- Step 1: Handover -->
              <div class="roadmap-step-item current">
                <div class="rs-icon-circle"><AppIcon name="truck" :size="22" /></div>
                <div class="rs-content">
                  <div class="rs-header">
                    <strong>Шаг 1. Передача игрушки</strong>
                    <span class="rs-badge in-progress">В ПРОЦЕССЕ</span>
                  </div>
                  <p v-if="transferMethod === 'courier'">
                    Бесплатный курьер Alpha приедет <b>{{ courierTime }}</b> по адресу: <b>{{ courierAddress || 'ваш адрес в ' + form.city }}</b>. Курьер позвонит за 30 минут, привезёт фирменный пакет и выдаст акт приёма-передачи.
                  </p>
                  <p v-else>
                    Ждём вас в шоуруме Alpha: <b>г. Алматы, пр. Достык 180</b> (ежедневно с 10:00 до 20:00). Назовите номер вашей заявки <b>#{{ submittedRequest.id }}</b>.
                  </p>
                </div>
              </div>

              <!-- Step 2: Inspection -->
              <div class="roadmap-step-item">
                <div class="rs-icon-circle"><AppIcon name="search" :size="22" /></div>
                <div class="rs-content">
                  <div class="rs-header">
                    <strong>Шаг 2. Экспресс-проверка экспертом</strong>
                    <span class="rs-badge pending">ОЖИДАЕТ</span>
                  </div>
                  <p>
                    В течение <b>2–3 часов</b> после забора эксперт сверит игрушку с фотографиями из заявки и подтвердит комплектацию.
                  </p>
                </div>
              </div>

              <!-- Step 3: Instant Payout -->
              <div class="roadmap-step-item">
                <div class="rs-icon-circle"><AppIcon name="credit-card" :size="22" /></div>
                <div class="rs-content">
                  <div class="rs-header">
                    <strong>Шаг 3. Моментальная выплата {{ formatPrice(calculatedPrice) }} ₸</strong>
                    <span class="rs-badge pending">ФИНАЛ</span>
                  </div>
                  <p>
                    Деньги моментально отправляются на ваш <b>Kaspi Gold ({{ kaspiPhone }})</b> сразу после проверки. Чек и уведомление придут в WhatsApp.
                  </p>
                </div>
              </div>
            </div>

            <!-- WhatsApp Manager Contact Box -->
            <div class="manager-contact-banner">
              <div class="mc-left">
                <span class="mc-avatar"><AppIcon name="user" :size="22" /></span>
                <div class="mc-text">
                  <strong>Менеджер выкупа Alpha на связи:</strong>
                  <span>Если есть вопросы по времени курьера или реквизитам</span>
                </div>
              </div>
              <a 
                :href="`https://wa.me/77000000000?text=${encodeURIComponent('Здравствуйте! Я по поводу заявки на выкуп игрушки #' + submittedRequest.id)}`" 
                target="_blank" 
                class="btn-whatsapp-manager"
              >
                <span><AppIcon name="message" :size="16" class="inline-icon" /> Написать в WhatsApp</span>
              </a>
            </div>
          </div>

          <!-- Bottom Actions -->
          <div class="tracker-footer">
            <button class="btn-create-another" @click="startNewRequest">
              + Оформить ещё одну игрушку на выкуп
            </button>
          </div>
        </div>
      </section>

      <!-- FAQ Section for Buyback / Resale -->
      <section class="sell-faq-section container">
        <div class="faq-header-center">
          <div class="badge">ВОПРОСЫ И ОТВЕТЫ</div>
          <h2>Частые вопросы о программе выкупа</h2>
          <p>Всё, что важно знать о процессе оценки, передаче и выплате денег.</p>
        </div>

        <div class="sell-faq-grid">
          <div class="sell-faq-card">
            <h4><AppIcon name="toy" :size="18" class="faq-icon" /> Какие игрушки вы выкупаете?</h4>
            <p>Мы принимаем качественные деревянные, тактильные, Монтессори материалы, сортеры, балансборды, бизиборды, конструкторы и лазалки от известных эко-брендов и проверенных производителей.</p>
          </div>

          <div class="sell-faq-card">
            <h4><AppIcon name="timer" :size="18" class="faq-icon" /> Сколько времени занимает оценка?</h4>
            <p>Предварительную оценку по фото мы делаем в течение 2–4 часов в рабочее время. После получения игрушки курьером проверка занимает до 24 часов, после чего деньги переводятся на карту.</p>
          </div>

          <div class="sell-faq-card">
            <h4><AppIcon name="truck" :size="18" class="faq-icon" /> Кто оплачивает доставку?</h4>
            <p>В Алматы и Астане вывоз осуществляется нашим курьером абсолютно бесплатно. Из других городов РК отправка организуется за наш счёт через партнёрские службы доставки.</p>
          </div>

          <div class="sell-faq-card">
            <h4><AppIcon name="credit-card" :size="18" class="faq-icon" /> Как происходят выплаты?</h4>
            <p>Вы можете выбрать моментальный перевод на Kaspi Gold / любую банковскую карту РК, либо получить сумму на 15% больше в виде бонусных баллов на баланс подписки Alpha.</p>
          </div>
        </div>
      </section>
    </main>

    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import TheHeader from '~/components/TheHeader.vue'
import TheFooter from '~/components/TheFooter.vue'
import { handlePhoneInput, handlePhonePaste } from '~/composables/usePhoneMask'
import { useAuth } from '~/composables/useAuth'

useHead({
  title: 'Продать нам — Программа выкупа эко-игрушек | Alpha',
  meta: [
    {
      name: 'description',
      content: 'Продайте свои развивающие и деревянные игрушки Alpha Play. Быстрая онлайн-оценка по фото, бесплатный вывоз курьером и моментальная выплата на карту.',
    },
  ],
})

const { user } = useAuth()
const { success: toastSuccess, error: toastError } = useToast()
const { fetchFeatures, isVisible } = useFeatures()
const featureBlocked = ref(false)

onMounted(async () => {
  await fetchFeatures()
  if (!isVisible('sell_to_us')) {
    featureBlocked.value = true
  }
})

const { createSellRequest, submitDecision, confirmTransferDetails, fetchSellRequest } = useSellToys()

// Wizard Steps State
const currentStep = ref(1)
const isDragging = ref(false)
const isSubmitting = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

// Form State
const form = reactive({
  category: 'Мелкая моторика и сортеры',
  title: '',
  boughtAtAlpha: 'yes',
  originalPrice: '',
  photos: [] as string[],
  condition: 'excellent',
  hasAllParts: true,
  hasOriginalBox: true,
  hasManual: false,
  comment: '',
  name: '',
  phone: '',
  city: 'Алматы',
  payoutType: 'kaspi' as 'kaspi' | 'bonus'
})

// Submitted Request State (for Step 5-8 tracking screen)
const submittedRequest = ref<any | null>(null)

const chosenPayout = ref<'cash' | 'bonus'>('cash')
const transferMethod = ref<'courier' | 'showroom'>('courier')
const kaspiPhone = ref('')
const courierAddress = ref('')
const courierTime = ref('Завтра, 10:00 - 14:00')
const isTransferConfirmed = ref(false)

// Toy Categories for Step 1
const toyCategories = [
  { id: '1', name: 'Мелкая моторика и сортеры', icon: 'how-it-works' },
  { id: '2', name: 'Балансиры и качалки', icon: 'bolt' },
  { id: '3', name: 'Бизиборды и замочки', icon: 'home' },
  { id: '4', name: 'Методика Монтессори', icon: 'sparkles' },
  { id: '5', name: 'Деревянные конструкторы', icon: 'blocks' },
  { id: '6', name: 'Сенсорные пирамидки', icon: 'palette' },
  { id: '7', name: 'Пазлы и головоломки', icon: 'brain' },
  { id: '8', name: 'Другая развивающая игрушка', icon: 'toy' },
]

// Condition Options for Step 3
const conditionOptions = [
  {
    id: 'like_new',
    title: 'Идеальное (как новая)',
    badge: '100% ОЦЕНКА',
    tagClass: 'gold-tag',
    desc: 'Игрушка без следов использования, чистая, полный комплект и идеальный вид дерева.'
  },
  {
    id: 'excellent',
    title: 'Отличное состояние',
    badge: 'ВЫСОКАЯ ОЦЕНКА',
    tagClass: 'green-tag',
    desc: 'Минимальные естественные следы бережной игры, без сколов и глубоких царапин.'
  },
  {
    id: 'good',
    title: 'Хорошее (есть следы игр)',
    badge: 'БАЗОВАЯ ОЦЕНКА',
    tagClass: 'purple-tag',
    desc: 'Есть легкие потертости краски или микроцарапины от активных детских занятий.'
  },
  {
    id: 'with_nuances',
    title: 'С нюансами / неполный комплект',
    badge: 'ИНДИВИДУАЛЬНО',
    tagClass: 'gray-tag',
    desc: 'Заметные следы игр или утеряна одна из второстепенных мелких деталей.'
  }
]

// Step Titles
const getStepTitle = (step: number) => {
  const map: Record<number, string> = {
    1: 'Товар',
    2: 'Фотографии',
    3: 'Состояние',
    4: 'Контакты'
  }
  return map[step] || ''
}

// Condition Label helper
const getConditionLabel = (condId: string) => {
  const found = conditionOptions.find(c => c.id === condId)
  return found ? found.title : 'Отличное'
}

// Estimated Price Calculator Simulation / Display
const calculatedPrice = computed(() => {
  if (submittedRequest.value?.estimated_price) {
    return Number(submittedRequest.value.estimated_price)
  }
  let base = 12000
  if (form.originalPrice && Number(form.originalPrice) > 0) {
    base = Math.round(Number(form.originalPrice) * 0.65)
  }
  if (form.condition === 'like_new') base = Math.round(base * 1.15)
  if (form.condition === 'good') base = Math.round(base * 0.85)
  if (form.condition === 'with_nuances') base = Math.round(base * 0.7)
  return Math.max(base, 6500)
})

// Validation for Current Step
const isCurrentStepValid = computed(() => {
  if (currentStep.value === 1) {
    return form.category.trim() !== '' && form.title.trim().length >= 2
  }
  if (currentStep.value === 2) {
    return form.photos.length >= 1
  }
  if (currentStep.value === 3) {
    return form.condition.trim() !== ''
  }
  if (currentStep.value === 4) {
    return form.name.trim().length >= 2 && form.phone.replace(/\D/g, '').length >= 10
  }
  return true
})

// Phone Mask Event Handlers
const onPhoneInput = (event: Event) => {
  handlePhoneInput(event, (val) => {
    form.phone = val
  })
}

const onPhonePaste = (event: ClipboardEvent) => {
  handlePhonePaste(event, (val) => {
    form.phone = val
  })
}

const onKaspiPhoneInput = (event: Event) => {
  handlePhoneInput(event, (val) => {
    kaspiPhone.value = val
  })
}

// Navigation between steps
const goToStep = (step: number) => {
  if (step < currentStep.value) {
    currentStep.value = step
  }
}

// Photo Upload Handlers
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files) {
    processFiles(Array.from(target.files))
  }
}

const handleFileDrop = (e: DragEvent) => {
  isDragging.value = false
  if (e.dataTransfer?.files) {
    processFiles(Array.from(e.dataTransfer.files))
  }
}

const processFiles = (files: File[]) => {
  const imageFiles = files.filter(f => f.type.startsWith('image/')).slice(0, 6 - form.photos.length)
  imageFiles.forEach(file => {
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        form.photos.push(event.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  })
}

const removePhoto = (idx: number) => {
  form.photos.splice(idx, 1)
}

// Format Price
const formatPrice = (val: number | string) => {
  const num = Number(val) || 0
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
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

// Submit Real Application via API
const submitSellRequest = async () => {
  if (!isCurrentStepValid.value) return

  isSubmitting.value = true

  try {
    const res = await createSellRequest({
      category: form.category,
      title: form.title,
      original_price: form.originalPrice ? Number(form.originalPrice) : null,
      bought_at_alpha: form.boughtAtAlpha === 'yes',
      photos: form.photos,
      condition: form.condition,
      has_all_parts: form.hasAllParts,
      has_original_box: form.hasOriginalBox,
      has_manual: form.hasManual,
      comment: form.comment,
      name: form.name,
      phone: form.phone,
      city: form.city,
      payout_type: form.payoutType,
    })

    if (res?.data) {
      submittedRequest.value = res.data
      kaspiPhone.value = form.phone
    }
  } catch (e: any) {
    console.error('Failed to submit sell request:', e)
    toastError('Не удалось отправить', e?.data?.message || 'Не удалось отправить заявку. Проверьте правильность заполненных данных.')
  } finally {
    isSubmitting.value = false
  }
}

// Handle Client Decision (Accept / Decline)
const handleDecision = async (decision: 'accepted' | 'declined') => {
  if (!submittedRequest.value) return
  try {
    const res = await submitDecision(submittedRequest.value.id, decision)
    if (res?.data) {
      submittedRequest.value = res.data
    }
  } catch (e: any) {
    console.error('Failed to submit decision:', e)
    toastError('Ошибка', e?.data?.message || 'Ошибка сохранения решения')
  }
}

// Confirm Delivery Transfer
const confirmTransfer = async () => {
  if (kaspiPhone.value.replace(/\D/g, '').length < 11) {
    toastError('Неверный номер', 'Пожалуйста, укажите корректный номер телефона Kaspi')
    return
  }
  if (!submittedRequest.value) return

  try {
    const res = await confirmTransferDetails(submittedRequest.value.id, {
      transfer_method: transferMethod.value,
      courier_address: transferMethod.value === 'courier' ? courierAddress.value : undefined,
      courier_time: transferMethod.value === 'courier' ? courierTime.value : undefined,
      kaspi_phone: kaspiPhone.value,
    })

    if (res?.data) {
      submittedRequest.value = res.data
      isTransferConfirmed.value = true
    }
  } catch (e: any) {
    console.error('Failed to confirm transfer:', e)
    toastError('Ошибка подтверждения', e?.data?.message || 'Ошибка подтверждения передачи')
  }
}

const isRefreshing = ref(false)

const refreshRequestStatus = async () => {
  if (!submittedRequest.value?.id) return
  isRefreshing.value = true
  try {
    const res = await fetchSellRequest(submittedRequest.value.id)
    if (res?.data) {
      submittedRequest.value = res.data
    }
  } catch (e) {
    console.error('Failed to refresh status:', e)
  } finally {
    isRefreshing.value = false
  }
}

// Start New Request
const startNewRequest = () => {
  submittedRequest.value = null
  currentStep.value = 1
  form.title = ''
  form.photos = []
  form.comment = ''
  isTransferConfirmed.value = false
}

let pollTimer: any = null

// Autofill user data if logged in & setup polling
onMounted(() => {
  if (user.value) {
    if (user.value.name) form.name = user.value.name
    if (user.value.phone) form.phone = user.value.phone
  }

  if (import.meta.client) {
    pollTimer = setInterval(() => {
      if (submittedRequest.value && ['pending', 'confirmed', 'received'].includes(submittedRequest.value.status)) {
        refreshRequestStatus()
      }
    }, 8000)
  }
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<style scoped>
.sell-page {
  min-height: 100vh;
  background: #FFF8F0;
  display: flex;
  flex-direction: column;
}

.sell-main {
  flex: 1;
  padding-bottom: 90px;
}

/* Breadcrumbs */
.sell-breadcrumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px 24px 8px;
  font-size: 13.5px;
}

.bc-link {
  color: #7B7B93;
  text-decoration: none;
  transition: color 0.15s ease;
}

.bc-link:hover {
  color: #624CE0;
}

.bc-sep {
  color: #C8C8DC;
}

.bc-current {
  color: #1A1A2E;
  font-weight: 700;
}

/* Hero Section (Matching Gifts page 1240px proportion) */
.sell-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 36px 24px 36px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.hero-badge {
  display: inline-flex;
  padding: 6px 16px;
  background: #EDE9FF;
  border-radius: 50px;
  margin-bottom: 14px;
}

.hero-badge span {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 11.5px;
  color: #7C5CFC;
  letter-spacing: 0.6px;
}

.sell-title {
  font-family: 'Outfit', sans-serif;
  font-size: 38px;
  font-weight: 800;
  line-height: 1.2;
  color: #1A1A2E;
  margin-bottom: 14px;
  letter-spacing: -0.5px;
}

.sell-subtitle {
  font-size: 16px;
  line-height: 1.6;
  color: #7B7B93;
  max-width: 700px;
  margin-bottom: 24px;
}

.sell-highlights {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.highlight-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #FFFFFF;
  padding: 8px 16px;
  border-radius: 50px;
  border: 1px solid #E2E2EC;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  font-weight: 700;
  font-size: 13px;
  color: #1A1A2E;
}

.hl-icon {
  font-size: 15px;
}

/* Card Container (1240px matching /gifts) */
.sell-app-section {
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 24px;
}

.sell-card {
  width: 100%;
  background: #FFFFFF;
  border-radius: 24px;
  border: 1px solid #EAEAF2;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

/* Wizard Stepper Header */
.wizard-stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 36px;
  background: #FAF8FF;
  border-bottom: 1px solid #EAEAF2;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  opacity: 0.55;
  transition: all 0.2s ease;
}

.step-item.active {
  opacity: 1;
}

.step-item.completed {
  opacity: 0.9;
}

.step-circle {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #EAEAF2;
  color: #7B7B93;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 13.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.step-item.active .step-circle {
  background: #624CE0;
  color: #FFFFFF;
  box-shadow: 0 4px 12px rgba(98, 76, 224, 0.3);
}

.step-item.completed .step-circle {
  background: #06D6A0;
  color: #FFFFFF;
}

.step-label {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 14px;
  color: #1A1A2E;
}

/* Wizard Content */
.wizard-content {
  padding: 40px 44px;
}

.step-heading {
  margin-bottom: 32px;
}

.step-counter {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 12px;
  color: #7C5CFC;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.step-heading h2 {
  font-family: 'Outfit', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: #1A1A2E;
  margin: 6px 0 4px;
}

.step-heading p {
  font-size: 15px;
  color: #7B7B93;
}

/* Form Elements & Layout Grids */
.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 14px;
  color: #1A1A2E;
  margin-bottom: 8px;
}

.req {
  color: #FF5A5F;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 13px 18px;
  border-radius: 14px;
  border: 1.5px solid #E2E2EC;
  background: #FFFFFF;
  font-family: 'DM Sans', sans-serif;
  font-size: 14.5px;
  color: #1A1A2E;
  outline: none;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: #624CE0;
  box-shadow: 0 4px 14px rgba(98, 76, 224, 0.12);
}

.form-hint {
  display: block;
  font-size: 12px;
  color: #7B7B93;
  margin-top: 6px;
}

/* Step 1 Balanced Rows */
.step-fields-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.bought-alpha-group {
  background: #FAF8FF;
  border: 1px solid #EDE9FF;
  border-radius: 18px;
  padding: 18px 22px;
  margin-top: 4px;
}

.bought-alpha-group .form-label {
  margin-bottom: 12px;
}

/* 2-Column Field Grids */
.step-fields-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.step-photos-grid-2 {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 24px;
  align-items: flex-start;
}

.photos-right-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step-contacts-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
}

.contacts-left-col,
.contacts-right-col {
  display: flex;
  flex-direction: column;
}

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.input-with-suffix {
  position: relative;
  display: flex;
  align-items: center;
}

.input-suffix {
  position: absolute;
  right: 18px;
  font-weight: 700;
  color: #7B7B93;
}

/* Categories Grid (4 columns on desktop) */
.categories-selector-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.cat-select-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px 10px;
  border-radius: 16px;
  border: 1.5px solid #EAEAF2;
  background: #FAF8FF;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: center;
}

.cat-select-btn:hover {
  border-color: #624CE0;
  background: #EDE9FF;
  transform: translateY(-2px);
}

.cat-select-btn.selected {
  border-color: #624CE0;
  background: #EDE9FF;
  box-shadow: 0 4px 14px rgba(98, 76, 224, 0.18);
  transform: translateY(-2px);
}

.cat-icon {
  font-size: 22px;
}

.cat-name {
  font-size: 12px;
  font-weight: 700;
  color: #1A1A2E;
  line-height: 1.25;
}

/* Radio Pill Group */
.radio-pill-group {
  display: flex;
  gap: 10px;
}

.radio-pill {
  flex: 1;
  padding: 12px 16px;
  border-radius: 14px;
  border: 1.5px solid #EAEAF2;
  background: #FFFFFF;
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  font-size: 13.5px;
  color: #4A4A68;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: center;
}

.radio-pill:hover {
  border-color: #624CE0;
}

.radio-pill.active {
  border-color: #624CE0;
  background: #EDE9FF;
  color: #624CE0;
  font-weight: 700;
}

/* Photo Dropzone */
.photo-dropzone {
  border: 2px dashed #D0C9FF;
  border-radius: 20px;
  padding: 40px 24px;
  text-align: center;
  background: #FAF8FF;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-dropzone:hover,
.photo-dropzone.dragover {
  border-color: #624CE0;
  background: #F3EFFF;
}

.hidden-file-input {
  display: none;
}

.dropzone-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.drop-icon-circle {
  font-size: 38px;
  margin-bottom: 4px;
}

.drop-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 17px;
  color: #1A1A2E;
}

.drop-desc {
  font-size: 13px;
  color: #7B7B93;
  margin-bottom: 12px;
}

.btn-select-photos {
  background: #624CE0;
  color: #FFFFFF;
  border: none;
  font-weight: 700;
  font-size: 14px;
  padding: 10px 24px;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(98, 76, 224, 0.25);
  transition: all 0.15s ease;
}

.btn-select-photos:hover {
  background: #513bc7;
  transform: translateY(-1px);
}

/* Uploaded Photos Grid */
.uploaded-photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 12px;
}

.photo-preview-card {
  position: relative;
  width: 100%;
  height: 120px;
  border-radius: 14px;
  overflow: hidden;
  border: 2px solid #EAEAF2;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.main-photo-badge {
  position: absolute;
  bottom: 6px;
  left: 6px;
  background: #624CE0;
  color: #FFFFFF;
  font-size: 9px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 6px;
}

.btn-remove-photo {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(26, 26, 46, 0.75);
  color: #FFFFFF;
  border: none;
  font-size: 16px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease;
}

.btn-remove-photo:hover {
  background: #FF5A5F;
}

.photo-tips-box {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  background: #FFF8E6;
  border: 1px solid #FFE6A8;
  border-radius: 18px;
  padding: 16px 20px;
}

.tip-icon {
  font-size: 22px;
}

.tip-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 13.5px;
  color: #5C4A00;
  line-height: 1.45;
}

.tip-text strong {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
}

/* Condition Cards (2x2 Grid) */
.condition-cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.condition-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 18px 20px;
  border-radius: 18px;
  border: 1.5px solid #EAEAF2;
  background: #FFFFFF;
  cursor: pointer;
  transition: all 0.2s ease;
}

.condition-card:hover {
  border-color: #624CE0;
  background: #FAF8FF;
}

.condition-card.selected {
  border-color: #624CE0;
  background: #EDE9FF;
}

.cond-radio-circle {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #C8C8DC;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
  flex-shrink: 0;
}

.condition-card.selected .cond-radio-circle {
  border-color: #624CE0;
}

.cond-radio-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #624CE0;
}

.cond-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cond-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cond-title {
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 800;
  color: #1A1A2E;
}

.cond-tag {
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 6px;
  letter-spacing: 0.4px;
}

.gold-tag { background: #FFD166; color: #1A1A2E; }
.green-tag { background: #E8FAF4; color: #058563; }
.purple-tag { background: #EDE9FF; color: #624CE0; }
.gray-tag { background: #EAEAF2; color: #7B7B93; }

.cond-desc {
  font-size: 13px;
  color: #7B7B93;
}

/* Custom Checkboxes */
.checkboxes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.custom-checkbox {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 14px;
  color: #1A1A2E;
  font-weight: 600;
}

.custom-checkbox input {
  display: none;
}

.chk-box {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 1.5px solid #C8C8DC;
  background: #FFFFFF;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.custom-checkbox input:checked + .chk-box {
  background: #624CE0;
  border-color: #624CE0;
}

.custom-checkbox input:checked + .chk-box::after {
  content: '✓';
  color: #FFFFFF;
  font-size: 13px;
  font-weight: 800;
}

/* Payout Options Grid */
.payout-options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 18px;
}

.payout-option-card {
  position: relative;
  padding: 18px 20px;
  border-radius: 18px;
  border: 1.5px solid #EAEAF2;
  background: #FFFFFF;
  cursor: pointer;
  transition: all 0.2s ease;
}

.payout-option-card:hover {
  border-color: #624CE0;
}

.payout-option-card.selected {
  border-color: #624CE0;
  background: #EDE9FF;
}

.bonus-badge {
  position: absolute;
  top: -10px;
  right: 14px;
  background: #FFD166;
  color: #1A1A2E;
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 6px;
}

.payout-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 14.5px;
  color: #1A1A2E;
  margin-bottom: 4px;
}

.payout-option-card p {
  font-size: 12.5px;
  color: #7B7B93;
}

/* Recap Summary Box */
.recap-summary-box {
  background: #FAF8FF;
  border: 1px solid #EDE9FF;
  border-radius: 18px;
  padding: 18px 22px;
}

.recap-header {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #1A1A2E;
  margin-bottom: 8px;
}

.recap-details {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #7B7B93;
}

.recap-details b {
  color: #624CE0;
}

/* Wizard Footer */
.wizard-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 36px;
  background: #FAF8FF;
  border-top: 1px solid #EAEAF2;
}

.btn-step-back {
  background: none;
  border: none;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 14px;
  color: #7B7B93;
  cursor: pointer;
  padding: 10px 16px;
  border-radius: 10px;
}

.btn-step-back:hover {
  color: #1A1A2E;
  background: #EAEAF2;
}

.btn-step-next {
  background: #624CE0;
  color: #FFFFFF;
  border: none;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 15px;
  padding: 12px 28px;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(98, 76, 224, 0.25);
  transition: all 0.2s ease;
}

.btn-step-next:hover:not(:disabled) {
  background: #513bc7;
  transform: translateY(-1px);
}

.btn-step-next:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn-submit-request {
  background: #06D6A0;
  color: #FFFFFF;
  border: none;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 15px;
  padding: 14px 32px;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(6, 214, 160, 0.3);
  transition: all 0.2s ease;
}

.btn-submit-request:hover:not(:disabled) {
  background: #05be8d;
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(6, 214, 160, 0.4);
}

.btn-submit-request:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* STATUS TRACKER CARD (MODE 2) */
.status-tracker-card {
  padding: 40px;
}

.tracker-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
}

.success-icon-badge {
  font-size: 38px;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #E8FAF4;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tracker-meta {
  display: flex;
  flex-direction: column;
}

.req-number {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 12px;
  color: #7C5CFC;
  letter-spacing: 0.5px;
}

.tracker-meta h2 {
  font-family: 'Outfit', sans-serif;
  font-size: 26px;
  font-weight: 800;
  color: #1A1A2E;
  margin: 4px 0 2px;
}

.tracker-meta p {
  font-size: 14px;
  color: #7B7B93;
}

/* 5-Phase Flow Progress */
.flow-progress-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #FAF8FF;
  border: 1px solid #EDE9FF;
  border-radius: 20px;
  padding: 18px 24px;
  margin-bottom: 32px;
}

.flow-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  opacity: 0.4;
  font-size: 12px;
  font-weight: 700;
  color: #1A1A2E;
}

.flow-stage.active {
  opacity: 1;
  color: #624CE0;
}

.flow-stage.completed {
  opacity: 0.9;
  color: #06D6A0;
}

.stage-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #EAEAF2;
  color: #7B7B93;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flow-stage.active .stage-dot {
  background: #624CE0;
  color: #FFFFFF;
}

.flow-stage.completed .stage-dot {
  background: #06D6A0;
  color: #FFFFFF;
}

.flow-line {
  flex: 1;
  height: 2px;
  background: #EAEAF2;
  margin: 0 8px;
  margin-bottom: 18px;
}

.flow-line.active {
  background: #624CE0;
}

/* Alpha Offer Box */
.alpha-offer-box {
  background: #FAF8FF;
  border: 1.5px solid #D0C9FF;
  border-radius: 24px;
  padding: 28px;
  margin-bottom: 28px;
}

.offer-tag {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 11px;
  color: #7C5CFC;
  letter-spacing: 0.6px;
  margin-bottom: 6px;
}

.offer-header h3 {
  font-family: 'Outfit', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #1A1A2E;
  margin-bottom: 6px;
}

.offer-header p {
  font-size: 14px;
  color: #4A4A68;
  margin-bottom: 20px;
}

.offer-price-variants {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.price-variant-card {
  position: relative;
  background: #FFFFFF;
  border: 2px solid #EAEAF2;
  border-radius: 20px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.price-variant-card:hover {
  border-color: #624CE0;
}

.price-variant-card.chosen {
  border-color: #624CE0;
  box-shadow: 0 6px 20px rgba(98, 76, 224, 0.15);
}

.pv-badge {
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 800;
  color: #624CE0;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.pv-badge.gold {
  color: #996B00;
}

.pv-amount {
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 800;
  color: #1A1A2E;
  margin-bottom: 4px;
}

.pv-desc {
  font-size: 12px;
  color: #7B7B93;
}

/* Decision Buttons */
.decision-actions-row {
  display: flex;
  gap: 14px;
}

.btn-accept-offer {
  flex: 1.5;
  background: #06D6A0;
  color: #FFFFFF;
  border: none;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 15px;
  padding: 14px 24px;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(6, 214, 160, 0.3);
  transition: all 0.2s ease;
}

.btn-accept-offer:hover {
  background: #05be8d;
  transform: translateY(-2px);
}

.btn-decline-offer {
  flex: 1;
  background: #FFFFFF;
  border: 1.5px solid #E2E2EC;
  color: #7B7B93;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 14px;
  padding: 14px 20px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-decline-offer:hover {
  color: #FF5A5F;
  border-color: #FF5A5F;
  background: #FFF0F0;
}

/* Accepted Flow Box */
.accepted-flow-box {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 10px;
}

.accepted-badge {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 13px;
  color: #058563;
  background: #E8FAF4;
  padding: 6px 14px;
  border-radius: 50px;
  align-self: flex-start;
}

.accepted-flow-box h4 {
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  color: #1A1A2E;
}

.transfer-methods-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.transfer-method-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 18px;
  background: #FFFFFF;
  border: 1.5px solid #EAEAF2;
  border-radius: 16px;
  cursor: pointer;
}

.transfer-method-card.selected {
  border-color: #624CE0;
  background: #EDE9FF;
}

.tm-content strong {
  display: block;
  font-size: 13.5px;
  color: #1A1A2E;
  margin-bottom: 2px;
}

.tm-content p {
  font-size: 11.5px;
  color: #7B7B93;
}

.payout-requisites-form {
  margin-top: 8px;
}

.requisites-input-row {
  display: flex;
  gap: 12px;
}

.requisites-input-row .form-input {
  max-width: 260px;
}

.btn-confirm-transfer {
  background: #624CE0;
  color: #FFFFFF;
  border: none;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 14px;
  padding: 12px 24px;
  border-radius: 12px;
  cursor: pointer;
  white-space: nowrap;
}

.confirmed-msg {
  display: block;
  font-weight: 700;
  color: #058563;
  font-size: 13.5px;
  margin-top: 10px;
}

/* Declined Flow */
.declined-flow-box {
  padding: 16px 0;
  color: #7B7B93;
}

.btn-start-new {
  margin-top: 12px;
  background: #624CE0;
  color: #FFFFFF;
  border: none;
  padding: 10px 20px;
  border-radius: 50px;
  font-weight: 700;
  cursor: pointer;
}

/* Confirmation & Payout Roadmap Styles */
.flow-instructions-alert {
  background: #FFF8E6;
  border: 1px solid #FFE6A8;
  border-radius: 16px;
  padding: 14px 18px;
  color: #5C4A00;
  font-size: 13.5px;
}

.flow-instructions-alert strong {
  display: block;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  margin-bottom: 2px;
}

.form-section-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 15px;
  color: #1A1A2E;
  margin-top: 6px;
}

.courier-details-box {
  background: #FFFFFF;
  border: 1.5px solid #EAEAF2;
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.courier-details-box .form-group {
  margin-bottom: 0;
}

.confirmed-payout-roadmap-card {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.confirmed-header-banner {
  background: linear-gradient(135deg, #FAF8FF 0%, #EDE9FF 100%);
  border: 2px solid #D0C9FF;
  border-radius: 24px;
  padding: 28px;
  text-align: center;
}

.ch-badge {
  display: inline-block;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 12px;
  color: #058563;
  background: #E8FAF4;
  padding: 4px 14px;
  border-radius: 50px;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.confirmed-header-banner h3 {
  font-family: 'Outfit', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: #1A1A2E;
  margin-bottom: 6px;
}

.highlight-sum {
  color: #624CE0;
}

.confirmed-header-banner p {
  font-size: 14.5px;
  color: #4A4A68;
}

.roadmap-steps-title h4 {
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  font-weight: 800;
  color: #1A1A2E;
}

.roadmap-steps-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.roadmap-step-item {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  background: #FFFFFF;
  border: 1.5px solid #EAEAF2;
  border-radius: 20px;
  padding: 20px 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
}

.roadmap-step-item.current {
  border-color: #624CE0;
  background: #FAF8FF;
  box-shadow: 0 6px 20px rgba(98, 76, 224, 0.1);
}

.rs-icon-circle {
  font-size: 26px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #EDE9FF;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rs-content {
  flex: 1;
}

.rs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.rs-header strong {
  font-family: 'Outfit', sans-serif;
  font-size: 15.5px;
  font-weight: 800;
  color: #1A1A2E;
}

.rs-badge {
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 6px;
  letter-spacing: 0.4px;
}

.rs-badge.in-progress {
  background: #EDE9FF;
  color: #624CE0;
}

.rs-badge.pending {
  background: #EAEAF2;
  color: #7B7B93;
}

.rs-content p {
  font-size: 13.5px;
  color: #4A4A68;
  line-height: 1.5;
}

.manager-contact-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #FFFFFF;
  border: 1.5px solid #EAEAF2;
  border-radius: 20px;
  padding: 18px 24px;
  gap: 16px;
}

.mc-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.mc-avatar {
  font-size: 32px;
}

.mc-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mc-text strong {
  font-family: 'Outfit', sans-serif;
  font-size: 14.5px;
  color: #1A1A2E;
}

.mc-text span {
  font-size: 12.5px;
  color: #7B7B93;
}

.btn-whatsapp-manager {
  display: inline-flex;
  align-items: center;
  background: #06D6A0;
  color: #FFFFFF;
  text-decoration: none;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 13.5px;
  padding: 10px 20px;
  border-radius: 50px;
  box-shadow: 0 4px 12px rgba(6, 214, 160, 0.3);
  transition: all 0.15s ease;
  white-space: nowrap;
}

.btn-whatsapp-manager:hover {
  background: #05be8d;
  transform: translateY(-1px);
}

.flow-line.completed {
  background: #06D6A0;
}

.tracker-footer {
  display: flex;
  justify-content: center;
  padding-top: 16px;
}

.btn-create-another {
  background: none;
  border: none;
  color: #624CE0;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
}

/* FAQ Section (1240px matching /gifts) */
.sell-faq-section {
  padding-top: 60px;
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  padding-left: 24px;
  padding-right: 24px;
}

.faq-header-center {
  text-align: center;
  margin-bottom: 36px;
}

.faq-header-center h2 {
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 800;
  color: #1A1A2E;
  margin: 8px 0 6px;
}

.faq-header-center p {
  font-size: 15px;
  color: #7B7B93;
}

.sell-faq-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
}

.sell-faq-card {
  background: #FFFFFF;
  border-radius: 20px;
  border: 1px solid #EAEAF2;
  padding: 26px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.02);
}

.sell-faq-card h4 {
  font-family: 'Outfit', sans-serif;
  font-size: 16.5px;
  font-weight: 800;
  color: #1A1A2E;
  margin-bottom: 8px;
}

.sell-faq-card p {
  font-size: 14px;
  line-height: 1.6;
  color: #4A4A68;
}

/* Responsive */
@media (max-width: 960px) {
  .sell-title {
    font-size: 32px;
  }

  .sell-app-section,
  .sell-hero,
  .sell-faq-section {
    padding-left: 20px;
    padding-right: 20px;
  }

  .categories-selector-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .step-fields-row-2,
  .step-fields-grid-2,
  .step-photos-grid-2,
  .condition-cards-grid,
  .step-contacts-grid-2 {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .offer-price-variants {
    grid-template-columns: 1fr;
  }

  .transfer-methods-grid {
    grid-template-columns: 1fr;
  }

  .requisites-input-row {
    flex-direction: column;
  }

  .requisites-input-row .form-input {
    max-width: 100%;
  }

  .manager-contact-banner {
    flex-direction: column;
    align-items: flex-start;
  }

  .sell-faq-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .wizard-stepper {
    padding: 16px 18px;
  }

  .step-label {
    display: none;
  }

  .wizard-content {
    padding: 22px 18px;
  }

  .form-grid-2 {
    grid-template-columns: 1fr;
  }

  .radio-pill-group {
    flex-direction: column;
  }

  .payout-options-grid {
    grid-template-columns: 1fr;
  }

  .decision-actions-row {
    flex-direction: column;
  }

  .status-tracker-card {
    padding: 22px 18px;
  }

  .flow-stage span {
    display: none;
  }
}

/* ── Pending Evaluation State Styles ────────────────── */
.pending-evaluation-box {
  background: #fffcf8;
  border-radius: 20px;
  padding: 30px;
  border: 1.5px dashed #f3c78e;
}

.pending-banner {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.pb-icon {
  font-size: 36px;
  background: #fff3e0;
  width: 64px;
  height: 64px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pb-content h3 {
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 800;
  color: #1a1a2e;
  margin: 0 0 8px;
}

.pb-content p {
  color: #626078;
  font-size: 14.5px;
  line-height: 1.5;
  margin: 0 0 16px;
}

.status-realtime-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #fdf3e7;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  color: #d97706;
}

.live-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #d97706;
  box-shadow: 0 0 0 0 rgba(217, 119, 6, 0.7);
  animation: pulse-dot 1.8s infinite;
}

@keyframes pulse-dot {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(217, 119, 6, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 8px rgba(217, 119, 6, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(217, 119, 6, 0);
  }
}
</style>

<style scoped>
.sell-unavailable {
  text-align: center;
  padding: 80px 24px;
  max-width: 560px;
  margin: 0 auto;
}

.sell-unavailable h1 {
  font-family: 'Outfit', sans-serif;
  font-size: 28px;
  margin-bottom: 12px;
}

.sell-unavailable a {
  color: #624ce0;
  font-weight: 700;
}

.hl-icon,
.cat-icon,
.tip-icon,
.p-icon,
.pb-icon,
.rs-icon-circle,
.drop-icon-circle,
.success-icon-badge,
.mc-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #624ce0;
}

.hero-badge,
.highlight-pill,
.sell-faq-card h4,
.payout-header strong,
.tm-content strong {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.faq-icon,
.inline-icon {
  flex-shrink: 0;
}
</style>
