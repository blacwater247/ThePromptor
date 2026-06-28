import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles, Wand2, Save, Music2, Mic2, Sliders, ArrowRight } from "lucide-react";
import logoAsset from "@/assets/blacure-logo.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Blacure — AI Song Prompt Generator" },
      { name: "description", content: "Blacure is The Promptor: studio-grade AI prompts for hip-hop, R&B, trap, soul, gospel, Afrobeat, pop, house, and cinematic music." },
      { property: "og:title", content: "Blacure — AI Song Prompt Generator" },
      { property: "og:description", content: "Studio-grade AI prompts for music — built in seconds." },
      { property: "og:image", content: "https://thepromptor.life/favicon.ico" },
      { property: "og:url", content: "https://thepromptor.life/" },
      { name: "twitter:image", content: "https://thepromptor.life/favicon.ico" },
    ],
    links: [{ rel: "canonical", href: "https://thepromptor.life/" }],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen text-foreground">
      {/* Nav */}
      <nav className="mx-auto max-w-6xl px-4 sm:px-6 py-5 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoAsset.url} alt="Blacure AI Music logo" className="h-10 w-10 rounded-full" />
          <span className="font-display text-xl font-bold tracking-tight brand-text">Blacure</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground px-2">
            Pricing
          </Link>
          <Link to="/auth" className="text-sm font-medium text-muted-foreground hover:text-foreground px-2 hidden sm:inline">
            Sign in
          </Link>
          <Link to="/app">
            <Button className="brand-gradient text-black font-semibold border-0 hover:opacity-90">
              Open Generator <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </nav>

      <main>
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24 text-center">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <img src={logoAsset.url} alt="Blacure logo" className="h-32 w-32 sm:h-40 sm:w-40 rounded-full gold-glow" />
            </div>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05]">
            <span className="brand-text">Blacure</span> — AI Song Prompt Generator
          </h1>
          <p className="mt-3 text-base sm:text-lg font-semibold text-foreground/80 tracking-wide uppercase">
            The Promptor
          </p>
          <p className="mt-6 mx-auto max-w-2xl text-lg sm:text-xl text-muted-foreground">
            Studio-grade music prompts in seconds. Hip-hop, R&amp;B, trap, soul, gospel, Afrobeat, pop, house, cinematic — built by producers, polished by AI.
          </p>
          <p className="mt-3 text-sm brand-text font-semibold">Start with 10 free prompts — no card required.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/app">
              <Button size="lg" className="brand-gradient text-black font-semibold border-0 hover:opacity-90 gold-glow">
                <Sparkles className="h-4 w-4" />
                Launch The Promptor
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="border-primary/40 hover:bg-primary/10">
                See how it works
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-3">Built for real producers</h2>
        <p className="text-center text-muted-foreground max-w-xl mx-auto mb-12">
          Every knob a song needs — wired into a prompt the AI actually understands.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: Sliders, title: "Total control", body: "Genre, fusion, vocals, mood, tempo, key, drums, production — every choice shapes the output." },
            { icon: Wand2, title: "Randomize Vibe", body: "One click rolls a fresh combination across every section to spark new ideas." },
            { icon: Mic2, title: "Vocal direction", body: "Pick performer, delivery, and extras — choirs, ad-libs, call-and-response, the works." },
            { icon: Music2, title: "Genre fusions", body: "Stack styles like Trap-Soul or Afrobeat + Amapiano without losing focus." },
            { icon: Save, title: "Save & reuse", body: "Every prompt you like is stored locally so you can revisit and copy with one tap." },
            { icon: Sparkles, title: "Studio-grade output", body: "Polished prompt language, ready to paste into your music generator of choice." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur p-6 hover:border-primary/40 transition">
              <div className="brand-gradient w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-black" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20 border-t border-border/40">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-12">Three steps to a finished prompt</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { n: "01", title: "Build", body: "Pick genre, vocals, mood, instruments, tempo, and style — or randomize." },
            { n: "02", title: "Generate", body: "Blacure turns your selections into one polished, studio-ready prompt." },
            { n: "03", title: "Use it", body: "Copy and paste into Suno, Udio, or your favorite music AI. Save the ones that hit." },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-border/60 bg-card/40 p-6">
              <div className="brand-text font-display text-3xl font-bold mb-3">{s.n}</div>
              <h3 className="font-display text-xl font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link to="/app">
            <Button size="lg" className="brand-gradient text-black font-semibold border-0 hover:opacity-90 gold-glow">
              <Sparkles className="h-4 w-4" />
              Start building
            </Button>
          </Link>
        </div>
      </section>
      </main>


      <footer className="mx-auto max-w-6xl px-4 sm:px-6 py-10 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img src={logoAsset.url} alt="" className="h-7 w-7 rounded-full" />
          <span className="font-display font-semibold brand-text">Blacure</span>
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Blacure · The Promptor</p>
      </footer>
    </div>
  );
}
