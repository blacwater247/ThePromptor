# Make prompts honor selected instruments

Right now the model gets the instrument list in the user block, but nothing forces it to name each one — with the 90-word Standard cap it often drops or generalizes them ("live drums, warm keys" instead of the specific picks). Fix is server-side only, in `src/lib/prompt.functions.ts`.

## Changes

1. **System prompt (both modes)** — add a hard rule:
   - Standard: "Every instrument listed under INSTRUMENTS must appear by name in the output. Same for DRUMS. Do not substitute, rename, or omit any."
   - Pro: same rule, plus "distribute the listed instruments across [Intro]/[Verse]/[Hook]/[Bridge]/[Outro] and restate the full kit in [Production Notes]."

2. **User block emphasis** — when `instruments.length > 0`, render them as a `REQUIRED INSTRUMENTS (name all):` line instead of the current soft `Instruments:` line, and repeat the list at the end of the block so it sits closest to the model's output. Same treatment for `drumStyle`.

3. **Post-generation validation** — after `generateText`, check the output (case-insensitive) for each selected instrument + the drum style. If any are missing:
   - retry once with a stricter reminder appended ("Previous attempt omitted: X, Y. Rewrite including every listed instrument by name.")
   - if the retry still misses items, return the better of the two and log which were missing (no user-facing error, no extra credit charge — same `attemptRef`).

4. **Token budget** — bump Standard `maxTokens` from 220 → 320 so the paragraph has room to name a longer instrument list without truncation. Pro stays at 700.

## Out of scope

- No UI changes, no schema changes, no credit/pricing changes.
- No change to Avoid handling, tempo/key logic, or subscription gating.

## Technical notes

- All edits live in `src/lib/prompt.functions.ts`.
- Matching uses simple normalized substring (lowercased, punctuation-stripped) — good enough for the fixed enum in `prompt-options.ts` (e.g. "808 bass", "Amapiano log drum").
- Retry reuses the same OpenAI client and `attemptRef`; failures fall through to the existing catch/refund path unchanged.
