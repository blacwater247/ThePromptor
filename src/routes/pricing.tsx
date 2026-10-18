import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Sparkles, ArrowLeft, Download } from "lucide-react";
import logoAsset from "@/assets/blacure-logo.png.asset.json";
import packCover from "@/assets/blacure-pack-vol1.png.asset.json";
import packCoverV2 from "@/assets/blacure-pack-vol2.png.asset.json";
import packCoverV3 from "@/assets/blacure-pack-vol3.png.asset.json";
import { useAuth } from "@/hooks/use-auth";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { isPaymentsConfigured } from "@/lib/stripe";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — The Promptor by Blacure" },
      { name: "description", content: "The Promptor is 100% free. Try 10 prompts without signup, then get unlimited Standard and Pro Studio prompts with a free account." },
      { property: "og:title", content: "Pricing — The Promptor by Blacure" },
      { property: "og:description", content: "100% free AI music prompts. Optional $2 downloadable prompt packs." },
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
    name: "Guest",
    price: "$0",
    cadence: "no signup",
    prompts: "10 prompts — no account needed",
    cta: "Try it now",
    features: ["10 free prompts, no signup", "Every genre & vocal style", "Randomize Vibe", "Save prompts locally"],
  },
  {
    name: "Free account",
    price: "$0",
    cadence: "forever",
    prompts: "Unlimited prompts + Pro Studio",
    highlight: true,
    cta: "Create free account",
    features: [
      "Unlimited Standard prompts",
      "Unlimited Pro Studio prompts",
      "Lyrics Builder & PROMPTOR AI",
      "No credit card, ever",
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
              <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">100% free studio access</p>
              <h1 className="mt-3 font-display text-4xl sm:text-5xl">The Promptor is free.</h1>
              <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
                Try 10 prompts instantly, then create a free account for unlimited everything.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                 Fair-use limit: up to 60 generations per hour to keep the studio fast for everyone.
              </p>
            </header>

            <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {TIERS.map((t) => (
                <Card
                  key={t.name}
                  className={`p-6 border-border/60 bg-card/70 backdrop-blur relative ${t.highlight ? "border-primary/60 gold-glow" : ""}`}
                >
                  {t.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 brand-gradient text-black text-[11px] font-bold px-3 py-1 rounded-full">
                      RECOMMENDED
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
                  <Link to={t.highlight ? (user ? "/app" : "/auth") : "/app"} className="block mt-6">
                    <Button
                      className={`w-full ${t.highlight ? "brand-gradient text-black font-semibold border-0 hover:opacity-90" : ""}`}
                      variant={t.highlight ? "default" : "outline"}
                    >
                      <Sparkles className="h-4 w-4" /> {t.highlight && user ? "Open the studio" : t.cta}
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>

            {/* Downloadable Packs */}
            <section className="mt-16">
              <div className="text-center mb-8">
                <p className="text-xs uppercase tracking-widest brand-text font-bold">Instant Download</p>
                <h2 className="mt-2 font-display text-3xl sm:text-4xl">Commercial Prompt Packs</h2>
                <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
                  Curated, studio-ready prompt collections delivered as polished PDFs. Optional — each pack is a separate $2 one-time purchase.
                </p>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                {[
                  { id: "prompt_pack_vol1", cover: packCover.url, title: "Volume 1", detail: "12 multi-genre prompts" },
                  { id: "prompt_pack_vol2", cover: packCoverV2.url, title: "Producer Edition · Vol. 2", detail: "20 advanced production prompts" },
                  { id: "prompt_pack_vol3", cover: packCoverV3.url, title: "R&B Edition · Vol. 3", detail: "17 studio-ready R&B prompts" },
                ].map((pack) => <Card key={pack.id} className="studio-panel overflow-hidden p-0">
                  <img src={pack.cover} alt={`Blacure Prompt Pack ${pack.title} cover`} className="aspect-square w-full object-cover" />
                  <div className="p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="font-display text-base">{pack.title}</h3><p className="mt-1 text-sm text-muted-foreground">{pack.detail}</p></div><span className="font-display text-2xl">$2</span></div>
                  <Button onClick={() => handleCheckout(pack.id)} disabled={loading || !configured} className="mt-5 w-full brand-gradient border-0 font-semibold text-white"><Download className="h-4 w-4" />{!configured ? "Coming soon" : "Buy & Download"}</Button></div>
                </Card>)}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
