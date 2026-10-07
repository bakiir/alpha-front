<template>
  <div class="gift-page">
    <TheHeader />

    <main v-if="featureBlocked" class="container page-content">
      <FeatureUnavailable
        :title="t('gifts.unavailable.title')"
        :description="t('gifts.unavailable.description')"
      />
    </main>

    <main v-else class="container page-content">
      <!-- Hero -->
      <section class="gift-hero">
        <span class="gift-hero-badge gift-desktop-only"><AppIcon name="gift" :size="16" class="inline-icon" /> {{ t('gifts.hero.badge') }}</span>
        <h1 class="gift-title gift-desktop-only">{{ t('gifts.hero.titleDesktop') }}</h1>
        <h1 class="gift-title gift-mobile-only">{{ t('gifts.hero.titleMobile') }}</h1>
        <p class="gift-subtitle gift-desktop-only">
          {{ t('gifts.hero.subtitleDesktop') }}
        </p>
        <p class="gift-subtitle gift-mobile-only">
          {{ t('gifts.hero.subtitleMobile') }}
        </p>

        <!-- Gift Categories Quick Tabs (desktop) -->
        <div class="gift-tabs-wrapper gift-desktop-only">
          <div class="gift-tabs">
            <button
              v-if="isVisible('gift_subscriptions')"
              class="gift-tab-btn" 
              :class="{ active: activeTab === 'certificate' }"
              @click="activeTab = 'certificate'"
            >
              <AppIcon name="ticket" :size="16" class="tab-icon" /> {{ t('gifts.tabs.subscription') }}
            </button>
            <button
              v-if="isVisible('gift_certificates')"
              class="gift-tab-btn" 
              :class="{ active: activeTab === 'voucher' }"
              @click="activeTab = 'voucher'"
            >
              <AppIcon name="credit-card" :size="16" class="tab-icon" /> {{ t('gifts.tabs.voucher') }}
            </button>
            <button
              v-if="isVisible('gift_boxes')"
              class="gift-tab-btn" 
              type="button"
              @click="navigateTo(localePath('/gift-boxes'))"
            >
              <AppIcon name="gift" :size="16" class="tab-icon" /> {{ t('gifts.tabs.boxes') }}
            </button>
            <button 
              class="gift-tab-btn" 
              :class="{ active: activeTab === 'toys' }"
              @click="activeTab = 'toys'"
            >
              <AppIcon name="toy" :size="16" class="tab-icon" /> {{ t('gifts.tabs.toys') }}
            </button>
            <button 
              class="gift-tab-btn" 
              :class="{ active: activeTab === 'wizard' }"
              @click="activeTab = 'wizard'"
            >
              <AppIcon name="pin" :size="16" class="tab-icon" /> {{ t('gifts.tabs.wizard') }}
            </button>
          </div>
        </div>
      </section>

      <!-- Mobile gift type picker -->
      <section
        v-if="activeTab !== 'wizard'"
        class="gift-mobile-hub gift-mobile-only"
        :aria-label="t('gifts.mobile.ariaPicker')"
      >
        <div class="gift-mobile-grid">
          <button
            v-if="isVisible('gift_subscriptions')"
            type="button"
            class="gift-mobile-card"
            @click="openMobileCheckout('subscription')"
          >
            <span class="gift-mobile-card-icon" aria-hidden="true">
              <AppIcon name="ticket" :size="22" />
            </span>
            <strong>{{ t('gifts.mobile.subscription') }}</strong>
            <span>{{ t('gifts.mobile.subscriptionHint') }}</span>
          </button>
          <button
            v-if="isVisible('gift_certificates')"
            type="button"
            class="gift-mobile-card"
            @click="openMobileCheckout('voucher')"
          >
            <span class="gift-mobile-card-icon" aria-hidden="true">
              <AppIcon name="credit-card" :size="22" />
            </span>
            <strong>{{ t('gifts.mobile.voucher') }}</strong>
            <span>{{ t('gifts.mobile.voucherHint') }}</span>
          </button>
          <button
            type="button"
            class="gift-mobile-card"
            @click="navigateTo(localePath({ path: '/shop', query: { gift: '1' } }))"
          >
            <span class="gift-mobile-card-icon" aria-hidden="true">
              <AppIcon name="toy" :size="22" />
            </span>
            <strong>{{ t('gifts.mobile.toy') }}</strong>
            <span>{{ t('gifts.mobile.toyHint') }}</span>
          </button>
          <button
            v-if="isVisible('gift_boxes')"
            type="button"
            class="gift-mobile-card"
            @click="navigateTo(localePath('/gift-boxes'))"
          >
            <span class="gift-mobile-card-icon" aria-hidden="true">
              <AppIcon name="gift" :size="22" />
            </span>
            <strong>{{ t('gifts.mobile.box') }}</strong>
            <span>{{ t('gifts.mobile.boxHint') }}</span>
          </button>
        </div>
        <button
          type="button"
          class="gift-mobile-help"
          @click="activeTab = 'wizard'"
        >
          {{ t('gifts.mobile.helpChoose') }}
        </button>
      </section>

      <!-- TAB: Gift Wizard -->
      <div v-if="activeTab === 'wizard'" class="gift-tab-content">
        <section class="gift-wizard-card">
          <button
            type="button"
            class="gift-mobile-wizard-back gift-mobile-only"
            @click="activeTab = isVisible('gift_subscriptions') ? 'certificate' : 'toys'"
          >
            {{ t('gifts.mobile.wizardBack') }}
          </button>
          <h2 class="config-heading">{{ t('gifts.wizard.heading') }}</h2>
          <p class="wizard-intro">{{ t('gifts.wizard.intro') }}</p>

          <div class="wizard-steps-grid">
            <div class="wizard-field">
              <label>{{ t('gifts.wizard.ageLabel') }}</label>
              <select v-model="wizard.age">
                <option value="">{{ t('gifts.wizard.any') }}</option>
                <option value="0-12">{{ t('gifts.wizard.age0_12') }}</option>
                <option value="12-24">{{ t('gifts.wizard.age12_24') }}</option>
                <option value="24-48">{{ t('gifts.wizard.age24_48') }}</option>
                <option value="48-72">{{ t('gifts.wizard.age48_72') }}</option>
              </select>
            </div>
            <div class="wizard-field">
              <label>{{ t('gifts.wizard.occasionLabel') }}</label>
              <select v-model="wizard.occasion">
                <option value="">{{ t('gifts.wizard.any') }}</option>
                <option value="birthday">{{ t('gifts.wizard.occasionBirthday') }}</option>
                <option value="newborn">{{ t('gifts.wizard.occasionNewborn') }}</option>
                <option value="holiday">{{ t('gifts.wizard.occasionHoliday') }}</option>
                <option value="just-because">{{ t('gifts.wizard.occasionJustBecause') }}</option>
              </select>
            </div>
            <div class="wizard-field">
              <label>{{ t('gifts.wizard.budgetLabel') }}</label>
              <select v-model="wizard.budget">
                <option value="">{{ t('gifts.wizard.any') }}</option>
                <option value="5000">{{ t('gifts.wizard.budget5000') }}</option>
                <option value="15000">{{ t('gifts.wizard.budget15000') }}</option>
                <option value="30000">{{ t('gifts.wizard.budget30000') }}</option>
                <option value="50000">{{ t('gifts.wizard.budget50000') }}</option>
              </select>
            </div>
            <div class="wizard-field">
              <label>{{ t('gifts.wizard.interestsLabel') }}</label>
              <div class="interest-chips">
                <button
                  v-for="interest in interestCatalog"
                  :key="interest.slug"
                  type="button"
                  class="interest-chip"
                  :class="{ active: wizard.interests.includes(interest.slug) }"
                  @click="toggleInterest(interest.slug)"
                >
                  {{ interest.name }}
                </button>
                <p v-if="!interestCatalog.length" class="wizard-empty-hint">
                  {{ t('gifts.wizard.interestsEmpty') }}
                </p>
              </div>
            </div>
          </div>

          <button type="button" class="wizard-submit-btn" @click="applyGiftWizard">
            {{ t('gifts.wizard.submit') }}
          </button>
        </section>
      </div>

      <!-- TAB 1: GIFT SUBSCRIPTION CERTIFICATE -->
      <div v-if="activeTab === 'certificate'" class="gift-tab-content gift-desktop-only">
        <!-- How Gifting Works (3 Steps) -->
        <section class="gifting-steps-row">
          <div class="g-step-card">
            <div class="g-step-num">1</div>
            <h3>{{ t('gifts.stepsSub.s1Title') }}</h3>
            <p>{{ t('gifts.stepsSub.s1Desc') }}</p>
          </div>
          <div class="g-step-card">
            <div class="g-step-num">2</div>
            <h3>{{ t('gifts.stepsSub.s2Title') }}</h3>
            <p>{{ t('gifts.stepsSub.s2Desc') }}</p>
          </div>
          <div class="g-step-card">
            <div class="g-step-num">3</div>
            <h3>{{ t('gifts.stepsSub.s3Title') }}</h3>
            <p>{{ t('gifts.stepsSub.s3Desc') }}</p>
          </div>
        </section>

        <!-- 2-Column Gift Configurator & Live Certificate Card Preview -->
        <section class="gift-configurator-grid">
          <!-- LEFT: Options Configurator Form -->
          <div class="config-col">
            <h2 class="config-heading">{{ t('gifts.config.subHeading') }}</h2>

            <!-- Step 1: Duration Selector -->
            <div class="config-block">
              <label class="block-label">{{ t('gifts.config.durationLabel') }}</label>
              <div class="duration-grid">
                <div 
                  v-for="d in durations" 
                  :key="d.id"
                  class="duration-card"
                  :class="{ active: selectedDuration === d.id }"
                  @click="selectedDuration = d.id"
                >
                  <div class="dur-months">{{ d.months }}</div>
                  <div class="dur-title">{{ d.title }}</div>
                  <span v-if="d.badge" class="dur-badge">{{ d.badge }}</span>
                </div>
              </div>
            </div>

            <!-- Step 2: Plan Tier -->
            <div class="config-block">
              <label class="block-label">{{ t('gifts.config.tierLabel') }}</label>

              <div v-if="isLoadingPlans" class="tier-empty-note">{{ t('gifts.config.loadingPlans') }}</div>

              <div v-else class="tier-cards-row">
                <div
                  v-for="plan in subscriptionPlans"
                  :key="plan.slug"
                  class="tier-select-card"
                  :class="{ active: selectedTier === plan.slug }"
                  @click="selectedTier = plan.slug"
                >
                  <div class="tier-radio">
                    <span v-if="selectedTier === plan.slug" class="dot"></span>
                  </div>
                  <div class="tier-info">
                    <strong>{{ plan.name }}{{ plan.badge ? ` ★ ${plan.badge}` : '' }}</strong>
                    <p>{{ plan.toys_count }} {{ toysWord(plan.toys_count) }} • {{ formatPrice(plan.price_monthly) }} {{ t('gifts.config.perMonth') }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 3: Greeting and Recipient -->
            <div class="config-block">
              <label class="block-label">{{ t('gifts.config.recipientLabel') }}</label>
              <div class="gift-inputs-form">
                <div class="g-input-row">
                  <div class="g-field">
                    <label>{{ t('gifts.config.recipientName') }} <span class="req">*</span></label>
                    <input v-model="giftForm.recipientName" type="text" :placeholder="t('checkout.placeholders.recipientName')" required />
                  </div>
                  <div class="g-field">
                    <label>{{ t('gifts.config.fromWho') }}</label>
                    <input v-model="giftForm.senderName" type="text" :placeholder="t('checkout.placeholders.senderName')" />
                  </div>
                </div>

                <div class="g-input-row">
                  <div class="g-field">
                    <label>{{ t('gifts.config.recipientEmail') }}</label>
                    <input v-model="giftForm.recipientEmail" type="email" :placeholder="t('checkout.placeholders.recipientEmail')" />
                  </div>
                  <div class="g-field">
                    <label>{{ t('gifts.config.recipientPhone') }}</label>
                    <input
                      :value="giftForm.recipientPhone"
                      type="tel"
                      :placeholder="t('checkout.placeholders.recipientPhone')"
                      maxlength="18"
                      autocomplete="tel"
                      @input="onGiftPhoneInput"
                      @paste="onGiftPhonePaste"
                    />
                    <small class="field-hint" v-if="activationPolicyNote">{{ activationPolicyNote }}</small>
                  </div>
                </div>

                <div class="g-field">
                  <label>{{ t('gifts.config.cardMessage') }}</label>
                  <textarea 
                    v-model="giftForm.message" 
                    rows="3" 
                    :placeholder="t('checkout.placeholders.messageSubLong')"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT: Live Certificate Card Preview -->
          <div class="preview-col">
            <div class="cert-preview-card">
              <div class="cert-header">
                <div class="cert-logo">
                  <AppLogo size="sm" />
                </div>
                <span class="cert-type-pill">{{ t('gifts.cert.subPill') }}</span>
              </div>

              <div class="cert-body">
                <span class="cert-to-label">{{ t('gifts.cert.subFor') }}</span>
                <h3 class="cert-recipient">{{ giftForm.recipientName || t('gifts.defaults.recipientChild') }}</h3>

                <div class="cert-details-badge">
                  <span>{{ t('gifts.cert.subDetail', { months: currentDurationObj.months, plan: selectedPlanLabel }) }}</span>
                </div>

                <p class="cert-message-quote">
                  «{{ giftForm.message || t('gifts.defaults.messageSub') }}»
                </p>

                <div class="cert-footer">
                  <div class="cert-from">
                    <span>{{ t('gifts.cert.withLove') }}</span>
                    <strong>{{ giftForm.senderName || t('gifts.defaults.senderRelatives') }}</strong>
                  </div>
                  <div class="cert-seal">
                    <span>{{ t('gifts.cert.seal') }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Buy Action Box -->
            <div class="cert-buy-action-card">
              <div class="action-price-row">
                <span>{{ t('gifts.cert.totalDue') }}</span>
                <strong class="total-cert-price">
                  <template v-if="isLoadingQuote">{{ t('gifts.cert.calculating') }}</template>
                  <template v-else>{{ formatPrice(calculatedPrice) }} ₸</template>
                </strong>
              </div>
              <p v-if="quoteError" class="quote-error-text">{{ quoteError }}</p>

              <button
                class="submit-gift-btn"
                :disabled="isLoadingQuote || !calculatedPrice"
                @click="openPaymentModal"
              >
                {{ t('gifts.cert.buyCta', { amount: formatPrice(calculatedPrice) }) }}
              </button>
              <div class="digital-info-pill">
                <span><AppIcon name="bolt" :size="14" class="inline-icon" /> {{ t('gifts.cert.digitalSub') }}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- TAB: MONETARY GIFT VOUCHER (GFT) -->
      <div v-else-if="activeTab === 'voucher'" class="gift-tab-content gift-desktop-only">
        <section class="gifting-steps-row">
          <div class="g-step-card">
            <div class="g-step-num">1</div>
            <h3>{{ t('gifts.stepsVoucher.s1Title') }}</h3>
            <p>{{ t('gifts.stepsVoucher.s1Desc') }}</p>
          </div>
          <div class="g-step-card">
            <div class="g-step-num">2</div>
            <h3>{{ t('gifts.stepsVoucher.s2Title') }}</h3>
            <p>{{ t('gifts.stepsVoucher.s2Desc') }}</p>
          </div>
          <div class="g-step-card">
            <div class="g-step-num">3</div>
            <h3>{{ t('gifts.stepsVoucher.s3Title') }}</h3>
            <p>{{ t('gifts.stepsVoucher.s3Desc') }}</p>
          </div>
        </section>

        <section class="gift-configurator-grid">
          <div class="config-col">
            <h2 class="config-heading">{{ t('gifts.config.voucherHeading') }}</h2>

            <div class="config-block">
              <label class="block-label">{{ t('gifts.config.voucherNominalLabel') }}</label>
              <div class="duration-grid">
                <div
                  v-for="preset in voucherPresets"
                  :key="preset"
                  class="duration-card"
                  :class="{ active: voucherAmountMode === 'preset' && voucherPreset === preset }"
                  @click="selectVoucherPreset(preset)"
                >
                  <div class="dur-months">{{ formatPrice(preset) }} ₸</div>
                  <div class="dur-title">{{ t('gifts.config.nominalTitle') }}</div>
                </div>
                <div
                  class="duration-card"
                  :class="{ active: voucherAmountMode === 'custom' }"
                  @click="voucherAmountMode = 'custom'"
                >
                  <div class="dur-months">{{ t('gifts.config.customAmount') }}</div>
                  <div class="dur-title">{{ t('gifts.config.customSum') }}</div>
                </div>
              </div>
              <div v-if="voucherAmountMode === 'custom'" class="gift-inputs-form" style="margin-top: 1rem;">
                <div class="g-field">
                  <label>{{ t('gifts.config.customAmountLabel') }}</label>
                  <input
                    v-model.number="voucherCustomAmount"
                    type="number"
                    min="5000"
                    max="500000"
                    step="1000"
                    :placeholder="t('checkout.placeholders.customVoucherAmount')"
                  />
                </div>
              </div>
            </div>

            <div class="config-block">
              <label class="block-label">{{ t('gifts.config.voucherRecipientLabel') }}</label>
              <div class="gift-inputs-form">
                <div class="g-input-row">
                  <div class="g-field">
                    <label>{{ t('gifts.config.recipientNameShort') }} <span class="req">*</span></label>
                    <input v-model="voucherForm.recipientName" type="text" :placeholder="t('checkout.placeholders.recipientName')" required />
                  </div>
                  <div class="g-field">
                    <label>{{ t('gifts.config.fromWho') }}</label>
                    <input v-model="voucherForm.senderName" type="text" :placeholder="t('checkout.placeholders.senderName')" />
                  </div>
                </div>
                <div class="g-input-row">
                  <div class="g-field">
                    <label>{{ t('gifts.config.recipientEmailShort') }}</label>
                    <input v-model="voucherForm.recipientEmail" type="email" :placeholder="t('checkout.placeholders.recipientEmail')" />
                  </div>
                  <div class="g-field">
                    <label>{{ t('gifts.config.recipientPhone') }}</label>
                    <input
                      :value="voucherForm.recipientPhone"
                      type="tel"
                      :placeholder="t('checkout.placeholders.recipientPhone')"
                      maxlength="18"
                      autocomplete="tel"
                      @input="onVoucherPhoneInput"
                      @paste="onVoucherPhonePaste"
                    />
                    <small class="field-hint" v-if="activationPolicyNote">{{ activationPolicyNote }}</small>
                  </div>
                </div>
                <div class="g-field">
                  <label>{{ t('gifts.config.greetingShort') }}</label>
                  <textarea
                    v-model="voucherForm.message"
                    rows="3"
                    :placeholder="t('checkout.placeholders.messageVoucher')"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div class="preview-col">
            <div class="cert-preview-card">
              <div class="cert-header">
                <div class="cert-logo">
                  <AppLogo size="sm" />
                </div>
                <span class="cert-type-pill">{{ t('gifts.cert.voucherPill') }}</span>
              </div>
              <div class="cert-body">
                <span class="cert-to-label">{{ t('gifts.cert.voucherFor') }}</span>
                <h3 class="cert-recipient">{{ voucherForm.recipientName || t('gifts.defaults.recipientChildAlt') }}</h3>
                <div class="cert-details-badge">
                  <span>{{ t('gifts.cert.voucherDetail', { amount: formatPrice(voucherAmount) }) }}</span>
                </div>
                <p class="cert-message-quote">
                  «{{ voucherForm.message || t('gifts.defaults.messageVoucher') }}»
                </p>
                <div class="cert-footer">
                  <div class="cert-from">
                    <span>{{ t('gifts.cert.withLove') }}</span>
                    <strong>{{ voucherForm.senderName || t('gifts.defaults.senderRelatives') }}</strong>
                  </div>
                  <div class="cert-seal">
                    <span>{{ t('gifts.cert.seal') }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="cert-buy-action-card">
              <div class="action-price-row">
                <span>{{ t('gifts.cert.totalDue') }}</span>
                <strong class="total-cert-price">{{ formatPrice(voucherAmount) }} ₸</strong>
              </div>
              <p v-if="voucherAmountError" class="quote-error-text">{{ voucherAmountError }}</p>
              <button
                class="submit-gift-btn"
                :disabled="!!voucherAmountError"
                @click="openVoucherPaymentModal"
              >
                {{ t('gifts.cert.buyCta', { amount: formatPrice(voucherAmount) }) }}
              </button>
              <div class="digital-info-pill">
                <span><AppIcon name="bolt" :size="14" class="inline-icon" /> {{ t('gifts.cert.digitalVoucher') }}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- TAB 2: READY GIFT BOXES → dedicated section -->
      <div v-else-if="activeTab === 'boxes'" class="gift-tab-content gift-desktop-only">
        <section class="ready-boxes-section boxes-cta-section">
          <div class="boxes-header">
            <span class="sub-badge">{{ t('gifts.boxesSection.badge') }}</span>
            <h2 class="section-title">{{ t('gifts.boxesSection.title') }}</h2>
            <p class="section-subtitle">
              {{ t('gifts.boxesSection.subtitle') }}
            </p>
            <NuxtLink :to="localePath('/gift-boxes')" class="boxes-cta-btn">{{ t('gifts.boxesSection.cta') }}</NuxtLink>
          </div>
        </section>
      </div>

      <!-- TAB 3: INDIVIDUAL GIFT TOYS FROM CATALOG -->
      <div v-else-if="activeTab === 'toys'" class="gift-tab-content gift-desktop-only">
        <section class="gift-toys-section">
          <div class="boxes-header">
            <span class="sub-badge">{{ t('gifts.toysSection.badge') }}</span>
            <h2 class="section-title">{{ t('gifts.toysSection.title') }}</h2>
            <p class="section-subtitle">{{ t('gifts.toysSection.subtitle') }}</p>
          </div>

          <div v-if="isLoadingToys" class="loading-state">
            <div class="spinner"></div>
            <p>{{ t('gifts.toysSection.loading') }}</p>
          </div>

          <div v-else-if="giftToysList.length === 0" class="tier-empty-note">
            {{ t('gifts.toysSection.empty') }}
          </div>

          <div v-else class="boxes-grid">
            <div v-for="toy in giftToysList" :key="toy.id" class="box-card toy-gift-card">
              <div class="box-img-wrap">
                <img :src="toy.image_url || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=500&q=80'" :alt="toy.name" class="box-img" />
                <span class="box-age-tag">{{ t('gifts.toysSection.ageMonths', { min: toy.min_age_months, max: toy.max_age_months }) }}</span>
                <span class="box-gift-ribbon"><AppIcon name="gift" :size="14" class="inline-icon" /> {{ t('gifts.toysSection.ribbon') }}</span>
              </div>
              <div class="box-content">
                <h3 class="box-title">{{ toy.name }}</h3>
                <p class="box-desc">{{ toy.description || t('gifts.toysSection.fallbackDesc') }}</p>
                <div class="box-bottom-row">
                  <span class="box-price">{{ formatPrice(Number(toy.price) || 12900) }} ₸</span>
                  <button class="box-add-btn" @click="addToyAsGift(toy)">{{ t('gifts.toysSection.addGift') }}</button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="!isLoadingToys" class="catalog-gift-cta">
            <p>{{ t('gifts.toysSection.ctaText') }}</p>
            <NuxtLink :to="localePath({ path: '/shop', query: { gift: '1' } })" class="catalog-gift-btn">
              {{ t('gifts.toysSection.ctaLink') }}
            </NuxtLink>
          </div>
        </section>
      </div>
    </main>

    <FaqSection
      placement="gifts"
      :title="t('gifts.faq.title')"
      :subtitle="t('gifts.faq.subtitle')"
    />

    <!-- MODAL 1: Payment & Creation for Digital Gift Certificate -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isPaymentModalOpen" class="modal-overlay" @click.self="isPaymentModalOpen = false">
          <div class="gift-modal-card">
            <button class="close-btn" @click="isPaymentModalOpen = false">&times;</button>
            
            <div class="modal-badge-icon"><AppIcon name="gift" :size="32" /></div>
            <h2 class="g-modal-title">{{ t('gifts.modal.payTitle') }}</h2>
            <p class="g-modal-desc">
              {{ t('gifts.modal.payDesc', { name: giftForm.recipientName, amount: formatPrice(calculatedPrice) }) }}
            </p>

            <div class="payment-tabs-box">
              <div class="pay-option active">
                <div class="pay-radio">
                  <span class="dot"></span>
                </div>
                <span>{{ t('gifts.modal.payMethod') }}</span>
              </div>
            </div>
            <p class="epay-hint">{{ t('gifts.modal.epayHint') }}</p>

            <div v-if="errorMessage" class="error-banner">
              {{ errorMessage }}
            </div>

            <div class="modal-actions-row">
              <button class="modal-cancel-btn" @click="isPaymentModalOpen = false">{{ t('gifts.modal.cancel') }}</button>
              <button 
                class="modal-confirm-btn" 
                :disabled="isSubmitting || isLoadingQuote || !calculatedPrice"
                @click="submitCertificatePayment"
              >
                {{ isSubmitting ? t('gifts.modal.issuing') : t('gifts.modal.payCta', { amount: formatPrice(calculatedPrice) }) }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- MODAL 2: Success Celebration with Generated Code -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isSuccessModalOpen" class="modal-overlay" @click.self="isSuccessModalOpen = false">
          <div class="gift-modal-card success-card">
            <div class="success-icon-badge"><AppIcon name="party" :size="32" /></div>
            <h2 class="g-modal-title">{{ successKind === 'voucher' ? t('gifts.success.voucherTitle') : t('gifts.success.subTitle') }}</h2>
            <p class="g-modal-desc" v-if="successKind === 'voucher'">
              {{ t('gifts.success.voucherDesc', {
                amount: formatPrice(createdVoucherDetails?.initial_amount || voucherAmount),
                name: voucherForm.recipientName,
              }) }}
            </p>
            <p class="g-modal-desc" v-else>
              {{ t('gifts.success.subDesc', {
                months: createdGiftDetails?.duration_months || currentDurationMonths,
                plan: selectedPlanLabel,
                name: giftForm.recipientName,
              }) }}
              <span v-if="createdGiftDetails?.amount_paid"> {{ t('gifts.success.subAmount', { amount: formatPrice(createdGiftDetails.amount_paid) }) }}</span>
            </p>

            <div class="cert-code-box">
              <span class="code-label">{{ t('gifts.success.codeLabel') }}</span>
              <strong class="cert-code-val">{{ createdCertCode }}</strong>
              <div class="code-buttons-row">
                <button class="copy-code-btn" @click="copyCertCode">
                  <AppIcon v-if="!isCopied" name="copy" :size="14" class="inline-icon" />
                  {{ isCopied ? t('gifts.success.codeCopied') : t('gifts.success.copyCode') }}
                </button>
                <button class="copy-code-btn magic-link-btn" @click="copyMagicLink">
                  <AppIcon v-if="!isLinkCopied" name="link" :size="14" class="inline-icon" />
                  {{ isLinkCopied ? t('gifts.success.linkCopied') : t('gifts.success.copyLink') }}
                </button>
              </div>
            </div>

            <!-- 1-Click WhatsApp Share Banner -->
            <div class="whatsapp-share-box">
              <button class="whatsapp-share-btn" @click="shareViaWhatsApp">
                <span><AppIcon name="message" :size="16" class="inline-icon" /> {{ t('gifts.success.whatsapp') }}</span>
              </button>
              <NuxtLink
                v-if="successKind === 'voucher'"
                :to="localePath({ path: '/gifts/claim', query: { code: createdCertCode } })"
                target="_blank"
                class="preview-unboxing-link"
              >
                {{ t('gifts.success.previewVoucher') }}
              </NuxtLink>
              <NuxtLink
                v-else
                :to="localePath({ path: '/subscription', query: { gift_code: createdCertCode } })"
                target="_blank"
                class="preview-unboxing-link"
              >
                {{ t('gifts.success.previewSub') }}
              </NuxtLink>
            </div>

            <div class="success-info-notice">
              <p v-if="successKind === 'voucher'">
                {{ t('gifts.success.infoVoucher') }}
              </p>
              <p v-else>
                {{ t('gifts.success.infoSub') }}
              </p>
            </div>

            <div class="modal-actions-row">
              <button class="modal-confirm-btn w-100" @click="isSuccessModalOpen = false">
                {{ t('gifts.success.close') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Mobile 3-step checkout (shares page state with desktop forms) -->
    <GiftMobileCheckoutSheet
      :open="isMobileCheckoutOpen"
      :kind="mobileCheckoutKind"
      :step="mobileCheckoutStep"
      :form="mobileActiveForm"
      :durations="durations"
      :selected-duration="selectedDuration"
      :subscription-plans="subscriptionPlans"
      :selected-tier="selectedTier"
      :is-loading-plans="isLoadingPlans"
      :selected-plan-label="selectedPlanLabel"
      :current-duration-label="currentDurationObj.months"
      :is-loading-quote="isLoadingQuote"
      :quote-error="quoteError"
      :calculated-price="calculatedPrice"
      :voucher-presets="voucherPresets"
      :voucher-amount-mode="voucherAmountMode"
      :voucher-preset="voucherPreset"
      :voucher-custom-amount="voucherCustomAmount"
      :voucher-amount-error="voucherAmountError"
      :voucher-amount="voucherAmount"
      :activation-policy-note="activationPolicyNote"
      :is-submitting="isSubmitting"
      :submit-error="mobileSubmitError"
      :format-price="formatPrice"
      @close="closeMobileCheckout"
      @update:step="mobileCheckoutStep = $event"
      @update:selected-duration="selectedDuration = $event"
      @update:selected-tier="selectedTier = $event"
      @update:form="onMobileFormUpdate"
      @update:voucher-amount-mode="voucherAmountMode = $event"
      @update:voucher-custom-amount="voucherCustomAmount = $event"
      @select-voucher-preset="selectVoucherPreset"
      @phone-input="onMobilePhoneInput"
      @phone-paste="onMobilePhonePaste"
      @pay="onMobilePay"
    />

    <!-- TheFooter -->
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import TheHeader from '~/components/TheHeader.vue'
import TheFooter from '~/components/TheFooter.vue'
import FaqSection from '~/components/FaqSection.vue'
import GiftMobileCheckoutSheet from '~/components/gifts/GiftMobileCheckoutSheet.vue'
import type { GiftSubscriptionItem, GiftSubscriptionQuote, GiftCardItem } from '~/composables/useGifts'
import type { GiftMobileForm } from '~/components/gifts/GiftMobileCheckoutSheet.vue'
import { buildCartItemSubtitle, materialFromSpecifications } from '~/utils/cartItemMeta'

// Meta/OG/robots from CMS; visible hero copy stays in the page UI.
usePageSeo('/gifts')

const { t } = useI18n()
const localePath = useLocalePath()

const route = useRoute()
const { addItem } = useCart()
const { purchaseGiftSubscription, purchaseGiftCard, fetchGiftSubscriptionQuote } = useGifts()
const { handlePayResponse } = usePaymentLaunch()
const { request } = useApi()
const activationPolicyNote = ref(t('gifts.activationPolicy', { days: 30 }))
const { user, openAuthModal } = useAuth()
const { error: toastError, success: toastSuccess } = useToast()
const { plans: subscriptionPlans, fetchPlans, isLoading: isLoadingPlans } = useSubscriptionPlans()
const { isVisible } = useFeatures()
const featureBlocked = computed(() => !isVisible('gift_shop'))
const config = useRuntimeConfig()

const activeTab = ref<'certificate' | 'voucher' | 'boxes' | 'toys' | 'wizard'>('certificate')
const isMobileViewport = ref(false)
const isMobileCheckoutOpen = ref(false)
const mobileCheckoutKind = ref<'subscription' | 'voucher'>('subscription')
const mobileCheckoutStep = ref(1)
const mobileSubmitError = ref('')
let mobileMq: MediaQueryList | null = null

const syncMobileViewport = () => {
  if (!import.meta.client) return
  isMobileViewport.value = window.matchMedia('(max-width: 768px)').matches
}

const wizard = reactive({
  age: '',
  occasion: '',
  budget: '',
  interests: [] as string[],
})

const { interests: interestCatalog, loadInterests } = useInterests()

const toggleInterest = (slug: string) => {
  const idx = wizard.interests.indexOf(slug)
  if (idx >= 0) wizard.interests.splice(idx, 1)
  else wizard.interests.push(slug)
}

const applyGiftWizard = () => {
  const query: Record<string, string> = { gift: '1' }
  if (wizard.age) query.age = wizard.age
  if (wizard.occasion) query.occasion = wizard.occasion
  if (wizard.budget) query.budget = wizard.budget
  if (wizard.interests.length) query.interest = wizard.interests.join(',')
  navigateTo(localePath({ path: '/shop', query }))
}

const toysWord = (count: number) => {
  const n = Math.abs(Number(count) || 0) % 100
  const n1 = n % 10
  if (n > 10 && n < 20) return t('gifts.toysCount.many')
  if (n1 === 1) return t('gifts.toysCount.one')
  if (n1 >= 2 && n1 <= 4) return t('gifts.toysCount.few')
  return t('gifts.toysCount.many')
}

const selectedDuration = ref('3m')
const selectedTier = ref('')

const durationMonthsMap: Record<string, number> = {
  '1m': 1,
  '3m': 3,
  '6m': 6,
  '12m': 12,
}

const currentDurationMonths = computed(() => durationMonthsMap[selectedDuration.value] ?? 3)

const openMobileCheckout = (kind: 'subscription' | 'voucher') => {
  // Preserve draft within the page: only reset step when switching gift kind.
  if (mobileCheckoutKind.value !== kind) {
    mobileCheckoutKind.value = kind
    mobileCheckoutStep.value = 1
  }
  mobileSubmitError.value = ''
  isMobileCheckoutOpen.value = true
}

const closeMobileCheckout = () => {
  isMobileCheckoutOpen.value = false
}

onMounted(async () => {
  syncMobileViewport()
  if (import.meta.client) {
    mobileMq = window.matchMedia('(max-width: 768px)')
    mobileMq.addEventListener('change', syncMobileViewport)
  }

  const tab = String(route.query.tab || '')
  if (tab === 'boxes') {
    await navigateTo(localePath('/gift-boxes'))
    return
  }
  if (tab === 'voucher' || tab === 'certificate' || tab === 'toys' || tab === 'wizard') {
    activeTab.value = tab as typeof activeTab.value
  }
  if (activeTab.value === 'certificate' && !isVisible('gift_subscriptions')) {
    activeTab.value = isVisible('gift_certificates') ? 'voucher' : 'toys'
  }
  if (activeTab.value === 'voucher' && !isVisible('gift_certificates')) {
    activeTab.value = isVisible('gift_subscriptions') ? 'certificate' : 'toys'
  }

  if (isMobileViewport.value) {
    if (tab === 'toys') {
      await navigateTo(localePath({ path: '/shop', query: { gift: '1' } }))
      return
    }
    if (tab === 'certificate' && isVisible('gift_subscriptions')) {
      openMobileCheckout('subscription')
    } else if (tab === 'voucher' && isVisible('gift_certificates')) {
      openMobileCheckout('voucher')
    }
  }

  try {
    const policy = await request<{ status: string; data: { by_type?: Record<string, number>; note?: string } }>('/gifts/activation-policy')
    const days = policy?.data?.by_type?.gift_subscription || policy?.data?.by_type?.gift_card || 30
    activationPolicyNote.value = t('gifts.activationPolicy', { days })
  } catch {
    // keep default note
  }
  await fetchPlans()
  if (subscriptionPlans.value.length > 0) {
    selectedTier.value = subscriptionPlans.value[0].slug
  }
  await loadQuote()
  loadGiftToys()
  loadInterests()
})

onUnmounted(() => {
  if (import.meta.client && mobileMq) {
    mobileMq.removeEventListener('change', syncMobileViewport)
  }
})

watch([selectedTier, selectedDuration], () => {
  loadQuote()
})

const selectedPlan = computed(() => (
  subscriptionPlans.value.find(plan => plan.slug === selectedTier.value) || subscriptionPlans.value[0]
))

const selectedPlanLabel = computed(() => {
  if (!selectedPlan.value) return t('gifts.planNotSelected')
  const count = selectedPlan.value.toys_count
  return t('gifts.planLabel', {
    name: selectedPlan.value.name,
    count,
    toysWord: toysWord(count),
  })
})

const durations = computed(() => {
  const ids = ['1m', '3m', '6m', '12m'] as const
  return ids.map((id) => {
    const badge = t(`gifts.duration.${id}.badge`)
    return {
      id,
      months: t(`gifts.duration.${id}.months`),
      title: t(`gifts.duration.${id}.title`),
      badge: badge ? badge : null,
    }
  })
})

const currentDurationObj = computed(() => {
  return durations.value.find(d => d.id === selectedDuration.value) || durations.value[1]
})

const giftForm = ref({
  recipientName: '',
  senderName: '',
  recipientEmail: '',
  recipientPhone: '',
  message: '',
})

const onGiftPhoneInput = (event: Event) => {
  handlePhoneInput(event, (val) => { giftForm.value.recipientPhone = val })
}

const onGiftPhonePaste = (event: ClipboardEvent) => {
  handlePhonePaste(event, (val) => { giftForm.value.recipientPhone = val })
}

const voucherPresets = [10000, 25000, 50000, 100000]
const voucherAmountMode = ref<'preset' | 'custom'>('preset')
const voucherPreset = ref(25000)
const voucherCustomAmount = ref(25000)
const voucherForm = ref({
  recipientName: '',
  senderName: '',
  recipientEmail: '',
  recipientPhone: '',
  message: '',
})

const onVoucherPhoneInput = (event: Event) => {
  handlePhoneInput(event, (val) => { voucherForm.value.recipientPhone = val })
}

const onVoucherPhonePaste = (event: ClipboardEvent) => {
  handlePhonePaste(event, (val) => { voucherForm.value.recipientPhone = val })
}

const mobileActiveForm = computed(() => (
  mobileCheckoutKind.value === 'subscription' ? giftForm.value : voucherForm.value
))

const onMobileFormUpdate = (form: GiftMobileForm) => {
  if (mobileCheckoutKind.value === 'subscription') {
    giftForm.value = { ...form }
  } else {
    voucherForm.value = { ...form }
  }
}

const onMobilePhoneInput = (event: Event) => {
  if (mobileCheckoutKind.value === 'subscription') onGiftPhoneInput(event)
  else onVoucherPhoneInput(event)
}

const onMobilePhonePaste = (event: ClipboardEvent) => {
  if (mobileCheckoutKind.value === 'subscription') onGiftPhonePaste(event)
  else onVoucherPhonePaste(event)
}

const selectVoucherPreset = (amount: number) => {
  voucherAmountMode.value = 'preset'
  voucherPreset.value = amount
}

const voucherAmount = computed(() => {
  if (voucherAmountMode.value === 'custom') {
    return Number(voucherCustomAmount.value) || 0
  }
  return voucherPreset.value
})

const voucherAmountError = computed(() => {
  const amount = voucherAmount.value
  if (!amount || amount < 5000) return t('gifts.errors.voucherMin')
  if (amount > 500000) return t('gifts.errors.voucherMax')
  return ''
})

const quoteData = ref<GiftSubscriptionQuote | null>(null)
const isLoadingQuote = ref(false)
const quoteError = ref('')

const loadQuote = async () => {
  if (!selectedTier.value) {
    quoteData.value = null
    return
  }

  isLoadingQuote.value = true
  quoteError.value = ''
  try {
    const res = await fetchGiftSubscriptionQuote(selectedTier.value, currentDurationMonths.value)
    quoteData.value = res?.data ?? null
  } catch (e: any) {
    quoteData.value = null
    quoteError.value = e?.data?.message || t('gifts.errors.quoteFailed')
  } finally {
    isLoadingQuote.value = false
  }
}

const calculatedPrice = computed(() => quoteData.value?.total ?? 0)

const giftToysList = ref<any[]>([])
const isLoadingToys = ref(false)

const parseToyList = (res: any): any[] => {
  const list = res?.data ?? res ?? []
  return Array.isArray(list) ? list : []
}

const loadGiftToys = async () => {
  isLoadingToys.value = true
  try {
    const res = await request<any>('/toys?catalog=shop&is_gift_box=0')
    giftToysList.value = parseToyList(res)
  } catch (e) {
    console.warn('Could not load gift toys from API', e)
    giftToysList.value = []
  } finally {
    isLoadingToys.value = false
  }
}

// Payment Modal State
const isPaymentModalOpen = ref(false)
const isSuccessModalOpen = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const createdCertCode = ref('')
const createdGiftDetails = ref<GiftSubscriptionItem | null>(null)
const createdVoucherDetails = ref<GiftCardItem | null>(null)
const successKind = ref<'subscription' | 'voucher'>('subscription')
const isCopied = ref(false)

const mapApiErrorToMobileStep = (message: string) => {
  if (!isMobileCheckoutOpen.value) return
  mobileSubmitError.value = message
  const lower = message.toLowerCase()
  if (lower.includes('получател') || lower.includes('recipient') || lower.includes('email') || lower.includes('телефон') || lower.includes('phone')) {
    mobileCheckoutStep.value = 2
    return
  }
  if (lower.includes('номинал') || lower.includes('сумм') || lower.includes('amount') || lower.includes('тариф') || lower.includes('plan') || lower.includes('срок') || lower.includes('duration')) {
    mobileCheckoutStep.value = 1
    return
  }
  mobileCheckoutStep.value = 3
}

const openPaymentModal = () => {
  if (!giftForm.value.recipientName.trim()) {
    toastError(t('gifts.toast.recipientRequired'), t('gifts.toast.recipientRequiredHint'))
    if (isMobileCheckoutOpen.value) mobileCheckoutStep.value = 2
    return
  }
  if (!user.value) {
    openAuthModal('login')
    return
  }
  if (quoteError.value) {
    toastError(t('gifts.toast.quoteError'), quoteError.value)
    if (isMobileCheckoutOpen.value) mobileCheckoutStep.value = 1
    return
  }
  if (!calculatedPrice.value || isLoadingQuote.value) {
    toastError(t('gifts.toast.waitTitle'), t('gifts.toast.waitQuote'))
    return
  }
  errorMessage.value = ''
  mobileSubmitError.value = ''
  isPaymentModalOpen.value = true
}

const openVoucherPaymentModal = () => {
  if (!voucherForm.value.recipientName.trim()) {
    toastError(t('gifts.toast.recipientRequired'), t('gifts.toast.recipientRequiredHint'))
    if (isMobileCheckoutOpen.value) mobileCheckoutStep.value = 2
    return
  }
  if (voucherAmountError.value) {
    toastError(t('gifts.toast.nominalTitle'), voucherAmountError.value)
    if (isMobileCheckoutOpen.value) mobileCheckoutStep.value = 1
    return
  }
  if (!user.value) {
    openAuthModal('login')
    return
  }
  errorMessage.value = ''
  mobileSubmitError.value = ''
  submitVoucherPayment()
}

const onMobilePay = () => {
  if (isSubmitting.value) return
  mobileSubmitError.value = ''
  if (mobileCheckoutKind.value === 'subscription') {
    openPaymentModal()
  } else {
    openVoucherPaymentModal()
  }
}

const submitCertificatePayment = async () => {
  if (!user.value) {
    openAuthModal('login')
    return
  }
  if (isSubmitting.value) return

  isSubmitting.value = true
  errorMessage.value = ''
  mobileSubmitError.value = ''

  try {
    const res = await purchaseGiftSubscription({
      plan: selectedTier.value,
      duration_months: currentDurationMonths.value,
      recipient_name: giftForm.value.recipientName.trim(),
      sender_name: giftForm.value.senderName.trim() || undefined,
      recipient_email: giftForm.value.recipientEmail.trim() || undefined,
      recipient_phone: giftForm.value.recipientPhone.trim() || undefined,
      message: giftForm.value.message.trim() || undefined,
      payment_method: 'card',
    })

    if (res?.status !== 'success') {
      throw new Error(res?.message || t('gifts.errors.subPurchaseFailed'))
    }

    await handlePayResponse(res, {
      onRedirect: async () => {
        isPaymentModalOpen.value = false
      },
      onFulfilled: async (paid) => {
        const code = paid?.data?.code
        if (!code) {
          throw new Error(paid?.message || t('gifts.errors.subPurchaseFailed'))
        }
        createdCertCode.value = code
        createdGiftDetails.value = paid.data
        createdVoucherDetails.value = null
        successKind.value = 'subscription'
        isPaymentModalOpen.value = false
        isMobileCheckoutOpen.value = false
        isSuccessModalOpen.value = true
      },
    })
  } catch (e: any) {
    const msg = e?.data?.message || e?.message || t('gifts.errors.subPurchaseRetry')
    errorMessage.value = msg
    mapApiErrorToMobileStep(msg)
  } finally {
    isSubmitting.value = false
  }
}

const submitVoucherPayment = async () => {
  if (!user.value) {
    openAuthModal('login')
    return
  }
  if (isSubmitting.value) return

  isSubmitting.value = true
  errorMessage.value = ''
  mobileSubmitError.value = ''

  try {
    const res = await purchaseGiftCard({
      amount: voucherAmount.value,
      recipient_name: voucherForm.value.recipientName.trim(),
      sender_name: voucherForm.value.senderName.trim() || undefined,
      recipient_email: voucherForm.value.recipientEmail.trim() || undefined,
      recipient_phone: voucherForm.value.recipientPhone.trim() || undefined,
      message: voucherForm.value.message.trim() || undefined,
      payment_method: 'card',
    })

    if (res?.status !== 'success') {
      throw new Error(res?.message || t('gifts.errors.voucherPurchaseFailed'))
    }

    await handlePayResponse(res, {
      onRedirect: async () => {},
      onFulfilled: async (paid) => {
        const code = paid?.data?.code
        if (!code) {
          throw new Error(paid?.message || t('gifts.errors.voucherPurchaseFailed'))
        }
        createdCertCode.value = code
        createdVoucherDetails.value = paid.data
        createdGiftDetails.value = null
        successKind.value = 'voucher'
        isMobileCheckoutOpen.value = false
        isSuccessModalOpen.value = true
        toastSuccess(t('gifts.toast.voucherIssued'), t('gifts.toast.voucherIssuedHint'))
      },
    })
  } catch (e: any) {
    const msg = e?.data?.message || e?.message || t('gifts.errors.voucherPurchaseFailed')
    errorMessage.value = msg
    mapApiErrorToMobileStep(msg)
    toastError(t('gifts.toast.errorTitle'), msg)
  } finally {
    isSubmitting.value = false
  }
}

const isLinkCopied = ref(false)

const copyCertCode = () => {
  if (navigator?.clipboard) {
    navigator.clipboard.writeText(createdCertCode.value)
    isCopied.value = true
    toastSuccess(t('gifts.toast.copied'), t('gifts.toast.codeCopied', { code: createdCertCode.value }))
    setTimeout(() => { isCopied.value = false }, 2500)
  }
}

const getMagicLink = () => {
  const siteOrigin = typeof window !== 'undefined'
    ? window.location.origin
    : String(config.public.siteUrl || '').replace(/\/$/, '')

  if (successKind.value === 'voucher') {
    return `${siteOrigin}/gifts/claim?code=${encodeURIComponent(createdCertCode.value)}`
  }
  return `${siteOrigin}/subscription?gift_code=${encodeURIComponent(createdCertCode.value)}`
}

const copyMagicLink = () => {
  const link = getMagicLink()
  if (navigator?.clipboard) {
    navigator.clipboard.writeText(link)
    isLinkCopied.value = true
    toastSuccess(t('gifts.toast.linkCopiedTitle'), t('gifts.toast.linkCopiedHint'))
    setTimeout(() => { isLinkCopied.value = false }, 2500)
  }
}

const shareViaWhatsApp = () => {
  const link = getMagicLink()
  const recipient = successKind.value === 'voucher'
    ? voucherForm.value.recipientName
    : giftForm.value.recipientName
  const text = successKind.value === 'voucher'
    ? t('gifts.whatsapp.voucher', {
      amount: formatPrice(createdVoucherDetails.value?.initial_amount || voucherAmount.value),
      code: createdCertCode.value,
      link,
    })
    : t('gifts.whatsapp.subscription', { recipient, link })
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank')
}

const addToyAsGift = (toy: any) => {
  const minYears = Math.floor((toy.min_age_months ?? 0) / 12)
  const maxYears = Math.ceil((toy.max_age_months ?? 72) / 12)
  addItem({
    id: toy.id,
    title: `${toy.name} ${t('gifts.toysSection.cartTitleSuffix')}`,
    price: Number(toy.price),
    image: toy.image_url || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=500&q=80',
    subtitle: buildCartItemSubtitle({
      age: t('gifts.toysSection.ageYears', { min: minYears, max: maxYears }),
      material: materialFromSpecifications(toy.specifications),
    }),
    isGiftPackaging: true,
    availableQuantity: Number(toy.available_quantity ?? 0),
  })
  navigateTo(localePath('/cart'))
}

const formatPrice = (val: number) => {
  if (!val && val !== 0) return '0'
  return Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
</script>

<style scoped>
.gift-page {
  min-height: 100vh;
  background-color: #FAF8F4;
  color: #262626;
  font-family: 'Manrope', sans-serif;
  padding-bottom: 0;
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

.gift-hero {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 40px auto;
}

.gift-hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  display: inline-block;
  background: #FFE8E8;
  color: #AF5353;
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 11.5px;
  letter-spacing: 1.5px;
  padding: 5px 14px;
  border-radius: 20px;
  margin-bottom: 12px;
}

.gift-title {
  font-family: 'Manrope', sans-serif;
  font-size: 38px;
  font-weight: 800;
  color: #262626;
  margin-bottom: 12px;
}

.gift-subtitle {
  font-size: 16px;
  color: #6F746F;
  line-height: 1.6;
  margin-bottom: 28px;
}

/* Category Tabs */
.gift-tabs-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.gift-tabs {
  display: inline-flex;
  background: #FAF8F4;
  padding: 6px;
  border-radius: 22px;
  border: 1px solid #E3D7C6;
  gap: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.03);
  flex-wrap: wrap;
  justify-content: center;
}

.gift-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  padding: 10px 22px;
  border-radius: 16px;
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 14px;
  color: #5D625F;
  cursor: pointer;
  transition: all 0.2s ease;
}

.gift-tab-btn.active {
  background: var(--green-surface);
  color: var(--green-ink);
  box-shadow: 0 4px 12px rgba(51, 61, 54, 0.3);
}

.gift-tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Steps Row */
.gifting-steps-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.g-step-card {
  background: #FAF8F4;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 4px 16px rgba(0,0,0,0.02);
  text-align: center;
}

.g-step-num {
  width: 36px;
  height: 36px;
  background: #D9E0D5;
  color: var(--green-ink);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 16px;
  margin: 0 auto 12px auto;
}

.g-step-card h3 {
  font-family: 'Manrope', sans-serif;
  font-size: 16px;
  font-weight: 800;
  margin-bottom: 6px;
}

.g-step-card p {
  font-size: 13.5px;
  color: #6F746F;
  margin: 0;
  line-height: 1.45;
}

/* Configurator & Preview Grid */
.gift-configurator-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 32px;
  margin-bottom: 60px;
}

.config-col {
  background: #FAF8F4;
  border-radius: 28px;
  padding: 36px;
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 8px 24px rgba(0,0,0,0.03);
}

.config-heading {
  font-family: 'Manrope', sans-serif;
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 24px;
}

.config-block {
  margin-bottom: 24px;
}

.block-label {
  display: block;
  font-family: 'Manrope', sans-serif;
  font-size: 14px;
  font-weight: 800;
  color: #262626;
  margin-bottom: 12px;
}

.duration-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.duration-card {
  background: #FAF8F4;
  border: 1.5px solid #E3D7C6;
  border-radius: 16px;
  padding: 14px 10px;
  text-align: center;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

.duration-card:hover {
  border-color: var(--green-ink);
}

.duration-card.active {
  background: #D9E0D5;
  border-color: var(--green-ink);
}

.dur-months {
  font-family: 'Manrope', sans-serif;
  font-size: 15px;
  font-weight: 800;
  color: #262626;
}

.dur-title {
  font-size: 11px;
  color: #6F746F;
  margin-top: 2px;
}

.dur-badge {
  position: absolute;
  top: -9px;
  left: 50%;
  transform: translateX(-50%);
  background: #9C91C9;
  color: #FAF8F4;
  font-size: 8.5px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 8px;
  white-space: nowrap;
}

.tier-empty-note {
  padding: 16px;
  border: 1px dashed #E3D7C6;
  border-radius: 16px;
  background: #FAF8F4;
  color: #747183;
  font-size: 14px;
}

.tier-cards-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.tier-select-card {
  background: #FAF8F4;
  border: 1.5px solid #E3D7C6;
  border-radius: 16px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.tier-select-card.active {
  background: #D9E0D5;
  border-color: var(--green-ink);
}

.tier-radio {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid #CBD5E1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tier-select-card.active .tier-radio {
  border-color: var(--green-ink);
}

.tier-radio .dot {
  width: 10px;
  height: 10px;
  background: var(--green-surface);
  border-radius: 50%;
  color: var(--green-ink);
}

.tier-info strong {
  display: block;
  font-family: 'Manrope', sans-serif;
  font-size: 13.5px;
}

.tier-info p {
  font-size: 12px;
  color: #6F746F;
  margin: 0;
}

.gift-inputs-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.g-input-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.g-field label {
  display: block;
  font-size: 12.5px;
  font-weight: 700;
  color: #5D625F;
  margin-bottom: 6px;
}

.g-field .req {
  color: #AF5353;
}

.g-field input, .g-field textarea {
  width: 100%;
  background: #FAF8F4;
  border: 1.5px solid #E3D7C6;
  border-radius: 14px;
  padding: 10px 14px;
  font-size: 13.5px;
  outline: none;
  transition: border-color 0.2s;
}

.g-field input:focus, .g-field textarea:focus {
  border-color: var(--green-ink);
  background: #FAF8F4;
}

/* Certificate Preview Card */
.preview-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cert-preview-card {
  background: linear-gradient(135deg, #FAF8F4 0%, #D9E0D5 100%);
  border: 2px dashed var(--green-ink);
  border-radius: 28px;
  padding: 32px;
  box-shadow: 0 12px 36px rgba(51, 61, 54, 0.1);
  position: relative;
}

.cert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.cert-logo :deep(.app-logo__mark) {
  height: 24px;
}

.cert-logo :deep(.app-logo__word) {
  font-size: 18px;
}

.cert-type-pill {
  background: var(--green-surface);
  color: var(--green-ink);
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 10.5px;
  letter-spacing: 1px;
  padding: 4px 12px;
  border-radius: 14px;
}

.cert-to-label {
  font-size: 12px;
  color: #6F746F;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.cert-recipient {
  font-family: 'Manrope', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: #262626;
  margin: 4px 0 14px 0;
}

.cert-details-badge {
  display: inline-block;
  background: #FAF8F4;
  padding: 6px 14px;
  border-radius: 12px;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--green-ink);
  margin-bottom: 16px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.03);
}

.cert-message-quote {
  font-style: italic;
  font-size: 14px;
  color: #5D625F;
  line-height: 1.5;
  margin-bottom: 24px;
  background: rgba(255,255,255,0.6);
  padding: 12px 16px;
  border-radius: 14px;
  border-left: 3px solid var(--green-ink);
}

.cert-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.cert-from span {
  display: block;
  font-size: 11px;
  color: #6F746F;
}

.cert-from strong {
  font-family: 'Manrope', sans-serif;
  font-size: 15px;
  color: #262626;
}

.cert-seal {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1.5px solid #FFB703;
  background: #FFF3D6;
  color: #B37D00;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 7.5px;
  font-weight: 900;
  text-align: center;
}

.cert-buy-action-card {
  background: #FAF8F4;
  border-radius: 24px;
  padding: 24px;
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 6px 20px rgba(0,0,0,0.02);
}

.action-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.quote-error-text {
  color: #c0392b;
  font-size: 14px;
  margin: 0 0 12px;
}

.total-cert-price {
  font-family: 'Manrope', sans-serif;
  font-size: 26px;
  font-weight: 800;
  color: var(--green-ink);
}

.submit-gift-btn {
  width: 100%;
  background: var(--green-surface);
  color: var(--green-ink);
  border: none;
  padding: 15px;
  border-radius: 16px;
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-gift-btn:hover {
  background: var(--green-surface);
  box-shadow: 0 6px 20px rgba(51, 61, 54, 0.35);
  color: var(--green-ink);
}

.digital-info-pill {
  margin-top: 12px;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: #059669;
  background: #E8F8F3;
  padding: 6px 12px;
  border-radius: 10px;
}

/* READY BOXES & TOYS GRID */
.ready-boxes-section, .gift-toys-section {
  margin-top: 20px;
}

.catalog-gift-cta {
  margin-top: 32px;
  padding: 24px;
  text-align: center;
  border-radius: 18px;
  background: #FAF8F4;
  border: 1px dashed #C4B5FD;
}

.catalog-gift-cta p {
  margin: 0 0 14px;
  font-size: 14.5px;
  color: #5C5C72;
  line-height: 1.5;
}

.catalog-gift-btn {
  display: inline-block;
  padding: 12px 22px;
  border-radius: 12px;
  background: var(--green-surface);
  color: var(--green-ink);
  font-weight: 700;
  font-size: 14px;
  text-decoration: none;
  box-shadow: 0 6px 18px rgba(51, 61, 54, 0.25);
}

.catalog-gift-btn:hover {
  background: var(--green-surface-hover);
  color: var(--green-ink);
}

.boxes-header {
  text-align: center;
  margin-bottom: 36px;
}

.boxes-cta-btn {
  display: inline-flex;
  margin-top: 16px;
  padding: 12px 20px;
  border-radius: 12px;
  background: var(--green-ink);
  color: #FAF8F4;
  font-weight: 700;
  text-decoration: none;
}

.boxes-cta-btn:hover {
  opacity: 0.92;
  color: #FAF8F4;
}

.sub-badge {
  display: inline-block;
  background: #D9E0D5;
  color: var(--green-ink);
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 1px;
  padding: 4px 12px;
  border-radius: 14px;
  margin-bottom: 8px;
}

.section-title {
  font-family: 'Manrope', sans-serif;
  font-size: 30px;
  font-weight: 800;
  margin-bottom: 8px;
}

.section-subtitle {
  font-size: 15px;
  color: #6F746F;
}

.boxes-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.box-card {
  background: #FAF8F4;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 6px 20px rgba(0,0,0,0.03);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
}

.box-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(51, 61, 54, 0.1);
}

.box-img-wrap {
  width: 100%;
  height: 190px;
  position: relative;
  background: #ECECF4;
}

.box-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.box-age-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(26, 26, 46, 0.8);
  backdrop-filter: blur(4px);
  color: #FAF8F4;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 8px;
}

.box-gift-ribbon {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: #AF5353;
  color: #FAF8F4;
  font-size: 10px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 8px;
}

.box-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.box-title {
  font-family: 'Manrope', sans-serif;
  font-size: 17px;
  font-weight: 800;
  margin-bottom: 6px;
  color: #262626;
}

.box-desc {
  font-size: 13px;
  color: #6F746F;
  line-height: 1.45;
  margin-bottom: 14px;
}

.box-features-mini {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.box-features-mini span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  background: #FAF8F4;
  border: 1px solid #E3D7C6;
  padding: 2px 8px;
  border-radius: 8px;
  color: #5D625F;
}

.box-bottom-row {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.box-price {
  font-family: 'Manrope', sans-serif;
  font-size: 18px;
  font-weight: 800;
  color: var(--green-ink);
}

.box-add-btn {
  background: var(--green-surface);
  color: var(--green-ink);
  border: none;
  padding: 8px 16px;
  border-radius: 12px;
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.box-add-btn:hover {
  background: var(--green-surface);
  color: var(--green-ink);
}

.loading-state {
  text-align: center;
  padding: 60px;
  color: #6F746F;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #E3D7C6;
  border-top-color: var(--green-ink);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 12px auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* MODALS */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 26, 46, 0.65);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.gift-modal-card {
  position: relative;
  background: #FAF8F4;
  width: 100%;
  max-width: 480px;
  border-radius: 28px;
  padding: 32px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.2);
}

.close-btn {
  position: absolute;
  top: 18px;
  right: 18px;
  background: #F4F1EA;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5D625F;
}

.modal-badge-icon, .success-icon-badge {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: #D9E0D5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  margin-bottom: 16px;
}

.g-modal-title {
  font-family: 'Manrope', sans-serif;
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 6px;
}

.g-modal-desc {
  font-size: 13.5px;
  color: #6F746F;
  line-height: 1.5;
  margin-bottom: 20px;
}

.payment-tabs-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.epay-hint {
  margin: 0 0 16px;
  font-size: 12.5px;
  line-height: 1.4;
  color: #5b6b63;
}

.pay-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #FAF8F4;
  border: 1.5px solid #E3D7C6;
  border-radius: 14px;
  cursor: pointer;
  font-size: 13.5px;
  font-weight: 700;
  transition: all 0.2s;
}

.pay-option.active {
  background: #D9E0D5;
  border-color: var(--green-ink);
  color: var(--green-ink);
}

.pay-radio {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid #CBD5E1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pay-option.active .pay-radio {
  border-color: var(--green-ink);
}

.pay-radio .dot {
  width: 10px;
  height: 10px;
  background: var(--green-surface);
  border-radius: 50%;
  color: var(--green-ink);
}

.kaspi-qr-box {
  background: #F8FAFC;
  border: 1px dashed #CBD5E1;
  border-radius: 16px;
  padding: 16px;
  text-align: center;
  margin-bottom: 20px;
}

.qr-mock-img {
  width: 110px;
  height: 110px;
  background: #FAF8F4;
  border: 2px solid #AF5353;
  border-radius: 12px;
  margin: 0 auto 10px auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-label {
  font-family: 'Manrope', sans-serif;
  font-weight: 900;
  color: #AF5353;
  font-size: 14px;
}

.qr-hint {
  font-size: 12px;
  color: #64748B;
  margin: 0;
}

.error-banner {
  background: #FEE2E2;
  color: #DC2626;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  margin-bottom: 16px;
}

.modal-actions-row {
  display: flex;
  gap: 12px;
}

.modal-cancel-btn {
  flex: 1;
  background: #F4F1EA;
  border: none;
  padding: 12px;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
}

.modal-confirm-btn {
  flex: 1.5;
  background: var(--green-surface);
  color: var(--green-ink);
  border: none;
  padding: 12px;
  border-radius: 14px;
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 14.5px;
  cursor: pointer;
  transition: background 0.2s;
}

.modal-confirm-btn:hover:not(:disabled) {
  background: var(--green-surface);
  color: var(--green-ink);
}

.modal-confirm-btn:disabled {
  opacity: 0.6;
}

/* Success Card */
.success-card {
  text-align: center;
}

.success-icon-badge {
  margin: 0 auto 16px auto;
  background: #E8F8F3;
}

.cert-code-box {
  background: #FAF8F4;
  border: 2px dashed var(--green-ink);
  border-radius: 18px;
  padding: 20px;
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.code-label {
  font-size: 11px;
  font-weight: 800;
  color: #6F746F;
  letter-spacing: 1px;
}

.cert-code-val {
  font-family: 'Manrope', monospace;
  font-size: 28px;
  font-weight: 900;
  color: var(--green-ink);
  letter-spacing: 2px;
}

.code-buttons-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.copy-code-btn {
  background: var(--green-surface);
  color: var(--green-ink);
  border: none;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-code-btn.magic-link-btn {
  background: #FAF8F4;
  color: var(--green-ink);
  border: 1.5px solid var(--green-ink);
}

.whatsapp-share-box {
  margin: 16px 0 20px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.whatsapp-share-btn {
  width: 100%;
  background: #25D366;
  color: #FAF8F4;
  border: none;
  padding: 13px;
  border-radius: 14px;
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(37, 211, 102, 0.35);
  transition: transform 0.2s;
}

.whatsapp-share-btn:hover {
  transform: translateY(-2px);
  background: #20BA5A;
}

.preview-unboxing-link {
  font-size: 12px;
  color: var(--green-ink);
  text-decoration: underline;
  cursor: pointer;
}

.success-info-notice {
  background: #F0FDF4;
  border: 1px solid #BBF7D0;
  padding: 12px 16px;
  border-radius: 14px;
  margin-bottom: 24px;
}

.success-info-notice p {
  font-size: 12.5px;
  color: #15803D;
  margin: 0;
  line-height: 1.45;
}

@media (max-width: 1024px) {
  .boxes-grid { grid-template-columns: repeat(2, 1fr); }
  .duration-grid { grid-template-columns: repeat(2, 1fr); }
  .gift-configurator-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .gifting-steps-row { grid-template-columns: 1fr; }
  .boxes-grid { grid-template-columns: 1fr; }
  .g-input-row { grid-template-columns: 1fr; }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.gift-wizard-card {
  background: #fff;
  border-radius: 28px;
  padding: 36px;
  border: 1px solid rgba(0,0,0,0.04);
  max-width: 720px;
  margin: 0 auto;
}

.wizard-intro { color: #6F746F; margin-bottom: 24px; }
.wizard-steps-grid { display: flex; flex-direction: column; gap: 20px; margin-bottom: 24px; }
.wizard-field label { display: block; font-weight: 800; margin-bottom: 8px; font-size: 14px; }
.wizard-field select { width: 100%; padding: 12px 14px; border-radius: 12px; border: 1.5px solid #E3D7C6; }
.interest-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.wizard-empty-hint { width: 100%; margin: 0; font-size: 13px; color: #6F746F; }
.interest-chip { padding: 8px 16px; border-radius: 50px; border: 1px solid #E6DFD4; background: #fff; cursor: pointer; font-size: 13px; font-weight: 600; }
.interest-chip.active { background: var(--green-surface); color: var(--green-ink); border-color: var(--green-ink); }
.wizard-submit-btn { width: 100%; background: var(--green-surface); color: var(--green-ink); border: none; padding: 14px; border-radius: 14px; font-weight: 700; cursor: pointer; }

.inline-icon { flex-shrink: 0; }
.gift-hero-badge .inline-icon,
.digital-info-pill .inline-icon,
.box-gift-ribbon .inline-icon,
.whatsapp-share-btn .inline-icon { vertical-align: middle; }
.copy-code-btn { display: inline-flex; align-items: center; gap: 6px; }
.digital-info-pill span { display: inline-flex; align-items: center; gap: 6px; }
.submit-gift-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
.modal-badge-icon,
.success-icon-badge { display: flex; align-items: center; justify-content: center; color: var(--green-ink); }

/* —— Mobile gift hub —— */
.gift-mobile-only { display: none; }

.gift-mobile-hub {
  margin: 0 auto 28px;
  max-width: 480px;
}

.gift-mobile-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.gift-mobile-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  min-height: 112px;
  padding: 14px 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  background: #fff;
  text-align: left;
  cursor: pointer;
  font-family: 'Manrope', sans-serif;
  color: #262626;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}

.gift-mobile-card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(168, 191, 168, 0.35);
  color: var(--green-ink);
}

.gift-mobile-card strong {
  font-size: 15px;
  font-weight: 800;
  line-height: 1.2;
}

.gift-mobile-card span:last-child {
  font-size: 12px;
  line-height: 1.35;
  color: #6f746f;
}

.gift-mobile-help {
  display: block;
  width: 100%;
  margin-top: 14px;
  padding: 12px;
  border: none;
  background: transparent;
  color: var(--alpha-green, #536b59);
  font-family: 'Manrope', sans-serif;
  font-size: 14px;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
}

.gift-mobile-wizard-back {
  display: block;
  margin-bottom: 12px;
  border: none;
  background: transparent;
  color: var(--green-ink);
  font-family: 'Manrope', sans-serif;
  font-size: 14px;
  font-weight: 700;
  padding: 0;
  cursor: pointer;
}

@media (max-width: 768px) {
  .gift-desktop-only { display: none !important; }
  .gift-mobile-only { display: block; }
  .gift-mobile-hub { display: block; }
  .gift-mobile-grid { display: grid; }
  .gift-mobile-card { display: flex; }
  .gift-mobile-help { display: block; }
  .gift-mobile-wizard-back { display: block; }

  .page-content { padding-top: 20px; }
  .gift-hero { margin-bottom: 20px; text-align: left; max-width: none; }
  .gift-title {
    font-size: 1.55rem;
    line-height: 1.2;
    margin-bottom: 8px;
  }
  .gift-subtitle {
    font-size: 14px;
    margin-bottom: 0;
    line-height: 1.45;
  }
  .gift-wizard-card {
    padding: 20px 16px;
    border-radius: 20px;
  }
  .container { padding: 0 16px; }
}
</style>
