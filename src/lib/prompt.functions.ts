import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

const InputSchema = z.object({
  title: z.string().max(200).optional().default(""),
  promptType: z.string().max(100),
  songLength: z.string().max(100),
  mainGenre: z.string().max(60),
  fusionGenre: z.string().max(80),
  vocalType: z.string().max(80),
  vocalPerformance: z.string().max(80),
  vocalExtras: z.array(z.string().max(60)).max(20),
  moods: z.array(z.string().max(40)).max(20),
  energy: z.string().max(40),
  emotionDepth: z.string().max(40),
  themePreset: z.string().max(80),
  topic: z.string().max(2000).optional().default(""),
  instruments: z.array(z.string().max(60)).max(40),
  drumStyle: z.string().max(80),
  tempo: z.string().max(60),
  customBpm: z.string().max(10).optional().default(""),
  key: z.string().max(40),
  productionStyle: z.string().max(80),
  soundQuality: z.string().max(80),
  avoidWords: z.string().max(500).optional().default(""),
});

export const generatePrompt = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI is not configured. Please try again later.");

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

    const system = `You are an expert music producer who writes prompts for the Suno AI music generator.

Output ONE polished, Suno-ready prompt as a single flowing paragraph (or 2 short paragraphs max). No preamble. No markdown. No headings. No lists. No quotes around the prompt. Do not explain what you wrote.

Weave genre, fusion, vocal type and delivery, mood, instruments, drum style, tempo (use the BPM if provided), key, and production style into natural producer language. Keep it concrete and sensory.

If the user supplied "AVOID" terms or styles, strictly do not use any of those words or describe those styles. Never reference real artist names or copyrighted lyrics. Honor the requested prompt type and length/structure.`;

    try {
      const { text } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        system,
        prompt: userBlock,
      });
      return { prompt: text.trim() };
    } catch (err: unknown) {
      const e = err as { statusCode?: number; status?: number; message?: string };
      const status = e.statusCode ?? e.status;
      if (status === 429) throw new Error("Rate limit reached. Please wait a moment and try again.");
      if (status === 402) throw new Error("AI credits exhausted. Add credits in workspace settings.");
      throw new Error(e.message || "Failed to generate prompt. Please try again.");
    }
  });
