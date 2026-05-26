import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Send, Sparkles, Square, History, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { streamAIChat } from "@/lib/ai-stream";
import { AIMessageBubble } from "./AIMessageBubble";
import { AIQuickActions } from "./AIQuickActions";
import type { AIMode } from "@/lib/ai-prompts";

type Msg = { id: string; role: "user" | "assistant"; content: string; pending?: boolean };

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function AIChatPanel({ onClose: _onClose }: { onClose: () => void }) {
  const { userId } = useAuth();
  const qc = useQueryClient();
  const [conversationId, setConversationId] = useState<string>(() => newId());
  const [mode, setMode] = useState<AIMode>("general");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  const { data: threadMessages } = useQuery({
    queryKey: ["ai-thread", userId, conversationId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_conversations")
        .select("id, role, message")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    if (threadMessages && messages.length === 0 && threadMessages.length > 0) {
      setMessages(
        threadMessages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({ id: m.id, role: m.role as "user" | "assistant", content: m.message })),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadMessages]);

  const { data: threads } = useQuery({
    queryKey: ["ai-threads", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_conversations")
        .select("conversation_id, message, created_at, role")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      const seen = new Map<string, { id: string; preview: string; created_at: string }>();
      for (const row of data ?? []) {
        if (!seen.has(row.conversation_id) && row.role === "user") {
          seen.set(row.conversation_id, {
            id: row.conversation_id,
            preview: row.message.slice(0, 60),
            created_at: row.created_at as string,
          });
        }
      }
      return Array.from(seen.values()).slice(0, 20);
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const isEmpty = messages.length === 0;

  const handleNewChat = () => {
    abortRef.current?.abort();
    setConversationId(newId());
    setMessages([]);
    setMode("general");
    setInput("");
  };

  const openThread = (id: string) => {
    abortRef.current?.abort();
    setMessages([]);
    setConversationId(id);
  };

  const deleteThread = async (id: string) => {
    await supabase.from("ai_conversations").delete().eq("conversation_id", id);
    qc.invalidateQueries({ queryKey: ["ai-threads", userId] });
    if (id === conversationId) handleNewChat();
    toast.success("Чат удалён");
  };

  const send = async (text: string, modeOverride?: AIMode) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;
    const useMode = modeOverride ?? mode;
    if (modeOverride) setMode(modeOverride);

    setInput("");
    const userMsg: Msg = { id: newId(), role: "user", content: trimmed };
    const asstId = newId();
    setMessages((p) => [...p, userMsg, { id: asstId, role: "assistant", content: "", pending: true }]);
    setStreaming(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      await streamAIChat({
        conversationId,
        message: trimmed,
        mode: useMode,
        signal: ctrl.signal,
        onDelta: (chunk) => {
          setMessages((p) =>
            p.map((m) => (m.id === asstId ? { ...m, content: m.content + chunk, pending: false } : m)),
          );
        },
      });
      qc.invalidateQueries({ queryKey: ["ai-threads", userId] });
    } catch (e: unknown) {
      if (!(e instanceof DOMException && e.name === "AbortError")) {
        const msg = e instanceof Error ? e.message : "Ошибка AI";
        toast.error(msg);
        setMessages((p) => p.filter((m) => m.id !== asstId));
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const handleQuickAction = (prompt: string, m: AIMode) => {
    setMode(m);
    setInput(prompt);
    setTimeout(() => taRef.current?.focus(), 0);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  };

  const suggestions = useMemo(
    () => ["Идеи для апрельской распродажи", "Опиши УТП для нового SKU", "Сравни ВК и Telegram для бренда"],
    [],
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-3 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold leading-tight truncate">AI Marketing Assistant</div>
            <div className="text-[11px] text-muted-foreground">premium marketing OS</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="История чатов">
                <History className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>История</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(threads ?? []).length === 0 && (
                <div className="px-2 py-3 text-xs text-muted-foreground">Пока нет чатов</div>
              )}
              {(threads ?? []).map((t) => (
                <div key={t.id} className="flex items-center gap-1 px-1">
                  <DropdownMenuItem
                    onSelect={() => openThread(t.id)}
                    className="flex-1 cursor-pointer"
                  >
                    <span className="truncate text-xs">{t.preview || "Новый чат"}</span>
                  </DropdownMenuItem>
                  <Button
                    variant="ghost" size="icon"
                    className="h-7 w-7"
                    onClick={(e) => { e.stopPropagation(); void deleteThread(t.id); }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" aria-label="Новый чат" onClick={handleNewChat}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div ref={scrollRef} className="px-4 py-4 space-y-4">
          {isEmpty ? (
            <div className="space-y-5 pt-2">
              <div className="text-center space-y-2">
                <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold">Чем помочь маркетингу?</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Посты, SEO, карточки WB/Ozon, ТЗ блогерам, контент-планы, анализ ROMI — всё в одном месте.
                </p>
              </div>
              <AIQuickActions onPick={handleQuickAction} />
              <div className="space-y-1.5">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Подсказки</div>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void send(s)}
                    className="w-full text-left text-xs px-3 py-2 rounded-lg border border-border/50 bg-card/40 hover:bg-accent transition-colors cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <AIMessageBubble key={m.id} role={m.role} content={m.content} pending={m.pending} />
            ))
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-border/60 p-3 bg-card/80">
        <div className="relative flex items-end gap-2 rounded-2xl border border-border/60 bg-background/60 focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/30 transition-colors p-2">
          <Textarea
            ref={taRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Спросите AI… (Enter — отправить, Shift+Enter — новая строка)"
            rows={1}
            className="min-h-[36px] max-h-40 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 px-2 py-1.5"
          />
          {streaming ? (
            <Button
              size="icon" variant="secondary"
              onClick={() => abortRef.current?.abort()}
              aria-label="Остановить"
              className="shrink-0"
            >
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="icon"
              onClick={() => void send(input)}
              disabled={!input.trim()}
              aria-label="Отправить"
              className="shrink-0 bg-gradient-to-br from-primary to-primary/80"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
        {mode !== "general" && (
          <div className="mt-1.5 text-[10px] uppercase tracking-wide text-muted-foreground px-1">
            Режим: {mode}
          </div>
        )}
      </div>
    </div>
  );
}