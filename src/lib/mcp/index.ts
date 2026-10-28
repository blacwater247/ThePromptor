import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listPromptOptions from "./tools/list-prompt-options";
import getPromptFramework from "./tools/get-prompt-framework";

const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "the-promptor",
  title: "The Promptor",
  version: "0.1.0",
  instructions: "Read music prompt choices and writing guidance. These tools do not generate audio or access browser-local saved work. Use the studio's browser tools for the current on-screen blueprint or lyrics.",
  auth: auth.oauth.issuer({ issuer: `https://${projectRef}.supabase.co/auth/v1`, acceptedAudiences: "authenticated" }),
  tools: [listPromptOptions, getPromptFramework],
});