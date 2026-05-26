
# AI Marketing Assistant

Плавающая AI-панель внутри `_app` layout: кнопка справа снизу → premium chat panel с историей, quick actions и markdown. Используем **Lovable AI Gateway** (не OpenAI напрямую — у нас уже есть `LOVABLE_API_KEY`, не требует от пользователя ключей).

## 1. База данных

Таблица `ai_conversations` (одна запись = одно сообщение):
- `id` uuid PK
- `user_id` uuid (auth.uid())
- `role` text: `user` | `assistant` | `system`
- `message` text
- `conversation_id` uuid — группировка в треды (новый чат = новый id)
- `created_at` timestamptz

RLS: только авторизованные, видят/пишут/удаляют **только свои** записи (`auth.uid() = user_id`). GRANT для `authenticated` + `service_role`. Realtime не нужен (стримим напрямую из edge).

## 2. Backend — стриминговый чат

Поскольку на этом стеке мы используем TanStack server functions, а Lovable AI требует SSE-стриминга, делаю **server route** `src/routes/api/ai-chat.ts` (POST):
- Валидация Zod: `{ messages: [{role, content}], conversationId, mode? }`
- Проверка auth по bearer-token → `userId`
- Системный промпт зависит от `mode` (post / seo / wb-ozon / blogger-brief / content-plan / pr / marketing-analysis / sku / general) — все промпты на русском, заточены под маркетинг-команду
- Контекст: подмешиваем последние ~20 сообщений из `ai_conversations` для этого `conversationId`
- Вызов `https://ai.gateway.lovable.dev/v1/chat/completions` с `google/gemini-3-flash-preview`, `stream: true`
- Обработка 429/402 → понятные ошибки клиенту
- После завершения стрима сохраняем `user` + `assistant` сообщения в `ai_conversations` через `supabaseAdmin`

Возврат — SSE-стрим в `text/event-stream` (парсим на клиенте token-by-token).

## 3. UI

### Floating button
- Компонент `<AIAssistantLauncher />` монтируется в `src/routes/_app.tsx` (Shell) — виден на всех app-страницах для авторизованных
- Фикс справа снизу (`fixed bottom-6 right-6 z-50`), градиентный круг 56×56, иконка Sparkles, мягкое свечение/pulse
- Скрыт для неавторизованных

### Chat panel
- Sheet справа (shadcn Sheet) шириной ~480px на desktop, full-width на mobile
- **Header**: title "AI Marketing Assistant", переключатель «Новый чат», список прошлых тредов в dropdown
- **Quick actions** (видны на пустом чате, чипы-кнопки):
  - 📝 Создать пост
  - 🔍 SEO для Ozon
  - 🎬 ТЗ блогеру
  - 📊 Анализ ROMI
  - 📅 Контент план
  - 🎥 Идеи Reels
  Каждая → префилл промпта + `mode` для системного промпта
- **Prompt suggestions** под полем ввода (3 динамические подсказки)
- **Chat bubbles**: user — справа, акцентный градиент; assistant — слева, surface; round 2xl, аватары
- **Markdown**: `react-markdown` + `remark-gfm` (уже есть `prose` классы tailwind)
- **Typing animation**: пульсирующие 3 точки пока ждём первый токен; стриминговые токены подставляем в последний assistant-bubble
- **Composer**: textarea с auto-resize, Enter — отправить, Shift+Enter — newline, кнопка Send (disabled во время стрима), кнопка остановки (AbortController)
- Toast (sonner) на ошибки (429 / 402 / сеть)

### Premium стиль
- Тонкий градиентный border у панели, blur-backdrop, semantic tokens из `src/styles.css` (никаких хардкод-цветов)
- Иконки Lucide: Sparkles, Send, Square (stop), Plus (новый чат), History

## 4. История чатов
- `useQuery(['ai-threads', userId])` — список тредов (DISTINCT conversation_id с last message preview/created_at) через серверную функцию `listThreads`
- `useQuery(['ai-thread', conversationId])` — сообщения треда
- При открытии панели — последний тред или пустой новый
- Кнопка «Новый чат» генерирует `crypto.randomUUID()` для `conversationId`
- Удаление треда — server fn `deleteThread`

## 5. Зависимости
```
bun add react-markdown remark-gfm
```

## 6. Структура файлов
```
src/
  components/ai/
    AIAssistantLauncher.tsx     # floating button + Sheet
    AIChatPanel.tsx             # вся chat UI
    AIMessageBubble.tsx         # markdown bubble
    AIQuickActions.tsx          # 6 chip-кнопок
    AIThreadList.tsx            # история тредов
  lib/
    ai-chat.functions.ts        # listThreads, getThread, deleteThread (createServerFn)
    ai-prompts.ts               # системные промпты по mode
    ai-stream.ts                # клиентский SSE-парсер
  routes/
    api/ai-chat.ts              # server route, POST, SSE
    _app.tsx                    # +<AIAssistantLauncher/>
```

## Безопасность
- API endpoint требует auth-токен (проверяем через `supabaseAdmin.auth.getUser(token)`)
- `LOVABLE_API_KEY` читается только на сервере (`process.env`)
- RLS на `ai_conversations` → один пользователь видит только свои
- Промпты на сервере — клиент только указывает `mode`

Подтверди план — переключаемся в build.
