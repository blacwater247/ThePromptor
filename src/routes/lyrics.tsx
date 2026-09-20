import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Toaster, toast } from "sonner";
import { ArrowLeft, Crown, Info, Lock, LogIn, Mic2, RotateCcw, Sparkles, Zap, Wand2 } from "lucide-react";
import logoAsset from "@/assets/blacure-logo.png.asset.json";
import { LyricsBuilder } from "@/components/LyricsBuilder";
import { PromptPreview, type SavedPrompt } from "@/components/PromptPreview";
import { UpgradeModal } from "@/components/UpgradeModal";
import { DEFAULT_LYRICS_INPUTS, type LyricsInputs, type LyricsMode } from "@/lib/lyrics-options";
import { LYRIC_CONCEPT_STORAGE_KEY, type PromptorLyricConcept as PromptorLyricConceptType } from "@/lib/promptor-ai";
import { generateLyricsGuest } from "@/lib/lyrics.functions";
import { getMyCredits, getMySubscription } from "@/lib/credits.functions";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { isSubscriptionActive } from "@/lib/subscription";

const GUEST_LIMIT = 10;

export const Route = createFileRoute("/lyrics")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Lyrics Builder — The Promptor by Blacure" },
      { name: "description", content: "Write original song lyrics in The Promptor by Blacure. Pick genre, mood, structure, and story." },
      { property: "og:title", content: "AI Lyrics Builder — The Promptor by Blacure" },
      { property: "og:description", content: "Generate original, structured song lyrics in seconds. 10 free generations, no signup." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://thepromptor.life/lyrics" },
    ],
    links: [{ rel: "canonical", href: "https://thepromptor.life/lyrics" }],
  }),
  component: LyricsPage,
});

function LyricsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();
  const isGuest = !authLoading && !user;

  const [inputs, setInputs] = useState<LyricsInputs>(DEFAULT_LYRICS_INPUTS);
  const [lyrics, setLyrics] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useLocalStorage<SavedPrompt[]>("songLyrics.v1", []);
  const [guestUsed, setGuestUsed] = useLocalStorage<{ used: number }>("blacure.freePrompts.v1", { used: 0 });
  const [showSignupWall, setShowSignupWall] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const creditsQuery = useQuery({
    queryKey: ["credits", "balance"],
    queryFn: () => getMyCredits(),
    enabled: !!user,
  });
  const subQuery = useQuery({
    queryKey: ["subscription"],
    queryFn: () => getMySubscription({ data: { environment: getStripeEnvironment() } }),
    enabled: !!user,
  });

  const balance = creditsQuery.data?.balance ?? 0;
  const isPro = isSubscriptionActive(subQuery.data?.subscription ?? null);
  const guestRemaining = Math.max(0, GUEST_LIMIT - guestUsed.used);
  const canStandard = isGuest ? guestRemaining > 0 : isPro || balance >= 2;

  useEffect(() => {
    if (isGuest && guestUsed.used >= GUEST_LIMIT) setShowSignupWall(true);
  }, [isGuest, guestUsed.used]);

  // Concept handed over from PROMPTOR AI on the creation page
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(LYRIC_CONCEPT_STORAGE_KEY);
      if (!raw) return;
      sessionStorage.removeItem(LYRIC_CONCEPT_STORAGE_KEY);
      const c = JSON.parse(raw) as PromptorLyricConceptType;
      setInputs((prev) => ({
        ...prev,
        topic: [c.concept, c.emotionalConflict, `Hook: ${c.hookConcept}`, `Verse 1: ${c.verse1}`, `Verse 2: ${c.verse2}`, `Bridge: ${c.bridge}`, `Ending: ${c.ending}`]
          .filter(Boolean)
          .join(" · ")
          .slice(0, 1200),
        keyPhrase: prev.keyPhrase || (c.hookConcept ?? "").slice(0, 120),
      }));
      toast.success("PROMPTOR AI concept loaded");
    } catch { /* ignore */ }
  }, []);

  const handleGenerate = async (mode: LyricsMode = "standard") => {
    if (isGuest) {
      if (mode === "pro" || guestUsed.used >= GUEST_LIMIT) {
        setShowSignupWall(true);
        if (guestUsed.used >= GUEST_LIMIT) setShowUpgradeModal(true);
        return;
      }
      setLoading(true);
      setError(null);
      setLyrics("");
      try {
        const res = await generateLyricsGuest({ data: inputs });
        setLyrics(res.lyrics);
        setGuestUsed({ used: guestUsed.used + 1 });
        if (guestUsed.used + 1 >= GUEST_LIMIT) setShowUpgradeModal(true);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Something went wrong";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (mode === "pro" && !isPro) {
      toast.error("Pro Lyrics is a subscriber feature", {
        description: "Unlock unlimited Pro lyrics with the Monthly plan.",
        action: { label: "Upgrade", onClick: () => navigate({ to: "/pricing" }) },
      });
      return;
    }
    const cost = mode === "pro" ? 6 : 2;
    if (!isPro && balance < cost) {
      setShowUpgradeModal(true);
      return;
    }

    setLoading(true);
    setStreaming(false);
    setError(null);
    setLyrics("");
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Please sign in again.");

      const res = await fetch("/api/lyrics-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...inputs, mode, environment: getStripeEnvironment() }),
      });

      if (!res.ok || !res.body) {
        let msg = `Failed to write lyrics (${res.status}).`;
        try {
          const j = await res.json();
          if (j?.error) msg = j.error;
        } catch { /* ignore */ }
        throw new Error(msg);
      }

      const balanceHeader = res.headers.get("X-Credit-Balance");
      if (balanceHeader !== null) {
        const bal = Number(balanceHeader);
        if (!Number.isNaN(bal)) queryClient.setQueryData(["credits", "balance"], { balance: bal });
      }

      setStreaming(true);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          acc += decoder.decode(value, { stream: true });
          setLyrics(acc);
        }
      }
      acc += decoder.decode();
      let finalText = acc.trim();
      finalText = finalText.replace(/^```[a-z]*\n?/i, "").replace(/```$/i, "").trim();
      setLyrics(finalText);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      if (msg.startsWith("INSUFFICIENT_CREDITS")) {
        setError("You're out of credits. Buy more or go unlimited to keep writing.");
        setShowUpgradeModal(true);
      } else if (msg.startsWith("PRO_REQUIRED")) {
        toast.error("Pro Lyrics requires a subscription", {
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
      setStreaming(false);
    }
  };

  const handleSave = () => {
    if (!lyrics) return;
    const entry: SavedPrompt = {
      id: crypto.randomUUID(),
      title: inputs.title.trim() || `${inputs.genre} · ${inputs.theme}`,
      createdAt: Date.now(),
      prompt: lyrics,
    };
    setSaved([entry, ...saved]);
    toast.success("Lyrics saved");
  };

  const handleClear = () => {
    setInputs({ ...DEFAULT_LYRICS_INPUTS });
    setLyrics("");
    setError(null);
    toast("Form cleared");
  };

  return (
    <div className="min-h-screen text-foreground">
      <Toaster theme="dark" position="top-center" richColors />
      <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} isGuest={isGuest} />

      <header className="relative overflow-hidden border-b border-border/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-5 sm:py-8">
          <div className="flex items-center justify-between mb-5 gap-2 flex-wrap">
            <Link to="/" className="flex items-center gap-2">
              <img src={logoAsset.url} alt="Blacure logo" className="h-9 w-9 sm:h-10 sm:w-10 rounded-full" />
              <span className="leading-tight"><span className="block font-display text-sm sm:text-base">THE PROMPTOR™</span><span className="block text-[9px] font-semibold uppercase tracking-widest text-primary">by Blacure</span></span>
            </Link>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
              {isGuest ? (
                <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border ${guestRemaining === 0 ? "border-destructive/50 text-destructive" : "border-primary/40 brand-text"}`}>
                  <Zap className="h-3.5 w-3.5" />
                  {guestRemaining} of {GUEST_LIMIT} free left
                </div>
              ) : isPro ? (
                <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border border-primary/40 brand-text">
                  <Zap className="h-3.5 w-3.5" /> Unlimited
                </div>
              ) : (
                <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border border-primary/40 brand-text">
                  <Zap className="h-3.5 w-3.5" />
                  {creditsQuery.isLoading ? "…" : `${balance} credits`}
                </div>
              )}
              <Link to="/app">
                <Button size="sm" variant="outline" className="border-primary/40 hover:bg-primary/10">
                  <Sparkles className="h-4 w-4" />
                  <span className="ml-1">Blueprint Studio</span>
                </Button>
              </Link>
              {isGuest && (
                <Link to="/auth">
                  <Button size="sm" className="brand-gradient text-black font-semibold border-0 hover:opacity-90">
                    <LogIn className="h-4 w-4" /> <span className="ml-1">Sign in</span>
                  </Button>
                </Link>
              )}
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground hidden sm:flex items-center gap-1 ml-1">
                <ArrowLeft className="h-4 w-4" /> Home
              </Link>
            </div>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            <span className="brand-text">Promptor Lyrics</span> — write your next song
          </h1>
          <p className="mt-3 max-w-2xl text-sm sm:text-lg text-muted-foreground">
            Direct genre, mood, structure, rhyme, and story in the companion studio for your song blueprint.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row sm:flex-wrap gap-3">
            <Button
              size="lg"
              onClick={() => handleGenerate("standard")}
              disabled={loading || !canStandard}
              className="w-full sm:w-auto brand-gradient text-black font-semibold border-0 hover:opacity-90 gold-glow"
            >
              <Mic2 className="h-4 w-4" />
              {loading ? "Writing…" : isGuest ? "Write Lyrics (free)" : isPro ? "Write Lyrics" : "Write Lyrics (2 credits)"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => handleGenerate("pro")}
              disabled={loading}
              className="w-full sm:w-auto border-primary/60 hover:bg-primary/10"
              title={isPro ? "Full song + performance notes" : "Unlock with Monthly plan"}
            >
              {isPro ? <Crown className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              {isPro ? "Pro Lyrics" : "Unlock Pro Lyrics"}
              <span className="ml-1 rounded bg-primary/20 brand-text text-[10px] font-bold px-1.5 py-0.5">PRO</span>
            </Button>
            <Button size="lg" variant="ghost" onClick={handleClear} className="w-full sm:w-auto">
              <RotateCcw className="h-4 w-4" /> Clear Form
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 lg:py-10">
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          <Info className="h-4 w-4 mt-0.5 brand-text shrink-0" />
          <p className="text-muted-foreground">
            <span className="text-foreground font-semibold">Lyrics are AI-written and original.</span>{" "}
            Always read them through before recording or publishing.
          </p>
        </div>

        {showSignupWall && isGuest && (
          <Card className="mb-8 p-6 border-primary/50 bg-card/80 backdrop-blur gold-glow">
            <h2 className="font-display text-2xl font-bold">You've used your 10 free generations</h2>
            <p className="mt-2 text-muted-foreground">
              Create a free account to keep writing. Then top up 20 more for $5, or go unlimited monthly.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/auth">
                <Button className="brand-gradient text-black font-semibold border-0 hover:opacity-90">
                  <LogIn className="h-4 w-4" /> Create free account
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" className="border-primary/40 hover:bg-primary/10">See pricing</Button>
              </Link>
              <Button variant="ghost" onClick={() => setShowSignupWall(false)}>Not now</Button>
            </div>
          </Card>
        )}

        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] gap-6 lg:gap-8">
          <Card className="border-border/60 bg-card/70 backdrop-blur p-5 lg:p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-lg">Lyrics Controls</h2>
              <span className="text-xs text-muted-foreground hidden sm:block">All sections feed the AI</span>
            </div>
            <LyricsBuilder value={inputs} onChange={setInputs} isPro={isPro} />
            <div className="mt-6 flex flex-col sm:flex-row sm:flex-wrap gap-3">
              <Button
                onClick={() => handleGenerate("standard")}
                disabled={loading || !canStandard}
                className="w-full sm:w-auto brand-gradient text-black font-semibold border-0 hover:opacity-90"
              >
                <Wand2 className="h-4 w-4" />
                {loading ? "Writing…" : isGuest ? "Write Lyrics (free)" : isPro ? "Write Lyrics" : "Write Lyrics (2 credits)"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleGenerate("pro")}
                disabled={loading}
                className="w-full sm:w-auto border-primary/60 hover:bg-primary/10"
              >
                {isPro ? <Crown className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                {isPro ? "Pro Lyrics" : "Unlock Pro Lyrics"}
              </Button>
              <Button type="button" variant="ghost" onClick={handleClear} className="w-full sm:w-auto">
                <RotateCcw className="h-4 w-4" /> Clear Form
              </Button>
            </div>
          </Card>

          <PromptPreview
            prompt={lyrics}
            loading={loading}
            streaming={streaming}
            error={error}
            onSave={handleSave}
            saved={saved}
            onDelete={(id) => setSaved(saved.filter((s) => s.id !== id))}
            onUseSaved={(s) => { setLyrics(s.prompt); setError(null); }}
            heading="Your Lyrics"
            savedHeading="Saved Lyrics"
            loadingHint="Writing your verses and hook…"
            emptyHint={<p>Set up your song on the left, then hit <span className="text-foreground font-medium">Write Lyrics</span>.</p>}
          />
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-4 sm:px-6 py-8 text-center text-xs text-muted-foreground">
        THE PROMPTOR™ by Blacure · Lyrics Builder — AI-generated lyrics, always review before use.
      </footer>
    </div>
  );
}
