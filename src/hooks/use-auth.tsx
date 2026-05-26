import { useEffect, useState, createContext, useContext, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "editor" | "viewer";

interface AuthCtx {
  session: Session | null;
  userId: string | null;
  email: string | null;
  roles: AppRole[];
  isAdmin: boolean;
  isEditor: boolean;
  canEdit: boolean;
  loading: boolean;
}

const Ctx = createContext<AuthCtx>({
  session: null, userId: null, email: null, roles: [],
  isAdmin: false, isEditor: false, canEdit: false, loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!session?.user) { setRoles([]); return; }
    supabase.from("user_roles").select("role").eq("user_id", session.user.id)
      .then(({ data }) => setRoles((data ?? []).map((r) => r.role as AppRole)));
  }, [session?.user?.id]);

  const isAdmin = roles.includes("admin");
  const isEditor = roles.includes("editor");
  const value: AuthCtx = {
    session,
    userId: session?.user?.id ?? null,
    email: session?.user?.email ?? null,
    roles, isAdmin, isEditor,
    canEdit: isAdmin || isEditor,
    loading,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);