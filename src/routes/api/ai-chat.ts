import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { SYSTEM_PROMPTS, type AIMode } from "@/lib/ai-prompts";

const BodySchema = z.object({
  conversationId: z.string().uuid(),
  message: z.string().min(1).max(8000),
  mode: z
    .enum([
      "general", "post", "seo", "wb-ozon", "blogger-brief",
      "content-plan", "pr", "marketing-analysis", "sku", "reels", "romi",
    ])
    .default("general"),
});

export const Route = createFileRoute("/api/ai-chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authHeader = request.headers.get("authorization") ?? "";
        const token = authHeader.replace(/^Bearer\s+/i, "");
        if (!token) return new Response("Unauthorized", { status: 401 });

        const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
        if (userErr || !userData.user) return new Response("Unauthorized", { status: 401 });
        const userId = userData.user.id;

        let parsed;
        try {
          parsed = BodySchema.parse(await request.json());
        } catch (e) {
          return new Response(JSON.stringify({ error: "Invalid request" }), {
            status: 400, headers: { "content-type": "application/json" },
          });
        }
        const { conversationId, message, mode } = parsed;

        const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
        if (!LOVABLE_API_KEY) {
          return new Response(JSON.stringify({ error: "AI gateway not configured" }), {
            status: 500, headers: { "content-type": "application/json" },
          });
        }

        // Load last 20 messages for context
        const { data: history } = await supabaseAdmin
          .from("ai_conversations")
          .select("role, message")
          .eq("user_id", userId)
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true })
          .limit(20);

        const systemPrompt = SYSTEM_PROMPTS[mode as AIMode] ?? SYSTEM_PROMPTS.general;
        const messages = [
          { role: "system", content: systemPrompt },
          ...(history ?? []).map((m) => ({ role: m.role, content: m.message })),
          { role: "user", content: message },
        ];

        // Save user message immediately
        await supabaseAdmin.from("ai_conversations").insert({
          user_id: userId, conversation_id: conversationId,
          role: "user", message, mode,
        });

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages,
            stream: true,
          }),
        });

        if (!upstream.ok || !upstream.body) {
          if (upstream.status === 429) {
            return new Response(JSON.stringify({ error: "Превышен лимит запросов. Попробуйте через минуту." }), {
              status: 429, headers: { "content-type": "application/json" },
            });
          }
          if (upstream.status === 402) {
            return new Response(JSON.stringify({ error: "Закончились AI-кредиты. Пополните в Lovable Cloud." }), {
              status: 402, headers: { "content-type": "application/json" },
            });
          }
          const txt = await upstream.text();
          console.error("AI gateway error", upstream.status, txt);
          return new Response(JSON.stringify({ error: "AI gateway error" }), {
            status: 500, headers: { "content-type": "application/json" },
          });
        }

        // Tee stream: forward to client AND accumulate full text to save assistant message
        const reader = upstream.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        let buf = "";

        const stream = new ReadableStream({
          async start(controller) {
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                controller.enqueue(value);
                buf += decoder.decode(value, { stream: true });
                let nl: number;
                while ((nl = buf.indexOf("\n")) !== -1) {
                  let line = buf.slice(0, nl);
                  buf = buf.slice(nl + 1);
                  if (line.endsWith("\r")) line = line.slice(0, -1);
                  if (!line.startsWith("data: ")) continue;
                  const data = line.slice(6).trim();
                  if (data === "[DONE]") continue;
                  try {
                    const parsed = JSON.parse(data);
                    const delta = parsed.choices?.[0]?.delta?.content;
                    if (typeof delta === "string") fullText += delta;
                  } catch { /* partial */ }
                }
              }
            } catch (e) {
              console.error("stream error", e);
            } finally {
              controller.close();
              if (fullText.trim()) {
                await supabaseAdmin.from("ai_conversations").insert({
                  user_id: userId, conversation_id: conversationId,
                  role: "assistant", message: fullText, mode,
                });
              }
            }
          },
        });

        return new Response(stream, {
          headers: {
            "content-type": "text/event-stream",
            "cache-control": "no-cache",
            "connection": "keep-alive",
          },
        });
      },
    },
  },
});