import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Sparkles, ArrowLeft } from "lucide-react";
import logoAsset from "@/assets/blacure-logo.png.asset.json";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Blacure" },
      { name: "description", content: "Simple, fair pricing for AI music prompts. Start free with 10 prompts, then $2 for 20 prompts or $19.99/month for unlimited." },
      { property: "og:title", content: "Pricing — Blacure" },
      { property: "og:description", content: "Start with 10 free prompts. Pay-as-you-go or monthly subscription." },
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
  ctaTo: string;
  features: string[];
};

const TIERS: Tier[] = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    prompts: "10 prompts on signup",
    cta: "Get started free",
    ctaTo: "/auth",
    features: ["10 free prompts", "Every genre & vocal style", "Randomize Vibe", "Save prompts locally"],
  },
  {
    name: "Pack",
    price: "$2",
    cadence: "one-time",
    prompts: "20 prompts",
    cta: "Buy 20 prompts",
    ctaTo: "/app",
    features: ["Top up any time", "Never expires", "All Blacure features", "Same studio-grade prompts"],
  },
  {
    name: "Monthly",
    price: "$19.99",
    cadence: "per month",
    prompts: "Unlimited prompts + Pro Studio",
    highlight: true,
    cta: "Subscribe monthly",
    ctaTo: "/app",
    features: [
      "Unlimited Standard prompts",
      "Unlimited Pro Studio prompts",
      "Priority generation",
      "Cancel any time",
    ],
  },
];


function Pricing() {
  return (
    <div className="min-h-screen text-foreground">
      <nav className="mx-auto max-w-6xl px-4 sm:px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoAsset.url} alt="Blacure" className="h-10 w-10 rounded-full" />
          <span className="font-display text-xl font-bold brand-text">Blacure</span>
        </Link>
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
      </nav>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <header className="text-center mb-12">
          <h1 className="font-display text-4xl sm:text-5xl font-bold">Simple, fair pricing</h1>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Start free with 10 prompts. Top up when you need more, or go monthly for the best value.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Free & Pack use credits (1 prompt = 2 credits). Monthly is unlimited — no credit counting.</p>
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
                <Link to={t.ctaTo} className="block mt-6">
                  <Button className={`w-full ${t.highlight ? "brand-gradient text-black font-semibold border-0 hover:opacity-90" : ""}`} variant={t.highlight ? "default" : "outline"}>
                    <Sparkles className="h-4 w-4" /> {t.cta}
                  </Button>
                </Link>
              ) : (
                <Button
                  disabled
                  className={`w-full mt-6 ${t.highlight ? "brand-gradient text-black font-semibold border-0 opacity-70" : ""}`}
                  variant={t.highlight ? "default" : "outline"}
                >
                  Coming soon
                </Button>
              )}
            </Card>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Checkout is being set up. Sign in to receive your 10 free prompts now — paid tiers go live as soon as payments are activated.
        </p>
      </main>
    </div>
  );
}
