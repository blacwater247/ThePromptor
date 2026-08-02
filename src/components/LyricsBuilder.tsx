import { Link } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Crown, Lock } from "lucide-react";
import {
  STANDARD_MAIN_GENRES, PRO_MAIN_GENRES, STANDARD_MOODS, PRO_MOODS,
  THEME_PRESETS, VOCAL_TYPES, SONG_STRUCTURES, PERSPECTIVES, RHYME_SCHEMES,
  STANDARD_WRITING_STYLES, PRO_WRITING_STYLES, LANGUAGES, EXPLICITNESS,
  LYRIC_LENGTHS, type LyricsInputs,
} from "@/lib/lyrics-options";

type Props = {
  value: LyricsInputs;
  onChange: (next: LyricsInputs) => void;
  isPro?: boolean;
};

function Chip({ active, locked, onClick, children }: { active: boolean; locked?: boolean; onClick: () => void; children: React.ReactNode }) {
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

export function LyricsBuilder({ value, onChange, isPro = false }: Props) {
  const set = <K extends keyof LyricsInputs>(key: K, v: LyricsInputs[K]) =>
    onChange({ ...value, [key]: v });

  const toggleMood = (m: string) =>
    set("moods", value.moods.includes(m) ? value.moods.filter((x) => x !== m) : [...value.moods, m]);

  const Dropdown = ({
    label, options, proOptions = [], field,
  }: { label: string; options: string[]; proOptions?: string[]; field: keyof LyricsInputs }) => (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      <Select value={value[field] as string} onValueChange={(v) => set(field, v as never)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          {proOptions.map((o) =>
            isPro ? (
              <SelectItem key={o} value={o}>👑 {o}</SelectItem>
            ) : (
              <SelectItem key={o} value={o} disabled>🔒 {o} — Pro</SelectItem>
            )
          )}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <Accordion type="multiple" defaultValue={["song", "style", "words"]} className="w-full">
      <AccordionItem value="song">
        <AccordionTrigger className="text-sm font-semibold">Song</AccordionTrigger>
        <AccordionContent className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Title (optional)</Label>
            <Input value={value.title} maxLength={80} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Midnight Testimony" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Dropdown label="Genre" options={STANDARD_MAIN_GENRES} proOptions={PRO_MAIN_GENRES} field="genre" />
            <Dropdown label="Vocal" options={VOCAL_TYPES} field="vocalType" />
            <Dropdown label="Theme" options={THEME_PRESETS} field="theme" />
            <Dropdown label="Length" options={LYRIC_LENGTHS} field="length" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">What is the song about?</Label>
            <Textarea
              value={value.topic}
              maxLength={400}
              rows={3}
              onChange={(e) => set("topic", e.target.value)}
              placeholder="A late-night drive back to the neighborhood you swore you'd leave behind…"
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="style">
        <AccordionTrigger className="text-sm font-semibold">Mood &amp; Style</AccordionTrigger>
        <AccordionContent className="space-y-4 pt-1">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Mood</Label>
            <div className="flex flex-wrap gap-2">
              {STANDARD_MOODS.map((m) => (
                <Chip key={m} active={value.moods.includes(m)} onClick={() => toggleMood(m)}>{m}</Chip>
              ))}
              {PRO_MOODS.map((m) =>
                isPro ? (
                  <Chip key={m} active={value.moods.includes(m)} onClick={() => toggleMood(m)}>{m}</Chip>
                ) : (
                  <Link key={m} to="/pricing" className="inline-block">
                    <Chip locked active={false} onClick={() => {}}>{m}</Chip>
                  </Link>
                )
              )}
            </div>
            {!isPro && (
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Crown className="h-3 w-3" /> Locked moods and styles unlock with the Monthly plan.
              </p>
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Dropdown label="Writing style" options={STANDARD_WRITING_STYLES} proOptions={PRO_WRITING_STYLES} field="writingStyle" />
            <Dropdown label="Point of view" options={PERSPECTIVES} field="perspective" />
            <Dropdown label="Structure" options={SONG_STRUCTURES} field="structure" />
            <Dropdown label="Rhyme approach" options={RHYME_SCHEMES} field="rhymeScheme" />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="words">
        <AccordionTrigger className="text-sm font-semibold">Words &amp; Rules</AccordionTrigger>
        <AccordionContent className="space-y-4 pt-1">
          <div className="grid sm:grid-cols-2 gap-4">
            <Dropdown label="Language" options={LANGUAGES} field="language" />
            <Dropdown label="Content rating" options={EXPLICITNESS} field="explicitness" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Hook phrase to include (optional)</Label>
            <Input value={value.keyPhrase} maxLength={120} onChange={(e) => set("keyPhrase", e.target.value)} placeholder="e.g. still standing in the rain" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Words / themes to avoid</Label>
            <Input value={value.avoidWords} maxLength={160} onChange={(e) => set("avoidWords", e.target.value)} placeholder="comma separated" />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
