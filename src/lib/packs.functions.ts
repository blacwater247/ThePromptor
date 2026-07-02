import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type PackListResult = { packs: Array<{ pack_slug: string; created_at: string }> };
type DownloadResult = { url: string } | { error: string };

const KNOWN_PACKS = new Set(["prompt_pack_vol1", "prompt_pack_vol2", "prompt_pack_vol3"]);

export const listMyPacks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PackListResult> => {
    const { data, error } = await context.supabase
      .from("pack_purchases")
      .select("pack_slug, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) return { packs: [] };
    const seen = new Set<string>();
    const packs: PackListResult["packs"] = [];
    for (const row of data ?? []) {
      if (seen.has(row.pack_slug)) continue;
      seen.add(row.pack_slug);
      packs.push(row);
    }
    return { packs };
  });

export const getPackDownloadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { packSlug: string }) => {
    if (!/^[a-z0-9_]+$/.test(data.packSlug)) throw new Error("Invalid packSlug");
    return data;
  })
  .handler(async ({ data, context }): Promise<DownloadResult> => {
    const { data: rows, error } = await context.supabase
      .from("pack_purchases")
      .select("id")
      .eq("user_id", context.userId)
      .eq("pack_slug", data.packSlug)
      .limit(1);
    if (error || !rows || rows.length === 0) {
      return { error: "You don't own this pack." };
    }
    if (!KNOWN_PACKS.has(data.packSlug)) return { error: "Pack not available." };
    const { signPackDownload } = await import("@/lib/pack-signing.server");
    const { token } = await signPackDownload(data.packSlug, context.userId);
    const url = `/api/public/pack-download?slug=${encodeURIComponent(data.packSlug)}&u=${encodeURIComponent(context.userId)}&t=${encodeURIComponent(token)}`;
    return { url };
  });
