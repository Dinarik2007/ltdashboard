import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/topbar";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { bloggers } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/bloggers")({
  head: () => ({ meta: [{ title: "Блогеры — Marketing" }, { name: "description", content: "База блогеров и инфлюенсеров." }] }),
  component: BloggersPage,
});

const statusColor: Record<string, string> = {
  "Активен": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Переговоры": "bg-amber-100 text-amber-800 border-amber-200",
  "Завершён": "bg-slate-100 text-slate-700 border-slate-200",
};

function BloggersPage() {
  const [niche, setNiche] = React.useState("all");
  const filtered = bloggers.filter((b) => niche === "all" || b.niche === niche);

  return (
    <>
      <Topbar title="Блогеры" subtitle="Инфлюенс-маркетинг и интеграции" />
      <main className="flex-1 space-y-6 p-4 md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={niche} onValueChange={setNiche}>
            <SelectTrigger className="h-9 w-[200px] rounded-lg bg-white/70 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все ниши</SelectItem>
              <SelectItem value="Садоводы">Садоводы</SelectItem>
              <SelectItem value="Дачники">Дачники</SelectItem>
              <SelectItem value="Ландшафт">Ландшафт</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="bg-white/60">{filtered.length} блогеров</Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((b) => (
            <div key={b.handle} className="glass rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/15">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 ring-2 ring-accent/30"><AvatarFallback className="gradient-leaf text-primary-foreground font-semibold">{b.name[0]}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-foreground">{b.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{b.handle} · {b.platform}</div>
                </div>
                <Badge variant="outline" className={statusColor[b.status]}>{b.status}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/60 pt-3">
                <div><div className="text-[11px] text-muted-foreground">Охват</div><div className="text-sm font-semibold">{(b.reach/1000).toFixed(0)}K</div></div>
                <div><div className="text-[11px] text-muted-foreground">CPM</div><div className="text-sm font-semibold">₽{b.cpm}</div></div>
                <div><div className="text-[11px] text-muted-foreground">ROMI</div><div className="text-sm font-semibold text-emerald-700">{b.romi}%</div></div>
              </div>
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="mb-4 text-sm font-semibold">Сводная таблица</div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Блогер</TableHead>
                <TableHead>Платформа</TableHead>
                <TableHead>Ниша</TableHead>
                <TableHead className="text-right">Охват</TableHead>
                <TableHead className="text-right">CPM</TableHead>
                <TableHead className="text-right">ROMI</TableHead>
                <TableHead>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((b) => (
                <TableRow key={b.handle}>
                  <TableCell className="font-medium">{b.name} <span className="text-muted-foreground">{b.handle}</span></TableCell>
                  <TableCell>{b.platform}</TableCell>
                  <TableCell>{b.niche}</TableCell>
                  <TableCell className="text-right tabular-nums">{b.reach.toLocaleString("ru-RU")}</TableCell>
                  <TableCell className="text-right tabular-nums">₽ {b.cpm}</TableCell>
                  <TableCell className="text-right tabular-nums text-emerald-700">{b.romi}%</TableCell>
                  <TableCell><Badge variant="outline" className={statusColor[b.status]}>{b.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </>
  );
}