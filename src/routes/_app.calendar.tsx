import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/topbar";
import { Badge } from "@/components/ui/badge";
import { calendarEvents } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/calendar")({
  head: () => ({ meta: [{ title: "Календарь — Marketing" }, { name: "description", content: "Маркетинговый календарь активностей." }] }),
  component: CalendarPage,
});

const typeColor: Record<string, string> = {
  campaign: "bg-emerald-100 text-emerald-800 border-emerald-200",
  post: "bg-sky-100 text-sky-800 border-sky-200",
  blogger: "bg-violet-100 text-violet-800 border-violet-200",
  event: "bg-amber-100 text-amber-800 border-amber-200",
};
const typeLabel: Record<string, string> = { campaign: "Кампания", post: "Пост", blogger: "Блогер", event: "Событие" };

function CalendarPage() {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const weekdays = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
  return (
    <>
      <Topbar title="Календарь" subtitle="Май 2026 · маркетинговые активности" />
      <main className="flex-1 space-y-6 p-4 md:p-8">
        <div className="flex flex-wrap gap-2">
          {Object.entries(typeLabel).map(([k, v]) => (
            <Badge key={k} variant="outline" className={typeColor[k]}>{v}</Badge>
          ))}
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="mb-3 grid grid-cols-7 gap-2">
            {weekdays.map((w) => <div key={w} className="text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{w}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 3 }).map((_, i) => <div key={`pad-${i}`} />)}
            {days.map((d) => {
              const ev = calendarEvents.filter((e) => e.day === d);
              return (
                <div key={d} className="min-h-[110px] rounded-xl border border-border/60 bg-white/60 p-2 transition hover:border-accent/40 hover:shadow-md">
                  <div className="mb-1 text-xs font-semibold text-foreground">{d}</div>
                  <div className="space-y-1">
                    {ev.map((e, i) => (
                      <div key={i} className={`rounded-md border px-1.5 py-1 text-[10px] font-medium ${typeColor[e.type]}`}>{e.title}</div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}