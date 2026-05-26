import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Topbar } from "@/components/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { POSITION_LABELS, ROLE_LABELS } from "@/lib/tasks-types";
import type { EmployeePosition } from "@/lib/tasks-types";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "Профиль" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { userId, email, roles, loading: authLoading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState<string>("none");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle().then(({ data }) => {
      if (data) {
        setFullName(data.full_name ?? "");
        setPhone(data.phone ?? "");
        setPosition(data.position ?? "none");
      }
      setLoading(false);
    });
  }, [userId]);

  if (authLoading) return <><Topbar title="Профиль" /><main className="flex flex-1 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></main></>;
  if (!userId) return (
    <>
      <Topbar title="Профиль" />
      <main className="flex flex-1 items-center justify-center p-8">
        <div className="max-w-sm rounded-2xl border bg-card p-8 text-center">
          <Lock className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p>Войдите, чтобы просмотреть профиль.</p>
          <Button asChild className="mt-4 gradient-leaf text-white"><Link to="/auth">Войти</Link></Button>
        </div>
      </main>
    </>
  );

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: fullName.trim() || null,
      phone: phone.trim() || null,
      position: position === "none" ? null : (position as EmployeePosition),
    }).eq("id", userId);
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Профиль обновлён");
  };

  return (
    <>
      <Topbar title="Профиль" subtitle="Личные данные сотрудника" />
      <main className="flex-1 p-4 md:p-8">
        {loading ? (
          <div className="flex items-center justify-center p-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <div className="max-w-xl space-y-4 rounded-2xl border bg-card p-6">
            <div className="space-y-1.5"><Label>Email</Label><Input value={email ?? ""} disabled /></div>
            <div className="space-y-1.5"><Label>Роль</Label><Input value={roles.map((r) => ROLE_LABELS[r]).join(", ") || "Наблюдатель"} disabled /></div>
            <div className="space-y-1.5"><Label>ФИО</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={120} placeholder="Иванов Иван Иванович" /></div>
            <div className="space-y-1.5"><Label>Телефон</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={40} placeholder="+7 999 000-00-00" /></div>
            <div className="space-y-1.5">
              <Label>Должность</Label>
              <Select value={position} onValueChange={setPosition}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Не указана</SelectItem>
                  <SelectItem value="marketolog">{POSITION_LABELS.marketolog}</SelectItem>
                  <SelectItem value="product_manager">{POSITION_LABELS.product_manager}</SelectItem>
                  <SelectItem value="smm_manager">{POSITION_LABELS.smm_manager}</SelectItem>
                  <SelectItem value="designer">{POSITION_LABELS.designer}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={save} disabled={saving} className="gradient-leaf text-white">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Сохранить"}
            </Button>
          </div>
        )}
      </main>
    </>
  );
}