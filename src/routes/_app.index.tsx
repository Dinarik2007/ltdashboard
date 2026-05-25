import { createFileRoute } from "@tanstack/react-router";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Topbar } from "@/components/topbar";
import { KpiCard } from "@/components/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  kpis, spendByChannel, reachWeekly, subscribersByPlatform, romiByCampaign, bestChannels, bestProducts,
} from "@/lib/mock-data";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Зелёный Урожай Marketing" },
      { name: "description", content: "KPI, охваты, ROMI и лучшие каналы маркетинга бренда садовых товаров и удобрений." },
    ],
  }),
  component: Dashboard,
});

const chartColors = ["oklch(0.32 0.07 150)", "oklch(0.5 0.12 148)", "oklch(0.62 0.15 145)", "oklch(0.74 0.13 130)", "oklch(0.82 0.11 110)"];

function ChartCard({ title, subtitle, children, action }: { title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-foreground">{title}</div>
          {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Dashboard() {
  return (
    <>
      <Topbar title="Dashboard" subtitle="Сезон 2026 · обзор маркетинговой активности" />
      <main className="flex-1 space-y-6 p-4 md:p-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((k) => <KpiCard key={k.label} {...k} />)}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <ChartCard title="Расходы по каналам" subtitle="Стек по месяцам, тыс. ₽" action={<Badge variant="outline" className="bg-white/60">7 мес</Badge>}>
              <div className="h-[300px]">
                <ResponsiveContainer>
                  <AreaChart data={spendByChannel}>
                    <defs>
                      {["VK", "Telegram", "YouTube", "Instagram", "Dzen"].map((k, i) => (
                        <linearGradient key={k} id={`a-${k}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={chartColors[i]} stopOpacity={0.75} />
                          <stop offset="100%" stopColor={chartColors[i]} stopOpacity={0.05} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.015 140)" vertical={false} />
                    <XAxis dataKey="month" stroke="oklch(0.48 0.03 150)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="oklch(0.48 0.03 150)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.9 0.015 140)", background: "white" }} />
                    {["VK", "Telegram", "YouTube", "Instagram", "Dzen"].map((k, i) => (
                      <Area key={k} type="monotone" dataKey={k} stackId="1" stroke={chartColors[i]} fill={`url(#a-${k})`} strokeWidth={2} />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
          <ChartCard title="Охваты по неделям" subtitle="Уникальные пользователи, тыс.">
            <div className="h-[300px]">
              <ResponsiveContainer>
                <AreaChart data={reachWeekly}>
                  <defs>
                    <linearGradient id="reach-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.62 0.15 145)" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="oklch(0.62 0.15 145)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.015 140)" vertical={false} />
                  <XAxis dataKey="w" stroke="oklch(0.48 0.03 150)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="oklch(0.48 0.03 150)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.9 0.015 140)", background: "white" }} />
                  <Area type="monotone" dataKey="reach" stroke="oklch(0.32 0.07 150)" strokeWidth={2.5} fill="url(#reach-grad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <ChartCard title="Подписчики по платформам" subtitle="тыс. подписчиков">
            <div className="h-[260px]">
              <ResponsiveContainer>
                <LineChart data={subscribersByPlatform}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.015 140)" vertical={false} />
                  <XAxis dataKey="m" stroke="oklch(0.48 0.03 150)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="oklch(0.48 0.03 150)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.9 0.015 140)", background: "white" }} />
                  {["VK", "Telegram", "YouTube", "Instagram", "Dzen"].map((k, i) => (
                    <Line key={k} type="monotone" dataKey={k} stroke={chartColors[i]} strokeWidth={2.2} dot={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
          <ChartCard title="ROMI по кампаниям" subtitle="% возврата инвестиций">
            <div className="h-[260px]">
              <ResponsiveContainer>
                <BarChart data={romiByCampaign} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.015 140)" horizontal={false} />
                  <XAxis type="number" stroke="oklch(0.48 0.03 150)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" stroke="oklch(0.48 0.03 150)" fontSize={11} tickLine={false} axisLine={false} width={130} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.9 0.015 140)", background: "white" }} />
                  <Bar dataKey="romi" fill="oklch(0.5 0.12 148)" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
          <ChartCard title="Лучшие каналы" subtitle="ROMI и доля бюджета">
            <div className="space-y-3.5">
              {bestChannels.map((c) => (
                <div key={c.name}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{c.name}</span>
                    <span className="text-xs text-muted-foreground">{c.spend} · ROMI {c.romi}%</span>
                  </div>
                  <Progress value={c.share} className="h-2" />
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        <ChartCard title="Лучшие продукты" subtitle="Топ SKU по выручке и ROMI">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {bestProducts.map((p) => (
              <div key={p.sku} className="group rounded-xl border border-border/60 bg-white/60 p-4 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{p.category}</div>
                    <div className="mt-0.5 text-sm font-semibold text-foreground">{p.name}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">SKU · {p.sku}</div>
                  </div>
                  <Badge className="gradient-leaf text-primary-foreground">ROMI {p.romi}%</Badge>
                </div>
                <div className="mt-3 flex items-end justify-between border-t border-border/60 pt-3">
                  <div>
                    <div className="text-[11px] text-muted-foreground">Выручка</div>
                    <div className="text-base font-semibold text-foreground">{p.revenue}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-muted-foreground">Остаток</div>
                    <div className="text-sm font-medium text-foreground">{p.stock} шт</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </main>
    </>
  );
}