# Marketing Dashboard — Премиум SaaS для производителя удобрений

Создаю современный marketing dashboard уровня 2026 года с тёмно-зелёной премиум-палитрой и light glassmorphism для садоводческого бренда.

## Дизайн-система

**Палитра (oklch в `src/styles.css`):**
- Background: тёплый off-white `oklch(0.98 0.005 130)`
- Primary (deep forest green): `oklch(0.32 0.06 150)`
- Accent (fresh leaf): `oklch(0.62 0.15 145)`
- Glass surfaces: white с blur + субтильная зелёная тень
- Sidebar: глубокий тёмно-зелёный `oklch(0.22 0.04 150)` со светлым текстом

**Типографика:** Space Grotesk (заголовки) + Inter (body) — современная корпоративная пара.

**Эффекты:** `backdrop-blur-xl`, мягкие зелёные glow-shadows, плавные motion-анимации, ramp-in графиков.

## Структура маршрутов (TanStack Router)

```
src/routes/
  __root.tsx                — shell с QueryClientProvider
  _app.tsx                  — layout с sidebar + topbar + Outlet
  _app/index.tsx            — / → Dashboard (главная)
  _app/social.tsx           — /social → Соцсети
  _app/bloggers.tsx         — /bloggers → Блогеры
  _app/marketplaces.tsx     — /marketplaces → Маркетплейсы
  _app/budgets.tsx          — /budgets → Бюджеты
  _app/tasks.tsx            — /tasks → Задачи
  _app/calendar.tsx         — /calendar → Календарь
  _app/sku.tsx              — /sku → SKU
```

Каждый route получает свой `head()` с уникальными title/description.

## Компоненты

**Layout:**
- `AppSidebar` — collapsible shadcn sidebar, тёмно-зелёный, иконки lucide (LayoutDashboard, Share2, Users, ShoppingBag, Wallet, CheckSquare, Calendar, Package), активный route подсвечен leaf-accent
- `Topbar` — поиск, period picker (7д/30д/90д/custom DateRangePicker), notifications bell с popover-панелью, аватар

**Dashboard (главная):**
- 4 KPI-карточки: Расходы, Охват, Подписчики, ROMI — с микро-трендом sparkline и delta %
- График расходов по каналам (stacked area, Recharts) — большой, glass card
- Охваты по неделям (gradient area chart)
- Подписчики по соцсетям (multi-line)
- ROMI по кампаниям (горизонтальный bar)
- "Лучшие каналы" — таблица с прогресс-барами
- "Лучшие продукты (SKU)" — карточки с product image, ROI, sales
- Notifications side-panel (Sheet) — уведомления о задачах, бюджетах, отчётах

**Соцсети:** таблица постов с фильтрами (платформа, период, статус), engagement charts по платформам (VK, Telegram, YouTube, Instagram, Dzen)

**Блогеры:** карточки + таблица — имя, платформа, охват, CPM, ROI, статус сделки, фильтр по нише (садоводы/дачники/ландшафт)

**Маркетплейсы:** Ozon / Wildberries / Я.Маркет — продажи, рейтинг, выкуп, реклама

**Бюджеты:** план vs факт по каналам (bar), pie распределения, таблица транзакций

**Задачи:** Kanban-доска (Todo / In Progress / Review / Done) + список с фильтрами по исполнителю/приоритету

**Календарь:** месячная сетка с маркетинговыми активностями (посевная, акции, выставки), цветовые категории

**SKU:** каталог продукции (удобрения, грунты, семена, инструменты) — таблица с image, цена, остатки, ROI, продажи по каналам

## Mock-данные

Реалистичные данные для садоводческого бренда:
- SKU: «Биогумус Premium 5л», «Удобрение для роз», «Грунт универсальный», «Семена газона Eco»
- Сезонность (пик весной), каналы под российский рынок
- Файл `src/lib/mock-data.ts` — централизованно, легко заменить на Supabase запросы позже

## Supabase-ready архитектура

- Все списки данных идут через `useQuery` с `queryOptions` фабриками в `src/lib/queries.ts`
- Mock возвращается через async-функции, имитирующие fetch
- Замена на Supabase = одна строка в queryFn (`supabase.from('...').select()`)
- Cloud не включаю сейчас — структура готова, активируем когда понадобится реальная БД

## Технические детали

- **Charts:** Recharts (входит в shadcn chart) — Area, Bar, Line, Pie, Radial
- **Анимации:** framer-motion для card mount, stagger у KPI
- **Адаптив:** sidebar становится sheet на мобильных, KPI grid → 2 кол → 1 кол, графики full-width
- **Date range:** shadcn Calendar в Popover с `pointer-events-auto`
- **Filters:** Select / Combobox / Toggle Group
- **Notifications:** Sheet справа, badge на иконке колокольчика

## Что в итоге увидит пользователь

Production-grade SaaS с фирменным «зелёным» характером бренда удобрений: премиум, но живой, природный. Все 8 разделов рабочие со своими таблицами, фильтрами и графиками. Готов к подключению Cloud в любой момент.
