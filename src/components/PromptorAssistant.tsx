import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Bot, Loader2, Send, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { QUICK_COMMANDS, type PromptorChatMessage } from "@/lib/promptor-ai";

type Props = {
  open: boolean;
  busy: boolean;
  messages: PromptorChatMessage[];
  costLabel: string;
  onOpenChange: (open: boolean) => void;
  onSend: (message: string) => void;
};

function Body({ busy, messages, costLabel, onSend }: Omit<Props, "open" | "onOpenChange">) {
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, busy]);

  const send = (text: string) => {
    const value = text.trim();
    if (!value || busy) return;
    onSend(value);
    setDraft("");
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto px-1 py-3">
        {messages.length === 0 && (
          <p className="rounded-md border border-border/60 bg-background/50 p-3 text-xs leading-6 text-muted-foreground">
            Tell PROMPTOR AI what to change and it edits the prompt you already have — drums, bass, vocals, energy,
            arrangement. Each message costs {costLabel}.
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={
              m.role === "user"
                ? "ml-auto max-w-[85%] rounded-lg bg-primary px-3 py-2 text-xs leading-6 text-primary-foreground"
                : "max-w-[92%] text-xs leading-6 text-foreground"
            }
          >
            <p className="whitespace-pre-wrap">{m.text}</p>
            {m.question && (
              <p className="mt-2 rounded-md border border-primary/40 bg-primary/5 p-2 text-[11px] text-muted-foreground">
                {m.question}
                <button
                  type="button"
                  className="ml-2 font-semibold brand-text underline-offset-2 hover:underline"
                  onClick={() => send("Just decide for me and build it.")}
                >
                  Just decide for me
                </button>
              </p>
            )}
            {m.applied && m.applied.length > 0 && (
              <p className="mt-1 text-[10px] text-muted-foreground">Updated: {m.applied.join(", ")}</p>
            )}
          </div>
        ))}
        {busy && (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Working on it...
          </p>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-border/60 pt-3">
        <div className="flex flex-wrap gap-1.5 pb-2">
          {QUICK_COMMANDS.map((cmd) => (
            <button
              key={cmd.label}
              type="button"
              disabled={busy}
              onClick={() => send(cmd.message)}
              className="rounded-full border border-border/70 bg-background/50 px-2.5 py-1 text-[11px] transition hover:border-primary/60 hover:text-primary disabled:opacity-50"
            >
              {cmd.label}
            </button>
          ))}
        </div>
        <div className="flex items-end gap-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(draft);
              }
            }}
            rows={2}
            placeholder="Make the drums harder and drop the tempo a little..."
            className="min-h-[56px] resize-none border-border/80 bg-background/50 text-xs"
          />
          <Button size="icon" className="h-9 w-9 shrink-0" disabled={busy || !draft.trim()} onClick={() => send(draft)}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PromptorAssistant({ open, busy, messages, costLabel, onOpenChange, onSend }: Props) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <>
        {!open && (
          <button
            type="button"
            onClick={() => onOpenChange(true)}
            aria-label="Open PROMPTOR AI assistant"
            className="brand-gradient fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full text-black shadow-lg"
          >
            <Bot className="h-6 w-6" />
          </button>
        )}
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent side="bottom" className="flex h-[88vh] flex-col">
            <SheetHeader>
              <SheetTitle className="font-display text-base">PROMPTOR AI Assistant</SheetTitle>
            </SheetHeader>
            <Body busy={busy} messages={messages} costLabel={costLabel} onSend={onSend} />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => onOpenChange(true)}
          className="brand-gradient fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-black shadow-lg"
        >
          <Bot className="h-4 w-4" /> PROMPTOR AI
        </button>
      )}
      <aside
        className={`fixed right-0 top-0 z-40 flex h-screen w-[380px] flex-col border-l border-border bg-card/95 p-4 backdrop-blur transition-transform ${
          open ? "translate-x-0" : "pointer-events-none translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 brand-text" />
            <h2 className="font-display text-base">PROMPTOR AI Assistant</h2>
          </div>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Body busy={busy} messages={messages} costLabel={costLabel} onSend={onSend} />
      </aside>
    </>
  );
}
