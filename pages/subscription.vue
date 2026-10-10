<template>
  <div class="subscription-page">
    <TheHeader />

    <main v-if="featureBlocked" class="container page-content">
      <FeatureUnavailable
        :title="t('subscription.unavailableTitle')"
        :description="t('subscription.unavailableDesc')"
      />
    </main>

    <main v-else class="container page-content">
      <!--
        Keep SSR + first client paint identical: cookie/token can disagree across the
        hydration boundary, so user-dependent dashboard/pricing only mounts after ready.
      -->
      <div v-if="!isSubscriptionViewReady" class="subscription-check-hint">
        <AppIcon name="loader" :size="20" class="spin-icon" /> {{ t('subscription.loading') }}
      </div>

      <template v-else>
      <div
        v-if="user && showSubscriptionSwitcher && !showAllPlans"
        class="subscription-switcher"
        role="tablist"
        :aria-label="t('subscription.switcherAria')"
      >
        <button
          v-for="sub in switchableSubscriptions"
          :key="sub.id"
          type="button"
          role="tab"
          class="subscription-switcher-card"
          :class="{ selected: selectedSubscriptionId === sub.id }"
          :aria-selected="selectedSubscriptionId === sub.id"
          :disabled="isSubscriptionMutationBusy || isCheckingSubscription || selectedSubscriptionId === sub.id"
          @click="selectSubscriptionById(sub.id)"
        >
          <span class="subscription-switcher-radio">
            <span v-if="selectedSubscriptionId === sub.id" class="radio-inner"></span>
          </span>
          <span class="subscription-switcher-info">
            <strong>{{ sub.child?.name || t('subscription.childFallback') }}</strong>
            <span>{{ subscriptionSwitcherStatusKey(sub.status) ? t(subscriptionSwitcherStatusKey(sub.status)!) : sub.status }}</span>
          </span>
        </button>
      </div>

      <!-- IF SELECTED SUBSCRIPTION IS ACTIVE OR PAUSED: Dashboard View -->
      <SubscriptionActiveDashboard
        v-if="user && selectedIsManageable && !showAllPlans"
        :is-paused="isSubscriptionPaused"
        :freeze-used="freezeUsed"
        :pending-action="pendingAction"
        :pending-pickup="pendingPickup"
        :child-name="subscriptionChildName"
        :child-age="subscriptionChildAge"
        :plan="currentPlan"
        :pending-plan="pendingPlanChange"
        :next-billing-date="nextBillingDate"
        :paid-until="paidUntilLabel"
        :can-renew="canRenewSubscription"
        :renewal-overdue="renewalOverdue"
        :renewal-amount="renewalAmount"
        :renewal-amount-label="renewalAmountLabel"
        :is-renewing="isRenewingSubscription"
        :freeze-end-formatted="freezeEndDateFormatted"
        :toys-in-use="toysInUse"
        :toys-limit="toysLimit"
        :next-delivery-date="nextDeliveryDate"
        :planned-exchange-date="plannedExchangeDateFormatted"
        :planned-exchange-slot="plannedExchangeSlotHuman"
        :return-due-date="returnDueDateFormatted"
        :confirmed-delivery-slot="confirmedDeliverySlotFormatted"
        :set-history="setHistory"
        :composition-edit-until="compositionEditUntil"
        :can-edit-composition="canEditComposition"
        :current-box-name="currentBoxName"
        :current-set-toys="activeCurrentSetToys"
        :set-status-label="currentSetStatusLabel"
        :set-status="currentSetStatus"
        :delivery-task-id="deliveryTaskId"
        :delivery-task-status="currentDeliveryTaskStatus"
        :current-set-id="currentSetId"
        :tracked-set-id="trackedSetId"
        :delivery-address="deliveryAddress"
        :delivery-track-link="deliveryTrackLink"
        :action-error="subscriptionActionError"
        :is-submitting="isSubmitting"
        :is-requesting-exchange="isRequestingExchange"
        :exchange-quota="exchangeQuota"
        :show-next-set="showNextSetSection"
        :next-set-title="nextSetTitle"
        :next-set-toys-count="nextSetToys.length"
        :next-set-box-name="nextSetBoxName"
        :next-set-toys="nextSetToys"
        :next-set-positions="nextSetPositions"
        :next-set-id="nextSetId"
        :next-set-status="nextSetStatus"
        :is-first-set-cycle="isFirstSetCycle"
        :is-replacing-position="isReplacingPosition"
        :can-edit-next-set="canEditNextSet"
        @open-gift="isGiftCodeModalOpen = true"
        @show-plans="showAllPlans = true"
        @cancel-plan-change="handleCancelPlanChange"
        @freeze="openFreezeModal"
        @cancel="openCancelModal"
        @resume="resumeSubscription"
        @renew="renewSubscription"
        @view-toys="openCurrentSetToysModal"
        @exchange="handleExchangeRequest"
        @reschedule="openRescheduleModal"
        @edit-next-set="openNextSetModal"
        @replace-position="handleReplacePosition"
      />

      <!-- IF SELECTED SUBSCRIPTION IS PENDING PAYMENT -->
      <div
        v-else-if="user && selectedIsPending && !showAllPlans"
        class="pending-sub-container"
      >
        <div class="pending-sub-card">
          <div class="pending-sub-header">
            <div class="pending-sub-badge">
              <span class="status-dot"></span>
              {{ isVerifyingPayment ? t('subscription.pending.verifyingPayment') : t('subscription.pending.awaitingPayment') }}
            </div>
            <h1 class="pending-sub-title">{{ t('subscription.pending.title') }}</h1>
            <p class="pending-sub-subtitle">
              {{ isVerifyingPayment
                ? t('subscription.pending.verifyBody')
                : t('subscription.pending.payBody') }}
            </p>
          </div>

          <div class="pending-sub-details">
            <div class="pending-detail-row">
              <span class="detail-label">{{ t('subscription.pending.child') }}</span>
              <span class="detail-value">{{ pendingChildName || t('subscription.childFallback') }}</span>
            </div>
            <div class="pending-detail-row">
              <span class="detail-label">{{ t('subscription.pending.plan') }}</span>
              <span class="detail-value font-bold">{{ pendingPlanName }}</span>
            </div>
            <div class="pending-detail-row">
              <span class="detail-label">{{ t('subscription.pending.period') }}</span>
              <span class="detail-value">{{ pendingCycleLabel }}</span>
            </div>
            <div class="pending-detail-row total-row">
              <span class="detail-label">{{ t('subscription.pending.toPay') }}</span>
              <span class="detail-value price">{{ pendingPriceLabel }} ₸</span>
            </div>
          </div>

          <div v-if="pendingPaymentError" class="pending-error-alert">
            {{ pendingPaymentError }}
          </div>

          <div class="pending-sub-actions">
            <button
              type="button"
              class="btn-pay-now"
              :disabled="isActivatingSubscription || isVerifyingPayment"
              @click="payPendingSubscription"
            >
              <AppIcon v-if="isActivatingSubscription || isVerifyingPayment" name="loader" :size="18" class="spin-icon" />
              <span>{{ isActivatingSubscription ? t('subscription.pending.openingPay') : t('subscription.pending.payNow') }}</span>
            </button>
            <button
              type="button"
              class="btn-cancel-pending"
              :disabled="isActivatingSubscription || isCancellingPending"
              @click="cancelPendingSubscription"
            >
              {{ isCancellingPending ? t('subscription.pending.cancelling') : t('subscription.pending.cancelApplication') }}
            </button>
            <button
              type="button"
              class="btn-view-plans"
              @click="showAllPlans = true"
            >
              {{ t('subscription.pending.chooseOtherPlan') }}
            </button>
          </div>
        </div>
      </div>

      <!-- PUBLIC / SHOWCASE PRICING VIEW — only when we know user has no active sub (or is guest) -->
      <SubscriptionPricingShowcase
        v-else-if="showPricingShowcase"
        v-model:billing-cycle="billingCycle"
        :plans="displayPlans"
        :is-loading="isLoadingPlans && displayPlans.length === 0"
        :error="plansError"
        :can-retry="true"
        :is-logged-in="!!user"
        :show-back-to-dashboard="!!(user && (hasAnyManageableSubscription || hasAnyPendingSubscription))"
        :faqs="faqs"
        @back-to-dashboard="showAllPlans = false"
        @select-plan="handleSelectPlan"
        @preview-toys="openPreviewToysModal"
        @retry="() => fetchPlans({ force: true })"
      />

      <div v-else class="subscription-check-hint">
        <AppIcon name="loader" :size="20" class="spin-icon" /> {{ t('subscription.loading') }}
      </div>
      </template>
    </main>

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="isDeliveryFreezeConfirmOpen"
          class="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delivery-freeze-title"
          @click.self="isDeliveryFreezeConfirmOpen = false"
        >
          <div class="sub-modal-card delivery-freeze-card">
            <button class="close-btn" :aria-label="t('subscription.close')" @click="isDeliveryFreezeConfirmOpen = false">&times;</button>

            <div class="modal-icon-badge delivery-warning-icon"><AppIcon name="truck" :size="30" /></div>
            <h2 id="delivery-freeze-title" class="sub-modal-title">{{ t('subscription.freeze.activeDeliveryTitle') }}</h2>
            <p class="sub-modal-desc">{{ activeDeliveryFreezeMessage }}</p>

            <div class="delivery-freeze-note">
              <AppIcon name="clock" :size="18" />
              <span>{{ t('subscription.freeze.activeDeliveryBody') }}</span>
            </div>

            <div class="delivery-freeze-actions">
              <button type="button" class="confirm-delivery-cancel-btn" @click="continueFreezeAfterDeliveryCancel">
                {{ t('subscription.freeze.cancelDeliveryContinue') }}
              </button>
              <button type="button" class="keep-delivery-btn" @click="isDeliveryFreezeConfirmOpen = false">
                {{ t('subscription.freeze.dontFreeze') }}
              </button>
            </div>
            <p class="delivery-freeze-footnote">{{ t('subscription.freeze.footnote') }}</p>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- MODAL 1: Freeze Subscription Options (Requirement 1) -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isFreezeModalOpen" class="modal-overlay" @click.self="isFreezeModalOpen = false">
          <div class="sub-modal-card freeze-modal-card">
            <button class="close-btn" @click="isFreezeModalOpen = false">&times;</button>
            
            <div class="modal-icon-badge"><AppIcon name="snowflake" :size="32" /></div>
            <h2 class="sub-modal-title">{{ t('subscription.freeze.modalTitle') }}</h2>
            <p class="sub-modal-desc">
              {{ t('subscription.freeze.modalLead') }}
            </p>

            <!-- Duration Options -->
            <div class="freeze-options-group">
              <div class="freeze-slider-heading">
                <label for="freeze-days" class="freeze-group-title">{{ t('subscription.freeze.durationLabel') }}</label>
                <output for="freeze-days" class="freeze-days-value">{{ computedFreezeDays }} {{ freezeDaysLabel }}</output>
              </div>
              <input
                id="freeze-days"
                v-model.number="freezeDays"
                class="freeze-days-slider"
                type="range"
                min="1"
                :max="maxFreezeDays"
                step="1"
                :aria-label="t('subscription.freeze.durationAria')"
              >
              <div class="freeze-slider-scale" aria-hidden="true">
                <span>{{ t('subscription.freeze.oneDay') }}</span>
                <span v-if="midFreezeDaysLabel">{{ midFreezeDaysLabel }}</span>
                <span>{{ t('subscription.freeze.daysMax', { n: maxFreezeDays }) }}</span>
              </div>
              <p class="freeze-limit-hint">{{ t('subscription.freeze.onceHint') }}</p>
            </div>

            <!-- Freeze Reason Options -->
            <div class="freeze-reason-box">
              <label class="freeze-group-title">{{ t('subscription.freeze.reasonLabel') }}</label>
              <select v-model="freezeReason" class="freeze-select">
                <option value="vacation">{{ t('subscription.freeze.reasonVacation') }}</option>
                <option value="sick">{{ t('subscription.freeze.reasonSick') }}</option>
                <option value="too_many_toys">{{ t('subscription.freeze.reasonTooManyToys') }}</option>
                <option value="budget">{{ t('subscription.freeze.reasonBudget') }}</option>
                <option value="other">{{ t('subscription.freeze.reasonOther') }}</option>
              </select>
            </div>

            <!-- Summary of Freeze Calculation -->
            <div class="freeze-summary-card">
              <div class="summary-row">
                <span>{{ t('subscription.freeze.periodUntil') }}</span>
                <strong>{{ t('subscription.freeze.periodUntilValue', { date: computedFreezeEndFormatted, days: computedFreezeDays }) }}</strong>
              </div>
              <div class="summary-row">
                <span>{{ t('subscription.freeze.nextCharge') }}</span>
                <strong class="highlight-date">{{ computedShiftedBillingDate }}</strong>
              </div>
            </div>

            <div v-if="freezeError" class="modal-error-banner">
              {{ freezeError }}
            </div>

            <div class="modal-buttons-row">
              <button class="cancel-modal-btn" @click="isFreezeModalOpen = false">{{ t('subscription.cancel') }}</button>
              <button 
                class="confirm-freeze-btn" 
                :disabled="isSubmitting"
                @click="submitFreezeSubscription"
              >
                <span v-if="isSubmitting">{{ t('subscription.freeze.freezing') }}</span>
                <span v-else>{{ t('subscription.freeze.freezeFor', { days: computedFreezeDays }) }}</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- MODAL: Reschedule Exchange -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isRescheduleModalOpen" class="modal-overlay" @click.self="closeRescheduleModal">
          <div class="sub-modal-card freeze-modal-card">
            <button class="close-btn" @click="closeRescheduleModal">&times;</button>
            <div class="modal-icon-badge"><AppIcon name="calendar" :size="32" /></div>
            <h2 class="sub-modal-title">{{ t('subscription.reschedule.title') }}</h2>
            <p class="sub-modal-desc">
              {{ t('subscription.reschedule.currentWindow') }}
              <strong>{{ rescheduleOptions?.current?.human || plannedExchangeSlotHuman || plannedExchangeDateFormatted || t('subscription.reschedule.notScheduled') }}</strong>
            </p>

            <div v-if="isLoadingRescheduleOptions" class="reschedule-loading">{{ t('subscription.reschedule.loading') }}</div>
            <div v-else-if="rescheduleOptions && !rescheduleOptions.can_self_reschedule" class="reschedule-operator-box">
              <p>{{ rescheduleOptions.blocked_reason || t('subscription.reschedule.blockedDefault') }}</p>
              <NuxtLink :to="rescheduleOptions.operator_url || localePath('/profile?section=support')" class="confirm-freeze-btn reschedule-operator-link" @click="closeRescheduleModal">
                {{ t('subscription.reschedule.contactOperator') }}
              </NuxtLink>
            </div>
            <template v-else-if="rescheduleOptions">
              <div class="reschedule-warning-banner">
                {{ t('subscription.reschedule.warning') }}
              </div>
              <template v-if="!rescheduleConfirming">
                <div class="custom-date-box">
                  <label>{{ t('subscription.reschedule.newDate') }}</label>
                  <input
                    v-model="rescheduleDate"
                    type="date"
                    :min="rescheduleOptions.earliest_date || minRescheduleDate"
                    :max="rescheduleOptions.latest_date || undefined"
                    class="custom-date-input"
                  />
                </div>
                <div class="custom-date-box">
                  <label>{{ t('subscription.reschedule.slot') }}</label>
                  <div class="reschedule-slot-row">
                    <button
                      v-for="slot in rescheduleSlotsForDate"
                      :key="slot.key"
                      type="button"
                      class="reschedule-slot-chip"
                      :class="{ active: rescheduleSlot === slot.key, disabled: slot.available === false }"
                      :disabled="slot.available === false"
                      @click="rescheduleSlot = slot.key"
                    >
                      {{ slot.label }}
                    </button>
                  </div>
                  <p v-if="rescheduleDate && rescheduleSlotsForDate.length === 0" class="reschedule-slot-empty">
                    {{ t('subscription.reschedule.noSlots') }}
                  </p>
                </div>
              </template>
              <div v-else class="reschedule-confirm-box">
                <p v-if="rescheduleOptions.current?.human">
                  {{ t('subscription.reschedule.confirmMoveQuestion', { from: rescheduleOptions.current.human, to: rescheduleConfirmLabel }) }}
                </p>
                <p v-else>
                  {{ t('subscription.reschedule.confirmAssignQuestion', { date: rescheduleConfirmLabel }) }}
                </p>
                <p class="reschedule-confirm-note">{{ t('subscription.reschedule.confirmNote') }}</p>
              </div>
            </template>

            <div v-if="rescheduleError" class="modal-error-banner">{{ rescheduleError }}</div>
            <div class="modal-buttons-row">
              <button class="cancel-modal-btn" @click="rescheduleConfirming ? (rescheduleConfirming = false) : closeRescheduleModal()">
                {{ rescheduleConfirming ? t('subscription.back') : t('subscription.cancel') }}
              </button>
              <button
                v-if="rescheduleOptions?.can_self_reschedule"
                class="confirm-freeze-btn"
                :disabled="isSubmitting || !rescheduleDate || !rescheduleSlot"
                @click="rescheduleConfirming ? submitRescheduleExchange() : goRescheduleConfirm()"
              >
                <span v-if="isSubmitting">{{ t('subscription.reschedule.saving') }}</span>
                <span v-else-if="rescheduleConfirming">{{ t('subscription.reschedule.confirm') }}</span>
                <span v-else>{{ rescheduleOptions.current?.human ? t('subscription.reschedule.moveExchange') : t('subscription.reschedule.assignExchange') }}</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- MODAL: Edit next set toys -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isNextSetModalOpen" class="modal-overlay next-set-modal-overlay" @click.self="closeNextSetModal">
          <div
            class="sub-modal-card preview-toys-modal-card next-set-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="next-set-modal-title"
          >
            <button type="button" class="close-btn" :aria-label="t('subscription.close')" @click="closeNextSetModal">&times;</button>
            <div class="next-set-modal-sticky">
              <div class="modal-header-compact">
                <span class="preview-plan-badge">{{ t('subscription.nextSet.badge') }}</span>
                <h2 id="next-set-modal-title" class="sub-modal-title">{{ t('subscription.nextSet.modalTitle') }}</h2>
                <p class="sub-modal-desc">
                  <template v-if="toysMin === toysLimit">
                    {{ t('subscription.nextSet.pickExact', { n: toysLimit }) }}
                  </template>
                  <template v-else>
                    {{ t('subscription.nextSet.pickRange', { min: toysMin, max: toysLimit }) }}
                  </template>
                  <template v-if="compositionEditUntilLabel">
                    {{ t('subscription.nextSet.editUntil', { date: compositionEditUntilLabel }) }}
                  </template>
                  <template v-else>
                    {{ t('subscription.nextSet.editUntilMidnight') }}
                  </template>
                </p>
              </div>

              <div class="next-set-selected-row">
{{ t('subscription.nextSet.selected', { current: selectedNextToyIds.length, max: toysLimit }) }}
                <span v-if="toysMin !== toysLimit" class="next-set-min-hint">{{ t('subscription.nextSet.minHint', { min: toysMin }) }}</span>
              </div>

              <div v-if="nextSetModalError" class="modal-error-banner">{{ nextSetModalError }}</div>
            </div>

            <div class="next-set-modal-scroll">
              <div v-if="isLoadingNextSetCatalog" class="subscription-check-hint">
                <AppIcon name="loader" :size="20" class="spin-icon" /> {{ t('subscription.nextSet.loadingCatalog') }}
              </div>

              <div v-else class="preview-toys-grid next-set-toys-grid">
                <button
                  v-for="toy in nextSetCatalog"
                  :key="toy.id"
                  type="button"
                  class="preview-toy-card next-set-toy-card"
                  :class="{ selected: selectedNextToyIds.includes(toy.id) }"
                  :aria-pressed="selectedNextToyIds.includes(toy.id)"
                  @click="toggleNextSetToy(toy.id)"
                >
                  <span
                    v-if="selectedNextToyIds.includes(toy.id)"
                    class="next-set-toy-check"
                    aria-hidden="true"
                  >
                    <AppIcon name="check" :size="14" />
                  </span>
                  <img
                    v-if="toy.image_url || toy.main_image_url"
                    :src="toy.image_url || toy.main_image_url"
                    :alt="toy.name"
                    class="preview-toy-img"
                  >
                  <div v-else class="preview-toy-img preview-toy-img--empty" aria-hidden="true" />
                  <div class="preview-toy-body">
                    <strong>{{ toy.name }}</strong>
                    <span v-if="toy.category?.name">{{ toy.category.name }}</span>
                  </div>
                </button>
              </div>
            </div>

            <div class="next-set-modal-footer">
              <div class="modal-buttons-row">
                <button type="button" class="cancel-modal-btn" @click="closeNextSetModal">{{ t('subscription.cancel') }}</button>
                <button
                  type="button"
                  class="confirm-freeze-btn"
                  :disabled="isSavingNextSet || selectedNextToyIds.length < toysMin || !!nextSetAssemblyStartedAt || nextSetStatus !== 'assembling'"
                  @click="submitNextSetToys"
                >
                  <span v-if="isSavingNextSet">{{ t('subscription.nextSet.saving') }}</span>
                  <span v-else>{{ t('subscription.nextSet.saveSet') }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- MODAL 2: Exact Toys in Selected Plan / Current Set -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isPreviewModalOpen" class="modal-overlay" @click.self="isPreviewModalOpen = false">
          <div class="sub-modal-card preview-toys-modal-card">
            <button class="close-btn" @click="isPreviewModalOpen = false">&times;</button>
            
            <div class="modal-header-compact">
              <span v-if="previewMode === 'plan'" class="preview-plan-badge">{{ t('subscription.preview.planBadge', { name: selectedPreviewPlan?.name }) }}</span>
              <span v-else class="preview-plan-badge">{{ t('subscription.preview.yourSet') }}</span>
              <h2 class="sub-modal-title">
                <template v-if="previewMode === 'plan'">
                  {{ t('subscription.preview.includesPlan', { name: selectedPreviewPlan?.name }) }}
                </template>
                <template v-else>
                  <template v-if="currentBoxName">{{ t('subscription.preview.readyBox', { name: currentBoxName }) }}</template>
                  <template v-else>{{ t('subscription.preview.currentToys') }}</template>
                </template>
              </h2>
              <p class="sub-modal-desc">
                <template v-if="previewMode === 'plan'">
                  {{ t('subscription.preview.planBenefits', { toys: selectedPreviewPlan?.toys_count ?? t('subscription.yesNo.dash'), exchanges: selectedPreviewPlan?.exchanges_count ?? t('subscription.yesNo.dash') }) }}
                </template>
                <template v-else>
                  {{ t('subscription.preview.currentComposition') }}
                </template>
              </p>
            </div>

            <template v-if="previewMode === 'plan' && selectedPreviewPlan">
              <ul
                v-if="(selectedPreviewPlan.features || []).length"
                class="plan-perks-list preview-plan-perks"
              >
                <li v-for="(feat, fIdx) in selectedPreviewPlan.features" :key="`preview-f-${fIdx}`">
                  <span class="check-icon featured">✓</span>
                  <span>{{ feat }}</span>
                </li>
                <template v-if="(selectedPreviewPlan.category_access || []).length">
                  <li
                    v-for="cap in selectedPreviewPlan.category_access"
                    :key="`preview-c-${cap.slug}`"
                    :class="{ 'perk-inactive': !cap.allowed }"
                  >
                    <span class="check-icon" :class="{ featured: cap.allowed, inactive: !cap.allowed }">
                      {{ cap.allowed ? '✓' : '✕' }}
                    </span>
                    <span>{{ cap.name }}</span>
                  </li>
                </template>
                <template v-else>
                  <li
                    v-for="(feat, fIdx) in (selectedPreviewPlan.unavailable_features || [])"
                    :key="`preview-u-${fIdx}`"
                    class="plan-perk-unavailable"
                  >
                    <span class="unavailable-icon" aria-hidden="true">×</span>
                    <span>{{ feat }}</span>
                  </li>
                </template>
              </ul>
              <h3 class="preview-boxes-heading">{{ t('subscription.preview.examplesHeading') }}</h3>
            </template>

            <!-- Plan: boxes with nested toys (toys loaded on demand) -->
            <template v-if="previewMode === 'plan'">
              <div v-if="isPreviewToysLoading" class="preview-toys-empty">
                <p>{{ t('subscription.preview.loadingExamples') }}</p>
              </div>
              <div v-else-if="previewToysError" class="preview-toys-empty">
                <p>{{ previewToysError }}</p>
                <button
                  v-if="selectedPreviewPlan"
                  type="button"
                  class="btn-secondary"
                  @click="openPreviewToysModal(selectedPreviewPlan, focusedPreviewBoxId ?? undefined)"
                >
                  {{ t('subscription.retry') }}
                </button>
              </div>
              <div v-else-if="previewPlanBoxes.length === 0 && previewToys.length === 0" class="preview-toys-empty">
                <p>{{ t('subscription.preview.boxesNotConfigured') }}</p>
              </div>
              <div v-else-if="previewPlanBoxes.length" class="preview-boxes-list">
                <div
                  v-for="box in previewPlanBoxes"
                  :key="box.id"
                  class="preview-box-block"
                  :class="{ focused: focusedPreviewBoxId === box.id }"
                >
                  <div class="preview-box-head">
                    <h3>{{ box.name }}</h3>
                    <span>{{ t('subscription.preview.toysInBox', { n: (box.toys?.length || box.toys_count || 0) }) }}</span>
                  </div>
                  <p v-if="box.description" class="preview-box-desc">{{ box.description }}</p>
                  <div v-if="!(box.toys?.length)" class="preview-toys-empty compact">
                    <p>{{ t('subscription.preview.emptyBox') }}</p>
                  </div>
                  <div v-else class="preview-toys-scroll-grid">
                    <div
                      v-for="(toy, tIdx) in box.toys"
                      :key="toy.id || tIdx"
                      class="preview-toy-item-card"
                    >
                      <div class="preview-toy-img-box">
                        <img :src="toy.image_url || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80'" :alt="toy.name" loading="lazy" />
                        <span class="toy-item-number">№{{ tIdx + 1 }}</span>
                        <span class="toy-skill-badge">{{ toy.category?.name || t('subscription.preview.toyFallback') }}</span>
                      </div>
                      <div class="preview-toy-content">
                        <div class="toy-title-row">
                          <h4>{{ toy.name }}</h4>
                          <span class="toy-age-tag">{{ formatToyAgeRange(toy.min_age_months, toy.max_age_months) }}</span>
                        </div>
                        <p class="toy-descr">{{ toy.description || t('subscription.preview.toyDescFallback') }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="preview-toys-scroll-grid">
                <div
                  v-for="(toy, tIdx) in previewToys"
                  :key="toy.id || tIdx"
                  class="preview-toy-item-card"
                >
                  <div class="preview-toy-img-box">
                    <img :src="toy.image" :alt="toy.name" loading="lazy" />
                    <span class="toy-item-number">№{{ tIdx + 1 }}</span>
                    <span class="toy-skill-badge">{{ toy.skill }}</span>
                  </div>
                  <div class="preview-toy-content">
                    <div class="toy-title-row">
                      <h4>{{ toy.name }}</h4>
                      <span class="toy-age-tag">{{ toy.age }}</span>
                    </div>
                    <p class="toy-descr">{{ toy.desc }}</p>
                  </div>
                </div>
              </div>
            </template>

            <!-- Current set toys -->
            <template v-else>
              <div v-if="previewToys.length === 0" class="preview-toys-empty">
                <p>{{ t('subscription.preview.assemblingNote') }}</p>
              </div>
              <div v-else class="preview-toys-scroll-grid">
                <div
                  v-for="(toy, tIdx) in previewToys"
                  :key="toy.id || tIdx"
                  class="preview-toy-item-card"
                >
                  <div class="preview-toy-img-box">
                    <img :src="toy.image" :alt="toy.name" loading="lazy" />
                    <span class="toy-item-number">№{{ tIdx + 1 }}</span>
                    <span class="toy-skill-badge">{{ toy.skill }}</span>
                  </div>
                  <div class="preview-toy-content">
                    <div class="toy-title-row">
                      <h4>{{ toy.name }}</h4>
                      <span class="toy-age-tag">{{ toy.age }}</span>
                    </div>
                    <p class="toy-descr">{{ toy.desc }}</p>
                    <div class="toy-perk-tag">
                      <span><AppIcon name="sparkles" :size="14" class="inline-icon" /> {{ toy.benefit }}</span>
                    </div>
                    <button
                      v-if="canBuyoutToy(toy)"
                      type="button"
                      class="buyout-toy-btn"
                      :disabled="buyoutLoadingToyId === toy.id"
                      @click="handleBuyoutToy(toy)"
                    >
                      {{ buyoutLoadingToyId === toy.id ? t('subscription.preview.buyoutProcessing') : t('subscription.preview.buyoutCta') }}
                    </button>
                    <span v-else-if="toy.isBoughtOut" class="buyout-done-tag">{{ t('subscription.preview.buyoutDone') }}</span>
                  </div>
                </div>
              </div>
            </template>

            <!-- Bottom CTA inside preview modal -->
            <div v-if="previewMode === 'plan'" class="preview-modal-footer">
              <div class="preview-footer-left">
                <span class="footer-price-lbl">{{ t('subscription.preview.planCost') }}</span>
                <strong class="footer-price-val">{{ formatPrice(planPrice(selectedPreviewPlan || displayPlans[0])) }} ₸ {{ t('subscription.preview.perMonthShort') }}</strong>
              </div>
              <button 
                class="preview-action-btn"
                @click="handleSelectPlanFromPreview"
              >
                {{ user ? t('subscription.preview.selectPlan', { name: selectedPreviewPlan?.name }) : t('subscription.preview.checkoutCta') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 3-step checkout sheet (new subscription) -->
    <SubscriptionCheckoutSheet
      :open="isSubModalOpen && !isChangingPlan"
      :plan-name="selectedPlanName"
      :billing-cycle-label="checkoutBillingCycleLabel"
      :total-amount="checkoutBilledTotal"
      :format-price="formatPrice"
      :max-birth-date="maxBirthDate"
      :children="checkoutChildren"
      :is-loading-children="isLoadingCheckoutChildren"
      :child-mode="checkoutChildMode"
      :selected-child-id="selectedCheckoutChildId"
      :child-name="checkoutChildName"
      :child-last-name="checkoutChildLastName"
      :child-birth-date="checkoutChildBirthDate"
      :addresses="checkoutAddresses"
      :is-loading-addresses="isLoadingCheckoutAddresses"
      :selected-address-key="selectedCheckoutAddressKey"
      :address-form="checkoutAddressForm"
      :phone="checkoutPhone"
      :is-submitting="isActivatingSubscription"
      :submit-error="checkoutError"
      :format-child-age="formatCheckoutChildAge"
      :format-address="formatCheckoutAddress"
      @close="isSubModalOpen = false"
      @pay="activateSubscription"
      @select-child="selectCheckoutChild"
      @switch-to-create="switchToCreateChild"
      @switch-to-select="switchToSelectChild"
      @update:child-name="checkoutChildName = $event"
      @update:child-last-name="checkoutChildLastName = $event"
      @update:child-birth-date="checkoutChildBirthDate = $event"
      @update:selected-address-key="selectedCheckoutAddressKey = $event"
      @update:address-form="checkoutAddressForm = $event"
      @phone-input="onCheckoutPhoneInput"
      @phone-paste="onCheckoutPhonePaste"
    />

    <!-- Plan-change confirmation (single screen) -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="isSubModalOpen && isChangingPlan"
          class="modal-overlay"
          @click.self="isSubModalOpen = false"
        >
          <div class="sub-modal-card">
            <button class="close-btn" @click="isSubModalOpen = false">&times;</button>
            <h2 class="sub-modal-title">{{ t('subscription.planChange.title') }}</h2>
            <p class="sub-modal-desc">
              {{ t('subscription.planChange.newPlan', { name: selectedPlanName }) }}
            </p>

            <div class="modal-price-summary">
              <span>{{ t('subscription.planChange.nextPeriodCost') }}</span>
              <strong>{{ formatPrice(selectedPlanPrice) }} ₸</strong>
            </div>
            <p class="epay-hint plan-change-effective-hint">
              {{ t('subscription.planChange.effectiveFrom', { date: paidUntilLabel || nextBillingDate || t('subscription.planChange.effectiveFallback') }) }}
              {{ t('subscription.planChange.limitsNote') }}
            </p>

            <div class="payment-methods-box">
              <p class="epay-hint">{{ t('subscription.planChange.scheduleHint') }}</p>
            </div>

            <div v-if="checkoutError" class="error-banner">
              {{ checkoutError }}
            </div>

            <button class="confirm-sub-btn" :disabled="isActivatingSubscription" @click="activateSubscription">
              {{ isActivatingSubscription ? t('subscription.planChange.planning') : t('subscription.planChange.schedule') }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- MODAL: Renew subscription — pick billing period -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="isRenewModalOpen"
          class="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="renew-modal-title"
          @click.self="closeRenewModal"
        >
          <div class="sub-modal-card">
            <button class="close-btn" :aria-label="t('subscription.close')" @click="closeRenewModal">&times;</button>
            <h2 id="renew-modal-title" class="sub-modal-title">{{ t('subscription.renew.title') }}</h2>
            <p class="sub-modal-desc">
              {{ t('subscription.renew.lead') }}
            </p>

            <div class="buy-details-card" style="margin-bottom: 16px;">
              <label style="display: block; font-size: 13px; font-weight: 700; margin-bottom: 8px;">
                {{ t('subscription.renew.period') }}
              </label>
              <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;">
                <button
                  v-for="opt in renewalCycleOptions"
                  :key="opt.cycle"
                  type="button"
                  class="subtab-btn"
                  :class="{ active: renewBillingCycle === opt.cycle }"
                  style="flex: 1; min-width: 72px; text-align: center; padding: 8px; justify-content: center;"
                  :disabled="isLoadingRenewalQuote || isRenewingSubscription"
                  @click="selectRenewBillingCycle(opt.cycle)"
                >
                  {{ opt.label }}
                </button>
              </div>

              <div v-if="isLoadingRenewalQuote" class="card-sub-info">{{ t('subscription.renew.calculating') }}</div>
              <div v-else-if="renewalQuoteError" class="error-banner">{{ renewalQuoteError }}</div>
              <template v-else-if="selectedRenewalQuote">
                <div class="price-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span>{{ t('subscription.renew.toPay') }}</span>
                  <span class="special-price" style="color: #3F6757; font-weight: 800; font-size: 18px;">
                    {{ formatPrice(selectedRenewalQuote.amount) }} ₸
                  </span>
                </div>
                <p
                  v-if="selectedRenewalQuote.discount_amount > 0"
                  class="card-sub-info"
                  style="margin: 0 0 6px;"
                >
{{ t('subscription.renew.discountWithAmount', { percent: selectedRenewalQuote.discount_percent, amount: formatPrice(selectedRenewalQuote.discount_amount) }) }}
                </p>
                <p class="card-sub-info" style="margin: 0;">
{{ t('subscription.renew.periodRangeFull', { start: formatDateHuman(selectedRenewalQuote.period_start), end: formatDateHuman(selectedRenewalQuote.period_end) }) }}
                </p>
              </template>
            </div>

            <div v-if="subscriptionActionError" class="error-banner">
              {{ subscriptionActionError }}
            </div>

            <div class="modal-buttons-row">
              <button class="cancel-modal-btn" type="button" :disabled="isRenewingSubscription" @click="closeRenewModal">
                {{ t('subscription.cancel') }}
              </button>
              <button
                class="confirm-freeze-btn"
                type="button"
                :disabled="isRenewingSubscription || isLoadingRenewalQuote || !selectedRenewalQuote"
                @click="confirmRenewSubscription"
              >
                {{ isRenewingSubscription ? t('subscription.renew.openingPay') : t('subscription.renew.goToPay') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- MODAL: Cancel Subscription -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isCancelModalOpen" class="modal-overlay" @click.self="isCancelModalOpen = false">
          <div class="sub-modal-card">
            <button class="close-btn" @click="isCancelModalOpen = false">&times;</button>
            <h2 class="sub-modal-title">{{ t('subscription.cancelSub.title') }}</h2>
            <p class="sub-modal-desc">
              {{ t('subscription.cancelSub.body') }}
            </p>
            <div v-if="subscriptionActionError" class="error-banner">
              {{ subscriptionActionError }}
            </div>
            <div class="modal-buttons-row">
              <button class="cancel-modal-btn" @click="isCancelModalOpen = false">{{ t('subscription.back') }}</button>
              <button class="confirm-freeze-btn danger" :disabled="isSubmitting" @click="submitCancelSubscription">
                {{ isSubmitting ? t('subscription.cancelSub.cancelling') : t('subscription.cancelSub.confirm') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- MODAL 4: Gift Certificate / Subscription Activation Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isGiftCodeModalOpen" class="modal-overlay" @click.self="isGiftCodeModalOpen = false">
          <div class="sub-modal-card">
            <button class="close-btn" @click="isGiftCodeModalOpen = false">&times;</button>
            
            <div class="gift-modal-header">
              <span class="gift-icon-badge"><AppIcon name="gift" :size="28" /></span>
              <h2 class="sub-modal-title">{{ t('subscription.gift.modalTitle') }}</h2>
              <p class="sub-modal-desc">
                {{ t('subscription.gift.modalLead') }}
              </p>
            </div>

            <div class="gift-activate-form">
              <div class="g-field">
                <label>{{ t('subscription.gift.codeLabel') }} <span class="req">*</span></label>
                <input 
                  v-model="giftActivationCode" 
                  type="text" 
                  :placeholder="t('subscription.gift.codePlaceholder')" 
                  class="gift-code-input"
                  style="text-transform: uppercase;"
                />
              </div>

              <!-- Children selection or inline addition -->
              <div v-if="giftChildren.length > 0 && !isAddingNewChild" class="g-field">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <label style="margin: 0;">{{ t('subscription.gift.childLabel') }} <span class="req">*</span></label>
                  <button type="button" class="checkout-add-child-link" @click="isAddingNewChild = true">
                    {{ t('subscription.gift.addAnotherChild') }}
                  </button>
                </div>
                <select
                  v-model="giftSelectedChildId"
                  class="gift-code-input"
                >
                  <option :value="null" disabled>{{ t('subscription.gift.selectChild') }}</option>
                  <option v-for="child in giftChildren" :key="child.id" :value="child.id">
                    {{ child.name }}
                  </option>
                </select>
              </div>

              <div v-else class="checkout-child-fields" style="margin-top: 12px;">
                <div v-if="giftChildren.length > 0" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span class="checkout-section-label">{{ t('subscription.gift.newChildSection') }}</span>
                  <button type="button" class="checkout-add-child-link" @click="isAddingNewChild = false">
                    {{ t('subscription.gift.pickExisting') }}
                  </button>
                </div>
                <span v-else class="checkout-section-label" style="display: block; margin-bottom: 8px;">{{ t('subscription.gift.childDataSection') }}</span>

                <div class="g-field" style="margin-bottom: 12px;">
                  <label>{{ t('subscription.gift.nameLabel') }} <span class="req">*</span></label>
                  <input
                    v-model="newChildName"
                    type="text"
                    :placeholder="t('subscription.gift.namePlaceholder')"
                    class="gift-code-input"
                  />
                </div>

                <div class="g-field" style="margin-bottom: 12px;">
                  <label>{{ t('subscription.gift.birthLabel') }} <span class="req">*</span></label>
                  <input
                    v-model="newChildBirthDate"
                    type="date"
                    :max="maxBirthDate"
                    class="gift-code-input"
                  />
                  <p class="checkout-child-hint" style="margin-top: 4px; font-size: 12px;">{{ t('subscription.gift.birthHint') }}</p>
                </div>
              </div>

              <div v-if="!user?.phone" class="g-field" style="margin-top: 12px;">
                <label>{{ t('subscription.gift.phoneLabel') }} <span class="req">*</span></label>
                <input
                  v-model="recipientPhone"
                  type="tel"
                  placeholder="+7 (701) 000-00-00"
                  class="gift-code-input"
                  maxlength="18"
                  @input="onPhoneInput"
                />
              </div>

              <div class="g-field" style="margin-top: 12px;">
                <label for="gift-activation-city">Город доставки <span class="req">*</span></label>
                <select id="gift-activation-city" v-model="giftActivationCityId" class="gift-code-input">
                  <option :value="null" disabled>Выберите город</option>
                  <option v-for="city in subscriptionCities" :key="city.id" :value="city.id">{{ city.name }}</option>
                </select>
              </div>
              <div class="g-field" style="margin-top: 12px;">
                <label for="gift-activation-address">Адрес доставки <span class="req">*</span></label>
                <input id="gift-activation-address" v-model="giftActivationAddress" type="text"
                       class="gift-code-input" placeholder="Улица, дом, квартира" autocomplete="street-address" />
                <p class="checkout-child-hint">Подписка и возврат игрушек будут закреплены за выбранным городом.</p>
              </div>

              <div v-if="giftActivationError" class="error-banner">
                {{ giftActivationError }}
              </div>

              <div v-if="giftActivationSuccess" class="success-banner">
                {{ giftActivationSuccess }}
              </div>

              <button 
                class="confirm-sub-btn" 
                :disabled="isActivatingGift || (!giftSelectedChildId && (!newChildName.trim() || !newChildBirthDate))"
                @click="submitGiftActivation"
              >
                {{ isActivatingGift ? t('subscription.gift.activating') : t('subscription.gift.activateFree') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- TheFooter -->
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import TheHeader from '~/components/TheHeader.vue'
import TheFooter from '~/components/TheFooter.vue'
import SubscriptionActiveDashboard from '~/components/subscription/SubscriptionActiveDashboard.vue'
import SubscriptionPricingShowcase from '~/components/subscription/SubscriptionPricingShowcase.vue'
import SubscriptionCheckoutSheet from '~/components/subscription/SubscriptionCheckoutSheet.vue'
import type { PlanViewItem } from '~/composables/useSubscriptionPricing'
import {
  resolveSelectedSubscriptionId,
  shouldApplyResponse,
  filterManageableSubscriptions,
  filterPendingSubscriptions,
  filterSwitchableSubscriptions,
  isManageableSubscriptionStatus,
  isPendingSubscriptionStatus,
  parseSubscriptionIdParam,
  subscriptionSwitcherStatusKey,
} from '~/utils/subscriptionSelection'
import {
  resolveHomeSet,
  resolveTrackSet,
  resolveToysInUse,
} from '~/utils/subscriptionSetPointers'
import {
  getOrCreateSubscriptionPayIdempotencyKey,
  clearSubscriptionPayIdempotencyKey,
} from '~/utils/subscriptionPayIdempotency'
import { shouldShowSubscriptionPricingShowcase } from '~/utils/subscriptionViewGate'

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()
usePageSeo('/subscription')
const { user, openAuthModal, fetchUser, isInitialized, hasAuthSession, updateUser } = useAuth()
const { cities: subscriptionCities, cityId: selectedSiteCityId, loadCities: loadSubscriptionCities } = useCity()
const { success: toastSuccess, error: toastError } = useToast()
const { request } = useApi()
const { calculateBuyout, executeBuyout } = useBuyout()
const { handlePayResponse } = usePaymentLaunch()
const { syncPayment } = usePayments()
const { fetchAddresses } = useAddresses()
const {
  createSubscription,
  paySubscription,
  fetchRenewalQuote,
  changePlan,
  cancelPlanChange,
  cancelSubscription,
  cancelPendingSubscription: cancelPendingCheckout,
  requestExchange,
  rescheduleExchange,
  fetchExchangeRescheduleOptions,
  fetchNextSet,
  fetchMySubscriptions,
  modifySetToys,
  replaceSetPosition,
} = useSubscriptions()
const {
  plans: apiPlans,
  fetchPlans,
  isLoading: isLoadingPlans,
  hydratePlans,
  hasFreshPlans,
  error: plansError,
  fetchAllPlanToys,
} = useSubscriptionPlans()
const { formatPrice, mapPlanToView, calcPlanPrice, calcBilledTotal } = useSubscriptionPricing()

const { cmsLocale } = useCmsLocale()

useAsyncData('subscription-plans-ssr', async () => {
  if (hasFreshPlans()) return true

  try {
    const res = await $fetch<{ data: import('~/composables/useSubscriptionPlans').SubscriptionPlanItem[] }>(
      `${config.public.apiBase}/subscription-plans`,
      { params: { locale: cmsLocale.value } },
    )
    if (Array.isArray(res?.data) && res.data.length > 0) {
      hydratePlans(res.data)
    }
  } catch {
    // Leave plans empty until client fetchPlans surfaces the error (or demo fallback).
  }

  return true
}, { lazy: true, server: false, watch: [cmsLocale] })

// Gift Activation Modal State (GSUB prepaid subscription only)
const isGiftCodeModalOpen = ref(false)
const giftActivationCode = ref('')
const giftChildren = ref<Array<{ id: number; name: string }>>([])
const giftSelectedChildId = ref<number | null>(null)
const isAddingNewChild = ref(false)
const newChildName = ref('')
const newChildBirthDate = ref('')
const recipientPhone = ref('')
const giftActivationCityId = ref<number | null>(null)
const giftActivationAddress = ref('')
const isActivatingGift = ref(false)
const giftActivationError = ref('')
const giftActivationSuccess = ref('')

const maxBirthDate = computed(() => {
  return new Date().toISOString().split('T')[0]
})

const onPhoneInput = (event: Event) => {
  handlePhoneInput(event, (val) => { recipientPhone.value = val })
}

const checkoutPhone = ref('')
const onCheckoutPhoneInput = (event: Event) => {
  handlePhoneInput(event, (val) => { checkoutPhone.value = val })
}
const onCheckoutPhonePaste = (event: ClipboardEvent) => {
  handlePhonePaste(event, (val) => { checkoutPhone.value = val })
}

const fetchGiftCodeInfo = async (code: string) => {
  if (!code || !code.startsWith('GSUB-')) return
  try {
    const res = await request<any>('/gift-subscriptions/verify', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
    if (res?.data?.recipient_name && !newChildName.value) {
      newChildName.value = res.data.recipient_name
    }
  } catch {
    // ignore
  }
}

const loadGiftChildren = async () => {
  if (!user.value) {
    giftChildren.value = []
    giftSelectedChildId.value = null
    isAddingNewChild.value = true
    return
  }
  try {
    const childrenRes = await request<any>('/children')
    const children = Array.isArray(childrenRes?.data) ? childrenRes.data : (Array.isArray(childrenRes) ? childrenRes : [])
    giftChildren.value = children
    if (children.length > 0) {
      if (!giftSelectedChildId.value || !children.find((c) => c.id === giftSelectedChildId.value)) {
        giftSelectedChildId.value = children[0].id
      }
      isAddingNewChild.value = false
    } else {
      giftSelectedChildId.value = null
      isAddingNewChild.value = true
    }
  } catch {
    giftChildren.value = []
    giftSelectedChildId.value = null
    isAddingNewChild.value = true
  }
}

watch(isGiftCodeModalOpen, async (open) => {
  if (open) {
    if (!user.value) {
      if (import.meta.client && giftActivationCode.value) {
        sessionStorage.setItem('pending_gift_code', giftActivationCode.value.trim().toUpperCase())
      }
      openAuthModal('login')
      isGiftCodeModalOpen.value = false
      return
    }
    await loadGiftChildren()
    await loadSubscriptionCities()
    if (!giftActivationCityId.value) giftActivationCityId.value = selectedSiteCityId.value
    if (giftActivationCode.value) {
      void fetchGiftCodeInfo(giftActivationCode.value.trim().toUpperCase())
    }
  }
})

const submitGiftActivation = async () => {
  const code = giftActivationCode.value.trim().toUpperCase()
  if (!code) {
    giftActivationError.value = t('subscription.gift.enterCode')
    return
  }
  if (!user.value) {
    openAuthModal('login')
    return
  }
  if (!code.startsWith('GSUB-')) {
    giftActivationError.value = t('subscription.gift.gftOnly')
    return
  }

  let childId = giftSelectedChildId.value
  let childName = ''
  let childBirthDate = ''

  if (giftChildren.value.length === 0 || isAddingNewChild.value) {
    childName = newChildName.value.trim()
    childBirthDate = newChildBirthDate.value.trim()
    if (!childName) {
      giftActivationError.value = t('subscription.gift.nameRequired')
      return
    }
    if (!childBirthDate) {
      giftActivationError.value = t('subscription.gift.birthRequired')
      return
    }
    childId = null
  } else if (!childId) {
    giftActivationError.value = t('subscription.gift.pickOrCreate')
    return
  }

  const phone = user.value.phone?.trim() || recipientPhone.value.trim()
  if (!phone) {
    giftActivationError.value = t('subscription.gift.phoneRequired')
    return
  }
  if (!giftActivationCityId.value || giftActivationAddress.value.trim().length < 8) {
    giftActivationError.value = 'Выберите город и укажите адрес доставки (улица, дом).'
    return
  }

  isActivatingGift.value = true
  giftActivationError.value = ''
  giftActivationSuccess.value = ''

  try {
    const payload: any = {
      code,
      city_id: giftActivationCityId.value,
      delivery_address: giftActivationAddress.value.trim(),
    }
    if (childId) {
      payload.child_id = childId
    } else {
      payload.child_name = childName
      payload.child_birth_date = childBirthDate
    }
    if (!user.value.phone && recipientPhone.value.trim()) {
      payload.phone = recipientPhone.value.trim()
    }

    await request<any>('/gift-subscriptions/activate', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    const resolvedChildName = childName || giftChildren.value.find((c) => c.id === childId)?.name || ''
    giftActivationSuccess.value = t('subscription.gift.success', { code, name: resolvedChildName })

    isCheckingSubscription.value = true
    await loadUserSubscription()
    await loadGiftChildren()
    showAllPlans.value = false
    setTimeout(() => {
      isGiftCodeModalOpen.value = false
    }, 2500)
  } catch (e: any) {
    giftActivationError.value = e?.data?.message || e?.data?.errors?.code?.[0] || e?.message || t('subscription.gift.invalidCode')
  } finally {
    isActivatingGift.value = false
  }
}

const displayPlans = computed<PlanViewItem[]>(() => (
  apiPlans.value.map((p, index) => mapPlanToView(p, index))
))

// Active Subscription state
// Cookie so SSR + first paint know not to flash tariffs for subscribers
const subActiveCookie = useCookie<'1' | '0' | null>('alpha_has_active_subscription', {
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 30,
})

const writeSubActiveCache = (active: boolean) => {
  subActiveCookie.value = active ? '1' : '0'
}

const clearSubActiveCache = () => {
  subActiveCookie.value = null
}

// Persist across SPA navigations + cookie hydrate to avoid tariff→dashboard flash
const hasActiveSubscription = useState(
  'subscription_has_active',
  () => subActiveCookie.value === '1',
)
const { isVisible } = useFeatures()
const featureBlocked = computed(() => !isVisible('subscription') && !hasActiveSubscription.value)
const subscriptionResolved = useState(
  'subscription_resolved',
  () => subActiveCookie.value === '1' || subActiveCookie.value === '0',
)
const {
  selectedSubscriptionId,
  clearSelectedSubscriptionId,
  preferredSelectedSubscriptionId,
  syncSelectedSubscriptionQuery,
} = useSelectedSubscription()

const activeSubId = ref<number | null>(null)
const isSubscriptionPaused = ref(false)
const pendingAction = ref<string | null>(null)
const pendingPickup = ref(false)
const freezeEndDate = ref<string | null>(null)
const freezeUsed = ref(false)
/** Fallback only before subscription payload arrives; prefer plan.max_freeze_days. */
const maxFreezeDays = ref(7)

const resolveMaxFreezeDays = (active: any): number => {
  const fromApi = Number(active?.freeze_max_days)
  if (Number.isFinite(fromApi) && fromApi >= 1) return Math.floor(fromApi)
  const fromPlan = Number(active?.plan?.max_freeze_days)
  if (Number.isFinite(fromPlan) && fromPlan >= 1) return Math.floor(fromPlan)
  return 7
}
const showAllPlans = ref(false)
const billingCycle = ref<'monthly' | 'quarterly' | 'semiannual' | 'annual'>('monthly')
const isCheckingSubscription = ref(false)
const pendingSubscription = ref<any>(null)
const manageableSubscriptions = ref<any[]>([])
const pendingSubscriptions = ref<any[]>([])
const switchableSubscriptions = ref<any[]>([])
const isCancellingPending = ref(false)
const isVerifyingPayment = ref(false)
const pendingPaymentError = ref('')
let selectApplyGeneration = 0

const hasAnyManageableSubscription = computed(() => manageableSubscriptions.value.length > 0)
const hasAnyPendingSubscription = computed(() => pendingSubscriptions.value.length > 0)
const showSubscriptionSwitcher = computed(() => switchableSubscriptions.value.length > 1)

const selectedIsManageable = computed(() => {
  if (!selectedSubscriptionId.value) return false
  return manageableSubscriptions.value.some(sub => sub.id === selectedSubscriptionId.value)
})

const selectedIsPending = computed(() => {
  return !!pendingSubscription.value
    && pendingSubscription.value.status === 'pending_payment'
    && pendingSubscription.value.id === selectedSubscriptionId.value
})

/** @deprecated use selectedIsPending — kept as alias for pending UI helpers */
const hasPendingSubscription = computed(() => selectedIsPending.value)

const pendingChildName = computed(() => {
  return pendingSubscription.value?.child?.name || ''
})

const pendingPlanName = computed(() => {
  return pendingSubscription.value?.plan?.name || t('subscription.pending.planFallback')
})

const pendingCycleLabel = computed(() => {
  const cycle = pendingSubscription.value?.billing_cycle || 'monthly'
  const labels: Record<string, string> = {
    monthly: t('subscription.billingCycle.monthlyPeriod'),
    quarterly: t('subscription.billingCycle.quarterlyPeriod'),
    semiannual: t('subscription.billingCycle.semiannualPeriod'),
    annual: t('subscription.billingCycle.annualPeriod'),
  }
  return labels[cycle] || t('subscription.billingCycle.monthly')
})

const pendingPriceLabel = computed(() => {
  const plan = pendingSubscription.value?.plan
  if (!plan) return '—'
  const cycle = pendingSubscription.value?.billing_cycle || 'monthly'
  const extra = pendingSubscription.value?.extra_toys_count || 0
  const priceKey = `price_${cycle}`
  const basePrice = plan[priceKey] ?? plan.price_monthly ?? 0
  const extraPrice = (plan.extra_toy_price ?? 2500) * extra
  return formatPrice(basePrice + extraPrice)
})

/**
 * Always false until onMounted. Do not key off `nuxtApp.isHydrating` in setup:
 * async page chunks can resolve after hydration ends, which would open the gate
 * during the first client VDOM pass and recreate the SSR/client tree mismatch.
 */
const isSubscriptionViewReady = ref(false)

/** Show tariffs only for guests, or after we know there is no manageable/pending subscription */
const showPricingShowcase = computed(() => shouldShowSubscriptionPricingShowcase({
  viewReady: isSubscriptionViewReady.value,
  showAllPlans: showAllPlans.value,
  hasActiveSubscription: hasActiveSubscription.value,
  hasAnyPendingSubscription: hasAnyPendingSubscription.value,
  hasUser: !!user.value,
  hasAuthSession: hasAuthSession(),
  subscriptionResolved: subscriptionResolved.value,
}))

const currentPlan = ref({
  name: '',
  price: '',
  features: [] as string[],
  isGift: false
})

const pendingPlanChange = ref<{
  name: string
  effectiveOn: string
  status: string | null
  renewalAmount: number | null
  requiresExchange: boolean
} | null>(null)

const activeSubscriptionPlanDeniedSlugs = ref<string[]>([])

const currentPlanItem = computed(() => {
  if (!currentPlan.value.name) return displayPlans.value[0]
  return displayPlans.value.find(p => p.name.toLowerCase() === currentPlan.value.name.toLowerCase()) || displayPlans.value[0]
})

// Prefer inbound set for delivery tracking; home set only when nothing is inbound.
const trackedSetId = computed(() => nextSetId.value || currentSetId.value)

const deliveryTrackLink = computed(() => {
  if (deliveryTaskId.value) return localePath(`/delivery?task_id=${deliveryTaskId.value}`)
  if (trackedSetId.value) return localePath(`/delivery?subscription_set_id=${trackedSetId.value}`)
  return localePath('/delivery')
})

// First inbound only when nothing is at home and history has at most this one set.
const isFirstSetCycle = computed(() => {
  if (currentSetId.value || !nextSetId.value) return false
  return setHistory.value.length <= 1
})

const nextBillingDate = ref('')
const paidUntilLabel = ref('')
const canRenewSubscription = ref(false)
const renewalOverdue = ref(false)
const renewalAmount = ref<number | null>(null)
const isRenewingSubscription = ref(false)
const isRenewModalOpen = ref(false)
const renewBillingCycle = ref<'monthly' | 'quarterly' | 'semiannual' | 'annual'>('monthly')
const currentBillingCycle = ref<'monthly' | 'quarterly' | 'semiannual' | 'annual'>('monthly')
const isLoadingRenewalQuote = ref(false)
const renewalQuoteError = ref('')
const selectedRenewalQuote = ref<import('~/composables/useSubscriptions').RenewalQuoteOption | null>(null)
const renewalCycleOptions = computed(() => [
  { cycle: 'monthly' as const, label: t('subscription.billingCycle.monthlyShort') },
  { cycle: 'quarterly' as const, label: t('subscription.billingCycle.quarterlyShort') },
  { cycle: 'semiannual' as const, label: t('subscription.billingCycle.semiannualShort') },
  { cycle: 'annual' as const, label: t('subscription.billingCycle.annualShort') },
])
const nextDeliveryDate = ref('')
const plannedExchangeDate = ref('')
const plannedExchangeSlotHuman = ref('')
const returnDueDate = ref('')
const confirmedDeliverySlot = ref('')
const setHistory = ref<any[]>([])
const exchangeQuota = ref<import('~/composables/useSubscriptions').ExchangeQuota | null>(null)
const nextSetId = ref<number | null>(null)
const nextSetStatus = ref('')
const nextSetToys = ref<any[]>([])
const nextSetPositions = ref<any[]>([])
const nextSetTitle = ref('')
const nextSetBoxName = ref<string | null>(null)
const nextSetAssemblyStartedAt = ref<string | null>(null)
const compositionEditUntil = ref<string | null>(null)
const canEditComposition = ref(true)
const isNextSetModalOpen = ref(false)
const isLoadingNextSetCatalog = ref(false)
const isSavingNextSet = ref(false)
const nextSetModalError = ref('')
const nextSetCatalog = ref<any[]>([])
const selectedNextToyIds = ref<number[]>([])
const currentBoxName = ref<string | null>(null)
const subscriptionChildName = ref('')
const subscriptionChildAge = ref('')
const currentSetStatusLabel = ref('')
const currentSetStatus = ref('')
const currentSetId = ref<number | null>(null)
const deliveryTaskId = ref<number | null>(null)
const currentDeliveryTaskStatus = ref('')
const deliveryAddress = ref('')
const toysInUse = ref(0)
const toysLimit = ref(0)
const toysMin = computed(() => {
  const positionCount = Array.isArray(nextSetPositions.value) ? nextSetPositions.value.length : 0
  if (positionCount > 0 && toysLimit.value > 0) {
    return Math.min(positionCount, toysLimit.value)
  }
  return toysLimit.value
})
const compositionEditUntilLabel = computed(() => {
  if (!compositionEditUntil.value) return ''
  try {
    return new Date(compositionEditUntil.value).toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return compositionEditUntil.value
  }
})
const activeCurrentSetToys = ref<any[]>([])
const isSubmitting = ref(false)
const isReplacingPosition = ref(false)
const buyoutLoadingToyId = ref<number | null>(null)
const nextSetModalScrollY = ref(0)
const nextSetModalScrollLocked = ref(false)

const showNextSetSection = computed(() => {
  return selectedIsManageable.value && !isSubscriptionPaused.value && !!nextSetId.value
})

const canEditNextSet = computed(() => {
  if (nextSetAssemblyStartedAt.value) return false
  if (toysLimit.value < 1) return false
  // Server computes deadline in app timezone — trust can_edit_composition.
  if (!canEditComposition.value) return false
  return nextSetStatus.value === 'assembling' || !nextSetId.value
})

const setStatusKeys: Record<string, string> = {
  assembling: 'subscription.setStatus.assembling',
  delivering: 'subscription.setStatus.delivering',
  in_use: 'subscription.setStatus.in_use',
  returning: 'subscription.setStatus.returning',
  returned: 'subscription.setStatus.returned',
  cancelled: 'subscription.setStatus.cancelled',
}

const labelForSetStatus = (status: string | undefined | null): string => {
  if (!status) return ''
  const key = setStatusKeys[status]
  return key ? t(key) : status
}

/** Clears UI fields for the selected subscription without touching the "has any active" cache. */
const clearSelectedSubscriptionView = () => {
  activeSubId.value = null
  isSubscriptionPaused.value = false
  pendingAction.value = null
  pendingPickup.value = false
  freezeEndDate.value = null
  freezeUsed.value = false
  maxFreezeDays.value = 7
  nextBillingDate.value = ''
  paidUntilLabel.value = ''
  canRenewSubscription.value = false
  renewalOverdue.value = false
  renewalAmount.value = null
  nextDeliveryDate.value = ''
  plannedExchangeDate.value = ''
  plannedExchangeSlotHuman.value = ''
  returnDueDate.value = ''
  confirmedDeliverySlot.value = ''
  setHistory.value = []
  exchangeQuota.value = null
  nextSetId.value = null
  nextSetStatus.value = ''
  nextSetToys.value = []
  nextSetPositions.value = []
  nextSetTitle.value = t('subscription.nextSet.titleDefault')
  nextSetBoxName.value = null
  nextSetAssemblyStartedAt.value = null
  compositionEditUntil.value = null
  canEditComposition.value = true
  currentBoxName.value = null
  subscriptionChildName.value = ''
  subscriptionChildAge.value = ''
  currentSetStatusLabel.value = ''
  currentSetStatus.value = ''
  currentSetId.value = null
  deliveryTaskId.value = null
  currentDeliveryTaskStatus.value = ''
  deliveryAddress.value = ''
  toysInUse.value = 0
  toysLimit.value = 0
  activeCurrentSetToys.value = []
  currentPlan.value = { name: '', price: '', features: [], isGift: false }
  activeSubscriptionPlanDeniedSlugs.value = []
  pendingPlanChange.value = null
  pendingSubscription.value = null
  pendingPaymentError.value = ''
}

const syncHasActiveCacheFromLists = () => {
  const anyManageable = manageableSubscriptions.value.length > 0
  hasActiveSubscription.value = anyManageable
  writeSubActiveCache(anyManageable)
  subscriptionResolved.value = true
}

const resetSubscriptionView = (opts?: { confirmed?: boolean }) => {
  clearSelectedSubscriptionView()
  manageableSubscriptions.value = []
  pendingSubscriptions.value = []
  switchableSubscriptions.value = []
  clearSelectedSubscriptionId()
  void syncSelectedSubscriptionQuery(null)
  showAllPlans.value = false
  hasActiveSubscription.value = false
  if (opts?.confirmed) {
    writeSubActiveCache(false)
    subscriptionResolved.value = true
  }
}

const applyActiveSubscription = async (active: any) => {
  subscriptionResolved.value = true
  activeSubId.value = active.id
  selectedSubscriptionId.value = active.id
  isSubscriptionPaused.value = active.status === 'paused'
  pendingAction.value = active.pending_action || null
  pendingPickup.value = !!active.pending_pickup || ['pause', 'cancel'].includes(active.pending_action)
  freezeEndDate.value = active.freeze_end || null
  freezeUsed.value = Boolean(active.freeze_used || active.freeze_used_at)
  maxFreezeDays.value = resolveMaxFreezeDays(active)

  subscriptionChildName.value = active.child?.name || ''
  subscriptionChildAge.value = active.child?.age_in_months
    ? t('subscription.plural.monthsShort', { n: active.child.age_in_months })
    : ''

  if (active.plan) {
    currentPlan.value.name = active.plan.name
    currentPlan.value.price = `${formatPrice(active.plan.price_monthly)} ₸`
    currentPlan.value.features = Array.isArray(active.plan.features) && active.plan.features.length > 0
      ? active.plan.features
      : [
          t('subscription.planFeatures.toysAtHome', { count: active.plan.toys_count }),
          t('subscription.planFeatures.exchanges', { count: active.plan.exchanges_count ?? 0 }),
          t('subscription.planFeatures.delivery'),
          t('subscription.planFeatures.disinfection'),
        ]
    currentPlan.value.isGift = !!active.is_gift
    activeSubscriptionPlanDeniedSlugs.value = Array.isArray(active.plan.denied_category_slugs)
      ? active.plan.denied_category_slugs
      : []
  } else if (active.subscription_plan_id) {
    if (!displayPlans.value.some(p => p.id === active.subscription_plan_id)) {
      await fetchPlans()
      if (!shouldApplyResponse(active.id, selectedSubscriptionId.value)) return
    }
    const matched = displayPlans.value.find(p => p.id === active.subscription_plan_id)
    if (matched) {
      currentPlan.value.name = matched.name
      currentPlan.value.price = `${formatPrice(matched.price_monthly)} ₸`
      currentPlan.value.features = matched.features
      currentPlan.value.isGift = !!active.is_gift
      activeSubscriptionPlanDeniedSlugs.value = Array.isArray(matched.denied_category_slugs)
        ? matched.denied_category_slugs
        : []
    } else {
      currentPlan.value.name = t('subscription.gift.giftPlanName')
      currentPlan.value.price = '0 ₸'
      currentPlan.value.features = [
        t('subscription.giftPlanFeatures.byAge'),
        t('subscription.giftPlanFeatures.delivery'),
        t('subscription.giftPlanFeatures.disinfection'),
        t('subscription.giftPlanFeatures.methodist'),
      ]
      currentPlan.value.isGift = true
      activeSubscriptionPlanDeniedSlugs.value = []
    }
  } else {
    currentPlan.value.name = t('subscription.gift.giftPlanName')
    currentPlan.value.price = '0 ₸'
    currentPlan.value.features = [
      t('subscription.giftPlanFeatures.byAge'),
      t('subscription.giftPlanFeatures.delivery'),
      t('subscription.giftPlanFeatures.disinfection'),
      t('subscription.giftPlanFeatures.methodist'),
    ]
    currentPlan.value.isGift = true
    activeSubscriptionPlanDeniedSlugs.value = []
  }

  // Plan capacity vs actual toys at home — never treat toys_limit as issued count.
  if (active.toys_limit != null) {
    toysLimit.value = Number(active.toys_limit) || 0
  } else if (active.plan?.toys_count != null) {
    toysLimit.value = (Number(active.plan.toys_count) || 0) + (Number(active.extra_toys_count) || 0)
  } else {
    toysLimit.value = Number(active.extra_toys_count) || 0
  }

  if (active.next_billing_date) {
    nextBillingDate.value = formatDateHuman(active.next_billing_date)
  } else if (active.expires_at) {
    nextBillingDate.value = formatDateHuman(active.expires_at)
  } else {
    nextBillingDate.value = ''
  }

  const paidUntilRaw = active.paid_until || active.expires_at || active.next_billing_date
  paidUntilLabel.value = paidUntilRaw ? formatDateHuman(paidUntilRaw) : nextBillingDate.value
  canRenewSubscription.value = !!active.can_renew
  renewalOverdue.value = !!active.renewal_overdue
  renewalAmount.value = active.renewal_amount != null ? Number(active.renewal_amount) : null
  const cycleRaw = String(active.billing_cycle || 'monthly')
  currentBillingCycle.value = (
    ['monthly', 'quarterly', 'semiannual', 'annual'].includes(cycleRaw)
      ? cycleRaw
      : 'monthly'
  ) as 'monthly' | 'quarterly' | 'semiannual' | 'annual'

  if (active.pending_plan && active.pending_plan_status) {
    pendingPlanChange.value = {
      name: active.pending_plan.name,
      effectiveOn: active.pending_plan_effective_on
        ? formatDateHuman(active.pending_plan_effective_on)
        : (paidUntilLabel.value || ''),
      status: active.pending_plan_status,
      renewalAmount: active.renewal_amount != null ? Number(active.renewal_amount) : null,
      requiresExchange: !!active.pending_plan_requires_exchange,
    }
  } else {
    pendingPlanChange.value = null
  }

  if (active.next_delivery_date) {
    nextDeliveryDate.value = formatDateHuman(active.next_delivery_date)
  } else {
    nextDeliveryDate.value = ''
  }

  // Never fall back to return_due_date / +60 auto as "дата обмена".
  plannedExchangeDate.value = active.planned_exchange_date
    || active.next_exchange_date
    || ''
  plannedExchangeSlotHuman.value = active.planned_exchange_slot?.human || ''
  returnDueDate.value = active.return_due_date
    || active.current_set?.return_due_date
    || ''
  confirmedDeliverySlot.value = active.confirmed_delivery_slot || ''

  exchangeQuota.value = active.exchange_quota || null
  compositionEditUntil.value = active.composition_edit_until || null
  canEditComposition.value = active.can_edit_composition !== false

  const historySets = Array.isArray(active.sets) ? active.sets : []
  setHistory.value = historySets
    .slice()
    .sort((a: any, b: any) => (b.id || 0) - (a.id || 0))
    .map((s: any) => ({
      id: s.id,
      title: s.title || s.box_template?.name || s.set_number || t('subscription.nextSet.setBundleTitle', { id: s.id }),
      status: s.status,
      status_label: labelForSetStatus(s.status),
      delivered_at: s.delivered_at || null,
      return_due_date: s.return_due_date || null,
      toys_count: Array.isArray(s.toys) ? s.toys.length : (Array.isArray(s.positions) ? s.positions.length : 0),
    }))

  const nextSet = active.next_set
  const rawCurrentSet = active.current_set
  // Never treat cancelled/returned/assembling as "toys at home", even if API leaked them.
  const currentSet = resolveHomeSet(rawCurrentSet)
  const firstCycle = !currentSet?.id && !!nextSet?.id

  if (nextSet?.id) {
    nextSetId.value = nextSet.id
    nextSetStatus.value = nextSet.status || 'assembling'
    nextSetToys.value = Array.isArray(nextSet.toys) ? nextSet.toys : []
    nextSetPositions.value = Array.isArray(nextSet.positions) ? nextSet.positions : []
    nextSetBoxName.value = nextSet.box_template?.name || null
    nextSetAssemblyStartedAt.value = nextSet.assembly_started_at || null
    nextSetTitle.value = nextSet.box_template?.name
      || nextSet.title
      || nextSet.set_number
      || (firstCycle ? t('subscription.nextSet.firstSet') : t('subscription.nextSet.titleDefault'))
  } else {
    nextSetId.value = null
    nextSetStatus.value = ''
    nextSetToys.value = []
    nextSetPositions.value = []
    nextSetBoxName.value = null
    nextSetAssemblyStartedAt.value = null
    nextSetTitle.value = t('subscription.nextSet.titleDefault')
  }

  if (currentSet?.status) {
    currentSetStatus.value = currentSet.status
    currentSetStatusLabel.value = labelForSetStatus(currentSet.status)
  } else {
    currentSetStatus.value = ''
    currentSetStatusLabel.value = ''
  }

  currentSetId.value = currentSet?.id ?? null
  currentBoxName.value = currentSet?.box_template?.name || null

  const trackSet = resolveTrackSet(currentSet, nextSet)
  deliveryTaskId.value = trackSet?.delivery_task?.id ?? null
  currentDeliveryTaskStatus.value = trackSet?.delivery_task?.status || ''
  deliveryAddress.value = trackSet?.delivery_task?.address || user.value?.address || ''

  if (currentSet?.toys && Array.isArray(currentSet.toys) && currentSet.toys.length) {
    activeCurrentSetToys.value = currentSet.toys
  } else if (currentSet?.positions && Array.isArray(currentSet.positions) && currentSet.positions.length) {
    activeCurrentSetToys.value = currentSet.positions.map((p: any) => ({
      id: p.selected_toy_id,
      name: p.toy_name_snapshot,
      title: p.toy_name_snapshot,
    }))
  } else {
    activeCurrentSetToys.value = []
  }

  toysInUse.value = resolveToysInUse(active.toys_at_home, currentSet)
}

const applyPendingSubscription = (pending: any) => {
  subscriptionResolved.value = true
  selectedSubscriptionId.value = pending.id
  activeSubId.value = null
  pendingSubscription.value = pending
  subscriptionChildName.value = pending.child?.name || ''
  subscriptionChildAge.value = pending.child?.age_in_months
    ? t('subscription.plural.monthsShort', { n: pending.child.age_in_months })
    : ''
}

const hydrateSubscriptionLists = (list: any[]) => {
  manageableSubscriptions.value = filterManageableSubscriptions(list)
  pendingSubscriptions.value = filterPendingSubscriptions(list)
  switchableSubscriptions.value = filterSwitchableSubscriptions(list)
  syncHasActiveCacheFromLists()
}

const findSwitchableById = (id: number | null) => {
  if (id == null) return null
  return switchableSubscriptions.value.find(sub => sub.id === id) || null
}

// Load user subscription if exists
const loadUserSubscription = async () => {
  if (!user.value) {
    resetSubscriptionView({ confirmed: true })
    clearSubActiveCache()
    subscriptionResolved.value = true
    isCheckingSubscription.value = false
    return
  }

  const loadGeneration = ++selectApplyGeneration
  isCheckingSubscription.value = true

  try {
    const res = await fetchMySubscriptions({ include_sets: true })
    if (loadGeneration !== selectApplyGeneration) return

    const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
    hydrateSubscriptionLists(list)

    const nextId = resolveSelectedSubscriptionId(list, preferredSelectedSubscriptionId())
    selectedSubscriptionId.value = nextId
    await syncSelectedSubscriptionQuery(nextId)

    if (nextId == null) {
      clearSelectedSubscriptionView()
      showAllPlans.value = false
      return
    }

    const selected = findSwitchableById(nextId)
    if (!selected) {
      clearSelectedSubscriptionView()
      clearSelectedSubscriptionId()
      await syncSelectedSubscriptionQuery(null)
      return
    }

    clearSelectedSubscriptionView()
    selectedSubscriptionId.value = nextId
    if (isPendingSubscriptionStatus(selected.status)) {
      applyPendingSubscription(selected)
    } else if (isManageableSubscriptionStatus(selected.status)) {
      await applyActiveSubscription(selected)
      if (loadGeneration !== selectApplyGeneration) return
      if (!shouldApplyResponse(nextId, selectedSubscriptionId.value)) return
    }
  } catch (e) {
    console.warn('Could not load user subscription:', e)
    const status = (e as any)?.status || (e as any)?.statusCode || (e as any)?.data?.statusCode
    // Invalid/expired token after reseed — drop stale "active" cache so tariffs can show.
    if (status === 401 || status === 403) {
      resetSubscriptionView({ confirmed: true })
      clearSubActiveCache()
    } else {
      // Keep optimistic cache on network errors — avoid flashing tariffs for subscribers
      subscriptionResolved.value = true
    }
  } finally {
    isCheckingSubscription.value = false
  }
}

const initSubscriptionPage = () => {
  // Prefer cached plans for instant paint; refresh in background.
  void fetchPlans({ force: !hasFreshPlans() })

  // Hydrate from cookie before fetch so subscribers never see tariffs first
  if (subActiveCookie.value === '1') {
    hasActiveSubscription.value = true
    subscriptionResolved.value = true
  } else if (subActiveCookie.value === '0') {
    hasActiveSubscription.value = false
    subscriptionResolved.value = true
  }

  const hasToken = hasAuthSession()
  if (!hasToken) {
    // Stale cookie after logout / db:seed must not leave a blank page.
    if (subActiveCookie.value === '1' || hasActiveSubscription.value) {
      hasActiveSubscription.value = false
      clearSubActiveCache()
    }
    subscriptionResolved.value = true
    return
  }

  // Check subscription in background — do not blank the page for known guests/subscribers.
  void (async () => {
    if (!isInitialized.value || !user.value) {
      await fetchUser()
    }
    if (user.value) {
      await loadUserSubscription()
    } else {
      resetSubscriptionView({ confirmed: true })
      clearSubActiveCache()
    }
  })()
}

const { fetchFaqs } = useFaq()
const { data: faqsData } = await useAsyncData(
  'faqs-subscription',
  () => fetchFaqs({ placement: 'subscription' }),
  { default: () => [] },
)

const faqs = computed(() => (faqsData.value ?? []).slice(0, 5))

const checkPendingGiftCode = async () => {
  const queryCode = (route.query.code || route.query.gift_code) as string | undefined
  let targetCode = queryCode ? queryCode.trim() : ''
  if (!targetCode && import.meta.client) {
    targetCode = sessionStorage.getItem('pending_gift_code') || ''
  }

  if (targetCode) {
    giftActivationCode.value = targetCode.toUpperCase()
    if (user.value) {
      await loadGiftChildren()
      isGiftCodeModalOpen.value = true
      if (import.meta.client) {
        sessionStorage.removeItem('pending_gift_code')
      }
    } else {
      if (import.meta.client) {
        sessionStorage.setItem('pending_gift_code', targetCode.toUpperCase())
      }
      openAuthModal('login')
    }
  }
}

const refreshSubscriptionFromServer = () => {
  if (user.value) {
    void loadUserSubscription()
  }
}

onMounted(() => {
  isSubscriptionViewReady.value = true
  void checkPendingGiftCode()
  initSubscriptionPage()
  window.addEventListener('pageshow', refreshSubscriptionFromServer)
})

onBeforeUnmount(() => {
  window.removeEventListener('pageshow', refreshSubscriptionFromServer)
  unlockNextSetModalScroll()
})

watch(
  () => route.query.code || route.query.gift_code,
  (newCode) => {
    if (newCode) {
      void checkPendingGiftCode()
    }
  }
)

watch(user, (newUser, oldUser) => {
  if (newUser?.id === oldUser?.id) return
  if (!newUser) {
    selectApplyGeneration += 1
    resetSubscriptionView({ confirmed: true })
    clearSubActiveCache()
    return
  }
  if (oldUser && newUser.id !== oldUser.id) {
    selectApplyGeneration += 1
    clearSelectedSubscriptionId()
    clearSelectedSubscriptionView()
    manageableSubscriptions.value = []
    pendingSubscriptions.value = []
    switchableSubscriptions.value = []
  }
  showAllPlans.value = false
  // Unknown until this fetch finishes — don't flash tariffs if cookie says active
  if (subActiveCookie.value !== '1') {
    subscriptionResolved.value = false
  }
  void loadUserSubscription()
  void checkPendingGiftCode()
})

const freezeEndDateFormatted = computed(() => {
  if (!freezeEndDate.value) return '—'
  return formatDateHuman(freezeEndDate.value)
})

const isSubModalOpen = ref(false)
const isChangingPlan = ref(false)
const selectedPlanName = ref('')
const selectedPlanPrice = ref(0)
const selectedPlanId = ref<number | null>(null)
const checkoutChildName = ref('')
const checkoutChildLastName = ref('')
const checkoutChildBirthDate = ref('')
const checkoutError = ref('')
const checkoutAddresses = ref<import('~/composables/useAddresses').UserAddress[]>([])
const selectedCheckoutAddressKey = ref<string>('new')
const isLoadingCheckoutAddresses = ref(false)
const checkoutAddressForm = ref({
  city: 'Алматы',
  street: '',
  apartment: '',
})

interface CheckoutChildOption {
  id: number
  name: string
  last_name?: string
  birth_date?: string
  age_in_months?: number
  hasActiveSubscription: boolean
}

const checkoutChildren = ref<CheckoutChildOption[]>([])
const selectedCheckoutChildId = ref<number | null>(null)
const checkoutChildMode = ref<'select' | 'create'>('create')
const isLoadingCheckoutChildren = ref(false)
const isActivatingSubscription = ref(false)
const subscriptionActionError = ref('')
const isCancelModalOpen = ref(false)
const isRequestingExchange = ref(false)

const isSubscriptionMutationBusy = computed(() =>
  isSubmitting.value
  || isRequestingExchange.value
  || isRenewingSubscription.value
  || isActivatingSubscription.value
  || isCancellingPending.value
  || isVerifyingPayment.value
  || isReplacingPosition.value
  || isSavingNextSet.value,
)

const planPrice = (plan: PlanViewItem | undefined) =>
  calcPlanPrice(plan, billingCycle.value, 0)

const planBilledTotal = (plan: PlanViewItem) =>
  calcBilledTotal(plan, billingCycle.value, 0)

const checkoutBilledTotal = computed(() => {
  const plan = displayPlans.value.find(p => p.id === selectedPlanId.value) || displayPlans.value[0]
  return plan ? planBilledTotal(plan) : selectedPlanPrice.value
})

const checkoutBillingCycleLabel = computed(() => {
  if (billingCycle.value === 'monthly') return t('subscription.billingCycle.monthly')
  if (billingCycle.value === 'quarterly') return t('subscription.billingCycle.quarterly')
  if (billingCycle.value === 'semiannual') return t('subscription.billingCycle.semiannual')
  return t('subscription.billingCycle.annual')
})

const handleSelectPlan = async (plan: PlanViewItem) => {
  if (!user.value) {
    openAuthModal('login')
    return
  }
  selectedPlanName.value = plan.name
  selectedPlanPrice.value = planPrice(plan)
  selectedPlanId.value = plan.id ?? null
  checkoutError.value = ''
  checkoutPhone.value = user.value.phone
    ? formatKazakhstanPhone(user.value.phone)
    : ''
  // Change-plan only when the *selected* subscription is manageable (not merely "any" active).
  isChangingPlan.value = selectedIsManageable.value && !!activeSubId.value
  isSubModalOpen.value = true
  if (!isChangingPlan.value) {
    await Promise.all([prepareCheckoutChildren(), prepareCheckoutAddresses()])
  }
  if (hasAnyManageableSubscription.value || hasAnyPendingSubscription.value) {
    showAllPlans.value = true
  }
}

const formatCheckoutChildAge = (child: CheckoutChildOption) => {
  const months = child.age_in_months
  if (!months) return t('subscription.dashboard.ageUnknown')
  if (months < 12) return t('subscription.plural.monthsShort', { n: months })
  const years = Math.floor(months / 12)
  const rest = months % 12
  if (rest === 0) {
    return years === 1
      ? t('subscription.ageFormat.yearsOne', { years })
      : t('subscription.ageFormat.yearsMany', { years })
  }
  return t('subscription.ageFormat.yearsAndMonths', { years, months: rest })
}

const formatCheckoutAddress = (addr: import('~/composables/useAddresses').UserAddress) => {
  if (addr.full_address) return addr.full_address
  return [addr.city, [addr.street, addr.building].filter(Boolean).join(' '), addr.apartment ? t('subscription.checkout.aptShort', { n: addr.apartment }) : '']
    .filter(Boolean)
    .join(', ')
}

const selectedCheckoutSavedAddress = computed(() => {
  if (selectedCheckoutAddressKey.value === 'new') return null
  const id = Number(selectedCheckoutAddressKey.value)
  if (!Number.isFinite(id)) return null
  return checkoutAddresses.value.find(a => a.id === id) || null
})

const prepareCheckoutAddresses = async () => {
  if (!user.value) return

  isLoadingCheckoutAddresses.value = true
  try {
    const list = await fetchAddresses()
    checkoutAddresses.value = list
    if (list.length) {
      const preferred = list.find(a => a.is_default) || list[0]
      selectedCheckoutAddressKey.value = String(preferred.id)
    } else {
      selectedCheckoutAddressKey.value = 'new'
      checkoutAddressForm.value = { city: 'Алматы', street: '', apartment: '' }
    }
  } catch {
    checkoutAddresses.value = []
    selectedCheckoutAddressKey.value = 'new'
  } finally {
    isLoadingCheckoutAddresses.value = false
  }
}

const buildCheckoutAddressPayload = () => {
  if (selectedCheckoutSavedAddress.value) {
    return { address_id: selectedCheckoutSavedAddress.value.id }
  }

  const city = checkoutAddressForm.value.city.trim()
  const street = checkoutAddressForm.value.street.trim()
  const apartment = checkoutAddressForm.value.apartment.trim()

  if (!city || !street) {
    throw new Error(t('subscription.validation.cityStreetRequired'))
  }
  if (!/\d/.test(street)) {
    throw new Error(t('subscription.validation.streetNumberRequired'))
  }

  return {
    city,
    street,
    apartment: apartment || undefined,
    address: [city, street, apartment ? t('subscription.checkout.aptShort', { n: apartment }) : ''].filter(Boolean).join(', '),
  }
}

const prepareCheckoutChildren = async () => {
  if (!user.value) return

  isLoadingCheckoutChildren.value = true
  checkoutError.value = ''

  try {
    const [childrenRes, subsRes] = await Promise.all([
      request<any>('/children'),
      request<any>('/subscriptions'),
    ])

    const children = Array.isArray(childrenRes?.data)
      ? childrenRes.data
      : (Array.isArray(childrenRes) ? childrenRes : [])

    const subscriptions = Array.isArray(subsRes?.data)
      ? subsRes.data
      : (Array.isArray(subsRes) ? subsRes : [])

    const busyChildIds = new Set<number>(
      subscriptions
        .filter((sub: any) => sub.status === 'active' || sub.status === 'paused')
        .map((sub: any) => sub.child?.id ?? sub.child_id)
        .filter(Boolean)
    )

    checkoutChildren.value = children.map((child: any) => ({
      id: child.id,
      name: child.name,
      last_name: child.last_name || '',
      birth_date: child.birth_date || '',
      age_in_months: child.age_in_months,
      hasActiveSubscription: busyChildIds.has(child.id),
    }))

    const eligible = checkoutChildren.value.filter(child => !child.hasActiveSubscription)

    if (eligible.length > 0) {
      checkoutChildMode.value = 'select'
      selectedCheckoutChildId.value = eligible[0].id
      checkoutChildName.value = eligible[0].name
      checkoutChildLastName.value = eligible[0].last_name || ''
      checkoutChildBirthDate.value = eligible[0].birth_date || ''
    } else {
      checkoutChildMode.value = 'create'
      selectedCheckoutChildId.value = null
      checkoutChildName.value = ''
      checkoutChildLastName.value = ''
      checkoutChildBirthDate.value = ''
    }
  } catch (e) {
    checkoutChildMode.value = 'create'
    checkoutChildren.value = []
    selectedCheckoutChildId.value = null
  } finally {
    isLoadingCheckoutChildren.value = false
  }
}

const selectCheckoutChild = (childId: number) => {
  const child = checkoutChildren.value.find(item => item.id === childId)
  if (!child || child.hasActiveSubscription) return

  selectedCheckoutChildId.value = childId
  checkoutChildName.value = child.name
  checkoutChildLastName.value = child.last_name || ''
  checkoutChildBirthDate.value = child.birth_date || ''
}

const switchToCreateChild = () => {
  checkoutChildMode.value = 'create'
  selectedCheckoutChildId.value = null
  checkoutChildName.value = ''
  checkoutChildLastName.value = ''
  checkoutChildBirthDate.value = ''
}

const switchToSelectChild = () => {
  const eligible = checkoutChildren.value.filter(child => !child.hasActiveSubscription)
  if (eligible.length === 0) return

  checkoutChildMode.value = 'select'
  selectedCheckoutChildId.value = eligible[0].id
  checkoutChildName.value = eligible[0].name
  checkoutChildLastName.value = eligible[0].last_name || ''
  checkoutChildBirthDate.value = eligible[0].birth_date || ''
}

const resolveCheckoutChildId = async (): Promise<number> => {
  if (checkoutChildMode.value === 'select' && selectedCheckoutChildId.value) {
    const selected = checkoutChildren.value.find(child => child.id === selectedCheckoutChildId.value)
    if (!selected) {
      throw new Error(t('subscription.validation.pickChild'))
    }
    if (selected.hasActiveSubscription) {
      throw new Error(t('subscription.validation.childHasSub'))
    }
    if (!selected.last_name) {
      const lastName = checkoutChildLastName.value.trim()
      if (!lastName) throw new Error(t('subscription.checkout.errLastName'))
      await request('/children/' + selected.id, { method: 'PUT', body: { last_name: lastName } })
      selected.last_name = lastName
    }
    return selectedCheckoutChildId.value
  }

  const childrenRes = await request<any>('/children')
  const children = Array.isArray(childrenRes?.data) ? childrenRes.data : (Array.isArray(childrenRes) ? childrenRes : [])

  const childName = checkoutChildName.value.trim()
  const childLastName = checkoutChildLastName.value.trim()
  if (!childName || !childLastName) {
    throw new Error(t('subscription.validation.childNamesRequired'))
  }

  const birthDateStr = checkoutChildBirthDate.value.trim()
  if (!birthDateStr) {
    throw new Error(t('subscription.validation.childBirthRequired'))
  }

  const birthDate = new Date(`${birthDateStr}T00:00:00`)
  if (Number.isNaN(birthDate.getTime())) {
    throw new Error(t('subscription.validation.childBirthInvalid'))
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (birthDate > today) {
    throw new Error(t('subscription.validation.childBirthFuture'))
  }

  const matchedChild = children.find((child: any) =>
    child.name?.trim().toLowerCase() === childName.toLowerCase()
    && child.last_name?.trim().toLowerCase() === childLastName.toLowerCase()
    && child.birth_date === birthDateStr
  )

  if (matchedChild?.id) {
    return matchedChild.id
  }

  const childRes = await request<any>('/children', {
    method: 'POST',
    body: {
      name: childName,
      last_name: childLastName,
      birth_date: birthDateStr,
    },
  })

  const childId = childRes?.data?.id ?? childRes?.id
  if (!childId) {
    throw new Error(t('subscription.validation.createChildFailed'))
  }

  return childId
}

const activateSubscription = async () => {
  if (!user.value) {
    openAuthModal('login')
    return
  }

  isActivatingSubscription.value = true
  checkoutError.value = ''

  try {
    if (isChangingPlan.value) {
      const requestSubId = activeSubId.value
      if (!requestSubId || !selectedPlanId.value) {
        throw new Error(t('subscription.validation.planChangeFailed'))
      }

      const changeRes = await changePlan(requestSubId, selectedPlanId.value)
      if (!shouldApplyResponse(requestSubId, selectedSubscriptionId.value)) return
      const effective = changeRes?.subscription?.pending_plan_effective_on
        || changeRes?.data?.subscription?.pending_plan_effective_on
      const effectiveLabel = effective ? formatDateHuman(effective) : (paidUntilLabel.value || nextBillingDate.value)
      toastSuccess(
        t('subscription.planChange.scheduledTitle'),
        effectiveLabel
          ? t('subscription.planChange.scheduledAfterPay', { date: effectiveLabel })
          : t('subscription.planChange.scheduledNextPeriod'),
      )
    } else {
      const phone = checkoutPhone.value.trim()
      if (!phone) {
        throw new Error(t('subscription.validation.phoneRequired'))
      }
      if (!user.value.phone || user.value.phone.replace(/\D/g, '') !== phone.replace(/\D/g, '')) {
        await updateUser({ phone })
      }

      const childId = await resolveCheckoutChildId()
      const addressPayload = buildCheckoutAddressPayload()
      await loadSubscriptionCities()
      const addressCity = selectedCheckoutSavedAddress.value?.city || checkoutAddressForm.value.city
      const matchedCity = subscriptionCities.value.find(city =>
        [city.name, city.name_i18n?.ru, city.slug].some(name =>
          String(name || '').trim().toLocaleLowerCase('ru') === addressCity.trim().toLocaleLowerCase('ru'),
        ),
      )
      if (!matchedCity) throw new Error('Выберите доступный город доставки для подписки')

      const created = await createSubscription({
        child_id: childId,
        city_id: matchedCity.id,
        subscription_plan_id: selectedPlanId.value ?? undefined,
        billing_cycle: billingCycle.value,
        extra_toys_count: 0,
        ...addressPayload,
      })

      const subId = created?.data?.id ?? created?.id
      if (!subId) {
        throw new Error(t('subscription.validation.createSubFailed'))
      }

      const payRes = await paySubscription(
        subId,
        'card',
        getOrCreateSubscriptionPayIdempotencyKey(subId),
      )
      const outcome = await handlePayResponse(payRes, {
        onRedirect: async () => {
          toastSuccess(t('subscription.pay.redirectTitle'), t('subscription.pay.redirectBody'))
          isSubModalOpen.value = false
        },
        onFulfilled: async () => {
          clearSubscriptionPayIdempotencyKey(subId)
          toastSuccess(t('subscription.pay.successTitle'), t('subscription.pay.successBody'))
          isSubModalOpen.value = false
          isChangingPlan.value = false
          showAllPlans.value = false
          isCheckingSubscription.value = true
          await loadUserSubscription()
        },
      })
      if (outcome !== 'fulfilled') {
        return
      }
      clearSubscriptionPayIdempotencyKey(subId)
      return
    }

    isSubModalOpen.value = false
    isChangingPlan.value = false
    showAllPlans.value = false
    isCheckingSubscription.value = true
    await loadUserSubscription()
  } catch (e: any) {
    checkoutError.value = e?.data?.message || e?.message || (isChangingPlan.value
      ? t('subscription.planChange.changeFailed')
      : t('subscription.planChange.checkoutFailed'))
  } finally {
    isActivatingSubscription.value = false
  }
}

const handleCancelPlanChange = async () => {
  const requestSubId = activeSubId.value
  if (!requestSubId) return
  subscriptionActionError.value = ''
  isSubmitting.value = true
  try {
    await cancelPlanChange(requestSubId)
    if (!shouldApplyResponse(requestSubId, selectedSubscriptionId.value)) return
    toastSuccess(t('subscription.planChange.cancelChangeSuccess'), t('subscription.planChange.cancelChangeBody'))
    await loadUserSubscription()
  } catch (e: any) {
    if (!shouldApplyResponse(requestSubId, selectedSubscriptionId.value)) return
    subscriptionActionError.value = e?.data?.message || e?.message || t('subscription.planChange.cancelChangeFailed')
  } finally {
    isSubmitting.value = false
  }
}

const payPendingSubscription = async () => {
  const requestSubId = pendingSubscription.value?.id
  if (!requestSubId) return
  isActivatingSubscription.value = true
  pendingPaymentError.value = ''
  try {
    const payRes = await paySubscription(
      requestSubId,
      'card',
      getOrCreateSubscriptionPayIdempotencyKey(requestSubId),
    )
    const outcome = await handlePayResponse(payRes, {
      onRedirect: async () => {
        toastSuccess(t('subscription.pay.redirectTitle'), t('subscription.pay.redirectBody'))
      },
      onFulfilled: async () => {
        clearSubscriptionPayIdempotencyKey(requestSubId)
        if (!shouldApplyResponse(requestSubId, selectedSubscriptionId.value)) return
        toastSuccess(t('subscription.pay.successTitle'), t('subscription.pay.successBody'))
        pendingSubscription.value = null
        isCheckingSubscription.value = true
        await loadUserSubscription()
      },
    })
    if (outcome !== 'fulfilled') {
      return
    }
    clearSubscriptionPayIdempotencyKey(requestSubId)
  } catch (e: any) {
    if (!shouldApplyResponse(requestSubId, selectedSubscriptionId.value)) return
    pendingPaymentError.value = e?.data?.message || e?.message || t('subscription.pay.pendingOpenFailed')
  } finally {
    isActivatingSubscription.value = false
  }
}

const cancelPendingSubscription = async () => {
  const requestSubId = pendingSubscription.value?.id
  if (!requestSubId) return
  const confirmed = confirm(t('subscription.pending.confirmCancel'))
  if (!confirmed) return
  isCancellingPending.value = true
  pendingPaymentError.value = ''
  try {
    await cancelPendingCheckout(requestSubId)
    if (!shouldApplyResponse(requestSubId, selectedSubscriptionId.value)) return
    toastSuccess(t('subscription.pending.cancelSuccessTitle'), t('subscription.pending.cancelSuccessBody'))
    pendingSubscription.value = null
    await loadUserSubscription()
  } catch (e: any) {
    if (!shouldApplyResponse(requestSubId, selectedSubscriptionId.value)) return
    pendingPaymentError.value = e?.data?.message || e?.message || t('subscription.pending.cancelFailed')
  } finally {
    isCancellingPending.value = false
  }
}

const openCancelModal = () => {
  subscriptionActionError.value = ''
  isCancelModalOpen.value = true
}

const submitCancelSubscription = async () => {
  const requestSubId = activeSubId.value
  if (!requestSubId) return

  isSubmitting.value = true
  subscriptionActionError.value = ''

  try {
    await cancelSubscription(requestSubId)
    if (!shouldApplyResponse(requestSubId, selectedSubscriptionId.value)) return
    isCancelModalOpen.value = false
    isCheckingSubscription.value = true
    await loadUserSubscription()
    toastSuccess(t('subscription.cancelSub.successTitle'), t('subscription.cancelSub.successBody'))
  } catch (e: any) {
    subscriptionActionError.value = e?.data?.message || e?.message || t('subscription.cancelSub.failed')
  } finally {
    isSubmitting.value = false
  }
}

const handleExchangeRequest = async () => {
  if (!activeSubId.value) return
  if (currentSetStatus.value === 'returning') return

  const requestSubId = activeSubId.value
  if (!requestSubId) return

  isRequestingExchange.value = true
  subscriptionActionError.value = ''

  try {
    const quota = exchangeQuota.value
    if (quota && !quota.can_request && !quota.can_purchase_extra) {
      subscriptionActionError.value = t('subscription.pay.exchangeQuotaExceeded')
      return
    }

    if (quota?.can_purchase_extra && !quota.can_request) {
      const payRes = await requestExchange(requestSubId, {
        purchase_extra: true,
        payment_method: 'card',
      })

      await handlePayResponse(payRes, {
        onFulfilled: async () => {
          if (!shouldApplyResponse(requestSubId, selectedSubscriptionId.value)) return
          currentSetStatus.value = 'returning'
          currentSetStatusLabel.value = labelForSetStatus('returning')
          toastSuccess(t('subscription.pay.paidTitle'), payRes.message || t('subscription.pay.extraExchangePaid'))
          isCheckingSubscription.value = true
          await loadUserSubscription()
        },
        onRedirect: async () => {
          toastSuccess(t('subscription.pay.exchangePayTitle'), t('subscription.pay.extraExchangeRedirect'))
        },
      })
      return
    }

    const res = await requestExchange(requestSubId)
    if (!shouldApplyResponse(requestSubId, selectedSubscriptionId.value)) return
    currentSetStatus.value = 'returning'
    currentSetStatusLabel.value = labelForSetStatus('returning')
    toastSuccess(t('subscription.pay.exchangeAcceptedTitle'), res.message || t('subscription.pay.exchangeAcceptedShort'))
    isCheckingSubscription.value = true
    await loadUserSubscription()
  } catch (e: any) {
    if (!shouldApplyResponse(requestSubId, selectedSubscriptionId.value)) return
    const msg = e?.data?.message || e?.message || t('subscription.pay.exchangeFailed')
    subscriptionActionError.value = msg
  } finally {
    isRequestingExchange.value = false
  }
}

// -------------------------------------------------------------
// REQUIREMENT 1: FREEZE OPTIONS MODAL LOGIC
// -------------------------------------------------------------
const isFreezeModalOpen = ref(false)
const isDeliveryFreezeConfirmOpen = ref(false)
const cancelActiveDeliveryOnFreeze = ref(false)
const freezeDays = ref(7)
const freezeReason = ref('vacation')
const freezeError = ref('')

const addLocalDaysYmd = (days: number) => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + days)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const showFreezeOptions = () => {
  freezeDays.value = Math.min(7, maxFreezeDays.value)
  freezeReason.value = 'vacation'
  freezeError.value = ''
  isFreezeModalOpen.value = true
}

const activeDeliveryFreezeMessage = computed(() => {
  if (nextSetStatus.value === 'delivering' || currentSetStatus.value === 'delivering') {
    return t('subscription.freeze.deliveryWithCourier')
  }

  return t('subscription.freeze.deliveryAssembling')
})

const openFreezeModal = () => {
  if (freezeUsed.value) {
    subscriptionActionError.value = t('subscription.freeze.alreadyUsed')
    return
  }

  cancelActiveDeliveryOnFreeze.value = false
  if (['assembling', 'delivering'].includes(nextSetStatus.value)) {
    isDeliveryFreezeConfirmOpen.value = true
    return
  }

  showFreezeOptions()
}

const continueFreezeAfterDeliveryCancel = () => {
  cancelActiveDeliveryOnFreeze.value = true
  isDeliveryFreezeConfirmOpen.value = false
  showFreezeOptions()
}

const computedFreezeDays = computed(() => {
  const days = Number(freezeDays.value) || 1
  return Math.min(Math.max(1, days), maxFreezeDays.value)
})

const midFreezeDaysLabel = computed(() => {
  const max = maxFreezeDays.value
  if (max <= 2) return ''
  return t('subscription.freeze.daysMax', { n: Math.round(max / 2) })
})

const freezeDaysLabel = computed(() => {
  const value = computedFreezeDays.value
  if (value % 10 === 1 && value % 100 !== 11) return t('subscription.plural.dayOne')
  if ([2, 3, 4].includes(value % 10) && ![12, 13, 14].includes(value % 100)) return t('subscription.plural.dayFew')
  return t('subscription.plural.dayMany')
})

const computedFreezeEndYmd = computed(() => addLocalDaysYmd(computedFreezeDays.value))

const computedFreezeEndFormatted = computed(() => {
  return formatDateHuman(computedFreezeEndYmd.value)
})

const computedShiftedBillingDate = computed(() => {
  return formatDateHuman(addLocalDaysYmd(30 + computedFreezeDays.value))
})

const isRescheduleModalOpen = ref(false)
const rescheduleDate = ref('')
const rescheduleSlot = ref('')
const rescheduleError = ref('')
const rescheduleConfirming = ref(false)
const isLoadingRescheduleOptions = ref(false)
const rescheduleOptions = ref<import('~/composables/useSubscriptions').ExchangeRescheduleOptions | null>(null)
const minRescheduleDate = ref(new Date(Date.now() + 86400000).toISOString().split('T')[0])

const rescheduleSlotsForDate = computed(() => {
  const options = rescheduleOptions.value
  if (!options) return []
  if (rescheduleDate.value && options.slots_by_date?.[rescheduleDate.value]) {
    return options.slots_by_date[rescheduleDate.value]
  }
  return options.slots || []
})

const rescheduleConfirmLabel = computed(() => {
  const slot = rescheduleSlotsForDate.value.find(item => item.key === rescheduleSlot.value)
  if (!rescheduleDate.value || !slot) return ''
  return `${formatDateHuman(rescheduleDate.value)}, ${slot.label}`
})

watch(rescheduleDate, (value) => {
  const daySlots = rescheduleOptions.value?.slots_by_date?.[value] || []
  if (!daySlots.some(slot => slot.key === rescheduleSlot.value && slot.available !== false)) {
    rescheduleSlot.value = daySlots.find(slot => slot.available !== false)?.key || ''
  }
})

const plannedExchangeDateFormatted = computed(() => {
  if (!plannedExchangeDate.value) return ''
  return formatDateHuman(plannedExchangeDate.value)
})

const returnDueDateFormatted = computed(() => {
  if (!returnDueDate.value) return ''
  return formatDateHuman(returnDueDate.value)
})

const confirmedDeliverySlotFormatted = computed(() => {
  if (!confirmedDeliverySlot.value) return ''
  const raw = confirmedDeliverySlot.value
  // Backend may send "Y-m-d H:i"
  const asDate = raw.includes(' ') ? raw.replace(' ', 'T') : raw
  const d = new Date(asDate)
  if (Number.isNaN(d.getTime())) return raw
  return formatDateHuman(d.toISOString().slice(0, 10)) + (raw.includes(' ') ? `, ${raw.split(' ')[1]}` : '')
})

const closeRescheduleModal = () => {
  isRescheduleModalOpen.value = false
  rescheduleConfirming.value = false
  rescheduleError.value = ''
}

const openRescheduleModal = async () => {
  rescheduleError.value = ''
  rescheduleConfirming.value = false
  rescheduleSlot.value = ''
  rescheduleOptions.value = null
  isRescheduleModalOpen.value = true
  if (!activeSubId.value) return
  isLoadingRescheduleOptions.value = true
  try {
    const res = await fetchExchangeRescheduleOptions(activeSubId.value)
    const data = (res as any)?.data || res
    rescheduleOptions.value = data
    rescheduleDate.value = data?.current?.date || data?.earliest_date || minRescheduleDate.value
    const daySlots = data?.slots_by_date?.[rescheduleDate.value] || data?.slots || []
    const firstAvailable = daySlots.find((slot: any) => slot.available !== false)
    rescheduleSlot.value = firstAvailable?.key || ''
  } catch (e: any) {
    rescheduleError.value = e?.data?.message || e?.message || t('subscription.reschedule.loadFailed')
  } finally {
    isLoadingRescheduleOptions.value = false
  }
}

const goRescheduleConfirm = () => {
  if (!rescheduleDate.value || !rescheduleSlot.value) return
  const slot = rescheduleSlotsForDate.value.find(item => item.key === rescheduleSlot.value)
  if (!slot || slot.available === false) {
    rescheduleError.value = t('subscription.reschedule.slotUnavailable')
    return
  }
  rescheduleError.value = ''
  rescheduleConfirming.value = true
}

const submitRescheduleExchange = async () => {
  if (!activeSubId.value || !rescheduleDate.value || !rescheduleSlot.value) return
  isSubmitting.value = true
  rescheduleError.value = ''
  try {
    const res = await rescheduleExchange(activeSubId.value, {
      date: rescheduleDate.value,
      slot: rescheduleSlot.value,
    })
    closeRescheduleModal()
    isCheckingSubscription.value = true
    await loadUserSubscription()
    const warnings = (res as any)?.recheck_warnings
    if (Array.isArray(warnings) && warnings.length) {
      toastError(t('subscription.reschedule.attention'), warnings.join(' '))
    } else {
      toastSuccess(t('subscription.reschedule.successTitle'), t('subscription.reschedule.successBody'))
    }
  } catch (e: any) {
    const errors = e?.data?.errors
    const firstError = errors ? Object.values(errors).flat()[0] : null
    rescheduleError.value = (firstError as string) || e?.data?.message || e?.message || t('subscription.reschedule.submitFailed')
    rescheduleConfirming.value = false
  } finally {
    isSubmitting.value = false
  }
}

const handleReplacePosition = async (payload: { positionId: number; toyId: number }) => {
  if (!nextSetId.value || !payload?.positionId || !payload?.toyId) return
  isReplacingPosition.value = true
  try {
    await replaceSetPosition(nextSetId.value, payload.positionId, payload.toyId)
    toastSuccess(t('subscription.pay.replaceSuccessTitle'), t('subscription.pay.replaceSuccessBody'))
    await loadUserSubscription()
  } catch (e: any) {
    toastError(t('subscription.pay.replaceFailedTitle'), e?.data?.message || e?.message || t('subscription.pay.replaceFailedBody'))
  } finally {
    isReplacingPosition.value = false
  }
}

const lockNextSetModalScroll = () => {
  if (!import.meta.client || nextSetModalScrollLocked.value) return
  nextSetModalScrollY.value = window.scrollY || window.pageYOffset || 0
  const body = document.body
  body.style.position = 'fixed'
  body.style.top = `-${nextSetModalScrollY.value}px`
  body.style.left = '0'
  body.style.right = '0'
  body.style.width = '100%'
  body.style.overflow = 'hidden'
  nextSetModalScrollLocked.value = true
}

const unlockNextSetModalScroll = () => {
  if (!import.meta.client || !nextSetModalScrollLocked.value) return
  const body = document.body
  const y = nextSetModalScrollY.value
  body.style.position = ''
  body.style.top = ''
  body.style.left = ''
  body.style.right = ''
  body.style.width = ''
  body.style.overflow = ''
  nextSetModalScrollLocked.value = false
  window.scrollTo(0, y)
}

const closeNextSetModal = () => {
  isNextSetModalOpen.value = false
}

watch(isNextSetModalOpen, (isOpen) => {
  if (!import.meta.client) return
  if (isOpen) {
    lockNextSetModalScroll()
    return
  }
  unlockNextSetModalScroll()
})

const openNextSetModal = async () => {
  if (!activeSubId.value || !canEditNextSet.value) return
  nextSetModalError.value = ''
  isNextSetModalOpen.value = true
  isLoadingNextSetCatalog.value = true

  try {
    const nextRes = await fetchNextSet(activeSubId.value)
    const set = (nextRes as any)?.data || nextRes
    if (set?.id) {
      nextSetId.value = set.id
      nextSetStatus.value = set.status || 'assembling'
      nextSetToys.value = Array.isArray(set.toys) ? set.toys : []
      nextSetPositions.value = Array.isArray(set.positions) ? set.positions : []
      nextSetBoxName.value = set.box_template?.name || null
      nextSetAssemblyStartedAt.value = set.assembly_started_at || null
      nextSetTitle.value = set.box_template?.name || set.title || set.set_number || t('subscription.nextSet.titleDefault')
      selectedNextToyIds.value = nextSetToys.value.map((t: any) => t.id).filter(Boolean)
    }

    if (set?.id && (set.assembly_started_at || set.status !== 'assembling')) {
      nextSetModalError.value = t('subscription.nextSet.assemblyStarted')
      return
    }

    if (!canEditComposition.value) {
      nextSetModalError.value = t('subscription.nextSet.editClosed')
      return
    }

    const catalogRes = await request<any>('/toys?catalog=subscription&stock_status=available&per_page=60')
    const list = Array.isArray(catalogRes?.data) ? catalogRes.data : (Array.isArray(catalogRes) ? catalogRes : [])
    const selectedToys = nextSetToys.value || []
    const deniedSlugs = new Set<string>(
      Array.isArray(activeSubscriptionPlanDeniedSlugs.value)
        ? activeSubscriptionPlanDeniedSlugs.value
        : [],
    )
    const categoryAliases: Record<string, string> = {
      party: 'large-format',
      costumes: 'role-play',
    }
    const toyBlockedByPlan = (toy: any) => {
      if (deniedSlugs.size === 0) return false
      const candidates = [
        toy?.category?.slug,
        toy?.category?.parent?.slug,
      ].filter(Boolean) as string[]
      for (const slug of candidates) {
        if (deniedSlugs.has(slug)) return true
        const alias = categoryAliases[slug]
        if (alias && deniedSlugs.has(alias)) return true
      }
      return false
    }
    const byId = new Map<number, any>()
    for (const toy of [...selectedToys, ...list]) {
      if (!toy?.id) continue
      // Keep already-selected toys visible even if plan later tightened; new picks are filtered.
      if (!selectedToys.some((t: any) => t.id === toy.id) && toyBlockedByPlan(toy)) continue
      byId.set(toy.id, toy)
    }
    nextSetCatalog.value = Array.from(byId.values())
  } catch (e: any) {
    nextSetModalError.value = e?.data?.message || e?.message || t('subscription.nextSet.loadFailed')
  } finally {
    isLoadingNextSetCatalog.value = false
  }
}

const toggleNextSetToy = (toyId: number) => {
  if (nextSetAssemblyStartedAt.value) return
  const idx = selectedNextToyIds.value.indexOf(toyId)
  if (idx >= 0) {
    selectedNextToyIds.value = selectedNextToyIds.value.filter(id => id !== toyId)
    return
  }
  if (toysLimit.value < 1 || selectedNextToyIds.value.length >= toysLimit.value) {
    toastError(t('subscription.nextSet.limitTitle'), t('subscription.nextSet.limitBody', { n: toysLimit.value }))
    return
  }
  selectedNextToyIds.value = [...selectedNextToyIds.value, toyId]
}

const submitNextSetToys = async () => {
  if (!nextSetId.value || selectedNextToyIds.value.length < toysMin.value) return
  if (nextSetAssemblyStartedAt.value || nextSetStatus.value !== 'assembling') {
    nextSetModalError.value = t('subscription.nextSet.assemblyLocked')
    return
  }
  if (!canEditComposition.value) {
    nextSetModalError.value = t('subscription.nextSet.editClosed')
    return
  }
  if (selectedNextToyIds.value.length > toysLimit.value) {
    nextSetModalError.value = t('subscription.nextSet.maxByPlan', { n: toysLimit.value })
    return
  }
  if (selectedNextToyIds.value.length < toysMin.value) {
    nextSetModalError.value = toysMin.value === toysLimit.value
      ? t('subscription.nextSet.exactRequired', { n: toysMin.value })
      : t('subscription.nextSet.minRequired', { min: toysMin.value, max: toysLimit.value })
    return
  }
  isSavingNextSet.value = true
  nextSetModalError.value = ''
  try {
    const saved = await modifySetToys(nextSetId.value, selectedNextToyIds.value)
    const set = (saved as any)?.data || saved
    nextSetToys.value = Array.isArray(set?.toys)
      ? set.toys
      : nextSetCatalog.value.filter(t => selectedNextToyIds.value.includes(t.id))
    nextSetPositions.value = Array.isArray(set?.positions) ? set.positions : []
    nextSetStatus.value = set?.status || 'assembling'
    nextSetAssemblyStartedAt.value = set?.assembly_started_at || null
    toastSuccess(t('subscription.nextSet.saveSuccessTitle'), t('subscription.nextSet.saveSuccessBody'))
    isNextSetModalOpen.value = false
    await loadUserSubscription()
  } catch (e: any) {
    nextSetModalError.value = e?.data?.message || e?.message || t('subscription.nextSet.saveFailed')
  } finally {
    isSavingNextSet.value = false
  }
}

const submitFreezeSubscription = async () => {
  const requestSubId = activeSubId.value
  isSubmitting.value = true
  freezeError.value = ''

  const endDateStr = computedFreezeEndYmd.value

  try {
    if (!requestSubId) {
      throw new Error(t('subscription.validation.activeSubNotFound'))
    }

    await request(`/subscriptions/${requestSubId}/pause`, {
      method: 'POST',
      body: {
        freeze_end: endDateStr,
        reason: freezeReason.value,
        cancel_active_delivery: cancelActiveDeliveryOnFreeze.value,
      },
    })

    if (!shouldApplyResponse(requestSubId, selectedSubscriptionId.value)) return
    isFreezeModalOpen.value = false
    cancelActiveDeliveryOnFreeze.value = false
    subscriptionActionError.value = ''
    isCheckingSubscription.value = true
    await loadUserSubscription()
    toastSuccess(t('subscription.freeze.successTitle'), t('subscription.freeze.successUntil', { date: computedFreezeEndFormatted.value }))
  } catch (e: any) {
    if (!shouldApplyResponse(requestSubId, selectedSubscriptionId.value)) return
    const activeDeliveryMsg = e?.data?.errors?.active_delivery?.[0]
    if (activeDeliveryMsg) {
      isFreezeModalOpen.value = false
      isDeliveryFreezeConfirmOpen.value = true
      return
    }

    const validationMsg = e?.data?.errors?.freeze_end?.[0] || e?.data?.errors?.subscription?.[0]
    freezeError.value = validationMsg || e?.data?.message || e?.message || t('subscription.freeze.failedDefault')
  } finally {
    isSubmitting.value = false
  }
}

const resumeSubscription = async () => {
  const requestSubId = activeSubId.value
  isSubmitting.value = true
  subscriptionActionError.value = ''

  try {
    if (!requestSubId) {
      throw new Error(t('subscription.validation.activeSubNotFound'))
    }

    await request(`/subscriptions/${requestSubId}/resume`, { method: 'POST' })
    if (!shouldApplyResponse(requestSubId, selectedSubscriptionId.value)) return
    isCheckingSubscription.value = true
    await loadUserSubscription()
    toastSuccess(t('subscription.resumeSub.successTitle'), t('subscription.resumeSub.successBody'))
  } catch (e: any) {
    if (!shouldApplyResponse(requestSubId, selectedSubscriptionId.value)) return
    subscriptionActionError.value = e?.data?.message || e?.message || t('subscription.resumeSub.failedDefault')
  } finally {
    isSubmitting.value = false
  }
}

const renewalAmountLabel = computed(() => {
  if (renewalAmount.value == null || Number.isNaN(renewalAmount.value)) return ''
  return `${formatPrice(renewalAmount.value)} ₸`
})

const loadRenewalQuote = async (subscriptionId: number, cycle: typeof renewBillingCycle.value) => {
  isLoadingRenewalQuote.value = true
  renewalQuoteError.value = ''
  try {
    const res = await fetchRenewalQuote(subscriptionId, cycle)
    selectedRenewalQuote.value = res?.data?.selected || null
    if (!selectedRenewalQuote.value) {
      renewalQuoteError.value = t('subscription.renew.quoteFailed')
    }
  } catch (e: any) {
    selectedRenewalQuote.value = null
    renewalQuoteError.value = e?.data?.message || e?.message || t('subscription.renew.quoteFailed')
  } finally {
    isLoadingRenewalQuote.value = false
  }
}

const selectRenewBillingCycle = async (cycle: typeof renewBillingCycle.value) => {
  if (renewBillingCycle.value === cycle && selectedRenewalQuote.value) return
  renewBillingCycle.value = cycle
  const requestSubId = activeSubId.value
  if (!requestSubId) return
  await loadRenewalQuote(requestSubId, cycle)
}

const closeRenewModal = () => {
  if (isRenewingSubscription.value) return
  isRenewModalOpen.value = false
  renewalQuoteError.value = ''
  subscriptionActionError.value = ''
}

const renewSubscription = async () => {
  const requestSubId = activeSubId.value
  if (!requestSubId || isRenewingSubscription.value) return
  subscriptionActionError.value = ''
  renewBillingCycle.value = currentBillingCycle.value
  selectedRenewalQuote.value = null
  isRenewModalOpen.value = true
  await loadRenewalQuote(requestSubId, renewBillingCycle.value)
}

const confirmRenewSubscription = async () => {
  const requestSubId = activeSubId.value
  if (!requestSubId || isRenewingSubscription.value || !selectedRenewalQuote.value) return
  isRenewingSubscription.value = true
  subscriptionActionError.value = ''

  try {
    const cycle = renewBillingCycle.value
    const idempotencyKey = getOrCreateSubscriptionPayIdempotencyKey(requestSubId, cycle)
    const payRes = await paySubscription(requestSubId, 'card', idempotencyKey, cycle)
    const outcome = await handlePayResponse(payRes, {
      onRedirect: async () => {
        toastSuccess(t('subscription.pay.redirectTitle'), t('subscription.renew.renewPayRedirectBody'))
      },
      onFulfilled: async () => {
        clearSubscriptionPayIdempotencyKey(requestSubId, cycle)
        isRenewModalOpen.value = false
        toastSuccess(t('subscription.renew.renewSuccessTitle'), t('subscription.renew.renewSuccessBody'))
        isCheckingSubscription.value = true
        await loadUserSubscription()
      },
    })
    if (outcome === 'fulfilled') {
      clearSubscriptionPayIdempotencyKey(requestSubId, cycle)
      isRenewModalOpen.value = false
      return
    }
  } catch (e: any) {
    subscriptionActionError.value = e?.data?.message || e?.message || t('subscription.renew.renewPayOpenFailed')
    toastError(t('subscription.renew.payErrorTitle'), subscriptionActionError.value)
  } finally {
    isRenewingSubscription.value = false
  }
}

// -------------------------------------------------------------
// PLAN TOYS PREVIEW (from admin-selected catalog toys)
// -------------------------------------------------------------
const isPreviewModalOpen = ref(false)
const selectedPreviewPlan = ref<PlanViewItem | null>(null)
const previewMode = ref<'plan' | 'set'>('plan')
const focusedPreviewBoxId = ref<number | null>(null)
const isPreviewToysLoading = ref(false)
const previewToysError = ref('')
/** Cache lazy-loaded preview toys by plan id (and nested by box). */
const planPreviewToysCache = ref<Record<number, {
  toys: any[]
  boxes: Record<number, any[]>
}>>({})

const previewPlanBoxes = computed(() => {
  const boxes = selectedPreviewPlan.value?.box_templates
  return Array.isArray(boxes) ? boxes : []
})

interface PreviewToy {
  id: number
  name: string
  age: string
  skill: string
  benefit: string
  desc: string
  image: string
  isBoughtOut?: boolean
  buyoutPrice?: number | null
}

const formatToyAgeRange = (minMonths?: number, maxMonths?: number) => {
  const min = minMonths ?? 0
  const max = maxMonths ?? 72
  const minYears = Math.floor(min / 12)
  const maxYears = Math.ceil(max / 12)

  if (minYears === 0 && maxYears <= 1) return t('subscription.ageFormat.monthsRange', { min, max })
  if (minYears === maxYears) {
    return minYears === 1
      ? t('subscription.ageFormat.yearsOne', { years: minYears })
      : t('subscription.ageFormat.yearsFew', { years: minYears })
  }
  return maxYears < 5
    ? t('subscription.ageFormat.yearsRangeFew', { min: minYears, max: maxYears })
    : t('subscription.ageFormat.yearsRangeMany', { min: minYears, max: maxYears })
}

const mapToyToPreview = (toy: any): PreviewToy => {
  const categoryLabel = toy.category?.name
    ? `${toy.category.icon ? `${toy.category.icon} ` : ''}${toy.category.name}`.trim()
    : t('subscription.preview.devCategoryFallback')

  const description = toy.description || t('subscription.preview.toyDescFallback')
  const benefit = description.split(/[.!?]/).map((part: string) => part.trim()).find(Boolean) || description

  return {
    id: toy.id,
    name: toy.name,
    age: formatToyAgeRange(toy.min_age_months, toy.max_age_months),
    skill: categoryLabel,
    benefit,
    desc: description,
    image: toy.image_url || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80',
  }
}

const getPlanToys = (plan: PlanViewItem | null | undefined): PreviewToy[] => {
  if (!plan || !Array.isArray(plan.toys) || plan.toys.length === 0) {
    return []
  }

  return plan.toys.map(mapToyToPreview)
}

const currentPlanExactToys = computed(() => {
  return getPlanToys(selectedPreviewPlan.value)
})

const currentSetPreviewToys = computed((): PreviewToy[] => {
  const source = activeCurrentSetToys.value.length
    ? activeCurrentSetToys.value
    : nextSetToys.value
  return source.map((toy: any) => ({
    ...mapToyToPreview(toy),
    isBoughtOut: !!toy.pivot?.is_bought_out,
    buyoutPrice: toy.pivot?.buyout_price ?? null,
  }))
})

const previewToys = computed(() => {
  return previewMode.value === 'set' ? currentSetPreviewToys.value : currentPlanExactToys.value
})

const canBuyoutToy = (toy: PreviewToy) => {
  if (toy.isBoughtOut) return false
  return currentSetStatus.value === 'in_use'
}

const applyPreviewToysToPlan = (plan: PlanViewItem, cacheEntry: {
  toys: any[]
  boxes: Record<number, any[]>
}): PlanViewItem => {
  const boxes = Array.isArray(plan.box_templates)
    ? plan.box_templates.map((box) => ({
        ...box,
        toys: cacheEntry.boxes[box.id] || box.toys || [],
      }))
    : []

  return {
    ...plan,
    toys: cacheEntry.toys,
    box_templates: boxes,
  }
}

const loadPreviewToysForPlan = async (plan: PlanViewItem): Promise<PlanViewItem> => {
  if (!plan.id) return plan

  const cached = planPreviewToysCache.value[plan.id]
  if (cached) {
    return applyPreviewToysToPlan(plan, cached)
  }

  const boxes = Array.isArray(plan.box_templates) ? plan.box_templates : []
  const boxToys: Record<number, any[]> = {}

  if (boxes.length > 0) {
    await Promise.all(boxes.map(async (box) => {
      boxToys[box.id] = await fetchAllPlanToys(plan.id!, { boxTemplateId: box.id })
    }))
  }

  const fallbackToys = boxes.length === 0
    ? await fetchAllPlanToys(plan.id)
    : (boxToys[boxes[0].id] || [])

  const entry = { toys: fallbackToys, boxes: boxToys }
  planPreviewToysCache.value = {
    ...planPreviewToysCache.value,
    [plan.id]: entry,
  }

  return applyPreviewToysToPlan(plan, entry)
}

const openPreviewToysModal = async (plan: PlanViewItem, boxId?: number) => {
  previewMode.value = 'plan'
  selectedPreviewPlan.value = plan
  focusedPreviewBoxId.value = boxId ?? null
  previewToysError.value = ''
  isPreviewModalOpen.value = true
  isPreviewToysLoading.value = true

  try {
    let basePlan = plan
    const hasBoxes = Array.isArray(plan.box_templates) && plan.box_templates.length > 0
    if (!hasBoxes && !plan.id) {
      await fetchPlans({ force: true })
      const refreshed = displayPlans.value.find(p => p.slug === plan.slug || p.id === plan.id)
      if (refreshed) basePlan = refreshed
    }

    selectedPreviewPlan.value = await loadPreviewToysForPlan(basePlan)
  } catch (e: any) {
    previewToysError.value = e?.data?.message || e?.message || t('subscription.preview.loadExamplesFailed')
  } finally {
    isPreviewToysLoading.value = false
  }

  if (boxId) {
    await nextTick()
    const el = document.querySelector(`.preview-box-block.focused`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const openCurrentSetToysModal = () => {
  previewMode.value = 'set'
  selectedPreviewPlan.value = null
  focusedPreviewBoxId.value = null
  isPreviewModalOpen.value = true
}

const closeManageModals = () => {
  isFreezeModalOpen.value = false
  isDeliveryFreezeConfirmOpen.value = false
  isCancelModalOpen.value = false
  isRescheduleModalOpen.value = false
  isSubModalOpen.value = false
  isGiftCodeModalOpen.value = false
  isPreviewModalOpen.value = false
  isNextSetModalOpen.value = false
  subscriptionActionError.value = ''
  pendingPaymentError.value = ''
  nextSetModalError.value = ''
  checkoutError.value = ''
  freezeError.value = ''
}

const selectSubscriptionById = async (subscriptionId: number) => {
  if (isSubscriptionMutationBusy.value || isCheckingSubscription.value) return
  if (selectedSubscriptionId.value === subscriptionId) {
    await syncSelectedSubscriptionQuery(subscriptionId)
    return
  }

  const target = findSwitchableById(subscriptionId)
  if (!target) return

  const generation = ++selectApplyGeneration
  closeManageModals()
  clearSelectedSubscriptionView()
  selectedSubscriptionId.value = subscriptionId
  await syncSelectedSubscriptionQuery(subscriptionId)

  if (isPendingSubscriptionStatus(target.status)) {
    applyPendingSubscription(target)
    return
  }

  await applyActiveSubscription(target)
  if (generation !== selectApplyGeneration) return
  if (!shouldApplyResponse(subscriptionId, selectedSubscriptionId.value)) return
}

watch(
  () => parseSubscriptionIdParam(route.query.subscription_id),
  (id) => {
    if (id == null) return
    if (id === selectedSubscriptionId.value) return
    if (!findSwitchableById(id)) return
    void selectSubscriptionById(id)
  },
)

const handleBuyoutToy = async (toy: PreviewToy) => {
  if (!currentSetId.value || !canBuyoutToy(toy)) return

  buyoutLoadingToyId.value = toy.id
  try {
    const preview = await calculateBuyout(currentSetId.value, toy.id)
    const priceLabel = formatPrice(preview.buyout_price)
    const confirmed = confirm(t('subscription.buyout.confirm', { name: preview.toy_name, price: priceLabel, discount: preview.discount_percent }))
    if (!confirmed) return

    const res = await executeBuyout(currentSetId.value, toy.id)
    await handlePayResponse(res, {
      onFulfilled: async (payRes) => {
        toastSuccess(t('subscription.buyout.successTitle'), payRes.message || t('subscription.buyout.successBody', { name: preview.toy_name }))
        const toyRef = activeCurrentSetToys.value.find((t: any) => t.id === toy.id)
        if (toyRef?.pivot) {
          toyRef.pivot.is_bought_out = true
          toyRef.pivot.buyout_price = preview.buyout_price
        }
      },
    })
  } catch (e: any) {
    toastError(t('subscription.buyout.failedTitle'), e?.data?.message || e?.message || t('subscription.buyout.failedBody'))
  } finally {
    buyoutLoadingToyId.value = null
  }
}

const handleSelectPlanFromPreview = () => {
  if (!selectedPreviewPlan.value) return
  isPreviewModalOpen.value = false
  handleSelectPlan(selectedPreviewPlan.value)
}

const formatDateHuman = (dateStr: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}
</script>

<style src="~/assets/css/subscription-page.css"></style>
