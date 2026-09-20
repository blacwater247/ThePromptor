# PROMPTOR AI — Phase 1

Add an AI idea box on top of the existing Studio Console. Nothing already working is removed: the five-phase manual controls, credits, packs, subscriptions, lyrics page and saved prompts all stay exactly as they are.

## What the user gets

**On the creation page, above the existing controls:**

- Headline "What Do You Want To Create?" with the line "Tell PROMPTOR AI your idea in plain English. It will build the production prompt for you."
- A large text box, placeholder: "Create a sensual R&B song with a soulful female vocalist, live bass, warm electric piano, violin, deep drums, and a late-night romantic feeling."
- Three buttons: GENERATE WITH AI, SURPRISE ME, IMPROVE MY PROMPT.

**GENERATE WITH AI** reads the idea and works out genre, subgenre, era, vocal type and character, mood and emotion, energy, instruments, drum and bass character, tempo and a suggested BPM, groove, structure, production and mix character, atmosphere, and an optional lyric theme. It then fills the existing controls with those choices, so every value is visible and editable before the final blueprint is generated. Anything the user already set by hand and the AI has no opinion on is left alone. A short "PROMPTOR AI set these" summary strip shows what changed, with an Undo.

**SURPRISE ME** invents a complete, coherent song idea and fills the controls the same way.

**IMPROVE MY PROMPT** opens a panel where the user pastes an existing prompt. It is checked for missing vocal direction, missing tempo, weak drums, weak instrumentation, weak arrangement, unclear production, contradictions, and overload. The original and the improved version are shown side by side; the original is never overwritten. The user chooses to copy the improved one or load it into the builder.

**Results panel (upgrade of the current output panel):** the final prompt plus a clean summary of Genre, Mood, Vocals, Tempo, Suggested BPM, Instruments, Production Style, Song Structure. Buttons: Copy, Save, Edit, Regenerate, and Create Variation with the options More Commercial, More Soulful, More Energetic, More Cinematic, More Minimal, More Organic, More Modern, More Emotional, More Danceable, More Relaxed, plus Simplify. Each variation actually changes the underlying musical choices, not just adjectives.

**Prompt Strength score (0-100)** with sub-scores for Genre Definition, Emotion, Vocal Direction, Rhythm, Instrumentation, Arrangement, Production Detail, and Clarity, plus a couple of plain recommendations such as "Define the drum groove." Labelled clearly as a measure of how completely the prompt communicates intent — never a prediction of success.

**Artist names:** if someone names an artist, the AI translates it into musical characteristics (groove, vocal delivery, harmony, instrumentation, atmosphere) rather than imitating anyone. No lecture shown to the user.

## Cost and access

Every PROMPTOR AI action costs the same as a Standard prompt: 2 credits. Visitors without an account can use it inside the existing 10 free uses; when those run out the buy-credits box pops up as it already does. Monthly subscribers are unlimited under the existing hourly cap.

## Coming in a later phase

Side/bottom-sheet chat assistant with follow-up context, quick AI commands, "Why this works" explanation, and the lyric concept tool.

## Technical notes

- New server route `src/routes/api/promptor-ai.ts` handling four actions: `analyze` (idea to fields), `surprise`, `improve`, `variation`. Runs on Lovable AI through the gateway with `openai/gpt-6-astra` on the Responses API, streaming, key read server-side only. Existing final-blueprint generation on `/api/prompt-stream` is untouched.
- Structured output is constrained to the app's real option arrays from `src/lib/prompt-options.ts`, then re-validated server-side with Zod against those same arrays before returning, so the AI can never inject a value the controls do not support. Unknown suggestions are dropped, not silently coerced.
- Free/credit users get the Standard field set: `sanitizeToStandard` is applied to the AI result, and Pro-only picks are shown locked rather than silently discarded.
- Credits: reuse the existing `spend_credits` / `refund_credits` RPCs and `generations_log`, same 2-credit cost and refund-on-error path as Standard generation. Guest usage increments `blacure.freePrompts.v1` and triggers the existing UpgradeModal at the limit.
- Prompt score is computed by the same call that produces the analysis, so it costs no extra request.
- New components: `PromptorAIBox.tsx` (idea box + buttons), `PromptorResult.tsx` (result panel, variation actions, score). `PromptBuilder.tsx` gains a controlled bulk-apply path; its existing props and behaviour stay.
- No new database tables, no payment changes, no Suno/Udio claims.
