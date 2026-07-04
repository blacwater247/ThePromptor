import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Crown, Lock } from "lucide-react";
import {
  AVOID_PRESETS, EMOTION_DEPTHS, ENERGY_LEVELS, FUSION_GENRES, KEYS,
  PROMPT_TYPES, SONG_LENGTHS, SOUND_QUALITIES, THEME_PRESETS, TEMPOS,
  VOCAL_EXTRAS, VOCAL_PERFORMANCES, VOCAL_TYPES,
  STANDARD_MAIN_GENRES, PRO_MAIN_GENRES, SUBGENRES,
  STANDARD_MOODS, PRO_MOODS, MOOD_COLORS,
  STANDARD_INSTRUMENTS, PRO_INSTRUMENTS,
  STANDARD_DRUM_STYLES, PRO_DRUM_STYLES, RHYTHM_PATTERNS,
  STANDARD_PRODUCTION_STYLES, PRO_PRODUCTION_STYLES, ARRANGEMENTS,
  MIXING_STYLES, SONIC_FINISHES, HOOK_TYPES, VOCAL_FORMATS, BASSLINES,
  type PromptInputs,
} from "@/lib/prompt-options";

type Props = {
  value: PromptInputs;
  onChange: (next: PromptInputs) => void;
  isPro?: boolean;
};

function Chip({ active, onClick, children, locked }: { active: boolean; onClick: () => void; children: React.ReactNode; locked?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium border transition inline-flex items-center gap-1 ${
        locked
          ? "bg-secondary/20 text-muted-foreground border-border/50 hover:bg-secondary/30"
          : active
          ? "brand-gradient text-white border-transparent shadow-md shadow-primary/30"
          : "bg-secondary/50 text-secondary-foreground border-border hover:bg-secondary"
      }`}
    >
      {locked && <Lock className="h-3 w-3" />}
      {children}
    </button>
  );
}

function ProLockedChip({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to="/pricing" className="inline-block">
            <Chip locked active={false} onClick={() => {}}>{children}</Chip>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <span className="flex items-center gap-1"><Crown className="h-3 w-3" /> Pro plan — click to upgrade</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function Field({ label, children, pro }: { label: string; children: React.ReactNode; pro?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        {label}
        {pro && <span className="inline-flex items-center gap-0.5 rounded bg-primary/20 brand-text text-[9px] font-bold px-1 py-0.5"><Crown className="h-2.5 w-2.5" /> PRO</span>}
      </Label>
      {children}
    </div>
  );
}

const NONE_VALUE = "__none__";

function Dropdown({
  value, onChange, standard, pro = [], isPro = false, placeholder, disabled, allowNone = false,
}: {
  value: string;
  onChange: (v: string) => void;
  standard: readonly string[];
  pro?: readonly string[];
  isPro?: boolean;
  placeholder?: string;
  disabled?: boolean;
  allowNone?: boolean;
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const base = showAdvanced && isPro ? [...standard, ...pro] : standard;
  const options = base.filter((o) => o !== "");
  const selectValue = value === "" ? (allowNone ? NONE_VALUE : undefined) : value;
  return (
    <div className="space-y-1">
      <Select
        value={selectValue}
        onValueChange={(v) => onChange(v === NONE_VALUE ? "" : v)}
        disabled={disabled}
      >
        <SelectTrigger className="bg-secondary/40 border-border">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {allowNone && <SelectItem value={NONE_VALUE}>None</SelectItem>}
          {options.map((o) => (
            <SelectItem key={o} value={o}>{o}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {pro.length > 0 && (
        isPro ? (
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="text-[11px] brand-text hover:underline"
          >
            {showAdvanced ? "Hide advanced" : `+ ${pro.length} more (Advanced)`}
          </button>
        ) : (
          <Link to="/pricing" className="text-[11px] text-muted-foreground hover:brand-text inline-flex items-center gap-1">
            <Lock className="h-2.5 w-2.5" /> +{pro.length} more with Pro
          </Link>
        )
      )}
    </div>
  );
}


export function PromptBuilder({ value, onChange, isPro = false }: Props) {
  const set = <K extends keyof PromptInputs>(k: K, v: PromptInputs[K]) => onChange({ ...value, [k]: v });

  const toggleArr = (key: "vocalExtras" | "moods" | "instruments" | "avoidPresets", item: string) => {
    const arr = value[key];
    const next = arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
    onChange({ ...value, [key]: next });
  };

  const [showAdvInstruments, setShowAdvInstruments] = useState(false);
  const [showAdvMoods, setShowAdvMoods] = useState(false);

  const subgenreOptions = useMemo(
    () => SUBGENRES[value.mainGenre] ?? [],
    [value.mainGenre],
  );
  const moodColorOptions = useMemo(() => {
    const firstMood = value.moods[0];
    return firstMood ? MOOD_COLORS[firstMood] ?? [] : [];
  }, [value.moods]);


  return (
    <Accordion type="multiple" defaultValue={["basics", "genre", "vocals", "mood", "topic", "instruments", "tempo", "style"]} className="w-full">
      <AccordionItem value="basics">
        <AccordionTrigger className="text-base">
          <span className="flex items-center gap-2"><span className="text-primary">01</span> Song Basics</span>
        </AccordionTrigger>
        <AccordionContent className="grid gap-4 pt-2">
          <Field label="Song title">
            <Input
              value={value.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder='e.g. "Love Myself to Win"'
              className="bg-secondary/40"
              maxLength={80}
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Prompt type"><Dropdown value={value.promptType} onChange={(v) => set("promptType", v)} standard={PROMPT_TYPES} /></Field>
            <Field label="Length / structure"><Dropdown value={value.songLength} onChange={(v) => set("songLength", v)} standard={SONG_LENGTHS} /></Field>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="genre">
        <AccordionTrigger className="text-base"><span className="flex items-center gap-2"><span className="text-primary">02</span> Genre</span></AccordionTrigger>
        <AccordionContent className="grid sm:grid-cols-2 gap-4 pt-2">
          <Field label="Main genre">
            <Dropdown value={value.mainGenre} onChange={(v) => { set("mainGenre", v); set("subgenre", ""); }} standard={STANDARD_MAIN_GENRES} pro={PRO_MAIN_GENRES} isPro={isPro} />
          </Field>
          <Field label="Subgenre" pro>
            <Dropdown
              value={value.subgenre}
              onChange={(v) => set("subgenre", v)}
              standard={subgenreOptions}
              disabled={!isPro || subgenreOptions.length <= 1}
              placeholder={isPro ? (subgenreOptions.length > 1 ? "Optional — pick a subgenre" : "No subgenres for this genre") : "Pro only"}
            />
          </Field>
          <Field label="Fusion genre"><Dropdown value={value.fusionGenre} onChange={(v) => set("fusionGenre", v)} standard={FUSION_GENRES} /></Field>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="vocals">
        <AccordionTrigger className="text-base"><span className="flex items-center gap-2"><span className="text-primary">03</span> Vocals</span></AccordionTrigger>
        <AccordionContent className="grid gap-4 pt-2">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Vocal type"><Dropdown value={value.vocalType} onChange={(v) => set("vocalType", v)} standard={VOCAL_TYPES} /></Field>
            <Field label="Performance"><Dropdown value={value.vocalPerformance} onChange={(v) => set("vocalPerformance", v)} standard={VOCAL_PERFORMANCES} /></Field>
          </div>
          <Field label="Vocal extras">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {VOCAL_EXTRAS.map((e) => (
                <label key={e} className="flex items-center gap-2 rounded-md border border-border bg-secondary/30 px-2.5 py-2 text-sm cursor-pointer hover:bg-secondary/50">
                  <Checkbox aria-label={e} checked={value.vocalExtras.includes(e)} onCheckedChange={() => toggleArr("vocalExtras", e)} />
                  <span>{e}</span>
                </label>
              ))}
            </div>
          </Field>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="mood">
        <AccordionTrigger className="text-base"><span className="flex items-center gap-2"><span className="text-primary">04</span> Mood</span></AccordionTrigger>
        <AccordionContent className="grid gap-4 pt-2">
          <Field label={`Mood (${value.moods.length} selected)`}>
            <div className="flex flex-wrap gap-2">
              {STANDARD_MOODS.map((m) => (
                <Chip key={m} active={value.moods.includes(m)} onClick={() => toggleArr("moods", m)}>{m}</Chip>
              ))}
              {isPro && showAdvMoods && PRO_MOODS.map((m) => (
                <Chip key={m} active={value.moods.includes(m)} onClick={() => toggleArr("moods", m)}>{m}</Chip>
              ))}
            </div>
            {isPro ? (
              <button type="button" onClick={() => setShowAdvMoods((v) => !v)} className="mt-2 text-[11px] brand-text hover:underline">
                {showAdvMoods ? "Hide advanced" : `+ ${PRO_MOODS.length} more moods (Advanced)`}
              </button>
            ) : (
              <Link to="/pricing" className="mt-2 text-[11px] text-muted-foreground hover:brand-text inline-flex items-center gap-1">
                <Lock className="h-2.5 w-2.5" /> +{PRO_MOODS.length} more moods with Pro
              </Link>
            )}
          </Field>
          <Field label="Emotional color" pro>
            <Dropdown
              value={value.moodColor}
              onChange={(v) => set("moodColor", v)}
              standard={moodColorOptions}
              disabled={!isPro || moodColorOptions.length <= 1}
              placeholder={isPro ? (moodColorOptions.length > 1 ? "Pick an emotional color" : "Pick a mood first") : "Pro only"}
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Energy level"><Dropdown value={value.energy} onChange={(v) => set("energy", v)} standard={ENERGY_LEVELS} /></Field>
            <Field label="Emotion depth"><Dropdown value={value.emotionDepth} onChange={(v) => set("emotionDepth", v)} standard={EMOTION_DEPTHS} /></Field>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="topic">
        <AccordionTrigger className="text-base"><span className="flex items-center gap-2"><span className="text-primary">05</span> Topic & Story</span></AccordionTrigger>
        <AccordionContent className="grid gap-4 pt-2">
          <Field label="Theme preset"><Dropdown value={value.themePreset} onChange={(v) => set("themePreset", v)} standard={THEME_PRESETS} /></Field>
          <Field label="Extra story detail (optional)">
            <Textarea
              rows={3}
              value={value.topic}
              onChange={(e) => set("topic", e.target.value)}
              placeholder="One or two sentences of specific detail."
              className="bg-secondary/40 resize-none"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground mt-1">{value.topic.length}/200</p>
          </Field>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="tempo">
        <AccordionTrigger className="text-base"><span className="flex items-center gap-2"><span className="text-primary">06</span> Tempo & Key</span></AccordionTrigger>
        <AccordionContent className="grid sm:grid-cols-3 gap-4 pt-2">
          <Field label="Tempo"><Dropdown value={value.tempo} onChange={(v) => set("tempo", v)} standard={TEMPOS} /></Field>
          <Field label="Custom BPM">
            <Input
              type="number"
              min={40}
              max={220}
              value={value.customBpm}
              onChange={(e) => set("customBpm", e.target.value)}
              placeholder="e.g. 92"
              disabled={value.tempo !== "Custom BPM"}
              className="bg-secondary/40"
            />
          </Field>
          <Field label="Key / scale"><Dropdown value={value.key} onChange={(v) => set("key", v)} standard={KEYS} /></Field>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="style">
        <AccordionTrigger className="text-base"><span className="flex items-center gap-2"><span className="text-primary">07</span> Style & Production</span></AccordionTrigger>
        <AccordionContent className="grid gap-4 pt-2">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Production style"><Dropdown value={value.productionStyle} onChange={(v) => set("productionStyle", v)} standard={STANDARD_PRODUCTION_STYLES} pro={PRO_PRODUCTION_STYLES} isPro={isPro} /></Field>
            <Field label="Arrangement" pro>
              <Dropdown
                value={value.arrangement}
                onChange={(v) => set("arrangement", v)}
                standard={["", ...ARRANGEMENTS]}
                disabled={!isPro}
                placeholder={isPro ? "Optional arrangement direction" : "Pro only"}
              />
            </Field>
            <Field label="Sound quality"><Dropdown value={value.soundQuality} onChange={(v) => set("soundQuality", v)} standard={SOUND_QUALITIES} /></Field>
          </div>
          <Field label={`Avoid these (${value.avoidPresets.length} selected)`}>
            <div className="flex flex-wrap gap-2">
              {AVOID_PRESETS.map((a) => (
                <Chip key={a} active={value.avoidPresets.includes(a)} onClick={() => toggleArr("avoidPresets", a)}>{a}</Chip>
              ))}
            </div>
          </Field>
          <Field label="Other avoid words (optional)">
            <Input
              value={value.avoidWords}
              onChange={(e) => set("avoidWords", e.target.value)}
              placeholder="e.g. violet, midnight"
              className="bg-secondary/40"
              maxLength={120}
            />
          </Field>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="drums">
        <AccordionTrigger className="text-base"><span className="flex items-center gap-2"><span className="text-primary">08</span> Drum Feel</span></AccordionTrigger>
        <AccordionContent className="grid sm:grid-cols-2 gap-4 pt-2">
          <Field label="Drum style"><Dropdown value={value.drumStyle} onChange={(v) => set("drumStyle", v)} standard={STANDARD_DRUM_STYLES} pro={PRO_DRUM_STYLES} isPro={isPro} /></Field>
          <Field label="Rhythm pattern" pro>
            <Dropdown
              value={value.rhythmPattern}
              onChange={(v) => set("rhythmPattern", v)}
              standard={["", ...RHYTHM_PATTERNS]}
              disabled={!isPro}
              placeholder={isPro ? "Pick a rhythm pattern" : "Pro only"}
            />
          </Field>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="bassline">
        <AccordionTrigger className="text-base"><span className="flex items-center gap-2"><span className="text-primary">09</span> Bassline <Crown className="h-3.5 w-3.5 brand-text" /></span></AccordionTrigger>
        <AccordionContent className="pt-2">
          <Field label="Bassline direction" pro>
            <Dropdown
              value={value.bassline}
              onChange={(v) => set("bassline", v)}
              standard={BASSLINES}
              disabled={!isPro}
              placeholder={isPro ? "Optional bass direction" : "Pro only"}
            />
          </Field>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="mixing">
        <AccordionTrigger className="text-base"><span className="flex items-center gap-2"><span className="text-primary">10</span> Mixing Style <Crown className="h-3.5 w-3.5 brand-text" /></span></AccordionTrigger>
        <AccordionContent className="grid sm:grid-cols-2 gap-4 pt-2">
          <Field label="Mixing style" pro>
            <Dropdown
              value={value.mixingStyle}
              onChange={(v) => set("mixingStyle", v)}
              standard={MIXING_STYLES}
              disabled={!isPro}
              placeholder={isPro ? "Pick a mixing style" : "Pro only"}
            />
          </Field>
          <Field label="Sonic finish" pro>
            <Dropdown
              value={value.sonicFinish}
              onChange={(v) => set("sonicFinish", v)}
              standard={["", ...SONIC_FINISHES]}
              disabled={!isPro || !value.mixingStyle || value.mixingStyle === "None"}
              placeholder={isPro ? (value.mixingStyle && value.mixingStyle !== "None" ? "Pick a finish" : "Pick a mix first") : "Pro only"}
            />
          </Field>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="hook">
        <AccordionTrigger className="text-base"><span className="flex items-center gap-2"><span className="text-primary">11</span> Hook Type <Crown className="h-3.5 w-3.5 brand-text" /></span></AccordionTrigger>
        <AccordionContent className="grid sm:grid-cols-2 gap-4 pt-2">
          <Field label="Hook type" pro>
            <Dropdown
              value={value.hookType}
              onChange={(v) => set("hookType", v)}
              standard={HOOK_TYPES}
              disabled={!isPro}
              placeholder={isPro ? "Pick a hook" : "Pro only"}
            />
          </Field>
          <Field label="Vocal format" pro>
            <Dropdown
              value={value.vocalFormat}
              onChange={(v) => set("vocalFormat", v)}
              standard={["", ...VOCAL_FORMATS]}
              disabled={!isPro || !value.hookType || value.hookType === "None"}
              placeholder={isPro ? (value.hookType && value.hookType !== "None" ? "Pick a format" : "Pick a hook first") : "Pro only"}
            />
          </Field>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="instruments">
        <AccordionTrigger className="text-base"><span className="flex items-center gap-2"><span className="text-primary">12</span> Instruments</span></AccordionTrigger>
        <AccordionContent className="grid gap-4 pt-2">
          <Field label={`Instruments (${value.instruments.length} selected)`}>
            <div className="flex flex-wrap gap-2">
              {STANDARD_INSTRUMENTS.map((i) => (
                <Chip key={i} active={value.instruments.includes(i)} onClick={() => toggleArr("instruments", i)}>{i}</Chip>
              ))}
              {isPro && showAdvInstruments && PRO_INSTRUMENTS.map((i) => (
                <Chip key={i} active={value.instruments.includes(i)} onClick={() => toggleArr("instruments", i)}>{i}</Chip>
              ))}
            </div>
            {isPro ? (
              <button type="button" onClick={() => setShowAdvInstruments((v) => !v)} className="mt-2 text-[11px] brand-text hover:underline">
                {showAdvInstruments ? "Hide advanced" : `+ ${PRO_INSTRUMENTS.length} more instruments (Advanced)`}
              </button>
            ) : (
              <Link to="/pricing" className="mt-2 text-[11px] text-muted-foreground hover:brand-text inline-flex items-center gap-1">
                <Lock className="h-2.5 w-2.5" /> +{PRO_INSTRUMENTS.length} more instruments with Pro
              </Link>
            )}
          </Field>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export { Badge, ProLockedChip };
