import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "get_prompt_framework",
  title: "Get music prompt framework",
  description: "Read The Promptor's music prompt writing framework and links to its studio and Suno guide.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({ content: [{ type: "text", text: "Describe one primary genre and mood; specify the vocal texture or instrumental direction; choose a few instruments and their roles; set a groove and intended tempo; describe the verse, chorus and dynamic arc; keep production details consistent. The Promptor creates text prompts, not audio, and cannot guarantee music generation results. Studio: https://thepromptor.life/app · Guide: https://thepromptor.life/suno-prompts. Saved blueprints and lyrics remain in the user's browser; this remote server cannot read them." }] }),
});