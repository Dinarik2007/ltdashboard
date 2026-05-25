import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const MONTHS = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];

function CalendarPage() {
  const today = new Date();
  const [year, setYear] = React.useState(today.getFullYear());
  const [month, setMonth] = React.useState(today.getMonth()); // 0..11
  const [selectedDay, setSelectedDay] = React.useState<number | null>(today.getDate());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Mon=0..Sun=6
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const weekdays = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const years = Array.from({ length: 11 }, (_, i) => today.getFullYear() - 3 + i);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); } else setMonth((m) => m + 1);
  };
  const goToday = () => {
    setYear(today.getFullYear()); setMonth(today.getMonth()); setSelectedDay(today.getDate());
  };

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  return (
    <>
      <Topbar title="Календарь" subtitle={`${MONTHS[month]} ${year} · маркетинговые активности`} />
      <main className="flex-1 space-y-6 p-4 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-border/60 bg-white/70" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
              <SelectTrigger className="h-9 w-[150px] rounded-xl border-border/60 bg-white/70 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => <SelectItem key={m} value={String(i)}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger className="h-9 w-[110px] rounded-xl border-border/60 bg-white/70 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-border/60 bg-white/70" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="h-9 rounded-xl border-border/60 bg-white/70" onClick={goToday}>Сегодня</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(typeLabel).map(([k, v]) => (
              <Badge key={k} variant="outline" className={typeColor[k]}>{v}</Badge>
            ))}
          </div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="mb-3 grid grid-cols-7 gap-2">
            {weekdays.map((w) => <div key={w} className="text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{w}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstWeekday }).map((_, i) => <div key={`pad-${i}`} />)}
            {days.map((d) => {
              const ev = calendarEvents.filter((e) => e.day === d);
              const isToday = isCurrentMonth && d === today.getDate();
              const isSelected = selectedDay === d;
              return (
                <button
                  type="button"
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`min-h-[110px] rounded-xl border p-2 text-left transition hover:border-accent/40 hover:shadow-md ${
                    isSelected ? "border-accent/60 bg-accent/10 shadow-md" : "border-border/60 bg-white/60"
                  }`}
                >
                  <div className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                    isToday ? "bg-primary text-primary-foreground" : "text-foreground"
                  }`}>{d}</div>
                  <div className="space-y-1">
                    {ev.map((e, i) => (
                      <div key={i} className={`rounded-md border px-1.5 py-1 text-[10px] font-medium ${typeColor[e.type]}`}>{e.title}</div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}