import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Shuffle, RotateCcw, ArrowLeft, Zap, LogOut, CreditCard, Crown, Lock, Download, Check, LogIn, Info } from "lucide-react";
import { Toaster, toast } from "sonner";
import logoAsset from "@/assets/blacure-logo.png.asset.json";
import packCover from "@/assets/blacure-pack-vol1.png.asset.json";
import packCoverV2 from "@/assets/blacure-pack-vol2.png.asset.json";
import packCoverV3 from "@/assets/blacure-pack-vol3.png.asset.json";
import { PromptBuilder } from "@/components/PromptBuilder";
import { PromptPreview, type SavedPrompt } from "@/components/PromptPreview";
import { DEFAULT_INPUTS, type PromptInputs, type PromptMode } from "@/lib/prompt-options";
import { randomizeVibe } from "@/lib/randomize";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { generatePrompt, generatePromptGuest } from "@/lib/prompt.functions";
import { getMyCredits, getMySubscription } from "@/lib/credits.functions";
import { listMyPacks, getPackDownloadUrl } from "@/lib/packs.functions";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment, isPaymentsConfigured } from "@/lib/stripe";
import { isSubscriptionActive } from "@/lib/subscription";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { UpgradeModal } from "@/components/UpgradeModal";
import { useAuth } from "@/hooks/use-auth";

const GUEST_LIMIT = 10;

export const Route = createFileRoute("/app")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "The Promptor — Blacure" },
      { name: "description", content: "Build studio-grade AI music prompts with Blacure's Promptor. 10 free prompts — no signup required." },
      { property: "og:title", content: "The Promptor — Blacure" },
      { property: "og:description", content: "Build studio-grade AI music prompts in seconds. 10 free prompts, no signup." },
      { property: "og:url", content: "https://thepromptor.life/app" },
    ],
    links: [{ rel: "canonical", href: "https://thepromptor.life/app" }],
  }),
  component: AppPage,
});

function AppPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();
  const isGuest = !authLoading && !user;

  const [inputs, setInputs] = useState<PromptInputs>(DEFAULT_INPUTS);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useLocalStorage<SavedPrompt[]>("songPrompts.v1", []);
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
  const packsQuery = useQuery({
    queryKey: ["packs", "mine"],
    queryFn: () => listMyPacks(),
    enabled: !!user,
  });
  const balance = creditsQuery.data?.balance ?? 0;
  const isPro = isSubscriptionActive(subQuery.data?.subscription ?? null);
  const canStandard = isGuest ? guestUsed.used < GUEST_LIMIT : isPro || balance >= 2;
  const guestRemaining = Math.max(0, GUEST_LIMIT - guestUsed.used);
  const ownsPackV1 = (packsQuery.data?.packs ?? []).some((p) => p.pack_slug === "prompt_pack_vol1");
  const ownsPackV2 = (packsQuery.data?.packs ?? []).some((p) => p.pack_slug === "prompt_pack_vol2");
  const ownsPackV3 = (packsQuery.data?.packs ?? []).some((p) => p.pack_slug === "prompt_pack_vol3");
  const [packCheckoutOpen, setPackCheckoutOpen] = useState<null | "prompt_pack_vol1" | "prompt_pack_vol2" | "prompt_pack_vol3">(null);
  const configured = isPaymentsConfigured();

  // Auto-open signup wall when guest hits limit
  useEffect(() => {
    if (isGuest && guestUsed.used >= GUEST_LIMIT) setShowSignupWall(true);
  }, [isGuest, guestUsed.used]);

  // Auto-open upgrade modal once when a signed-in free user runs out of credits
  const outOfCredits = !isGuest && !isPro && !creditsQuery.isLoading && balance < 2;
  useEffect(() => {
    if (outOfCredits) setShowUpgradeModal(true);
  }, [outOfCredits]);

  const packReturnUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`
      : "https://thepromptor.life/checkout/return?session_id={CHECKOUT_SESSION_ID}";

  const handleDownloadPack = async (packSlug: "prompt_pack_vol1" | "prompt_pack_vol2" | "prompt_pack_vol3") => {
    try {
      const res = await getPackDownloadUrl({ data: { packSlug } });
      if ("url" in res) {
        window.open(res.url, "_blank", "noopener,noreferrer");
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Could not start download. Try again.");
    }
  };

  const handleGenerate = async (mode: PromptMode = "standard") => {
    // Guest flow
    if (isGuest) {
      if (mode === "pro") {
        setShowSignupWall(true);
        return;
      }
      if (guestUsed.used >= GUEST_LIMIT) {
        setShowSignupWall(true);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const { mode: _m, environment: _e, ...guestInputs } = { ...inputs, mode: "standard" as const, environment: getStripeEnvironment() };
        void _m; void _e;
        const res = await generatePromptGuest({ data: guestInputs });
        setPrompt(res.prompt);
        setGuestUsed({ used: guestUsed.used + 1 });
        if (guestUsed.used + 1 >= GUEST_LIMIT) {
          toast("That was your last free prompt", {
            description: "Create a free account to keep going.",
          });
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Something went wrong";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Authenticated flow
    const cost = mode === "pro" ? 6 : 2;
    if (mode === "pro" && !isPro) {
      toast.error("Pro Studio Prompt is a subscriber feature", {
        description: "Unlock unlimited Pro prompts with the Monthly plan.",
        action: { label: "Upgrade", onClick: () => navigate({ to: "/pricing" }) },
      });
      return;
    }
    if (!isPro && balance < cost) {
      if (mode === "standard") {
        setShowUpgradeModal(true);
      } else {
        toast.error("Not enough credits", {
          description: `Pro Studio costs ${cost} credits. Top up to keep generating.`,
          action: { label: "Buy credits", onClick: () => navigate({ to: "/pricing" }) },
        });
      }
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await generatePrompt({ data: { ...inputs, mode, environment: getStripeEnvironment() } });
      setPrompt(res.prompt);
      if (typeof res.balance === "number") {
        queryClient.setQueryData(["credits", "balance"], { balance: res.balance });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      if (msg.startsWith("INSUFFICIENT_CREDITS")) {
        setError("You're out of credits. Buy more or go unlimited to keep generating.");
        setShowUpgradeModal(true);
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
    const next = randomizeVibe(inputs, isPro);
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
    navigate({ to: "/", replace: true });
  };

  return (
    <div className="min-h-screen text-foreground">
      <Toaster theme="dark" position="top-center" richColors />
      <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />

      <header className="relative overflow-hidden border-b border-border/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-5 sm:py-8">
          <div className="flex items-center justify-between mb-5 gap-2 flex-wrap">
            <Link to="/" className="flex items-center gap-2 group">
              <img src={logoAsset.url} alt="Blacure AI Music logo" className="h-9 w-9 sm:h-10 sm:w-10 rounded-full" />
              <span className="font-display text-lg sm:text-xl font-bold brand-text">Blacure</span>
            </Link>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
              {isGuest ? (
                <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border ${guestRemaining === 0 ? "border-destructive/50 text-destructive" : "border-primary/40 brand-text"}`}>
                  <Zap className="h-3.5 w-3.5" />
                  {guestRemaining} of {GUEST_LIMIT} free left
                </div>
              ) : isPro ? (
                <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border border-primary/40 brand-text">
                  <Zap className="h-3.5 w-3.5" />
                  Unlimited
                </div>
              ) : (
                <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border ${!canStandard ? "border-destructive/50 text-destructive" : "border-primary/40 brand-text"}`}>
                  <Zap className="h-3.5 w-3.5" />
                  {creditsQuery.isLoading ? "…" : `${balance} credits`}
                  <span className="text-muted-foreground font-normal hidden sm:inline">· {Math.floor(balance / 2)} prompts</span>
                </div>
              )}
              {isPro && (
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/50 brand-text px-2 py-1 text-[10px] font-bold uppercase tracking-wider">
                  <Crown className="h-3 w-3" /> Pro
                </span>
              )}

              {isGuest ? (
                <Link to="/auth">
                  <Button size="sm" className="brand-gradient text-black font-semibold border-0 hover:opacity-90">
                    <LogIn className="h-4 w-4" />
                    <span className="ml-1">Sign in</span>
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/pricing">
                    <Button size="sm" variant="outline" className="border-primary/40 hover:bg-primary/10">
                      <CreditCard className="h-4 w-4" />
                      <span className="hidden sm:inline ml-1">{isPro ? "Plans" : "Buy credits"}</span>
                    </Button>
                  </Link>
                  <Link to="/account">
                    <Button size="sm" variant="ghost" aria-label="Account">
                      <Crown className="h-4 w-4" />
                      <span className="hidden sm:inline ml-1">Account</span>
                    </Button>
                  </Link>
                  <Button size="sm" variant="ghost" onClick={handleSignOut} aria-label="Sign out">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground hidden sm:flex items-center gap-1 ml-1">
                <ArrowLeft className="h-4 w-4" /> Home
              </Link>
            </div>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            <span className="brand-text">The Promptor</span> — AI Music Prompt Builder
          </h1>
          <p className="mt-3 max-w-2xl text-sm sm:text-lg text-muted-foreground">
            Create polished music prompts for hip-hop, R&amp;B, trap, soul, gospel, Afrobeat, pop, house, cinematic, and more.
            {isGuest ? (
              <span className="block mt-1 text-sm brand-text">
                {guestRemaining > 0
                  ? `${guestRemaining} of ${GUEST_LIMIT} free prompts left — no signup required.`
                  : "You've used all 10 free prompts. Create a free account to keep going."}
              </span>
            ) : isPro ? (
              <span className="block mt-1 text-sm brand-text">Monthly plan active — unlimited Standard & Pro Studio prompts.</span>
            ) : (
              <span className="block mt-1 text-sm">Go Monthly for unlimited Standard + Pro Studio prompts.</span>
            )}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row sm:flex-wrap gap-3">
            <Button
              size="lg"
              onClick={() => handleGenerate("standard")}
              disabled={loading || (isGuest && !canStandard)}
              className="w-full sm:w-auto brand-gradient text-black font-semibold border-0 hover:opacity-90 gold-glow"
            >
              <Sparkles className="h-4 w-4" />
              {loading ? "Generating…" : isGuest ? "Generate Prompt (free)" : isPro ? "Generate Prompt" : outOfCredits ? "Out of free prompts — Upgrade" : "Generate Prompt (2 credits)"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => handleGenerate("pro")}
              disabled={loading}
              className="w-full sm:w-auto border-primary/60 hover:bg-primary/10 relative"
              title={isPro ? "Longer, structured studio prompt — unlimited" : "Unlock with Monthly plan"}
            >
              {isPro ? <Crown className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              {isPro ? "Pro Studio Prompt" : "Unlock Pro Studio"}
              <span className="ml-1 rounded bg-primary/20 brand-text text-[10px] font-bold px-1.5 py-0.5">PRO</span>
            </Button>
            <Button size="lg" variant="outline" onClick={handleRandomize} className="w-full sm:w-auto border-primary/40 hover:bg-primary/10">
              <Shuffle className="h-4 w-4" />
              Randomize Vibe
            </Button>
            <Button size="lg" variant="ghost" onClick={handleClear} className="w-full sm:w-auto">
              <RotateCcw className="h-4 w-4" />
              Clear Form
            </Button>
          </div>
          {isGuest && guestRemaining === 0 && (
            <p className="mt-4 text-sm text-destructive">
              You've used your 10 free prompts. <Link to="/auth" className="underline font-semibold">Create a free account</Link> to keep going — then top up 20 more for $5.
            </p>
          )}
          {!isGuest && !isPro && !canStandard && (
            <p className="mt-4 text-sm text-destructive">
              You don't have enough credits. <Link to="/pricing" className="underline font-semibold">Buy more</Link> or <Link to="/pricing" className="underline font-semibold">go Monthly</Link> for unlimited.
            </p>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 lg:py-10">
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          <Info className="h-4 w-4 mt-0.5 brand-text shrink-0" />
          <p className="text-muted-foreground">
            <span className="text-foreground font-semibold">The Promptor writes prompts — not songs.</span>{" "}
            Copy the output into Suno, Udio, or any AI music tool to generate the actual audio.
          </p>
        </div>

        {showSignupWall && isGuest && (
          <Card className="mb-8 p-6 border-primary/50 bg-card/80 backdrop-blur gold-glow">
            <h2 className="font-display text-2xl font-bold">You've used your 10 free prompts</h2>
            <p className="mt-2 text-muted-foreground">
              Create a free account to keep going. Once you're in, top up 20 more prompts for just $5, or go unlimited monthly.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/auth">
                <Button className="brand-gradient text-black font-semibold border-0 hover:opacity-90">
                  <LogIn className="h-4 w-4" /> Create free account
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" className="border-primary/40 hover:bg-primary/10">
                  See pricing
                </Button>
              </Link>
              <Button variant="ghost" onClick={() => setShowSignupWall(false)}>
                Not now
              </Button>
            </div>
          </Card>
        )}

        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] gap-6 lg:gap-8">
          <Card className="border-border/60 bg-card/70 backdrop-blur p-5 lg:p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-lg font-semibold">Prompt Builder</h2>
              <span className="text-xs text-muted-foreground hidden sm:block">All sections feed the AI</span>
            </div>
            <PromptBuilder value={inputs} onChange={setInputs} isPro={isPro} />
            <div className="mt-6 flex flex-col sm:flex-row sm:flex-wrap gap-3">
              <Button
                onClick={() => handleGenerate("standard")}
                disabled={loading || !canStandard}
                className="w-full sm:w-auto brand-gradient text-black font-semibold border-0 hover:opacity-90"
              >
                <Sparkles className="h-4 w-4" />
                {loading ? "Generating…" : isGuest ? "Generate (free)" : isPro ? "Generate" : "Generate (2 credits)"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleGenerate("pro")}
                disabled={loading}
                className="w-full sm:w-auto border-primary/60 hover:bg-primary/10"
              >
                {isPro ? <Crown className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                {isPro ? "Pro Studio" : "Unlock Pro Studio"}
              </Button>
              <Button type="button" variant="outline" onClick={handleRandomize} className="w-full sm:w-auto border-primary/40 hover:bg-primary/10">
                <Shuffle className="h-4 w-4" />
                Randomize Vibe
              </Button>
              <Button type="button" variant="ghost" onClick={handleClear} className="w-full sm:w-auto">
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

        {/* Prompt packs require signed-in account for downloads */}
        {!isGuest && (
          <>
            {/* Prompt Pack Vol. 1 */}
            <section className="mt-16" aria-labelledby="pack-vol1-heading">
              <div className="text-center mb-8">
                <p className="text-xs uppercase tracking-widest brand-text font-bold">Instant Download</p>
                <h2 id="pack-vol1-heading" className="mt-2 font-display text-3xl sm:text-4xl font-bold">
                  Blacure Prompt Pack — Volume 1
                </h2>
                <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
                  12 studio-ready prompts hand-crafted by Blacure. Delivered as a polished PDF you can paste into Suno, Udio, or any AI music engine.
                </p>
              </div>

              {packCheckoutOpen === "prompt_pack_vol1" ? (
                <Card className="p-4 sm:p-6 border-border/60 bg-card/70 backdrop-blur max-w-3xl mx-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-xl font-bold">Complete your purchase</h3>
                    <Button variant="ghost" onClick={() => setPackCheckoutOpen(null)}>Cancel</Button>
                  </div>
                  <StripeEmbeddedCheckout priceId="prompt_pack_vol1" returnUrl={packReturnUrl} />
                </Card>
              ) : (
                <Card className="p-6 sm:p-8 border-border/60 bg-card/70 backdrop-blur">
                  <div className="grid md:grid-cols-2 gap-6 items-center">
                    <div className="rounded-xl overflow-hidden border border-primary/30 gold-glow">
                      <img src={packCover.url} alt="Blacure Prompt Pack Volume 1 cover" className="w-full h-auto block" />
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-5xl font-bold">$2</span>
                        <span className="text-sm text-muted-foreground">one-time</span>
                      </div>
                      <ul className="mt-4 space-y-2 text-sm">
                        {[
                          "12 ready-to-paste music prompts",
                          "Genres: trap-soul, gospel funk, phonk, dancehall, drill, cinematic & more",
                          "Instant PDF download after purchase",
                          "Yours forever — download any time from your account",
                        ].map((f) => (
                          <li key={f} className="flex items-start gap-2">
                            <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      {ownsPackV1 ? (
                        <Button
                          onClick={() => handleDownloadPack("prompt_pack_vol1")}
                          className="w-full sm:w-auto mt-6 brand-gradient text-black font-semibold border-0 hover:opacity-90 gold-glow"
                          size="lg"
                        >
                          <Download className="h-4 w-4" />
                          Download PDF
                        </Button>
                      ) : (
                        <Button
                          onClick={() => setPackCheckoutOpen("prompt_pack_vol1")}
                          disabled={!configured}
                          className="w-full sm:w-auto mt-6 brand-gradient text-black font-semibold border-0 hover:opacity-90 gold-glow"
                          size="lg"
                        >
                          <Download className="h-4 w-4" />
                          {!configured ? "Coming soon" : "Buy Pack — $2"}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              )}
            </section>

            {/* Prompt Pack Vol. 2 */}
            <section className="mt-16" aria-labelledby="pack-vol2-heading">
              <div className="text-center mb-8">
                <p className="text-xs uppercase tracking-widest brand-text font-bold">New · Producer Edition</p>
                <h2 id="pack-vol2-heading" className="mt-2 font-display text-3xl sm:text-4xl font-bold">
                  Blacure Prompt Pack — Volume 2
                </h2>
                <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
                  20 professional-level prompts with full mix-chain, arrangement structure, and sound-design parameters.
                </p>
              </div>

              {packCheckoutOpen === "prompt_pack_vol2" ? (
                <Card className="p-4 sm:p-6 border-border/60 bg-card/70 backdrop-blur max-w-3xl mx-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-xl font-bold">Complete your purchase</h3>
                    <Button variant="ghost" onClick={() => setPackCheckoutOpen(null)}>Cancel</Button>
                  </div>
                  <StripeEmbeddedCheckout priceId="prompt_pack_vol2" returnUrl={packReturnUrl} />
                </Card>
              ) : (
                <Card className="p-6 sm:p-8 border-border/60 bg-card/70 backdrop-blur">
                  <div className="grid md:grid-cols-2 gap-6 items-center">
                    <div className="rounded-xl overflow-hidden border border-primary/30 gold-glow">
                      <img src={packCoverV2.url} alt="Blacure Prompt Pack Volume 2 cover" className="w-full h-auto block" />
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-5xl font-bold">$2</span>
                        <span className="text-sm text-muted-foreground">one-time</span>
                      </div>
                      <ul className="mt-4 space-y-2 text-sm">
                        {[
                          "20 producer-grade prompts across 20 fusion genres",
                          "Full mix-chain: compression, saturation, sidechain, EQ moves",
                          "Arrangement structure + sound-design parameters per prompt",
                          "Suno v3 · Udio Pro · DAW-ready",
                          "Instant PDF — yours forever",
                        ].map((f) => (
                          <li key={f} className="flex items-start gap-2">
                            <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      {ownsPackV2 ? (
                        <Button
                          onClick={() => handleDownloadPack("prompt_pack_vol2")}
                          className="w-full sm:w-auto mt-6 brand-gradient text-black font-semibold border-0 hover:opacity-90 gold-glow"
                          size="lg"
                        >
                          <Download className="h-4 w-4" />
                          Download PDF
                        </Button>
                      ) : (
                        <Button
                          onClick={() => setPackCheckoutOpen("prompt_pack_vol2")}
                          disabled={!configured}
                          className="w-full sm:w-auto mt-6 brand-gradient text-black font-semibold border-0 hover:opacity-90 gold-glow"
                          size="lg"
                        >
                          <Download className="h-4 w-4" />
                          {!configured ? "Coming soon" : "Buy Pack — $2"}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              )}
            </section>

            {/* Prompt Pack Vol. 3 */}
            <section className="mt-16" aria-labelledby="pack-vol3-heading">
              <div className="text-center mb-8">
                <p className="text-xs uppercase tracking-widest brand-text font-bold">New · R&amp;B Edition</p>
                <h2 id="pack-vol3-heading" className="mt-2 font-display text-3xl sm:text-4xl font-bold">
                  Blacure Prompt Pack — Volume 3
                </h2>
                <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
                  17 studio-ready R&amp;B prompts across trap-soul, neo-soul, gospel, afrobeat fusion, jazz, dancehall and more.
                </p>
              </div>

              {packCheckoutOpen === "prompt_pack_vol3" ? (
                <Card className="p-4 sm:p-6 border-border/60 bg-card/70 backdrop-blur max-w-3xl mx-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-xl font-bold">Complete your purchase</h3>
                    <Button variant="ghost" onClick={() => setPackCheckoutOpen(null)}>Cancel</Button>
                  </div>
                  <StripeEmbeddedCheckout priceId="prompt_pack_vol3" returnUrl={packReturnUrl} />
                </Card>
              ) : (
                <Card className="p-6 sm:p-8 border-border/60 bg-card/70 backdrop-blur">
                  <div className="grid md:grid-cols-2 gap-6 items-center">
                    <div className="rounded-xl overflow-hidden border border-primary/30 gold-glow">
                      <img src={packCoverV3.url} alt="Blacure Prompt Pack Volume 3 cover" className="w-full h-auto block" />
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-5xl font-bold">$2</span>
                        <span className="text-sm text-muted-foreground">one-time</span>
                      </div>
                      <ul className="mt-4 space-y-2 text-sm">
                        {[
                          "17 R&B prompts — trap-soul, neo-soul, gospel, afrobeat, jazz, dancehall",
                          "Male & female vocal directions with BPM, key, and mood",
                          "Full mix notes: 808s, plate reverb, tape saturation, stereo imaging",
                          "Suno · Udio · any AI music engine",
                          "Instant PDF — yours forever",
                        ].map((f) => (
                          <li key={f} className="flex items-start gap-2">
                            <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      {ownsPackV3 ? (
                        <Button
                          onClick={() => handleDownloadPack("prompt_pack_vol3")}
                          className="w-full sm:w-auto mt-6 brand-gradient text-black font-semibold border-0 hover:opacity-90 gold-glow"
                          size="lg"
                        >
                          <Download className="h-4 w-4" />
                          Download PDF
                        </Button>
                      ) : (
                        <Button
                          onClick={() => setPackCheckoutOpen("prompt_pack_vol3")}
                          disabled={!configured}
                          className="w-full sm:w-auto mt-6 brand-gradient text-black font-semibold border-0 hover:opacity-90 gold-glow"
                          size="lg"
                        >
                          <Download className="h-4 w-4" />
                          {!configured ? "Coming soon" : "Buy Pack — $2"}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              )}
            </section>
          </>
        )}
      </main>

      <footer className="mx-auto max-w-6xl px-4 sm:px-6 py-8 text-center text-xs text-muted-foreground">
        Blacure · The Promptor — prompts are AI-generated, always review before use.
      </footer>
    </div>
  );
}
