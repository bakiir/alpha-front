import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const file = join(__dirname, '..', 'pages', 'subscription.vue')
let s = readFileSync(file, 'utf8')

const pairs = [
  ['subscriptionSwitcherStatusLabel', 'subscriptionSwitcherStatusKey'],
  ["title=\"Подписка временно недоступна\"", ":title=\"t('subscription.unavailableTitle')\""],
  ["description=\"Оформление новой подписки сейчас скрыто.\"", ":description=\"t('subscription.unavailableDesc')\""],
  ['> Загружаем подписку…<', "> {{ t('subscription.loading') }}<"],
  ['aria-label="Выбор подписки"', ":aria-label=\"t('subscription.switcherAria')\""],
  ["|| 'Ребёнок'", "|| t('subscription.childFallback')"],
  ['{{ subscriptionSwitcherStatusLabel(sub.status) }}', "{{ subscriptionSwitcherStatusKey(sub.status) ? t(subscriptionSwitcherStatusKey(sub.status)!) : sub.status }}"],
  ["{{ isVerifyingPayment ? 'Проверка платежа…' : 'Ожидает оплаты' }}", "{{ isVerifyingPayment ? t('subscription.pending.verifyingPayment') : t('subscription.pending.awaitingPayment') }}"],
  ['<h1 class="pending-sub-title">Подписка оформлена</h1>', '<h1 class="pending-sub-title">{{ t(\'subscription.pending.title\') }}</h1>'],
  ["? 'Проверяем подтверждение оплаты от банка, пожалуйста подождите…'", "? t('subscription.pending.verifyBody')"],
  [": 'Осталось оплатить подписку, чтобы наш склад начал сборку набора игрушек для вашего ребёнка.' }}", ": t('subscription.pending.payBody') }}"],
  ['<span class="detail-label">Ребёнок:</span>', '<span class="detail-label">{{ t(\'subscription.pending.child\') }}</span>'],
  ['<span class="detail-label">Тариф:</span>', '<span class="detail-label">{{ t(\'subscription.pending.plan\') }}</span>'],
  ['<span class="detail-label">Период:</span>', '<span class="detail-label">{{ t(\'subscription.pending.period\') }}</span>'],
  ['<span class="detail-label">К оплате:</span>', '<span class="detail-label">{{ t(\'subscription.pending.toPay\') }}</span>'],
  ["{{ isActivatingSubscription ? 'Открываем оплату…' : 'Оплатить подписку' }}", "{{ isActivatingSubscription ? t('subscription.pending.openingPay') : t('subscription.pending.payNow') }}"],
  ["{{ isCancellingPending ? 'Отмена…' : 'Отменить заявку' }}", "{{ isCancellingPending ? t('subscription.pending.cancelling') : t('subscription.pending.cancelApplication') }}"],
  ['>              Выбрать другой тариф\n', ">              {{ t('subscription.pending.chooseOtherPlan') }}\n"],
  ['aria-label="Закрыть"', ':aria-label="t(\'subscription.close\')"'],
  ['<h2 id="delivery-freeze-title" class="sub-modal-title">У вас есть активная доставка</h2>', '<h2 id="delivery-freeze-title" class="sub-modal-title">{{ t(\'subscription.freeze.activeDeliveryTitle\') }}</h2>'],
  ["confirm('Вы уверены, что хотите отменить оформление этой подписки?')", "confirm(t('subscription.pending.confirmCancel'))"],
]

for (const [from, to] of pairs) {
  if (!s.includes(from)) {
    console.warn('Missing:', from.slice(0, 60))
  } else {
    s = s.split(from).join(to)
  }
}

if (!s.includes('const { t') && s.includes('const route = useRoute()')) {
  s = s.replace(
    'const route = useRoute()\nconst config = useRuntimeConfig()',
    "const route = useRoute()\nconst { t, locale } = useI18n()\nconst localePath = useLocalePath()\nconst config = useRuntimeConfig()",
  )
}

if (s.includes("return `/delivery?task_id=")) {
  s = s.replace(
    /const deliveryTrackLink = computed\(\(\) => \{[\s\S]*?return '\/delivery'\n\}\)/,
    `const deliveryTrackLink = computed(() => {
  if (deliveryTaskId.value) return localePath(\`/delivery?task_id=\${deliveryTaskId.value}\`)
  if (trackedSetId.value) return localePath(\`/delivery?subscription_set_id=\${trackedSetId.value}\`)
  return localePath('/delivery')
})`,
  )
}

writeFileSync(file, s, 'utf8')
console.log('Patched subscription.vue (partial)')
