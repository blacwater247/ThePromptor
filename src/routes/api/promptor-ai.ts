import { createFileRoute } from "@tanstack/react-router";
import { streamText, Output } from "ai";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import {
  STANDARD_MAIN_GENRES, STANDARD_MOODS, STANDARD_INSTRUMENTS, STANDARD_DRUM_STYLES,
  STANDARD_PRODUCTION_STYLES, STANDARD_REFERENCE_TRAITS,
  PROMPT_TYPES, SONG_LENGTHS, MAIN_GENRES, FUSION_GENRES, VOCAL_TYPES,
  VOCAL_PERFORMANCES, VOCAL_EXTRAS, MOODS, ENERGY_LEVELS, EMOTION_DEPTHS,
  THEME_PRESETS, INSTRUMENTS, DRUM_STYLES, TEMPOS, KEYS, PRODUCTION_STYLES,
  ARRANGEMENTS, MIXING_STYLES, SONIC_FINISHES, HOOK_TYPES, VOCAL_FORMATS,
  BASSLINES, RHYTHM_PATTERNS, MOOD_COLORS, SUBGENRES,
  ERAS, VOCAL_REGISTERS, VOCAL_TEXTURES, HARMONY_STYLES, DYNAMICS_ARCS,
  STEREO_CHARACTERS, REFERENCE_TRAITS,
  DEFAULT_INPUTS, sanitizeToStandard, type PromptInputs,
} from "@/lib/prompt-options";
import { VARIATION_STYLES, type PromptorResult } from "@/lib/promptor-ai";
import { isSubscriptionActive } from "@/lib/subscription";

const ALL_MOOD_COLORS = Array.from(new Set(Object.values(MOOD_COLORS).flat()));
const ALL_SUBGENRES = Array.from(new Set(Object.values(SUBGENRES).flat()));

const CREDIT_COST = 2;

const RequestSchema = z.object({
  action: z.enum(["analyze", "surprise", "improve", "variation"]),
  idea: z.string().max(1200).optional().default(""),
  existingPrompt: z.string().max(4000).optional().default(""),
  variationStyle: z.string().max(40).optional().default(""),
  environment: z.enum(["sandbox", "live"]),
});

// Strict-compatible schema: every property required, optionals nullable, no bounds.
const nstr = () => z.string().nullable();
const AnalysisSchema = z.object({
  title: nstr(),
  promptType: nstr(),
  songLength: nstr(),
  mainGenre: nstr(),
  subgenre: nstr(),
  era: nstr(),
  fusionGenre: nstr(),
  vocalType: nstr(),
  vocalPerformance: nstr(),
  vocalRegister: nstr(),
  vocalTexture: nstr(),
  harmonyStyle: nstr(),
  vocalExtras: z.array(z.string()),
  moods: z.array(z.string()),
  moodColor: nstr(),
  energy: nstr(),
  emotionDepth: nstr(),
  themePreset: nstr(),
  topic: nstr(),
  instruments: z.array(z.string()),
  drumStyle: nstr(),
  rhythmPattern: nstr(),
  bassline: nstr(),
  tempo: nstr(),
  suggestedBpm: z.number().nullable(),
  key: nstr(),
  productionStyle: nstr(),
  arrangement: nstr(),
  dynamicsArc: nstr(),
  mixingStyle: nstr(),
  sonicFinish: nstr(),
  stereoCharacter: nstr(),
  referenceTraits: z.array(z.string()),
  hookType: nstr(),
  vocalFormat: nstr(),
  songStructure: nstr(),
  finalPrompt: z.string(),
  issues: z.array(z.string()),
  score: z.object({
    overall: z.number(),
    genreDefinition: z.number(),
    emotion: z.number(),
    vocalDirection: z.number(),
    rhythm: z.number(),
    instrumentation: z.number(),
    arrangement: z.number(),
    productionDetail: z.number(),
    clarity: z.number(),
    recommendations: z.array(z.string()),
  }),
});
type Analysis = z.infer<typeof AnalysisSchema>;

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function verifyBearer(request: Request) {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return null;
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  if (!token || token.split(".").length !== 3) return null;
  const supabase = createClient<Database>(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims?.sub) return null;
  return { supabase, userId: data.claims.sub as string };
}

// ---- value snapping: the model may only produce values the app supports ----
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
function snapOne(value: string | null | undefined, options: readonly string[]): string | null {
  if (!value) return null;
  const v = norm(value);
  if (!v) return null;
  const exact = options.find((o) => norm(o) === v);
  if (exact) return exact;
  const partial = options.find((o) => norm(o).includes(v) || v.includes(norm(o)));
  return partial ?? null;
}
function snapMany(values: string[] | null | undefined, options: readonly string[], max: number): string[] {
  if (!Array.isArray(values)) return [];
  const out: string[] = [];
  for (const v of values) {
    const hit = snapOne(v, options);
    if (hit && !out.includes(hit)) out.push(hit);
    if (out.length >= max) break;
  }
  return out;
}

const LABELS: Record<string, string> = {
  mainGenre: "Genre", subgenre: "Subgenre", era: "Era", fusionGenre: "Fusion",
  vocalType: "Vocal type", vocalPerformance: "Vocal delivery", vocalRegister: "Register",
  vocalTexture: "Vocal texture", harmonyStyle: "Harmony", vocalExtras: "Vocal extras",
  moods: "Mood", moodColor: "Emotional color", energy: "Energy", emotionDepth: "Emotion depth",
  themePreset: "Theme", topic: "Story", instruments: "Instruments", drumStyle: "Drums",
  rhythmPattern: "Groove", bassline: "Bass", tempo: "Tempo", customBpm: "BPM", key: "Key",
  productionStyle: "Production", arrangement: "Arrangement", dynamicsArc: "Dynamics",
  mixingStyle: "Mixing", sonicFinish: "Finish", stereoCharacter: "Stereo image",
  referenceTraits: "Reference traits", hookType: "Hook", vocalFormat: "Vocal format",
  songLength: "Length", promptType: "Prompt type", title: "Title",
};

function buildFields(a: Analysis, isPro: boolean) {
  const f: Partial<PromptInputs> = {};
  const set = <K extends keyof PromptInputs>(k: K, v: PromptInputs[K] | null) => {
    if (v === null || v === undefined) return;
    if (typeof v === "string" && !v) return;
    if (Array.isArray(v) && v.length === 0) return;
    f[k] = v;
  };

  set("title", a.title ? a.title.replace(/[\r\n]+/g, " ").slice(0, 80) : null);
  set("promptType", snapOne(a.promptType, PROMPT_TYPES));
  set("songLength", snapOne(a.songLength, SONG_LENGTHS));
  set("mainGenre", snapOne(a.mainGenre, MAIN_GENRES));
  const genreForSub = f.mainGenre ?? DEFAULT_INPUTS.mainGenre;
  const subOptions = SUBGENRES[genreForSub as keyof typeof SUBGENRES] ?? ALL_SUBGENRES;
  set("subgenre", snapOne(a.subgenre, subOptions));
  set("era", snapOne(a.era, ERAS));
  set("fusionGenre", snapOne(a.fusionGenre, FUSION_GENRES));
  set("vocalType", snapOne(a.vocalType, VOCAL_TYPES));
  set("vocalPerformance", snapOne(a.vocalPerformance, VOCAL_PERFORMANCES));
  set("vocalRegister", snapOne(a.vocalRegister, VOCAL_REGISTERS));
  set("vocalTexture", snapOne(a.vocalTexture, VOCAL_TEXTURES));
  set("harmonyStyle", snapOne(a.harmonyStyle, HARMONY_STYLES));
  set("vocalExtras", snapMany(a.vocalExtras, VOCAL_EXTRAS, 6));
  set("moods", snapMany(a.moods, MOODS, 4));
  const colorOptions = MOOD_COLORS[(f.moods?.[0] ?? "") as keyof typeof MOOD_COLORS] ?? ALL_MOOD_COLORS;
  set("moodColor", snapOne(a.moodColor, colorOptions));
  set("energy", snapOne(a.energy, ENERGY_LEVELS));
  set("emotionDepth", snapOne(a.emotionDepth, EMOTION_DEPTHS));
  set("themePreset", snapOne(a.themePreset, THEME_PRESETS));
  set("topic", a.topic ? a.topic.replace(/[\r\n]+/g, " ").slice(0, 200) : null);
  set("instruments", snapMany(a.instruments, INSTRUMENTS, 12));
  set("drumStyle", snapOne(a.drumStyle, DRUM_STYLES));
  set("rhythmPattern", snapOne(a.rhythmPattern, RHYTHM_PATTERNS));
  set("bassline", snapOne(a.bassline, BASSLINES));
  const bpm = typeof a.suggestedBpm === "number" && a.suggestedBpm >= 40 && a.suggestedBpm <= 220
    ? Math.round(a.suggestedBpm) : null;
  const tempoSnap = snapOne(a.tempo, TEMPOS);
  if (bpm) {
    f.tempo = "Custom BPM";
    f.customBpm = String(bpm);
  } else if (tempoSnap) {
    f.tempo = tempoSnap;
  }
  set("key", snapOne(a.key, KEYS));
  set("productionStyle", snapOne(a.productionStyle, PRODUCTION_STYLES));
  const arrOptions = ARRANGEMENTS as readonly string[];
  set("arrangement", snapOne(a.arrangement, arrOptions));
  set("dynamicsArc", snapOne(a.dynamicsArc, DYNAMICS_ARCS));
  set("mixingStyle", snapOne(a.mixingStyle, MIXING_STYLES));
  set("sonicFinish", snapOne(a.sonicFinish, SONIC_FINISHES));
  set("stereoCharacter", snapOne(a.stereoCharacter, STEREO_CHARACTERS));
  set("referenceTraits", snapMany(a.referenceTraits, REFERENCE_TRAITS, 4));
  set("hookType", snapOne(a.hookType, HOOK_TYPES));
  set("vocalFormat", snapOne(a.vocalFormat, VOCAL_FORMATS));

  if (!isPro) {
    const merged = sanitizeToStandard({ ...DEFAULT_INPUTS, ...f } as PromptInputs);
    const trimmed: Partial<PromptInputs> = {};
    for (const key of Object.keys(f) as (keyof PromptInputs)[]) {
      const value = merged[key];
      if (typeof value === "string" && !value) continue;
      if (Array.isArray(value) && value.length === 0) continue;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (trimmed as any)[key] = value;
    }
    return trimmed;
  }
  return f;
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(Number.isFinite(n) ? n : 0)));

const BASE_SYSTEM = `You are PROMPTOR AI, an expert music producer, arranger, recording engineer, vocal producer and AI music prompt engineer.
You translate plain-English ideas into precise, production-grade music generation prompts.
You understand R&B, neo-soul, hip-hop, trap, trap-soul, boom bap, pop, rock, soul, gospel, jazz, blues, country, house, deep house, afrobeat, afro-fusion, amapiano, dancehall, reggae, EDM, funk, phonk, trip-hop, cinematic and orchestral music; instrumentation from 808 bass and Rhodes-style electric piano to strings, horn stabs, log drums and choirs; and production concepts such as swing, pocket, syncopation, half-time, dynamics, warmth, presence, low-end, stereo width and analog character.
Internally reason through core idea, genre DNA, emotional DNA, rhythm DNA, instrument DNA, vocal DNA, production DNA and arrangement DNA — but never expose that reasoning. Return only the structured result.
NEVER imitate or clone a living artist's voice or a copyrighted recording. If an artist is named, silently translate the reference into generalized musical characteristics (groove, tempo feel, vocal delivery, harmony language, instrumentation, atmosphere) without mentioning the artist and without lecturing the user.
finalPrompt must be one focused, ready-to-paste music-generation prompt: concrete, no filler, no repeated adjectives, no contradictions, no markdown, no quotes, no headings. Cover genre, mood, vocal character, tempo/BPM, rhythm, drums, bass, main instruments, song structure, production character and emotional direction.
songStructure is a short arrangement map such as "Intro - Verse - Pre-chorus - Chorus - Verse - Bridge - Final chorus - Outro".
score fields are 0-100 and measure only how clearly and completely the prompt communicates musical intent — never commercial success. recommendations: up to 3 short actionable notes.
For every control field, choose the closest value from the allowed list given below; use null when you have no opinion.`;

function allowedLists(isPro: boolean) {
  const list = (name: string, values: readonly string[]) => `${name}: ${values.join(" | ")}`;
  const MAIN_GENRES_A = isPro ? MAIN_GENRES : STANDARD_MAIN_GENRES;
  const MOODS_A = isPro ? MOODS : STANDARD_MOODS;
  const INSTRUMENTS_A = isPro ? INSTRUMENTS : STANDARD_INSTRUMENTS;
  const DRUM_STYLES_A = isPro ? DRUM_STYLES : STANDARD_DRUM_STYLES;
  const PRODUCTION_STYLES_A = isPro ? PRODUCTION_STYLES : STANDARD_PRODUCTION_STYLES;
  const REFERENCE_TRAITS_A = isPro ? REFERENCE_TRAITS : STANDARD_REFERENCE_TRAITS;
  return [
    list("promptType", PROMPT_TYPES),
    list("songLength", SONG_LENGTHS),
    list("mainGenre", MAIN_GENRES_A),
    list("subgenre", ALL_SUBGENRES),
    list("era", ERAS),
    list("fusionGenre", FUSION_GENRES),
    list("vocalType", VOCAL_TYPES),
    list("vocalPerformance", VOCAL_PERFORMANCES),
    list("vocalRegister", VOCAL_REGISTERS),
    list("vocalTexture", VOCAL_TEXTURES),
    list("harmonyStyle", HARMONY_STYLES),
    list("vocalExtras", VOCAL_EXTRAS),
    list("moods", MOODS_A),
    list("moodColor", ALL_MOOD_COLORS),
    list("energy", ENERGY_LEVELS),
    list("emotionDepth", EMOTION_DEPTHS),
    list("themePreset", THEME_PRESETS),
    list("instruments", INSTRUMENTS_A),
    list("drumStyle", DRUM_STYLES_A),
    list("rhythmPattern", RHYTHM_PATTERNS),
    list("bassline", BASSLINES),
    list("tempo", TEMPOS),
    list("key", KEYS),
    list("productionStyle", PRODUCTION_STYLES_A),
    list("arrangement", ARRANGEMENTS),
    list("dynamicsArc", DYNAMICS_ARCS),
    list("mixingStyle", MIXING_STYLES),
    list("sonicFinish", SONIC_FINISHES),
    list("stereoCharacter", STEREO_CHARACTERS),
    list("referenceTraits", REFERENCE_TRAITS_A),
    list("hookType", HOOK_TYPES),
    list("vocalFormat", VOCAL_FORMATS),
  ].join("\n");
}

export const Route = createFileRoute("/api/promptor-ai")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return errorResponse("PROMPTOR AI is not configured.", 500);

        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return errorResponse("Invalid request.", 400);
        }
        const parsed = RequestSchema.safeParse(raw);
        if (!parsed.success) return errorResponse("Invalid request.", 400);
        const { action, idea, existingPrompt, variationStyle, environment } = parsed.data;

        if (action === "analyze" && !idea.trim()) {
          return errorResponse("Describe what you want to create first.", 400);
        }
        if (action === "improve" && !existingPrompt.trim()) {
          return errorResponse("Paste the prompt you want improved.", 400);
        }
        const style = (VARIATION_STYLES as readonly string[]).includes(variationStyle) ? variationStyle : "";
        if (action === "variation" && (!style || !existingPrompt.trim())) {
          return errorResponse("Pick a variation style first.", 400);
        }

        const auth = await verifyBearer(request);
        let isSubscriber = false;
        let userId: string | null = null;
        let newBalance: number | null = null;
        const attemptRef = crypto.randomUUID();

        if (auth) {
          userId = auth.userId;
          const { data: subRows } = await auth.supabase
            .from("subscriptions")
            .select("status, current_period_end, cancel_at_period_end")
            .eq("user_id", userId)
            .eq("environment", environment)
            .order("created_at", { ascending: false })
            .limit(1);
          isSubscriber = isSubscriptionActive(subRows?.[0]);
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        if (userId && isSubscriber) {
          const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
          const { count } = await supabaseAdmin
            .from("generations_log")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
            .gte("created_at", since);
          if ((count ?? 0) >= 60) return errorResponse("RATE_LIMITED: Hourly limit reached.", 429);
        }

        if (userId && !isSubscriber) {
          const { data: balAfter, error: spendErr } = await supabaseAdmin.rpc("spend_credits", {
            _user_id: userId,
            _amount: CREDIT_COST,
            _ref: attemptRef,
          });
          if (spendErr) {
            const msg = (spendErr.message || "").toLowerCase();
            if (msg.includes("insufficient_credits")) {
              return errorResponse("INSUFFICIENT_CREDITS: You're out of credits.", 402);
            }
            console.error("[promptor-ai] spend_credits error", spendErr);
            return errorResponse("Could not deduct credits.", 500);
          }
          newBalance = balAfter as number;
        }

        const refund = async () => {
          if (!userId || isSubscriber) return;
          try {
            await supabaseAdmin.rpc("refund_credits", {
              _user_id: userId,
              _amount: CREDIT_COST,
              _ref: attemptRef,
            });
          } catch (e) {
            console.error("[promptor-ai] refund failed", e);
          }
        };

        const instruction =
          action === "surprise"
            ? `Invent a fresh, coherent and commercially interesting song idea of your own, then build the full production prompt for it. Make it distinctive, not generic.`
            : action === "improve"
              ? `Analyse this existing music prompt and rebuild it as a stronger version. In "issues", list the concrete weaknesses you found (missing vocal direction, missing tempo, weak drums, weak instrumentation, weak arrangement, unclear production, contradictions, overload). finalPrompt is the improved version.\n\nEXISTING PROMPT:\n${existingPrompt}`
              : action === "variation"
                ? `Create a "${style}" variation of this prompt. Keep the core idea and identity, but genuinely change the underlying musical characteristics (tempo, groove, drums, bass, instrumentation, arrangement, vocal delivery, production) to fit the direction — do not just swap adjectives.\n\nCURRENT PROMPT:\n${existingPrompt}`
                : `Build the full production prompt from this idea:\n\n${idea}`;

        const userBlock = `${instruction}\n\nALLOWED CONTROL VALUES (choose the closest, or null):\n${allowedLists(isSubscriber)}`;

        try {
          const { createOpenAI } = await import("@ai-sdk/openai");
          const lovable = createOpenAI({
            baseURL: "https://ai.gateway.lovable.dev/v1",
            apiKey,
            headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
          });

          const result = streamText({
            model: lovable.responses("openai/gpt-6-astra"),
            system: BASE_SYSTEM,
            prompt: userBlock,
            output: Output.object({ schema: AnalysisSchema }),
            providerOptions: {
              openai: {
                forceReasoning: true,
                reasoningEffort: "low",
                reasoningSummary: "auto",
                store: false,
                include: ["reasoning.encrypted_content"],
              },
            },
          });

          const analysis = (await result.output) as Analysis;
          const fields = buildFields(analysis, isSubscriber);
          const appliedLabels = Object.keys(fields)
            .map((k) => LABELS[k] ?? k)
            .filter((v, i, arr) => arr.indexOf(v) === i);

          const finalPrompt = (analysis.finalPrompt || "")
            .replace(/^```[a-z]*\n?/i, "")
            .replace(/```$/i, "")
            .trim();

          const payload: PromptorResult = {
            action,
            finalPrompt,
            originalPrompt: action === "improve" || action === "variation" ? existingPrompt : "",
            issues: (analysis.issues ?? []).slice(0, 8),
            summary: {
              genre: [fields.subgenre || fields.mainGenre, fields.era].filter(Boolean).join(" · ") || "—",
              mood: (fields.moods ?? []).join(", ") || "—",
              vocals: [fields.vocalType, fields.vocalPerformance].filter(Boolean).join(" — ") || "—",
              tempo: fields.tempo === "Custom BPM" ? "Custom" : (fields.tempo ?? "—"),
              suggestedBpm: fields.customBpm ? `${fields.customBpm} BPM` : "—",
              instruments: (fields.instruments ?? []).join(", ") || "—",
              productionStyle: [fields.productionStyle, fields.mixingStyle].filter((v) => v && v !== "None").join(" · ") || "—",
              songStructure: analysis.songStructure || "—",
            },
            fields,
            appliedLabels,
            score: {
              overall: clamp(analysis.score.overall),
              genreDefinition: clamp(analysis.score.genreDefinition),
              emotion: clamp(analysis.score.emotion),
              vocalDirection: clamp(analysis.score.vocalDirection),
              rhythm: clamp(analysis.score.rhythm),
              instrumentation: clamp(analysis.score.instrumentation),
              arrangement: clamp(analysis.score.arrangement),
              productionDetail: clamp(analysis.score.productionDetail),
              clarity: clamp(analysis.score.clarity),
              recommendations: (analysis.score.recommendations ?? []).slice(0, 3),
            },
          };

          if (!finalPrompt) {
            await refund();
            return errorResponse("PROMPTOR AI returned an empty result. Try again.", 502);
          }

          if (userId) {
            try {
              await supabaseAdmin.from("generations_log").insert({ user_id: userId, mode: "standard" });
            } catch (e) {
              console.error("[promptor-ai] log insert failed", e);
            }
          }

          const headers = new Headers({ "Content-Type": "application/json" });
          if (newBalance !== null) headers.set("X-Credit-Balance", String(newBalance));
          headers.set("X-Unlimited", isSubscriber ? "1" : "0");
          return new Response(JSON.stringify(payload), { status: 200, headers });
        } catch (err: unknown) {
          await refund();
          console.error("[promptor-ai] error", err);
          const msg = err instanceof Error ? err.message : "";
          if (msg.includes("402")) return errorResponse("PROMPTOR AI is temporarily unavailable (AI credits).", 402);
          if (msg.includes("429")) return errorResponse("PROMPTOR AI is busy. Try again in a moment.", 429);
          return errorResponse("PROMPTOR AI could not complete that request.", 500);
        }
      },
    },
  },
});
