import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Check, Copy, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoAsset from "@/assets/blacure-logo.png.asset.json";

const examples = [
  { title: "Late-night R&B", direction: "Intimate · 74 BPM · Warm", prompt: "Contemporary R&B / neo-soul at 74 BPM. Intimate, breathy tenor vocals, warm Rhodes chords, rounded sub-bass, restrained pocket drums, and muted electric guitar. Sparse verse, rising pre-chorus, wider chorus with layered harmonies. Warm, spacious mix; reflective mood with a restrained emotional release." },
  { title: "Uplifting dance pop", direction: "Bright · 118 BPM · Energetic", prompt: "Dance pop at 118 BPM with confident lead vocals and a hopeful mood. Four-on-the-floor kick, crisp claps, pulsing synth bass, bright chord stabs, and a memorable melodic hook. Start with a short intro, build through the verse and pre-chorus, then open into a full chorus. Clean, punchy production with the vocal up front." },
  { title: "Acoustic storytelling", direction: "Reflective · 86 BPM · Natural", prompt: "Acoustic folk at 86 BPM with a conversational, warm lead vocal. Fingerpicked acoustic guitar, soft brushed percussion, subtle upright bass, and gentle backing harmonies. Intimate first verse, a clear chorus melody, a second verse with added texture, and a quiet ending. Natural room sound and restrained dynamics." },
  { title: "Cinematic instrumental", direction: "Tension · 92 BPM · Expansive", prompt: "Cinematic instrumental at 92 BPM, no lead vocals. Low strings and a repeating piano motif establish tension; soft percussion and sustained brass gradually build. Move from a sparse opening to an expansive central section, then return to the piano motif. Wide orchestral space, clear low end, and a gradual dynamic arc." },
];

export const Route = createFileRoute("/suno-prompts")({
  head: () => ({
    meta: [
      { title: "Suno Prompts: Examples & Writing Guide — The Promptor" },
      { name: "description", content: "Try four Suno prompt examples for R&B, dance pop, acoustic folk, and cinematic instrumentals. Learn how to describe genre, vocals, instruments, and arrangement." },
      { property: "og:title", content: "Suno Prompts: Examples & Writing Guide — The Promptor" },
      { property: "og:description", content: "Practical music prompt examples and a clear writing framework from The Promptor by Blacure." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://thepromptor.life/suno-prompts" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://thepromptor.life/suno-prompts" }],
  }),
  component: SunoPromptsGuide,
});

function SunoPromptsGuide() {
  const [copied, setCopied] = useState<string | null>(null);
  const [copyError, setCopyError] = useState(false);
  async function copyExample(title: string, prompt: string) {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(title);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  }
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav aria-label="Guide navigation" className="mx-auto flex max-w-5xl items-center justify-between gap-4 border-b border-border px-4 py-5 sm:px-6">
        <Link to="/" className="flex items-center gap-3"><img src={logoAsset.url} alt="Blacure" className="h-10 w-10 rounded-full" /><span className="font-display text-sm">THE PROMPTOR™</span></Link>
        <Button asChild size="sm"><Link to="/app">Create a prompt <ArrowRight /></Link></Button>
      </nav>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="max-w-3xl">
          <p className="text-xs font-bold uppercase text-primary">The Promptor by Blacure · Music prompt guide</p>
          <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">Suno prompts</h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">Start with a sound you can describe: a genre, a vocal character, a few instruments, and a clear sense of movement. These original examples give you a starting point to try in Suno and adapt to your own song.</p>
          <p className="mt-4 text-sm text-muted-foreground">The Promptor creates text prompts, not audio. These are creative directions, not guaranteed results or official Suno instructions.</p>
        </header>

        <section className="mt-10 border-t border-border pt-8" aria-labelledby="examples-heading">
          <div className="flex items-center gap-3"><Music2 className="h-5 w-5 text-primary" /><h2 id="examples-heading" className="font-display text-2xl">Four prompts to try</h2></div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {examples.map((example) => (
              <article key={example.title} className="flex flex-col rounded-lg border border-border bg-card p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase text-primary">{example.direction}</p>
                <h3 className="mt-2 font-display text-xl">{example.title}</h3>
                <p className="mt-4 flex-1 text-sm leading-7 text-card-foreground">{example.prompt}</p>
                <Button variant="outline" className="mt-5 self-start" aria-label={`Copy ${example.title} prompt`} onClick={() => copyExample(example.title, example.prompt)}>{copied === example.title ? <Check /> : <Copy />}{copied === example.title ? "Copied" : "Copy prompt"}</Button>
              </article>
            ))}
          </div>
          <p role="status" className="mt-3 text-sm text-muted-foreground">{copyError ? "Copy is unavailable in this browser. Select the example text to copy it." : copied ? `${copied} prompt copied.` : ""}</p>
        </section>

        <section className="mt-10 border-t border-border pt-8" aria-labelledby="framework-heading">
          <h2 id="framework-heading" className="font-display text-2xl">How to write your own music prompt</h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-2">
            {[
              ["Choose the musical identity", "Name a primary genre and emotional direction. “Reflective neo-soul” gives a more focused starting point than a long list of unrelated styles."],
              ["Describe the voice and palette", "Specify the vocal texture, or say instrumental. Pick a few instruments and their roles: fingerpicked guitar, sustained strings, or a pulsing synth bass."],
              ["Give the song movement", "Describe the groove and intended tempo, then an arrangement: sparse verse, growing pre-chorus, fuller chorus, quiet ending. Treat BPM as a direction, not a promise."],
              ["Keep the production consistent", "Choose compatible details such as warm and intimate, or bright and punchy. Remove instructions that fight each other before testing the prompt."],
            ].map(([title, body], index) => <li key={title}><p className="text-xs font-bold text-primary">0{index + 1}</p><h3 className="mt-2 text-lg font-bold">{title}</h3><p className="mt-2 leading-relaxed text-muted-foreground">{body}</p></li>)}
          </ol>
        </section>

        <section className="mt-10 border-t border-border pt-8">
          <h2 className="font-display text-2xl">When the result misses your idea</h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">Listen for one specific mismatch: the voice, rhythm, instrument palette, or energy. Change that part of the prompt and compare another result. Adding more adjectives can make the direction less clear; a shorter, coherent prompt is worth testing. Music generation is variable, and a precise prompt cannot guarantee that every detail will be followed.</p>
          <h2 className="mt-8 font-display text-2xl">Build a blueprint for your song</h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">The Promptor brings genre, rhythm, voice, arrangement, and production choices together. Pro Studio includes a Suno optimization option. Copy your finished text into your chosen music tool, and keep original lyrics separate from the sound direction.</p>
          <div className="mt-6 flex flex-wrap gap-3"><Button asChild><Link to="/app">Build your blueprint <ArrowRight /></Link></Button><Button asChild variant="outline"><Link to="/lyrics">Write lyrics</Link></Button><Button asChild variant="link"><Link to="/pricing">Free access & optional packs</Link></Button></div>
        </section>
      </main>
      <footer className="mx-auto max-w-5xl border-t border-border px-4 py-8 text-sm text-muted-foreground sm:px-6">THE PROMPTOR™ by Blacure · Independent of Suno</footer>
    </div>
  );
}