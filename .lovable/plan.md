
## Goal

Turn the Promptor into a professional tiered-preset builder with a Free/Pack layer and a Pro (monthly) layer, add Apple sign-in, a clear "prompts only" disclaimer, and a reliable "Copied ✓" confirmation.

## 1. Apple login

- Call `supabase--configure_social_auth` with `providers: ["google","apple"]` (keep email).
- Add an "Continue with Apple" button on `src/routes/auth.tsx` using `lovable.auth.signInWithOAuth("apple", { redirect_uri: window.location.origin })`, mirroring the existing Google button.

## 2. Disclaimer

- Add a persistent notice at the top of `src/routes/app.tsx` (and small footnote under the hero on `src/routes/index.tsx`):
  > "This tool creates prompts. It does not generate songs — only prompts you can paste into Suno, Udio, or any AI music tool."
- Style as a subtle info banner (muted background, `Info` icon), not a modal.

## 3. Copy feedback

- In `src/components/PromptPreview.tsx` (and any other copy button), change the copy handler to set `copied=true` for 2s, swap the button label/icon to `Check` + "Copied", and keep the existing toast as backup.

## 4. Expanded preset libraries + tiered structure

Extend `src/lib/prompt-options.ts` with the full lists the user provided, split into **Standard** (first ~20 per category, shown to everyone) and **Pro** (the full expanded library, gated).

New/expanded categories:
- `MAIN_GENRES` + `SUBGENRES` map (Genre → Subgenres)
- `MOODS` + `MOOD_COLORS` map (Mood → emotional colors)
- `STYLES` + `ARRANGEMENTS` map
- `DRUM_FEELS` + `RHYTHM_PATTERNS` map
- `MIXING_STYLES` + `SONIC_FINISHES` map
- `HOOK_TYPES` + `VOCAL_FORMATS` map
- `BASSLINES` (new top-level, Pro)
- `INSTRUMENTS` (expanded, multi-select, shown last)

Each list exports `{ standard: string[], pro: string[] }`. Standard shows 15–25 presets; an **"Advanced ▾"** toggle reveals the Pro list. Non-Pro users see Pro chips as locked (with a small lock icon + tooltip "Pro plan").

## 5. Tiered UX in PromptBuilder

Rewrite `src/components/PromptBuilder.tsx` sections to cascade:

```text
Genre ──► Subgenre (filtered by Genre)
Mood ──► Emotional Color (filtered by Mood)
Style ──► Arrangement / Production
Drum Feel ──► Rhythm Pattern
Mixing Style ──► Sonic Finish
Hook Type ──► Vocal Format
Instruments (multi-select, last)
```

- Parent dropdown shows Standard by default with "Advanced" button to expand.
- Child dropdown auto-filters via the mapping tables; disabled until parent chosen.
- Add new sections: **Bassline**, **Mixing Style**, **Hook Type**, **Drum Feel** (dedicated).
- Order in UI: Basics → Genre → Vocals → Mood → Topic → Instruments → Tempo → Style → Drum Feel → Bassline → Mixing → Hook.

## 6. Free / Pack / Pro gating

Three tiers surfaced in the UI, in this order at the top of `/app`:

1. **Free** — 10 guest prompts (existing localStorage flow), Standard presets only.
2. **$5 Prompt Packs** — one-time PDF packs (existing `packs.functions.ts`), Standard presets + access to premium theme packs.
3. **Pro Monthly** — unlocks all Pro presets, the Advanced toggle, cascading child dropdowns, Bassline/Mixing/Hook categories, unlimited generations.

- Add a `useTier()` hook that returns `"guest" | "free" | "pack" | "pro"` based on `useAuth()` + a query against `subscriptions` (status `active` + `price_id` in Pro price list).
- Gate Pro options in `PromptBuilder`: locked chips show upgrade tooltip → CTA opens `/pricing`.
- On `src/routes/pricing.tsx`: reorder tier cards to Free → Pack → Pro; make Pro card visually primary (brand gradient, "Pro" badge), copy "Unlock the full pro prompt library".

## 7. Generate flow

- `generatePromptGuest` remains Standard-only.
- Authenticated `generatePrompt` accepts new fields (bassline, mixing, hook, subgenre, etc.); if user isn't Pro, server-side sanitize any Pro-only values back to Standard defaults so client-side gating can't be bypassed.

## Technical notes

- `src/lib/prompt-options.ts`: extend `PromptInputs` with `subgenre`, `moodColor`, `arrangement`, `rhythmPattern`, `sonicFinish`, `vocalFormat`, `bassline`, `mixingStyle`, `hookType`. Update `DEFAULT_INPUTS`.
- `src/lib/generatePrompt.ts` + `src/lib/prompt.functions.ts` (`PromptInputSchema` / `GuestInputSchema`): add optional fields; guest schema rejects Pro fields.
- Subscription check: reuse `src/lib/subscription.ts` (already present) — add `isPro(user)` helper querying `subscriptions` for active monthly.
- `PromptPreview.tsx`: `const [copied,setCopied]=useState(false)` + `setTimeout(()=>setCopied(false),2000)`.
- Apple provider requires `supabase--configure_social_auth` tool call (build mode).
- No DB migrations needed — Pro detection uses existing `subscriptions` table.

## Out of scope

- New Pro pricing/product creation (assume existing monthly product; if none, ask in build mode before wiring the price).
- Redesign of pricing page beyond tier reordering and Pro emphasis.
