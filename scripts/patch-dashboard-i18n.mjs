import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const file = join(dirname(fileURLToPath(import.meta.url)), '..', 'components', 'subscription', 'SubscriptionActiveDashboard.vue')
let s = readFileSync(file, 'utf8')

const pairs = [
  ['>ЛИЧНЫЙ КАБИНЕТ<', ">{{ t('subscription.dashboard.badge') }}<"],
  ['>Управление подпиской<', ">{{ t('subscription.dashboard.title') }}<"],
  ["? 'Ваша подписка временно заморожена. Вы можете возобновить её в любой момент.' : 'Ваш текущий тариф активен. Управляйте наборами, доставкой и условиями.'", "? t('subscription.dashboard.subtitlePaused') : t('subscription.dashboard.subtitleActive')"],
  ['> Активировать сертификат', "> {{ t('subscription.dashboard.activateGift')"],
  ['>          Сменить или посмотреть все тарифы →', ">          {{ t('subscription.dashboard.viewPlans')"],
  ['> ЗАМОРОЖЕНА<', "> {{ t('subscription.dashboard.pausedBadge') }}<"],
  ['>АКТИВЕН<', ">{{ t('subscription.dashboard.activeBadge') }}<"],
  ['> Подарок<', "> {{ t('subscription.dashboard.giftBadge') }}<"],
  ['> Подарочная<', "> {{ t('subscription.dashboard.giftPrice') }}<"],
  ['>/ месяц<', ">{{ t('subscription.dashboard.perMonth') }}<"],
  ['>Курьер возвращает набор на склад<', ">{{ t('subscription.dashboard.returnToWarehouseTitle') }}<"],
  ['>Заморозка начнётся автоматически после приёмки набора на складе.<', ">{{ t('subscription.dashboard.returnToWarehouseBody') }}<"],
  ["pendingAction === 'pause' ? 'заморозкой' : 'отменой'", "pendingAction === 'pause' ? t('subscription.dashboard.pickupBeforePause') : t('subscription.dashboard.pickupBeforeCancel')"],
  ['to="/short-rent?from=subscription"', ':to="localePath(\'/short-rent?from=subscription\')"'],
  ['>Выбрать игрушку в аренду', ">{{ t('subscription.pricing.extraCta')"],
  ['>ИСТОРИЯ<', ">{{ t('subscription.dashboard.historyBadge') }}<"],
  ['>Выдачи и возвраты<', ">{{ t('subscription.dashboard.historyTitle') }}<"],
  ['>Предыдущие комплекты вашей подписки.<', ">{{ t('subscription.dashboard.historySubtitle') }}<"],
]

for (const [a, b] of pairs) {
  if (s.includes(a)) s = s.split(a).join(b)
  else console.warn('skip', a.slice(0, 55))
}

writeFileSync(file, s)
console.log('dashboard partial patch done')
