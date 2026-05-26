import { supabase } from "@/integrations/supabase/client";
import type { AIMode } from "./ai-prompts";

export async function streamAIChat(opts: {
  conversationId: string;
  message: string;
  mode: AIMode;
  signal?: AbortSignal;
  onDelta: (chunk: string) => void;
}): Promise<void> {
  const { data: sess } = await supabase.auth.getSession();
  const token = sess.session?.access_token;
  if (!token) throw new Error("Войдите, чтобы использовать AI-ассистента.");

  const resp = await fetch("/api/ai-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      conversationId: opts.conversationId,
      message: opts.message,
      mode: opts.mode,
    }),
    signal: opts.signal,
  });

  if (!resp.ok || !resp.body) {
    let msg = `Ошибка ${resp.status}`;
    try { const j = await resp.json(); if (j.error) msg = j.error; } catch {}
    throw new Error(msg);
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let done = false;
  while (!done) {
    const r = await reader.read();
    if (r.done) break;
    buf += decoder.decode(r.value, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, nl);
      buf = buf.slice(nl + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") { done = true; break; }
      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (typeof delta === "string" && delta) opts.onDelta(delta);
      } catch {
        buf = line + "\n" + buf;
        break;
      }
    }
  }
}