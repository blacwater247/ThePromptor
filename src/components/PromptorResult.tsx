import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Copy, Check, Save, Pencil, RefreshCw, Sparkles, Undo2 } from "lucide-react";
import { SCORE_LABELS, VARIATION_STYLES, type PromptorResult as Result, type VariationStyle } from "@/lib/promptor-ai";

type Props = {
  result: Result;
  busy: boolean;
  appliedLabels: string[];
  canUndo: boolean;
  onUndoApply: () => void;
  onSave: (text: string) => void;
  onRegenerate: () => void;
  onVariation: (style: VariationStyle) => void;
  onEdit: (text: string) => void;
  children?: React.ReactNode;
};

async function copyText(text: string) {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* fall through */ }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className="brand-gradient h-full rounded-full" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function PromptorResult({
  result, busy, appliedLabels, canUndo, onUndoApply, onSave, onRegenerate, onVariation, onEdit,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(result.finalPrompt);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setDraft(result.finalPrompt);
    setEditing(false);
  }, [result.finalPrompt]);

  const summary: [string, string][] = [
    ["Genre", result.summary.genre],
    ["Mood", result.summary.mood],
    ["Vocals", result.summary.vocals],
    ["Tempo", result.summary.tempo],
    ["Suggested BPM", result.summary.suggestedBpm],
    ["Instruments", result.summary.instruments],
    ["Production Style", result.summary.productionStyle],
    ["Song Structure", result.summary.songStructure],
  ];

  return (
    <Card className="studio-panel mb-6 p-5 sm:p-6 border-primary/40">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 brand-text" />
          <h2 className="font-display text-lg">PROMPTOR AI Result</h2>
        </div>
        {appliedLabels.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>PROMPTOR AI set: {appliedLabels.join(", ")}</span>
            {canUndo && (
              <Button size="sm" variant="ghost" className="h-7 px-2" onClick={onUndoApply}>
                <Undo2 className="h-3.5 w-3.5" /> Undo
              </Button>
            )}
          </div>
        )}
      </div>

      {editing ? (
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={8}
          className="mt-4 min-h-[180px] border-border/80 bg-background/50 font-mono text-[13px] leading-7"
        />
      ) : (
        <p className="mt-4 whitespace-pre-wrap rounded-md border border-border/60 bg-background/60 p-4 font-mono text-[13px] leading-7">
          {result.finalPrompt}
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-4">
        {summary.map(([label, value]) => (
          <div key={label} className="bg-background/70 px-3 py-2">
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
            <p className="mt-0.5 text-xs text-foreground">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={copied ? "default" : "secondary"}
          onClick={async () => {
            const ok = await copyText(editing ? draft : result.finalPrompt);
            if (ok) { setCopied(true); toast.success("Copied to clipboard"); setTimeout(() => setCopied(false), 2000); }
            else toast.error("Copy failed");
          }}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied!" : "Copy prompt"}
        </Button>
        <Button size="sm" variant="secondary" onClick={() => onSave(editing ? draft : result.finalPrompt)}>
          <Save className="h-4 w-4" /> Save prompt
        </Button>
        {editing ? (
          <>
            <Button size="sm" className="brand-gradient text-black font-semibold border-0" onClick={() => { onEdit(draft); setEditing(false); toast.success("Prompt updated"); }}>
              Save edit
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setDraft(result.finalPrompt); setEditing(false); }}>Cancel</Button>
          </>
        ) : (
          <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" /> Edit prompt
          </Button>
        )}
        <Button size="sm" variant="outline" className="border-primary/40 hover:bg-primary/10" onClick={onRegenerate} disabled={busy}>
          <RefreshCw className="h-4 w-4" /> Regenerate
        </Button>
      </div>

      <div className="mt-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Create variation</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {VARIATION_STYLES.map((style) => (
            <button
              key={style}
              type="button"
              disabled={busy}
              onClick={() => onVariation(style as VariationStyle)}
              className="rounded-full border border-border/70 bg-background/50 px-3 py-1.5 text-xs transition hover:border-primary/60 hover:text-primary disabled:opacity-50"
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-border/60 bg-background/40 p-4">
        <div className="flex items-baseline justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest brand-text">Prompt Strength</p>
          <p className="font-display text-2xl">{result.score.overall}<span className="text-sm text-muted-foreground">/100</span></p>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Measures how clearly and completely the prompt communicates musical intent. It does not predict how successful a song will be.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {SCORE_LABELS.map(([key, label]) => (
            <ScoreBar key={key} label={label} value={result.score[key] as number} />
          ))}
        </div>
        {result.score.recommendations.length > 0 && (
          <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
            {result.score.recommendations.map((rec) => (
              <li key={rec} className="flex gap-2"><span className="brand-text">→</span>{rec}</li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
