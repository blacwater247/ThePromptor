import { z } from "zod";
import {
  LYRIC_GENRES, LYRIC_MOODS, THEME_PRESETS, VOCAL_TYPES, SONG_STRUCTURES,
  PERSPECTIVES, RHYME_SCHEMES, WRITING_STYLES, LANGUAGES, EXPLICITNESS,
  LYRIC_LENGTHS, type LyricsInputs,
} from "./lyrics-options";

const enumOf = (values: readonly string[]) =>
  z.string().refine((v) => values.includes(v), { message: "Invalid value" });

const stripNewlines = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

export const LyricsFields = {
  title: z.string().max(80).optional().default("").transform(stripNewlines),
  genre: enumOf(LYRIC_GENRES),
  moods: z.array(enumOf(LYRIC_MOODS)).max(20),
  theme: enumOf(THEME_PRESETS),
  topic: z.string().max(400).optional().default("").transform(stripNewlines),
  perspective: enumOf(PERSPECTIVES),
  vocalType: enumOf(VOCAL_TYPES),
  structure: enumOf(SONG_STRUCTURES),
  rhymeScheme: enumOf(RHYME_SCHEMES),
  writingStyle: enumOf(WRITING_STYLES),
  language: enumOf(LANGUAGES),
  explicitness: enumOf(EXPLICITNESS),
  length: enumOf(LYRIC_LENGTHS),
  keyPhrase: z.string().max(120).optional().default("").transform(stripNewlines),
  avoidWords: z.string().max(160).optional().default("").transform(stripNewlines),
};

export const LYRICS_MODE_CONFIG = {
  standard: {
    credits: 2,
    maxTokens: 900,
    temperature: 0.95,
    system: `You are a professional songwriter. Write ORIGINAL song lyrics.
Label every section on its own line with square brackets: [Intro] [Verse 1] [Pre-Hook] [Hook] [Verse 2] [Bridge] [Outro].
Write real, singable lines — no placeholders, no explanations, no markdown, no surrounding quotes, no commentary before or after.
Match the requested genre, mood, perspective, rhyme approach, and language.
Never reproduce existing copyrighted lyrics and never name real artists. Everything you write must be original.`,
  },
  pro: {
    credits: 6,
    maxTokens: 1600,
    temperature: 0.95,
    system: `You are an award-winning songwriter and topliner. Write ORIGINAL, studio-grade song lyrics.
Label every section on its own line with square brackets: [Intro] [Verse 1] [Pre-Hook] [Hook] [Verse 2] [Bridge] [Outro].
Craft vivid, specific imagery, strong internal rhyme, a memorable repeatable hook, and a bridge that turns the story.
After the lyrics, add a final section titled [Performance Notes] with 3-5 short bullet-free lines covering vocal delivery, ad-lib placement, harmony stacks, and dynamics.
No explanations, no markdown headings, no surrounding quotes.
Never reproduce existing copyrighted lyrics and never name real artists. Everything you write must be original.`,
  },
} as const;

export function buildLyricsUserBlock(d: LyricsInputs): string {
  return [
    d.title && `Working title: "${d.title}"`,
    `Genre: ${d.genre}`,
    d.moods.length && `Mood: ${d.moods.join(", ")}`,
    `Theme: ${d.theme}`,
    d.topic && `Story / what the song is about: ${d.topic}`,
    `Point of view: ${d.perspective}`,
    `Vocal: ${d.vocalType}`,
    `Song structure (follow exactly): ${d.structure}`,
    `Length: ${d.length}`,
    `Rhyme approach: ${d.rhymeScheme}`,
    `Writing style: ${d.writingStyle}`,
    `Language: ${d.language}`,
    `Content rating: ${d.explicitness}`,
    d.keyPhrase && `MUST include this phrase in the hook, verbatim: "${d.keyPhrase}"`,
    d.avoidWords && `AVOID these words/themes entirely: ${d.avoidWords}`,
    `Write the finished lyrics now.`,
  ].filter(Boolean).join("\n");
}

export function sanitizeLyricsOutput(text: string): string {
  let t = text.trim();
  t = t.replace(/^```[a-z]*\n?/i, "").replace(/```$/i, "").trim();
  t = t.replace(/^(lyrics|final lyrics|output)\s*[:\-—]\s*/i, "");
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    t = t.slice(1, -1).trim();
  }
  return t;
}
