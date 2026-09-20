import { ChevronDown, Loader2 } from "lucide-react";
import { EXPLAIN_LABELS, type PromptorExplain } from "@/lib/promptor-ai";

type Props = {
  open: boolean;
  busy: boolean;
  data: PromptorExplain | null;
  costLabel: string;
  onToggle: () => void;
};

export function PromptorWhyThisWorks({ open, busy, data, costLabel, onToggle }: Props) {
  return (
    <div className="mt-4 rounded-lg border border-border/60 bg-background/40">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-[10px] font-bold uppercase tracking-widest brand-text">Why this works</span>
        <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
          {!data && costLabel}
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : (
            <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
          )}
        </span>
      </button>
      {open && data && (
        <div className="space-y-3 border-t border-border/60 px-4 py-3">
          {EXPLAIN_LABELS.map(([key, label]) => (
            <div key={key}>
              <p className="text-[11px] font-semibold text-foreground">{label}</p>
              <p className="mt-0.5 text-xs leading-6 text-muted-foreground">{data[key]}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
