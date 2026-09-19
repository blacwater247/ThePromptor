import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles, SlidersHorizontal, ArrowRight, Layers3, Gauge, Mic2, Cpu, Waves } from "lucide-react";
import logoAsset from "@/assets/blacure-logo.png.asset.json";
import { useAuth } from "@/hooks/use-auth";
import { CommentForm } from "@/components/CommentForm";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "THE PROMPTOR™ by Blacure — AI Song Blueprint Studio" },
      { name: "description", content: "Build production-ready AI song blueprints with guided controls for genre, vocals, arrangement, instrumentation, and mix. Try 10 free with no signup." },
      { property: "og:title", content: "THE PROMPTOR™ by Blacure — AI Song Blueprint Studio" },
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
      <nav className="mx-auto max-w-6xl px-4 sm:px-6 py-5 flex items-center justify-between gap-2 sm:gap-3">
        <Link to="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
          <img src={logoAsset.url} alt="Blacure logo" className="h-10 w-10 rounded-full" />
          <span className="min-w-0 leading-tight">
            <span className="block whitespace-nowrap font-display text-sm sm:text-base text-foreground">THE PROMPTOR™</span>
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-primary">by Blacure</span>
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link to="/pricing" className="hidden sm:inline px-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            Pricing
          </Link>
          {!user && (
            <Link to="/auth" className="text-sm font-medium text-muted-foreground hover:text-foreground px-2 hidden sm:inline">
              Sign in
            </Link>
          )}
          <Link to="/app">
            <Button className="brand-gradient text-black font-semibold border-0 hover:opacity-90 px-3 sm:px-4">
              <span className="sm:hidden">Build</span><span className="hidden sm:inline">Build a Blueprint</span> <ArrowRight className="h-4 w-4" />
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
          <p className="text-[11px] font-bold uppercase tracking-[.24em] text-primary">AI Music Production Intelligence</p>
          <h1 className="mt-4 font-display text-4xl sm:text-6xl lg:text-7xl leading-[1.05]">
            Build production-ready<br /><span className="brand-text">AI song blueprints.</span>
          </h1>
          <p className="mt-4 mx-auto max-w-2xl text-base sm:text-xl text-muted-foreground">
            Turn creative intent into precise direction for genre, rhythm, voice, arrangement, mix, and your chosen AI music engine.
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

      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-16">
        <div className="studio-panel rounded-lg p-4 sm:p-6">
          <div className="flex flex-col gap-2 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-primary">The Blueprint Workflow</p><h2 className="mt-2 font-display text-2xl sm:text-3xl">Make every production decision count</h2></div>
            <p className="max-w-sm text-sm text-muted-foreground">Five guided phases replace guesswork with a repeatable studio process.</p>
          </div>
          <div className="mt-5 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-5">
            {[
              ["01", "Creative Identity", "Genre · Subgenre · Era · Mood"],
              ["02", "Rhythm & Tonality", "BPM · Key · Drums · Bass"],
              ["03", "Voice & Palette", "Register · Texture · Harmony"],
              ["04", "Arrangement", "Structure · Hook · Dynamics"],
              ["05", "Mix & Translate", "Stereo · Traits · AI engine"],
            ].map(([n, title, body]) => <div key={n} className="bg-card p-4"><span className="font-display text-xl text-primary">{n}</span><h3 className="mt-8 text-sm font-bold uppercase tracking-wide">{title}</h3><p className="mt-2 text-xs leading-5 text-muted-foreground">{body}</p></div>)}
          </div>
          <div className="mt-5 flex justify-end"><Link to="/app"><Button className="brand-gradient border-0 font-semibold text-white">Generate Blueprint <ArrowRight className="h-4 w-4" /></Button></Link></div>
        </div>
      </section>

      <section id="features" className="border-y border-border/40 bg-card/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-20">
          <div className="mb-9 text-center">
            <p className="text-xs font-bold uppercase brand-text">Idea in. Blueprint out.</p>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl">Hear the difference in the direction</h2>
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
            <h2 className="mt-3 font-display text-3xl sm:text-5xl">Why not just use ChatGPT?</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">The Promptor guides the choices that shape a record, then turns them into one coherent instruction set.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-px overflow-hidden rounded-lg border border-border/60 bg-border/60">
            {[
              { icon: SlidersHorizontal, title: "Structured decisions", body: "Curated controls reveal the production choices a blank chat box never asks you to make." },
              { icon: Layers3, title: "Coherent direction", body: "Every selection is translated into one compatible blueprint, not a loose adjective list." },
              { icon: Gauge, title: "Repeatable workflow", body: "Randomize, refine, save, and generate again without rebuilding context from scratch." },
              { icon: Cpu, title: "Engine translation", body: "Pro Studio adapts your creative intent for Universal, Suno, or Udio prompting." },
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

      <section className="border-y border-border/50 bg-card/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div><p className="text-xs font-bold uppercase tracking-[.2em] text-primary">More than prompts</p><h2 className="mt-3 font-display text-3xl sm:text-5xl">From blueprint to lyrics</h2><p className="mt-4 max-w-xl text-muted-foreground">Keep the same creative momentum in the Lyrics Builder. Direct structure, rhyme, hook style, story, and vocal perspective with the same studio-first approach.</p><Link to="/lyrics" className="mt-6 inline-block"><Button variant="outline" className="border-primary/50"><Mic2 className="h-4 w-4" /> Explore Lyrics Builder</Button></Link></div>
            <div className="studio-panel rounded-lg p-6"><Waves className="h-6 w-6 text-primary" /><p className="mt-8 text-xs font-bold uppercase tracking-widest text-muted-foreground">Connected creative workflow</p><p className="mt-3 font-display text-xl">Blueprint the sound. Write the story. Keep creating.</p><div className="mt-5 h-20 rounded-md border border-border bg-background/50 p-3 font-mono text-xs leading-5 text-muted-foreground">[VERSE] restrained detail<br />[PRE-HOOK] tension rises<br />[HOOK] memorable emotional release</div></div>
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
          <span className="font-display text-sm text-foreground">THE PROMPTOR™ <span className="font-sans text-muted-foreground">by Blacure</span></span>
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Blacure</p>
      </footer>
    </div>
  );
}
