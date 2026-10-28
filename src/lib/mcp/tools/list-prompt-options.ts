import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { MAIN_GENRES, MOODS, INSTRUMENTS, TEMPOS, VOCAL_TYPES, PRODUCTION_STYLES, SUBGENRES } from "@/lib/prompt-options";

const choices = { genres: MAIN_GENRES, moods: MOODS, instruments: INSTRUMENTS, tempos: TEMPOS, vocals: VOCAL_TYPES, production: PRODUCTION_STYLES };

export default defineTool({
  name: "list_prompt_options",
  title: "List music prompt choices",
  description: "Read The Promptor's genre, mood, instrument, tempo, vocal or production choices; optionally look up a genre's subgenres.",
  inputSchema: { category: z.enum(["genres", "moods", "instruments", "tempos", "vocals", "production"]), genre: z.string().min(1).max(100).optional() },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ category, genre }) => ({ content: [{ type: "text", text: genre ? `${genre}: ${(SUBGENRES[genre] ?? []).join(", ") || "No subgenre suggestions available."}` : `${category}: ${choices[category].join(", ")}` }] }),
});