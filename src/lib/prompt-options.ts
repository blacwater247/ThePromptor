export const PROMPT_TYPES = [
  "Full music prompt",
  "Short music prompt",
  "Lyrics prompt",
  "Beat/instrumental prompt",
  "Hook idea",
  "Full song concept",
  "Album intro",
  "Radio single",
  "Game soundtrack",
  "Movie scene song",
];


export const SONG_LENGTHS = [
  "2-minute song",
  "3-minute radio song",
  "4-minute full song",
  "5-minute extended mix",
  "8-bar hook",
  "Verse + hook",
  "Intro + verse + hook + bridge + outro",
];

export const MAIN_GENRES = [
  "Hip-Hop", "Trap", "R&B", "Trap-Soul", "Gospel", "Afrobeat", "Amapiano",
  "Dancehall", "Reggae", "Jersey Club", "House", "Deep House", "Pop", "Rock",
  "Country Soul", "Blues", "Funk", "Phonk", "Drill", "Cinematic",
];

export const FUSION_GENRES = [
  "None", "Hip-Hop + R&B", "Trap + Soul", "Gospel + Trap", "Afrobeat + Amapiano",
  "Dancehall + R&B", "Jersey House + R&B", "Blues + Hip-Hop", "Funk + Trap",
  "Cinematic + Soul", "Rock + Gospel", "Phonk + Southern Soul",
];

export const VOCAL_TYPES = [
  "Male singer", "Female singer", "Male rapper", "Female rapper",
  "Rap/sung hybrid", "Soulful male vocal", "Soulful female vocal",
  "Choir background vocals", "Call-and-response vocals", "Group chant",
  "Smooth R&B lead", "Raspy emotional vocal", "Deep baritone vocal",
  "High falsetto vocal",
];

export const VOCAL_PERFORMANCES = [
  "Smooth", "Emotional", "Painful", "Powerful", "Soft and intimate",
  "Aggressive", "Confident", "Hypnotic", "Melodic", "Storytelling",
  "Churchy", "Street-soul", "Club-ready", "Anthemic",
];

export const VOCAL_EXTRAS = [
  "Background harmonies", "Ad-libs", "Vocal chops", "Scat vocals",
  "Choir pads", "Whisper intro", "Spoken intro", "Crowd chant",
  "DJ tag", "Call and response",
];

export const MOODS = [
  "Love", "Pain", "Victory", "Confidence", "Luxury", "Motivation",
  "Spiritual", "Dark", "Hypnotic", "Emotional", "Smooth", "Sexy",
  "Club", "Street", "Triumphant", "Nostalgic", "Cinematic", "Uplifting",
  "Mysterious", "Romantic",
];

export const ENERGY_LEVELS = ["Low", "Medium", "High", "Explosive"];
export const EMOTION_DEPTHS = ["Light", "Medium", "Deep", "Very deep"];

export const THEME_PRESETS = [
  "Love story", "Breakup", "Self-love", "Overcoming poverty", "Street survival",
  "Victory anthem", "Spiritual healing", "Hustle and ambition", "Luxury lifestyle",
  "Pain into power", "Dance party", "Game soundtrack", "Movie scene",
  "Romantic night", "Family story", "Southern roots", "Hero entrance", "Villain theme",
];

export const INSTRUMENTS = [
  "808 bass", "Deep bassline", "Piano", "Dark piano", "Electric piano",
  "Acoustic guitar", "Blues guitar", "Strings", "Brass horns", "Saxophone",
  "Flute", "Synth pads", "Choir pads", "Organ", "Congas", "Bongos",
  "Amapiano log drum", "Steel drums", "Live drums", "Trap hi-hats",
  "Snare rolls", "DJ scratches", "Vocal chops",
];

export const DRUM_STYLES = [
  "Hard-hitting trap drums", "Boom-bap drums", "Jersey bounce drums",
  "Four-on-the-floor house drums", "Amapiano groove", "Dancehall riddim",
  "Gospel clap drums", "Live soul drums", "Phonk drums", "Drill bounce",
  "Funk breakbeat",
];

export const TEMPOS = [
  "Slow: 60-75 BPM", "Mid-tempo: 76-95 BPM", "Bounce: 96-115 BPM",
  "Dance: 116-128 BPM", "Fast club: 129-145 BPM", "Custom BPM",
];

export const KEYS = [
  "Auto", "Minor key", "Major key", "D minor", "E minor", "F minor",
  "G minor", "A minor", "C major", "G major",
];

export const PRODUCTION_STYLES = [
  "Clean radio-ready mix", "Dark cinematic mix", "Smooth late-night mix",
  "Club-ready mix", "Street anthem mix", "Luxury polished mix",
  "Vintage soul mix", "Futuristic mix", "Live-band feel", "Minimal and emotional",
];

export const SOUND_QUALITIES = [
  "Demo quality", "Radio-ready", "Club mix", "Film trailer quality",
  "Premium studio quality",
];

export const AVOID_PRESETS = [
  "Artist names", "Brand names", "Explicit language", "Political themes",
  "Religious references", "Drug references", "Copyrighted lyrics",
  "The word 'neon'", "The word 'shadow'", "The word 'echo'",
] as const;

export const PROMPT_MODES = ["standard", "pro"] as const;
export type PromptMode = typeof PROMPT_MODES[number];

export type PromptInputs = {
  title: string;
  promptType: string;
  songLength: string;
  mainGenre: string;
  fusionGenre: string;
  vocalType: string;
  vocalPerformance: string;
  vocalExtras: string[];
  moods: string[];
  energy: string;
  emotionDepth: string;
  themePreset: string;
  topic: string;
  instruments: string[];
  drumStyle: string;
  tempo: string;
  customBpm: string;
  key: string;
  productionStyle: string;
  soundQuality: string;
  avoidWords: string;
  avoidPresets: string[];
};

export const DEFAULT_INPUTS: PromptInputs = {
  title: "",
  promptType: "Full music prompt",
  songLength: "3-minute radio song",
  mainGenre: "Hip-Hop",
  fusionGenre: "None",
  vocalType: "Male singer",
  vocalPerformance: "Smooth",
  vocalExtras: [],
  moods: [],
  energy: "Medium",
  emotionDepth: "Medium",
  themePreset: "Self-love",
  topic: "",
  instruments: [],
  drumStyle: "Hard-hitting trap drums",
  tempo: "Mid-tempo: 76-95 BPM",
  customBpm: "",
  key: "Auto",
  productionStyle: "Clean radio-ready mix",
  soundQuality: "Radio-ready",
  avoidWords: "",
  avoidPresets: [],
};
