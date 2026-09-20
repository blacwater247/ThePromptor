// Shared, client-safe types for the PROMPTOR AI intelligence layer.
import type { PromptInputs } from "./prompt-options";

export const PROMPTOR_ACTIONS = ["analyze", "surprise", "improve", "variation"] as const;
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
};

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
