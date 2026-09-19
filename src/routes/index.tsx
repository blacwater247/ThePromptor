import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles, SlidersHorizontal, Music2, ArrowRight, Check, Layers3, Gauge, AudioLines } from "lucide-react";
import logoAsset from "@/assets/blacure-logo.png.asset.json";
import { useAuth } from "@/hooks/use-auth";
import { CommentForm } from "@/components/CommentForm";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Promptor by Blacure — AI Music Prompt Studio" },
      { name: "description", content: "Build production-ready AI song blueprints with guided controls for genre, vocals, arrangement, instrumentation, and mix. Try 10 free with no signup." },
      { property: "og:title", content: "The Promptor by Blacure — AI Music Prompt Studio" },
      { property: "og:description", content: "Turn a musical idea into a detailed, production-ready AI song blueprint." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://thepromptor.life/favicon.ico" },
      { property: "og:url", content: "https://thepromptor.life/" },
      { name: "twitter:image", content: "https://thepromptor.life/favicon.ico" },
    ],
    links: [{ rel: "canonical", href: "https://thepromptor.life/" }],
  }),
  component: Landing,
});

function Landing() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen text-foreground">
      {/* Nav */}
      <nav className="mx-auto max-w-6xl px-4 sm:px-6 py-5 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoAsset.url} alt="Blacure logo" className="h-10 w-10 rounded-full" />
          <span className="leading-tight">
            <span className="block font-display text-lg font-bold text-foreground">The Promptor</span>
            <span className="block text-[10px] font-semibold uppercase text-muted-foreground">by Blacure</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground px-2">
            Pricing
          </Link>
          {!user && (
            <Link to="/auth" className="text-sm font-medium text-muted-foreground hover:text-foreground px-2 hidden sm:inline">
              Sign in
            </Link>
          )}
          <Link to="/app">
            <Button className="brand-gradient text-black font-semibold border-0 hover:opacity-90">
              Build a Blueprint <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </nav>

      <main>
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10 pb-14 sm:pt-16 sm:pb-20 text-center">
          <div className="flex justify-center mb-5 sm:mb-6">
            <div className="relative">
              <img src={logoAsset.url} alt="The Promptor by Blacure" className="h-24 w-24 sm:h-32 sm:w-32 rounded-full gold-glow" />
            </div>
          </div>
          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold leading-none">
            <span className="brand-text">The Promptor</span>
          </h1>
          <p className="mt-3 text-xs sm:text-sm font-semibold text-muted-foreground uppercase">
            by Blacure
          </p>
          <p className="mt-6 font-display text-xl sm:text-3xl font-semibold text-foreground">
            AI Music Prompt Studio
          </p>
          <p className="mt-4 mx-auto max-w-2xl text-base sm:text-xl text-muted-foreground">
            Build production-ready AI song blueprints with precise control over sound, performance, arrangement, and mix.
          </p>
          <p className="mt-4 text-sm brand-text font-bold">10 free prompts. No signup. No credit card.</p>
          <p className="mt-2 text-xs text-muted-foreground max-w-xl mx-auto">
            The Promptor creates prompts, not audio. Use the finished blueprint in your preferred AI music tool.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row sm:flex-wrap justify-center gap-3">
            <Link to="/app" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto brand-gradient text-black font-semibold border-0 hover:opacity-90 gold-glow">
                <Sparkles className="h-4 w-4" />
                Build Your First Blueprint
              </Button>
            </Link>
            <a href="#features" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary/40 hover:bg-primary/10">
                See the Difference
              </Button>
            </a>
          </div>
        </div>
      </header>

      <section id="features" className="border-y border-border/40 bg-card/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-20">
          <div className="mb-9 text-center">
            <p className="text-xs font-bold uppercase brand-text">Idea in. Blueprint out.</p>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold">Hear the difference in the direction</h2>
            <p className="mt-3 mx-auto max-w-2xl text-muted-foreground">A vague idea leaves the music engine guessing. The Promptor turns intent into production language.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-lg border border-border/60 bg-background/60 p-5 sm:p-7">
              <p className="text-xs font-bold uppercase text-muted-foreground">What you say</p>
              <p className="mt-5 font-display text-2xl sm:text-3xl font-semibold">“Dark emotional R&amp;B song about losing someone.”</p>
            </div>
            <div className="rounded-lg border border-primary/40 bg-card p-5 sm:p-7 gold-glow">
              <p className="text-xs font-bold uppercase brand-text">What The Promptor builds</p>
              <p className="mt-5 text-sm sm:text-base leading-7 text-foreground/90">
                74 BPM contemporary R&amp;B / neo-soul in F# minor. Warm Rhodes voicings, deep rounded sub-bass, restrained pocket drums, muted electric guitar textures, and distant vocal pads. Intimate male tenor with a breathy lower register, controlled runs, and layered harmonies. Open with eight sparse bars, build tension through the pre-hook, then widen the chorus with fuller drums and stereo harmonies. Keep the mix warm, nocturnal, dynamic, and emotionally unresolved.
              </p>
            </div>
          </div>
          <div className="mt-7 text-center">
            <Link to="/app">
              <Button size="lg" className="brand-gradient text-primary-foreground font-semibold border-0 hover:opacity-90">
                Generate Yours Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase brand-text">Built for music decisions</p>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold">Not a blank chat box</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">The Promptor guides the choices that shape a record, then turns them into one coherent instruction set.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-px overflow-hidden rounded-lg border border-border/60 bg-border/60">
            {[
              { icon: SlidersHorizontal, title: "Structured control", body: "Choose genre, subgenre, mood, BPM, key, drum feel, vocals, instruments, and production traits." },
              { icon: Layers3, title: "Coherent direction", body: "Selections work together as one blueprint instead of a loose list of adjectives." },
              { icon: Gauge, title: "Fast exploration", body: "Randomize a compatible vibe, refine the controls, and generate again without rewriting instructions." },
              { icon: AudioLines, title: "Producer language", body: "Get clear musical, arrangement, performance, and mix direction ready for your workflow." },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-card p-6">
                <Icon className="h-5 w-5 text-primary" />
                <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20 border-t border-border/40">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-3">Start free. Scale when it earns its place.</h2>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">A clear path from first experiment to an unlimited production workflow.</p>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { n: "$0", title: "10 prompts free", body: "No signup and no credit card. Build and test complete song blueprints immediately." },
            { n: "$5", title: "20-prompt top-up", body: "A one-time pack of 40 credits that never expires. Each Standard prompt uses 2 credits." },
            { n: "$19.99", title: "Studio membership", body: "Unlimited Standard and Pro Studio prompts every month, with no credit counting." },
          ].map((s) => (
            <div key={s.title} className="rounded-lg border border-border/60 bg-card/40 p-6">
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
              Build Your First Blueprint
            </Button>
          </Link>
        </div>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          Prefer ready-made ideas? <Link to="/pricing" className="font-semibold text-primary hover:underline">Downloadable Blacure prompt packs start at $2.</Link>
        </p>
      </section>

      {/* Comments */}
      <section id="contact" className="mx-auto max-w-2xl px-4 sm:px-6 py-16 sm:py-20 border-t border-border/40">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-3">Leave a comment</h2>
        <p className="text-center text-muted-foreground mb-10">
          Feedback, requests, or just saying hi — drop us a note.
        </p>
        <CommentForm />
      </section>
      </main>


      <footer className="mx-auto max-w-6xl px-4 sm:px-6 py-10 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img src={logoAsset.url} alt="" className="h-7 w-7 rounded-full" />
          <span className="font-display font-semibold text-foreground">The Promptor <span className="text-muted-foreground font-normal">by Blacure</span></span>
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Blacure</p>
      </footer>
    </div>
  );
}
