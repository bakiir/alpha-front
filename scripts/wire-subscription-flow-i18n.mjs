import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function patch(fileRel, pairs) {
  const file = join(root, fileRel)
  let s = readFileSync(file, 'utf8')
  let n = 0
  for (const [from, to] of pairs) {
    if (!s.includes(from)) continue
    s = s.split(from).join(to)
    n++
  }
  writeFileSync(file, s, 'utf8')
  console.log(`${fileRel}: ${n} replacements`)
}

// --- subscription.vue template ---
patch('pages/subscription.vue', [
  ['<span>Срок заморозки начнётся только после отмены доставки или возврата набора на склад.</span>', '<span>{{ t(\'subscription.freeze.activeDeliveryBody\') }}</span>'],
  ['\n                Отменить доставку и продолжить\n', '\n                {{ t(\'subscription.freeze.cancelDeliveryContinue\') }}\n'],
  ['\n                Не замораживать\n', '\n                {{ t(\'subscription.freeze.dontFreeze\') }}\n'],
  ['<p class="delivery-freeze-footnote">Доставка отменится только после окончательного подтверждения заморозки.</p>', '<p class="delivery-freeze-footnote">{{ t(\'subscription.freeze.footnote\') }}</p>'],
  ['<h2 class="sub-modal-title">Заморозка подписки</h2>', '<h2 class="sub-modal-title">{{ t(\'subscription.freeze.modalTitle\') }}</h2>'],
  ['\n              Списания и новые доставки приостановятся, а оплаченные дни сохранятся. Если набор сейчас у вас, сначала оформим его возврат.\n            ', '\n              {{ t(\'subscription.freeze.modalLead\') }}\n            '],
  ['<label for="freeze-days" class="freeze-group-title">Срок заморозки</label>', '<label for="freeze-days" class="freeze-group-title">{{ t(\'subscription.freeze.durationLabel\') }}</label>'],
  ['aria-label="Количество дней заморозки"', ':aria-label="t(\'subscription.freeze.durationAria\')"'],
  ['<span>1 день</span>', '<span>{{ t(\'subscription.freeze.oneDay\') }}</span>'],
  ['<span>{{ maxFreezeDays }} дн.</span>', '<span>{{ t(\'subscription.freeze.daysMax\', { n: maxFreezeDays }) }}</span>'],
  ['<p class="freeze-limit-hint">Заморозку можно использовать один раз за подписку.</p>', '<p class="freeze-limit-hint">{{ t(\'subscription.freeze.onceHint\') }}</p>'],
  ['<label class="freeze-group-title">Причина (поможет нам стать лучше):</label>', '<label class="freeze-group-title">{{ t(\'subscription.freeze.reasonLabel\') }}</label>'],
  ['<option value="vacation">Отпуск / семейная поездка</option>', '<option value="vacation">{{ t(\'subscription.freeze.reasonVacation\') }}</option>'],
  ['<option value="sick">Ребёнок приболел</option>', '<option value="sick">{{ t(\'subscription.freeze.reasonSick\') }}</option>'],
  ['<option value="too_many_toys">Не успели наиграться с текущим набором</option>', '<option value="too_many_toys">{{ t(\'subscription.freeze.reasonTooManyToys\') }}</option>'],
  ['<option value="budget">Временная экономия бюджета</option>', '<option value="budget">{{ t(\'subscription.freeze.reasonBudget\') }}</option>'],
  ['<option value="other">Другая причина</option>', '<option value="other">{{ t(\'subscription.freeze.reasonOther\') }}</option>'],
  ['<span>Период заморозки:</span>', '<span>{{ t(\'subscription.freeze.periodUntil\') }}</span>'],
  ['<strong>до {{ computedFreezeEndFormatted }} ({{ computedFreezeDays }} дн.)</strong>', '<strong>{{ t(\'subscription.freeze.periodUntilValue\', { date: computedFreezeEndFormatted, days: computedFreezeDays }) }}</strong>'],
  ['<span>Следующее списание:</span>', '<span>{{ t(\'subscription.freeze.nextCharge\') }}</span>'],
  ['@click="isFreezeModalOpen = false">Отмена</button>', '@click="isFreezeModalOpen = false">{{ t(\'subscription.cancel\') }}</button>'],
  ['<span v-if="isSubmitting">Замораживаем...</span>', '<span v-if="isSubmitting">{{ t(\'subscription.freeze.freezing\') }}</span>'],
  ['<span v-else>Заморозить на {{ computedFreezeDays }} дн.</span>', '<span v-else>{{ t(\'subscription.freeze.freezeFor\', { days: computedFreezeDays }) }}</span>'],
  ['<h2 class="sub-modal-title">Перенос обмена</h2>', '<h2 class="sub-modal-title">{{ t(\'subscription.reschedule.title\') }}</h2>'],
  ['\n              Текущее окно:\n              <strong>{{ rescheduleOptions?.current?.human || plannedExchangeSlotHuman || plannedExchangeDateFormatted || \'не назначено\' }}</strong>\n            ', '\n              {{ t(\'subscription.reschedule.currentWindow\') }}\n              <strong>{{ rescheduleOptions?.current?.human || plannedExchangeSlotHuman || plannedExchangeDateFormatted || t(\'subscription.reschedule.notScheduled\') }}</strong>\n            '],
  ['<div v-if="isLoadingRescheduleOptions" class="reschedule-loading">Загружаем доступные интервалы...</div>', '<div v-if="isLoadingRescheduleOptions" class="reschedule-loading">{{ t(\'subscription.reschedule.loading\') }}</div>'],
  ["|| 'Самостоятельный перенос сейчас недоступен.'", '|| t(\'subscription.reschedule.blockedDefault\')'],
  ['\n                Связаться с оператором\n', '\n                {{ t(\'subscription.reschedule.contactOperator\') }}\n'],
  ['\n                Частый перенос обмена может привести к тому, что вы не успеете использовать все обмены, предусмотренные вашим тарифом в текущем расчётном периоде.\n              ', '\n                {{ t(\'subscription.reschedule.warning\') }}\n              '],
  ['<label>Новая дата обмена:</label>', '<label>{{ t(\'subscription.reschedule.newDate\') }}</label>'],
  ['<label>Интервал:</label>', '<label>{{ t(\'subscription.reschedule.slot\') }}</label>'],
  ['\n                    На эту дату нет свободных интервалов.\n                  ', '\n                    {{ t(\'subscription.reschedule.noSlots\') }}\n                  '],
  ['<p class="reschedule-confirm-note">Забор текущего комплекта и доставка следующего переносятся вместе. Дополнительный обмен не списывается.</p>', '<p class="reschedule-confirm-note">{{ t(\'subscription.reschedule.confirmNote\') }}</p>'],
  ["{{ rescheduleConfirming ? 'Назад' : 'Отмена' }}", "{{ rescheduleConfirming ? t('subscription.back') : t('subscription.cancel') }}"],
  ['<span v-if="isSubmitting">Сохраняем...</span>', '<span v-if="isSubmitting">{{ t(\'subscription.reschedule.saving\') }}</span>'],
  ['<span v-else-if="rescheduleConfirming">Подтвердить</span>', '<span v-else-if="rescheduleConfirming">{{ t(\'subscription.reschedule.confirm\') }}</span>'],
  ["{{ rescheduleOptions.current?.human ? 'Перенести обмен' : 'Назначить обмен' }}", "{{ rescheduleOptions.current?.human ? t('subscription.reschedule.moveExchange') : t('subscription.reschedule.assignExchange') }}"],
  ['<span class="preview-plan-badge">Следующий набор</span>', '<span class="preview-plan-badge">{{ t(\'subscription.nextSet.badge\') }}</span>'],
  ['<h2 id="next-set-modal-title" class="sub-modal-title">Изменить комплект</h2>', '<h2 id="next-set-modal-title" class="sub-modal-title">{{ t(\'subscription.nextSet.modalTitle\') }}</h2>'],
  ['@click="closeNextSetModal">Отмена</button>', '@click="closeNextSetModal">{{ t(\'subscription.cancel\') }}</button>'],
  ['<span v-if="isSavingNextSet">Сохраняем...</span>', '<span v-if="isSavingNextSet">{{ t(\'subscription.nextSet.saving\') }}</span>'],
  ['<span v-else>Сохранить комплект</span>', '<span v-else>{{ t(\'subscription.nextSet.saveSet\') }}</span>'],
  ['<span v-else class="preview-plan-badge">Ваш набор</span>', '<span v-else class="preview-plan-badge">{{ t(\'subscription.preview.yourSet\') }}</span>'],
  ['<h3 class="preview-boxes-heading">Примеры боксов</h3>', '<h3 class="preview-boxes-heading">{{ t(\'subscription.preview.examplesHeading\') }}</h3>'],
  ['<p>Загружаем примеры игрушек…</p>', '<p>{{ t(\'subscription.preview.loadingExamples\') }}</p>'],
  ['\n                  Попробовать снова\n', '\n                  {{ t(\'subscription.retry\') }}\n'],
  ['<p>Боксы для этого тарифа ещё не настроены в админ-панели.</p>', '<p>{{ t(\'subscription.preview.boxesNotConfigured\') }}</p>'],
  ["|| 'Игрушка' }}", "|| t('subscription.preview.toyFallback') }}"],
  ["|| 'Развивающая эко-игрушка из каталога Alpha.' }}", "|| t('subscription.preview.toyDescFallback') }}"],
  ['<p>В этом боксе пока нет игрушек.</p>', '<p>{{ t(\'subscription.preview.emptyBox\') }}</p>'],
  ['<p>Набор ещё комплектуется методистом. Игрушки появятся здесь после сборки.</p>', '<p>{{ t(\'subscription.preview.assemblingNote\') }}</p>'],
  ['<span class="footer-price-lbl">Стоимость тарифа:</span>', '<span class="footer-price-lbl">{{ t(\'subscription.preview.planCost\') }}</span>'],
  ['<h2 class="sub-modal-title">Смена тарифного плана</h2>', '<h2 class="sub-modal-title">{{ t(\'subscription.planChange.title\') }}</h2>'],
  ['\n              Новый тариф <strong>{{ selectedPlanName }}</strong>\n            ', '\n              {{ t(\'subscription.planChange.newPlan\', { name: selectedPlanName }) }}\n            '],
  ['<span>Стоимость следующего периода:</span>', '<span>{{ t(\'subscription.planChange.nextPeriodCost\') }}</span>'],
  ["|| 'даты следующего периода' }}", "|| t('subscription.planChange.effectiveFallback') }}"],
  ['\n              Тариф применится с {{ paidUntilLabel || nextBillingDate || t(\'subscription.planChange.effectiveFallback\') }}.\n              До этой даты действуют текущие лимиты. Доплата сейчас не списывается — сумма входит в следующее продление.\n            ', '\n              {{ t(\'subscription.planChange.effectiveFrom\', { date: paidUntilLabel || nextBillingDate || t(\'subscription.planChange.effectiveFallback\') }) }}\n              {{ t(\'subscription.planChange.limitsNote\') }}\n            '],
  ['<p class="epay-hint">Смена только планируется. Оплата нового тарифа — при продлении на следующий период.</p>', '<p class="epay-hint">{{ t(\'subscription.planChange.scheduleHint\') }}</p>'],
  ["{{ isActivatingSubscription ? 'Планируем смену...' : 'Запланировать смену тарифа' }}", "{{ isActivatingSubscription ? t('subscription.planChange.planning') : t('subscription.planChange.schedule') }}"],
  ['<h2 id="renew-modal-title" class="sub-modal-title">Продление подписки</h2>', '<h2 id="renew-modal-title" class="sub-modal-title">{{ t(\'subscription.renew.title\') }}</h2>'],
  ['\n              Выберите срок продления. Сумма и даты периода обновятся до переходу к оплате.\n            ', '\n              {{ t(\'subscription.renew.lead\') }}\n            '],
  ['\n                Период\n              ', '\n                {{ t(\'subscription.renew.period\') }}\n              '],
  ['<div v-if="isLoadingRenewalQuote" class="card-sub-info">Считаем стоимость…</div>', '<div v-if="isLoadingRenewalQuote" class="card-sub-info">{{ t(\'subscription.renew.calculating\') }}</div>'],
  ['<span>К оплате:</span>', '<span>{{ t(\'subscription.renew.toPay\') }}</span>'],
  ['@click="closeRenewModal">\n                Отмена\n              ', '@click="closeRenewModal">\n                {{ t(\'subscription.cancel\') }}\n              '],
  ["{{ isRenewingSubscription ? 'Открываем оплату...' : 'Перейти к оплате' }}", "{{ isRenewingSubscription ? t('subscription.renew.openingPay') : t('subscription.renew.goToPay') }}"],
  ['<h2 class="sub-modal-title">Отменить подписку?</h2>', '<h2 class="sub-modal-title">{{ t(\'subscription.cancelSub.title\') }}</h2>'],
  ['\n              После отмены автопродление будет отключено. Текущий набор останется у вас до завершения оплаченного периода.\n            ', '\n              {{ t(\'subscription.cancelSub.body\') }}\n            '],
  ['@click="isCancelModalOpen = false">Назад</button>', '@click="isCancelModalOpen = false">{{ t(\'subscription.back\') }}</button>'],
  ["{{ isSubmitting ? 'Отменяем...' : 'Да, отменить подписку' }}", "{{ isSubmitting ? t('subscription.cancelSub.cancelling') : t('subscription.cancelSub.confirm') }}"],
  ['<h2 class="sub-modal-title">Активация подарочной подписки</h2>', '<h2 class="sub-modal-title">{{ t(\'subscription.gift.modalTitle\') }}</h2>'],
  ['\n                Введите код GSUB и выберите ребёнка — подписка активируется без оплаты.\n              ', '\n                {{ t(\'subscription.gift.modalLead\') }}\n              '],
  ['<label>Код подарочной подписки <span class="req">*</span></label>', '<label>{{ t(\'subscription.gift.codeLabel\') }} <span class="req">*</span></label>'],
  ['placeholder="Например: GSUB-A8K3-72P9"', ':placeholder="t(\'subscription.gift.codePlaceholder\')"'],
  ['<label style="margin: 0;">Ребёнок <span class="req">*</span></label>', '<label style="margin: 0;">{{ t(\'subscription.gift.childLabel\') }} <span class="req">*</span></label>'],
  ['\n                    + Добавить другого ребёнка\n                  ', '\n                    {{ t(\'subscription.gift.addAnotherChild\') }}\n                  '],
  ['<option :value="null" disabled>Выберите ребёнка</option>', '<option :value="null" disabled>{{ t(\'subscription.gift.selectChild\') }}</option>'],
  ['<span class="checkout-section-label">Данные нового ребёнка</span>', '<span class="checkout-section-label">{{ t(\'subscription.gift.newChildSection\') }}</span>'],
  ['\n                    ← Выбрать из существующих\n                  ', '\n                    {{ t(\'subscription.gift.pickExisting\') }}\n                  '],
  ['<span v-else class="checkout-section-label" style="display: block; margin-bottom: 8px;">Данные ребёнка для подписки</span>', '<span v-else class="checkout-section-label" style="display: block; margin-bottom: 8px;">{{ t(\'subscription.gift.childDataSection\') }}</span>'],
  ['<label>Имя ребёнка <span class="req">*</span></label>', '<label>{{ t(\'subscription.gift.nameLabel\') }} <span class="req">*</span></label>'],
  ['placeholder="Например: Алихан"', ':placeholder="t(\'subscription.gift.namePlaceholder\')"'],
  ['<label>Дата рождения ребёнка <span class="req">*</span></label>', '<label>{{ t(\'subscription.gift.birthLabel\') }} <span class="req">*</span></label>'],
  ['<p class="checkout-child-hint" style="margin-top: 4px; font-size: 12px;">Нужна методисту для подбора развивающих игрушек по возрасту.</p>', '<p class="checkout-child-hint" style="margin-top: 4px; font-size: 12px;">{{ t(\'subscription.gift.birthHint\') }}</p>'],
  ['<label>Номер телефона для доставки <span class="req">*</span></label>', '<label>{{ t(\'subscription.gift.phoneLabel\') }} <span class="req">*</span></label>'],
  ["{{ isActivatingGift ? 'Проверка и активация...' : 'Активировать подписку бесплатно (0 ₸)' }}", "{{ isActivatingGift ? t('subscription.gift.activating') : t('subscription.gift.activateFree') }}"],
])

// Fix renew lead typo if not matched - use correct Russian string
patch('pages/subscription.vue', [
  ['\n              Выберите срок продления. Сумма и даты периода обновятся до перехода к оплате.\n            ', '\n              {{ t(\'subscription.renew.lead\') }}\n            '],
])

console.log('subscription.vue template pass done')
