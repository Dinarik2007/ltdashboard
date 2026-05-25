import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Share2, Users, ShoppingBag, Wallet, CheckSquare, Calendar as CalendarIcon, Package, Sprout, LogOut, LogIn,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Соцсети", url: "/social", icon: Share2 },
  { title: "Блогеры", url: "/bloggers", icon: Users },
  { title: "Маркетплейсы", url: "/marketplaces", icon: ShoppingBag },
  { title: "Бюджеты", url: "/budgets", icon: Wallet },
  { title: "Задачи", url: "/tasks", icon: CheckSquare },
  { title: "Календарь", url: "/calendar", icon: CalendarIcon },
  { title: "SKU", url: "/sku", icon: Package },
];

export function AppSidebar({ userEmail }: { userEmail?: string | null }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (path: string) => (path === "/" ? currentPath === "/" : currentPath.startsWith(path));
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Вы вышли из системы");
    navigate({ to: "/auth" });
  };

  const isGuest = !userEmail;
  const initials = (userEmail ?? "G").slice(0, 2).toUpperCase();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border/60 px-4 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-leaf shadow-lg shadow-accent/30">
            <Sprout className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-[15px] font-semibold text-sidebar-foreground">Зелёный Урожай</div>
              <div className="text-[11px] text-sidebar-foreground/60">Marketing Suite</div>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="px-2 text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/50">
              Навигация
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {items.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className={`group h-10 rounded-xl transition-all ${
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-inner"
                          : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                      }`}
                    >
                      <Link to={item.url} className="flex items-center gap-3">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                            active ? "bg-accent text-accent-foreground" : "bg-sidebar-accent/40 text-sidebar-foreground/70 group-hover:bg-accent/30"
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                        </span>
                        {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {!collapsed && (
          <div className="mx-2 mt-6 rounded-2xl border border-sidebar-border/60 bg-sidebar-accent/40 p-4">
            <div className="text-xs font-semibold text-sidebar-foreground">Сезон 2026</div>
            <p className="mt-1 text-[11px] leading-relaxed text-sidebar-foreground/70">
              Пик активности: апрель–июнь. Бюджет на блогеров увеличен на 24%.
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-sidebar-border/60">
              <div className="h-full w-3/4 gradient-leaf" />
            </div>
          </div>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/60 p-3">
        {isGuest ? (
          <button
            onClick={() => navigate({ to: "/auth" })}
            className="flex w-full items-center gap-2.5 rounded-xl bg-sidebar-accent/60 px-3 py-2.5 text-left text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg gradient-leaf text-white">
              <LogIn className="h-4 w-4" />
            </span>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold">Войти</div>
                <div className="text-[10px] text-sidebar-foreground/60">для редактирования</div>
              </div>
            )}
          </button>
        ) : (
          <div className="flex items-center gap-2.5">
            <Avatar className="h-9 w-9 ring-2 ring-accent/30">
              <AvatarFallback className="bg-accent text-accent-foreground text-[11px] font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium text-sidebar-foreground">{userEmail}</div>
                <div className="text-[10px] text-sidebar-foreground/60">сотрудник</div>
              </div>
            )}
            <button
              onClick={handleLogout}
              title="Выйти"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}