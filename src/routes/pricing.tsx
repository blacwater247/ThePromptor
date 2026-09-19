import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Sparkles, ArrowLeft, Download } from "lucide-react";
import logoAsset from "@/assets/blacure-logo.png.asset.json";
import packCover from "@/assets/blacure-pack-vol1.png.asset.json";
import { useAuth } from "@/hooks/use-auth";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { isPaymentsConfigured } from "@/lib/stripe";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — The Promptor by Blacure" },
      { name: "description", content: "Start with 10 free AI music prompts, top up 20 prompts for $5, or get unlimited Standard and Pro Studio prompts for $19.99 monthly." },
      { property: "og:title", content: "Pricing — The Promptor by Blacure" },
      { property: "og:description", content: "Start with 10 free prompts. Pay-as-you-go or monthly subscription." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://thepromptor.life/pricing" },
    ],
    links: [{ rel: "canonical", href: "https://thepromptor.life/pricing" }],
  }),
  component: Pricing,
});

type Tier = {
  name: string;
  price: string;
  cadence: string;
  prompts: string;
  highlight?: boolean;
  cta: string;
  priceId?: string;
  features: string[];
};

const TIERS: Tier[] = [
  {
    name: "Free",
    price: "$0",
    cadence: "no signup",
    prompts: "10 prompts — no account needed",
    cta: "Try it now",
    features: ["10 free prompts, no signup", "Every genre & vocal style", "Randomize Vibe", "Save prompts locally"],
  },
  {
    name: "Pack",
    price: "$5",
    cadence: "one-time",
    prompts: "20 prompts (40 credits)",
    cta: "Buy 20 prompts",
    priceId: "credits_pack_20_onetime",
    features: ["Top up any time", "Never expires", "Same studio-grade prompts"],
  },
  {
    name: "Monthly",
    price: "$19.99",
    cadence: "per month",
    prompts: "Unlimited prompts + Pro Studio",
    highlight: true,
    cta: "Subscribe monthly",
    priceId: "blacure_monthly",
    features: [
      "Unlimited Standard prompts",
      "Unlimited Pro Studio prompts",
      "Priority generation",
      "Cancel any time",
    ],
  },
];

function Pricing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [checkoutPriceId, setCheckoutPriceId] = useState<string | null>(null);
  const configured = isPaymentsConfigured();

  const handleCheckout = (priceId: string) => {
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    setCheckoutPriceId(priceId);
  };

  const returnUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`
      : "https://thepromptor.life/checkout/return?session_id={CHECKOUT_SESSION_ID}";

  return (
    <div className="min-h-screen text-foreground">
      <PaymentTestModeBanner />
      <nav className="mx-auto max-w-6xl px-4 sm:px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoAsset.url} alt="Blacure logo" className="h-10 w-10 rounded-full" />
          <span className="leading-tight"><span className="block font-display text-lg font-bold">The Promptor</span><span className="block text-[10px] font-semibold uppercase text-muted-foreground">by Blacure</span></span>
        </Link>
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
      </nav>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        {checkoutPriceId ? (
          <section className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h1 className="font-display text-2xl font-bold">Complete your purchase</h1>
              <Button variant="ghost" onClick={() => setCheckoutPriceId(null)}>
                Cancel
              </Button>
            </div>
            <Card className="p-4 sm:p-6 border-border/60 bg-card/70">
              <StripeEmbeddedCheckout priceId={checkoutPriceId} returnUrl={returnUrl} />
            </Card>
          </section>
        ) : (
          <>
            <header className="text-center mb-12">
              <h1 className="font-display text-4xl sm:text-5xl font-bold">Simple, fair pricing</h1>
              <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
                Start free with 10 prompts. Top up when you need more, or go monthly for the best value.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Free & Pack use credits (1 prompt = 2 credits). Monthly is unlimited — no credit counting.
              </p>
            </header>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {TIERS.map((t) => (
                <Card
                  key={t.name}
                  className={`p-6 border-border/60 bg-card/70 backdrop-blur relative ${t.highlight ? "border-primary/60 gold-glow" : ""}`}
                >
                  {t.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 brand-gradient text-black text-[11px] font-bold px-3 py-1 rounded-full">
                      BEST VALUE
                    </div>
                  )}
                  <h2 className="font-display text-xl font-semibold">{t.name}</h2>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="font-display text-4xl font-bold">{t.price}</span>
                    <span className="text-sm text-muted-foreground">{t.cadence}</span>
                  </div>
                  <p className="mt-1 text-sm brand-text font-semibold">{t.prompts}</p>
                  <ul className="mt-5 space-y-2 text-sm">
                    {t.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  {t.name === "Free" ? (
                    <Link to="/app" className="block mt-6">
                      <Button className="w-full" variant="outline">
                        <Sparkles className="h-4 w-4" /> {t.cta}
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      onClick={() => t.priceId && handleCheckout(t.priceId)}
                      disabled={loading || !configured}
                      className={`w-full mt-6 ${t.highlight ? "brand-gradient text-black font-semibold border-0 hover:opacity-90" : ""}`}
                      variant={t.highlight ? "default" : "outline"}
                    >
                      {!configured ? "Coming soon" : t.cta}
                    </Button>
                  )}
                </Card>
              ))}
            </div>

            {/* Downloadable Pack */}
            <section className="mt-16">
              <div className="text-center mb-8">
                <p className="text-xs uppercase tracking-widest brand-text font-bold">Instant Download</p>
                <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold">Blacure Prompt Pack — Volume 1</h2>
                <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
                  12 studio-ready prompts hand-crafted by Blacure. Delivered as a polished PDF you can paste into Suno, Udio, or any AI music engine.
                </p>
              </div>
              <Card className="p-6 sm:p-8 border-border/60 bg-card/70 backdrop-blur">
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <div className="rounded-xl overflow-hidden border border-primary/30 gold-glow">
                    <img
                      src={packCover.url}
                      alt="Blacure Prompt Pack Volume 1 cover"
                      className="w-full h-auto block"
                    />
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
                    <Button
                      onClick={() => handleCheckout("prompt_pack_vol1")}
                      disabled={loading || !configured}
                      className="w-full sm:w-auto mt-6 brand-gradient text-black font-semibold border-0 hover:opacity-90 gold-glow"
                      size="lg"
                    >
                      <Download className="h-4 w-4" />
                      {!configured ? "Coming soon" : "Buy Pack — $2"}
                    </Button>
                  </div>
                </div>
              </Card>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
