import type { CatalogMenuSection } from '~/types/catalog-menu'

export const catalogMenuSections: CatalogMenuSection[] = [
  {
    id: 'toys',
    name: 'Игрушки и развитие',
    icon: '🧸',
    title: 'Игрушки и развитие',
    groups: [
      {
        title: 'Развитие моторики',
        items: [
          { name: 'Мелкая моторика', slug: 'fine-motor', category: 'fine-motor' },
          { name: 'Крупная моторика', slug: 'gross-motor', category: 'gross-motor' },
          { name: 'Сенсорное развитие', slug: 'sensory', category: 'sensory' },
          { name: 'Балансиры и шнуровки', slug: 'balancers-lacing', search: 'балансир' },
        ],
      },
      {
        title: 'Логика и обучение',
        items: [
          { name: 'Логика и мышление', slug: 'logic', category: 'logic' },
          { name: 'Речь и коммуникация', slug: 'language', category: 'language' },
          { name: 'Пазлы и головоломки', slug: 'puzzles', search: 'пазл' },
          { name: 'Сортеры и лабиринты', slug: 'sorters', search: 'сортер' },
        ],
      },
      {
        title: 'Монтессори',
        items: [
          { name: 'Методика Монтессори', slug: 'montessori', category: 'montessori' },
          { name: 'Деревянные материалы', slug: 'wooden-toys', search: 'деревян' },
          { name: 'Рамки-вкладыши', slug: 'inset-frames', search: 'рамка' },
          { name: 'Пирамидки и стаканчики', slug: 'stackers', search: 'пирамид' },
        ],
      },
      {
        title: 'Конструкторы',
        items: [
          { name: 'Деревянные конструкторы', slug: 'wooden-builders', search: 'конструктор' },
          { name: 'Магнитные конструкторы', slug: 'magnetic-builders', search: 'магнитный' },
          { name: 'Кубики и строительные наборы', slug: 'blocks', search: 'кубики' },
        ],
      },
      {
        title: 'Творчество и воображение',
        items: [
          { name: 'Творческие наборы', slug: 'creativity', category: 'creativity' },
          { name: 'Музыкальные игрушки', slug: 'musical-toys', search: 'музыкаль' },
          { name: 'Сюжетно-ролевые наборы', slug: 'role-play', search: 'игровой набор' },
        ],
      },
      {
        title: 'По интересам',
        items: [
          { name: 'Машинки и транспорт', slug: 'transport', search: 'машин' },
          { name: 'Животные', slug: 'animals', search: 'животн' },
          { name: 'Куклы и домики', slug: 'dolls', search: 'кукл' },
          { name: 'Игрушки для воды', slug: 'water-toys', search: 'вода' },
        ],
      },
    ],
  },
  {
    id: 'baby',
    name: 'Для малышей',
    icon: '👶',
    title: 'Для малышей',
    groups: [
      { title: 'Первые игрушки', items: [
        { name: 'Погремушки', slug: 'rattles', search: 'погремушка' },
        { name: 'Прорезыватели', slug: 'teethers', search: 'прорезыватель' },
        { name: 'Мобили и подвески', slug: 'mobiles', search: 'мобиль' },
      ] },
      { title: 'Развитие до года', items: [
        { name: 'Сенсорные игрушки', slug: 'baby-sensory', category: 'sensory' },
        { name: 'Развивающие коврики', slug: 'play-mats', search: 'коврик' },
        { name: 'Мягкие кубики', slug: 'soft-blocks', search: 'кубики' },
      ] },
      { title: 'Движение', items: [
        { name: 'Каталки', slug: 'push-toys', search: 'каталка' },
        { name: 'Ходунки', slug: 'walkers', search: 'ходунки' },
        { name: 'Качалки', slug: 'rockers', search: 'качалка' },
      ] },
    ],
  },
  {
    id: 'books',
    name: 'Книги и обучение',
    icon: '📚',
    title: 'Книги и обучение',
    groups: [
      { title: 'Детские книги', items: [
        { name: 'Книжки-картинки', slug: 'picture-books', search: 'книга' },
        { name: 'Интерактивные книги', slug: 'interactive-books', search: 'интерактивная книга' },
        { name: 'Сказки', slug: 'fairy-tales', search: 'сказки' },
      ] },
      { title: 'Подготовка к школе', items: [
        { name: 'Алфавит и чтение', slug: 'alphabet', category: 'language' },
        { name: 'Счёт и математика', slug: 'math', category: 'logic' },
        { name: 'Обучающие карточки', slug: 'learning-cards', search: 'карточки' },
      ] },
      { title: 'Окружающий мир', items: [
        { name: 'Животные и природа', slug: 'nature', search: 'животные' },
        { name: 'Наука и эксперименты', slug: 'science', search: 'эксперимент' },
        { name: 'Атласы и энциклопедии', slug: 'encyclopedias', search: 'энциклопедия' },
      ] },
    ],
  },
  {
    id: 'creative',
    name: 'Творчество',
    icon: '🎨',
    title: 'Творчество',
    groups: [
      { title: 'Рисование', items: [
        { name: 'Краски и кисти', slug: 'paint', search: 'краски' },
        { name: 'Мелки и карандаши', slug: 'pencils', search: 'карандаши' },
        { name: 'Раскраски', slug: 'coloring-books', search: 'раскраска' },
      ] },
      { title: 'Лепка и аппликация', items: [
        { name: 'Пластилин и тесто', slug: 'clay', search: 'пластилин' },
        { name: 'Наборы для аппликаций', slug: 'applique', search: 'аппликация' },
        { name: 'Мозаики', slug: 'mosaics', search: 'мозаика' },
      ] },
      { title: 'Музыка и театр', items: [
        { name: 'Музыкальные инструменты', slug: 'instruments', search: 'музыкальный' },
        { name: 'Кукольный театр', slug: 'puppet-theater', search: 'театр' },
        { name: 'Наборы для постановок', slug: 'performance', search: 'ролевой' },
      ] },
    ],
  },
  {
    id: 'active',
    name: 'Активные игры',
    icon: '⚽',
    title: 'Активные игры',
    groups: [
      { title: 'Для дома', items: [
        { name: 'Балансборды', slug: 'balance-boards', category: 'gross-motor' },
        { name: 'Домашние спорткомплексы', slug: 'home-sport', search: 'спорт' },
        { name: 'Тоннели и палатки', slug: 'tents', search: 'палатка' },
      ] },
      { title: 'Для улицы', items: [
        { name: 'Самокаты и беговелы', slug: 'scooters', search: 'самокат' },
        { name: 'Мячи', slug: 'balls', search: 'мяч' },
        { name: 'Игры на свежем воздухе', slug: 'outdoor-games', category: 'gross-motor' },
      ] },
      { title: 'Координация', items: [
        { name: 'Кольцебросы', slug: 'ring-toss', search: 'кольцеброс' },
        { name: 'Боулинг и кегли', slug: 'bowling', search: 'боулинг' },
        { name: 'Полосы препятствий', slug: 'obstacles', search: 'препятствий' },
      ] },
    ],
  },
  {
    id: 'party',
    name: 'Праздник и подарки',
    icon: '🎁',
    title: 'Праздник и подарки',
    groups: [
      { title: 'Подарки', items: [
        { name: 'Подарочные наборы', slug: 'gift-boxes', search: 'подарочный набор' },
        { name: 'Сертификаты', slug: 'gift-cards', search: 'сертификат' },
        { name: 'Игрушки-сюрпризы', slug: 'surprise-toys', search: 'сюрприз' },
      ] },
      { title: 'Для праздника', items: [
        { name: 'Игры для компании', slug: 'party-games', search: 'игра' },
        { name: 'Карнавальные костюмы', slug: 'costumes', search: 'костюм' },
        { name: 'Украшения', slug: 'decorations', search: 'украшение' },
      ] },
    ],
  },
]
