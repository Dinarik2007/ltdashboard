import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Topbar } from "@/components/topbar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { budgets, budgetTransactions } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/budgets")({
  head: () => ({ meta: [{ title: "Бюджеты — Marketing" }, { name: "description", content: "План vs факт по каналам." }] }),
  component: BudgetsPage,
});

const pieColors = ["oklch(0.32 0.07 150)", "oklch(0.5 0.12 148)", "oklch(0.62 0.15 145)", "oklch(0.74 0.13 130)", "oklch(0.82 0.11 110)", "oklch(0.55 0.09 200)", "oklch(0.7 0.16 90)"];
const statusColor: Record<string, string> = {
  "Оплачено": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "В обработке": "bg-amber-100 text-amber-800 border-amber-200",
  "Отклонено": "bg-rose-100 text-rose-800 border-rose-200",
};

function BudgetsPage() {
  const total = budgets.reduce((s, b) => s + b.fact, 0);
  const plan = budgets.reduce((s, b) => s + b.plan, 0);
  return (
    <>
      <Topbar title="Бюджеты" subtitle="План vs факт · распределение расходов" />
      <main className="flex-1 space-y-6 p-4 md:p-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="glass rounded-2xl p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">План</div>
            <div className="mt-2 text-3xl font-semibold">₽ {plan.toLocaleString("ru-RU")}K</div>
          </div>
          <div className="glass rounded-2xl p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Факт</div>
            <div className="mt-2 text-3xl font-semibold">₽ {total.toLocaleString("ru-RU")}K</div>
          </div>
          <div className="glass rounded-2xl p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Исполнение</div>
            <div className="mt-2 text-3xl font-semibold text-emerald-700">{Math.round((total/plan)*100)}%</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="glass rounded-2xl p-5 xl:col-span-2">
            <div className="mb-4 text-sm font-semibold">План vs Факт по каналам</div>
            <div className="h-[320px]">
              <ResponsiveContainer>
                <BarChart data={budgets}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.015 140)" vertical={false} />
                  <XAxis dataKey="channel" stroke="oklch(0.48 0.03 150)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="oklch(0.48 0.03 150)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.9 0.015 140)", background: "white" }} />
                  <Bar dataKey="plan" fill="oklch(0.82 0.05 145)" radius={[8,8,0,0]} />
                  <Bar dataKey="fact" fill="oklch(0.32 0.07 150)" radius={[8,8,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="glass rounded-2xl p-5">
            <div className="mb-4 text-sm font-semibold">Распределение факт</div>
            <div className="h-[320px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={budgets} dataKey="fact" nameKey="channel" innerRadius={60} outerRadius={110} paddingAngle={2}>
                    {budgets.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.9 0.015 140)", background: "white" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="mb-4 text-sm font-semibold">Транзакции</div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Канал</TableHead>
                <TableHead>Кампания</TableHead>
                <TableHead className="text-right">Сумма</TableHead>
                <TableHead>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgetTransactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="text-muted-foreground">{t.date}</TableCell>
                  <TableCell>{t.channel}</TableCell>
                  <TableCell className="font-medium">{t.campaign}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{t.amount}</TableCell>
                  <TableCell><Badge variant="outline" className={statusColor[t.status]}>{t.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </>
  );
}