// Option lists for the Lyrics Builder.
// STANDARD_* = available to everyone. PRO_* = subscriber-only.

import { STANDARD_MAIN_GENRES, PRO_MAIN_GENRES, STANDARD_MOODS, PRO_MOODS, THEME_PRESETS, VOCAL_TYPES } from "./prompt-options";

export const LYRIC_GENRES = [...STANDARD_MAIN_GENRES, ...PRO_MAIN_GENRES];
export const LYRIC_MOODS = [...STANDARD_MOODS, ...PRO_MOODS];
export { STANDARD_MAIN_GENRES, PRO_MAIN_GENRES, STANDARD_MOODS, PRO_MOODS, THEME_PRESETS, VOCAL_TYPES };

export const SONG_STRUCTURES = [
  "Verse - Hook - Verse - Hook",
  "Verse - Pre - Hook - Verse - Pre - Hook",
  "Intro - Verse - Hook - Verse - Hook - Bridge - Hook",
  "Hook first - Verse - Hook - Verse - Hook",
  "Verse - Hook - Verse - Hook - Bridge - Outro",
  "Two verses only (no hook)",
  "Hook + 16-bar rap verse",
  "Freestyle / continuous",
];

export const PERSPECTIVES = [
  "First person (I / me)",
  "Second person (you)",
  "Third person (he / she / they)",
  "We / collective",
  "Narrator telling a story",
];

export const RHYME_SCHEMES = [
  "Natural / conversational",
  "AABB couplets",
  "ABAB alternating",
  "Multi-syllabic",
  "Internal rhyme heavy",
  "Slant / near rhyme",
  "Free verse (minimal rhyme)",
];

export const STANDARD_WRITING_STYLES = [
  "Simple and catchy",
  "Storytelling",
  "Emotional and vulnerable",
  "Confident and braggadocious",
  "Romantic",
  "Uplifting / inspirational",
];

export const PRO_WRITING_STYLES = [
  "Poetic and metaphor-driven",
  "Street-cinematic",
  "Gospel-testimonial",
  "Conscious / socially aware",
  "Melancholic and introspective",
  "Playful and witty wordplay",
  "Minimal and repetitive (chant-like)",
  "Spoken-word / slam",
  "Vintage soul phrasing",
  "Afro-fusion pidgin flavored",
];

export const WRITING_STYLES = [...STANDARD_WRITING_STYLES, ...PRO_WRITING_STYLES];

export const LANGUAGES = [
  "English",
  "English + Spanish mix",
  "English + Pidgin mix",
  "English + Patois mix",
  "Spanish",
  "French",
  "Portuguese",
  "Swahili",
  "Yoruba",
];

export const EXPLICITNESS = ["Clean (radio safe)", "Mild", "Explicit"];

export const LYRIC_LENGTHS = ["Short (1 verse + hook)", "Standard (2 verses + hook)", "Full song", "Extended (3 verses + bridge)"];

export const LYRIC_MODES = ["standard", "pro"] as const;
export type LyricsMode = typeof LYRIC_MODES[number];

export type LyricsInputs = {
  title: string;
  genre: string;
  moods: string[];
  theme: string;
  topic: string;
  perspective: string;
  vocalType: string;
  structure: string;
  rhymeScheme: string;
  writingStyle: string;
  language: string;
  explicitness: string;
  length: string;
  keyPhrase: string;
  avoidWords: string;
};

export const DEFAULT_LYRICS_INPUTS: LyricsInputs = {
  title: "",
  genre: STANDARD_MAIN_GENRES[0],
  moods: [],
  theme: THEME_PRESETS[0],
  topic: "",
  perspective: PERSPECTIVES[0],
  vocalType: VOCAL_TYPES[0],
  structure: SONG_STRUCTURES[0],
  rhymeScheme: RHYME_SCHEMES[0],
  writingStyle: STANDARD_WRITING_STYLES[0],
  language: LANGUAGES[0],
  explicitness: EXPLICITNESS[0],
  length: LYRIC_LENGTHS[1],
  keyPhrase: "",
  avoidWords: "",
};

const STANDARD_GENRE_SET = new Set<string>(STANDARD_MAIN_GENRES);
const STANDARD_MOOD_SET = new Set<string>(STANDARD_MOODS);
const STANDARD_STYLE_SET = new Set<string>(STANDARD_WRITING_STYLES);

/** Strip Pro-only selections back to Standard values for guests / free users. */
export function sanitizeLyricsToStandard(inputs: LyricsInputs): LyricsInputs {
  return {
    ...inputs,
    genre: STANDARD_GENRE_SET.has(inputs.genre) ? inputs.genre : DEFAULT_LYRICS_INPUTS.genre,
    moods: inputs.moods.filter((m) => STANDARD_MOOD_SET.has(m)),
    writingStyle: STANDARD_STYLE_SET.has(inputs.writingStyle)
      ? inputs.writingStyle
      : DEFAULT_LYRICS_INPUTS.writingStyle,
  };
}
