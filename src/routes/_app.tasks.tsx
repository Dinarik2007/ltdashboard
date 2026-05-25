import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/topbar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tasks, type TaskStatus } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/tasks")({
  head: () => ({ meta: [{ title: "Задачи — Marketing" }, { name: "description", content: "Канбан задач команды маркетинга." }] }),
  component: TasksPage,
});

const columns: TaskStatus[] = ["Todo", "In Progress", "Review", "Done"];
const colHeader: Record<TaskStatus, string> = { "Todo": "К выполнению", "In Progress": "В работе", "Review": "На проверке", "Done": "Готово" };
const prioColor: Record<string, string> = { High: "bg-rose-100 text-rose-800 border-rose-200", Med: "bg-amber-100 text-amber-800 border-amber-200", Low: "bg-emerald-100 text-emerald-800 border-emerald-200" };

function TasksPage() {
  const [assignee, setAssignee] = React.useState("all");
  const filtered = tasks.filter((t) => assignee === "all" || t.assignee === assignee);
  const assignees = Array.from(new Set(tasks.map((t) => t.assignee)));

  return (
    <>
      <Topbar title="Задачи" subtitle="Командный канбан и приоритеты" />
      <main className="flex-1 space-y-6 p-4 md:p-8">
        <div className="flex flex-wrap gap-2">
          <Select value={assignee} onValueChange={setAssignee}>
            <SelectTrigger className="h-9 w-[200px] rounded-lg bg-white/70 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все исполнители</SelectItem>
              {assignees.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {columns.map((col) => {
            const colTasks = filtered.filter((t) => t.status === col);
            return (
              <div key={col} className="glass rounded-2xl p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm font-semibold">{colHeader[col]}</div>
                  <Badge variant="outline" className="bg-white/60">{colTasks.length}</Badge>
                </div>
                <div className="space-y-2.5">
                  {colTasks.map((t) => (
                    <div key={t.id} className="rounded-xl border border-border/60 bg-white/80 p-3 transition hover:-translate-y-0.5 hover:shadow-md">
                      <div className="text-sm font-medium text-foreground">{t.title}</div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-[11px] text-muted-foreground">{t.assignee} · {t.due}</div>
                        <Badge variant="outline" className={`text-[10px] ${prioColor[t.priority]}`}>{t.priority}</Badge>
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && <div className="rounded-xl border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">Пусто</div>}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}