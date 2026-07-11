# Make prompts appear faster

Right now `generatePrompt` uses `generateText`, which waits for the full response from OpenAI before returning anything. On Standard prompts that's ~2–5s of blank spinner; Pro prompts (700 tokens) can take 8–15s. Nothing renders until it's all done.

The fastest perceived win is **streaming**: show tokens as they arrive so the first words appear in ~300–600ms instead of after the full completion.

## Changes

1. **Server: switch to a streaming server route**
   - Add `src/routes/api/prompt-stream.ts` (server route, not a `createServerFn`) that:
     - Runs the same auth (`requireSupabaseAuth` equivalent via bearer check), subscription lookup, Pro gate, rate-limit, and credit spend as `generatePrompt`.
     - Uses `streamText` from the `ai` SDK instead of `generateText`.
     - Returns `result.toTextStreamResponse()` so the browser reads tokens as they generate.
     - On error, refunds credits (same logic as today).
   - Keep `generatePrompt` (non-streaming) around for the guest path and as a fallback.

2. **Client: consume the stream in `PromptBuilder`**
   - Replace the `await generatePrompt(...)` call for signed-in users with a `fetch("/api/prompt-stream", ...)` that reads the response body via `getReader()` and appends chunks to the preview state as they arrive.
   - `PromptPreview` already renders a string — just update that string on each chunk. Copy button stays disabled until the stream finishes.
   - Show a subtle "streaming…" indicator instead of a blocking spinner.

3. **Small latency wins (bundled with the above)**
   - Drop the automatic retry-on-missing-instruments round-trip from the streaming path (it doubles latency on ~5–10% of requests). Instead, do a single post-stream check and only surface a soft warning if items are missing — no second call.
   - Trim the Pro `maxOutputTokens` from 700 → 550 (still fits the bracketed sections; ~20% faster tail).

4. **Guest path**
   - Same streaming route pattern via `src/routes/api/prompt-stream-guest.ts` (no auth, no credits). Optional — can ship in a follow-up if you'd rather keep this PR small.

## Technical notes

- Stream endpoint lives at `src/routes/api/prompt-stream.ts` (authenticated app-internal endpoint, not under `/api/public/`). Auth is enforced inside the handler by validating the `Authorization: Bearer` header against Supabase — mirrors what `requireSupabaseAuth` does for server functions.
- Uses `streamText({ model, system, prompt, temperature, maxOutputTokens })` → `.toTextStreamResponse()`. Client reads with `response.body!.getReader()` + `TextDecoder`.
- Credits are spent **before** the stream starts (same as today) and refunded in the `catch` around `streamText`'s finalization. Rate-limit log insert happens on stream `finish`.
- No schema changes, no new deps (`ai` and `@ai-sdk/openai` already installed).

## Files touched

- new: `src/routes/api/prompt-stream.ts`
- edit: `src/components/PromptBuilder.tsx` (call the stream endpoint, append chunks)
- edit: `src/components/PromptPreview.tsx` (accept a "streaming" flag to hide copy while incomplete)
- (optional) new: `src/routes/api/prompt-stream-guest.ts`

Want me to include the guest streaming route in the same pass, or ship signed-in first?
