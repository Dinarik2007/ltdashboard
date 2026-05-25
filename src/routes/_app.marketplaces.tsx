import { createFileRoute } from "@tanstack/react-router";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Topbar } from "@/components/topbar";
import { Progress } from "@/components/ui/progress";
import { marketplaces, marketplaceSales } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/marketplaces")({
  head: () => ({ meta: [{ title: "Маркетплейсы — Marketing" }, { name: "description", content: "Продажи на Ozon, Wildberries и Я.Маркет." }] }),
  component: MarketplacesPage,
});

const colors: Record<string, string> = { Ozon: "oklch(0.5 0.12 148)", Wildberries: "oklch(0.32 0.07 150)", "Я.Маркет": "oklch(0.62 0.15 145)" };

function MarketplacesPage() {
  return (
    <>
      <Topbar title="Маркетплейсы" subtitle="Ozon · Wildberries · Я.Маркет" />
      <main className="flex-1 space-y-6 p-4 md:p-8">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {marketplaces.map((m) => (
            <div key={m.name} className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-foreground">{m.name}</div>
                <div className="text-xs text-muted-foreground">★ {m.rating}</div>
              </div>
              <div className="mt-3 text-3xl font-semibold tracking-tight">{m.revenue}</div>
              <div className="text-xs text-muted-foreground">{m.orders.toLocaleString("ru-RU")} заказов · ROMI {m.romi}%</div>
              <div className="mt-4 space-y-3">
                <div>
                  <div className="mb-1 flex justify-between text-xs"><span className="text-muted-foreground">Выкуп</span><span className="font-medium">{m.buyout}%</span></div>
                  <Progress value={m.buyout} className="h-2" />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Реклама</span><span className="font-medium">{m.adSpend}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="mb-4 text-sm font-semibold">Продажи по маркетплейсам, тыс. ₽</div>
          <div className="h-[340px]">
            <ResponsiveContainer>
              <AreaChart data={marketplaceSales}>
                <defs>
                  {Object.entries(colors).map(([k, c]) => (
                    <linearGradient key={k} id={`mp-${k}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={c} stopOpacity={0.7} />
                      <stop offset="100%" stopColor={c} stopOpacity={0.05} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.015 140)" vertical={false} />
                <XAxis dataKey="m" stroke="oklch(0.48 0.03 150)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.48 0.03 150)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.9 0.015 140)", background: "white" }} />
                {Object.entries(colors).map(([k, c]) => (
                  <Area key={k} type="monotone" dataKey={k} stackId="1" stroke={c} fill={`url(#mp-${k})`} strokeWidth={2} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </>
  );
}