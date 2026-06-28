
## AI Song Prompt Generator — Build Plan

A single-page app that turns dropdown selections + a topic into polished, Suno-ready music prompts using Lovable AI (Gemini 3 Flash).

### Layout

**Hero (top)**
- Title: "AI Song Prompt Generator"
- Subtitle: "Create polished Suno-ready music prompts for hip-hop, R&B, trap, soul, gospel, Afrobeat, pop, house, cinematic, and more."
- Primary: Generate Prompt · Secondary: Randomize Vibe · Tertiary: Clear Form

**Two-column body (stacks on mobile)**
- **Left — Prompt Builder** (collapsible sections via shadcn Accordion):
  1. Song Basics — Title, Prompt Type, Length/Structure
  2. Genre — Main Genre, Fusion Genre
  3. Vocals — Vocal Type, Performance, Extras (checkbox group)
  4. Mood — Mood (multi-select chips), Energy (slider), Emotion Depth (slider)
  5. Topic — Theme Preset dropdown + free-text Topic/Story textarea
  6. Instruments — Main Instruments (multi-select chips), Drum Style
  7. Tempo & Key — Tempo bucket, Custom BPM, Key/Scale
  8. Style Controls — Production Style, Sound Quality, Avoid Words

- **Right — Generated Prompt Preview** (sticky on desktop):
  - Output card showing the AI-generated prompt
  - Loading state with shimmer
  - Copy button, Save Prompt button, Regenerate button
  - Below: "Saved Prompts" list (localStorage) with copy + delete per item

### Visual design

Dark studio aesthetic — near-black background `#0a0a0b`, card surface `#141416`, accent gradient from violet `#7c3aed` to fuchsia `#ec4899` on primary CTAs, subtle amber `#f59e0b` highlight for active chips. Typography: Outfit (display) + Inter (body) via @fontsource. Rounded-2xl cards, soft glow on the generate button, smooth section transitions.

### AI generation

- Server function `generatePrompt` in `src/lib/prompt.functions.ts` using `createServerFn`
- Validates input with Zod
- Calls Lovable AI Gateway (`google/gemini-3-flash-preview`) via the canonical `createLovableAiGatewayProvider` helper in `src/lib/ai-gateway.server.ts`
- System prompt instructs the model to output a single polished Suno-ready prompt paragraph (no preamble, no markdown), respecting the user's "Avoid Words", honoring custom BPM, weaving in title/topic/mood, and balancing the selected genre/fusion/vocal/instrument/style choices
- Handles 429 (rate limit) and 402 (credits) errors with clear user-facing messages

### Saving (local only)

- `useLocalStorage` hook persists an array of `{ id, title, createdAt, prompt, inputs }` under key `songPrompts.v1`
- Save button appends current generation; saved list shows title + timestamp + actions

### Randomize Vibe

- Client-side helper picks random valid values for each dropdown/multi-select (leaves Title and Topic untouched unless empty, in which case generates a playful placeholder)

### Files to create/modify

- `src/routes/index.tsx` — replace placeholder with the full page
- `src/components/PromptBuilder.tsx` — left panel (accordion + form state)
- `src/components/PromptPreview.tsx` — right panel (output + actions + saved list)
- `src/components/Hero.tsx`
- `src/lib/prompt-options.ts` — all dropdown/multi-select option arrays
- `src/lib/randomize.ts` — Randomize Vibe helper
- `src/hooks/use-local-storage.ts`
- `src/lib/ai-gateway.server.ts` — Lovable AI Gateway provider helper
- `src/lib/prompt.functions.ts` — `generatePrompt` server function
- `src/styles.css` — add fonts + accent tokens
- `src/routes/__root.tsx` — update title/meta to the app
- Install: `@fontsource/outfit`, `@fontsource/inter`, `ai`, `@ai-sdk/openai-compatible`, `zod`

### Technical notes

- LOVABLE_API_KEY auto-provisioned (no user setup)
- Form state held in a single typed object via `useState`; React Hook Form not needed for this scope
- All shadcn primitives already available (Accordion, Select, Slider, Checkbox, Button, Card, Textarea, Input, Badge)
- SEO: H1 in hero, unique title/description in route head
