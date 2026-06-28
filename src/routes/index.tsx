import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Shuffle, RotateCcw, Music2 } from "lucide-react";
import { Toaster, toast } from "sonner";
import { PromptBuilder } from "@/components/PromptBuilder";
import { PromptPreview, type SavedPrompt } from "@/components/PromptPreview";
import { DEFAULT_INPUTS, type PromptInputs } from "@/lib/prompt-options";
import { randomizeVibe } from "@/lib/randomize";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { generatePrompt } from "@/lib/prompt.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Promptor — AI Song Prompt Generator" },
      { name: "description", content: "The Promptor builds polished AI music prompts from genre, vocals, mood, topic, instruments, tempo, and style." },
      { property: "og:title", content: "The Promptor — AI Song Prompt Generator" },
      { property: "og:description", content: "Create polished AI music prompts in seconds." },
    ],
  }),
  component: Index,
});

function Index() {
  const [inputs, setInputs] = useState<PromptInputs>(DEFAULT_INPUTS);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useLocalStorage<SavedPrompt[]>("songPrompts.v1", []);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await generatePrompt({ data: inputs });
      setPrompt(res.prompt);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRandomize = () => {
    setInputs((cur) => randomizeVibe(cur));
    toast("Vibe randomized", { description: "Tweak as needed and generate." });
  };

  const handleClear = () => {
    setInputs({ ...DEFAULT_INPUTS });
    setPrompt("");
    setError(null);
    setLoading(false);
    toast("Form cleared");
  };

  const handleSave = () => {
    if (!prompt) return;
    const entry: SavedPrompt = {
      id: crypto.randomUUID(),
      title: inputs.title.trim() || `${inputs.mainGenre} · ${inputs.themePreset}`,
      createdAt: Date.now(),
      prompt,
    };
    setSaved([entry, ...saved]);
    toast.success("Prompt saved");
  };

  return (
    <div className="min-h-screen text-foreground">
      <Toaster theme="dark" position="top-center" richColors />

      {/* Hero */}
      <header className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 -z-10 opacity-60"
          style={{ backgroundImage: "radial-gradient(600px 300px at 20% 30%, oklch(0.5 0.2 300 / 0.4), transparent), radial-gradient(500px 300px at 80% 20%, oklch(0.5 0.2 0 / 0.35), transparent)" }} />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex items-center gap-2 mb-4">
            <div className="brand-gradient w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-primary/40">
              <Music2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Suno-ready · Powered by Lovable AI</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            <span className="brand-text">AI Song Prompt Generator</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base sm:text-lg text-muted-foreground">
            Create polished Suno-ready music prompts for hip-hop, R&amp;B, trap, soul, gospel, Afrobeat, pop, house, cinematic, and more.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" onClick={handleGenerate} disabled={loading} className="brand-gradient text-white border-0 hover:opacity-90 shadow-lg shadow-primary/30">
              <Sparkles className="h-4 w-4" />
              {loading ? "Generating…" : "Generate Prompt"}
            </Button>
            <Button size="lg" variant="secondary" onClick={handleRandomize}>
              <Shuffle className="h-4 w-4" />
              Randomize Vibe
            </Button>
            <Button size="lg" variant="ghost" onClick={handleClear}>
              <RotateCcw className="h-4 w-4" />
              Clear Form
            </Button>
          </div>
        </div>
      </header>

      {/* Main two-column */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 lg:py-10">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] gap-6 lg:gap-8">
          <Card className="border-border/60 bg-card/70 backdrop-blur p-5 lg:p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-lg font-semibold">Prompt Builder</h2>
              <span className="text-xs text-muted-foreground hidden sm:block">All sections feed the AI</span>
            </div>
            <PromptBuilder value={inputs} onChange={setInputs} />
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={handleGenerate} disabled={loading} className="brand-gradient text-white border-0 hover:opacity-90 shadow-md shadow-primary/30">
                <Sparkles className="h-4 w-4" />
                {loading ? "Generating…" : "Generate Prompt"}
              </Button>
              <Button variant="secondary" onClick={handleRandomize}>
                <Shuffle className="h-4 w-4" />
                Randomize
              </Button>
            </div>
          </Card>

          <PromptPreview
            prompt={prompt}
            loading={loading}
            error={error}
            onSave={handleSave}
            saved={saved}
            onDelete={(id) => setSaved(saved.filter((s) => s.id !== id))}
            onUseSaved={(s) => { setPrompt(s.prompt); setError(null); }}
          />
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-4 sm:px-6 py-8 text-center text-xs text-muted-foreground">
        Built for Suno producers. Prompts are AI-generated — always review before use.
      </footer>
    </div>
  );
}
