# PROMPTOR AI — Phase 2

Everything from Phase 1 stays exactly as it is. Phase 2 adds the conversation layer and the two optional tools from the brief.

## 1. PROMPTOR AI assistant

A collapsible assistant that lives beside your work.

- Desktop: a panel that slides in from the right of the creation page, with the builder still visible.
- Mobile: a floating AI button in the bottom corner that opens a full-height bottom sheet.
- It remembers the current session: your idea, the settings on screen, and the prompt currently in the result panel.
- Follow-up instructions change the existing prompt instead of starting over. "Make the drums harder and drop the strings" edits what you already have, and the settings on screen update with it.
- Each reply shows what changed, with the same Undo used in Phase 1.
- Messages are kept for the current creation session only; leaving the page clears the conversation.

## 2. Quick commands

One-tap buttons inside the assistant, each sending a real production instruction:

Build My Prompt · Improve This · Add Emotion · Improve Drums · Improve Bass · Improve Vocals · Add Instruments · Make It Danceable · Make It Radio-Friendly · Create Alternative · Explain This Prompt

## 3. Smart questions

The assistant does not run people through a questionnaire. If there is enough to work with, it generates straight away. Only when something essential is genuinely missing (for example no genre and no mood at all) does it ask one short optional question, with a "just decide for me" option next to it.

## 4. Why this works

A collapsed section under the result. Opening it gives a short, plain explanation of why the instruments sit together, how the tempo shapes the mood, what the drums do to the groove, how the vocal direction carries the emotion, and how the arrangement supports the song. Written for a working creator, not a beginner.

## 5. Lyric concept tool

A button on the result panel that produces a song concept first, not lyrics: theme, point of view, emotional conflict, hook concept, verse 1 and verse 2 direction, bridge direction, ending direction. A separate "Write the lyrics" button only appears afterwards, and sends the concept into the existing Lyrics Builder so nothing there is duplicated.

## Cost

Unchanged from Phase 1: every AI action, including each assistant message, quick command, Why this works, and a lyric concept, costs the same as one standard prompt (2 credits). Guests use their 10 free generations; monthly subscribers are unlimited under the existing hourly cap. The buy-credits box pops up exactly as it does now when someone runs out.

## Technical notes

- Extend `src/routes/api/promptor-ai.ts` with `chat`, `explain`, and `lyricConcept` actions rather than adding new routes. `chat` accepts the conversation turns, the current prompt, and the current control values, and returns the same structured result shape plus a short assistant reply, so control snapping, Standard/Pro sanitization, credit spend/refund, guest counting, and logging all reuse the Phase 1 code path.
- Same model and endpoint as Phase 1 (`openai/gpt-6-astra` on the Lovable AI gateway Responses API, streamed, key server-side only). Strict output schemas, unknown values dropped rather than coerced.
- New components: `PromptorAssistant.tsx` (panel plus sheet, driven by `use-mobile`), `PromptorWhyThisWorks.tsx`, `PromptorLyricConcept.tsx`. `src/lib/promptor-ai.ts` gains the chat/explain/concept types and the quick-command list.
- `src/routes/app.tsx` owns the conversation state and reuses the existing apply/undo handlers. Lyrics handoff passes the concept through router state into `/lyrics`.
- No new database tables, no payment changes, no Suno/Udio claims, and no changes to the manual five-phase controls.
