import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  PROMPT_TYPES, SONG_LENGTHS, MAIN_GENRES, FUSION_GENRES, VOCAL_TYPES,
  VOCAL_PERFORMANCES, VOCAL_EXTRAS, MOODS, ENERGY_LEVELS, EMOTION_DEPTHS,
  THEME_PRESETS, INSTRUMENTS, DRUM_STYLES, TEMPOS, KEYS, PRODUCTION_STYLES,
  SOUND_QUALITIES,
} from "./prompt-options";

const CREDITS_PER_PROMPT = 2;

const enumOf = (values: readonly string[]) =>
  z.string().refine((v) => values.includes(v), { message: "Invalid value" });

const stripNewlines = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

const InputSchema = z.object({
  title: z.string().max(200).optional().default("").transform(stripNewlines),
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
  topic: z.string().max(2000).optional().default("").transform(stripNewlines),
  instruments: z.array(enumOf(INSTRUMENTS)).max(40),
  drumStyle: enumOf(DRUM_STYLES),
  tempo: enumOf(TEMPOS),
  customBpm: z.string().regex(/^\d{0,3}$/).max(3).optional().default(""),
  key: enumOf(KEYS),
  productionStyle: enumOf(PRODUCTION_STYLES),
  soundQuality: enumOf(SOUND_QUALITIES),
  avoidWords: z.string().max(500).optional().default("").transform(stripNewlines),
});

export const generatePrompt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI is not configured. Please try again later.");

    // Generate a per-attempt ref id for idempotency / refund linking
    const attemptRef = crypto.randomUUID();

    // Spend 2 credits up front (atomic; raises insufficient_credits)
    const { data: newBalance, error: spendErr } = await context.supabase.rpc("spend_credits", {
      _amount: CREDITS_PER_PROMPT,
      _ref: attemptRef,
    });
    if (spendErr) {
      const msg = (spendErr.message || "").toLowerCase();
      if (msg.includes("insufficient_credits")) {
        throw new Error("INSUFFICIENT_CREDITS: You're out of credits. Buy more to keep generating.");
      }
      throw new Error(spendErr.message || "Could not deduct credits.");
    }

    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);

    const tempoLine = data.tempo === "Custom BPM" && data.customBpm
      ? `Tempo: ${data.customBpm} BPM`
      : `Tempo: ${data.tempo}`;

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
      data.instruments.length && `Instruments: ${data.instruments.join(", ")}`,
      `Drums: ${data.drumStyle}`,
      tempoLine,
      `Key: ${data.key}`,
      `Production: ${data.productionStyle} · ${data.soundQuality}`,
      data.avoidWords && `AVOID: ${data.avoidWords}`,
    ].filter(Boolean).join("\n");

    const system = `You are an expert music producer who writes prompts for AI music generators.

Output ONE polished prompt as a single flowing paragraph (or 2 short paragraphs max). No preamble. No markdown. No headings. No lists. No quotes around the prompt. Do not explain what you wrote.

Weave genre, fusion, vocal type and delivery, mood, instruments, drum style, tempo (use the BPM if provided), key, and production style into natural producer language. Keep it concrete and sensory.

If the user supplied "AVOID" terms or styles, strictly do not use any of those words or describe those styles. Never reference real artist names or copyrighted lyrics. Honor the requested prompt type and length/structure.`;

    try {
      const { text } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        system,
        prompt: userBlock,
      });
      return { prompt: text.trim(), balance: newBalance as number };
    } catch (err: unknown) {
      // Refund the 2 credits because the AI call failed
      try {
        await context.supabase.rpc("refund_credits", {
          _amount: CREDITS_PER_PROMPT,
          _ref: attemptRef,
        });
      } catch (refundErr) {
        console.error("[credits] refund failed for", attemptRef, refundErr);
      }
      const e = err as { statusCode?: number; status?: number; message?: string };
      const status = e.statusCode ?? e.status;
      if (status === 429) throw new Error("Rate limit reached. Please wait a moment and try again. Your credits were refunded.");
      if (status === 402) throw new Error("AI credits exhausted on the server. Your prompt credits were refunded.");
      throw new Error((e.message || "Failed to generate prompt. Your credits were refunded."));
    }
  });
