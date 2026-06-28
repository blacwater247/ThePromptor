## Rebrand to Blacure + Landing Page

### 1. Brand assets
- Save the uploaded gold "B" logo as a Lovable Asset pointer at `src/assets/blacure-logo.png.asset.json` (no binary copied into repo).
- Update theme tokens in `src/styles.css`: shift the accent from violet/fuchsia to **gold on black** (deep black background `oklch(0.12 0 0)`, gold primary `oklch(0.78 0.14 80)`, soft amber glow). Update `.brand-gradient` and `.brand-text` to use gold gradient.

### 2. New landing page route (`/`)
Convert the current `/` (the generator) into `/app`, and build a real landing page at `/`.

Landing page sections:
- **Top nav**: Blacure logo + wordmark on the left, "Open Generator" CTA on the right.
- **Hero**: Big logo, "Blacure" wordmark, headline "AI Song Prompt Generator", subheadline about polished music prompts, primary CTA "Launch The Promptor" → `/app`, secondary "See how it works" (scrolls to features).
- **Features grid** (3–4 cards): Genre/Vocal/Mood control, Randomize Vibe, Copy & Save prompts, Studio-ready output.
- **How it works**: 3 steps (Build → Generate → Copy to your DAW/Suno workflow).
- **Footer**: Blacure © + small tagline. No "Powered by Lovable AI" anywhere.

### 3. Generator page (`/app`)
- Move current `src/routes/index.tsx` content into `src/routes/app.tsx`.
- Replace the "Powered by Lovable AI" badge with the **Blacure logo + "Blacure"** wordmark (links to `/`).
- Keep "The Promptor" heading and tagline.
- Update footer to "Blacure · The Promptor".

### 4. Fix the second Randomize button
The Randomize button inside the Prompt Builder card (next to Generate/Clear) currently calls `handleRandomize` correctly, but reportedly doesn't work. Root cause to verify: `randomizeVibe` returns a new object spreading `current` first, but the fields it overrides should overwrite — this works. Real likely issue: the button is labeled "Randomize" while the hero button is "Randomize Vibe", and clicking it changes state but the user may not see a visible toast or the accordion sections are collapsed so the changes look invisible.

Fix:
- Rename the in-card button label to **"Randomize Vibe"** for parity.
- After randomizing, briefly auto-open key accordion sections (Genre, Vocals, Mood) so the user sees fields update, OR add a clearer toast that lists what changed (e.g. "Vibe randomized · {genre} · {mood[0]}").
- Verify `randomizeVibe` actually mutates state by adding a defensive new object reference (already done) and ensuring `setInputs` is called with the function form: `setInputs((cur) => randomizeVibe(cur))` (already correct).
- Add a console-free runtime check via Playwright after build to confirm clicking the in-card Randomize updates the Main Genre select value.

### 5. Metadata
- Update `__root.tsx` and route `head()` titles/descriptions: "Blacure — The Promptor" / "Blacure builds polished AI music prompts…".
- Update OG tags. Add the Blacure logo as favicon link in `__root.tsx`.

### Files touched
- `src/assets/blacure-logo.png.asset.json` (new)
- `src/styles.css` (gold/black theme tokens)
- `src/routes/__root.tsx` (title, favicon, meta)
- `src/routes/index.tsx` (replace with landing page)
- `src/routes/app.tsx` (new — moved generator)
- `src/components/PromptBuilder.tsx` (optional: default-open sections after randomize is handled in parent)
- No business-logic changes to `prompt.functions.ts` or `randomize.ts` beyond the label/toast tweaks in the page.
