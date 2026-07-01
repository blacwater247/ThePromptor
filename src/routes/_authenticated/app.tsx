import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Shuffle, RotateCcw, ArrowLeft, Zap, LogOut, CreditCard, Crown, Lock } from "lucide-react";
import { Toaster, toast } from "sonner";
import logoAsset from "@/assets/blacure-logo.png.asset.json";
import { PromptBuilder } from "@/components/PromptBuilder";
import { PromptPreview, type SavedPrompt } from "@/components/PromptPreview";
import { DEFAULT_INPUTS, type PromptInputs, type PromptMode } from "@/lib/prompt-options";
import { randomizeVibe } from "@/lib/randomize";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { generatePrompt } from "@/lib/prompt.functions";
import { getMyCredits, getMySubscription } from "@/lib/credits.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/app")({
  head: () => ({
    meta: [
      { title: "The Promptor — Blacure" },
      { name: "description", content: "Build studio-grade AI music prompts with Blacure's Promptor." },
      { property: "og:title", content: "The Promptor — Blacure" },
      { property: "og:description", content: "Build studio-grade AI music prompts in seconds." },
      { property: "og:url", content: "https://thepromptor.life/app" },
    ],
    links: [{ rel: "canonical", href: "https://thepromptor.life/app" }],
  }),
  component: AppPage,
});

function AppPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [inputs, setInputs] = useState<PromptInputs>(DEFAULT_INPUTS);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useLocalStorage<SavedPrompt[]>("songPrompts.v1", []);

  const creditsQuery = useQuery({
    queryKey: ["credits", "balance"],
    queryFn: () => getMyCredits(),
  });
  const subQuery = useQuery({
    queryKey: ["subscription"],
    queryFn: () => getMySubscription(),
  });
  const balance = creditsQuery.data?.balance ?? 0;
  const isPro = subQuery.data?.subscription?.status === "active";
  const canStandard = balance >= 2;
  const canPro = balance >= 6;

  const handleGenerate = async (mode: PromptMode = "standard") => {
    const cost = mode === "pro" ? 6 : 2;
    if (mode === "pro" && !isPro) {
      toast.error("Pro Studio Prompt is a subscriber feature", {
        description: "Unlock longer, structured prompts with the Monthly plan.",
        action: { label: "Upgrade", onClick: () => navigate({ to: "/pricing" }) },
      });
      return;
    }
    if (balance < cost) {
      toast.error("Not enough credits", {
        description: `${mode === "pro" ? "Pro Studio" : "Standard"} costs ${cost} credits. Top up to keep generating.`,
        action: { label: "Buy credits", onClick: () => navigate({ to: "/pricing" }) },
      });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await generatePrompt({ data: { ...inputs, mode } });
      setPrompt(res.prompt);
      queryClient.setQueryData(["credits", "balance"], { balance: res.balance });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      if (msg.startsWith("INSUFFICIENT_CREDITS")) {
        setError("You're out of credits. Buy more to keep generating.");
        toast.error("Out of credits", {
          description: `${mode === "pro" ? "Pro Studio" : "Standard"} costs ${cost} credits.`,
          action: { label: "Buy credits", onClick: () => navigate({ to: "/pricing" }) },
        });
      } else if (msg.startsWith("PRO_REQUIRED")) {
        toast.error("Pro Studio Prompt requires a subscription", {
          description: "Upgrade to the Monthly plan to unlock.",
          action: { label: "Upgrade", onClick: () => navigate({ to: "/pricing" }) },
        });
      } else {
        setError(msg);
        toast.error(msg);
      }
      queryClient.invalidateQueries({ queryKey: ["credits", "balance"] });
    } finally {
      setLoading(false);
    }
  };

  const handleRandomize = () => {
    const next = randomizeVibe(inputs);
    setInputs(next);
    toast("Vibe randomized", {
      description: `${next.mainGenre} · ${next.vocalType} · ${next.moods.slice(0, 2).join(", ") || "—"}`,
    });
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

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen text-foreground">
      <Toaster theme="dark" position="top-center" richColors />

      <header className="relative overflow-hidden border-b border-border/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
            <Link to="/" className="flex items-center gap-3 group">
              <img src={logoAsset.url} alt="Blacure AI Music logo" className="h-10 w-10 rounded-full" />
              <span className="font-display text-xl font-bold brand-text">Blacure</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border ${lowCredits ? "border-destructive/50 text-destructive" : "border-primary/40 brand-text"}`}>
                <Zap className="h-3.5 w-3.5" />
                {creditsQuery.isLoading ? "…" : `${balance} credits`}
                <span className="text-muted-foreground font-normal hidden sm:inline">· {Math.floor(balance / 2)} prompts</span>
              </div>
              <Link to="/pricing">
                <Button size="sm" variant="outline" className="border-primary/40 hover:bg-primary/10">
                  <CreditCard className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Buy credits</span>
                </Button>
              </Link>
              <Button size="sm" variant="ghost" onClick={handleSignOut} aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground hidden sm:flex items-center gap-1 ml-1">
                <ArrowLeft className="h-4 w-4" /> Home
              </Link>
            </div>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold leading-tight">
            <span className="brand-text">The Promptor</span> — AI Music Prompt Builder
          </h1>
          <p className="mt-3 max-w-2xl text-base sm:text-lg text-muted-foreground">
            Create polished music prompts for hip-hop, R&amp;B, trap, soul, gospel, Afrobeat, pop, house, cinematic, and more.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" onClick={handleGenerate} disabled={loading || lowCredits} className="brand-gradient text-black font-semibold border-0 hover:opacity-90 gold-glow">
              <Sparkles className="h-4 w-4" />
              {loading ? "Generating…" : "Generate Prompt (2 credits)"}
            </Button>
            <Button size="lg" variant="outline" onClick={handleRandomize} className="border-primary/40 hover:bg-primary/10">
              <Shuffle className="h-4 w-4" />
              Randomize Vibe
            </Button>
            <Button size="lg" variant="ghost" onClick={handleClear}>
              <RotateCcw className="h-4 w-4" />
              Clear Form
            </Button>
          </div>
          {lowCredits && (
            <p className="mt-4 text-sm text-destructive">
              You don't have enough credits. <Link to="/pricing" className="underline font-semibold">Buy more</Link> to keep generating.
            </p>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 lg:py-10">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] gap-6 lg:gap-8">
          <Card className="border-border/60 bg-card/70 backdrop-blur p-5 lg:p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-lg font-semibold">Prompt Builder</h2>
              <span className="text-xs text-muted-foreground hidden sm:block">All sections feed the AI</span>
            </div>
            <PromptBuilder value={inputs} onChange={setInputs} />
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={handleGenerate} disabled={loading || lowCredits} className="brand-gradient text-black font-semibold border-0 hover:opacity-90">
                <Sparkles className="h-4 w-4" />
                {loading ? "Generating…" : "Generate (2 credits)"}
              </Button>
              <Button type="button" variant="outline" onClick={handleRandomize} className="border-primary/40 hover:bg-primary/10">
                <Shuffle className="h-4 w-4" />
                Randomize Vibe
              </Button>
              <Button type="button" variant="ghost" onClick={handleClear}>
                <RotateCcw className="h-4 w-4" />
                Clear Form
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
        Blacure · The Promptor — prompts are AI-generated, always review before use.
      </footer>
    </div>
  );
}
