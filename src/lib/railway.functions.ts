import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { railwayFetch, type RailwayResult } from "@/lib/railway.server";

// ---------- Types ----------

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type GeneratePromptResponse = { prompt: string; meta?: { [key: string]: JsonValue } };
export type SavePromptResponse = { id: string };
export type ListPromptsResponse = {
  prompts: Array<{ id: string; prompt: string; created_at: string }>;
};
export type MusicJobResponse = { job_id: string; status: string; url?: string };
export type PingResponse = { ok: boolean; status?: string };

// ---------- Validators (kept tiny; upstream owns full schema) ----------

function nonEmptyString(v: unknown, name: string): string {
  if (typeof v !== "string" || v.trim().length === 0) {
    throw new Error(`${name} is required`);
  }
  if (v.length > 8000) throw new Error(`${name} too long`);
  return v.trim();
}

function optionalString(v: unknown, name: string): string | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  return nonEmptyString(v, name);
}

// ---------- Server functions ----------

/**
 * Health check — confirms API_BASE_URL resolves and auth is accepted.
 * Assumes the FastAPI backend exposes a lightweight GET at "/" or "/health".
 */
export const pingRailway = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async (): Promise<RailwayResult<PingResponse>> => {
    const res = await railwayFetch<unknown>({ method: "GET", path: "/health", timeoutMs: 8000 });
    if ("error" in res) return res;
    return { data: { ok: true } };
  });

/**
 * POST /generate-prompt — server-side prompt generation via Railway.
 * Accepts an arbitrary `inputs` object; the FastAPI side owns its schema.
 */
export const generatePromptRailway = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { inputs: { [key: string]: JsonValue }; mode?: string }) => {
    if (!data || typeof data.inputs !== "object" || data.inputs === null || Array.isArray(data.inputs)) {
      throw new Error("inputs is required");
    }
    // Enforce byte budget to prevent oversized payloads from being forwarded upstream.
    let serialized: string;
    try {
      serialized = JSON.stringify(data.inputs);
    } catch {
      throw new Error("inputs is not serializable");
    }
    if (serialized.length > 32_000) {
      throw new Error("inputs payload too large");
    }
    // Enforce max key count and max nesting depth via recursive walk.
    const MAX_KEYS = 200;
    const MAX_DEPTH = 8;
    const MAX_STRING = 8_000;
    let keyCount = 0;
    const walk = (v: JsonValue, depth: number): void => {
      if (depth > MAX_DEPTH) throw new Error("inputs nested too deeply");
      if (typeof v === "string") {
        if (v.length > MAX_STRING) throw new Error("inputs string value too long");
        return;
      }
      if (Array.isArray(v)) {
        if (v.length > MAX_KEYS) throw new Error("inputs array too large");
        for (const item of v) walk(item, depth + 1);
        return;
      }
      if (v && typeof v === "object") {
        const keys = Object.keys(v);
        keyCount += keys.length;
        if (keyCount > MAX_KEYS) throw new Error("inputs has too many keys");
        for (const k of keys) walk((v as { [key: string]: JsonValue })[k], depth + 1);
      }
    };
    walk(data.inputs as JsonValue, 0);
    return { inputs: data.inputs, mode: optionalString(data.mode, "mode") };
  })
  .handler(async ({ data, context }): Promise<RailwayResult<GeneratePromptResponse>> => {
    return railwayFetch<GeneratePromptResponse>({
      method: "POST",
      path: "/generate-prompt",
      body: { user_id: context.userId, inputs: data.inputs, mode: data.mode ?? "standard" },
    });
  });

/**
 * POST /save-prompt — persist a prompt for the current user on Railway.
 */
export const savePromptRailway = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { prompt: string; title?: string }) => ({
    prompt: nonEmptyString(data.prompt, "prompt"),
    title: optionalString(data.title, "title"),
  }))
  .handler(async ({ data, context }): Promise<RailwayResult<SavePromptResponse>> => {
    return railwayFetch<SavePromptResponse>({
      method: "POST",
      path: "/save-prompt",
      body: { user_id: context.userId, prompt: data.prompt, title: data.title },
    });
  });

/**
 * GET /prompts/{user_id} — always scoped to the verified session user.
 * The client cannot pass a different userId.
 */
export const listMyPromptsRailway = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<RailwayResult<ListPromptsResponse>> => {
    return railwayFetch<ListPromptsResponse>({
      method: "GET",
      path: `/prompts/${encodeURIComponent(context.userId)}`,
    });
  });

/**
 * POST /suno/generate — proxy a Suno job request.
 */
export const sunoGenerate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { prompt: string; title?: string; tags?: string }) => ({
    prompt: nonEmptyString(data.prompt, "prompt"),
    title: optionalString(data.title, "title"),
    tags: optionalString(data.tags, "tags"),
  }))
  .handler(async ({ data, context }): Promise<RailwayResult<MusicJobResponse>> => {
    return railwayFetch<MusicJobResponse>({
      method: "POST",
      path: "/suno/generate",
      body: { user_id: context.userId, ...data },
      timeoutMs: 30_000,
    });
  });

/**
 * POST /udio/generate — proxy a Udio job request.
 */
export const udioGenerate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { prompt: string; title?: string; tags?: string }) => ({
    prompt: nonEmptyString(data.prompt, "prompt"),
    title: optionalString(data.title, "title"),
    tags: optionalString(data.tags, "tags"),
  }))
  .handler(async ({ data, context }): Promise<RailwayResult<MusicJobResponse>> => {
    return railwayFetch<MusicJobResponse>({
      method: "POST",
      path: "/udio/generate",
      body: { user_id: context.userId, ...data },
      timeoutMs: 30_000,
    });
  });
