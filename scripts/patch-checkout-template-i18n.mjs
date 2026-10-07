import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const file = join(dirname(fileURLToPath(import.meta.url)), '..', 'components', 'subscription', 'SubscriptionCheckoutSheet.vue')
let s = readFileSync(file, 'utf8')

const map = [
  [':aria-label="step > 1 ? \'Назад к предыдущему шагу\' : \'Назад\'"', ':aria-label="step > 1 ? t(\'subscription.checkout.backPrevStep\') : t(\'subscription.back\')"'],
  ['← Назад', "{{ t('subscription.checkout.backStep') }}"],
  ['{{ step }} из 3', "{{ t('subscription.checkout.stepOf', { step }) }}"],
  ['aria-label="Закрыть оформление подписки"', ':aria-label="t(\'subscription.checkout.closeCheckout\')"'],
  ['aria-label="Выбранная подписка"', ':aria-label="t(\'subscription.checkout.selectedPlan\')"'],
  ['aria-label="Ребёнок"', ':aria-label="t(\'subscription.checkout.stepChild\')"'],
  ['>Для кого подписка<', ">{{ t('subscription.checkout.childHeading') }}<"],
  ['>Выберите профиль ребёнка или добавьте нового — возраст нужен для подбора игрушек.<', ">{{ t('subscription.checkout.childLead') }}<"],
  ['>Загружаем профили детей…<', ">{{ t('subscription.checkout.loadingChildren') }}<"],
  ['aria-label="Профиль ребёнка"', ':aria-label="t(\'subscription.checkout.childProfileAria\')"'],
  ['>Уже есть подписка<', ">{{ t('subscription.checkout.hasSubscription') }}<"],
  ['>                  + Добавить ребёнка', ">                  {{ t('subscription.checkout.addChild') }}"],
  ['>Фамилия ребёнка <', ">{{ t('subscription.checkout.lastName') }} <"],
  ['placeholder="Укажите фамилию ребёнка"', ':placeholder="t(\'subscription.checkout.lastNamePlaceholder\')"'],
  ['>                  ← Выбрать из списка детей', ">                  {{ t('subscription.checkout.pickFromList') }}"],
  ['>                  Профилей детей пока нет — создадим новый для подбора игрушек по возрасту.<', ">                  {{ t('subscription.checkout.noChildrenYet') }}<"],
  ['>Имя ребёнка <', ">{{ t('subscription.checkout.firstName') }} <"],
  ['placeholder="Например: Миша"', ':placeholder="t(\'subscription.checkout.firstNamePlaceholder\')"'],
  ['placeholder="Например: Смирнов"', ':placeholder="t(\'subscription.checkout.lastNameExample\')"'],
  ['>Дата рождения ребёнка <', ">{{ t('subscription.checkout.birthDate') }} <"],
  ['>Нужна методисту для подбора развивающих игрушек по возрасту.<', ">{{ t('subscription.checkout.birthHint') }}<"],
  ['aria-label="Доставка"', ':aria-label="t(\'subscription.checkout.stepDelivery\')"'],
  ['>Куда доставить<', ">{{ t('subscription.checkout.deliveryHeading') }}<"],
  ['>Выберите сохранённый адрес или укажите новый. Телефон курьера — ниже.<', ">{{ t('subscription.checkout.deliveryLead') }}<"],
  ['>Загружаем сохранённые адреса…<', ">{{ t('subscription.checkout.loadingAddresses') }}<"],
  ['aria-label="Адрес доставки"', ':aria-label="t(\'subscription.checkout.addressAria\')"'],
  ["|| 'Адрес'", "|| t('subscription.checkout.addressFallback')"],
  ['>Основной<', ">{{ t('subscription.checkout.primaryAddress') }}<"],
  ['>                      <strong>Другой адрес</strong>', ">                      <strong>{{ t('subscription.checkout.otherAddress') }}</strong>"],
  ['>                      <span>Указать новый адрес доставки</span>', ">                      <span>{{ t('subscription.checkout.otherAddressHint') }}</span>"],
  ['>Город <', ">{{ t('subscription.checkout.city') }} <"],
  ['>Улица, дом <', ">{{ t('subscription.checkout.street') }} <"],
  ['placeholder="пр. Абая, 150"', ':placeholder="t(\'subscription.checkout.streetPlaceholder\')"'],
  ['>Кв. / офис<', ">{{ t('subscription.checkout.apartment') }}<"],
  ['>                  Укажите город и улицу с номером дома — без адреса подписку оформить нельзя.<', ">                  {{ t('subscription.checkout.addressRequiredHint') }}<"],
  ['>Телефон для доставки <', ">{{ t('subscription.checkout.phone') }} <"],
  ['>Курьер свяжется по этому номеру.<', ">{{ t('subscription.checkout.phoneHint') }}<"],
  ['aria-label="Проверка и оплата"', ':aria-label="t(\'subscription.checkout.stepReview\')"'],
  ['>Проверьте заказ<', ">{{ t('subscription.checkout.reviewHeading') }}<"],
  ['>Если что-то не так — нажмите «Изменить» у нужного раздела.<', ">{{ t('subscription.checkout.reviewLead') }}<"],
  ['>                  <strong>Тариф и срок</strong>', ">                  <strong>{{ t('subscription.checkout.reviewPlan') }}</strong>"],
  ['>                  <strong>Ребёнок</strong>', ">                  <strong>{{ t('subscription.checkout.reviewChild') }}</strong>"],
  ['@click="goToStep(1)">Изменить</button>', '@click="goToStep(1)">{{ t(\'subscription.edit\') }}</button>'],
  ['>                  <strong>Доставка</strong>', ">                  <strong>{{ t('subscription.checkout.reviewDelivery') }}</strong>"],
  ['@click="goToStep(2)">Изменить</button>', '@click="goToStep(2)">{{ t(\'subscription.edit\') }}</button>'],
  ['aria-label="Способ оплаты"', ':aria-label="t(\'subscription.checkout.paymentAria\')"'],
  ['>                  <strong>Банковская карта · Halyk ePay</strong>', ">                  <strong>{{ t('subscription.checkout.cardEpay') }}</strong>"],
  ['>              <span>К оплате</span>', ">              <span>{{ t('subscription.checkout.toPay') }}</span>"],
]

for (const [a, b] of map) {
  if (!s.includes(a)) console.warn('skip', a.slice(0, 50))
  else s = s.split(a).join(b)
}

writeFileSync(file, s)
console.log('checkout template patched')
