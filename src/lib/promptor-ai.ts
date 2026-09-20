// Shared, client-safe types for the PROMPTOR AI intelligence layer.
import type { PromptInputs } from "./prompt-options";

export const PROMPTOR_ACTIONS = [
  "analyze",
  "surprise",
  "improve",
  "variation",
  "chat",
  "explain",
  "lyricConcept",
] as const;
export type PromptorAction = (typeof PROMPTOR_ACTIONS)[number];

export const VARIATION_STYLES = [
  "More Commercial",
  "More Soulful",
  "More Energetic",
  "More Cinematic",
  "More Minimal",
  "More Organic",
  "More Modern",
  "More Emotional",
  "More Danceable",
  "More Relaxed",
  "Simplify",
] as const;
export type VariationStyle = (typeof VARIATION_STYLES)[number];

export const QUICK_COMMANDS: { label: string; message: string }[] = [
  { label: "Build My Prompt", message: "Build the full production prompt from what we have so far." },
  { label: "Improve This", message: "Improve the current prompt: tighten it and strengthen any weak direction." },
  { label: "Add Emotion", message: "Deepen the emotional direction — mood, delivery, dynamics and atmosphere." },
  { label: "Improve Drums", message: "Improve the drums: kit choice, groove, swing, pocket and fills." },
  { label: "Improve Bass", message: "Improve the bass: tone, register, movement and how it locks with the kick." },
  { label: "Improve Vocals", message: "Improve the vocal direction: register, texture, phrasing, harmonies and ad-libs." },
  { label: "Add Instruments", message: "Add instruments that genuinely fit this record, and say what each one plays." },
  { label: "Make It Danceable", message: "Make it more danceable: tempo, groove, rhythm and low-end movement." },
  { label: "Make It Radio-Friendly", message: "Make it more radio-friendly: hook placement, structure, clarity and polish." },
  { label: "Create Alternative", message: "Create an alternative take on this idea with a different musical approach." },
  { label: "Explain This Prompt", message: "Explain in plain language why this prompt works musically." },
];

export type PromptorScore = {
  overall: number;
  genreDefinition: number;
  emotion: number;
  vocalDirection: number;
  rhythm: number;
  instrumentation: number;
  arrangement: number;
  productionDetail: number;
  clarity: number;
  recommendations: string[];
};

export type PromptorSummary = {
  genre: string;
  mood: string;
  vocals: string;
  tempo: string;
  suggestedBpm: string;
  instruments: string;
  productionStyle: string;
  songStructure: string;
};

export type PromptorResult = {
  action: PromptorAction;
  finalPrompt: string;
  originalPrompt: string;
  issues: string[];
  summary: PromptorSummary;
  fields: Partial<PromptInputs>;
  appliedLabels: string[];
  score: PromptorScore;
  /** Short assistant reply (chat action only). */
  reply?: string;
  /** One optional clarifying question, only when something essential is missing. */
  question?: string;
};

export type PromptorExplain = {
  instruments: string;
  tempo: string;
  drums: string;
  vocals: string;
  arrangement: string;
};

export type PromptorLyricConcept = {
  concept: string;
  theme: string;
  pointOfView: string;
  emotionalConflict: string;
  hookConcept: string;
  verse1: string;
  verse2: string;
  bridge: string;
  ending: string;
};

export type PromptorChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  question?: string;
  applied?: string[];
};

export const LYRIC_CONCEPT_STORAGE_KEY = "promptor.lyricConcept.v1";

export const SCORE_LABELS: [keyof PromptorScore, string][] = [
  ["genreDefinition", "Genre Definition"],
  ["emotion", "Emotion Definition"],
  ["vocalDirection", "Vocal Direction"],
  ["rhythm", "Rhythm Direction"],
  ["instrumentation", "Instrumentation"],
  ["arrangement", "Arrangement"],
  ["productionDetail", "Production Detail"],
  ["clarity", "Prompt Clarity"],
];

export const LYRIC_CONCEPT_LABELS: [keyof PromptorLyricConcept, string][] = [
  ["concept", "Song concept"],
  ["theme", "Theme"],
  ["pointOfView", "Point of view"],
  ["emotionalConflict", "Emotional conflict"],
  ["hookConcept", "Hook concept"],
  ["verse1", "Verse 1 direction"],
  ["verse2", "Verse 2 direction"],
  ["bridge", "Bridge direction"],
  ["ending", "Ending direction"],
];

export const EXPLAIN_LABELS: [keyof PromptorExplain, string][] = [
  ["instruments", "Why these instruments work together"],
  ["tempo", "How the tempo shapes the mood"],
  ["drums", "What the drums do to the groove"],
  ["vocals", "How the vocal direction carries the emotion"],
  ["arrangement", "How the arrangement supports the song"],
];
