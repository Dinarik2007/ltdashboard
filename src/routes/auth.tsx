import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sprout, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Вход — Зелёный Урожай" },
      { name: "description", content: "Авторизация сотрудников маркетингового кабинета." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Добро пожаловать!");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Аккаунт создан. Вход выполнен.");
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
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Зелёный Урожай</h1>
          <p className="mt-1 text-sm text-muted-foreground">Marketing Suite для сотрудников</p>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Вход</TabsTrigger>
            <TabsTrigger value="signup">Регистрация</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="mt-6 space-y-4">
              <Field id="email-in" label="Email" type="email" value={email} onChange={setEmail} />
              <Field id="pass-in" label="Пароль" type="password" value={password} onChange={setPassword} />
              <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl gradient-leaf text-primary-foreground shadow-md shadow-accent/30">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Войти"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="mt-6 space-y-4">
              <Field id="email-up" label="Рабочий email" type="email" value={email} onChange={setEmail} />
              <Field id="pass-up" label="Пароль (мин. 6 символов)" type="password" value={password} onChange={setPassword} />
              <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl gradient-leaf text-primary-foreground shadow-md shadow-accent/30">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Создать аккаунт"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Для теста регистрация открыта. Позже её можно закрыть и приглашать сотрудников вручную.
        </p>
      </div>
    </div>
  );
}

function Field({ id, label, type, value, onChange }: { id: string; label: string; type: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-foreground/80">{label}</Label>
      <Input
        id={id}
        type={type}
        required
        autoComplete={type === "password" ? "current-password" : "email"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-xl border-border/60 bg-white/80"
      />
    </div>
  );
}