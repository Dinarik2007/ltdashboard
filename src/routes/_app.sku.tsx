import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/topbar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { skus } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/sku")({
  head: () => ({ meta: [{ title: "SKU — Marketing" }, { name: "description", content: "Каталог продукции и продажи." }] }),
  component: SkuPage,
});

function SkuPage() {
  const [cat, setCat] = React.useState("all");
  const [q, setQ] = React.useState("");
  const cats = Array.from(new Set(skus.map((s) => s.category)));
  const filtered = skus.filter((s) => (cat === "all" || s.category === cat) && (q === "" || s.name.toLowerCase().includes(q.toLowerCase()) || s.sku.toLowerCase().includes(q.toLowerCase())));

  return (
    <>
      <Topbar title="SKU" subtitle="Каталог удобрений, грунтов, семян и инструментов" />
      <main className="flex-1 space-y-6 p-4 md:p-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {cats.map((c) => {
            const items = skus.filter((s) => s.category === c);
            const revenue = items.reduce((s, i) => s + i.price * i.sold, 0);
            return (
              <div key={c} className="glass rounded-2xl p-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{c}</div>
                <div className="mt-1 text-2xl font-semibold">{items.length}</div>
                <div className="text-[11px] text-muted-foreground">₽ {(revenue/1_000_000).toFixed(2)}M выручка</div>
              </div>
            );
          })}
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-semibold">Каталог</div>
            <div className="flex flex-wrap gap-2">
              <Input placeholder="Поиск по SKU/названию…" value={q} onChange={(e) => setQ(e.target.value)} className="h-9 w-[240px] rounded-lg bg-white/70 text-sm" />
              <Select value={cat} onValueChange={setCat}>
                <SelectTrigger className="h-9 w-[180px] rounded-lg bg-white/70 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  {cats.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Наименование</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead className="text-right">Цена</TableHead>
                <TableHead className="text-right">Остаток</TableHead>
                <TableHead className="text-right">Продано</TableHead>
                <TableHead className="text-right">ROMI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.sku}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{s.sku}</TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell><Badge variant="outline" className="bg-secondary/60">{s.category}</Badge></TableCell>
                  <TableCell className="text-right tabular-nums">₽ {s.price}</TableCell>
                  <TableCell className="text-right tabular-nums">{s.stock}</TableCell>
                  <TableCell className="text-right tabular-nums">{s.sold}</TableCell>
                  <TableCell className="text-right tabular-nums text-emerald-700 font-semibold">{s.romi}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </>
  );
}