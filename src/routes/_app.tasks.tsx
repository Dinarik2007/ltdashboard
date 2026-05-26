import { useState, useEffect, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Topbar } from "@/components/topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners,
  type DragEndEvent, type DragStartEvent, useDroppable,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { TaskDetailSheet } from "@/components/tasks/TaskDetailSheet";
import type { Task, Profile, TaskStatus } from "@/lib/tasks-types";
import { STATUS_ORDER, STATUS_LABELS } from "@/lib/tasks-types";

export const Route = createFileRoute("/_app/tasks")({
  head: () => ({ meta: [{ title: "Задачи — Marketing" }, { name: "description", content: "Канбан задач команды маркетинга." }] }),
  component: TasksPage,
});

function TasksPage() {
  const { userId, canEdit, loading: authLoading } = useAuth();

  if (authLoading) {
    return <><Topbar title="Задачи" subtitle="Загрузка…" /><main className="flex flex-1 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></main></>;
  }
  if (!userId) {
    return (
      <>
        <Topbar title="Задачи" subtitle="Доступ только для сотрудников" />
        <main className="flex flex-1 items-center justify-center p-8">
          <div className="max-w-sm rounded-2xl border bg-card p-8 text-center">
            <Lock className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Только для авторизованных</h2>
            <p className="mt-1 text-sm text-muted-foreground">Войдите в аккаунт, чтобы видеть и управлять задачами команды.</p>
            <Button asChild className="mt-4 gradient-leaf text-white"><Link to="/auth">Войти</Link></Button>
          </div>
        </main>
      </>
    );
  }
  return <TasksBoard canEdit={canEdit} />;
}

function TasksBoard({ canEdit }: { canEdit: boolean }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [counts, setCounts] = useState<Record<string, { c: number; a: number }>>({});
  const [loading, setLoading] = useState(true);
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>("todo");
  const [sheetTask, setSheetTask] = useState<Task | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const reload = async () => {
    const [t, p, c, a] = await Promise.all([
      supabase.from("tasks").select("*").order("position"),
      supabase.from("profiles").select("*"),
      supabase.from("task_comments").select("task_id"),
      supabase.from("task_attachments").select("task_id"),
    ]);
    setTasks((t.data ?? []) as Task[]);
    setProfiles((p.data ?? []) as Profile[]);
    const map: Record<string, { c: number; a: number }> = {};
    (c.data ?? []).forEach((r: any) => { map[r.task_id] = { ...(map[r.task_id] ?? { c: 0, a: 0 }), c: (map[r.task_id]?.c ?? 0) + 1 }; });
    (a.data ?? []).forEach((r: any) => { map[r.task_id] = { ...(map[r.task_id] ?? { c: 0, a: 0 }), a: (map[r.task_id]?.a ?? 0) + 1 }; });
    setCounts(map);
    setLoading(false);
  };

  useEffect(() => {
    reload();
    const ch = supabase.channel("tasks-board")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, reload)
      .on("postgres_changes", { event: "*", schema: "public", table: "task_comments" }, reload)
      .on("postgres_changes", { event: "*", schema: "public", table: "task_attachments" }, reload)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  // keep sheetTask synced with fresh data
  useEffect(() => {
    if (sheetTask) {
      const fresh = tasks.find((t) => t.id === sheetTask.id);
      if (fresh && fresh !== sheetTask) setSheetTask(fresh);
      else if (!fresh) setSheetTask(null);
    }
  }, [tasks]);

  const filtered = useMemo(() => tasks.filter((t) =>
    assigneeFilter === "all" || t.assignee_id === assigneeFilter
  ), [tasks, assigneeFilter]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));

  const handleDragEnd = async (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    let targetStatus: TaskStatus = activeTask.status;
    let overTask: Task | undefined;
    if ((STATUS_ORDER as string[]).includes(String(over.id))) {
      targetStatus = String(over.id) as TaskStatus;
    } else {
      overTask = tasks.find((t) => t.id === over.id);
      if (overTask) targetStatus = overTask.status;
    }

    // Optimistic local reorder
    const colTasks = tasks.filter((t) => t.status === targetStatus && t.id !== active.id);
    const insertAt = overTask ? colTasks.findIndex((t) => t.id === overTask!.id) : colTasks.length;
    const newCol = [...colTasks.slice(0, insertAt), { ...activeTask, status: targetStatus }, ...colTasks.slice(insertAt)];
    const updates = newCol.map((t, i) => ({ id: t.id, position: i, status: targetStatus }));

    setTasks((prev) => {
      const others = prev.filter((t) => t.status !== targetStatus && t.id !== active.id);
      return [...others, ...newCol.map((t, i) => ({ ...t, position: i, status: targetStatus }))];
    });

    // Persist
    for (const u of updates) {
      const { error } = await supabase.from("tasks").update({ status: u.status, position: u.position }).eq("id", u.id);
      if (error) { toast.error(error.message); reload(); return; }
    }
  };

  const openCreate = (status: TaskStatus) => { setEditingTask(null); setDefaultStatus(status); setDialogOpen(true); };
  const openEdit = (t: Task) => { setEditingTask(t); setDialogOpen(true); };

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  return (
    <>
      <Topbar title="Задачи" subtitle="Командный канбан с realtime" />
      <main className="flex-1 space-y-6 p-4 md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="h-9 w-[220px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все исполнители</SelectItem>
              {profiles.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name || p.email}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex-1" />
          {canEdit ? (
            <Button onClick={() => openCreate("todo")} className="gradient-leaf text-white">
              <Plus className="mr-1 h-4 w-4" />Новая задача
            </Button>
          ) : (
            <Badge variant="outline" className="text-xs">Режим просмотра — нет прав на редактирование</Badge>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={canEdit ? handleDragEnd : undefined}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {STATUS_ORDER.map((col) => {
                const colTasks = filtered.filter((t) => t.status === col).sort((a, b) => a.position - b.position);
                return (
                  <Column key={col} status={col} tasks={colTasks}>
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm font-semibold">{STATUS_LABELS[col]}</div>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline">{colTasks.length}</Badge>
                        {canEdit && (
                          <button onClick={() => openCreate(col)} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <SortableContext items={colTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-2.5">
                        {colTasks.map((t) => (
                          <TaskCard
                            key={t.id}
                            task={t}
                            assignee={profiles.find((p) => p.id === t.assignee_id)}
                            commentCount={counts[t.id]?.c ?? 0}
                            attachmentCount={counts[t.id]?.a ?? 0}
                            onClick={() => setSheetTask(t)}
                            disabled={!canEdit}
                          />
                        ))}
                        {colTasks.length === 0 && (
                          <div className="rounded-xl border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">Пусто</div>
                        )}
                      </div>
                    </SortableContext>
                  </Column>
                );
              })}
            </div>
            <DragOverlay>
              {activeTask && (
                <TaskCard
                  task={activeTask}
                  assignee={profiles.find((p) => p.id === activeTask.assignee_id)}
                  commentCount={counts[activeTask.id]?.c ?? 0}
                  attachmentCount={counts[activeTask.id]?.a ?? 0}
                  onClick={() => {}}
                />
              )}
            </DragOverlay>
          </DndContext>
        )}
      </main>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        defaultStatus={defaultStatus}
        profiles={profiles}
      />
      <TaskDetailSheet
        open={!!sheetTask}
        onOpenChange={(v) => !v && setSheetTask(null)}
        task={sheetTask}
        profiles={profiles}
        onEdit={() => { if (sheetTask) { openEdit(sheetTask); setSheetTask(null); } }}
      />
    </>
  );
}

function Column({ status, tasks, children }: { status: TaskStatus; tasks: Task[]; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div ref={setNodeRef} className={`glass rounded-2xl p-4 transition ${isOver ? "ring-2 ring-accent" : ""}`}>
      {children}
    </div>
  );
}