import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Check, Save, Trash2, Music4, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export type SavedPrompt = {
  id: string;
  title: string;
  createdAt: number;
  prompt: string;
};

type Props = {
  prompt: string;
  loading: boolean;
  streaming?: boolean;
  error: string | null;
  onSave: () => void;
  saved: SavedPrompt[];
  onDelete: (id: string) => void;
  onUseSaved: (p: SavedPrompt) => void;
};


async function copyText(text: string) {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to fallback
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "0";
    ta.style.left = "0";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

function CopyButton({ text, label = "Copy", ariaLabel }: { text: string; label?: string; ariaLabel?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant={copied ? "default" : "secondary"}
      size="sm"
      aria-label={ariaLabel ?? (label ? undefined : "Copy prompt")}
      className={copied ? "bg-emerald-600 hover:bg-emerald-600 text-white border-0 transition-colors" : "transition-colors"}
      onClick={async () => {
        const ok = await copyText(text);
        if (ok) {
          setCopied(true);
          toast.success("Copied to clipboard");
          setTimeout(() => setCopied(false), 2000);
        } else {
          toast.error("Copy failed");
        }
      }}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {(label || copied) && <span className="ml-1.5">{copied ? "Copied!" : label}</span>}
    </Button>
  );
}


export function PromptPreview({ prompt, loading, streaming, error, onSave, saved, onDelete, onUseSaved }: Props) {
  const hasStreamingText = streaming && prompt.length > 0;
  const showSkeleton = loading && !hasStreamingText;
  return (
    <div className="space-y-6 lg:sticky lg:top-6">
      <Card className="border-border/60 bg-card/70 backdrop-blur p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="brand-gradient w-7 h-7 rounded-md flex items-center justify-center shadow-md shadow-primary/30">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <h2 className="font-display text-lg font-semibold">Generated Prompt</h2>
            {streaming && <span className="text-[10px] uppercase tracking-widest brand-text animate-pulse">Streaming…</span>}
          </div>
          {prompt && !loading && (
            <div className="flex gap-2">
              <CopyButton text={prompt} />
              <Button size="sm" onClick={onSave} className="brand-gradient text-white border-0 hover:opacity-90">
                <Save className="h-4 w-4" />
                <span className="ml-1.5">Save</span>
              </Button>
            </div>
          )}
        </div>

        <div className="min-h-[220px] rounded-lg bg-secondary/30 border border-border/60 p-4 text-sm leading-relaxed whitespace-pre-wrap">
          {showSkeleton ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-3 rounded bg-secondary w-11/12" />
              <div className="h-3 rounded bg-secondary w-10/12" />
              <div className="h-3 rounded bg-secondary w-full" />
              <div className="h-3 rounded bg-secondary w-9/12" />
              <div className="h-3 rounded bg-secondary w-10/12" />
              <p className="text-xs text-muted-foreground pt-3">Composing your studio-ready prompt…</p>
            </div>
          ) : error ? (
            <p className="text-destructive">{error}</p>
          ) : prompt ? (
            <p>{prompt}{hasStreamingText && <span className="inline-block w-1.5 h-4 ml-0.5 bg-primary/80 align-middle animate-pulse" />}</p>
          ) : (
            <div className="text-muted-foreground flex flex-col items-center justify-center h-full text-center pt-6">
              <Music4 className="h-8 w-8 mb-2 opacity-50" />
              <p>Configure your song on the left, then hit <span className="text-foreground font-medium">Generate Prompt</span>.</p>
            </div>
          )}
        </div>
      </Card>


      <Card className="border-border/60 bg-card/70 backdrop-blur p-5">
        <h3 className="font-display text-base font-semibold mb-3">Saved Prompts {saved.length > 0 && <span className="text-muted-foreground font-normal text-sm">({saved.length})</span>}</h3>
        {saved.length === 0 ? (
          <p className="text-sm text-muted-foreground">Your saved prompts will appear here. Stored locally in your browser.</p>
        ) : (
          <ul className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {saved.map((s) => (
              <li key={s.id} className="rounded-lg border border-border/60 bg-secondary/20 p-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <button onClick={() => onUseSaved(s)} className="text-left font-medium text-sm hover:text-primary transition">
                    {s.title || "Untitled prompt"}
                  </button>
                  <div className="flex gap-1">
                    <CopyButton text={s.prompt} label="" ariaLabel={`Copy prompt: ${s.title || "Untitled prompt"}`} />
                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Delete prompt: ${s.title || "Untitled prompt"}`} onClick={() => onDelete(s.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{s.prompt}</p>
                <p className="text-[10px] text-muted-foreground/70 mt-1">{new Date(s.createdAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
