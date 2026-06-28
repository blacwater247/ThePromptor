import {
  DRUM_STYLES, EMOTION_DEPTHS, ENERGY_LEVELS, FUSION_GENRES, INSTRUMENTS,
  KEYS, MAIN_GENRES, MOODS, PRODUCTION_STYLES, SOUND_QUALITIES, TEMPOS,
  THEME_PRESETS, VOCAL_EXTRAS, VOCAL_PERFORMANCES, VOCAL_TYPES,
  type PromptInputs,
} from "./prompt-options";

const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

const pickMany = <T,>(arr: readonly T[], min: number, max: number): T[] => {
  const n = min + Math.floor(Math.random() * (max - min + 1));
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
};

export function randomizeVibe(current: PromptInputs): PromptInputs {
  const tempo = pick(TEMPOS.filter((t) => t !== "Custom BPM"));
  return {
    ...current,
    promptType: current.promptType,
    songLength: current.songLength,
    mainGenre: pick(MAIN_GENRES),
    fusionGenre: pick(FUSION_GENRES),
    vocalType: pick(VOCAL_TYPES),
    vocalPerformance: pick(VOCAL_PERFORMANCES),
    vocalExtras: pickMany(VOCAL_EXTRAS, 1, 3),
    moods: pickMany(MOODS, 2, 4),
    energy: pick(ENERGY_LEVELS),
    emotionDepth: pick(EMOTION_DEPTHS),
    themePreset: pick(THEME_PRESETS),
    instruments: pickMany(INSTRUMENTS, 3, 6),
    drumStyle: pick(DRUM_STYLES),
    tempo,
    customBpm: "",
    key: pick(KEYS),
    productionStyle: pick(PRODUCTION_STYLES),
    soundQuality: pick(SOUND_QUALITIES),
  };
}
