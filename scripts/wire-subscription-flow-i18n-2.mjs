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
  console.log(`${fileRel}: ${n}`)
}

patch('pages/subscription.vue', [
  [`                <p v-if="rescheduleOptions.current?.human">
                  Перенести обмен с
                  <strong>{{ rescheduleOptions.current.human }}</strong>
                  на
                  <strong>{{ rescheduleConfirmLabel }}</strong>?
                </p>
                <p v-else>
                  Назначить обмен на
                  <strong>{{ rescheduleConfirmLabel }}</strong>?
                </p>`, `                <p v-if="rescheduleOptions.current?.human">
                  {{ t('subscription.reschedule.confirmMoveQuestion', { from: rescheduleOptions.current.human, to: rescheduleConfirmLabel }) }}
                </p>
                <p v-else>
                  {{ t('subscription.reschedule.confirmAssignQuestion', { date: rescheduleConfirmLabel }) }}
                </p>`],
  [`                  <template v-if="toysMin === toysLimit">
                    Выберите <strong>{{ toysLimit }}</strong> игрушек.
                  </template>
                  <template v-else>
                    Выберите от <strong>{{ toysMin }}</strong> до <strong>{{ toysLimit }}</strong> игрушек.
                  </template>
                  <template v-if="compositionEditUntilLabel">
                    Изменить состав можно до <strong>{{ compositionEditUntilLabel }}</strong>.
                  </template>
                  <template v-else>
                    Изменить состав можно только до <strong>00:00 в день обмена</strong>.
                  </template>`, `                  <template v-if="toysMin === toysLimit">
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
                  </template>`],
  ['                Выбрано {{ selectedNextToyIds.length }} / {{ toysLimit }}', "{{ t('subscription.nextSet.selected', { current: selectedNextToyIds.length, max: toysLimit }) }}"],
  ['<span v-if="toysMin !== toysLimit" class="next-set-min-hint">(мин. {{ toysMin }})</span>', '<span v-if="toysMin !== toysLimit" class="next-set-min-hint">{{ t(\'subscription.nextSet.minHint\', { min: toysMin }) }}</span>'],
  ['<AppIcon name="loader" :size="20" class="spin-icon" /> Загружаем каталог…', '<AppIcon name="loader" :size="20" class="spin-icon" /> {{ t(\'subscription.nextSet.loadingCatalog\') }}'],
  ['<span v-if="previewMode === \'plan\'" class="preview-plan-badge">Тариф {{ selectedPreviewPlan?.name }}</span>', '<span v-if="previewMode === \'plan\'" class="preview-plan-badge">{{ t(\'subscription.preview.planBadge\', { name: selectedPreviewPlan?.name }) }}</span>'],
  [`                <template v-if="previewMode === 'plan'">
                  Что входит в «{{ selectedPreviewPlan?.name }}»
                </template>
                <template v-else>
                  <template v-if="currentBoxName">Готовый комплект: {{ currentBoxName }}</template>
                  <template v-else>Игрушки в вашем текущем наборе</template>
                </template>`, `                <template v-if="previewMode === 'plan'">
                  {{ t('subscription.preview.includesPlan', { name: selectedPreviewPlan?.name }) }}
                </template>
                <template v-else>
                  <template v-if="currentBoxName">{{ t('subscription.preview.readyBox', { name: currentBoxName }) }}</template>
                  <template v-else>{{ t('subscription.preview.currentToys') }}</template>
                </template>`],
  [`                <template v-if="previewMode === 'plan'">
                  Преимущества тарифа и примеры готовых боксов. Дома одновременно —
                  {{ selectedPreviewPlan?.toys_count ?? '—' }} игрушек,
                  {{ selectedPreviewPlan?.exchanges_count ?? '—' }} обмен(а) в месяц.
                </template>
                <template v-else>
                  Состав вашего текущего готового комплекта:
                </template>`, `                <template v-if="previewMode === 'plan'">
                  {{ t('subscription.preview.planBenefits', { toys: selectedPreviewPlan?.toys_count ?? t('subscription.yesNo.dash'), exchanges: selectedPreviewPlan?.exchanges_count ?? t('subscription.yesNo.dash') }) }}
                </template>
                <template v-else>
                  {{ t('subscription.preview.currentComposition') }}
                </template>`],
  ['<span>{{ (box.toys?.length || box.toys_count || 0) }} игрушек</span>', '<span>{{ t(\'subscription.preview.toysInBox\', { n: (box.toys?.length || box.toys_count || 0) }) }}</span>'],
  ["{{ buyoutLoadingToyId === toy.id ? 'Оформляем...' : 'Выкупить со скидкой подписчика' }}", "{{ buyoutLoadingToyId === toy.id ? t('subscription.preview.buyoutProcessing') : t('subscription.preview.buyoutCta') }}"],
  ['<span v-else-if="toy.isBoughtOut" class="buyout-done-tag">✓ Выкуплена</span>', '<span v-else-if="toy.isBoughtOut" class="buyout-done-tag">{{ t(\'subscription.preview.buyoutDone\') }}</span>'],
  ['₸ / мес</strong>', "₸ {{ t('subscription.preview.perMonthShort') }}</strong>"],
  ["{{ user ? `Выбрать тариф ${selectedPreviewPlan?.name}` : 'Оформить подписку →' }}", "{{ user ? t('subscription.preview.selectPlan', { name: selectedPreviewPlan?.name }) : t('subscription.preview.checkoutCta') }}"],
  [`                  Скидка {{ selectedRenewalQuote.discount_percent }}%
                  (−{{ formatPrice(selectedRenewalQuote.discount_amount) }} ₸)`, "{{ t('subscription.renew.discountWithAmount', { percent: selectedRenewalQuote.discount_percent, amount: formatPrice(selectedRenewalQuote.discount_amount) }) }}"],
  [`                  Период: {{ formatDateHuman(selectedRenewalQuote.period_start) }}
                  — {{ formatDateHuman(selectedRenewalQuote.period_end) }}`, "{{ t('subscription.renew.periodRangeFull', { start: formatDateHuman(selectedRenewalQuote.period_start), end: formatDateHuman(selectedRenewalQuote.period_end) }) }}"],
])

const subScript = [
  ["giftActivationError.value = 'Пожалуйста, введите код GSUB!'", "giftActivationError.value = t('subscription.gift.enterCode')"],
  ["giftActivationError.value = 'Сейчас активируются только коды подарочной подписки (GSUB-…). Денежные сертификаты — отдельный сценарий.'", "giftActivationError.value = t('subscription.gift.gftOnly')"],
  ["giftActivationError.value = 'Пожалуйста, укажите имя ребёнка.'", "giftActivationError.value = t('subscription.gift.nameRequired')"],
  ["giftActivationError.value = 'Пожалуйста, укажите дату рождения ребёнка (нужна методисту для подбора развивающих игрушек).'", "giftActivationError.value = t('subscription.gift.birthRequired')"],
  ["giftActivationError.value = 'Выберите ребёнка из списка или укажите данные нового малыша.'", "giftActivationError.value = t('subscription.gift.pickOrCreate')"],
  ["giftActivationError.value = 'Укажите номер телефона — он нужен для доставки набора.'", "giftActivationError.value = t('subscription.gift.phoneRequired')"],
  ['giftActivationSuccess.value = `Подарочная подписка ${code} успешно активирована для малыша ${resolvedChildName}! Первый набор будет сформирован методистом и отправлен курьером.`', "giftActivationSuccess.value = t('subscription.gift.success', { code, name: resolvedChildName })"],
  ["|| 'Код не найден, уже использован или истёк.'", "|| t('subscription.gift.invalidCode')"],
  ["|| 'Тариф подписки'", "|| t('subscription.pending.planFallback')"],
  [`  const labels: Record<string, string> = {
    monthly: 'Ежемесячно (30 дней)',
    quarterly: '3 месяца (90 дней)',
    semiannual: '6 месяцев (180 дней)',
    annual: '12 месяцев (365 дней)',
  }
  return labels[cycle] || 'Ежемесячно'`, `  const labels: Record<string, string> = {
    monthly: t('subscription.billingCycle.monthlyPeriod'),
    quarterly: t('subscription.billingCycle.quarterlyPeriod'),
    semiannual: t('subscription.billingCycle.semiannualPeriod'),
    annual: t('subscription.billingCycle.annualPeriod'),
  }
  return labels[cycle] || t('subscription.billingCycle.monthly')`],
  [`const renewalCycleOptions = [
  { cycle: 'monthly' as const, label: '1 мес.' },
  { cycle: 'quarterly' as const, label: '3 мес.' },
  { cycle: 'semiannual' as const, label: '6 мес.' },
  { cycle: 'annual' as const, label: '12 мес.' },
]`, `const renewalCycleOptions = computed(() => [
  { cycle: 'monthly' as const, label: t('subscription.billingCycle.monthlyShort') },
  { cycle: 'quarterly' as const, label: t('subscription.billingCycle.quarterlyShort') },
  { cycle: 'semiannual' as const, label: t('subscription.billingCycle.semiannualShort') },
  { cycle: 'annual' as const, label: t('subscription.billingCycle.annualShort') },
])`],
  ["const nextSetTitle = ref('Следующий комплект')", "const nextSetTitle = ref('')"],
  ["nextSetTitle.value = 'Следующий комплект'", "nextSetTitle.value = t('subscription.nextSet.titleDefault')"],
  [`    ? \`\${active.child.age_in_months} мес\``, `    ? t('subscription.plural.monthsShort', { n: active.child.age_in_months })`],
  [`          \`\${active.plan.toys_count} развивающих игрушек дома одновременно\`,
          \`\${active.plan.exchanges_count ?? 0} бесплатный обмен набора в месяц\`,
          'Бесплатная курьерская доставка по Алматы',
          'Медицинская дезинфекция паром и озоном',`, `          t('subscription.planFeatures.toysAtHome', { count: active.plan.toys_count }),
          t('subscription.planFeatures.exchanges', { count: active.plan.exchanges_count ?? 0 }),
          t('subscription.planFeatures.delivery'),
          t('subscription.planFeatures.disinfection'),`],
  ["currentPlan.value.name = 'Подарочная подписка'", "currentPlan.value.name = t('subscription.gift.giftPlanName')"],
  [`        'Развивающие игрушки по возрасту ребёнка',
        'Бесплатная курьерская доставка по Алматы',
        'Медицинская дезинфекция паром и озоном',
        'Персональный подбор методистом',`, `        t('subscription.giftPlanFeatures.byAge'),
        t('subscription.giftPlanFeatures.delivery'),
        t('subscription.giftPlanFeatures.disinfection'),
        t('subscription.giftPlanFeatures.methodist'),`],
  [`      'Развивающие игрушки по возрасту ребёнка',
      'Бесплатная курьерская доставка по Алматы',
      'Медицинская дезинфекция паром и озоном',
      'Персональный подбор методистом',`, `      t('subscription.giftPlanFeatures.byAge'),
      t('subscription.giftPlanFeatures.delivery'),
      t('subscription.giftPlanFeatures.disinfection'),
      t('subscription.giftPlanFeatures.methodist'),`],
  ['|| `Комплект #${s.id}`', "|| t('subscription.nextSet.setBundleTitle', { id: s.id })"],
  ["|| (firstCycle ? 'Первый комплект' : 'Следующий комплект')", "|| (firstCycle ? t('subscription.nextSet.firstSet') : t('subscription.nextSet.titleDefault'))"],
  [`    ? \`\${pending.child.age_in_months} мес\``, `    ? t('subscription.plural.monthsShort', { n: pending.child.age_in_months })`],
  [`  if (billingCycle.value === 'monthly') return 'Ежемесячно'
  if (billingCycle.value === 'quarterly') return '3 месяца'
  if (billingCycle.value === 'semiannual') return '6 месяцев'
  return '12 месяцев'`, `  if (billingCycle.value === 'monthly') return t('subscription.billingCycle.monthly')
  if (billingCycle.value === 'quarterly') return t('subscription.billingCycle.quarterly')
  if (billingCycle.value === 'semiannual') return t('subscription.billingCycle.semiannual')
  return t('subscription.billingCycle.annual')`],
  ["if (!months) return 'Возраст не указан'", "if (!months) return t('subscription.dashboard.ageUnknown')"],
  ["if (months < 12) return `${months} мес`", "if (months < 12) return t('subscription.plural.monthsShort', { n: months })"],
  ["throw new Error('Укажите город и улицу с номером дома')", "throw new Error(t('subscription.validation.cityStreetRequired'))"],
  ["throw new Error('Укажите улицу с номером дома')", "throw new Error(t('subscription.validation.streetNumberRequired'))"],
  ["throw new Error('Выберите ребёнка из списка')", "throw new Error(t('subscription.validation.pickChild'))"],
  ["throw new Error('У этого ребёнка уже есть активная подписка')", "throw new Error(t('subscription.validation.childHasSub'))"],
  ["if (!lastName) throw new Error('Укажите фамилию ребёнка')", "if (!lastName) throw new Error(t('subscription.checkout.errLastName'))"],
  ["throw new Error('Укажите имя и фамилию ребёнка')", "throw new Error(t('subscription.validation.childNamesRequired'))"],
  ["throw new Error('Укажите дату рождения ребёнка')", "throw new Error(t('subscription.validation.childBirthRequired'))"],
  ["throw new Error('Укажите корректную дату рождения ребёнка')", "throw new Error(t('subscription.validation.childBirthInvalid'))"],
  ["throw new Error('Дата рождения не может быть в будущем')", "throw new Error(t('subscription.validation.childBirthFuture'))"],
  ["throw new Error('Не удалось создать профиль ребёнка')", "throw new Error(t('subscription.validation.createChildFailed'))"],
  ["throw new Error('Не удалось определить подписку или новый тариф')", "throw new Error(t('subscription.validation.planChangeFailed'))"],
  ["        'Смена запланирована',", "        t('subscription.planChange.scheduledTitle'),"],
  ["          ? `Новый тариф вступит в силу с ${effectiveLabel} после оплаты периода.`", "          ? t('subscription.planChange.scheduledAfterPay', { date: effectiveLabel })"],
  ["          : 'Новый тариф вступит в силу со следующего оплаченного периода.',", "          : t('subscription.planChange.scheduledNextPeriod'),"],
  ["        throw new Error('Укажите номер телефона для доставки')", "        throw new Error(t('subscription.validation.phoneRequired'))"],
  ["        throw new Error('Не удалось создать подписку')", "        throw new Error(t('subscription.validation.createSubFailed'))"],
  ["          toastSuccess('Переход к оплате', 'Сейчас откроется страница оплаты подписки.')", "          toastSuccess(t('subscription.pay.redirectTitle'), t('subscription.pay.redirectBody'))"],
  ["          toastSuccess('Подписка оформлена', 'Оплата прошла — набор скоро появится в кабинете.')", "          toastSuccess(t('subscription.pay.successTitle'), t('subscription.pay.successBody'))"],
  ["      ? 'Не удалось сменить тариф. Попробуйте ещё раз.'", "      ? t('subscription.planChange.changeFailed')"],
  ["      : 'Не удалось оформить подписку. Попробуйте ещё раз.')", "      : t('subscription.planChange.checkoutFailed'))"],
  ["    toastSuccess('Смена отменена', 'Запланированный переход на новый тариф отменён.')", "    toastSuccess(t('subscription.planChange.cancelChangeSuccess'), t('subscription.planChange.cancelChangeBody'))"],
  ["|| 'Не удалось отменить смену тарифа.'", "|| t('subscription.planChange.cancelChangeFailed')"],
  ["    pendingPaymentError.value = e?.data?.message || e?.message || 'Не удалось открыть оплату. Попробуйте ещё раз.'", "    pendingPaymentError.value = e?.data?.message || e?.message || t('subscription.pay.pendingOpenFailed')"],
  ["    toastSuccess('Заявка отменена', 'Вы можете выбрать другой тариф или оформить подписку позже.')", "    toastSuccess(t('subscription.pending.cancelSuccessTitle'), t('subscription.pending.cancelSuccessBody'))"],
  ["    pendingPaymentError.value = e?.data?.message || e?.message || 'Не удалось отменить заявку.'", "    pendingPaymentError.value = e?.data?.message || e?.message || t('subscription.pending.cancelFailed')"],
  ["    toastSuccess('Подписка отменена', 'Доступ сохранится до конца оплаченного периода.')", "    toastSuccess(t('subscription.cancelSub.successTitle'), t('subscription.cancelSub.successBody'))"],
  ["    subscriptionActionError.value = e?.data?.message || e?.message || 'Не удалось отменить подписку'", "    subscriptionActionError.value = e?.data?.message || e?.message || t('subscription.cancelSub.failed')"],
  ["      subscriptionActionError.value = 'Лимит обменов исчерпан для текущего периода.'", "      subscriptionActionError.value = t('subscription.pay.exchangeQuotaExceeded')"],
  ["          toastSuccess('Оплачено', payRes.message || 'Дополнительный обмен запрошен!')", "          toastSuccess(t('subscription.pay.paidTitle'), payRes.message || t('subscription.pay.extraExchangePaid'))"],
  ["          toastSuccess('Оплата', 'Сейчас откроется страница оплаты дополнительного обмена.')", "          toastSuccess(t('subscription.pay.exchangePayTitle'), t('subscription.pay.extraExchangeRedirect'))"],
  ["    toastSuccess('Запрос принят', res.message || 'Запрос на обмен принят!')", "    toastSuccess(t('subscription.pay.exchangeAcceptedTitle'), res.message || t('subscription.pay.exchangeAcceptedShort'))"],
  ["    const msg = e?.data?.message || e?.message || 'Не удалось отправить запрос на обмен'", "    const msg = e?.data?.message || e?.message || t('subscription.pay.exchangeFailed')"],
  ["    return 'Набор уже передан курьеру. Мы направим его обратно на склад, а затем включим заморозку.'", "    return t('subscription.freeze.deliveryWithCourier')"],
  ["  return 'Набор сейчас комплектуется. Мы отменим эту доставку и только после этого включим заморозку.'", "  return t('subscription.freeze.deliveryAssembling')"],
  ["    subscriptionActionError.value = 'Заморозка для этой подписки уже была использована.'", "    subscriptionActionError.value = t('subscription.freeze.alreadyUsed')"],
  ['  return `${Math.round(max / 2)} дн.`', "  return t('subscription.freeze.daysMax', { n: Math.round(max / 2) })"],
  [`  if (value % 10 === 1 && value % 100 !== 11) return 'день'
  if ([2, 3, 4].includes(value % 10) && ![12, 13, 14].includes(value % 100)) return 'дня'
  return 'дней'`, `  if (value % 10 === 1 && value % 100 !== 11) return t('subscription.plural.dayOne')
  if ([2, 3, 4].includes(value % 10) && ![12, 13, 14].includes(value % 100)) return t('subscription.plural.dayFew')
  return t('subscription.plural.dayMany')`],
  ["|| 'Не удалось загрузить интервалы'", "|| t('subscription.reschedule.loadFailed')"],
  ["    rescheduleError.value = 'Этот интервал уже недоступен, выберите другой.'", "    rescheduleError.value = t('subscription.reschedule.slotUnavailable')"],
  ["      toastError('Внимание', warnings.join(' '))", "      toastError(t('subscription.reschedule.attention'), warnings.join(' '))"],
  ["      toastSuccess('Обмен перенесён', 'Новая дата появилась в подписке. Дополнительный обмен не списан.')", "      toastSuccess(t('subscription.reschedule.successTitle'), t('subscription.reschedule.successBody'))"],
  ["|| 'Не удалось перенести обмен'", "|| t('subscription.reschedule.submitFailed')"],
  ["    toastSuccess('Игрушка заменена', 'Позиция в следующем наборе обновлена.')", "    toastSuccess(t('subscription.pay.replaceSuccessTitle'), t('subscription.pay.replaceSuccessBody'))"],
  ["    toastError('Не удалось заменить', e?.data?.message || e?.message || 'Не удалось заменить игрушку')", "    toastError(t('subscription.pay.replaceFailedTitle'), e?.data?.message || e?.message || t('subscription.pay.replaceFailedBody'))"],
  ["|| set.set_number || 'Следующий комплект'", "|| set.set_number || t('subscription.nextSet.titleDefault')"],
  ["      nextSetModalError.value = 'Сборка уже начата или набор недоступен для изменения.'", "      nextSetModalError.value = t('subscription.nextSet.assemblyStarted')"],
  ["      nextSetModalError.value = 'Срок изменения состава истёк — правки закрыты за сутки до обмена.'", "      nextSetModalError.value = t('subscription.nextSet.editClosed')"],
  ["|| 'Не удалось загрузить следующий набор'", "|| t('subscription.nextSet.loadFailed')"],
  ["    toastError('Лимит набора', `Можно выбрать не больше ${toysLimit.value} игрушек.`)", "    toastError(t('subscription.nextSet.limitTitle'), t('subscription.nextSet.limitBody', { n: toysLimit.value }))"],
  ["    nextSetModalError.value = 'Сборка уже начата — состав комплекта нельзя менять.'", "    nextSetModalError.value = t('subscription.nextSet.assemblyLocked')"],
  ["    nextSetModalError.value = `Можно выбрать не более ${toysLimit.value} игрушек по тарифу.`", "    nextSetModalError.value = t('subscription.nextSet.maxByPlan', { n: toysLimit.value })"],
  ["      ? `Нужно выбрать ровно ${toysMin.value} игрушек по тарифу.`", "      ? t('subscription.nextSet.exactRequired', { n: toysMin.value })"],
  ["      : `Нужно выбрать не менее ${toysMin.value} игрушек (лимит тарифа — ${toysLimit.value}).`", "      : t('subscription.nextSet.minRequired', { min: toysMin.value, max: toysLimit.value })"],
  ["    toastSuccess('Сохранено', 'Состав следующего набора обновлён')", "    toastSuccess(t('subscription.nextSet.saveSuccessTitle'), t('subscription.nextSet.saveSuccessBody'))"],
  ["|| 'Не удалось сохранить комплект'", "|| t('subscription.nextSet.saveFailed')"],
  ["      throw new Error('Активная подписка не найдена')", "      throw new Error(t('subscription.validation.activeSubNotFound'))"],
  ["    toastSuccess('Подписка заморожена', `Заморозка до ${computedFreezeEndFormatted.value}.`)", "    toastSuccess(t('subscription.freeze.successTitle'), t('subscription.freeze.successUntil', { date: computedFreezeEndFormatted.value }))"],
  ["|| 'Не удалось заморозить подписку. Попробуйте ещё раз.'", "|| t('subscription.freeze.failedDefault')"],
  ["    toastSuccess('Подписка возобновлена', 'Доставки и списания снова активны.')", "    toastSuccess(t('subscription.resumeSub.successTitle'), t('subscription.resumeSub.successBody'))"],
  ["    subscriptionActionError.value = e?.data?.message || e?.message || 'Не удалось возобновить подписку. Попробуйте ещё раз.'", "    subscriptionActionError.value = e?.data?.message || e?.message || t('subscription.resumeSub.failedDefault')"],
  ["      renewalQuoteError.value = 'Не удалось получить стоимость продления.'", "      renewalQuoteError.value = t('subscription.renew.quoteFailed')"],
  ["    renewalQuoteError.value = e?.data?.message || e?.message || 'Не удалось получить стоимость продления.'", "    renewalQuoteError.value = e?.data?.message || e?.message || t('subscription.renew.quoteFailed')"],
  ["        toastSuccess('Переход к оплате', 'Сейчас откроется страница оплаты продления.')", "        toastSuccess(t('subscription.pay.redirectTitle'), t('subscription.renew.renewPayRedirectBody'))"],
  ["        toastSuccess('Подписка продлена', 'Оплата прошла — срок действия обновлён.')", "        toastSuccess(t('subscription.renew.renewSuccessTitle'), t('subscription.renew.renewSuccessBody'))"],
  ["    subscriptionActionError.value = e?.data?.message || e?.message || 'Не удалось открыть оплату продления.'", "    subscriptionActionError.value = e?.data?.message || e?.message || t('subscription.renew.renewPayOpenFailed')"],
  ["    toastError('Ошибка оплаты', subscriptionActionError.value)", "    toastError(t('subscription.renew.payErrorTitle'), subscriptionActionError.value)"],
  [": 'Развивающая игрушка'", ": t('subscription.preview.devCategoryFallback')"],
  ["  const description = toy.description || 'Развивающая эко-игрушка из каталога Alpha.'", "  const description = toy.description || t('subscription.preview.toyDescFallback')"],
]

patch('pages/subscription.vue', subScript)

// init nextSetTitle after t is available - add onMounted init if empty
const subFile = join(root, 'pages/subscription.vue')
let sub = readFileSync(subFile, 'utf8')
if (!sub.includes('nextSetTitle.value = t(') && sub.includes("const nextSetTitle = ref('')")) {
  sub = sub.replace(
    'const isSubscriptionViewReady = ref(false)',
    `const isSubscriptionViewReady = ref(false)

watch(
  () => locale.value,
  () => {
    if (!nextSetTitle.value) nextSetTitle.value = t('subscription.nextSet.titleDefault')
  },
  { immediate: true },
)`,
  )
}
writeFileSync(subFile, sub)

patch('components/subscription/SubscriptionActiveDashboard.vue', [
  [`              <template v-if="pendingPlan.status === 'paid_waiting'">
                Оплачено: тариф «{{ pendingPlan.name }}» с {{ pendingPlan.effectiveOn }}
              </template>
              <template v-else-if="pendingPlan.status === 'payment_in_flight'">
                Оплата продления в процессе — смена на «{{ pendingPlan.name }}» временно зафиксирована
              </template>
              <template v-else>
                Смена тарифа с {{ pendingPlan.effectiveOn }}: «{{ pendingPlan.name }}»
              </template>`, `              <template v-if="pendingPlan.status === 'paid_waiting'">
                {{ t('subscription.dashboard.pendingPaid', { name: pendingPlan.name, date: pendingPlan.effectiveOn }) }}
              </template>
              <template v-else-if="pendingPlan.status === 'payment_in_flight'">
                {{ t('subscription.dashboard.pendingPaymentFlight', { name: pendingPlan.name }) }}
              </template>
              <template v-else>
                {{ t('subscription.dashboard.pendingScheduled', { date: pendingPlan.effectiveOn, name: pendingPlan.name }) }}
              </template>`],
  ['\n              К оплате в следующем периоде: {{ formatPendingAmount(pendingPlan.renewalAmount) }} ₸\n', '\n              {{ t(\'subscription.dashboard.nextPeriodPay\', { amount: formatPendingAmount(pendingPlan.renewalAmount) }) }}\n'],
  ['\n              После применения тарифа лишние игрушки нужно вернуть через обмен.\n', '\n              {{ t(\'subscription.dashboard.extraToysAfterChange\') }}\n'],
  ['\n              Отменить смену тарифа\n', '\n              {{ t(\'subscription.dashboard.cancelPlanChange\') }}\n'],
  ['\n            Изменить тарифный план\n', '\n            {{ t(\'subscription.dashboard.changePlan\') }}\n'],
  ["{{ isSubmitting ? 'Возобновляем...' : '▶ Разморозить подписку' }}", "{{ isSubmitting ? t('subscription.dashboard.resuming') : t('subscription.dashboard.resume') }}"],
  ['<span><strong>Заморозка использована</strong><small>Повторная заморозка недоступна</small></span>', '<span><strong>{{ t(\'subscription.dashboard.freezeUsedTitle\') }}</strong><small>{{ t(\'subscription.dashboard.freezeUsedHint\') }}</small></span>'],
  ["{{ pendingPickup && pendingAction === 'pause' ? 'Забор игрушек...' : 'Заморозить подписку' }}", "{{ pendingPickup && pendingAction === 'pause' ? t('subscription.dashboard.pickupInProgress') : t('subscription.dashboard.freeze') }}"],
  ["{{ pendingPickup && pendingAction === 'cancel' ? 'Ожидается возврат...' : 'Отменить подписку' }}", "{{ pendingPickup && pendingAction === 'cancel' ? t('subscription.dashboard.awaitingReturn') : t('subscription.dashboard.cancelSubscription') }}"],
  ["{{ isPaused ? 'Оплата на паузе' : (renewalOverdue ? 'Срок оплаты истёк' : 'Оплачено до') }}", "{{ isPaused ? t('subscription.dashboard.paymentPaused') : (renewalOverdue ? t('subscription.dashboard.paymentOverdue') : t('subscription.dashboard.paidUntil')) }}"],
  ["{{ plan.isGift ? 'подарочный период' : 'продление вручную' }}", "{{ plan.isGift ? t('subscription.dashboard.giftPeriod') : t('subscription.dashboard.manualRenewal') }}"],
  ['\n              Продлите подписку, чтобы сохранить доступ к набору.\n            ', '\n              {{ t(\'subscription.dashboard.renewHint\') }}\n            '],
  ["{{ isRenewing ? 'Открываем оплату...' : (plan.isGift ? 'Оформить продление' : 'Продлить подписку') }}", "{{ isRenewing ? t('subscription.dashboard.openingRenewPay') : (plan.isGift ? t('subscription.dashboard.renewGift') : t('subscription.dashboard.renew')) }}"],
  ["{{ isFirstSetCycle ? 'Первый комплект' : 'Игрушки дома' }}", "{{ isFirstSetCycle ? t('subscription.dashboard.firstSet') : t('subscription.dashboard.toysAtHome') }}"],
  ['<template v-else>Игрушки дома · {{ toysInUse }} из {{ toysLimit }}</template>', '<template v-else>{{ t(\'subscription.dashboard.toysAtHomeCount\', { used: toysInUse, limit: toysLimit }) }}</template>'],
  ['\n            Лимит тарифа: {{ toysLimit }} игрушек\n          ', '\n            {{ t(\'subscription.dashboard.planLimit\', { n: toysLimit }) }}\n          '],
  ['<p v-if="nextDeliveryDate" class="card-sub-info">Следующая доставка: {{ nextDeliveryDate }}</p>', '<p v-if="nextDeliveryDate" class="card-sub-info">{{ t(\'subscription.dashboard.nextDelivery\', { date: nextDeliveryDate }) }}</p>'],
  ['\n            Готовый комплект: {{ currentBoxName }}\n          ', '\n            {{ t(\'subscription.dashboard.readyBox\', { name: currentBoxName }) }}\n          '],
  ['<p v-if="setStatusLabel" class="card-sub-info">Статус набора: {{ setStatusLabel }}</p>', '<p v-if="setStatusLabel" class="card-sub-info">{{ t(\'subscription.dashboard.setStatus\', { status: setStatusLabel }) }}</p>'],
  ['aria-label="Открыть состав набора"', ':aria-label="t(\'subscription.dashboard.openCompositionAria\')"'],
  ["{{ isFirstSetCycle ? 'Состав первого комплекта ещё готовится.' : 'Состав набора пока пуст.' }}", "{{ isFirstSetCycle ? t('subscription.dashboard.firstSetPreparing') : t('subscription.dashboard.setEmpty') }}"],
  ['\n            Посмотреть состав · {{ formatToysCountLabel(compositionPreviewCount) }}\n          ', '\n            {{ t(\'subscription.dashboard.viewComposition\', { label: formatToysCountLabel(compositionPreviewCount) }) }}\n          '],
  ['\n              Посмотреть состав комплекта ({{ compositionPreviewCount }} шт.) →\n            ', '\n              {{ t(\'subscription.dashboard.viewFullComposition\', { n: compositionPreviewCount }) }}\n            '],
  ['>ДОСТАВКА<', ">{{ t('subscription.dashboard.deliveryBadge') }}<"],
  ['>Где мой набор?<', ">{{ t('subscription.dashboard.whereIsSet') }}<"],
  ['>Отслеживайте статус сборки и доставку курьером в реальном времени.<', ">{{ t('subscription.dashboard.deliverySubtitle') }}<"],
  ['\n          Полная страница отслеживания →\n', '\n          {{ t(\'subscription.dashboard.fullTracking\') }}\n'],
  ['>Ближайший обмен<', ">{{ t('subscription.dashboard.nextExchange') }}<"],
  ['>Плановая дата обмена<', ">{{ t('subscription.dashboard.plannedExchangeDate') }}<"],
  ["|| 'Дата обмена не выбрана' }}", "|| t('subscription.dashboard.exchangeNotPicked') }}"],
  ['>Подтверждённый интервал доставки<', ">{{ t('subscription.dashboard.confirmedDeliverySlot') }}<"],
  ['>Срок возврата текущего комплекта<', ">{{ t('subscription.dashboard.returnDue') }}<"],
  ['\n            Запрос на обмен принят — курьер заберёт текущий набор.\n          ', '\n            {{ t(\'subscription.dashboard.exchangeAccepted\') }}\n          '],
  ['\n              Использовано {{ exchangeQuota.used }} из {{ exchangeQuota.limit }}', '\n              {{ t(\'subscription.dashboard.quotaUsed\', { used: exchangeQuota.used, limit: exchangeQuota.limit }) }}'],
  ['<template v-if="exchangeQuota.remaining > 0"> · осталось {{ exchangeQuota.remaining }}</template>', '<template v-if="exchangeQuota.remaining > 0">{{ t(\'subscription.dashboard.quotaRemaining\', { n: exchangeQuota.remaining }) }}</template>'],
  ['\n                · доп. обмен {{ exchangeQuota.extra_exchange_price }} ₸\n              ', '\n                {{ t(\'subscription.dashboard.extraExchange\', { price: exchangeQuota.extra_exchange_price }) }}\n              '],
  ['<template v-if="exchangeQuota.planned"> · запланирован обмен</template>', '<template v-if="exchangeQuota.planned">{{ t(\'subscription.dashboard.exchangePlanned\') }}</template>'],
  ['\n              Период учёта: {{ exchangeQuota.period_start }} — {{ exchangeQuota.period_end }}\n            ', '\n              {{ t(\'subscription.dashboard.quotaPeriod\', { start: exchangeQuota.period_start, end: exchangeQuota.period_end }) }}\n            '],
  ["{{ plannedExchangeSlot || plannedExchangeDate ? 'Перенести обмен' : 'Выбрать дату обмена' }}", "{{ plannedExchangeSlot || plannedExchangeDate ? t('subscription.dashboard.rescheduleExchange') : t('subscription.dashboard.pickExchangeDate') }}"],
  ["{{ isFirstSetCycle ? 'ПЕРВЫЙ КОМПЛЕКТ' : 'СЛЕДУЮЩИЙ НАБОР' }}", "{{ isFirstSetCycle ? t('subscription.dashboard.firstSetBadge') : t('subscription.dashboard.nextSetBadge') }}"],
  ['<p v-if="nextSetBoxName" class="next-set-box-label">Готовый комплект: {{ nextSetBoxName }}</p>', '<p v-if="nextSetBoxName" class="next-set-box-label">{{ t(\'subscription.dashboard.readyBox\', { name: nextSetBoxName }) }}</p>'],
  ['<p v-if="isFirstSetCycle && nextSetStatus === \'delivering\'">Первый комплект уже в пути к вам.</p>', '<p v-if="isFirstSetCycle && nextSetStatus === \'delivering\'">{{ t(\'subscription.dashboard.firstSetOnWay\') }}</p>'],
  ['<p v-else-if="isFirstSetCycle">Первый комплект готовится на складе. Состав можно уточнить до начала сборки.</p>', '<p v-else-if="isFirstSetCycle">{{ t(\'subscription.dashboard.firstSetPreparingWarehouse\') }}</p>'],
  ['<p v-else-if="nextSetToys.length">В комплекте {{ nextSetToys.length }} игрушек. Можно изменить состав до 00:00 в день обмена.</p>', '<p v-else-if="nextSetToys.length">{{ t(\'subscription.dashboard.nextSetCount\', { n: nextSetToys.length }) }}</p>'],
  ['<p v-else>Мы подготовим комплект автоматически. Вы можете выбрать игрушки заранее (до 00:00 в день обмена).</p>', '<p v-else>{{ t(\'subscription.dashboard.nextSetAuto\') }}</p>'],
  ['\n            Изменить состав можно до {{ compositionEditUntilLabel }}.\n          ', '\n            {{ t(\'subscription.dashboard.editUntil\', { date: compositionEditUntilLabel }) }}\n          '],
  ['\n            Срок изменения состава истёк — правки закрыты за сутки до обмена.\n          ', '\n            {{ t(\'subscription.dashboard.editClosed\') }}\n          '],
  ['\n          Изменить комплект\n        ', '\n          {{ t(\'subscription.dashboard.editSet\') }}\n        '],
  ['<p class="next-set-replace-hint">Можно заменить игрушку в позиции (из списка разрешённых альтернатив):</p>', '<p class="next-set-replace-hint">{{ t(\'subscription.dashboard.replaceHint\') }}</p>'],
  ['<span v-if="position.materials_snapshot">Материалы: {{ position.materials_snapshot }}</span>', '<span v-if="position.materials_snapshot">{{ t(\'subscription.dashboard.materials\', { text: position.materials_snapshot }) }}</span>'],
  ["{{ alt.is_primary ? ' (основная)' : '' }}", "{{ alt.is_primary ? t('subscription.dashboard.primaryAlt') : '' }}"],
  ['aria-label="Открыть состав следующего комплекта"', ':aria-label="t(\'subscription.dashboard.openNextCompositionAria\')"'],
  ['<span v-if="item.delivered_at">Выдан: {{ item.delivered_at }}</span>', '<span v-if="item.delivered_at">{{ t(\'subscription.dashboard.historyIssued\', { date: item.delivered_at }) }}</span>'],
  ['<span v-if="item.return_due_date">Срок возврата: {{ item.return_due_date }}</span>', '<span v-if="item.return_due_date">{{ t(\'subscription.dashboard.historyReturnDue\', { date: item.return_due_date }) }}</span>'],
  ['<span v-if="item.toys_count">{{ item.toys_count }} игр.</span>', '<span v-if="item.toys_count">{{ t(\'subscription.dashboard.historyToysShort\', { n: item.toys_count }) }}</span>'],
  [`      ? 'Первый комплект в доставке'
      : 'Первый комплект готовится'`, `      ? t('subscription.dashboard.firstSetInDelivery')
      : t('subscription.dashboard.firstSetPreparingTitle')`],
  ['  return `${props.toysInUse} из ${props.toysLimit} игрушек дома`', "  return t('subscription.dashboard.toysAtHomePlain', { used: props.toysInUse, limit: props.toysLimit })"],
  [`  isFirstSetCycle.value ? 'Состав первого комплекта' : 'Состав следующего комплекта',`, `  isFirstSetCycle.value ? t('subscription.dashboard.compositionFirstTitle') : t('subscription.dashboard.compositionNextTitle'),`],
  ["  if (props.isRequestingExchange) return 'Отправляем...'", "  if (props.isRequestingExchange) return t('subscription.dashboard.exchangeSending')"],
  ["  if (props.setStatus === 'returning') return 'Обмен запрошен'", "  if (props.setStatus === 'returning') return t('subscription.dashboard.exchangeBtnRequested')"],
  ["    return price ? `Доп. обмен · ${price} ₸` : 'Дополнительный обмен'", "    return price ? t('subscription.dashboard.exchangeBtnExtra', { price }) : t('subscription.dashboard.exchangeExtraPlain')"],
  ["  return 'Запросить обмен'", "  return t('subscription.dashboard.exchangeBtnDefault')"],
])

patch('components/subscription/SubscriptionPricingShowcase.vue', [
  ['\n      ← Вернуться к управлению активной подпиской\n    ', '\n      {{ t(\'subscription.pricing.backDashboard\') }}\n    '],
  ['>ТАРИФНЫЕ ПЛАНЫ ALPHA<', ">{{ t('subscription.pricing.heroTag') }}<"],
  ['\n        Простая и гибкая подписка на развивающие эко-игрушки\n      ', '\n        {{ t(\'subscription.pricing.heroTitle\') }}\n      '],
  ['\n        Регулярный обмен наборов Монтессори без захламления квартиры. Бесплатная курьерская доставка, медицинская дезинфекция и персональный подбор методистом.\n      ', '\n        {{ t(\'subscription.pricing.heroSubtitle\') }}\n      '],
  ['aria-label="Срок подписки"', ':aria-label="t(\'subscription.billingCycle.aria\')"'],
  ['<p>Загружаем тарифные планы...</p>', '<p>{{ t(\'subscription.pricing.loadingPlans\') }}</p>'],
  ['<h3>Не удалось загрузить тарифы</h3>', '<h3>{{ t(\'subscription.pricing.loadErrorTitle\') }}</h3>'],
  ['\n        Попробовать снова\n      ', '\n        {{ t(\'subscription.retry\') }}\n      '],
  ['<h3>Тарифы пока не настроены</h3>', '<h3>{{ t(\'subscription.pricing.emptyTitle\') }}</h3>'],
  ['<p>Активные тарифные планы появятся здесь после добавления их в админ-панели.</p>', '<p>{{ t(\'subscription.pricing.emptyBody\') }}</p>'],
  ["|| 'САМЫЙ ПОПУЛЯРНЫЙ' }}", "|| t('subscription.pricing.popularRibbon') }}"],
  ["(pIdx === 0 ? 'Для старта' : plan.isFeatured ? 'Хит развития' : 'Максимальный набор')", "(pIdx === 0 ? t('subscription.pricing.tagStarter') : plan.isFeatured ? t('subscription.pricing.tagHit') : t('subscription.pricing.tagMax'))"],
  [' {{ toysCountLabel(plan.toys_count) }} дома одновременно', " {{ toysCountLabel(plan.toys_count) }} {{ t('subscription.pricing.toysAtHome') }}"],
  ['<span class="price-period">/ месяц</span>', '<span class="price-period">{{ t(\'subscription.billingCycle.perMonth\') }}</span>'],
  ['<span class="billed-note">Списание {{ formatPrice(planBilledTotal(plan)) }} ₸ за период</span>', '<span class="billed-note">{{ t(\'subscription.pricing.billedForPeriod\', { amount: formatPrice(planBilledTotal(plan)) }) }}</span>'],
  ['\n                Экономия {{ formatPrice(planPeriodSavings(plan)) }} ₸\n              ', '\n                {{ t(\'subscription.pricing.savings\', { amount: formatPrice(planPeriodSavings(plan)) }) }}\n              '],
  ['\n              Посмотреть примеры боксов →\n            ', '\n              {{ t(\'subscription.pricing.previewBoxes\') }}\n            '],
  [':aria-label="`${feat} — недоступно в тарифе ${plan.name}`"', ':aria-label="t(\'subscription.pricing.unavailableInPlan\', { feat, plan: plan.name })"'],
  ["{{ isLoggedIn ? `Выбрать тариф ${plan.name}` : 'Оформить подписку' }}", "{{ isLoggedIn ? t('subscription.pricing.selectPlanNamed', { name: plan.name }) : t('subscription.pricing.subscribe') }}"],
  ['>Тарифы<', ">{{ t('subscription.pricing.mobileTitle') }}<"],
  ['\n            Сравнить тарифы\n          ', '\n            {{ t(\'subscription.pricing.compare\') }}\n          '],
  ['aria-label="Выбор тарифа"', ':aria-label="t(\'subscription.pricing.pickPlanAria\')"'],
  [' {{ exchangesCountLabel(plan.exchanges_count) }} в месяц', " {{ exchangesCountLabel(plan.exchanges_count) }} {{ t('subscription.pricing.perMonthMeta') }}"],
  ['\n                Что входит →\n              ', '\n                {{ t(\'subscription.pricing.whatsIncluded\') }}\n              '],
  ['<h4>Хотите ещё больше игрушек?</h4>', '<h4>{{ t(\'subscription.pricing.extraTitle\') }}</h4>'],
  [`            В тарифе уже есть свой набор. Если нужно больше — оформите дополнительную игрушку
            как обычную аренду. Мы отправим её вместе с набором подписки.`, "{{ t('subscription.pricing.extraBody') }}"],
  ['\n        Выбрать игрушку в аренду\n      ', '\n        {{ t(\'subscription.pricing.extraCta\') }}\n      '],
  ['>Что входит в каждую подписку Alpha<', ">{{ t('subscription.pricing.inclusionsTitle') }}<"],
  ['>Часто задаваемые вопросы<', ">{{ t('subscription.pricing.faqTitle') }}<"],
  ['aria-label="Оформление выбранного тарифа"', ':aria-label="t(\'subscription.pricing.mobileCheckoutAria\')"'],
  ['\n            Выберите тариф\n          ', '\n            {{ t(\'subscription.pricing.pickPlan\') }}\n          '],
  ['\n              {{ formatPrice(selectedMonthlyPrice) }} ₸ / мес\n            ', '\n              {{ t(\'subscription.pricing.perMonthEquiv\', { amount: formatPrice(selectedMonthlyPrice) }) }}\n            '],
  ['\n        Продолжить\n      ', '\n        {{ t(\'subscription.continue\') }}\n      '],
  ['if (plan.badge && /популяр|хит/i.test(plan.badge)) return plan.badge', 'if (plan.badge && /popular|hit|популяр|хит/i.test(plan.badge)) return plan.badge'],
])

patch('components/subscription/SubscriptionCheckoutSheet.vue', [
  ['\n                  + Добавить ребёнка\n                ', '\n                  {{ t(\'subscription.checkout.addChild\') }}\n                '],
  ['\n                  ← Выбрать из списка детей\n                ', '\n                  {{ t(\'subscription.checkout.pickFromList\') }}\n                '],
  ['\n                  Профилей детей пока нет — создадим новый для подбора игрушек по возрасту.\n                ', '\n                  {{ t(\'subscription.checkout.noChildrenYet\') }}\n                '],
  ['<strong>Другой адрес</strong>', '<strong>{{ t(\'subscription.checkout.otherAddress\') }}</strong>'],
  ['<span>Указать новый адрес доставки</span>', '<span>{{ t(\'subscription.checkout.otherAddressHint\') }}</span>'],
  ['\n                  Укажите город и улицу с номером дома — без адреса подписку оформить нельзя.\n                ', '\n                  {{ t(\'subscription.checkout.addressRequiredHint\') }}\n                '],
  ['<strong>Тариф и срок</strong>', '<strong>{{ t(\'subscription.checkout.reviewPlan\') }}</strong>'],
  ['<strong>Ребёнок</strong>', '<strong>{{ t(\'subscription.checkout.reviewChild\') }}</strong>'],
  ['<strong>Доставка</strong>', '<strong>{{ t(\'subscription.checkout.reviewDelivery\') }}</strong>'],
  ['<strong>Банковская карта · Halyk ePay</strong>', '<strong>{{ t(\'subscription.checkout.cardEpay\') }}</strong>'],
  ['<span>К оплате</span>', '<span>{{ t(\'subscription.checkout.toPay\') }}</span>'],
  ["fieldErrors.childLastName = 'Укажите фамилию ребёнка'", "fieldErrors.childLastName = t('subscription.checkout.errLastName')"],
])

console.log('phase 2 done')
