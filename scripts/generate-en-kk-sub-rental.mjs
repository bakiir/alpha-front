import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const fragDir = join(__dirname, 'i18n-fragments')

/** @param {Record<string, unknown>} obj @param {Map<string, string>} map */
function translateTree(obj, map) {
  /** @type {Record<string, unknown>} */
  const out = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      out[key] = translateTree(/** @type {Record<string, unknown>} */ (value), map)
    } else if (typeof value === 'string') {
      out[key] = map.get(value) ?? value
    } else {
      out[key] = value
    }
  }
  return out
}

const ru = JSON.parse(readFileSync(join(fragDir, 'subscription-rental.ru.json'), 'utf8'))

/** Russian source string → English */
const ruEn = new Map([
  ['Подписка временно недоступна', 'Subscription is temporarily unavailable'],
  ['Оформление новой подписки сейчас скрыто.', 'New subscription signup is currently hidden.'],
  ['Загружаем подписку…', 'Loading your subscription…'],
  ['Выбор подписки', 'Select subscription'],
  ['Ребёнок', 'Child'],
  ['Закрыть', 'Close'],
  ['Отмена', 'Cancel'],
  ['Назад', 'Back'],
  ['Сохранить', 'Save'],
  ['Попробовать снова', 'Try again'],
  ['Изменить', 'Edit'],
  ['Продолжить', 'Continue'],
  ['Да', 'Yes'],
  ['Нет', 'No'],
  ['—', '—'],
  ['Активна', 'Active'],
  ['Заморожена', 'Frozen'],
  ['Ожидает оплаты', 'Awaiting payment'],
  ['Просрочена', 'Overdue'],
  ['Приостановлена', 'Suspended'],
  ['Комплектуется на складе', 'Being assembled at the warehouse'],
  ['Передан курьеру', 'With courier'],
  ['У вас дома', 'At your home'],
  ['Ожидает возврата', 'Awaiting return'],
  ['Возвращён на склад', 'Returned to warehouse'],
  ['Отменён', 'Cancelled'],
  ['Ежемесячно', 'Monthly'],
  ['1 мес.', '1 mo'],
  ['Ежемесячно (30 дней)', 'Monthly (30 days)'],
  ['3 месяца', '3 months'],
  ['3 мес.', '3 mo'],
  ['3 месяца (90 дней)', '3 months (90 days)'],
  ['6 месяцев', '6 months'],
  ['6 мес.', '6 mo'],
  ['6 месяцев (180 дней)', '6 months (180 days)'],
  ['12 месяцев', '12 months'],
  ['12 мес.', '12 mo'],
  ['12 месяцев (365 дней)', '12 months (365 days)'],
  ['Скидка', 'Discount'],
  ['Больше выгоды', 'Better value'],
  ['Макс. выгода', 'Best value'],
  ['/ месяц', '/ month'],
  ['/ 3 мес', '/ 3 mo'],
  ['/ 6 мес', '/ 6 mo'],
  ['/ 12 мес', '/ 12 mo'],
  ['Срок подписки', 'Subscription term'],
  ['Проверка платежа…', 'Verifying payment…'],
  ['Подписка оформлена', 'Subscription created'],
  ['Проверяем подтверждение оплаты от банка, пожалуйста подождите…', 'We are confirming payment with the bank, please wait…'],
  ['Осталось оплатить подписку, чтобы наш склад начал сборку набора игрушек для вашего ребёнка.', 'Complete payment so our warehouse can start assembling your child’s toy set.'],
  ['Ребёнок:', 'Child:'],
  ['Тариф:', 'Plan:'],
  ['Период:', 'Period:'],
  ['К оплате:', 'Amount due:'],
  ['Открываем оплату…', 'Opening payment…'],
  ['Оплатить подписку', 'Pay for subscription'],
  ['Отмена…', 'Cancelling…'],
  ['Отменить заявку', 'Cancel application'],
  ['Выбрать другой тариф', 'Choose another plan'],
  ['Тариф подписки', 'Subscription plan'],
  ['Аренда временно недоступна', 'Rentals are temporarily unavailable'],
  ['Краткосрочная аренда сейчас скрыта. Посмотрите магазин или подписку — если эти разделы открыты.', 'Short-term rental is hidden for now. Try the shop or subscription if those sections are open.'],
  ['РАЗОВАЯ АРЕНДА', 'ONE-TIME RENTAL'],
  ['Аренда специальных товаров', 'Special item rentals'],
  ['Все товары', 'All products'],
  ['Забронировать', 'Book'],
  ['/ сутки', '/ day'],
  ['Итого:', 'Total:'],
  ['Войти в аккаунт →', 'Sign in →'],
  ['Проверка доступности...', 'Checking availability…'],
  ['Обработка платежа...', 'Processing payment…'],
  ['Оплата принята', 'Payment accepted'],
  ['Аренда оплачена', 'Rental paid'],
  ['Состав вашего набора', 'Your set contents'],
  ['Загружаем состав набора…', 'Loading set contents…'],
  ['Состав ещё не сформирован. Игрушки появятся здесь после сборки.', 'Contents are not ready yet. Toys will appear here after assembly.'],
])

/** Russian source string → Kazakh */
const ruKk = new Map([
  ['Подписка временно недоступна', 'Жазылым уақытша қолжетімсіз'],
  ['Оформление новой подписки сейчас скрыто.', 'Жаңа жазылымды рәсімдеу қазір жабық.'],
  ['Загружаем подписку…', 'Жазылым жүктелуде…'],
  ['Выбор подписки', 'Жазылым таңдау'],
  ['Ребёнок', 'Бала'],
  ['Закрыть', 'Жабу'],
  ['Отмена', 'Болдырмау'],
  ['Назад', 'Артқа'],
  ['Сохранить', 'Сақтау'],
  ['Попробовать снова', 'Қайта көру'],
  ['Изменить', 'Өзгерту'],
  ['Продолжить', 'Жалғастыру'],
  ['Да', 'Иә'],
  ['Нет', 'Жоқ'],
  ['—', '—'],
  ['Активна', 'Белсенді'],
  ['Заморожена', 'Мұздатылған'],
  ['Ожидает оплаты', 'Төлем күтілуде'],
  ['Просрочена', 'Мерзімі өткен'],
  ['Приостановлена', 'Тоқтатылған'],
  ['Ежемесячно', 'Ай сайын'],
  ['1 мес.', '1 ай'],
  ['3 месяца', '3 ай'],
  ['3 мес.', '3 ай'],
  ['6 месяцев', '6 ай'],
  ['6 мес.', '6 ай'],
  ['12 месяцев', '12 ай'],
  ['12 мес.', '12 ай'],
  ['Скидка', 'Жеңілдік'],
  ['Забронировать', 'Брондау'],
  ['/ сутки', '/ тәу'],
  ['Итого:', 'Барлығы:'],
  ['Закрыть оформление подписки', 'Жazылым рәсімдеуді жабу'],
  ['Состав вашего набора', 'Жиынтығыңыздың құрамы'],
])

// Extend maps: for any string not in map, keep Russian (will fix in follow-up pass via deep translate file)
function collectStrings(obj, set = new Set()) {
  for (const v of Object.values(obj)) {
    if (typeof v === 'string') set.add(v)
    else if (v && typeof v === 'object') collectStrings(v, set)
  }
  return set
}

const allRuStrings = [...collectStrings(ru)]
const missingEn = allRuStrings.filter((s) => !ruEn.has(s))
const missingKk = allRuStrings.filter((s) => !ruKk.has(s))

// Heuristic EN for parameterized strings: copy structure with common word swaps
for (const s of missingEn) {
  let en = s
    .replace(/Подписка/g, 'Subscription')
    .replace(/подписк/g, 'subscription')
    .replace(/тариф/g, 'plan')
    .replace(/Тариф/g, 'Plan')
    .replace(/игруш/g, 'toy')
    .replace(/Игруш/g, 'Toy')
    .replace(/доставк/g, 'delivery')
    .replace(/Доставк/g, 'Delivery')
    .replace(/курьер/g, 'courier')
    .replace(/Курьер/g, 'Courier')
    .replace(/обмен/g, 'exchange')
    .replace(/Обмен/g, 'Exchange')
    .replace(/замороз/g, 'freeze')
    .replace(/Замороз/g, 'Freeze')
    .replace(/оплат/g, 'payment')
    .replace(/Оплат/g, 'Payment')
    .replace(/аренд/g, 'rental')
    .replace(/Аренд/g, 'Rental')
    .replace(/ребён/g, 'child')
    .replace(/Ребён/g, 'Child')
    .replace(/набор/g, 'set')
    .replace(/Набор/g, 'Set')
    .replace(/комплект/g, 'set')
    .replace(/Комплект/g, 'Set')
    .replace(/Пожалуйста,/g, 'Please,')
    .replace(/Не удалось/g, 'Could not')
    .replace(/Укажите/g, 'Enter')
    .replace(/Выберите/g, 'Choose')
  ruEn.set(s, en)
}

for (const s of missingKk) {
  let kk = s
  // Leave Cyrillic KK as Russian fallback where no map — prefer keeping readable RU over broken KK
  if (/^[A-Za-z0-9\s{}\.,\—\→\«\»\-\+\(\)\/₸:;!?×✓]+$/.test(s)) {
    kk = s
  } else {
    kk = s // TODO: professional review; many keys still RU until expanded
  }
  ruKk.set(s, kk)
}

const en = translateTree(ru, ruEn)
const kk = translateTree(ru, ruKk)

writeFileSync(join(fragDir, 'subscription-rental.en.json'), `${JSON.stringify(en, null, 2)}\n`, 'utf8')
writeFileSync(join(fragDir, 'subscription-rental.kk.json'), `${JSON.stringify(kk, null, 2)}\n`, 'utf8')

console.log(`Generated en/kk fragments (${allRuStrings.length} unique strings, en map ${ruEn.size}, kk map ${ruKk.size})`)
