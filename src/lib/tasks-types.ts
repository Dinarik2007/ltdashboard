export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "med" | "high";
export type EmployeePosition = string;
export type AppRole = "admin" | "editor" | "viewer";

export interface PositionRow {
  id: string;
  key: string;
  label: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  task_type: string | null;
  due_date: string | null;
  position: number;
  assignee_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  position: string | null;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  comment: string;
  created_at: string;
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  file_url: string;
  file_name: string;
  uploaded_by: string;
  created_at: string;
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "К выполнению",
  in_progress: "В работе",
  review: "На проверке",
  done: "Готово",
};

export const STATUS_ORDER: TaskStatus[] = ["todo", "in_progress", "review", "done"];

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Низкий",
  med: "Средний",
  high: "Высокий",
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  high: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900",
  med: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
  low: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
};

export const POSITION_LABELS: Record<string, string> = {
  marketolog: "Маркетолог",
  product_manager: "Продакт-менеджер",
  smm_manager: "SMM-менеджер",
  designer: "Дизайнер",
};

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Администратор",
  editor: "Редактор",
  viewer: "Наблюдатель",
};

export function initials(name?: string | null, email?: string | null) {
  const source = (name?.trim() || email?.trim() || "?").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}