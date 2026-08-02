import { createFileRoute } from "@tanstack/react-router";
import { streamText } from "ai";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { sanitizeLyricsToStandard, LYRIC_MODES, type LyricsInputs } from "@/lib/lyrics-options";
import { LyricsFields, LYRICS_MODE_CONFIG, buildLyricsUserBlock } from "@/lib/lyrics-prompt";
import { isSubscriptionActive } from "@/lib/subscription";

const InputSchema = z.object({
  mode: z.enum(LYRIC_MODES).default("standard"),
  ...LyricsFields,
  environment: z.enum(["sandbox", "live"]),
});

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function verifyBearer(request: Request) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Backend not configured");

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  if (!token || token.split(".").length !== 3) return null;

  const supabase = createClient<Database>(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims?.sub) return null;
  return { supabase, userId: data.claims.sub as string };
}

export const Route = createFileRoute("/api/lyrics-stream")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const openaiKey = process.env.OPENAI_API_KEY;
        if (!openaiKey) return errorResponse("Lyrics builder is not configured.", 500);

        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return errorResponse("Invalid JSON body.", 400);
        }
        const parsed = InputSchema.safeParse(raw);
        if (!parsed.success) return errorResponse("Invalid inputs.", 400);
        const data = parsed.data;

        const auth = await verifyBearer(request);
        if (!auth) return errorResponse("Unauthorized", 401);
        const { supabase, userId } = auth;

        const { data: subRows } = await supabase
          .from("subscriptions")
          .select("status, current_period_end, cancel_at_period_end")
          .eq("user_id", userId)
          .eq("environment", data.environment)
          .order("created_at", { ascending: false })
          .limit(1);
        const isSubscriber = isSubscriptionActive(subRows?.[0]);

        if (data.mode === "pro" && !isSubscriber) {
          return errorResponse("PRO_REQUIRED: Pro Lyrics is a subscriber feature.", 403);
        }

        const sanitized = isSubscriber
          ? (data as unknown as LyricsInputs)
          : sanitizeLyricsToStandard(data as unknown as LyricsInputs);

        const cfg = LYRICS_MODE_CONFIG[data.mode];
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        if (isSubscriber) {
          const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
          const { count } = await supabaseAdmin
            .from("generations_log")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
            .gte("created_at", since);
          if ((count ?? 0) >= 60) {
            return errorResponse("RATE_LIMITED: Hourly limit reached.", 429);
          }
        }

        const attemptRef = crypto.randomUUID();
        let newBalance: number | null = null;
        if (!isSubscriber) {
          const { data: balAfter, error: spendErr } = await supabaseAdmin.rpc("spend_credits", {
            _user_id: userId,
            _amount: cfg.credits,
            _ref: attemptRef,
          });
          if (spendErr) {
            const msg = (spendErr.message || "").toLowerCase();
            if (msg.includes("insufficient_credits")) {
              return errorResponse("INSUFFICIENT_CREDITS: You're out of credits.", 402);
            }
            console.error("[lyrics-stream] spend_credits error", spendErr);
            return errorResponse("Could not deduct credits.", 500);
          }
          newBalance = balAfter as number;
        }

        const refund = async () => {
          if (isSubscriber) return;
          try {
            await supabaseAdmin.rpc("refund_credits", {
              _user_id: userId,
              _amount: cfg.credits,
              _ref: attemptRef,
            });
          } catch (refundErr) {
            console.error("[lyrics-stream] refund failed", refundErr);
          }
        };

        try {
          const { createOpenAI } = await import("@ai-sdk/openai");
          const openai = createOpenAI({ apiKey: openaiKey });

          const result = streamText({
            model: openai("gpt-4.1-mini"),
            system: cfg.system,
            prompt: buildLyricsUserBlock(sanitized),
            temperature: cfg.temperature,
            maxOutputTokens: cfg.maxTokens,
            onFinish: async () => {
              try {
                await supabaseAdmin.from("generations_log").insert({
                  user_id: userId,
                  mode: data.mode,
                });
              } catch (e) {
                console.error("[lyrics-stream] log insert failed", e);
              }
            },
            onError: async ({ error }) => {
              console.error("[lyrics-stream] stream error", error);
              await refund();
            },
          });

          const response = result.toTextStreamResponse();
          const headers = new Headers(response.headers);
          if (newBalance !== null) headers.set("X-Credit-Balance", String(newBalance));
          headers.set("X-Unlimited", isSubscriber ? "1" : "0");
          headers.set("X-Mode", data.mode);
          return new Response(response.body, { status: response.status, headers });
        } catch (err) {
          await refund();
          console.error("[lyrics-stream] setup error", err);
          return errorResponse("Failed to start lyrics stream.", 500);
        }
      },
    },
  },
});
