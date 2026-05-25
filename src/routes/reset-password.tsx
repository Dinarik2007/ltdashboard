import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sprout, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{ title: "Сброс пароля — Зелёный Урожай" }],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase puts the recovery session on the URL hash; the client picks it up automatically.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Минимум 6 символов");
    if (password !== confirm) return toast.error("Пароли не совпадают");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Пароль обновлён");
      navigate({ to: "/" });
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-accent/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-primary/20 blur-[140px]" />
      </div>
      <div className="w-full max-w-md rounded-3xl border border-border/60 bg-white/70 p-8 shadow-2xl shadow-primary/10 backdrop-blur-xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-leaf shadow-lg shadow-accent/30">
            <Sprout className="h-6 w-6 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Новый пароль</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {ready ? "Придумайте новый пароль для входа." : "Проверяем ссылку…"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="pw" className="text-xs font-medium text-foreground/80">Новый пароль</Label>
            <Input id="pw" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 rounded-xl border-border/60 bg-white/80" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pw2" className="text-xs font-medium text-foreground/80">Повторите пароль</Label>
            <Input id="pw2" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="h-11 rounded-xl border-border/60 bg-white/80" />
          </div>
          <Button type="submit" disabled={loading || !ready} className="h-11 w-full rounded-xl gradient-leaf text-primary-foreground shadow-md shadow-accent/30">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Сохранить пароль"}
          </Button>
        </form>
      </div>
    </div>
  );
}