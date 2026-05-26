import { Outlet, createFileRoute } from "@tanstack/react-router";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { AIAssistantLauncher } from "@/components/ai/AIAssistantLauncher";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Shell />
      </SidebarProvider>
    </AuthProvider>
  );
}

function Shell() {
  const { email, isAdmin } = useAuth();
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar userEmail={email} isAdmin={isAdmin} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Outlet />
      </div>
      <AIAssistantLauncher />
    </div>
  );
}