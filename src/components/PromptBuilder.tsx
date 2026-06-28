import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DRUM_STYLES, EMOTION_DEPTHS, ENERGY_LEVELS, FUSION_GENRES, INSTRUMENTS,
  KEYS, MAIN_GENRES, MOODS, PRODUCTION_STYLES, PROMPT_TYPES, SONG_LENGTHS,
  SOUND_QUALITIES, TEMPOS, THEME_PRESETS, VOCAL_EXTRAS, VOCAL_PERFORMANCES,
  VOCAL_TYPES, type PromptInputs,
} from "@/lib/prompt-options";

type Props = {
  value: PromptInputs;
  onChange: (next: PromptInputs) => void;
};

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium border transition ${
        active
          ? "brand-gradient text-white border-transparent shadow-md shadow-primary/30"
          : "bg-secondary/50 text-secondary-foreground border-border hover:bg-secondary"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Dropdown({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: readonly string[]; placeholder?: string }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="bg-secondary/40 border-border">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {options.map((o) => (
          <SelectItem key={o} value={o}>{o}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function PromptBuilder({ value, onChange }: Props) {
  const set = <K extends keyof PromptInputs>(k: K, v: PromptInputs[K]) => onChange({ ...value, [k]: v });

  const toggleArr = (key: "vocalExtras" | "moods" | "instruments", item: string) => {
    const arr = value[key];
    const next = arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
    onChange({ ...value, [key]: next });
  };

  return (
    <Accordion type="multiple" defaultValue={["basics", "genre", "vocals", "mood", "topic"]} className="w-full">
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
              maxLength={200}
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Prompt type"><Dropdown value={value.promptType} onChange={(v) => set("promptType", v)} options={PROMPT_TYPES} /></Field>
            <Field label="Length / structure"><Dropdown value={value.songLength} onChange={(v) => set("songLength", v)} options={SONG_LENGTHS} /></Field>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="genre">
        <AccordionTrigger className="text-base"><span className="flex items-center gap-2"><span className="text-primary">02</span> Genre</span></AccordionTrigger>
        <AccordionContent className="grid sm:grid-cols-2 gap-4 pt-2">
          <Field label="Main genre"><Dropdown value={value.mainGenre} onChange={(v) => set("mainGenre", v)} options={MAIN_GENRES} /></Field>
          <Field label="Fusion genre"><Dropdown value={value.fusionGenre} onChange={(v) => set("fusionGenre", v)} options={FUSION_GENRES} /></Field>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="vocals">
        <AccordionTrigger className="text-base"><span className="flex items-center gap-2"><span className="text-primary">03</span> Vocals</span></AccordionTrigger>
        <AccordionContent className="grid gap-4 pt-2">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Vocal type"><Dropdown value={value.vocalType} onChange={(v) => set("vocalType", v)} options={VOCAL_TYPES} /></Field>
            <Field label="Performance"><Dropdown value={value.vocalPerformance} onChange={(v) => set("vocalPerformance", v)} options={VOCAL_PERFORMANCES} /></Field>
          </div>
          <Field label="Vocal extras">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {VOCAL_EXTRAS.map((e) => (
                <label key={e} className="flex items-center gap-2 rounded-md border border-border bg-secondary/30 px-2.5 py-2 text-sm cursor-pointer hover:bg-secondary/50">
                  <Checkbox checked={value.vocalExtras.includes(e)} onCheckedChange={() => toggleArr("vocalExtras", e)} />
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
              {MOODS.map((m) => (
                <Chip key={m} active={value.moods.includes(m)} onClick={() => toggleArr("moods", m)}>{m}</Chip>
              ))}
            </div>
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Energy level"><Dropdown value={value.energy} onChange={(v) => set("energy", v)} options={ENERGY_LEVELS} /></Field>
            <Field label="Emotion depth"><Dropdown value={value.emotionDepth} onChange={(v) => set("emotionDepth", v)} options={EMOTION_DEPTHS} /></Field>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="topic">
        <AccordionTrigger className="text-base"><span className="flex items-center gap-2"><span className="text-primary">05</span> Topic & Story</span></AccordionTrigger>
        <AccordionContent className="grid gap-4 pt-2">
          <Field label="Theme preset"><Dropdown value={value.themePreset} onChange={(v) => set("themePreset", v)} options={THEME_PRESETS} /></Field>
          <Field label="Topic / story">
            <Textarea
              rows={4}
              value={value.topic}
              onChange={(e) => set("topic", e.target.value)}
              placeholder="A man who came from pain, learned to love himself, and now wins with confidence."
              className="bg-secondary/40 resize-none"
              maxLength={2000}
            />
          </Field>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="instruments">
        <AccordionTrigger className="text-base"><span className="flex items-center gap-2"><span className="text-primary">06</span> Instruments & Drums</span></AccordionTrigger>
        <AccordionContent className="grid gap-4 pt-2">
          <Field label={`Instruments (${value.instruments.length} selected)`}>
            <div className="flex flex-wrap gap-2">
              {INSTRUMENTS.map((i) => (
                <Chip key={i} active={value.instruments.includes(i)} onClick={() => toggleArr("instruments", i)}>{i}</Chip>
              ))}
            </div>
          </Field>
          <Field label="Drum style"><Dropdown value={value.drumStyle} onChange={(v) => set("drumStyle", v)} options={DRUM_STYLES} /></Field>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="tempo">
        <AccordionTrigger className="text-base"><span className="flex items-center gap-2"><span className="text-primary">07</span> Tempo & Key</span></AccordionTrigger>
        <AccordionContent className="grid sm:grid-cols-3 gap-4 pt-2">
          <Field label="Tempo"><Dropdown value={value.tempo} onChange={(v) => set("tempo", v)} options={TEMPOS} /></Field>
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
          <Field label="Key / scale"><Dropdown value={value.key} onChange={(v) => set("key", v)} options={KEYS} /></Field>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="style">
        <AccordionTrigger className="text-base"><span className="flex items-center gap-2"><span className="text-primary">08</span> Style Controls</span></AccordionTrigger>
        <AccordionContent className="grid gap-4 pt-2">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Production style"><Dropdown value={value.productionStyle} onChange={(v) => set("productionStyle", v)} options={PRODUCTION_STYLES} /></Field>
            <Field label="Sound quality"><Dropdown value={value.soundQuality} onChange={(v) => set("soundQuality", v)} options={SOUND_QUALITIES} /></Field>
          </div>
          <Field label="Avoid these words / styles">
            <Textarea
              rows={3}
              value={value.avoidWords}
              onChange={(e) => set("avoidWords", e.target.value)}
              placeholder="Do not mention artist names. Avoid the words neon, shadow, echo, violet."
              className="bg-secondary/40 resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">The AI will strictly avoid these words and styles.</p>
          </Field>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

// re-export the chip for visual reuse if needed
export { Badge };
