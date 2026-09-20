import { Button } from "@/components/ui/button";
import { Loader2, PenLine } from "lucide-react";
import { LYRIC_CONCEPT_LABELS, type PromptorLyricConcept as Concept } from "@/lib/promptor-ai";

type Props = {
  busy: boolean;
  data: Concept | null;
  costLabel: string;
  onGenerate: () => void;
  onWriteLyrics: () => void;
};

export function PromptorLyricConcept({ busy, data, costLabel, onGenerate, onWriteLyrics }: Props) {
  return (
    <div className="mt-4 rounded-lg border border-border/60 bg-background/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-widest brand-text">Lyric concept</p>
        <Button size="sm" variant="secondary" onClick={onGenerate} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenLine className="h-4 w-4" />}
          {data ? "Regenerate concept" : `Develop concept · ${costLabel}`}
        </Button>
      </div>
      {!data && (
        <p className="mt-2 text-[11px] text-muted-foreground">
          Direction first — theme, point of view, conflict and hook. No lyrics until you ask for them.
        </p>
      )}
      {data && (
        <>
          <div className="mt-3 space-y-3">
            {LYRIC_CONCEPT_LABELS.map(([key, label]) => (
              <div key={key}>
                <p className="text-[11px] font-semibold text-foreground">{label}</p>
                <p className="mt-0.5 text-xs leading-6 text-muted-foreground">{data[key]}</p>
              </div>
            ))}
          </div>
          <Button
            size="sm"
            className="brand-gradient mt-4 border-0 font-semibold text-black"
            onClick={onWriteLyrics}
          >
            Write the lyrics
          </Button>
        </>
      )}
    </div>
  );
}
