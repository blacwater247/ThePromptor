import { createFileRoute } from "@tanstack/react-router";
import { streamText } from "ai";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import {
  PROMPT_TYPES, SONG_LENGTHS, MAIN_GENRES, FUSION_GENRES, VOCAL_TYPES,
  VOCAL_PERFORMANCES, VOCAL_EXTRAS, MOODS, ENERGY_LEVELS, EMOTION_DEPTHS,
  THEME_PRESETS, INSTRUMENTS, DRUM_STYLES, TEMPOS, KEYS, PRODUCTION_STYLES,
  SOUND_QUALITIES, AVOID_PRESETS, PROMPT_MODES,
  ARRANGEMENTS, MIXING_STYLES, SONIC_FINISHES, HOOK_TYPES, VOCAL_FORMATS,
  BASSLINES, RHYTHM_PATTERNS, MOOD_COLORS, SUBGENRES,
  ERAS, VOCAL_REGISTERS, VOCAL_TEXTURES, HARMONY_STYLES, DYNAMICS_ARCS,
  STEREO_CHARACTERS, REFERENCE_TRAITS, OPTIMIZATION_MODES,
  sanitizeToStandard, type PromptInputs,
} from "@/lib/prompt-options";
import { isSubscriptionActive } from "@/lib/subscription";

const enumOf = (values: readonly string[]) =>
  z.string().refine((v) => values.includes(v), { message: "Invalid value" });
const optionalEnum = (values: readonly string[]) =>
  z.string().refine((v) => v === "" || values.includes(v)).optional().default("");
const stripNewlines = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

const ALL_MOOD_COLORS = Array.from(new Set(Object.values(MOOD_COLORS).flat()));
const ALL_SUBGENRES = Array.from(new Set(Object.values(SUBGENRES).flat()));

const InputSchema = z.object({
  mode: z.enum(PROMPT_MODES).default("standard"),
  title: z.string().max(80).optional().default("").transform(stripNewlines),
  promptType: enumOf(PROMPT_TYPES),
  songLength: enumOf(SONG_LENGTHS),
  mainGenre: enumOf(MAIN_GENRES),
  subgenre: optionalEnum(ALL_SUBGENRES),
  era: enumOf(ERAS),
  fusionGenre: enumOf(FUSION_GENRES),
  vocalType: enumOf(VOCAL_TYPES),
  vocalPerformance: enumOf(VOCAL_PERFORMANCES),
  vocalExtras: z.array(enumOf(VOCAL_EXTRAS)).max(20),
  vocalRegister: enumOf(VOCAL_REGISTERS),
  vocalTexture: enumOf(VOCAL_TEXTURES),
  harmonyStyle: enumOf(HARMONY_STYLES),
  moods: z.array(enumOf(MOODS)).max(20),
  moodColor: optionalEnum(ALL_MOOD_COLORS),
  energy: enumOf(ENERGY_LEVELS),
  emotionDepth: enumOf(EMOTION_DEPTHS),
  themePreset: enumOf(THEME_PRESETS),
  topic: z.string().max(200).optional().default("").transform(stripNewlines),
  instruments: z.array(enumOf(INSTRUMENTS)).max(60),
  drumStyle: enumOf(DRUM_STYLES),
  rhythmPattern: optionalEnum(RHYTHM_PATTERNS),
  tempo: enumOf(TEMPOS),
  customBpm: z.string().regex(/^\d{0,3}$/).max(3).optional().default(""),
  key: enumOf(KEYS),
  productionStyle: enumOf(PRODUCTION_STYLES),
  arrangement: optionalEnum(ARRANGEMENTS),
  dynamicsArc: enumOf(DYNAMICS_ARCS),
  mixingStyle: enumOf(MIXING_STYLES).optional().default("None"),
  sonicFinish: optionalEnum(SONIC_FINISHES),
  stereoCharacter: enumOf(STEREO_CHARACTERS),
  referenceTraits: z.array(enumOf(REFERENCE_TRAITS)).max(6),
  optimizationMode: enumOf(OPTIMIZATION_MODES),
  hookType: enumOf(HOOK_TYPES).optional().default("None"),
  vocalFormat: optionalEnum(VOCAL_FORMATS),
  bassline: enumOf(BASSLINES).optional().default("None"),
  soundQuality: enumOf(SOUND_QUALITIES),
  avoidWords: z.string().max(120).optional().default("").transform(stripNewlines),
  avoidPresets: z.array(enumOf(AVOID_PRESETS)).max(20).optional().default([]),
  environment: z.enum(["sandbox", "live"]),
});

const MODE_CONFIG = {
  standard: {
    credits: 2,
    maxTokens: 320,
    temperature: 0.85,
    system: `You write concise, ready-to-use AI music prompts.
Output ONE flowing paragraph, max 110 words. No preamble, no markdown, no headings, no lists, no surrounding quotes. Do not explain.
Weave genre, vocals, mood, instruments, drums, tempo, key, and production into natural producer language.
HARD RULE: Every item listed under REQUIRED INSTRUMENTS and the exact DRUMS style must appear by name in the output. Do not substitute, rename, generalize, or omit any of them.
Strictly avoid any AVOID terms. Never name real artists or copyrighted lyrics.`,
  },
  pro: {
    credits: 6,
    maxTokens: 550,
    temperature: 0.9,
    system: `You write studio-grade AI music prompts for professional producers.
Output a structured prompt using these bracketed sections in order: [Intro] [Verse] [Hook] [Bridge] [Outro] [Production Notes] [Mix Notes].
Each section is 1–3 short sentences of concrete producer language (instrumentation, arrangement moves, vocal delivery, dynamics, FX). Max 280 words total.
No preamble, no markdown headings (#), no lists, no surrounding quotes, no explanation of what you wrote.
Honor the requested prompt type, length, tempo (use BPM if provided), key, and production style.
HARD RULE: Every item under REQUIRED INSTRUMENTS and the exact DRUMS style must appear by name. Distribute them across [Intro]/[Verse]/[Hook]/[Bridge]/[Outro], and restate the full kit in [Production Notes]. Never substitute or omit.
Strictly avoid any AVOID terms. Never name real artists or copyrighted lyrics.`,
  },
} as const;

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

export const Route = createFileRoute("/api/prompt-stream")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const openaiKey = process.env.OPENAI_API_KEY;
        if (!openaiKey) return errorResponse("OpenAI is not configured.", 500);

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

        // Subscription check
        const { data: subRows } = await supabase
          .from("subscriptions")
          .select("status, current_period_end, cancel_at_period_end")
          .eq("user_id", userId)
          .eq("environment", data.environment)
          .order("created_at", { ascending: false })
          .limit(1);
        const isSubscriber = isSubscriptionActive(subRows?.[0]);

        if (data.mode === "pro" && !isSubscriber) {
          return errorResponse("PRO_REQUIRED: Pro Studio Prompt is a subscriber feature.", 403);
        }

        const sanitized = isSubscriber
          ? data
          : { ...data, ...sanitizeToStandard(data as unknown as PromptInputs) };

        const cfg = MODE_CONFIG[data.mode];
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Rate-limit subscribers
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
            console.error("[prompt-stream] spend_credits error", spendErr);
            return errorResponse("Could not deduct credits.", 500);
          }
          newBalance = balAfter as number;
        }

        // Build prompt
        const tempoLine = sanitized.tempo === "Custom BPM" && sanitized.customBpm
          ? `Tempo: ${sanitized.customBpm} BPM`
          : `Tempo: ${sanitized.tempo}`;
        const avoidCombined = [
          ...(sanitized.avoidPresets ?? []),
          sanitized.avoidWords,
        ].filter(Boolean).join(", ");
        const requiredInstruments = sanitized.instruments.slice();
        const instrumentsLine = requiredInstruments.length
          ? `REQUIRED INSTRUMENTS (name every one exactly): ${requiredInstruments.join(", ")}`
          : "";
        const userBlock = [
          sanitized.title && `Title: "${sanitized.title}"`,
          `Prompt type: ${sanitized.promptType}`,
          `Length/structure: ${sanitized.songLength}`,
          `Main genre: ${sanitized.mainGenre}${sanitized.subgenre ? ` (subgenre: ${sanitized.subgenre})` : ""} · Era: ${sanitized.era}`,
          sanitized.fusionGenre !== "None" && `Fusion: ${sanitized.fusionGenre}`,
          `Vocals: ${sanitized.vocalType} — ${sanitized.vocalPerformance} · Register: ${sanitized.vocalRegister} · Texture: ${sanitized.vocalTexture} · Harmony: ${sanitized.harmonyStyle}`,
          sanitized.vocalExtras.length && `Vocal extras: ${sanitized.vocalExtras.join(", ")}`,
          sanitized.moods.length && `Mood: ${sanitized.moods.join(", ")}${sanitized.moodColor ? ` — emotional color: ${sanitized.moodColor}` : ""}`,
          `Energy: ${sanitized.energy} · Emotion depth: ${sanitized.emotionDepth}`,
          `Theme: ${sanitized.themePreset}`,
          sanitized.topic && `Story/topic: ${sanitized.topic}`,
          instrumentsLine,
          `DRUMS (name exactly): ${sanitized.drumStyle}${sanitized.rhythmPattern ? ` — pattern: ${sanitized.rhythmPattern}` : ""}`,
          sanitized.bassline && sanitized.bassline !== "None" && `Bassline: ${sanitized.bassline}`,
          tempoLine,
          `Key: ${sanitized.key}`,
          `Production: ${sanitized.productionStyle} · ${sanitized.soundQuality}${sanitized.arrangement ? ` · arrangement: ${sanitized.arrangement}` : ""} · Dynamics: ${sanitized.dynamicsArc}`,
          sanitized.mixingStyle && sanitized.mixingStyle !== "None" && `Mixing: ${sanitized.mixingStyle}${sanitized.sonicFinish ? ` — finish: ${sanitized.sonicFinish}` : ""}`,
          `Stereo image: ${sanitized.stereoCharacter}`,
          sanitized.referenceTraits.length > 0 && `Reference traits: ${sanitized.referenceTraits.join(", ")}`,
          `Engine optimization: ${sanitized.optimizationMode}`,
          sanitized.hookType && sanitized.hookType !== "None" && `Hook: ${sanitized.hookType}${sanitized.vocalFormat ? ` — format: ${sanitized.vocalFormat}` : ""}`,
          avoidCombined && `AVOID: ${avoidCombined}`,
          instrumentsLine && `REMINDER — the final prompt MUST name every one of these instruments verbatim: ${requiredInstruments.join(", ")}. It MUST also name the drum style "${sanitized.drumStyle}".`,
        ].filter(Boolean).join("\n");

        try {
          const { createOpenAI } = await import("@ai-sdk/openai");
          const openai = createOpenAI({ apiKey: openaiKey });

          const result = streamText({
            model: openai("gpt-4.1-mini"),
            system: cfg.system,
            prompt: userBlock,
            temperature: cfg.temperature,
            maxOutputTokens: cfg.maxTokens,
            onFinish: async () => {
              try {
                await supabaseAdmin.from("generations_log").insert({
                  user_id: userId,
                  mode: data.mode,
                });
              } catch (e) {
                console.error("[prompt-stream] log insert failed", e);
              }
            },
            onError: async ({ error }) => {
              console.error("[prompt-stream] stream error", error);
              if (!isSubscriber) {
                try {
                  await supabaseAdmin.rpc("refund_credits", {
                    _user_id: userId,
                    _amount: cfg.credits,
                    _ref: attemptRef,
                  });
                } catch (refundErr) {
                  console.error("[prompt-stream] refund failed", refundErr);
                }
              }
            },
          });

          const response = result.toTextStreamResponse();
          // Advertise metadata via custom headers (best-effort).
          const headers = new Headers(response.headers);
          if (newBalance !== null) headers.set("X-Credit-Balance", String(newBalance));
          headers.set("X-Unlimited", isSubscriber ? "1" : "0");
          headers.set("X-Mode", data.mode);
          return new Response(response.body, { status: response.status, headers });
        } catch (err: unknown) {
          if (!isSubscriber) {
            try {
              await supabaseAdmin.rpc("refund_credits", {
                _user_id: userId,
                _amount: cfg.credits,
                _ref: attemptRef,
              });
            } catch (refundErr) {
              console.error("[prompt-stream] refund failed", refundErr);
            }
          }
          console.error("[prompt-stream] setup error", err);
          return errorResponse("Failed to start prompt stream.", 500);
        }
      },
    },
  },
});
