import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Topbar } from "@/components/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Lock, Shield, Pencil } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Profile, AppRole, EmployeePosition } from "@/lib/tasks-types";
import { POSITION_LABELS, ROLE_LABELS, initials } from "@/lib/tasks-types";

export const Route = createFileRoute("/_app/admin")({
  head: () => ({ meta: [{ title: "Админка — Marketing" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { isAdmin, loading } = useAuth();
  if (loading) return <><Topbar title="Админка" /><main className="flex flex-1 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></main></>;
  if (!isAdmin) {
    return (
      <>
        <Topbar title="Админка" subtitle="Доступ только для администраторов" />
        <main className="flex flex-1 items-center justify-center p-8">
          <div className="max-w-sm rounded-2xl border bg-card p-8 text-center">
            <Lock className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Нет доступа</h2>
            <p className="mt-1 text-sm text-muted-foreground">Раздел доступен только администраторам.</p>
            <Button asChild className="mt-4" variant="outline"><Link to="/">На главную</Link></Button>
          </div>
        </main>
      </>
    );
  }
  return <AdminTable />;
}

type Row = Profile & { roles: AppRole[] };

function AdminTable() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Row | null>(null);

  const load = async () => {
    const [p, r] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at"),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    const rolesByUser: Record<string, AppRole[]> = {};
    (r.data ?? []).forEach((x: any) => {
      (rolesByUser[x.user_id] ??= []).push(x.role);
    });
    setRows(((p.data ?? []) as Profile[]).map((pr) => ({ ...pr, roles: rolesByUser[pr.id] ?? [] })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setRole = async (userId: string, role: AppRole) => {
    // single-role model: remove others, add this
    await supabase.from("user_roles").delete().eq("user_id", userId);
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) toast.error(error.message); else { toast.success("Роль обновлена"); load(); }
  };

  return (
    <>
      <Topbar title="Админка" subtitle="Сотрудники, роли и должности" />
      <main className="flex-1 space-y-6 p-4 md:p-8">
        {loading ? (
          <div className="flex items-center justify-center p-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <div className="rounded-2xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Сотрудник</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Телефон</TableHead>
                  <TableHead>Должность</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{initials(u.full_name, u.email)}</AvatarFallback></Avatar>
                        <span className="font-medium">{u.full_name || <span className="text-muted-foreground">—</span>}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{u.email}</TableCell>
                    <TableCell className="text-sm">{u.phone || <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell className="text-sm">{u.position ? POSITION_LABELS[u.position] : <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell>
                      <Select value={u.roles[0] ?? "viewer"} onValueChange={(v) => setRole(u.id, v as AppRole)}>
                        <SelectTrigger className="h-8 w-[160px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin"><Shield className="mr-1 inline h-3 w-3" />{ROLE_LABELS.admin}</SelectItem>
                          <SelectItem value="editor">{ROLE_LABELS.editor}</SelectItem>
                          <SelectItem value="viewer">{ROLE_LABELS.viewer}</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => setEditing(u)}><Pencil className="h-3 w-3" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
      <EditDialog row={editing} onClose={() => setEditing(null)} onSaved={load} />
    </>
  );
}

function EditDialog({ row, onClose, onSaved }: { row: Row | null; onClose: () => void; onSaved: () => void }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState<string>("none");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (row) {
      setFullName(row.full_name ?? "");
      setPhone(row.phone ?? "");
      setPosition(row.position ?? "none");
    }
  }, [row]);

  const save = async () => {
    if (!row) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: fullName.trim() || null,
      phone: phone.trim() || null,
      position: position === "none" ? null : (position as EmployeePosition),
    }).eq("id", row.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Сохранено"); onSaved(); onClose(); }
  };

  return (
    <Dialog open={!!row} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Редактировать сотрудника</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5"><Label>ФИО</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={120} /></div>
          <div className="space-y-1.5"><Label>Телефон</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={40} /></div>
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
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Отмена</Button>
          <Button onClick={save} disabled={saving} className="gradient-leaf text-white">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Сохранить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}