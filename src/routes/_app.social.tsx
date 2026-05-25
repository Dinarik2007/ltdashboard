import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Topbar } from "@/components/topbar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { socialPosts } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/social")({
  head: () => ({ meta: [{ title: "Соцсети — Marketing" }, { name: "description", content: "Контент и engagement по соцсетям." }] }),
  component: SocialPage,
});

const engagement = [
  { platform: "VK", er: 6.4, reach: 820 },
  { platform: "Telegram", er: 9.1, reach: 540 },
  { platform: "YouTube", er: 7.4, reach: 1240 },
  { platform: "Instagram", er: 5.2, reach: 420 },
  { platform: "Dzen", er: 4.6, reach: 310 },
];

const statusColor: Record<string, string> = {
  "Опубликован": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Запланирован": "bg-sky-100 text-sky-800 border-sky-200",
  "Черновик": "bg-slate-100 text-slate-700 border-slate-200",
};

function SocialPage() {
  const [platform, setPlatform] = React.useState("all");
  const [status, setStatus] = React.useState("all");
  const [q, setQ] = React.useState("");
  const filtered = socialPosts.filter((p) =>
    (platform === "all" || p.platform === platform) &&
    (status === "all" || p.status === status) &&
    (q === "" || p.title.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <>
      <Topbar title="Соцсети" subtitle="Контент-план и engagement по платформам" />
      <main className="flex-1 space-y-6 p-4 md:p-8">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          {engagement.map((e) => (
            <div key={e.platform} className="glass rounded-2xl p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{e.platform}</div>
              <div className="mt-1 text-2xl font-semibold">{e.er}%</div>
              <div className="text-[11px] text-muted-foreground">ER · охват {e.reach}K</div>
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="mb-4 text-sm font-semibold">Engagement по платформам</div>
          <div className="h-[280px]">
            <ResponsiveContainer>
              <BarChart data={engagement}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.015 140)" vertical={false} />
                <XAxis dataKey="platform" stroke="oklch(0.48 0.03 150)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.48 0.03 150)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.9 0.015 140)", background: "white" }} />
                <Bar dataKey="er" fill="oklch(0.5 0.12 148)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-semibold">Публикации</div>
            <div className="flex flex-wrap gap-2">
              <Input placeholder="Поиск…" value={q} onChange={(e) => setQ(e.target.value)} className="h-9 w-[200px] rounded-lg bg-white/70 text-sm" />
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="h-9 w-[160px] rounded-lg bg-white/70 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все платформы</SelectItem>
                  {["VK","Telegram","YouTube","Instagram","Dzen"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-9 w-[160px] rounded-lg bg-white/70 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="Опубликован">Опубликован</SelectItem>
                  <SelectItem value="Запланирован">Запланирован</SelectItem>
                  <SelectItem value="Черновик">Черновик</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Заголовок</TableHead>
                <TableHead>Платформа</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead className="text-right">Охват</TableHead>
                <TableHead className="text-right">ER</TableHead>
                <TableHead>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell>{p.platform}</TableCell>
                  <TableCell className="text-muted-foreground">{p.date}</TableCell>
                  <TableCell className="text-right tabular-nums">{p.reach.toLocaleString("ru-RU")}</TableCell>
                  <TableCell className="text-right tabular-nums">{p.er}%</TableCell>
                  <TableCell><Badge variant="outline" className={statusColor[p.status]}>{p.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </>
  );
}