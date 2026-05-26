import * as React from "react";
import { Bell, Search, Calendar as CalendarIcon, Sparkles, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { notifications } from "@/lib/mock-data";
import { useTheme } from "@/hooks/use-theme";

const levelColor: Record<string, string> = {
  warn: "bg-amber-100 text-amber-800 border-amber-200",
  info: "bg-sky-100 text-sky-800 border-sky-200",
  ok: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const [period, setPeriod] = React.useState("30");
  return (
    <header className="sticky top-0 z-30 flex flex-col gap-3 border-b border-border/60 bg-background/70 px-4 py-3 backdrop-blur-xl md:flex-row md:items-center md:justify-between md:px-8 md:py-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="md:hidden" />
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-[22px]">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground md:text-sm">{subtitle}</p>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Поиск кампаний, SKU, блогеров…" className="h-10 w-[280px] rounded-xl border-border/60 bg-white/70 pl-9 text-sm" />
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="h-10 rounded-xl border-border/60 bg-white/70 text-sm">
            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Последние 7 дней</SelectItem>
            <SelectItem value="30">Последние 30 дней</SelectItem>
            <SelectItem value="90">Последние 90 дней</SelectItem>
            <SelectItem value="ytd">С начала года</SelectItem>
          </SelectContent>
        </Select>
        <Button className="h-10 rounded-xl gradient-leaf text-primary-foreground shadow-md shadow-accent/30 hover:opacity-95">
          <Sparkles className="mr-2 h-4 w-4" /> Отчёт
        </Button>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="relative h-10 w-10 rounded-xl border-border/60 bg-white/70">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent shadow-[0_0_0_3px_white]" />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[380px] sm:max-w-[380px]">
            <SheetHeader>
              <SheetTitle>Уведомления</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-3">
              {notifications.map((n) => (
                <div key={n.id} className="rounded-xl border border-border/60 bg-card p-3 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-semibold text-foreground">{n.title}</div>
                    <Badge variant="outline" className={`text-[10px] ${levelColor[n.level]}`}>{n.level}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{n.text}</p>
                  <div className="mt-2 text-[11px] text-muted-foreground/80">{n.time}</div>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
        <Avatar className="h-10 w-10 ring-2 ring-accent/30">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">МК</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}