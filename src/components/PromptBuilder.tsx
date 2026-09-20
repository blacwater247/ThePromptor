import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Crown, Lock } from "lucide-react";
import {
  AVOID_PRESETS, ARRANGEMENTS, BASSLINES, DYNAMICS_ARCS, EMOTION_DEPTHS, ENERGY_LEVELS,
  ERAS, FUSION_GENRES, HARMONY_STYLES, HOOK_TYPES, KEYS, MIXING_STYLES, MOOD_COLORS,
  OPTIMIZATION_MODES, PRO_DRUM_STYLES, PRO_INSTRUMENTS, PRO_MAIN_GENRES, PRO_MOODS,
  PRO_PRODUCTION_STYLES, PROMPT_TYPES, REFERENCE_TRAITS, RHYTHM_PATTERNS, SONG_LENGTHS,
  SONIC_FINISHES, SOUND_QUALITIES, STANDARD_DRUM_STYLES, STANDARD_INSTRUMENTS,
  STANDARD_MAIN_GENRES, STANDARD_MOODS, STANDARD_PRODUCTION_STYLES, STEREO_CHARACTERS,
  SUBGENRES, TEMPOS, THEME_PRESETS, VOCAL_EXTRAS, VOCAL_FORMATS, VOCAL_PERFORMANCES,
  VOCAL_REGISTERS, VOCAL_TEXTURES, VOCAL_TYPES, type PromptInputs,
} from "@/lib/prompt-options";

type Props = { value: PromptInputs; onChange: (next: PromptInputs) => void; isPro?: boolean };
const NONE = "__none__";

function Field({ label, children, pro }: { label: string; children: React.ReactNode; pro?: boolean }) {
  return <div className="space-y-1.5"><Label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[.14em] text-muted-foreground">{label}{pro && <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[9px] text-primary">PRO</span>}</Label>{children}</div>;
}

function Dropdown({ value, onChange, options, placeholder, disabled, allowNone }: { value: string; onChange: (v: string) => void; options: readonly string[]; placeholder?: string; disabled?: boolean; allowNone?: boolean }) {
  return <Select value={value || (allowNone ? NONE : undefined)} onValueChange={(v) => onChange(v === NONE ? "" : v)} disabled={disabled}>
    <SelectTrigger className="border-border/80 bg-background/50"><SelectValue placeholder={placeholder} /></SelectTrigger>
    <SelectContent className="max-h-72">{allowNone && <SelectItem value={NONE}>None</SelectItem>}{options.filter(Boolean).map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
  </Select>;
}

function Phase({ number, title, description, children }: { number: string; title: string; description: string; children: React.ReactNode }) {
  return <section className="studio-panel overflow-hidden rounded-lg">
    <header className="flex items-start gap-4 border-b border-border/70 px-4 py-4 sm:px-5">
      <span className="font-display text-xl text-primary">{number}</span>
      <div><h3 className="font-display text-base text-foreground">{title}</h3><p className="mt-1 text-xs text-muted-foreground">{description}</p></div>
    </header>
    <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">{children}</div>
  </section>;
}

function Chips({ options, selected, onToggle, locked, lockedOptions }: { options: readonly string[]; selected: string[]; onToggle: (v: string) => void; locked?: boolean; lockedOptions?: readonly string[] }) {
  return <div className="flex flex-wrap gap-2">{options.map((o) => {
    const isLocked = locked || (lockedOptions?.includes(o) ?? false);
    return <button key={o} type="button" disabled={isLocked} title={isLocked ? "Unlock with Pro Studio" : undefined} onClick={() => onToggle(o)} className={`rounded-md border px-2.5 py-1.5 text-xs transition ${selected.includes(o) ? "border-primary bg-primary/15 text-copper-soft" : "border-border bg-background/40 text-muted-foreground hover:border-primary/50"} disabled:cursor-not-allowed disabled:opacity-45`}>{isLocked && <Lock className="mr-1 inline h-3 w-3" />}{o}</button>;
  })}</div>;
}

export function PromptBuilder({ value, onChange, isPro = false }: Props) {
  const set = <K extends keyof PromptInputs>(key: K, next: PromptInputs[K]) => onChange({ ...value, [key]: next });
  const toggle = (key: "vocalExtras" | "moods" | "instruments" | "avoidPresets" | "referenceTraits", item: string) => set(key, value[key].includes(item) ? value[key].filter((x) => x !== item) : [...value[key], item]);
  const [advanced, setAdvanced] = useState(false);
  const subgenres = useMemo(() => SUBGENRES[value.mainGenre] ?? [], [value.mainGenre]);
  const moodColors = useMemo(() => value.moods[0] ? MOOD_COLORS[value.moods[0]] ?? [] : [], [value.moods]);
  const proGate = !isPro;

  return <div className="space-y-4">
    <div className="flex items-center justify-between rounded-lg border border-primary/25 bg-primary/5 px-4 py-3">
      <div><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">AI Song Blueprint Console</p><p className="mt-1 text-xs text-muted-foreground">Move from creative identity to final engine-ready direction.</p></div>
      <Badge variant="outline" className="border-primary/35">5 phases</Badge>
    </div>

    <Phase number="01" title="Creative Identity" description="Define the record's musical world and emotional intent.">
      <Field label="Blueprint title"><Input value={value.title} onChange={(e) => set("title", e.target.value)} maxLength={80} placeholder="Name this direction" className="bg-background/50" /></Field>
      <Field label="Blueprint type"><Dropdown value={value.promptType} onChange={(v) => set("promptType", v)} options={PROMPT_TYPES} /></Field>
      <Field label="Main genre"><Dropdown value={value.mainGenre} onChange={(v) => onChange({ ...value, mainGenre: v, subgenre: "" })} options={isPro ? [...STANDARD_MAIN_GENRES, ...PRO_MAIN_GENRES] : STANDARD_MAIN_GENRES} /></Field>
      <Field label="Subgenre" pro><Dropdown value={value.subgenre} onChange={(v) => set("subgenre", v)} options={subgenres} allowNone disabled={proGate} placeholder={isPro ? "Optional" : "Unlock with Pro"} /></Field>
      <Field label="Era"><Dropdown value={value.era} onChange={(v) => set("era", v)} options={ERAS} /></Field>
      <Field label="Fusion"><Dropdown value={value.fusionGenre} onChange={(v) => set("fusionGenre", v)} options={FUSION_GENRES} /></Field>
      <div className="sm:col-span-2"><Field label={`Mood · ${value.moods.length} selected`}><Chips options={isPro ? [...STANDARD_MOODS, ...PRO_MOODS] : STANDARD_MOODS} selected={value.moods} onToggle={(v) => toggle("moods", v)} /></Field></div>
      <Field label="Mood color" pro><Dropdown value={value.moodColor} onChange={(v) => set("moodColor", v)} options={moodColors} allowNone disabled={proGate || !moodColors.length} placeholder={isPro ? "Choose a mood first" : "Unlock with Pro"} /></Field>
      <Field label="Theme"><Dropdown value={value.themePreset} onChange={(v) => set("themePreset", v)} options={THEME_PRESETS} /></Field>
      <div className="sm:col-span-2"><Field label="Story detail"><Textarea value={value.topic} onChange={(e) => set("topic", e.target.value)} maxLength={200} rows={3} placeholder="Describe the emotional situation in one or two sentences." className="resize-none bg-background/50" /><p className="text-right text-[10px] text-muted-foreground">{value.topic.length}/200</p></Field></div>
    </Phase>

    <Phase number="02" title="Rhythm & Tonality" description="Set the pulse, harmonic center, drums, bass, and energy curve.">
      <Field label="Tempo"><Dropdown value={value.tempo} onChange={(v) => set("tempo", v)} options={TEMPOS} /></Field>
      <Field label="Custom BPM"><Input type="number" min={40} max={220} value={value.customBpm} onChange={(e) => set("customBpm", e.target.value)} disabled={value.tempo !== "Custom BPM"} placeholder="92" className="bg-background/50" /></Field>
      <Field label="Key / scale"><Dropdown value={value.key} onChange={(v) => set("key", v)} options={KEYS} /></Field>
      <Field label="Energy"><Dropdown value={value.energy} onChange={(v) => set("energy", v)} options={ENERGY_LEVELS} /></Field>
      <Field label="Drum character"><Dropdown value={value.drumStyle} onChange={(v) => set("drumStyle", v)} options={isPro ? [...STANDARD_DRUM_STYLES, ...PRO_DRUM_STYLES] : STANDARD_DRUM_STYLES} /></Field>
      <Field label="Rhythm pattern" pro><Dropdown value={value.rhythmPattern} onChange={(v) => set("rhythmPattern", v)} options={RHYTHM_PATTERNS} allowNone disabled={proGate} placeholder={isPro ? "Optional" : "Unlock with Pro"} /></Field>
      <Field label="Bass character" pro><Dropdown value={value.bassline} onChange={(v) => set("bassline", v)} options={BASSLINES} disabled={proGate} placeholder={isPro ? "Choose bass direction" : "Unlock with Pro"} /></Field>
      <Field label="Emotion depth"><Dropdown value={value.emotionDepth} onChange={(v) => set("emotionDepth", v)} options={EMOTION_DEPTHS} /></Field>
    </Phase>

    <Phase number="03" title="Voice & Musical Palette" description="Direct the performance, harmony, and exact instrument palette.">
      <Field label="Vocal type"><Dropdown value={value.vocalType} onChange={(v) => set("vocalType", v)} options={VOCAL_TYPES} /></Field>
      <Field label="Performance"><Dropdown value={value.vocalPerformance} onChange={(v) => set("vocalPerformance", v)} options={VOCAL_PERFORMANCES} /></Field>
      <Field label="Vocal register"><Dropdown value={value.vocalRegister} onChange={(v) => set("vocalRegister", v)} options={VOCAL_REGISTERS} /></Field>
      <Field label="Vocal texture"><Dropdown value={value.vocalTexture} onChange={(v) => set("vocalTexture", v)} options={VOCAL_TEXTURES} /></Field>
      <Field label="Harmony" pro><Dropdown value={value.harmonyStyle} onChange={(v) => set("harmonyStyle", v)} options={HARMONY_STYLES} disabled={proGate} /></Field>
      <Field label="Vocal extras"><Chips options={VOCAL_EXTRAS} selected={value.vocalExtras} onToggle={(v) => toggle("vocalExtras", v)} /></Field>
      <div className="sm:col-span-2"><Field label={`Instrumentation · ${value.instruments.length} selected`}><Chips options={advanced && isPro ? [...STANDARD_INSTRUMENTS, ...PRO_INSTRUMENTS] : STANDARD_INSTRUMENTS} selected={value.instruments} onToggle={(v) => toggle("instruments", v)} /><button type="button" onClick={() => isPro ? setAdvanced((v) => !v) : undefined} className="mt-2 text-xs text-primary hover:underline">{isPro ? (advanced ? "Hide advanced instruments" : `Show ${PRO_INSTRUMENTS.length} advanced instruments`) : <Link to="/pricing"><Lock className="mr-1 inline h-3 w-3" />Unlock advanced instruments</Link>}</button></Field></div>
    </Phase>

    <Phase number="04" title="Arrangement & Production" description="Shape the song's movement, hook, dynamics, and production character.">
      <Field label="Length / structure"><Dropdown value={value.songLength} onChange={(v) => set("songLength", v)} options={SONG_LENGTHS} /></Field>
      <Field label="Production style"><Dropdown value={value.productionStyle} onChange={(v) => set("productionStyle", v)} options={isPro ? [...STANDARD_PRODUCTION_STYLES, ...PRO_PRODUCTION_STYLES] : STANDARD_PRODUCTION_STYLES} /></Field>
      <Field label="Arrangement" pro><Dropdown value={value.arrangement} onChange={(v) => set("arrangement", v)} options={ARRANGEMENTS} allowNone disabled={proGate} placeholder={isPro ? "Optional" : "Unlock with Pro"} /></Field>
      <Field label="Dynamics arc" pro><Dropdown value={value.dynamicsArc} onChange={(v) => set("dynamicsArc", v)} options={DYNAMICS_ARCS} disabled={proGate} /></Field>
      <Field label="Hook type" pro><Dropdown value={value.hookType} onChange={(v) => set("hookType", v)} options={HOOK_TYPES} disabled={proGate} /></Field>
      <Field label="Vocal format" pro><Dropdown value={value.vocalFormat} onChange={(v) => set("vocalFormat", v)} options={VOCAL_FORMATS} allowNone disabled={proGate || value.hookType === "None"} /></Field>
    </Phase>

    <Phase number="05" title="Mix & Engine Translation" description="Finish the sonic image and translate your intent for the target engine.">
      <Field label="Mix character" pro><Dropdown value={value.mixingStyle} onChange={(v) => set("mixingStyle", v)} options={MIXING_STYLES} disabled={proGate} /></Field>
      <Field label="Sonic finish" pro><Dropdown value={value.sonicFinish} onChange={(v) => set("sonicFinish", v)} options={SONIC_FINISHES} allowNone disabled={proGate || value.mixingStyle === "None"} /></Field>
      <Field label="Stereo character" pro><Dropdown value={value.stereoCharacter} onChange={(v) => set("stereoCharacter", v)} options={STEREO_CHARACTERS} disabled={proGate} /></Field>
      <Field label="Sound quality"><Dropdown value={value.soundQuality} onChange={(v) => set("soundQuality", v)} options={SOUND_QUALITIES} /></Field>
      <Field label="Engine optimization" pro><Dropdown value={value.optimizationMode} onChange={(v) => set("optimizationMode", v)} options={OPTIMIZATION_MODES} disabled={proGate} /></Field>
      <Field label="Reference traits"><Chips options={REFERENCE_TRAITS} selected={value.referenceTraits} onToggle={(v) => toggle("referenceTraits", v)} lockedOptions={isPro ? undefined : PRO_REFERENCE_TRAITS} /></Field>
      <div className="sm:col-span-2"><Field label={`Avoid · ${value.avoidPresets.length} selected`}><Chips options={AVOID_PRESETS} selected={value.avoidPresets} onToggle={(v) => toggle("avoidPresets", v)} /></Field></div>
      <div className="sm:col-span-2"><Field label="Other avoid words"><Input value={value.avoidWords} onChange={(e) => set("avoidWords", e.target.value)} maxLength={120} placeholder="Optional words or clichés to exclude" className="bg-background/50" /></Field></div>
    </Phase>
  </div>;
}

export { Badge };