import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  PROMPT_TYPES, SONG_LENGTHS, MAIN_GENRES, FUSION_GENRES, VOCAL_TYPES,
  VOCAL_PERFORMANCES, VOCAL_EXTRAS, MOODS, ENERGY_LEVELS, EMOTION_DEPTHS,
  THEME_PRESETS, INSTRUMENTS, DRUM_STYLES, TEMPOS, KEYS, PRODUCTION_STYLES,
  SOUND_QUALITIES, AVOID_PRESETS, PROMPT_MODES,
} from "./prompt-options";

const enumOf = (values: readonly string[]) =>
  z.string().refine((v) => values.includes(v), { message: "Invalid value" });

const stripNewlines = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

const InputSchema = z.object({
  mode: z.enum(PROMPT_MODES).default("standard"),
  title: z.string().max(80).optional().default("").transform(stripNewlines),
  promptType: enumOf(PROMPT_TYPES),
  songLength: enumOf(SONG_LENGTHS),
  mainGenre: enumOf(MAIN_GENRES),
  fusionGenre: enumOf(FUSION_GENRES),
  vocalType: enumOf(VOCAL_TYPES),
  vocalPerformance: enumOf(VOCAL_PERFORMANCES),
  vocalExtras: z.array(enumOf(VOCAL_EXTRAS)).max(20),
  moods: z.array(enumOf(MOODS)).max(20),
  energy: enumOf(ENERGY_LEVELS),
  emotionDepth: enumOf(EMOTION_DEPTHS),
  themePreset: enumOf(THEME_PRESETS),
  topic: z.string().max(200).optional().default("").transform(stripNewlines),
  instruments: z.array(enumOf(INSTRUMENTS)).max(40),
  drumStyle: enumOf(DRUM_STYLES),
  tempo: enumOf(TEMPOS),
  customBpm: z.string().regex(/^\d{0,3}$/).max(3).optional().default(""),
  key: enumOf(KEYS),
  productionStyle: enumOf(PRODUCTION_STYLES),
  soundQuality: enumOf(SOUND_QUALITIES),
  avoidWords: z.string().max(120).optional().default("").transform(stripNewlines),
  avoidPresets: z.array(enumOf(AVOID_PRESETS)).max(20).optional().default([]),
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
    maxTokens: 700,
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

function sanitizeOutput(text: string): string {
  let t = text.trim();
  t = t.replace(/^```[a-z]*\n?/i, "").replace(/```$/i, "").trim();
  t = t.replace(/^(prompt|final prompt|output)\s*[:\-—]\s*/i, "");
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    t = t.slice(1, -1).trim();
  }
  return t;
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
}

function findMissing(output: string, required: string[]): string[] {
  const hay = normalize(output);
  return required.filter((item) => {
    const n = normalize(item);
    return n.length > 0 && !hay.includes(n);
  });
}

export const generatePrompt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) throw new Error("OpenAI is not configured. Please add OPENAI_API_KEY.");

    const cfg = MODE_CONFIG[data.mode];

    // Check active subscription — subscribers get unlimited (Standard + Pro).
    // Honor Stripe grace period + trialing via the shared helper.
    const { isSubscriptionActive } = await import("./subscription");
    const { data: subRows } = await context.supabase
      .from("subscriptions")
      .select("status, current_period_end, cancel_at_period_end")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(1);
    const isSubscriber = isSubscriptionActive(subRows?.[0]);

    // Pro mode requires an active subscription
    if (data.mode === "pro" && !isSubscriber) {
      throw new Error("PRO_REQUIRED: Pro Studio Prompt is a subscriber feature. Upgrade to unlock.");
    }

    const attemptRef = crypto.randomUUID();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Rate-limit subscribers to prevent abuse: 60 generations / hour
    if (isSubscriber) {
      const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count } = await supabaseAdmin
        .from("generations_log")
        .select("id", { count: "exact", head: true })
        .eq("user_id", context.userId)
        .gte("created_at", since);
      if ((count ?? 0) >= 60) {
        throw new Error("RATE_LIMITED: You've hit the hourly generation limit. Try again in a bit.");
      }
    }

    let newBalance: number | null = null;
    if (!isSubscriber) {
      const { data: balAfter, error: spendErr } = await supabaseAdmin.rpc("spend_credits", {
        _user_id: context.userId,
        _amount: cfg.credits,
        _ref: attemptRef,
      });
      if (spendErr) {
        const msg = (spendErr.message || "").toLowerCase();
        if (msg.includes("insufficient_credits")) {
          throw new Error("INSUFFICIENT_CREDITS: You're out of credits. Buy more to keep generating.");
        }
        console.error("[prompt] spend_credits error", spendErr);
        throw new Error("Could not deduct credits. Please try again.");
      }
      newBalance = balAfter as number;
    }


    const { createOpenAI } = await import("@ai-sdk/openai");
    const openai = createOpenAI({ apiKey: openaiKey });

    const tempoLine = data.tempo === "Custom BPM" && data.customBpm
      ? `Tempo: ${data.customBpm} BPM`
      : `Tempo: ${data.tempo}`;

    const avoidCombined = [
      ...(data.avoidPresets ?? []),
      data.avoidWords,
    ].filter(Boolean).join(", ");

    const requiredInstruments = data.instruments.slice();
    const instrumentsLine = requiredInstruments.length
      ? `REQUIRED INSTRUMENTS (name every one exactly): ${requiredInstruments.join(", ")}`
      : "";

    const userBlock = [
      data.title && `Title: "${data.title}"`,
      `Prompt type: ${data.promptType}`,
      `Length/structure: ${data.songLength}`,
      `Main genre: ${data.mainGenre}`,
      data.fusionGenre !== "None" && `Fusion: ${data.fusionGenre}`,
      `Vocals: ${data.vocalType} — ${data.vocalPerformance}`,
      data.vocalExtras.length && `Vocal extras: ${data.vocalExtras.join(", ")}`,
      data.moods.length && `Mood: ${data.moods.join(", ")}`,
      `Energy: ${data.energy} · Emotion depth: ${data.emotionDepth}`,
      `Theme: ${data.themePreset}`,
      data.topic && `Story/topic: ${data.topic}`,
      instrumentsLine,
      `DRUMS (name exactly): ${data.drumStyle}`,
      tempoLine,
      `Key: ${data.key}`,
      `Production: ${data.productionStyle} · ${data.soundQuality}`,
      avoidCombined && `AVOID: ${avoidCombined}`,
      instrumentsLine && `REMINDER — the final prompt MUST name every one of these instruments verbatim: ${requiredInstruments.join(", ")}. It MUST also name the drum style "${data.drumStyle}".`,
    ].filter(Boolean).join("\n");

    const requiredForCheck = [...requiredInstruments, data.drumStyle];

    try {
      const first = await generateText({
        model: openai("gpt-4.1-mini"),
        system: cfg.system,
        prompt: userBlock,
        temperature: cfg.temperature,
        maxOutputTokens: cfg.maxTokens,
      });

      let finalText = first.text;
      const missing = findMissing(finalText, requiredForCheck);
      if (missing.length > 0) {
        try {
          const retry = await generateText({
            model: openai("gpt-4.1-mini"),
            system: cfg.system,
            prompt: `${userBlock}\n\nPrevious attempt omitted these required items: ${missing.join(", ")}. Rewrite the prompt so every REQUIRED INSTRUMENT and the DRUMS style is named verbatim.`,
            temperature: cfg.temperature,
            maxOutputTokens: cfg.maxTokens,
          });
          const retryMissing = findMissing(retry.text, requiredForCheck);
          if (retryMissing.length < missing.length) finalText = retry.text;
          if (retryMissing.length > 0) {
            console.warn("[prompt] still missing after retry:", retryMissing);
          }
        } catch (retryErr) {
          console.warn("[prompt] retry failed, using first attempt", retryErr);
        }
      }

      // Log for rate-limit tracking (best-effort, non-blocking on failure)
      try {
        await supabaseAdmin.from("generations_log").insert({
          user_id: context.userId,
          mode: data.mode,
        });
      } catch (logErr) {
        console.error("[prompt] log insert failed", logErr);
      }
      return { prompt: sanitizeOutput(finalText), balance: newBalance, mode: data.mode, unlimited: isSubscriber };

    } catch (err: unknown) {
      if (!isSubscriber) {
        try {
          await supabaseAdmin.rpc("refund_credits", {
            _user_id: context.userId,
            _amount: cfg.credits,
            _ref: attemptRef,
          });
        } catch (refundErr) {
          console.error("[credits] refund failed for", attemptRef, refundErr);
        }
      }
      const e = err as { statusCode?: number; status?: number; message?: string };
      const status = e.statusCode ?? e.status;
      console.error("[prompt] generation error", err);
      const suffix = isSubscriber ? "Please try again." : "Your credits were refunded.";
      if (status === 401) throw new Error(`OpenAI API key is invalid. ${suffix}`);
      if (status === 429) throw new Error(`OpenAI rate limit reached. Please try again shortly. ${suffix}`);
      if (status === 402 || /quota/i.test(e.message || "")) throw new Error(`OpenAI quota exceeded. ${suffix}`);
      throw new Error(`Failed to generate prompt. ${suffix}`);
    }
  });

