export type Channel = "VK" | "Telegram" | "YouTube" | "Instagram" | "Dzen" | "Ozon" | "Wildberries" | "Я.Маркет";

export const kpis = [
  { label: "Расходы", value: "₽ 4.82M", delta: 8.3, trend: [12, 18, 14, 22, 26, 24, 32], hint: "за период" },
  { label: "Охват", value: "12.4M", delta: 14.7, trend: [4, 8, 6, 12, 14, 18, 22], hint: "уникальных" },
  { label: "Подписчики", value: "284 920", delta: 5.2, trend: [220, 230, 245, 250, 260, 272, 285] },
  { label: "ROMI", value: "318%", delta: 22.1, trend: [180, 210, 240, 260, 280, 300, 318] },
];

export const spendByChannel = [
  { month: "Янв", VK: 320, Telegram: 180, YouTube: 220, Instagram: 140, Dzen: 90 },
  { month: "Фев", VK: 340, Telegram: 210, YouTube: 260, Instagram: 160, Dzen: 110 },
  { month: "Мар", VK: 420, Telegram: 260, YouTube: 320, Instagram: 200, Dzen: 140 },
  { month: "Апр", VK: 520, Telegram: 320, YouTube: 380, Instagram: 240, Dzen: 180 },
  { month: "Май", VK: 610, Telegram: 380, YouTube: 460, Instagram: 290, Dzen: 220 },
  { month: "Июн", VK: 580, Telegram: 360, YouTube: 440, Instagram: 280, Dzen: 210 },
  { month: "Июл", VK: 540, Telegram: 340, YouTube: 410, Instagram: 260, Dzen: 190 },
];

export const reachWeekly = [
  { w: "W1", reach: 820 }, { w: "W2", reach: 1040 }, { w: "W3", reach: 980 },
  { w: "W4", reach: 1320 }, { w: "W5", reach: 1580 }, { w: "W6", reach: 1820 },
  { w: "W7", reach: 2140 }, { w: "W8", reach: 2380 }, { w: "W9", reach: 2620 },
  { w: "W10", reach: 2840 }, { w: "W11", reach: 3120 }, { w: "W12", reach: 3380 },
];

export const subscribersByPlatform = [
  { m: "Янв", VK: 82, Telegram: 41, YouTube: 28, Instagram: 36, Dzen: 18 },
  { m: "Фев", VK: 88, Telegram: 46, YouTube: 32, Instagram: 39, Dzen: 21 },
  { m: "Мар", VK: 96, Telegram: 54, YouTube: 38, Instagram: 44, Dzen: 26 },
  { m: "Апр", VK: 108, Telegram: 63, YouTube: 47, Instagram: 51, Dzen: 32 },
  { m: "Май", VK: 122, Telegram: 74, YouTube: 58, Instagram: 60, Dzen: 39 },
  { m: "Июн", VK: 136, Telegram: 86, YouTube: 71, Instagram: 68, Dzen: 47 },
  { m: "Июл", VK: 148, Telegram: 96, YouTube: 82, Instagram: 76, Dzen: 54 },
];

export const romiByCampaign = [
  { name: "Весенняя посевная", romi: 412 },
  { name: "Биогумус Premium", romi: 368 },
  { name: "Розы и пионы", romi: 294 },
  { name: "Газон Eco", romi: 246 },
  { name: "Дачный сезон", romi: 218 },
  { name: "Защита растений", romi: 184 },
];

export const bestChannels = [
  { name: "Telegram", romi: 384, spend: "₽ 980K", share: 92 },
  { name: "VK", romi: 312, spend: "₽ 1.42M", share: 78 },
  { name: "YouTube", romi: 268, spend: "₽ 1.18M", share: 68 },
  { name: "Дзен", romi: 224, spend: "₽ 520K", share: 56 },
  { name: "Instagram", romi: 196, spend: "₽ 720K", share: 48 },
];

export const bestProducts = [
  { sku: "BG-5L", name: "Биогумус Premium 5л", revenue: "₽ 1.84M", romi: 412, stock: 1240, category: "Удобрения" },
  { sku: "RZ-PRO", name: "Удобрение для роз Pro", revenue: "₽ 1.22M", romi: 368, stock: 860, category: "Удобрения" },
  { sku: "GR-UNI", name: "Грунт универсальный 60л", revenue: "₽ 980K", romi: 294, stock: 540, category: "Грунты" },
  { sku: "GZ-ECO", name: "Семена газона Eco 1кг", revenue: "₽ 740K", romi: 246, stock: 2100, category: "Семена" },
  { sku: "DF-COMPLEX", name: "Защита растений Complex", revenue: "₽ 612K", romi: 218, stock: 720, category: "Защита" },
  { sku: "HP-RAINBOW", name: "Гортензия Rainbow набор", revenue: "₽ 488K", romi: 184, stock: 320, category: "Семена" },
];

export const notifications = [
  { id: 1, type: "budget", title: "Превышение бюджета", text: "Канал VK · 112% от плана за июль", time: "5 мин назад", level: "warn" as const },
  { id: 2, type: "task", title: "Новая задача", text: "Согласовать креативы для кампании «Газон Eco»", time: "1 ч назад", level: "info" as const },
  { id: 3, type: "report", title: "Отчёт готов", text: "Еженедельный отчёт по Telegram доступен", time: "3 ч назад", level: "ok" as const },
  { id: 4, type: "blogger", title: "Блогер ответил", text: "@sad_i_ogorod подтвердила интеграцию", time: "вчера", level: "ok" as const },
  { id: 5, type: "sku", title: "Низкий остаток", text: "SKU «Гортензия Rainbow» — 320 шт", time: "вчера", level: "warn" as const },
];

export const socialPosts = [
  { id: "p1", platform: "VK" as const, title: "5 секретов весенней подкормки", date: "2026-05-12", reach: 184_200, er: 6.8, status: "Опубликован" },
  { id: "p2", platform: "Telegram" as const, title: "Биогумус: за и против", date: "2026-05-14", reach: 92_400, er: 9.2, status: "Опубликован" },
  { id: "p3", platform: "YouTube" as const, title: "Газон с нуля за 30 дней", date: "2026-05-16", reach: 312_800, er: 7.4, status: "Опубликован" },
  { id: "p4", platform: "Instagram" as const, title: "Розы цветут всё лето", date: "2026-05-18", reach: 76_100, er: 5.1, status: "Запланирован" },
  { id: "p5", platform: "Dzen" as const, title: "Грунт для томатов: гайд", date: "2026-05-20", reach: 48_900, er: 4.6, status: "Черновик" },
  { id: "p6", platform: "VK" as const, title: "Календарь садовода: июнь", date: "2026-05-22", reach: 142_300, er: 6.2, status: "Опубликован" },
];

export const bloggers = [
  { name: "Анна Садовая", handle: "@sad_i_ogorod", platform: "Instagram", niche: "Садоводы", reach: 482_000, cpm: 320, romi: 286, status: "Активен" },
  { name: "Дача с Михаилом", handle: "@dacha_misha", platform: "YouTube", niche: "Дачники", reach: 1_240_000, cpm: 240, romi: 342, status: "Активен" },
  { name: "Зелёный двор", handle: "@green_yard", platform: "Telegram", niche: "Ландшафт", reach: 184_000, cpm: 410, romi: 198, status: "Переговоры" },
  { name: "Огород без хлопот", handle: "@easy_garden", platform: "VK", niche: "Дачники", reach: 312_000, cpm: 280, romi: 244, status: "Активен" },
  { name: "Цветы и Я", handle: "@flowers_and_me", platform: "Instagram", niche: "Садоводы", reach: 96_000, cpm: 380, romi: 162, status: "Завершён" },
  { name: "Ландшафт-Pro", handle: "@landscape_pro", platform: "YouTube", niche: "Ландшафт", reach: 220_000, cpm: 360, romi: 218, status: "Активен" },
];

export const marketplaces = [
  { name: "Ozon", revenue: "₽ 3.42M", orders: 4820, rating: 4.8, buyout: 86, adSpend: "₽ 420K", romi: 312 },
  { name: "Wildberries", revenue: "₽ 4.18M", orders: 6240, rating: 4.7, buyout: 78, adSpend: "₽ 580K", romi: 286 },
  { name: "Я.Маркет", revenue: "₽ 1.82M", orders: 2410, rating: 4.9, buyout: 91, adSpend: "₽ 220K", romi: 348 },
];

export const marketplaceSales = [
  { m: "Янв", Ozon: 220, Wildberries: 280, "Я.Маркет": 110 },
  { m: "Фев", Ozon: 260, Wildberries: 320, "Я.Маркет": 130 },
  { m: "Мар", Ozon: 340, Wildberries: 420, "Я.Маркет": 170 },
  { m: "Апр", Ozon: 420, Wildberries: 520, "Я.Маркет": 220 },
  { m: "Май", Ozon: 510, Wildberries: 640, "Я.Маркет": 280 },
  { m: "Июн", Ozon: 580, Wildberries: 720, "Я.Маркет": 310 },
  { m: "Июл", Ozon: 620, Wildberries: 780, "Я.Маркет": 340 },
];

export const budgets = [
  { channel: "VK", plan: 1500, fact: 1420 },
  { channel: "Telegram", plan: 1000, fact: 980 },
  { channel: "YouTube", plan: 1200, fact: 1180 },
  { channel: "Instagram", plan: 800, fact: 720 },
  { channel: "Dzen", plan: 500, fact: 520 },
  { channel: "Блогеры", plan: 1800, fact: 1640 },
  { channel: "Маркетплейсы", plan: 1200, fact: 1220 },
];

export const budgetTransactions = [
  { id: "tx-1", date: "2026-05-22", channel: "VK", campaign: "Весенняя посевная", amount: "₽ 184 000", status: "Оплачено" },
  { id: "tx-2", date: "2026-05-21", channel: "Блогеры", campaign: "Дача с Михаилом", amount: "₽ 320 000", status: "Оплачено" },
  { id: "tx-3", date: "2026-05-20", channel: "Telegram", campaign: "Биогумус Premium", amount: "₽ 96 000", status: "В обработке" },
  { id: "tx-4", date: "2026-05-19", channel: "YouTube", campaign: "Газон Eco", amount: "₽ 248 000", status: "Оплачено" },
  { id: "tx-5", date: "2026-05-18", channel: "Маркетплейсы", campaign: "WB Promo", amount: "₽ 410 000", status: "Оплачено" },
  { id: "tx-6", date: "2026-05-17", channel: "Instagram", campaign: "Розы и пионы", amount: "₽ 72 000", status: "Отклонено" },
];

export type TaskStatus = "Todo" | "In Progress" | "Review" | "Done";
export const tasks = [
  { id: "t1", title: "Согласовать креативы «Газон Eco»", assignee: "А. Иванова", priority: "High", status: "In Progress" as TaskStatus, due: "2026-05-26" },
  { id: "t2", title: "Бриф для @sad_i_ogorod", assignee: "М. Петров", priority: "Med", status: "Todo" as TaskStatus, due: "2026-05-27" },
  { id: "t3", title: "Отчёт по Telegram за неделю", assignee: "Е. Сидорова", priority: "Low", status: "Review" as TaskStatus, due: "2026-05-25" },
  { id: "t4", title: "Запуск рекламы на WB", assignee: "Д. Кузнецов", priority: "High", status: "In Progress" as TaskStatus, due: "2026-05-28" },
  { id: "t5", title: "Анализ продаж биогумуса", assignee: "А. Иванова", priority: "Med", status: "Done" as TaskStatus, due: "2026-05-20" },
  { id: "t6", title: "Календарь публикаций на июнь", assignee: "М. Петров", priority: "Med", status: "Todo" as TaskStatus, due: "2026-05-30" },
  { id: "t7", title: "Согласование бюджета Q3", assignee: "Е. Сидорова", priority: "High", status: "Review" as TaskStatus, due: "2026-05-29" },
  { id: "t8", title: "Обновить SKU «Гортензия»", assignee: "Д. Кузнецов", priority: "Low", status: "Done" as TaskStatus, due: "2026-05-19" },
];

export const calendarEvents = [
  { day: 3, title: "Запуск «Весна»", type: "campaign" },
  { day: 5, title: "Пост VK: подкормка", type: "post" },
  { day: 8, title: "Интеграция YouTube", type: "blogger" },
  { day: 12, title: "Выставка ДачаЭкспо", type: "event" },
  { day: 14, title: "Промо Ozon", type: "campaign" },
  { day: 17, title: "Telegram гайд", type: "post" },
  { day: 21, title: "Скидки WB", type: "campaign" },
  { day: 23, title: "Блогер @green_yard", type: "blogger" },
  { day: 26, title: "Отчёт месяца", type: "event" },
  { day: 28, title: "Запуск «Лето»", type: "campaign" },
];

export const skus = [
  { sku: "BG-5L", name: "Биогумус Premium 5л", category: "Удобрения", price: 690, stock: 1240, sold: 2680, romi: 412 },
  { sku: "BG-10L", name: "Биогумус Premium 10л", category: "Удобрения", price: 1190, stock: 820, sold: 1420, romi: 386 },
  { sku: "RZ-PRO", name: "Удобрение для роз Pro", category: "Удобрения", price: 480, stock: 860, sold: 2540, romi: 368 },
  { sku: "GR-UNI", name: "Грунт универсальный 60л", category: "Грунты", price: 590, stock: 540, sold: 1660, romi: 294 },
  { sku: "GR-TOM", name: "Грунт для томатов 40л", category: "Грунты", price: 520, stock: 720, sold: 1240, romi: 268 },
  { sku: "GZ-ECO", name: "Семена газона Eco 1кг", category: "Семена", price: 350, stock: 2100, sold: 2120, romi: 246 },
  { sku: "GZ-SPORT", name: "Семена газона Sport 2кг", category: "Семена", price: 690, stock: 1240, sold: 980, romi: 212 },
  { sku: "DF-COMPLEX", name: "Защита растений Complex", category: "Защита", price: 420, stock: 720, sold: 1460, romi: 218 },
  { sku: "TL-SECATEUR", name: "Секатор Pro Garden", category: "Инструменты", price: 1490, stock: 380, sold: 420, romi: 168 },
  { sku: "HP-RAINBOW", name: "Гортензия Rainbow набор", category: "Семена", price: 1290, stock: 320, sold: 380, romi: 184 },
];