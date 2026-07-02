// Server-only Railway FastAPI client.
// Reads API_BASE_URL / API_KEY inside call sites (never at module scope) so
// Cloudflare Worker request-time env injection works.

export type RailwayResult<T> = { data: T } | { error: string };

type Method = "GET" | "POST";

interface RailwayCallOptions {
  method: Method;
  path: string;              // e.g. "/generate-prompt" or "/prompts/abc"
  body?: unknown;            // JSON body for POST
  timeoutMs?: number;
}

function joinUrl(base: string, path: string): string {
  const trimmedBase = base.replace(/\/+$/, "");
  const trimmedPath = path.startsWith("/") ? path : `/${path}`;
  return `${trimmedBase}${trimmedPath}`;
}

export async function railwayFetch<T>(opts: RailwayCallOptions): Promise<RailwayResult<T>> {
  const baseUrl = process.env.API_BASE_URL;
  const apiKey = process.env.API_KEY;

  if (!baseUrl) {
    console.error("[railway] API_BASE_URL is not configured");
    return { error: "Backend is not configured. Please try again later." };
  }

  const url = joinUrl(baseUrl, opts.path);
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

  try {
    const res = await fetch(url, {
      method: opts.method,
      headers,
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
      signal: AbortSignal.timeout(opts.timeoutMs ?? 20_000),
    });

    const contentType = res.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => "");

    if (!res.ok) {
      console.error("[railway] upstream error", {
        path: opts.path,
        status: res.status,
        payload,
      });
      // Never forward raw upstream errors to the client.
      if (res.status === 401 || res.status === 403) {
        return { error: "Backend rejected the request." };
      }
      if (res.status === 404) return { error: "Not found." };
      if (res.status === 429) return { error: "Too many requests. Try again shortly." };
      if (res.status >= 500) return { error: "Backend is temporarily unavailable." };
      return { error: "Request failed." };
    }

    return { data: payload as T };
  } catch (err) {
    const isAbort = err instanceof Error && (err.name === "AbortError" || err.name === "TimeoutError");
    console.error("[railway] fetch failed", {
      path: opts.path,
      name: err instanceof Error ? err.name : "unknown",
      message: err instanceof Error ? err.message : String(err),
    });
    return { error: isAbort ? "Backend timed out." : "Could not reach backend." };
  }
}
