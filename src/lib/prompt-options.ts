// ============================================================
// Prompt option library — tiered (Standard vs Pro).
// - STANDARD_* arrays: shown to everyone (guest, free, pack).
// - PRO_* arrays: shown only to active Monthly subscribers.
// - Combined exports (MAIN_GENRES, MOODS, …) are the union used by
//   zod validators. Server sanitizes pro-only values back to a
//   Standard default when the caller isn't a Pro subscriber.
// ============================================================

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

// ------------------------------------------------------------
// GENRE (+ SUBGENRE map)
// ------------------------------------------------------------
export const STANDARD_MAIN_GENRES = [
  "Hip-Hop", "Trap", "R&B", "Trap-Soul", "Gospel", "Afrobeat", "Amapiano",
  "Dancehall", "Reggae", "House", "Pop", "Rock", "Country Soul", "Blues",
  "Funk", "Phonk", "Drill", "Cinematic", "Jersey Club", "Deep House",
];

export const PRO_MAIN_GENRES = [
  "Boom Bap", "UK Drill", "Brooklyn Drill", "Chicago Drill", "Detroit Rap",
  "Memphis Rap", "Southern Rap", "West Coast Hip-Hop", "East Coast Hip-Hop",
  "Conscious Rap", "Storytelling Rap", "Gangsta Rap", "Club Rap",
  "Lo-Fi Hip-Hop", "Jazz Rap", "Alternative Hip-Hop", "Experimental Hip-Hop",
  "Cloud Rap", "Memphis Phonk", "Drift Phonk", "Trap Phonk", "Dark Phonk",
  "Baltimore Club", "Bounce", "New Orleans Bounce", "Crunk", "Hyphy", "G-Funk",
  "Contemporary R&B", "90s R&B", "2000s R&B", "Neo-Soul", "Alternative R&B",
  "Bedroom R&B", "Quiet Storm", "Soul", "Southern Soul", "Classic Soul",
  "Psychedelic Soul", "P-Funk", "Disco", "Traditional Gospel", "Contemporary Gospel",
  "Quartet Gospel", "Choir Gospel", "Praise & Worship", "Christian R&B", "Christian Rap",
  "Electric Blues", "Delta Blues", "Soul Blues", "Classic Rock", "Alternative Rock",
  "Hard Rock", "Soft Rock", "Pop Rock", "Indie Rock", "Punk Rock", "Metal",
  "Heavy Metal", "Nu Metal", "Rap Rock", "Funk Rock", "Country", "Country Pop",
  "Country Rock", "Bluegrass", "Americana", "Folk", "Folk Soul",
  "Dance Pop", "Synth Pop", "Electropop", "Indie Pop", "Afro Pop",
  "K-Pop Inspired", "J-Pop Inspired", "Latin Pop", "Reggaeton", "Dembow",
  "Latin Trap", "Salsa", "Bachata", "Merengue", "Cumbia", "Corrido",
  "Regional Mexican", "Flamenco Pop", "Afrobeats", "Afro-Fusion", "Afro-Soul",
  "Afro-House", "Kwaito", "Highlife", "Roots Reggae", "Lovers Rock", "Dub",
  "Soca", "Calypso", "Kompa", "Zouk", "Classic House", "Soulful House",
  "Gospel House", "Tech House", "Progressive House", "Chicago House",
  "Jersey House", "Garage House", "UK Garage", "2-Step Garage",
  "Drum and Bass", "Jungle", "Breakbeat", "Big Beat", "Techno", "Detroit Techno",
  "Minimal Techno", "Trance", "Progressive Trance", "EDM", "Festival EDM",
  "Future Bass", "Dubstep", "Chillstep", "Glitch Hop", "Hyperpop", "Vaporwave",
  "Synthwave", "Retrowave", "Cyberpunk", "Ambient", "New Age", "Meditation",
  "Trailer Music", "Orchestral", "Epic Score", "Film Score", "TV Theme",
  "Video Game Music", "Chiptune", "Lo-Fi", "Chillhop", "Lounge", "Jazz",
  "Smooth Jazz", "Bebop", "Swing", "Fusion Jazz", "Acid Jazz", "Big Band",
  "Bossa Nova", "Samba", "World Fusion", "Indian Fusion", "Middle Eastern Fusion",
  "Caribbean Fusion", "African Traditional Fusion", "Acoustic", "Singer-Songwriter",
  "Spoken Word", "Poetry Over Music", "Comedy Song", "Commercial Jingle",
  "Radio Drop", "Podcast Intro", "Sports Anthem", "Motivational Anthem",
  "Children's Music", "Holiday Music", "Christmas R&B", "Christmas Pop",
  "Wedding Song", "Love Ballad", "Breakup Ballad", "Funeral Tribute",
  "Inspirational Song",
];

export const MAIN_GENRES = [...STANDARD_MAIN_GENRES, ...PRO_MAIN_GENRES];

// Optional cascading subgenre suggestions per parent.
export const SUBGENRES: Record<string, string[]> = {
  "Hip-Hop": ["Boom Bap", "Trap", "Drill", "Cloud Rap", "Jazz Rap", "Lo-Fi Hip-Hop", "Conscious Rap"],
  "Trap": ["Trap-Soul", "Trap Phonk", "Latin Trap", "Southern Rap", "Memphis Rap"],
  "R&B": ["Contemporary R&B", "Neo-Soul", "Trap-Soul", "Alternative R&B", "Quiet Storm", "Bedroom R&B"],
  "Gospel": ["Traditional Gospel", "Contemporary Gospel", "Choir Gospel", "Praise & Worship"],
  "Afrobeat": ["Afrobeats", "Afro-Fusion", "Afro-Soul", "Afro-House", "Highlife"],
  "House": ["Deep House", "Soulful House", "Afro-House", "Tech House", "Classic House"],
  "Drill": ["UK Drill", "Brooklyn Drill", "Chicago Drill", "Detroit Rap"],
  "Phonk": ["Memphis Phonk", "Drift Phonk", "Trap Phonk", "Dark Phonk"],
  "Cinematic": ["Trailer Music", "Orchestral", "Epic Score", "Film Score"],
  "Blues": ["Electric Blues", "Delta Blues", "Soul Blues"],
  "Country Soul": ["Country", "Country Pop", "Americana", "Folk Soul"],
  "Pop": ["Dance Pop", "Synth Pop", "Indie Pop", "Latin Pop", "Afro Pop"],
  "Rock": ["Classic Rock", "Alternative Rock", "Indie Rock", "Rap Rock"],
  "Reggae": ["Roots Reggae", "Lovers Rock", "Dub"],
  "Dancehall": ["Reggae", "Soca", "Reggaeton"],
  "Trap-Soul": ["Neo-Soul", "R&B", "Alternative R&B"],
  "Amapiano": ["Afro-House", "Kwaito"],
  "Deep House": ["Soulful House", "Afro-House", "Chicago House"],
  "Funk": ["P-Funk", "G-Funk", "Disco", "Funk Rock"],
  "Jersey Club": ["Jersey House", "Baltimore Club", "Bounce"],
};

// ------------------------------------------------------------
// FUSION GENRES (unchanged, no tiering)
// ------------------------------------------------------------
export const FUSION_GENRES = [
  "None", "Hip-Hop + R&B", "Trap + Soul", "Gospel + Trap", "Afrobeat + Amapiano",
  "Dancehall + R&B", "Jersey House + R&B", "Blues + Hip-Hop", "Funk + Trap",
  "Cinematic + Soul", "Rock + Gospel", "Phonk + Southern Soul",
];

// ------------------------------------------------------------
// VOCALS
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// MOOD (+ EMOTIONAL COLOR map)
// ------------------------------------------------------------
export const STANDARD_MOODS = [
  "Love", "Pain", "Victory", "Confidence", "Luxury", "Motivation",
  "Spiritual", "Dark", "Hypnotic", "Emotional", "Smooth", "Sexy",
  "Club", "Street", "Triumphant", "Nostalgic", "Cinematic", "Uplifting",
  "Mysterious", "Romantic",
];

export const PRO_MOODS = [
  "Happy", "Sad", "Bright", "Hopeful", "Worshipful", "Reflective", "Dreamy",
  "Haunting", "Epic", "Dramatic", "Tense", "Suspenseful", "Cocky", "Playful",
  "Fun", "Party", "Energetic", "Euphoric", "Chill", "Relaxed", "Warm",
  "Intimate", "Vulnerable", "Lonely", "Heartbroken", "Grieving", "Healing",
  "Peaceful", "Meditative", "Moody", "Melancholic", "Bittersweet", "Soulful",
  "Passionate", "Sensual", "Flirty", "Seductive", "Royal", "Gritty", "Raw",
  "Dirty", "Underground", "Rebellious", "Dangerous", "Menacing", "Cold",
  "Icy", "Spacey", "Futuristic", "Cyber", "Magical", "Mystical", "Ethereal",
  "Floating", "Heavy", "Hard-Hitting", "Bouncy", "Groovy", "Funky", "Joyful",
  "Worship", "Gospel Joy", "Inspirational", "Victorious", "Warrior", "Focused",
  "Determined", "Hungry", "Hustler", "Black Excellence", "Regal", "Late Night",
  "Rainy Night", "Summer", "Beach", "Island", "Carnival", "Road Trip", "Workout",
  "Battle", "Victory Lap", "Comeback", "Revenge", "Redemption",
  "Love After Pain", "Self-Love", "Faithful", "Family-Oriented", "Celebration",
  "Wedding", "Funeral", "Memory Lane", "Dream Chase", "Millionaire Mindset",
  "Luxury Lounge", "Hood Luxury", "Pain to Power", "From Nothing to Something",
];

export const MOODS = [...STANDARD_MOODS, ...PRO_MOODS];

export const MOOD_COLORS: Record<string, string[]> = {
  "Love": ["Warm", "Romantic", "Intimate", "Passionate", "Bittersweet"],
  "Pain": ["Heartbroken", "Grieving", "Melancholic", "Vulnerable", "Raw"],
  "Victory": ["Triumphant", "Anthemic", "Euphoric", "Warrior", "Victorious"],
  "Confidence": ["Cocky", "Regal", "Hungry", "Focused", "Determined"],
  "Luxury": ["Royal", "Hood Luxury", "Luxury Lounge", "Regal", "Millionaire Mindset"],
  "Motivation": ["Hustler", "Inspirational", "Focused", "Hungry", "Comeback"],
  "Spiritual": ["Worshipful", "Gospel Joy", "Meditative", "Peaceful", "Ethereal"],
  "Dark": ["Menacing", "Cold", "Haunting", "Suspenseful", "Underground"],
  "Hypnotic": ["Spacey", "Ethereal", "Floating", "Dreamy", "Mystical"],
  "Emotional": ["Vulnerable", "Bittersweet", "Melancholic", "Reflective", "Soulful"],
  "Smooth": ["Chill", "Intimate", "Warm", "Sensual", "Late Night"],
  "Sexy": ["Sensual", "Seductive", "Flirty", "Intimate", "Late Night"],
  "Club": ["Party", "Energetic", "Bouncy", "Euphoric", "Groovy"],
  "Street": ["Gritty", "Raw", "Underground", "Hood Luxury", "Hungry"],
  "Cinematic": ["Epic", "Dramatic", "Tense", "Haunting", "Suspenseful"],
  "Uplifting": ["Hopeful", "Joyful", "Inspirational", "Bright", "Celebration"],
  "Romantic": ["Warm", "Intimate", "Passionate", "Bittersweet", "Late Night"],
  "Nostalgic": ["Memory Lane", "Melancholic", "Bittersweet", "Reflective", "Warm"],
  "Triumphant": ["Victorious", "Warrior", "Anthemic", "Comeback", "Redemption"],
  "Mysterious": ["Haunting", "Spacey", "Mystical", "Ethereal", "Suspenseful"],
};

export const ENERGY_LEVELS = ["Low", "Medium", "High", "Explosive"];
export const EMOTION_DEPTHS = ["Light", "Medium", "Deep", "Very deep"];

// ------------------------------------------------------------
// THEME
// ------------------------------------------------------------
export const THEME_PRESETS = [
  "Love story", "Breakup", "Self-love", "Overcoming poverty", "Street survival",
  "Victory anthem", "Spiritual healing", "Hustle and ambition", "Luxury lifestyle",
  "Pain into power", "Dance party", "Game soundtrack", "Movie scene",
  "Romantic night", "Family story", "Southern roots", "Hero entrance", "Villain theme",
];

// ------------------------------------------------------------
// INSTRUMENTS (Standard + Pro)
// ------------------------------------------------------------
export const STANDARD_INSTRUMENTS = [
  "808 bass", "Deep bassline", "Piano", "Dark piano", "Electric piano",
  "Acoustic guitar", "Blues guitar", "Strings", "Brass horns", "Saxophone",
  "Flute", "Synth pads", "Choir pads", "Organ", "Congas", "Bongos",
  "Amapiano log drum", "Steel drums", "Live drums", "Trap hi-hats",
  "Snare rolls", "DJ scratches", "Vocal chops",
];

export const PRO_INSTRUMENTS = [
  "Sub Bass", "Electric Bass", "Live Bass Guitar", "Upright Bass", "Funk Bass",
  "Moog Bass", "Reese Bass", "Synth Bass", "Log Drum", "Kick Drum", "Snare",
  "Clap", "Rimshot", "Hi-Hats", "Open Hats", "Crash Cymbal", "Ride Cymbal",
  "Percussion", "Timbales", "Shakers", "Tambourine", "Cowbell", "Woodblock",
  "Triangle", "Hand Claps", "Stomps", "Taiko Drums", "Marching Snare",
  "Drumline", "MPC Drums", "808 Drum Machine", "909 Drum Machine",
  "707 Drum Machine", "LinnDrum", "Breakbeats", "Vinyl Drums", "Drill Hats",
  "Grand Piano", "Upright Piano", "Dirty Piano", "Rhodes Electric Piano",
  "Wurlitzer", "Hammond B3", "Church Organ", "Gospel Organ", "Warm Pads",
  "String Pads", "Ambient Pads", "Brass Stabs", "Horn Section", "Trumpet",
  "Trombone", "Alto Sax", "Tenor Sax", "Baritone Sax", "Piccolo", "Clarinet",
  "Oboe", "French Horn", "Tuba", "Violin", "Viola", "Cello", "Double Bass",
  "Full Strings", "Pizzicato Strings", "Orchestral Strings", "Harp",
  "Electric Guitar", "Clean Guitar", "Distorted Guitar", "Wah Guitar",
  "Funk Guitar", "Nylon Guitar", "Steel Guitar", "Slide Guitar", "Banjo",
  "Mandolin", "Ukulele", "Sitar", "Koto", "Shamisen", "Kalimba", "Mbira",
  "Marimba", "Xylophone", "Vibraphone", "Glockenspiel", "Bells", "Church Bells",
  "Tubular Bells", "Music Box", "Synth Lead", "Pluck Synth", "Arp Synth",
  "Analog Synth", "Digital Synth", "FM Synth", "Saw Lead", "Square Lead",
  "Moog Lead", "G-Funk Whistle Synth", "West Coast Lead", "Talkbox", "Vocoder",
  "Auto-Tuned Vocals", "Choir", "Gospel Choir", "Kids Choir", "Background Vocals",
  "Hummed Vocals", "Spoken Word", "Crowd Chants", "Turntable Cuts",
  "Record Stop", "Tape Stop", "Risers", "Impacts", "Drops", "Sweeps",
  "Reverse Cymbals", "Sound Effects", "Vinyl Crackle", "Tape Hiss",
  "Rain Ambience", "Thunder", "City Ambience", "Club Crowd", "Stadium Crowd",
  "Ocean Waves", "Birds", "Wind", "Sirens", "Car Engine", "Motorcycle Engine",
  "Laser FX", "Sci-Fi FX", "Game FX", "Phone Ring", "Radio Static",
  "Police Scanner FX", "Heartbeat", "Breathing FX",
];

export const INSTRUMENTS = [...STANDARD_INSTRUMENTS, ...PRO_INSTRUMENTS];

// ------------------------------------------------------------
// DRUM STYLE / DRUM FEEL (+ RHYTHM PATTERN map)
// ------------------------------------------------------------
export const STANDARD_DRUM_STYLES = [
  "Hard-hitting trap drums", "Boom-bap drums", "Jersey bounce drums",
  "Four-on-the-floor house drums", "Amapiano groove", "Dancehall riddim",
  "Gospel clap drums", "Live soul drums", "Phonk drums", "Drill bounce",
  "Funk breakbeat",
];

export const PRO_DRUM_STYLES = [
  "Dirty South Trap Bounce", "Sparse Trap Drums", "Rolling Trap Drums",
  "Drill Slide Drums", "UK Drill Swing", "Brooklyn Drill Bounce",
  "Boom Bap Crunch", "Dusty Vinyl Boom Bap", "MPC Swing",
  "J Dilla-Inspired Loose Swing", "Straight 4/4", "House Groove",
  "Deep House Pulse", "Jersey Club Bounce", "Baltimore Club Bounce",
  "New Orleans Bounce", "Crunk Drums", "Hyphy Bounce", "G-Funk Pocket",
  "Funky Drummer Break", "Gospel Shout Drums", "Church Clap Groove",
  "R&B Slow Jam Drums", "Trap Soul Half-Time", "Neo-Soul Pocket",
  "Quiet Storm Soft Drums", "Afrobeat Polyrhythm", "Afrobeats Bounce",
  "Afro-Fusion Groove", "Amapiano Log Drum Groove", "Dancehall One Drop",
  "Dancehall Bounce", "Reggae One Drop", "Reggae Rockers", "Reggae Steppers",
  "Soca Percussion Drive", "Latin Percussion Groove", "Salsa Percussion",
  "Bachata Rhythm", "Dembow Rhythm", "Reggaeton Dembow", "Samba Percussion",
  "Bossa Nova Soft Groove", "Blues Shuffle", "Rock Backbeat",
  "Punk Fast Drums", "Metal Double Kick", "Cinematic Taiko Drums",
  "Tribal Drums", "Military March Drums", "Marching Band Drumline",
  "Trap Marching Snares", "808-Heavy Drums", "Sub-Bass Kick Pattern",
  "Stomp Clap Groove", "Handclap Groove", "Rimshot Groove", "Snare Roll Build",
  "Hi-Hat Triplets", "Open-Hat Bounce", "Syncopated Hats", "Minimal Percussion",
  "Heavy Percussion", "Organic Percussion", "Electronic Drum Machine",
  "909 House Drums", "707 Retro Drums", "LinnDrum Retro Pop", "Breakbeat Drums",
  "Jungle Breaks", "Drum and Bass Fast Breaks", "Glitch Drums",
  "Industrial Drums", "Cinematic Hybrid Drums",
];

export const DRUM_STYLES = [...STANDARD_DRUM_STYLES, ...PRO_DRUM_STYLES];

export const RHYTHM_PATTERNS = [
  "Half-Time Groove", "Double-Time Groove", "Swinging Snare Pocket",
  "Laid-Back Groove", "Push-Pull Groove", "Pocket Groove", "Club Kick Pattern",
  "Bounce Kick Pattern",
];

// ------------------------------------------------------------
// TEMPO & KEY
// ------------------------------------------------------------
export const TEMPOS = [
  "Slow: 60-75 BPM", "Mid-tempo: 76-95 BPM", "Bounce: 96-115 BPM",
  "Dance: 116-128 BPM", "Fast club: 129-145 BPM", "Custom BPM",
];

export const KEYS = [
  "Auto", "Minor key", "Major key", "D minor", "E minor", "F minor",
  "G minor", "A minor", "C major", "G major",
];

// ------------------------------------------------------------
// PRODUCTION STYLE / STYLE (+ ARRANGEMENT map)
// ------------------------------------------------------------
export const STANDARD_PRODUCTION_STYLES = [
  "Clean radio-ready mix", "Dark cinematic mix", "Smooth late-night mix",
  "Club-ready mix", "Street anthem mix", "Luxury polished mix",
  "Vintage soul mix", "Futuristic mix", "Live-band feel", "Minimal and emotional",
];

export const PRO_PRODUCTION_STYLES = [
  "Radio Ready", "Commercial", "Underground", "Mixtape", "Freestyle",
  "Storytelling", "Anthemic", "Minimalist", "Maximalist", "Vintage", "Retro",
  "Modern", "Cinematic", "Live Band", "Studio Polish", "Raw Demo",
  "Lo-Fi Tape", "Analog Warmth", "Digital Clean", "Dirty South", "East Coast Grit",
  "West Coast Smooth", "Southern Soulful", "Memphis Dark", "New York Boom Bap",
  "Atlanta Trap", "Chicago Drill", "Detroit Bounce", "Jersey Bounce",
  "Afro-Fusion Smooth", "Island Groove", "Gospel Choir Style", "Quartet Style",
  "Churchy", "Lounge", "Luxury", "Street Luxury", "Club Ready", "Festival Ready",
  "Bedroom Studio", "Piano Ballad", "Guitar Ballad", "Acoustic Soul",
  "Orchestral Trap", "Trap Soul", "Soul Trap", "Blues Trap", "Gospel Trap",
  "Jazz Rap", "Funk Rap", "R&B House", "Soulful House", "Afro House",
  "Amapiano Smooth", "Dancehall Fusion", "Reggae Soul", "Pop Crossover",
  "Alternative", "Experimental", "Psychedelic", "Dream Pop", "Dark Cinematic",
  "Motivational Trailer", "Hero Theme", "Villain Theme", "Love Theme",
  "Breakup Theme", "Victory Theme",
];

export const PRODUCTION_STYLES = [...STANDARD_PRODUCTION_STYLES, ...PRO_PRODUCTION_STYLES];

export const ARRANGEMENTS = [
  "Intro Track", "Outro Track", "Interlude", "Hook-First Arrangement",
  "Verse-Heavy Arrangement", "Call-and-Response", "Chant-Based",
  "Crowd Anthem", "Stadium Chant", "Slow Burn", "Build-Up", "Drop-Heavy",
  "Groove-Focused", "Vocal-Driven", "Drum-Driven", "Bass-Driven",
  "Melody-Driven", "Sample-Style", "No-Sample Original", "Choir-Layered",
  "Harmony-Heavy", "Ad-Lib Heavy",
];

// ------------------------------------------------------------
// SOUND QUALITY
// ------------------------------------------------------------
export const SOUND_QUALITIES = [
  "Demo quality", "Radio-ready", "Club mix", "Film trailer quality",
  "Premium studio quality",
];

// ------------------------------------------------------------
// MIXING STYLE (+ SONIC FINISH map) — PRO ONLY
// ------------------------------------------------------------
export const MIXING_STYLES = [
  "None", "Radio Polished", "Clean Modern Mix", "Warm Analog Mix",
  "Vintage Tape Saturation", "Vinyl Texture", "Lo-Fi Cassette",
  "Crisp Digital Mix", "Club Loud Mix", "Streaming Optimized",
  "Wide Stereo Mix", "Narrow Vintage Mix", "Heavy Bass Mix",
  "Subwoofer-Ready", "808-Forward", "Vocal-Forward", "Drum-Forward",
  "Bass-Forward", "Melody-Forward", "Dark Mix", "Bright Mix", "Warm Mix",
  "Airy Mix", "Dry Intimate Mix", "Wet Reverb Mix", "Dreamy Reverb Wash",
  "Delay-Heavy Mix", "Slapback Vocal Delay", "Plate Reverb Vocal",
  "Hall Reverb Vocal", "Church Reverb", "Stadium Reverb",
  "Cinematic Wide Mix", "Orchestral Depth Mix", "Live Band Mix",
  "Garage Raw Mix", "Underground Mixtape Mix", "Luxury R&B Mix",
  "Smooth Soul Mix", "Gritty Street Mix", "Dirty Tape Mix",
  "Crunchy Drum Mix", "Punchy Drum Mix", "Soft Drum Mix",
  "Clean Vocal Chain", "Auto-Tuned Vocal Polish", "Natural Vocal Mix",
  "Stacked Harmony Mix", "Choir-Layered Mix", "Ad-Lib Spread Mix",
  "Hook Wide Mix", "Verse Intimate Mix",
];

export const SONIC_FINISHES = [
  "Low-End Focused", "Midrange Warmth", "High-End Sparkle",
  "Dark Club Master", "Bright Pop Master", "Heavy Compression",
  "Light Compression", "Parallel Drum Compression", "Saturated 808 Mix",
  "Clean 808 Mix", "Sidechain Pumping", "House Club Master",
  "DJ Mix Master", "Film Score Mix", "Trailer Master", "Podcast Intro Mix",
  "Commercial Jingle Mix", "Mobile Speaker Friendly", "Car Stereo Knock",
  "Headphone Detailed", "Boombox Vintage", "Old-School Radio",
  "Modern Trap Master", "Neo-Soul Warmth", "Gospel Choir Blend",
  "Afrobeat Percussion Clarity", "Amapiano Log Drum Heavy",
  "Dancehall Vocal Brightness",
];

// ------------------------------------------------------------
// HOOK TYPE (+ VOCAL FORMAT map) — PRO ONLY
// ------------------------------------------------------------
export const HOOK_TYPES = [
  "None", "Catchy Repeated Hook", "Big Singalong Hook", "Chant Hook",
  "Call-and-Response Hook", "Gospel Choir Hook", "R&B Melodic Hook",
  "Rap Hook", "Spoken Hook", "Whisper Hook", "Falsetto Hook", "Belting Hook",
  "Female Harmony Hook", "Male Harmony Hook", "Group Vocal Hook",
  "Crowd Hook", "Stadium Hook", "Club Hook", "Dance Hook", "Radio Pop Hook",
  "Street Anthem Hook", "Pain Hook", "Love Hook", "Breakup Hook",
  "Motivational Hook", "Victory Hook", "Prayer Hook", "Confession Hook",
  "Emotional Hook", "Dark Hook", "Smooth Hook", "Sexy Hook", "Spiritual Hook",
  "Luxury Hook", "Gritty Hook", "Hypnotic Hook", "Minimal Hook",
  "Aggressive Hook", "Soft Hook", "Island Hook", "Afrobeat Hook",
  "Amapiano Hook", "Dancehall Hook", "Gospel House Hook", "Trap Soul Hook",
  "Boom Bap Hook", "Drill Hook", "Phonk Hook", "Cinematic Hook",
  "Trailer Hook",
];

export const VOCAL_FORMATS = [
  "One-Line Hook", "Two-Line Hook", "Four-Bar Hook", "Eight-Bar Hook",
  "Pre-Hook Build", "Post-Hook Chant", "Hook With Ad-Libs",
  "Hook With Vocal Runs", "Hook With Repetition", "Hook With Catchphrase",
  "Hook With Hummed Melody", "Hook With Stacked Harmonies",
  "Hook With Choir Response", "Hook With Kids Choir",
  "Hook With Crowd Noise", "Hook With DJ Scratch", "Hook With Beat Drop",
  "Hook Before Verse", "Hook After Intro", "Hook at End Only",
  "Hook as Outro", "Bridge-to-Hook Lift",
];

// ------------------------------------------------------------
// BASSLINE — PRO ONLY
// ------------------------------------------------------------
export const BASSLINES = [
  "None", "Deep 808 Slide", "Sub Rumble", "Melodic Bassline", "Groovy Funk Bass",
  "Reese Bass Wobble", "Moog Analog Bass", "Slap Bass", "Walking Jazz Bass",
  "Upright Acoustic Bass", "Reggae Dub Bass", "Amapiano Log Bass",
  "Afrobeat Rolling Bass", "Dancehall Riddim Bass", "House Pluck Bass",
  "Techno Driving Bass", "Drum & Bass Rolling", "Trap Sub Glide",
  "Drill Sliding 808", "Phonk Distorted Bass", "Cinematic Sub Drone",
];

// ------------------------------------------------------------
// BLUEPRINT INTELLIGENCE
// ------------------------------------------------------------
export const ERAS = ["Current / modern", "1960s soul", "1970s analog", "1980s synth", "1990s golden era", "2000s radio", "2010s crossover", "Futuristic"];
export const VOCAL_REGISTERS = ["Natural range", "Low register", "Mid register", "High register", "Falsetto-led", "Wide dynamic range"];
export const VOCAL_TEXTURES = ["Clean and controlled", "Breathy", "Raspy", "Smoky", "Gritty", "Silky", "Raw and cracked", "Processed and futuristic"];
export const HARMONY_STYLES = ["Minimal unison", "Tight two-part harmony", "Stacked three-part harmony", "Gospel call and response", "Wide choir layers", "Counter-melody harmonies", "Octave doubles", "No vocal harmony"];
export const DYNAMICS_ARCS = ["Steady and controlled", "Slow-burn rise", "Verse restraint / hook lift", "Wide cinematic swells", "Drop-driven contrast", "Intimate to explosive", "Peak early / strip back late"];
export const STEREO_CHARACTERS = ["Balanced natural width", "Wide hooks / narrow verses", "Immersive ultra-wide", "Focused mono-compatible center", "Vintage narrow image", "Asymmetric movement", "Headphone-detail panorama"];
export const REFERENCE_TRAITS = ["Analog warmth", "Modern low-end", "Live-room energy", "Club translation", "Radio clarity", "Cinematic depth", "Raw demo intimacy", "Tape-era texture", "Minimal negative space", "Dense layered production"];
export const OPTIMIZATION_MODES = ["Universal", "Suno", "Udio"];

// ------------------------------------------------------------
// AVOID
// ------------------------------------------------------------
export const AVOID_PRESETS = [
  "Artist names", "Brand names", "Explicit language", "Political themes",
  "Religious references", "Drug references", "Copyrighted lyrics",
  "The word 'neon'", "The word 'shadow'", "The word 'echo'",
] as const;

export const PROMPT_MODES = ["standard", "pro"] as const;
export type PromptMode = typeof PROMPT_MODES[number];

// ------------------------------------------------------------
// Input shape + defaults
// ------------------------------------------------------------
export type PromptInputs = {
  title: string;
  promptType: string;
  songLength: string;
  mainGenre: string;
  subgenre: string;
  era: string;
  fusionGenre: string;
  vocalType: string;
  vocalPerformance: string;
  vocalExtras: string[];
  vocalRegister: string;
  vocalTexture: string;
  harmonyStyle: string;
  moods: string[];
  moodColor: string;
  energy: string;
  emotionDepth: string;
  themePreset: string;
  topic: string;
  instruments: string[];
  drumStyle: string;
  rhythmPattern: string;
  tempo: string;
  customBpm: string;
  key: string;
  productionStyle: string;
  arrangement: string;
  dynamicsArc: string;
  mixingStyle: string;
  sonicFinish: string;
  stereoCharacter: string;
  referenceTraits: string[];
  optimizationMode: string;
  hookType: string;
  vocalFormat: string;
  bassline: string;
  soundQuality: string;
  avoidWords: string;
  avoidPresets: string[];
};

export const DEFAULT_INPUTS: PromptInputs = {
  title: "",
  promptType: "Full music prompt",
  songLength: "3-minute radio song",
  mainGenre: "Hip-Hop",
  subgenre: "",
  era: "Current / modern",
  fusionGenre: "None",
  vocalType: "Male singer",
  vocalPerformance: "Smooth",
  vocalExtras: [],
  vocalRegister: "Natural range",
  vocalTexture: "Clean and controlled",
  harmonyStyle: "Minimal unison",
  moods: [],
  moodColor: "",
  energy: "Medium",
  emotionDepth: "Medium",
  themePreset: "Self-love",
  topic: "",
  instruments: [],
  drumStyle: "Hard-hitting trap drums",
  rhythmPattern: "",
  tempo: "Mid-tempo: 76-95 BPM",
  customBpm: "",
  key: "Auto",
  productionStyle: "Clean radio-ready mix",
  arrangement: "",
  dynamicsArc: "Steady and controlled",
  mixingStyle: "None",
  sonicFinish: "",
  stereoCharacter: "Balanced natural width",
  referenceTraits: [],
  optimizationMode: "Universal",
  hookType: "None",
  vocalFormat: "",
  bassline: "None",
  soundQuality: "Radio-ready",
  avoidWords: "",
  avoidPresets: [],
};

// Set helpers used by the server to sanitize pro-only values away
// from non-subscribers.
const STANDARD_MAIN_GENRES_SET = new Set<string>(STANDARD_MAIN_GENRES);
const STANDARD_MOODS_SET = new Set<string>(STANDARD_MOODS);
const STANDARD_INSTRUMENTS_SET = new Set<string>(STANDARD_INSTRUMENTS);
const STANDARD_DRUM_STYLES_SET = new Set<string>(STANDARD_DRUM_STYLES);
const STANDARD_PRODUCTION_STYLES_SET = new Set<string>(STANDARD_PRODUCTION_STYLES);

export function sanitizeToStandard(inputs: PromptInputs): PromptInputs {
  return {
    ...inputs,
    mainGenre: STANDARD_MAIN_GENRES_SET.has(inputs.mainGenre) ? inputs.mainGenre : DEFAULT_INPUTS.mainGenre,
    subgenre: "",
    harmonyStyle: DEFAULT_INPUTS.harmonyStyle,
    moods: inputs.moods.filter((m) => STANDARD_MOODS_SET.has(m)),
    moodColor: "",
    instruments: inputs.instruments.filter((i) => STANDARD_INSTRUMENTS_SET.has(i)),
    drumStyle: STANDARD_DRUM_STYLES_SET.has(inputs.drumStyle) ? inputs.drumStyle : DEFAULT_INPUTS.drumStyle,
    rhythmPattern: "",
    productionStyle: STANDARD_PRODUCTION_STYLES_SET.has(inputs.productionStyle) ? inputs.productionStyle : DEFAULT_INPUTS.productionStyle,
    arrangement: "",
    dynamicsArc: DEFAULT_INPUTS.dynamicsArc,
    mixingStyle: "None",
    sonicFinish: "",
    stereoCharacter: DEFAULT_INPUTS.stereoCharacter,
    referenceTraits: inputs.referenceTraits.filter((trait) => ["Analog warmth", "Modern low-end", "Live-room energy", "Radio clarity", "Raw demo intimacy", "Minimal negative space"].includes(trait)),
    optimizationMode: "Universal",
    hookType: "None",
    vocalFormat: "",
    bassline: "None",
  };
}
