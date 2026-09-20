import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Shuffle, Wand2, X, ArrowRight } from "lucide-react";

type ImproveView = { original: string; improved: string; issues: string[] } | null;

type Props = {
  busy: boolean;
  busyAction: string | null;
  disabled?: boolean;
  costLabel: string;
  improve: ImproveView;
  onGenerate: (idea: string) => void;
  onSurprise: () => void;
  onImprove: (existing: string) => void;
  onUseImproved: (text: string) => void;
  onDismissImprove: () => void;
};

const PLACEHOLDER =
  "Create a sensual R&B song with a soulful female vocalist, live bass, warm electric piano, violin, deep drums, and a late-night romantic feeling.";

export function PromptorAIBox({
  busy, busyAction, disabled, costLabel, improve,
  onGenerate, onSurprise, onImprove, onUseImproved, onDismissImprove,
}: Props) {
  const [idea, setIdea] = useState("");
  const [improveOpen, setImproveOpen] = useState(false);
  const [existing, setExisting] = useState("");

  return (
    <Card className="studio-panel mb-6 p-5 sm:p-6 border-primary/40">
      <div className="flex items-center gap-2">
        <div className="brand-gradient flex h-8 w-8 items-center justify-center rounded-md shadow-md shadow-primary/30">
          <Brain className="h-4 w-4 text-black" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.18em] brand-text">PROMPTOR AI</p>
          <h2 className="font-display text-xl sm:text-2xl leading-tight">What Do You Want To Create?</h2>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Tell PROMPTOR AI your idea in plain English. It will build the production prompt for you.
      </p>

      <Textarea
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        placeholder={PLACEHOLDER}
        rows={4}
        maxLength={1200}
        className="mt-4 min-h-[110px] resize-y border-border/80 bg-background/50 text-sm"
      />

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button
          onClick={() => onGenerate(idea)}
          disabled={busy || disabled || !idea.trim()}
          className="w-full sm:w-auto brand-gradient text-black font-semibold border-0 hover:opacity-90"
        >
          <Brain className="h-4 w-4" />
          {busy && busyAction === "analyze" ? "Thinking…" : "Generate with AI"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onSurprise}
          disabled={busy || disabled}
          className="w-full sm:w-auto border-primary/40 hover:bg-primary/10"
        >
          <Shuffle className="h-4 w-4" />
          {busy && busyAction === "surprise" ? "Dreaming…" : "Surprise me"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setImproveOpen((v) => !v)}
          disabled={busy}
          className="w-full sm:w-auto border-primary/40 hover:bg-primary/10"
        >
          <Wand2 className="h-4 w-4" />
          Improve my prompt
        </Button>
        <span className="self-center text-xs text-muted-foreground">{costLabel}</span>
      </div>

      {improveOpen && (
        <div className="mt-4 rounded-lg border border-border/70 bg-background/40 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm">Paste an existing prompt</h3>
            <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Close improve panel" onClick={() => setImproveOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Textarea
            value={existing}
            onChange={(e) => setExisting(e.target.value)}
            rows={4}
            maxLength={4000}
            placeholder="Paste the music prompt you already have…"
            className="mt-2 min-h-[100px] resize-y border-border/80 bg-background/50 text-sm"
          />
          <Button
            onClick={() => onImprove(existing)}
            disabled={busy || disabled || !existing.trim()}
            className="mt-3 brand-gradient text-black font-semibold border-0 hover:opacity-90"
          >
            <Wand2 className="h-4 w-4" />
            {busy && busyAction === "improve" ? "Analysing…" : "Analyse & improve"}
          </Button>

          {improve && (
            <div className="mt-4 space-y-3">
              {improve.issues.length > 0 && (
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {improve.issues.map((issue) => (
                    <li key={issue} className="flex gap-2"><span className="brand-text">•</span>{issue}</li>
                  ))}
                </ul>
              )}
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-md border border-border/60 bg-background/60 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Original prompt</p>
                  <p className="mt-2 whitespace-pre-wrap font-mono text-[12px] leading-6 text-muted-foreground">{improve.original}</p>
                </div>
                <div className="rounded-md border border-primary/40 bg-background/60 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest brand-text">AI-improved prompt</p>
                  <p className="mt-2 whitespace-pre-wrap font-mono text-[12px] leading-6">{improve.improved}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => onUseImproved(improve.improved)} className="brand-gradient text-black font-semibold border-0 hover:opacity-90">
                  Use improved version <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={onDismissImprove}>Keep my original</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
