import {
  DRUM_STYLES, EMOTION_DEPTHS, ENERGY_LEVELS, FUSION_GENRES, INSTRUMENTS,
  KEYS, MAIN_GENRES, MOODS, PRODUCTION_STYLES, SOUND_QUALITIES, TEMPOS,
  THEME_PRESETS, VOCAL_EXTRAS, VOCAL_PERFORMANCES, VOCAL_TYPES,
  STANDARD_MAIN_GENRES, STANDARD_MOODS, STANDARD_INSTRUMENTS,
  STANDARD_DRUM_STYLES, STANDARD_PRODUCTION_STYLES,
  type PromptInputs,
} from "./prompt-options";

const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

const pickMany = <T,>(arr: readonly T[], min: number, max: number): T[] => {
  const n = min + Math.floor(Math.random() * (max - min + 1));
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
};

export function randomizeVibe(current: PromptInputs, isPro = false): PromptInputs {
  const tempo = pick(TEMPOS.filter((t) => t !== "Custom BPM"));
  const mainGenres = isPro ? MAIN_GENRES : STANDARD_MAIN_GENRES;
  const moods = isPro ? MOODS : STANDARD_MOODS;
  const instruments = isPro ? INSTRUMENTS : STANDARD_INSTRUMENTS;
  const drumStyles = isPro ? DRUM_STYLES : STANDARD_DRUM_STYLES;
  const productionStyles = isPro ? PRODUCTION_STYLES : STANDARD_PRODUCTION_STYLES;
  return {
    ...current,
    promptType: current.promptType,
    songLength: current.songLength,
    mainGenre: pick(mainGenres),
    fusionGenre: pick(FUSION_GENRES),
    vocalType: pick(VOCAL_TYPES),
    vocalPerformance: pick(VOCAL_PERFORMANCES),
    vocalExtras: pickMany(VOCAL_EXTRAS, 1, 3),
    moods: pickMany(moods, 2, 4),
    energy: pick(ENERGY_LEVELS),
    emotionDepth: pick(EMOTION_DEPTHS),
    themePreset: pick(THEME_PRESETS),
    instruments: pickMany(instruments, 3, 6),
    drumStyle: pick(drumStyles),
    tempo,
    customBpm: "",
    key: pick(KEYS),
    productionStyle: pick(productionStyles),
    soundQuality: pick(SOUND_QUALITIES),
  };
}
