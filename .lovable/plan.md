## Updates to AI Song Prompt Generator

### 1. Rebrand to "The Promptor"
- **`src/routes/__root.tsx`**: Update default `<title>` and meta description — remove "Suno" references, set app name to "The Promptor".
- **`src/routes/index.tsx`**:
  - Route `head()`: title → `"The Promptor — AI Song Prompt Generator"`, description rewritten without the word "Suno".
  - Hero H1 → `"The Promptor"` with a smaller tagline `"AI Song Prompt Generator"` underneath.
  - Subtitle: rephrase to drop "Suno-ready" (e.g. "Create polished music prompts for hip-hop, R&B, trap, soul, gospel, Afrobeat, pop, house, cinematic, and more.").
  - Small badge above title: change `"Suno-ready · Powered by Lovable AI"` → `"Powered by Lovable AI"`.
  - Footer line: remove "Suno producers" phrasing.

Note: the AI system prompt in `src/lib/prompt.functions.ts` will keep its internal instructions (still generates the same style of detailed music prompts) but any user-visible "Suno" wording in that file's output framing will be neutralized to "music prompt".

### 2. Fix the Clear Form button
Current `handleClear` resets `inputs` and `prompt` but does not clear the `customBpm` text or reset `error` reliably across the form because some accordion sections stay open with stale local state. Real issue: it works for state but users expect it to also:
- Reset the generated prompt panel (already done).
- Reset error state (already done).
- Show a confirmation toast so it's clear something happened.
- Be wired to a button that's actually reachable on mobile (currently only in hero — keep there, plus add a "Clear" button next to Generate/Randomize inside the Prompt Builder card for parity).

Action:
- Verify `DEFAULT_INPUTS` in `src/lib/prompt-options.ts` includes empty strings for every field (title, topic, customBpm, avoidWords) and empty arrays for multi-selects. Adjust if any field is missing so reset truly clears everything.
- In `handleClear`: add `toast("Form cleared")` and ensure it resets `inputs`, `prompt`, `error`, and (new) clears the saved-but-unsaved scroll position is irrelevant — just make state reset reliable.
- Add a secondary "Clear" button inside the Prompt Builder card action row (next to Generate / Randomize) so mobile users don't have to scroll back to the hero.

### Files touched
- `src/routes/__root.tsx`
- `src/routes/index.tsx`
- `src/lib/prompt-options.ts` (only if DEFAULT_INPUTS is incomplete)
- `src/lib/prompt.functions.ts` (swap any user-facing "Suno" wording for "music prompt"; keep generation quality identical)
