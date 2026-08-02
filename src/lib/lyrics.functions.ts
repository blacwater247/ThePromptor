import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { sanitizeLyricsToStandard, type LyricsInputs } from "./lyrics-options";
import { LyricsFields, LYRICS_MODE_CONFIG, buildLyricsUserBlock, sanitizeLyricsOutput } from "./lyrics-prompt";

const GuestLyricsSchema = z.object(LyricsFields);

export const generateLyricsGuest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => GuestLyricsSchema.parse(input))
  .handler(async ({ data: raw }) => {
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) throw new Error("Lyrics builder is not configured. Please try again later.");

    const data = sanitizeLyricsToStandard(raw as unknown as LyricsInputs);
    const cfg = LYRICS_MODE_CONFIG.standard;

    const { createOpenAI } = await import("@ai-sdk/openai");
    const openai = createOpenAI({ apiKey: openaiKey });

    try {
      const res = await generateText({
        model: openai("gpt-4.1-mini"),
        system: cfg.system,
        prompt: buildLyricsUserBlock(data),
        temperature: cfg.temperature,
        maxOutputTokens: cfg.maxTokens,
      });
      return { lyrics: sanitizeLyricsOutput(res.text) };
    } catch (err: unknown) {
      const e = err as { statusCode?: number; status?: number };
      const status = e.statusCode ?? e.status;
      console.error("[lyrics guest] generation error", err);
      if (status === 401) throw new Error("Lyrics builder is misconfigured. Please try again later.");
      if (status === 429) throw new Error("The lyrics builder is busy. Please try again in a moment.");
      throw new Error("Failed to write lyrics. Please try again.");
    }
  });
