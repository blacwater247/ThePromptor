export type PromptInputs = {
  genre?: string;
  mood?: string;
  tempo?: string;
  style?: string;
  keywords?: string | string[];
};

export type GeneratedPrompt = {
  prompt: string;
  meta: { inputs_received: PromptInputs };
};

/**
 * Generates a prompt entirely in the browser — no network call, no
 * backend, no Railway. Mirrors the logic that used to live in
 * FastAPI's /generate-prompt route.
 */
export function generatePromptLocal(inputs: PromptInputs): GeneratedPrompt {
  const { genre = "unknown", mood, tempo, style, keywords } = inputs;
  const parts = [`genre: ${genre}`];
  if (mood) parts.push(`mood: ${mood}`);
  if (tempo) parts.push(`tempo: ${tempo}`);
  if (style) parts.push(`style: ${style}`);
  if (keywords) {
    const kw = Array.isArray(keywords) ? keywords.join(", ") : keywords;
    parts.push(`keywords: ${kw}`);
  }
  return {
    prompt: "Generated prompt — " + parts.join(", "),
    meta: { inputs_received: inputs },
  };
}
