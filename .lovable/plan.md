
# План: Tasks → Supabase + Админка + Профили сотрудников

## 1. База данных

### Профили и роли

**`profiles`** (расширенный профиль сотрудника, 1:1 с auth.users):
- `id` uuid PK = auth.users.id
- `email` text
- `full_name` text (ФИО)
- `phone` text
- `position` enum (`marketolog`, `product_manager`, `smm_manager`, `designer`) — nullable
- `created_at`, `updated_at`

Автосоздание через триггер `on auth.users insert` → `handle_new_user()`.

**`app_role`** enum: `admin`, `editor`, `viewer`.

**`user_roles`** (отдельная таблица — критично для безопасности):
- `id`, `user_id` (FK auth.users), `role` app_role, UNIQUE(user_id, role)

**Security definer функция** `has_role(_user_id, _role)`.

**Bootstrap admin**: SQL вставит роль `admin` для пользователя с email `dgolub@lamatorf.ru` (если он уже зарегистрирован — сразу; если нет — создадим триггер, который при регистрации этого email сразу даст admin).

**Дефолтная роль** новых пользователей: `viewer` (повышает админ).

### Tasks

**`tasks`**: id, title, description, status (`todo`/`in_progress`/`review`/`done`), priority (`low`/`med`/`high`), task_type, due_date, position int, assignee_id, created_by, created_at, updated_at.

**`task_comments`**: id, task_id (cascade), user_id, comment, created_at.

**`task_attachments`**: id, task_id (cascade), file_url, file_name, uploaded_by, created_at.

**Storage bucket** `task-attachments` (приватный).

**Realtime**: добавить tasks, task_comments, task_attachments в `supabase_realtime` + `REPLICA IDENTITY FULL`.

**Триггер** `update_updated_at_column` на tasks и profiles.

### RLS политики

**profiles**:
- SELECT: авторизованные видят все профили (нужно для отображения assignee)
- UPDATE: пользователь может править свой профиль ИЛИ admin может править любой
- INSERT/DELETE: только admin

**user_roles**:
- SELECT: авторизованные видят все роли (нужно для бейджа в UI)
- INSERT/UPDATE/DELETE: только admin (`has_role(auth.uid(),'admin')`)

**tasks / task_comments / task_attachments**:
- SELECT: только авторизованные (`auth.uid() IS NOT NULL`)
- INSERT/UPDATE/DELETE: `has_role(admin)` OR `has_role(editor)`
- viewer — read-only

**Storage `task-attachments`**:
- SELECT/INSERT: авторизованные
- DELETE: admin/editor

## 2. Server functions (`src/lib/`)

`tasks.functions.ts` (защищены `requireSupabaseAuth`, валидация Zod):
- createTask, updateTask (включая status/position для DnD), deleteTask
- addComment, deleteComment
- addAttachment (запись метаданных), deleteAttachment

`admin.functions.ts` (защищены `requireSupabaseAuth` + проверка `has_role(admin)` внутри):
- listUsers — все profiles + их роли
- assignRole(user_id, role), revokeRole(user_id, role)
- updateProfile(user_id, {full_name, phone, position}) — для админа

`profile.functions.ts`:
- updateMyProfile({full_name, phone, position}) — для текущего пользователя

## 3. Маршруты

### Защита авторизацией

Создать pathless layout `src/routes/_authenticated.tsx`:
- `beforeLoad`: если нет сессии → `redirect('/auth')`

Перенести защищённые роуты:
- `src/routes/_app.tasks.tsx` → `src/routes/_app/_authenticated.tasks.tsx`
  (или оставить под `_app` + добавить child-level `beforeLoad`)
- Дашборд и остальные остаются публичными как сейчас.

Простой вариант: внутри `_app.tasks.tsx` добавить компонентный гард → если нет сессии, показать заглушку «Войдите для доступа к задачам» + кнопка на /auth. Соответствует уже существующему гостевому паттерну в проекте.

### Новые роуты

- `src/routes/_app.admin.tsx` — админка (только admin, иначе 403)
  - Таблица всех сотрудников: ФИО, email, телефон, должность, роли
  - Действия: изменить роль (select admin/editor/viewer), редактировать должность/ФИО/телефон через модалку
- `src/routes/_app.profile.tsx` — личный кабинет: ФИО, телефон, должность (read-only для viewer? — нет, свой профиль может править любой)

Пункт «Админка» в sidebar показывается только если `has_role(admin)`. Пункт «Профиль» — всем авторизованным.

## 4. UI Tasks (канбан)

- Канбан 4 колонки, карточки tasks из БД через `useQuery` + realtime subscription (один канал на 3 таблицы → `invalidateQueries(['tasks'])`).
- **Drag & drop** — `@dnd-kit/core` + `@dnd-kit/sortable`. Drop → `updateTask({status, position})`.
- **Модалка создания/редактирования**: title, description, priority, status, due_date, assignee (select из profiles), task_type.
- **Sheet деталей**: описание, activity timeline (комменты + системные события), форма комментария, секция вложений с превью (image → `<img>`, остальные → иконка).
- **Avatar assignee** на карточке (инициалы из full_name или email).
- **Цветные приоритеты** (High=rose, Med=amber, Low=emerald).
- **Toast** (sonner) на все мутации.
- Viewer (только просмотр): кнопки create/edit/delete disabled с тултипом.
- Неавторизованные: видят заглушку с кнопкой Войти.

## 5. Зависимости

```
bun add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities date-fns
```

## 6. Удаление mock

Удалить `tasks` и `TaskStatus` из `src/lib/mock-data.ts`.

## Структура файлов

```
src/
  lib/
    tasks.functions.ts
    admin.functions.ts
    profile.functions.ts
  routes/
    _app.tasks.tsx          (переписан, auth-only заглушка)
    _app.admin.tsx          (новый, admin-only)
    _app.profile.tsx        (новый)
  components/
    tasks/
      TaskCard.tsx
      TaskColumn.tsx
      TaskDialog.tsx
      TaskDetailSheet.tsx
      TaskAttachmentUploader.tsx
    admin/
      UsersTable.tsx
      EditEmployeeDialog.tsx
```

## Безопасность

- Роли — отдельная таблица `user_roles`, проверка через `has_role()` security definer (защита от рекурсии и эскалации).
- Все мутации идут через server functions с `requireSupabaseAuth` + явная проверка роли где нужно.
- RLS — backstop, основной гейт — серверная логика.
- Bootstrap admin для `dgolub@lamatorf.ru` через миграцию (insert при наличии пользователя + триггер на будущее).

Готов реализовать. Подтвердите план — и переключаемся в build.
